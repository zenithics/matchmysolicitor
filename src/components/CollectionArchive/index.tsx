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
    <div className={cn('container')}>
      <div>
        <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
          {posts?.map((result, index) => {
            if (typeof result === 'object' && result !== null) {
              return (
                <div className="col-span-4" key={index}>
                  <Card
                    className="h-full"
                    doc={result}
                    href={postUrls[index]}
                    relationTo="posts"
                    showCategories
                  />
                </div>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
