import type { Block } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '../../fields/linkGroup'

export const Pricing: Block = {
  slug: 'pricing',
  interfaceName: 'PricingBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Simple, Transparent Pricing',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'plans',
      type: 'array',
      minRows: 1,
      maxRows: 4,
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Plan Name',
        },
        {
          name: 'price',
          type: 'text',
          required: true,
          label: 'Price',
          admin: {
            description: 'E.g. "£499", "From £999", "Custom"',
          },
        },
        {
          name: 'period',
          type: 'text',
          label: 'Price Period',
          admin: {
            description: 'E.g. "/month", "one-off", "per project"',
          },
        },
        {
          name: 'description',
          type: 'textarea',
          label: 'Short Description',
        },
        {
          name: 'features',
          type: 'array',
          fields: [
            {
              name: 'feature',
              type: 'text',
              required: true,
            },
            {
              name: 'included',
              type: 'checkbox',
              defaultValue: true,
              label: 'Included',
            },
          ],
        },
        {
          name: 'highlighted',
          type: 'checkbox',
          defaultValue: false,
          label: 'Highlight This Plan',
          admin: {
            description: 'Make this plan stand out (recommended/popular)',
          },
        },
        {
          name: 'badge',
          type: 'text',
          label: 'Badge Text',
          admin: {
            description: 'E.g. "Most Popular", "Best Value"',
            condition: (_, siblingData) => siblingData?.highlighted,
          },
        },
        linkGroup({
          appearances: ['default', 'outline'],
          overrides: {
            maxRows: 1,
          },
        }),
      ],
    },
  ],
  labels: {
    plural: 'Pricing Blocks',
    singular: 'Pricing Table',
  },
}
