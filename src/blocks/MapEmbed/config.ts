import type { Block } from 'payload'

export const MapEmbed: Block = {
  slug: 'mapEmbed',
  interfaceName: 'MapEmbedBlock',
  labels: {
    singular: 'Map / Location',
    plural: 'Map Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading (optional)',
    },
    {
      name: 'locations',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Locations',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Location Name',
        },
        {
          name: 'address',
          type: 'textarea',
          label: 'Address',
        },
        {
          name: 'googleMapsEmbedURL',
          type: 'text',
          required: true,
          label: 'Google Maps Embed URL',
          admin: {
            description: 'From Google Maps → Share → Embed a map → copy the src URL',
          },
        },
        {
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
        },
        {
          name: 'hours',
          type: 'textarea',
          label: 'Opening Hours',
          admin: {
            description: 'e.g. Mon–Fri: 9am–5pm',
          },
        },
      ],
    },
    {
      name: 'mapHeight',
      type: 'select',
      defaultValue: 'medium',
      label: 'Map Height',
      options: [
        { label: 'Small (300px)', value: 'small' },
        { label: 'Medium (450px)', value: 'medium' },
        { label: 'Large (600px)', value: 'large' },
      ],
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'stacked',
      label: 'Layout',
      options: [
        { label: 'Stacked (map above details)', value: 'stacked' },
        { label: 'Side by Side', value: 'sideBySide' },
      ],
    },
  ],
}
