import type { AesKeySize, EcNamedCurve, RsaModulusLength } from '../types/crypto'

export const DEFAULT_PBKDF2_ITERATIONS = 200_000
export const MIN_PBKDF2_ITERATIONS = 100_000
export const WARN_PBKDF2_ITERATIONS = 200_000
export const SALT_LEN = 16
export const AES_GCM_IV_LEN = 12
export const AES_CBC_IV_LEN = 16
export const AES_CTR_COUNTER_LEN = 16

export const DEFAULT_AES_KEY_SIZE: AesKeySize = 256
export const DEFAULT_RSA_MODULUS_LENGTH: RsaModulusLength = 2048
export const DEFAULT_EC_CURVE: EcNamedCurve = 'P-256'

export const AES_KEY_SIZES: AesKeySize[] = [256, 128]
export const RSA_MODULUS_LENGTHS: RsaModulusLength[] = [2048, 4096]
export const EC_CURVES: EcNamedCurve[] = ['P-256', 'P-384', 'P-521']
