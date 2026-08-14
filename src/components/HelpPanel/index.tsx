'use client'

import React, { useState, useMemo } from 'react'

const FAQ_ITEMS = [
  {
    q: 'How do I create a new page?',
    a: 'Go to Content → Pages in the left sidebar, then click "Create New". Add a title, slug, and drag blocks onto the page.',
  },
  {
    q: 'How do I add a product?',
    a: 'Go to Shop → Products, then click "Create New". Fill in the title, price, images, and description.',
  },
  {
    q: 'How do I change the site logo?',
    a: 'Go to Global → Site Appearance. Upload your logo in the Logo field. Changes take effect immediately without a rebuild.',
  },
  {
    q: 'How do I update the header menu?',
    a: 'Go to Global → Header Navigation. Add, remove, or reorder nav items using the left/right nav arrays.',
  },
  {
    q: 'How do I edit footer links?',
    a: 'Go to Global → Footer. Each column has its own links array you can add to and reorder.',
  },
  {
    q: 'How do I add a blog post?',
    a: 'Go to Content → Posts, click "Create New". Add a title, hero image, content, and set Status to "Published" when ready.',
  },
  {
    q: 'How do I manage orders?',
    a: 'Go to Shop → Orders. Click any order to view its items, customer details, and shipping info. Update the status field to track fulfilment.',
  },
  {
    q: 'How do I update SEO settings?',
    a: 'Go to SEO → SEO Settings for site-wide defaults. Each page and post also has its own SEO tab for per-page overrides.',
  },
  {
    q: 'How do I use page templates?',
    a: "When creating a new page, use the \"Start from Template\" dropdown in the sidebar to pick a template. The page will be pre-filled with that template's hero and blocks. You can then customise everything.",
  },
  {
    q: 'How do I create a page template?',
    a: 'Go to System → Page Templates and create a new template. Build out the hero and blocks as you would a normal page. Any new page created from this template will start with those blocks.',
  },
  {
    q: 'How do I schedule a page to publish later?',
    a: 'Edit the page, set the Published At date to a future time, set status to Draft, and save. Content will publish automatically at the scheduled time.',
  },
  {
    q: 'How do I organise my media uploads?',
    a: 'When uploading or editing media, use the Folder dropdown in the sidebar to categorise images. You can filter by folder in the Media list view.',
  },
  {
    q: 'Where can I see who changed what?',
    a: 'Go to System → Activity Log to see a timeline of all content changes, including who made them and when.',
  },
]

export default function HelpPanel({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQ_ITEMS
    const lower = query.toLowerCase()
    return FAQ_ITEMS.filter(
      (item) => item.q.toLowerCase().includes(lower) || item.a.toLowerCase().includes(lower),
    )
  }, [query])

  return (
    <>
      {children}
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Help"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9998,
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#0066FF',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
          fontSize: '18px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,102,255,0.35)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,102,255,0.45)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,102,255,0.35)'
        }}
      >
        ?
      </button>

      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: 'rgba(0,0,0,0.3)',
          }}
        />
      )}

      {/* Slide-out panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          width: '380px',
          maxWidth: '100vw',
          background: 'var(--theme-elevation-0)',
          borderLeft: '1px solid var(--theme-elevation-200)',
          display: 'flex',
          flexDirection: 'column',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: open ? '-8px 0 32px rgba(0,0,0,0.12)' : 'none',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 20px 16px',
            borderBottom: '1px solid var(--theme-elevation-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--theme-text)' }}>
              Help
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--theme-elevation-650)' }}>
              Common questions &amp; how-tos
            </p>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close help panel"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: 'var(--theme-elevation-500)',
              fontSize: '20px',
              lineHeight: 1,
              borderRadius: '4px',
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--theme-elevation-200)', flexShrink: 0 }}>
          <input
            type="search"
            placeholder="Search help topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid var(--theme-elevation-200)',
              background: 'var(--theme-elevation-50)',
              color: 'var(--theme-text)',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* FAQ list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <p style={{ padding: '24px 20px', color: 'var(--theme-elevation-500)', fontSize: '13px' }}>
              No results for "{query}"
            </p>
          ) : (
            filtered.map((item, i) => (
              <details
                key={i}
                style={{
                  borderBottom: '1px solid var(--theme-elevation-100)',
                }}
              >
                <summary
                  style={{
                    padding: '14px 20px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--theme-text)',
                    listStyle: 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    userSelect: 'none',
                  }}
                >
                  {item.q}
                  <span style={{ fontSize: '18px', fontWeight: 400, color: 'var(--theme-elevation-500)', flexShrink: 0, marginLeft: '8px' }}>
                    +
                  </span>
                </summary>
                <p
                  style={{
                    margin: 0,
                    padding: '0 20px 16px',
                    fontSize: '13px',
                    color: 'var(--theme-elevation-800)',
                    lineHeight: 1.6,
                  }}
                >
                  {item.a}
                </p>
              </details>
            ))
          )}
        </div>
      </div>
    </>
  )
}
