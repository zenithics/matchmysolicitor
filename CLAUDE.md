# Zenithics Website Starter - Claude Code Instructions

## Project Overview
This is the Zenithics agency starter template for building client websites. It uses **Next.js** with **Payload CMS** (headless, built-in) and deploys to **Vercel** with **Neon** Postgres.

Clients can edit their own content (text, images, blog posts) via the admin panel at `/admin`. Structural changes and new features are done by developers.

## Tech Stack
- **Framework:** Next.js (App Router, React Server Components)
- **CMS:** Payload CMS 3.x (lives inside the Next.js app)
- **Styling:** Tailwind CSS v4
- **Database:** Vercel Postgres / Neon (serverless Postgres)
- **Storage:** Vercel Blob (for media uploads)
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm

## Project Structure

```
src/
├── app/
│   ├── (frontend)/          # Client-facing pages
│   │   ├── [slug]/page.tsx  # Dynamic pages from CMS
│   │   ├── posts/           # Blog post pages
│   │   ├── layout.tsx       # Frontend layout (Header + Footer)
│   │   └── globals.css      # Global styles + Tailwind
│   └── (payload)/           # CMS admin panel (auto-generated)
│       ├── admin/           # Admin UI
│       └── api/             # REST + GraphQL API
├── blocks/                  # Page builder blocks (Lego pieces)
│   ├── CallToAction/        # CTA sections
│   ├── Content/             # Rich text content
│   ├── FAQ/                 # Accordion FAQ
│   ├── Features/            # Feature grid (2/3/4 columns)
│   ├── Form/                # Contact forms
│   ├── LogoCarousel/        # Client logo strip
│   ├── MediaBlock/          # Image/video sections
│   ├── Pricing/             # Pricing tables
│   ├── Stats/               # Number statistics
│   ├── Testimonials/        # Customer reviews
│   └── RenderBlocks.tsx     # Block renderer (maps blocks to components)
├── collections/             # CMS content types
│   ├── Pages/               # Website pages
│   ├── Posts/               # Blog posts
│   ├── Media.ts             # Uploaded images/files
│   ├── Categories.ts        # Blog categories
│   └── Users/               # Admin users
├── components/              # Shared React components
│   ├── ui/                  # Base UI primitives (button, card, input, etc.)
│   ├── Media/               # Image/video rendering
│   ├── Link/                # CMS-managed links
│   └── RichText/            # Rich text renderer
├── heros/                   # Hero section variants (High/Medium/Low impact)
├── Header/                  # Site header (CMS-managed nav)
├── Footer/                  # Site footer (CMS-managed links)
├── fields/                  # Reusable Payload field configs
├── providers/               # React context providers (theme, etc.)
└── utilities/               # Helper functions
```

## Key Concepts

### Blocks (Page Builder)
Blocks are the building blocks of pages. Each block has:
- `config.ts` - Payload field schema (what the client can edit in the CMS)
- `Component.tsx` - React component (how it renders on the frontend)

When creating a new block:
1. Create a folder in `src/blocks/{BlockName}/`
2. Add `config.ts` with the Payload Block schema
3. Add `Component.tsx` with the React component
4. Register the config in `src/collections/Pages/index.ts` (add to the `blocks` array)
5. Register the component in `src/blocks/RenderBlocks.tsx`

### Collections (Content Types)
Collections define what content types exist in the CMS. Each collection maps to a database table.

### Globals (Header/Footer)
Globals are singleton content types. The Header and Footer are globals that the client edits once and they appear on every page.

### Heroes
Hero sections are handled separately from blocks. Each page has a hero type selector (none/highImpact/mediumImpact/lowImpact). Hero variants live in `src/heros/`.

## Coding Conventions

### TypeScript
- Always use TypeScript with proper types
- Import types from `@/payload-types` for CMS data shapes
- Use `import type` for type-only imports

### Component Patterns
```tsx
// Always import the generated type
import type { MyBlock as MyBlockProps } from '@/payload-types'

// Functional component with explicit props type
export const MyBlock: React.FC<MyBlockProps> = ({ field1, field2 }) => {
  return (
    <div className="container">
      {/* Use container class for consistent max-width */}
    </div>
  )
}
```

### Styling
- Use Tailwind CSS utility classes exclusively
- Use the `container` class for page-width content
- Follow the existing color token system: `bg-card`, `text-muted-foreground`, `border-border`, etc.
- Support dark mode via the theme provider (already configured)
- Use responsive prefixes: `md:` for tablet, `lg:` for desktop

