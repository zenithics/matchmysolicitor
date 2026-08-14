'use client'

import React from 'react'
import { useField } from '@payloadcms/ui'

/**
 * AI Block Generator — Payload admin UI field component.
 * Placeholder for AI-powered content block generation.
 * This will be expanded to integrate with the Anthropic SDK
 * for generating page content blocks.
 */
const AIBlockGenerator: React.FC = () => {
  return (
    <div
      style={{
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px dashed var(--theme-elevation-300)',
        backgroundColor: 'var(--theme-elevation-50)',
        marginBottom: '16px',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '13px',
          color: 'var(--theme-elevation-600)',
        }}
      >
        ✨ AI Block Generator — coming soon
      </p>
    </div>
  )
}

export default AIBlockGenerator
