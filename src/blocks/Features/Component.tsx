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

// Card lists in the design are `list-style:none` with a literal "·" glyph in
// the copy, so the browser's own disc marker has to be suppressed or every
// bullet reads "• · Tribunal claim defence".
const CARD_RICHTEXT = '[&_ul]:list-none [&_ul]:pl-0 [&_ul]:m-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2.5 [&_li]:m-0'

export const FeaturesBlock: React.FC<FeaturesBlockProps> = ({
  heading,
  description,
  features,
}) => {
  const count = features?.length || 0
  // There is no `columns` field on this block (adding one needs a migration),
  // but the design's column count is a pure function of how many cards the
  // section has: 2 = the two-up split panels, 4 = the four short trust cards,
  // anything else (the 6 service cards) = two across. The importer's own
  // `columns` value is dropped by Payload for the same reason, so deriving it
  // here is what actually reaches the page.
  const grid = count === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2'

  // index.dc.html's "Two sides of every dispute" pair: a dark ink panel and a
  // white panel, each with an uppercase eyebrow (the card title), an h3 lead,
  // an unmarked list and a solid button — not the standard bordered card.
  if (count === 2) {
    return (
      <section className="sp-72 bg-(--mms-surface) border-t border-b border-[#E4E7EC]">
        <div className="container-inner">
          {(heading || description) && (
            <div className="text-center mb-10">
              {heading && <h2 className="mb-4">{heading}</h2>}
              {description && (
                <p className="text-muted-foreground max-w-[62ch] mx-auto">{description}</p>
              )}
            </div>
          )}
          <div className="grid gap-7 md:grid-cols-2">
            {features?.map((feature, i) => {
              const dark = i === 0
              return (
                <div
                  key={i}
                  className={`flex flex-col gap-[18px] p-10 rounded-[10px] ${
                    dark ? 'bg-[#1A1F26] text-white' : 'bg-white border border-[#E4E7EC]'
                  }`}
                >
                  <div
                    className={`text-[13px] font-bold uppercase tracking-[0.12em] ${
                      dark ? 'text-(--mms-accent)' : 'text-primary'
                    }`}
                  >
                    {feature.title}
                  </div>
                  {feature.description && (
                    <RichText
                      className={`mb-0 ${CARD_RICHTEXT} [&_h3]:text-[clamp(21px,3.2vw,26px)] [&_h3]:font-bold [&_h3]:m-0 ${
                        dark
                          ? '[&_h3]:text-white [&_li]:text-[#B9C1CC]'
                          : '[&_h3]:text-[#1A1F26] [&_li]:text-muted-foreground'
                      }`}
                      data={feature.description}
                      enableGutter={false}
                      enableProse={false}
                    />
                  )}
                  {feature.linkUrl && feature.linkLabel && (
                    <Link
                      href={feature.linkUrl}
                      className={`group mt-auto self-start inline-flex items-center gap-1.5 rounded-md px-[22px] py-3.5 text-base font-bold text-white no-underline ${
                        dark ? 'bg-primary hover:bg-(--mms-primary-hover)' : 'bg-[#1A1F26] hover:bg-[#2A313B]'
                      }`}
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

  return (
    <section className="sp-72 bg-card border-t border-b border-[#E4E7EC]">
      <div className="container-inner">
        {(heading || description) && (
          <div className="text-center mb-10">
            {heading && <h2 className="mb-4">{heading}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className={`grid grid-cols-1 gap-6 ${grid}`}>
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
                <RichText
                  className={`mb-0 text-muted-foreground text-sm ${CARD_RICHTEXT}`}
                  data={feature.description}
                  enableGutter={false}
                />
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
