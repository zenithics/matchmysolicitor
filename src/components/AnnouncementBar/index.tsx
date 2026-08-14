'use client'

import React, { useEffect, useState } from 'react'

interface AnnouncementBarProps {
  text: string
  linkUrl?: string
  linkText?: string
  backgroundColor?: string
  textColor?: string
  dismissible?: boolean
  showOnMobile?: boolean
  startsAt?: string | null
  expiresAt?: string | null
}

function getDismissKey(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }
  return `announcement-bar-${Math.abs(hash)}`
}

export const AnnouncementBarClient: React.FC<AnnouncementBarProps> = ({
  text,
  linkUrl,
  linkText,
  backgroundColor = '#E8177A',
  textColor = '#FFFFFF',
  dismissible = true,
  showOnMobile = true,
  startsAt,
  expiresAt,
}) => {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const now = new Date()
    if (startsAt && new Date(startsAt) > now) { return }
    if (expiresAt && new Date(expiresAt) < now) { return }

    const dismissKey = getDismissKey(text)
    const dismissed = sessionStorage.getItem(dismissKey)
    if (!dismissed) {
      setVisible(true)
    }
  }, [text, startsAt, expiresAt])

  const handleDismiss = () => {
    setVisible(false)
    const dismissKey = getDismissKey(text)
    sessionStorage.setItem(dismissKey, '1')
  }

  if (!mounted || !visible) return null

  const barStyle: React.CSSProperties = {
    backgroundColor,
    color: textColor,
  }

  const content = (
    <div
      className={`relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-center transition-all animate-in slide-in-from-top duration-300 ${!showOnMobile ? 'hidden sm:flex' : 'flex'}`}
      style={barStyle}
    >
      <span>{text}</span>
      {linkText && linkUrl && (
        <a
          href={linkUrl}
          style={{ color: textColor }}
          className="underline underline-offset-2 font-bold hover:opacity-80 transition-opacity ml-1"
        >
          {linkText} →
        </a>
      )}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full hover:opacity-70 transition-opacity"
          style={{ color: textColor }}
          aria-label="Dismiss announcement"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )

  if (linkUrl && !linkText) {
    return (
      <a href={linkUrl} className="block hover:opacity-90 transition-opacity">
        {content}
      </a>
    )
  }

  return content
}
