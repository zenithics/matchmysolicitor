import { getPayload } from 'payload'
import configPromise from '@payload-config'

export type LocaleSettings = {
  timezone: string
  language: string
  dateFormat: string
  currencyPosition: 'before' | 'after'
}

const DEFAULTS: LocaleSettings = {
  timezone: 'Europe/London',
  language: 'en-GB',
  dateFormat: 'DD/MM/YYYY',
  currencyPosition: 'before',
}

let cached: LocaleSettings | null = null

export async function getLocaleSettings(): Promise<LocaleSettings> {
  if (cached) return cached

  try {
    const payload = await getPayload({ config: configPromise })
    const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
    cached = {
      timezone: (settings?.timezone as string) || DEFAULTS.timezone,
      language: (settings?.language as string) || DEFAULTS.language,
      dateFormat: (settings?.dateFormat as string) || DEFAULTS.dateFormat,
      currencyPosition: ((settings?.currencyPosition as string) || DEFAULTS.currencyPosition) as 'before' | 'after',
    }
    return cached
  } catch {
    return DEFAULTS
  }
}

export function formatDate(date: string | Date, format: string, timezone?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''

  const opts: Intl.DateTimeFormatOptions = { timeZone: timezone || 'Europe/London' }
  const parts = new Intl.DateTimeFormat('en-GB', {
    ...opts,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(d)

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  const dd = get('day')
  const mm = get('month')
  const yyyy = get('year')

  switch (format) {
    case 'MM/DD/YYYY': return `${mm}/${dd}/${yyyy}`
    case 'YYYY-MM-DD': return `${yyyy}-${mm}-${dd}`
    default: return `${dd}/${mm}/${yyyy}`
  }
}
