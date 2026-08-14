import React from 'react'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'
import type { TextMediaBlock as TextMediaBlockProps } from '@/payload-types'

/**
 * Prose beside an image, with optional CTAs.
 * Not expressible with the stock library: `content` has no image, `mediaBlock`
 * has no rich text, and `heroSplit` carries hero styling and no links.
 */
export const TextMediaBlock: React.FC<TextMediaBlockProps> = ({
  heading,
  richText,
  links,
  image,
  imagePosition = 'right',
  theme = 'light',
}) => {
  const isDark = theme === 'dark'
  const isImageLeft = imagePosition === 'left'

  return (
    <section
      className={
        isDark ? 'py-20 bg-primary text-primary-foreground' : theme === 'muted' ? 'py-20 bg-secondary' : 'py-20 bg-background'
      }
      data-theme={isDark ? 'dark' : undefined}
    >
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div className={isImageLeft ? 'md:order-2' : undefined}>
          {heading && <h2 className="text-3xl md:text-4xl tracking-tight mb-5">{heading}</h2>}
          {richText && <RichText data={richText} enableGutter={false} className="mb-8" />}
          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => (
                <CMSLink key={i} {...link} />
              ))}
            </div>
          )}
        </div>

        {image && (
          <div className={`${isImageLeft ? 'md:order-1' : ''} relative rounded-xl overflow-hidden`}>
            <Media resource={image} imgClassName="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}
