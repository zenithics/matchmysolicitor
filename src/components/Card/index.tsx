'use client'
import { cn } from '@/utilities/ui'
import useClickableCard from '@/utilities/useClickableCard'
import Link from 'next/link'
import React from 'react'

import type { Post } from '@/payload-types'

export type CardPostData = Pick<Post, 'slug' | 'categories' | 'meta' | 'title' | 'publishedAt'>

export const Card: React.FC<{
  alignItems?: 'center'
  className?: string
  doc?: CardPostData
  href?: string
  relationTo?: 'posts'
  showCategories?: boolean
  title?: string
}> = (props) => {
  const { card, link } = useClickableCard({})
  const { className, doc, href: hrefProp, relationTo, showCategories, title: titleFromProps } = props

  const { slug, categories, meta, title, publishedAt } = doc || {}
  const { description } = meta || {}

  const category =
    showCategories && Array.isArray(categories) && categories.length > 0 ? categories[0] : undefined
  const categoryTitle = category && typeof category === 'object' ? category.title : undefined

  const titleToUse = titleFromProps || title
  const sanitizedDescription = description?.replace(/\s/g, ' ') // replace non-breaking space with white space
  const href = hrefProp ?? `/${relationTo}/${slug}`
  const reviewed = publishedAt
    ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
        new Date(publishedAt),
      )
    : undefined

  return (
    <article
      className={cn(
        'flex flex-col gap-2.5 rounded-[10px] border border-[#E4E7EC] bg-card p-6 hover:cursor-pointer hover:border-primary hover:shadow-[0_4px_16px_rgba(30,79,216,0.10)]',
        className,
      )}
      ref={card.ref}
    >
      {categoryTitle && (
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          {categoryTitle}
        </span>
      )}
      {titleToUse && (
        <h3 className="text-[18px] font-bold leading-[1.35]">
          <Link className="no-underline" href={href} ref={link.ref}>
            {titleToUse}
          </Link>
        </h3>
      )}
      {sanitizedDescription && (
        <p className="text-sm leading-relaxed text-muted-foreground">{sanitizedDescription}</p>
      )}
      {reviewed && <span className="mt-auto text-[13px] text-[#98A1AE]">Last reviewed {reviewed}</span>}
    </article>
  )
}
