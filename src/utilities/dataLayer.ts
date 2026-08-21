/**
 * Thin wrapper around the GTM dataLayer.
 *
 * GTM is loaded on every page (Consent Mode v2 defaults to denied until the
 * visitor accepts), so events can be pushed unconditionally — Google decides
 * what is allowed to be stored or sent based on the current consent state.
 */
export type DataLayerEvent = Record<string, unknown> & { event: string }

export function pushDataLayer(payload: DataLayerEvent): void {
  if (typeof window === 'undefined') return
  const w = window as unknown as { dataLayer?: unknown[] }
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push(payload)
}
