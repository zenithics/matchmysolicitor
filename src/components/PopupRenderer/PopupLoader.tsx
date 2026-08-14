import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { PopupRenderer } from './index'

export const PopupLoader: React.FC = async () => {
  try {
    const payload = await getPayload({ config })
    const now = new Date().toISOString()

    const result = await payload.find({
      collection: 'popups',
      where: {
        and: [
          { active: { equals: true } },
          {
            or: [{ startsAt: { exists: false } }, { startsAt: { less_than_equal: now } }],
          },
          {
            or: [{ expiresAt: { exists: false } }, { expiresAt: { greater_than_equal: now } }],
          },
        ],
      },
      limit: 10,
      depth: 1,
    })

    if (result.docs.length === 0) return null

    const popups = result.docs.map((doc: any) => ({
      id: String(doc.id),
      name: doc.name,
      layout: doc.layout || 'newsletter',
      heading: doc.heading || undefined,
      body: doc.body || undefined,
      image:
        doc.image && typeof doc.image === 'object'
          ? { url: doc.image.url, alt: doc.image.alt || '' }
          : null,
      discountCode: doc.discountCode || undefined,
      ctaText: doc.ctaText || undefined,
      ctaUrl: doc.ctaUrl || undefined,
      successMessage: doc.successMessage || undefined,
      customHtml: doc.customHtml || undefined,
      triggerType: doc.triggerType || 'delay',
      triggerDelay: doc.triggerDelay ?? 5,
      triggerScrollPercent: doc.triggerScrollPercent ?? 50,
      dismissDays: doc.dismissDays ?? 30,
      showOncePerSession: doc.showOncePerSession || false,
      urlCondition: doc.urlCondition || undefined,
      size: doc.size || 'medium',
      position: doc.position || 'center',
      showCloseButton: doc.showCloseButton !== false,
      overlayDismiss: doc.overlayDismiss !== false,
      backgroundColor: doc.backgroundColor || undefined,
    }))

    return <PopupRenderer popups={popups} />
  } catch {
    return null
  }
}
