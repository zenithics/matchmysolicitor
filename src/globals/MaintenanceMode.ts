import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const MaintenanceMode: GlobalConfig = {
  slug: 'maintenance-mode',
  label: 'Maintenance Mode',
  admin: {
    group: 'Site Settings',
    description: 'Put the site in maintenance mode while making updates',
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
      label: 'Enable Maintenance Mode',
      admin: {
        description: 'When enabled, all visitors see the maintenance page (except admins and allowed IPs)',
      },
    },
    {
      name: 'heading',
      type: 'text',
      defaultValue: "We'll be back soon",
      label: 'Heading',
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Body Message',
    },
    {
      name: 'showCountdown',
      type: 'checkbox',
      defaultValue: false,
      label: 'Show Countdown Timer',
    },
    {
      name: 'countdownTarget',
      type: 'date',
      label: 'Countdown Target Date/Time',
      admin: {
        condition: (_, siblingData) => siblingData?.showCountdown,
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'dd/MM/yyyy HH:mm' },
        description: 'When the site will be back online',
      },
    },
    {
      name: 'allowedIPs',
      type: 'textarea',
      label: 'Allowed IP Addresses',
      admin: {
        description: 'One IP per line. Visitors from these IPs can bypass maintenance mode to preview the site.',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Background Image',
      admin: { description: 'Optional background image for the maintenance page' },
    },
    {
      name: 'showLogo',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show Site Logo',
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Contact Email',
      admin: {
        description: 'Optional — shows a "Contact us" link on the maintenance page',
      },
    },
    {
      name: 'password',
      type: 'text',
      label: 'Bypass Password',
      admin: {
        description: 'Optional — visitors can enter this to bypass maintenance mode and preview the site',
      },
    },
  ],
}
