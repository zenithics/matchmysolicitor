import type { Block } from 'payload'

export const Embed: Block = {
  slug: 'embed',
  interfaceName: 'EmbedBlock',
  labels: {
    singular: 'Embed / iFrame',
    plural: 'Embed Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading (optional)',
    },
    {
      name: 'embedURL',
      type: 'text',
      required: true,
      label: 'Embed URL',
      admin: {
        description: 'URL of the content to embed (booking widget, form, calculator, etc.)',
      },
    },
    {
      name: 'height',
      type: 'number',
      defaultValue: 500,
      label: 'Height (px)',
      min: 100,
      max: 2000,
    },
    {
      name: 'maxWidth',
      type: 'select',
      defaultValue: 'large',
      label: 'Container Width',
      options: [
        { label: 'Small (640px)', value: 'small' },
        { label: 'Medium (768px)', value: 'medium' },
        { label: 'Large (1024px)', value: 'large' },
        { label: 'Full Width', value: 'full' },
      ],
    },
    {
      name: 'showBorder',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Border',
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
  ],
}
