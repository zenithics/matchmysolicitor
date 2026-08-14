import type { Block } from 'payload'

export const HowItWorks: Block = {
  slug: 'howItWorks',
  interfaceName: 'HowItWorksBlock',
  labels: {
    singular: 'How It Works',
    plural: 'How It Works Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'How It Works',
      label: 'Section Heading',
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
    },
    {
      name: 'steps',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 6,
      label: 'Steps',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
          label: 'Step Title',
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
          label: 'Step Description',
        },
        {
          name: 'icon',
          type: 'upload',
          relationTo: 'media',
          label: 'Step Icon / Image (optional)',
        },
      ],
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA Button Text',
      admin: {
        description: 'Optional CTA below the steps',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'CTA Link',
      defaultValue: '/shop',
    },
  ],
}
