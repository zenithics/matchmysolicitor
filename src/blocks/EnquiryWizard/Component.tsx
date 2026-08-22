import React from 'react'
import configPromise from '@payload-config'
import { getPayload } from 'payload'

import type { EnquiryWizardBlock as EnquiryWizardBlockProps } from '@/payload-types'

import { EnquiryWizardClient } from './Component.client'
import { DEFAULT_ENQUIRY_FORM, resolveEnquiryForm } from './formSchema'

/**
 * Resolves the CMS form definition for the wizard:
 *   1. the form chosen on the block, if any
 *   2. otherwise the first Enquiry Form in the CMS (the seeded default)
 *   3. otherwise the built-in definition, so the site never renders an empty form
 */
const getFormDefinition = async (form: EnquiryWizardBlockProps['form']) => {
  try {
    if (form && typeof form === 'object') return resolveEnquiryForm(form)

    const payload = await getPayload({ config: configPromise })

    if (form) {
      const doc = await payload.findByID({
        collection: 'enquiry-forms',
        id: form,
        depth: 0,
        overrideAccess: false,
      })
      return resolveEnquiryForm(doc)
    }

    const { docs } = await payload.find({
      collection: 'enquiry-forms',
      limit: 1,
      depth: 0,
      sort: 'createdAt',
      overrideAccess: false,
    })
    return resolveEnquiryForm(docs?.[0])
  } catch {
    return DEFAULT_ENQUIRY_FORM
  }
}

export const EnquiryWizardBlock: React.FC<EnquiryWizardBlockProps> = async (props) => {
  const formDefinition = await getFormDefinition(props.form)
  return <EnquiryWizardClient {...props} formDefinition={formDefinition} />
}
