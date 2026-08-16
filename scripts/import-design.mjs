#!/usr/bin/env node
/**
 * Import a Claude Design export into the CMS.
 *
 *   pnpm import:design           (reads .env automatically)
 *   node scripts/import-design.mjs ./design-export ./design-images
 *
 * Idempotent: pages, posts, categories and media are matched on slug/filename
 * and updated in place, so it is safe to re-run after a fresh design export.
 *
 * Flags:
 *   --dry        parse and report only, write nothing
 *   --drafts     create pages as drafts instead of published
 *   --only=a,b   restrict to specific slugs (handy when fixing one page)
 */

import { readFileSync, existsSync, readdirSync } from 'fs'
import { basename, join, resolve } from 'path'
import { parseExport } from './lib/parse-design-export.mjs'

// Load .env ourselves so this runs as `node scripts/import-design.mjs` without
// needing --env-file (which hard-fails if the file is absent). Real environment
// variables always win, so Codespace/Vercel secrets are never overwritten.
for (const file of ['.env', '.env.local']) {
  if (!existsSync(file)) continue
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*(?:export\s+)?([A-Z0-9_]+)\s*=\s*(.*)$/i)
    if (!m) continue
    const key = m[1]
    if (process.env[key] !== undefined) continue
    process.env[key] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}

const BASE = process.env.CMS_URL || 'http://localhost:3000'
const EMAIL = process.env.CMS_EMAIL
const PASSWORD = process.env.CMS_PASSWORD

const args = process.argv.slice(2)
const flags = new Set(args.filter((a) => a.startsWith('--')))
const positional = args.filter((a) => !a.startsWith('--'))
const EXPORT_DIR = resolve(positional[0] || './design-export')
const IMAGE_DIR = positional[1] ? resolve(positional[1]) : null
const DRY = flags.has('--dry')
const SKIP_MEDIA = process.argv.includes('--skip-media')
const DRAFTS = flags.has('--drafts')
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').replace('--only=', '')
const ONLY_SLUGS = ONLY ? new Set(ONLY.split(',')) : null

// Client-specific blocks live alongside the 23 shipped with the starter.
const EXTRA_BLOCKS = ['enquiryWizard', 'textMedia']

/* ------------------------------------------------------------------ lexical */

const textNode = (text, format = 0) => ({
  type: 'text', detail: 0, format, mode: 'normal', style: '', text, version: 1,
})

const paragraph = (children) => ({
  type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1, children,
  textFormat: 0,
})

const headingNode = (text, tag) => ({
  type: 'heading', tag, direction: 'ltr', format: '', indent: 0, version: 1,
  children: [textNode(text)],
})

const linkNode = (text, url, newTab = false) => ({
  type: 'link', direction: 'ltr', format: '', indent: 0, version: 3,
  fields: { linkType: 'custom', url, newTab },
  children: [textNode(text)],
})

const stripInnerTags = (html) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()

/**
 * Convert a fragment of inline HTML (plain text mixed with <strong> and <a>)
 * into Lexical inline nodes, in document order. Not a general HTML parser —
 * handles exactly the two inline tags the design export mixes into banner/CTA
 * sentences. Without this, any text sitting inside a <strong>/<a> wrapper is
 * invisible to the generic block-level text extraction (which only reads whole
 * headings/paragraphs/list items), so a sentence like "**Bold lead-in.** body
 * copy **link text**" imports as nothing at all.
 */
// extractLinks() (parse-design-export.mjs) does this same ".dc.html" → "/foo"
// conversion before a URL ever reaches rewriteUrl (which only rewrites paths
// that already start with "/" and passes anything else through unchanged) —
// parseInlineNodes reads raw href attributes directly, bypassing that, so
// without this a link href imports as the literal "enquiry.dc.html?type=..."
// rather than "/enquiry?type=...".
function toSiteUrl(url) {
  if (!/\.dc\.html/i.test(url)) return url
  const converted = '/' + url.replace(/\.dc\.html/i, '').replace(/^\.\//, '')
  return converted === '/index' ? '/' : converted
}

function parseInlineNodes(html) {
  const nodes = []
  const re = /<strong[^>]*>([\s\S]*?)<\/strong>|<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  let last = 0
  let m
  const pushPlain = (segment) => {
    const text = stripInnerTags(segment)
    if (text) nodes.push(textNode(text))
  }
  while ((m = re.exec(html))) {
    pushPlain(html.slice(last, m.index))
    if (m[1] !== undefined) {
      nodes.push(textNode(stripInnerTags(m[1]), 1))
    } else {
      const label = stripInnerTags(m[3])
      if (label) nodes.push(linkNode(label, rewriteUrl(toSiteUrl(m[2])) || toSiteUrl(m[2])))
    }
    last = m.index + m[0].length
  }
  pushPlain(html.slice(last))
  return nodes
}

const listNode = (items) => ({
  type: 'list', listType: 'bullet', tag: 'ul', start: 1,
  direction: 'ltr', format: '', indent: 0, version: 1,
  children: items.map((t, i) => ({
    type: 'listitem', value: i + 1, direction: 'ltr', format: '', indent: 0,
    version: 1, children: [textNode(t)],
  })),
})

const root = (children) => ({
  root: {
    type: 'root', direction: 'ltr', format: '', indent: 0, version: 1,
    children: children.length ? children : [paragraph([])],
  },
})

/** Turn parsed [{tag,text}] into Lexical, preserving headings and lists. */
function toRichText(parts, { skipFirstHeading = false } = {}) {
  const nodes = []
  let buffer = []
  let skipped = false
  const flush = () => {
    if (buffer.length) { nodes.push(listNode(buffer)); buffer = [] }
  }
  for (const part of parts || []) {
    const tag = part.tag
    const text = (part.text || '').trim()
    if (!text) continue
    if (/^h[1-6]$/.test(tag)) {
      if (skipFirstHeading && !skipped) { skipped = true; continue }
      flush()
      // h1 is the page title; demote so imported pages keep one h1 from the template
      nodes.push(headingNode(text, tag === 'h1' ? 'h2' : tag))
    } else if (tag === 'li') {
      buffer.push(text)
    } else {
      flush()
      nodes.push(paragraph([textNode(text)]))
    }
  }
  flush()
  return root(nodes)
}

const plain = (text) => root(text ? [paragraph([textNode(text)])] : [])

/* ------------------------------------------------------------- api plumbing */

let token = null

async function api(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `JWT ${token}` } : {}),
      ...(options.headers || {}),
    },
  })
  const body = await res.text()
  let json
  try { json = JSON.parse(body) } catch { json = { raw: body } }
  if (!res.ok) {
    const msg = json?.errors?.[0]?.message || json?.message || body.slice(0, 300)
    throw new Error(`${res.status} ${path} — ${msg}`)
  }
  return json
}

