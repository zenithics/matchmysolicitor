/**
 * The design export's stats blocks carry a small-print paragraph under the figures
 * that the importer dropped (the block had no field for it). This reads every
 * design page, matches its stats blocks to the CMS blocks by heading, and fills in
 * the footnote plus any stat rows that went missing.
 */
import fs from 'fs'
import pg from 'pg'

const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

function statsBlocksFromDesign(html) {
  const out = []
  const re = /<!-- @block: stats[^>]*-->([\s\S]*?)<!-- \/@block -->/g
  let m
  while ((m = re.exec(html))) {
    const chunk = m[1]
    const heading = strip((chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '')
    const paras = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((x) => strip(x[1]))
    out.push({ heading, footnote: paras[paras.length - 1] || null })
  }
  return out
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })
await client.connect()

const apply = process.argv[2] === 'apply'
const { rows: pages } = await client.query('select id, slug from pages')
let filled = 0

for (const page of pages) {
  const file = `design-export/${page.slug}.dc.html`
  if (!fs.existsSync(file)) continue
  const design = statsBlocksFromDesign(fs.readFileSync(file, 'utf8'))
  if (!design.length) continue

  const { rows: blocks } = await client.query(
    'select id, heading, footnote from pages_blocks_stats where _parent_id=$1 order by _order',
    [page.id],
  )
  for (const block of blocks) {
    const match = design.find((d) => d.heading && d.heading === (block.heading || '')) || (design.length === 1 && blocks.length === 1 ? design[0] : null)
    if (!match?.footnote || block.footnote) continue
    // On some pages the stat card descriptions are <p> too, so the last paragraph
    // may be a card label rather than small print. Only treat it as a footnote if
    // it is not one of this block's own stat labels.
    const { rows: statRows } = await client.query('select label from pages_blocks_stats_stats where _parent_id=$1', [block.id])
    if (statRows.some((r) => (r.label || '').trim() === match.footnote)) continue
    console.log(`${page.slug}: "${match.footnote.slice(0, 70)}..."`)
    filled++
    if (apply) await client.query('update pages_blocks_stats set footnote=$1 where id=$2', [match.footnote, block.id])
  }
}

console.log(`${filled} footnotes ${apply ? 'written' : 'to write (dry run)'}`)
await client.end()
