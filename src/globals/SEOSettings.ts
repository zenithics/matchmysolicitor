import type { GlobalConfig } from 'payload'
import { logGlobalChange } from '@/hooks/logActivity'

export const SEOSettings: GlobalConfig = {
  slug: 'seo-settings',
  label: 'SEO Settings',
  admin: {
    group: 'SEO',
    description: 'Site-wide SEO, analytics tracking, and advertising pixel configuration.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'siteTitle',
              type: 'text',
              label: 'Site Title',
              defaultValue: 'Your Brand',
              admin: { description: 'Used as the brand name appended to all page titles (e.g. "Shop | Your Brand").' },
            },
            {
              name: 'titleSeparator',
              type: 'select',
              label: 'Title Separator',
              defaultValue: ' | ',
              options: [
                { label: ' | (pipe)', value: ' | ' },
                { label: ' - (dash)', value: ' - ' },
                { label: ' — (em dash)', value: ' — ' },
              ],
            },
            {
              name: 'defaultDescription',
              type: 'textarea',
              label: 'Default Meta Description',
              admin: { description: 'Shown in search results when a page has no specific description. Keep under 160 characters.' },
            },
            {
              name: 'defaultOgImage',
              type: 'upload',
              label: 'Default Open Graph Image',
              relationTo: 'media',
              admin: { description: 'Fallback social share image (1200×630px recommended).' },
            },
          ],
        },
        {
          label: 'Verification & Analytics',
          fields: [
            {
              name: 'googleSearchConsoleCode',
              type: 'text',
              label: 'Google Search Console Verification Code',
              admin: {
                description: 'Paste the "content" value only from the <meta name="google-site-verification"> tag Google gives you.',
              },
            },
            {
              name: 'bingVerificationCode',
              type: 'text',
              label: 'Bing Webmaster Verification Code',
              admin: {
                description: 'Paste the "content" value only from the <meta name="msvalidate.01"> tag.',
              },
            },
            {
              name: 'ga4MeasurementId',
              type: 'text',
              label: 'GA4 Measurement ID',
              admin: {
                description: 'e.g. G-XXXXXXXXXX — only used if no GTM ID is set below.',
              },
            },
            {
              name: 'gtmId',
              type: 'text',
              label: 'Google Tag Manager ID',
              admin: {
                description: 'e.g. GTM-XXXXXXX — if set, GA4 loads via GTM. Recommended over direct GA4.',
              },
            },
            {
              name: 'clarityProjectId',
              type: 'text',
              label: 'Microsoft Clarity Project ID',
              admin: {
                description: 'Found in your Clarity dashboard → Settings → Overview.',
              },
            },
            {
              name: 'hotjarSiteId',
              type: 'text',
              label: 'Hotjar Site ID',
              admin: { description: 'Found in Hotjar → Settings → Tracking Code.' },
            },
            {
              name: 'merchantCenterVerification',
              type: 'text',
              label: 'Google Merchant Center Verification',
              admin: { description: 'Paste the "content" value from the Google Merchant Center meta verification tag.' },
            },
            {
              name: 'appleSiteVerification',
              type: 'text',
              label: 'Apple Site Verification',
              admin: { description: 'Paste the content value from the Apple <meta name="apple-site-verification"> tag.' },
            },
          ],
        },
        {
          label: 'Ad Pixels',
          fields: [
            {
              name: 'metaPixelId',
              type: 'text',
              label: 'Meta (Facebook) Pixel ID',
              admin: { description: 'Your Meta Pixel ID — found in Meta Events Manager.' },
            },
            {
              name: 'metaCapiAccessToken',
              type: 'text',
              label: 'Meta Conversions API Access Token',
              admin: {
                description: 'Enables server-side event sending to complement the browser pixel. Generate in Meta Events Manager.',
              },
            },
            {
              name: 'metaTestEventCode',
              type: 'text',
              label: 'Meta Test Event Code',
              admin: {
                description: 'Optional — only needed during CAPI testing in Meta Events Manager. Remove once live.',
              },
            },
            {
              name: 'tiktokPixelId',
              type: 'text',
              label: 'TikTok Pixel ID',
              admin: { description: 'Found in TikTok Ads Manager → Assets → Events → Web Events.' },
            },
            {
              name: 'tiktokEventsApiAccessToken',
              type: 'text',
              label: 'TikTok Events API Access Token',
              admin: { description: 'Enables server-side TikTok event sending.' },
            },
            {
              name: 'redditPixelId',
              type: 'text',
              label: 'Reddit Pixel ID',
              admin: { description: 'Found in Reddit Ads → Conversions.' },
            },
            {
              name: 'redditConversionsApiToken',
              type: 'text',
              label: 'Reddit Conversions API Token',
              admin: { description: 'Enables server-side Reddit conversion events.' },
            },
            {
              name: 'gadsConversionId',
              type: 'text',
              label: 'Google Ads Conversion ID',
              admin: { description: 'e.g. AW-123456789 — found in Google Ads → Tools → Conversions.', placeholder: 'AW-' },
            },
            {
              name: 'gadsConversionLabel',
              type: 'text',
              label: 'Google Ads Purchase Conversion Label',
              admin: { description: 'The label string from your Purchase conversion action (e.g. "abc123XYZ").' },
            },
            {
              name: 'pinterestTagId',
              type: 'text',
              label: 'Pinterest Tag ID',
              admin: { description: 'Found in Pinterest Ads Manager → Conversions → Pinterest Tag.' },
            },
            {
              name: 'pinterestAccessToken',
              type: 'text',
              label: 'Pinterest Conversions API Access Token',
              admin: { description: 'App access token from Pinterest Developers — enables server-side conversion events.' },
            },
            {
              name: 'snapchatPixelId',
              type: 'text',
              label: 'Snapchat Pixel ID',
              admin: { description: 'Found in Snapchat Ads Manager → Events Manager → Pixel.' },
            },
          ],
        },
        {
          label: 'Social Profiles',
          fields: [
            {
              name: 'facebookUrl',
              type: 'text',
              label: 'Facebook URL',
              admin: { placeholder: 'https://facebook.com/yourpage' },
            },
            {
              name: 'instagramUrl',
              type: 'text',
              label: 'Instagram URL',
              admin: { placeholder: 'https://instagram.com/yourhandle' },
            },
            {
              name: 'twitterHandle',
              type: 'text',
              label: 'X / Twitter Handle',
              admin: { description: 'e.g. @yourbrand', placeholder: '@yourbrand' },
            },
            {
              name: 'tiktokUrl',
              type: 'text',
              label: 'TikTok URL',
              admin: { placeholder: 'https://tiktok.com/@yourhandle' },
            },
            {
              name: 'linkedinUrl',
              type: 'text',
              label: 'LinkedIn URL',
            },
          ],
        },
        {
          label: 'Robots & Indexing',
          fields: [
            {
              name: 'robotsTxtCustomRules',
              type: 'textarea',
              label: 'Custom robots.txt Rules',
              admin: {
                description: 'These lines are appended to the default robots.txt file.\n\nExample:\nDisallow: /private/\nAllow: /public/',
              },
            },
          ],
        },
        {
          label: 'Sitemap Controls',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'sitemapPages',
                  type: 'checkbox',
                  label: 'Pages Sitemap',
                  defaultValue: true,
                  admin: { description: 'Include published pages in /pages-sitemap.xml', width: '25%' },
                },
                {
                  name: 'sitemapPosts',
                  type: 'checkbox',
                  label: 'Posts Sitemap',
                  defaultValue: true,
                  admin: { description: 'Include published posts in /posts-sitemap.xml', width: '25%' },
                },

              ],
            },
            {
              name: 'sitemapChangeFrequency',
              type: 'select',
              label: 'Default Change Frequency',
              defaultValue: 'weekly',
              options: [
                { label: 'Always', value: 'always' },
                { label: 'Hourly', value: 'hourly' },
                { label: 'Daily', value: 'daily' },
                { label: 'Weekly', value: 'weekly' },
                { label: 'Monthly', value: 'monthly' },
                { label: 'Yearly', value: 'yearly' },
                { label: 'Never', value: 'never' },
              ],
              admin: {
                description: 'Hint to search engines about how often content changes. "Weekly" is a safe default for most sites.',
              },
            },
            {
              name: 'sitemapPriority',
              type: 'select',
              label: 'Default Priority',
              defaultValue: '0.7',
              options: [
                { label: '1.0 (Highest)', value: '1.0' },
                { label: '0.9', value: '0.9' },
                { label: '0.8', value: '0.8' },
                { label: '0.7 (Default)', value: '0.7' },
                { label: '0.6', value: '0.6' },
                { label: '0.5', value: '0.5' },
                { label: '0.3', value: '0.3' },
                { label: '0.1 (Lowest)', value: '0.1' },
              ],
              admin: {
                description: 'Priority relative to other pages on this site. 0.7 is a good default. Homepage is always 1.0.',
              },
            },
            {
              name: 'sitemapExcludePatterns',
              type: 'array',
              label: 'Exclude URL Patterns',
              admin: {
                description: 'URL path patterns to exclude from all sitemaps. e.g. /thank-you, /landing/',
              },
              fields: [
                {
                  name: 'pattern',
                  type: 'text',
                  required: true,
                  admin: { placeholder: '/thank-you' },
                },
              ],
            },
          ],
        },
        {
          label: 'Breadcrumbs',
          fields: [
            {
              name: 'breadcrumbsEnabled',
              type: 'checkbox',
              label: 'Enable Breadcrumbs',
              defaultValue: true,
              admin: {
                description: 'Show breadcrumb navigation on pages. Breadcrumbs help users navigate and improve SEO through structured data.',
              },
            },
            {
              name: 'breadcrumbSeparator',
              type: 'select',
              label: 'Separator Character',
              defaultValue: '/',
              options: [
                { label: '/ (slash)', value: '/' },
                { label: '› (chevron)', value: '›' },
                { label: '» (double chevron)', value: '»' },
                { label: '→ (arrow)', value: '→' },
                { label: '> (greater than)', value: '>' },
              ],
              admin: {
                description: 'Character displayed between breadcrumb items.',
                condition: (_, siblingData) => siblingData?.breadcrumbsEnabled,
              },
            },
            {
              name: 'breadcrumbHomeLabel',
              type: 'text',
              label: 'Home Label',
              defaultValue: 'Home',
              admin: {
                description: 'Text for the first breadcrumb item. Usually "Home".',
                condition: (_, siblingData) => siblingData?.breadcrumbsEnabled,
              },
            },
            {
              name: 'breadcrumbShowOnPages',
              type: 'group',
              label: 'Show Breadcrumbs On',
              admin: {
                condition: (_, siblingData) => siblingData?.breadcrumbsEnabled,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'pages',
                      type: 'checkbox',
                      label: 'Pages',
                      defaultValue: true,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'posts',
                      type: 'checkbox',
                      label: 'Blog Posts',
                      defaultValue: true,
                      admin: { width: '25%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'breadcrumbSchema',
              type: 'checkbox',
              label: 'Include BreadcrumbList Schema',
              defaultValue: true,
              admin: {
                description: 'Add BreadcrumbList structured data (schema.org JSON-LD) for search engine rich results.',
                condition: (_, siblingData) => siblingData?.breadcrumbsEnabled,
              },
            },
          ],
        },
        {
          label: 'Schema Settings',
          fields: [
            {
              name: 'businessType',
              type: 'select',
              label: 'Business Type',
              defaultValue: 'OnlineStore',
              options: [
                { label: 'Online Store', value: 'OnlineStore' },
                { label: 'Local Business', value: 'LocalBusiness' },
                { label: 'Organization', value: 'Organization' },
              ],
              admin: { description: 'Used in Organization structured data (schema.org @type).' },
            },
            {
              name: 'schemaLogo',
              type: 'upload',
              label: 'Schema Logo',
              relationTo: 'media',
              admin: { description: 'Used in structured data. Minimum 112×112px. Can differ from the visible site logo.' },
            },
            {
              name: 'foundingDate',
              type: 'text',
              label: 'Business Founding Date',
              admin: { placeholder: '2024', description: 'Year (or YYYY-MM-DD). Added to Organization schema.' },
            },
            {
              name: 'priceRange',
              type: 'text',
              label: 'Price Range',
              admin: { placeholder: '££', description: 'e.g. £, ££, £££ — displayed in Google Business and LocalBusiness schema.' },
            },
          ],
        },
        {
          label: 'Indexing Controls',
          fields: [
            {
              name: 'noindexPatterns',
              type: 'array',
              label: 'Noindex URL Patterns',
              admin: { description: 'URL path patterns to add noindex meta tag. Checked against the request pathname. e.g. /search, /cart, /account' },
              fields: [
                {
                  name: 'pattern',
                  type: 'text',
                  label: 'Pattern',
                  required: true,
                  admin: { placeholder: '/search' },
                },
              ],
            },
            {
              name: 'trailingSlash',
              type: 'checkbox',
              label: 'Enforce Trailing Slashes',
              defaultValue: false,
              admin: { description: 'Redirect all URLs to their trailing-slash equivalent.' },
            },
            {
              name: 'preferWww',
              type: 'checkbox',
              label: 'Prefer www prefix',
              defaultValue: false,
              admin: { description: 'Redirect non-www URLs to www (requires DNS setup).' },
            },

          ],
        },
        {
          label: 'LLMs.txt',
          fields: [
            {
              name: 'llmsTxtEnabled',
              type: 'checkbox',
              label: 'Enable LLMs.txt',
              defaultValue: true,
              admin: {
                description: 'Serve /llms.txt and /llms-full.txt files. These help AI assistants (ChatGPT, Claude, Perplexity) understand your site.',
              },
            },
            {
              name: 'llmsDescription',
              type: 'textarea',
              label: 'Site Description for LLMs',
              admin: {
                description: 'Override the default meta description used in llms.txt. Leave blank to use the Default Meta Description from the General tab.',
                condition: (_, siblingData) => siblingData?.llmsTxtEnabled,
                rows: 3,
              },
            },
            {
              name: 'llmsAdditionalSections',
              type: 'array',
              label: 'Additional Sections',
              admin: {
                description: 'Add custom sections to llms.txt (e.g. "Policies", "FAQs", "Services").',
                condition: (_, siblingData) => siblingData?.llmsTxtEnabled,
              },
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  label: 'Section Heading',
                  required: true,
                  admin: { placeholder: 'Services' },
                },
                {
                  name: 'content',
                  type: 'textarea',
                  label: 'Content',
                  required: true,
                  admin: {
                    description: 'Markdown format. Use "- [Label](url)" for links.',
                    rows: 5,
                    placeholder: '- [Web Design](/services/web-design)\n- [SEO](/services/seo)',
                  },
                },
              ],
            },
            {
              name: 'llmsExcludeCollections',
              type: 'group',
              label: 'Exclude from LLMs.txt',
              admin: {
                description: 'Choose which content types to hide from LLMs.txt.',
                condition: (_, siblingData) => siblingData?.llmsTxtEnabled,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'excludeProducts', type: 'checkbox', label: 'Hide Products', defaultValue: false, admin: { width: '25%' } },
                    { name: 'excludePosts', type: 'checkbox', label: 'Hide Blog Posts', defaultValue: false, admin: { width: '25%' } },
                    { name: 'excludeEvents', type: 'checkbox', label: 'Hide Events', defaultValue: false, admin: { width: '25%' } },
                    { name: 'excludeCategories', type: 'checkbox', label: 'Hide Categories', defaultValue: false, admin: { width: '25%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Schema Markup',
          fields: [
            {
              type: 'collapsible',
              label: 'Auto-Generated Schema Types',
              admin: {
                description: 'Control which schema.org structured data types are automatically generated.',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'schemaOrganization',
                      type: 'checkbox',
                      label: 'Organization / LocalBusiness',
                      defaultValue: true,
                      admin: { description: 'Site-wide. Uses Schema Settings tab data.', width: '50%' },
                    },
                    {
                      name: 'schemaWebsite',
                      type: 'checkbox',
                      label: 'WebSite + SearchAction',
                      defaultValue: true,
                      admin: { description: 'Enables sitelinks search box in Google.', width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'schemaProduct',
                      type: 'checkbox',
                      label: 'Product (on product pages)',
                      defaultValue: true,
                      admin: { description: 'Rich results with price, stock, reviews.', width: '50%' },
                    },
                    {
                      name: 'schemaArticle',
                      type: 'checkbox',
                      label: 'Article (on blog posts)',
                      defaultValue: true,
                      admin: { description: 'Rich results with author, date, image.', width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'schemaEvent',
                      type: 'checkbox',
                      label: 'Event (on event pages)',
                      defaultValue: true,
                      admin: { description: 'Rich results with date, location, tickets.', width: '50%' },
                    },
                    {
                      name: 'schemaFAQ',
                      type: 'checkbox',
                      label: 'FAQPage (on pages with FAQ blocks)',
                      defaultValue: true,
                      admin: { description: 'Rich results showing Q&A in search.', width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'schemaBreadcrumb',
                      type: 'checkbox',
                      label: 'BreadcrumbList',
                      defaultValue: true,
                      admin: { description: 'Breadcrumb trail in search results.', width: '50%' },
                    },
                    {
                      name: 'schemaWebPage',
                      type: 'checkbox',
                      label: 'WebPage (on all pages)',
                      defaultValue: false,
                      admin: { description: 'Basic WebPage schema on every page.', width: '50%' },
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Product Schema Enhancements',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'schemaProductIncludeReviews',
                  type: 'checkbox',
                  label: 'Include AggregateRating from Reviews',
                  defaultValue: true,
                  admin: { description: 'Shows star ratings in search results. Requires at least 1 approved review.' },
                },
                {
                  name: 'schemaProductIncludeBrand',
                  type: 'checkbox',
                  label: 'Include Brand',
                  defaultValue: true,
                },
                {
                  name: 'schemaProductBrandName',
                  type: 'text',
                  label: 'Brand Name for Products',
                  admin: {
                    description: 'Used in Product schema. Leave blank to use Site Title.',
                    placeholder: 'Your Brand',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Article Schema Enhancements',
              admin: { initCollapsed: true },
              fields: [
                {
                  name: 'schemaArticleType',
                  type: 'select',
                  label: 'Default Article Type',
                  defaultValue: 'Article',
                  options: [
                    { label: 'Article', value: 'Article' },
                    { label: 'NewsArticle', value: 'NewsArticle' },
                    { label: 'BlogPosting', value: 'BlogPosting' },
                  ],
                  admin: { description: 'Can be overridden per-post in the SEO tab.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Indexing API',
          fields: [
            {
              type: 'collapsible',
              label: 'Google Indexing API',
              admin: {
                description: 'Automatically notify Google when pages are published or updated. Requires a Google Cloud service account with Indexing API enabled.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'googleIndexingEnabled',
                  type: 'checkbox',
                  label: 'Enable Google Indexing API',
                  defaultValue: false,
                },
                {
                  name: 'googleIndexingServiceAccountEmail',
                  type: 'text',
                  label: 'Service Account Email',
                  admin: {
                    description: 'e.g. my-indexing@my-project.iam.gserviceaccount.com — must be added as an owner in Search Console.',
                    condition: (_, siblingData) => siblingData?.googleIndexingEnabled,
                  },
                },
                {
                  name: 'googleIndexingPrivateKey',
                  type: 'textarea',
                  label: 'Service Account Private Key',
                  admin: {
                    description: 'The full private key from the JSON key file (starts with -----BEGIN PRIVATE KEY-----). Stored encrypted in the database.',
                    condition: (_, siblingData) => siblingData?.googleIndexingEnabled,
                    rows: 4,
                  },
                },
                {
                  name: 'googleIndexingAutoSubmit',
                  type: 'group',
                  label: 'Auto-Submit On Publish',
                  admin: {
                    condition: (_, siblingData) => siblingData?.googleIndexingEnabled,
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'pages', type: 'checkbox', label: 'Pages', defaultValue: true, admin: { width: '25%' } },
                        { name: 'posts', type: 'checkbox', label: 'Posts', defaultValue: true, admin: { width: '25%' } },

                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'IndexNow (Bing, Yandex, DuckDuckGo)',
              admin: {
                description: 'Instantly notify Bing, Yandex, and DuckDuckGo when content changes. Free, no API limits.',
                initCollapsed: false,
              },
              fields: [
                {
                  name: 'indexNowEnabled',
                  type: 'checkbox',
                  label: 'Enable IndexNow',
                  defaultValue: false,
                },
                {
                  name: 'indexNowApiKey',
                  type: 'text',
                  label: 'IndexNow API Key',
                  admin: {
                    description: 'A unique key string (any UUID or random string). A verification file at /{key}.txt is auto-served via /api/indexnow-verify/{key}.',
                    condition: (_, siblingData) => siblingData?.indexNowEnabled,
                  },
                },
                {
                  name: 'indexNowAutoSubmit',
                  type: 'group',
                  label: 'Auto-Submit On Publish',
                  admin: {
                    condition: (_, siblingData) => siblingData?.indexNowEnabled,
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        { name: 'pages', type: 'checkbox', label: 'Pages', defaultValue: true, admin: { width: '25%' } },
                        { name: 'posts', type: 'checkbox', label: 'Posts', defaultValue: true, admin: { width: '25%' } },

                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [logGlobalChange],
  },
}
