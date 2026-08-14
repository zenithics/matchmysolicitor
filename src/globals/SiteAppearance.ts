import type { GlobalConfig } from 'payload'
import { logGlobalChange } from '@/hooks/logActivity'

const colourField = (name: string, label: string, defaultValue?: string, description?: string) => ({
  name,
  type: 'text' as const,
  label,
  ...(defaultValue ? { defaultValue } : {}),
  admin: {
    description: description ?? 'Hex value e.g. #FF69B4',
    placeholder: defaultValue ?? '#000000',
  },
})

export const SiteAppearance: GlobalConfig = {
  slug: 'site-appearance',
  label: 'Site Appearance',
  admin: {
    group: 'Site Settings',
    description: 'Live branding controls — logo, colours, typography. CSS variables are injected at runtime so changes take effect without a rebuild.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Logos',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Primary Logo',
              admin: { description: 'Shown in the header on light backgrounds. SVG or transparent PNG recommended.' },
            },
            {
              name: 'logoDark',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo for Dark Backgrounds',
              admin: { description: 'Optional — used when the header sits over a dark section.' },
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
              admin: { description: '32×32 or 64×64 ICO / PNG / SVG for the browser tab icon.' },
            },
          ],
        },
        {
          label: 'Colours',
          fields: [
            colourField('primaryColour', 'Primary Brand Colour', '#E8177A', 'Hex value e.g. #FF69B4 — used for buttons, links, accents'),
            colourField('secondaryColour', 'Secondary Colour', '#2D1B3D'),
            colourField('accentColour', 'Accent Colour', '#B76E79'),
            colourField('backgroundColour', 'Background Colour', '#FFFFFF'),
            colourField('textColour', 'Text Colour', '#1A1A1A'),
            colourField('headerBgColour', 'Header Background', '#f8fafc'),
            colourField('footerBgColour', 'Footer Background', '#2D1B3D'),
          ],
        },
        {
          label: 'Typography',
          fields: [
            {
              name: 'headingFont',
              type: 'select',
              label: 'Heading Font',
              defaultValue: 'DM Serif Display',
              options: [
                { label: 'DM Serif Display (current)', value: 'DM Serif Display' },
                { label: 'Inter', value: 'Inter' },
                { label: 'Poppins', value: 'Poppins' },
                { label: 'Montserrat', value: 'Montserrat' },
                { label: 'Playfair Display', value: 'Playfair Display' },
                { label: 'DM Sans', value: 'DM Sans' },
                { label: 'Outfit', value: 'Outfit' },
                { label: 'Sora', value: 'Sora' },
                { label: 'Space Grotesk', value: 'Space Grotesk' },
              ],
            },
            {
              name: 'bodyFont',
              type: 'select',
              label: 'Body Font',
              defaultValue: 'Plus Jakarta Sans',
              options: [
                { label: 'Plus Jakarta Sans (current)', value: 'Plus Jakarta Sans' },
                { label: 'Inter', value: 'Inter' },
                { label: 'DM Sans', value: 'DM Sans' },
                { label: 'Open Sans', value: 'Open Sans' },
                { label: 'Lato', value: 'Lato' },
                { label: 'Nunito', value: 'Nunito' },
                { label: 'Source Sans 3', value: 'Source Sans 3' },
                { label: 'Work Sans', value: 'Work Sans' },
                { label: 'Outfit', value: 'Outfit' },
              ],
            },
            {
              name: 'h1Size',
              type: 'text',
              label: 'H1 Size',
              defaultValue: '3.5rem',
              admin: { description: 'CSS value e.g. 3.5rem, 56px' },
            },
            {
              name: 'h2Size',
              type: 'text',
              label: 'H2 Size',
              defaultValue: '2.5rem',
            },
            {
              name: 'h3Size',
              type: 'text',
              label: 'H3 Size',
              defaultValue: '2rem',
            },
            {
              name: 'h4Size',
              type: 'text',
              label: 'H4 Size',
              defaultValue: '1.5rem',
            },
            {
              name: 'h5Size',
              type: 'text',
              label: 'H5 Size',
              defaultValue: '1.25rem',
            },
            {
              name: 'bodySize',
              type: 'text',
              label: 'Body Font Size',
              defaultValue: '1rem',
            },
            {
              name: 'fontWeightHeading',
              type: 'select',
              label: 'Heading Font Weight',
              defaultValue: '700',
              options: [
                { label: '400 — Regular', value: '400' },
                { label: '500 — Medium', value: '500' },
                { label: '600 — Semi Bold', value: '600' },
                { label: '700 — Bold', value: '700' },
                { label: '800 — Extra Bold', value: '800' },
              ],
            },
            {
              name: 'fontWeightBody',
              type: 'select',
              label: 'Body Font Weight',
              defaultValue: '400',
              options: [
                { label: '300 — Light', value: '300' },
                { label: '400 — Regular', value: '400' },
                { label: '500 — Medium', value: '500' },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [logGlobalChange],
  },
}
