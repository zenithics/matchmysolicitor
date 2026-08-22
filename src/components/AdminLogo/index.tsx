'use client'

import React, { useEffect, useState } from 'react'

type CMSBranding = {
  siteName?: string
  adminLogo?: { url?: string; alt?: string } | null
}

/**
 * Admin panel logo.
 *
 * Note for future builds: this is a CODE asset, not a Media upload. The default
 * files live at public/logo.svg (dark wordmark, light backgrounds) and
 * public/logo-white.svg (white wordmark, dark backgrounds). The login screen and
 * the admin panel in dark mode both use a dark background, so the white variant
 * is swapped in via CSS on [data-theme="dark"]. An editor can still override
 * both with a single upload in CMS Branding > Admin logo.
 */
export default function AdminLogo() {
  const [branding, setBranding] = useState<CMSBranding>({ siteName: 'MatchMySolicitor' })

  useEffect(() => {
    fetch('/api/globals/cms-branding?depth=1')
      .then((r) => r.json())
      .then((data) => {
        if (data?.siteName || data?.adminLogo) setBranding(data)
      })
      .catch(() => {})
  }, [])

  if (branding.adminLogo && typeof branding.adminLogo === 'object' && branding.adminLogo.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={branding.adminLogo.url}
        alt={branding.adminLogo.alt || branding.siteName || 'Logo'}
        style={{ maxHeight: '40px', maxWidth: '180px', objectFit: 'contain' }}
      />
    )
  }

  const alt = branding.siteName || 'MatchMySolicitor'

  return (
    <span className="zx-admin-logo" style={{ display: 'inline-flex' }}>
      <style>{`
        .zx-admin-logo img { height: 32px; width: auto; object-fit: contain; }
        .zx-admin-logo .zx-logo-dark { display: block; }
        .zx-admin-logo .zx-logo-light { display: none; }
        [data-theme='dark'] .zx-admin-logo .zx-logo-dark { display: none; }
        [data-theme='dark'] .zx-admin-logo .zx-logo-light { display: block; }
        @media (prefers-color-scheme: dark) {
          html:not([data-theme='light']) .zx-admin-logo .zx-logo-dark { display: none; }
          html:not([data-theme='light']) .zx-admin-logo .zx-logo-light { display: block; }
        }
      `}</style>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="zx-logo-dark" src="/logo.svg" alt={alt} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="zx-logo-light" src="/logo-white.svg" alt={alt} />
    </span>
  )
}
