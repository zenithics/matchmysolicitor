import type { AccessArgs } from 'payload'
import type { User } from '@/payload-types'

export const isAdmin = ({ req: { user } }: AccessArgs): boolean => {
  return Boolean(user && (user as User).role === 'admin')
}
