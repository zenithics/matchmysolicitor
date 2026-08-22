import crypto from 'crypto'

import type { CollectionAfterChangeHook } from 'payload'

/**
 * Posts every enquiry to one or more outbound webhook endpoints so leads can be
 * pushed into automations (n8n, Zapier, Make, a partner CRM) without polling.
 *
 * Config, via Vercel env vars:
 *   ENQUIRY_WEBHOOK_URLS    comma separated list of endpoints
 *   ENQUIRY_WEBHOOK_SECRET  optional; if set, each request carries an
 *                           X-MMS-Signature header of sha256=HMAC(body)
 *
 * Fires on create, and on update when the status changes, so a downstream
 * system can track a lead through to Converted / Rejected.
 *
 * Never throws: the lead is already persisted and a dead endpoint must not
 * turn a paid lead into a 500 for the person filling the form.
 */
export const webhookEnquiry: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req: { payload },
}) => {
  // CMS-configured endpoints (Lead Delivery global) win; env vars are the fallback.
  let urls: string[] = []
  let secret = process.env.ENQUIRY_WEBHOOK_SECRET
  try {
    const settings = (await payload.findGlobal({ slug: 'lead-delivery', depth: 0 })) as {
      webhooksEnabled?: boolean
      webhooks?: { url?: string; enabled?: boolean }[]
      webhookSecret?: string
    } | null

    if (settings?.webhooksEnabled === false) return doc
    urls = (settings?.webhooks || [])
      .filter((w) => w?.url && w.enabled !== false)
      .map((w) => String(w.url).trim())
      .filter(Boolean)
    if (settings?.webhookSecret) secret = settings.webhookSecret
  } catch (err) {
    payload.logger.warn(`Lead Delivery settings unavailable, using env vars: ${(err as Error).message}`)
  }

  if (urls.length === 0) {
    urls = (process.env.ENQUIRY_WEBHOOK_URLS || '')
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean)
  }

  if (urls.length === 0) return doc

  let event: string | null = null
  if (operation === 'create') event = 'enquiry.created'
  else if (previousDoc && previousDoc.status !== doc.status) event = 'enquiry.status_changed'

  if (!event) return doc

  const payloadBody = JSON.stringify({
    event,
    site: 'matchmysolicitor.co.uk',
    sentAt: new Date().toISOString(),
    previousStatus: operation === 'create' ? null : (previousDoc?.status ?? null),
    enquiry: {
      id: doc.id,
      createdAt: doc.createdAt,
      fullName: doc.fullName,
      email: doc.email,
      phone: doc.phone,
      partyType: doc.partyType,
      situation: doc.situation,
      region: doc.region,
      tenure: doc.tenure,
      salary: doc.salary,
      legalExpensesInsurance: doc.legalExpensesInsurance,
      details: doc.details,
      consent: doc.consent,
      status: doc.status,
      rejectionReason: doc.rejectionReason ?? null,
      source: doc.source,
      campaign: doc.campaign,
      adminUrl: `${process.env.NEXT_PUBLIC_SERVER_URL || ''}/admin/collections/enquiries/${doc.id}`,
    },
  })

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'MatchMySolicitor-Webhook/1.0',
    'X-MMS-Event': event,
  }

  if (secret) {
    headers['X-MMS-Signature'] =
      'sha256=' + crypto.createHmac('sha256', secret).update(payloadBody).digest('hex')
  }

  await Promise.all(
    urls.map(async (url) => {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers,
            body: payloadBody,
            signal: AbortSignal.timeout(10000),
          })
          if (res.ok) {
            payload.logger.info(`Enquiry webhook ${event} -> ${url} (${res.status})`)
            return
          }
          payload.logger.warn(
            `Enquiry webhook ${url} returned ${res.status} (attempt ${attempt}/3)`,
          )
        } catch (err) {
          payload.logger.warn(
            `Enquiry webhook ${url} failed on attempt ${attempt}/3: ${(err as Error).message}`,
          )
        }
        if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 1000))
      }
      payload.logger.error(`Enquiry webhook permanently failed for ${url}`)
    }),
  )

  return doc
}
