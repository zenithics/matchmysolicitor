import type { GlobalConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import {
  lexicalEditor,
  HeadingFeature,
  BoldFeature,
  ItalicFeature,
  UnderlineFeature,
  ParagraphFeature,
  OrderedListFeature,
  UnorderedListFeature,
  LinkFeature,
} from '@payloadcms/richtext-lexical'

const policyEditor = lexicalEditor({
  features: [
    ParagraphFeature(),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    BoldFeature(),
    ItalicFeature(),
    UnderlineFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    LinkFeature({ enabledCollections: ['pages'] }),
  ],
})

export const PrivacySettings: GlobalConfig = {
  slug: 'privacy-settings',
  label: 'Privacy & GDPR',
  admin: {
    group: 'Privacy & Compliance',
    description:
      'Cookie consent, legal policies, data retention, and GDPR compliance — all in one place.',
  },
  access: {
    read: () => true,
    update: isAdmin,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Cookie Consent',
          fields: [
            {
              name: 'cookieConsentEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: 'Enable Cookie Consent Banner',
              admin: {
                description:
                  'Show cookie consent banner to visitors. Required for GDPR compliance.',
              },
            },
            {
              type: 'collapsible',
              label: 'Banner Content',
              fields: [
                {
                  name: 'bannerTitle',
                  type: 'text',
                  label: 'Banner Heading',
                  defaultValue: 'We use cookies 🍪',
                },
                {
                  name: 'bannerText',
                  type: 'textarea',
                  label: 'Banner Text',
                  defaultValue:
                    'We use cookies to improve your experience and measure site performance. Some cookies are essential, others help us understand how you use our site.',
                },
                {
                  name: 'acceptAllLabel',
                  type: 'text',
                  label: '"Accept All" Button Label',
                  defaultValue: 'Accept All',
                },
                {
                  name: 'rejectAllLabel',
                  type: 'text',
                  label: '"Reject All" Button Label',
                  defaultValue: 'Reject All',
                },
                {
                  name: 'managePrefsLabel',
                  type: 'text',
                  label: '"Manage Preferences" Button Label',
                  defaultValue: 'Manage Preferences',
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Cookie Categories',
              admin: {
                description:
                  'Define cookie categories shown in the preferences modal. "Necessary" is always on.',
              },
              fields: [
                {
                  name: 'necessaryLabel',
                  type: 'text',
                  label: 'Necessary Category Label',
                  defaultValue: 'Necessary',
                },
                {
                  name: 'necessaryDescription',
                  type: 'textarea',
                  label: 'Necessary Category Description',
                  defaultValue:
                    'Required for the site to work. Includes your cart, session, and consent settings. Cannot be disabled.',
                },
                {
                  name: 'analyticsLabel',
                  type: 'text',
                  label: 'Analytics Category Label',
                  defaultValue: 'Analytics',
                },
                {
                  name: 'analyticsDescription',
                  type: 'textarea',
                  label: 'Analytics Category Description',
                  defaultValue:
                    'Help us understand how visitors use our site (Google Analytics, Microsoft Clarity).',
                },
                {
                  name: 'advertisingLabel',
                  type: 'text',
                  label: 'Advertising Category Label',
                  defaultValue: 'Advertising',
                },
                {
                  name: 'advertisingDescription',
                  type: 'textarea',
                  label: 'Advertising Category Description',
                  defaultValue:
                    'Used to show you relevant ads and measure ad performance (Meta, TikTok, Reddit).',
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Preferences Modal',
              fields: [
                {
                  name: 'modalTitle',
                  type: 'text',
                  label: 'Modal Heading',
                  defaultValue: 'Cookie Preferences',
                },
                {
                  name: 'modalSubtext',
                  type: 'text',
                  label: 'Modal Subtext',
                  defaultValue:
                    'Choose which cookies you allow. You can change these at any time.',
                },
                {
                  name: 'savePrefsLabel',
                  type: 'text',
                  label: '"Save Preferences" Button Label',
                  defaultValue: 'Save Preferences',
                },
                {
                  name: 'cookieSettingsLinkLabel',
                  type: 'text',
                  label: 'Footer Link Label',
                  defaultValue: 'Cookie Settings',
                  admin: {
                    description:
                      'Text shown in the website footer to reopen the preferences modal.',
                  },
                },
                {
                  name: 'consentCookieExpiry',
                  type: 'number',
                  label: 'Consent Cookie Expiry (days)',
                  defaultValue: 365,
                  admin: {
                    description:
                      'How many days before visitors are asked again. Default: 365.',
                  },
                },
              ],
            },
            {
              name: 'privacyPolicyPage',
              type: 'relationship',
              relationTo: 'pages',
              label: 'Privacy Policy Page',
              admin: {
                description:
                  'Link to the frontend privacy policy page. Shown in the cookie banner.',
              },
            },
          ],
        },
        {
          label: 'Legal Policies',
          description:
            'Legal policy documents rendered at /policies/{slug}. Use {{companyName}}, {{contactEmail}}, {{registeredAddress}}, {{websiteUrl}}, {{contactPhone}}, {{dpoEmail}}, {{companyRegistrationNumber}}, {{vatNumber}} as placeholders — values auto-fill from Company Details.',
          fields: [
            {
              name: 'policies',
              type: 'array',
              label: 'Policies',
              labels: { singular: 'Policy', plural: 'Policies' },
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/components/PolicyRowLabel',
                },
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      required: true,
                      label: 'Policy Title',
                      admin: { width: '50%' },
                    },
                    {
                      name: 'slug',
                      type: 'text',
                      required: true,
                      label: 'Slug',
                      admin: {
                        width: '25%',
                        description: 'e.g. privacy-policy',
                      },
                    },
                    {
                      name: 'version',
                      type: 'text',
                      label: 'Version',
                      defaultValue: '1.0',
                      admin: { width: '10%' },
                    },
                    {
                      name: 'effectiveDate',
                      type: 'date',
                      label: 'Effective Date',
                      admin: {
                        width: '15%',
                        date: { pickerAppearance: 'dayOnly' },
                      },
                    },
                  ],
                },
                {
                  name: 'lastReviewed',
                  type: 'date',
                  label: 'Last Reviewed',
                  admin: { date: { pickerAppearance: 'dayOnly' } },
                },
                {
                  name: 'content',
                  type: 'richText',
                  label: 'Content',
                  required: true,
                  editor: policyEditor,
                },
              ],
            },
          ],
        },
        {
          label: 'Data Retention',
          fields: [
            {
              name: 'dataRetentionMonths',
              type: 'number',
              defaultValue: 36,
              label: 'Data Retention Period (months)',
              admin: {
                description:
                  'Anonymise customer PII after this many months. Financial records (order totals, dates) are kept for HMRC compliance (6 years). Default: 36 months.',
              },
            },
            {
              name: 'activityLogRetentionDays',
              type: 'number',
              defaultValue: 365,
              label: 'Activity Log Retention (days)',
              admin: {
                description:
                  'Delete activity log entries older than this. Default: 365 days.',
              },
            },
          ],
        },
        {
          label: 'Consent Text',
          fields: [
            {
              name: 'checkoutConsentText',
              type: 'text',
              defaultValue: 'I agree to the Terms & Conditions and Privacy Policy.',
              label: 'Checkout Consent Checkbox Text',
              admin: {
                description: 'Text shown next to the consent checkbox at checkout.',
              },
            },
            {
              name: 'registrationConsentText',
              type: 'text',
              defaultValue:
                'I agree to the Terms & Conditions and Privacy Policy. I understand my data will be processed as described in the Privacy Policy.',
              label: 'Registration Consent Checkbox Text',
            },
            {
              name: 'newsletterConsentText',
              type: 'text',
              defaultValue:
                'I agree to receive marketing emails. You can unsubscribe at any time.',
              label: 'Newsletter Consent Text',
            },
          ],
        },
      ],
    },
  ],
}
