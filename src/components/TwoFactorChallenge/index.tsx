'use client'

import React, { useCallback, useState } from 'react'

interface TwoFactorChallengeProps {
  onSuccess: () => void
  onCancel: () => void
}

export const TwoFactorChallenge: React.FC<TwoFactorChallengeProps> = ({ onSuccess, onCancel }) => {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isBackupMode, setIsBackupMode] = useState(false)

  const handleVerify = useCallback(async () => {
    if (!code.trim()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/2fa/challenge', {
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

      onSuccess()
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [code, onSuccess])

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid var(--theme-elevation-300)',
    borderRadius: '0.375rem',
    fontSize: isBackupMode ? '0.9rem' : '1.5rem',
    letterSpacing: isBackupMode ? '0' : '0.3rem',
    textAlign: 'center',
    background: 'var(--theme-input-bg)',
    color: 'var(--theme-text)',
    marginBottom: '0.75rem',
  }

  return (
    <div>
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: 'var(--theme-text)',
        }}
      >
        Two-Factor Authentication
      </h3>
      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--theme-elevation-700)',
          marginBottom: '1rem',
        }}
      >
        {isBackupMode
          ? 'Enter one of your backup codes.'
          : 'Enter the 6-digit code from your authenticator app.'}
      </p>

      <input
        type="text"
        inputMode={isBackupMode ? 'text' : 'numeric'}
        pattern={isBackupMode ? undefined : '[0-9]*'}
        maxLength={isBackupMode ? 10 : 6}
        value={code}
        onChange={(e) => {
          const v = isBackupMode
            ? e.target.value.toLowerCase().replace(/[^a-f0-9]/g, '').slice(0, 10)
            : e.target.value.replace(/\D/g, '').slice(0, 6)
          setCode(v)
        }}
        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
        placeholder={isBackupMode ? 'xxxxxxxxxx' : '000000'}
        autoFocus
        style={inputStyle}
      />

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleVerify}
        disabled={loading || code.length < (isBackupMode ? 10 : 6)}
        style={{
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
          marginBottom: '0.75rem',
        }}
      >
        {loading ? 'Verifying…' : 'Verify'}
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
        <button
          type="button"
          onClick={() => {
            setIsBackupMode((v) => !v)
            setCode('')
            setError('')
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--theme-elevation-600)',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {isBackupMode ? 'Use authenticator app' : 'Use a backup code'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--theme-elevation-600)',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          Back to login
        </button>
      </div>
    </div>
  )
}
