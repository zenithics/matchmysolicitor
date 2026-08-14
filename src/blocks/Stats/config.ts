import type { Block } from 'payload'

export const Stats: Block = {
  slug: 'stats',
  interfaceName: 'StatsBlock',
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'stats',
      type: 'array',
      minRows: 1,
      maxRows: 6,
      fields: [
        {
          name: 'value',
          type: 'text',
          required: true,
          label: 'Number/Value',
          admin: {
            description: 'E.g. "500+", "99%", "£2.5M"',
          },
        },
        {
          name: 'label',
          type: 'text',
          required: true,
          label: 'Description',
          admin: {
            description: 'E.g. "Happy Clients", "Uptime", "Revenue Generated"',
          },
        },
        {
          name: 'prefix',
          type: 'text',
          label: 'Prefix (optional)',
          admin: {
            description: 'Text before the value, e.g. "£" or ">"',
          },
        },
        {
          name: 'suffix',
          type: 'text',
          label: 'Suffix (optional)',
          admin: {
            description: 'Text after the value, e.g. "+" or "%"',
          },
        },
      ],
    },
  ],
  labels: {
    plural: 'Stats Blocks',
    singular: 'Statistics Counter',
  },
}
