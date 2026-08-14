'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type SetupStep = 'loading' | 'scan' | 'verify' | 'backup' | 'done'

export const SetupTwoFactor: React.FC = () => {
  const router = useRouter()
  const [step, setStep] = useState<SetupStep>('loading')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/2fa/setup', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
          return
        }
        setQrDataUrl(data.qrDataUrl)
        setSecret(data.secret)
        setStep('scan')
      })
      .catch(() => setError('Failed to load setup'))
  }, [])

  const handleVerify = useCallback(async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid code')
        return
      }

      setBackupCodes(data.backupCodes)
      setStep('backup')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [code])

  const containerStyle: React.CSSProperties = {
    maxWidth: '460px',
    margin: '0 auto',
    padding: '2rem',
  }

  const headingStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
    color: 'var(--theme-text)',
  }

  const textStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--theme-elevation-800)',
    marginBottom: '1.25rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.625rem 0.75rem',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '0.375rem',
    fontSize: '1.25rem',
    letterSpacing: '0.25rem',
    textAlign: 'center',
    background: 'var(--theme-input-bg)',
    color: 'var(--theme-text)',
    marginBottom: '0.75rem',
  }

  const btnPrimaryStyle: React.CSSProperties = {
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
  }

  const codeBoxStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.375rem',
    background: 'var(--theme-elevation-50)',
    border: '1px solid var(--theme-elevation-200)',
    borderRadius: '0.375rem',
    padding: '1rem',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    marginBottom: '1rem',
  }

  if (step === 'loading') {
    return (
      <div style={containerStyle}>
        <p style={textStyle}>Loading setup…</p>
      </div>
    )
  }

  if (step === 'scan') {
    return (
      <div style={containerStyle}>
        <h2 style={headingStyle}>Set Up Two-Factor Authentication</h2>
        <p style={textStyle}>
          Scan the QR code below with your authenticator app (Google Authenticator, Authy, 1Password,
          etc.), then enter the 6-digit code it shows.
        </p>

        {qrDataUrl && (
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="TOTP QR code" style={{ width: 200, height: 200 }} />
          </div>
        )}

        <p style={{ ...textStyle, marginBottom: '0.5rem' }}>
          Can&apos;t scan? Enter this key manually:
        </p>
        <code
          style={{
            display: 'block',
            padding: '0.5rem',
            background: 'var(--theme-elevation-50)',
            borderRadius: '0.25rem',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            wordBreak: 'break-all',
            marginBottom: '1.25rem',
          }}
        >
          {secret}
        </code>

        <label style={{ ...textStyle, marginBottom: '0.375rem', display: 'block', fontWeight: 500 }}>
          Enter the 6-digit code from your app:
        </label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="000000"
          autoFocus
          style={inputStyle}
        />

        {error && <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}

        <button type="button" onClick={handleVerify} disabled={loading || code.length !== 6} style={btnPrimaryStyle}>
          {loading ? 'Verifying…' : 'Activate 2FA'}
        </button>
      </div>
    )
  }

  if (step === 'backup') {
    return (
      <div style={containerStyle}>
        <h2 style={headingStyle}>Save Your Backup Codes</h2>
        <p style={textStyle}>
          Store these codes somewhere safe. Each code can be used once if you lose access to your
          authenticator app.
        </p>

        <div style={codeBoxStyle}>
          {backupCodes.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push('/admin')}
          style={btnPrimaryStyle}
        >
          I&apos;ve saved my codes — Continue to Admin
        </button>
      </div>
    )
  }

  return null
}

export default SetupTwoFactor
