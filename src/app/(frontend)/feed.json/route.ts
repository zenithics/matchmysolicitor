import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { getContentUrl } from '@/utilities/getContentUrl'

function extractDescription(content: any, fallback?: string): string {
  if (fallback) return fallback
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

    const items = await Promise.all(posts.docs.map(async (post: any) => {
      const link = baseUrl + (await getContentUrl('posts', post.slug))
      const description = post.meta?.description || extractDescription(post.content, post.excerpt)

      const image =
        post.meta?.image && typeof post.meta.image === 'object'
          ? post.meta.image.url
          : post.images?.[0]?.image?.url

      return {
        id: link,
        url: link,
        title: post.title,
        content_text: description,
        summary: description,
        ...(image && { image }),
        date_published: post.publishedAt || post.createdAt,
        ...(post.categories?.length && {
          tags: post.categories
            .filter((c: any) => typeof c === 'object')
            .map((c: any) => c.title),
        }),
      }
    }))

    const feed = {
      version: 'https://jsonfeed.org/version/1.1',
      title: siteTitle,
      home_page_url: baseUrl,
      feed_url: `${baseUrl}/feed.json`,
      description: siteDescription,
      items,
    }

    return NextResponse.json(feed, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('JSON Feed error:', error)
    return new NextResponse('Failed to generate JSON feed', { status: 500 })
  }
}
