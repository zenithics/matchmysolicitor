'use client'

import { useRowLabel } from '@payloadcms/ui'
import React from 'react'

const PolicyRowLabel: React.FC = () => {
  const { data } = useRowLabel<{ title?: string; version?: string }>()
  const title = data?.title || 'Untitled Policy'
  const version = data?.version ? ` (v${data.version})` : ''
  return <span>{title}{version}</span>
}

export default PolicyRowLabel
