interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  maxRequests?: number
  windowSeconds?: number
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {},
): { allowed: boolean; remaining: number } {
  const { maxRequests = 10, windowSeconds = 60 } = options
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 })
    return { allowed: true, remaining: maxRequests - 1 }
  }

  entry.count++
  if (entry.count > maxRequests) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: maxRequests - entry.count }
}

export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}
