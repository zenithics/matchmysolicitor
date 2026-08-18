import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { ContentBlock as ContentBlockProps } from '@/payload-types'

import { CMSLink } from '../../components/Link'

/*
 * The design wraps one run of each service page's article in a white bordered
 * panel ("What a specialist does first" and its siblings on the other 11
 * service pages): heading, a short lead-in line, then a teal-bulleted list.
 * The design import flattens that panel into plain rich text because Lexical
 * has no container node for it, so it's rebuilt here.
 *
 * Detection rule: inside a Content block a `list` node only ever appears as
 * part of that panel (checked across all 12 design-export service pages —
 * every other list in the design lives in the hero, not the article), so the
 * panel is the run from the nearest preceding heading through the list.
 */
type LexNode = { type?: string; [k: string]: unknown }

function splitPanels(children: LexNode[]): { panel: boolean; nodes: LexNode[] }[] {
  const listIndexes = children.reduce<number[]>((acc, n, i) => {
    if (n?.type === 'list') acc.push(i)
    return acc
  }, [])
  if (listIndexes.length === 0) return [{ panel: false, nodes: children }]

  const segments: { panel: boolean; nodes: LexNode[] }[] = []
  let cursor = 0

  for (const listIndex of listIndexes) {
    let start = listIndex
    while (start > cursor && children[start - 1]?.type !== 'heading') start--
    if (start > cursor && children[start - 1]?.type === 'heading') start--
    if (start > cursor) segments.push({ panel: false, nodes: children.slice(cursor, start) })
    segments.push({ panel: true, nodes: children.slice(start, listIndex + 1) })
    cursor = listIndex + 1
  }
  if (cursor < children.length) segments.push({ panel: false, nodes: children.slice(cursor) })

  return segments.filter((s) => s.nodes.length > 0)
}

// Design headings are #1A1F26, not the global body colour.
const HEADING_CLASSES = '[&_h2]:text-[#1A1F26] [&_h3]:text-[#1A1F26] [&_h4]:text-[#1A1F26]'

const PANEL_CLASSES =
  'rounded-[10px] border border-[#E4E7EC] bg-white p-8 ' +
  '[&_h2]:text-2xl [&_h2]:mt-0 [&_h2]:mb-4 [&_h3]:mt-0 [&_h3]:mb-4 ' +
  '[&_p]:text-[15px] [&_p]:text-[#5B6472] [&_p]:mb-4 ' +
  '[&_ul]:list-none [&_ul]:pl-0 [&_ul]:my-0 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-3 ' +
  "[&_li]:pl-5 [&_li]:my-0 [&_li]:relative [&_li]:text-base [&_li]:leading-[1.6] " +
  "[&_li]:before:content-['·'] [&_li]:before:absolute [&_li]:before:left-0 " +
  '[&_li]:before:font-bold [&_li]:before:text-[#0D9488]'

const ContentRichText: React.FC<{ richText: any }> = ({ richText }) => {
  const children = (richText?.root?.children ?? []) as LexNode[]
  const segments = splitPanels(children)

  if (segments.length === 1 && !segments[0].panel) {
    return <RichText className={HEADING_CLASSES} data={richText} enableGutter={false} />
  }

  return (
    <div className="flex flex-col gap-9">
      {segments.map((segment, i) => {
        const data = { ...richText, root: { ...richText.root, children: segment.nodes } }
        return segment.panel ? (
          <div className={cn(PANEL_CLASSES, HEADING_CLASSES)} key={i}>
            <RichText data={data} enableGutter={false} enableProse={false} />
          </div>
        ) : (
          <RichText className={HEADING_CLASSES} data={data} enableGutter={false} key={i} />
        )
      })}
    </div>
  )
}

export const ContentBlock: React.FC<ContentBlockProps> = (props) => {
  const { columns } = props

  const colsSpanClasses = {
    full: '12',
    half: '6',
    oneThird: '4',
    twoThirds: '8',
  }

  const isProseColumn = columns?.length === 1 && columns[0]?.size === 'full'

  return (
    <section className="sp-64">
      <div className="container-inner">
        <div
          className={cn('grid grid-cols-4 lg:grid-cols-12 gap-y-8 gap-x-16', {
            // Design article column is 820px (see design-export article max-width), not 640.
            'max-w-[820px] mx-auto': isProseColumn,
          })}
        >
          {columns &&
            columns.length > 0 &&
            columns.map((col, index) => {
              const { enableLink, link, richText, size } = col

              return (
                <div
                  className={cn(`col-span-4 lg:col-span-${colsSpanClasses[size!]}`, {
                    'md:col-span-2': size !== 'full',
                  })}
                  key={index}
                >
                  {richText && <ContentRichText richText={richText} />}

                  {enableLink && <CMSLink {...link} />}
                </div>
              )
            })}
        </div>
      </div>
    </section>
  )
}
