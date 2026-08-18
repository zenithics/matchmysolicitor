/**
 * Some design "stats" blocks use h3 + p cards rather than value + label divs, and the
 * importer dropped every card, leaving an empty block with just a heading. This finds
 * stats blocks with no rows and rebuilds them from the design export.
 */
import fs from 'fs'
import pg from 'pg'
import crypto from 'crypto'

const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()

function designStatsBlocks(html) {
  return [...html.matchAll(/<!-- @block: stats[^>]*-->([\s\S]*?)<!-- \/@block -->/g)].map((m) => {
    const chunk = m[1]
    const heading = strip((chunk.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '')
    // Two card shapes in the export: h3 + p, and a big value div + a 14px label div.
    const cards = [
      ...[...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/g)],
      ...[...chunk.matchAll(/<div style="font-size:(?:clamp[^"]*|18px[^"]*)"[^>]*>([\s\S]*?)<\/div>\s*<div style="font-size:14px[^"]*"[^>]*>([\s\S]*?)<\/div>/g)],
    ].map((c) => ({ value: strip(c[1]), label: strip(c[2]) }))
    return { heading, cards }
  })
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URI, ssl: { rejectUnauthorized: false } })
await client.connect()
const apply = process.argv[2] === 'apply'

const { rows: empties } = await client.query(`
  select b.id, b.heading, b._parent_id, p.slug
  from pages_blocks_stats b
  join pages p on p.id = b._parent_id
  where not exists (select 1 from pages_blocks_stats_stats s where s._parent_id = b.id)
`)

for (const block of empties) {
  const file = `design-export/${block.slug}.dc.html`
  if (!fs.existsSync(file)) { console.log(`${block.slug}: no design file`); continue }
  const match = designStatsBlocks(fs.readFileSync(file, 'utf8')).find((d) => d.heading === (block.heading || ''))
  if (!match?.cards.length) { console.log(`${block.slug}: no cards found for "${block.heading}"`); continue }

  console.log(`${block.slug} / ${block.heading}: ${match.cards.length} cards`)
  if (!apply) continue
  // The card description is the copy, so the footnote guess made from the last <p> is wrong here.
  await client.query('update pages_blocks_stats set footnote=null where id=$1', [block.id])
  let order = 1
  for (const card of match.cards) {
    await client.query(
      'insert into pages_blocks_stats_stats (_order, _parent_id, id, value, label) values ($1,$2,$3,$4,$5)',
      [order++, block.id, crypto.randomBytes(12).toString('hex'), card.value, card.label],
    )
  }
}
await client.end()
