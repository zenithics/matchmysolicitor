import React, { Fragment } from 'react'

import type { Props } from './types'

import { ImageMedia } from './ImageMedia'
import { ImagePlaceholder } from './ImagePlaceholder'
import { VideoMedia } from './VideoMedia'

export const Media: React.FC<Props> = (props) => {
  const { alt, className, htmlElement = 'div', imgClassName, resource, src } = props

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')
  // A Media doc can exist with only an alt filled in (no file ever uploaded yet)
  // — render the design's placeholder box rather than a broken image whose alt
  // text is the only thing the browser has left to show.
  const hasNoFile = typeof resource === 'object' && resource !== null && !resource.url && !src
  const Tag = htmlElement || Fragment

  return (
    <Tag
      {...(htmlElement !== null
        ? {
            className,
          }
        : {})}
    >
      {hasNoFile ? (
        <ImagePlaceholder alt={alt || (resource as { alt?: string })?.alt} className={imgClassName} />
      ) : isVideo ? (
        <VideoMedia {...props} />
      ) : (
        <ImageMedia {...props} />
      )}
    </Tag>
  )
}
