import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { generateTOTPSecret } from '@/utilities/totp'
import type { User } from '@/payload-types'
import { checkRateLimit, getClientIP } from '@/utilities/rateLimit'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const clientIP = getClientIP(req.headers)
  const { allowed } = checkRateLimit(`2fa-setup:${clientIP}`, { maxRequests: 3, windowSeconds: 600 })
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many setup attempts. Please try again later.' },
      { status: 429 },
    )
  }

  const payload = await getPayload({ config: configPromise })

  const { user: rawUser } = await payload.auth({ headers: req.headers })
  if (!rawUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const user = rawUser as User

  if (user.twoFactorEnabled) {
    return NextResponse.json({ error: '2FA already enabled' }, { status: 400 })
  }

  const { secret, uri } = generateTOTPSecret(user.email || (user.name as string | undefined) || 'User')

  // Store secret temporarily (will be confirmed by /verify endpoint)
  await payload.update({
    collection: 'users',
    id: user.id,
    data: { twoFactorSecret: secret } as Record<string, unknown>,
    overrideAccess: true,
  })

  const qrDataUrl = await QRCode.toDataURL(uri)

  return NextResponse.json({ secret, qrDataUrl })
}
