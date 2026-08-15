# Brief for Claude Code: pulling the styling through

Paste §1 to Claude Code as the opening instruction, then let it read the files listed in §2.

---

## 1. Paste this

> This project contains a completed 51-page design for MatchMySolicitor, a UK employment-law
> solicitor matching service, authored as HTML design files (`*.dc.html`). I need it rebuilt as a
> production site. The design files are **references, not production code** — recreate them in the
> target framework rather than shipping them.
>
> **Read `EXPORT-NOTES.md` first.** It documents exactly which layers of the design a
> block/content import does and does not carry, and it is the reason the styling is currently
> missing. Then read `BLOCK-HANDOFF.md` for the page and block inventory.
>
> The styling lives in three places and **all three** must be carried across:
>
> 1. **`styles.css`** — the global stylesheet: design tokens as CSS custom properties, fluid type,
>    focus states, hover states, the `.sp-*` section-padding classes, `.grid-*`, `.card-40`, header
>    and footer layout, and the enquiry-wizard modal. Ship this file in the repo as the global
>    stylesheet. It is not page content — no CMS import will produce it.
> 2. **Inline `style="…"` attributes** on individual elements — this is the bulk of the visual design
>    (colours, type sizes, flex/grid layout, gaps, radii). Preserve these when converting each page
>    to a component, or lift them into the framework's styling layer. Do not drop them.
> 3. **Per-page `<head>` content**, held inside each file's `<helmet>` block — `<title>`,
>    `meta name="description"`, `<link rel="canonical">`, and the font links.
>
> Critical: `class` attributes must survive the conversion. 150 section wrappers depend on `.sp-*`
> classes for their padding at both desktop and phone widths. If classes are stripped, every page
> loses its vertical rhythm.
>
> Before writing code, tell me which framework you plan to use and how you intend to handle the
> inline styles, and wait for my confirmation.

---

## 2. Files to point it at

**Read these first, in this order**

| File | Why |
|---|---|
| `EXPORT-NOTES.md` | The import gap, the CSS layers, fonts, deploy checklist |
| `BLOCK-HANDOFF.md` | All 51 pages, their slugs, meta titles and block stacks |
| `styles.css` | The whole global design layer — tokens, classes, breakpoints |

**Reference pages** — read these four and the rest follow the same patterns:

| File | Represents |
|---|---|
| `index.dc.html` | Homepage; also the only page with the full enquiry wizard markup |
| `for-employees-unfair-dismissal.dc.html` | The service-page template — twelve pages share it |
| `employment-solicitors-manchester.dc.html` | The location template — five pages share it |
| `guides-what-is-unfair-dismissal.dc.html` | The guide/post template — sixteen pages share it |

**Shared partials** — build these as layout components, not per page:

- `SiteHeader.dc.html` — sticky header, CSS-only nav, mobile drawer, persistent CTA
- `SiteFooter.dc.html` — five-column footer grid

**Ship as-is, not page content**

- `styles.css`
- `cookie-banner.js`
- `site-config.js`
- `robots.txt`
- `sitemap.xml`
- `uploads/matchmysolicitor-horizontal.svg` and `matchmysolicitor-reversed.svg` — the header and
  footer logos. Move them off `uploads/` to a real static path and update both `src` attributes.
  `matchmysolicitor-icon.svg` is there for the favicon set.

**Do not ship** — `support.js` is the design-file runtime, not production code.
`MatchMySolicitor Brand Guidelines.pdf` is reference only.

---

## 3. Design-file syntax it will need to translate

These are authoring constructs and mean nothing at runtime:

| In the design files | Becomes |
|---|---|
| `<helmet>…</helmet>` | The framework's head/metadata API |
| `<dc-import name="SiteHeader">` | A real layout component |
| `{{ someValue }}` | A prop or variable |
| `onClick="{{ handler }}"` | A real event handler |
| `<sc-if value="{{ x }}">` | A conditional |
| `<sc-for list="{{ items }}" as="item">` | A `.map()` / loop |
| `style-hover="…"` | Already converted to real CSS in `styles.css` |
| `<!-- @block … @item … @field … -->` | CMS field mapping — see `BLOCK-HANDOFF.md` |

---

## 4. Three things to flag explicitly

**The enquiry wizard has no logic.** `index.dc.html` shows all four steps and every visual state,
but the step progression, validation, consent gating and submission do not exist. This is the
site's only conversion path, so it needs building, not converting. Tell Claude Code to treat it as
a feature to implement rather than a page to port.

**Photography does not exist.** Three images are named and alt-texted in the design
(`index`, `for-employees`, `for-employers`) but no files were ever supplied — those positions render
a grey hatched placeholder. See `EXPORT-NOTES.md` §4. Claude Code should wire the image fields and
leave them empty rather than substitute its own stock images.

**Fonts are unresolved.** Plus Jakarta Sans currently loads from Google Fonts by `<link>` in every
page head. For production it must be self-hosted (weights 400/500/600/700/800, woff2,
`font-display: swap`, preload 400 and 700) and the `fonts.googleapis.com` links removed — the site
carries a cookie banner, so a third-party font request is also a consent problem.

---

## 5. Watch for

Hover and focus rules in `styles.css` carry `!important` because the elements set their resting
`background` / `color` / `border-color` inline, and inline styles outrank classes. If Claude Code
moves the resting styles into classes, it should remove the `!important` in the same pass — and if
it "tidies up" the `!important` without moving the resting styles, every hover state silently stops
working.
