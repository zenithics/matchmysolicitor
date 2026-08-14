/**
 * Check if the user has consented to a specific cookie category.
 * Use this to conditionally load analytics/marketing scripts.
 *
 * Usage:
 *   if (hasConsent('analytics')) {
 *     // Load Google Analytics
 *   }
 */
export function hasConsent(category: string): boolean {
  if (typeof document === 'undefined') return false

  const match = document.cookie.match(/(^| )cookie_consent=([^;]+)/)
  if (!match) return false

  try {
    const consent = JSON.parse(decodeURIComponent(match[2]))
    return consent[category] === true
  } catch {
    return false
  }
}

/**
 * Listen for consent changes.
 */
export function onConsentChange(
  callback: (consent: Record<string, boolean>) => void,
): () => void {
  const handler = (event: Event) => {
    callback((event as CustomEvent).detail)
  }
  window.addEventListener('cookieConsentUpdated', handler)
  return () => window.removeEventListener('cookieConsentUpdated', handler)
}
