import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { User } from '@/payload-types'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config: configPromise })

  const { user: rawUser } = await payload.auth({ headers: req.headers })
  if (!rawUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = rawUser as User

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
    } as Record<string, unknown>,
    overrideAccess: true,
  })

  const res = NextResponse.json({ success: true })
  res.cookies.delete('payload-2fa')
  return res
}
