import type { GlobalConfig } from 'payload'
import { logGlobalChange } from '@/hooks/logActivity'

/**
 * Where new enquiries get delivered. Editable in the CMS so the n8n / Zapier /
 * CRM endpoint can be changed without a code deploy.
 *
 * Values set here take precedence over the ENQUIRY_WEBHOOK_URLS /
 * ENQUIRY_WEBHOOK_SECRET / ENQUIRY_NOTIFY_EMAILS environment variables, which
 * remain as the fallback so nothing breaks if this global is left empty.
 */
export const LeadDelivery: GlobalConfig = {
  slug: 'lead-delivery',
  label: 'Lead Delivery',
  admin: {
    group: 'Site Settings',
    description:
      'Where new enquiries are sent: outbound webhooks (n8n, Zapier, a CRM) and email notifications.',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'webhooksEnabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Send enquiries to webhooks',
    },
    {
      name: 'webhooks',
      type: 'array',
      label: 'Webhook endpoints',
      admin: {
        description:
          'Each enquiry is POSTed as JSON to every enabled endpoint, with 3 retries. Leave empty to fall back to the ENQUIRY_WEBHOOK_URLS environment variable.',
        condition: (_, siblingData) => siblingData?.webhooksEnabled !== false,
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: { description: 'For your reference, e.g. "n8n — Monday board (Taurus)"' },
        },
        {
          name: 'url',
          type: 'text',
          required: true,
          validate: (value: string | null | undefined) => {
            if (!value) return 'A webhook URL is required'
            try {
              const u = new URL(value)
              if (u.protocol !== 'https:' && u.protocol !== 'http:')
                return 'URL must start with https://'
              return true
            } catch {
              return 'Enter a valid URL, e.g. https://example.com/webhook/abc'
            }
          },
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'webhookSecret',
      type: 'text',
      label: 'Webhook signing secret (optional)',
      admin: {
        description:
          'If set, each request carries an X-MMS-Signature header of sha256=HMAC(body) so the receiver can verify it came from this site.',
      },
    },
    {
      name: 'notifyEmails',
      type: 'text',
      label: 'Email notifications to',
      admin: {
        description:
          'Comma separated. Leave empty to fall back to ENQUIRY_NOTIFY_EMAILS, then the company contact email.',
      },
    },
  ],
  hooks: {
    afterChange: [logGlobalChange],
  },
}
