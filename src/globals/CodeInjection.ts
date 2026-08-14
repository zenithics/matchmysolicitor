import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const CodeInjection: GlobalConfig = {
  slug: 'code-injection',
  label: 'Code Injection',
  admin: {
    group: 'Site Settings',
    description: 'Inject custom code into the site head or body',
  },
  access: {
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      name: 'headCode',
      type: 'textarea',
      label: 'Head Scripts',
      admin: {
        description:
          'Code injected before </head>. Use for custom CSS, fonts, verification tags, or third-party scripts not covered by built-in integrations.',
      },
    },
    {
      name: 'bodyStartCode',
      type: 'textarea',
      label: 'Body Start Scripts',
      admin: {
        description:
          'Code injected right after <body>. Use for Google Tag Manager noscript tags, etc.',
      },
    },
    {
      name: 'bodyEndCode',
      type: 'textarea',
      label: 'Body End Scripts',
      admin: {
        description:
          'Code injected before </body>. Use for chat widgets, analytics, or scripts that should load last.',
      },
    },
    {
      name: 'customCSS',
      type: 'textarea',
      label: 'Custom CSS',
      admin: {
        description: 'Custom CSS applied site-wide. Wrapped in <style> tags automatically.',
      },
    },
  ],
}
