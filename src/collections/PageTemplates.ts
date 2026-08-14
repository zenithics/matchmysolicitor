import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { authenticated } from '../access/authenticated'

import { Banner } from '../blocks/Banner/config'
import { Code } from '../blocks/Code/config'
import { Archive } from '../blocks/ArchiveBlock/config'
import { CallToAction } from '../blocks/CallToAction/config'
import { Content } from '../blocks/Content/config'
import { FormBlock } from '../blocks/Form/config'
import { MediaBlock } from '../blocks/MediaBlock/config'
import { Testimonials } from '../blocks/Testimonials/config'
import { FAQ } from '../blocks/FAQ/config'
import { Features } from '../blocks/Features/config'
import { Stats } from '../blocks/Stats/config'
import { LogoCarousel } from '../blocks/LogoCarousel/config'
import { Pricing } from '../blocks/Pricing/config'
import { HeroSplit } from '../blocks/HeroSplit/config'
import { HowItWorks } from '../blocks/HowItWorks/config'
import { ImageGallery } from '../blocks/ImageGallery/config'
import { HomeHero } from '../blocks/HomeHero/config'
import { Newsletter } from '../blocks/Newsletter/config'
import { TeamGrid } from '../blocks/TeamGrid/config'
import { VideoEmbed } from '../blocks/VideoEmbed/config'
import { MapEmbed } from '../blocks/MapEmbed/config'
import { Embed } from '../blocks/Embed/config'
import { Timeline } from '../blocks/Timeline/config'
import { hero } from '../heros/config'

export const PageTemplates: CollectionConfig = {
  slug: 'page-templates',
  labels: { singular: 'Page Template', plural: 'Page Templates' },
  admin: {
    group: 'Content',
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'description', 'updatedAt'],
    description: 'Reusable page layouts. When creating a new page, users can pick a template to pre-populate blocks.',
  },
  access: {
    create: isAdmin,
    update: isAdminOrEditor,
    delete: isAdmin,
    read: authenticated,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Template Name',
      admin: { description: 'e.g. "Service Page", "Landing Page", "About Us"' },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: { description: 'Brief description shown when users pick a template' },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Landing Page', value: 'landing' },
        { label: 'Service Page', value: 'service' },
        { label: 'About / Company', value: 'about' },
        { label: 'Contact', value: 'contact' },
        { label: 'Shop / Product', value: 'shop' },
        { label: 'Blog / Content', value: 'blog' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      relationTo: 'media',
      label: 'Preview Thumbnail',
      admin: {
        position: 'sidebar',
        description: 'Optional preview image shown in the template picker',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [hero],
        },
        {
          label: 'Page Layout',
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
              admin: {
                components: {
                  RowLabel: '@/components/BlockRowLabel',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
