import type { Metadata } from 'next'

import { cn } from '@/utilities/ui'
import { GeistMono } from 'geist/font/mono'
import { DM_Serif_Display, Inter, Plus_Jakarta_Sans } from 'next/font/google'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { organizationSchema, websiteSchema } from '@/utilities/generateJsonLd'
import { Analytics } from '@/components/Analytics'
import { AdPixelsLoader } from '@/components/AdPixels/AdPixelsLoader'
import { CookieConsentLoader } from '@/components/CookieConsent/CookieConsentLoader'
import { ThemeProvider } from '@/components/ThemeProvider'
import { AccessibilityWidget } from '@/components/AccessibilityWidget'
import { ContactWidgetLoader } from '@/components/ContactWidget/ContactWidgetLoader'
import { CustomHeadScripts, CustomBodyScripts, CustomBodyStartScripts } from '@/components/CustomScripts'
import { NewsletterPopupLoader } from '@/components/NewsletterPopup/NewsletterPopupLoader'
import { AnnouncementBarLoader } from '@/components/AnnouncementBar/AnnouncementBarLoader'
import { PopupLoader } from '@/components/PopupRenderer/PopupLoader'
import { getLocaleSettings } from '@/utilities/siteSettings'
import { draftMode } from 'next/headers'

import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

// The Claude Design export sets font-family:'Plus Jakarta Sans' on 255
// elements, and ThemeProvider's FONT_STACK maps that name to var(--font-jakarta).
// Nothing defined that variable, so selecting the design's typeface in the CMS
// silently fell back to system-ui. next/font self-hosts the files and handles
// font-display: swap, so no Google <link> is needed.
const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-jakarta',
  display: 'swap',
})

// FONT_STACK maps the starter's default heading font to var(--font-dm-serif),
// which nothing defined — the same latent bug Plus Jakarta Sans had. Loading it
// here means ThemeProvider can skip the Google request for it entirely.
const dmSerif = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()
  const { getPayload } = await import('payload')
  const payloadConfig = (await import('@payload-config')).default
  const payload = await getPayload({ config: payloadConfig })
  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' }).catch(() => null)) as any

  const [orgSchema, webSchema, locale] = await Promise.all([
    seoSettings?.schemaOrganization !== false ? organizationSchema() : null,
    seoSettings?.schemaWebsite !== false ? websiteSchema() : null,
    getLocaleSettings(),
  ])
  // Analytics is rendered inside <head> via the component

  return (
    <html
      className={cn(
        GeistMono.variable,
        inter.variable,
        jakarta.variable,
        dmSerif.variable,
      )}
      lang={locale.language}
      suppressHydrationWarning
    >
      <head>
        <ThemeProvider />
        <InitTheme />
        <Analytics />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
        <link rel="alternate" type="text/plain" href="/llms.txt" title="LLM-friendly site summary" />
        <link rel="alternate" type="application/rss+xml" title="Blog RSS Feed" href="/feed.xml" />
        <link rel="alternate" type="application/feed+json" title="Blog JSON Feed" href="/feed.json" />
        <CustomHeadScripts />
        {orgSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
          />
        )}
        {webSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
          />
        )}
      </head>
      <body>
        <CustomBodyStartScripts />
        {/* Skip to main content — first focusable element, WCAG 2.2 AA */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded focus:font-medium focus:shadow-lg"
        >
          Skip to main content
        </a>
        <AdPixelsLoader />
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <AnnouncementBarLoader />
          <Header />
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <CookieConsentLoader />
          <AccessibilityWidget />
          <ContactWidgetLoader />
          <NewsletterPopupLoader />
          <PopupLoader />
          <CustomBodyScripts />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
  },
}
