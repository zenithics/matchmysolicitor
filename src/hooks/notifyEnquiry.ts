import type { CollectionAfterChangeHook } from 'payload'

import { sendEmail } from '@/lib/mailer'

const esc = (v: unknown): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const ROWS: [string, string][] = [
  ['Name', 'fullName'],
  ['Email', 'email'],
  ['Phone', 'phone'],
  ['Employer / Employee', 'partyType'],
  ['Situation', 'situation'],
  ['Length of service', 'tenure'],
  ['Salary', 'salary'],
  ['Legal expenses insurance', 'legalExpensesInsurance'],
  ['Region', 'region'],
  ['Details', 'details'],
  ['Source', 'source'],
  ['Campaign', 'campaign'],
]

/**
 * Emails a new enquiry the moment it is created.
 *
 * Recipients: ENQUIRY_NOTIFY_EMAILS (comma separated), falling back to
 * CompanyDetails.contactEmail. Never throws — the lead is already persisted,
 * and a mail outage must not turn a paid lead into a 500 for the user.
 */
export const notifyEnquiry: CollectionAfterChangeHook = async ({ doc, operation, req: { payload } }) => {
  if (operation !== 'create') return doc

  try {
    let recipients = (process.env.ENQUIRY_NOTIFY_EMAILS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (recipients.length === 0) {
      const company = await payload.findGlobal({ slug: 'company-details', depth: 0 })
      const fallback = (company as { contactEmail?: string } | null)?.contactEmail
      if (fallback) recipients = [fallback]
    }

    if (recipients.length === 0) {
      payload.logger.warn(`Enquiry ${doc.id} received but no notification recipient is configured.`)
      return doc
    }

    const rows = ROWS.filter(([, key]) => doc[key])
      .map(
        ([label, key]) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${esc(doc[key]).replace(/\n/g, '<br>')}</td></tr>`,
      )
      .join('')

    const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px">
  <h2 style="margin:0 0 4px">New enquiry — ${esc(doc.partyType)}</h2>
  <p style="margin:0 0 16px;color:#666;font-size:13px">${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
  <table style="border-collapse:collapse;width:100%">${rows}</table>
</div>`

    const text = ROWS.filter(([, key]) => doc[key]).map(([label, key]) => `${label}: ${doc[key]}`).join('\n')

    await Promise.all(
      recipients.map((to) =>
        sendEmail({ to, subject: `New enquiry: ${doc.fullName || 'website'} (${doc.partyType || 'unknown'})`, html, text }).catch(
          (err) => payload.logger.error(`Failed to email enquiry ${doc.id} to ${to}: ${err}`),
        ),
      ),
    )
  } catch (error) {
    payload.logger.error(`notifyEnquiry failed for enquiry ${doc.id}: ${error}`)
  }

  return doc
}
