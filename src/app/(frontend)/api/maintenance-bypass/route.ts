import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()

    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'maintenance-mode' }) as any

    if (settings?.password && settings.password === password) {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('maintenance_bypass', '1', {
        path: '/',
        maxAge: 60 * 60 * 24,
        httpOnly: true,
      })
      return res
    }

    return NextResponse.json({ ok: false }, { status: 403 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
