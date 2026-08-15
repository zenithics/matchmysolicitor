import type { BannerBlock as BannerBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
} & BannerBlockProps

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  return (
    <section className={cn('sp-32-24', className)}>
      <div className="container-inner">
        <div
          className={cn('rounded-[10px] border p-6', {
            'bg-[#E9F6F4] border-[#C6E7E2] text-[#0F5D55] [&_strong]:text-[#0A4740]':
              style === 'info',
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
