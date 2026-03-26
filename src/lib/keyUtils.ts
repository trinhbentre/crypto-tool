import { toBase64, fromBase64 } from './encoding'

// ─────────────────────────────────────────────────────────────────────────────
// PEM helpers
// ─────────────────────────────────────────────────────────────────────────────

export function pemToArrayBuffer(pem: string): ArrayBuffer {
  const lines = pem.trim().split('\n')
  // Remove header/footer lines (-----BEGIN ... -----)
  const body = lines.filter(l => !l.startsWith('-----')).join('')
  return fromBase64(body).buffer as ArrayBuffer
}

export function arrayBufferToPem(buf: ArrayBuffer, label: string): string {
  const b64 = toBase64(buf)
  const lines: string[] = []
  for (let i = 0; i < b64.length; i += 64) {
    lines.push(b64.slice(i, i + 64))
  }
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`
}

// ─────────────────────────────────────────────────────────────────────────────
// Key format detection
// ─────────────────────────────────────────────────────────────────────────────

export type KeyFormat = 'pem-public' | 'pem-private' | 'jwk' | 'unknown'

export function detectKeyFormat(input: string): KeyFormat {
  const trimmed = input.trim()
  if (trimmed.startsWith('-----BEGIN PUBLIC KEY-----') ||
      trimmed.startsWith('-----BEGIN RSA PUBLIC KEY-----')) {
    return 'pem-public'
  }
  if (trimmed.startsWith('-----BEGIN PRIVATE KEY-----') ||
      trimmed.startsWith('-----BEGIN RSA PRIVATE KEY-----') ||
      trimmed.startsWith('-----BEGIN EC PRIVATE KEY-----')) {
    return 'pem-private'
  }
  try {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed === 'object' && parsed !== null && 'kty' in parsed) {
      return 'jwk'
    }
  } catch {
    // not JSON
  }
  return 'unknown'
}

// ─────────────────────────────────────────────────────────────────────────────
// Import helpers
// ─────────────────────────────────────────────────────────────────────────────

export async function importPublicKeyRsaOaep(keyStr: string): Promise<CryptoKey> {
  const fmt = detectKeyFormat(keyStr)
  if (fmt === 'jwk') {
    const jwk = JSON.parse(keyStr.trim()) as JsonWebKey
    return crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
  }
  const buf = pemToArrayBuffer(keyStr)
  return crypto.subtle.importKey('spki', buf, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt'])
}

export async function importPrivateKeyRsaOaep(keyStr: string): Promise<CryptoKey> {
  const fmt = detectKeyFormat(keyStr)
  if (fmt === 'jwk') {
    const jwk = JSON.parse(keyStr.trim()) as JsonWebKey
    return crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt'])
  }
  const buf = pemToArrayBuffer(keyStr)
  return crypto.subtle.importKey('pkcs8', buf, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt'])
}

export async function importPublicKeySignature(
  keyStr: string,
  algorithm: 'RSA-PSS' | 'ECDSA',
  hash: string,
  curve?: string,
): Promise<CryptoKey> {
  const fmt = detectKeyFormat(keyStr)
  const algParams = algorithm === 'RSA-PSS'
    ? { name: 'RSA-PSS', hash }
    : { name: 'ECDSA', namedCurve: curve ?? 'P-256' }

  if (fmt === 'jwk') {
    const jwk = JSON.parse(keyStr.trim()) as JsonWebKey
    return crypto.subtle.importKey('jwk', jwk, algParams, false, ['verify'])
  }
  const buf = pemToArrayBuffer(keyStr)
  return crypto.subtle.importKey('spki', buf, algParams, false, ['verify'])
}

export async function importPrivateKeySignature(
  keyStr: string,
  algorithm: 'RSA-PSS' | 'ECDSA',
  hash: string,
  curve?: string,
): Promise<CryptoKey> {
  const fmt = detectKeyFormat(keyStr)
  const algParams = algorithm === 'RSA-PSS'
    ? { name: 'RSA-PSS', hash }
    : { name: 'ECDSA', namedCurve: curve ?? 'P-256' }

  if (fmt === 'jwk') {
    const jwk = JSON.parse(keyStr.trim()) as JsonWebKey
    return crypto.subtle.importKey('jwk', jwk, algParams, false, ['sign'])
  }
  const buf = pemToArrayBuffer(keyStr)
  return crypto.subtle.importKey('pkcs8', buf, algParams, false, ['sign'])
}
