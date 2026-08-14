import type { Payload } from 'payload'

interface EventData {
  value?: number
  currency?: string
  orderId?: string
  contentIds?: string[]
  email?: string
  firstName?: string
  lastName?: string
}

async function getSEOSettings(payload: Payload) {
  try {
    return (await payload.findGlobal({ slug: 'seo-settings' })) as any
  } catch {
    return null
  }
}

/**
 * Send an event to Meta Conversions API (server-side).
 * event_id should match the client-side pixel's eventID for deduplication.
 */
export async function sendMetaCapi(
  eventName: string,
  eventData: EventData,
  eventId: string,
  payload: Payload,
) {
  const seo = await getSEOSettings(payload)
  const pixelId = seo?.metaPixelId
  const accessToken = seo?.metaCapiAccessToken
  const testEventCode = seo?.metaTestEventCode

  if (!pixelId || !accessToken) return

  const body: Record<string, any> = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        ...(eventData.value !== undefined && {
          custom_data: {
            value: (eventData.value / 100).toFixed(2),
            currency: (eventData.currency || 'GBP').toUpperCase(),
            order_id: eventData.orderId,
            content_ids: eventData.contentIds,
            content_type: 'product',
          },
        }),
        ...(eventData.email && {
          user_data: {
            em: [eventData.email],
            ...(eventData.firstName && { fn: [eventData.firstName] }),
            ...(eventData.lastName && { ln: [eventData.lastName] }),
          },
        }),
      },
    ],
    ...(testEventCode && { test_event_code: testEventCode }),
  }

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )
    if (!res.ok) {
      const err = await res.text()
      console.error('[Meta CAPI] Error:', err)
    }
  } catch (err) {
    console.error('[Meta CAPI] Request failed:', err)
  }
}

/**
 * Send an event to TikTok Events API.
 */
export async function sendTiktokEvent(
  eventName: string,
  eventData: EventData,
  payload: Payload,
) {
  const seo = await getSEOSettings(payload)
  const pixelId = seo?.tiktokPixelId
  const accessToken = seo?.tiktokEventsApiAccessToken

  if (!pixelId || !accessToken) return

  const body = {
    pixel_code: pixelId,
    event: eventName,
    timestamp: new Date().toISOString(),
    context: { ad: { callback: '' } },
    properties: {
      ...(eventData.value !== undefined && {
        value: (eventData.value / 100).toFixed(2),
        currency: (eventData.currency || 'GBP').toUpperCase(),
      }),
      ...(eventData.orderId && { order_id: eventData.orderId }),
      ...(eventData.contentIds && { content_id: eventData.contentIds.join(',') }),
    },
  }

  try {
    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': accessToken,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[TikTok EAPI] Error:', err)
    }
  } catch (err) {
    console.error('[TikTok EAPI] Request failed:', err)
  }
}

/**
 * Fire a Google Ads purchase conversion via the pixel endpoint.
 * The gads gtag.js script (loaded client-side) handles remarketing;
 * this fires the purchase conversion server-to-server using the
 * Conversion Measurement ping endpoint.
 */
export async function sendGadsConversion(
  conversionId: string,
  conversionLabel: string,
  value: number,
  currency: string,
  orderId: string,
): Promise<void> {
  if (!conversionId || !conversionLabel) return

  // Strip the AW- prefix to get the numeric ID
  const numericId = conversionId.replace(/^AW-/, '')

  const params = new URLSearchParams({
    conversion_id: numericId,
    label: conversionLabel,
    value: (value / 100).toFixed(2),
    currency_code: (currency || 'GBP').toUpperCase(),
    oid: orderId,
    gtm: '2oe630', // gtm source identifier
  })

  try {
    await fetch(`https://www.googleadservices.com/pagead/conversion/${numericId}/?${params}`, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PresssedNailzz/1.0)' },
    })
  } catch (err) {
    console.error('[Google Ads] Conversion ping failed:', err)
  }
}

/**
 * Send an event to Pinterest Conversions API.
 */
export async function sendPinterestConversion(
  tagId: string,
  eventName: string,
  eventData: {
    value?: number
    currency?: string
    orderId?: string
    contentIds?: string[]
    email?: string
  },
  accessToken?: string,
): Promise<void> {
  if (!tagId || !accessToken) return

  const body = {
    data: [
      {
        event_name: eventName,
        action_source: 'web',
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: process.env.NEXT_PUBLIC_SERVER_URL || '',
        ...(eventData.email && {
          user_data: { em: [eventData.email] },
        }),
        ...(eventData.value !== undefined && {
          custom_data: {
            value: (eventData.value / 100).toFixed(2),
            currency: (eventData.currency || 'GBP').toUpperCase(),
            ...(eventData.orderId && { order_id: eventData.orderId }),
            ...(eventData.contentIds && { content_ids: eventData.contentIds }),
          },
        }),
      },
    ],
  }

  try {
    const res = await fetch(`https://api.pinterest.com/v5/ad_accounts/${tagId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[Pinterest CAPI] Error:', err)
    }
  } catch (err) {
    console.error('[Pinterest CAPI] Request failed:', err)
  }
}

/**
 * Send an event to Reddit Conversions API.
 */
export async function sendRedditConversion(
  eventName: string,
  eventData: EventData,
  payload: Payload,
) {
  const seo = await getSEOSettings(payload)
  const pixelId = seo?.redditPixelId
  const accessToken = seo?.redditConversionsApiToken

  if (!pixelId || !accessToken) return

  const body = {
    test_mode: false,
    events: [
      {
        event_at: new Date().toISOString(),
        event_type: { tracking_type: eventName },
        user: {
          ...(eventData.email && { email: eventData.email }),
        },
        click_id: '',
        event_metadata: {
          ...(eventData.value !== undefined && {
            value_decimal: (eventData.value / 100).toFixed(2),
            currency: (eventData.currency || 'GBP').toUpperCase(),
          }),
          ...(eventData.orderId && { order_id: eventData.orderId }),
          ...(eventData.contentIds && { item_ids: eventData.contentIds }),
        },
      },
    ],
  }

  try {
    const res = await fetch(`https://ads-api.reddit.com/api/v2.0/conversions/events/${pixelId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.text()
      console.error('[Reddit CAPI] Error:', err)
    }
  } catch (err) {
    console.error('[Reddit CAPI] Request failed:', err)
  }
}
