import { cn } from '@/utilities/ui'
import React from 'react'

import { Card, CardPostData } from '@/components/Card'
import { getContentUrl } from '@/utilities/getContentUrl'

export type Props = {
  posts: CardPostData[]
}

export const CollectionArchive = async ({ posts }: Props) => {
  const postUrls = await Promise.all(
    (posts ?? []).map((p) =>
      typeof p === 'object' && p !== null && p.slug
        ? getContentUrl('posts', p.slug)
        : Promise.resolve(undefined),
    ),
  )

  return (
    <div className={cn('grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6')}>
      {posts?.map((result, index) => {
        if (typeof result === 'object' && result !== null) {
          return (
            <Card
              className="h-full"
              key={index}
              doc={result}
              href={postUrls[index]}
              relationTo="posts"
              showCategories
            />
          )
        }

        return null
      })}
    </div>
  )
}
