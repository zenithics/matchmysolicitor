'use client'

import React, { useEffect, useState, useCallback } from 'react'
import type { CookieConsentConfig } from './CookieConsentLoader'

type ConsentState = {
  necessary: boolean
  analytics: boolean
  advertising: boolean
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date()
  expires.setDate(expires.getDate() + days)
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

function getCookie(name: string): string | null {
  const match = document.cookie.split('; ').find((row) => row.startsWith(`${name}=`))
  return match ? decodeURIComponent(match.split('=')[1]) : null
}

function updateGoogleConsent(consent: ConsentState) {
  if (typeof (window as any).gtag !== 'function') return
  ;(window as any).gtag('consent', 'update', {
    analytics_storage: consent.analytics ? 'granted' : 'denied',
    ad_storage: consent.advertising ? 'granted' : 'denied',
    ad_user_data: consent.advertising ? 'granted' : 'denied',
    ad_personalization: consent.advertising ? 'granted' : 'denied',
  })
}

const DEFAULT_CONSENT: ConsentState = { necessary: true, analytics: false, advertising: false }

interface CookieConsentProps {
  config: CookieConsentConfig
}

export function CookieConsent({ config }: CookieConsentProps) {
  const [visible, setVisible] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [prefs, setPrefs] = useState<ConsentState>(DEFAULT_CONSENT)

  useEffect(() => {
    const saved = getCookie('cookie_consent')
    if (!saved) {
      setVisible(true)
    } else {
      try {
        const parsed = JSON.parse(saved) as ConsentState
        setPrefs(parsed)
        updateGoogleConsent(parsed)
      } catch {
        setVisible(true)
      }
    }

    ;(window as any).__openCookiePreferences = () => setModalOpen(true)
  }, [])

  const save = useCallback(
    (consent: ConsentState) => {
      setCookie('cookie_consent', JSON.stringify(consent), config.consentCookieExpiry)
      updateGoogleConsent(consent)
      setPrefs(consent)
      setVisible(false)
      setModalOpen(false)
      if (consent.analytics || consent.advertising) {
        window.location.reload()
      }
    },
    [config.consentCookieExpiry],
  )

  const acceptAll = () => save({ necessary: true, analytics: true, advertising: true })
  const rejectAll = () => save(DEFAULT_CONSENT)
  const savePrefs = () => save(prefs)

  if (!visible && !modalOpen) return null

  const categories: Array<{
    key: keyof ConsentState
    label: string
    description: string
    required: boolean
  }> = [
    {
      key: 'necessary',
      label: config.necessaryLabel,
      description: config.necessaryDescription,
      required: true,
    },
    {
      key: 'analytics',
      label: config.analyticsLabel,
      description: config.analyticsDescription,
      required: false,
    },
    {
      key: 'advertising',
      label: config.advertisingLabel,
      description: config.advertisingDescription,
      required: false,
    },
  ]

  return (
    <>
      {/* Banner */}
      {visible && !modalOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-white border-t border-[#E4E7EC] shadow-[0_-4px_24px_rgba(26,31,38,0.08)]">
          <div className="max-w-[1180px] mx-auto px-6 py-5 flex flex-col gap-3.5">
            <p className="m-0 text-sm leading-relaxed text-(--mms-body)">{config.bannerText}</p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={acceptAll}
                className="flex-1 min-w-[130px] px-[18px] py-[13px] rounded-md bg-primary text-white text-[15px] font-bold hover:bg-(--mms-primary-hover) transition-colors"
              >
                {config.acceptAllLabel}
              </button>
              <button
                onClick={rejectAll}
                className="flex-1 min-w-[130px] px-[18px] py-[13px] rounded-md bg-primary text-white text-[15px] font-bold hover:bg-(--mms-primary-hover) transition-colors"
              >
                {config.rejectAllLabel}
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 min-w-[130px] px-[18px] py-[13px] rounded-md border border-[#D3D8DF] bg-white text-[15px] font-bold text-[#1A1F26] hover:bg-(--mms-surface) transition-colors"
              >
                {config.managePrefsLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[10px] shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-[var(--border-subtle)]">
              <h2 className="text-xl font-bold">{config.modalTitle}</h2>
              <p className="text-sm text-muted-foreground mt-1">{config.modalSubtext}</p>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {categories.map((cat) => (
                <div key={cat.key} className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{cat.label}</p>
                    {cat.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  {cat.required ? (
                    <span className="text-xs text-muted-foreground shrink-0 mt-0.5 bg-(--mms-surface) px-2 py-1 rounded-full">
                      Always on
                    </span>
                  ) : (
                    <button
                      role="switch"
                      aria-checked={prefs[cat.key]}
                      onClick={() =>
                        setPrefs((prev) => ({ ...prev, [cat.key]: !prev[cat.key] }))
                      }
                      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${
                        prefs[cat.key] ? 'bg-primary' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          prefs[cat.key] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row gap-3">
              <button
                onClick={savePrefs}
                className="flex-1 py-3 rounded-md border border-[#D3D8DF] text-sm font-semibold hover:bg-(--mms-surface) transition-colors"
              >
                {config.savePrefsLabel}
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 py-3 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                {config.acceptAllLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/** Button that opens the preferences modal — for use in footer */
export function CookieSettingsButton({ label = 'Cookie Settings' }: { label?: string }) {
  return (
    <button
      onClick={() => {
        if (typeof (window as any).__openCookiePreferences === 'function') {
          ;(window as any).__openCookiePreferences()
        }
      }}
      className="text-left text-[var(--mms-footer-muted)] hover:text-white transition-colors"
    >
      {label}
    </button>
  )
}