### Payload Fields
- Use `richText` with lexical editor for any formatted text
- Use `upload` with `relationTo: 'media'` for images
- Use `linkGroup` from `@/fields/linkGroup` for CTA buttons
- Use `array` for repeatable items (testimonials, features, etc.)
- Keep field names in camelCase

### Media Handling
- Always check if media is populated: `typeof media === 'object'`
- Use the `<Media>` component from `@/components/Media`
- Add proper `imgClassName` for sizing (e.g., `object-cover`)

### File Naming
- Components: PascalCase (`Component.tsx`)
- Configs: camelCase (`config.ts`)
- Utilities: camelCase (`formatDateTime.ts`)
- Blocks folder: PascalCase (`Testimonials/`, `FAQ/`)

## Common Tasks

### Add a new block
```bash
# 1. Create config and component files
# 2. Import and add to Pages collection blocks array
# 3. Import and add to RenderBlocks.tsx blockComponents map
# 4. Run type generation: pnpm generate:types
```

### Add a new collection
```bash
# 1. Create collection config in src/collections/
# 2. Import and add to payload.config.ts collections array
# 3. Run type generation: pnpm generate:types
# 4. Create migration: pnpm payload migrate:create
```

### Add a new page route
```bash
# Add to src/app/(frontend)/{route}/page.tsx
# Use getDocument() or getPayload() to fetch CMS data
```

### Working with the CMS API
```tsx
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const pages = await payload.find({ collection: 'pages' })
```

## SEO
- Every page has an SEO tab with meta title, description, and OG image
- The SEO plugin auto-generates suggestions
- Sitemaps are auto-generated at `/pages-sitemap.xml` and `/posts-sitemap.xml`
- Redirects are managed via the redirects plugin

## Deployment
- Hosted on Vercel with automatic deployments from GitHub
- Every push to `main` deploys to production
- Every PR gets a preview URL for client review
- Environment variables are managed in the Vercel dashboard

## Client CMS Guide
When handing off to a client, they can:
- ✅ Edit page text and images via `/admin`
- ✅ Add/edit/delete blog posts
- ✅ Rearrange page blocks
- ✅ Update navigation menus
- ✅ Manage form submissions
- ✅ Upload media
- ❌ Cannot change page structure or add new page types (developer task)
- ❌ Cannot modify block layouts or create new blocks (developer task)

## Add-ons

This starter template has optional add-ons that extend its capabilities:

### Ecommerce Add-on (`zenithics-ecom-addon`)
Adds products, categories, cart, checkout (Stripe), orders, and customers. See the ecom addon's INSTALL.md.

### Multi-Site Add-on (`zenithics-multisite-addon`)
Adds multi-tenant/multi-site support — one CMS powering multiple regional or brand sites with per-site content, navigation, and branding. Uses Payload CMS's official `@payloadcms/plugin-multi-tenant` plugin. See the multi-site addon's INSTALL.md or `MULTISITE-INSTALL.md` if already copied in.

Key concepts when multi-site is active:
- **Tenants** — each site is a tenant with its own slug, locale, domain, and branding
- **Path-prefix routing** — sites live under `/en-gb/`, `/es-es/`, etc.
- **Tenant-scoped content** — Pages, Posts, Media, and navigation are filtered per tenant
- **SiteSwitcher component** — header dropdown + first-visit popup modal
- **Admin panel** — tenant selector dropdown at the top to switch between sites
- When creating new blocks or collections, add them to the `multisitePlugin` config in `multisite-plugin.ts` to scope them per tenant

## Brand Customisation (Per Client)
When starting a new client project from this template:
1. Update `src/app/(frontend)/globals.css` with client brand colours
2. Replace logo in `src/components/Logo/`
3. Update `public/` with client favicon and OG images
4. Set site name in environment variables
5. Configure fonts in `src/app/(frontend)/layout.tsx`
6. Seed initial content via `/admin`

## Performance Targets
- Lighthouse Performance: 95+
- Lighthouse Accessibility: 100
- Lighthouse Best Practices: 100
- Lighthouse SEO: 100
- Core Web Vitals: All green
- First Contentful Paint: < 1.5s

## Do NOT
- Do not use `any` types. Always type properly.
- Do not install CSS frameworks besides Tailwind. Use Tailwind utilities.
- Do not add client-side state management libraries. Use React Server Components and minimal client state.
- Do not modify files in `src/app/(payload)/` - these are auto-generated by Payload.
- Do not hardcode content. Everything should come from the CMS.
- Do not use inline styles. Use Tailwind classes.
- Do not skip alt text on images.
