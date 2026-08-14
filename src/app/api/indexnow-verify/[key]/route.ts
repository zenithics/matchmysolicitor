import { getPayload } from 'payload'
import config from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  const { key } = await params
  const payload = await getPayload({ config })
  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' }).catch(() => null)) as any

  if (seoSettings?.indexNowApiKey && key === seoSettings.indexNowApiKey) {
    return new NextResponse(key, { headers: { 'Content-Type': 'text/plain' } })
  }

  return new NextResponse('Not Found', { status: 404 })
}
