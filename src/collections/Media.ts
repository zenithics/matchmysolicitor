import type { CollectionConfig } from 'payload'

import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'

import { anyone } from '../access/anyone'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { logCollectionChange, logCollectionDelete } from '../hooks/logActivity'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'folder', 'alt', 'updatedAt'],
    useAsTitle: 'filename',
    listSearchableFields: ['filename', 'alt', 'tags', 'folder'],
  },
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    // Media must be publicly readable: every image on the public site is served
    // through this collection, so `authenticated` means visitors get a 403 for
    // each one and the site renders with empty image slots.
    read: anyone,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      //required: true,
    },
    {
      name: 'folder',
      type: 'select',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Logos & Branding', value: 'logos' },

        { label: 'Blog Images', value: 'blog' },
        { label: 'Team & About', value: 'team' },
        { label: 'Icons & Graphics', value: 'icons' },
        { label: 'Backgrounds', value: 'backgrounds' },
      ],
      defaultValue: 'general',
      admin: {
        position: 'sidebar',
        description: 'Organise your media into folders for easier browsing',
      },
    },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description: 'Add searchable tags to this media item',
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
    },
  ],
  hooks: {
    afterChange: [logCollectionChange],
    afterDelete: [logCollectionDelete],
  },
  upload: {
    // Upload to the public/media directory in Next.js making them publicly accessible even outside of Payload
    staticDir: path.resolve(dirname, '../../public/media'),
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
      },
      {
        name: 'square',
        width: 500,
        height: 500,
      },
      {
        name: 'small',
        width: 600,
      },
      {
        name: 'medium',
        width: 900,
      },
      {
        name: 'large',
        width: 1400,
      },
      {
        name: 'xlarge',
        width: 1920,
      },
      {
        name: 'og',
        width: 1200,
        height: 630,
        crop: 'center',
      },
    ],
  },
}
