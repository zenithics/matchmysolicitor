# Design fidelity audit — Pass 2 (styling / components)

Method: every page in `design-export/*.dc.html` rendered locally at 1440px and screenshotted
full-page, against the same route on `https://matchmysolicitor.vercel.app`, then each delta
checked against the live CMS API (`/api/pages?...&depth=0`) so we know whether the cause is
**imported data** or **component/CSS**. Do not "fix" a data problem in a component.

Design tokens are in `design-export/styles.css` (`:root`) and the `<style>` head block of any
`.dc.html`. They are the source of truth for colour, type scale and spacing.

---

## Root causes (fix these first — they explain most of the visible mismatch)

### R1. SiteAppearance was never seeded with the design tokens — **fix first**
`/api/globals/site-appearance` currently returns `headingFont: "Inter"`, `bodyFont: "Inter"`,
`h1Size: "3.5rem"`, `h2Size: "2.5rem"`, `h3Size: "2rem"`.

The design uses:
- font: `Plus Jakarta Sans` (400/500/600/700/800), heading **and** body
- `h1: clamp(28px, 6vw, 46px)`, line-height 1.12, letter-spacing -0.02em
- `h2: clamp(23px, 4vw, 34px)`, line-height 1.2, letter-spacing -0.015em
- `h3: clamp(18px, 2.6vw, 22px)`, line-height 1.35
- `body: clamp(15px, 1.5vw, 16.5px)`

So every heading on the site is currently **10–22px too large** and in the wrong typeface. This is
the single biggest cause of "the sizing looks off everywhere". Colours are already correct
(`#1E4FD8` primary, `#2CC5B6` accent, `#1A1F26` ink, `#F7F8FA` surface).

### R2. No section background tone — everything renders white
The design alternates white and `--surface #F7F8FA` bands (tiles section, how-it-works, textMedia,
features on service pages are all on surface grey). Blocks currently always render white, which
flattens the whole page. Needs a `tone: 'default' | 'surface' | 'ink'` select on the shared block
appearance, defaulted so imported pages alternate correctly. **Schema change — needs a migration.**

### R3. Rich-text bullets render a disc marker *and* the design's "·" character
Design lists use a `·` glyph and no list marker. The importer keeps the `·` in the text and emits a
`<ul>`, so every bullet reads "• · Tribunal claim defence". Strip the leading `·`/`•` and any
following space from list-item text at import time (parser fix, re-import).

---

## Homepage

| # | Issue | Cause | Fix |
|---|---|---|---|
| H1 | Banner: "1 JAN 2027" should be a teal pill badge, then bold lead sentence | component | Style the banner's leading date token as a pill (`background: var(--accent)`, ink text, 4px radius, 11px/700, letter-spacing .06em). **Do not re-add the `badge` schema field — that broke prod in `283b3a5`.** Derive it in the component from the first `<strong>` when it matches a date pattern, or hardcode nothing and add the pill via CSS on `.banner strong:first-child`. |
| H2 | "Two sides of every dispute" tiles wrong: should be **dark ink card (employers) + white card (employees)** on a **grey section**, teal `FOR EMPLOYERS` eyebrows, and **solid buttons** ("Employer services →" primary blue, "Employee services →" ink) | component + R2 | Give Features/tile block a two-up variant with per-card `tone`, an eyebrow line, and button-styled links instead of the current plain blue text links. |
| H3 | "Getting expert help is simple": heading too large (R1), and the **"More about how it works →" link is missing** | R1 + data | Link exists in the design under the 3 steps. Add `linkLabel`/`linkUrl` to the howItWorks import mapping. |
| H4 | "A specialist, not a call centre": text should be **right column with an image left**, on a grey band. Currently full-width text, no image | data (`media: null`) + R2 | textMedia has no media and no `mediaPosition`. Import `mediaPosition: 'left'`, and attach an image — Claude Design ships a placeholder (`photo: professional on phone, workplace`), so this needs a real photo (see "Images" below). |
| H5 | White gap between the dark CTA band and the footer | component | CTA block has trailing margin/padding below the band. Remove it so the CTA sits flush on the footer. |
| H6 | "Why people use MatchMySolicitor" cards render grey-on-white; design is white cards with hairline border on white | component | Card surface/border tokens (`--border #D3D8DF`, `--rule #EEF1F4`). |

## Header

