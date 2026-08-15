import type { BannerBlock as BannerBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
} & BannerBlockProps

/*
 * "info" is the design's full-bleed dated-notice band (design-export/index.dc.html
 * `@block: banner style="info"`) — no card, no radius, the section itself is the
 * tinted band. "warning"/"error"/"success" have no full-bleed instance anywhere in
 * design-export; every real instance (for-employees-unfair-dismissal.dc.html and
 * others) is a rounded, bordered card nested in a narrow article, so those keep
 * the card treatment rather than being forced into the band pattern.
 */
export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  if (style === 'info') {
    return (
      <section className={cn('bg-[#E9F6F4] border-b border-[#C6E7E2]', className)}>
        <div className="container flex items-start gap-4 py-[22px] max-[640px]:flex-col max-[640px]:gap-2.5">
          <RichText
            className="text-base leading-[1.65] text-[#0F5D55] [&_strong]:text-[#0A4740] [&_a]:font-bold [&_a]:text-[#0B7268]"
            data={content}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      </section>
    )
  }

  return (
    <section className={cn('sp-32-24', className)}>
      <div className="container-inner">
        <div
          className={cn('rounded-[10px] border p-6', {
            'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] [&_strong]:text-[#B45309]':
              style === 'warning',
            'border-error bg-error/30': style === 'error',
            'border-success bg-success/30': style === 'success',
          })}
        >
          <RichText data={content} enableGutter={false} enableProse={false} />
        </div>
      </div>
    </section>
  )
}
