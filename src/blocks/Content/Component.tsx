import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const isProseColumn = columns?.length === 1 && columns[0]?.size === 'full'

  return (
    <section className="sp-64">
      <div className="container-inner">
        <div
          className={cn('grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16', {
            // Design article column is 820px (see design-export article max-width), not 640.
            'max-w-[820px] mx-auto': isProseColumn,
          })}
        >
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { enableLink, link, richText, size } = col

              return (
                <div
                  className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                    'md:col-span-2': size !== 'full',
                  })}
                  key={index}
                >
                  {richText && <RichText data={richText} enableGutter={false} />}

                  {enableLink && <CMSLink {...link} />}
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}
