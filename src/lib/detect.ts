import type { OutputFormat } from '../types/crypto'

/**
 * Auto-detect the format of a ciphertext/signature string pasted by the user.
 * Returns 'base64', 'hex', or null if ambiguous/unknown.
 */
export function detectInputFormat(value: string): OutputFormat | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  // Strict hex: only hex chars, even length
  if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.length % 2 === 0) {
    return 'hex'
  }

  // Base64 pattern (standard or URL-safe)
  if (/^[A-Za-z0-9+/\-_]+=*$/.test(trimmed) && trimmed.length % 4 === 0) {
    return 'base64'
  }

  return null
}
