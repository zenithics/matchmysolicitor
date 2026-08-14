import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { SiteAppearance } from '@/payload-types'

const FONT_WEIGHTS: Record<string, string> = {
  Inter: '300;400;500;600;700;800',
  Poppins: '300;400;500;600;700;800',
  Montserrat: '300;400;500;600;700;800',
  'Playfair Display': '400;500;600;700;800',
  'DM Sans': '300;400;500;600;700',
  Outfit: '300;400;500;600;700;800',
  Sora: '300;400;500;600;700;800',
  'Space Grotesk': '300;400;500;600;700',
  'Open Sans': '300;400;500;600;700;800',
  Lato: '300;400;700',
  Nunito: '300;400;500;600;700;800',
  'Source Sans 3': '300;400;500;600;700',
  'Work Sans': '300;400;500;600;700',
}

const FONT_STACK: Record<string, string> = {
  Inter: "'Inter', system-ui, sans-serif",
  Poppins: "'Poppins', system-ui, sans-serif",
  Montserrat: "'Montserrat', system-ui, sans-serif",
  'Playfair Display': "'Playfair Display', Georgia, serif",
  'DM Sans': "'DM Sans', system-ui, sans-serif",
  Outfit: "'Outfit', system-ui, sans-serif",
  Sora: "'Sora', system-ui, sans-serif",
  'Space Grotesk': "'Space Grotesk', system-ui, sans-serif",
  'Open Sans': "'Open Sans', system-ui, sans-serif",
  Lato: "'Lato', system-ui, sans-serif",
  Nunito: "'Nunito', system-ui, sans-serif",
  'Source Sans 3': "'Source Sans 3', system-ui, sans-serif",
  'Work Sans': "'Work Sans', system-ui, sans-serif",
  // Fallback for existing fonts from next/font (handled by layout variables)
  'DM Serif Display': 'var(--font-dm-serif), Georgia, serif',
  'Plus Jakarta Sans': 'var(--font-jakarta), system-ui, sans-serif',
}

function buildGoogleFontsUrl(fonts: string[]): string | null {
  const unique = [...new Set(fonts)].filter((f) => FONT_WEIGHTS[f])
  if (!unique.length) return null

  const families = unique.map((font) => {
    const encoded = font.replace(/ /g, '+')
    const weights = FONT_WEIGHTS[font]
    return `family=${encoded}:wght@${weights}`
  })

  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`
}

export async function ThemeProvider() {
  let appearance: SiteAppearance | null = null

  try {
    const payload = await getPayload({ config: configPromise })
    appearance = await payload.findGlobal({ slug: 'site-appearance', depth: 0 })
  } catch {
    // No database connection at build time — silently skip, defaults apply
    return null
  }

  if (!appearance) return null

  const headingFont = appearance.headingFont || 'DM Serif Display'
  const bodyFont = appearance.bodyFont || 'Plus Jakarta Sans'

  // CSS vars to inject at runtime
  const vars: Record<string, string> = {
    '--color-primary': appearance.primaryColour || '',
    '--color-secondary': appearance.secondaryColour || '',
    '--color-accent': appearance.accentColour || '',
    '--color-bg': appearance.backgroundColour || '',
    '--color-text': appearance.textColour || '',
    '--color-header-bg': appearance.headerBgColour || '',
    '--color-footer-bg': appearance.footerBgColour || '',
    '--font-heading': FONT_STACK[headingFont] || FONT_STACK['DM Serif Display'],
    '--font-body': FONT_STACK[bodyFont] || FONT_STACK['Plus Jakarta Sans'],
    '--size-h1': appearance.h1Size || '3.5rem',
    '--size-h2': appearance.h2Size || '2.5rem',
    '--size-h3': appearance.h3Size || '2rem',
    '--size-h4': appearance.h4Size || '1.5rem',
    '--size-h5': appearance.h5Size || '1.25rem',
    '--size-body': appearance.bodySize || '1rem',
    '--weight-heading': appearance.fontWeightHeading || '700',
    '--weight-body': appearance.fontWeightBody || '400',
  }

  // Strip empty values so we don't override with blank strings
  const cssBody = Object.entries(vars)
    .filter(([, v]) => v)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')

  const css = `:root {\n${cssBody}\n}`

  // Only load external Google Fonts when a non-default font is chosen
  const fontsToLoad = [headingFont, bodyFont].filter((f) => FONT_WEIGHTS[f])
  const googleFontsUrl = fontsToLoad.length ? buildGoogleFontsUrl(fontsToLoad) : null

  return (
    <>
      {googleFontsUrl && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="stylesheet" href={googleFontsUrl} />
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  )
}
