import React from 'react'
import Link from 'next/link'

export interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  separator?: string
  homeLabel?: string
  includeSchema?: boolean
  siteUrl?: string
}

export function Breadcrumbs({
  items,
  className = '',
  separator = '/',
  homeLabel = 'Home',
  includeSchema = true,
  siteUrl = '',
}: BreadcrumbsProps) {
  if (!items.length) return null

  const all = [{ name: homeLabel, url: '/' }, ...items]

  const schemaData = includeSchema
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: all.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: `${siteUrl}${item.url}`,
        })),
      }
    : null

  return (
    <>
      <nav aria-label="Breadcrumb" className={`py-3 ${className}`}>
        <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          {all.map((item, index) => {
            const isLast = index === all.length - 1
            return (
              <li key={item.url} className="flex items-center gap-1.5">
                {isLast ? (
                  <span className="text-foreground font-medium" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link href={item.url} className="hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                )}
                {!isLast && (
                  <span aria-hidden="true" className="text-muted-foreground/50">
                    {separator}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
    </>
  )
}

/** Generate breadcrumb items from a URL path string */
export function breadcrumbsFromPath(
  pathname: string,
  labelMap?: Record<string, string>,
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((segment, index) => {
    const url = '/' + segments.slice(0, index + 1).join('/')
    const name = labelMap?.[url] || labelMap?.[segment] || formatSegment(segment)
    return { name, url }
  })
}

function formatSegment(segment: string): string {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
