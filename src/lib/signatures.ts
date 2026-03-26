import type { SignatureAlgorithm, OutputFormat, CryptoDetails, EcNamedCurve } from '../types/crypto'
import { importPrivateKeySignature, importPublicKeySignature } from './keyUtils'
import { formatBytes, fromBase64, fromHex, textToBytes } from './encoding'

export type SignHash = 'SHA-256' | 'SHA-384' | 'SHA-512'

export interface SignResult {
  output: string
  details: CryptoDetails
}

export async function signMessage(
  message: string,
  privateKeyStr: string,
  algorithm: SignatureAlgorithm,
  hash: SignHash,
  curve: EcNamedCurve,
  outputFormat: OutputFormat,
): Promise<SignResult> {
  const t0 = performance.now()
  let key: CryptoKey
  try {
    key = await importPrivateKeySignature(privateKeyStr, algorithm, hash, curve)
  } catch {
    throw new Error('Invalid private key — paste a valid PEM (PKCS8) or JWK private key')
  }

  const messageBytes = textToBytes(message) as Uint8Array<ArrayBuffer>
  let signParams: RsaPssParams | EcdsaParams
  if (algorithm === 'RSA-PSS') {
    signParams = { name: 'RSA-PSS', saltLength: 32 }
  } else {
    signParams = { name: 'ECDSA', hash }
  }

  let signature: ArrayBuffer
  try {
    signature = await crypto.subtle.sign(signParams, key, messageBytes)
  } catch (e) {
    throw new Error('Signing failed: ' + (e as Error).message)
  }

  const output = formatBytes(signature, outputFormat)
  const timingMs = Math.round(performance.now() - t0)

  const details: CryptoDetails = {
    algorithm: algorithm === 'RSA-PSS' ? `RSA-PSS (${hash})` : `ECDSA (${curve}, ${hash})`,
    timingMs,
  }

  return { output, details }
}

export interface VerifyResult {
  valid: boolean
  details: CryptoDetails
}

export async function verifySignature(
  message: string,
  signatureEncoded: string,
  publicKeyStr: string,
  algorithm: SignatureAlgorithm,
  hash: SignHash,
  curve: EcNamedCurve,
  signatureFormat: OutputFormat,
): Promise<VerifyResult> {
  const t0 = performance.now()
  let key: CryptoKey
  try {
    key = await importPublicKeySignature(publicKeyStr, algorithm, hash, curve)
  } catch {
    throw new Error('Invalid public key — paste a valid PEM (SPKI) or JWK public key')
  }

  let sigBytes: Uint8Array
  try {
    sigBytes = signatureFormat === 'hex' ? fromHex(signatureEncoded.trim()) : fromBase64(signatureEncoded.trim())
  } catch {
    throw new Error('Invalid signature — could not decode as ' + signatureFormat)
  }

  const messageBytes = textToBytes(message) as Uint8Array<ArrayBuffer>
  let verifyParams: RsaPssParams | EcdsaParams
  if (algorithm === 'RSA-PSS') {
    verifyParams = { name: 'RSA-PSS', saltLength: 32 }
  } else {
    verifyParams = { name: 'ECDSA', hash }
  }

  let valid: boolean
  try {
    valid = await crypto.subtle.verify(verifyParams, key, sigBytes as Uint8Array<ArrayBuffer>, messageBytes)
  } catch {
    valid = false
  }

  const timingMs = Math.round(performance.now() - t0)
  const details: CryptoDetails = {
    algorithm: algorithm === 'RSA-PSS' ? `RSA-PSS (${hash})` : `ECDSA (${curve}, ${hash})`,
    timingMs,
  }

  return { valid, details }
}
