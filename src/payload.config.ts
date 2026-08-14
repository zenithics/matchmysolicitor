import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import sharp from 'sharp'
import path from 'path'
import { buildConfig, PayloadRequest } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { SEOSettings } from './globals/SEOSettings'
import { CompanyDetails } from './globals/CompanyDetails'
import { SiteAppearance } from './globals/SiteAppearance'
import { SiteSettings } from './globals/SiteSettings'
import { ContactWidget } from './globals/ContactWidget'
import { MailSettings } from './globals/MailSettings'
import { NewsletterSettings } from './globals/NewsletterSettings'
import { MaintenanceMode } from './globals/MaintenanceMode'
import { CodeInjection } from './globals/CodeInjection'
import { AnnouncementBar } from './globals/AnnouncementBar'
import { NotFoundPage } from './globals/NotFoundPage'
import { CMSBranding } from './globals/CMSBranding'
import { PrivacySettings } from './globals/PrivacySettings'
import { PermalinkSettings } from './globals/PermalinkSettings'
import { Popups } from './collections/Popups'
import { ActivityLog } from './collections/ActivityLog'
import { PageTemplates } from './collections/PageTemplates'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    components: {
      beforeDashboard: ['@/components/Dashboard'],
      graphics: {
        Logo: '@/components/AdminLogo',
        Icon: '@/components/AdminIcon',
      },
      providers: ['@/components/HelpPanel'],
    },
    meta: {
      titleSuffix: ' | Site Admin',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    routes: {
      unauthorized: '/login',
    },
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
  },
  // This config helps us configure global or default features that the other editors can inherit
  editor: defaultLexical,
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  collections: [
    // Content
    Pages,
    Posts,
    Categories,
    Media,
    PageTemplates,
    // Marketing
    Popups,
    // System
    Users,
    ActivityLog,
  ],
  cors: [getServerSideURL()].filter(Boolean),
  plugins: [
    ...plugins,
    vercelBlobStorage({
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  globals: [
    // Global
    Header,
    Footer,
    CompanyDetails,
    ContactWidget,
    SiteSettings,
    // Marketing
    AnnouncementBar,
    NewsletterSettings,
    // SEO
    SEOSettings,
    PermalinkSettings,
    // Privacy & Compliance
    PrivacySettings,
    // Site Settings
    SiteAppearance,
    NotFoundPage,
    CodeInjection,
    MaintenanceMode,
    MailSettings,
    // System
    CMSBranding,
  ],
  secret: process.env.PAYLOAD_SECRET,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true
        const secret = process.env.CRON_SECRET
        if (!secret) return false
        const authHeader = req.headers.get('authorization')
        return authHeader === `Bearer ${secret}`
      },
    },
    tasks: [],
  },
})
