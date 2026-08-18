import type { Post, ArchiveBlock as ArchiveBlockProps } from '@/payload-types'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import RichText from '@/components/RichText'

import { CollectionArchive } from '@/components/CollectionArchive'

export const ArchiveBlock: React.FC<
  ArchiveBlockProps & {
    id?: string
  }
> = async (props) => {
  const { id, categories, introContent, limit: limitFromProps, populateBy, selectedDocs } = props

  const limit = limitFromProps || 3

  let posts: Post[] = []
  // The design puts a row of category filter pills above the guides list on
  // /guides and every /guides-category-* page. Only the collection-driven
  // archives are real listings; selectedDocs archives are "Related guides".
  let filterPills: { title: string; slug: string }[] = []
  let activeCategorySlug: string | null = null

  if (populateBy === 'collection') {
    const payload = await getPayload({ config: configPromise })

    const flattenedCategories = categories?.map((category) => {
      if (typeof category === 'object') return category.id
      else return category
    })

    const fetchedPosts = await payload.find({
      collection: 'posts',
      depth: 1,
      limit,
      ...(flattenedCategories && flattenedCategories.length > 0
        ? {
            where: {
              categories: {
                in: flattenedCategories,
              },
            },
          }
        : {}),
    })

    posts = fetchedPosts.docs

    const allCategories = await payload.find({
      collection: 'categories',
      depth: 0,
      limit: 50,
      sort: 'title',
    })
    filterPills = allCategories.docs
      .filter((c: any) => c.slug)
      .map((c: any) => ({ title: c.title as string, slug: c.slug as string }))
    const firstCategory = categories?.[0]
    activeCategorySlug =
      typeof firstCategory === 'object' && firstCategory
        ? ((firstCategory as any).slug ?? null)
        : null
  } else {
    if (selectedDocs?.length) {
      const filteredSelectedPosts = selectedDocs.map((post) => {
        if (typeof post.value === 'object') return post.value
      }) as Post[]

      posts = filteredSelectedPosts
    }
  }

  return (
    <section className="sp-24-48" id={`block-${id}`}>
      <div className="container-inner">
        {introContent && (
          <div className="mb-6">
            <RichText className="ms-0 mb-0 max-w-3xl [&_h2]:!text-[#1A1F26] [&_h3]:!text-[#1A1F26]" data={introContent} enableGutter={false} />
          </div>
        )}
        {filterPills.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2.5">
            {[{ title: 'All guides', slug: null }, ...filterPills].map((pill) => {
              const isActive = pill.slug === activeCategorySlug
              return (
                <a
                  key={pill.slug ?? 'all'}
                  href={pill.slug ? `/guides-category-${pill.slug}` : '/guides'}
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
        )}

        <CollectionArchive posts={posts} />
      </div>
    </section>
  )
}
