import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const payload = await getPayload({ config })
  const siteUrl = getServerSideURL()

  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' }).catch(() => null)) as any

  if (seoSettings?.llmsTxtEnabled === false) {
    return new NextResponse('# LLMs.txt is disabled for this site.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  const pages = await payload.find({
    collection: 'pages',
    where: { _status: { equals: 'published' } },
    limit: 50,
  })

  const siteTitle = seoSettings?.siteTitle || 'Your Brand'
  const siteDescription =
    seoSettings?.llmsDescription ||
    seoSettings?.defaultDescription ||
    'Welcome to our website.'

  const lines = [
    `# ${siteTitle}`,
    '',
    `> ${siteDescription}`,
    '',
    `## Site`,
    '',
    `- Homepage: ${siteUrl}/`,
    `- About: ${siteUrl}/about`,
    `- Contact: ${siteUrl}/contact`,
    `- Blog: ${siteUrl}/posts`,
    '',
    `## Pages`,
    '',
    ...pages.docs.map((page) => `- [${page.title}](${siteUrl}/${page.slug})`),
    '',
  ]

  // Admin-defined additional sections
  const additionalSections = seoSettings?.llmsAdditionalSections || []
  for (const section of additionalSections) {
    if (section.heading && section.content) {
      lines.push(`## ${section.heading}`, '', section.content, '')
    }
  }

  lines.push(`## Optional`, '', `- [Full details](/llms-full.txt)`)

  return new NextResponse(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
