import React from 'react'
import { cn } from '@/utilities/ui'

export const ImagePlaceholder: React.FC<{ alt?: string; className?: string }> = ({
  alt,
  className,
}) => (
  <div
    className={cn(
      'w-full max-w-full min-w-0 aspect-[4/3] rounded-[10px] flex items-center justify-center',
      className,
    )}
    style={{
      backgroundImage:
        'repeating-linear-gradient(45deg, #E8ECEF 0 14px, #F4F6F8 14px 28px)',
    }}
  >
    {alt && (
      <span className="font-mono text-[13px] text-(--mms-muted-light) bg-white px-[14px] py-2 rounded">
        {alt}
      </span>
    )}
  </div>
)
