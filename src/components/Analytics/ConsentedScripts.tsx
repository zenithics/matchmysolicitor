'use client'

import React, { useEffect, useState } from 'react'
import Script from 'next/script'

import { hasConsent, onConsentChange } from '@/utilities/cookieConsent'

/**
 * Wraps tracking tools that are NOT Google Consent Mode aware (Clarity,
 * Hotjar). Gating these on the server meant reading the consent cookie during
 * render, which forced every page to be rendered per request and prevented any
 * CDN caching. Doing it in the browser keeps the HTML identical for everyone.
 */
export const ConsentedScripts: React.FC<{
  clarityProjectId?: string | null
  hotjarSiteId?: string | null
}> = ({ clarityProjectId, hotjarSiteId }) => {
  const [granted, setGranted] = useState(false)

  useEffect(() => {
    setGranted(hasConsent('analytics'))
    return onConsentChange((consent) => setGranted(consent.analytics === true))
  }, [])

  if (!granted) return null

  return (
    <>
      {clarityProjectId && (
        <Script id="clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${clarityProjectId}");
          `}
        </Script>
      )}

      {hotjarSiteId && (
        <Script id="hotjar" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${hotjarSiteId},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </>
  )
}
