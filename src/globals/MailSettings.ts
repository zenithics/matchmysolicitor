import type { GlobalConfig } from 'payload'

export const MailSettings: GlobalConfig = {
  slug: 'mail-settings',
  label: 'Email / SMTP Settings',
  admin: {
    group: 'Site Settings',
    description: 'Configure how transactional emails are sent — order confirmations, shipping updates, etc.',
  },
  access: {
    read: ({ req }) => Boolean(req.user),
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
              label: 'Email Provider',
              defaultValue: 'resend',
              options: [
                { label: 'Resend (recommended)', value: 'resend' },
                { label: 'SMTP (Gmail, Outlook, custom)', value: 'smtp' },
                { label: 'SendGrid', value: 'sendgrid' },
                { label: 'Mailgun', value: 'mailgun' },
                { label: 'Amazon SES', value: 'ses' },
              ],
            },
            // Resend
            {
              name: 'resendApiKey',
              type: 'text',
              label: 'Resend API Key',
              admin: {
                description: 'Found in your Resend dashboard → API Keys.',
                condition: (_, siblingData) => siblingData?.provider === 'resend',
              },
            },
            // SMTP
            {
              name: 'smtpHost',
              type: 'text',
              label: 'SMTP Host',
              admin: {
                placeholder: 'smtp.gmail.com',
                condition: (_, siblingData) => siblingData?.provider === 'smtp',
              },
            },
            {
              name: 'smtpPort',
              type: 'number',
              label: 'SMTP Port',
              defaultValue: 587,
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'smtp',
              },
            },
            {
              name: 'smtpSecure',
              type: 'checkbox',
              label: 'Use TLS/SSL',
              defaultValue: false,
              admin: {
                description: 'Enable for port 465. Leave off for STARTTLS on port 587.',
                condition: (_, siblingData) => siblingData?.provider === 'smtp',
              },
            },
            {
              name: 'smtpUsername',
              type: 'text',
              label: 'SMTP Username',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'smtp',
              },
            },
            {
              name: 'smtpPassword',
              type: 'text',
              label: 'SMTP Password',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'smtp',
              },
            },
            // SendGrid
            {
              name: 'sendgridApiKey',
              type: 'text',
              label: 'SendGrid API Key',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'sendgrid',
              },
            },
            // Mailgun
            {
              name: 'mailgunApiKey',
              type: 'text',
              label: 'Mailgun API Key',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'mailgun',
              },
            },
            {
              name: 'mailgunDomain',
              type: 'text',
              label: 'Mailgun Domain',
              admin: {
                placeholder: 'mg.yourdomain.com',
                condition: (_, siblingData) => siblingData?.provider === 'mailgun',
              },
            },
            {
              name: 'mailgunRegion',
              type: 'select',
              label: 'Mailgun Region',
              defaultValue: 'US',
              options: [
                { label: 'US', value: 'US' },
                { label: 'EU', value: 'EU' },
              ],
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'mailgun',
              },
            },
            // Amazon SES
            {
              name: 'sesAccessKeyId',
              type: 'text',
              label: 'AWS Access Key ID',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'ses',
              },
            },
            {
              name: 'sesSecretAccessKey',
              type: 'text',
              label: 'AWS Secret Access Key',
              admin: {
                condition: (_, siblingData) => siblingData?.provider === 'ses',
              },
            },
            {
              name: 'sesRegion',
              type: 'text',
              label: 'AWS Region',
              defaultValue: 'eu-west-2',
              admin: {
                placeholder: 'eu-west-2',
                condition: (_, siblingData) => siblingData?.provider === 'ses',
              },
            },
          ],
        },
        {
          label: 'Sender Defaults',
          fields: [
            {
              name: 'fromName',
              type: 'text',
              label: 'From Name',
              defaultValue: 'Your Store',
              admin: { description: 'Name that appears in the inbox e.g. "Your Store".' },
            },
            {
              name: 'fromEmail',
              type: 'email',
              label: 'From Email Address',
              admin: { description: 'Must be a verified domain address.' },
            },
            {
              name: 'replyToEmail',
              type: 'email',
              label: 'Reply-To Address',
              admin: { description: 'Where customer replies go. Can be a monitored support inbox.' },
            },
          ],
        },
        {
          label: 'Test Email',
          fields: [
            {
              name: 'testRecipient',
              type: 'email',
              label: 'Send Test Email To',
              admin: {
                description: 'After saving your settings, use POST /api/test-email to send a test.',
              },
            },
          ],
        },
      ],
    },
  ],
}
