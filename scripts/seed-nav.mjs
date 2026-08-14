/**
 * Seed the Header and Footer globals with the current hardcoded nav structure.
 * Run: node scripts/seed-nav.mjs
 *
 * Requires the dev server to NOT be running (uses Payload local API directly)
 * OR the server to be running and accessible (uses REST API).
 *
 * This script uses the REST API so you can run it while the dev server is live.
 */

const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
const ADMIN_EMAIL = process.env.SEED_EMAIL || 'admin@pressednailzz.co.uk'
const ADMIN_PASSWORD = process.env.SEED_PASSWORD || ''

if (!ADMIN_PASSWORD) {
  console.error('❌  Set SEED_PASSWORD env var to your admin password')
  process.exit(1)
}

async function login() {
  const res = await fetch(`${BASE_URL}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  })
  const data = await res.json()
  if (!data.token) {
    console.error('❌  Login failed:', data)
    process.exit(1)
  }
  console.log('✅  Logged in as', ADMIN_EMAIL)
  return data.token
}

async function updateGlobal(token, slug, body) {
  const res = await fetch(`${BASE_URL}/api/globals/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `JWT ${token}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) {
    console.error(`❌  Failed to update ${slug}:`, data)
    return false
  }
  console.log(`✅  Updated global: ${slug}`)
  return true
}

function customLink(label, url) {
  return {
    link: {
      type: 'custom',
      url,
      label,
      newTab: false,
    },
  }
}

async function main() {
  const token = await login()

  // ── Header ────────────────────────────────────────────────────────────────
  await updateGlobal(token, 'header', {
    announcementBar: 'Free UK shipping on orders over £30 · Use code NAILZZ10 for 10% off your first order',
    navItemsLeft: [
      customLink('Shop', '/shop'),
      customLink('New In', '/shop?category=new-arrivals'),
      customLink('Bestsellers', '/shop?category=bestsellers'),
    ],
    navItemsRight: [
      customLink('About', '/about'),
      customLink('Contact', '/contact'),
    ],
  })

  // ── Footer ────────────────────────────────────────────────────────────────
  await updateGlobal(token, 'footer', {
    newsletterHeading: 'Get 10% off your first order',
    newsletterSubtext: 'Nail inspo, new drops & exclusive offers — no spam, ever.',
    brandName: 'Pressed Nailzz',
    brandTagline: 'Salon-quality press-on nails delivered to your door. Easy on, stunning off.',
    contactEmail: 'hello@pressednailzz.co.uk',
    contactHours: 'Mon–Fri, 9am–5pm GMT',
    instagramUrl: 'https://instagram.com/pressednailzz',
    tiktokUrl: 'https://tiktok.com/@pressednailzz',
    pinterestUrl: 'https://pinterest.com/pressednailzz',
    column1Heading: 'Shop',
    column1Links: [
      customLink('All Products', '/shop'),
      customLink('New Arrivals', '/shop?category=new-arrivals'),
      customLink('Bestsellers', '/shop?category=bestsellers'),
      customLink('French Tips', '/shop?category=french-tips'),
      customLink('Glitter Sets', '/shop?category=glitter'),
      customLink('Custom Sets', '/shop?category=custom'),
    ],
    column2Heading: 'Info',
    column2Links: [
      customLink('About Us', '/about'),
      customLink('Contact', '/contact'),
      customLink('FAQ', '/contact#faq'),
      customLink('Shipping & Returns', '/pages/shipping'),
      customLink('Size Guide', '/pages/size-guide'),
      customLink('How to Apply', '/pages/how-to-apply'),
    ],
    column3Heading: 'Help',
    column3Links: [
      customLink('Privacy Policy', '/policies/privacy-policy'),
      customLink('Cookie Policy', '/policies/cookie-policy'),
      customLink('Terms & Conditions', '/policies/terms-and-conditions'),
      customLink('Returns Policy', '/policies/returns-and-refund-policy'),
    ],
    copyrightText: '© {year} Pressed Nailzz. All rights reserved.',
    madeWithText: 'Made with 💅 in the UK',
  })

  console.log('\n🎉  Nav seed complete! Refresh /admin to see Header and Footer populated.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
