import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'

/**
 * CMS-driven definition of the multi-step Enquiry Wizard.
 *
 * The front end is a renderer: steps, questions, answer options, conditional
 * logic and copy all live here, so an editor can add a matter type or reorder
 * a step without a code change or a deploy. Answers are still mapped onto the
 * Enquiries collection (see `mapTo`), which is what keeps the webhook to n8n,
 * the Monday board mapping and the GA4/Ads conversion events working.
 *
 * Read access is public because the published form definition is rendered on
 * public pages.
 */
export const EnquiryForms: CollectionConfig = {
  slug: 'enquiry-forms',
  labels: { singular: 'Enquiry Form', plural: 'Enquiry Forms' },
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'updatedAt'],
    description:
      'The steps and questions used by the Enquiry Wizard block. Edit here instead of in code.',
  },
  access: {
    create: authenticated,
    read: anyone,
    update: authenticated,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      defaultValue: 'Enquiry Wizard',
      admin: { description: 'Internal name, e.g. "Employment enquiry" or "Conveyancing enquiry".' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Steps & questions',
          fields: [
            {
              name: 'steps',
              type: 'array',
              minRows: 1,
              labels: { singular: 'Step', plural: 'Steps' },
              admin: {
                initCollapsed: true,
                description:
                  'Each step is one screen of the wizard. The progress bar and step counter follow this list.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      label: 'Progress label',
                      admin: { description: 'Short label shown above the progress bar.' },
                    },
                    {
                      name: 'heading',
                      type: 'text',
                      label: 'Question heading',
                      admin: { description: 'The big heading shown on this step.' },
                    },
                  ],
                },
                {
                  name: 'questions',
                  type: 'array',
                  minRows: 1,
                  labels: { singular: 'Question', plural: 'Questions' },
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'name',
                          type: 'text',
                          required: true,
                          label: 'Key',
                          admin: {
                            description:
                              'Unique machine name, e.g. situation. Used in tracking events.',
                          },
                        },
                        {
                          name: 'type',
                          type: 'select',
                          required: true,
                          defaultValue: 'select',
                          label: 'Answer type',
                          options: [
                            { label: 'Dropdown', value: 'select' },
                            { label: 'Big choice cards', value: 'cards' },
                            { label: 'Button group', value: 'buttons' },
                            { label: 'Short text', value: 'text' },
                            { label: 'Email', value: 'email' },
                            { label: 'Phone', value: 'tel' },
                            { label: 'Long text', value: 'textarea' },
                            { label: 'Checkbox (consent)', value: 'checkbox' },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'label', type: 'text', required: true, label: 'Question label' },
                        {
                          name: 'placeholder',
                          type: 'text',
                          admin: {
                            condition: (_, s) =>
                              ['text', 'email', 'tel', 'textarea'].includes(s?.type),
                          },
                        },
                      ],
                    },
                    {
                      name: 'helpText',
                      type: 'text',
                      label: 'Helper text',
                      admin: { description: 'Small grey text under the answer. Optional.' },
                    },
                    {
                      type: 'row',
                      fields: [
                        { name: 'required', type: 'checkbox', defaultValue: false },
                        {
                          name: 'maxLength',
                          type: 'number',
                          admin: { condition: (_, s) => s?.type === 'textarea' },
                        },
                        {
                          name: 'advanceOnSelect',
                          type: 'checkbox',
                          label: 'Go to next step when answered',
                          admin: {
                            description: 'Best on the first "cards" question.',
                            condition: (_, s) => s?.type === 'cards',
                          },
                        },
                      ],
                    },
                    {
                      name: 'mapTo',
                      type: 'select',
                      defaultValue: 'extra',
                      label: 'Save answer to',
                      options: [
                        { label: 'Full name', value: 'fullName' },
                        { label: 'Email', value: 'email' },
                        { label: 'Phone', value: 'phone' },
                        { label: 'Employer or employee', value: 'partyType' },
                        { label: 'Situation / matter type', value: 'situation' },
                        { label: 'Region', value: 'region' },
                        { label: 'Length of service', value: 'tenure' },
                        { label: 'Salary band', value: 'salary' },
                        { label: 'Legal expenses insurance', value: 'legalExpensesInsurance' },
                        { label: 'Their description', value: 'details' },
                        { label: 'Consent', value: 'consent' },
                        { label: 'Extra answer (stored on the lead)', value: 'extra' },
                      ],
                      admin: {
                        description:
                          'Which Enquiry field this answer fills. Anything set to "extra" is still saved on the lead.',
                      },
                    },
                    {
                      name: 'options',
                      type: 'array',
                      labels: { singular: 'Option', plural: 'Options' },
                      admin: {
                        condition: (_, s) => ['select', 'cards', 'buttons'].includes(s?.type),
                        initCollapsed: true,
                      },
                      fields: [
                        {
                          type: 'row',
                          fields: [
                            { name: 'label', type: 'text', required: true },
                            {
                              name: 'value',
                              type: 'text',
                              admin: { description: 'Defaults to the label if left blank.' },
                            },
                          ],
                        },
                        {
                          name: 'description',
                          type: 'text',
                          admin: { description: 'Second line, used by the big choice cards.' },
                        },
                        {
                          name: 'showWhen',
                          type: 'text',
                          label: 'Only show this option when…',
                          admin: {
                            description:
                              'Optional. Value of the controlling question below, e.g. employee. Comma-separate for several.',
                          },
                        },
                      ],
                    },
                    {
                      type: 'row',
                      fields: [
                        {
                          name: 'dependsOn',
                          type: 'text',
                          label: 'Controlling question key',
                          admin: {
                            description:
                              'Optional. The key of an earlier question, e.g. partyType.',
                          },
                        },
                        {
                          name: 'showWhenValues',
                          type: 'text',
                          label: 'Show this question when the answer is…',
                          admin: {
                            description: 'Comma-separated values. Blank means always show.',
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Copy & consent',
          fields: [
            {
              name: 'consentText',
              type: 'textarea',
              required: true,
              defaultValue:
                'I agree to be contacted about my enquiry. My details will not be sold to multiple firms.',
              admin: {
                description:
                  'Used when a step has a consent checkbox question with no label of its own.',
              },
            },
            {
              type: 'row',
              fields: [
                { name: 'continueLabel', type: 'text', defaultValue: 'Continue →' },
                { name: 'submitLabel', type: 'text', defaultValue: 'Submit my enquiry' },
              ],
            },
            { name: 'successHeading', type: 'text', defaultValue: 'Enquiry received' },
            {
              name: 'successMessage',
              type: 'textarea',
              defaultValue:
                'Thank you. We are reviewing your enquiry and a specialist will contact you within one working day.',
            },
            {
              name: 'errorMessage',
              type: 'textarea',
              defaultValue:
                'Sorry, something went wrong sending your enquiry. Please call us or try again.',
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
