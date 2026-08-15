import React from 'react'
import Link from 'next/link'
import type { HomeHeroBlock as HomeHeroBlockProps } from '@/payload-types'
import { ArrowRight, stripTrailingArrow } from '@/components/icons/ArrowRight'

const THEME_CLASSES = {
  dark: {
    wrapper: 'bg-card-foreground text-white',
    eyebrow: 'text-accent',
    sub: 'text-(--mms-on-dark-muted)',
    ghostLink: 'border border-white/30 text-white hover:border-accent',
  },
  light: {
    wrapper: 'bg-muted',
    eyebrow: 'text-primary',
    sub: 'text-muted-foreground',
    ghostLink: 'border border-border text-card-foreground hover:border-primary',
  },
  pink: {
    wrapper: 'bg-gradient-to-br from-primary to-accent text-white',
    eyebrow: 'text-white',
    sub: 'text-white/80',
    ghostLink: 'border border-white/30 text-white hover:border-white',
  },
}

export const HomeHeroBlock: React.FC<HomeHeroBlockProps & { disableInnerContainer?: boolean }> = ({
  badge,
  headline,
  subheadline,
  links,
  backgroundImage,
  style = 'split',
  theme = 'dark',
}) => {
  const t = THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.dark
  const hasImage = backgroundImage && typeof backgroundImage === 'object'

  // Matches design-export/how-it-works.dc.html `@block: homeHero style="centred" theme="dark"`:
  // full-bleed --card-foreground section, sp-80-64 rhythm, content centred at 820px.
  if (style === 'centred') {
    return (
      <section
        className={`relative sp-80-64 ${t.wrapper}`}
        style={hasImage ? { backgroundImage: `url(${(backgroundImage as any).url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {hasImage && <div className="absolute inset-0 bg-black/50" />}
        <div className="container-inner relative z-10">
          <div className="max-w-[820px] mx-auto flex flex-col items-center text-center gap-5">
            {badge && (
              <span className={`text-[13px] font-bold uppercase tracking-[0.12em] ${t.eyebrow}`}>
                {badge}
              </span>
            )}
            <h1 className={theme === 'light' ? undefined : 'text-white'}>{headline}</h1>
            {subheadline && (
              <p className={`text-lg leading-[1.65] max-w-[56ch] ${t.sub}`}>{subheadline}</p>
            )}
            <HeroLinks links={links} theme={theme} />
          </div>
        </div>
      </section>
    )
  }

  // No design instance found for "fullwidth" — genuinely full-bleed image hero,
  // structure kept as-is, only tokens/typography corrected.
  if (style === 'fullwidth') {
    return (
      <section
        className={`relative min-h-[80vh] flex items-end pb-16 px-6 md:px-12 ${t.wrapper}`}
        style={hasImage ? { backgroundImage: `url(${(backgroundImage as any).url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />}
        <div className="relative z-10 max-w-2xl">
          {badge && (
            <span className={`inline-block text-[13px] font-bold uppercase tracking-[0.12em] mb-5 ${t.eyebrow}`}>
              {badge}
            </span>
          )}
          <h1 className="text-white mb-4">{headline}</h1>
          {subheadline && <p className="text-white/75 text-lg mb-7 leading-relaxed max-w-lg">{subheadline}</p>}
          <HeroLinks links={links} theme={theme} />
        </div>
      </section>
    )
  }

  // No design instance found for "split" either — genuinely full-bleed
  // text/image hero, structure kept as-is, only tokens/typography corrected.
  return (
    <section className={`min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 ${t.wrapper}`}>
      <div className="flex flex-col justify-center px-8 md:px-14 py-16 lg:py-24 order-2 lg:order-1">
        {badge && (
          <span className={`inline-flex w-fit text-[13px] font-bold uppercase tracking-[0.12em] mb-6 ${t.eyebrow}`}>
            {badge}
          </span>
        )}
        <h1 className={`mb-5 ${theme === 'light' ? '' : 'text-white'}`}>{headline}</h1>
        {subheadline && (
          <p className={`text-lg mb-8 leading-relaxed max-w-md ${t.sub}`}>{subheadline}</p>
        )}
        <HeroLinks links={links} theme={theme} />
      </div>

      <div className="relative min-h-[50vh] lg:min-h-0 order-1 lg:order-2 overflow-hidden bg-muted">
        {hasImage ? (
          <img
            src={(backgroundImage as any).url}
            alt={(backgroundImage as any).alt || headline}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-border" />
        )}
      </div>
    </section>
  )
}

function HeroLinks({ links, theme }: { links: HomeHeroBlockProps['links']; theme?: string | null }) {
  if (!links || links.length === 0) return null
  const t = THEME_CLASSES[theme as keyof typeof THEME_CLASSES] || THEME_CLASSES.dark
  return (
    <div className="flex flex-wrap gap-3">
      {links.map(({ link }, i) => {
        const href = link.type === 'reference' && link.reference
          ? `/${(link.reference.value as any)?.slug || ''}`
          : link.url || '/'
        const isPrimary = i === 0 || link.appearance === 'default'
        return (
          <Link
            key={i}
            href={href}
            {...(link.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className={`group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[6px] text-base font-bold transition-colors ${
              isPrimary ? 'bg-primary text-white hover:bg-(--mms-primary-hover)' : t.ghostLink
            }`}
          >
            {isPrimary ? stripTrailingArrow(link.label) : link.label}
            {isPrimary && <ArrowRight />}
          </Link>
        )
      })}
    </div>
  )
}
