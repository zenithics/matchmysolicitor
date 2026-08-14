import type { Metadata } from 'next/types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import Link from 'next/link'
import PageClient from './page.client'

import { SearchPageInput } from '@/search/SearchPageInput'

type ContentType = 'all' | 'posts' | 'pages'

type Args = {
  searchParams: Promise<{
    q?: string
    type?: ContentType
  }>
}

const TYPE_TABS: { label: string; value: ContentType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Blog', value: 'posts' },
  { label: 'Pages', value: 'pages' },
]

function buildSearchWhere(query: string, type: ContentType): Record<string, unknown> {
  const textConditions: Record<string, unknown>[] = [
    { title: { like: query } },
    { 'meta.description': { like: query } },
    { 'meta.title': { like: query } },
    { slug: { like: query } },
  ]

  const base: Record<string, unknown> = { or: textConditions }

  if (!type || type === 'all') return base

  return {
    and: [{ 'doc.relationTo': { equals: type } }, base],
  }
}

export default async function Page({ searchParams: searchParamsPromise }: Args) {
  const { q: query = '', type = 'all' } = await searchParamsPromise
  const payload = await getPayload({ config: configPromise })

  const findArgs: Parameters<typeof payload.find>[0] = {
    collection: 'search',
    depth: 1,
    limit: 24,
    pagination: true,
  }
  if (query) {
    findArgs.where = buildSearchWhere(query, type) as any
  } else if (type !== 'all') {
    findArgs.where = { 'doc.relationTo': { equals: type } } as any
  }

  const results = await payload.find(findArgs)

  const totalDocs = results.totalDocs ?? results.docs.length

  return (
    <div className="pt-24 pb-24 min-h-screen">
      <PageClient />

      {/* Search header */}
      <div className="container mb-10">
        <h1 className="text-3xl font-bold mb-6 text-center">Search</h1>
        <div className="max-w-2xl mx-auto">
          <SearchPageInput initialValue={query} />
        </div>

        {query && (
          <p className="text-center text-muted-foreground mt-4 text-sm">
            {totalDocs > 0
              ? `${totalDocs} result${totalDocs !== 1 ? 's' : ''} for "${query}"`
              : `No results found for "${query}"`}
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="container mb-8">
        <div className="flex gap-2 flex-wrap justify-center">
          {TYPE_TABS.map((tab) => {
            const params = new URLSearchParams()
            if (query) params.set('q', query)
            if (tab.value !== 'all') params.set('type', tab.value)
            const href = `/search${params.toString() ? `?${params.toString()}` : ''}`

            const isActive = tab.value === type

            return (
              <Link
                key={tab.value}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-card border border-border text-muted-foreground hover:bg-accent'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div className="container">
        {totalDocs > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.docs.map((result: any) => {
              const collection = result.doc?.relationTo
              return (
                <SearchResultCard key={result.id} result={result} collection={collection} />
              )
            })}
          </div>
        ) : (
          <EmptyState query={query} />
        )}
      </div>
    </div>
  )
}

function SearchResultCard({ result, collection }: { result: any; collection: string }) {
  if (collection === 'pages') {
    return <PageResult result={result} />
  }
  return <PostResult result={result} />
}

function PostResult({ result }: { result: any }) {
  const image = result.meta?.image && typeof result.meta.image === 'object' ? result.meta.image : null
  const category = result.categories?.[0]?.title

  return (
    <Link
      href={`/posts/${result.slug}`}
      className="group flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="relative aspect-video bg-muted overflow-hidden">
        {image?.url ? (
          <img src={image.url} alt={result.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-accent/30">✍️</div>
        )}
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
          Blog
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        {category && <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{category}</p>}
        <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors">{result.title}</h3>
        {result.meta?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{result.meta.description}</p>
        )}
      </div>
    </Link>
  )
}

function PageResult({ result }: { result: any }) {
  const href = result.slug === 'home' ? '/' : `/${result.slug}`

  return (
    <Link
      href={href}
      className="group flex items-start gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:shadow-md transition-all"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center text-xl">
        📄
      </div>
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Page</span>
        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">{result.title}</h3>
        {result.meta?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{result.meta.description}</p>
        )}
      </div>
    </Link>
  )
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="text-xl font-semibold mb-2">
        {query ? `No results for "${query}"` : 'Start searching'}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
        {query
          ? 'Try different keywords, check your spelling, or browse our content.'
          : 'Type in the search box above to find posts and pages.'}
      </p>
      {query && (
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/posts" className="px-4 py-2 rounded-full border border-border text-sm hover:bg-accent transition-colors">
            Read Blog
          </Link>
        </div>
      )}
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Search',
  }
}
