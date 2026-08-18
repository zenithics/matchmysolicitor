import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

/*
 * Sitemap index. Previously served from a stale `public/sitemap.xml` committed
 * by the starter template, which pointed at https://example.com.
 */
export async function GET() {
  const siteUrl = getServerSideURL()
  const children = ['pages-sitemap.xml', 'posts-sitemap.xml']

  const body =
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    children.map((c) => `  <sitemap><loc>${siteUrl}/${c}</loc></sitemap>`).join('\n') +
    '\n</sitemapindex>'

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } })
}
