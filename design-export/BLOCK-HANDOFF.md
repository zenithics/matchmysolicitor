# MatchMySolicitor: block-marker handoff manifest

Final pass (revision 4), 2026-08-14. **51 screens** plus two partials
(`SiteHeader`, `SiteFooter`). Audited clean: every screen has `@page` front matter with `slug`,
`title`, `metaTitle`, `description`, `collection` and `template`; every `<section>` sits inside a
`@block:` marker; `@item` and `@field: image` markers balanced; no block type outside the permitted
list (23 starter blocks plus `enquiryWizard` and `textMedia`).

## 1. What changed in this pass

- **Contact page rebuilt** around `enquiryWizard variant="page"` under a short hero, with an
  expectation-setting line ("we'll pass your details to one specialist firm, and they contact you
  directly") and an "Other ways to reach us" `content` block carrying **email only**.
  The telephone number is deleted from the site: no `tel:` link or number remains anywhere.
- **Unmarked sections fixed**: `contact` (rebuilt) and `404` (marker now wraps the `<section>`
  rather than sitting inside it). Nothing on any page now falls outside a block.
- **Homepage duplication removed**: the second social-proof trio (`features columns="3"`) is gone;
  the `stats` strip is the single proof element.
- **Corrected proof strip on all 24 pages that carry it** — the "free" claim is now precise:
  SRA / Regulated solicitors only · 24h / Typical time to first contact ·
  **Free / Initial consultation — your solicitor quotes before any work begins** · UK / Nationwide panel coverage.
- **Compensation cap corrected**, all instances: **£123,543, or 52 weeks' gross pay if lower**
  (Employment Rights (Increase of Limits) Order 2026, S.I. 2026/310, in force 6 April 2026;
  s.124(1ZA)(a) ERA 1996). Every `£115,000` is gone.
- **Employer hook strengthened** on all six employer service pages and the employer overview:
  "Today an unfair dismissal award is capped at £123,543 or 52 weeks' pay. From January 2027 that cap
  is removed entirely, and discrimination awards are already uncapped."
- **Two further employer pages**: `for-employers-redundancy-restructuring` and
  `for-employers-disciplinary-grievance`. The employer overview grid is now **six tiles, all linked**,
  and both pages are in the header dropdown and the mobile drawer.
- **Policy pages emptied to a single `content` block** with a `[CONTENT SUPPLIED VIA CMS]` placeholder,
  keeping `@page` front matter and slug so they import correctly. No body copy was written.
- **Hand-written JSON-LD removed site-wide** (38 files: Organization, BreadcrumbList, FAQPage, Article)
  so the CMS-generated schema is not duplicated.
- **Meta descriptions and titles added to all 51 screens**: unique, 148–162 characters,
  situation-first, keyword included, ending on the offer. `metaTitle` leads with the keyword where the
  H1 is written for a human ("Dismissed without a fair process?" vs "Unfair Dismissal Solicitors …").

## 2. Responsive checks requested

- **Sticky header CTA** is outside the burger at all widths and now carries `min-height: 44px`
  (`.nav-cta` in `styles.css`, with a matching rule for `.nav-mobile-toggle`), verified at 375px.
- **Hero wizard** stacks below the copy on narrow viewports (`repeat(auto-fit, minmax(330px, 1fr))`),
  and the two option cards are full-width stacked blocks that wrap their labels rather than truncating.
- No other responsive work was touched, as instructed.

## 3. Service pages — twelve, one identical stack

```
enquiryWizard (inline-hero) → [banner: 1 Jan 2027, dismissal pages only] → stats (proof strip)
→ content → cta ("Check where you stand") → banner (time limit) → stats (framework)
→ content → cta ("Speak to a specialist") → faq → archive ("Understand your position")
→ cta ("Get matched, free")
```

| Screen | presetSituation | Words |
|---|---|---|
| `for-employees-unfair-dismissal` | `Unfair dismissal` | ~890 |
| `for-employees-constructive-dismissal` | `Constructive dismissal` | ~872 |
| `for-employees-discrimination` | `Discrimination` | ~887 |
| `for-employees-settlement-agreements` | `Settlement agreement` | ~817 |
| `for-employees-employment-tribunal-claims` | `Employment tribunal claim` | ~851 |
| `for-employees-senior-exits` | `Settlement agreement` | ~790 |
| `for-employers-tribunal-defence` | `Tribunal defence` | ~1261 |
| `for-employers-settlement-agreements` | `Settlement agreement` | ~707 |
| `for-employers-constructive-dismissal-defence` | `Constructive dismissal defence` | ~1336 |
| `for-employers-interim-relief-hearings` | `Interim relief hearing` | ~1234 |
| `for-employers-redundancy-restructuring` | `Redundancy or restructuring` | ~1268 |
| `for-employers-disciplinary-grievance` | `Disciplinary or grievance` | ~1251 |

## 4. Location pages

Same template, no breadcrumb, five-question FAQ each, generated-from-data ready
(city, intro, prose, tribunal name/address/blurb, FAQs, CTA headings).

- `employment-solicitors`: enquiryWizard (inline-hero) → stats → content → features → cta → content → faq → cta
- `employment-solicitors-manchester`: enquiryWizard (inline-hero) → stats → content → cta → banner → content → cta → faq → cta
- `employment-solicitors-leeds`: enquiryWizard (inline-hero) → stats → content → cta → banner → content → cta → faq → cta
- `employment-solicitors-nottingham`: enquiryWizard (inline-hero) → stats → content → cta → banner → content → cta → faq → cta
- `employment-solicitors-sheffield`: enquiryWizard (inline-hero) → stats → content → cta → banner → content → cta → faq → cta

## 5. Other pages

| Screen | slug | metaTitle | Block stack |
|---|---|---|---|
| `404` | `404` | Page Not Found | MatchMySolicitor | content |
| `about` | `about` | About MatchMySolicitor | Vetted Employment Law Panel | content → banner → content → cta |
| `contact` | `contact` | Contact MatchMySolicitor | Employment Law Referrals | content → enquiryWizard (page) → content → cta |
| `enquiry` | `enquiry` | Free Employment Law Enquiry | Matched in 24 Hours | enquiryWizard (page) |
| `for-employees` | `for-employees` | Employment Solicitors for Employees | Free Consultation | enquiryWizard (inline-hero) → banner → stats → banner → features → textMedia → cta |
| `for-employers` | `for-employers` | Employment Law Solicitors for Employers | Tribunal Defence | enquiryWizard (inline-hero) → banner → stats → features → textMedia → cta |
| `guides-category-discrimination` | `guides/category/discrimination` | Discrimination Guides | Equality Act Explained | content → archive → cta |
| `guides-category-dismissal` | `guides/category/dismissal` | Dismissal Guides | Unfair and Constructive Dismissal | content → archive → cta |
| `guides-category-exit-negotiations` | `guides/category/exit-negotiations` | Exit Negotiation Guides | Settlement Agreements | content → archive → cta |
| `guides-category-tribunal-process` | `guides/category/tribunal-process` | Employment Tribunal Guides | Process and Timescales | content → archive → cta |
| `guides-page-2` | `guides` | Employment Law Guides, Page 2 | MatchMySolicitor | content → archive → cta |
| `guides` | `guides` | Employment Law Guides | Plain-English Explainers | content → archive → cta |
| `how-it-works` | `how-it-works` | How MatchMySolicitor Works | Matched in 24 Hours | homeHero → howItWorks → faq → cta |
| `index` | `home` | Employment Law Solicitors, Matched in 24 Hours | MatchMySolicitor | enquiryWizard (inline-hero) → banner → stats → features → howItWorks → textMedia → features → cta → enquiryWizard (modal) |
| `legal-complaints` | `complaints` | Complaints | MatchMySolicitor | content |
| `legal-cookie-policy` | `cookie-policy` | Cookie Policy | MatchMySolicitor | content |
| `legal-privacy-policy` | `privacy-policy` | Privacy Policy | MatchMySolicitor | content |
| `legal-terms-of-use` | `terms-of-use` | Terms of Use | MatchMySolicitor | content |

## 6. Posts collection (16 guides)

Unchanged by instruction: breadcrumbs kept, `[CONTENT TO BE SUPPLIED]` bodies kept, `template="post"`,
`category` set. Stack: `content` → `cta` → `banner` → `archive` → `cta`.

| Screen | slug | metaTitle | Block stack |
|---|---|---|---|
| `guides-acas-early-conciliation` | `acas-early-conciliation` | ACAS Early Conciliation Explained | Time Limits | content → cta → banner → archive → cta |
| `guides-age-discrimination` | `age-discrimination` | Age Discrimination at Work | When You Can Claim | content → cta → banner → archive → cta |
| `guides-disability-discrimination` | `disability-discrimination` | Disability Discrimination at Work | Your Rights | content → cta → banner → archive → cta |
| `guides-employment-rights-act-1996` | `employment-rights-act-1996` | Employment Rights Act 1996 Explained | Key Rights | content → cta → banner → archive → cta |
| `guides-garden-leave` | `garden-leave` | Garden Leave Explained | Pay, Notice and Covenants | content → cta → banner → archive → cta |
| `guides-how-long-tribunal` | `how-long-tribunal` | How Long Does an Employment Tribunal Take? | content → cta → banner → archive → cta |
| `guides-need-solicitor-tribunal` | `need-solicitor-tribunal` | Do I Need a Solicitor for an Employment Tribunal? | content → cta → banner → archive → cta |
| `guides-offered-settlement-agreement` | `offered-settlement-agreement` | Offered a Settlement Agreement? What to Check First | content → cta → banner → archive → cta |
| `guides-pregnancy-maternity-discrimination` | `pregnancy-maternity-discrimination` | Pregnancy and Maternity Discrimination | Your Rights | content → cta → banner → archive → cta |
| `guides-protected-conversations` | `protected-conversations` | Protected Conversations at Work | Section 111A Explained | content → cta → banner → archive → cta |
| `guides-race-discrimination` | `race-discrimination` | Race Discrimination at Work | Evidence and Claims | content → cta → banner → archive → cta |
| `guides-sacked-without-warning` | `sacked-without-warning` | Can You Be Sacked Without Warning? Your Rights | content → cta → banner → archive → cta |
| `guides-tribunal-process` | `tribunal-process` | Employment Tribunal Process Explained, Stage by Stage | content → cta → banner → archive → cta |
| `guides-what-is-constructive-dismissal` | `what-is-constructive-dismissal` | What Is Constructive Dismissal? Signs and Legal Test | content → cta → banner → archive → cta |
| `guides-what-is-unfair-dismissal` | `what-is-unfair-dismissal` | What Is Unfair Dismissal? Plain-English Guide | content → cta → banner → archive → cta |
| `guides-without-prejudice` | `without-prejudice` | Without Prejudice Explained | Settlement Discussions | content → cta → banner → archive → cta |

## 7. Not pages

`guides` (posts archive, limit 12) · `guides-page-2` (pagination state, not a page document) ·
`guides-category-*` ×4 (category archive routes: dismissal, discrimination, exit-negotiations,
tribunal-process) · `SiteHeader` / `SiteFooter` (partials, no `@page`).

## 8. The enquiry wizard

| Where | Variant |
|---|---|
| `index` hero (copy left, form right, stacked on mobile) | `inline-hero` |
| `index` overlay: steps 2–4, modal on desktop, full-screen sheet under 640px | `modal` |
| 12 service pages (with `presetSituation`) | `inline-hero` |
| `for-employees`, `for-employers`, 5 location pages | `inline-hero` |
| `enquiry`, `contact` | `page` |

Consent checkbox on the final step is a hard requirement: submit is disabled (attribute, not just
colour) until it is ticked. No form logic was authored beyond displaying the states.

## 9. Legal and factual copy — sign-off items

1. **1 Jan 2027 change banner** (Employment Rights Act 2025 s.25): qualifying period two years → six
   months, not a day-one right; compensatory cap removed; employees at six months' service protected
   immediately, others on reaching six months; discrimination and automatically unfair dismissal remain
   day-one rights. Employer wording on employer pages, employee wording on `index`, `for-employees`
   and the two employee dismissal pages.
2. **Copy with an expiry date.** "Two years" remains correct until 1 January 2027 on
   `for-employees-unfair-dismissal`, `for-employees-constructive-dismissal`,
   `for-employees-discrimination` (FAQ) and the enquiry form's tenure bands. Diarise a Q4 2026 review.
3. **24-hour matching claim** appears in the proof strip and throughout the CTA copy. It needs to be a
   commitment that can be held operationally.
4. No firm counts, success rates, compensation averages, star ratings, review counts or named case
   studies anywhere. Statutory figures used: £123,543 cap, 25% ACAS uplift, 3 months less one day,
   28-day ET3, 7-day interim relief window, 90-day protective award, 30/45-day collective consultation.

## 10. Image manifest

| Screen | Filename | Alt |
|---|---|---|
| `for-employees` | `for-employees-one-to-one-consultation-calm-setting.jpg` | One-to-one consultation, calm setting |
| `for-employers` | `employers-hr-manager-documents.jpg` | HR manager reviewing dismissal documents |
| `index` | `home-professional-on-phone-workplace.jpg` | Professional on phone, workplace |

## 11. Open items for the build

1. **Font**: Plus Jakarta Sans must be self-hosted with `font-display: swap` (files unavailable here).
2. **Policy copy**: four legal pages are deliberately empty, awaiting CMS content.
3. **Guide copy**: 16 draft posts awaiting body copy; the on-page TOC generates from body headings.
4. **Sign-off items** in section 9, in particular the 24-hour claim and the Q4 2026 copy review.
5. **Clean URLs**: filenames are `*.dc.html`; the `slug` in each `@page` marker is the intended route.
