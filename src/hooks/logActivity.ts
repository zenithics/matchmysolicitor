import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

const SKIP_COLLECTIONS = ['activity-log', 'search', 'payload-preferences', 'payload-migrations']

export const logCollectionChange: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  collection,
  req,
}) => {
  if (SKIP_COLLECTIONS.includes(collection.slug)) return doc
  if (!req.user) return doc

  try {
    type ActionValue = 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'login'
    let action: ActionValue = operation as ActionValue

    if (operation === 'update' && doc._status && previousDoc?._status) {
      if (doc._status === 'published' && previousDoc._status === 'draft') action = 'publish'
      if (doc._status === 'draft' && previousDoc._status === 'published') action = 'unpublish'
    }

    await req.payload.create({
      collection: 'activity-log',
      data: {
        action,
        user: req.user.id,
        userName: (req.user as any).name || (req.user as any).email,
        collection: collection.slug,
        documentId: String(doc.id),
        documentTitle: doc.title || doc.name || doc.slug || String(doc.id),
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    // Never block the operation
  }

  return doc
}

export const logCollectionDelete: CollectionAfterDeleteHook = async ({
  doc,
  collection,
  req,
}) => {
  if (SKIP_COLLECTIONS.includes(collection.slug)) return doc
  if (!req.user) return doc

  try {
    await req.payload.create({
      collection: 'activity-log',
      data: {
        action: 'delete',
        user: req.user.id,
        userName: (req.user as any).name || (req.user as any).email,
        collection: collection.slug,
        documentId: String(doc.id),
        documentTitle: doc.title || doc.name || doc.slug || String(doc.id),
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    // Never block the operation
  }

  return doc
}

export const logGlobalChange: GlobalAfterChangeHook = async ({
  doc,
  global,
  req,
}) => {
  if (!req.user) return doc

  try {
    await req.payload.create({
      collection: 'activity-log',
      data: {
        action: 'update',
        user: req.user.id,
        userName: (req.user as any).name || (req.user as any).email,
        globalSlug: global.slug,
        documentTitle: global.label
          ? typeof global.label === 'string'
            ? global.label
            : global.slug
          : global.slug,
        timestamp: new Date().toISOString(),
      },
    })
  } catch {
    // Never block the operation
  }

  return doc
}
