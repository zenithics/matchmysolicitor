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
            { link: { type: 'custom', label: 'Shop', url: '/shop' } },
            { link: { type: 'custom', label: 'New In', url: '/shop?category=new-arrivals' } },
            { link: { type: 'custom', label: 'Bestsellers', url: '/shop?category=bestsellers' } },
          ],
          navItemsRight: [
            { link: { type: 'custom', label: 'About', url: '/about' } },
            { link: { type: 'custom', label: 'Contact', url: '/contact' } },
          ],
        },
      }),
      payload.updateGlobal({
        slug: 'footer',
        req,
        data: {
          column1Heading: 'Shop',
          column1Links: [
            { link: { type: 'custom', label: 'All Products', url: '/shop' } },
            { link: { type: 'custom', label: 'New Arrivals', url: '/shop?category=new-arrivals' } },
            { link: { type: 'custom', label: 'Bestsellers', url: '/shop?category=bestsellers' } },
          ],
          column2Heading: 'Info',
          column2Links: [
            { link: { type: 'custom', label: 'About Us', url: '/about' } },
            { link: { type: 'custom', label: 'Contact', url: '/contact' } },
          ],
          column3Heading: 'Help',
          column3Links: [
            { link: { type: 'custom', label: 'Privacy Policy', url: '/policies/privacy-policy' } },
            { link: { type: 'custom', label: 'Terms & Conditions', url: '/policies/terms-and-conditions' } },
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
