'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'

type Counts = {
  pages: number
  posts: number
}

type CMSBranding = {
  siteName?: string
  accentColor?: string
}

type ActivityEntry = {
  id: string | number
  action: string
  userName?: string
  collection?: string
  globalSlug?: string
  documentTitle?: string
  timestamp: string
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const secs = Math.floor(diffMs / 1000)
  if (secs < 60) return 'just now'
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

const StatCard = ({
  label,
  count,
  href,
  accent,
}: {
  label: string
  count: number | null
  href: string
  accent: string
}) => (
  <Link
    href={href}
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '20px 24px',
      background: 'var(--theme-elevation-50)',
      border: '1px solid var(--theme-elevation-200)',
      borderRadius: '8px',
      textDecoration: 'none',
      transition: 'border-color 0.15s ease',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.borderColor = accent)}
    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--theme-elevation-200)')}
  >
    <span
      style={{
        fontSize: '28px',
        fontWeight: 700,
        color: 'var(--theme-text)',
        lineHeight: 1,
      }}
    >
      {count === null ? '—' : count}
    </span>
    <span
      style={{
        fontSize: '13px',
        color: 'var(--theme-elevation-650)',
        fontWeight: 500,
      }}
    >
      {label}
    </span>
  </Link>
)

export default function Dashboard() {
  const [counts, setCounts] = useState<Counts>({ pages: 0, posts: 0 })
  const [branding, setBranding] = useState<CMSBranding>({ siteName: 'your site', accentColor: '#0066FF' })
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pagesRes, postsRes, brandingRes, activityRes] = await Promise.all([
          fetch('/api/pages?limit=0'),
          fetch('/api/posts?limit=0'),
          fetch('/api/globals/cms-branding?depth=0'),
          fetch('/api/activity-log?limit=5&sort=-timestamp&depth=1'),
        ])

        const [pages, posts, brandingData, activityData] = await Promise.all([
          pagesRes.json(),
          postsRes.json(),
          brandingRes.json(),
          activityRes.json(),
        ])

        setCounts({
          pages: pages?.totalDocs ?? 0,
          posts: posts?.totalDocs ?? 0,
        })

        if (brandingData?.siteName) setBranding(brandingData)
        if (activityData?.docs) setActivity(activityData.docs)
      } catch {
        // silently ignore
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const accent = branding.accentColor || '#0066FF'

  const quickActions = [
    { label: '+ New Page', href: '/admin/collections/pages/create' },

    { label: '+ New Post', href: '/admin/collections/posts/create' },
    { label: 'Site Appearance', href: '/admin/globals/site-appearance' },
  ]

  return (
    <div style={{ padding: '0 0 48px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--theme-text)',
            margin: '0 0 6px',
          }}
        >
          Welcome to your dashboard
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--theme-elevation-650)', margin: 0 }}>
          Manage content for {branding.siteName || 'your site'} from here.
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}
      >
        <StatCard label="Pages" count={loading ? null : counts.pages} href="/admin/collections/pages" accent={accent} />
        <StatCard label="Posts" count={loading ? null : counts.posts} href="/admin/collections/posts" accent={accent} />
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: '32px' }}>
        <p
          style={{
            fontSize: '12px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'var(--theme-elevation-500)',
            margin: '0 0 12px',
          }}
        >
          Quick Actions
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '8px 16px',
                borderRadius: '6px',
                background: accent,
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--theme-elevation-500)',
              margin: 0,
            }}
          >
            Recent Activity
          </p>
          <Link
            href="/admin/collections/activity-log"
            style={{
              fontSize: '12px',
              color: accent,
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            View All Activity →
          </Link>
        </div>
        <div
          style={{
            background: 'var(--theme-elevation-50)',
            border: '1px solid var(--theme-elevation-200)',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          {loading || activity.length === 0 ? (
            <p
              style={{
                padding: '16px 20px',
                fontSize: '13px',
                color: 'var(--theme-elevation-500)',
                margin: 0,
              }}
            >
              {loading ? 'Loading…' : 'No activity recorded yet.'}
            </p>
          ) : (
            activity.map((entry, i) => {
              const where = entry.collection
                ? `in ${entry.collection}`
                : entry.globalSlug
                  ? `(${entry.globalSlug})`
                  : ''
              return (
                <div
                  key={entry.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 20px',
                    borderBottom:
                      i < activity.length - 1
                        ? '1px solid var(--theme-elevation-100)'
                        : 'none',
                    gap: '12px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: 'var(--theme-text)', flex: 1, minWidth: 0 }}>
                    <strong>{entry.userName || 'System'}</strong>{' '}
                    {entry.action}{' '}
                    <em>{entry.documentTitle || '—'}</em>{' '}
                    {where}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: 'var(--theme-elevation-500)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {timeAgo(entry.timestamp)}
                  </span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
