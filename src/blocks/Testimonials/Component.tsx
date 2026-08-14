import React from 'react'

import type { TestimonialsBlock as TestimonialsBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'
import { Media } from '@/components/Media'

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({ heading, testimonials }) => {
  return (
    <div className="container">
      {heading && (
        <h2 className="text-3xl font-bold text-center mb-12">{heading}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials?.map((testimonial, i) => (
          <div
            key={i}
            className="bg-card rounded-lg border border-border p-6 flex flex-col gap-4"
          >
            {testimonial.rating && (
              <div className="flex gap-1">
                {Array.from({ length: testimonial.rating }).map((_, idx) => (
                  <span key={idx} className="text-yellow-500">★</span>
                ))}
                {Array.from({ length: 5 - testimonial.rating }).map((_, idx) => (
                  <span key={idx} className="text-muted-foreground">★</span>
                ))}
              </div>
            )}
            {testimonial.quote && (
              <RichText className="mb-0 text-muted-foreground italic" data={testimonial.quote} enableGutter={false} />
            )}
            <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
              {testimonial.image && typeof testimonial.image === 'object' && (
                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
                  <Media resource={testimonial.image} imgClassName="w-full h-full object-cover" />
                </div>
              )}
              <div>
                <p className="font-semibold text-sm">{testimonial.author}</p>
                {testimonial.role && (
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
