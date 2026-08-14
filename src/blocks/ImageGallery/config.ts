import type { Block } from 'payload'

export const ImageGallery: Block = {
  slug: 'imageGallery',
  interfaceName: 'ImageGalleryBlock',
  labels: {
    singular: 'Image Gallery',
    plural: 'Image Gallery Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading',
    },
    {
      name: 'subheading',
      type: 'textarea',
      label: 'Subheading',
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'masonry',
      label: 'Gallery Layout',
      options: [
        { label: 'Masonry (Pinterest-style)', value: 'masonry' },
        { label: 'Uniform Grid', value: 'grid' },
        { label: 'Horizontal Scroll', value: 'scroll' },
      ],
    },
    {
      name: 'images',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 20,
      label: 'Gallery Images',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          label: 'Image Label (optional)',
        },
        {
          name: 'productLink',
          type: 'text',
          label: 'Link to Product (optional)',
          admin: {
            description: 'e.g. /shop/product-slug',
          },
        },
      ],
    },
    {
      name: 'ctaText',
      type: 'text',
      label: 'CTA Button Text',
      admin: {
        description: 'Optional CTA below the gallery',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      label: 'CTA Link',
      defaultValue: '/',
    },
  ],
}
