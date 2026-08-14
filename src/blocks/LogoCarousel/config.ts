import type { Block } from 'payload'

export const LogoCarousel: Block = {
  slug: 'logoCarousel',
  interfaceName: 'LogoCarouselBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Trusted By',
    },
    {
      name: 'logos',
      type: 'array',
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'companyName',
          type: 'text',
          required: true,
          label: 'Company Name (for alt text)',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Website URL (optional)',
        },
      ],
    },
  ],
  labels: {
    plural: 'Logo Carousel Blocks',
    singular: 'Logo Carousel',
  },
}
