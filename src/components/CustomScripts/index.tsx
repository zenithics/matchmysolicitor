import React from 'react'
import { getPayload } from 'payload'
import config from '@payload-config'

interface ScriptData {
  headScripts?: string
  bodyScripts?: string
  headCode?: string
  bodyStartCode?: string
  bodyEndCode?: string
  customCSS?: string
}

async function getCustomScripts(): Promise<ScriptData> {
  try {
    const payload = await getPayload({ config })
    const [seo, injection] = await Promise.all([
      payload.findGlobal({ slug: 'seo-settings' }).catch(() => null) as Promise<any>,
      payload.findGlobal({ slug: 'code-injection' }).catch(() => null) as Promise<any>,
    ])

    return {
      headScripts: seo?.headScripts || undefined,
      bodyScripts: seo?.bodyScripts || undefined,
      headCode: injection?.headCode || undefined,
      bodyStartCode: injection?.bodyStartCode || undefined,
      bodyEndCode: injection?.bodyEndCode || undefined,
      customCSS: injection?.customCSS || undefined,
    }
  } catch {
    return {}
  }
}

export async function CustomHeadScripts() {
  const { headScripts, headCode, customCSS } = await getCustomScripts()

  return (
    <>
      {headScripts && <div dangerouslySetInnerHTML={{ __html: headScripts }} />}
      {headCode && <div dangerouslySetInnerHTML={{ __html: headCode }} />}
      {customCSS && <style dangerouslySetInnerHTML={{ __html: customCSS }} />}
    </>
  )
}

export async function CustomBodyStartScripts() {
  const { bodyStartCode } = await getCustomScripts()
  if (!bodyStartCode) return null
  return <div dangerouslySetInnerHTML={{ __html: bodyStartCode }} />
}

export async function CustomBodyScripts() {
  const { bodyScripts, bodyEndCode } = await getCustomScripts()

  return (
    <>
      {bodyScripts && <div dangerouslySetInnerHTML={{ __html: bodyScripts }} />}
      {bodyEndCode && <div dangerouslySetInnerHTML={{ __html: bodyEndCode }} />}
    </>
  )
}