| # | Issue | Cause | Fix |
|---|---|---|---|
| N1 | **"Contact" must come out of the main nav** (it already lives in the footer) | data | Remove from the header seed in `src/app/(frontend)/next/seed-nav/route.ts` and re-run. |
| N2 | Active/hover state turns the item **blue**; design uses ink text with a 2px underline | component | Change the active/hover style to `border-bottom: 2px solid currentColor`, colour stays `--ink`. |
| N3 | Dropdown contents and order differ from the design | data | Re-seed from `design-export/SiteHeader.dc.html` — that file is the authority for both order and the items under For Employers / For Employees. |

## /how-it-works

| # | Issue | Cause | Fix |
|---|---|---|---|
| W1 | Hero is the split `homeHero` with a **big empty grey panel** on the right | data | Design uses a centred dark hero with teal eyebrow "HOW IT WORKS". Import as a centred hero variant, not `homeHero`. |
| W2 | Steps render as the homepage 3-column style with oversized teal numerals ("old pressed-nailzz look") | component | Design is a **vertical timeline**: dark numbered circles down the left, connected by a hairline, on a grey band. Use the `Timeline` block or add a `layout: 'timeline' \| 'columns'` option to HowItWorks. |
| W3 | FAQ renders as unstyled collapsed `▸` accordions | component | Design shows all Q&As open: bold question, body copy under it, generous spacing, no disclosure triangles. |

## /enquiry

Currently a copy of the homepage hero: dark split band with the wizard card on the right, a stray
`✓` artefact, and a large empty area. The design is a light-grey page: centred "Start your free
enquiry" + subheading, a full-width **"About you / Step 1 of 4" progress bar**, then a white card
containing the two choices, then the reassurance line.

**Cause is data, not CSS:** the block is imported as `variant: "inline-hero"`. The `page` variant
already exists in `src/blocks/EnquiryWizard/config.ts`. Set `variant: 'page'` for the `/enquiry`
page in the importer, and check the `page` variant renders the progress bar and centred header.

## /about ("How we vet our panel")

| # | Issue | Cause | Fix |
|---|---|---|---|
| A1 | The **three vetting cards are missing entirely** — "How the panel is vetted" is followed by nothing | data | The layout is `content, banner, content, cta`; the importer flattened the card grid into rich text and dropped it. Parse those three as a features/cards block. |
| A2 | "We are not a law firm" callout is a **full-bleed band**; design is a rounded teal-tinted **card** inside the text column | component | Banner block needs a contained variant (max-width column, 8px radius, `#E9F7F5` background, teal left accent). |
| A3 | Missing breadcrumb ("Home / About us") | data/component | Design has it above the H1 on inner pages. |
| A4 | Prose column is too wide and offset left; design is a ~640px column, left-aligned within a centred container | component | |

## Service pages (/for-employers, /for-employees, /employment-solicitors)

| # | Issue | Cause | Fix |
|---|---|---|---|
| S1 | Feature cards render **4 across**; design is **2 across** with much more padding | component | `Features/Component.tsx` uses `grid-cols-[repeat(auto-fit,minmax(240px,1fr))]`. Add a `columns` field (2/3/4, default 2) — **schema change, needs a migration** — or hardcode 2 for now if we want it live before Monday. |
| S2 | "Interim relief hearings" card: **the whole card body is rendered as a blue link** | component | A link wrapper is swallowing the card content. Only `linkLabel` should be the anchor. |
| S3 | `URGENT` tag has lost its pill styling | component | Small amber/ink pill, 10px/700, uppercase. |
| S4 | "The cost of getting it wrong" textMedia missing its image (design: `photo: HR manager reviewing documents`) | data/media | Same as H4. |
| S5 | Everything below the stats bar is on white; design puts the features grid on the grey surface band | R2 | |

## Images

Claude Design does not generate photography — it ships labelled placeholders. Three are needed:
`professional on phone, workplace` (home), `HR manager reviewing documents` (/for-employers),
and a one-to-one consultation shot (/for-employees). Until real images exist those textMedia
blocks will keep rendering as bare full-width text.

---

## Suggested order of work

1. **R1 SiteAppearance seed** (fonts + type scale) — one seed run, biggest visible win, no schema.
2. **N1/N3 header re-seed**, **R3 bullet strip**, **/enquiry `variant: 'page'`**, **H3 link**,
   **H4/S4 `mediaPosition`**, **A1 vetting cards** — all importer/seed fixes, one re-import.
3. **H5, H1, N2, S2, S3, W2, W3, A2, A4, H6** — component/CSS only, no schema, no migration.
4. **R2 section tone** and **S1 `columns`** — the only two that need new CMS fields, so the only
   two that need a migration. Do these last, deliberately, not before Monday's ads go live.
