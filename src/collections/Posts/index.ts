import type { CollectionConfig } from 'payload'

import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { isAdmin } from '../../access/isAdmin'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'
import { isAdminOrEditorOrPublished } from '../../access/isAdminOrEditorOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { populateAuthors } from './hooks/populateAuthors'
import { revalidateDelete, revalidatePost } from './hooks/revalidatePost'
import { logCollectionChange, logCollectionDelete } from '../../hooks/logActivity'
import { createIndexingHook } from '../../hooks/submitToIndexing'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { slugField } from 'payload'


export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: isAdminOrEditorOrPublished,
    update: isAdminOrEditor,
  },
  // This config controls what's populated by default when a post is referenced
  // https://payloadcms.com/docs/queries/select#defaultpopulate-collection-config-property
  // NOTE: the slug generic (CollectionConfig<'pages'>) is dropped to work around a TypeScript 6
  // regression where a slug-typed config's defaultPopulate is not assignable to buildConfig's
  // collections array. defaultPopulate falls back to SelectType (keys no longer field-checked);
  // restore the generic once the core types are fixed.
  defaultPopulate: {
    title: true,
    slug: true,
    categories: true,
    meta: {
      image: true,
      description: true,
    },
  },
  admin: {
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'posts',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'posts',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Title',
    },
    {
      type: 'tabs',
      tabs: [
        {
          fields: [
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                    BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                    HorizontalRuleFeature(),
                  ]
                },
              }),
              label: false,
              required: true,
            },
          ],
          label: 'Content',
        },
        {
          fields: [
            {
              name: 'relatedPosts',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              filterOptions: ({ id }) => {
                return {
                  id: {
                    not_in: [id],
                  },
                }
              },
              hasMany: true,
              relationTo: 'posts',
            },
            {
              name: 'categories',
              type: 'relationship',
              admin: {
                position: 'sidebar',
              },
              hasMany: true,
              relationTo: 'categories',
            },
          ],
          label: 'Meta',
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              relationTo: 'media',
            }),

            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
        {
          name: 'advancedSeo',
          label: 'Advanced SEO',
          fields: [
            {
              name: 'canonicalUrl',
              type: 'text',
              label: 'Canonical URL',
              admin: {
                description: "Override the canonical URL. Leave blank to use this post's URL.",
                placeholder: 'https://example.com/original-post',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'noindex', type: 'checkbox', label: 'Noindex', defaultValue: false, admin: { width: '25%' } },
                { name: 'nofollow', type: 'checkbox', label: 'Nofollow', defaultValue: false, admin: { width: '25%' } },
              ],
            },
            {
              name: 'schemaType',
              type: 'select',
              label: 'Article Schema Type',
              options: [
                { label: 'Use default (from SEO Settings)', value: '' },
                { label: 'Article', value: 'Article' },
                { label: 'NewsArticle', value: 'NewsArticle' },
                { label: 'BlogPosting', value: 'BlogPosting' },
              ],
              admin: { description: 'Override the default article schema type for this post.' },
            },
            {
              name: 'focusKeyword',
              type: 'text',
              label: 'Focus Keyword',
              admin: { placeholder: 'best press on nails' },
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        position: 'sidebar',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === 'published' && !value) {
              return new Date()
            }
            return value
          },
        ],
      },
    },
    {
      name: 'authors',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'users',
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: 'populatedAuthors',
      type: 'array',
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        { name: 'id', type: 'text' },
        { name: 'name', type: 'text' },
        { name: 'role', type: 'text' },
        { name: 'bio', type: 'textarea' },
        { name: 'slug', type: 'text' },
        { name: 'twitter', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'instagram', type: 'text' },
        { name: 'website', type: 'text' },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePost, logCollectionChange, createIndexingHook('posts')],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete, logCollectionDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100, // We set this interval for optimal live preview
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
