import type { CollectionAfterChangeHook } from 'payload'

import { sendEmail } from '@/lib/mailer'

type SubmissionField = { field: string; value: unknown }

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const prettyLabel = (name: string): string =>
  name.replace(/[-_]/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())

/**
 * Emails a notification whenever a form submission is created.
 *
 * Recipients come from the form's own "Emails" tab (form-builder's `emails` array).
 * If a form has no email configured, we fall back to CompanyDetails.email so a
 * submission can never be silently swallowed.
 *
 * Failures are logged, never thrown: a broken mailbox must not lose the lead,
 * which is already persisted in the form-submissions collection.
 */
export const notifyFormSubmission: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req: { payload },
}) => {
  if (operation !== 'create') return doc

  try {
    const submissionData: SubmissionField[] = Array.isArray(doc.submissionData) ? doc.submissionData : []

    const rows = submissionData
      .map(({ field, value }) => {
        const label = escapeHtml(prettyLabel(String(field ?? '')))
        const val = escapeHtml(String(value ?? '')).replace(/\n/g, '<br>')
        return `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600;vertical-align:top">${label}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${val}</td></tr>`
      })
      .join('')

    const text = submissionData.map(({ field, value }) => `${prettyLabel(String(field))}: ${value}`).join('\n')

    const formId = typeof doc.form === 'object' ? doc.form?.id : doc.form
    let formTitle = 'Website form'
    let recipients: string[] = []

    if (formId) {
      const form = await payload.findByID({ collection: 'forms', id: formId, depth: 0 })
      formTitle = form?.title || formTitle
      recipients = (Array.isArray(form?.emails) ? form.emails : [])
        .map((e: { emailTo?: string | null }) => e?.emailTo)
        .filter((to): to is string => Boolean(to))
        .flatMap((to) => to.split(',').map((s) => s.trim()))
        .filter(Boolean)
    }

    if (recipients.length === 0) {
      const company = await payload.findGlobal({ slug: 'company-details', depth: 0 })
      const fallback = (company as { contactEmail?: string } | null)?.contactEmail
      if (fallback) recipients = [fallback]
    }

    if (recipients.length === 0) {
      payload.logger.warn(
        `Form submission ${doc.id} received but no recipient is configured (form "${formTitle}"). Lead is saved but nobody was notified.`,
      )
      return doc
    }

    const html = `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px">
  <h2 style="margin:0 0 4px">New enquiry: ${escapeHtml(formTitle)}</h2>
  <p style="margin:0 0 16px;color:#666;font-size:13px">Received ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })}</p>
  <table style="border-collapse:collapse;width:100%">${rows}</table>
</div>`

    await Promise.all(
      recipients.map((to) =>
        sendEmail({ to, subject: `New enquiry: ${formTitle}`, html, text }).catch((err) =>
          payload.logger.error(`Failed to email form submission ${doc.id} to ${to}: ${err}`),
        ),
      ),
    )
  } catch (error) {
    payload.logger.error(`notifyFormSubmission failed for submission ${doc.id}: ${error}`)
  }

  return doc
}
