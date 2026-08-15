import React from 'react'
import Link from 'next/link'

import type { FeaturesBlock as FeaturesBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { ArrowRight, stripTrailingArrow } from '@/components/icons/ArrowRight'

// Some cards carry a short inline badge next to the title (e.g. "URGENT" on
// for-employers.dc.html's interim-relief card). There's no dedicated field for
// it, so the importer folds it into the title as a trailing "[BADGE]" suffix
// — split it back out here rather than printing the brackets literally.
function splitTitleBadge(title?: string | null): { title: string; badge: string | null } {
  const match = title?.match(/^(.*)\s\[([A-Z][A-Z\s]{1,14})\]$/)
  return match ? { title: match[1], badge: match[2] } : { title: title || '', badge: null }
}

export const FeaturesBlock: React.FC<FeaturesBlockProps> = ({
  heading,
  description,
  features,
}) => {
  return (
    <section className="sp-72 bg-card border-t border-b border-[#E4E7EC]">
      <div className="container-inner">
        {(heading || description) && (
          <div className="text-center mb-10">
            {heading && <h2 className="mb-4">{heading}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
          {features?.map((feature, i) => {
            const { title, badge } = splitTitleBadge(feature.title)
            return (
            // The design uses this block two ways — a whole-tile link (the
            // city cards on employment-solicitors.dc.html) and a plain card
            // with only a small "More about X →" line as the real link (every
            // service-detail card) — and nothing in the data tells them apart.
            // Only the small link is real here: it's the safer default (a
            // card that LOOKS static shouldn't secretly be one giant link),
            // and it's still a working link either way, just a smaller target
            // for the city-card case.
            <div
              key={i}
              className="flex flex-col gap-4 p-[28px] rounded-[10px] border border-border bg-muted"
            >
              {feature.image && typeof feature.image === 'object' ? (
                <div className="w-full aspect-video rounded-md overflow-hidden mb-2">
                  <Media resource={feature.image} imgClassName="w-full h-full object-cover" />
                </div>
              ) : feature.icon ? (
                <span className="text-3xl">{feature.icon}</span>
              ) : null}
              <div className="flex items-center gap-2.5">
                <h3 className="text-[18px] font-bold">{title}</h3>
                {badge && (
                  <span className="rounded bg-[#E9F6F4] px-[9px] py-[3px] text-xs font-bold tracking-[0.04em] text-[#0B7268]">
                    {badge}
                  </span>
                )}
              </div>
              {feature.description && (
                <RichText className="mb-0 text-muted-foreground text-sm" data={feature.description} enableGutter={false} />
              )}
              {feature.linkUrl && feature.linkLabel && (
                <Link
                  href={feature.linkUrl}
                  className="group mt-auto pt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary no-underline hover:text-(--mms-primary-hover)"
                >
                  {stripTrailingArrow(feature.linkLabel)}
                  <ArrowRight />
                </Link>
              )}
            </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
