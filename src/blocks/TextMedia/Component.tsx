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
        isDark
          ? 'sp-72 bg-card-foreground text-primary-foreground'
          : theme === 'muted'
            ? 'sp-72 bg-muted'
            : 'sp-72 bg-card border-t border-b border-[#E4E7EC]'
      }
      data-theme={isDark ? 'dark' : undefined}
    >
      <div
        className={
          image
            ? 'container-inner grid grid-cols-1 md:grid-cols-2 gap-16 items-center'
            : // Without an image the two-column grid leaves half the band empty,
              // so fall back to a single readable column.
              'container-inner max-w-[820px]'
        }
      >
        <div className={image && isImageLeft ? 'md:order-2' : undefined}>
          {heading && (
            <h2 className={isDark ? 'mb-5 text-primary-foreground' : 'mb-5'}>{heading}</h2>
          )}
          {richText && (
            <RichText
              data={richText}
              enableGutter={false}
              className={isDark ? 'mb-8 text-(--mms-on-dark-muted)' : 'mb-8'}
            />
          )}
          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => (
                <CMSLink key={i} {...link} />
              ))}
            </div>
          )}
        </div>

        {image && (
          <div className={`${isImageLeft ? 'md:order-1' : ''} relative rounded-[10px] overflow-hidden`}>
            <Media resource={image} imgClassName="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </section>
  )
}
