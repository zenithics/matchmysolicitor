import React from 'react'

import type { EnquiryWizardBlock as EnquiryWizardBlockProps } from '@/payload-types'

import { EnquiryWizardClient } from './Component.client'

export const EnquiryWizardBlock: React.FC<EnquiryWizardBlockProps> = (props) => (
  <EnquiryWizardClient {...props} />
)
