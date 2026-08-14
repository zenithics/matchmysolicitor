import type { GlobalConfig } from 'payload'

export const ContactWidget: GlobalConfig = {
  slug: 'contact-widget',
  label: 'Contact Widget',
  admin: {
    group: 'Global',
    description: 'Floating contact / chat widget — configure chat channels, FAQ, and branding.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Widget Settings',
          fields: [
            {
              name: 'enabled',
              type: 'checkbox',
              label: 'Enable Contact Widget',
              defaultValue: true,
            },
            {
              name: 'position',
              type: 'select',
              label: 'Widget Position',
              defaultValue: 'bottom-right',
              options: [
                { label: 'Bottom Right', value: 'bottom-right' },
                { label: 'Bottom Left', value: 'bottom-left' },
              ],
            },
            {
              name: 'greeting',
              type: 'text',
              label: 'Greeting Text',
              defaultValue: 'Hi! How can we help?',
            },
            {
              name: 'primaryColor',
              type: 'text',
              label: 'Widget Primary Colour',
              admin: {
                description: 'Hex value — defaults to your site primary colour if left blank.',
                placeholder: '#E8177A',
              },
            },
          ],
        },
        {
          label: 'Channels',
          fields: [
            {
              name: 'channels',
              type: 'array',
              label: 'Chat Channels',
              admin: {
                description: 'Add one entry per channel you want to offer. Drag to reorder.',
              },
              fields: [
                {
                  name: 'channelType',
                  type: 'select',
                  label: 'Channel Type',
                  required: true,
                  options: [
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'Facebook Messenger', value: 'messenger' },
                    { label: 'Tawk.to', value: 'tawkto' },
                    { label: 'Crisp', value: 'crisp' },
                    { label: 'Tidio', value: 'tidio' },
                    { label: 'Custom Embed', value: 'custom' },
                  ],
                },
                {
                  name: 'label',
                  type: 'text',
                  label: 'Button Label',
                  admin: { placeholder: 'Chat with us on WhatsApp' },
                },
                {
                  name: 'icon',
                  type: 'select',
                  label: 'Icon',
                  defaultValue: 'chat',
                  options: [
                    { label: 'Chat bubble', value: 'chat' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'Messenger', value: 'messenger' },
                    { label: 'Phone', value: 'phone' },
                    { label: 'Email', value: 'email' },
                  ],
                },
                // WhatsApp
                {
                  name: 'phoneNumber',
                  type: 'text',
                  label: 'Phone Number',
                  admin: {
                    description: 'International format e.g. +447123456789',
                    condition: (_, siblingData) => siblingData?.channelType === 'whatsapp',
                  },
                },
                {
                  name: 'defaultMessage',
                  type: 'text',
                  label: 'Default WhatsApp Message',
                  admin: {
                    placeholder: 'Hi, I have a question about...',
                    condition: (_, siblingData) => siblingData?.channelType === 'whatsapp',
                  },
                },
                // Messenger
                {
                  name: 'facebookPageId',
                  type: 'text',
                  label: 'Facebook Page ID',
                  admin: {
                    condition: (_, siblingData) => siblingData?.channelType === 'messenger',
                  },
                },
                // Tawk.to
                {
                  name: 'tawktoPropertyId',
                  type: 'text',
                  label: 'Tawk.to Property ID',
                  admin: {
                    condition: (_, siblingData) => siblingData?.channelType === 'tawkto',
                  },
                },
                {
                  name: 'tawktoWidgetId',
                  type: 'text',
                  label: 'Tawk.to Widget ID',
                  admin: {
                    condition: (_, siblingData) => siblingData?.channelType === 'tawkto',
                  },
                },
                // Crisp
                {
                  name: 'crispWebsiteId',
                  type: 'text',
                  label: 'Crisp Website ID',
                  admin: {
                    condition: (_, siblingData) => siblingData?.channelType === 'crisp',
                  },
                },
                // Tidio
                {
                  name: 'tidioPublicKey',
                  type: 'text',
                  label: 'Tidio Public Key',
                  admin: {
                    condition: (_, siblingData) => siblingData?.channelType === 'tidio',
                  },
                },
                // Custom embed
                {
                  name: 'embedCode',
                  type: 'textarea',
                  label: 'Custom Embed Code',
                  admin: {
                    description: 'Raw <script> tag or embed HTML from your chat provider.',
                    condition: (_, siblingData) => siblingData?.channelType === 'custom',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'FAQ',
          fields: [
            {
              name: 'faqItems',
              type: 'array',
              label: 'Frequently Asked Questions',
              admin: {
                description: 'Shown in the chat panel before the visitor opens a chat channel.',
              },
              fields: [
                {
                  name: 'question',
                  type: 'text',
                  label: 'Question',
                  required: true,
                  admin: { placeholder: 'What are your shipping times?' },
                },
                {
                  name: 'answer',
                  type: 'textarea',
                  label: 'Answer',
                  required: true,
                },
                {
                  name: 'linkUrl',
                  type: 'text',
                  label: 'Link URL (optional)',
                  admin: { description: 'Link to a page for more detail.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
