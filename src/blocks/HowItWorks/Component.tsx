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
    <section className="py-20 bg-background">
      <div className="container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          {heading && (
            <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4">{heading}</h2>
          )}
          {subheading && <p className="text-muted-foreground text-lg leading-relaxed">{subheading}</p>}
        </div>

        {/* Steps */}
        <div
          className={`grid grid-cols-1 gap-10 ${
            steps.length === 3
              ? 'md:grid-cols-3'
              : steps.length === 4
                ? 'md:grid-cols-2 lg:grid-cols-4'
                : 'md:grid-cols-2'
          }`}
        >
          {steps.map((step, index) => (
            <div key={step.id || index} className="flex flex-col items-center text-center group">
              {/* Step number / icon */}
              <div className="relative mb-6">
                {step.icon && typeof step.icon === 'object' ? (
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                    <Media resource={step.icon} imgClassName="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-secondary border-2 border-accent flex items-center justify-center">
                    <span className="font-serif text-2xl text-primary font-medium">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
                {/* Connector line (not on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-border -translate-y-px ml-4" />
                )}
              </div>

              <h3 className="text-lg font-semibold mb-3 tracking-wide">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        {ctaText && ctaLink && (
          <div className="mt-14 text-center">
            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold tracking-wide hover:bg-primary/90 transition-colors"
            >
              {ctaText}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
