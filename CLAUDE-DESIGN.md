# CLAUDE-DESIGN.md — Frontend Design Guide

> Build award-worthy websites using Claude Code with the Zenithics CMS.
> 3D effects, scroll animations, parallax — from minimal prompts to stunning results.

---

## Design Philosophy

**Award-worthy, not template-grade.** Every site we build should feel like a premium digital experience. Think Awwwards, CSS Design Awards, FWA — not Bootstrap templates.

| Principle | What it means |
|-----------|--------------|
| **Depth over flatness** | Use layers, shadows, glassmorphism, 3D transforms. Never stack flat rectangles. Create visual depth on every page. |
| **Motion as meaning** | Scroll-triggered animations, parallax, micro-interactions. Every animation guides attention — never decorative noise. |
| **Typography as art** | Oversized display headings, variable fonts, creative kerning. Huge headings next to small body text creates visual hierarchy. |
| **Whitespace is premium** | Generous padding, breathing room, editorial spacing. Whitespace signals quality and confidence. |
| **Dark mode first** | Dark themes feel more premium and modern. Design in dark, then adapt to light. |

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| **Framework** | Next.js 16 + React Server Components, Tailwind CSS v4, TypeScript strict |
| **CMS** | Payload CMS 3 + Neon Postgres + Vercel Blob for media uploads |
| **Animation** | Framer Motion for transitions, GSAP + ScrollTrigger for scroll animations |

### Codespaces Setup

Open the client repo in GitHub Codespaces. In the terminal, install animation libraries if not present:

```bash
pnpm add framer-motion gsap
```

### Mobbin MCP Integration

We use the Mobbin MCP server to let Claude Code search Mobbin directly for layout inspiration during the design phase. Set this up in every Codespace used for frontend design.

**Automated setup (recommended)** — add to `.devcontainer/devcontainer.json`:

```json
"postCreateCommand": "pnpm install && claude mcp add mobbin npx -y @anthropic/mobbin-mcp-server"
```

**Manual setup (per Codespace):**

```bash
claude mcp add mobbin npx -y @anthropic/mobbin-mcp-server

# If a Mobbin API key is required:
export MOBBIN_API_KEY=your_key_here
claude mcp add mobbin npx -y @anthropic/mobbin-mcp-server -e MOBBIN_API_KEY=$MOBBIN_API_KEY
```

**How Claude uses Mobbin:** With the MCP connected, Claude Code can search Mobbin for layouts by industry, style, and pattern — e.g. "dark luxury hero section" or "SaaS pricing page". It pulls real design references and adapts them into the CMS block system automatically. Include a Mobbin search prompt in your design brief (see Starter Prompt below).

---

## CMS Block System

Every section is a CMS block. The client edits content via `/admin`, and blocks render it on the frontend. **All content comes from the CMS — never hardcode text, images, or links.**

### Block File Structure

```
src/blocks/MyBlock/
├── config.ts      # Fields the client edits
└── Component.tsx  # React component
```

Register new blocks in `Pages/index.ts` (config) and `RenderBlocks.tsx` (component).

### Hero Variants

| Type | Use for |
|------|---------|
| `highImpact` | Full-screen hero with background media + overlay |
| `mediumImpact` | Standard heading + description hero |
| `lowImpact` | Minimal heading only |
| `none` | No hero — straight to blocks |

### Available Blocks

| Block | Slug | Use for |
|-------|------|---------|
| Archive | `archive` | Blog/post listings with filters |
| Banner | `banner` | Alert banners, announcements |
| Call to Action | `cta` | CTA sections with buttons |
| Content | `content` | Rich text content sections |
| FAQ | `faq` | Accordion FAQ sections |
| Features | `features` | Feature grids (2/3/4 columns) |
| Form | `formBlock` | Contact forms, enquiry forms |
| Hero Split | `heroSplit` | Split hero (text + media side by side) |
| Home Hero | `homeHero` | Full-width homepage hero |
| How It Works | `howItWorks` | Step-by-step process sections |
| Logo Carousel | `logoCarousel` | Client/partner logo strip |
| Media | `mediaBlock` | Full-width image/video sections |
| Image Gallery | `nailGallery` | Masonry/grid image gallery |
| Newsletter | `newsletter` | Email signup sections |
| Pricing | `pricing` | Pricing table comparisons |
| Related Posts | `relatedPosts` | Related blog post cards |
| Stats | `stats` | Number statistics with counters |
| Testimonials | `testimonials` | Customer reviews/testimonials |

