import type { Metadata } from 'next'

import { RelatedPosts } from '@/blocks/RelatedPosts/Component'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import React, { cache } from 'react'

export const dynamic = 'force-dynamic'
import RichText from '@/components/RichText'

import type { Post } from '@/payload-types'

import { PostHero } from '@/heros/PostHero'
import { generateMeta } from '@/utilities/generateMeta'
import PageClient from './page.client'
import { LivePreviewListener } from '@/components/LivePreviewListener'
import { LivePreviewPost } from '@/components/LivePreviewPost'
import { SocialShare } from '@/components/SocialShare'
import { getServerSideURL } from '@/utilities/getURL'
import { TableOfContents, HeadingIdInjector } from '@/components/TableOfContents'
import { AuthorCard } from '@/components/AuthorCard'
import { articleSchema } from '@/utilities/generateJsonLd'
import { applyAdvancedSeo } from '@/utilities/buildSeoMeta'

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const params = posts.docs.map(({ slug }) => {
    return { slug }
  })

  return params
}

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Post({ params: paramsPromise }: Args) {
  const { isEnabled: draft } = await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const payload = await getPayload({ config: configPromise })
  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' }).catch(() => null)) as any

  let articleJsonLd: any = null
  if (seoSettings?.schemaArticle !== false) {
    articleJsonLd = await articleSchema(post)
    const articleType =
      (post as any).advancedSeo?.schemaType || seoSettings?.schemaArticleType || 'Article'
    articleJsonLd['@type'] = articleType
  }

  const postUrl = getServerSideURL() + url
  const ogImage =
    post.meta?.image && typeof post.meta.image === 'object'
      ? (post.meta.image as any).url
      : undefined

  return (
    <article className="pt-6 pb-16">
      {articleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        />
      )}
      <PageClient />

      {/* Allows redirects for valid pages too */}
      <PayloadRedirects disableNotFound url={url} />

      {draft && <LivePreviewListener />}

      <HeadingIdInjector />

      {/* The design puts a Home / Guides / <category> / <title> trail above
          every guide. Guides are served under /guides/*, not /posts/*. */}
      <div className="container">
        <Breadcrumbs
          items={[
            { name: 'Guides', url: '/guides' },
            ...(typeof post.categories?.[0] === 'object' && post.categories?.[0]
              ? [
                  {
                    name: (post.categories[0] as any).title as string,
                    url: `/guides-category-${(post.categories[0] as any).slug}`,
                  },
                ]
              : []),
            { name: post.title, url: `/guides/${post.slug}` },
          ]}
          siteUrl={getServerSideURL()}
        />
      </div>

      {draft ? (
        <LivePreviewPost initialData={post as Post} postUrl={postUrl} />
      ) : (
        <>
          <PostHero post={post} />

          <div className="flex flex-col items-center gap-4 pt-8">
            <div className="container">
              <div className="flex gap-10 xl:gap-16 items-start">
                {/* Main content */}
                <div className="min-w-0 flex-1">
                  <RichText className="max-w-[48rem]" data={post.content} enableGutter={false} />

                  <div className="max-w-[48rem] mt-8 pt-8 border-t border-border">
                    <SocialShare
                      url={postUrl}
                      title={post.title}
                      description={post.meta?.description || undefined}
                      image={ogImage}
                    />
                  </div>

                  {/* Author cards */}
                  {post.populatedAuthors && post.populatedAuthors.length > 0 && (
                    <div className="max-w-[48rem] mt-8">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {post.populatedAuthors.length === 1 ? 'About the Author' : 'About the Authors'}
                      </p>
                      <div className="flex flex-col gap-4">
                        {post.populatedAuthors.map((author) => (
                          <AuthorCard key={author.id} author={author as any} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sticky TOC sidebar — desktop only */}
                <aside className="hidden xl:block w-64 shrink-0 sticky top-24 self-start">
                  <TableOfContents content={post.content} />
                </aside>
              </div>

              {post.relatedPosts && post.relatedPosts.length > 0 && (
                <RelatedPosts
                  className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
                  docs={post.relatedPosts.filter((post) => typeof post === 'object')}
                />
              )}
            </div>
          </div>
        </>
      )}

      {/* Related posts use static data — shown in both draft and published mode */}
      {draft && post.relatedPosts && post.relatedPosts.length > 0 && (
        <div className="flex flex-col items-center">
          <div className="container">
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              docs={post.relatedPosts.filter((p) => typeof p === 'object')}
            />
          </div>
        </div>
      )}
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })

  const metadata = await generateMeta({ doc: post })
  return applyAdvancedSeo(metadata, (post as any)?.advancedSeo)
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft,
    limit: 1,
    overrideAccess: draft,
    pagination: false,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return result.docs?.[0] || null
})
