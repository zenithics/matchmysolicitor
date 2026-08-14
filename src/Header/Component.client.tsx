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

export const HeaderClient: React.FC<HeaderClientProps> = ({ data, logo }) => {
  const [theme, setTheme] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    setMobileOpen(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

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
        className={`sticky top-0 z-50 w-full transition-all duration-200 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm'
            : 'bg-background'
        }`}
        {...(theme ? { 'data-theme': theme } : {})}
      >
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Left nav — desktop */}
            <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation left">
              {navLeft.map(({ href, label, newTab }) => (
                <Link
                  key={href}
                  href={href}
                  target={newTab ? '_blank' : undefined}
                  rel={newTab ? 'noopener noreferrer' : undefined}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]))
                      ? 'text-primary'
                      : 'text-foreground/80'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Logo — centered */}
            <Link
              href="/"
              className="absolute left-1/2 -translate-x-1/2 md:relative md:left-auto md:translate-x-0"
              aria-label="Home"
            >
              {logo?.url ? (
                <Image
                  src={logo.url}
                  alt={logo.alt || 'Logo'}
                  width={logo.width ?? 160}
                  height={logo.height ?? 40}
                  className="h-8 w-auto object-contain"
                  priority
                />
              ) : (
                <span className="font-sans text-xl font-semibold tracking-tight text-foreground hover:text-primary transition-colors">
                  Your Brand
                </span>
              )}
            </Link>

            {/* Right nav — desktop */}
            <div className="flex items-center gap-4 md:gap-6">
              <nav className="hidden md:flex items-center gap-6" aria-label="Primary navigation right">
                {navRight.map(({ href, label, newTab }) => (
                  <Link
                    key={href}
                    href={href}
                    target={newTab ? '_blank' : undefined}
                    rel={newTab ? 'noopener noreferrer' : undefined}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === href ? 'text-primary' : 'text-foreground/80'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </nav>

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
