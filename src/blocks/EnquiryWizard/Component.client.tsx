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

const INSURANCE_OPTIONS: { value: string; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
]

const STEP_LABELS = ['Who you are', 'Your situation', 'A little more detail', 'Your details']

const TOTAL_STEPS = 4

const fieldClass =
  'w-full px-[14px] py-[13px] rounded-lg border-[1.5px] border-border text-base text-foreground bg-card focus:outline-none focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2'

const fieldLabelClass = 'flex flex-col gap-2 text-[15px] font-semibold text-card-foreground'

export const EnquiryWizardClient: React.FC<EnquiryWizardBlockProps> = ({
  variant = 'page',
  heading,
  subheading,
  eyebrow,
  bullets,
  consentText,
  successMessage,
  presetSituation,
}) => {
  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(variant === 'page')
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = useCallback((patch: Partial<Answers>) => setAnswers((a) => ({ ...a, ...patch })), [])

  // Deep links such as /enquiry?type=employer pre-fill step 1. On the non-page
  // variants the modal is opened too, so an ad click lands mid-flow rather than
  // on a hero the visitor has to re-answer.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    if (type !== 'employer' && type !== 'employee') return
    set({ partyType: type })
    setStep((s) => (s === 1 ? 2 : s))
    if (variant !== 'page') setOpen(true)
  }, [set, variant])

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
    // On a service landing page the situation is already implied by the page
    // itself, so skip the question rather than asking what we already know.
    const preset =
      presetSituation && (SITUATIONS[partyType] || []).includes(presetSituation)
        ? presetSituation
        : undefined
    set(preset ? { partyType, situation: preset } : { partyType })
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

  const PartyOption: React.FC<{
    title: string
    subtitle: string
    selected: boolean
    onClick: () => void
    size?: 'sm' | 'lg'
  }> = ({ title, subtitle, selected, onClick, size = 'sm' }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left rounded-[10px] border-2 bg-card flex flex-col transition-colors focus-visible:outline-2 focus-visible:outline-(--accent) focus-visible:outline-offset-2 ${
        size === 'lg' ? 'p-6 gap-1.5 hover:border-card-foreground' : 'px-5 py-[18px] gap-1.5 hover:border-accent'
      } ${selected ? 'border-primary' : 'border-border'}`}
    >
      <span className={`font-bold text-card-foreground ${size === 'lg' ? 'text-lg' : 'text-[17px]'}`}>
        {title}
      </span>
      <span className="text-sm leading-snug text-muted-foreground">{subtitle}</span>
    </button>
  )

  const body = submitted ? (
    <div className="text-center py-10 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-(--mms-rule) text-(--accent) flex items-center justify-center text-2xl">
        ✓
      </div>
      <h3 className="text-2xl font-bold">Enquiry received</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{successMessage}</p>
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
        <div className="flex justify-between text-[13px] font-semibold text-muted-foreground">
          <span>{STEP_LABELS[step - 1]}</span>
          <span>
            Step {step} of {TOTAL_STEPS}
          </span>
        </div>
        <div className="h-[6px] rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">First things first, which side are you on?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PartyOption
              size="lg"
              title="I'm an employer"
              subtitle="Facing a claim, negotiating a settlement, or need urgent representation"
              selected={answers.partyType === 'employer'}
              onClick={() => chooseParty('employer')}
            />
            <PartyOption
              size="lg"
              title="I'm an employee"
              subtitle="Dismissed, discriminated against, or negotiating an exit or settlement"
              selected={answers.partyType === 'employee'}
              onClick={() => chooseParty('employee')}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">What is your situation?</h3>
          <label className={fieldLabelClass}>
            What&apos;s your situation?
            <select
              className={fieldClass}
              value={answers.situation || ''}
              onChange={(e) => set({ situation: e.target.value })}
            >
              <option value="">Please select…</option>
              {(SITUATIONS[answers.partyType || 'employee'] || []).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          {answers.partyType === 'employee' && (
            <label className={fieldLabelClass}>
              Length of service
              <select
                className={fieldClass}
                value={answers.tenure || ''}
                onChange={(e) => set({ tenure: e.target.value })}
              >
                <option value="">Please select…</option>
                {TENURE.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          )}
          {answers.partyType === 'employee' && (
            <label className={fieldLabelClass}>
              What is your approximate salary?
              <select
                className={fieldClass}
                value={answers.salary || ''}
                onChange={(e) => set({ salary: e.target.value })}
              >
                <option value="">Please select…</option>
                {SALARY.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          )}
          <div className="flex flex-col gap-2.5">
            <span className="text-[15px] font-semibold text-card-foreground">
              Do you have legal expenses insurance?
            </span>
            <div className="flex gap-2.5 flex-wrap">
              {INSURANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={answers.legalExpensesInsurance === opt.value}
                  onClick={() => set({ legalExpensesInsurance: opt.value })}
                  className={`px-[22px] py-[11px] rounded-lg text-[15px] font-semibold border-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2 ${
                    answers.legalExpensesInsurance === opt.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-card-foreground hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-[13px] leading-snug text-(--mms-muted-light)">
              Often included with home or car insurance, &quot;not sure&quot; is a perfectly good answer.
            </span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">Tell us a little more</h3>
          <div className="flex flex-col gap-2">
            <label className={fieldLabelClass}>
              Brief description of your situation
              <textarea
                className={`${fieldClass} resize-y`}
                rows={5}
                maxLength={500}
                placeholder="What happened, roughly when, and where things stand now…"
                value={answers.details || ''}
                onChange={(e) => set({ details: e.target.value })}
              />
            </label>
            <div className="flex justify-between gap-4 text-[13px] text-(--mms-muted-light)">
              <span>Please describe in your own words. Two paragraphs is fine.</span>
              <span className="shrink-0">{(answers.details || '').length}/500</span>
            </div>
          </div>
          <label className={fieldLabelClass}>
            Where are you based?
            <select
              className={fieldClass}
              value={answers.region || ''}
              onChange={(e) => set({ region: e.target.value })}
            >
              <option value="">Please select…</option>
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-5">
          <h3 className="text-2xl font-bold">Where should the solicitor reach you?</h3>
          <label className={fieldLabelClass}>
            Your name
            <input
              className={fieldClass}
              placeholder="Full name"
              value={answers.fullName || ''}
              onChange={(e) => set({ fullName: e.target.value })}
            />
          </label>
          <label className={fieldLabelClass}>
            Phone number
            <input
              className={fieldClass}
              type="tel"
              placeholder="Best number to call"
              value={answers.phone || ''}
              onChange={(e) => set({ phone: e.target.value })}
            />
          </label>
          <label className={fieldLabelClass}>
            Email address
            <input
              className={fieldClass}
              type="email"
              placeholder="you@example.com"
              value={answers.email || ''}
              onChange={(e) => set({ email: e.target.value })}
            />
          </label>
          <label className="flex gap-3 items-start rounded-lg border-[1.5px] border-border bg-muted p-[18px] text-sm leading-relaxed text-card-foreground cursor-pointer transition-colors hover:border-primary">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 accent-primary"
              checked={Boolean(answers.consent)}
              onChange={(e) => set({ consent: e.target.checked })}
            />
            <span>{consentText}</span>
          </label>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 border-t border-(--mms-rule) pt-5">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="text-[15px] font-semibold text-muted-foreground hover:text-card-foreground"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        {step < TOTAL_STEPS ? (
          <button
            type="button"
            disabled={!stepValid}
            onClick={() => setStep((s) => s + 1)}
            className="ml-auto px-7 py-[14px] rounded-lg bg-primary text-primary-foreground font-bold text-base transition-colors hover:bg-(--mms-primary-hover) disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            disabled={!stepValid || submitting}
            onClick={submit}
            className="ml-auto px-7 py-[14px] rounded-lg bg-primary text-primary-foreground font-bold text-base transition-colors hover:bg-(--mms-primary-hover) disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2"
          >
            {submitting ? 'Sending…' : 'Submit my enquiry'}
          </button>
        )}
      </div>
    </div>
  )

  if (variant === 'page') {
    return (
      <section className="sp-56-96">
        <div className="container-inner">
          <div className="max-w-[720px] mx-auto">
            <div className="text-center flex flex-col gap-3 mb-9">
              {heading && (
                <h2 className="text-[clamp(24px,4.4vw,34px)] font-bold tracking-tight">{heading}</h2>
              )}
              {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
            </div>
            <div className="bg-card border border-[#E4E7EC] rounded-xl p-10 flex flex-col gap-7">
              {body}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // The step-1 card. On inline-hero this is the right-hand column of the hero;
  // on the modal-trigger variant it is a centred standalone section.
  const starter = (
    <div className="bg-card rounded-[12px] p-7 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wider text-(--mms-muted-light)">
          Step 1 of 4
        </span>
        <span className="text-[13px] text-(--mms-muted-light)">Takes about 2 minutes</span>
      </div>
      <div className="h-1 rounded-full bg-(--mms-rule) overflow-hidden">
        <div className="h-full w-1/4 rounded-full bg-primary" />
      </div>
      <h2 className="text-[21px] font-bold">Are you an employee or an employer?</h2>
      <div className="flex flex-col gap-3">
        <PartyOption
          title="I'm an employee"
          subtitle="Dismissed, facing an exit, or treated unfairly at work"
          selected={answers.partyType === 'employee'}
          onClick={() => chooseParty('employee')}
        />
        <PartyOption
          title="I'm an employer"
          subtitle="Defending a claim or planning a departure"
          selected={answers.partyType === 'employer'}
          onClick={() => chooseParty('employer')}
        />
      </div>
      <p className="text-[13px] leading-relaxed text-(--mms-muted-light)">
        <span aria-hidden="true">🔒</span> Secure · Your details are only shared with the firm we
        match you to
      </p>
    </div>
  )

  const modal = open && (
    <div
      role="dialog"
      aria-modal="true"
      /* Matches .wiz-overlay / .wiz-panel in the design's styles.css: centred
         560px panel on desktop, full-screen sheet on phones (dvh so mobile
         browser chrome doesn't crop it). */
      className="fixed inset-0 z-[90] flex items-stretch sm:items-center justify-center bg-[rgba(16,20,26,0.62)] p-0 sm:py-8 sm:px-6"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-card w-full sm:w-[min(560px,100%)] min-h-[100dvh] sm:min-h-0 sm:max-h-[calc(100vh-64px)] sm:rounded-[14px] overflow-y-auto p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mb-4 text-2xl leading-none text-[#98A1AE] hover:text-card-foreground focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2"
          aria-label="Close"
        >
          ×
        </button>
        {body}
      </div>
    </div>
  )

  if (variant === 'inline-hero') {
    // A complete hero: copy on the left, form on the right at >=lg, stacked on
    // mobile with the form directly under the copy.
    return (
      <>
        <section className="sp-80-72 bg-(--card-foreground) text-primary-foreground">
          <div className="container-inner grid grid-cols-[repeat(auto-fit,minmax(330px,1fr))] gap-14 items-center">
            <div>
              {eyebrow && (
                <p className="uppercase tracking-widest text-xs font-bold text-(--accent) mb-4">
                  {eyebrow}
                </p>
              )}
              {heading && (
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-primary-foreground">
                  {heading}
                </h1>
              )}
              {subheading && (
                <p className="text-lg text-(--mms-on-dark-muted) max-w-xl">{subheading}</p>
              )}
              {Array.isArray(bullets) && bullets.length > 0 && (
                <ul className="mt-7 grid gap-3">
                  {bullets.map((b, i) => (
                    <li key={b?.id || i} className="flex gap-3 items-start text-[15px]">
                      <span aria-hidden="true" className="mt-0.5 shrink-0 font-bold text-(--accent)">
                        ✓
                      </span>
                      <span>{b?.text}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="lg:justify-self-end w-full lg:max-w-md">{starter}</div>
          </div>
        </section>
        {modal}
      </>
    )
  }

  return (
    <>
      <section className="sp-80">
        <div className="container-inner">
          <div className="max-w-3xl mx-auto text-center">
            {heading && (
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">{heading}</h2>
            )}
            {subheading && <p className="text-muted-foreground mb-8">{subheading}</p>}
            <div className="max-w-md mx-auto text-left">{starter}</div>
          </div>
        </div>
      </section>
      {modal}
    </>
  )
}
