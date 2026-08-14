import React from 'react'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import type { HeroSplitBlock as HeroSplitBlockProps } from '@/payload-types'

export const HeroSplitBlock: React.FC<HeroSplitBlockProps> = ({
  badgeText,
  headline,
  subheadline,
  links,
  image,
  imagePosition = 'right',
  theme = 'light',
}) => {
  const isDark = theme === 'dark'
  const isImageLeft = imagePosition === 'left'

  return (
    <section
      className={`relative overflow-hidden min-h-[85vh] flex items-center ${
        isDark ? 'bg-primary text-primary-foreground' : 'bg-secondary'
      }`}
      data-theme={isDark ? 'dark' : undefined}
    >
      <div
        className={`container grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch w-full min-h-[85vh] ${
          isImageLeft ? 'lg:[&>*:first-child]:order-2' : ''
        }`}
      >
        {/* Text side */}
        <div className="flex flex-col justify-center py-20 lg:py-24 pr-0 lg:pr-12 z-10">
          {badgeText && (
            <span className="inline-block mb-6 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase border border-accent text-accent w-fit">
              {badgeText}
            </span>
          )}

          <h1
            className={`text-4xl md:text-5xl lg:text-6xl font-serif leading-[1.1] tracking-tight mb-6 ${
              isDark ? 'text-primary-foreground' : 'text-foreground'
            }`}
          >
            {headline}
          </h1>

          {subheadline && (
            <p
              className={`text-lg leading-relaxed mb-10 max-w-md ${
                isDark ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}
            >
              {subheadline}
            </p>
          )}

          {Array.isArray(links) && links.length > 0 && (
            <div className="flex flex-wrap gap-4">
              {links.map(({ link }, i) => (
                <CMSLink
                  key={i}
                  {...link}
                  className={
                    i === 0
                      ? 'inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:bg-primary/90 transition-colors'
                      : 'inline-flex items-center justify-center px-8 py-3 rounded-full border border-foreground/30 text-sm font-semibold tracking-wide hover:bg-foreground/5 transition-colors'
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* Image side */}
        <div
          className={`relative min-h-[50vh] lg:min-h-full ${isImageLeft ? 'lg:-ml-8' : 'lg:-mr-8'}`}
        >
          {image && typeof image === 'object' && (
            <Media
              fill
              imgClassName="object-cover object-center"
              priority
              resource={image}
            />
          )}
          {/* Subtle gradient fade on the text side */}
          <div
            className={`absolute inset-y-0 w-24 from-secondary to-transparent hidden lg:block ${
              isImageLeft
                ? 'right-0 bg-gradient-to-l'
                : 'left-0 bg-gradient-to-r'
            } ${isDark ? '!from-primary' : ''}`}
          />
        </div>
      </div>
    </section>
  )
}
