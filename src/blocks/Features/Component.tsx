import React from 'react'

import type { FeaturesBlock as FeaturesBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'
import { ArrowRight, stripTrailingArrow } from '@/components/icons/ArrowRight'

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
            const Card = feature.linkUrl ? 'a' : 'div'
            return (
            <Card
              key={i}
              {...(feature.linkUrl ? { href: feature.linkUrl } : {})}
              className={`flex flex-col gap-4 p-[28px] rounded-[10px] border border-border bg-muted${
                feature.linkUrl ? ' group transition-colors hover:border-primary no-underline' : ''
              }`}
            >
              {feature.image && typeof feature.image === 'object' ? (
                <div className="w-full aspect-video rounded-md overflow-hidden mb-2">
                  <Media resource={feature.image} imgClassName="w-full h-full object-cover" />
                </div>
              ) : feature.icon ? (
                <span className="text-3xl">{feature.icon}</span>
              ) : null}
              <h3 className="text-[18px] font-bold">{feature.title}</h3>
              {feature.description && (
                <RichText className="mb-0 text-muted-foreground text-sm" data={feature.description} enableGutter={false} />
              )}
              {feature.linkUrl && feature.linkLabel && (
                <span className="mt-auto pt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {stripTrailingArrow(feature.linkLabel)}
                  <ArrowRight />
                </span>
              )}
            </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
