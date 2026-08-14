import type { Block } from 'payload'

export const EnquiryWizard: Block = {
  slug: 'enquiryWizard',
  interfaceName: 'EnquiryWizardBlock',
  labels: { singular: 'Enquiry Wizard', plural: 'Enquiry Wizards' },
  fields: [
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
    { name: 'heading', type: 'text', defaultValue: 'Find the right employment solicitor' },
    { name: 'subheading', type: 'textarea' },
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
