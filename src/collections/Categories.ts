import type { CollectionConfig } from 'payload'

import { authenticated } from '../access/authenticated'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: authenticated,
    update: isAdminOrEditor,
  },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
