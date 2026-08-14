/**
 * Seeds Pressed Nailzz with product categories and 10 nail set products.
 * Run: node --env-file=.env scripts/seed-products.mjs
 *
 * Uses the Payload local API via HTTP (Payload's REST API).
 * Assumes the dev server is running at http://localhost:3000.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const EMAIL = process.env.PAYLOAD_SEED_EMAIL || 'dev@pressednailzz.co.uk'
const PASSWORD = process.env.PAYLOAD_SEED_PASSWORD || 'password'

async function api(path, options = {}) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${path} → ${res.status}: ${text.slice(0, 200)}`)
  }
  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function login() {
  const data = await api('/users/login', {
    method: 'POST',
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const token = data.token
  if (!token) throw new Error('Login failed — check PAYLOAD_SEED_EMAIL and PAYLOAD_SEED_PASSWORD')
  console.log('✓ Logged in as', EMAIL)
  return token
}

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { title: 'French Tips', slug: 'french-tips' },
  { title: 'Glitter & Shimmer', slug: 'glitter' },
  { title: 'Solid Colours', slug: 'solid-colours' },
  { title: 'Designer Sets', slug: 'designer-sets' },
  { title: 'New Arrivals', slug: 'new-arrivals' },
  { title: 'Bestsellers', slug: 'bestsellers' },
]

async function seedCategories(token) {
  const headers = { Authorization: `JWT ${token}` }
  const catIds = {}
  for (const cat of CATEGORIES) {
    try {
      const data = await api('/product-categories', {
        method: 'POST',
        headers,
        body: JSON.stringify(cat),
      })
      catIds[cat.slug] = data.doc?.id
      console.log(`  ✓ Category: ${cat.title}`)
    } catch (e) {
      // May already exist — try to find it
      const list = await api(`/product-categories?where[slug][equals]=${cat.slug}`, { headers })
      if (list.docs?.[0]) {
        catIds[cat.slug] = list.docs[0].id
        console.log(`  ↩ Category exists: ${cat.title}`)
      } else {
        console.warn(`  ✗ Category failed: ${cat.title} — ${e.message}`)
      }
    }
  }
  return catIds
}

// ── Products ──────────────────────────────────────────────────────────────────
function makeProducts(catIds) {
  return [
    {
      title: 'Barely There French',
      slug: 'barely-there-french',
      shortDescription: 'The classic French tip, perfected. Soft white tips on a nude base.',
      price: 1299,
      stock: 100,
      status: 'active',
      productType: 'physical',
      featured: true,
      category: [catIds['french-tips'], catIds['bestsellers']].filter(Boolean),
      nailShape: ['almond', 'square', 'coffin'],
      finishType: 'glossy',
      hasVariants: true,
      variants: [
        { name: 'Short' },
        { name: 'Medium' },
        { name: 'Long', priceOverride: 1499 },
      ],
    },
    {
      title: 'Rosé All Day',
      slug: 'rose-all-day',
      shortDescription: 'Dreamy blush pink with a glossy finish. Perfect for every occasion.',
      price: 999,
      stock: 150,
      status: 'active',
      productType: 'physical',
      featured: true,
      category: [catIds['solid-colours'], catIds['bestsellers']].filter(Boolean),
      nailShape: ['almond', 'oval', 'square'],
      finishType: 'glossy',
      hasVariants: false,
    },
    {
      title: 'Midnight Glitter',
      slug: 'midnight-glitter',
      shortDescription: 'Dark navy with silver holographic glitter. Showstopping.',
      price: 1699,
      stock: 80,
      status: 'active',
      productType: 'physical',
      category: [catIds['glitter'], catIds['new-arrivals']].filter(Boolean),
      nailShape: ['coffin', 'stiletto', 'almond'],
      finishType: 'glossy',
      hasVariants: false,
    },
    {
      title: 'Cherry Blossom',
      slug: 'cherry-blossom',
      shortDescription: 'Delicate pink with hand-painted floral details. Spring in your hands.',
      price: 1499,
      compareAtPrice: 1999,
      stock: 60,
      status: 'active',
      productType: 'physical',
      featured: true,
      category: [catIds['designer-sets']].filter(Boolean),
      nailShape: ['almond', 'oval'],
      finishType: 'glossy',
      hasVariants: false,
    },
    {
      title: 'Mocha Matte',
      slug: 'mocha-matte',
      shortDescription: 'Rich espresso brown in a velvety matte finish. Minimalist perfection.',
      price: 1199,
      stock: 120,
      status: 'active',
      productType: 'physical',
      category: [catIds['solid-colours']].filter(Boolean),
      nailShape: ['square', 'coffin', 'squoval'],
      finishType: 'matte',
      hasVariants: false,
    },
    {
      title: 'Glitter Bomb',
      slug: 'glitter-bomb',
      shortDescription: 'All-over chunky rainbow glitter. Because more is more.',
      price: 1499,
      stock: 75,
      status: 'active',
      productType: 'physical',
      category: [catIds['glitter'], catIds['new-arrivals']].filter(Boolean),
      nailShape: ['coffin', 'stiletto'],
      finishType: 'glossy',
      hasVariants: false,
    },
    {
      title: 'Glazed Donut',
      slug: 'glazed-donut',
      shortDescription: 'The Hailey B. look — chrome finish with a sheer milky base.',
      price: 1899,
      stock: 90,
      status: 'active',
      productType: 'physical',
      featured: true,
      category: [catIds['new-arrivals'], catIds['bestsellers']].filter(Boolean),
      nailShape: ['almond', 'oval', 'round'],
      finishType: 'glossy',
      hasVariants: true,
      variants: [
        { name: 'Short' },
        { name: 'Medium' },
        { name: 'Long', priceOverride: 2099 },
        { name: 'XL', priceOverride: 2299 },
      ],
    },
    {
      title: 'Red Carpet',
      slug: 'red-carpet',
      shortDescription: 'Classic red — matte and gel-like, for when you mean business.',
      price: 999,
      stock: 200,
      status: 'active',
      productType: 'physical',
      category: [catIds['solid-colours']].filter(Boolean),
      nailShape: ['square', 'almond', 'coffin'],
      finishType: 'glossy',
      hasVariants: false,
    },
    {
      title: 'Marble Luxe',
      slug: 'marble-luxe',
      shortDescription: 'White marble with gold veining. Luxury that actually lasts.',
      price: 2199,
      stock: 45,
      status: 'active',
      productType: 'physical',
      category: [catIds['designer-sets']].filter(Boolean),
      nailShape: ['coffin', 'almond', 'stiletto'],
      finishType: 'glossy',
      hasVariants: false,
    },
    {
      title: 'Pastel Rainbow',
      slug: 'pastel-rainbow',
      shortDescription: 'Six pastel shades, one per nail. Playful, fun, and totally Y2K.',
      price: 1399,
      stock: 65,
      status: 'active',
      productType: 'physical',
      category: [catIds['designer-sets'], catIds['new-arrivals']].filter(Boolean),
      nailShape: ['square', 'oval', 'round'],
      finishType: 'glossy',
      hasVariants: false,
    },
  ]
}

async function seedProducts(token, catIds) {
  const headers = { Authorization: `JWT ${token}` }
  for (const product of makeProducts(catIds)) {
    try {
      await api('/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(product),
      })
      console.log(`  ✓ Product: ${product.title} — £${(product.price / 100).toFixed(2)}`)
    } catch (e) {
      console.warn(`  ✗ Product failed: ${product.title} — ${e.message}`)
    }
  }
}

// ── Run ───────────────────────────────────────────────────────────────────────
console.log('\n🚀 Seeding Pressed Nailzz...\n')
const token = await login()

console.log('\n📂 Seeding categories...')
const catIds = await seedCategories(token)

console.log('\n💅 Seeding products...')
await seedProducts(token, catIds)

console.log('\n✅ Done! Visit http://localhost:3000/admin to see your content.\n')
