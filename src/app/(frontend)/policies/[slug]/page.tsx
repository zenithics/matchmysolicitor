import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import React from 'react'
import RichText from '@/components/RichText'
import { Breadcrumbs } from '@/components/Breadcrumbs'

// Force dynamic rendering — the root layout reads cookies() (Analytics/consent),
// which flips any statically-generated route to dynamic at runtime and 500s in
// production. Same guard as (frontend)/[slug] and posts/[slug].
export const dynamic = 'force-dynamic'

interface PolicyPageProps {
  params: Promise<{ slug: string }>
}

async function getPolicy(slug: string) {
  const payload = await getPayload({ config })

  const [privacySettings, company, seoSettings] = await Promise.all([
    payload.findGlobal({ slug: 'privacy-settings' }) as any,
    payload.findGlobal({ slug: 'company-details' }).catch(() => null),
    payload.findGlobal({ slug: 'seo-settings' }).catch(() => null) as any,
  ])

  const policies: any[] = privacySettings?.policies || []
  const policy = policies.find((p: any) => p.slug === slug) || null

  return { policy, company: company as any, seoSettings: seoSettings as any }
}

function replacePlaceholders(richText: any, company: any): any {
  if (!company || !richText) return richText

  const replacements: Record<string, string> = {
    '{{companyName}}': company.companyName || '',
    '{{registeredAddress}}': company.registeredAddress || '',
    '{{websiteUrl}}': company.websiteUrl || '',
    '{{contactEmail}}': company.contactEmail || '',
    '{{contactPhone}}': company.contactPhone || '',
    '{{dpoEmail}}': company.dataProtectionOfficerEmail || company.contactEmail || '',
    '{{companyRegistrationNumber}}': company.companyRegistrationNumber || '',
    '{{vatNumber}}': company.vatNumber || '',
  }

  const replaceInNode = (node: any): any => {
    if (!node) return node
    if (node.type === 'text' && node.text) {
      let text = node.text
      for (const [placeholder, value] of Object.entries(replacements)) {
        text = text.split(placeholder).join(value)
      }
      return { ...node, text }
    }
    if (node.children) {
      return { ...node, children: node.children.map(replaceInNode) }
    }
    return node
  }

  if (richText?.root) {
    return { ...richText, root: replaceInNode(richText.root) }
  }
  return richText
}

export async function generateMetadata({ params }: PolicyPageProps): Promise<Metadata> {
  const { slug } = await params
  const { policy } = await getPolicy(slug)

  if (!policy) return { title: 'Policy Not Found' }

  return {
    title: policy.title,
    robots: 'noindex, follow',
  }
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params
  const { policy, company, seoSettings } = await getPolicy(slug)

  if (!policy) notFound()

  const processedContent = replacePlaceholders(policy.content, company)

  const breadcrumbItems = [
    { name: 'Policies', url: '/policies' },
    { name: policy.title, url: `/policies/${slug}` },
  ]

  return (
    <main className="bg-[#f8fafc] min-h-screen">
      <div className="max-w-[800px] mx-auto px-6 py-10">
        {seoSettings?.breadcrumbsEnabled !== false && seoSettings?.breadcrumbShowOnPages?.pages !== false && (
          <Breadcrumbs
            items={breadcrumbItems}
            separator={seoSettings?.breadcrumbSeparator || '/'}
            homeLabel={seoSettings?.breadcrumbHomeLabel || 'Home'}
            includeSchema={seoSettings?.breadcrumbSchema !== false}
            siteUrl={process.env.NEXT_PUBLIC_SERVER_URL || ''}
          />
        )}

        <header className="mb-10 pb-6 border-b border-[var(--border-subtle)]">
          <h1 className="font-serif text-4xl mb-4">{policy.title}</h1>
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            {policy.version && (
              <span>Version {policy.version}</span>
            )}
            {policy.effectiveDate && (
              <span>
                Effective:{' '}
                {new Date(policy.effectiveDate).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
            {policy.lastReviewed && (
              <span>
                Last reviewed:{' '}
                {new Date(policy.lastReviewed).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
          </div>
        </header>

        <div className="prose prose-sm max-w-none">
          <RichText data={processedContent} />
        </div>
      </div>
    </main>
  )
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const privacySettings = (await payload.findGlobal({ slug: 'privacy-settings' })) as any
  const policies: any[] = privacySettings?.policies || []
  return policies.map((policy: any) => ({ slug: policy.slug }))
}
