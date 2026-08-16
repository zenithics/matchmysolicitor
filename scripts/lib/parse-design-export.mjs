#!/usr/bin/env node
/**
 * parse_design_export.mjs
 *
 * Reads a Claude Design export that was produced against the Zenithics Block Contract
 * (references/block_contract_brief.md) and emits a deterministic seed payload:
 *
 *   node parse_design_export.mjs <export-dir> <out.json>
 *
 * Markers it understands:
 *   <!-- @page slug="x" title="y" collection="pages|posts" category="z" template="t" -->
 *   <!-- @block: howItWorks -->  ... <!-- /@block -->
 *   <!-- @item --> ... <!-- /@item -->
 *   <!-- @field: image file="hero.jpg" alt="..." -->
 *   <!-- @newblock: enquiryWizard fields="..." reason="..." -->
 *
 * Output: { pages: [...], newBlocks: [...], warnings: [...] }
 * Unmarked sections are reported as warnings, never silently dropped.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'

const MUSTACHE = /\{\{[^}]*\}\}/

/**
 * Remove the design's runtime template strings. Any node whose copy contains a
 * {{ token }} belongs to the JS-driven wizard, which the React block re-renders
 * at runtime, so importing it verbatim publishes the raw token to the live page.
 * Partial stripping would leave gaps like "Thank you, . Your enquiry is on its
 * way.", so such entries are dropped whole rather than blanked.
 */
function scrubTemplatePlaceholders(node) {
  if (Array.isArray(node)) {
    for (let i = node.length - 1; i >= 0; i--) {
      const child = node[i]
      const copy = typeof child === 'string' ? child : child && typeof child === 'object' ? child.text : null
      if (typeof copy === 'string' && MUSTACHE.test(copy)) {
        node.splice(i, 1)
        continue
      }
      scrubTemplatePlaceholders(child)
    }
    return
  }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'string') {
        if (MUSTACHE.test(v)) delete node[k]
      } else {
        scrubTemplatePlaceholders(v)
      }
    }
  }
}


// Real block library — keep in sync with src/blocks/RenderBlocks.tsx
const KNOWN_BLOCKS = new Set([
  'archive', 'banner', 'code', 'content', 'cta', 'formBlock', 'mediaBlock',
  'testimonials', 'faq', 'features', 'stats', 'logoCarousel', 'pricing',
  'heroSplit', 'howItWorks', 'imageGallery', 'homeHero', 'newsletter',
  'teamGrid', 'videoEmbed', 'mapEmbed', 'embed', 'timeline',
])

const attrs = (s) => {
  const out = {}
  for (const m of s.matchAll(/([a-zA-Z]+)="([^"]*)"/g)) out[m[1]] = m[2]
  return out
}

// Named entities the design export actually uses. Numeric entities (&#39; etc.)
// are decoded generically below; &amp; must be decoded LAST, since decoding it
// first would turn a literal "&amp;amp;" into "&amp;" and then re-decode that too.
const NAMED_ENTITIES = {
  nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“',
  mdash: '—', ndash: '–', hellip: '…', quot: '"', apos: "'",
  lt: '<', gt: '>',
}

const decodeEntities = (text) =>
  text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (m, name) => NAMED_ENTITIES[name.toLowerCase()] ?? m)
    .replace(/&amp;/g, '&')

