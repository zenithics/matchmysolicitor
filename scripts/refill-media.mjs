/**
 * Re-uploads the binary for Media docs whose file is missing from the blob
 * store (rows created while the store was private, so the DB row exists but no
 * file was ever written). Keeps the doc id, so every page reference survives.
 *   node scripts/refill-media.mjs
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_SERVER_URL
const EMAIL = process.env.CMS_EMAIL
const PASSWORD = process.env.CMS_PASSWORD

const SOURCES = [
  'design-images/heroes',
  'design-images/og',
  'design-reference/generated',
]

async function findSource(filename) {
  for (const dir of SOURCES) {
    try {
      return { buf: await readFile(path.join(dir, filename)), dir }
    } catch {}
  }
  return null
}

async function main() {
  const login = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!login.ok) throw new Error(`login failed: ${login.status}`)
  const { token } = await login.json()
  const auth = { Authorization: `JWT ${token}` }

  const list = await (await fetch(`${CMS_URL}/api/media?limit=100`, { headers: auth })).json()

  for (const doc of list.docs) {
    const probe = await fetch(`${CMS_URL}${doc.url}?cb=${Date.now()}`)
    if (probe.ok) {
      console.log(`ok      ${doc.filename}`)
      continue
    }
    const src = await findSource(doc.filename)
    if (!src) {
      console.log(`MISSING source for ${doc.filename} (id ${doc.id})`)
      continue
    }
    const form = new FormData()
    form.append('file', new Blob([src.buf]), doc.filename)
    form.append('_payload', JSON.stringify({ alt: doc.alt ?? doc.filename }))
    const res = await fetch(`${CMS_URL}/api/media/${doc.id}`, {
      method: 'PATCH',
      headers: auth,
      body: form,
    })
    console.log(`${res.ok ? 'refilled' : 'FAILED  '} ${doc.filename} (${res.status})`)
    if (!res.ok) console.log((await res.text()).slice(0, 200))
  }
}

main()
