import React from 'react'

import type { StatsBlock as StatsBlockProps } from '@/payload-types'

export const StatsBlock: React.FC<StatsBlockProps> = ({ heading, stats, footnote }) => {
  return (
    <section className="sp-32-24 bg-card border-b border-[#E4E7EC]">
      <div className="container-inner">
        {heading && <h2 className="text-[clamp(21px,3.2vw,26px)] mb-4">{heading}</h2>}
        <div
          className={
            heading
              ? 'grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4'
              : 'grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-6'
          }
        >
          {stats?.map((stat, i) => (
            <div
              key={i}
              className={
                heading
                  ? 'flex flex-col gap-1.5 rounded-[10px] border border-[#E4E7EC] bg-card p-6'
                  : 'flex flex-col gap-1'
              }
            >
              <p
                className={
                  heading
                    ? 'text-[clamp(21px,3.2vw,26px)] font-bold text-card-foreground m-0'
                    : 'text-[26px] font-extrabold tracking-[-0.01em] text-card-foreground m-0'
                }
              >
                {stat.prefix && <span>{stat.prefix}</span>}
                {stat.value}
                {stat.suffix && <span>{stat.suffix}</span>}
              </p>
              <p className="text-sm text-muted-foreground leading-[1.5] m-0">{stat.label}</p>
            </div>
          ))}
        </div>
        {footnote && (
          <p className="text-sm text-muted-foreground leading-[1.6] mt-4 mb-0">{footnote}</p>
        )}
      </div>
    </section>
  )
}
