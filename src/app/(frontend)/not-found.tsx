import Link from 'next/link'
import React from 'react'
import { Button } from '@/components/ui/button'
import { getCachedGlobal } from '@/utilities/getGlobals'
import RichText from '@/components/RichText'

export default async function NotFound() {
  let settings: any = null
  try {
    settings = await getCachedGlobal('not-found-page', 3600)()
  } catch {
    // fall through to defaults
  }

  const heading = settings?.heading || 'Page Not Found'
  const subheading =
    settings?.subheading || "The page you're looking for doesn't exist or has been moved."
  const ctaText = settings?.ctaText || 'Go Home'
  const ctaUrl = settings?.ctaUrl || '/'
  const secondaryCtaText = settings?.secondaryCtaText || ''
  const secondaryCtaUrl = settings?.secondaryCtaUrl || ''
  const showSearchBar = settings?.showSearchBar !== false
  const suggestedLinks: { label: string; url: string }[] = settings?.suggestedLinks || []
  const bgImage =
    settings?.backgroundImage && typeof settings.backgroundImage === 'object'
      ? (settings.backgroundImage as any).url
      : null

  return (
    <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {bgImage && (
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />
      )}

      <div className="relative container py-24 text-center max-w-2xl">
        {/* Big 404 */}
        <p className="text-8xl font-bold text-primary/20 leading-none mb-4 font-serif">404</p>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{heading}</h1>

        <p className="text-muted-foreground text-lg mb-6">{subheading}</p>

        {settings?.body && (
          <div className="mb-6 text-left max-w-prose mx-auto">
            <RichText data={settings.body} enableGutter={false} />
          </div>
        )}

        {/* Search bar */}
        {showSearchBar && (
          <form
            action="/search"
            method="get"
            className="flex items-center gap-2 max-w-md mx-auto mb-8"
          >
            <input
              type="search"
              name="q"
              placeholder="Search the site…"
              autoComplete="off"
              className="flex-1 h-10 px-4 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <button
              type="submit"
              className="h-10 px-5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Button asChild>
            <Link href={ctaUrl}>{ctaText}</Link>
          </Button>
          {secondaryCtaText && secondaryCtaUrl && (
            <Button asChild variant="outline">
              <Link href={secondaryCtaUrl}>{secondaryCtaText}</Link>
            </Button>
          )}
        </div>

        {/* Suggested links */}
        {suggestedLinks.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">
              You might be looking for
            </p>
            <ul className="flex flex-wrap justify-center gap-2">
              {suggestedLinks.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="px-4 py-1.5 rounded-full border border-border text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