### Ecommerce Blocks (when add-on installed)

| Block | Slug | Use for |
|-------|------|---------|
| Product Grid | `productGrid` | Filterable product listings |
| Featured Products | `featuredProducts` | Product highlights |
| Cart Summary | `cartSummary` | Shopping cart view |
| Event Grid | `eventGrid` | Event listings with dates |

---

## CMS Architecture

### Globals

Globals are settings that affect every page. They're edited in the CMS admin and accessible in every server component.

| Global | Controls |
|--------|----------|
| **Header** | Navigation links (left + right groups), logo, announcement bar |
| **Footer** | Footer columns, links, social icons, copyright text |
| **Site Appearance** | Brand colours, fonts, logo, favicon |
| **Site Settings** | Site name, tagline, general configuration |
| **SEO Settings** | Meta defaults, analytics codes, ad pixels, schema markup, custom scripts |
| **Cookie Consent** | GDPR banner text, consent categories |
| **Contact Widget** | Floating contact button/form overlay |
| **Mail Settings** | SMTP configuration for transactional emails |
| **Shop Settings** | Currency, shipping, tax rules (ecom only) |

### Key File Locations

| What | Path |
|------|------|
| Global styles + brand tokens | `src/app/(frontend)/globals.css` |
| Frontend layout | `src/app/(frontend)/layout.tsx` |
| Hero components | `src/heros/` |
| Block components | `src/blocks/` |
| Block registry | `src/blocks/RenderBlocks.tsx` |
| Page collection (block list) | `src/collections/Pages/index.ts` |
| UI primitives | `src/components/ui/` |
| Header / navigation | `src/Header/` |
| Footer | `src/Footer/` |
| Payload config | `src/payload.config.ts` |
| Theme provider | `src/providers/Theme/` |

### Creating New Blocks

When existing blocks don't cover the design, create new ones:

```bash
# 1. Create the block folder
mkdir -p src/blocks/VideoHero

# 2. Create config.ts (Payload schema) + Component.tsx (React)

# 3. Register in src/collections/Pages/index.ts (import + add to blocks[])

# 4. Register in src/blocks/RenderBlocks.tsx (import + add to map)

# 5. Generate types:
pnpm generate:types
```

**Rule: all content from the CMS.** Never hardcode text, images, or links in components. Every piece of visible content must come from a Payload field so the client can edit it via `/admin`. Use the block `config.ts` to define editable fields, then read them as props in `Component.tsx`.

---

## Design Patterns

10 patterns for cutting-edge sites. All use `'use client'` directive since they need browser APIs.

### 1. Scroll-triggered animations (GSAP)

```tsx
'use client'
import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedSection({ children }) {
  const ref = useRef(null)
  useEffect(() => {
    gsap.fromTo(ref.current,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' }})
  }, [])
  return <div ref={ref}>{children}</div>
}
```

### 2. Parallax depth layers

```tsx
{/* Multiple layers at different scroll speeds */}
<div className="relative h-screen overflow-hidden">
  <div data-speed="0.3" className="absolute inset-0 z-0">
    {/* Background — moves slowest */}
  </div>
  <div data-speed="0.6" className="absolute inset-0 z-10">
    {/* Mid layer */}
  </div>
  <div data-speed="1" className="relative z-20">
    {/* Content — moves with scroll */}
  </div>
</div>
```

### 3. 3D card transforms

```tsx
{/* Card tilts toward cursor on hover — perspective + rotateX/Y */}
const handleMouseMove = (e) => {
  const rect = card.getBoundingClientRect()
  const rotateX = (e.clientY - rect.top - rect.height/2) / 10
  const rotateY = (rect.width/2 - (e.clientX - rect.left)) / 10
  card.style.transform = `perspective(1000px) rotateX(${rotateX}deg)
    rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
}
```

### 4. Glassmorphism

```tsx
<div className="backdrop-blur-xl bg-white/10 border border-white/20
     rounded-2xl shadow-2xl">
  {/* Glass card content */}
