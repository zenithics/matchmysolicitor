import type { Access } from 'payload'

export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if ((user as any).role === 'admin') return true
  return {
    id: { equals: user.id },
  }
}
