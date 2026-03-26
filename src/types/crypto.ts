export type Mode = 'encrypt' | 'decrypt' | 'sign' | 'verify' | 'keygen'

export type SymmetricAlgorithm = 'AES-GCM' | 'AES-CBC' | 'AES-CTR'
export type AsymmetricAlgorithm = 'RSA-OAEP'
export type SignatureAlgorithm = 'RSA-PSS' | 'ECDSA'
export type KeyGenType = 'AES' | 'RSA' | 'EC'
export type Algorithm = SymmetricAlgorithm | AsymmetricAlgorithm | SignatureAlgorithm | KeyGenType

export type KeySource = 'passphrase' | 'raw'
export type OutputFormat = 'base64' | 'hex'
export type KeyOutputFormat = 'pem' | 'jwk' | 'hex' | 'base64'
export type IvMode = 'auto' | 'manual'
export type EcNamedCurve = 'P-256' | 'P-384' | 'P-521'
export type RsaModulusLength = 2048 | 4096
export type AesKeySize = 128 | 256

export interface CryptoDetails {
  saltHex?: string
  saltBytes?: number
  ivHex?: string
  ivBytes?: number
  tagBytes?: number
  keyDerivation?: string
  keySize?: number
  algorithm?: string
  timingMs?: number
}

export interface HistoryEntry {
  id: string
  timestamp: number
  mode: Mode
  algorithm: string
  inputPreview: string
  outputPreview: string
}
