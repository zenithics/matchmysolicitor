import type { Block } from 'payload'

import { linkGroup } from '@/fields/linkGroup'

export const TextMedia: Block = {
  slug: 'textMedia',
  interfaceName: 'TextMediaBlock',
  labels: { singular: 'Text + Media', plural: 'Text + Media Blocks' },
  fields: [
    { name: 'heading', type: 'text', label: 'Heading' },
    { name: 'richText', type: 'richText', label: 'Body' },
    linkGroup({ overrides: { maxRows: 2 } }),
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Image' },
    {
      name: 'imagePosition',
      type: 'select',
      defaultValue: 'right',
      label: 'Image Position',
      options: [
        { label: 'Right of text', value: 'right' },
        { label: 'Left of text', value: 'left' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'light',
      label: 'Background Theme',
      options: [
        { label: 'Light', value: 'light' },
        { label: 'Muted', value: 'muted' },
        { label: 'Dark', value: 'dark' },
      ],
    },
  ],
}
