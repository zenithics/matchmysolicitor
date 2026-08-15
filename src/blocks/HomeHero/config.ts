import type { Block } from 'payload'
import { linkGroup } from '@/fields/linkGroup'

export const HomeHero: Block = {
  slug: 'homeHero',
  interfaceName: 'HomeHeroBlock',
  labels: { singular: 'Home Hero Banner', plural: 'Home Hero Blocks' },
  fields: [
    { name: 'badge', type: 'text', admin: { description: 'Small uppercase eyebrow label above headline e.g. "How it works"' } },
    { name: 'headline', type: 'text', required: true, defaultValue: 'Matched with a specialist employment solicitor.' },
    { name: 'subheadline', type: 'textarea', defaultValue: 'Tell us your situation. A vetted, SRA-regulated solicitor will be in touch within 24 hours.' },
    linkGroup({ overrides: { maxRows: 2 } }),
    { name: 'backgroundImage', type: 'upload', relationTo: 'media', admin: { description: 'Full-width background image' } },
    {
      name: 'style',
      type: 'select',
      defaultValue: 'split',
      options: [
        { label: 'Split (text left, image right)', value: 'split' },
        { label: 'Full-width overlay', value: 'fullwidth' },
        { label: 'Centred', value: 'centred' },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Dark (light text)', value: 'dark' },
        { label: 'Light (dark text)', value: 'light' },
        { label: 'Pink gradient', value: 'pink' },
      ],
    },
  ],
}