const stripTags = (html) =>
  decodeEntities(
    html.replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Pull anchors so button labels and tile destinations survive. Claude Design
 * emits CTA buttons and card links as <a>, which no text pass reads, so without
 * this every CTA imports with an empty label and no destination.
 * Relative "foo.dc.html" hrefs are rewritten to CMS routes ("/foo").
 */
function extractLinks(html) {
  const links = []
  for (const m of html.matchAll(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const label = stripTags(m[2])
    let url = m[1]
    if (/\.dc\.html/i.test(url)) {
      url = '/' + url.replace(/\.dc\.html/i, '').replace(/^\.\//, '')
      if (url === '/index') url = '/'
    }
    if (label || url) links.push({ label, url })
  }
  return links
}

/** Pull text content per heading/paragraph so fields can be assigned in order. */
function extractText(html) {
  // Two independent passes, merged in document order.
  //
  // Pass 1 reads semantic tags. `summary` matters: Claude Design renders FAQ
  // questions as <details><summary>, so omitting it imports every FAQ answer
  // with a blank question. Pass 2 reads *leaf* <div>s (no markup inside),
  // because Claude Design frequently styles headings and body copy as bare
  // divs — without this, that copy silently imports as empty blocks.
  //
  // These must be separate passes: putting `div` into pass 1's alternation
  // makes a container div consume everything up to its first `</div>`, and
  // matchAll then resumes past the semantic tags nested inside it, losing them.
  const parts = []
  const claimed = []

  for (const m of html.matchAll(
    /<(h[1-6]|p|li|blockquote|span|summary|figcaption|dt|dd)[^>]*>([\s\S]*?)<\/\1>/gi,
  )) {
    const tag = m[1].toLowerCase()
    let text = stripTags(m[2])
    // Every <li> in the export carries its own bullet glyph as a leading
    // <span> (✓ for tick lists, · elsewhere) so the design's own CSS can
    // colour it independently of the item text — stripTags flattens that
    // span straight into the li's text. Left in, toRichText's real <ul>
    // renders a browser bullet on top of it, so every item doubles up
    // ("• · Tribunal claim defence").
    if (tag === 'li') text = text.replace(/^[✓✔·•]\s*/, '')
    claimed.push([m.index, m.index + m[0].length])
    if (text) parts.push({ index: m.index, tag, text })
  }

  for (const m of html.matchAll(/<div[^>]*>([^<]+)<\/div>/gi)) {
    // Skip leaf divs already covered by a semantic match (e.g. a div nested
    // inside a <li>), so copy is not emitted twice.
    if (claimed.some(([s, e]) => m.index >= s && m.index < e)) continue
    const text = stripTags(m[1])
    if (text) parts.push({ index: m.index, tag: 'div', text })
  }

  // Every `@field: image` marker is followed by a placeholder box whose visible
  // label is "photo: <alt text>" (Claude Design doesn't generate photography).
  // That label is a real <span>, so the pass above happily captures it as body
  // copy — without this filter, the imported page prints "photo: professional
  // on phone, workplace" as a literal paragraph once the real image is missing.
  return parts
    .filter(({ text }) => !/^photo:\s/i.test(text))
    .sort((a, b) => a.index - b.index)
    .map(({ tag, text }) => ({ tag, text }))
}

function extractImages(section) {
  const images = []
  for (const m of section.matchAll(/<!--\s*@field:\s*image([^>]*?)-->/g)) images.push(attrs(m[1]))
  return images
}

function parseItems(body) {
  const items = []
  for (const m of body.matchAll(/<!--\s*@item\s*-->([\s\S]*?)<!--\s*\/@item\s*-->/g)) {
    items.push({ text: extractText(m[1]), images: extractImages(m[1]), links: extractLinks(m[1]) })
  }
  return items
}

/**
 * Remove every @item...@item region from a block body before extracting the
 * block's own heading/subheading text. Without this, a section with no
 * subheading of its own (h2 straight into the item grid) has its `description`
 * silently filled in with the first item's own body copy, because the generic
 * text pass has no concept of item boundaries and just takes the first
 * paragraph found anywhere in the block, items included.
 */
const stripItemRegions = (body) =>
  body.replace(/<!--\s*@item\s*-->[\s\S]*?<!--\s*\/@item\s*-->/g, '')

function parsePage(file, html, warnings) {
  const pageMatch = html.match(/<!--\s*@page([\s\S]*?)-->/)
  if (!pageMatch) {
    warnings.push(`${file}: no @page front matter — skipped`)
    return null
  }
  const meta = attrs(pageMatch[1])
  const blocks = []

  // Markers may carry attributes (e.g. @block: homeHero style="split") and may span
  // multiple lines, so collect every marker in document order and slice the body
  // between a marker and the next marker / explicit close.
  const markers = [...html.matchAll(/<!--\s*@(block|newblock):\s*([A-Za-z]+)([\s\S]*?)-->/g)]
  const newBlocks = []
  const covered = []

  markers.forEach((m, i) => {
    const [, kind, name, rawAttrs] = m
    const start = m.index + m[0].length
    const nextMarker = markers[i + 1]?.index ?? html.length
    const closeIdx = html.indexOf('<!-- /@block -->', start)
    const end = Math.min(nextMarker, closeIdx === -1 ? html.length : closeIdx + 16)
    const body = html.slice(start, end)
    covered.push([m.index, end])
    const parsed = {
      text: extractText(stripItemRegions(body)),
      items: parseItems(body),
      images: extractImages(body),
      links: extractLinks(body),
      rawHtml: body,
    }
    // The design's wizard is JS-templated, so its later steps sit in the export
    // as raw markup containing {{ mustache }} tokens. Those regions are owned by
    // the React block at runtime, not by CMS content: importing them verbatim
    // publishes a literal "{{ step2Heading }}" onto the live page.
    scrubTemplatePlaceholders(parsed)

    if (kind === 'newblock') {
      newBlocks.push({ page: meta.slug, name, ...attrs(rawAttrs), ...parsed })
      return
    }
    if (!KNOWN_BLOCKS.has(name)) {
      warnings.push(`${file}: unknown blockType "${name}" — not in RenderBlocks map`)
      return
    }
    blocks.push({ blockType: name, ...attrs(rawAttrs), ...parsed })
  })

  // Anything that looks like a section but carries no marker
  // Only flag <section> tags that fall outside every marked block body.
  const orphans = [...html.matchAll(/<section[\s>]/gi)].filter(
    (s) => !covered.some(([a, b]) => s.index >= a && s.index < b),
  ).length
  if (orphans > 0) {
    warnings.push(`${file}: ${orphans} <section> tag(s) outside any block marker — content would be lost`)
  }

  return {
    ...meta,
    file,
    collection: meta.collection || 'pages',
    // Whether the design draws a breadcrumb trail on this page.
    hasBreadcrumbs: /aria-label="Breadcrumb"/i.test(html),
    blocks,
    newBlocks,
  }
}

/**
 * Programmatic entry point used by scripts/import-design.mjs.
 * Returns { pages, newBlocks, warnings } without touching the filesystem output.
 */
export function parseExport(dir, { extraBlocks = [] } = {}) {
  for (const name of extraBlocks) if (name) KNOWN_BLOCKS.add(name)
  const warnings = []
  const pages = []
  const newBlocks = []
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.dc.html')).sort()) {
    const page = parsePage(basename(f), readFileSync(join(dir, f), 'utf8'), warnings)
    if (!page) continue
    newBlocks.push(...page.newBlocks)
    delete page.newBlocks
    pages.push(page)
  }
  return { pages, newBlocks, warnings }
}

function main() {
  const argv = process.argv.slice(2)
  // Client repos merge in bespoke blocks that the starter's RenderBlocks map
  // does not know about (e.g. enquiryWizard, textMedia). Without this they are
  // reported as unknown and dropped on every run.
  const extraIdx = argv.indexOf('--extra-blocks')
  if (extraIdx !== -1) {
    for (const name of (argv[extraIdx + 1] || '').split(',').map((s) => s.trim())) {
      if (name) KNOWN_BLOCKS.add(name)
    }
    argv.splice(extraIdx, 2)
  }
  const [dir, out = 'design-parsed.json'] = argv
  if (!dir) {
    console.error(
      'usage: parse_design_export.mjs <export-dir> [out.json] [--extra-blocks a,b]',
    )
    process.exit(1)
  }
  const warnings = []
  const pages = []
  const newBlocks = []

  for (const f of readdirSync(dir).filter((f) => f.endsWith('.dc.html')).sort()) {
    const page = parsePage(basename(f), readFileSync(join(dir, f), 'utf8'), warnings)
    if (!page) continue
    newBlocks.push(...page.newBlocks)
    delete page.newBlocks
    pages.push(page)
  }

  const result = { pages, newBlocks, warnings }
  writeFileSync(out, JSON.stringify(result, null, 2))

  console.log(`pages:      ${pages.length}`)
  console.log(`  posts:    ${pages.filter((p) => p.collection === 'posts').length}`)
  console.log(`blocks:     ${pages.reduce((n, p) => n + p.blocks.length, 0)}`)
  console.log(`newBlocks:  ${[...new Set(newBlocks.map((b) => b.name))].join(', ') || 'none'}`)
  console.log(`warnings:   ${warnings.length}`)
  for (const w of warnings.slice(0, 25)) console.log(`  ! ${w}`)
  console.log(`\nwrote ${out}`)
}

// Only run the CLI when invoked directly — importing this module must not
// write files or exit the process.
if (process.argv[1] && process.argv[1].endsWith('parse-design-export.mjs')) main()
