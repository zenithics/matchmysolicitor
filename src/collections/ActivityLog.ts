import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { authenticated } from '../access/authenticated'

export const ActivityLog: CollectionConfig = {
  slug: 'activity-log',
  labels: { singular: 'Activity', plural: 'Activity Log' },
  admin: {
    group: 'System',
    defaultColumns: ['action', 'user', 'collection', 'documentTitle', 'timestamp'],
    useAsTitle: 'action',
    description: 'Tracks all content changes across the CMS.',
    pagination: { defaultLimit: 50 },
  },
  access: {
    create: () => true,
    read: authenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Created', value: 'create' },
        { label: 'Updated', value: 'update' },
        { label: 'Deleted', value: 'delete' },
        { label: 'Published', value: 'publish' },
        { label: 'Unpublished', value: 'unpublish' },
        { label: 'Login', value: 'login' },
      ],
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      admin: { description: 'Who performed the action' },
    },
    {
      name: 'userName',
      type: 'text',
      admin: { description: 'Snapshot of user name at time of action' },
    },
    {
      name: 'collection',
      type: 'text',
      admin: { description: 'Which collection was affected' },
    },
    {
      name: 'globalSlug',
      type: 'text',
      admin: { description: 'Which global was affected (if applicable)' },
    },
    {
      name: 'documentId',
      type: 'text',
      admin: { description: 'ID of the affected document' },
    },
    {
      name: 'documentTitle',
      type: 'text',
      admin: { description: 'Title of the affected document at time of action' },
    },
    {
      name: 'timestamp',
      type: 'date',
      required: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
}
