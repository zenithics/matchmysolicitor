import { PreviewSearchParams } from '@/app/(frontend)/next/preview/route'
import { PayloadRequest, CollectionSlug } from 'payload'

// These are the canonical file-system route prefixes, not the CMS-configurable ones.
// Middleware rewrites custom prefixes (from PermalinkSettings) to these paths,
// so preview links work regardless of which prefix the admin has configured.
const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
}

export const generatePreviewPath = ({ collection, slug }: Props) => {
  if (slug === undefined || slug === null) {
    return null
  }

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const encodedParams = new URLSearchParams({
    path: `${collectionPrefixMap[collection]}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  } satisfies PreviewSearchParams)

  const url = `/next/preview?${encodedParams.toString()}`

  return url
}
