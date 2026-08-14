'use client'

import React, { useEffect, useRef, useState } from 'react'
import type { ContactWidget as ContactWidgetType } from '@/payload-types'

type Channel = NonNullable<ContactWidgetType['channels']>[number]
type FaqItem = NonNullable<ContactWidgetType['faqItems']>[number]

const ICONS: Record<string, React.ReactNode> = {
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.12 1.524 5.847L0 24l6.305-1.508A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.89 0-3.661-.52-5.168-1.424l-.371-.218-3.741.895.913-3.645-.24-.378A9.953 9.953 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/>
    </svg>
  ),
  messenger: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.497 1.745 6.616 4.472 8.652V24l4.086-2.242c1.09.301 2.246.464 3.442.464 6.627 0 12-4.975 12-11.111C24 4.975 18.627 0 12 0zm1.193 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z"/>
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
}

function useScriptLoader() {
  return (src: string, id: string) => {
    if (document.getElementById(id)) return
    const s = document.createElement('script')
    s.id = id
    s.src = src
    s.async = true
    document.body.appendChild(s)
  }
}

export function ContactWidget({ data }: { data: ContactWidgetType }) {
  const [open, setOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const loadScript = useScriptLoader()

  const {
    enabled = true,
    position = 'bottom-right',
    greeting = 'Hi! How can we help?',
    primaryColor,
    channels = [],
    faqItems = [],
  } = data

  const color = primaryColor || 'var(--color-primary, #E8177A)'
  const posClass = position === 'bottom-left' ? 'left-6' : 'right-6'

  // Close on Escape / click outside
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) && e.target !== triggerRef.current) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const channelList = channels ?? []
  const faqList = faqItems ?? []

  if (!enabled || (!channelList.length && !faqList.length)) return null

  const handleChannel = (ch: Channel) => {
    switch (ch.channelType) {
      case 'whatsapp': {
        const msg = encodeURIComponent(ch.defaultMessage || '')
        const num = (ch.phoneNumber || '').replace(/\D/g, '')
        window.open(`https://wa.me/${num}${msg ? `?text=${msg}` : ''}`, '_blank', 'noopener')
        break
      }
      case 'messenger': {
        window.open(`https://m.me/${ch.facebookPageId}`, '_blank', 'noopener')
        break
      }
      case 'tawkto': {
        if (ch.tawktoPropertyId && ch.tawktoWidgetId) {
          const scriptUrl = `https://embed.tawk.to/${ch.tawktoPropertyId}/${ch.tawktoWidgetId}`
          loadScript(scriptUrl, `tawk-${ch.id}`)
          setTimeout(() => {
            // @ts-expect-error tawk global
            if (window.Tawk_API?.toggle) window.Tawk_API.toggle()
          }, 500)
        }
        break
      }
      case 'crisp': {
        if (ch.crispWebsiteId) {
          // @ts-expect-error crisp global
          window.CRISP_WEBSITE_ID = ch.crispWebsiteId
          loadScript('https://client.crisp.chat/l.js', `crisp-${ch.id}`)
          setTimeout(() => {
            // @ts-expect-error crisp global
            if (window.$crisp?.push) window.$crisp.push(['do', 'chat:open'])
          }, 500)
        }
        break
      }
      case 'tidio': {
        if (ch.tidioPublicKey) {
          loadScript(`//code.tidio.co/${ch.tidioPublicKey}.js`, `tidio-${ch.id}`)
          setTimeout(() => {
            // @ts-expect-error tidio global
            if (window.tidioChatApi?.open) window.tidioChatApi.open()
          }, 500)
        }
        break
      }
      case 'custom': {
        if (ch.embedCode) {
          const el = document.getElementById(`custom-embed-${ch.id}`)
          if (!el) {
            const div = document.createElement('div')
            div.id = `custom-embed-${ch.id}`
            div.innerHTML = ch.embedCode
            div.querySelectorAll('script').forEach((s) => {
              const ns = document.createElement('script')
              if (s.src) ns.src = s.src
              else ns.textContent = s.textContent
              ns.async = true
              document.body.appendChild(ns)
            })
            document.body.appendChild(div)
          }
        }
        break
      }
    }
  }

  return (
    <div
      className={`fixed bottom-6 ${posClass} z-[9990]`}
      data-category="necessary"
    >
      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Contact options"
          aria-modal="true"
          className="absolute bottom-16 right-0 w-80 max-w-[calc(100vw-1.5rem)] rounded-2xl bg-white shadow-2xl border border-border overflow-hidden mb-2"
          style={{ transformOrigin: 'bottom right' }}
        >
          {/* Header */}
          <div className="px-5 py-4" style={{ background: color }}>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-white">{greeting}</p>
              <button
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-white -mr-2"
                aria-label="Close contact panel"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {/* FAQ section */}
            {faqList.length > 0 && (
              <div className="p-4 border-b border-border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Common Questions</p>
                <div className="space-y-1">
                  {faqList.map((faq) => (
                    <div key={faq.id ?? faq.question} className="rounded-lg border border-border overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === (faq.id ?? faq.question) ? null : (faq.id ?? faq.question))}
                        className="w-full text-left px-3 py-2.5 text-sm font-medium flex items-center justify-between gap-2 hover:bg-muted transition-colors min-h-[44px]"
                        aria-expanded={openFaq === (faq.id ?? faq.question)}
                      >
                        <span>{faq.question}</span>
                        <span
                          className={`shrink-0 transition-transform ${openFaq === (faq.id ?? faq.question) ? 'rotate-180' : ''}`}
                          aria-hidden="true"
                        >
                          ▾
                        </span>
                      </button>
                      {openFaq === (faq.id ?? faq.question) && (
                        <div className="px-3 pb-3 text-sm text-muted-foreground">
                          <p>{faq.answer}</p>
                          {faq.linkUrl && (
                            <a
                              href={faq.linkUrl}
                              className="inline-block mt-2 text-xs font-medium underline"
                              style={{ color }}
                            >
                              Learn more →
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Channel buttons */}
            {channelList.length > 0 && (
              <div className="p-4 space-y-2">
                {channelList.map((ch) => (
                  <button
                    key={ch.id ?? ch.channelType}
                    onClick={() => handleChannel(ch)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-medium text-left min-h-[44px]"
                  >
                    <span style={{ color }}>{ICONS[ch.icon || 'chat']}</span>
                    <span>{ch.label || ch.channelType}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg hover:scale-105 transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 min-w-[44px] min-h-[44px]"
        style={{ background: color, outlineColor: color }}
        aria-label={open ? 'Close contact panel' : 'Open contact options'}
        aria-expanded={open}
        aria-controls="contact-panel"
      >
        {open ? (
          <span className="text-lg" aria-hidden="true">✕</span>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
