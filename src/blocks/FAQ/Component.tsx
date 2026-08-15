import React from 'react'

import type { FAQBlock as FAQBlockProps } from '@/payload-types'

import RichText from '@/components/RichText'

export const FAQBlock: React.FC<FAQBlockProps> = ({ heading, description, items }) => {
  return (
    <section className="sp-72 bg-card border-t border-b border-[#E4E7EC]">
      <div className="container-inner max-w-[900px]">
        {heading && <h2 className="mb-10">{heading}</h2>}
        {description && <p className="text-muted-foreground mb-8">{description}</p>}
        <div className="flex flex-col gap-3">
          {items?.map((item, i) => (
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
          ))}
        </div>
      </div>
    </section>
  )
}
