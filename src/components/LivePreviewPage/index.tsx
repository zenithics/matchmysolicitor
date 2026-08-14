'use client'

import React, { useEffect, useRef } from 'react'
import { useLivePreview } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'
import { getClientSideURL } from '@/utilities/getURL'

import type { Page } from '@/payload-types'

type Props = {
  initialData: Page
}

export const LivePreviewPage: React.FC<Props> = ({ initialData }) => {
  const router = useRouter()
  const { data } = useLivePreview<Page>({
    serverURL: getClientSideURL(),
    depth: 2,
    initialData,
  })

  const mountedRef = useRef(false)

  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      return
    }
    const timeout = setTimeout(() => {
      router.refresh()
    }, 300)
    return () => clearTimeout(timeout)
  }, [data, router])

  return null
}
