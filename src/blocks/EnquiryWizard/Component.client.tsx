'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { pushDataLayer } from '@/utilities/dataLayer'

import {
  DEFAULT_ENQUIRY_FORM,
  type EnquiryFormDefinition,
  type EnquiryOption,
  type EnquiryQuestion,
} from './formSchema'

import type { EnquiryWizardBlock as EnquiryWizardBlockProps } from '@/payload-types'

type AnswerValue = string | boolean | undefined
type Answers = Record<string, AnswerValue>

type Props = EnquiryWizardBlockProps & { formDefinition?: EnquiryFormDefinition }

const fieldClass =
  'w-full px-[14px] py-[13px] rounded-lg border-[1.5px] border-border text-base text-foreground bg-card focus:outline-none focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2'

const fieldLabelClass = 'flex flex-col gap-2 text-[15px] font-semibold text-card-foreground'

const optionValue = (o: EnquiryOption) => (o.value || o.label || '').toString()

const splitList = (raw?: string | null): string[] =>
  (raw || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

/** Questions can be gated on an earlier answer (e.g. employee-only questions). */
const isQuestionVisible = (q: EnquiryQuestion, answers: Answers): boolean => {
  const allowed = splitList(q.showWhenValues)
  if (!q.dependsOn || allowed.length === 0) return true
  return allowed.includes(String(answers[q.dependsOn] ?? ''))
}

/** Options can be gated the same way (e.g. employer vs employee matter types). */
const visibleOptions = (q: EnquiryQuestion, answers: Answers): EnquiryOption[] => {
  const options = Array.isArray(q.options) ? q.options : []
  return options.filter((o) => {
    const allowed = splitList(o.showWhen)
    if (allowed.length === 0) return true
    if (!q.dependsOn) return true
    return allowed.includes(String(answers[q.dependsOn] ?? ''))
  })
}

const isAnswered = (q: EnquiryQuestion, answers: Answers): boolean => {
  const v = answers[q.name]
  if (q.type === 'checkbox') return v === true
  return typeof v === 'string' && v.trim().length > 0
}

export const EnquiryWizardClient: React.FC<Props> = ({
  variant = 'page',
  heading,
  subheading,
  eyebrow,
  bullets,
  consentText,
  successMessage,
  presetSituation,
  formDefinition,
}) => {
  const form = formDefinition || DEFAULT_ENQUIRY_FORM
  const steps = form.steps
  const totalSteps = steps.length

  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(variant === 'page')
  const [answers, setAnswers] = useState<Answers>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = useCallback((patch: Answers) => setAnswers((a) => ({ ...a, ...patch })), [])

  // The block-level copy fields stay as per-placement overrides of the shared
  // form definition, so a landing page can vary the consent line or thank-you.
  const consentCopy = consentText || form.consentText || ''
  const successCopy = successMessage || form.successMessage || ''

  const allQuestions = useMemo(
    () => steps.flatMap((s) => (Array.isArray(s.questions) ? s.questions : [])),
    [steps],
  )

  const questionByMapTo = useCallback(
    (mapTo: string) => allQuestions.find((q) => q.mapTo === mapTo),
    [allQuestions],
  )

  /** Canonical answers keyed by Enquiry field, for the API and for tracking. */
  const mapped = useMemo(() => {
    const out: Record<string, AnswerValue> = {}
    const extra: Record<string, AnswerValue> = {}
    allQuestions.forEach((q) => {
      const v = answers[q.name]
      if (v === undefined || v === '') return
      if (!isQuestionVisible(q, answers)) return
      if (!q.mapTo || q.mapTo === 'extra') extra[q.label || q.name] = v
      else out[q.mapTo] = v
    })
    return { out, extra }
  }, [allQuestions, answers])

  // Analytics: one enquiry_start per visit, and one event per step completed.
  const startedRef = useRef(false)
  const stepsSentRef = useRef<Set<number>>(new Set())

  const trackStepComplete = useCallback(
    (completedStep: number, extraProps: Record<string, unknown> = {}) => {
      if (stepsSentRef.current.has(completedStep)) return
      stepsSentRef.current.add(completedStep)
      pushDataLayer({
        event: 'enquiry_step_complete',
        step_number: completedStep,
        step_name: steps[completedStep - 1]?.label,
        ...extraProps,
      })
    },
    [steps],
  )

  // Deep links such as /enquiry?type=employer pre-fill the party question. On
  // the non-page variants the modal is opened too, so an ad click lands
  // mid-flow rather than on a hero the visitor has to re-answer.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type')
    if (type !== 'employer' && type !== 'employee') return
    const q = questionByMapTo('partyType')
    if (!q) return
    set({ [q.name]: type })
    setStep((s) => (s === 1 ? 2 : s))
    if (variant !== 'page') setOpen(true)
  }, [questionByMapTo, set, variant])

  // Lock body scroll while the overlay is open on mobile.
  useEffect(() => {
    if (variant === 'page' || typeof document === 'undefined') return
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, variant])

  const currentQuestions = useMemo(() => {
    const qs = steps[step - 1]?.questions
    return (Array.isArray(qs) ? qs : []).filter((q) => isQuestionVisible(q, answers))
  }, [answers, step, steps])

  const stepValid = currentQuestions
    .filter((q) => q.required)
    .every((q) => isAnswered(q, answers))

  const trackingProps = useCallback(
    () => ({
      party_type: mapped.out.partyType,
      matter_type: mapped.out.situation,
      region: mapped.out.region,
    }),
    [mapped],
  )

  /** First "cards" question of step 1 — the hero starter card. */
  const starterQuestion = useMemo(() => {
    const qs = steps[0]?.questions
    return (Array.isArray(qs) ? qs : []).find((q) => q.type === 'cards')
  }, [steps])

  const chooseStarter = (q: EnquiryQuestion, value: string) => {
    // On a service landing page the situation is already implied by the page
    // itself, so skip the question rather than asking what we already know.
    const situationQ = questionByMapTo('situation')
    const patch: Answers = { [q.name]: value }
    let preset: string | undefined
    if (presetSituation && situationQ) {
      const allowed = visibleOptions(situationQ, { ...answers, [q.name]: value }).map(optionValue)
      if (allowed.includes(presetSituation)) {
        preset = presetSituation
        patch[situationQ.name] = presetSituation
      }
    }
    if (!startedRef.current) {
      startedRef.current = true
      pushDataLayer({
        event: 'enquiry_start',
        party_type: q.mapTo === 'partyType' ? value : undefined,
        matter_type: preset,
        form_variant: variant,
        landing_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
      })
    }
    trackStepComplete(1, {
      party_type: q.mapTo === 'partyType' ? value : undefined,
      matter_type: preset,
    })
    set(patch)
    setOpen(true)
    setStep(2)
  }

  const submit = async () => {
    if (!stepValid || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const params =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...mapped.out,
          extraAnswers: Object.keys(mapped.extra).length ? mapped.extra : undefined,
          source: params?.get('utm_source') || undefined,
          campaign: params?.get('utm_campaign') || undefined,
          landingPath: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      })
      if (!res.ok) throw new Error(`Submission failed (${res.status})`)
      let enquiryId: string | undefined
      try {
        const json = await res.clone().json()
        enquiryId = json?.doc?.id ?? json?.id
      } catch {
        // Response body is not required for tracking.
      }
      trackStepComplete(totalSteps, trackingProps())
      pushDataLayer({
        event: 'enquiry_submit',
        ...trackingProps(),
        tenure: mapped.out.tenure,
        salary_band: mapped.out.salary,
        legal_expenses_insurance: mapped.out.legalExpensesInsurance,
        form_variant: variant,
        landing_path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        utm_source: params?.get('utm_source') || undefined,
        utm_campaign: params?.get('utm_campaign') || undefined,
        enquiry_id: enquiryId,
      })
      setSubmitted(true)
    } catch (err) {
      pushDataLayer({
        event: 'enquiry_error',
        ...trackingProps(),
        error_message: err instanceof Error ? err.message : 'unknown',
      })
      setError(form.errorMessage || DEFAULT_ENQUIRY_FORM.errorMessage || 'Something went wrong.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const PartyOption: React.FC<{
    title: string
    subtitle?: string | null
    selected: boolean
    onClick: () => void
    size?: 'sm' | 'lg'
  }> = ({ title, subtitle, selected, onClick, size = 'sm' }) => (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`text-left rounded-[10px] border-2 bg-card flex flex-col transition-colors focus-visible:outline-2 focus-visible:outline-(--accent) focus-visible:outline-offset-2 ${
        size === 'lg'
          ? 'p-6 gap-1.5 hover:border-card-foreground'
          : 'px-5 py-[18px] gap-1.5 hover:border-accent'
      } ${selected ? 'border-primary' : 'border-border'}`}
    >
      <span
        className={`font-bold text-card-foreground ${size === 'lg' ? 'text-lg' : 'text-[17px]'}`}
      >
        {title}
      </span>
      {subtitle && (
        <span className="text-sm leading-snug text-muted-foreground">{subtitle}</span>
      )}
    </button>
  )

  const renderQuestion = (q: EnquiryQuestion) => {
    const value = answers[q.name]
    const options = visibleOptions(q, answers)

    switch (q.type) {
      case 'cards':
        return (
          <div key={q.name} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {options.map((o) => (
                <PartyOption
                  key={optionValue(o)}
                  size="lg"
                  title={o.label}
                  subtitle={o.description}
                  selected={value === optionValue(o)}
                  onClick={() =>
                    q.advanceOnSelect
                      ? chooseStarter(q, optionValue(o))
                      : set({ [q.name]: optionValue(o) })
                  }
                />
              ))}
            </div>
            {q.helpText && (
              <span className="text-[13px] leading-snug text-(--mms-muted-light)">
                {q.helpText}
              </span>
            )}
          </div>
        )

      case 'buttons':
        return (
          <div key={q.name} className="flex flex-col gap-2.5">
            <span className="text-[15px] font-semibold text-card-foreground">{q.label}</span>
            <div className="flex gap-2.5 flex-wrap">
              {options.map((o) => (
                <button
                  key={optionValue(o)}
                  type="button"
                  aria-pressed={value === optionValue(o)}
                  onClick={() => set({ [q.name]: optionValue(o) })}
                  className={`px-[22px] py-[11px] rounded-lg text-[15px] font-semibold border-[1.5px] transition-colors focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2 ${
                    value === optionValue(o)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-card-foreground hover:border-primary/50'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            {q.helpText && (
              <span className="text-[13px] leading-snug text-(--mms-muted-light)">
                {q.helpText}
              </span>
            )}
          </div>
        )

      case 'select':
        return (
          <label key={q.name} className={fieldLabelClass}>
            {q.label}
            <select
              className={fieldClass}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => set({ [q.name]: e.target.value })}
            >
              <option value="">Please select…</option>
              {options.map((o) => (
                <option key={optionValue(o)} value={optionValue(o)}>
                  {o.label}
                </option>
              ))}
            </select>
            {q.helpText && (
              <span className="text-[13px] font-normal leading-snug text-(--mms-muted-light)">
                {q.helpText}
              </span>
            )}
          </label>
        )

      case 'textarea':
        return (
          <div key={q.name} className="flex flex-col gap-2">
            <label className={fieldLabelClass}>
              {q.label}
              <textarea
                className={`${fieldClass} resize-y`}
                rows={5}
                maxLength={q.maxLength || undefined}
                placeholder={q.placeholder || undefined}
                value={typeof value === 'string' ? value : ''}
                onChange={(e) => set({ [q.name]: e.target.value })}
              />
            </label>
            <div className="flex justify-between gap-4 text-[13px] text-(--mms-muted-light)">
              <span>{q.helpText}</span>
              {q.maxLength ? (
                <span className="shrink-0">
                  {(typeof value === 'string' ? value : '').length}/{q.maxLength}
                </span>
              ) : null}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <label
            key={q.name}
            className="flex gap-3 items-start rounded-lg border-[1.5px] border-border bg-muted p-[18px] text-sm leading-relaxed text-card-foreground cursor-pointer transition-colors hover:border-primary"
          >
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 shrink-0 accent-primary"
              checked={value === true}
              onChange={(e) => set({ [q.name]: e.target.checked })}
            />
            <span>{q.label || consentCopy}</span>
          </label>
        )

      default:
        return (
          <label key={q.name} className={fieldLabelClass}>
            {q.label}
            <input
              className={fieldClass}
              type={q.type === 'text' ? 'text' : q.type}
              placeholder={q.placeholder || undefined}
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => set({ [q.name]: e.target.value })}
            />
            {q.helpText && (
              <span className="text-[13px] font-normal leading-snug text-(--mms-muted-light)">
                {q.helpText}
              </span>
            )}
          </label>
        )
    }
  }

  const currentStep = steps[step - 1]

  const body = submitted ? (
    <div className="text-center py-10 flex flex-col items-center gap-4">
      <div className="w-14 h-14 rounded-full bg-(--mms-rule) text-(--accent) flex items-center justify-center text-2xl">
        ✓
      </div>
      <h3 className="text-2xl font-bold">{form.successHeading || 'Enquiry received'}</h3>
      <p className="text-muted-foreground max-w-md mx-auto">{successCopy}</p>
    </div>
  ) : (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2" aria-label={`Step ${step} of ${totalSteps}`}>
        <div className="flex justify-between text-[13px] font-semibold text-muted-foreground">
          <span>{currentStep?.label}</span>
          <span>
            Step {step} of {totalSteps}
          </span>
        </div>
        <div className="h-[6px] rounded-full bg-border overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {currentStep?.heading && (
          <h3 className="text-2xl font-bold">{currentStep.heading}</h3>
        )}
        {currentQuestions.map(renderQuestion)}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

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
        {step < totalSteps ? (
          <button
            type="button"
            disabled={!stepValid}
            onClick={() => {
              trackStepComplete(step, trackingProps())
              setStep((s) => s + 1)
            }}
            className="ml-auto px-7 py-[14px] rounded-lg bg-primary text-primary-foreground font-bold text-base transition-colors hover:bg-(--mms-primary-hover) disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2"
          >
            {form.continueLabel || 'Continue →'}
          </button>
        ) : (
          <button
            type="button"
            disabled={!stepValid || submitting}
            onClick={submit}
            className="ml-auto px-7 py-[14px] rounded-lg bg-primary text-primary-foreground font-bold text-base transition-colors hover:bg-(--mms-primary-hover) disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-(--primary) focus-visible:outline-offset-2"
          >
            {submitting ? 'Sending…' : form.submitLabel || 'Submit my enquiry'}
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
                <h2 className="text-[clamp(24px,4.4vw,34px)] font-bold tracking-tight">
                  {heading}
                </h2>
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
    <div id="enquiry-form" className="bg-card rounded-[12px] p-7 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wider text-(--mms-muted-light)">
          Step 1 of {totalSteps}
        </span>
        <span className="text-[13px] text-(--mms-muted-light)">Takes about 2 minutes</span>
      </div>
      <div className="h-1 rounded-full bg-(--mms-rule) overflow-hidden">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${(1 / totalSteps) * 100}%` }}
        />
      </div>
      <h2 className="text-[21px] font-bold">{starterQuestion?.label || steps[0]?.heading}</h2>
      <div className="flex flex-col gap-3">
        {starterQuestion &&
          visibleOptions(starterQuestion, answers).map((o) => (
            <PartyOption
              key={optionValue(o)}
              title={o.label}
              subtitle={o.description}
              selected={answers[starterQuestion.name] === optionValue(o)}
              onClick={() => chooseStarter(starterQuestion, optionValue(o))}
            />
          ))}
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
            <div className="lg:justify-self-end w-full lg:max-w-[560px]">{starter}</div>
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
