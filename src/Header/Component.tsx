import { HeaderClient } from './Component.client'
import { getCachedGlobal } from '@/utilities/getGlobals'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Media } from '@/payload-types'
import React from 'react'
import type { Header as HeaderType } from '@/payload-types'

export async function Header() {
  let headerData: HeaderType | undefined
  try {
    headerData = (await getCachedGlobal('header', 1)()) as HeaderType
  } catch {
    // DB unavailable during build — render with defaults
  }

  let logo: Media | null = null
  let brandName: string | undefined
  try {
    const payload = await getPayload({ config: configPromise })
    const appearance = await payload.findGlobal({ slug: 'site-appearance', depth: 1 })
    if (appearance?.logo && typeof appearance.logo === 'object') {
      logo = appearance.logo as Media
    }
    // Text fallback when no logo is uploaded: use the real brand name from the
    // footer global rather than shipping a "Your Brand" placeholder live.
    const footer = await payload.findGlobal({ slug: 'footer', depth: 0 })
    if (footer?.brandName) brandName = footer.brandName as string
  } catch {
    // No DB at build time — logo stays null, text fallback renders
  }

  if (!headerData) return null

  return <HeaderClient data={headerData} logo={logo} brandName={brandName} />
}
