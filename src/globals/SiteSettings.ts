import type { GlobalConfig } from 'payload'
import { logGlobalChange } from '@/hooks/logActivity'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Global',
    description: 'Regional, language, and localisation settings.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Regional',
          fields: [
            {
              name: 'timezone',
              type: 'select',
              label: 'Timezone',
              defaultValue: 'Europe/London',
              options: [
                { label: 'Europe/London (GMT/BST)', value: 'Europe/London' },
                { label: 'America/New_York (ET)', value: 'America/New_York' },
                { label: 'America/Los_Angeles (PT)', value: 'America/Los_Angeles' },
                { label: 'America/Chicago (CT)', value: 'America/Chicago' },
                { label: 'Europe/Paris (CET)', value: 'Europe/Paris' },
                { label: 'Europe/Berlin (CET)', value: 'Europe/Berlin' },
                { label: 'Australia/Sydney (AEST)', value: 'Australia/Sydney' },
                { label: 'Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
                { label: 'Asia/Dubai (GST)', value: 'Asia/Dubai' },
              ],
            },
            {
              name: 'language',
              type: 'select',
              label: 'Language',
              defaultValue: 'en-GB',
              options: [
                { label: 'English (en)', value: 'en' },
                { label: 'British English (en-GB)', value: 'en-GB' },
                { label: 'French (fr)', value: 'fr' },
                { label: 'German (de)', value: 'de' },
                { label: 'Spanish (es)', value: 'es' },
                { label: 'Italian (it)', value: 'it' },
                { label: 'Dutch (nl)', value: 'nl' },
                { label: 'Portuguese (pt)', value: 'pt' },
                { label: 'Arabic (ar)', value: 'ar' },
              ],
            },
            {
              name: 'dateFormat',
              type: 'select',
              label: 'Date Format',
              defaultValue: 'DD/MM/YYYY',
              options: [
                { label: 'DD/MM/YYYY (e.g. 25/06/2026)', value: 'DD/MM/YYYY' },
                { label: 'MM/DD/YYYY (e.g. 06/25/2026)', value: 'MM/DD/YYYY' },
                { label: 'YYYY-MM-DD (e.g. 2026-06-25)', value: 'YYYY-MM-DD' },
              ],
            },
            {
              name: 'currencyPosition',
              type: 'select',
              label: 'Currency Symbol Position',
              defaultValue: 'before',
              options: [
                { label: 'Before amount (£19.99)', value: 'before' },
                { label: 'After amount (19.99£)', value: 'after' },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [logGlobalChange],
  },
}
