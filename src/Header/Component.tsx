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

  /*
   * The design's header opens a dropdown of service pages under "For Employers"
   * and "For Employees". The Header global has no children field and adding one
   * means a schema change plus a migration, so instead derive the children from
   * the published service pages themselves — they follow a strict slug
   * convention (for-employers-*, for-employees-*) set by the importer.
   */
  // design-export/SiteHeader.dc.html's dropdown order (most urgent/searched
  // service first) — deliberately not alphabetical, so sorting the query by
  // title doesn't reproduce it. No "order" field exists on Pages to drive this
  // from the CMS instead (adding one is a schema change), so it's a fixed
  // priority list here; anything not in it sorts after, alphabetically.
  const DROPDOWN_ORDER: Record<string, string[]> = {
    'for-employers': [
      'for-employers-tribunal-defence',
      'for-employers-settlement-agreements',
      'for-employers-constructive-dismissal-defence',
      'for-employers-interim-relief-hearings',
      'for-employers-redundancy-restructuring',
      'for-employers-disciplinary-grievance',
    ],
    'for-employees': [
      'for-employees-unfair-dismissal',
      'for-employees-constructive-dismissal',
      'for-employees-discrimination',
      'for-employees-settlement-agreements',
      'for-employees-employment-tribunal-claims',
      'for-employees-senior-exits',
    ],
  }

  const dropdowns: Record<string, { href: string; label: string }[]> = {}
  try {
    const payload = await getPayload({ config: configPromise })
    for (const parent of ['for-employers', 'for-employees']) {
      const children = await payload.find({
        collection: 'pages',
        depth: 0,
        limit: 12,
        pagination: false,
        where: {
          and: [
            { slug: { like: `${parent}-` } },
            { _status: { equals: 'published' } },
          ],
        },
        sort: 'title',
      })
      const priority = DROPDOWN_ORDER[parent] ?? []
      const items = (children?.docs ?? [])
        .filter((d: { slug?: string | null }) => typeof d.slug === 'string')
        .map((d: { slug?: string | null; title?: string | null }) => ({
          href: `/${d.slug}`,
          label: (d.title ?? '').replace(/^For (employers|employees):?\s*/i, ''),
          slug: d.slug as string,
        }))
        .sort((a, b) => {
          const ai = priority.indexOf(a.slug)
          const bi = priority.indexOf(b.slug)
          if (ai === -1 && bi === -1) return 0
          if (ai === -1) return 1
          if (bi === -1) return -1
          return ai - bi
        })
        .map(({ href, label }) => ({ href, label }))
      if (items.length) dropdowns[`/${parent}`] = items
    }
  } catch {
    // No DB at build time — header renders as flat links.
  }

  if (!headerData) return null

  return (
    <HeaderClient data={headerData} logo={logo} brandName={brandName} dropdowns={dropdowns} />
  )
}
