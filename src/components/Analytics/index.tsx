import React from 'react'
import Script from 'next/script'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cookies } from 'next/headers'

async function getSEOSettings() {
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({ slug: 'seo-settings' })) as any
  } catch {
    return null
  }
}

function hasConsent(consentCookie: string | undefined, category: 'analytics' | 'advertising') {
  if (!consentCookie) return false
  try {
    const consent = JSON.parse(consentCookie)
    return consent[category] === true
  } catch {
    return false
  }
}

export async function Analytics() {
  const [seo, cookieStore] = await Promise.all([getSEOSettings(), cookies()])

  if (!seo) return null

  const consentCookie = cookieStore.get('cookie_consent')?.value
  const analyticsConsented = hasConsent(consentCookie, 'analytics')

  const {
    gtmId,
    ga4MeasurementId,
    clarityProjectId,
    hotjarSiteId,
    googleSearchConsoleCode,
    bingVerificationCode,
    merchantCenterVerification,
    appleSiteVerification,
  } = seo

  return (
    <>
      {/* Verification meta tags */}
      {googleSearchConsoleCode && (
        <meta name="google-site-verification" content={googleSearchConsoleCode} />
      )}
      {bingVerificationCode && (
        <meta name="msvalidate.01" content={bingVerificationCode} />
      )}
      {merchantCenterVerification && (
        <meta name="google-site-verification" content={merchantCenterVerification} />
      )}
      {appleSiteVerification && (
        <meta name="apple-site-verification" content={appleSiteVerification} />
      )}

      {/* Google Consent Mode v2 default — must run before any tracking */}
      <Script id="gcm-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'functionality_storage': 'granted',
            'security_storage': 'granted',
            'wait_for_update': 500,
          });
        `}
      </Script>

      {/* Only load tracking if analytics consent granted */}
      {analyticsConsented && (
        <>
          {/* Google Tag Manager (preferred over inline GA4) */}
          {gtmId && (
            <>
              <Script
                id="gtm-head"
                strategy="afterInteractive"
                data-category="analytics"
                dangerouslySetInnerHTML={{
                  __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`,
                }}
              />
              <noscript>
                <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                  height="0"
                  width="0"
                  style={{ display: 'none', visibility: 'hidden' }}
                />
              </noscript>
            </>
          )}

          {/* Inline GA4 (only if no GTM) */}
          {ga4MeasurementId && !gtmId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}`}
                strategy="afterInteractive"
                data-category="analytics"
              />
              <Script id="ga4-init" strategy="afterInteractive" data-category="analytics">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${ga4MeasurementId}');
                `}
              </Script>
            </>
          )}

          {/* Microsoft Clarity */}
          {clarityProjectId && (
            <Script id="clarity" strategy="afterInteractive" data-category="analytics">
              {`
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${clarityProjectId}");
              `}
            </Script>
          )}

          {/* Hotjar */}
          {hotjarSiteId && (
            <Script id="hotjar" strategy="afterInteractive" data-category="analytics">
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
      )}
    </>
  )
}
