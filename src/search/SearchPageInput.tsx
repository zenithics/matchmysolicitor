'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Props {
  initialValue?: string
}

export const SearchPageInput: React.FC<Props> = ({ initialValue = '' }) => {
  const [value, setValue] = useState(initialValue)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set('q', value.trim())
    } else {
      params.delete('q')
    }
    params.delete('type')
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Label htmlFor="search-page-input" className="sr-only">
        Search
      </Label>
      <Input
        id="search-page-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search pages, posts…"
        className="pr-12 h-12 text-base rounded-full border-border focus:border-primary"
        autoFocus
      />
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-accent transition-colors"
        aria-label="Submit search"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  )
}
