import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

export const CallToActionBlock: React.FC<CTABlockProps> = ({ links, richText }) => {
  return (
    <section className="sp-64 bg-card-foreground text-white">
      <div className="container-inner flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-[48rem]">
          {richText && (
            <RichText
              className="mb-0 [&_h1]:text-white [&_h2]:text-white [&_h2]:mb-2 [&_h3]:text-white [&_p]:mt-2 [&_p]:text-base [&_p]:text-(--mms-on-dark-muted)"
              data={richText}
              enableGutter={false}
              enableProse={false}
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {(links || []).map(({ link }, i) => {
            return <CMSLink key={i} size="lg" {...link} />
          })}
        </div>
      </div>
    </section>
  )
}
