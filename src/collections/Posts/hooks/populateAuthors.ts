import type { CollectionAfterReadHook } from 'payload'
import { User } from '@/payload-types'

// The `user` collection has access control locked so that users are not publicly accessible
// This means that we need to populate the authors manually here to protect user privacy
// GraphQL will not return mutated user data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the user data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook = async ({ doc, req, req: { payload } }) => {
  if (doc?.authors && doc?.authors?.length > 0) {
    const authorDocs: User[] = []

    for (const author of doc.authors) {
      try {
        const authorDoc = await payload.findByID({
          id: typeof author === 'object' ? author?.id : author,
          collection: 'users',
          depth: 0,
        })

        if (authorDoc) {
          authorDocs.push(authorDoc)
        }

        if (authorDocs.length > 0) {
          doc.populatedAuthors = authorDocs.map((authorDoc) => ({
            id: authorDoc.id,
            name: authorDoc.name,
            role: (authorDoc as any).jobTitle || null,
            bio: (authorDoc as any).bio || null,
            slug: (authorDoc as any).slug || null,
            avatar: (authorDoc as any).avatar || null,
            twitter: (authorDoc as any).twitter || null,
            linkedin: (authorDoc as any).linkedin || null,
            instagram: (authorDoc as any).instagram || null,
            website: (authorDoc as any).website || null,
          }))
        }
      } catch {
        // swallow error
      }
    }
  }

  return doc
}
