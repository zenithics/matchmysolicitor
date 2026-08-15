import React from 'react'
import Link from 'next/link'
import { Media } from '@/components/Media'
import type { HowItWorksBlock as HowItWorksBlockProps } from '@/payload-types'

export const HowItWorksBlock: React.FC<HowItWorksBlockProps> = ({
  heading,
  subheading,
  steps,
  ctaText,
  ctaLink,
}) => {
  if (!steps || steps.length === 0) return null

  return (
    <section className="sp-80 bg-card border-t border-b border-[#E4E7EC]">
      <div className="container-inner">
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-12">
            {heading && <h2 className="mb-4">{heading}</h2>}
            {subheading && <p className="text-muted-foreground text-lg leading-relaxed">{subheading}</p>}
          </div>
        )}

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
