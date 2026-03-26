import type { OutputFormat, CryptoDetails } from '../types/crypto'
import { importPublicKeyRsaOaep, importPrivateKeyRsaOaep } from './keyUtils'
import { formatBytes, fromBase64, fromHex, textToBytes, bytesToText } from './encoding'

export interface RsaEncryptResult {
  output: string
  details: CryptoDetails
}

export async function rsaOaepEncrypt(
  plaintext: string,
  publicKeyStr: string,
  outputFormat: OutputFormat,
): Promise<RsaEncryptResult> {
  const t0 = performance.now()
  let key: CryptoKey
  try {
    key = await importPublicKeyRsaOaep(publicKeyStr)
  } catch {
    throw new Error('Invalid public key — paste a valid PEM (SPKI) or JWK public key')
  }

  const plaintextBytes = textToBytes(plaintext) as Uint8Array<ArrayBuffer>
  let ciphertext: ArrayBuffer
  try {
    ciphertext = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, key, plaintextBytes)
  } catch (e) {
    throw new Error('Encryption failed: ' + (e as Error).message)
  }

  const output = formatBytes(ciphertext, outputFormat)
  const timingMs = Math.round(performance.now() - t0)

  // Extract key size from the CryptoKey
  const alg = key.algorithm as RsaKeyAlgorithm
  const details: CryptoDetails = {
    algorithm: 'RSA-OAEP',
    keySize: alg.modulusLength,
    keyDerivation: `SHA-256`,
    timingMs,
  }

  return { output, details }
}

export async function rsaOaepDecrypt(
  ciphertextEncoded: string,
  privateKeyStr: string,
  inputFormat: OutputFormat,
): Promise<RsaEncryptResult> {
  const t0 = performance.now()
  let key: CryptoKey
  try {
    key = await importPrivateKeyRsaOaep(privateKeyStr)
  } catch {
    throw new Error('Invalid private key — paste a valid PEM (PKCS8) or JWK private key')
  }

  let ciphertextBytes: Uint8Array
  try {
    ciphertextBytes = inputFormat === 'hex' ? fromHex(ciphertextEncoded.trim()) : fromBase64(ciphertextEncoded.trim())
  } catch {
    throw new Error('Invalid ciphertext — could not decode as ' + inputFormat)
  }

  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, key, ciphertextBytes as Uint8Array<ArrayBuffer>)
  } catch {
    throw new Error('Decryption failed — wrong private key or corrupted ciphertext')
  }

  const output = bytesToText(plaintext)
  const timingMs = Math.round(performance.now() - t0)

  const alg = key.algorithm as RsaKeyAlgorithm
  const details: CryptoDetails = {
    algorithm: 'RSA-OAEP',
    keySize: alg.modulusLength,
    keyDerivation: 'SHA-256',
    timingMs,
  }

  return { output, details }
}
