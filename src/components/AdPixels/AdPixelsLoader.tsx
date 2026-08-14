import { getPayload } from 'payload'
import config from '@payload-config'
import { AdPixels } from './index'

export async function AdPixelsLoader() {
  try {
    const payload = await getPayload({ config })
    const seo = (await payload.findGlobal({ slug: 'seo-settings' })) as any

    return (
      <AdPixels
        metaPixelId={seo?.metaPixelId || undefined}
        tiktokPixelId={seo?.tiktokPixelId || undefined}
        redditPixelId={seo?.redditPixelId || undefined}
        gadsConversionId={seo?.gadsConversionId || undefined}
        pinterestTagId={seo?.pinterestTagId || undefined}
        snapchatPixelId={seo?.snapchatPixelId || undefined}
      />
    )
  } catch {
    return null
  }
}
