import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { getPrefix } from '@/utilities/getContentUrl'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config })
  const siteUrl = getServerSideURL()

  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' }).catch(() => null)) as any

  if (seoSettings?.sitemapPages === false) {
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>',
      { headers: { 'Content-Type': 'application/xml' } },
    )
  }

  const changefreq = seoSettings?.sitemapChangeFrequency || 'weekly'
  const priority = seoSettings?.sitemapPriority || '0.7'
  const excludePatterns: string[] = (seoSettings?.sitemapExcludePatterns || []).map(
    (p: any) => p.pattern,
  )

  const results = await payload.find({
    collection: 'pages',
    overrideAccess: false,
    draft: false,
    depth: 0,
    limit: 1000,
    pagination: false,
    where: { _status: { equals: 'published' } },
    select: { slug: true, updatedAt: true },
  })

  const postsPrefix = await getPrefix('posts')
  const staticUrls = [
    { loc: `${siteUrl}/search`, lastmod: new Date().toISOString() },
    { loc: `${siteUrl}${postsPrefix}`, lastmod: new Date().toISOString() },
  ]

  const pageUrls = results.docs
    .filter((page) => Boolean(page?.slug))
    .map((page) => ({
      loc: page?.slug === 'home' ? `${siteUrl}/` : `${siteUrl}/${page?.slug}`,
      lastmod: page.updatedAt || new Date().toISOString(),
    }))

  const allUrls = [...staticUrls, ...pageUrls].filter(({ loc }) => {
    const path = loc.replace(siteUrl, '') || '/'
    return !excludePatterns.some((pattern) => path.startsWith(pattern))
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    ({ loc, lastmod }) => `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${loc === `${siteUrl}/` ? '1.0' : priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
