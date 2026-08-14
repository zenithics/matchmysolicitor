import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { NewsletterPopup } from './index'

export const NewsletterPopupLoader: React.FC = async () => {
  try {
    const settings = (await getCachedGlobal('newsletter-settings', 3600)()) as any

    if (!settings?.popupEnabled) return null

    return (
      <NewsletterPopup
        settings={{
          popupEnabled: settings.popupEnabled,
          popupDelay: settings.popupDelay ?? 5,
          popupHeading: settings.popupHeading,
          popupBody: settings.popupBody,
          popupImage: settings.popupImage && typeof settings.popupImage === 'object'
            ? settings.popupImage
            : null,
          popupDismissDays: settings.popupDismissDays ?? 7,
        }}
      />
    )
  } catch {
    return null
  }
}
