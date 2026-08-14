'use client'

import React, { useState } from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'

export const FAQBlock: React.FC<FAQBlockProps> = ({ heading, description, items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="container max-w-3xl">
      {heading && (
        <h2 className="text-3xl font-bold text-center mb-4">{heading}</h2>
      )}
      {description && (
        <p className="text-center text-muted-foreground mb-12">{description}</p>
      )}
      <div className="flex flex-col gap-2">
        {items?.map((item, i) => (
          <div key={i} className="border border-border rounded-lg overflow-hidden">
            <button
              className="w-full flex justify-between items-center p-4 text-left font-medium hover:bg-muted/50 transition-colors"
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              aria-expanded={openIndex === i}
            >
              <span>{item.question}</span>
              <span className="text-xl shrink-0 ml-4 transition-transform duration-200" style={{
                transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0deg)',
              }}>
                +
              </span>
            </button>
            {openIndex === i && item.answer && (
              <div className="px-4 pb-4">
                <RichText className="mb-0 text-muted-foreground" data={item.answer} enableGutter={false} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
