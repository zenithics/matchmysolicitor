import React from 'react'
import type { VideoEmbedBlock as VideoEmbedBlockProps } from '@/payload-types'

const widthClasses: Record<string, string> = {
  small: 'max-w-screen-sm',
  medium: 'max-w-screen-md',
  large: 'max-w-screen-lg',
  full: 'max-w-none',
}

const aspectClasses: Record<string, string> = {
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '1:1': 'aspect-square',
}

function getEmbedURL(url: string): string | null {
  try {
    const parsed = new URL(url)

    // YouTube
    if (parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be')) {
      let videoId: string | null = null
      if (parsed.hostname.includes('youtu.be')) {
        videoId = parsed.pathname.slice(1)
      } else {
        videoId = parsed.searchParams.get('v')
      }
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`
    }

    // Vimeo
    if (parsed.hostname.includes('vimeo.com')) {
      const videoId = parsed.pathname.split('/').filter(Boolean).pop()
      if (videoId) return `https://player.vimeo.com/video/${videoId}`
    }

    // Return as-is if already an embed URL
    return url
  } catch {
    return null
  }
}

export const VideoEmbedBlock: React.FC<VideoEmbedBlockProps> = ({
  heading,
  videoURL,
  aspectRatio = '16:9',
  maxWidth = 'large',
  caption,
}) => {
  const embedURL = videoURL ? getEmbedURL(videoURL) : null
  if (!embedURL) return null

  return (
    <section className="py-16 bg-background">
      <div className="container">
        {heading && (
          <h2 className="text-3xl font-serif tracking-tight text-center mb-8">{heading}</h2>
        )}
        <div className={`mx-auto ${widthClasses[maxWidth ?? 'large']}`}>
          <div className={`relative w-full ${aspectClasses[aspectRatio ?? '16:9']} rounded-xl overflow-hidden bg-muted`}>
            <iframe
              src={embedURL}
              title={heading || 'Video'}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {caption && (
            <p className="text-sm text-muted-foreground text-center mt-3">{caption}</p>
          )}
        </div>
      </div>
    </section>
  )
}
