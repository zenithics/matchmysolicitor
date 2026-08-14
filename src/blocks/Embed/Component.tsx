import React from 'react'
import type { EmbedBlock as EmbedBlockProps } from '@/payload-types'

const widthClasses: Record<string, string> = {
  small: 'max-w-screen-sm',
  medium: 'max-w-screen-md',
  large: 'max-w-screen-lg',
  full: 'max-w-none',
}

export const EmbedBlock: React.FC<EmbedBlockProps> = ({
  heading,
  embedURL,
  height = 500,
  maxWidth = 'large',
  showBorder,
  caption,
}) => {
  if (!embedURL) return null

  return (
    <section className="py-16 bg-background">
      <div className="container">
        {heading && (
          <h2 className="text-3xl font-serif tracking-tight text-center mb-8">{heading}</h2>
        )}
        <div className={`mx-auto ${widthClasses[maxWidth ?? 'large']}`}>
          <iframe
            src={embedURL}
            title={heading || 'Embedded content'}
            style={{ height: `${height}px` }}
            className={`w-full rounded-xl bg-muted ${showBorder ? 'border border-border' : 'border-0'}`}
            loading="lazy"
            allow="payment; clipboard-write"
          />
          {caption && (
            <p className="text-sm text-muted-foreground text-center mt-3">{caption}</p>
          )}
        </div>
      </div>
    </section>
  )
}
