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


const ACK_HTML = (name: string) => `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;color:#3A414C;font-size:16px;line-height:1.6">
  <p>Hi ${name},</p>
  <p>Thank you for your enquiry. We have received it and a member of the team is reviewing the details now.</p>
  <p><strong>What happens next</strong><br>
  We will match you with a specialist employment solicitor from our panel and put you in touch, normally within one working day. There is no charge for this and no obligation to go ahead.</p>
  <p>If your situation is urgent, or you have a tribunal deadline coming up, reply to this email and tell us the date so we can prioritise it.</p>
  <p>A note on what we do: MatchMySolicitor is a matching service, not a firm of solicitors. We do not give legal advice ourselves. Any advice will come from the regulated firm we introduce you to.</p>
  <p>Kind regards,<br>The MatchMySolicitor team</p>
</div>`

const ACK_TEXT = (name: string) => `Hi ${name},

Thank you for your enquiry. We have received it and a member of the team is reviewing the details now.

What happens next
We will match you with a specialist employment solicitor from our panel and put you in touch, normally within one working day. There is no charge for this and no obligation to go ahead.

If your situation is urgent, or you have a tribunal deadline coming up, reply to this email and tell us the date so we can prioritise it.

A note on what we do: MatchMySolicitor is a matching service, not a firm of solicitors. We do not give legal advice ourselves. Any advice will come from the regulated firm we introduce you to.

Kind regards,
The MatchMySolicitor team`

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

  // Confirmation to the person who enquired. Separate try/catch so a failure
  // here can never affect the internal notification above.
  try {
    if (doc.email) {
      const first = String(doc.fullName || '').trim().split(/\s+/)[0] || 'there'
      await sendEmail({
        to: doc.email,
        subject: 'We have received your enquiry | MatchMySolicitor',
        html: ACK_HTML(esc(first)),
        text: ACK_TEXT(first),
      })
    }
  } catch (error) {
    payload.logger.error(`Enquiry acknowledgement failed for enquiry ${doc.id}: ${error}`)
  }

  return doc
}
