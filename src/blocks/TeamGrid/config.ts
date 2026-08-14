import type { Block } from 'payload'

export const TeamGrid: Block = {
  slug: 'teamGrid',
  interfaceName: 'TeamGridBlock',
  labels: {
    singular: 'Team / Staff Grid',
    plural: 'Team Grid Blocks',
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
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      label: 'Columns',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
    },
    {
      name: 'members',
      type: 'array',
      required: true,
      minRows: 1,
      label: 'Team Members',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          label: 'Job Title / Role',
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
          label: 'Photo',
        },
        {
          name: 'bio',
          type: 'textarea',
          label: 'Short Bio',
        },
        {
          name: 'linkedIn',
          type: 'text',
          label: 'LinkedIn URL',
        },
        {
          name: 'email',
          type: 'email',
          label: 'Email Address',
        },
      ],
    },
  ],
}
