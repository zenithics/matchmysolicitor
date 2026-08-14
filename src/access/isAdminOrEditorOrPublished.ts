import type { Access } from 'payload'
import type { User } from '@/payload-types'

export const isAdminOrEditorOrPublished: Access = ({ req: { user } }) => {
  const role = (user as User)?.role
  if (user && (role === 'admin' || role === 'editor')) return true
  return { _status: { equals: 'published' } }
}
