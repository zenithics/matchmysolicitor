import { getPayload } from 'payload'
import config from '@payload-config'

interface PermalinkData {
  postsPrefix: string
  policiesPrefix: string
}

const DEFAULTS: PermalinkData = {
  postsPrefix: 'posts',
  policiesPrefix: 'policies',
}

const CACHE_TTL_MS = 60_000
let settingsCache: { data: PermalinkData; fetchedAt: number } | null = null

async function fetchSettings(): Promise<PermalinkData> {
  const now = Date.now()
  if (settingsCache && now - settingsCache.fetchedAt < CACHE_TTL_MS) {
    return settingsCache.data
  }
  try {
    const payload = await getPayload({ config })
    const raw = (await payload.findGlobal({ slug: 'permalink-settings' })) as any
    const data: PermalinkData = {
      postsPrefix: raw?.postsPrefix || DEFAULTS.postsPrefix,
      policiesPrefix: raw?.policiesPrefix || DEFAULTS.policiesPrefix,
    }
    settingsCache = { data, fetchedAt: now }
    return data
  } catch {
    return settingsCache?.data ?? DEFAULTS
  }
}

export async function getPrefix(
  collection: 'posts' | 'policies' | 'pages',
): Promise<string> {
  if (collection === 'pages') return ''
  const s = await fetchSettings()
  switch (collection) {
    case 'posts': return `/${s.postsPrefix}`
    case 'policies': return `/${s.policiesPrefix}`
  }
}

export async function getContentUrl(
  collection: 'posts' | 'policies' | 'pages',
  slug: string,
): Promise<string> {
  if (collection === 'pages') {
    return slug === 'home' ? '/' : `/${slug}`
  }
  const prefix = await getPrefix(collection)
  return `${prefix}/${slug}`
}

export async function getAllPrefixes(): Promise<Record<string, string>> {
  const s = await fetchSettings()
  return {
    posts: s.postsPrefix,
    policies: s.policiesPrefix,
  }
}
