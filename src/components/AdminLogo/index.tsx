'use client'

import React, { useEffect, useState } from 'react'

type CMSBranding = {
  siteName?: string
  adminLogo?: { url?: string; alt?: string } | null
}

export default function AdminLogo() {
  const [branding, setBranding] = useState<CMSBranding>({ siteName: 'Zenithics' })

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
      <img
        src={branding.adminLogo.url}
        alt={branding.adminLogo.alt || branding.siteName || 'Logo'}
        style={{ maxHeight: '40px', maxWidth: '180px', objectFit: 'contain' }}
      />
    )
  }

  return (
    <span
      style={{
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 700,
        fontSize: '18px',
        letterSpacing: '-0.02em',
        color: 'var(--theme-text)',
      }}
    >
      {branding.siteName || 'Zenithics'}
    </span>
  )
}
