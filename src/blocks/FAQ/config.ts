import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const FAQ: Block = {
  slug: 'faq',
  interfaceName: 'FAQBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Frequently Asked Questions',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Intro Text',
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
          editor: lexicalEditor({
            features: ({ rootFeatures }) => {
              return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
            },
          }),
        },
      ],
    },
  ],
  labels: {
    plural: 'FAQ Blocks',
    singular: 'FAQ Section',
  },
}
