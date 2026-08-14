import Link from 'next/link'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { FooterNewsletterForm } from './NewsletterForm'
import { CookieSettingsFooter } from './CookieSettingsFooter'

function resolveLinkHref(link: any): string {
  if (link?.type === 'custom' && link?.url) return link.url
  if (link?.reference?.value) {
    const doc = link.reference.value
    const col = link.reference.relationTo
    if (col === 'pages') return `/${doc.slug ?? ''}`
    if (col === 'posts') return `/posts/${doc.slug ?? ''}`
  }
  return '#'
}

const DEFAULT_SHOP_LINKS: { href: string; label: string }[] = []

const DEFAULT_INFO_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact' },
  { href: '/contact#faq', label: 'FAQ' },
  { href: '/pages/shipping', label: 'Shipping & Returns' },
  { href: '/pages/size-guide', label: 'Size Guide' },
  { href: '/pages/how-to-apply', label: 'How to Apply' },
]

const DEFAULT_HELP_LINKS = [
  { href: '/policies/privacy-policy', label: 'Privacy Policy' },
  { href: '/policies/cookie-policy', label: 'Cookie Policy' },
  { href: '/policies/terms-and-conditions', label: 'Terms & Conditions' },
  { href: '/policies/returns-and-refund-policy', label: 'Returns Policy' },
]

export async function Footer() {
  let footerData: any = {}
  try {
    const payload = await getPayload({ config })
    footerData = await payload.findGlobal({ slug: 'footer' })
  } catch {
    // Use defaults if CMS unavailable
  }

  const year = new Date().getFullYear()

  const newsletterHeading = footerData?.newsletterHeading ?? 'Get 10% off your first order'
  const newsletterSubtext = footerData?.newsletterSubtext ?? 'Nail inspo, new drops & exclusive offers — no spam, ever.'

  const brandName = footerData?.brandName ?? 'Your Brand'
  const brandTagline = footerData?.brandTagline ?? 'Your tagline goes here. Edit this in the Footer settings.'
  const contactEmail = footerData?.contactEmail ?? 'hello@example.com'
  const contactHours = footerData?.contactHours ?? 'Mon–Fri, 9am–5pm GMT'

  const instagramUrl = footerData?.instagramUrl ?? 'https://instagram.com'
  const tiktokUrl = footerData?.tiktokUrl ?? 'https://tiktok.com'
  const pinterestUrl = footerData?.pinterestUrl ?? 'https://pinterest.com'

  const col1Heading = footerData?.column1Heading ?? 'Shop'
  const col2Heading = footerData?.column2Heading ?? 'Info'
  const col3Heading = footerData?.column3Heading ?? 'Help'

  type NavItem = { href: string; label: string }

  const col1Links: NavItem[] = footerData?.column1Links?.length
    ? footerData.column1Links.map((item: any): NavItem => ({ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }))
    : DEFAULT_SHOP_LINKS

  const col2Links: NavItem[] = footerData?.column2Links?.length
    ? footerData.column2Links.map((item: any): NavItem => ({ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }))
    : DEFAULT_INFO_LINKS

  const col3Links: NavItem[] = footerData?.column3Links?.length
    ? footerData.column3Links.map((item: any): NavItem => ({ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }))
    : DEFAULT_HELP_LINKS

  const copyrightRaw = footerData?.copyrightText ?? `© {year} Your Brand. All rights reserved.`
  const copyrightText = copyrightRaw.replace('{year}', String(year))
  const madeWithText = footerData?.madeWithText ?? ''

  return (
    <footer className="mt-auto bg-[var(--brand-deep-plum)] text-white">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="font-serif text-xl mb-1">{newsletterHeading}</p>
            <p className="text-sm text-white/60">{newsletterSubtext}</p>
          </div>
          <FooterNewsletterForm />
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-[1280px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="font-serif text-2xl tracking-[0.08em] hover:text-primary transition-colors block mb-3">
            {brandName}
          </Link>
          <p className="text-sm text-white/55 leading-relaxed max-w-[200px]">
            {brandTagline}
          </p>
          {/* Social icons */}
          <div className="flex gap-4 mt-5">
            {instagramUrl && (
              <a href={instagramUrl} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-pink-300 transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            )}
            {tiktokUrl && (
              <a href={tiktokUrl} aria-label="TikTok" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-pink-300 transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/></svg>
              </a>
            )}
            {pinterestUrl && (
              <a href={pinterestUrl} aria-label="Pinterest" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-pink-300 transition-colors">
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
              </a>
            )}
          </div>
        </div>

        {/* Column 1 */}
        <div>
          <h3 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">{col1Heading}</h3>
          <ul className="space-y-3">
            {col1Links.map(({ href, label }) => (
              <li key={String(href)}>
                <Link href={String(href)} className="text-sm text-white/60 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 2 */}
        <div>
          <h3 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">{col2Heading}</h3>
          <ul className="space-y-3">
            {col2Links.map(({ href, label }) => (
              <li key={String(href)}>
                <Link href={String(href)} className="text-sm text-white/60 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3 */}
        <div>
          <h3 className="text-xs font-semibold tracking-widest uppercase text-white/40 mb-4">{col3Heading}</h3>
          <ul className="space-y-3">
            {col3Links.map(({ href, label }) => (
              <li key={String(href)}>
                <Link href={String(href)} className="text-sm text-white/60 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-xs text-white/35 leading-relaxed">
            {contactEmail && <p>{contactEmail}</p>}
            {contactHours && <p className="mt-1">{contactHours}</p>}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1280px] mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/35">{copyrightText}</p>
          <div className="flex items-center gap-4">
            {madeWithText && <p className="text-xs text-white/25">{madeWithText}</p>}
            <CookieSettingsFooter />
          </div>
        </div>
      </div>
    </footer>
  )
}
