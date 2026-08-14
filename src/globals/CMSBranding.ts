import type { GlobalConfig } from 'payload'
import { logGlobalChange } from '@/hooks/logActivity'

export const CMSBranding: GlobalConfig = {
  slug: 'cms-branding',
  label: 'CMS Branding',
  admin: {
    group: 'System',
    description: 'Customise the admin panel logo, icon, and accent colour.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      required: true,
      defaultValue: 'Zenithics',
      admin: {
        description: 'Displayed in the admin panel header and browser tab',
      },
    },
    {
      name: 'adminLogo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'Logo shown in the admin sidebar. Recommended: 200x50px PNG with transparent background',
      },
    },
    {
      name: 'adminIcon',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Small icon used as browser favicon. Recommended: 32x32px PNG',
      },
    },
    {
      name: 'accentColor',
      type: 'text',
      defaultValue: '#0066FF',
      admin: {
        description: 'Primary accent colour for admin buttons and links. Use hex format.',
      },
    },
  ],
  hooks: {
    afterChange: [logGlobalChange],
  },
}
