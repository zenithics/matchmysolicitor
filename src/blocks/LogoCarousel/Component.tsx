import React from 'react'

import type { LogoCarouselBlock as LogoCarouselBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'

export const LogoCarouselBlock: React.FC<LogoCarouselBlockProps> = ({ heading, logos }) => {
  return (
    <div className="container">
      {heading && (
        <p className="text-center text-sm uppercase tracking-wider text-muted-foreground mb-8">
          {heading}
        </p>
      )}
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
        {logos?.map((item, i) => {
          const logoContent = item.logo && typeof item.logo === 'object' ? (
            <div className="h-8 md:h-10 w-auto grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <Media
                resource={item.logo}
                imgClassName="h-full w-auto object-contain"
              />
            </div>
          ) : null

          if (item.url) {
            return (
              <a
                key={i}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.companyName}
              >
                {logoContent}
              </a>
            )
          }

          return <div key={i}>{logoContent}</div>
        })}
      </div>
    </div>
  )
}
