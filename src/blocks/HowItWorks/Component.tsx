import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import type { HowItWorksBlock as HowItWorksBlockProps } from '@/payload-types'

// Same dual-presentation problem as Banner/FAQ: this design renders the block
// two ways — a 3/4-column grid with oversized numerals (homepage) and a
// vertical timeline with numbered circles joined by a connector line
// (how-it-works.dc.html) — and nothing in the fields tells them apart, so the
// importer stashes it as a sentinel in `subheading` (empty in both real
// instances otherwise).
const TIMELINE_SENTINEL = '__timeline__'

export const HowItWorksBlock: React.FC<HowItWorksBlockProps> = ({
  heading,
  subheading,
  steps,
  ctaText,
  ctaLink,
}) => {
  if (!steps || steps.length === 0) return null

  const isTimeline = subheading === TIMELINE_SENTINEL
  const visibleSubheading = isTimeline ? undefined : subheading

  return (
    <section
      className={`sp-80 border-t border-b border-[#E4E7EC] ${
        isTimeline ? 'bg-(--mms-surface)' : 'bg-card'
      }`}
    >
      <div className={isTimeline ? 'container-inner max-w-[900px]' : 'container-inner'}>
        {(heading || visibleSubheading) && (
          <div className={isTimeline ? 'mb-12' : 'text-center max-w-2xl mx-auto mb-12'}>
            {heading && <h2 className="mb-4">{heading}</h2>}
            {visibleSubheading && (
              <p className="text-muted-foreground text-lg leading-relaxed">{visibleSubheading}</p>
            )}
          </div>
        )}

        {isTimeline ? (
          <div className="flex flex-col">
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1
              return (
                <div key={step.id || index} className="grid grid-cols-[64px_1fr] gap-8">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 font-bold text-[clamp(21px,3.2vw,26px)] text-white ${
                        isLast ? 'bg-primary' : 'bg-card-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    {!isLast && <div className="w-[2px] flex-1 bg-[#C9D4F4] my-3" />}
                  </div>
                  <div className={`flex flex-col gap-3 ${isLast ? '' : 'pb-14'}`}>
                    <h2>{step.title}</h2>
                    <p className="leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-8 ${
              steps.length === 3
                ? 'md:grid-cols-3'
                : steps.length === 4
                  ? 'md:grid-cols-2 lg:grid-cols-4'
                  : 'md:grid-cols-2'
            }`}
          >
            {steps.map((step, index) => (
              <div key={step.id || index} className="flex flex-col gap-3.5">
                {step.icon && typeof step.icon === 'object' ? (
                  <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-muted">
                    <Media resource={step.icon} imgClassName="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="font-bold text-accent text-[clamp(28px,5.5vw,44px)] leading-none">
                    {index + 1}
                  </div>
                )}

                <h3>{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        )}

        {ctaText && ctaLink && (
          <div className="mt-12 text-center">
            <Link href={ctaLink} className="font-bold text-primary hover:text-(--mms-primary-hover)">
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
