import type { GlobalConfig } from 'payload'

export const NotFoundPage: GlobalConfig = {
  slug: 'not-found-page',
  label: '404 Page',
  admin: {
    group: 'Site Settings',
    description: 'Customise the "page not found" experience for visitors.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Page Not Found',
      admin: { description: 'Large heading shown on the 404 page.' },
    },
    {
      name: 'subheading',
      type: 'text',
      defaultValue: "The page you're looking for doesn't exist or has been moved.",
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Extra Body Text',
      admin: { description: 'Optional additional copy below the subheading.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'ctaText',
          type: 'text',
          defaultValue: 'Go Home',
          admin: { width: '50%' },
        },
        {
          name: 'ctaUrl',
          type: 'text',
          defaultValue: '/',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'secondaryCtaText',
      type: 'text',
      label: 'Secondary CTA Text',
      admin: { description: 'Leave blank to hide the secondary button.' },
    },
    {
      name: 'secondaryCtaUrl',
      type: 'text',
      label: 'Secondary CTA URL',
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: { description: 'Optional full-bleed background for the 404 section.' },
    },
    {
      name: 'showSearchBar',
      type: 'checkbox',
      label: 'Show Search Bar',
      defaultValue: true,
    },
    {
      name: 'suggestedLinks',
      type: 'array',
      label: 'Suggested Links',
      admin: {
        description: 'Quick links to help the visitor find what they need.',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
