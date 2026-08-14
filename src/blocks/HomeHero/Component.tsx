import React from 'react'
import Link from 'next/link'
import type { HomeHeroBlock as HomeHeroBlockProps } from '@/payload-types'

const THEME_CLASSES = {
  dark: {
    wrapper: 'bg-[var(--brand-deep-plum)] text-white',
    badge: 'bg-white/10 text-pink-300 border border-white/20',
    headline: 'text-white',
    sub: 'text-white/65',
  },
  light: {
    wrapper: 'bg-[#f8fafc] text-foreground',
    badge: 'bg-[var(--brand-blush)] text-primary border border-primary/20',
    headline: 'text-foreground',
    sub: 'text-muted-foreground',
  },
  pink: {
    wrapper: 'bg-gradient-to-br from-primary via-pink-500 to-rose-400 text-white',
    badge: 'bg-white/20 text-white border border-white/30',
    headline: 'text-white',
    sub: 'text-white/80',
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

  if (style === 'centred') {
    return (
      <section
        className={`relative min-h-[75vh] flex items-center justify-center text-center px-6 py-24 ${t.wrapper}`}
        style={hasImage ? { backgroundImage: `url(${(backgroundImage as any).url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {hasImage && <div className="absolute inset-0 bg-black/50" />}
        <div className="relative z-10 max-w-3xl mx-auto">
          {badge && (
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 ${t.badge}`}>
              {badge}
            </span>
          )}
          <h1 className={`font-serif text-5xl md:text-7xl leading-tight mb-5 ${t.headline}`}>{headline}</h1>
          {subheadline && <p className={`text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed ${t.sub}`}>{subheadline}</p>}
          <HeroLinks links={links} />
        </div>
      </section>
    )
  }

  if (style === 'fullwidth') {
    return (
      <section
        className={`relative min-h-[80vh] flex items-end pb-16 px-6 md:px-12 ${t.wrapper}`}
        style={hasImage ? { backgroundImage: `url(${(backgroundImage as any).url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {hasImage && <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />}
        <div className="relative z-10 max-w-2xl">
          {badge && (
            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-5 ${t.badge}`}>
              {badge}
            </span>
          )}
          <h1 className="font-serif text-5xl md:text-6xl text-white leading-tight mb-4">{headline}</h1>
          {subheadline && <p className="text-white/75 text-base mb-7 leading-relaxed max-w-lg">{subheadline}</p>}
          <HeroLinks links={links} />
        </div>
      </section>
    )
  }

  /* Default: split layout */
  return (
    <section className={`min-h-[85vh] grid grid-cols-1 lg:grid-cols-2 ${t.wrapper}`}>
      {/* Text side */}
      <div className="flex flex-col justify-center px-8 md:px-14 py-16 lg:py-24 order-2 lg:order-1">
        {badge && (
          <span className={`inline-flex w-fit px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-6 ${t.badge}`}>
            {badge}
          </span>
        )}
        <h1 className={`font-serif text-5xl md:text-6xl xl:text-7xl leading-[1.05] mb-5 ${t.headline}`}>
          {headline}
        </h1>
        {subheadline && (
          <p className={`text-base md:text-lg mb-8 leading-relaxed max-w-md ${t.sub}`}>
            {subheadline}
          </p>
        )}
        <HeroLinks links={links} />
      </div>

      {/* Image side */}
      <div className="relative min-h-[50vh] lg:min-h-0 order-1 lg:order-2 overflow-hidden bg-gradient-to-br from-pink-200 via-rose-100 to-[var(--brand-blush)]">
        {hasImage ? (
          <img
            src={(backgroundImage as any).url}
            alt={(backgroundImage as any).alt || headline}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[120px]">💅</div>
        )}
      </div>
    </section>
  )
}

function HeroLinks({ links }: { links: HomeHeroBlockProps['links'] }) {
  if (!links || links.length === 0) return null
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
            className={`inline-flex items-center justify-center px-7 py-3.5 rounded-full text-sm font-bold transition-all ${
              isPrimary
                ? 'bg-primary text-white hover:bg-primary/90 shadow-[0_4px_16px_rgba(232,23,122,0.35)]'
                : 'border border-white/30 text-white hover:bg-white/10'
            }`}
          >
            {link.label}
          </Link>
        )
      })}
    </div>
  )
}
