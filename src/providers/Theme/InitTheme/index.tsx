import Script from 'next/script'
import React from 'react'

import { defaultTheme, themeLocalStorageKey } from '../ThemeSelector/types'

export const InitTheme: React.FC = () => {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script
      dangerouslySetInnerHTML={{
        __html: `
  // The MatchMySolicitor design has no dark variant: the SiteAppearance global pins
  // light backgrounds, so honouring prefers-color-scheme produced pale text on a pale
  // background. Force light until a dark palette is actually designed.
  document.documentElement.setAttribute('data-theme', 'light');
  `,
      }}
      id="theme-script"
      strategy="beforeInteractive"
    />
  )
}
