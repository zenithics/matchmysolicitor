import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { getContentUrl } from '@/utilities/getContentUrl'

function toRFC822(dateStr: string): string {
  return new Date(dateStr).toUTCString()
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
}

function extractDescription(content: any, fallback?: string): string {
  if (fallback) return fallback

  // Try to extract text from lexical JSON
  if (content && typeof content === 'object' && content.root) {
    const texts: string[] = []
    const walk = (node: any) => {
      if (node.type === 'text' && node.text) texts.push(node.text)
      if (node.children) node.children.forEach(walk)
    }
    walk(content.root)
    const text = texts.join(' ').substring(0, 200)
    return text ? text + (texts.join(' ').length > 200 ? '…' : '') : ''
  }

  return ''
}

export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const baseUrl = getServerSideURL() || 'https://example.com'

    // Fetch SEO settings
    let siteTitle = 'Blog'
    let siteDescription = ''
    try {
      const seo = await payload.findGlobal({ slug: 'seo-settings' })
      siteTitle = (seo as any)?.siteTitle || siteTitle
      siteDescription = (seo as any)?.defaultDescription || siteDescription
    } catch {
      // Use defaults
    }

    const posts = await payload.find({
      collection: 'posts',
      where: { _status: { equals: 'published' } },
      sort: '-publishedAt',
      limit: 50,
      depth: 1,
    })

    const itemsArr = await Promise.all(
      posts.docs.map(async (post: any) => {
        const link = baseUrl + (await getContentUrl('posts', post.slug))
        const pubDate = toRFC822(post.publishedAt || post.createdAt)
        const description = post.meta?.description || extractDescription(post.content, post.excerpt)

        const categories = (post.categories || [])
          .map((cat: any) => {
            const title = typeof cat === 'object' ? cat.title : ''
            return title ? `<category>${escapeXml(title)}</category>` : ''
          })
          .join('\n          ')

        return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(description)}</description>
      ${categories}
    </item>`
      }),
    )
    const items = itemsArr.join('')

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>en-gb</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(baseUrl)}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`

    return new NextResponse(rss, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('RSS feed error:', error)
    return new NextResponse('Failed to generate RSS feed', { status: 500 })
  }
}

function escapeXml(str: string): string {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
