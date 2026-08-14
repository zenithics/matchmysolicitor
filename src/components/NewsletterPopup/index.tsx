'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface PopupSettings {
  popupEnabled?: boolean
  popupDelay?: number
  popupHeading?: string
  popupBody?: string
  popupImage?: { url?: string } | null
  popupDismissDays?: number
}

interface NewsletterPopupProps {
  settings: PopupSettings
}

function getDismissKey(heading: string): string {
  // Hash the heading so new messages show fresh
  let hash = 0
  for (let i = 0; i < heading.length; i++) {
    hash = (hash << 5) - hash + heading.charCodeAt(i)
    hash |= 0
  }
  return `newsletter-popup-dismissed-${Math.abs(hash)}`
}

export const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ settings }) => {
  const {
    popupEnabled,
    popupDelay = 5,
    popupHeading = 'Get 10% off your first order',
    popupBody = 'Join our mailing list for exclusive deals and new drops',
    popupImage,
    popupDismissDays = 7,
  } = settings

  const pathname = usePathname()
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Don't show on admin pages
  const isAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (!popupEnabled || isAdmin) return

    const dismissKey = getDismissKey(popupHeading)
    const dismissed = localStorage.getItem(dismissKey)

    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10)
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24)
      if (daysSince < popupDismissDays) return
    }

    const timer = setTimeout(() => setVisible(true), popupDelay * 1000)
    return () => clearTimeout(timer)
  }, [popupEnabled, popupDelay, popupHeading, popupDismissDays, isAdmin])

  const handleDismiss = () => {
    setVisible(false)
    const dismissKey = getDismissKey(popupHeading)
    localStorage.setItem(dismissKey, String(Date.now()))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
        // Auto-close after 3 seconds
        setTimeout(() => {
          setVisible(false)
          const dismissKey = getDismissKey(popupHeading)
          localStorage.setItem(dismissKey, String(Date.now() + popupDismissDays * 24 * 60 * 60 * 1000))
        }, 3000)
      } else {
        setError(data.message || 'Something went wrong.')
      }
    } catch {
      setError('Failed to subscribe. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!popupEnabled || !visible || isAdmin) return null

  return (
    <div
      className="fixed inset-0 z-[8000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss()
      }}
    >
      <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-border animate-in slide-in-from-bottom-4 duration-300">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Close popup"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Optional image */}
        {popupImage?.url && (
          <div className="aspect-[2/1] overflow-hidden">
            <img src={popupImage.url} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="p-6 text-center">
          <h2 className="font-serif text-2xl mb-2">{popupHeading}</h2>
          {popupBody && (
            <p className="text-sm text-muted-foreground mb-5">{popupBody}</p>
          )}

          {submitted ? (
            <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold">
              <span className="text-xl">✓</span>
              You're subscribed! Check your inbox.
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  required
                  placeholder="your@email.com"
                  disabled={loading}
                  className="flex-1 border border-border rounded-full px-4 py-2.5 text-sm bg-background focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {loading ? '…' : 'Subscribe'}
                </button>
              </form>
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              <button
                onClick={handleDismiss}
                className="text-xs text-muted-foreground mt-3 hover:underline"
              >
                No thanks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
