import type { Metadata } from 'next'

interface AdvancedSeo {
  canonicalUrl?: string | null
  noindex?: boolean | null
  nofollow?: boolean | null
  noarchive?: boolean | null
  nosnippet?: boolean | null
}

export function applyAdvancedSeo(metadata: Metadata, advancedSeo?: AdvancedSeo | null): Metadata {
  if (!advancedSeo) return metadata

  if (advancedSeo.canonicalUrl) {
    metadata.alternates = {
      ...metadata.alternates,
      canonical: advancedSeo.canonicalUrl,
    }
  }

  const directives: string[] = []
  if (advancedSeo.noindex) directives.push('noindex')
  if (advancedSeo.nofollow) directives.push('nofollow')
  if (advancedSeo.noarchive) directives.push('noarchive')
  if (advancedSeo.nosnippet) directives.push('nosnippet')

  if (directives.length > 0) {
    metadata.robots = directives.join(', ')
  }

  return metadata
}
