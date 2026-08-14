'use client'

import React from 'react'
import { useLivePreview } from '@payloadcms/live-preview-react'
import RichText from '@/components/RichText'
import { PostHero } from '@/heros/PostHero'
import { SocialShare } from '@/components/SocialShare'
import { AuthorCard } from '@/components/AuthorCard'
import { TableOfContents } from '@/components/TableOfContents'
import { getClientSideURL } from '@/utilities/getURL'

import type { Post } from '@/payload-types'

type Props = {
  initialData: Post
  postUrl: string
}

export const LivePreviewPost: React.FC<Props> = ({ initialData, postUrl }) => {
  const { data } = useLivePreview<Post>({
    serverURL: getClientSideURL(),
    depth: 2,
    initialData,
  })

  const ogImage =
    data.meta?.image && typeof data.meta.image === 'object'
      ? (data.meta.image as any).url
      : undefined

  return (
    <>
      <PostHero post={data} />
      <div className="flex flex-col items-center gap-4 pt-8">
        <div className="container">
          <div className="flex gap-10 xl:gap-16 items-start">
            <div className="min-w-0 flex-1">
              <RichText className="max-w-[48rem]" data={data.content} enableGutter={false} />
              <div className="max-w-[48rem] mt-8 pt-8 border-t border-border">
                <SocialShare
                  url={postUrl}
                  title={data.title}
                  description={data.meta?.description || undefined}
                  image={ogImage}
                />
              </div>
              {data.populatedAuthors && data.populatedAuthors.length > 0 && (
                <div className="max-w-[48rem] mt-8">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    {data.populatedAuthors.length === 1 ? 'About the Author' : 'About the Authors'}
                  </p>
                  <div className="flex flex-col gap-4">
                    {data.populatedAuthors.map((author) => (
                      <AuthorCard key={author.id} author={author as any} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <aside className="hidden xl:block w-64 shrink-0 sticky top-24 self-start">
              <TableOfContents content={data.content} />
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
