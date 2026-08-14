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
          label: 'Newsletter',
          fields: [
            {
              name: 'newsletterHeading',
              type: 'text',
              label: 'Newsletter Heading',
              defaultValue: 'Subscribe to our newsletter',
            },
            {
              name: 'newsletterSubtext',
              type: 'text',
              label: 'Newsletter Subtext',
              defaultValue: 'Stay updated with our latest news and offers.',
            },
          ],
        },
        {
          label: 'Brand',
          fields: [
            {
              name: 'brandName',
              type: 'text',
              label: 'Brand / Logo Text',
              defaultValue: 'Your Brand',
            },
            {
              name: 'brandTagline',
              type: 'textarea',
              label: 'Brand Tagline',
              defaultValue: 'Your tagline goes here. Edit this in the Footer settings.',
            },
            {
              name: 'contactEmail',
              type: 'email',
              label: 'Contact Email (shown in footer)',
              defaultValue: 'hello@example.com',
            },
            {
              name: 'contactHours',
              type: 'text',
              label: 'Contact Hours',
              defaultValue: 'Mon–Fri, 9am–5pm GMT',
            },
          ],
        },
        {
          label: 'Social Links',
          fields: [
            {
              name: 'instagramUrl',
              type: 'text',
              label: 'Instagram URL',
              admin: { placeholder: 'https://instagram.com/yourpage' },
            },
            {
              name: 'tiktokUrl',
              type: 'text',
              label: 'TikTok URL',
              admin: { placeholder: 'https://tiktok.com/@yourpage' },
            },
            {
              name: 'pinterestUrl',
              type: 'text',
              label: 'Pinterest URL',
              admin: { placeholder: 'https://pinterest.com/yourpage' },
            },
            {
              name: 'facebookUrl',
              type: 'text',
              label: 'Facebook URL',
              admin: { placeholder: 'https://facebook.com/yourpage' },
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
              defaultValue: 'Shop',
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
              defaultValue: 'Info',
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
              defaultValue: 'Help',
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
          ],
        },
        {
          label: 'Bottom Bar',
          fields: [
            {
              name: 'copyrightText',
              type: 'text',
              label: 'Copyright Text',
              defaultValue: '© {year} Your Brand. All rights reserved.',
              admin: {
                description: 'Use {year} to insert the current year automatically.',
              },
            },
            {
              name: 'madeWithText',
              type: 'text',
              label: 'Made With Text',
              defaultValue: '',
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
