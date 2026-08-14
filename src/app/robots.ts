import type { MetadataRoute } from 'next'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrl = getServerSideURL()

  let sitemapPages = true
  let sitemapPosts = true

  try {
    const { getPayload } = await import('payload')
    const payloadConfig = (await import('@payload-config')).default
    const payload = await getPayload({ config: payloadConfig })
    const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' })) as any
    sitemapPages = seoSettings?.sitemapPages !== false
    sitemapPosts = seoSettings?.sitemapPosts !== false
  } catch {
    // use defaults
  }

  const sitemapUrls = [
    sitemapPages ? `${siteUrl}/pages-sitemap.xml` : null,
    sitemapPosts ? `${siteUrl}/posts-sitemap.xml` : null,
  ].filter((u): u is string => Boolean(u))

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: sitemapUrls,
    host: siteUrl,
  }
}
