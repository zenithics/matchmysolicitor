import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { revalidateFooter } from './hooks/revalidateFooter'
import { logGlobalChange } from '@/hooks/logActivity'

export const Footer: GlobalConfig = {
  slug: 'footer',
  label: 'Footer',
  admin: {
    group: 'Global',
    description: 'Manage footer columns, links, and contact details.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Brand',
          fields: [
            {
              name: 'brandName',
              type: 'text',
              label: 'Brand / Logo Text',
              defaultValue: 'MatchMySolicitor',
            },
            {
              name: 'brandTagline',
              type: 'textarea',
              label: 'Brand Tagline',
              defaultValue:
                'A referral service connecting employers and employees with vetted specialist employment solicitors across the UK. We are not a law firm and do not provide legal advice.',
            },
          ],
        },
        {
          label: 'Nav Columns',
          fields: [
            {
              name: 'column1Heading',
              type: 'text',
              label: 'Column 1 Heading',
              defaultValue: 'Services',
            },
            {
              name: 'column1Links',
              type: 'array',
              label: 'Column 1 Links',
              fields: [link({ appearances: false })],
              admin: {
                initCollapsed: true,
                components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
              },
            },
            {
              name: 'column2Heading',
              type: 'text',
              label: 'Column 2 Heading',
              defaultValue: 'Guides',
            },
            {
              name: 'column2Links',
              type: 'array',
              label: 'Column 2 Links',
              fields: [link({ appearances: false })],
              admin: {
                initCollapsed: true,
                components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
              },
            },
            {
              name: 'column3Heading',
              type: 'text',
              label: 'Column 3 Heading',
              defaultValue: 'Company',
            },
            {
              name: 'column3Links',
              type: 'array',
              label: 'Column 3 Links',
              fields: [link({ appearances: false })],
              admin: {
                initCollapsed: true,
                components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
              },
            },
            {
              name: 'column4Heading',
              type: 'text',
              label: 'Column 4 Heading',
              defaultValue: 'Legal',
              admin: {
                description: 'A "Cookie settings" button is always appended after these links.',
              },
            },
            {
              name: 'column4Links',
              type: 'array',
              label: 'Column 4 Links',
              fields: [link({ appearances: false })],
              admin: {
                initCollapsed: true,
                components: { RowLabel: '@/Footer/RowLabel#RowLabel' },
              },
            },
          ],
        },
        {
          label: 'Bottom Bar',
          fields: [
            {
              name: 'regulatoryDisclaimer',
              type: 'textarea',
              label: 'Regulatory Disclaimer',
              defaultValue:
                'MatchMySolicitor is a matching service and is not a firm of solicitors. We do not provide legal advice. All firms on our panel are regulated by the Solicitors Regulation Authority.',
            },
            {
              name: 'copyrightText',
              type: 'text',
              label: 'Copyright Text',
              defaultValue: '© {year} MatchMySolicitor. All rights reserved.',
              admin: {
                description: 'Use {year} to insert the current year automatically.',
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFooter, logGlobalChange],
  },
  versions: false,
}
