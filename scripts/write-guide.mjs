/**
 * Insert a markdown article body into an existing Post's lexical content.
 *
 * The imported guides are shells: category / last-reviewed / byline paragraphs,
 * then the CTA + "Related guides" headings. The article body belongs between
 * the byline and the first CTA heading, so we splice rather than replace and
 * the CTAs survive untouched.
 *
 * Usage: node scripts/write-guide.mjs <postId> <file.md> [--apply]
 * Supports: ## / ### headings, paragraphs, "- " bullets, **bold**.
 */
import fs from 'fs'
import pg from 'pg'

const CTA_HEADINGS = ['Dealing with this right now?', 'Related guides', 'Speak to a specialist, not a call centre']

const text = (t, format = 0) => ({ mode: 'normal', text: t, type: 'text', style: '', detail: 0, format, version: 1 })

function inline(s) {
  const out = []
  for (const part of s.split(/(\*\*[^*]+\*\*)/g)) {
    if (!part) continue
    if (part.startsWith('**')) out.push(text(part.slice(2, -2), 1))
    else out.push(text(part))
  }
  return out
}

const para = (s) => ({ type: 'paragraph', format: '', indent: 0, version: 1, children: inline(s), direction: 'ltr', textFormat: 0 })
const heading = (tag, s) => ({ tag, type: 'heading', format: '', indent: 0, version: 1, children: inline(s), direction: 'ltr' })
const listItem = (s, i) => ({ type: 'listitem', format: '', indent: 0, version: 1, value: i + 1, checked: undefined, children: inline(s), direction: 'ltr' })
const list = (items) => ({
  type: 'list', format: '', indent: 0, version: 1, listType: 'bullet', start: 1, tag: 'ul',
  children: items.map(listItem), direction: 'ltr',
})

export function markdownToLexical(md) {
  const nodes = []
  let bullets = []
  const flush = () => { if (bullets.length) { nodes.push(list(bullets)); bullets = [] } }
  for (const raw of md.split('\n')) {
    const line = raw.trim()
    if (!line) { flush(); continue }
    if (line.startsWith('- ')) { bullets.push(line.slice(2)); continue }
    flush()
    if (line.startsWith('### ')) nodes.push(heading('h3', line.slice(4)))
    else if (line.startsWith('## ')) nodes.push(heading('h2', line.slice(3)))
    else nodes.push(para(line))
  }
  flush()
  return nodes
}

async function main() {
  const [id, file, apply] = process.argv.slice(2)
  if (!id || !file) throw new Error('usage: write-guide.mjs <postId> <file.md> [--apply]')

  const body = markdownToLexical(fs.readFileSync(file, 'utf8'))
  const client = new pg.Client({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })
  await client.connect()
  const { rows } = await client.query('select content from posts where id=$1', [id])
  if (!rows.length) throw new Error(`no post ${id}`)

  const content = rows[0].content
  const children = content.root.children
  const firstCta = children.findIndex(
    (n) => n.type === 'heading' && CTA_HEADINGS.includes((n.children?.[0]?.text ?? '').trim()),
  )
  // Cleaned shells have no children at all; anything else must keep its trailing chrome.
  if (firstCta < 0 && children.length) {
    throw new Error('content is not empty and has no CTA heading, aborting rather than guessing')
  }
  const at = firstCta < 0 ? children.length : firstCta
  content.root.children = [...children.slice(0, at), ...body, ...children.slice(at)]

  console.log(`post ${id}: ${body.length} nodes inserted at index ${at}`)
  if (apply === '--apply') {
    await client.query('update posts set content=$1, updated_at=now() where id=$2', [content, id])
    await client.query('update posts set published_at=published_at where id=$1', [id])
    console.log('applied')
  } else {
    console.log('dry run, pass --apply to write')
  }
  await client.end()
}

main()
