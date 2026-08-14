import React from 'react'
import type { TeamGridBlock as TeamGridBlockProps } from '@/payload-types'
import { Media } from '@/components/Media'

const colClasses: Record<string, string> = {
  '2': 'grid-cols-1 sm:grid-cols-2',
  '3': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  '4': 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
}

export const TeamGridBlock: React.FC<TeamGridBlockProps> = ({
  heading,
  subheading,
  columns = '3',
  members,
}) => {
  if (!members || members.length === 0) return null

  return (
    <section className="py-20 bg-background">
      <div className="container">
        {(heading || subheading) && (
          <div className="text-center max-w-2xl mx-auto mb-14">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-serif tracking-tight mb-4">{heading}</h2>
            )}
            {subheading && <p className="text-muted-foreground text-lg">{subheading}</p>}
          </div>
        )}

        <div className={`grid gap-8 ${colClasses[columns ?? '3']}`}>
          {members.map((member) => (
            <div key={member.id} className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mb-4 shrink-0">
                {member.photo && typeof member.photo === 'object' ? (
                  <Media
                    resource={member.photo}
                    imgClassName="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-muted-foreground">
                    {member.name?.charAt(0)}
                  </div>
                )}
              </div>

              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-sm text-primary font-medium mb-2">{member.role}</p>

              {member.bio && (
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{member.bio}</p>
              )}

              {(member.linkedIn || member.email) && (
                <div className="flex gap-3 mt-auto pt-2">
                  {member.linkedIn && (
                    <a
                      href={member.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${member.name} on LinkedIn`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      aria-label={`Email ${member.name}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
