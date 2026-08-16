import type { BannerBlock as BannerBlockProps } from '@/payload-types'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

type Props = {
  className?: string
} & BannerBlockProps

/*
 * style="info" covers two visually distinct designs in design-export, and
 * nothing in the schema tells them apart (no badge field — it broke
 * production once, see 283b3a5): a full-bleed dated-notice band
 * (index.dc.html: a bold pill-style lead-in, then one flowing sentence — the
 * whole thing is exactly one paragraph) and a contained card (about.dc.html's
 * "We are not a law firm", guides.dc.html's per-guide disclaimer: either a
 * bold title paragraph followed by separate body paragraph(s), or a single
 * plain paragraph with no bold at all). Every real "band" instance is exactly
 * one paragraph starting with bold text; every real "card" instance is either
 * more than one paragraph, or one paragraph with no leading bold — so that's
 * the signal used here, not a guess at the badge text's shape (a date-pattern
 * check would misclassify the "Your local tribunal" location banners, which
 * are band instances with a non-date bold lead-in).
 */
function isBandLayout(content: unknown): boolean {
  const children = (content as { root?: { children?: unknown[] } })?.root?.children
  if (!Array.isArray(children) || children.length !== 1) return false
  const para = children[0] as { type?: string; children?: unknown[] }
  if (para?.type !== 'paragraph') return false
  const first = para.children?.[0] as { type?: string; format?: number } | undefined
  return first?.type === 'text' && ((first.format ?? 0) & 1) === 1
}

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  /*
   * "note" is the design's white bordered panel (location pages, "Your local
   * tribunal"). The first bold run is a small blue uppercase eyebrow and the
   * second is the panel heading, matching the design markup.
   */
  if ((style as string) === 'note') {
    return (
      <section className={cn('sp-32-24', className)}>
        <div className="container-inner">
          <div className="flex flex-col gap-2.5 rounded-[10px] border border-[#E4E7EC] bg-white p-7">
            <RichText
              className="text-[15px] leading-[1.6] text-[var(--mms-body,#3A414C)] [&_p]:mb-0 [&_p:first-child>strong:first-child]:block [&_p:first-child>strong:first-child]:text-xs [&_p:first-child>strong:first-child]:font-bold [&_p:first-child>strong:first-child]:uppercase [&_p:first-child>strong:first-child]:tracking-[0.08em] [&_p:first-child>strong:first-child]:text-[var(--mms-primary,#1E4FD8)] [&_p:nth-child(2)>strong:first-child]:block [&_p:nth-child(2)>strong:first-child]:text-xl [&_p:nth-child(2)>strong:first-child]:text-[var(--mms-ink,#1A1F26)] [&_p:last-child]:text-sm [&_p:last-child]:text-[#5B6472]"
              data={content}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        </div>
      </section>
    )
  }

  if (style === 'info') {
    if (isBandLayout(content)) {
      return (
        <section className={cn('bg-[#E9F6F4] border-b border-[#C6E7E2]', className)}>
          <div className="container flex items-start gap-4 py-[22px] max-[640px]:flex-col max-[640px]:gap-2.5">
            <RichText
              // The badge is the first bold run in the paragraph (see the
              // importer's banner mapper) — style just that one as the
              // design's teal pill, not every <strong> in the sentence.
              className="text-base leading-[1.65] text-[#0F5D55] [&_strong]:text-[#0A4740] [&_a]:font-bold [&_a]:text-[#0B7268] [&_p:first-child>strong:first-child]:inline-block [&_p:first-child>strong:first-child]:bg-[#0D9488] [&_p:first-child>strong:first-child]:text-white [&_p:first-child>strong:first-child]:text-xs [&_p:first-child>strong:first-child]:px-2.5 [&_p:first-child>strong:first-child]:py-[3px] [&_p:first-child>strong:first-child]:rounded [&_p:first-child>strong:first-child]:tracking-[0.06em] [&_p:first-child>strong:first-child]:mr-1"
              data={content}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        </section>
      )
    }

    return (
      <section className="sp-32-24">
        <div className="container-inner">
          <div className="max-w-[720px] mx-auto rounded-[10px] border border-[#C6E7E2] bg-[#E9F6F4] p-6">
            <RichText
              className="text-[15px] leading-[1.6] text-[#0F5D55] [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_p:first-child>strong:only-child]:text-base [&_p:first-child>strong:only-child]:text-[#0A4740] [&_a]:font-bold [&_a]:text-[#0B7268]"
              data={content}
              enableGutter={false}
              enableProse={false}
            />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('sp-32-24', className)}>
      <div className="container-inner">
        <div
          className={cn('rounded-[10px] border p-6', {
            'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309] [&_strong]:text-[#B45309]':
              style === 'warning',
            'border-error bg-error/30': style === 'error',
            'border-success bg-success/30': style === 'success',
          })}
        >
          <RichText data={content} enableGutter={false} enableProse={false} />
        </div>
      </div>
    </section>
  )
}