// The most common failure is simply that the CMS is not running, which
// otherwise surfaces as an opaque fetch error.
async function assertServerUp() {
  try {
    await fetch(`${BASE}/api/access`, { method: 'GET' })
  } catch {
    throw new Error(
      `Cannot reach the CMS at ${BASE}.\n` +
      `  Start it in a SECOND terminal with:  pnpm dev\n` +
      `  (leave it running \u2014 it blocks that terminal), then re-run this import.`,
    )
  }
}

async function login() {
  if (!EMAIL || !PASSWORD) {
    throw new Error(
      'Set CMS_EMAIL and CMS_PASSWORD (in .env or the environment). ' +
      'Credentials are deliberately not hardcoded in this script.',
    )
  }
  const res = await api('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  token = res.token
  if (!token) throw new Error('Login succeeded but returned no token')
}

/** Find one doc by field, or null. */
async function findBy(collection, field, value) {
  const q = `/api/${collection}?where[${field}][equals]=${encodeURIComponent(value)}&limit=1&depth=0&draft=true`
  const res = await api(q)
  return res.docs?.[0] || null
}

async function upsert(collection, field, value, data) {
  const existing = await findBy(collection, field, value)
  if (existing) {
    await api(`/api/${collection}/${existing.id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return { id: existing.id, created: false }
  }
  const created = await api(`/api/${collection}`, { method: 'POST', body: JSON.stringify(data) })
  return { id: created.doc?.id || created.id, created: true }
}

/* -------------------------------------------------------------------- media */

const mediaCache = new Map()

const MIME_TYPES = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
}

function mimeTypeFor(name) {
  const ext = name.slice(name.lastIndexOf('.')).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

const mediaFailures = []

async function uploadMedia(filePath, alt) {
  if (SKIP_MEDIA) return null

  const name = basename(filePath)
  if (mediaCache.has(name)) return mediaCache.get(name)

  const existing = await findBy('media', 'filename', name)
  if (existing) { mediaCache.set(name, existing.id); return existing.id }

  const buf = readFileSync(filePath)
  const form = new FormData()
  // The Blob MUST carry a MIME type. Without one the browser-style FormData
  // sends application/octet-stream, Payload can't identify the image, and
  // sharp throws while generating the resize set — surfacing as a bare
  // 500 "Something went wrong" with nothing useful in the response body.
  form.append('file', new Blob([buf], { type: mimeTypeFor(name) }), name)
  form.append('_payload', JSON.stringify({ alt: alt || name }))
  const res = await fetch(`${BASE}/api/media`, {
    method: 'POST',
    headers: { Authorization: `JWT ${token}` },
    body: form,
  })
  if (!res.ok) {
    // A failing image must not abandon a 50-page import. Warn, remember the
    // failure, carry on, and report every one of them in the summary so the
    // gaps are known rather than discovered later in the CMS.
    const detail = `${res.status} ${(await res.text()).slice(0, 200)}`
    console.log(`  ! media upload failed: ${name} — ${detail}`)
    mediaFailures.push({ name, detail })
    mediaCache.set(name, null)
    return null
  }
  const json = await res.json()
  const id = json.doc?.id || json.id
  mediaCache.set(name, id)
  return id
}

/** Load images + image-map.json, upload everything once, return slug -> ids. */
async function loadImages() {
  if (!IMAGE_DIR || !existsSync(IMAGE_DIR)) return { map: {}, alt: {} }
  const mapPath = join(IMAGE_DIR, 'image-map.json')
  if (!existsSync(mapPath)) {
    console.log('  ! no image-map.json — skipping images')
    return { map: {}, alt: {} }
  }
  const spec = JSON.parse(readFileSync(mapPath, 'utf8'))
  const alt = spec.altText || {}
  const resolved = {}

  // Upload every OG variant up front so pages added to the design *after* the
  // image map was generated still get a share image via the prefix rules below,
  // instead of silently shipping with none.
  const ogDir = join(IMAGE_DIR, 'og')
  const ogVariants = {}
  if (existsSync(ogDir)) {
    for (const file of readdirSync(ogDir)) {
      const key = file.replace(/\.[a-z]+$/, '')
      ogVariants[key] = DRY ? `(would upload og/${file})` : await uploadMedia(join(ogDir, file), alt[key])
    }
  }
  resolved.__og = ogVariants
  for (const [slug, entry] of Object.entries(spec.pages || {})) {
    const out = {}
    for (const key of ['hero', 'ogImage']) {
      const rel = entry[key]
      if (!rel) continue
      const abs = join(IMAGE_DIR, rel)
      if (!existsSync(abs)) continue
      const altKey = basename(rel).replace(/\.[a-z]+$/, '')
      out[key] = DRY ? `(would upload ${rel})` : await uploadMedia(abs, alt[altKey])
    }
    resolved[slug] = out
  }
  return { map: resolved, alt }
}

/**
 * Payload rejects "/" inside a slug, but Claude Design emits nested paths for
 * category hubs (guides/category/dismissal). Flatten to a single segment and
 * rewrite every link that pointed at the nested path so navigation still works.
 */
const flattenSlug = (slug) => slug.replace(/^\/+|\/+$/g, '').replace(/\//g, '-')

// filename (without .dc.html) -> the slug that page actually declares.
// Claude Design links by filename ("legal-privacy-policy.dc.html") while the
// page front matter may declare a different slug ("privacy-policy"), so
// resolving through this map is what stops the footer 404ing.
const slugByFile = new Map()

const rewriteUrl = (url) => {
  if (!url || !url.startsWith('/')) return url
  const clean = url.split(/[?#]/)[0]
  const rest = url.slice(clean.length)
  const key = clean.replace(/^\//, '')
  const target = slugByFile.get(key)
  if (target !== undefined) return (target === 'home' ? '/' : `/${target}`) + rest
  const flat = '/' + flattenSlug(clean)
  return flat === '/' ? url : flat + rest
}

/** Choose a share image by URL shape when a page has no explicit mapping. */
function fallbackOg(slug, ogVariants = {}) {
  const pick =
    /^for-employers/.test(slug) ? 'og-employer' :
    /^for-employees/.test(slug) ? 'og-employee' :
    /^employment-solicitors/.test(slug) ? 'og-location' :
    /^guides/.test(slug) ? 'og-guides' :
    'og-default'
  return ogVariants[pick] || ogVariants['og-default'] || null
}

/* ------------------------------------------------------- block field mapping */

const heading = (b) => (b.text || []).find((t) => /^h[1-6]$/.test(t.tag))?.text || ''
const paras = (b) => (b.text || []).filter((t) => t.tag === 'p').map((t) => t.text)
const firstPara = (b) => paras(b)[0] || ''

/** Anchor-only links ("#enquiry-form") stay custom; internal paths do too —
 *  resolving them to relationships would need every page to exist first. */
const toLinkGroup = (links = []) =>
  links.slice(0, 2).map((l, i) => ({
    link: {
      type: 'custom',
      url: rewriteUrl(l.url) || '#',
      label: l.label || 'Learn more',
      newTab: false,
      appearance: i === 0 ? 'default' : 'outline',
    },
  }))

function mapBlock(b, ctx) {
  const t = b.blockType
  const items = b.items || []

  switch (t) {
    case 'content': {
      const base = toRichText(b.text)
      // Some content sections use bare <div> "cards" with a bold lead-in
      // phrase (e.g. about.dc.html's "How the panel is vetted" list) instead
      // of <li> — those have a nested <strong>, so they're invisible to
      // extractText (which only treats fully tag-free divs as leaf text) and
      // silently disappear. Pull them in as their own paragraphs, preserving
      // the bold lead-in, rather than losing the whole card.
      const html = b.rawHtml || ''
      const cardNodes = [...html.matchAll(/<div[^>]*>\s*<strong[^>]*>[\s\S]*?<\/div>/gi)]
        .map((m) => parseInlineNodes(m[0]))
        .filter((nodes) => nodes.length)
        .map((nodes) => paragraph(nodes))
      return {
        blockType: 'content',
        columns: [{ size: 'full', richText: root([...(base.root.children || []), ...cardNodes]) }],
      }
    }

    case 'cta': {
      // The design uses three CTA presentations and nothing but the wrapper's
      // inline style distinguishes them: a full-width #1A1F26 band that closes
      // the page, a boxed #1A1F26 card mid-page, and a boxed #F7F8FA panel.
      const wrapper = (b.rawHtml || '').slice(0, 400)
      const tone = /#1A1F26/i.test(wrapper)
        ? /border-radius/i.test(wrapper)
          ? 'darkCard'
          : 'dark'
        : /#F7F8FA/i.test(wrapper)
          ? 'light'
          : 'dark'
      return { blockType: 'cta', tone, richText: toRichText(b.text), links: toLinkGroup(b.links) }
    }

    case 'banner': {
      // "info" covers two visually distinct designs, both with style="info":
      //   1. The full-bleed dated notice (index.dc.html): a <span> badge, then
      //      a sibling <div> mixing plain text with <strong> and a trailing
      //      <a> — no <p> boundaries, one flowing sentence.
      //   2. A contained card (about.dc.html "We are not a law firm",
      //      guides.dc.html's per-guide disclaimer): an optional bare
      //      <strong> title on its own line, then one or more real <p> body
      //      paragraphs (or, for guides, no title at all — just a sentence).
      // The generic text pass can't see any of this (nested tags disqualify a
      // div/strong from being "leaf" content), which is why only the date
      // badge ever survived import. There's no badge field any more (it broke
      // production once, see 283b3a5) — Banner/Component.tsx tells these two
      // shapes apart at render time from the content itself (whether the
      // first bold run looks like a date), so both must import as real rich
      // text with the title/paragraph structure intact.
      const html = b.rawHtml || ''
      const spanBadgeMatch = html.match(/<span[^>]*>([\s\S]*?)<\/span>/i)

      if (spanBadgeMatch) {
        const badge = stripInnerTags(spanBadgeMatch[1])
        const rest = html.slice(spanBadgeMatch.index + spanBadgeMatch[0].length)
        const children = [textNode(`${badge} `, 1), ...parseInlineNodes(rest)]
        return { blockType: 'banner', style: 'info', content: root([paragraph(children)]) }
      }

      const titleMatch = html.match(/<strong[^>]*>([\s\S]*?)<\/strong>/i)
      const rest = titleMatch ? html.slice(titleMatch.index + titleMatch[0].length) : html
      const bodyParas = [...rest.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
      const bodyNodes = bodyParas.length
        ? bodyParas.map((m) => paragraph(parseInlineNodes(m[1])))
        : (() => {
            const nodes = parseInlineNodes(rest)
            return nodes.length ? [paragraph(nodes)] : []
          })()
      const titlePara = titleMatch ? paragraph([textNode(stripInnerTags(titleMatch[1]), 1)]) : null
      return {
        blockType: 'banner',
        style: 'info',
        content: root([...(titlePara ? [titlePara] : []), ...bodyNodes]),
      }
    }

    case 'stats':
      return {
        blockType: 'stats',
        heading: heading(b),
        stats: items.map((it) => {
          const texts = (it.text || []).map((x) => x.text).filter(Boolean)
          return { value: texts[0] || '', label: texts.slice(1).join(' — ') || '' }
        }).filter((s) => s.value),
      }

    case 'faq': {
      // The design uses two different presentations for this block: a
      // collapsible <details>/<summary> accordion (every service/location
      // page) and a single always-open list with plain <h3> questions
      // (how-it-works.dc.html only). Nothing in the item data itself differs
      // between them, so the choice of question tag is the only signal —
      // stash it in `description` (unused by either real instance) as a
      // sentinel FAQ/Component.tsx checks and strips, rather than adding a
      // schema field for a single page's layout choice.
      const usesSummaryTag = items.some((it) => (it.text || []).some((x) => x.tag === 'summary'))
      return {
        blockType: 'faq',
        heading: heading(b),
        ...(usesSummaryTag ? {} : { description: '__open__' }),
        items: items.map((it) => {
          const q = (it.text || []).find((x) => x.tag === 'summary' || /^h[1-6]$/.test(x.tag))
          const answers = (it.text || []).filter((x) => x !== q)
          return { question: q?.text || '', answer: toRichText(answers) }
        }).filter((i) => i.question),
      }
    }

    case 'features':
      return {
        blockType: 'features',
        heading: heading(b),
        description: firstPara(b),
        columns: items.length === 4 ? '4' : items.length === 2 ? '2' : '3',
        features: items.map((it) => {
          const parts = (it.text || []).filter((x) => x.text)
          const title = parts[0]?.text || ''
          let rest = parts.slice(1)
          // A short ALL-CAPS <span> right after the title (e.g. "URGENT" on
          // for-employers.dc.html's interim-relief card) is an inline badge
          // next to the heading, not body copy — there's no dedicated field
          // for it, so fold it into the title as a bracketed suffix that
          // Features/Component.tsx knows to pull out and render as a pill.
          let badgedTitle = title
          if (rest[0]?.tag === 'span' && /^[A-Z][A-Z\s]{1,14}$/.test(rest[0].text)) {
            badgedTitle = `${title} [${rest[0].text}]`
            rest = rest.slice(1)
          }
          const link = (it.links || [])[0]
          // Some cards wrap the WHOLE tile in one <a> (e.g. the city cards on
          // employment-solicitors.dc.html) rather than linking just their last
          // line. extractLinks then returns the entire tile's flattened text as
          // the link label, which doesn't match any single text part — so it
          // can't be filtered out of the body the normal way, and importing it
          // as-is duplicates the whole card into its own CTA label. Detect that
          // case and use the tile's own last line as the real label instead.
          // Careful: "link.label doesn't match the last line" is NOT enough on
          // its own. index.dc.html's two-up tiles have a real button ("Employer
          // services →") that matches no text part either, and the old test
          // mistook it for a whole-tile link — stealing the tile's last bullet
          // ("Urgent interim relief hearings") as the button label and dropping
          // it from the list. A genuine whole-tile <a> flattens the ENTIRE tile
          // into its label, so it contains the card title; a real button never
          // does.
          const wholeCardLink =
            Boolean(link?.label) &&
            rest.length > 1 &&
            link.label !== rest[rest.length - 1]?.text &&
            title.length > 0 &&
            link.label.includes(title)
          const linkLabel = wholeCardLink ? rest[rest.length - 1]?.text : link?.label
          const bodyParts = wholeCardLink ? rest.slice(0, -1) : rest.filter((p) => p.text !== link?.label)
          return {
            title: badgedTitle,
            description: toRichText(bodyParts),
            ...(link?.url ? { linkUrl: rewriteUrl(link.url), linkLabel: linkLabel || 'Read more' } : {}),
          }
        }).filter((f) => f.title),
      }

    case 'howItWorks': {
      // The "More about how it works →" link sits below the step grid, not
      // inside any @item, so it's on b.links (block-level), not an item's own.
      const link = (b.links || [])[0]
      // Same dual-presentation problem as Banner/FAQ: this design uses the
      // block two ways — a 3/4-column grid with oversized numerals (homepage)
      // and a vertical timeline with numbered circles joined by a connector
      // line (how-it-works.dc.html) — same field shape either way, so there's
      // no schema signal to pick one. The connector line (a 2px-wide filler
      // div between circles) only exists in the timeline instance; stash that
      // as a subheading sentinel (empty in both real instances otherwise) for
      // HowItWorks/Component.tsx to switch on, same trick as FAQ's.
      const isTimeline = /width:\s*2px/i.test(b.rawHtml || '')
      return {
        blockType: 'howItWorks',
        heading: heading(b),
        subheading: isTimeline ? '__timeline__' : firstPara(b),
        steps: items.map((it) => {
          const hs = (it.text || []).filter((x) => /^h[1-6]$/.test(x.tag)).map((x) => x.text)
          const ps = (it.text || []).filter((x) => x.tag === 'p').map((x) => x.text)
          return { title: hs[0] || '', description: ps.join('\n\n') }
        }).filter((s) => s.title),
        ...(link?.url ? { ctaText: link.label || 'Learn more', ctaLink: rewriteUrl(link.url) } : {}),
      }
    }

    case 'archive':
      // Guides listings: let the CMS populate from the posts collection.
      return {
        blockType: 'archive',
        introContent: toRichText(b.text),
        populateBy: 'collection',
        relationTo: 'posts',
        limit: Math.max(items.length || 6, 6),
      }

    case 'enquiryWizard': {
      // Every enquiryWizard marker in the export declares its own variant
      // attribute explicitly (@block: enquiryWizard variant="page"/"inline-hero"/
      // "modal") — trust it. The position heuristic (ctx.isHero) is only a
      // fallback for the case it's somehow missing; it was previously used
      // unconditionally, which is why /enquiry — whose marker says variant="page"
      // — imported as "inline-hero" (it happens to be that page's first block).
      const variant = b.variant || (ctx.isHero ? 'inline-hero' : 'page')
      const isHeroVariant = variant === 'inline-hero'
      // eyebrow/bullets are inline-hero-only fields (config.ts conditions them
      // on variant), and only meaningful on the hero instance — the design's
      // eyebrow is a leaf <div> just above the h1 (not a <span>, unlike
      // homeHero's badge), and the tick list is a <ul> whose <li> text keeps a
      // leading glyph from the design's inline span (stripped generically now
      // by extractText for every <li>, not just this one).
      const eyebrow = isHeroVariant ? (b.text || []).find((x) => x.tag === 'div')?.text || '' : ''
      const bullets = isHeroVariant
        ? (b.text || [])
            .filter((x) => x.tag === 'li')
            .map((x) => ({ text: x.text }))
            .filter((x) => x.text)
            .slice(0, 4)
        : []
      return {
        blockType: 'enquiryWizard',
        variant,
        heading: heading(b) || 'Check where you stand',
        subheading: firstPara(b),
        ...(eyebrow ? { eyebrow } : {}),
        ...(bullets.length ? { bullets } : {}),
      }
    }

    case 'textMedia': {
      const h = heading(b)
      const rest = (b.text || []).filter((x) => x.text !== h)
      // The design isn't consistent about which side the image sits on (image
      // first on the homepage, text first on for-employers/for-employees) —
      // derive it per instance from whichever comes first in the markup,
      // rather than assuming one fixed layout for every textMedia block.
      const html = b.rawHtml || ''
      const imageMarkerIdx = html.search(/<!--\s*@field:\s*image/i)
      const headingIdx = h ? html.indexOf(h) : -1
      const imagePosition =
        imageMarkerIdx !== -1 && headingIdx !== -1 && imageMarkerIdx < headingIdx ? 'left' : 'right'
      return {
        blockType: 'textMedia',
        heading: h,
        richText: toRichText(rest),
        imagePosition,
        ...(ctx.heroImage ? { image: ctx.heroImage } : {}),
        ...(b.links?.length ? { links: toLinkGroup(b.links) } : {}),
      }
    }

    case 'homeHero':
      // Same class of bug as enquiryWizard's variant: the marker declares its
      // own style ("@block: homeHero style=\"centred\" theme=\"dark\"" on
      // how-it-works.dc.html), captured on b.style, but it was never read —
      // every hero silently fell back to the component's "split" default
      // regardless of what the design actually specified.
      return {
        blockType: 'homeHero',
        style: b.style || 'split',
        theme: b.theme || 'dark',
        // The eyebrow is a leaf <div> in the "centred" style (like
        // enquiryWizard's), not necessarily a <span>.
        badge: (b.text || []).find((x) => x.tag === 'div' || x.tag === 'span')?.text || '',
        headline: heading(b),
        subheadline: firstPara(b),
        ...(ctx.heroImage ? { backgroundImage: ctx.heroImage } : {}),
      }

    default:
      // Unknown types are rejected by the parser, so this is a safety net only.
      return { blockType: 'content', columns: [{ size: 'full', richText: toRichText(b.text) }] }
  }
}

/* ---------------------------------------------------------- site chrome */

const navLink = (label, url) => ({ link: { type: 'custom', url: rewriteUrl(url), label, newTab: false } })

/**
 * Header, footer and SEO defaults live in globals, not in the page export, so
 * an import alone would leave the site with an empty menu and "Your Brand"
 * placeholders. Seeded here from the design's own navigation.
 */
// One failing global must not block the rest — site-appearance, header, footer
// and seo-settings are independent concerns, and an editor can always fix one
// of them by hand in /admin, but only if the other three actually landed.
async function seedGlobal(slug, data) {
  try {
    await api(`/api/globals/${slug}`, { method: 'POST', body: JSON.stringify(data) })
    console.log(`  ~ ${slug} seeded`)
  } catch (e) {
    console.log(`  ! ${slug} skipped — ${e.message}`)
  }
}

async function seedSiteChrome(brand) {
  // The starter ships with the previous client's palette as its defaults, so a
  // fresh site renders in someone else's brand colours until this is set. The
  // values come from the design export's own stylesheet, not invented here.
  await seedGlobal('site-appearance', {
    // Tabs in this global are label-only, so these fields are flat, not nested.
    primaryColour: brand.colours.primary,
    // Light, NOT ink: this drives --secondary, whose paired foreground stays
    // dark. Setting it to ink gives dark-on-dark cards across the site.
    secondaryColour: brand.colours.surface,
    accentColour: brand.colours.accent,
    backgroundColour: '#FFFFFF',
    textColour: brand.colours.ink,
    headerBgColour: '#FFFFFF',
    footerBgColour: brand.colours.ink,
    // The export sets font-family:'Plus Jakarta Sans' on 255 elements; that is
    // the design's typeface for both headings and body. Must be set
    // explicitly: once a site-appearance record exists, leaving a font field
    // empty applies the global's own default (DM Serif Display for headings).
    //
    // headingFont is DELIBERATELY omitted here. "Plus Jakarta Sans" is now a
    // valid option in the field's select config (src/globals/SiteAppearance.ts),
    // but the column is backed by a real Postgres enum type that hasn't been
    // migrated to include it — writing it 500s the whole global (confirmed
    // live, not theoretical). bodyFont already had this value as a valid
    // option before today, so it isn't blocked the same way, and it covers the
    // overwhelming majority of the site's type (everything using --font-sans)
    // — only a handful of font-serif elements (HeroSplit heading, 404, legal
    // page h1s, two modal titles) stay on the wrong face until headingFont's
    // enum is migrated and this line can be restored.
    bodyFont: 'Plus Jakarta Sans',
    // The design uses fluid type (styles.css §2). SiteAppearance defaults
    // these to fixed rem values, and those defaults are injected as CSS vars,
    // so a CSS-level clamp fallback would never apply. Seeding the clamps
    // here is the only place they survive the cascade.
    h1Size: 'clamp(28px, 6vw, 46px)',
    h2Size: 'clamp(23px, 4vw, 34px)',
    h3Size: 'clamp(18px, 2.6vw, 22px)',
    bodySize: 'clamp(15px, 1.5vw, 16.5px)',
  })

  await seedGlobal('header', {
    navItemsLeft: [
      navLink('For Employers', '/for-employers'),
      navLink('For Employees', '/for-employees'),
      navLink('Guides', '/guides'),
    ],
    // No "Free enquiry" here — the header renders a persistent CTA button
    // outside these nav items already, pointing at the same /enquiry. Adding
    // it here duplicates that button in the nav (round-3 finding R3).
    // No "Contact" here — design-export/SiteHeader.dc.html's nav-desktop is
    // For Employers/For Employees/Guides/How It Works only. Contact already
    // lives in the footer; it was never part of the designed header nav.
    navItemsRight: [
      navLink('How It Works', '/how-it-works'),
    ],
  })

  await seedGlobal('footer', {
      brandName: brand.name,
      brandTagline: brand.tagline,
      // 4 link columns (Services/Guides/Company/Legal), matching the design's
      // own footer-grid and src/Footer/config.ts's actual field shape — a 3rd
      // "Company" column crammed with the legal links (an earlier shape of
      // this seed) leaves column4Heading/column4Links unset and the Legal
      // column empty.
      column1Heading: 'Services',
      column1Links: [
        navLink('For Employers', '/for-employers'),
        navLink('For Employees', '/for-employees'),
        navLink('How It Works', '/how-it-works'),
        navLink('Employment solicitors near you', '/employment-solicitors'),
        navLink('Free enquiry', '/enquiry'),
      ],
      column2Heading: 'Guides',
      column2Links: [
        navLink('All guides', '/guides'),
        navLink('Dismissal', '/guides-category-dismissal'),
        navLink('Exit negotiations', '/guides-category-exit-negotiations'),
        navLink('Tribunal process', '/guides-category-tribunal-process'),
        navLink('Discrimination', '/guides-category-discrimination'),
      ],
      column3Heading: 'Company',
      column3Links: [
        navLink('About us', '/about'),
        navLink('Contact', '/contact'),
      ],
      column4Heading: 'Legal',
      column4Links: [
        navLink('Privacy policy', '/legal/privacy-policy'),
        navLink('Terms of use', '/legal/terms-of-use'),
        navLink('Cookie policy', '/legal/cookie-policy'),
        navLink('Complaints', '/legal/complaints'),
      ],
      copyrightText: `\u00a9 {year} ${brand.name}. All rights reserved.`,
  })

  await seedGlobal('seo-settings', {
    siteTitle: brand.name,
    titleSeparator: ' | ',
    defaultDescription: brand.description,
  })
}

/* --------------------------------------------------------------------- main */

async function main() {
  console.log(`\nImporting ${EXPORT_DIR}`)
  console.log(`  target ${BASE}${DRY ? '  (dry run)' : ''}\n`)

  const parsed = parseExport(EXPORT_DIR, { extraBlocks: EXTRA_BLOCKS })
  for (const w of parsed.warnings) console.log(`  ! ${w}`)

  let pages = parsed.pages
  if (ONLY_SLUGS) pages = pages.filter((p) => ONLY_SLUGS.has(p.slug))

  // Paginated listings (guides + guides-page-2) declare the same slug. The
  // archive block paginates from the posts collection, so the extra page is
  // redundant — keep the canonical one and drop the rest rather than silently
  // overwriting the real listing with page 2. "Keep the first" is NOT the same
  // as "keep the file without a -page-N suffix": readdirSync().sort() is plain
  // alphabetical, and "-" (0x2D) sorts before "." (0x2E), so
  // "guides-page-2.dc.html" sorts BEFORE "guides.dc.html" and would otherwise
  // win by file order alone, publishing page 2's content at the /guides slug.
  const isPaginatedVariant = (p) => /-page-\d+\.dc\.html$/i.test(p.file || '')
  const bySlug = new Map()
  for (const p of pages) {
    const existing = bySlug.get(p.slug)
    if (!existing) {
      bySlug.set(p.slug, p)
      continue
    }
    const dropExisting = isPaginatedVariant(existing) && !isPaginatedVariant(p)
    const keep = dropExisting ? p : existing
    const dropped = dropExisting ? existing : p
    console.log(`  ! duplicate slug "${p.slug}" — keeping ${keep.file}, skipping ${dropped.file}`)
    bySlug.set(p.slug, keep)
  }
  pages = [...bySlug.values()]

  for (const p of pages) {
    const file = (p.file || '').replace(/\.dc\.html$/, '')
    const finalSlug = flattenSlug(p.slug === 'index' ? 'home' : p.slug)
    if (file) slugByFile.set(file, finalSlug)
    slugByFile.set(p.slug, finalSlug)
  }

  const posts = pages.filter((p) => p.collection === 'posts')
  const sitePages = pages.filter((p) => p.collection !== 'posts')
  console.log(`  parsed ${sitePages.length} pages, ${posts.length} posts\n`)

  if (!DRY) {
    await assertServerUp()
    await login()
  }

  const images = await loadImages()
  if (Object.keys(images.map).length) console.log(`  media ready for ${Object.keys(images.map).length} slugs\n`)

  // Categories first, so posts can reference them.
  const catIds = {}
  const catTitles = [...new Set(posts.map((p) => p.category).filter(Boolean))]
  for (const title of catTitles) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    if (DRY) { catIds[title] = `(category ${slug})`; continue }
    const { id } = await upsert('categories', 'slug', slug, { title, slug })
    catIds[title] = id
  }
  if (catTitles.length) console.log(`  categories: ${catTitles.join(', ')}\n`)

  const results = { created: 0, updated: 0, failed: [] }

  for (const page of sitePages) {
    const slug = flattenSlug(page.slug === 'index' ? 'home' : page.slug)
    // The image map may be keyed on the export filename (index) while the page
    // declares slug="home", or vice versa — check both before giving up.
    const img = images.map[page.slug] || images.map[slug] ||
      (slug === 'home' ? images.map['index'] : {}) || {}
    let heroConsumed = false

    // A page's wizard later-step markup (variant="modal") is exported as its
    // own @block marker so designers can see steps 2-4, but it's the SAME
    // wizard the hero block already renders (the component owns opening it as
    // a modal) — not a second section. Importing it verbatim publishes a
    // visible duplicate, e.g. step 4's heading sitting right above step 1's on
    // the homepage. Keep only the first enquiryWizard block on any page.
    let sawWizard = false
    const blocksForLayout = page.blocks.filter((b) => {
      if (b.blockType !== 'enquiryWizard') return true
      if (sawWizard) return false
      sawWizard = true
      return true
    })

    const layout = blocksForLayout.map((b, i) => {
      const isHero = i === 0 && b.blockType === 'enquiryWizard'
      const heroImage = !heroConsumed && img.hero ? ((heroConsumed = true), img.hero) : null
      return mapBlock(b, { isHero, heroImage })
    })

    const data = {
      title: page.title || slug,
      slug,
      // The design puts a breadcrumb trail on About and the guide category
      // pages only, marked up as <nav aria-label="Breadcrumb">.
      showBreadcrumbs: Boolean(page.hasBreadcrumbs),
      _status: DRAFTS ? 'draft' : 'published',
      layout,
      meta: {
        title: page.metaTitle || page.title,
        description: page.description || '',
        ...(img.ogImage && !DRY ? { image: img.ogImage } : {}),
      },
    }

    if (!img.ogImage) {
      const fb = fallbackOg(page.slug, images.map.__og)
      if (fb) img.ogImage = fb
      else if (Object.keys(images.map).length) console.log(`  ! ${slug}: no OG image available`)
    }
    if (DRY) { console.log(`  · ${slug} (${layout.length} blocks)`); continue }
    try {
      const { created } = await upsert('pages', 'slug', slug, data)
      results[created ? 'created' : 'updated']++
      console.log(`  ${created ? '+' : '~'} ${slug} (${layout.length} blocks)`)
    } catch (err) {
      results.failed.push(`${slug}: ${err.message}`)
      console.log(`  x ${slug} — ${err.message}`)
    }
  }

  for (const post of posts) {
    const img = images.map[post.slug] || {}
    const body = post.blocks.flatMap((b) => (b.text || []))
    const data = {
      title: post.title || post.slug,
      slug: post.slug,
      // Guides were previously seeded as drafts "for review", which left the
      // whole guides section empty on the live site until someone noticed.
      // Import them published; unpublish individually if a guide isn't ready.
      _status: 'published',
      content: toRichText(body, { skipFirstHeading: true }),
      ...(post.category && catIds[post.category] ? { categories: [catIds[post.category]] } : {}),
      meta: {
        title: post.metaTitle || post.title,
        description: post.description || '',
        ...(img.ogImage && !DRY ? { image: img.ogImage } : {}),
      },
    }
    if (DRY) { console.log(`  · post ${post.slug}`); continue }
    try {
      const { created } = await upsert('posts', 'slug', post.slug, data)
      results[created ? 'created' : 'updated']++
      console.log(`  ${created ? '+' : '~'} post ${post.slug}`)
    } catch (err) {
      results.failed.push(`post ${post.slug}: ${err.message}`)
      console.log(`  x post ${post.slug} — ${err.message}`)
    }
  }

  if (!DRY) {
    await seedSiteChrome({
      name: 'MatchMySolicitor',
      // From design-export/styles.css — the design's own interactive states.
      colours: { primary: '#1E4FD8', accent: '#2CC5B6', ink: '#1A1F26', surface: '#F7F8FA' },
      tagline: 'Matched with an SRA-regulated employment solicitor, usually within 24 hours.',
      email: 'hello@matchmysolicitor.co.uk',
      description:
        'Dismissed, facing a tribunal claim or negotiating an exit? Get matched with a specialist employment solicitor. Free, no obligation.',
    })
    console.log('  ~ brand colours, header, footer and SEO defaults seeded')
  }

  console.log(`\n  created ${results.created}, updated ${results.updated}, failed ${results.failed.length}`)

  if (SKIP_MEDIA) {
    console.log('  ~ media skipped (--skip-media). Add images via the CMS page editor.')
  } else if (mediaFailures.length) {
    console.log(`\n  ${mediaFailures.length} image(s) did not upload — pages imported without them:`)
    for (const f of mediaFailures) console.log(`    - ${f.name}: ${f.detail}`)
    console.log('  Re-run the import once fixed; it upserts, so nothing is duplicated.')
  }
  if (results.failed.length) {
    console.log('\n  failures:')
    for (const f of results.failed) console.log(`    - ${f}`)
    process.exit(1)
  }
  console.log('')
}

main().catch((err) => { console.error(`\nimport failed: ${err.message}\n`); process.exit(1) })
