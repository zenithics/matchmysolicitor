import type { Metadata } from 'next'
import React from 'react'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Card } from '@/components/Card'
import { AuthorCard } from '@/components/AuthorCard'

type Args = {
  params: Promise<{ slug: string }>
}

async function getAuthorBySlug(slug: string) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'users',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  })

  return result.docs?.[0] || null
}

async function getPostsByAuthor(authorId: string) {
  const payload = await getPayload({ config })

  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { authors: { contains: authorId } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: '-publishedAt',
    limit: 24,
    depth: 1,
  })

  return result.docs
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthorBySlug(slug)
  if (!author) return { title: 'Author Not Found' }

  return {
    title: `${(author as any).name} — Author`,
    description: (author as any).bio || undefined,
  }
}

export default async function AuthorPage({ params }: Args) {
  const { slug } = await params
  const author = await getAuthorBySlug(slug) as any

  if (!author) notFound()

  const posts = await getPostsByAuthor(String(author.id))

  const avatarUrl =
    author.avatar && typeof author.avatar === 'object' ? author.avatar.url : null

  return (
    <div className="container py-16">
      {/* Author profile */}
      <div className="max-w-2xl mx-auto mb-12">
        <AuthorCard
          author={{
            ...author,
            avatar: avatarUrl ? { url: avatarUrl, alt: author.name || '' } : null,
          }}
        />
      </div>

      {/* Posts */}
      <div className="max-w-5xl mx-auto">
        <h2 className="text-xl font-bold mb-6">
          Articles by {author.name}
          <span className="ml-2 text-base font-normal text-muted-foreground">
            ({posts.length})
          </span>
        </h2>

        {posts.length === 0 ? (
          <p className="text-muted-foreground">No published posts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} doc={post} relationTo="posts" showCategories />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
