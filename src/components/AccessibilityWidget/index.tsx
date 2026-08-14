'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

const STORAGE_KEY = 'a11y-prefs'

type Prefs = {
  fontSize: number       // multiplier %, 80–200, steps of 10
  highContrast: boolean
  reduceMotion: boolean
  highlightLinks: boolean
  largeCursor: boolean
  dyslexiaFont: boolean
  lineHeight: number     // multiplier %, 100–200, steps of 10
}

const DEFAULTS: Prefs = {
  fontSize: 100,
  highContrast: false,
  reduceMotion: false,
  highlightLinks: false,
  largeCursor: false,
  dyslexiaFont: false,
  lineHeight: 100,
}

function loadPrefs(): Prefs {
  if (typeof window === 'undefined') return DEFAULTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return DEFAULTS
  }
}

function savePrefs(prefs: Prefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
  } catch {
    // storage may be blocked
  }
}

function applyPrefs(prefs: Prefs) {
  const html = document.documentElement
  html.style.setProperty('--a11y-font-size', `${prefs.fontSize}%`)
  html.style.setProperty('--a11y-line-height', `${prefs.lineHeight / 100 * 1.5}`)
  html.classList.toggle('a11y-high-contrast', prefs.highContrast)
  html.classList.toggle('a11y-reduce-motion', prefs.reduceMotion)
  html.classList.toggle('a11y-highlight-links', prefs.highlightLinks)
  html.classList.toggle('a11y-large-cursor', prefs.largeCursor)
  html.classList.toggle('a11y-dyslexia-font', prefs.dyslexiaFont)
}

export function AccessibilityWidget() {
  const [open, setOpen] = useState(false)
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Load and apply saved prefs on mount
  useEffect(() => {
    const saved = loadPrefs()
    setPrefs(saved)
    applyPrefs(saved)
  }, [])

  // Apply prefs whenever they change
  const update = useCallback((patch: Partial<Prefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch }
      savePrefs(next)
      applyPrefs(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setPrefs(DEFAULTS)
    savePrefs(DEFAULTS)
    applyPrefs(DEFAULTS)
  }, [])

  // Close on Escape, trap focus inside panel
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => !el.getAttribute('disabled'))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    // Focus first element in panel
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>('button, [tabindex]')
    firstFocusable?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // Close on click outside
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

  return (
    <>
      {/* Global a11y CSS */}
      <style>{`
        .a11y-high-contrast { filter: contrast(2) !important; background: #000 !important; color: #fff !important; }
        .a11y-high-contrast a { color: #ff0 !important; }
        .a11y-reduce-motion *, .a11y-reduce-motion *::before, .a11y-reduce-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
        .a11y-highlight-links a {
          text-decoration: underline !important;
          background: #ffff99 !important;
          color: #000 !important;
          padding: 0 2px;
        }
        .a11y-large-cursor, .a11y-large-cursor * { cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cpath d='M8 4l16 12-7 1 4 9-3 1-4-9-6 5z' fill='%23000' stroke='%23fff' stroke-width='1'/%3E%3C/svg%3E") 0 0, auto !important; }
        .a11y-dyslexia-font, .a11y-dyslexia-font * { font-family: 'Arial', 'Helvetica', sans-serif !important; letter-spacing: 0.05em !important; word-spacing: 0.1em !important; }
        :root { font-size: var(--a11y-font-size, 100%); }
        body { line-height: var(--a11y-line-height, 1.5); }
      `}</style>

      {/* Floating trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 left-6 z-[9998] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-w-[44px] min-h-[44px]"
        aria-label="Accessibility options"
        aria-expanded={open}
        aria-controls="a11y-panel"
      >
        <span aria-hidden="true" className="text-xl leading-none">♿</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Accessibility preferences"
          aria-modal="true"
          className="fixed bottom-20 left-6 z-[9997] w-80 max-w-[calc(100vw-3rem)] rounded-xl bg-white shadow-2xl border border-border overflow-hidden"
        >
          <div className="bg-primary px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-white text-sm">Accessibility Options</span>
            <button
              onClick={() => setOpen(false)}
              className="text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white rounded min-w-[44px] min-h-[44px] flex items-center justify-center -mr-2"
              aria-label="Close accessibility panel"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">

            {/* Font size */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Text Size</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => update({ fontSize: Math.max(80, prefs.fontSize - 10) })}
                  disabled={prefs.fontSize <= 80}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-muted disabled:opacity-40 min-w-[44px] min-h-[44px]"
                  aria-label="Decrease text size"
                >A−</button>
                <span className="flex-1 text-center text-sm font-medium">{prefs.fontSize}%</span>
                <button
                  onClick={() => update({ fontSize: Math.min(200, prefs.fontSize + 10) })}
                  disabled={prefs.fontSize >= 200}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-lg font-bold hover:bg-muted disabled:opacity-40 min-w-[44px] min-h-[44px]"
                  aria-label="Increase text size"
                >A+</button>
              </div>
            </div>

            {/* Line height */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Line Spacing</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => update({ lineHeight: Math.max(100, prefs.lineHeight - 10) })}
                  disabled={prefs.lineHeight <= 100}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-sm font-bold hover:bg-muted disabled:opacity-40 min-w-[44px] min-h-[44px]"
                  aria-label="Decrease line spacing"
                >↕−</button>
                <span className="flex-1 text-center text-sm font-medium">{prefs.lineHeight}%</span>
                <button
                  onClick={() => update({ lineHeight: Math.min(200, prefs.lineHeight + 10) })}
                  disabled={prefs.lineHeight >= 200}
                  className="h-9 w-9 rounded-full border border-border flex items-center justify-center text-sm font-bold hover:bg-muted disabled:opacity-40 min-w-[44px] min-h-[44px]"
                  aria-label="Increase line spacing"
                >↕+</button>
              </div>
            </div>

            {/* Toggles */}
            {(
              [
                { key: 'highContrast', label: 'High Contrast', description: 'Black background, white text, yellow links' },
                { key: 'reduceMotion', label: 'Reduce Motion', description: 'Disable animations and transitions' },
                { key: 'highlightLinks', label: 'Highlight Links', description: 'Underline and highlight all links' },
                { key: 'largeCursor', label: 'Large Cursor', description: 'Larger mouse pointer' },
                { key: 'dyslexiaFont', label: 'Dyslexia-Friendly Font', description: 'Spaced, easy-to-read font' },
              ] as const
            ).map(({ key, label, description }) => (
              <div key={key} className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                </div>
                <button
                  onClick={() => update({ [key]: !prefs[key] } as Partial<Prefs>)}
                  role="switch"
                  aria-checked={prefs[key]}
                  aria-label={label}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary min-w-[44px] ${
                    prefs[key] ? 'bg-primary border-primary' : 'bg-muted border-border'
                  }`}
                >
                  <span
                    className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow transition-transform my-auto ${
                      prefs[key] ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}

            <button
              onClick={reset}
              className="w-full mt-2 rounded-lg border border-border py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary min-h-[44px]"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      )}
    </>
  )
}
