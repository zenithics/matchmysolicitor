'use client'

import React, { useCallback, useEffect, useState } from 'react'

import type { EnquiryWizardBlock as EnquiryWizardBlockProps } from '@/payload-types'

type Answers = {
  partyType?: 'employee' | 'employer'
  situation?: string
  tenure?: string
  salary?: string
  legalExpensesInsurance?: string
  region?: string
  details?: string
  fullName?: string
  email?: string
  phone?: string
  consent?: boolean
}

const SITUATIONS: Record<string, string[]> = {
  employee: [
    'Unfair dismissal',
    'Constructive dismissal',
    'Discrimination',
    'Settlement agreement',
    'Redundancy',
    'Employment tribunal claim',
    'Something else',
  ],
  employer: [
    'Tribunal defence',
    'Settlement agreement',
    'Dismissal process',
    'Redundancy programme',
    'Grievance or disciplinary',
    'Something else',
  ],
}

const TENURE = ['Less than 2 years', '2–5 years', '5–10 years', 'More than 10 years']
const SALARY = ['Under £30,000', '£30,000–£60,000', '£60,000–£100,000', 'Over £100,000']
const REGIONS = [
  'London & South East',
  'South West',
  'Midlands',
  'North West',
  'North East & Yorkshire',
  'Wales',
  'Scotland',
  'Northern Ireland',
]

const TOTAL_STEPS = 4

