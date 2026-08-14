import type { GlobalConfig } from 'payload'

function prefixValidate(val: any): true | string {
  if (!val) return 'Prefix is required'
  if (/[^a-z0-9-]/.test(val)) return 'Only lowercase letters, numbers and hyphens allowed'
  if (val.startsWith('-') || val.endsWith('-')) return 'Cannot start or end with a hyphen'
  return true
}

export const PermalinkSettings: GlobalConfig = {
  slug: 'permalink-settings',
  label: 'Permalink Settings',
  admin: {
    group: 'SEO',
    description:
      'Configure URL prefixes for each content type. Changes may take up to 60 seconds to take effect.',
  },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user) && ['admin'].includes((user as any)?.role),
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'postsPrefix',
          label: 'Blog / Posts Prefix',
          type: 'text',
          defaultValue: 'posts',
          required: true,
          admin: {
            description: 'URL prefix for blog posts. Example: "blog" → /blog/my-post',
            placeholder: 'posts',
            width: '50%',
          },
          validate: prefixValidate,
        },
        {
          name: 'policiesPrefix',
          label: 'Policies Prefix',
          type: 'text',
          defaultValue: 'policies',
          required: true,
          admin: {
            description: 'URL prefix for policy pages.',
            placeholder: 'policies',
            width: '50%',
          },
          validate: prefixValidate,
        },
      ],
    },
    {
      name: 'enableRedirects',
      label: 'Redirect old URLs',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'When enabled, the old/canonical URL prefix will 301 redirect to the new one. Disable only if you have manual redirects set up.',
      },
    },
  ],
}
