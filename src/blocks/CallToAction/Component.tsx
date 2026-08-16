import React from 'react'

import type { CallToActionBlock as CTABlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { CMSLink } from '@/components/Link'

type Props = CTABlockProps & { tone?: 'dark' | 'darkCard' | 'light' | null }

export const CallToActionBlock: React.FC<Props> = ({ links, richText, tone }) => {
  const isLight = tone === 'light'
  const isDarkCard = tone === 'darkCard'
  const isBoxed = isLight || isDarkCard

  return (
    <section className={isBoxed ? 'sp-32-24 bg-card' : 'sp-64 bg-card-foreground text-white'}>
      <div
        className={
          isLight
            ? 'container-inner flex flex-col gap-6 rounded-[10px] border border-[#E4E7EC] bg-(--mms-surface) p-7 md:flex-row md:items-center md:justify-between'
            : isDarkCard
              ? 'container-inner flex flex-col items-start gap-3.5 rounded-[10px] bg-card-foreground p-8 text-white'
              : 'container-inner flex flex-col gap-8 md:flex-row md:items-center md:justify-between'
        }
      >
        <div className="max-w-[48rem]">
          {richText && (
            <RichText
              className={
                isDarkCard
                  ? 'mb-0 [&_h2]:text-[1.35rem] [&_h2]:text-white [&_h2]:mb-0 [&_h3]:text-white [&_p]:mt-0 [&_p]:text-[15px] [&_p]:text-(--mms-on-dark-muted)'
                  : isLight
                    ? 'mb-0 [&_h2]:text-[1.15rem] [&_h2]:mb-1 [&_h3]:text-[1.15rem] [&_p]:mt-1 [&_p]:text-sm [&_p]:text-(--mms-muted-light)'
                    : 'mb-0 [&_h1]:text-white [&_h2]:text-white [&_h2]:mb-2 [&_h3]:text-white [&_p]:mt-2 [&_p]:text-base [&_p]:text-(--mms-on-dark-muted)'
              }
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