export const EnquiryWizardClient: React.FC<EnquiryWizardBlockProps> = ({
  variant = 'page',
  heading,
  subheading,
  consentText,
  successMessage,
}) => {
  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(variant === 'page')
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = useCallback((patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch })), [])

  // Deep links such as /enquiry?type=employer&case=tribunal-defence pre-fill step 1.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    if (type === 'employer' || type === 'employee') {
      set({ partyType: type })
      setStep((s) => (s === 1 ? 2 : s))
    }
  }, [set])

  // Lock body scroll while the overlay is open on mobile.
  useEffect(() => {
    if (variant === 'page' || typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, variant])

  const stepValid = (() => {
    switch (step) {
      case 1:
        return Boolean(answers.partyType)
      case 2:
        return Boolean(answers.situation)
      case 3:
        return Boolean(answers.region)
      case 4:
        return Boolean(answers.fullName && answers.email && answers.phone && answers.consent)
      default:
        return false
    }
  })()

  const chooseParty = (partyType: 'employee' | 'employer') => {
    set({ partyType })
    setOpen(true)
    setStep(2)
  }

  const submit = async () => {
    if (!stepValid || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...answers,
          source: params?.get('utm_source') || undefined,
          campaign: params?.get('utm_campaign') || undefined,
          landingPath: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      })
      if (!res.ok) throw new Error(`Submission failed (${res.status})`)
      setSubmitted(true)
    } catch (err) {
      setError('Sorry, something went wrong sending your enquiry. Please call us or try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const Option: React.FC<{ label: string; selected: boolean; onClick: () => void }> = ({
    label,
    selected,
    onClick,
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left px-4 py-3 rounded-lg border transition ${
        selected ? 'border-primary bg-primary/5 font-semibold' : 'border-border hover:border-primary/50'
      }`}
    >
      {label}
    </button>
  )

  const field =
    'w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/40'

  const body = submitted ? (
    <div className="text-center py-10">
      <h3 className="text-2xl font-semibold mb-3">Enquiry received</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{successMessage}</p>
    </div>
  ) : (
    <div>
      <div className="flex items-center gap-2 mb-6" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-primary' : 'bg-border'}`}
          />
        ))}
      </div>

      {step === 1 && (
        <div className="grid gap-3">
          <h3 className="text-xl font-semibold mb-1">Are you an employee or an employer?</h3>
          <Option label="I'm an employee" selected={answers.partyType === 'employee'} onClick={() => chooseParty('employee')} />
          <Option label="I'm an employer" selected={answers.partyType === 'employer'} onClick={() => chooseParty('employer')} />
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-3">
          <h3 className="text-xl font-semibold mb-1">What is your situation?</h3>
          {(SITUATIONS[answers.partyType || 'employee'] || []).map((s) => (
            <Option key={s} label={s} selected={answers.situation === s} onClick={() => set({ situation: s })} />
          ))}
          {answers.partyType === 'employee' && (
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              <select className={field} value={answers.tenure || ''} onChange={(e) => set({ tenure: e.target.value })}>
                <option value="">Length of service…</option>
                {TENURE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <select className={field} value={answers.salary || ''} onChange={(e) => set({ salary: e.target.value })}>
                <option value="">Salary…</option>
                {SALARY.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
          <select
            className={field}
            value={answers.legalExpensesInsurance || ''}
            onChange={(e) => set({ legalExpensesInsurance: e.target.value })}
          >
            <option value="">Do you have legal expenses insurance?</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
            <option value="unsure">Not sure</option>
          </select>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-3">
          <h3 className="text-xl font-semibold mb-1">Tell us a little more</h3>
          <textarea
            className={field}
            rows={5}
            placeholder="Briefly describe what has happened…"
            value={answers.details || ''}
            onChange={(e) => set({ details: e.target.value })}
          />
          <select className={field} value={answers.region || ''} onChange={(e) => set({ region: e.target.value })}>
            <option value="">Where are you based?</option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-3">
          <h3 className="text-xl font-semibold mb-1">Where should the solicitor reach you?</h3>
          <input className={field} placeholder="Full name" value={answers.fullName || ''} onChange={(e) => set({ fullName: e.target.value })} />
          <input className={field} type="email" placeholder="Email" value={answers.email || ''} onChange={(e) => set({ email: e.target.value })} />
          <input className={field} type="tel" placeholder="Phone" value={answers.phone || ''} onChange={(e) => set({ phone: e.target.value })} />
          <label className="flex gap-3 items-start text-sm text-muted-foreground mt-2">
            <input type="checkbox" className="mt-1" checked={Boolean(answers.consent)} onChange={(e) => set({ consent: e.target.checked })} />
            <span>{consentText}</span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mt-8">
        {step > 1 ? (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="text-sm underline">
            Back
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            disabled={!stepValid}
            onClick={() => setStep((s) => s + 1)}
            className="px-7 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={!stepValid || submitting}
            onClick={submit}
            className="px-7 py-3 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-40"
          >
            {submitting ? 'Sending…' : 'Submit my enquiry'}
          </button>
        )}
      </div>
    </div>
  )

  if (variant === 'page') {
    return (
      <section className="py-16">
        <div className="container max-w-2xl">
          {heading && <h2 className="text-3xl md:text-4xl tracking-tight mb-3">{heading}</h2>}
          {subheading && <p className="text-muted-foreground mb-8">{subheading}</p>}
          {body}
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-14">
        <div className="container max-w-3xl text-center">
          {heading && <h2 className="text-3xl md:text-4xl tracking-tight mb-3">{heading}</h2>}
          {subheading && <p className="text-muted-foreground mb-8">{subheading}</p>}
          <div className="grid sm:grid-cols-2 gap-4 max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => chooseParty('employee')}
              className="px-6 py-5 rounded-xl border border-border hover:border-primary transition font-semibold"
            >
              I&apos;m an employee
            </button>
            <button
              type="button"
              onClick={() => chooseParty('employer')}
              className="px-6 py-5 rounded-xl border border-border hover:border-primary transition font-semibold"
            >
              I&apos;m an employer
            </button>
          </div>
        </div>
      </section>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-background w-full sm:max-w-2xl h-full sm:h-auto sm:rounded-2xl overflow-y-auto p-6 sm:p-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setOpen(false)} className="mb-4 text-sm underline" aria-label="Close">
              Close
            </button>
            {body}
          </div>
        </div>
      )}
    </>
  )
}
