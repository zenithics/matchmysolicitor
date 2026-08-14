import type { CollectionAfterChangeHook } from 'payload'
import { submitToGoogleIndexing } from '@/utilities/googleIndexing'
import { submitToIndexNow } from '@/utilities/indexNow'

type CollectionType = 'pages' | 'posts'

const urlPatterns: Record<CollectionType, (slug: string) => string> = {
  pages: (slug) => (slug === 'home' ? '/' : `/${slug}`),
  posts: (slug) => `/posts/${slug}`,
}

export function createIndexingHook(collectionType: CollectionType): CollectionAfterChangeHook {
  return async ({ doc, operation, req }) => {
    const isPublished = doc._status === 'published' || doc.status === 'active'
    if (!isPublished) return doc
    if (operation !== 'create' && operation !== 'update') return doc

    const slug = doc.slug
    if (!slug) return doc

    const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
    const path = urlPatterns[collectionType](slug)
    const fullUrl = `${siteUrl}${path}`

    try {
      const seoSettings = (await req.payload.findGlobal({ slug: 'seo-settings' })) as any

      if (
        seoSettings?.googleIndexingEnabled &&
        seoSettings?.googleIndexingAutoSubmit?.[collectionType]
      ) {
        submitToGoogleIndexing([fullUrl]).catch((err) =>
          console.error(`Google Indexing API error for ${fullUrl}:`, err.message),
        )
      }

      if (seoSettings?.indexNowEnabled && seoSettings?.indexNowAutoSubmit?.[collectionType]) {
        submitToIndexNow([fullUrl]).catch((err) =>
          console.error(`IndexNow error for ${fullUrl}:`, err.message),
        )
      }
    } catch (err: any) {
      console.error(`Indexing hook error:`, err.message)
    }

    return doc
  }
}
