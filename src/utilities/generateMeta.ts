import type { Metadata } from 'next'
import type { Media, Page, Post, Config } from '../payload-types'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null): string | undefined => {
  if (!image || typeof image !== 'object' || !('url' in image)) return undefined

  const serverUrl = getServerSideURL()
  const ogUrl = image.sizes?.og?.url
  return ogUrl ? serverUrl + ogUrl : serverUrl + image.url
}

async function getSEOSettings(): Promise<{
  siteTitle: string
  titleSeparator: string
  defaultOgImage?: Media | Config['db']['defaultIDType'] | null
}> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'seo-settings' })
    return {
      siteTitle: (settings as any)?.siteTitle || 'MatchMySolicitor',
      titleSeparator: (settings as any)?.titleSeparator || ' | ',
      defaultOgImage: (settings as any)?.defaultOgImage,
    }
  } catch {
    return { siteTitle: 'MatchMySolicitor', titleSeparator: ' | ' }
  }
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
  collection?: 'pages' | 'posts'
}): Promise<Metadata> => {
  const { doc, collection = 'pages' } = args
  const { siteTitle, titleSeparator, defaultOgImage } = await getSEOSettings()

  const ogImage = getImageURL(doc?.meta?.image) || getImageURL(defaultOgImage)
  const metaTitle = doc?.meta?.title
  // A page's own meta.title sometimes already ends with the site name (e.g. content
  // imported with the brand baked in) — appending it again would double it up.
  const title =
    metaTitle && !metaTitle.trim().endsWith(siteTitle)
      ? `${metaTitle}${titleSeparator}${siteTitle}`
      : metaTitle || siteTitle

  const metaAny = doc?.meta as any
  const canonicalUrl = metaAny?.canonicalUrl
  const robotsValue = metaAny?.robots || 'index, follow'
  const twitterCard = (metaAny?.twitterCardType as 'summary' | 'summary_large_image') || 'summary_large_image'
  const ogType = (metaAny?.ogType as 'website' | 'article' | 'product') || 'website'

  const pageSlug = Array.isArray(doc?.slug) ? doc?.slug.join('/') : (doc?.slug || '/')
  const serverUrl = getServerSideURL()

  // Every page needs a self-referencing canonical unless one is set in the CMS.
  const path =
    pageSlug === 'home' || pageSlug === '/' || !pageSlug
      ? ''
      : collection === 'posts'
        ? `/guides/${pageSlug}`
        : `/${pageSlug}`
  const canonical = canonicalUrl || `${serverUrl}${path}` || `${serverUrl}/`

  return {
    title,
    description: doc?.meta?.description,
    alternates: { canonical },
    robots: robotsValue,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      siteName: siteTitle,
      title,
      url: canonical,
      type: ogType === 'article' ? 'article' : ogType === 'product' ? 'website' : 'website',
    }),
    twitter: {
      card: twitterCard,
      title,
      description: doc?.meta?.description || undefined,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}
