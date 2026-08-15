# MatchMySolicitor — design fidelity audit (2026-08-15)

Method: every `design-export/*.dc.html` screen rendered locally and screenshotted
full-page at 1440px, the same page pulled live from
`https://matchmysolicitor.vercel.app` at the same viewport, then diffed shot by
shot. Every finding below was then confirmed against the CMS data via
`/api/pages?where[slug][equals]=...&depth=0`, so each item says whether it is a
**content/import bug** or a **component/CSS bug**. Pages audited: home,
how-it-works, for-employees, for-employers, employment-solicitors, guides,
about, contact.

## Headline

Most of the visible drift is **not CSS**. The blocks and fields already exist and
are broadly right; the importer wrote the wrong values into them, or dropped
them. Proof from the live API, homepage:

- `enquiryWizard` (hero): `"eyebrow": null`, `"bullets": []` — the fields exist,
  the design has both, the import left them empty.
- `banner`: rich text contains only `"1 JAN 2027"`. The sentence
  "The two-year rule is changing… Check where you stand →" was dropped.
- `features` ("Two sides of every dispute"): each card's `<ul>` was flattened
  into one paragraph joined with `·`, and `&` came through as `&amp;`.
- `howItWorks`: `description` is the body copy of step 1, not the section
  subheading.
- The homepage has **two** `enquiryWizard` blocks — the hero one and a duplicate
  appended after the CTA.

So the fix is two passes: **(1) parser + re-import**, **(2) component/CSS**.
Doing (2) first would bake styling around wrong content.

---

## Pass 1 — parser and re-import (`scripts/import-design.mjs`)

### P1.1 Hero eyebrow and tick list are dropped
Design hero (`index.dc.html`, also for-employees / for-employers /
employment-solicitors) has a teal uppercase eyebrow
("SPECIALIST EMPLOYMENT LAW REFERRALS · UK-WIDE") above the H1, and a three-item
tick list under the body copy (SRA-regulated panel / One firm, not ten / Free,
no-obligation first conversation). Live has neither; `eyebrow` is `null` and
`bullets` is `[]` on every hero.

> **Claude Code prompt**
> In `scripts/import-design.mjs`, the enquiryWizard/hero parser is not mapping
> the design's eyebrow or tick list. In `design-export/index.dc.html` find the
> hero section: the element above the `<h1>` carrying the eyebrow text, and the
> tick `<ul>` below the intro paragraph. Map them onto the `eyebrow` and
> `bullets` fields of the `enquiryWizard` block (check `src/blocks/EnquiryWizard/config.ts`
> for exact field names and the shape of `bullets`). Apply to all four hero
> pages. Add a unit test that parsing `index.dc.html` yields a non-empty
> `eyebrow` and exactly 3 bullets.

### P1.2 Banner copy lost — only the date badge survives
Design: a teal band, `1 JAN 2027` badge, then "**The two-year rule is changing.**
From 1 January 2027 you will be protected from unfair dismissal after six
months' service. Different rules may apply to your situation.
**Check where you stand →**". Live shows the date and nothing else. The badge
field was reverted in commit `283b3a5`, so the badge text and body must both
live inside the banner rich text now.

> **Claude Code prompt**
> The banner import keeps only the first text node. Fix the banner parser in
> `scripts/import-design.mjs` so the whole designed banner — badge text, body
> sentence and trailing link — is converted to Lexical rich text, with the badge
> as bold leading text and the link as a real link node to `/enquiry`. Do not
> re-add the `badge` field: it broke production once (`283b3a5`). Verify by
> re-importing and diffing the rendered banner against
> `design-export/index.dc.html`.

### P1.3 List content flattened, and HTML entities double-escaped
Every `<ul>` inside a card becomes one paragraph with ` · ` separators, so the
"For employers" / "For employees" tiles read as a wall of text. Separately
`&amp;` renders literally ("Settlement disputes &amp; negotiations",
"merits assessments" on /for-employees).

> **Claude Code prompt**
> In the design export parser, `<ul>`/`<ol>` inside card and feature bodies are
> being collapsed into a single paragraph. Convert them into Lexical `list` /
> `listitem` nodes instead, preserving item order. Also decode HTML entities
> once (`&amp;`, `&nbsp;`, `&rsquo;`) when extracting text, so no `&amp;`
> reaches the CMS. Add tests covering a two-item list and an entity-bearing
> title.

