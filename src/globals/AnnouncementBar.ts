import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const AnnouncementBar: GlobalConfig = {
  slug: 'announcement-bar',
  label: 'Announcement Bar',
  admin: {
    group: 'Marketing',
    description: 'Manage the slim bar shown above the header',
  },
  access: {
    read: () => true,
    update: authenticated,
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      defaultValue: false,
      label: 'Enable Announcement Bar',
      admin: { position: 'sidebar' },
    },
    {
      name: 'text',
      type: 'text',
      required: true,
      label: 'Announcement Text',
      defaultValue: '🎉 Free shipping on orders over £30! Use code FREESHIP',
    },
    {
      name: 'linkUrl',
      type: 'text',
      label: 'Link URL',
      admin: {
        description: 'Makes the bar clickable. Leave blank for no link.',
      },
    },
    {
      name: 'linkText',
      type: 'text',
      label: 'Link Text / CTA',
      admin: {
        description: 'Optional CTA shown as a button/link within the bar (e.g. "Shop now")',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      label: 'Background Colour (hex)',
      defaultValue: '#E8177A',
      admin: {
        description: 'e.g. #E8177A',
      },
    },
    {
      name: 'textColor',
      type: 'text',
      label: 'Text Colour (hex)',
      defaultValue: '#FFFFFF',
      admin: {
        description: 'e.g. #FFFFFF',
      },
    },
    {
      name: 'dismissible',
      type: 'checkbox',
      defaultValue: true,
      label: 'Allow Dismissal',
      admin: {
        description: 'Show an × button so visitors can hide the bar',
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      label: 'Show From',
      admin: {
        description: 'Leave blank to show immediately',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Hide After',
      admin: {
        description: 'Leave blank to show indefinitely',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd/MM/yyyy' },
      },
    },
    {
      name: 'showOnMobile',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show on Mobile',
    },
  ],
}
