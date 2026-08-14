import type { GlobalConfig } from 'payload'
import { logGlobalChange } from '@/hooks/logActivity'

export const CompanyDetails: GlobalConfig = {
  slug: 'company-details',
  label: 'Company Details',
  admin: {
    group: 'Global',
    description: 'Your legal company information — used in policy documents and emails.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'companyName',
      type: 'text',
      label: 'Company Name',
      required: true,
      defaultValue: 'Your Company Ltd',
    },
    {
      name: 'companyRegistrationNumber',
      type: 'text',
      label: 'Company Registration Number',
      admin: { description: 'UK Companies House number (optional).' },
    },
    {
      name: 'vatNumber',
      type: 'text',
      label: 'VAT Number',
      admin: { description: 'e.g. GB123456789 (optional).' },
    },
    {
      name: 'registeredAddress',
      type: 'textarea',
      label: 'Registered Address',
    },
    {
      name: 'websiteUrl',
      type: 'text',
      label: 'Website URL',
      defaultValue: 'https://example.com',
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Contact Email',
      defaultValue: 'hello@example.com',
    },
    {
      name: 'contactPhone',
      type: 'text',
      label: 'Contact Phone',
    },
    {
      name: 'dataProtectionOfficerEmail',
      type: 'email',
      label: 'DPO / Privacy Contact Email',
      admin: { description: 'Email for data protection requests.' },
    },
  ],
  hooks: {
    afterChange: [logGlobalChange],
  },
}
