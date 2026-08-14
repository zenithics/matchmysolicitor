'use client'

import React, { useEffect, useRef, useState } from 'react'
import RichText from '@/components/RichText'
import { sanitizeHtml } from '@/utilities/sanitizeHtml'

interface PopupData {
  id: string
  name: string
  layout: 'newsletter' | 'announcement' | 'discount' | 'custom'
  heading?: string
  body?: any
  image?: { url: string; alt?: string } | null
  discountCode?: string
  ctaText?: string
  ctaUrl?: string
  successMessage?: string
  customHtml?: string
  triggerType: 'delay' | 'exit_intent' | 'scroll' | 'immediate'
  triggerDelay?: number
  triggerScrollPercent?: number
  dismissDays?: number
  showOncePerSession?: boolean
  urlCondition?: string
  size: 'small' | 'medium' | 'large' | 'banner'
  position: 'center' | 'bottom_left' | 'bottom_right' | 'bottom_center'
  showCloseButton?: boolean
  overlayDismiss?: boolean
  backgroundColor?: string
}

interface PopupRendererProps {
  popups: PopupData[]
}

function getDismissKey(id: string) {
  return `popup-dismissed-${id}`
}

function isDismissed(popup: PopupData): boolean {
  try {
    if (popup.showOncePerSession) {
      return Boolean(sessionStorage.getItem(getDismissKey(popup.id)))
    }
    const stored = localStorage.getItem(getDismissKey(popup.id))
    if (!stored) return false
    if (popup.dismissDays === 0) return true
    const dismissedAt = parseInt(stored, 10)
    const days = popup.dismissDays ?? 30
    return Date.now() - dismissedAt < days * 24 * 60 * 60 * 1000
  } catch {
    return false
  }
}

function recordDismiss(popup: PopupData) {
  try {
    if (popup.showOncePerSession) {
      sessionStorage.setItem(getDismissKey(popup.id), '1')
    } else {
      localStorage.setItem(getDismissKey(popup.id), String(Date.now()))
    }
  } catch {
    // ignore storage errors
  }
}

function checkUrlCondition(condition?: string): boolean {
  if (!condition) return true
  return window.location.pathname.includes(condition)
}

const sizeClasses = {
  small: 'max-w-sm',
  medium: 'max-w-lg',
  large: 'max-w-2xl',
  banner: 'max-w-none w-full',
}

const positionClasses = {
  center: 'fixed inset-0 flex items-center justify-center z-[9000]',
  bottom_left: 'fixed bottom-4 left-4 z-[9000] flex items-end justify-start',
  bottom_right: 'fixed bottom-4 right-4 z-[9000] flex items-end justify-end',
  bottom_center: 'fixed bottom-4 left-0 right-0 z-[9000] flex items-end justify-center',
}

function SinglePopup({ popup, onClose }: { popup: PopupData; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isCenter = popup.position === 'center'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Failed to subscribe')
      setSubmitted(true)
      setTimeout(onClose, 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const cardStyle: React.CSSProperties = {}
  if (popup.backgroundColor) cardStyle.backgroundColor = popup.backgroundColor

  const card = (
    <div
      className={`relative bg-card rounded-2xl shadow-2xl overflow-hidden w-full ${sizeClasses[popup.size]}`}
      style={cardStyle}
      role="dialog"
      aria-modal="true"
      aria-label={popup.heading || popup.name}
      onClick={(e) => e.stopPropagation()}
    >
      {popup.showCloseButton !== false && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-background/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close popup"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}

      <div className={`flex flex-col ${popup.image ? 'sm:flex-row' : ''}`}>
        {popup.image && (
          <div className={`shrink-0 ${popup.image ? 'sm:w-48 h-48 sm:h-auto' : ''}`}>
            <img
              src={popup.image.url}
              alt={popup.image.alt || ''}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 flex flex-col gap-3 flex-1">
          {submitted ? (
            <p className="text-center text-sm font-medium text-emerald-600 py-4">
              {popup.successMessage || "You're in!"}
              {popup.layout === 'discount' && popup.discountCode && (
                <span className="block mt-2 font-mono text-lg font-bold tracking-widest text-primary">
                  {popup.discountCode}
                </span>
              )}
            </p>
          ) : (
            <>
              {popup.heading && (
                <h2 className="text-xl font-bold text-foreground leading-tight">{popup.heading}</h2>
              )}
              {popup.body && (
                <div className="text-sm text-muted-foreground">
                  <RichText data={popup.body} enableGutter={false} />
                </div>
              )}
              {popup.layout === 'custom' && popup.customHtml && (
                <div
                  className="text-sm"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(popup.customHtml) }}
                />
              )}

              {(popup.layout === 'newsletter' || popup.layout === 'discount') && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    required
                    className="h-10 px-4 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {error && <p className="text-xs text-destructive">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-10 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                  >
                    {loading ? 'Please wait…' : popup.ctaText || 'Subscribe'}
                  </button>
                </form>
              )}

              {popup.layout === 'announcement' && popup.ctaUrl && (
                <a
                  href={popup.ctaUrl}
                  className="mt-1 inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {popup.ctaText || 'Learn More'}
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div
      className={positionClasses[popup.position]}
      onClick={popup.overlayDismiss !== false && isCenter ? onClose : undefined}
    >
      {isCenter && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
      )}
      <div className="relative z-10 w-full px-4 flex justify-center">
        {card}
      </div>
    </div>
  )
}

export const PopupRenderer: React.FC<PopupRendererProps> = ({ popups }) => {
  const [activePopup, setActivePopup] = useState<PopupData | null>(null)
  const [queue, setQueue] = useState<PopupData[]>([])
  const mounted = useRef(false)

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true

    const eligible = popups.filter((p) => {
      if (isDismissed(p)) return false
      if (!checkUrlCondition(p.urlCondition)) return false
      return true
    })

    if (eligible.length === 0) return

    // Sort: immediate first, then by delay
    const sorted = [...eligible].sort((a, b) => {
      if (a.triggerType === 'immediate') return -1
      if (b.triggerType === 'immediate') return 1
      return 0
    })

    setQueue(sorted)
  }, [popups])

  useEffect(() => {
    if (queue.length === 0 || activePopup) return

    const popup = queue[0]

    const show = () => setActivePopup(popup)

    if (popup.triggerType === 'immediate') {
      show()
      return
    }

    if (popup.triggerType === 'delay') {
      const delay = (popup.triggerDelay ?? 5) * 1000
      const t = setTimeout(show, delay)
      return () => clearTimeout(t)
    }

    if (popup.triggerType === 'exit_intent') {
      const handler = (e: MouseEvent) => {
        if (e.clientY <= 0) show()
      }
      document.addEventListener('mouseleave', handler)
      return () => document.removeEventListener('mouseleave', handler)
    }

    if (popup.triggerType === 'scroll') {
      const pct = popup.triggerScrollPercent ?? 50
      const handler = () => {
        const scrolled =
          (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        if (scrolled >= pct) show()
      }
      window.addEventListener('scroll', handler, { passive: true })
      return () => window.removeEventListener('scroll', handler)
    }
  }, [queue, activePopup])

  const handleClose = () => {
    if (activePopup) recordDismiss(activePopup)
    setActivePopup(null)
    setQueue((q) => q.slice(1))
  }

  if (!activePopup) return null

  return <SinglePopup popup={activePopup} onClose={handleClose} />
}
