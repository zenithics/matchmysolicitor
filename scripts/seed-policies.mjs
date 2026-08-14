const BASE = 'http://localhost:3000'

async function login() {
  const res = await fetch(`${BASE}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ryan@zenithics.com', password: 'beachHUT67!' }),
  })
  const d = await res.json()
  return d.token
}

// Correct Lexical node format
const para = (text) => ({
  type: 'paragraph',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
})

// Headings MUST use type: 'heading' — NOT type: 'h2'
const h2 = (text) => ({
  type: 'heading',
  tag: 'h2',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
})

const h3 = (text) => ({
  type: 'heading',
  tag: 'h3',
  direction: 'ltr',
  format: '',
  indent: 0,
  version: 1,
  children: [{ type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }],
})

const richText = (...nodes) => ({
  root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: nodes },
})

const POLICIES = [
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    version: '1.0',
    effectiveDate: '2026-06-01T00:00:00.000Z',
    lastReviewed: '2026-06-25T00:00:00.000Z',
    content: richText(
      h2('1. Who We Are'),
      para('{{companyName}} ("we", "us", "our") operates the website at {{websiteUrl}}. Our registered address is: {{registeredAddress}}. Contact us at: {{contactEmail}}.'),
      h2('2. What Data We Collect'),
      para('We collect: your name and email address when you create an account or place an order; your delivery address and phone number for order fulfilment; payment information processed securely by Stripe (we never store your card details); your browsing behaviour via analytics cookies (only with your consent).'),
      h2('3. How We Use Your Data'),
      para('We use your data to: process and fulfil your orders; manage your customer account; send order confirmation and shipping emails; send marketing emails if you have opted in; improve our website and services.'),
      h2('4. Legal Basis for Processing'),
      para('Contract: processing your order. Legitimate interest: fraud prevention, customer service. Consent: marketing emails and analytics cookies. Legal obligation: tax and accounting records.'),
      h2('5. Third Parties'),
      para('We share data with: Stripe (payment processing — see stripe.com/privacy); shipping couriers (to deliver your order); our email service provider (for transactional and marketing emails). We never sell your personal data.'),
      h2('6. Data Retention'),
      para('Order records are retained for 7 years for tax purposes. Account data is retained until you request deletion. Marketing consent records are retained for 3 years after last interaction.'),
      h2('7. Your Rights'),
      para('Under UK GDPR you have the right to: access your personal data; correct inaccurate data; request erasure; restrict or object to processing; data portability. To exercise these rights, contact: {{dpoEmail}}.'),
      h2('8. Cookies'),
      para('Please see our Cookie Policy at {{websiteUrl}}/policies/cookie-policy for full details.'),
      h2('9. Changes to This Policy'),
      para('We will notify you of significant changes by email or via a notice on our website. The effective date above reflects the latest update.'),
      h2('10. Complaints'),
      para('If you are unhappy with how we handle your data, you can complain to the ICO: ico.org.uk/concerns or call 0303 123 1113.')
    ),
  },
  {
    title: 'Cookie Policy',
    slug: 'cookie-policy',
    version: '1.0',
    effectiveDate: '2026-06-01T00:00:00.000Z',
    lastReviewed: '2026-06-25T00:00:00.000Z',
    content: richText(
      h2('What Are Cookies?'),
      para('Cookies are small text files placed on your device when you visit a website. They help the website remember your preferences and understand how you use it.'),
      h2('Cookies We Use'),
      h3('Necessary (Always Active)'),
      para('These are essential for the site to work. They include your shopping cart session, login token, and cookie consent preferences. Cookie name: cookie_consent — purpose: stores your cookie preferences — expiry: 365 days.'),
      h3('Analytics (Optional)'),
      para('These help us understand how visitors use our site. We use Google Analytics (GA4) and Microsoft Clarity. These cookies are anonymous and never identify you personally. We only set these if you consent.'),
      h3('Advertising (Optional)'),
      para('These are used by Meta (Facebook), TikTok, and Reddit to show you relevant ads and measure ad performance. We only set these if you consent.'),
      h2('Third-Party Cookies'),
      para('Third-party services (Stripe, analytics providers, ad platforms) may set their own cookies. Please refer to their privacy policies for details.'),
      h2('Managing Your Preferences'),
      para('You can update your cookie preferences at any time using the "Cookie Settings" link in our website footer. You can also disable cookies in your browser settings, though this may affect site functionality.'),
      h2('Contact'),
      para('For questions about our use of cookies, contact {{contactEmail}}.')
    ),
  },
  {
    title: 'Terms and Conditions',
    slug: 'terms-and-conditions',
    version: '1.0',
    effectiveDate: '2026-06-01T00:00:00.000Z',
    lastReviewed: '2026-06-25T00:00:00.000Z',
    content: richText(
      h2('1. Acceptance of Terms'),
      para('By placing an order or using {{websiteUrl}}, you agree to these Terms and Conditions. Please read them carefully. If you do not agree, do not use our website.'),
      h2('2. About Us'),
      para('{{companyName}} (Company No. {{companyRegistrationNumber}}) operates at {{websiteUrl}}. Contact: {{contactEmail}}.'),
      h2('3. Products and Pricing'),
      para('All prices are shown in GBP and include VAT where applicable. We reserve the right to change prices at any time. Product images are for illustration — actual colours may vary slightly due to screen settings.'),
      h2('4. Orders and Payment'),
      para('By placing an order, you are making an offer to purchase. We reserve the right to decline orders. Payment is processed securely via Stripe. We accept major credit/debit cards, Apple Pay, Google Pay, and other methods shown at checkout.'),
      h2('5. Shipping and Delivery'),
      para('We ship within the UK and internationally. Delivery times are estimates and not guaranteed. Risk of loss passes to you upon delivery.'),
      h2('6. Returns and Refunds'),
      para('Under the Consumer Contracts Regulations 2013, you have 14 days from receipt to cancel your order without giving a reason. See our Returns Policy for full details.'),
      h2('7. Intellectual Property'),
      para('All content on this website — including images, text, logos, and designs — is owned by {{companyName}} and may not be reproduced, distributed, or used commercially without written permission.'),
      h2('8. Limitation of Liability'),
      para('To the fullest extent permitted by law, {{companyName}} shall not be liable for any indirect, incidental, or consequential loss. Our liability is limited to the value of the product purchased.'),
      h2('9. Governing Law'),
      para('These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the English courts.'),
      h2('10. Contact'),
      para('{{companyName}}, {{registeredAddress}}. Email: {{contactEmail}}.')
    ),
  },
  {
    title: 'Returns and Refund Policy',
    slug: 'returns-and-refund-policy',
    version: '1.0',
    effectiveDate: '2026-06-01T00:00:00.000Z',
    lastReviewed: '2026-06-25T00:00:00.000Z',
    content: richText(
      h2('14-Day Return Window'),
      para('You may return any unopened, unused item within 14 days of receiving your order under the Consumer Contracts Regulations 2013. After 14 days, returns are at our discretion.'),
      h2('Condition Requirements'),
      para('Items must be returned in their original, sealed packaging. We cannot accept returns on opened nail sets for hygiene reasons, unless the item is faulty.'),
      h2('How to Initiate a Return'),
      para('Email {{contactEmail}} with your order number and reason for return. We will respond within 1 to 2 business days with return instructions. Return postage costs are your responsibility unless the item is faulty.'),
      h2('Refund Process'),
      para('Once we receive and inspect your return, we will process your refund within 5 to 10 business days. Refunds are issued to your original payment method. We will email you to confirm.'),
      h2('Exchanges'),
      para('We currently do not offer direct exchanges. Please return the item for a refund and place a new order.'),
      h2('Faulty or Damaged Items'),
      para('If your item arrives damaged or defective, please contact us within 14 days with photos at {{contactEmail}}. We will arrange a free replacement or full refund — your choice.'),
      h2('Questions?'),
      para('Contact us at {{contactEmail}} and we will be happy to help.')
    ),
  },
]

async function main() {
  const token = await login()
  console.log('Logged in.')

  // Delete existing policies first
  const existing = await fetch(`${BASE}/api/policies?limit=20`, {
    headers: { Authorization: `JWT ${token}` },
  })
  const existingData = await existing.json()
  for (const policy of existingData.docs || []) {
    await fetch(`${BASE}/api/policies/${policy.id}`, {
      method: 'DELETE',
      headers: { Authorization: `JWT ${token}` },
    })
    console.log(`Deleted: ${policy.slug}`)
  }

  // Re-seed with correct node format
  for (const policy of POLICIES) {
    const res = await fetch(`${BASE}/api/policies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `JWT ${token}` },
      body: JSON.stringify(policy),
    })
    const d = await res.json()
    if (d.errors) {
      console.log(`ERROR [${policy.slug}]:`, JSON.stringify(d.errors[0]))
    } else {
      console.log(`Created: ${d.doc?.slug}`)
    }
  }

  console.log('Done!')
}

main().catch(console.error)
