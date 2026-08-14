import React from 'react'

import type { FeaturesBlock as FeaturesBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'

const columnClasses: Record<string, string> = {
  '2': 'md:grid-cols-2',
  '3': 'md:grid-cols-2 lg:grid-cols-3',
  '4': 'md:grid-cols-2 lg:grid-cols-4',
}

export const FeaturesBlock: React.FC<FeaturesBlockProps> = ({
  heading,
  description,
  columns = '3',
  features,
}) => {
  return (
    <div className="container">
      {(heading || description) && (
        <div className="text-center mb-12 max-w-2xl mx-auto">
          {heading && <h2 className="text-3xl font-bold mb-4">{heading}</h2>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className={`grid grid-cols-1 ${columnClasses[columns ?? '3'] || columnClasses['3']} gap-8`}>
        {features?.map((feature, i) => (
          <div key={i} className="flex flex-col gap-4 p-6 rounded-lg border border-border bg-card">
            {feature.image && typeof feature.image === 'object' ? (
              <div className="w-full aspect-video rounded-md overflow-hidden mb-2">
                <Media resource={feature.image} imgClassName="w-full h-full object-cover" />
              </div>
            ) : feature.icon ? (
              <span className="text-3xl">{feature.icon}</span>
            ) : null}
            <h3 className="text-xl font-semibold">{feature.title}</h3>
            {feature.description && (
              <RichText className="mb-0 text-muted-foreground text-sm" data={feature.description} enableGutter={false} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
