'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/utilities/useDebounce'

import Link from 'next/link'

type SearchResult = {
  id: string
  title: string
  slug: string
  doc?: { relationTo: string }
  meta?: { description?: string; image?: { url?: string } | string }
}

type GroupedResults = {
  posts: SearchResult[]
  pages: SearchResult[]
}

const COLLECTION_LABELS: Record<string, string> = {
  posts: 'Blog',
  pages: 'Pages',
}

function getHref(result: SearchResult): string {
  const col = result.doc?.relationTo
  if (col === 'posts') return `/posts/${result.slug}`
  if (col === 'pages') return result.slug === 'home' ? '/' : `/${result.slug}`
  return `/posts/${result.slug}`
}

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []
  try {
    const params = new URLSearchParams({
      'where[or][0][title][like]': query,
      'where[or][1][meta.title][like]': query,
      'where[or][2][slug][like]': query,
      limit: '20',
      depth: '1',
    })
    const res = await fetch(`/api/search?${params.toString()}`, { cache: 'no-store' })
    if (!res.ok) return []
    const data = await res.json()
    return data.docs ?? []
  } catch {
    return []
  }
}

export const Search: React.FC = () => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Fetch results on debounced query change
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([])
      setLoading(false)
      return
    }
    setLoading(true)
    fetchSearchResults(debouncedQuery)
      .then(setResults)
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setQuery('')
      setResults([])
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault()
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setOpen(false)
      }
    },
    [query, router],
  )

  // Group results by collection, top 2 per type (4 total max in preview)
  const grouped: GroupedResults = { posts: [], pages: [] }
  for (const r of results) {
    const col = r.doc?.relationTo as keyof GroupedResults
    if (col && grouped[col] && grouped[col].length < 2) {
      grouped[col].push(r)
    }
  }
  const previewResults = [
    ...grouped.posts,
    ...grouped.pages,
  ].slice(0, 5)

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="p-2 rounded-full hover:bg-accent transition-colors text-foreground"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[9000] flex items-start justify-center bg-black/50 backdrop-blur-sm pt-[8vh] px-4 sm:px-6"
          onClick={(e) => {
            if (!modalRef.current?.contains(e.target as Node)) setOpen(false)
          }}
        >
          <div
            ref={modalRef}
            className="w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden border border-border"
            role="dialog"
            aria-modal="true"
            aria-label="Site search"
          >
            {/* Input row */}
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 px-4 py-3 border-b border-border"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground flex-shrink-0"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts and pages…"
                className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setResults([])
                    inputRef.current?.focus()
                  }}
                  className="text-muted-foreground hover:text-foreground text-xl leading-none"
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono border border-border rounded text-muted-foreground select-none">
                ESC
              </kbd>
            </form>

            {/* Results */}
            {query.length >= 2 && (
              <div className="max-h-[60vh] overflow-y-auto overscroll-contain">
                {loading && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Searching…
                  </p>
                )}

                {!loading && previewResults.length === 0 && (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                )}

                {!loading && previewResults.length > 0 && (
                  <>
                    <ul>
                      {previewResults.map((result) => {
                        const col = result.doc?.relationTo ?? 'posts'
                        const href = getHref(result)
                        const image =
                          result.meta?.image && typeof result.meta.image === 'object'
                            ? (result.meta.image as { url?: string })
                            : null

                        return (
                          <li key={result.id}>
                            <Link
                              href={href}
                              onClick={() => setOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                            >
                              {/* Thumbnail */}
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0 flex items-center justify-center text-lg">
                                {image?.url ? (
                                  <img
                                    src={image.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : col === 'pages' ? (
                                  '📄'
                                ) : (
                                  '✍️'
                                )}
                              </div>

                              {/* Text */}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{result.title}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{COLLECTION_LABELS[col] ?? col}</span>
                                </div>
                              </div>

                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="text-muted-foreground flex-shrink-0"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>

                    {/* View all results */}
                    <div className="border-t border-border px-4 py-3">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full text-sm text-center text-primary font-medium hover:underline"
                      >
                        View all results for &ldquo;{query}&rdquo; →
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
