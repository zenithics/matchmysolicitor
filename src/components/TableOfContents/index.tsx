'use client'

import React, { useEffect, useRef, useState } from 'react'
import { cn } from '@/utilities/ui'

interface TocEntry {
  id: string
  text: string
  level: number
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function extractHeadings(content: any): TocEntry[] {
  if (!content?.root?.children) return []

  const entries: TocEntry[] = []
  const seen = new Map<string, number>()

  function walk(nodes: any[]) {
    for (const node of nodes) {
      if (node.type === 'heading' && ['h2', 'h3', 'h4'].includes(node.tag)) {
        const level = parseInt(node.tag.slice(1), 10)
        const rawText = (node.children || [])
          .map((c: any) => c.text || '')
          .join('')

        if (!rawText.trim()) continue

        let id = slugify(rawText)
        const count = seen.get(id) ?? 0
        seen.set(id, count + 1)
        if (count > 0) id = `${id}-${count}`

        entries.push({ id, text: rawText, level })
      }

      if (node.children) walk(node.children)
    }
  }

  walk(content.root.children)
  return entries
}

// Server utility — extract and attach IDs to heading nodes so the DOM has anchors
export function injectHeadingIds(content: any): any {
  if (!content?.root?.children) return content

  const seen = new Map<string, number>()

  function walk(nodes: any[]): any[] {
    return nodes.map((node) => {
      if (node.type === 'heading' && ['h2', 'h3', 'h4'].includes(node.tag)) {
        const rawText = (node.children || []).map((c: any) => c.text || '').join('')
        let id = slugify(rawText)
        const count = seen.get(id) ?? 0
        seen.set(id, count + 1)
        if (count > 0) id = `${id}-${count}`
        return { ...node, id, children: node.children ? walk(node.children) : node.children }
      }
      if (node.children) return { ...node, children: walk(node.children) }
      return node
    })
  }

  return {
    ...content,
    root: { ...content.root, children: walk(content.root.children) },
  }
}

// Client component that injects IDs into rendered heading elements so TOC anchor links work
export const HeadingIdInjector: React.FC = () => {
  useEffect(() => {
    const article = document.querySelector('article')
    if (!article) return

    const headings = article.querySelectorAll('h2, h3, h4')
    const seen = new Map<string, number>()

    headings.forEach((heading) => {
      if (heading.id) return
      const text = heading.textContent || ''
      let id = slugify(text)
      const count = seen.get(id) ?? 0
      seen.set(id, count + 1)
      if (count > 0) id = `${id}-${count}`
      heading.id = id
    })
  }, [])

  return null
}

interface TableOfContentsProps {
  content: any
  className?: string
  title?: string
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  className,
  title = 'Contents',
}) => {
  const entries = extractHeadings(content)
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (entries.length === 0) return

    observerRef.current?.disconnect()

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id)
          break
        }
      }
    }

    observerRef.current = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    })

    entries.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [entries])

  if (entries.length < 2) return null

  return (
    <nav
      className={cn(
        'rounded-xl border border-border bg-card p-5 text-sm',
        className,
      )}
      aria-label="Table of contents"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </p>
      <ol className="space-y-1 list-none">
        {entries.map(({ id, text, level }) => (
          <li
            key={id}
            style={{ paddingLeft: `${(level - 2) * 1}rem` }}
          >
            <a
              href={`#${id}`}
              className={cn(
                'block py-0.5 leading-snug transition-colors hover:text-primary',
                activeId === id
                  ? 'text-primary font-medium'
                  : 'text-muted-foreground',
              )}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              {text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
