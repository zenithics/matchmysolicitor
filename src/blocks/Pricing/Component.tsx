import React from 'react'

import type { PricingBlock as PricingBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'

export const PricingBlock: React.FC<PricingBlockProps> = ({ heading, description, plans }) => {
  return (
    <section className="sp-72 bg-card border-t border-b border-[#E4E7EC]">
      <div className="container-inner">
        {(heading || description) && (
          <div className="text-center mb-10 max-w-2xl mx-auto">
            {heading && <h2 className="mb-4">{heading}</h2>}
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        )}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
          {plans?.map((plan, i) => (
            <div
              key={i}
              className={`relative flex flex-col rounded-[10px] border p-7 ${
                plan.highlighted ? 'border-primary bg-card' : 'border-border bg-muted'
              }`}
            >
              {plan.highlighted && plan.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div className="mb-6">
                <h3 className="mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-card-foreground">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  )}
                </div>
                {plan.description && (
                  <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
                )}
              </div>
              {plan.features && plan.features.length > 0 && (
                <ul className="flex flex-col gap-3 mb-8 grow">
                  {plan.features.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <span className={item.included ? 'text-accent' : 'text-muted-foreground'}>
                        {item.included ? '✓' : '✕'}
                      </span>
                      <span className={!item.included ? 'text-muted-foreground line-through' : ''}>
                        {item.feature}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
              {plan.links && plan.links.length > 0 && (
                <div className="mt-auto">
                  {plan.links.map(({ link }, idx) => (
                    <CMSLink
                      key={idx}
                      size="lg"
                      className="w-full justify-center"
                      {...link}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