### P1.4 Section subheadings receive the wrong source text
`howItWorks.description` on the homepage and /how-it-works is the body copy of
step 1 ("A short, plain-English enquiry form. Two paragraphs is plenty…"), and
the same wrong-source pattern appears under "Why people use MatchMySolicitor"
(it shows card 1's body). In the design those sections have their own subheading
or none at all.

> **Claude Code prompt**
> The section-heading parser is falling back to the first child item's body when
> the designed section has no subheading. Change it to map only the element that
> is a sibling of the section `<h2>` — if there is none, leave `description`
> empty rather than borrowing text from the first card/step. Re-import and check
> the homepage `howItWorks` and second `features` block have no invented
> subheading.

### P1.5 Duplicate enquiry wizard at the foot of the homepage
The homepage layout ends `… cta, enquiryWizard`. The design has one wizard, in
the hero. The trailing block ("Where should your specialist reach you?") is the
wizard's later step markup being parsed as a second section.

> **Claude Code prompt**
> The homepage import emits two `enquiryWizard` blocks: the hero and a duplicate
> built from the wizard's step-2+ markup. Make the parser treat all
> wizard step markup inside one section as a single block, and remove the
> stray block from the homepage in the CMS. Confirm
> `/api/pages?where[slug][equals]=home&depth=0` lists exactly one
> `enquiryWizard`, first in the layout.

### P1.6 Guides listing loses the category filter pills and rendering
Design /guides: a filter pill row (All guides / Dismissal / Exit negotiations /
Tribunal process / Discrimination) then a 3-column card grid, "Page 1 of 2" and
a Next link. Live: a large block of unstyled plain-text guide entries above a
partly-correct card grid, no pills, and the pagination reads "Page 2 of 2" at
the top of page 1.

> **Claude Code prompt**
> On `/guides`, the archive is rendering a raw text list before the card grid and
> the category filter pills are missing entirely. Compare with
> `design-export/guides.dc.html` and `guides-page-2.dc.html`. Render the archive
> as the designed 3-up card grid only (category eyebrow, title, excerpt, "Last
> reviewed" date), add the filter pill row linking to
> `/guides/category/<slug>`, and fix the pagination label so page 1 shows
> "Page 1 of 2". Check `/guides/category/*` routes resolve — they 404 today.

### P1.7 City cards on /employment-solicitors duplicate their own text
Design card: city name, tribunal name, one link. Live card repeats the city and
tribunal name inside the link ("Sheffield Sheffield Employment Tribunal
Employment solicitors in Sheffield"), and the section intro paragraph plus the
"Somewhere else?" note lost their placement.

> **Claude Code prompt**
> The city card parser on `/employment-solicitors` is concatenating the card
> title and body into the link label. Map title, body and link label to separate
> fields per `design-export/employment-solicitors.dc.html`, and restore the
> section intro paragraph above the grid.

---

## Pass 2 — components and styling

### P2.1 Feature tiles do not match the design
Design "Two sides of every dispute": two tiles, the employer tile **dark
(#15202b) with white text and a blue primary button**, the employee tile light
with a dark button; each has a bulleted list; tiles are 50/50 with generous
padding. Live: four-up-style light cards, equal weight, text-link CTAs with a
right-arrow glyph, bullets flattened.

> **Claude Code prompt**
> Give `src/blocks/Features` a `columns` (2 | 3 | 4) and per-item `tone`
> (`light` | `dark`) option, defaulting to today's behaviour. Style the dark tone
> per `design-export/index.dc.html`: background `#15202b`, white heading, muted
> body, teal uppercase eyebrow, primary blue button. Render the item CTA as a
> button (`Employer services →`) not a bare link when a tone is set. Then set
> the homepage "Two sides" block to 2 columns with the first item dark.

### P2.2 Page heroes on inner pages are unstyled
/about, /contact, /guides and /how-it-works in the design open with a styled
hero — /how-it-works and /contact on the dark band with a teal eyebrow and a
large centred H1; /about and /guides on light with a breadcrumb. Live, all four
render as a small left-offset H1 in the body column, and /how-it-works shows a
dark band with a large empty grey panel to its right.

> **Claude Code prompt**
> Inner-page heroes are falling back to plain content. Add/route a page-hero
> variant to `HeroSplit` covering the two designed treatments (dark centred with
> eyebrow; light with breadcrumb) and apply it to /about, /contact, /guides,
> /how-it-works. Match H1 size, weight and tracking from the design export.
> On /how-it-works remove the empty right-hand panel: the designed hero is
> single-column centred.

### P2.3 Section band colours are inverted in places
Live inverts several bands: "Not sure where you stand?" is dark on live, light
card-on-light in the design; "Judge us by the match" on /about is a designed
dark **card inside the content column**, live renders it full-bleed; the
homepage "A specialist, not a call centre" section loses its light-grey band.

> **Claude Code prompt**
> Audit each section's background against the design export and expose the band
> colour as a block field where it differs, rather than hardcoding. Specifically:
> `/employment-solicitors` "Not sure where you stand?" is a light inset card,
> `/about` "Judge us by the match" is a dark rounded card constrained to the
> content column, and the homepage TextMedia section sits on the light-grey band.

### P2.4 TextMedia loses its image, its two-column layout and its CTA
Homepage "A specialist, not a call centre", /for-employees "You don't have to
work out the law" and /for-employers "The cost of getting it wrong" are all
designed as image-left / text-right with a primary button. Live: single column,
no image, the button gone, and the image alt text rendered as literal body copy
("photo: professional on phone, workplace").

> **Claude Code prompt**
> Fix `src/blocks/TextMedia`: restore the two-column image/text layout with the
> `imagePosition` from the design, render the CTA button, and never print the
> image placeholder description as body text — if no media is attached, render
> nothing. The importer should also stop writing "photo: …" placeholder strings
> into the rich text. Three sections are affected: home, /for-employees,
> /for-employers.

### P2.5 Content column width and alignment on text pages
/about and /contact live render the body copy in a narrow column offset to the
left with a large empty right margin, and the H1 is body-sized. Design uses a
centred content column with a clear type scale.

> **Claude Code prompt**
> On `/about` and `/contact` the Content block column is left-offset and the H1 is
> not using the page-title scale. Constrain the prose column to the designed
> width, centre it in the 1180px container, and apply the designed heading
> scale. Compare against `design-export/about.dc.html` and `contact.dc.html`.

### P2.6 About page callout and vetting cards lost their titles/structure
Design: a teal callout titled "**We are not a law firm**", then three bordered
cards under "How the panel is vetted". Live: the callout has no title, and the
three cards are missing.

> **Claude Code prompt**
> Restore the /about callout heading ("We are not a law firm") and the three
> "How the panel is vetted" cards from `design-export/about.dc.html` — check
> whether the import dropped them before changing the component.

### P2.7 Contact page email card
Design: a bordered card with an "EMAIL" eyebrow, the address as a large link and
a supporting line. Live: plain text "Email" / paragraph.

> **Claude Code prompt**
> Rebuild the /contact "Other ways to reach us" card per the design export:
> bordered card, teal uppercase eyebrow, `hello@matchmysolicitor.co.uk` as a
> prominent mailto link, supporting sentence beneath.

### P2.8 Header nav does not match
Design order: For Employers ▾ · For Employees ▾ · Guides · How It Works, all
left-grouped next to the logo, with the "Check your claim →" button right. Live
splits the nav (Guides sits left, How It Works and Contact float right) and adds
a Contact item that is not in the designed header.

> **Claude Code prompt**
> Align the header nav with `design-export/SiteHeader.dc.html`: single left-aligned
> group in the designed order, dropdown carets on the two service items, no
> Contact item, CTA button on the right at every breakpoint.

### P2.9 Footer legal links still 404 (already known, still live)
Footer points at `/legal/privacy-policy`, `/legal/terms-of-use`,
`/legal/cookie-policy`, `/legal/complaints`. Only `/privacy-policy` exists.

> **Claude Code prompt**
> Create the four legal pages at the `/legal/...` paths the footer and the design
> export use (`design-export/legal-*.dc.html` hold the copy), or add permanent
> redirects in `redirects.ts` from `/legal/*` to the existing routes and fix the
> footer global. The four links must return 200 before ads go live.

### P2.10 Missing imagery
Claude Design does not generate photography, so every image slot is a
placeholder. Affected: homepage TextMedia, /for-employees, /for-employers, plus
OG images. Not a code bug — needs three or four generated/licensed photos
(professional on phone; one-to-one consultation; HR manager reviewing documents)
uploaded to Media and attached.

---

## Verification (run after every phase)

1. `pnpm build` clean.
2. `curl -s "$SITE/api/pages?where[slug][equals]=home&depth=0"` — layout is
   `enquiryWizard, banner, stats, features, howItWorks, textMedia, features, cta`
   with no trailing wizard, hero `eyebrow` non-null, hero `bullets` length 3.
3. All footer legal links return 200, all `/guides/category/*` return 200.
4. Re-run the screenshot diff at 1440px on the eight audited pages before
   calling it done.
