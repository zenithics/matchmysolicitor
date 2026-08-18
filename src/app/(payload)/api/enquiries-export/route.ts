import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { headers as nextHeaders } from 'next/headers'

const COLUMNS: [string, string][] = [
  ['id', 'ID'],
  ['createdAt', 'Received'],
  ['partyType', 'Employer/Employee'],
  ['fullName', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['situation', 'Situation'],
  ['region', 'Region'],
  ['tenure', 'Length of service'],
  ['salary', 'Salary'],
  ['legalExpensesInsurance', 'Legal expenses insurance'],
  ['details', 'Details'],
  ['status', 'Status'],
  ['assignedFirm', 'Matched firm'],
  ['rejectionReason', 'Rejection / feedback'],
  ['source', 'Source'],
  ['campaign', 'Campaign'],
  ['landingPath', 'Landing path'],
]

const cell = (v: unknown): string => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** CSV export of every lead, for pay-per-lead reconciliation. Admin auth required. */
export const GET = async (): Promise<Response> => {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await nextHeaders() })
  if (!user) return new Response('Unauthorised', { status: 401 })

  const { docs } = await payload.find({ collection: 'enquiries', limit: 10000, depth: 0, sort: '-createdAt' })

  const rows = [
    COLUMNS.map(([, label]) => label).join(','),
    ...docs.map((d) => COLUMNS.map(([key]) => cell((d as unknown as Record<string, unknown>)[key])).join(',')),
  ].join('\n')

  return new Response(rows, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="mms-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
