import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span
      className={clsx(
        'font-serif tracking-widest uppercase text-lg font-medium leading-none',
        className,
      )}
      style={{ letterSpacing: '0.2em' }}
    >
      Your Brand
    </span>
  )
}
