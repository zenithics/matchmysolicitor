import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'

// The design uses this block two ways: a collapsible accordion (every
// service/location page) and a single always-open list with no disclosure
// triangle (how-it-works.dc.html only). There's no field for that layout
// choice, so the importer stashes it as a sentinel in `description` (which
// neither real instance otherwise uses) — check for it and never render it as
// visible text.
const OPEN_LAYOUT_SENTINEL = '__open__'

export const FAQBlock: React.FC<FAQBlockProps> = ({ heading, description, items }) => {
  const isOpenLayout = description === OPEN_LAYOUT_SENTINEL
  const visibleDescription = isOpenLayout ? undefined : description

  return (
    <section className="sp-72 bg-card border-t border-b border-[#E4E7EC]">
      <div className="container-inner max-w-[900px]">
        {heading && <h2 className="mb-10">{heading}</h2>}
        {visibleDescription && <p className="text-muted-foreground mb-8">{visibleDescription}</p>}
        <div className={isOpenLayout ? 'flex flex-col gap-8' : 'flex flex-col gap-3'}>
          {items?.map((item, i) =>
            isOpenLayout ? (
              <div key={i} className="flex flex-col gap-2">
                <h3>{item.question}</h3>
                {item.answer && (
                  <RichText
                    className="mb-0 text-[15px] leading-[1.7] text-muted-foreground"
                    data={item.answer}
                    enableGutter={false}
                  />
                )}
              </div>
            ) : (
              <details
                key={i}
                className="bg-card border border-[#E4E7EC] rounded-lg px-[22px] py-[18px]"
              >
                <summary className="font-bold text-base text-card-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 focus-visible:rounded">
                  {item.question}
                </summary>
                {item.answer && (
                  <RichText
                    className="mt-3 mb-0 text-[15px] leading-[1.7] text-muted-foreground"
                    data={item.answer}
                    enableGutter={false}
                  />
                )}
              </details>
            ),
          )}
        </div>
      </div>
    </section>
  )
}
