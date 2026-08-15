import Link from 'next/link'
import Image from 'next/image'
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
  { href: '/for-employees', label: 'For Employees' },
  { href: '/for-employers', label: 'For Employers' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/enquiry', label: 'Check your claim' },
]

const DEFAULT_HELP_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/guides', label: 'Guides' },
  { href: '/contact', label: 'Contact' },
]

const DEFAULT_LEGAL_LINKS = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/cookie-policy', label: 'Cookie Policy' },
  { href: '/terms-of-use', label: 'Terms of Use' },
  { href: '/complaints', label: 'Complaints' },
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

  const col1Heading = footerData?.column1Heading ?? 'Services'
  const col2Heading = footerData?.column2Heading ?? 'Company'
  const col3Heading = footerData?.column3Heading ?? 'Guides'

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

  const linkClass = 'text-sm text-[#98A1AE] hover:text-white transition-colors'

  const columns: { heading: string; links: { href: string; label: string }[] }[] = [
    { heading: col1Heading, links: col1Links.length ? col1Links : DEFAULT_INFO_LINKS },
    { heading: col2Heading, links: col2Links },
    { heading: col3Heading, links: col3Links },
  ]

  return (
    <footer className="mt-auto bg-[#1A1F26] text-white">
      {/*
       * Design footer: five columns (1.6fr then four equal), collapsing to two
       * at 980px and one at 560px. No newsletter strip and no social icons —
       * both were e-commerce starter defaults.
       */}
      <div className="mx-auto w-full max-w-[var(--mms-container)] px-6 py-16">
        <div className="grid grid-cols-1 gap-10 min-[560px]:grid-cols-2 min-[980px]:[grid-template-columns:1.6fr_1fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="mb-4 block" aria-label={brandName}>
              <Image
                src="/logo-reversed.svg"
                alt={brandName}
                width={200}
                height={37}
                className="h-[38px] w-auto object-contain"
              />
            </Link>
            <p className="max-w-[260px] text-sm leading-relaxed text-[#98A1AE]">{brandTagline}</p>
            <div className="mt-5 text-sm text-[#98A1AE]">
              {contactEmail && (
                <p>
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">
                    {contactEmail}
                  </a>
                </p>
              )}
              {contactHours && <p className="mt-1">{contactHours}</p>}
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <p className="mb-4 text-sm font-bold text-white">{column.heading}</p>
              <ul className="space-y-2.5">
                {column.links.map(({ href, label }) => (
                  <li key={String(href)}>
                    <Link href={String(href)} className={linkClass}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <p className="mb-4 text-sm font-bold text-white">Legal</p>
            <ul className="space-y-2.5">
              {DEFAULT_LEGAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className={linkClass}>
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <CookieSettingsFooter />
              </li>
            </ul>
          </div>
        </div>

        {/*
         * Regulatory disclaimer: MatchMySolicitor introduces clients to
         * SRA-regulated firms, it is not a law firm itself. Stating that
         * plainly is what keeps the introducer model clean.
         */}
        <p className="mt-12 max-w-[860px] text-xs leading-relaxed text-[#6B7482]">
          MatchMySolicitor is an introducer service, not a firm of solicitors, and does not provide
          legal advice. We match enquiries with independent law firms regulated by the Solicitors
          Regulation Authority. Any advice you receive is given by the firm you are matched with,
          under their own regulatory responsibilities.
        </p>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[var(--mms-container)] flex-col items-center justify-between gap-3 px-6 py-5 sm:flex-row">
          <p className="text-xs text-[#6B7482]">{copyrightText}</p>
          <p className="text-xs text-[#6B7482]">
            Website designed by{' '}
            <a
              href="https://zenithics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Zenithics
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
