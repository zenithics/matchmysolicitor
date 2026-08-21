import type { PayloadRequest } from 'payload'
import { getPayload } from 'payload'

import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import configPromise from '@payload-config'

export type PreviewSearchParams = {
  path: string
  previewSecret: string
}

export async function GET(req: NextRequest): Promise<Response> {
  const payload = await getPayload({ config: configPromise })

  const { searchParams } = new URL(req.url)

  const path = searchParams.get('path')
  const previewSecret = searchParams.get('previewSecret')

  if (!path) {
    return new Response('Insufficient search params', { status: 404 })
  }

  if (!path.startsWith('/')) {
    return new Response('This endpoint can only be used for relative previews', { status: 500 })
  }

  // Authentication is the real gate: the logged-in Payload user's cookie is sent
  // with the preview request. PREVIEW_SECRET cannot be relied on here because the
  // admin UI builds the preview URL in the browser (see generatePreviewPath), where
  // a non-public env var is always undefined — comparing it server-side rejected
  // every legitimate preview click with a 403.
  let user: unknown = null

  try {
    const authResult = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    })
    user = authResult?.user ?? null
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  const draft = await draftMode()

  // Fallback for non-browser/integration callers that pass the shared secret.
  const secretMatches = Boolean(process.env.PREVIEW_SECRET) &&
    previewSecret === process.env.PREVIEW_SECRET

  if (!user && !secretMatches) {
    draft.disable()
    return new Response('You are not allowed to preview this page', { status: 403 })
  }

  // You can add additional checks here to see if the user is allowed to preview this page

  draft.enable()

  redirect(path)
}
