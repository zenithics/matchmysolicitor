import React from 'react'
import Link from 'next/link'

interface AuthorCardProps {
  author: {
    id?: string
    name?: string | null
    role?: string | null
    bio?: string | null
    slug?: string | null
    avatar?: { url?: string; alt?: string } | null
    twitter?: string | null
    linkedin?: string | null
    instagram?: string | null
    website?: string | null
  }
  compact?: boolean
}

export const AuthorCard: React.FC<AuthorCardProps> = ({ author, compact = false }) => {
  const initials = (author.name || 'A')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const authorHref = author.slug ? `/authors/${author.slug}` : null

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
          {author.avatar?.url ? (
            <img
              src={author.avatar.url}
              alt={author.avatar.alt || author.name || ''}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-bold text-primary">{initials}</span>
          )}
        </div>
        <div className="min-w-0">
          {authorHref ? (
            <Link
              href={authorHref}
              className="text-sm font-semibold hover:text-primary transition-colors"
            >
              {author.name}
            </Link>
          ) : (
            <span className="text-sm font-semibold">{author.name}</span>
          )}
          {author.role && (
            <p className="text-xs text-muted-foreground truncate">{author.role}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-5 p-6 rounded-2xl border border-border bg-card">
      {/* Avatar */}
      <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/10 shrink-0 flex items-center justify-center">
        {author.avatar?.url ? (
          <img
            src={author.avatar.url}
            alt={author.avatar.alt || author.name || ''}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-primary">{initials}</span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-2 mb-1">
          {authorHref ? (
            <Link
              href={authorHref}
              className="font-bold text-foreground hover:text-primary transition-colors"
            >
              {author.name}
            </Link>
          ) : (
            <span className="font-bold text-foreground">{author.name}</span>
          )}
          {author.role && (
            <span className="text-xs text-muted-foreground">{author.role}</span>
          )}
        </div>

        {author.bio && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{author.bio}</p>
        )}

        {/* Social links */}
        <div className="flex items-center gap-3 flex-wrap">
          {author.twitter && (
            <a
              href={`https://twitter.com/${author.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name} on X`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}
          {author.linkedin && (
            <a
              href={author.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name} on LinkedIn`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
          )}
          {author.instagram && (
            <a
              href={`https://instagram.com/${author.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name} on Instagram`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          )}
          {author.website && (
            <a
              href={author.website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${author.name}'s website`}
              className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
            >
              {author.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
