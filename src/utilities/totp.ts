import { TOTP, Secret } from 'otpauth'
import crypto from 'crypto'

const ISSUER = 'Zenithics'

export function generateTOTPSecret(accountName: string): { secret: string; uri: string } {
  const secret = new Secret({ size: 20 })
  const totp = new TOTP({
    issuer: ISSUER,
    label: accountName,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  })
  return {
    secret: secret.base32,
    uri: totp.toString(),
  }
}

export function validateTOTPCode(base32Secret: string, code: string): boolean {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(base32Secret),
  })
  const delta = totp.validate({ token: code, window: 1 })
  return delta !== null
}

export function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase(),
  )
}

export function hashBackupCode(code: string): string {
  return crypto.createHash('sha256').update(code.toUpperCase()).digest('hex')
}

export function validateBackupCode(storedHashes: string[], code: string): number {
  const hashed = hashBackupCode(code)
  return storedHashes.findIndex((h) => h === hashed)
}
