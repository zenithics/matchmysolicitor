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
 * Blocks that render their own <section> with vertical padding. Wrapping these
 * in my-16 as well stacked ~160px between sections, which is what made the
 * imported pages read as far more spaced out than the design. Blocks not listed
 * here have no internal padding and still need the wrapper.
 */
const SELF_PADDED_BLOCKS = new Set([
  'homeHero',
  'heroSplit',
  'textMedia',
  'howItWorks',
  'embed',
  'imageGallery',
  'mapEmbed',
  'newsletter',
  'teamGrid',
  'timeline',
  'videoEmbed',
  'enquiryWizard',
])

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <div
                  className={SELF_PADDED_BLOCKS.has(blockType) ? undefined : 'my-16'}
                  key={index}
                >
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </div>
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
