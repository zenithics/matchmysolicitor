# MatchMySolicitor: deploy / import notes

Companion to `BLOCK-HANDOFF.md`. That file documents **blocks and content**. This one documents
everything the block import does *not* carry, i.e. why an import arrives unstyled.

---

## 1. Why the import came through unstyled

The visual design lives in three layers. A block/content importer reads only the first one.

| Layer | Where it lives | Survives block import? |
|---|---|---|
| Block structure + copy | `@block` / `@item` / `@field` markers, text nodes | **Yes** |
| Per-element visual design | inline `style="…"` attributes, thousands of them | **Usually stripped** |
| Shared behaviour + responsive | `styles.css`, 87 lines | **No — never imported** |
| Fonts | Google Fonts `<link>` in each page head | **No** |
| Media | `uploads/` logo SVGs; photography not supplied | **No** |
| Page `<head>` (title, description, canonical) | `@page` front matter + head tags | Depends on importer |

So the import result — "blocks and content, no styling" — is the expected outcome, not a bug.
The design layer has to ship as **code in the repo**, not as CMS data.

---

## 2. Files that must be committed to Git (outside the CMS import)

These are not page content and no importer will pick them up:

- `styles.css` — fluid type, focus states, hover states, header/footer breakpoints, wizard modal
- `cookie-banner.js` — consent banner
- `site-config.js` — site-level constants
- `robots.txt`
- `sitemap.xml`
- **Font files** (see §5) — currently not in the project
- **Logo SVGs** (see §4) — currently under `uploads/`, must move to a real static path

`support.js` is an authoring runtime. **Do not ship it.** See §5.

---

## 3. Section layout is now class-based (done)

Previously a third of `styles.css` targeted elements by their inline style *string*:

```css
@media (max-width: 640px) {
  [style*="padding:80px 24px"] { padding: 48px 20px !important; }
}
```

That is brittle — any prettifier reformatting `padding:80px 24px` to `padding: 80px 24px` silently
kills the rule, and the site loses its mobile layout while looking perfect on desktop. It also had
two live defects:

- Four of the ten patterns matched **nothing** (`88px 24px 72px`, `72px 24px 64px`,
  `repeat(4,1fr)`, `1.15fr`) — dead rules.
- `[style*="padding:64px 24px"]` substring-matched `padding:64px 24px 88px`, so five sections lost
  their bottom padding on phones.

**This has been refactored.** 160 tags across 52 files now carry a class, and the inline `padding` /
`grid-template-columns` declarations were removed so the class is the single source of truth:

| Classes | Count | Owns |
|---|---|---|
| `.sp-*` (16 variants) | 119 | section padding, desktop + phone |
| `.card-40` | 22 | large card padding |
| `.grid-2` / `.grid-3` | 9 | fixed-column grids + their stacking |

Class names encode their desktop values — `.sp-80-64` is `padding: 80px 24px 64px` — so a developer
reading the markup can find the rule without guessing. Nothing in `styles.css` depends on inline
style text any more, and side gutters/tokens are CSS custom properties.

Grids using `repeat(auto-fit, minmax(Npx, 1fr))` (89 instances) were left inline — they reflow
without a breakpoint and were never fragile.

**What this means for the import:** the pipeline must preserve `class` attributes. It no longer
matters whether it reformats inline styles. If classes are stripped too, sections lose their padding
visibly on every page — a loud failure rather than a silent mobile-only one, which is the point.

### Remaining `!important`

Hover and focus rules still carry `!important`, because those elements set their resting
`background` / `color` / `border-color` inline and an inline style outranks any class. Removing the
`!important` silently disables every hover state. To clear them properly, move the resting styles
into classes in the same pass.

---

## 4. Media — what exists and what does not

### Logos: present, but on a path that will not survive

The only media the pages actually load are two brand SVGs:

| File | Used by |
|---|---|
| `uploads/matchmysolicitor-horizontal.svg` | `SiteHeader.dc.html` |
| `uploads/matchmysolicitor-reversed.svg` | `SiteFooter.dc.html` |

`uploads/` is a design-project folder, not a web path. Move both to a real static directory
(`/public/assets/` or equivalent) and update the two `src` attributes. Three further brand files
are available and currently unused — `matchmysolicitor-icon.svg` (favicon and app icons),
`matchmysolicitor-stacked.svg`, `matchmysolicitor-mono-black.svg`. `MatchMySolicitor Brand
Guidelines.pdf` is reference only, do not deploy it.

There is no favicon set yet. Generate one from the icon SVG.

### Photography: specified but does not exist

