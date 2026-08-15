import Link from 'next/link'
import Image from 'next/image'
import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
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

const DEFAULT_SERVICES_LINKS = [
  { href: '/for-employers', label: 'For Employers' },
  { href: '/for-employees', label: 'For Employees' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/employment-solicitors', label: 'Employment solicitors near you' },
  { href: '/enquiry', label: 'Free enquiry' },
]

const DEFAULT_GUIDES_LINKS = [
  { href: '/guides', label: 'All guides' },
  { href: '/guides/category/dismissal', label: 'Dismissal' },
  { href: '/guides/category/exit-negotiations', label: 'Exit negotiations' },
  { href: '/guides/category/tribunal-process', label: 'Tribunal process' },
  { href: '/guides/category/discrimination', label: 'Discrimination' },
]

const DEFAULT_COMPANY_LINKS = [
  { href: '/about', label: 'About us' },
  { href: '/contact', label: 'Contact' },
  { href: '/how-it-works', label: 'How we vet our panel' },
]

const DEFAULT_LEGAL_LINKS = [
  { href: '/legal/privacy-policy', label: 'Privacy policy' },
  { href: '/legal/terms-of-use', label: 'Terms of use' },
  { href: '/legal/cookie-policy', label: 'Cookie policy' },
  { href: '/legal/complaints', label: 'Complaints' },
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

  const brandName = footerData?.brandName ?? 'Your Brand'
  const brandTagline = footerData?.brandTagline ?? 'Your tagline goes here. Edit this in the Footer settings.'

  const col1Heading = footerData?.column1Heading ?? 'Services'
  const col2Heading = footerData?.column2Heading ?? 'Guides'
  const col3Heading = footerData?.column3Heading ?? 'Company'
  const col4Heading = footerData?.column4Heading ?? 'Legal'

  type NavItem = { href: string; label: string }

  const col1Links: NavItem[] = footerData?.column1Links?.length
    ? footerData.column1Links.map((item: any): NavItem => ({ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }))
    : DEFAULT_SERVICES_LINKS

  const col2Links: NavItem[] = footerData?.column2Links?.length
    ? footerData.column2Links.map((item: any): NavItem => ({ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }))
    : DEFAULT_GUIDES_LINKS

  const col3Links: NavItem[] = footerData?.column3Links?.length
    ? footerData.column3Links.map((item: any): NavItem => ({ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }))
    : DEFAULT_COMPANY_LINKS

  const col4Links: NavItem[] = footerData?.column4Links?.length
    ? footerData.column4Links.map((item: any): NavItem => ({ href: resolveLinkHref(item.link), label: item.link?.label ?? '' }))
    : DEFAULT_LEGAL_LINKS

  const regulatoryDisclaimer =
    footerData?.regulatoryDisclaimer ??
    'MatchMySolicitor is a matching service and is not a firm of solicitors. We do not provide legal advice. All firms on our panel are regulated by the Solicitors Regulation Authority.'

  const copyrightRaw = footerData?.copyrightText ?? `© {year} Your Brand. All rights reserved.`
  const copyrightText = copyrightRaw.replace('{year}', String(year))

  const columns = [
    { heading: col1Heading, links: col1Links },
    { heading: col2Heading, links: col2Links },
    { heading: col3Heading, links: col3Links },
  ]

  return (
    <footer className="mt-auto bg-(--brand-footer-bg) text-(--mms-footer-muted) text-sm">
      <div className="container-inner sp-56-32 grid grid-cols-[1.6fr_1fr_1fr_1fr_1fr] gap-10 max-[980px]:grid-cols-2 max-[560px]:grid-cols-1">
        {/* Brand */}
        <div className="flex flex-col gap-3 max-[980px]:col-span-2 max-[560px]:col-span-1">
          <Link href="/" className="self-start" aria-label={brandName}>
            <Image
              src="/logo-reversed.svg"
              alt={brandName}
              width={200}
              height={42}
              className="h-[42px] w-auto object-contain"
            />
          </Link>
          <p className="m-0 leading-relaxed max-w-[38ch]">{brandTagline}</p>
        </div>

        {columns.map(({ heading, links }) => (
          <div key={heading} className="flex flex-col gap-2.5">
            <div className="text-white font-bold">{heading}</div>
            {links.map(({ href, label }) => (
              <Link
                key={String(href)}
                href={String(href)}
                className="footer-link text-(--mms-footer-muted) no-underline hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        ))}

        {/* Legal — links plus the cookie settings trigger */}
        <div className="flex flex-col gap-2.5">
          <div className="text-white font-bold">{col4Heading}</div>
          {col4Links.map(({ href, label }) => (
            <Link
              key={String(href)}
              href={String(href)}
              className="footer-link text-(--mms-footer-muted) no-underline hover:text-white transition-colors"
            >
              {label}
            </Link>
          ))}
          <CookieSettingsFooter />
        </div>
      </div>

      <div className="container-inner sp-0-32">
        <div className="border-t border-(--mms-footer-border) pt-6 flex flex-col gap-3 text-xs text-(--mms-muted-light) leading-relaxed">
          <p className="m-0 text-(--mms-footer-muted) max-w-[96ch]">{regulatoryDisclaimer}</p>
          <div>{copyrightText}</div>
          <div>
            Website designed by{' '}
            <a
              href="https://zenithics.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--mms-footer-muted) hover:text-white transition-colors"
            >
              Zenithics
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
