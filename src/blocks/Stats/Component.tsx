import React from 'react'

import type { StatsBlock as StatsBlockProps } from '@/payload-types'

export const StatsBlock: React.FC<StatsBlockProps> = ({ heading, stats }) => {
  return (
    <div className="container">
      {heading && (
        <h2 className="text-3xl font-bold text-center mb-12">{heading}</h2>
      )}
      <div className={`grid grid-cols-2 ${
        stats && stats.length >= 4 ? 'lg:grid-cols-4' : stats && stats.length === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
      } gap-8`}>
        {stats?.map((stat, i) => (
          <div key={i} className="text-center p-6">
            <p className="text-4xl md:text-5xl font-bold mb-2">
              {stat.prefix && <span>{stat.prefix}</span>}
              {stat.value}
              {stat.suffix && <span>{stat.suffix}</span>}
            </p>
            <p className="text-muted-foreground text-sm uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
