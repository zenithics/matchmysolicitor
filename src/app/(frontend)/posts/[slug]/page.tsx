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

  const firstCategory =
    typeof post.categories?.[0] === 'object' && post.categories?.[0]
      ? (post.categories[0] as any)
      : null
  const categoryTitle: string | null = firstCategory?.title ?? null

  // The design shows "Last reviewed <Month Year>", taken from the publish date.
  const lastReviewed = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : null

  // Three other guides from the same category.
  const relatedGuides = firstCategory
    ? (
        await payload.find({
          collection: 'posts',
          where: {
            and: [
              { 'categories.id': { equals: firstCategory.id } },
              { id: { not_equals: post.id } },
            ],
          },
          limit: 3,
          depth: 1,
        })
      ).docs
    : []

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
          <div className="flex flex-col items-center gap-4 pt-2">
            <div className="mms-guide container">
              <div className="flex flex-col-reverse gap-10 lg:flex-row lg:gap-10 items-start">
                {/* Sticky contents panel. The design puts it on the left of the
                    article, in a bordered white card, not in the right gutter. */}
                <aside className="w-full shrink-0 self-start empty:hidden lg:sticky lg:top-24 lg:w-[260px]">
                  <TableOfContents content={post.content} title="On this page" />
                </aside>

                <div className="min-w-0 flex-1 max-w-[680px] flex flex-col gap-7">
                  {/* Article header — the design has no dark hero on guides. */}
                  <header className="flex flex-col gap-3.5">
                    {categoryTitle && (
                      <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--mms-primary,#1E4FD8)]">
                        {categoryTitle}
                      </span>
                    )}
                    <h1 className="m-0 text-[clamp(25px,4.5vw,36px)] font-bold leading-[1.18] tracking-[-0.015em] text-[var(--mms-ink,#1A1F26)]">
                      {post.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-[#5B6472]">
                      {lastReviewed && (
                        <span className="rounded bg-[#E9F6F4] px-3 py-[5px] text-[13px] font-bold text-[#0A4740]">
                          Last reviewed {lastReviewed}
                        </span>
                      )}
                      <span>By the MatchMySolicitor editorial team</span>
                    </div>
                  </header>

                  <RichText data={post.content} enableGutter={false} />

                  {/* In-article CTA card */}
                  <div className="flex flex-col items-start gap-3 rounded-[10px] bg-[var(--mms-ink,#1A1F26)] p-7">
                    <h2 className="m-0 text-xl font-bold text-white">Dealing with this right now?</h2>
                    <p className="m-0 text-[15px] leading-relaxed text-[#B9C1CC]">
                      We can match you with a specialist employment solicitor within 24 hours. Free,
                      confidential, no obligation.
                    </p>
                    <a
                      href="/enquiry"
                      className="rounded-md bg-[var(--mms-primary,#1E4FD8)] px-6 py-3 text-[15px] font-bold text-white hover:bg-[#1740B8]"
                    >
                      Start a free enquiry →
                    </a>
                  </div>

                  {/* Regulatory note — required on every guide. */}
                  <div className="rounded-[10px] border border-[#C6E7E2] bg-[#E9F6F4] px-6 py-5 text-sm leading-[1.7] text-[#0F5D55]">
                    This guide is general information, not legal advice. For advice on your
                    situation,{' '}
                    <a href="/enquiry" className="font-bold text-[#0B7268]">
                      start a free enquiry
                    </a>
                    .
                  </div>

                  {relatedGuides.length > 0 && (
                    <div className="flex flex-col gap-4">
                      <h2 className="m-0 text-[22px] font-bold text-[var(--mms-ink,#1A1F26)]">
                        Related guides
                      </h2>
                      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                        {relatedGuides.map((g: any) => (
                          <a
                            key={g.id}
                            href={`/guides/${g.slug}`}
                            className="flex flex-col gap-2.5 rounded-[10px] border border-[#E4E7EC] bg-white p-6 text-inherit transition-shadow hover:shadow-md"
                          >
                            {typeof g.categories?.[0] === 'object' && (
                              <span className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--mms-primary,#1E4FD8)]">
                                {g.categories[0].title}
                              </span>
                            )}
                            <span className="text-lg font-bold leading-[1.35] text-[var(--mms-ink,#1A1F26)]">
                              {g.title}
                            </span>
                            <span className="text-sm leading-relaxed text-[#5B6472]">
                              {g.meta?.description}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-7">
                    <SocialShare
                      url={postUrl}
                      title={post.title}
                      description={post.meta?.description || undefined}
                      image={ogImage}
                    />
                  </div>

                  {post.populatedAuthors && post.populatedAuthors.length > 0 && (
                    <div className="flex flex-col gap-4">
                      {post.populatedAuthors.map((author) => (
                        <AuthorCard key={author.id} author={author as any} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Closing CTA band, as on every other page of the design. */}
          <div className="mt-16 bg-[var(--mms-ink,#1A1F26)]">
            <div className="container flex flex-wrap items-center justify-between gap-6 py-12">
              <div>
                <h2 className="m-0 text-[26px] font-bold text-white">
                  Speak to a specialist, not a call centre
                </h2>
                <p className="m-0 mt-1 text-[15px] text-[#B9C1CC]">
                  Free enquiry, matched with a vetted specialist within 24 hours.
                </p>
              </div>
              <a
                href="/enquiry"
                className="rounded-md bg-[var(--mms-primary,#1E4FD8)] px-6 py-3.5 text-[15px] font-bold text-white hover:bg-[#1740B8]"
              >
                Start your enquiry →
              </a>
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
