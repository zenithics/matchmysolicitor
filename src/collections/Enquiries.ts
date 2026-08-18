import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { isAdmin } from '@/access/isAdmin'
import { notifyEnquiry } from '@/hooks/notifyEnquiry'
import { webhookEnquiry } from '@/hooks/webhookEnquiry'

/**
 * Pay-per-lead enquiries captured by the EnquiryWizard block.
 *
 * Deliberately a first-class collection rather than a form-builder form:
 * the wizard is multi-step and conditional, the fields are the commercial
 * product (they are what a partner firm is buying), and they need to be
 * filterable and exportable in admin.
 */
export const Enquiries: CollectionConfig = {
  slug: 'enquiries',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  admin: {
    group: 'Content',
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'partyType', 'situation', 'region', 'status', 'createdAt'],
    description: 'Leads submitted through the site enquiry wizard.',
  },
  access: {
    create: anyone, // public form submissions
    read: authenticated,
    update: authenticated,
    delete: isAdmin,
  },
  hooks: {
    afterChange: [notifyEnquiry, webhookEnquiry],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'fullName', type: 'text', required: true, label: 'Full Name' },
        { name: 'email', type: 'email', required: true, label: 'Email' },
        { name: 'phone', type: 'text', required: true, label: 'Phone' },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'partyType',
          type: 'select',
          required: true,
          label: 'Employer or Employee',
          options: [
            { label: 'Employee', value: 'employee' },
            { label: 'Employer', value: 'employer' },
          ],
        },
        { name: 'situation', type: 'text', label: 'Situation' },
        { name: 'region', type: 'text', label: 'Region' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'tenure', type: 'text', label: 'Length of Service' },
        { name: 'salary', type: 'text', label: 'Salary Band' },
        {
          name: 'legalExpensesInsurance',
          type: 'select',
          label: 'Legal Expenses Insurance',
          options: [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
            { label: 'Not sure', value: 'unsure' },
          ],
        },
      ],
    },
    { name: 'details', type: 'textarea', label: 'Their Description' },
    {
      name: 'consent',
      type: 'checkbox',
      required: true,
      label: 'Consented to be contacted',
      admin: { description: 'Explicit consent captured at submission. Required for UK GDPR/PECR.' },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      label: 'Status',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Sent to firm', value: 'sent' },
        { label: 'Accepted', value: 'accepted' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Converted', value: 'converted' },
      ],
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      label: 'Rejection / feedback note',
      admin: {
        description: 'Why the firm rejected this lead, or any feedback on quality. Used for PPL billing disputes.',
        condition: (data) => data?.status === 'rejected' || data?.status === 'converted',
      },
    },
    { name: 'assignedFirm', type: 'text', label: 'Matched Firm', admin: { position: 'sidebar' } },
    {
      type: 'collapsible',
      label: 'Attribution',
      admin: { position: 'sidebar', initCollapsed: true },
      fields: [
        { name: 'source', type: 'text', label: 'Source / utm_source' },
        { name: 'campaign', type: 'text', label: 'Campaign / utm_campaign' },
        { name: 'landingPath', type: 'text', label: 'Landing Path' },
      ],
    },
  ],
  timestamps: true,
}
