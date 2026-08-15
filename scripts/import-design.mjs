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
      if (label) nodes.push(linkNode(label, rewriteUrl(m[2]) || m[2]))
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
    case 'content':
      return {
        blockType: 'content',
        columns: [{ size: 'full', richText: toRichText(b.text) }],
      }

    case 'cta':
      return { blockType: 'cta', richText: toRichText(b.text), links: toLinkGroup(b.links) }

    case 'banner': {
      // The badge ("1 JAN 2027") sits in a <span>; the sentence after it is a
      // sibling <div> mixing plain text with <strong> and a trailing <a> — the
      // generic text pass can't see inside that div (it has nested tags, so it
      // isn't a "leaf" div by that pass's rules), which is why only the badge
      // ever survived import. There's no badge field any more (it broke
      // production once, see 283b3a5), so both live in one rich-text
      // paragraph, with the date as bold leading text.
      const html = b.rawHtml || ''
      const badgeMatch = html.match(/<span[^>]*>([\s\S]*?)<\/span>/i)
      const badge = badgeMatch ? stripInnerTags(badgeMatch[1]) : ''
      const rest = badgeMatch ? html.slice(badgeMatch.index + badgeMatch[0].length) : html
      const children = []
      if (badge) children.push(textNode(`${badge} `, 1))
      children.push(...parseInlineNodes(rest))
      return {
        blockType: 'banner',
        style: 'info',
        content: root(children.length ? [paragraph(children)] : []),
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

    case 'faq':
      return {
        blockType: 'faq',
        heading: heading(b),
        items: items.map((it) => {
          const q = (it.text || []).find((x) => x.tag === 'summary' || /^h[1-6]$/.test(x.tag))
          const answers = (it.text || []).filter((x) => x !== q)
          return { question: q?.text || '', answer: toRichText(answers) }
        }).filter((i) => i.question),
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
          const rest = parts.slice(1)
          const link = (it.links || [])[0]
          // Some cards wrap the WHOLE tile in one <a> (e.g. the city cards on
          // employment-solicitors.dc.html) rather than linking just their last
          // line. extractLinks then returns the entire tile's flattened text as
          // the link label, which doesn't match any single text part — so it
          // can't be filtered out of the body the normal way, and importing it
          // as-is duplicates the whole card into its own CTA label. Detect that
          // case and use the tile's own last line as the real label instead.
          const wholeCardLink = Boolean(link) && rest.length > 1 && link.label !== rest[rest.length - 1]?.text
          const linkLabel = wholeCardLink ? rest[rest.length - 1]?.text : link?.label
          const bodyParts = wholeCardLink ? rest.slice(0, -1) : rest.filter((p) => p.text !== link?.label)
          return {
            title,
            description: toRichText(bodyParts),
            ...(link?.url ? { linkUrl: rewriteUrl(link.url), linkLabel: linkLabel || 'Read more' } : {}),
          }
        }).filter((f) => f.title),
      }

    case 'howItWorks':
      return {
        blockType: 'howItWorks',
        heading: heading(b),
        subheading: firstPara(b),
        steps: items.map((it) => {
          const hs = (it.text || []).filter((x) => /^h[1-6]$/.test(x.tag)).map((x) => x.text)
          const ps = (it.text || []).filter((x) => x.tag === 'p').map((x) => x.text)
          return { title: hs[0] || '', description: ps.join('\n\n') }
        }).filter((s) => s.title),
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
      const variant = ctx.isHero ? 'inline-hero' : 'page'
      // eyebrow/bullets are inline-hero-only fields (config.ts conditions them
      // on variant), and only meaningful on the hero instance — the design's
      // eyebrow is a leaf <div> just above the h1 (not a <span>, unlike
      // homeHero's badge), and the tick list is a <ul> whose <li> text keeps a
      // leading "✓" from the design's inline glyph span.
      const eyebrow = ctx.isHero ? (b.text || []).find((x) => x.tag === 'div')?.text || '' : ''
      const bullets = ctx.isHero
        ? (b.text || [])
            .filter((x) => x.tag === 'li')
            .map((x) => ({ text: x.text.replace(/^[✓✔]\s*/, '') }))
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
      return {
        blockType: 'textMedia',
        heading: h,
        richText: toRichText(rest),
        imagePosition: 'right',
        ...(ctx.heroImage ? { image: ctx.heroImage } : {}),
        ...(b.links?.length ? { links: toLinkGroup(b.links) } : {}),
      }
    }

    case 'homeHero':
      return {
        blockType: 'homeHero',
        badge: (b.text || []).find((x) => x.tag === 'span')?.text || '',
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
async function seedSiteChrome(brand) {
  // The starter ships with the previous client's palette as its defaults, so a
  // fresh site renders in someone else's brand colours until this is set. The
  // values come from the design export's own stylesheet, not invented here.
  await api('/api/globals/site-appearance', {
    method: 'POST',
    body: JSON.stringify({
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
      // explicitly: once a site-appearance record exists, leaving headingFont
      // empty applies the global's own default of DM Serif Display.
      headingFont: 'Plus Jakarta Sans',
      bodyFont: 'Plus Jakarta Sans',
      // The design uses fluid type (styles.css §2). SiteAppearance defaults
      // these to fixed rem values, and those defaults are injected as CSS vars,
      // so a CSS-level clamp fallback would never apply. Seeding the clamps
      // here is the only place they survive the cascade.
      h1Size: 'clamp(28px, 6vw, 46px)',
      h2Size: 'clamp(23px, 4vw, 34px)',
      h3Size: 'clamp(18px, 2.6vw, 22px)',
      bodySize: 'clamp(15px, 1.5vw, 16.5px)',
    }),
  })

  await api('/api/globals/header', {
    method: 'POST',
    body: JSON.stringify({
      navItemsLeft: [
        navLink('For Employers', '/for-employers'),
        navLink('For Employees', '/for-employees'),
        navLink('Guides', '/guides'),
      ],
      navItemsRight: [
        navLink('How It Works', '/how-it-works'),
        navLink('Contact', '/contact'),
        navLink('Free enquiry', '/enquiry'),
      ],
    }),
  })

  await api('/api/globals/footer', {
    method: 'POST',
    body: JSON.stringify({
      brandName: brand.name,
      brandTagline: brand.tagline,
      contactEmail: brand.email,
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
        navLink('Privacy policy', '/legal-privacy-policy'),
        navLink('Terms of use', '/legal-terms-of-use'),
        navLink('Cookie policy', '/legal-cookie-policy'),
        navLink('Complaints', '/legal-complaints'),
      ],
      copyrightText: `\u00a9 {year} ${brand.name}. All rights reserved. Website designed by Zenithics.`,
    }),
  })

  await api('/api/globals/seo-settings', {
    method: 'POST',
    body: JSON.stringify({
      siteTitle: brand.name,
      titleSeparator: ' | ',
      defaultDescription: brand.description,
    }),
  }).catch((e) => console.log(`  ! seo-settings skipped — ${e.message}`))
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
      _status: 'draft', // guides are seeded unpublished for review
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
