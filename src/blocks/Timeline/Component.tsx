import React from 'react'
import type { TimelineBlock as TimelineBlockProps } from '@/payload-types'
import RichText from '@/components/RichText'
import { Media } from '@/components/Media'

export const TimelineBlock: React.FC<TimelineBlockProps> = ({
  heading,
  subheading,
  events,
}) => {
  if (!events || events.length === 0) return null

  return (
    <section className="py-20 bg-background">
      <div className="container max-w-4xl">
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-16">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4">{heading}</h2>
            )}
            {subheading && <p className="text-muted-foreground text-lg">{subheading}</p>}
          </div>
        )}

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-px" />

          {events.map((event, i) => {
            const isLeft = i % 2 === 0
            return (
              <div key={event.id || i} className="relative flex items-start mb-12 last:mb-0">
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 w-8 h-8 -translate-x-1/2 rounded-full bg-primary border-4 border-background flex items-center justify-center z-10">
                  {event.icon ? (
                    <span className="text-xs">{event.icon}</span>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                  )}
                </div>

                {/* Content card */}
                <div
                  className={`ml-16 md:ml-0 md:w-[calc(50%-2rem)] ${
                    isLeft ? 'md:pr-8' : 'md:pl-8 md:ml-auto'
                  }`}
                >
                  <div className="p-5 rounded-lg border border-border bg-card">
                    <span className="text-xs font-medium uppercase tracking-wider text-primary">
                      {event.date}
                    </span>
                    <h3 className="text-lg font-semibold mt-1 mb-2">{event.title}</h3>
                    {event.image && typeof event.image === 'object' && (
                      <div className="w-full aspect-video rounded-md overflow-hidden mb-3">
                        <Media
                          resource={event.image}
                          imgClassName="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {event.description && (
                      <RichText
                        className="mb-0 text-sm text-muted-foreground"
                        data={event.description}
                        enableGutter={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
