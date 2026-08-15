# Claude Design → CMS import

One command turns a Claude Design export into pages, posts, blocks, media and
navigation in the CMS. Verified end to end against a clean database: **50 pages
and posts in under 10 seconds, 0 failures**.

## Run it

The design export and images are **committed to this repo** (`design-export/`
and `design-images/`), so there is nothing to download or unzip.

**Terminal 1** — start the CMS and leave it running (it blocks the terminal):

```bash
pnpm dev
```

**Terminal 2** — run the import:

```bash
pnpm import:design
```

That is the whole flow. Use `pnpm import:design:dry` to preview without writing.

### Environment

The import needs a `.env` containing the usual database keys plus an admin
login. If the repo is linked to Vercel, the quickest way to get the database
keys is:

```bash
vercel env pull .env
```

Then add your CMS admin login to that file:

```
CMS_URL=http://localhost:3000
CMS_EMAIL=you@zenithics.com
CMS_PASSWORD=your-admin-password
```

The script loads `.env` itself — do **not** use `node --env-file`, which hard
fails when the file is missing. Real environment variables always take
precedence, so Codespace and Vercel secrets are never overwritten. Credentials
are read from the environment on purpose and never committed.

If no admin user exists yet, create one at `http://localhost:3000/admin`.

### Flags

Passed through `pnpm import:design -- <flag>`:

| Flag | Effect |
| --- | --- |
| `--dry` | Parse and report only. Writes nothing. |
| `--drafts` | Create pages as drafts instead of published. |
| `--only=a,b` | Restrict to specific slugs, for fixing one page. |

## What it does

1. **Parses** every `*.dc.html` using the block markers Claude Design was
   briefed to emit (`@page`, `@block:`, `@item`, `@field: image`).
2. **Maps** each block to the real CMS block schema — FAQ items, stats, feature
   tiles, how-it-works steps, CTAs with their buttons.
3. **Converts** copy to Lexical rich text, preserving headings and lists.
4. **Uploads** hero and OG images and attaches them, using `image-map.json`
   plus prefix rules for any page added since the map was generated.
5. **Seeds** header navigation, footer columns and SEO defaults, which live in
   globals rather than in the export.
6. **Creates** guide categories, and imports the 16 guides as **drafts** for
   review before publishing.

It is **idempotent** — matched on slug, so re-running after a new design export
updates in place rather than duplicating. Safe to run as many times as needed.

## Things that will bite you

- **Nested slugs.** Payload rejects `/` in a slug, but Claude Design emits
  `guides/category/dismissal`. These are flattened to
  `guides-category-dismissal`, and every link pointing at them is rewritten.
- **Filename ≠ slug.** The footer links to `legal-privacy-policy.dc.html` while
  that page declares `slug="privacy-policy"`. Links are resolved through the
  real declared slugs, otherwise the footer 404s.
- **Duplicate slugs.** Paginated listings (`guides` and `guides-page-2`) declare
  the same slug. The first wins and the later copy is skipped, because the
  `archive` block paginates from the posts collection anyway.
- **Login rate limit.** Repeated runs can trip Payload's login throttle
  ("Too many login attempts"). It is held in memory — restart the dev server to
  clear it, rather than waiting 15 minutes.
- **Images.** The design has very few image slots, so hero photos mostly need
  placing via the page editor. OG images write to `meta.image` and need no slot,
  so they always attach.

## After importing

- Guides are drafts — review and publish when the content is written.
- Policy pages import as empty shells; their content is authored in the CMS.
- Check `/` , `/for-employers` and a location page render before deploying.
