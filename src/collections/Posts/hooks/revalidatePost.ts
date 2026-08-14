import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

async function getPostsPrefix(payload: any): Promise<string> {
  try {
    const settings = await payload.findGlobal({ slug: 'permalink-settings' })
    return settings?.postsPrefix || 'posts'
  } catch {
    return 'posts'
  }
}

export const revalidatePost: CollectionAfterChangeHook<Post> = async ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const prefix = await getPostsPrefix(payload)

    if (doc._status === 'published') {
      const canonicalPath = `/posts/${doc.slug}`
      const customPath = `/${prefix}/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${customPath}`)

      revalidatePath(canonicalPath)
      if (prefix !== 'posts') revalidatePath(customPath)
      revalidateTag('posts-sitemap', 'max')
    }

    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const prefix2 = prefix
      const canonicalOldPath = `/posts/${previousDoc.slug}`
      const customOldPath = `/${prefix2}/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${customOldPath}`)

      revalidatePath(canonicalOldPath)
      if (prefix2 !== 'posts') revalidatePath(customOldPath)
      revalidateTag('posts-sitemap', 'max')
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = async ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    const prefix = await getPostsPrefix(payload)
    const canonicalPath = `/posts/${doc?.slug}`
    const customPath = `/${prefix}/${doc?.slug}`

    revalidatePath(canonicalPath)
    if (prefix !== 'posts') revalidatePath(customPath)
    revalidateTag('posts-sitemap', 'max')
  }

  return doc
}
