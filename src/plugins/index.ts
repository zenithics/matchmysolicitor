import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { nestedDocsPlugin } from '@payloadcms/plugin-nested-docs'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { searchPlugin } from '@payloadcms/plugin-search'
import { Plugin } from 'payload'
import { revalidateRedirects } from '@/hooks/revalidateRedirects'
import { GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types'
import { FixedToolbarFeature, HeadingFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import { searchFields } from '@/search/fieldOverrides'
import { beforeSyncWithSearch } from '@/search/beforeSync'
import { notifyFormSubmission } from '@/hooks/notifyFormSubmission'

import { Page, Post } from '@/payload-types'
import { getServerSideURL } from '@/utilities/getURL'
import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { isAdminOrEditor } from '@/access/isAdminOrEditor'

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => {
  return doc?.title ? `${doc.title} | Payload Website Template` : 'Payload Website Template'
}

const generateURL: GenerateURL<Post | Page> = ({ doc }) => {
  const url = getServerSideURL()

  return doc?.slug ? `${url}/${doc.slug}` : url
}

export const plugins: Plugin[] = [
  redirectsPlugin({
    collections: ['pages', 'posts'],
    overrides: {
      admin: { group: 'SEO' },
      // @ts-expect-error - This is a valid override, mapped fields don't resolve to the same type
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'from') {
            return {
              ...field,
              admin: {
                description: 'You will need to rebuild the website when changing this field.',
              },
            }
          }
          return field
        })
      },
      hooks: {
        afterChange: [revalidateRedirects],
      },
    },
  }),
  nestedDocsPlugin({
    collections: ['categories'],
    generateURL: (docs) => docs.reduce((url, doc) => `${url}/${doc.slug}`, ''),
  }),
  seoPlugin({
    generateTitle,
    generateURL,
    fields: ({ defaultFields }) => [
      ...defaultFields,
      {
        name: 'focusKeyphrase',
        type: 'text' as const,
        label: 'Focus Keyphrase',
        admin: { description: 'The main keyword this page targets. Used for SEO analysis.' },
      },
      {
        name: 'canonicalUrl',
        type: 'text' as const,
        label: 'Canonical URL',
        admin: { description: 'Leave blank to use the default page URL.' },
      },
      {
        name: 'robots',
        type: 'select' as const,
        label: 'Robots',
        defaultValue: 'index, follow',
        options: [
          { label: 'index, follow (default)', value: 'index, follow' },
          { label: 'noindex, follow', value: 'noindex, follow' },
          { label: 'index, nofollow', value: 'index, nofollow' },
          { label: 'noindex, nofollow', value: 'noindex, nofollow' },
        ],
      },
      {
        name: 'ogType',
        type: 'select' as const,
        label: 'Open Graph Type',
        defaultValue: 'website',
        options: [
          { label: 'Website', value: 'website' },
          { label: 'Article', value: 'article' },
          { label: 'Product', value: 'product' },
        ],
      },
      {
        name: 'twitterCardType',
        type: 'select' as const,
        label: 'Twitter Card Type',
        defaultValue: 'summary_large_image',
        options: [
          { label: 'Summary', value: 'summary' },
          { label: 'Summary with Large Image', value: 'summary_large_image' },
        ],
      },
    ],
  }),
  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formSubmissionOverrides: {
      admin: { group: 'Content' },
      hooks: {
        afterChange: [notifyFormSubmission],
      },
      access: {
        create: anyone,
        delete: isAdmin,
        read: authenticated,
        update: isAdmin,
      },
    },
    formOverrides: {
      admin: { group: 'Content' },
      access: {
        create: isAdmin,
        delete: isAdmin,
        read: anyone,
        update: isAdminOrEditor,
      },
      fields: ({ defaultFields }) => {
        return defaultFields.map((field) => {
          if ('name' in field && field.name === 'confirmationMessage') {
            return {
              ...field,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    FixedToolbarFeature(),
                    HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
                  ]
                },
              }),
            }
          }
          return field
        })
      },
    },
  }),
  searchPlugin({
    collections: ['posts', 'pages'],
    beforeSync: beforeSyncWithSearch,
    searchOverrides: {
      admin: { group: 'Content' },
      access: {
        create: isAdminOrEditor,
        delete: isAdmin,
        read: anyone,
        update: isAdminOrEditor,
      },
      fields: ({ defaultFields }) => {
        return [...defaultFields, ...searchFields]
      },
    },
  }),
]