Three photographs are named and alt-texted in the design, but **no image files were ever supplied**.
Each position currently renders a hatched grey placeholder with a monospace caption:

| Page | Expected filename | Alt text |
|---|---|---|
| `index` | `home-professional-on-phone-workplace.jpg` | Professional on phone, workplace |
| `for-employees` | `for-employees-one-to-one-consultation-calm-setting.jpg` | One-to-one consultation, calm setting |
| `for-employers` | `employers-hr-manager-documents.jpg` | HR manager reviewing dismissal documents |

All three sit in a `textMedia` block beside prose, at `aspect-ratio: 4/3`, full column width. They
need sourcing and licensing before launch — for a regulated legal service, stock imagery should not
imply the firm's own premises or staff. The `@field: image file="…" alt="…"` markers carry the
intended filename and alt text, so the CMS mapping is ready for them.

Until real photography is supplied, the placeholders will import as empty image fields, not as the
grey hatching — the hatching is design-file decoration and will not appear in production.

### Icons: none needed

There are no icon assets and no inline SVG anywhere in the pages. Every icon-like mark is a text
glyph (`✓`, `→`) styled inline, so there is no icon library to port.

---

## 5. Fonts — still the open blocker

Plus Jakarta Sans is currently loaded from Google Fonts by `<link>` in each page. For production:

1. Self-host the woff2 files (weights 400, 500, 600, 700, 800) under e.g. `/public/fonts/`
2. Declare with `@font-face` and `font-display: swap`
3. `<link rel="preload">` the 400 and 700 files
4. Drop the `fonts.googleapis.com` `<link>` and `preconnect` (also removes a third-party
   request from a page that carries a cookie banner)

Until this is done the site will show a flash of unstyled text and depend on a third party.

## 6. Authoring constructs that are not production code

These are design-file syntax and mean nothing to a Next.js/Vercel build. They must be
re-implemented, not imported:

- `<helmet>` — head content. Move to the framework's metadata API / per-page `<head>`.
- `<dc-import name="SiteHeader">` / `SiteFooter` — replace with real layout components.
- `{{ … }}` holes and `onClick="{{ … }}"` — **the enquiry wizard's interactivity is not exported.**
  The design shows all four steps and their states; the step logic, validation, consent gating and
  submission need building. This is the single largest gap between the design files and a working
  site, and it is where the leads actually come from.
- `<sc-if>` / `<sc-for>` — conditional and repeat logic, to be expressed in the template language.

## 7. Design tokens

Defined as custom properties in `:root` at the top of `styles.css` — reference the variables rather
than re-typing hex values.

| Token | Value | Use |
|---|---|---|
| `--ink` | `#1A1F26` | headings, dark sections |
| `--body` | `#3A414C` | body copy |
| `--muted` | `#5B6472` | secondary copy |
| `--muted-light` | `#6B7482` | labels, meta |
| `--on-dark-muted` | `#B9C1CC` | body copy on ink |
| `--primary` | `#1E4FD8` | links, primary CTA, focus ring |
| `--primary-hover` | `#1740B8` | CTA hover |
| `--accent` | `#2CC5B6` | eyebrow text, ticks, dark-section focus ring |
| `--border` | `#D3D8DF` | inputs, cards |
| `--rule` | `#EEF1F4` | hairlines, progress track |
| `--surface` | `#F7F8FA` | page background |
| `--white` | `#FFFFFF` | cards |
| `--container` | `1180px` | content max-width |
| `--gutter` / `--gutter-sm` | `24px` / `20px` | side padding, desktop / phone |
| `--tap` | `44px` | minimum touch target |
| `--bp-header` | `919px` | nav collapse breakpoint |

The hex values are still written inline on individual elements (colour per element was not part of
this refactor). Swapping a brand colour therefore means a find-and-replace across the pages, not a
one-line token edit — worth doing if the palette is likely to change.

---

## 8. Pre-launch checks

- [ ] Logos moved off `uploads/` to a real static path; favicon set generated
- [ ] Three photographs sourced, licensed and placed (§4)
- [ ] `class` attributes preserved through the import — section padding now depends on them (§3)
- [ ] Mobile layout verified after import
- [ ] Fonts self-hosted, Google Fonts link removed
- [ ] Focus rings visible on every link, button and input (keyboard-tab the whole site)
- [ ] Wizard submits and delivers a lead end to end
- [ ] Cookie banner fires before any third-party script
- [ ] `sitemap.xml` regenerated from live URLs; canonicals match final domain
- [ ] Per-page `metaTitle` / `description` present in rendered HTML, not just CMS fields
- [ ] The three copy sign-offs in `BLOCK-HANDOFF.md` §9 cleared
