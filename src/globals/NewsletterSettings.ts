import type { GlobalConfig } from 'payload'
import { authenticated } from '../access/authenticated'

export const NewsletterSettings: GlobalConfig = {
  slug: 'newsletter-settings',
  label: 'Newsletter Settings',
  admin: {
    group: 'Marketing',
    description: 'Configure your email marketing provider and newsletter popup',
  },
  access: {
    read: authenticated,
    update: authenticated,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Provider',
          fields: [
            {
              name: 'provider',
              type: 'select',
              defaultValue: 'none',
              options: [
                { label: 'None (no newsletter)', value: 'none' },
                { label: 'Mailchimp', value: 'mailchimp' },
                { label: 'ConvertKit', value: 'convertkit' },
                { label: 'Brevo (formerly Sendinblue)', value: 'brevo' },
              ],
            },
            {
              name: 'mailchimpApiKey',
              type: 'text',
              label: 'Mailchimp API Key',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'mailchimp',
                description: 'Found in Mailchimp → Account → Extras → API keys',
              },
            },
            {
              name: 'mailchimpListId',
              type: 'text',
              label: 'Audience / List ID',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'mailchimp',
                description: 'Found in Audience → Manage Audience → Settings',
              },
            },
            {
              name: 'mailchimpServer',
              type: 'text',
              label: 'Mailchimp Server Prefix',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'mailchimp',
                description: 'The prefix before .api.mailchimp.com (e.g. "us21")',
              },
            },
            {
              name: 'convertkitApiKey',
              type: 'text',
              label: 'ConvertKit API Key',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'convertkit',
                description: 'Found in ConvertKit → Settings → Advanced',
              },
            },
            {
              name: 'convertkitFormId',
              type: 'text',
              label: 'ConvertKit Form ID',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'convertkit',
              },
            },
            {
              name: 'brevoApiKey',
              type: 'text',
              label: 'Brevo API Key',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'brevo',
                description: 'Found in Brevo → Settings → API Keys',
              },
            },
            {
              name: 'brevoListId',
              type: 'number',
              label: 'Brevo List ID',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'brevo',
              },
            },
          ],
        },
        {
          label: 'Popup Settings',
          fields: [
            {
              name: 'popupEnabled',
              type: 'checkbox',
              label: 'Enable Newsletter Popup',
              defaultValue: false,
            },
            {
              name: 'popupDelay',
              type: 'number',
              label: 'Popup Delay (seconds)',
              defaultValue: 5,
              admin: {
                condition: (_, siblingData) => siblingData?.popupEnabled,
                description: 'How many seconds after page load before showing the popup',
              },
            },
            {
              name: 'popupHeading',
              type: 'text',
              label: 'Popup Heading',
              defaultValue: 'Get 10% off your first order',
              admin: {
                condition: (_, siblingData) => siblingData?.popupEnabled,
              },
            },
            {
              name: 'popupBody',
              type: 'textarea',
              label: 'Popup Body Text',
              defaultValue: 'Join our mailing list for exclusive deals and new drops',
              admin: {
                condition: (_, siblingData) => siblingData?.popupEnabled,
              },
            },
            {
              name: 'popupImage',
              type: 'upload',
              relationTo: 'media',
              label: 'Popup Image',
              admin: {
                condition: (_, siblingData) => siblingData?.popupEnabled,
                description: 'Optional image shown in the popup',
              },
            },
            {
              name: 'popupDismissDays',
              type: 'number',
              label: 'Dismiss Duration (days)',
              defaultValue: 7,
              admin: {
                condition: (_, siblingData) => siblingData?.popupEnabled,
                description: 'Days before showing the popup again after dismissal',
              },
            },
          ],
        },
      ],
    },
  ],
}
