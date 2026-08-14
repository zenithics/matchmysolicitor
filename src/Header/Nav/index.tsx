'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Search } from '@/search/Component'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = [...(data?.navItemsLeft || []), ...(data?.navItemsRight || [])]

  return (
    <nav className="flex gap-3 items-center">
      {navItems.map(({ link }, i) => {
        return <CMSLink key={i} {...(link as any)} appearance="link" />
      })}
      <Search />
    </nav>
  )
}
