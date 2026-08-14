import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Features: Block = {
  slug: 'features',
  interfaceName: 'FeaturesBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Intro Text',
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'features',
      type: 'array',
      minRows: 1,
      maxRows: 12,
      fields: [
        {
          name: 'icon',
          type: 'text',
          label: 'Icon (emoji or icon name)',
          admin: {
            description: 'Enter an emoji (e.g. 🚀) or leave blank',
          },
        },
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
            },
          }),
        },
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          label: 'Feature Image (optional)',
        },
      ],
    },
  ],
  labels: {
    plural: 'Features Blocks',
    singular: 'Features Grid',
  },
}
