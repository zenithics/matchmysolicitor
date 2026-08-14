import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateHeader } from './hooks/revalidateHeader'
import { logGlobalChange } from '@/hooks/logActivity'

export const Header: GlobalConfig = {
  slug: 'header',
  label: 'Header Navigation',
  admin: {
    group: 'Global',
    description: 'Manage the navigation links shown in the site header.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'navItemsLeft',
      label: 'Left Navigation Links',
      type: 'array',
      fields: [
        link({ appearances: false }),
      ],
      maxRows: 6,
      admin: {
        description: 'Links shown to the left of the logo (e.g. Shop, New In, Bestsellers).',
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
    {
      name: 'navItemsRight',
      label: 'Right Navigation Links',
      type: 'array',
      fields: [
        link({ appearances: false }),
      ],
      maxRows: 6,
      admin: {
        description: 'Links shown to the right of the logo (e.g. About, Contact).',
        initCollapsed: true,
        components: {
          RowLabel: '@/Header/RowLabel#RowLabel',
        },
      },
    },
  ],
  hooks: {
    afterChange: [revalidateHeader, logGlobalChange],
  },
  versions: false,
}
