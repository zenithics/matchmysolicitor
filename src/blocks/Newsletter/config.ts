import type { Block } from 'payload'

export const Newsletter: Block = {
  slug: 'newsletter',
  interfaceName: 'NewsletterBlock',
  labels: { singular: 'Newsletter Signup', plural: 'Newsletter Blocks' },
  fields: [
    { name: 'heading', type: 'text', defaultValue: 'Get 10% off your first order' },
    { name: 'subheading', type: 'textarea', defaultValue: 'Nail inspo, new drops & exclusive offers — no spam, ever.' },
    { name: 'buttonLabel', type: 'text', defaultValue: 'Subscribe' },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'dark',
      options: [
        { label: 'Dark plum', value: 'dark' },
        { label: 'Light blush', value: 'light' },
        { label: 'Pink gradient', value: 'pink' },
      ],
    },
  ],
}
