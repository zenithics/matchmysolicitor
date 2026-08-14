import { getPayload } from 'payload'
import configPromise from '@payload-config'

interface SubscribeOptions {
  email: string
  firstName?: string
  lastName?: string
}

/**
 * Subscribe an email to the configured newsletter provider.
 * Reads config from the NewsletterSettings global.
 */
export async function subscribeToNewsletter({
  email,
  firstName,
  lastName,
}: SubscribeOptions): Promise<{ success: boolean; message: string }> {
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({ slug: 'newsletter-settings' })) as any

  const provider = settings?.provider || 'none'

  if (provider === 'none') {
    console.log(`[Newsletter] No provider configured. Email collected: ${email}`)
    return { success: true, message: 'Subscribed successfully.' }
  }

  try {
    if (provider === 'mailchimp') {
      return await subscribeMailchimp(settings, { email, firstName, lastName })
    }

    if (provider === 'convertkit') {
      return await subscribeConvertKit(settings, { email, firstName, lastName })
    }

    if (provider === 'brevo') {
      return await subscribeBrevo(settings, { email, firstName, lastName })
    }

    return { success: false, message: 'Unknown newsletter provider configured.' }
  } catch (err: any) {
    console.error('[Newsletter] Subscription error:', err)
    return { success: false, message: err?.message || 'Failed to subscribe.' }
  }
}

async function subscribeMailchimp(
  settings: any,
  { email, firstName, lastName }: SubscribeOptions,
): Promise<{ success: boolean; message: string }> {
  const { mailchimpApiKey, mailchimpListId, mailchimpServer } = settings

  if (!mailchimpApiKey || !mailchimpListId || !mailchimpServer) {
    return { success: false, message: 'Mailchimp is not fully configured.' }
  }

  const url = `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`

  const body: Record<string, unknown> = {
    email_address: email,
    status: 'subscribed',
  }

  if (firstName || lastName) {
    body.merge_fields = {
      ...(firstName && { FNAME: firstName }),
      ...(lastName && { LNAME: lastName }),
    }
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `apikey ${mailchimpApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  // "Member Exists" is treated as success
  if (res.status === 400 && data.title === 'Member Exists') {
    return { success: true, message: 'You are already subscribed.' }
  }

  if (!res.ok) {
    return { success: false, message: data.detail || 'Mailchimp subscription failed.' }
  }

  return { success: true, message: 'Subscribed successfully.' }
}

async function subscribeConvertKit(
  settings: any,
  { email, firstName }: SubscribeOptions,
): Promise<{ success: boolean; message: string }> {
  const { convertkitApiKey, convertkitFormId } = settings

  if (!convertkitApiKey || !convertkitFormId) {
    return { success: false, message: 'ConvertKit is not fully configured.' }
  }

  const url = `https://api.convertkit.com/v3/forms/${convertkitFormId}/subscribe`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: convertkitApiKey,
      email,
      ...(firstName && { first_name: firstName }),
    }),
  })

  if (!res.ok) {
    const data = await res.json()
    return { success: false, message: data.message || 'ConvertKit subscription failed.' }
  }

  return { success: true, message: 'Subscribed successfully.' }
}

async function subscribeBrevo(
  settings: any,
  { email, firstName, lastName }: SubscribeOptions,
): Promise<{ success: boolean; message: string }> {
  const { brevoApiKey, brevoListId } = settings

  if (!brevoApiKey) {
    return { success: false, message: 'Brevo API key is not configured.' }
  }

  const body: Record<string, unknown> = {
    email,
    updateEnabled: true,
    ...(firstName || lastName
      ? { attributes: { ...(firstName && { FIRSTNAME: firstName }), ...(lastName && { LASTNAME: lastName }) } }
      : {}),
    ...(brevoListId ? { listIds: [brevoListId] } : {}),
  }

  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  // 204 = success with no body, 400 with "Contact already exist" = OK
  if (res.status === 204 || res.status === 201) {
    return { success: true, message: 'Subscribed successfully.' }
  }

  const data = await res.json()

  if (res.status === 400 && data.code === 'duplicate_parameter') {
    return { success: true, message: 'You are already subscribed.' }
  }

  return { success: false, message: data.message || 'Brevo subscription failed.' }
}
