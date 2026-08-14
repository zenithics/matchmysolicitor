import type { Block } from 'payload'

export const VideoEmbed: Block = {
  slug: 'videoEmbed',
  interfaceName: 'VideoEmbedBlock',
  labels: {
    singular: 'Video Embed',
    plural: 'Video Embed Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Section Heading (optional)',
    },
    {
      name: 'videoURL',
      type: 'text',
      required: true,
      label: 'Video URL',
      admin: {
        description: 'YouTube or Vimeo URL (e.g. https://www.youtube.com/watch?v=abc123)',
      },
    },
    {
      name: 'aspectRatio',
      type: 'select',
      defaultValue: '16:9',
      label: 'Aspect Ratio',
      options: [
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '4:3 (Standard)', value: '4:3' },
        { label: '1:1 (Square)', value: '1:1' },
      ],
    },
    {
      name: 'maxWidth',
      type: 'select',
      defaultValue: 'large',
      label: 'Max Width',
      options: [
        { label: 'Small (640px)', value: 'small' },
        { label: 'Medium (768px)', value: 'medium' },
        { label: 'Large (1024px)', value: 'large' },
        { label: 'Full Width', value: 'full' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
  ],
}
