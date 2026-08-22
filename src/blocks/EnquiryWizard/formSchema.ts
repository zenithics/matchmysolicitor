/**
 * Shape of a CMS-defined enquiry form, plus the default (MatchMySolicitor
 * employment) definition used when no form has been selected on the block.
 *
 * The default is also what seeds the `enquiry-forms` collection on first run,
 * so what an editor opens in admin is exactly what the site was already
 * rendering — no behaviour change on the day this ships.
 */

export type EnquiryOption = {
  label: string
  value?: string | null
  description?: string | null
  /** Comma-separated values of the controlling question this option belongs to. */
  showWhen?: string | null
}

export type EnquiryQuestionType =
  | 'select'
  | 'cards'
  | 'buttons'
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'checkbox'

export type EnquiryMapTo =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'partyType'
  | 'situation'
  | 'region'
  | 'tenure'
  | 'salary'
  | 'legalExpensesInsurance'
  | 'details'
  | 'consent'
  | 'extra'

export type EnquiryQuestion = {
  name: string
  type: EnquiryQuestionType
  label: string
  placeholder?: string | null
  helpText?: string | null
  required?: boolean | null
  maxLength?: number | null
  advanceOnSelect?: boolean | null
  mapTo?: EnquiryMapTo | null
  options?: EnquiryOption[] | null
  dependsOn?: string | null
  showWhenValues?: string | null
}

export type EnquiryStep = {
  label: string
  heading?: string | null
  questions: EnquiryQuestion[]
}

export type EnquiryFormDefinition = {
  title?: string | null
  steps: EnquiryStep[]
  consentText?: string | null
  continueLabel?: string | null
  submitLabel?: string | null
  successHeading?: string | null
  successMessage?: string | null
  errorMessage?: string | null
}

const opts = (labels: string[], showWhen?: string): EnquiryOption[] =>
  labels.map((label) => ({ label, value: label, showWhen: showWhen ?? null }))

export const DEFAULT_ENQUIRY_FORM: EnquiryFormDefinition = {
  title: 'Employment enquiry',
  consentText:
    'I agree to be contacted by MatchMySolicitor and one matched partner solicitor about my enquiry. My details will not be sold to multiple firms.',
  continueLabel: 'Continue →',
  submitLabel: 'Submit my enquiry',
  successHeading: 'Enquiry received',
  successMessage:
    'Thank you. We are reviewing your enquiry and a specialist solicitor will contact you within one working day.',
  errorMessage:
    'Sorry, something went wrong sending your enquiry. Please call us or try again.',
  steps: [
    {
      label: 'Who you are',
      heading: 'First things first, which side are you on?',
      questions: [
        {
          name: 'partyType',
          type: 'cards',
          mapTo: 'partyType',
          required: true,
          advanceOnSelect: true,
          label: 'Are you an employee or an employer?',
          options: [
            {
              label: "I'm an employee",
              value: 'employee',
              description: 'Dismissed, discriminated against, or negotiating an exit or settlement',
            },
            {
              label: "I'm an employer",
              value: 'employer',
              description: 'Facing a claim, negotiating a settlement, or need urgent representation',
            },
          ],
        },
      ],
    },
    {
      label: 'Your situation',
      heading: 'What is your situation?',
      questions: [
        {
          name: 'situation',
          type: 'select',
          mapTo: 'situation',
          required: true,
          label: "What's your situation?",
          options: [
            ...opts(
              [
                'Unfair dismissal',
                'Constructive dismissal',
                'Discrimination',
                'Settlement agreement',
                'Redundancy',
                'Employment tribunal claim',
                'Something else',
              ],
              'employee',
            ),
            ...opts(
              [
                'Tribunal defence',
                'Settlement agreement',
                'Dismissal process',
                'Redundancy programme',
                'Grievance or disciplinary',
                'Something else',
              ],
              'employer',
            ),
          ],
          dependsOn: 'partyType',
        },
        {
          name: 'tenure',
          type: 'select',
          mapTo: 'tenure',
          label: 'Length of service',
          dependsOn: 'partyType',
          showWhenValues: 'employee',
          options: opts([
            'Less than 2 years',
            '2–5 years',
            '5–10 years',
            'More than 10 years',
          ]),
        },
        {
          name: 'salary',
          type: 'select',
          mapTo: 'salary',
          label: 'What is your approximate salary?',
          dependsOn: 'partyType',
          showWhenValues: 'employee',
          options: opts([
            'Under £30,000',
            '£30,000–£60,000',
            '£60,000–£100,000',
            'Over £100,000',
          ]),
        },
        {
          name: 'legalExpensesInsurance',
          type: 'buttons',
          mapTo: 'legalExpensesInsurance',
          label: 'Do you have legal expenses insurance?',
          helpText:
            'Often included with home or car insurance, "not sure" is a perfectly good answer.',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'Not sure', value: 'unsure' },
          ],
        },
      ],
    },
    {
      label: 'A little more detail',
      heading: 'Tell us a little more',
      questions: [
        {
          name: 'details',
          type: 'textarea',
          mapTo: 'details',
          label: 'Brief description of your situation',
          placeholder: 'What happened, roughly when, and where things stand now…',
          maxLength: 500,
          helpText: 'Please describe in your own words. Two paragraphs is fine.',
        },
        {
          name: 'region',
          type: 'select',
          mapTo: 'region',
          required: true,
          label: 'Where are you based?',
          options: opts([
            'London & South East',
            'South West',
            'Midlands',
            'North West',
            'North East & Yorkshire',
            'Wales',
            'Scotland',
            'Northern Ireland',
          ]),
        },
      ],
    },
    {
      label: 'Your details',
      heading: 'Where should the solicitor reach you?',
      questions: [
        {
          name: 'fullName',
          type: 'text',
          mapTo: 'fullName',
          required: true,
          label: 'Your name',
          placeholder: 'Full name',
        },
        {
          name: 'phone',
          type: 'tel',
          mapTo: 'phone',
          required: true,
          label: 'Phone number',
          placeholder: 'Best number to call',
        },
        {
          name: 'email',
          type: 'email',
          mapTo: 'email',
          required: true,
          label: 'Email address',
          placeholder: 'you@example.com',
        },
        {
          name: 'consent',
          type: 'checkbox',
          mapTo: 'consent',
          required: true,
          label: '',
        },
      ],
    },
  ],
}

/** Narrow a populated relationship / CMS doc into the renderer's shape. */
export const resolveEnquiryForm = (form: unknown): EnquiryFormDefinition => {
  if (!form || typeof form !== 'object') return DEFAULT_ENQUIRY_FORM
  const candidate = form as Partial<EnquiryFormDefinition>
  if (!Array.isArray(candidate.steps) || candidate.steps.length === 0) return DEFAULT_ENQUIRY_FORM
  return { ...DEFAULT_ENQUIRY_FORM, ...candidate } as EnquiryFormDefinition
}
