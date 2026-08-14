import React from 'react'
import Link from 'next/link'
import type { ImageGalleryBlock as ImageGalleryBlockProps } from '@/payload-types'

export const ImageGalleryBlock: React.FC<ImageGalleryBlockProps> = ({
  heading,
  subheading,
  layout = 'masonry',
  images,
  ctaText,
  ctaLink,
}) => {
  if (!images || images.length === 0) return null

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        {/* Header */}
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4">{heading}</h2>
            )}
            {subheading && (
              <p className="text-muted-foreground text-lg leading-relaxed">{subheading}</p>
            )}
          </div>
        )}

        {/* Gallery */}
        {layout === 'masonry' && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
            {images.map((item, index) => (
              <GalleryItem key={item.id || index} item={item as unknown as GalleryImageItem} />
            ))}
          </div>
        )}

        {layout === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((item, index) => (
              <GalleryItem key={item.id || index} item={item as unknown as GalleryImageItem} square />
            ))}
          </div>
        )}

        {layout === 'scroll' && (
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-none">
            {images.map((item, index) => (
              <div key={item.id || index} className="flex-shrink-0 w-64 snap-start">
                <GalleryItem item={item as unknown as GalleryImageItem} square />
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        {ctaText && ctaLink && (
          <div className="mt-12 text-center">
            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:bg-primary/90 transition-colors"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

type GalleryImageItem = {
  id?: string | null
  image: number | { url?: string | null; alt?: string | null; [key: string]: unknown }
  label?: string | null
  productLink?: string | null
}

const GalleryItem: React.FC<{ item: GalleryImageItem; square?: boolean }> = ({
  item,
  square = false,
}) => {
  const imageObj = typeof item.image === 'object' ? item.image : null
  if (!imageObj?.url) return null

  const inner = (
    <div
      className={`relative overflow-hidden rounded-xl bg-muted group cursor-pointer ${
        square ? 'aspect-square' : 'break-inside-avoid mb-3'
      }`}
    >
      <img
        src={imageObj.url}
        alt={item.label || imageObj.alt || 'Gallery image'}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {item.label && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-xs font-medium tracking-wide">{item.label}</p>
        </div>
      )}
    </div>
  )

  if (item.productLink) {
    return <Link href={item.productLink}>{inner}</Link>
  }

  return inner
}
