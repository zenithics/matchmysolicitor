import type { Metadata } from 'next'
import type { Media, Page, Post, Config } from '../payload-types'
import { mergeOpenGraph } from './mergeOpenGraph'
import { getServerSideURL } from './getURL'

const getImageURL = (image?: Media | Config['db']['defaultIDType'] | null) => {
  const serverUrl = getServerSideURL()

  let url = serverUrl + '/website-template-OG.webp'

  if (image && typeof image === 'object' && 'url' in image) {
    const ogUrl = image.sizes?.og?.url
    url = ogUrl ? serverUrl + ogUrl : serverUrl + image.url
  }

  return url
}

async function getSEOSettings(): Promise<{ siteTitle: string; titleSeparator: string }> {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'seo-settings' })
    return {
      siteTitle: (settings as any)?.siteTitle || 'Your Brand',
      titleSeparator: (settings as any)?.titleSeparator || ' | ',
    }
  } catch {
    return { siteTitle: 'Your Brand', titleSeparator: ' | ' }
  }
}

export const generateMeta = async (args: {
  doc: Partial<Page> | Partial<Post> | null
}): Promise<Metadata> => {
  const { doc } = args
  const { siteTitle, titleSeparator } = await getSEOSettings()

  const ogImage = getImageURL(doc?.meta?.image)
  const metaTitle = doc?.meta?.title
  const title = metaTitle ? `${metaTitle}${titleSeparator}${siteTitle}` : siteTitle

  const metaAny = doc?.meta as any
  const canonicalUrl = metaAny?.canonicalUrl
  const robotsValue = metaAny?.robots || 'index, follow'
  const twitterCard = (metaAny?.twitterCardType as 'summary' | 'summary_large_image') || 'summary_large_image'
  const ogType = (metaAny?.ogType as 'website' | 'article' | 'product') || 'website'

  const pageSlug = Array.isArray(doc?.slug) ? doc?.slug.join('/') : (doc?.slug || '/')
  const serverUrl = getServerSideURL()

  return {
    title,
    description: doc?.meta?.description,
    ...(canonicalUrl && {
      alternates: { canonical: canonicalUrl },
    }),
    robots: robotsValue,
    openGraph: mergeOpenGraph({
      description: doc?.meta?.description || '',
      images: ogImage ? [{ url: ogImage }] : undefined,
      title,
      url: canonicalUrl || `${serverUrl}/${pageSlug}`,
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
