'use client'

import React, { useEffect, useState } from 'react'

type CMSBranding = {
  siteName?: string
  adminIcon?: { url?: string; alt?: string } | null
  accentColor?: string
}

export default function AdminIcon() {
  const [branding, setBranding] = useState<CMSBranding>({ siteName: 'Zenithics' })

  useEffect(() => {
    fetch('/api/globals/cms-branding?depth=1')
      .then((r) => r.json())
      .then((data) => {
        if (data?.siteName || data?.adminIcon) setBranding(data)
      })
      .catch(() => {})
  }, [])

  if (branding.adminIcon && typeof branding.adminIcon === 'object' && branding.adminIcon.url) {
    return (
      <img
        src={branding.adminIcon.url}
        alt={branding.adminIcon.alt || 'Icon'}
        style={{ maxHeight: '24px', width: 'auto', objectFit: 'contain', display: 'block' }}
      />
    )
  }

  const initials = (branding.siteName || 'Ze').slice(0, 2)
  const accent = branding.accentColor || '#0066FF'

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '24px',
        height: '24px',
        borderRadius: '6px',
        backgroundColor: accent,
        color: '#ffffff',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontWeight: 700,
        fontSize: '13px',
        letterSpacing: '0.01em',
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  )
}
