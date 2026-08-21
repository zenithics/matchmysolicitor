import React from 'react'
import Script from 'next/script'
import { getPayload } from 'payload'
import config from '@payload-config'

import { ConsentedScripts } from './ConsentedScripts'

async function getSEOSettings() {
  try {
    const payload = await getPayload({ config })
    return (await payload.findGlobal({ slug: 'seo-settings' })) as any
  } catch {
    return null
  }
}

export async function Analytics() {
  // Deliberately does NOT read cookies: reading them opts every page into
  // per-request rendering and makes the HTML uncacheable at the CDN. GTM is
  // consent-mode aware, and the remaining non-aware tools are gated in the
  // browser by ConsentedScripts instead.
  const seo = await getSEOSettings()

  if (!seo) return null

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
      {bingVerificationCode && <meta name="msvalidate.01" content={bingVerificationCode} />}
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

      {/*
        Google Tag Manager loads on every page view regardless of consent.
        Consent Mode v2 (defaulted to denied above) is what governs storage and
        data transmission; the CookieConsent banner issues a `consent update`
        when the visitor chooses. Gating the container itself behind acceptance
        breaks consent modelling and makes Tag Assistant report a missing CMP
        signal, so only non-consent-aware tools stay behind the gate below.
      */}
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

      {/* Inline GA4 (only if no GTM) — also consent-mode aware */}
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

      <ConsentedScripts clarityProjectId={clarityProjectId} hotjarSiteId={hotjarSiteId} />
    </>
  )
}
