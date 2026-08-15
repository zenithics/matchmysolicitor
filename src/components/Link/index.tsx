import { Button, type ButtonProps } from '@/components/ui/button'
import { ArrowRight, stripTrailingArrow } from '@/components/icons/ArrowRight'
import { cn } from '@/utilities/ui'
import Link from 'next/link'
import React from 'react'

import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | ButtonProps['variant']
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${
          reference.value.slug
        }`
      : url

  if (!href) return null

  const size = appearance === 'link' ? 'clear' : sizeFromProps
  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  /* Ensure we don't break any styles set by richText */
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  // The design renders a trailing arrow as part of the control on primary and
  // outline CTAs, not typed into the label — strip one if a CMS editor already
  // typed a glyph, so it doesn't render twice.
  const showArrow = appearance === 'default' || appearance === 'outline'
  const displayLabel = showArrow ? stripTrailingArrow(label) : label

  return (
    <Button asChild className={cn('group', className)} size={size} variant={appearance}>
      <Link className={cn(className)} href={href || url || ''} {...newTabProps}>
        {displayLabel && displayLabel}
        {children && children}
        {showArrow && <ArrowRight />}
      </Link>
    </Button>
  )
}
