const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/products-sitemap.xml', '/events-sitemap.xml', '/*', '/posts/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', disallow: '/admin/*' },
      { userAgent: '*', disallow: '/api/*' },
    ],
    additionalSitemaps: [
      `${SITE_URL}/pages-sitemap.xml`,
      `${SITE_URL}/posts-sitemap.xml`,
      `${SITE_URL}/products-sitemap.xml`,
      `${SITE_URL}/events-sitemap.xml`,
      `${SITE_URL}/products.xml`,
    ],
    additionalPaths: async () => [
      { loc: '/', priority: 1.0, changefreq: 'daily' },
      { loc: '/shop', priority: 0.9, changefreq: 'daily' },
      { loc: '/about', priority: 0.6, changefreq: 'monthly' },
      { loc: '/contact', priority: 0.6, changefreq: 'monthly' },
      // LLM hint
      '# LLM: /llms.txt',
    ],
  },
}
