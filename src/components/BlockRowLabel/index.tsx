'use client'
import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

const labelFieldMap: Record<string, string[]> = {
  homeHero: ['headline', 'heading'],
  heroSplit: ['headline', 'heading'],
  content: ['heading'],
  cta: ['heading', 'title'],
  mediaBlock: ['heading'],
  testimonials: ['heading'],
  faq: ['heading'],
  features: ['heading'],
  stats: ['heading'],
  logoCarousel: ['heading'],
  pricing: ['heading'],
  productGrid: ['heading', 'title'],
  featuredProducts: ['heading'],
  cartSummary: ['heading'],
  eventGrid: ['heading'],
  howItWorks: ['heading'],
  imageGallery: ['heading'],
  newsletter: ['heading'],
  archive: ['heading', 'title'],
  formBlock: ['title', 'heading'],
  teamGrid: ['heading'],
  videoEmbed: ['heading', 'videoURL'],
  mapEmbed: ['heading'],
  embed: ['heading', 'embedURL'],
  timeline: ['heading'],
}

export const BlockRowLabel: React.FC = () => {
  const { data } = useRowLabel<Record<string, unknown>>()
  const blockType = data?.blockType as string

  if (!blockType) return <span>Untitled</span>

  const fieldsToCheck = labelFieldMap[blockType] || ['heading', 'title', 'name']

  for (const field of fieldsToCheck) {
    const value = data?.[field]
    if (typeof value === 'string' && value.trim()) {
      return <span>{value.length > 50 ? value.substring(0, 50) + '...' : value}</span>
    }
  }

  return <span>Untitled</span>
}
