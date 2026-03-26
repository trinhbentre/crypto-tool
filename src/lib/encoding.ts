export function toBase64(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

export function fromBase64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0))
}

export function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf)
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function fromHex(hex: string): Uint8Array {
  const clean = hex.replace(/\s/g, '')
  if (clean.length % 2 !== 0) throw new Error('Invalid hex string')
  const bytes = new Uint8Array(clean.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

export function formatBytes(buf: ArrayBuffer | Uint8Array, format: 'base64' | 'hex'): string {
  return format === 'hex' ? toHex(buf) : toBase64(buf)
}

export function parseBytes(value: string, format: 'base64' | 'hex'): Uint8Array {
  return format === 'hex' ? fromHex(value) : fromBase64(value)
}

/** Convert between output formats without touching the raw bytes */
export function convertFormat(value: string, from: 'base64' | 'hex', to: 'base64' | 'hex'): string {
  if (from === to) return value
  return formatBytes(parseBytes(value, from), to)
}

export function bytesToText(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf)
}

export function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}
