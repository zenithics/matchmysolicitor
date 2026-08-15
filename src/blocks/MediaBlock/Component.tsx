import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import React from 'react'
import RichText from '@/components/RichText'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '../../components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  captionClassName?: string
  className?: string
  enableGutter?: boolean
  imgClassName?: string
  staticImage?: StaticImageData
  disableInnerContainer?: boolean
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    captionClassName,
    className,
    enableGutter = true,
    imgClassName,
    media,
    staticImage,
    disableInnerContainer,
  } = props

  let caption
  if (media && typeof media === 'object') caption = media.caption

  const content = (
    <>
      {(media || staticImage) && (
        <Media
          imgClassName={cn('border border-border rounded-[10px]', imgClassName)}
          resource={media}
          src={staticImage}
        />
      )}
      {caption && (
        <div
          className={cn(
            'mt-6',
            {
              'container-inner': !disableInnerContainer,
            },
            captionClassName,
          )}
        >
          <RichText data={caption} enableGutter={false} />
        </div>
      )}
    </>
  )

  // Also embedded inline inside RichText content (see src/components/RichText/index.tsx),
  // where it must stay a plain, unpadded div positioned by the prose grid — `enableGutter`
  // is what the two call sites use to tell this component which context it's in.
  if (!enableGutter) {
    return <div className={cn(className)}>{content}</div>
  }

  return (
    <section className="sp-64">
      <div className={cn('container-inner', className)}>{content}</div>
    </section>
  )
}
