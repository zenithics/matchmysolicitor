import { getServerSideURL } from './getURL'

async function getSEOGlobals() {
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    // shop-settings only exists when the ecommerce add-on is installed, so it is
    // fetched defensively: a content site must still get its organisation schema.
    const [seo, shop] = await Promise.all([
      payload.findGlobal({ slug: 'seo-settings' }),
      payload
        .findGlobal({ slug: 'shop-settings' as 'seo-settings' })
        .catch(() => ({}) as Record<string, unknown>),
    ])
    return { seo: seo as any, shop: shop as any }
  } catch {
    return { seo: {} as any, shop: {} as any }
  }
}

export async function organizationSchema() {
  const { seo } = await getSEOGlobals()
  const siteUrl = getServerSideURL()

  const sameAs = [
    seo.facebookUrl,
    seo.instagramUrl,
    seo.tiktokUrl,
    seo.linkedinUrl,
    seo.twitterHandle ? `https://x.com/${seo.twitterHandle.replace('@', '')}` : null,
  ].filter(Boolean)

  const schemaLogoUrl =
    seo.schemaLogo && typeof seo.schemaLogo === 'object' && seo.schemaLogo.url
      ? seo.schemaLogo.url.startsWith('http') ? seo.schemaLogo.url : `${siteUrl}${seo.schemaLogo.url}`
      : `${siteUrl}/favicon.svg`

  return {
    '@context': 'https://schema.org',
    '@type': seo.businessType || 'Organization',
    name: seo.siteTitle || 'Your Brand',
    url: siteUrl,
    logo: schemaLogoUrl,
    ...(seo.foundingDate && { foundingDate: seo.foundingDate }),
    ...(seo.priceRange && { priceRange: seo.priceRange }),
    ...(sameAs.length > 0 && { sameAs }),
  }
}

export async function websiteSchema() {
  const { seo } = await getSEOGlobals()
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seo.siteTitle || 'Your Brand',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/shop?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export async function productSchema(product: any) {
  const { seo, shop } = await getSEOGlobals()
  const siteUrl = getServerSideURL()
  const currency = (shop.currency || 'gbp').toUpperCase()

  const imageUrl =
    product.images?.[0] && typeof product.images[0] === 'object'
      ? product.images[0].url || product.images[0].sizes?.card?.url
      : null

  const inStock = product.trackStock
    ? (product.stock || 0) > 0
    : product._status === 'published'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.shortDescription || product.description,
    ...(product.sku && { sku: product.sku }),
    brand: {
      '@type': 'Brand',
      name: seo.siteTitle || 'Your Brand',
    },
    ...(imageUrl && { image: [`${siteUrl}${imageUrl}`] }),
    offers: {
      '@type': 'Offer',
      price: ((product.price || 0) / 100).toFixed(2),
      priceCurrency: currency,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/shop/${product.slug}`,
    },
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  const siteUrl = getServerSideURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`,
    })),
  }
}

export async function articleSchema(post: any) {
  const { seo } = await getSEOGlobals()
  const siteUrl = getServerSideURL()

  const imageUrl =
    post.heroImage && typeof post.heroImage === 'object'
      ? post.heroImage.url
      : null

  const authorName =
    post.authors?.[0] && typeof post.authors[0] === 'object'
      ? post.authors[0].name || post.authors[0].email
      : 'Your Brand'

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(imageUrl && { image: [`${siteUrl}${imageUrl}`] }),
    author: {
      '@type': 'Person',
      name: authorName,
    },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: seo.siteTitle || 'Your Brand',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/favicon.svg` },
    },
  }
}

export function faqSchema(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

export function eventSchema(event: any) {
  const siteUrl = getServerSideURL()

  const imageUrl =
    event.image && typeof event.image === 'object' ? event.image.url : null

  const ticketTypes = event.ticketTypes || []
  const lowestPrice = ticketTypes.reduce(
    (min: number, t: any) => (t.price < min ? t.price : min),
    ticketTypes[0]?.price || 0,
  )

  const currency = 'GBP'

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    startDate: event.startDate,
    ...(event.endDate && { endDate: event.endDate }),
    ...(imageUrl && { image: [`${siteUrl}${imageUrl}`] }),
    description: event.description,
    location: event.location
      ? {
          '@type': 'Place',
          name: typeof event.location === 'string' ? event.location : event.location.name,
        }
      : undefined,
    ...(ticketTypes.length > 0 && {
      offers: ticketTypes.map((t: any) => ({
        '@type': 'Offer',
        name: t.name,
        price: ((t.price || 0) / 100).toFixed(2),
        priceCurrency: currency,
        availability: (t.capacity || 0) - (t.sold || 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
        url: `${siteUrl}/events/${event.slug}`,
      })),
    }),
  }
}
