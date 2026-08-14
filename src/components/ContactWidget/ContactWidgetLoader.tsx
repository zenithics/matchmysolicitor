import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { ContactWidget as ContactWidgetType } from '@/payload-types'
import { ContactWidget } from './index'

export async function ContactWidgetLoader() {
  try {
    const payload = await getPayload({ config: configPromise })
    const data = await payload.findGlobal({ slug: 'contact-widget', depth: 0 })
    if (!data?.enabled) return null
    return <ContactWidget data={data as unknown as ContactWidgetType} />
  } catch {
    return null
  }
}
