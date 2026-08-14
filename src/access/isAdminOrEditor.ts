import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isAdminOrEditor = ({ req: { user } }: AccessArgs): boolean => {
  const role = (user as User)?.role
  return Boolean(user && (role === 'admin' || role === 'editor'))
}
