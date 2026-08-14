'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { TwoFactorChallenge } from '@/components/TwoFactorChallenge'

type GateState = 'loading' | 'ok' | 'challenge'

const TwoFactorGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GateState>('loading')

  useEffect(() => {
    fetch('/api/users/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        const user = data?.user
        if (!user) {
          setState('ok')
          return
        }
        if (!user.twoFactorEnabled) {
          setState('ok')
          return
        }
        // User has 2FA enabled — check if already verified this session
        const cookieEntry = document.cookie
          .split(';')
          .find((c) => c.trim().startsWith('payload-2fa='))
        if (cookieEntry) {
          const cookieValue = cookieEntry.split('=')[1]?.trim()
          if (cookieValue === String(user.id)) {
            setState('ok')
            return
          }
        }
        // 2FA required and not yet verified
        setState('challenge')
      })
      .catch(() => setState('ok'))
  }, [])

  const handleSuccess = useCallback(() => {
    setState('ok')
  }, [])

  const handleCancel = useCallback(() => {
    fetch('/api/users/logout', { method: 'POST', credentials: 'include' }).then(() => {
      window.location.href = '/admin/login'
    })
  }, [])

  if (state === 'loading') {
    return (
      <>
        {children}
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'var(--theme-bg, #0d0d0d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--theme-text)',
            fontSize: '0.9rem',
          }}
        >
          Loading…
        </div>
      </>
    )
  }

  if (state === 'challenge') {
    return (
      <>
        <div style={{ filter: 'blur(6px)', pointerEvents: 'none' }}>
          {children}
        </div>
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.85)',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '400px',
              background: 'var(--theme-bg)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: '0.75rem',
              padding: '2rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <TwoFactorChallenge onSuccess={handleSuccess} onCancel={handleCancel} />
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}

export default TwoFactorGate
