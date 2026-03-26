import type { AesKeySize, EcNamedCurve, RsaModulusLength, KeyOutputFormat } from '../types/crypto'
import { arrayBufferToPem } from './keyUtils'
import { toHex, toBase64 } from './encoding'

export interface GeneratedAesKey {
  key: string
  format: KeyOutputFormat
}

export interface GeneratedKeypair {
  publicKey: string
  privateKey: string
  format: KeyOutputFormat
}

export async function generateAesKey(
  keySize: AesKeySize,
  format: KeyOutputFormat,
): Promise<GeneratedAesKey> {
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: keySize },
    true,
    ['encrypt', 'decrypt'],
  )

  let keyStr: string
  if (format === 'jwk') {
    const jwk = await crypto.subtle.exportKey('jwk', key)
    keyStr = JSON.stringify(jwk, null, 2)
  } else if (format === 'hex') {
    const raw = await crypto.subtle.exportKey('raw', key)
    keyStr = toHex(raw)
  } else {
    // 'base64' or 'pem' (pem treated same as base64 for symmetric keys)
    const raw = await crypto.subtle.exportKey('raw', key)
    keyStr = toBase64(raw)
  }

  return { key: keyStr, format }
}

export async function generateRsaKeypair(
  modulusLength: RsaModulusLength,
  format: KeyOutputFormat,
): Promise<GeneratedKeypair> {
  const keypair = await crypto.subtle.generateKey(
    { name: 'RSA-OAEP', modulusLength, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true,
    ['encrypt', 'decrypt'],
  )

  let publicKeyStr: string
  let privateKeyStr: string

  if (format === 'jwk') {
    const pubJwk = await crypto.subtle.exportKey('jwk', keypair.publicKey)
    const privJwk = await crypto.subtle.exportKey('jwk', keypair.privateKey)
    publicKeyStr = JSON.stringify(pubJwk, null, 2)
    privateKeyStr = JSON.stringify(privJwk, null, 2)
  } else {
    const pubDer = await crypto.subtle.exportKey('spki', keypair.publicKey)
    const privDer = await crypto.subtle.exportKey('pkcs8', keypair.privateKey)
    publicKeyStr = arrayBufferToPem(pubDer, 'PUBLIC KEY')
    privateKeyStr = arrayBufferToPem(privDer, 'PRIVATE KEY')
  }

  return { publicKey: publicKeyStr, privateKey: privateKeyStr, format }
}

export async function generateEcKeypair(
  curve: EcNamedCurve,
  format: KeyOutputFormat,
): Promise<GeneratedKeypair> {
  const keypair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: curve },
    true,
    ['sign', 'verify'],
  )

  let publicKeyStr: string
  let privateKeyStr: string

  if (format === 'jwk') {
    const pubJwk = await crypto.subtle.exportKey('jwk', keypair.publicKey)
    const privJwk = await crypto.subtle.exportKey('jwk', keypair.privateKey)
    publicKeyStr = JSON.stringify(pubJwk, null, 2)
    privateKeyStr = JSON.stringify(privJwk, null, 2)
  } else {
    const pubDer = await crypto.subtle.exportKey('spki', keypair.publicKey)
    const privDer = await crypto.subtle.exportKey('pkcs8', keypair.privateKey)
    publicKeyStr = arrayBufferToPem(pubDer, 'PUBLIC KEY')
    privateKeyStr = arrayBufferToPem(privDer, 'PRIVATE KEY')
  }

  return { publicKey: publicKeyStr, privateKey: privateKeyStr, format }
}
