import { getPayload } from 'payload'
import config from '@payload-config'

interface IndexingResult {
  success: boolean
  url: string
  error?: string
}

async function getAccessToken(email: string, privateKey: string): Promise<string> {
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const now = Math.floor(Date.now() / 1000)
  const claim = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    }),
  ).toString('base64url')

  const { createSign } = await import('crypto')
  const sign = createSign('RSA-SHA256')
  sign.update(`${header}.${claim}`)
  const signature = sign.sign(privateKey.replace(/\\n/g, '\n'), 'base64url')

  const jwt = `${header}.${claim}.${signature}`

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })

  const data = await response.json()
  if (!data.access_token) throw new Error(data.error_description || 'Failed to get access token')
  return data.access_token
}

export async function submitToGoogleIndexing(
  urls: string[],
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED',
): Promise<IndexingResult[]> {
  const payload = await getPayload({ config })
  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' })) as any

  if (!seoSettings?.googleIndexingEnabled) return []
  if (!seoSettings?.googleIndexingServiceAccountEmail || !seoSettings?.googleIndexingPrivateKey) {
    return []
  }

  const accessToken = await getAccessToken(
    seoSettings.googleIndexingServiceAccountEmail,
    seoSettings.googleIndexingPrivateKey,
  )

  const results: IndexingResult[] = []

  for (const url of urls) {
    try {
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ url, type }),
      })

      if (response.ok) {
        results.push({ success: true, url })
      } else {
        const error = await response.json()
        results.push({ success: false, url, error: error.error?.message || response.statusText })
      }
    } catch (err: any) {
      results.push({ success: false, url, error: err.message })
    }
  }

  return results
}
