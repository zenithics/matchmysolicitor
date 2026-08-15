import { createLocalReq, getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'

export const maxDuration = 30

export async function POST(): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    const req = await createLocalReq({ user }, payload)

    await Promise.all([
      payload.updateGlobal({
        slug: 'header',
        req,
        data: {
          navItemsLeft: [
            { link: { type: 'custom', label: 'For Employers', url: '/for-employers' } },
            { link: { type: 'custom', label: 'For Employees', url: '/for-employees' } },
            { link: { type: 'custom', label: 'Guides', url: '/guides' } },
          ],
          navItemsRight: [
            { link: { type: 'custom', label: 'How It Works', url: '/how-it-works' } },
            { link: { type: 'custom', label: 'Contact', url: '/contact' } },
          ],
        },
      }),
      payload.updateGlobal({
        slug: 'footer',
        req,
        data: {
          column1Heading: 'Services',
          column1Links: [
            { link: { type: 'custom', label: 'For Employers', url: '/for-employers' } },
            { link: { type: 'custom', label: 'For Employees', url: '/for-employees' } },
            { link: { type: 'custom', label: 'How It Works', url: '/how-it-works' } },
            { link: { type: 'custom', label: 'Employment solicitors near you', url: '/employment-solicitors' } },
            { link: { type: 'custom', label: 'Free enquiry', url: '/enquiry' } },
          ],
          column2Heading: 'Guides',
          column2Links: [
            { link: { type: 'custom', label: 'All guides', url: '/guides' } },
            { link: { type: 'custom', label: 'Dismissal', url: '/guides/category/dismissal' } },
            { link: { type: 'custom', label: 'Exit negotiations', url: '/guides/category/exit-negotiations' } },
            { link: { type: 'custom', label: 'Tribunal process', url: '/guides/category/tribunal-process' } },
            { link: { type: 'custom', label: 'Discrimination', url: '/guides/category/discrimination' } },
          ],
          column3Heading: 'Company',
          column3Links: [
            { link: { type: 'custom', label: 'About us', url: '/about' } },
            { link: { type: 'custom', label: 'Contact', url: '/contact' } },
            { link: { type: 'custom', label: 'How we vet our panel', url: '/how-it-works' } },
          ],
          column4Heading: 'Legal',
          column4Links: [
            { link: { type: 'custom', label: 'Privacy policy', url: '/legal/privacy-policy' } },
            { link: { type: 'custom', label: 'Terms of use', url: '/legal/terms-of-use' } },
            { link: { type: 'custom', label: 'Cookie policy', url: '/legal/cookie-policy' } },
            { link: { type: 'custom', label: 'Complaints', url: '/legal/complaints' } },
          ],
        },
      }),
    ])

    return Response.json({ success: true })
  } catch (e: any) {
    const msg = e?.message ?? String(e)
    payload.logger.error({ err: e, message: 'Error seeding header/footer' })
    return Response.json({ error: msg, stack: e?.stack }, { status: 500 })
  }
}
