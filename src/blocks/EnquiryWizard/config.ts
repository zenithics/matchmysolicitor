import type { Block } from 'payload'

export const EnquiryWizard: Block = {
  slug: 'enquiryWizard',
  interfaceName: 'EnquiryWizardBlock',
  labels: { singular: 'Enquiry Wizard', plural: 'Enquiry Wizards' },
  fields: [
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'enquiry-forms',
      label: 'Form definition',
      admin: {
        description:
          'The steps and questions to render (Content → Enquiry Forms). Leave blank to use the site default form.',
      },
    },
    {
      name: 'variant',
      type: 'select',
      defaultValue: 'page',
      label: 'Variant',
      options: [
        { label: 'Full page (standalone /enquiry)', value: 'page' },
        { label: 'Inline in hero (opens modal / full-screen)', value: 'inline-hero' },
        { label: 'Modal trigger only', value: 'modal' },
      ],
      admin: {
        description:
          'Inline-hero shows step 1 in place; choosing an answer opens the rest as a modal on desktop and a full-screen sheet on mobile.',
      },
    },
    {
      name: 'eyebrow',
      type: 'text',
      admin: {
        description: 'Small label above the heading. Inline-hero variant only.',
        condition: (_, siblingData) => siblingData?.variant === 'inline-hero',
      },
    },
    { name: 'heading', type: 'text', defaultValue: 'Find the right employment solicitor' },
    { name: 'subheading', type: 'textarea' },
    {
      name: 'bullets',
      type: 'array',
      label: 'Hero trust points',
      maxRows: 4,
      fields: [{ name: 'text', type: 'text', required: true }],
      admin: {
        description: 'Shown beside the form in the hero. Inline-hero variant only.',
        condition: (_, siblingData) => siblingData?.variant === 'inline-hero',
      },
    },
    {
      name: 'presetSituation',
      type: 'text',
      label: 'Pre-select situation',
      admin: {
        description:
          'On a service landing page, pre-fills the "what is your situation?" answer (e.g. "Unfair dismissal"). Must match one of the wizard options exactly, or it is ignored.',
      },
    },
    {
      name: 'consentText',
      type: 'textarea',
      required: true,
      defaultValue:
        'I agree to be contacted by MatchMySolicitor and one matched partner solicitor about my enquiry. My details will not be sold to multiple firms.',
      admin: { description: 'Shown beside the required consent checkbox on the final step.' },
    },
    {
      name: 'successMessage',
      type: 'textarea',
      defaultValue:
        'Thank you. We are reviewing your enquiry and a specialist solicitor will contact you within one working day.',
    },
  ],
}
