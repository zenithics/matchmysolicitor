import type { CollectionConfig } from 'payload'
import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { logCollectionChange, logCollectionDelete } from '../hooks/logActivity'

export const Popups: CollectionConfig = {
  slug: 'popups',
  labels: { singular: 'Popup', plural: 'Popups' },
  admin: {
    group: 'Marketing',
    defaultColumns: ['name', 'triggerType', 'active', 'startsAt', 'expiresAt'],
    description: 'Lead gen and announcement popups shown to visitors.',
    useAsTitle: 'name',
  },
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: authenticated,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Internal name — not shown to visitors.' },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Publish this popup.' },
    },

    // ── Content ──────────────────────────────────────────────────────────────
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            {
              name: 'layout',
              type: 'select',
              defaultValue: 'newsletter',
              options: [
                { label: 'Newsletter Signup', value: 'newsletter' },
                { label: 'Announcement', value: 'announcement' },
                { label: 'Discount Offer', value: 'discount' },
                { label: 'Custom HTML', value: 'custom' },
              ],
            },
            {
              name: 'heading',
              type: 'text',
              admin: { description: 'Main headline shown in the popup.' },
            },
            {
              name: 'body',
              type: 'richText',
              label: 'Body Text',
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              label: 'Featured Image',
              admin: { description: 'Optional image (shown left on desktop, top on mobile).' },
            },
            {
              name: 'discountCode',
              type: 'text',
              label: 'Discount Code to Reveal',
              admin: {
                condition: (_, siblingData) => siblingData?.layout === 'discount',
                description: 'Code shown after the visitor submits their email (discount layout).',
              },
            },
            {
              name: 'ctaText',
              type: 'text',
              label: 'Button / Submit Label',
              defaultValue: 'Subscribe',
            },
            {
              name: 'ctaUrl',
              type: 'text',
              label: 'Button URL',
              admin: {
                description: 'For announcement/custom layouts. Leave blank for a form submit.',
                condition: (_, siblingData) =>
                  siblingData?.layout === 'announcement' || siblingData?.layout === 'custom',
              },
            },
            {
              name: 'successMessage',
              type: 'text',
              defaultValue: "You're in! Check your inbox for a confirmation.",
              admin: { description: 'Message shown after a successful form submission.' },
            },
            {
              name: 'customHtml',
              type: 'textarea',
              label: 'Custom HTML',
              admin: {
                condition: (_, siblingData) => siblingData?.layout === 'custom',
                description: 'Raw HTML rendered inside the popup.',
              },
            },
          ],
        },

        // ── Trigger ──────────────────────────────────────────────────────────
        {
          label: 'Trigger',
          fields: [
            {
              name: 'triggerType',
              type: 'select',
              defaultValue: 'delay',
              options: [
                { label: 'Time Delay', value: 'delay' },
                { label: 'Exit Intent', value: 'exit_intent' },
                { label: 'Scroll Depth', value: 'scroll' },
                { label: 'Immediate', value: 'immediate' },
              ],
            },
            {
              name: 'triggerDelay',
              type: 'number',
              label: 'Delay (seconds)',
              defaultValue: 5,
              admin: {
                description: 'Seconds after page load before showing the popup.',
                condition: (_, siblingData) => siblingData?.triggerType === 'delay',
              },
            },
            {
              name: 'triggerScrollPercent',
              type: 'number',
              label: 'Scroll Depth (%)',
              defaultValue: 50,
              min: 1,
              max: 100,
              admin: {
                condition: (_, siblingData) => siblingData?.triggerType === 'scroll',
              },
            },
            {
              name: 'dismissDays',
              type: 'number',
              label: 'Re-show After (days)',
              defaultValue: 30,
              admin: {
                description:
                  'Days before showing again after the visitor dismisses. 0 = never re-show.',
              },
            },
            {
              name: 'showOncePerSession',
              type: 'checkbox',
              label: 'Only once per session',
              defaultValue: false,
            },
            {
              name: 'urlCondition',
              type: 'text',
              label: 'Show only on URL (contains)',
              admin: {
                description:
                  'Leave blank to show on every page, or enter a URL fragment (e.g. /blog).',
              },
            },
          ],
        },

        // ── Appearance ───────────────────────────────────────────────────────
        {
          label: 'Appearance',
          fields: [
            {
              name: 'size',
              type: 'select',
              defaultValue: 'medium',
              options: [
                { label: 'Small', value: 'small' },
                { label: 'Medium', value: 'medium' },
                { label: 'Large', value: 'large' },
                { label: 'Full Width (Banner)', value: 'banner' },
              ],
            },
            {
              name: 'position',
              type: 'select',
              defaultValue: 'center',
              options: [
                { label: 'Center', value: 'center' },
                { label: 'Bottom Left', value: 'bottom_left' },
                { label: 'Bottom Right', value: 'bottom_right' },
                { label: 'Bottom Center', value: 'bottom_center' },
              ],
            },
            {
              name: 'showCloseButton',
              type: 'checkbox',
              label: 'Show Close Button',
              defaultValue: true,
            },
            {
              name: 'overlayDismiss',
              type: 'checkbox',
              label: 'Close on overlay click',
              defaultValue: true,
            },
            {
              name: 'backgroundColor',
              type: 'text',
              label: 'Background Color',
              admin: { description: 'CSS color (e.g. #ffffff). Leave blank for card default.' },
            },
          ],
        },

        // ── Schedule ─────────────────────────────────────────────────────────
        {
          label: 'Schedule',
          fields: [
            {
              name: 'startsAt',
              type: 'date',
              label: 'Start Date',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
            {
              name: 'expiresAt',
              type: 'date',
              label: 'End Date',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [logCollectionChange],
    afterDelete: [logCollectionDelete],
  },
}
