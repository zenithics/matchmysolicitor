import React from 'react'
import type { MapEmbedBlock as MapEmbedBlockProps } from '@/payload-types'

const heightClasses: Record<string, string> = {
  small: '300px',
  medium: '450px',
  large: '600px',
}

export const MapEmbedBlock: React.FC<MapEmbedBlockProps> = ({
  heading,
  locations,
  mapHeight = 'medium',
  layout = 'stacked',
}) => {
  if (!locations || locations.length === 0) return null

  const isSideBySide = layout === 'sideBySide'
  const mapHeightPx = heightClasses[mapHeight ?? 'medium']

  return (
    <section className="py-16 bg-background">
      <div className="container">
        {heading && (
          <h2 className="text-3xl font-serif tracking-tight text-center mb-10">{heading}</h2>
        )}

        <div className="flex flex-col gap-12">
          {locations.map((location) => (
            <div
              key={location.id}
              className={
                isSideBySide
                  ? 'flex flex-col lg:flex-row gap-8 items-start'
                  : 'flex flex-col gap-6'
              }
            >
              {/* Map */}
              <div className={isSideBySide ? 'w-full lg:flex-1' : 'w-full'}>
                <iframe
                  src={location.googleMapsEmbedURL}
                  title={`Map for ${location.name}`}
                  style={{ height: mapHeightPx }}
                  className="w-full rounded-xl border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              {/* Details */}
              <div className={isSideBySide ? 'w-full lg:w-72 shrink-0' : 'w-full'}>
                <h3 className="text-xl font-semibold mb-4">{location.name}</h3>

                {location.address && (
                  <div className="flex gap-3 mb-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{location.address}</p>
                  </div>
                )}

                {location.phone && (
                  <div className="flex gap-3 mb-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${location.phone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {location.phone}
                    </a>
                  </div>
                )}

                {location.email && (
                  <div className="flex gap-3 mb-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <a href={`mailto:${location.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {location.email}
                    </a>
                  </div>
                )}

                {location.hours && (
                  <div className="flex gap-3">
                    <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{location.hours}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
