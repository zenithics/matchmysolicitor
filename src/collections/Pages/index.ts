import type { CollectionConfig } from 'payload'

import { isAdmin } from '../../access/isAdmin'
import { isAdminOrEditor } from '../../access/isAdminOrEditor'
import { isAdminOrEditorOrPublished } from '../../access/isAdminOrEditorOrPublished'
import { Banner } from '../../blocks/Banner/config'
import { Code } from '../../blocks/Code/config'
import { Archive } from '../../blocks/ArchiveBlock/config'
import { CallToAction } from '../../blocks/CallToAction/config'
import { Content } from '../../blocks/Content/config'
import { FormBlock } from '../../blocks/Form/config'
import { MediaBlock } from '../../blocks/MediaBlock/config'
import { Testimonials } from '../../blocks/Testimonials/config'
import { FAQ } from '../../blocks/FAQ/config'
import { Features } from '../../blocks/Features/config'
import { Stats } from '../../blocks/Stats/config'
import { LogoCarousel } from '../../blocks/LogoCarousel/config'
import { Pricing } from '../../blocks/Pricing/config'
import { HeroSplit } from '../../blocks/HeroSplit/config'
import { HowItWorks } from '../../blocks/HowItWorks/config'
import { ImageGallery } from '../../blocks/ImageGallery/config'
import { HomeHero } from '../../blocks/HomeHero/config'
import { Newsletter } from '../../blocks/Newsletter/config'
import { TeamGrid } from '../../blocks/TeamGrid/config'
import { VideoEmbed } from '../../blocks/VideoEmbed/config'
import { MapEmbed } from '../../blocks/MapEmbed/config'
import { Embed } from '../../blocks/Embed/config'
import { Timeline } from '../../blocks/Timeline/config'
import { hero } from '@/heros/config'
import { slugField } from 'payload'
import { populatePublishedAt } from '../../hooks/populatePublishedAt'
import { generatePreviewPath } from '../../utilities/generatePreviewPath'
import { revalidateDelete, revalidatePage } from './hooks/revalidatePage'
import { logCollectionChange, logCollectionDelete } from '../../hooks/logActivity'
import { applyTemplate } from './hooks/applyTemplate'
import { createIndexingHook } from '../../hooks/submitToIndexing'

import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: isAdminOrEditorOrPublished,
    update: isAdminOrEditor,
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  admin: {
    group: 'Content',
    defaultColumns: ['title', 'slug', 'updatedAt'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'pages',
          req,
        }),
    },
    preview: (data, { req }) =>
      generatePreviewPath({
        slug: data?.slug as string,
        collection: 'pages',
        req,
      }),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'template',
      type: 'relationship',
      relationTo: 'page-templates',
      label: 'Start from Template',
      admin: {
        position: 'sidebar',
        description: 'Select a template to pre-fill this page with blocks. Only applies when creating a new page.',
        condition: (data) => !data?.id,
      },
    },
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
          fields: [hero],
          label: 'Hero',
        },
        {
          fields: [
            {
              name: 'aiBlockGenerator',
              type: 'ui',
              admin: {
                components: {
                  Field: '@/components/AIBlockGenerator',
                },
              },
            },
            {
              name: 'layout',
              type: 'blocks',
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                Testimonials,
                FAQ,
                Features,
                Stats,
                LogoCarousel,
                Pricing,
                HeroSplit,
                HowItWorks,
                ImageGallery,
                HomeHero,
                Newsletter,
                TeamGrid,
                VideoEmbed,
                MapEmbed,
                Embed,
                Timeline,
                Banner,
                Code,
              ],
              required: true,
              admin: {
                initCollapsed: true,
                components: {
                  RowLabel: '@/components/BlockRowLabel',
                },
              },
            },
          ],
          label: 'Content',
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
                description: "Override the canonical URL if this page has duplicate content elsewhere. Leave blank to use the page's own URL.",
                placeholder: 'https://example.com/original-page',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'noindex', type: 'checkbox', label: 'Noindex', defaultValue: false, admin: { description: 'Hide this page from search engines.', width: '25%' } },
                { name: 'nofollow', type: 'checkbox', label: 'Nofollow', defaultValue: false, admin: { description: 'Tell search engines not to follow links on this page.', width: '25%' } },
                { name: 'noarchive', type: 'checkbox', label: 'Noarchive', defaultValue: false, admin: { description: 'Prevent cached versions in search results.', width: '25%' } },
                { name: 'nosnippet', type: 'checkbox', label: 'Nosnippet', defaultValue: false, admin: { description: 'Prevent text snippets in search results.', width: '25%' } },
              ],
            },
            {
              name: 'schemaType',
              type: 'select',
              label: 'Schema Type Override',
              options: [
                { label: 'Auto-detect (default)', value: '' },
                { label: 'WebPage', value: 'WebPage' },
                { label: 'AboutPage', value: 'AboutPage' },
                { label: 'ContactPage', value: 'ContactPage' },
                { label: 'FAQPage', value: 'FAQPage' },
                { label: 'CollectionPage', value: 'CollectionPage' },
                { label: 'CheckoutPage', value: 'CheckoutPage' },
                { label: 'SearchResultsPage', value: 'SearchResultsPage' },
              ],
              admin: { description: 'Override the automatically detected schema.org type for this page.' },
            },
            {
              name: 'focusKeyword',
              type: 'text',
              label: 'Focus Keyword',
              admin: {
                description: 'Primary keyword for this page. Used for internal reference only.',
                placeholder: 'press on nails UK',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    afterChange: [revalidatePage, logCollectionChange, createIndexingHook('pages')],
    beforeChange: [applyTemplate, populatePublishedAt],
    afterDelete: [revalidateDelete, logCollectionDelete],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 100,
      },
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
