# Zenithics CMS Template

A production-ready website template built on **Payload CMS 3**, **Next.js**, and **Vercel**.

## Features

- 🎨 25+ page-builder blocks (drag & drop in admin)
- 🛒 Ecommerce add-on (products, events, cart, Stripe checkout)
- 🌐 Multi-site add-on (multi-tenant with per-site content & navigation)
- 🔍 Advanced SEO (JSON-LD, sitemaps, analytics, ad pixels)
- 👥 User roles (Admin, Editor, Viewer)
- 📝 Content versioning & drafts
- 🖼️ Live preview & visual editing
- 📄 Page templates system
- 📊 Activity logging
- 🎯 CMS branding (white-label admin panel)
- 🍪 Cookie consent & GDPR
- 📧 Transactional email templates
- 🔒 Password security & 2FA-ready

## One-Command Deployment

The fastest way to deploy a new site:

```bash
bash scripts/deploy-new-site.sh
```

This creates a GitHub repo, Neon database, Vercel project, blob storage, and triggers the first deployment — all in one go. Optionally adds the ecommerce and/or multi-site add-ons.

**Required credentials** (set as Codespace secrets or in `~/.env.deploy`):
- `GH_DEPLOY_TOKEN` — GitHub Classic PAT with `repo` scope
- `NEON_API_KEY` — Neon API key
- `NEON_ORG_ID` — Neon organisation ID
- `VERCEL_TOKEN` — Vercel API token
- `VERCEL_TEAM_ID` — Vercel team ID

Do **not** `curl` the script from `raw.githubusercontent.com` — this repo is private, so raw URLs
404 with no auth and the shell reports a confusing "No such file or directory". Run it from a clone,
or fetch it with
`gh api repos/zenithics/zenithics-starter/contents/scripts/deploy-new-site.sh -H "Accept: application/vnd.github.raw"`.

### Deployment gotchas the script now handles for you

These each cost a day on a real client build. They are automated, but worth knowing when a
deploy misbehaves:

- **Two different Neon connection strings, deliberately.** `POSTGRES_URL` (used by the Payload
  adapter at runtime) points at Neon's **pooled** `-pooler` endpoint; `DATABASE_URI` (used by
  `scripts/setup-db.mjs` for migrations) points at the **direct** endpoint. If both are direct,
  serverless concurrency exhausts Neon's connection limit and you get
  `Couldn't connect to compute node` — intermittent 500s on *different* pages each request, plus
  occasional build failures. It looks like corrupt data; it isn't. Never unify these two vars.
- **The Vercel Blob store must be Public.** Payload's `vercelBlobStorage` plugin uploads with
  `access: 'public'`, so a private store makes every `POST /api/media` return a bare
  `{"errors":[{"message":"Something went wrong."}]}` 500 — even for a 1×1 PNG, so it reads as an
  image-processing bug. **Access mode cannot be changed after creation**, so the script verifies it
  and tells you how to recreate the store if it came out private.
- **A media record can exist with no file behind it.** If an image slot is empty, request
  `/api/media/file/{filename}` directly before debugging the component — the database row can look
  perfect while the blob object is missing (typically an upload made while the store was private).
- **Site Appearance in the database overrides `globals.css`.** After a deploy, open `/admin` and save
  the Site Appearance global once, or the theme will not appear.

## Manual Setup

1. Clone this repo
2. Copy `.env.example` to `.env` and fill in your values
3. `pnpm install`
4. `pnpm dev`
5. Visit `http://localhost:3000/admin` to set up your first user

## Add-ons

| Add-on | Repo | What it adds |
|--------|------|-------------|
| **Ecommerce** | [zenithics-ecom-addon](https://github.com/zenithics/zenithics-ecom-addon) | Products, events, Stripe checkout, orders, reviews, discount codes |
| **Multi-site** | [zenithics-multisite-addon](https://github.com/zenithics/zenithics-multisite-addon) | Multi-tenant sites, per-tenant content, custom domains, region selector |

Both can be applied automatically via the deploy script or manually following their `INSTALL.md`.

## Documentation

- `CLAUDE.md` — AI development instructions
- `CLAUDE-DESIGN.md` — Frontend design guide for Claude Code
- `CLAUDE-ECOMMERCE.md` — Ecommerce-specific AI instructions (after ecom add-on)
- Deployment gotchas — see the One-Command Deployment section above

## Tech Stack

- [Next.js](https://nextjs.org) — React framework
- [Payload CMS](https://payloadcms.com) — Headless CMS (built-in)
- [Tailwind CSS](https://tailwindcss.com) — Styling
- [Vercel](https://vercel.com) — Hosting
- [Neon](https://neon.tech) — Serverless Postgres

---

Built by [Zenithics](https://zenithics.com)
