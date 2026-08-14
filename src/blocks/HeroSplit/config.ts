import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

export const HeroSplit: Block = {
  slug: 'heroSplit',
  interfaceName: 'HeroSplitBlock',
  labels: {
    singular: 'Hero Split',
    plural: 'Hero Split Blocks',
  },
  fields: [
    {
      name: 'badgeText',
      type: 'text',
      label: 'Badge / Pill Text',
      admin: {
        description: 'Short text shown in a pill above the headline, e.g. "Handcrafted in the UK"',
      },
    },
    {
      name: 'headline',
      type: 'text',
      required: true,
      label: 'Headline',
    },
    {
      name: 'subheadline',
      type: 'textarea',
      label: 'Subheadline',
    },
    linkGroup({
      overrides: {
        maxRows: 2,
        admin: { description: 'Primary and optional secondary CTA buttons' },
      },
    }),
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
      label: 'Hero Image',
    },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      label: 'Image Side',
      options: [
        { label: 'Image Right', value: 'right' },
        { label: 'Image Left', value: 'left' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      label: 'Background Theme',
      options: [
        { label: 'Light (nude/blush)', value: 'light' },
        { label: 'Dark (deep mauve)', value: 'dark' },
      ],
    },
  ],
}
