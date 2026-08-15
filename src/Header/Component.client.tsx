'use client'

import { useHeaderTheme } from '@/providers/HeaderTheme'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header, Media } from '@/payload-types'
import Image from 'next/image'

interface HeaderClientProps {
  data: Header
  logo?: Media | null
  brandName?: string
  /** Service pages grouped under a parent nav href, e.g. '/for-employers'. */
  dropdowns?: Record<string, { href: string; label: string }[]>
}

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

export const HeaderClient: React.FC<HeaderClientProps> = ({
  data,
  logo,
  brandName = 'Your Brand',
  dropdowns = {},
}) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    setMobileOpen(false)
    setOpenMenu(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])


  const navLeft = (data?.navItemsLeft ?? []).map((item: any) => ({
    href: resolveLinkHref(item.link),
    label: item.link?.label ?? '',
    newTab: item.link?.newTab ?? false,
  }))

  const navRight = (data?.navItemsRight ?? []).map((item: any) => ({
    href: resolveLinkHref(item.link),
    label: item.link?.label ?? '',
    newTab: item.link?.newTab ?? false,
  }))

  return (
    <>
      <header
        /* The design's header is flat and does not change on scroll — the
         * blur/shadow treatment was a starter invention. */
        className="sticky top-0 z-50 w-full bg-white border-b border-[#E4E7EC]"
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="mx-auto w-full max-w-[var(--mms-container)] px-6">
          <div className="flex h-[72px] items-center justify-between">

            {/* Left nav — desktop */}
            <nav className="hidden md:flex items-center gap-[26px] order-2 ml-10 mr-auto" aria-label="Primary navigation left">
              {navLeft.map(({ href, label, newTab }) => {
                const children = dropdowns[href]
                const isActive =
                  pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]))
                const linkClass = `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-foreground/80'
                }`

                if (!children?.length) {
                  return (
                    <Link
                      key={href}
                      href={href}
                      target={newTab ? '_blank' : undefined}
                      rel={newTab ? 'noopener noreferrer' : undefined}
                      className={linkClass}
                    >
                      {label}
                    </Link>
                  )
                }

                /*
                 * Hover opens the menu (matching the design) but the trigger is a
                 * real link, so keyboard and touch users still reach the overview
                 * page instead of being trapped by a hover-only control.
                 */
                return (
                  <div
                    key={href}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(href)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <Link
                      href={href}
                      className={`${linkClass} inline-flex items-center gap-1.5 py-2`}
                      aria-expanded={openMenu === href}
                      aria-haspopup="true"
                      onFocus={() => setOpenMenu(href)}
                    >
                      {label}
                      <span aria-hidden="true" className="text-[10px] leading-none">
                        ▾
                      </span>
                    </Link>
                    {openMenu === href && (
                      <div
                        role="menu"
                        className="absolute left-[-16px] top-full z-50 min-w-[280px] rounded-lg border border-border bg-white p-2 shadow-[0_8px_24px_rgba(26,31,38,0.10)]"
                      >
                        {children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            role="menuitem"
                            className="block rounded-md px-3 py-2.5 text-sm text-foreground/90 transition-colors hover:bg-muted hover:text-primary"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Logo — left aligned, matching the design's logo-left / nav-right header */}
            <Link
              href="/"
              className="order-first"
              aria-label="Home"
            >
              {logo?.url ? (
                <Image
                  src={logo.url}
                  alt={logo.alt || 'Logo'}
                  width={logo.width ?? 160}
                  height={logo.height ?? 40}
                  className="h-[38px] w-auto object-contain"
                  priority
                />
              ) : (
                /* Design ships the real wordmark as SVG; use it before falling
                   back to a text brand name. Static asset, so it does not
                   depend on the media upload path. */
                <Image
                  src="/logo.svg"
                  alt={brandName}
                  width={200}
                  height={37}
                  className="h-[38px] w-auto object-contain"
                  priority
                />
              )}
            </Link>

            {/* Right nav — desktop */}
            <div className="flex items-center gap-4 md:gap-6 order-3">
              <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation right">
                {navRight.map(({ href, label, newTab }) => (
                  <Link
                    key={href}
                    href={href}
                    target={newTab ? '_blank' : undefined}
                    rel={newTab ? 'noopener noreferrer' : undefined}
                    className={`text-[15px] font-semibold transition-colors hover:text-primary ${
                      pathname === href ? 'text-primary' : 'text-foreground/80'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Persistent CTA (.nav-cta in the design's stylesheet): visible at
                  every width and deliberately OUTSIDE the burger, so paid traffic
                  always has a one-tap route into the wizard. Not a CMS field yet
                  — that needs a schema change, which isn't worth the migration
                  risk tonight. */}
              <Link
                href="/enquiry"
                className="inline-flex items-center justify-center gap-2 shrink-0 min-h-[44px] whitespace-nowrap rounded-md bg-primary px-[18px] py-[11px] text-[15px] font-bold text-primary-foreground transition-colors hover:bg-[var(--mms-primary-hover)] max-[480px]:px-[14px] max-[480px]:text-[14px]"
              >
                Check your claim
              </Link>

              {/* Mobile hamburger */}
              <button
                className="md:hidden flex flex-col gap-1.5 p-2 -mr-2"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              >
                <span className={`block h-0.5 w-5 bg-foreground transition-transform duration-200 origin-center ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <span className={`block h-0.5 w-5 bg-foreground transition-opacity duration-200 ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-foreground transition-transform duration-200 origin-center ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${mobileOpen ? 'max-h-[32rem]' : 'max-h-0'}`}>
          <nav className="bg-white border-t px-6 py-4 flex flex-col gap-1">
            {[...navLeft, ...navRight].map(({ href, label, newTab }) => (
              <Link
                key={href}
                href={href}
                target={newTab ? '_blank' : undefined}
                rel={newTab ? 'noopener noreferrer' : undefined}
                className="py-3 text-sm font-medium border-b last:border-0 text-foreground hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}
