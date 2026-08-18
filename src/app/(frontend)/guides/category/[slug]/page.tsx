import type { Metadata } from 'next'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import React, { cache } from 'react'

import { CollectionArchive } from '@/components/CollectionArchive'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'

export const dynamic = 'force-dynamic'

const queryCategory = cache(async ({ slug }: { slug: string }) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 1,
    where: { slug: { equals: slug } },
  })
  return result.docs?.[0] ?? null
})

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const categories = await payload.find({
    collection: 'categories',
    depth: 0,
    limit: 100,
    pagination: false,
  })
  return categories.docs.filter((c: any) => c.slug).map((c: any) => ({ slug: c.slug as string }))
}

type Args = { params: Promise<{ slug?: string }> }

export default async function GuidesCategoryPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const category: any = await queryCategory({ slug })
  if (!category) notFound()

  const payload = await getPayload({ config: configPromise })

  const [posts, allCategories] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      limit: 24,
      where: { categories: { in: [category.id] } },
    }),
    payload.find({ collection: 'categories', depth: 0, limit: 50, sort: 'title' }),
  ])

  const pills = allCategories.docs.filter((c: any) => c.slug) as any[]

  return (
    <article className="pb-16 pt-12">
      <section className="sp-24-48">
        <div className="container-inner">
          <h1 className="text-[38px] font-extrabold leading-[1.15] text-[#1A1F26] md:text-[44px]">
            {category.title}
          </h1>
          {category.description ? (
            <p className="mt-4 max-w-3xl text-[17px] leading-[1.75] text-[var(--mms-body,#3A414C)]">
              {category.description}
            </p>
          ) : null}

          <div className="mb-8 mt-8 flex flex-wrap gap-2.5">
            {[{ title: 'All guides', slug: null }, ...pills].map((pill: any) => {
              const isActive = pill.slug === category.slug
              return (
                <a
                  key={pill.slug ?? 'all'}
                  href={pill.slug ? `/guides/category/${pill.slug}` : '/guides'}
                  className={
                    'rounded-full border-[1.5px] px-[18px] py-[9px] text-sm font-bold ' +
                    (isActive
                      ? 'border-[var(--mms-ink,#1A1F26)] bg-[var(--mms-ink,#1A1F26)] text-white'
                      : 'border-[#D3D8DF] bg-white text-[var(--mms-body,#3A414C)] hover:border-[var(--mms-ink,#1A1F26)]')
                  }
                >
                  {pill.title}
                </a>
              )
            })}
          </div>

          {posts.docs.length > 0 ? (
            <CollectionArchive posts={posts.docs as any} />
          ) : (
            <p className="text-[var(--mms-body,#3A414C)]">
              No guides in this category yet. <a className="underline" href="/guides">See all guides</a>.
            </p>
          )}
        </div>
      </section>

      <CallToActionBlock
        blockType="cta"
        richText={
          {
            root: {
              type: 'root',
              format: '',
              indent: 0,
              version: 1,
              direction: 'ltr',
              children: [
                {
                  tag: 'h2',
                  type: 'heading',
                  format: '',
                  indent: 0,
                  version: 1,
                  direction: 'ltr',
                  children: [
                    {
                      mode: 'normal',
                      text: 'Need more than a guide?',
                      type: 'text',
                      style: '',
                      detail: 0,
                      format: 0,
                      version: 1,
                    },
                  ],
                },
                {
                  type: 'paragraph',
                  format: '',
                  indent: 0,
                  version: 1,
                  direction: 'ltr',
                  textFormat: 0,
                  children: [
                    {
                      mode: 'normal',
                      text: 'Free enquiry, matched with a specialist employment solicitor, usually within one working day.',
                      type: 'text',
                      style: '',
                      detail: 0,
                      format: 0,
                      version: 1,
                    },
                  ],
                },
              ],
            },
          } as any
        }
        links={[
          {
            link: { type: 'custom', url: '/enquiry', label: 'Start your enquiry', appearance: 'default' },
          } as any,
        ]}
      />
    </article>
  )
}

export async function generateMetadata({ params: paramsPromise }: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const category: any = await queryCategory({ slug })
  if (!category) return {}
  return {
    title: `${category.title} | MatchMySolicitor`,
    description:
      category.description ||
      `Plain-English employment law guides on ${String(category.title).toLowerCase()}.`,
  }
}
