import { getPayload } from 'payload'
import config from '@payload-config'
import { CookieConsent } from './index'

export interface CookieConsentConfig {
  bannerTitle: string
  bannerText: string
  acceptAllLabel: string
  rejectAllLabel: string
  managePrefsLabel: string
  modalTitle: string
  modalSubtext: string
  savePrefsLabel: string
  cookieSettingsLinkLabel: string
  consentCookieExpiry: number
  necessaryLabel: string
  necessaryDescription: string
  analyticsLabel: string
  analyticsDescription: string
  advertisingLabel: string
  advertisingDescription: string
}

const DEFAULTS: CookieConsentConfig = {
  bannerTitle: 'We use cookies 🍪',
  bannerText:
    'We use cookies to improve your experience and measure site performance. Some cookies are essential, others help us understand how you use our site.',
  acceptAllLabel: 'Accept All',
  rejectAllLabel: 'Reject All',
  managePrefsLabel: 'Manage Preferences',
  modalTitle: 'Cookie Preferences',
  modalSubtext: 'Choose which cookies you allow. You can change these at any time.',
  savePrefsLabel: 'Save Preferences',
  cookieSettingsLinkLabel: 'Cookie Settings',
  consentCookieExpiry: 365,
  necessaryLabel: 'Necessary',
  necessaryDescription:
    'Required for the site to work. Includes your cart, session, and consent settings. Cannot be disabled.',
  analyticsLabel: 'Analytics',
  analyticsDescription:
    'Help us understand how visitors use our site (Google Analytics, Microsoft Clarity).',
  advertisingLabel: 'Advertising',
  advertisingDescription:
    'Used to show you relevant ads and measure ad performance (Meta, TikTok, Reddit).',
}

export async function CookieConsentLoader() {
  let cfg: CookieConsentConfig = DEFAULTS

  try {
    const payload = await getPayload({ config })
    const settings = (await payload.findGlobal({ slug: 'privacy-settings' })) as any

    cfg = {
      bannerTitle: settings?.bannerTitle || DEFAULTS.bannerTitle,
      bannerText: settings?.bannerText || DEFAULTS.bannerText,
      acceptAllLabel: settings?.acceptAllLabel || DEFAULTS.acceptAllLabel,
      rejectAllLabel: settings?.rejectAllLabel || DEFAULTS.rejectAllLabel,
      managePrefsLabel: settings?.managePrefsLabel || DEFAULTS.managePrefsLabel,
      modalTitle: settings?.modalTitle || DEFAULTS.modalTitle,
      modalSubtext: settings?.modalSubtext || DEFAULTS.modalSubtext,
      savePrefsLabel: settings?.savePrefsLabel || DEFAULTS.savePrefsLabel,
      cookieSettingsLinkLabel: settings?.cookieSettingsLinkLabel || DEFAULTS.cookieSettingsLinkLabel,
      consentCookieExpiry: settings?.consentCookieExpiry ?? DEFAULTS.consentCookieExpiry,
      necessaryLabel: settings?.necessaryLabel || DEFAULTS.necessaryLabel,
      necessaryDescription: settings?.necessaryDescription || DEFAULTS.necessaryDescription,
      analyticsLabel: settings?.analyticsLabel || DEFAULTS.analyticsLabel,
      analyticsDescription: settings?.analyticsDescription || DEFAULTS.analyticsDescription,
      advertisingLabel: settings?.advertisingLabel || DEFAULTS.advertisingLabel,
      advertisingDescription: settings?.advertisingDescription || DEFAULTS.advertisingDescription,
    }
  } catch {
    // use defaults
  }

  return <CookieConsent config={cfg} />
}
