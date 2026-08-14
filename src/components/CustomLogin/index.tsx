'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TwoFactorChallenge } from '@/components/TwoFactorChallenge'

type LoginStep = 'credentials' | '2fa' | 'setup-required'

export const CustomLogin: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'

  const [step, setStep] = useState<LoginStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // If user is already logged in (e.g. navigated back to login), detect and handle
  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          // User is already authenticated
          const user = data.user
          if (user.twoFactorEnabled) {
            // Check if 2FA has been verified this session
            const has2faCookie = document.cookie.includes('payload-2fa=')
            if (has2faCookie) {
              router.replace(redirect)
            } else {
              setStep('2fa')
            }
          } else {
            router.replace(redirect)
          }
        }
      })
      .catch(() => {
        // Not logged in — stay on credentials screen
      })
  }, [redirect, router])

  const handleCredentialSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!email.trim() || !password.trim()) return

      setLoading(true)
      setError('')

      try {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()

        if (!res.ok) {
          setError(data.errors?.[0]?.message || 'Invalid email or password')
          return
        }

        const user = data.user

        if (!user.twoFactorEnabled) {
          // No 2FA — proceed directly
          router.replace(redirect)
          return
        }

        // 2FA enabled — we need to verify before proceeding
        // Check if setup is complete (secret exists) — if not, direct to setup
        // Note: twoFactorSecret is never returned by the API (access: false),
        // so twoFactorEnabled being true means setup is complete.
        setStep('2fa')
      } catch {
        setError('Something went wrong. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [email, password, redirect, router],
  )

  const handle2FASuccess = useCallback(() => {
    router.replace(redirect)
  }, [redirect, router])

  const handle2FACancel = useCallback(() => {
    // Log out the current session and return to credentials
    fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).finally(() => {
      setStep('credentials')
      setPassword('')
      setError('')
    })
  }, [])

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--theme-bg)',
    padding: '1.5rem',
  }

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '400px',
    background: 'var(--theme-elevation-0)',
    border: '1px solid var(--theme-elevation-150)',
    borderRadius: '0.75rem',
    padding: '2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--theme-elevation-800)',
    marginBottom: '0.375rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '0.375rem',
    fontSize: '0.9rem',
    background: 'var(--theme-input-bg)',
    color: 'var(--theme-text)',
    marginBottom: '1rem',
    boxSizing: 'border-box',
  }

  const submitBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem',
    background: 'var(--theme-success-500)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.375rem',
    cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    opacity: loading ? 0.7 : 1,
    marginTop: '0.25rem',
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo area */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              display: 'inline-block',
              width: 48,
              height: 48,
              borderRadius: '0.5rem',
              background: 'var(--theme-elevation-100)',
              marginBottom: '0.75rem',
            }}
          />
          <h1
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--theme-text)',
              margin: 0,
            }}
          >
            Admin Login
          </h1>
        </div>

        {step === 'credentials' && (
          <form onSubmit={handleCredentialSubmit}>
            <div>
              <label htmlFor="email" style={labelStyle}>
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label htmlFor="password" style={labelStyle}>
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
              />
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} style={submitBtnStyle}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <a
                href="/admin/forgot"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--theme-elevation-600)',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </a>
            </div>
          </form>
        )}

        {step === '2fa' && (
          <TwoFactorChallenge onSuccess={handle2FASuccess} onCancel={handle2FACancel} />
        )}
      </div>
    </div>
  )
}
