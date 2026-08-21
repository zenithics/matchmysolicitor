/**
 * Slugs that ship a bundled illustration at `/public/guides/<slug>.webp`.
 *
 * These are the default guide illustrations. A Hero Image or SEO image
 * uploaded in the CMS always takes priority — the bundled file is only used
 * when a guide has no image of its own, so no guide publishes imageless.
 */
export const GUIDE_FALLBACK_IMAGE_SLUGS = new Set<string>([
  'acas-early-conciliation',
  'age-discrimination',
  'disability-discrimination',
  'employment-rights-act-1996',
  'garden-leave',
  'how-long-tribunal',
  'need-solicitor-tribunal',
  'offered-settlement-agreement',
  'pregnancy-maternity-discrimination',
  'protected-conversations',
  'race-discrimination',
  'sacked-without-warning',
  'tribunal-process',
  'what-is-constructive-dismissal',
  'what-is-unfair-dismissal',
  'without-prejudice',
])

export function guideFallbackImagePath(slug?: string | null): string | null {
  if (!slug) return null
  return GUIDE_FALLBACK_IMAGE_SLUGS.has(slug) ? `/guides/${slug}.webp` : null
}
