import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const Timeline: Block = {
  slug: 'timeline',
  interfaceName: 'TimelineBlock',
  labels: {
    singular: 'Timeline',
    plural: 'Timeline Blocks',
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
      name: 'events',
      type: 'array',
      required: true,
      minRows: 2,
      maxRows: 20,
      label: 'Timeline Events',
      fields: [
        {
          name: 'date',
          type: 'text',
          required: true,
          label: 'Date / Year',
          admin: {
            description: 'e.g. "2020", "March 2023", "Q1 2024"',
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
          label: 'Image (optional)',
        },
        {
          name: 'icon',
          type: 'text',
          label: 'Icon (emoji)',
          admin: {
            description: 'Optional emoji for the timeline marker, e.g. 🚀',
          },
        },
      ],
    },
  ],
}
