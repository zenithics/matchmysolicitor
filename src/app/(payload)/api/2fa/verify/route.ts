import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { validateTOTPCode, generateBackupCodes, hashBackupCode } from '@/utilities/totp'
import type { User } from '@/payload-types'
import { checkRateLimit, getClientIP } from '@/utilities/rateLimit'

export async function POST(req: NextRequest): Promise<NextResponse> {
  const clientIP = getClientIP(req.headers)
  const { allowed } = checkRateLimit(`2fa-verify:${clientIP}`, { maxRequests: 5, windowSeconds: 300 })
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many verification attempts. Please try again in 5 minutes.' },
      { status: 429 },
    )
  }

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

  // Fetch user with overrideAccess to get the secret
  const fullUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    overrideAccess: true,
  })

  const secret = fullUser?.twoFactorSecret as string | undefined
  if (!secret) {
    return NextResponse.json({ error: 'No secret found. Please restart setup.' }, { status: 400 })
  }

  if (!validateTOTPCode(secret, code)) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 })
  }

  // Generate backup codes and store their hashes
  const plainCodes = generateBackupCodes()
  const hashedCodes = plainCodes.map(hashBackupCode)

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      twoFactorEnabled: true,
      twoFactorBackupCodes: hashedCodes,
    } as Record<string, unknown>,
    overrideAccess: true,
  })

  const res = NextResponse.json({ backupCodes: plainCodes })
  res.cookies.set('payload-2fa', String(user.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7200, // 2 hours — matches Payload token expiry
    path: '/',
  })
  return res
}
