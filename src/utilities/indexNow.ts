import { getPayload } from 'payload'
import config from '@payload-config'

export async function submitToIndexNow(urls: string[]): Promise<boolean> {
  const payload = await getPayload({ config })
  const seoSettings = (await payload.findGlobal({ slug: 'seo-settings' })) as any

  if (!seoSettings?.indexNowEnabled || !seoSettings?.indexNowApiKey) return false

  const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const host = new URL(siteUrl).host

  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host,
        key: seoSettings.indexNowApiKey,
        keyLocation: `${siteUrl}/${seoSettings.indexNowApiKey}.txt`,
        urlList: urls,
      }),
    })
    return response.ok || response.status === 202
  } catch {
    return false
  }
}
