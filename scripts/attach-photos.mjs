/**
 * Uploads the three generated photographs into Media and attaches them to the
 * TextMedia blocks that currently render an empty image slot:
 *   /            "A specialist, not a call centre"
 *   /for-employers  "The cost of getting it wrong"
 *   /for-employees  "Talk to someone who does this every day"
 *
 * Needs CMS_URL, CMS_EMAIL and CMS_PASSWORD (same vars the other scripts use).
 *   node scripts/attach-photos.mjs
 * Safe to re-run: media are keyed on filename and blocks are only filled when
 * their image is empty.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

const CMS_URL = process.env.CMS_URL || process.env.NEXT_PUBLIC_SERVER_URL
const EMAIL = process.env.CMS_EMAIL
const PASSWORD = process.env.CMS_PASSWORD

const PHOTOS = [
  {
    file: 'specialist-not-a-call-centre.jpg',
    alt: 'An employment solicitor speaking with a client by phone in a quiet office',
    page: 'home',
    heading: 'A specialist, not a call centre',
  },
  {
    file: 'hr-manager-reviewing-documents.jpg',
    alt: 'An HR manager reviewing tribunal paperwork at a desk',
    page: 'for-employers',
    heading: 'The cost of getting it wrong',
  },
  {
    file: 'one-to-one-consultation.jpg',
    alt: 'A one-to-one consultation between a client and their solicitor',
    page: 'for-employees',
    heading: null, // first TextMedia block with an empty image
  },
]

async function login() {
  const res = await fetch(`${CMS_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  if (!res.ok) throw new Error(`login failed: ${res.status} ${await res.text()}`)
  return (await res.json()).token
}

async function findOrCreateMedia(token, photo) {
  const q = new URLSearchParams({ 'where[filename][equals]': photo.file, limit: '1' })
  const found = await (await fetch(`${CMS_URL}/api/media?${q}`, {
    headers: { Authorization: `JWT ${token}` },
  })).json()
  if (found.docs?.length) return found.docs[0].id

  const buf = await readFile(path.join('design-reference/generated', photo.file))
  const form = new FormData()
  form.append('file', new Blob([buf], { type: 'image/jpeg' }), photo.file)
  form.append('_payload', JSON.stringify({ alt: photo.alt }))
  const res = await fetch(`${CMS_URL}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })
  if (!res.ok) throw new Error(`upload ${photo.file} failed: ${res.status} ${await res.text()}`)
  return (await res.json()).doc.id
}

async function main() {
  if (!CMS_URL || !EMAIL || !PASSWORD) throw new Error('set CMS_URL, CMS_EMAIL and CMS_PASSWORD')
  const token = await login()

  for (const photo of PHOTOS) {
    const mediaId = await findOrCreateMedia(token, photo)
    const q = new URLSearchParams({ 'where[slug][equals]': photo.page, depth: '0', limit: '1' })
    const page = (await (await fetch(`${CMS_URL}/api/pages?${q}`, {
      headers: { Authorization: `JWT ${token}` },
    })).json()).docs?.[0]
    if (!page) {
      console.warn(`page ${photo.page} not found, skipping`)
      continue
    }

    let changed = false
    const layout = page.layout.map((block) => {
      if (changed || block.blockType !== 'textMedia' || block.image) return block
      if (photo.heading && block.heading !== photo.heading) return block
      changed = true
      return { ...block, image: mediaId }
    })
    if (!changed) {
      console.log(`${photo.page}: nothing to fill, skipping`)
      continue
    }

    const res = await fetch(`${CMS_URL}/api/pages/${page.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify({ layout }),
    })
    if (!res.ok) throw new Error(`patch ${photo.page} failed: ${res.status} ${await res.text()}`)
    console.log(`${photo.page}: attached ${photo.file}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
