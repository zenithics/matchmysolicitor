import type { Metadata } from 'next'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'A referral service connecting employers and employees with vetted specialist employment solicitors across the UK.',
  siteName: 'MatchMySolicitor',
  title: 'MatchMySolicitor',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
  }
}
