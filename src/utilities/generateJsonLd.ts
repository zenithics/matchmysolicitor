import { guideFallbackImagePath } from '@/utilities/guideFallbackImages'
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
      : `${siteUrl}/logo-schema.png`

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
        urlTemplate: `${siteUrl}${seo.searchPathTemplate || '/search?q={search_term_string}'}`,
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

  // Same precedence the guide template renders with: hero image, then the
  // SEO/social image, then the site-wide default OG image.
  const imageUrl =
    post.heroImage && typeof post.heroImage === 'object'
      ? post.heroImage.url
      : post.meta?.image && typeof post.meta.image === 'object'
        ? post.meta.image.url
        : null

  const authorName =
    post.authors?.[0] && typeof post.authors[0] === 'object'
      ? post.authors[0].name || post.authors[0].email
      : null

  const ogFallback =
    seo.defaultOgImage && typeof seo.defaultOgImage === 'object' && seo.defaultOgImage.url
      ? seo.defaultOgImage.url
      : null

  // Bundled guide illustration sits between the CMS images and the generic
  // site-wide OG image, matching what the template actually renders.
  const image = imageUrl || guideFallbackImagePath(post.slug) || ogFallback

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(image && { image: [image.startsWith('http') ? image : `${siteUrl}${image}`] }),
    author: authorName
      ? { '@type': 'Person', name: authorName }
      : { '@type': 'Organization', name: seo.siteTitle || 'Your Brand', url: siteUrl },
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    publisher: {
      '@type': 'Organization',
      name: seo.siteTitle || 'Your Brand',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo-schema.png` },
    },
  }
}

/**
 * Answers authored in Payload's rich text editor arrive as a Lexical node tree,
 * not a string. JSON.stringify-ing that object into `acceptedAnswer.text`
 * produced structurally valid JSON that Google silently discarded, so FAQ
 * markup never registered. Flatten any node tree (or React-ish object) to text.
 */
export function richTextToPlainText(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()
  if (Array.isArray(value)) return value.map(richTextToPlainText).filter(Boolean).join(' ').trim()
  if (typeof value === 'object') {
    const node = value as Record<string, any>
    if (node.root) return richTextToPlainText(node.root)
    const parts: string[] = []
    if (typeof node.text === 'string') parts.push(node.text)
    if (Array.isArray(node.children)) parts.push(richTextToPlainText(node.children))
    const joined = parts.join(' ').replace(/\s+/g, ' ').trim()
    // block-level nodes should not run into the next block
    return node.type === 'paragraph' || node.type === 'root' ? joined : joined
  }
  return String(value)
}

export function faqSchema(items: { question: unknown; answer: unknown }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
      .map((item) => ({
        question: richTextToPlainText(item.question),
        answer: richTextToPlainText(item.answer),
      }))
      .filter((item) => item.question && item.answer)
      .map((item) => ({
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