</div>
```

### 5. Text reveal on scroll

```tsx
{/* Split heading into words, animate each with staggered delay */}
gsap.fromTo('.reveal-word',
  { y: '100%', opacity: 0 },
  { y: 0, opacity: 1, stagger: 0.05, duration: 0.8,
    ease: 'power4.out',
    scrollTrigger: { trigger: '.reveal-heading', start: 'top 75%' }}
)
```

### 6. Smooth page transitions (Framer Motion)

```tsx
'use client'
import { motion } from 'framer-motion'

export function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  )
}
```

### 7. Magnetic buttons

```tsx
{/* Button follows cursor slightly when hovered */}
const handleMouseMove = (e) => {
  const rect = btn.getBoundingClientRect()
  const x = e.clientX - rect.left - rect.width / 2
  const y = e.clientY - rect.top - rect.height / 2
  btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`
}
{/* Reset on mouse leave: transform = 'translate(0,0)' */}
```

### 8. Gradient mesh backgrounds

```css
/* In globals.css */
.gradient-mesh {
  background:
    radial-gradient(at 40% 20%, hsla(280, 80%, 60%, 0.3) 0, transparent 50%),
    radial-gradient(at 80% 0%,  hsla(200, 100%, 60%, 0.2) 0, transparent 50%),
    radial-gradient(at 0% 50%,  hsla(340, 80%, 60%, 0.2) 0, transparent 50%),
    radial-gradient(at 80% 50%, hsla(120, 60%, 50%, 0.15) 0, transparent 50%);
}
```

### 9. Number counter animation

```tsx
'use client'
import { useInView } from 'framer-motion'

function Counter({ target, suffix = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return
    let start = 0
    const step = (ts) => {
      start = start || ts
      const p = Math.min((ts - start) / 2000, 1)
      setCount(Math.floor(p * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [isInView, target])

  return <span ref={ref}>{count}{suffix}</span>
}
```

### 10. Horizontal scroll sections

```tsx
{/* Pin the container, scroll content horizontally */}
useEffect(() => {
  const scrollWidth = section.scrollWidth - section.clientWidth
  gsap.to(section, {
    x: -scrollWidth, ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top top',
      end: `+=${scrollWidth}`,
      pin: true,
      scrub: 1,
    },
  })
}, [])
```

---

## Typography & Colour

### Typography Rules

| Element | Style |
|---------|-------|
| Display headings | `4xl`–`8xl`, bold/black, tracking `-0.02` to `-0.04em` |
| Body text | `base`–`lg`, regular, leading `1.6`–`1.8` |
| Labels / caps | `xs`–`sm`, uppercase, tracking `0.1em+`, medium |

**Rule: maximum 2 typefaces per site.** One display, one body. Never more.

#### Recommended Fonts

```tsx
import {
  Inter,              // Clean, universal
  Space_Grotesk,      // Modern geometric
  Playfair_Display,   // Elegant serif
  Syne,               // Bold & expressive
} from 'next/font/google'

const display = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display'
})
```

### Colour Rules

- Build around 1 primary with 1–2 accents
- Use `oklch()` for perceptually uniform manipulation
- Dark themes: bg 10–15% lightness, cards 18–22%, text 90–95%
- Subtle gradients over flat backgrounds
- Colour for emphasis, not decoration

#### Brand Token Setup

```css
/* src/app/(frontend)/globals.css */
@theme {
  /* Brand colours */
  --color-brand-primary: oklch(0.65 0.25 260);
  --color-brand-secondary: oklch(0.55 0.15 200);
  --color-brand-accent: oklch(0.75 0.20 150);

  /* Dark surfaces */
  --color-surface-dark: oklch(0.15 0.01 260);
  --color-surface-card: oklch(0.20 0.02 260);

  /* Typography */
  --font-display: 'Space Grotesk', sans-serif;
  --font-body: 'Inter', sans-serif;
}
```

---

## Responsive Design

| Mobile First | Fluid Type | Motion-Safe |
|-------------|------------|-------------|
| Design at 375px, scale up. `sm: 640` · `md: 768` · `lg: 1024` · `xl: 1280` | Hero text: `text-3xl md:text-5xl lg:text-7xl`. Scale proportionally across breakpoints. | Remove heavy animations on mobile. Use `motion-safe:` prefix. Touch targets: min 44×44px. |

### Performance Targets

| Lighthouse Perf | Accessibility | Initial JS | Min Contrast |
|----------------|---------------|------------|--------------|
| 95+ | 100 | <200KB | 4.5:1 |

---

## Design Workflow

### From Brief to Finished Site

1. **Gather brand input** — Collect from the client: brand colours (primary, secondary, accent), logo files, industry, target audience, tone (corporate / playful / luxury / minimal / bold), reference sites they like, and competitor URLs to differentiate from.

2. **Research on Mobbin (via MCP)** — With the Mobbin MCP connected in Claude Code, prompt Claude to search for layouts by industry and style. Claude pulls real design references and adapts them into the CMS block system.

   **Mobbin search examples:**
   - "Search Mobbin for dark premium SaaS hero sections"
   - "Find law firm website layouts with strong typography"
   - "Show me ecommerce product grid designs with filters"
   - "Search for pricing page designs with annual/monthly toggle"

   Claude analyses the results and translates patterns into block components that connect to the Payload CMS backend.

3. **Set up brand tokens** — Update `globals.css` with the client's colours using `oklch()`. Install chosen Google Fonts in `layout.tsx`. Set CSS custom properties for surfaces, cards, and text levels.

4. **Design page by page** — Start with the homepage, then inner pages. For each: choose a hero variant (or create a custom one), stack blocks in a narrative flow, apply animations, and test responsive at 375px, 768px, and 1440px.

5. **Polish and test** — Add micro-interactions to buttons, links, and cards. Ensure all images use `next/image`. Run Lighthouse (target: 95+ performance, 100 accessibility). Verify all CMS fields are wired — no hardcoded content.

### Do Not

- Use generic stock-photo layouts
- Use flat, same-height card grids without hierarchy
- Use default browser form styles
- Hardcode any text, images, or links

### Never

- More than 2 typefaces per site
- Animations that serve no purpose
- Ignoring mobile (always test at 375px)
- Low-contrast text (WCAG AA: 4.5:1 minimum)

---

## Starter Prompt

After deploying the project and setting up Codespaces with the Mobbin MCP, use this prompt as your starting point. Customise the bracketed fields for each client.

```
Read CLAUDE.md and CLAUDE-DESIGN.md.

I'm building a website for [CLIENT NAME], a [INDUSTRY] business.

Brand:
- Primary colour: [hex or description]
- Secondary: [hex or description]
- Tone: [corporate / playful / luxury / minimal / bold]
- Logo: [uploaded to /public or describe]

Reference sites: [list any sites they like]

Pages needed: Home, About, Services, Contact, [others]

Step 1: Search Mobbin for "[INDUSTRY]" and "[TONE] website"
layouts. Pull the best 3-5 references for hero, features,
testimonials, and CTA sections.

Step 2: Set up brand tokens in globals.css using oklch().
Install fonts in layout.tsx.

Step 3: Design a stunning, award-worthy homepage using the
CMS block system. Start with a high-impact hero, then build
sections that tell the brand story.

Use scroll animations, parallax, 3D transforms, and
micro-interactions. All content must come from CMS fields
(no hardcoded text).

Install framer-motion and gsap if not present.

Build mobile-first, dark mode as default.
```

---

## Mobbin MCP Quick Reference

| Action | Prompt to Claude |
|--------|-----------------|
| Search by industry | "Search Mobbin for [law firm / restaurant / SaaS] website designs" |
| Search by pattern | "Search Mobbin for [pricing page / hero section / contact form] designs" |
| Search by style | "Search Mobbin for dark premium / minimal clean / bold colourful websites" |
| Competitive research | "Search Mobbin for websites similar to [competitor URL]" |

---

## Codespace Setup Checklist

1. Open client repo in GitHub Codespaces
2. Run: `claude mcp add mobbin npx -y @anthropic/mobbin-mcp-server`
3. Run: `pnpm add framer-motion gsap` (if not already installed)
4. Open Claude Code and paste the starter prompt above
5. Claude will search Mobbin, set up brand tokens, and start designing

## File Checklist for Every Project

| File | Location | Purpose |
|------|----------|---------|
| `CLAUDE.md` | Project root | CMS conventions, coding standards, Payload patterns |
| `CLAUDE-DESIGN.md` | Project root | This design guide |
| `CLAUDE-ECOMMERCE.md` | Project root | Ecommerce patterns (if ecom add-on installed) |
| `deploy-new-site.sh` | `scripts/` | Deployment automation script |
