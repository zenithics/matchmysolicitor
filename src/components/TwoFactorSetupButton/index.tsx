'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

type SetupStep = 'loading' | 'ready' | 'verifying' | 'backup' | 'done'
type DisableStep = 'confirm' | 'disabling' | 'done'

// ─── Shared styles ───────────────────────────────────────────────────────────

const backdrop: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
  background: 'rgba(0,0,0,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
}

const card: React.CSSProperties = {
  width: '100%',
  maxWidth: 420,
  background: 'var(--theme-bg)',
  border: '1px solid var(--theme-elevation-200)',
  borderRadius: '0.75rem',
  padding: '1.75rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
  color: 'var(--theme-text)',
  maxHeight: '90vh',
  overflowY: 'auto',
}

const heading: React.CSSProperties = {
  fontSize: '1.125rem',
  fontWeight: 700,
  marginBottom: '0.5rem',
  color: 'var(--theme-text)',
}

const body: React.CSSProperties = {
  fontSize: '0.875rem',
  color: 'var(--theme-elevation-800)',
  marginBottom: '1.25rem',
  lineHeight: 1.5,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem 0.75rem',
  border: '1px solid var(--theme-elevation-300)',
  borderRadius: '0.375rem',
  fontSize: '1.25rem',
  letterSpacing: '0.3rem',
  textAlign: 'center',
  background: 'var(--theme-input-bg)',
  color: 'var(--theme-text)',
  marginBottom: '0.75rem',
  boxSizing: 'border-box',
}

const btnPrimary: React.CSSProperties = {
  width: '100%',
  padding: '0.625rem',
  background: 'var(--theme-success-500)',
  color: '#fff',
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
  fontSize: '0.875rem',
  fontWeight: 600,
  marginBottom: '0.5rem',
}

const btnDanger: React.CSSProperties = {
  ...btnPrimary,
  background: 'var(--theme-error-500, #dc2626)',
}

const btnGhost: React.CSSProperties = {
  ...btnPrimary,
  background: 'transparent',
  border: '1px solid var(--theme-elevation-300)',
  color: 'var(--theme-text)',
}

const codeGrid: React.CSSProperties = {
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

// ─── Main component ───────────────────────────────────────────────────────────

const TwoFactorSetupButton: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.twoFactorEnabled) setIsEnabled(true)
      })
      .catch(() => {})
  }, [])

  const openModal = useCallback(() => setShowModal(true), [])
  const closeModal = useCallback(() => setShowModal(false), [])

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          marginTop: '0.5rem',
          padding: '0.375rem 0.75rem',
          border: `1px solid ${isEnabled ? 'var(--theme-error-500, #dc2626)' : 'var(--theme-elevation-400)'}`,
          borderRadius: '0.375rem',
          background: 'transparent',
          color: isEnabled ? 'var(--theme-error-500, #dc2626)' : 'var(--theme-text)',
          fontSize: '0.8rem',
          cursor: 'pointer',
          fontWeight: 500,
        }}
      >
        {isEnabled ? '🔓 Disable 2FA' : '🔒 Set Up 2FA'}
      </button>

      {showModal && isEnabled && (
        <DisableModal onClose={closeModal} />
      )}

      {showModal && !isEnabled && (
        <SetupModal onClose={closeModal} />
      )}
    </>
  )
}

export default TwoFactorSetupButton

// ─── Setup modal ─────────────────────────────────────────────────────────────

const SetupModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<SetupStep>('loading')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [secret, setSecret] = useState('')
  const [code, setCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const codeRef = useRef<HTMLInputElement>(null)

  // Load QR on first render
  const loaded = useRef(false)
  if (!loaded.current) {
    loaded.current = true
    fetch('/api/2fa/setup', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); setStep('ready'); return }
        setQrDataUrl(data.qrDataUrl)
        setSecret(data.secret)
        setStep('ready')
        // Focus code input after QR loads
        setTimeout(() => codeRef.current?.focus(), 50)
      })
      .catch(() => { setError('Failed to load setup'); setStep('ready') })
  }

  const handleVerify = useCallback(async () => {
    if (code.length !== 6) return
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
      if (!res.ok) { setError(data.error || 'Invalid code'); return }
      setBackupCodes(data.backupCodes)
      setStep('backup')
    } catch {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [code])

  return (
    <div style={backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        {step === 'loading' && (
          <p style={body}>Generating QR code…</p>
        )}

        {step === 'ready' && (
          <>
            <h3 style={heading}>Set Up Two-Factor Authentication</h3>
            <p style={body}>
              Scan the QR code with your authenticator app (Google Authenticator, Authy,
              1Password, etc.), then enter the 6-digit code it shows.
            </p>

            {qrDataUrl && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
                {/* White square ensures QR has sufficient contrast in dark theme */}
                <div style={{ background: '#fff', padding: '0.75rem', borderRadius: '0.5rem', display: 'inline-block' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="2FA QR code" width={180} height={180} />
                </div>
              </div>
            )}

            <p style={{ ...body, marginBottom: '0.375rem' }}>Can&apos;t scan? Enter manually:</p>
            <code
              style={{
                display: 'block',
                padding: '0.5rem 0.75rem',
                background: 'var(--theme-elevation-100)',
                borderRadius: '0.375rem',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                wordBreak: 'break-all',
                marginBottom: '1.25rem',
                color: 'var(--theme-text)',
              }}
            >
              {secret}
            </code>

            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              Enter the 6-digit code from your app:
            </label>
            <input
              ref={codeRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="000000"
              style={inputStyle}
            />

            {error && <p style={{ color: 'var(--theme-error-500, #dc2626)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}

            <button
              type="button"
              onClick={handleVerify}
              disabled={loading || code.length !== 6}
              style={{ ...btnPrimary, opacity: loading || code.length !== 6 ? 0.6 : 1, cursor: loading || code.length !== 6 ? 'not-allowed' : 'pointer' }}
            >
              {loading ? 'Verifying…' : 'Activate 2FA'}
            </button>
            <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
          </>
        )}

        {step === 'backup' && (
          <>
            <h3 style={heading}>Save Your Backup Codes</h3>
            <p style={body}>
              Store these codes somewhere safe. Each code can be used once if you lose
              access to your authenticator app. You won&apos;t be able to see them again.
            </p>

            <div style={codeGrid}>
              {backupCodes.map((c) => <span key={c}>{c}</span>)}
            </div>

            <button
              type="button"
              onClick={() => { window.location.reload() }}
              style={btnPrimary}
            >
              I&apos;ve saved my codes — Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Disable modal ────────────────────────────────────────────────────────────

const DisableModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<DisableStep>('confirm')
  const [error, setError] = useState('')

  const handleDisable = useCallback(async () => {
    setStep('disabling')
    setError('')
    try {
      const res = await fetch('/api/2fa/disable', {
        method: 'POST',
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to disable'); setStep('confirm'); return }
      window.location.reload()
    } catch {
      setError('Something went wrong')
      setStep('confirm')
    }
  }, [])

  return (
    <div style={backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...card, maxWidth: 380 }}>
        <h3 style={heading}>Disable Two-Factor Authentication</h3>
        <p style={body}>
          Are you sure? Your account will be protected only by your password.
          You&apos;ll need to complete the setup flow again to re-enable 2FA.
        </p>

        {error && <p style={{ color: 'var(--theme-error-500, #dc2626)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}

        <button
          type="button"
          onClick={handleDisable}
          disabled={step === 'disabling'}
          style={{ ...btnDanger, opacity: step === 'disabling' ? 0.7 : 1, cursor: step === 'disabling' ? 'not-allowed' : 'pointer' }}
        >
          {step === 'disabling' ? 'Disabling…' : 'Yes, Disable 2FA'}
        </button>
        <button type="button" onClick={onClose} style={btnGhost}>Cancel</button>
      </div>
    </div>
  )
}
