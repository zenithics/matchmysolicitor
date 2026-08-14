'use client'

import React, { useState } from 'react'

export function FooterNewsletterForm() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <p className="text-sm text-pink-300 font-medium">
        ✓ You're on the list — check your inbox for your 10% code!
      </p>
    )
  }

  return (
    <form className="flex w-full md:w-auto gap-0" onSubmit={handleSubmit}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 md:w-64 px-4 py-3 rounded-l-full bg-white/10 border border-white/20 text-sm placeholder:text-white/40 focus:outline-none focus:border-primary text-white"
      />
      <button
        type="submit"
        className="px-6 py-3 rounded-r-full bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
      >
        Subscribe
      </button>
    </form>
  )
}
