import type { Metadata } from 'next'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload, type RequiredDataFromCollectionSlug } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'
import { homeStatic } from '@/endpoints/seed/home-static'

// Force dynamic rendering — draftMode() and other dynamic APIs
// are not compatible with Next.js 16 static/ISR rendering.
export const dynamic = 'force-dynamic'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { RenderHero } from '@/heros/RenderHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewPage } from '@/components/LivePreviewPage'
import type { Page } from '@/payload-types'
import { faqSchema } from '@/utilities/generateJsonLd'
import { applyAdvancedSeo } from '@/utilities/buildSeoMeta'
import { getServerSideURL } from '@/utilities/getURL'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const pages = await payload.find({
    collection: 'pages',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = pages.docs
    ?.filter((doc) => {
      return doc.slug !== 'home'
    })
    .map(({ slug }) => {
      return { slug }
    })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Page({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = 'home' } = await paramsPromise
  // Decode to support slugs with special characters
  const decodedSlug = decodeURIComponent(slug)
  const url = '/' + decodedSlug
  let page: RequiredDataFromCollectionSlug<'pages'> | null

  page = await queryPageBySlug({
    slug: decodedSlug,
  })

  // Remove this code once your website is seeded
  if (!page && slug === 'home') {
    page = homeStatic
  }

  if (!page) {
    return <PayloadRedirects url={url} />
  }

  const { hero, layout } = page

  const payload = await getPayload({ config: configPromise })
  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' }).catch(() => null)) as any
  const siteUrl = getServerSideURL()

  // FAQ schema: auto-detect FAQ blocks in layout
  let faqJsonLd: any = null
  if (seoSettings?.schemaFAQ !== false && layout) {
    const faqBlocks = (layout as any[]).filter(
      (block: any) => block.blockType === 'faq' || block.blockType === 'FAQ',
    )
    const allItems = faqBlocks.flatMap((block: any) =>
      (block.items || block.questions || []).map((item: any) => ({
        question: item.question || item.title || '',
        answer: item.answer || item.content || '',
      })),
    )
    if (allItems.length > 0) {
      faqJsonLd = faqSchema(allItems)
    }
  }

  // WebPage schema if enabled
  let webPageJsonLd: any = null
  if (seoSettings?.schemaWebPage) {
    const schemaType = (page as any).advancedSeo?.schemaType || 'WebPage'
    webPageJsonLd = {
      '@context': 'https://schema.org',
      '@type': schemaType || 'WebPage',
      name: page.title,
      url: `${siteUrl}/${page.slug}`,
      ...((page as any).meta?.description && { description: (page as any).meta.description }),
    }
  }

  return (
    <article className="pt-16 pb-24">
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      {webPageJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
        />
      )}
      <PageClient />
      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewPage initialData={page as Page} />}

      <RenderHero {...hero} />
      <RenderBlocks blocks={layout} />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = 'home' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const page = await queryPageBySlug({ slug: decodedSlug })

  const metadata = await generateMeta({ doc: page })
  return applyAdvancedSeo(metadata, (page as any)?.advancedSeo)
}

const queryPageBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'pages',
    draft,
    limit: 1,
    pagination: false,
    overrideAccess: draft,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
