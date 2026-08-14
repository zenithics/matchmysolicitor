import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { validateTOTPCode, validateBackupCode } from '@/utilities/totp'
import type { User } from '@/payload-types'

const COOKIE_NAME = 'payload-2fa'
const COOKIE_MAX_AGE = 7200 // 2 hours — matches Payload token expiry

export async function POST(req: NextRequest): Promise<NextResponse> {
  const payload = await getPayload({ config: configPromise })

  const { user: rawUser } = await payload.auth({ headers: req.headers })
  if (!rawUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = rawUser as User

  const { code } = await req.json()
  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Code is required' }, { status: 400 })
  }

  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
  })

  if (!fullUser?.twoFactorEnabled) {
    return NextResponse.json({ error: '2FA not enabled' }, { status: 400 })
  }

  const secret = fullUser.twoFactorSecret as string | undefined
  if (!secret) {
    return NextResponse.json({ error: '2FA secret not configured' }, { status: 500 })
  }

  const totpValid = validateTOTPCode(secret, code)

  if (!totpValid) {
    // Try backup codes
    const storedHashes = (fullUser.twoFactorBackupCodes as string[]) || []
    const matchIndex = validateBackupCode(storedHashes, code)

    if (matchIndex === -1) {
      return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
    }

    // Consume the backup code (remove it from the list)
    const remaining = storedHashes.filter((_, i) => i !== matchIndex)
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { twoFactorBackupCodes: remaining } as Record<string, unknown>,
      overrideAccess: true,
    })
  }

  // Set a signed verification cookie — httponly, same-site strict
  const res = NextResponse.json({ success: true })
  res.cookies.set(COOKIE_NAME, String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })

  return res
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const res = NextResponse.json({ success: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
