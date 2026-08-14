'use client'

import React, { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

interface AdPixelsProps {
  metaPixelId?: string
  tiktokPixelId?: string
  redditPixelId?: string
  gadsConversionId?: string
  pinterestTagId?: string
  snapchatPixelId?: string
}

function getCookieConsent(): { analytics: boolean; advertising: boolean } | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.split('; ').find((row) => row.startsWith('cookie_consent='))
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match.split('=')[1]))
  } catch {
    return null
  }
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function AdPixels({
  metaPixelId,
  tiktokPixelId,
  redditPixelId,
  gadsConversionId,
  pinterestTagId,
  snapchatPixelId,
}: AdPixelsProps) {
  const pathname = usePathname()
  const initialised = useRef(false)

  const consent = getCookieConsent()
  const advertisingConsented = consent?.advertising === true

  // Fire PageView on route change
  useEffect(() => {
    if (!advertisingConsented) return

    if (metaPixelId && typeof (window as any).fbq === 'function') {
      ;(window as any).fbq('track', 'PageView', {}, { eventID: generateEventId() })
    }

    if (tiktokPixelId && typeof (window as any).ttq?.track === 'function') {
      ;(window as any).ttq.track('PageView')
    }

    if (redditPixelId && typeof (window as any).rdt === 'function') {
      ;(window as any).rdt('track', 'PageVisit')
    }

    if (pinterestTagId && typeof (window as any).pintrk === 'function') {
      ;(window as any).pintrk('track', 'pagevisit')
    }

    if (snapchatPixelId && typeof (window as any).snaptr === 'function') {
      ;(window as any).snaptr('track', 'PAGE_VIEW')
    }
  }, [pathname, advertisingConsented, metaPixelId, tiktokPixelId, redditPixelId, pinterestTagId, snapchatPixelId])

  if (!advertisingConsented) return null
  if (!metaPixelId && !tiktokPixelId && !redditPixelId && !gadsConversionId && !pinterestTagId && !snapchatPixelId) return null

  return (
    <>
      {/* Meta Pixel */}
      {metaPixelId && (
        <Script id="meta-pixel" strategy="afterInteractive" data-category="advertising">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView', {}, { eventID: '${generateEventId()}' });
          `}
        </Script>
      )}

      {/* TikTok Pixel */}
      {tiktokPixelId && (
        <Script id="tiktok-pixel" strategy="afterInteractive" data-category="advertising">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var r=document.createElement("script");r.type="text/javascript",r.async=!0,r.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(r,a)};
              ttq.load('${tiktokPixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}

      {/* Reddit Pixel */}
      {redditPixelId && (
        <Script id="reddit-pixel" strategy="afterInteractive" data-category="advertising">
          {`
            !function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/v2.js",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);
            rdt('init','${redditPixelId}');
            rdt('track', 'PageVisit');
          `}
        </Script>
      )}

      {/* Google Ads */}
      {gadsConversionId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gadsConversionId}`}
            strategy="afterInteractive"
            data-category="advertising"
          />
          <Script id="gads-init" strategy="afterInteractive" data-category="advertising">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gadsConversionId}');
            `}
          </Script>
        </>
      )}

      {/* Pinterest Tag */}
      {pinterestTagId && (
        <Script id="pinterest-tag" strategy="afterInteractive" data-category="advertising">
          {`
            !function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version="3.0";var t=document.createElement("script");t.async=!0,t.src=e;var r=document.getElementsByTagName("script")[0];r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
            pintrk('load', '${pinterestTagId}', { em: '' });
            pintrk('page');
          `}
        </Script>
      )}

      {/* Snapchat Pixel */}
      {snapchatPixelId && (
        <Script id="snapchat-pixel" strategy="afterInteractive" data-category="advertising">
          {`
            (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u)})(window,document,'https://sc-static.net/scevent.min.js');
            snaptr('init', '${snapchatPixelId}');
            snaptr('track', 'PAGE_VIEW');
          `}
        </Script>
      )}
    </>
  )
}
