import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CodeBlock } from '@/blocks/Code/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContentBlock } from '@/blocks/Content/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { TestimonialsBlock } from '@/blocks/Testimonials/Component'
import { FAQBlock } from '@/blocks/FAQ/Component'
import { FeaturesBlock } from '@/blocks/Features/Component'
import { StatsBlock } from '@/blocks/Stats/Component'
import { LogoCarouselBlock } from '@/blocks/LogoCarousel/Component'
import { PricingBlock } from '@/blocks/Pricing/Component'
import { HeroSplitBlock } from '@/blocks/HeroSplit/Component'
import { HowItWorksBlock } from '@/blocks/HowItWorks/Component'
import { ImageGalleryBlock } from '@/blocks/ImageGallery/Component'
import { HomeHeroBlock } from '@/blocks/HomeHero/Component'
import { NewsletterBlock } from '@/blocks/Newsletter/Component'
import { TeamGridBlock } from '@/blocks/TeamGrid/Component'
import { VideoEmbedBlock } from '@/blocks/VideoEmbed/Component'
import { MapEmbedBlock } from '@/blocks/MapEmbed/Component'
import { EmbedBlock } from '@/blocks/Embed/Component'
import { TimelineBlock } from '@/blocks/Timeline/Component'
import { TextMediaBlock } from '@/blocks/TextMedia/Component'
import { EnquiryWizardBlock } from '@/blocks/EnquiryWizard/Component'

const blockComponents = {
  archive: ArchiveBlock,
  banner: BannerBlock,
  code: CodeBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  testimonials: TestimonialsBlock,
  faq: FAQBlock,
  features: FeaturesBlock,
  stats: StatsBlock,
  logoCarousel: LogoCarouselBlock,
  pricing: PricingBlock,
  heroSplit: HeroSplitBlock,
  howItWorks: HowItWorksBlock,
  imageGallery: ImageGalleryBlock,
  homeHero: HomeHeroBlock,
  newsletter: NewsletterBlock,
  teamGrid: TeamGridBlock,
  videoEmbed: VideoEmbedBlock,
  mapEmbed: MapEmbedBlock,
  embed: EmbedBlock,
  timeline: TimelineBlock,
  textMedia: TextMediaBlock,
  enquiryWizard: EnquiryWizardBlock,
}

/*
 * On the service pages the design wraps the whole article — content, CTA
 * bands, warning banners, stat rows, FAQ and the guides archive — in a single
 * 820px column (see `<article style="max-width:820px">` in design-export).
 * Only the hero, the top stat strip and the closing dark CTA run full width.
 * Hub and guides pages keep everything full width, so the narrowing is scoped
 * to layouts that pair an enquiry wizard with article content.
 */
const ARTICLE_BLOCKS = new Set(['content', 'cta', 'banner', 'stats', 'faq', 'archive'])

const getArticleRange = (blocks: Page['layout'][0][]): [number, number] | null => {
  const types = blocks.map((b) => b.blockType)
  if (!types.includes('content') || !types.includes('enquiryWizard')) return null

  const start = types.indexOf('content')
  let end = blocks.length - 1
  while (end > start && !ARTICLE_BLOCKS.has(types[end] as string)) end--
  // the closing dark CTA is full width in the design
  if (types[end] === 'cta') end--
  return end > start ? [start, end] : null
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0
  const articleRange = hasBlocks ? getArticleRange(blocks) : null

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              const inArticle =
                articleRange && index >= articleRange[0] && index <= articleRange[1]

              const rendered = (
                // @ts-expect-error there may be some mismatch between the expected types here
                <Block {...block} disableInnerContainer key={index} />
              )

              return inArticle ? (
                <div
                  className="[&_.container-inner]:max-w-[820px] [&_.container]:max-w-[820px]"
                  key={index}
                >
                  {rendered}
                </div>
              ) : (
                rendered
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
