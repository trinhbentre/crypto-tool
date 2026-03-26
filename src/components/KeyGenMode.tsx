import { useState, useCallback } from 'react'
import type { KeyGenType, AesKeySize, EcNamedCurve, RsaModulusLength, KeyOutputFormat } from '../types/crypto'
import { DEFAULT_AES_KEY_SIZE, DEFAULT_EC_CURVE, DEFAULT_RSA_MODULUS_LENGTH, AES_KEY_SIZES, EC_CURVES, RSA_MODULUS_LENGTHS } from '../lib/constants'
import { generateAesKey, generateRsaKeypair, generateEcKeypair } from '../lib/keygen'

interface KeyGenModeProps {
  algorithm: KeyGenType
}

interface KeyOutputBoxProps {
  label: string
  value: string
  filename: string
}

function KeyOutputBox({ label, value, filename }: KeyOutputBoxProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    if (!value) return
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [value])

  const handleDownload = useCallback(() => {
    if (!value) return
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [value, filename])

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</label>
      <textarea
        value={value}
        readOnly
        rows={7}
        spellCheck={false}
        placeholder="Generate a key to see output…"
        className="w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 text-xs font-mono text-text-primary placeholder-text-muted resize-y cursor-default focus:outline-none"
        onClick={e => (e.target as HTMLTextAreaElement).select()}
      />
      {value && (
        <div className="flex gap-2">
          <button onClick={handleCopy} className="btn-secondary text-xs">{copied ? '✓ Copied' : 'Copy'}</button>
          <button onClick={handleDownload} className="btn-secondary text-xs">Download</button>
        </div>
      )}
    </div>
  )
}

export function KeyGenMode({ algorithm }: KeyGenModeProps) {
  const [keySize, setKeySize] = useState<AesKeySize>(DEFAULT_AES_KEY_SIZE)
  const [modulusLength, setModulusLength] = useState<RsaModulusLength>(DEFAULT_RSA_MODULUS_LENGTH)
  const [curve, setCurve] = useState<EcNamedCurve>(DEFAULT_EC_CURVE)
  const [outputFormat, setOutputFormat] = useState<KeyOutputFormat>('pem')

  const [aesKey, setAesKey] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGenerate = useCallback(async () => {
    setLoading(true)
    setError('')
    setAesKey('')
    setPublicKey('')
    setPrivateKey('')
    try {
      if (algorithm === 'AES') {
        const result = await generateAesKey(keySize, outputFormat === 'pem' ? 'hex' : outputFormat)
        setAesKey(result.key)
      } else if (algorithm === 'RSA') {
        const result = await generateRsaKeypair(modulusLength, outputFormat)
        setPublicKey(result.publicKey)
        setPrivateKey(result.privateKey)
      } else {
        const result = await generateEcKeypair(curve, outputFormat)
        setPublicKey(result.publicKey)
        setPrivateKey(result.privateKey)
      }
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [algorithm, keySize, modulusLength, curve, outputFormat])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleGenerate() }
  }, [handleGenerate])

  const aesOutputFormats: KeyOutputFormat[] = ['hex', 'base64', 'jwk']
  const asymOutputFormats: KeyOutputFormat[] = ['pem', 'jwk']

  return (
    <div className="flex flex-col gap-6" onKeyDown={handleKeyDown}>
      {/* Parameters */}
      <div className="card flex flex-col gap-4">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Parameters</label>

        {algorithm === 'AES' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary">Key Size</label>
            <div className="flex gap-2">
              {AES_KEY_SIZES.map(s => (
                <button key={s} onClick={() => setKeySize(s)} className={`btn text-xs ${keySize === s ? 'btn-primary' : 'btn-secondary'}`}>{s} bit</button>
              ))}
            </div>
          </div>
        )}

        {algorithm === 'RSA' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary">Modulus Length</label>
            <div className="flex gap-2">
              {RSA_MODULUS_LENGTHS.map(m => (
                <button key={m} onClick={() => setModulusLength(m)} className={`btn text-xs ${modulusLength === m ? 'btn-primary' : 'btn-secondary'}`}>{m} bit</button>
              ))}
            </div>
          </div>
        )}

        {algorithm === 'EC' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary">Curve</label>
            <div className="flex gap-2">
              {EC_CURVES.map(c => (
                <button key={c} onClick={() => setCurve(c)} className={`btn text-xs ${curve === c ? 'btn-primary' : 'btn-secondary'}`}>{c}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-secondary">Output Format</label>
          <div className="flex gap-2">
            {(algorithm === 'AES' ? aesOutputFormats : asymOutputFormats).map(f => (
              <button key={f} onClick={() => setOutputFormat(f)} className={`btn text-xs ${outputFormat === f ? 'btn-primary' : 'btn-secondary'}`}>{f.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading} className="btn-primary w-fit">
          {loading ? 'Generating…' : '▶ Generate Key  ⌘↵'}
        </button>

        {error && <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">{error}</p>}
      </div>

      {/* Output */}
      {algorithm === 'AES' ? (
        <KeyOutputBox
          label={`AES-${keySize} Key`}
          value={aesKey}
          filename={`aes-${keySize}.${outputFormat === 'jwk' ? 'jwk' : 'txt'}`}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <KeyOutputBox
            label="Public Key"
            value={publicKey}
            filename={`public.${outputFormat === 'jwk' ? 'jwk' : 'pem'}`}
          />
          <KeyOutputBox
            label="Private Key"
            value={privateKey}
            filename={`private.${outputFormat === 'jwk' ? 'jwk' : 'pem'}`}
          />
        </div>
      )}

      {(publicKey || privateKey || aesKey) && (
        <p className="text-xs text-text-muted text-center">
          ⚠ Keys are generated in-browser and never transmitted. Close this tab to discard them.
        </p>
      )}
    </div>
  )
}
