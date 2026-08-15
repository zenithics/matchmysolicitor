import React from 'react'

export const ArrowRight: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    className={className ?? 'size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none'}
  >
    <path
      d="M2.5 8h11M9 3.5 13.5 8 9 12.5"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export function stripTrailingArrow(label?: string | null): string {
  return (label ?? '').replace(/\s*(→|->|»)\s*$/, '')
}
