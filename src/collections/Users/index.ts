import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import type { User } from '@/payload-types'

import { authenticated } from '../../access/authenticated'
import { isAdmin } from '../../access/isAdmin'
import { isAdminOrSelf } from '../../access/isAdminOrSelf'

const ensureAdminExists: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  // On create: if this is the very first user, force admin role
  if (operation === 'create') {
    const existingUsers = await req.payload.count({ collection: 'users' })
    if (existingUsers.totalDocs === 0) {
      data.role = 'admin'
    }
  }
  return data
}

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: ({ req: { user } }) => Boolean(user) && (user as any).role !== 'customer',
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrSelf,
    update: isAdminOrSelf,
  },
  admin: {
    group: 'System',
    defaultColumns: ['name', 'email', 'role'],
    useAsTitle: 'name',
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes
    tokenExpiration: 7200, // 2 hours
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Viewer', value: 'viewer' },
        { label: 'Customer', value: 'customer' },
      ],
      admin: {
        position: 'sidebar',
        description: 'Controls what this user can access in the admin panel',
      },
      access: {
        update: ({ req }) => (req.user as User)?.role === 'admin',
      },
    },
    // ── Author profile ────────────────────────────────────────────────────────
    {
      name: 'jobTitle',
      type: 'text',
      label: 'Job Title',
      admin: { description: 'e.g. "Senior Editor", "Founder"' },
    },
    {
      name: 'bio',
      type: 'textarea',
      label: 'Short Bio',
      admin: { description: 'Shown on blog posts and the author page. Keep it to 2-3 sentences.' },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Profile Photo',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Author Slug',
      admin: {
        description: 'URL-friendly identifier used for the author page (e.g. jane-smith). Auto-suggested from name.',
      },
    },
    {
      name: 'website',
      type: 'text',
      label: 'Personal Website',
    },
    {
      name: 'twitter',
      type: 'text',
      label: 'X / Twitter username',
      admin: { description: 'Username only, without @' },
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn URL',
    },
    {
      name: 'instagram',
      type: 'text',
      label: 'Instagram username',
      admin: { description: 'Username only, without @' },
    },
    // ── Customer saved addresses ──────────────────────────────────────────────
    {
      name: 'savedAddresses',
      type: 'array',
      label: 'Saved Addresses',
      admin: {
        condition: (data) => data?.role === 'customer',
        description: 'Saved shipping addresses',
      },
      fields: [
        { name: 'label', type: 'text', label: 'Label', admin: { placeholder: 'Home, Work, etc.' } },
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'county', type: 'text', label: 'County / State' },
        { name: 'postcode', type: 'text', required: true, label: 'Postcode / ZIP' },
        { name: 'country', type: 'text', required: true, defaultValue: 'GB' },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
    // ── Two-Factor Authentication ─────────────────────────────────────────────
    {
      name: 'twoFactorEnabled',
      type: 'checkbox',
      label: 'Two-Factor Authentication',
      defaultValue: false,
      admin: {
        readOnly: true,
        description: 'Managed automatically via the button below.',
        position: 'sidebar',
      },
    },
    {
      name: 'twoFactorSetup',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field: '@/components/TwoFactorSetupButton',
        },
      },
    },
    {
      name: 'twoFactorSecret',
      type: 'text',
      label: 'TOTP Secret',
      admin: { hidden: true },
      access: {
        // Readable server-side so req.user includes the secret for access checks.
        // REST responses respect this too — only authenticated requests get the field,
        // but it is never surfaced in the admin UI (hidden: true).
        read: ({ req }) => !!req.user,
        update: () => false,
      },
    },
    {
      name: 'twoFactorBackupCodes',
      type: 'json',
      label: 'Backup Codes',
      admin: { disabled: true },
      access: {
        read: () => false,
        update: () => false,
      },
    },
  ],
  hooks: {
    beforeChange: [ensureAdminExists],
  },
  timestamps: true,
  versions: false,
}
