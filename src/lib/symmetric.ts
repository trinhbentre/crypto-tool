import type { SymmetricAlgorithm, KeySource, OutputFormat, AesKeySize, CryptoDetails } from '../types/crypto'
import {
  SALT_LEN, AES_GCM_IV_LEN, AES_CBC_IV_LEN, AES_CTR_COUNTER_LEN,
  DEFAULT_PBKDF2_ITERATIONS,
} from './constants'
import { fromBase64, toHex, fromHex, formatBytes, textToBytes, bytesToText } from './encoding'

function ivLenFor(algorithm: SymmetricAlgorithm): number {
  if (algorithm === 'AES-GCM') return AES_GCM_IV_LEN
  if (algorithm === 'AES-CBC') return AES_CBC_IV_LEN
  return AES_CTR_COUNTER_LEN
}

async function deriveKey(
  passphrase: string,
  salt: BufferSource,
  algorithm: SymmetricAlgorithm,
  keySize: AesKeySize,
  iterations: number,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    textToBytes(passphrase) as Uint8Array<ArrayBuffer>,
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  const algName = algorithm === 'AES-CTR' ? 'AES-CTR' : algorithm
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    { name: algName, length: keySize },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function importRawKey(
  rawKey: string,
  algorithm: SymmetricAlgorithm,
  keySize: AesKeySize,
): Promise<CryptoKey> {
  let keyBytes: Uint8Array
  // auto-detect: if it looks like hex use hex, else try base64
  if (/^[0-9a-fA-F]+$/.test(rawKey.trim()) && rawKey.trim().length === keySize / 4) {
    keyBytes = fromHex(rawKey.trim())
  } else {
    keyBytes = fromBase64(rawKey.trim())
  }
  if (keyBytes.length * 8 !== keySize) {
    throw new Error(`Key must be ${keySize} bits (${keySize / 8} bytes), got ${keyBytes.length * 8} bits`)
  }
  const algName = algorithm === 'AES-CTR' ? 'AES-CTR' : algorithm
  return crypto.subtle.importKey(
    'raw',
    keyBytes as Uint8Array<ArrayBuffer>,
    { name: algName, length: keySize },
    false,
    ['encrypt', 'decrypt'],
  )
}

export interface SymmetricEncryptResult {
  output: string
  details: CryptoDetails
}

export interface SymmetricEncryptOptions {
  algorithm: SymmetricAlgorithm
  keySource: KeySource
  keySize: AesKeySize
  passphrase?: string
  rawKey?: string
  manualIv?: string
  iterations?: number
  outputFormat: OutputFormat
}

export async function symmetricEncrypt(
  plaintext: string,
  opts: SymmetricEncryptOptions,
): Promise<SymmetricEncryptResult> {
  const t0 = performance.now()
  const { algorithm, keySource, keySize, outputFormat } = opts
  const iterations = opts.iterations ?? DEFAULT_PBKDF2_ITERATIONS
  const ivLen = ivLenFor(algorithm)

  let salt: Uint8Array | undefined
  let key: CryptoKey

  if (keySource === 'passphrase') {
    if (!opts.passphrase) throw new Error('Passphrase is required')
    salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
    key = await deriveKey(opts.passphrase, salt as Uint8Array<ArrayBuffer>, algorithm, keySize, iterations)
  } else {
    if (!opts.rawKey) throw new Error('Raw key is required')
    key = await importRawKey(opts.rawKey, algorithm, keySize)
  }

  let iv: Uint8Array
  if (opts.manualIv) {
    iv = /^[0-9a-fA-F]+$/.test(opts.manualIv.trim())
      ? fromHex(opts.manualIv.trim())
      : fromBase64(opts.manualIv.trim())
    if (iv.length !== ivLen) throw new Error(`IV must be ${ivLen} bytes for ${algorithm}`)
  } else {
    iv = crypto.getRandomValues(new Uint8Array(ivLen))
  }

  const iv32 = iv as unknown as Uint8Array<ArrayBuffer>
  let encryptParams: AlgorithmIdentifier | RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams
  if (algorithm === 'AES-GCM') {
    encryptParams = { name: 'AES-GCM', iv: iv32 }
  } else if (algorithm === 'AES-CBC') {
    encryptParams = { name: 'AES-CBC', iv: iv32 }
  } else {
    encryptParams = { name: 'AES-CTR', counter: iv32, length: 64 }
  }

  const plaintextBytes = textToBytes(plaintext) as Uint8Array<ArrayBuffer>
  const ciphertext = await crypto.subtle.encrypt(encryptParams, key, plaintextBytes)

  // Pack: [salt?][iv][ciphertext]
  const saltLen = salt ? SALT_LEN : 0
  const combined = new Uint8Array(saltLen + ivLen + ciphertext.byteLength)
  if (salt) combined.set(salt, 0)
  combined.set(iv, saltLen)
  combined.set(new Uint8Array(ciphertext), saltLen + ivLen)

  const output = formatBytes(combined, outputFormat)
  const timingMs = Math.round(performance.now() - t0)

  const details: CryptoDetails = {
    ivHex: toHex(iv),
    ivBytes: ivLen,
    algorithm,
    keySize,
    timingMs,
  }
  if (salt) {
    details.saltHex = toHex(salt)
    details.saltBytes = SALT_LEN
    details.keyDerivation = `PBKDF2-SHA256 (${iterations.toLocaleString()} iter)`
  }
  if (algorithm === 'AES-GCM') {
    details.tagBytes = 16
  }

  return { output, details }
}

export interface SymmetricDecryptOptions {
  algorithm: SymmetricAlgorithm
  keySource: KeySource
  keySize: AesKeySize
  passphrase?: string
  rawKey?: string
  iterations?: number
  inputFormat: OutputFormat
}

export async function symmetricDecrypt(
  ciphertextEncoded: string,
  opts: SymmetricDecryptOptions,
): Promise<SymmetricEncryptResult> {
  const t0 = performance.now()
  const { algorithm, keySource, keySize, inputFormat } = opts
  const iterations = opts.iterations ?? DEFAULT_PBKDF2_ITERATIONS
  const ivLen = ivLenFor(algorithm)

  let combined: Uint8Array
  try {
    combined = inputFormat === 'hex' ? fromHex(ciphertextEncoded.trim()) : fromBase64(ciphertextEncoded.trim())
  } catch {
    throw new Error('Invalid ciphertext — could not decode as ' + inputFormat)
  }

  const saltLen = keySource === 'passphrase' ? SALT_LEN : 0
  const minLen = saltLen + ivLen + (algorithm === 'AES-GCM' ? 16 : 1)
  if (combined.length < minLen) throw new Error('Ciphertext is too short')

  let key: CryptoKey
  let salt: Uint8Array | undefined
  if (keySource === 'passphrase') {
    if (!opts.passphrase) throw new Error('Passphrase is required')
    salt = combined.slice(0, SALT_LEN)
    key = await deriveKey(opts.passphrase, salt as Uint8Array<ArrayBuffer>, algorithm, keySize, iterations)
  } else {
    if (!opts.rawKey) throw new Error('Raw key is required')
    key = await importRawKey(opts.rawKey, algorithm, keySize)
  }

  const iv = combined.slice(saltLen, saltLen + ivLen)
  const ciphertext = combined.slice(saltLen + ivLen)

  let decryptParams: AlgorithmIdentifier | RsaOaepParams | AesCtrParams | AesCbcParams | AesGcmParams
  if (algorithm === 'AES-GCM') {
    decryptParams = { name: 'AES-GCM', iv }
  } else if (algorithm === 'AES-CBC') {
    decryptParams = { name: 'AES-CBC', iv }
  } else {
    decryptParams = { name: 'AES-CTR', counter: iv, length: 64 }
  }

  let plaintext: ArrayBuffer
  try {
    plaintext = await crypto.subtle.decrypt(decryptParams, key, ciphertext)
  } catch {
    throw new Error('Decryption failed — wrong key/passphrase or corrupted ciphertext')
  }

  const output = bytesToText(plaintext)
  const timingMs = Math.round(performance.now() - t0)

  const details: CryptoDetails = {
    ivHex: toHex(iv),
    ivBytes: ivLen,
    algorithm,
    keySize,
    timingMs,
  }
  if (salt) {
    details.saltHex = toHex(salt)
    details.saltBytes = SALT_LEN
    details.keyDerivation = `PBKDF2-SHA256 (${iterations.toLocaleString()} iter)`
  }
  if (algorithm === 'AES-GCM') {
    details.tagBytes = 16
  }

  return { output, details }
}
