import React from 'react'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { AnnouncementBarClient } from './index'

export const AnnouncementBarLoader: React.FC = async () => {
  try {
    const settings = (await getCachedGlobal('announcement-bar', 300)()) as any

    if (!settings?.enabled || !settings?.text) return null

    return (
      <AnnouncementBarClient
        text={settings.text}
        linkUrl={settings.linkUrl || undefined}
        linkText={settings.linkText || undefined}
        backgroundColor={settings.backgroundColor || '#E8177A'}
        textColor={settings.textColor || '#FFFFFF'}
        dismissible={settings.dismissible !== false}
        showOnMobile={settings.showOnMobile !== false}
        startsAt={settings.startsAt || null}
        expiresAt={settings.expiresAt || null}
      />
    )
  } catch {
    return null
  }
}
