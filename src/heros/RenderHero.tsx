import React from 'react'

import type { Page } from '@/payload-types'

import { HighImpactHero } from '@/heros/HighImpact'
import { LowImpactHero } from '@/heros/LowImpact'
import { MediumImpactHero } from '@/heros/MediumImpact'

const heroes = {
  highImpact: HighImpactHero,
  lowImpact: LowImpactHero,
  mediumImpact: MediumImpactHero,
}

export const RenderHero: React.FC<Page['hero']> = (props) => {
  const { type } = props || {}

  if (!type || type === 'none') return null

  /*
   * Pages imported from a Claude Design export carry their hero as the first
   * *block*, so the hero field stays empty but still defaults to 'lowImpact'.
   * Rendering it produced a tall empty container between the header and the
   * real hero. Treat a hero with no content as no hero.
   */
  const { richText, media, links } = (props || {}) as Record<string, unknown>
  const hasContent = Boolean(richText) || Boolean(media) || Boolean((links as unknown[])?.length)
  if (!hasContent) return null

  const HeroToRender = heroes[type]

  if (!HeroToRender) return null

  return <HeroToRender {...props} />
}
