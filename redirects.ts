import type { NextConfig } from 'next'

export const redirects: NextConfig['redirects'] = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header' as const,
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  // Footer/nav link paths do not match the CMS page slugs. These pages exist as
  // /privacy-policy, /terms-of-use, /cookie-policy, /complaints and
  // /guides-category-*, so map the linked paths onto them instead of 404ing.
  const legalRedirects = [
    'privacy-policy',
    'terms-of-use',
    'cookie-policy',
    'complaints',
  ].map((slug) => ({
    source: `/legal/${slug}`,
    destination: `/${slug}`,
    permanent: true,
  }))

  const guideCategoryRedirects = [
    'dismissal',
    'exit-negotiations',
    'tribunal-process',
    'discrimination',
  ].map((slug) => ({
    source: `/guides/category/${slug}`,
    destination: `/guides-category-${slug}`,
    permanent: true,
  }))

  return [internetExplorerRedirect, ...legalRedirects, ...guideCategoryRedirects]
}
