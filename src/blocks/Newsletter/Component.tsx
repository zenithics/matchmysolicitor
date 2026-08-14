'use client'

import React, { useState } from 'react'
import type { NewsletterBlock as NewsletterBlockProps } from '@/payload-types'

const THEMES = {
  dark: {
    wrapper: 'bg-[var(--brand-deep-plum)]',
    heading: 'text-white',
    sub: 'text-white/60',
    input: 'bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary',
    button: 'bg-primary text-white hover:bg-primary/90',
  },
  light: {
    wrapper: 'bg-[var(--brand-blush)]',
    heading: 'text-foreground',
    sub: 'text-muted-foreground',
    input: 'bg-white border-[var(--border-subtle)] text-foreground placeholder:text-muted-foreground focus:border-primary',
    button: 'bg-primary text-white hover:bg-primary/90',
  },
  pink: {
    wrapper: 'bg-gradient-to-r from-primary to-rose-400',
    heading: 'text-white',
    sub: 'text-white/75',
    input: 'bg-white/20 border-white/30 text-white placeholder:text-white/50 focus:border-white',
    button: 'bg-white text-primary hover:bg-white/90 font-bold',
  },
}

export const NewsletterBlock: React.FC<NewsletterBlockProps & { disableInnerContainer?: boolean }> = ({
  heading,
  subheading,
  buttonLabel,
  theme = 'dark',
}) => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const t = THEMES[theme as keyof typeof THEMES] || THEMES.dark

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        setErrorMsg(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setErrorMsg('Failed to subscribe. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`py-16 px-6 ${t.wrapper}`}>
      <div className="max-w-2xl mx-auto text-center">
        <h2 className={`font-serif text-3xl md:text-4xl mb-2 ${t.heading}`}>
          {heading || 'Get 10% off your first order'}
        </h2>
        {subheading && (
          <p className={`text-sm mb-8 leading-relaxed ${t.sub}`}>{subheading}</p>
        )}

        {submitted ? (
          <div className="flex items-center justify-center gap-2 text-white font-semibold text-sm">
            <span className="text-2xl">✓</span>
            You're on the list! Check your inbox for your discount code.
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg('') }}
                required
                placeholder="your@email.com"
                disabled={loading}
                className={`flex-1 px-5 py-3.5 rounded-l-full border text-sm focus:outline-none transition-colors disabled:opacity-70 ${t.input}`}
              />
              <button
                type="submit"
                disabled={loading}
                className={`px-7 py-3.5 rounded-r-full text-sm font-bold transition-colors whitespace-nowrap disabled:opacity-70 ${t.button}`}
              >
                {loading ? '…' : (buttonLabel || 'Subscribe')}
              </button>
            </form>
            {errorMsg && (
              <p className="text-sm text-red-300 mt-3">{errorMsg}</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
