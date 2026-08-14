import { getPayload } from 'payload'
import config from '@payload-config'
import { CookieSettingsButton } from '@/components/CookieConsent'

export async function CookieSettingsFooter() {
  let label = 'Cookie Settings'
  try {
    const payload = await getPayload({ config })
    const settings = (await payload.findGlobal({ slug: 'privacy-settings' })) as any
    label = settings?.cookieSettingsLinkLabel || label
  } catch {
    // use default
  }
  return <CookieSettingsButton label={label} />
}
