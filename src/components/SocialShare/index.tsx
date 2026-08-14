'use client'

import React, { useState } from 'react'
import { cn } from '@/utilities/ui'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  image?: string
  variant?: 'inline' | 'floating'
  className?: string
}

function openShare(shareUrl: string, width = 600, height = 400) {
  const left = (window.screen.width - width) / 2
  const top = (window.screen.height - height) / 2
  window.open(shareUrl, '_blank', `width=${width},height=${height},left=${left},top=${top},scrollbars=yes`)
}

const ShareIcon = ({
  children,
  label,
  onClick,
  className,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  className?: string
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    title={label}
    className={cn(
      'w-9 h-9 flex items-center justify-center rounded-full border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground transition-all hover:scale-110 active:scale-95',
      className,
    )}
  >
    {children}
  </button>
)

export const SocialShare: React.FC<SocialShareProps> = ({
  url,
  title,
  description,
  image,
  variant = 'inline',
  className,
}) => {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const buttons = (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Facebook */}
      <ShareIcon
        label="Share on Facebook"
        onClick={() => openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      </ShareIcon>

      {/* X / Twitter */}
      <ShareIcon
        label="Share on X (Twitter)"
        onClick={() =>
          openShare(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)
        }
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </ShareIcon>

      {/* LinkedIn */}
      <ShareIcon
        label="Share on LinkedIn"
        onClick={() =>
          openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`)
        }
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </ShareIcon>

      {/* WhatsApp */}
      <ShareIcon
        label="Share on WhatsApp"
        onClick={() =>
          openShare(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, 600, 700)
        }
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </ShareIcon>

      {/* Pinterest — only if image */}
      {image && (
        <ShareIcon
          label="Save to Pinterest"
          onClick={() =>
            openShare(
              `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image)}&description=${encodedTitle}`,
            )
          }
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
          </svg>
        </ShareIcon>
      )}

      {/* Email */}
      <ShareIcon
        label="Share via Email"
        onClick={() => {
          window.location.href = `mailto:?subject=${encodedTitle}&body=${encodedUrl}`
        }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </ShareIcon>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        aria-label="Copy link"
        title={copied ? 'Copied!' : 'Copy link'}
        className={cn(
          'h-9 flex items-center gap-1.5 px-3 rounded-full border text-xs font-medium transition-all',
          copied
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        {copied ? (
          <>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Copy Link
          </>
        )}
      </button>
    </div>
  )

  if (variant === 'floating') {
    return (
      <>
        {/* Desktop: sticky sidebar */}
        <div
          className={cn(
            'hidden lg:flex flex-col gap-2 fixed left-4 top-1/2 -translate-y-1/2 z-50',
            className,
          )}
        >
          {buttons}
        </div>

        {/* Mobile: bottom bar */}
        <div
          className={cn(
            'lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-3',
            className,
          )}
        >
          <p className="text-xs text-muted-foreground mb-2 font-medium">Share</p>
          {buttons}
        </div>
      </>
    )
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Share</p>
      {buttons}
    </div>
  )
}
