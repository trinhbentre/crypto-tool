import { useState, useCallback } from 'react'
import type { SignatureAlgorithm, OutputFormat, CryptoDetails, EcNamedCurve } from '../types/crypto'
import { DEFAULT_EC_CURVE } from '../lib/constants'
import { verifySignature, type SignHash } from '../lib/signatures'
import { InputPanel } from './InputPanel'
import { KeyTextarea } from './KeyTextarea'
import { VerifyBadge } from './VerifyBadge'

interface VerifyModeProps {
  algorithm: SignatureAlgorithm
  outputFormat: OutputFormat
  onOutputFormatChange: (fmt: OutputFormat) => void
}

const HASHES: SignHash[] = ['SHA-256', 'SHA-384', 'SHA-512']
const EC_CURVES: EcNamedCurve[] = ['P-256', 'P-384', 'P-521']

export function VerifyMode({ algorithm, outputFormat, onOutputFormatChange }: VerifyModeProps) {
  const [message, setMessage] = useState('')
  const [signature, setSignature] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [valid, setValid] = useState<boolean | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<CryptoDetails | null>(null)
  const [hash, setHash] = useState<SignHash>('SHA-256')
  const [curve, setCurve] = useState<EcNamedCurve>(DEFAULT_EC_CURVE)
  const [sigFmt, setSigFmt] = useState<OutputFormat>(outputFormat)

  const handleSigFmtChange = useCallback((fmt: OutputFormat) => {
    setSigFmt(fmt)
    onOutputFormatChange(fmt)
  }, [onOutputFormatChange])

  const handleRun = useCallback(async () => {
    if (!message.trim() || !signature.trim() || !publicKey.trim()) return
    setLoading(true)
    setError('')
    setValid(null)
    setDetails(null)
    try {
      const result = await verifySignature(message, signature, publicKey, algorithm, hash, curve, sigFmt)
      setValid(result.valid)
      setDetails(result.details)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [message, signature, publicKey, algorithm, hash, curve, sigFmt])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun() }
  }, [handleRun])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onKeyDown={handleKeyDown}>
      <div className="flex flex-col gap-4">
        <InputPanel label="Message" value={message} onChange={setMessage} placeholder="Original message…" rows={5} />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Signature Format</label>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSigFmtChange('base64')} className={`btn text-xs ${sigFmt === 'base64' ? 'btn-primary' : 'btn-secondary'}`}>base64</button>
            <button onClick={() => handleSigFmtChange('hex')} className={`btn text-xs ${sigFmt === 'hex' ? 'btn-primary' : 'btn-secondary'}`}>hex</button>
          </div>
        </div>

        <InputPanel label="Signature" value={signature} onChange={setSignature} placeholder="Paste signature here…" rows={4} />

        {error && <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">{error}</p>}

        <button onClick={handleRun} disabled={loading || !message.trim() || !signature.trim() || !publicKey.trim()} className="btn-primary w-fit">
          {loading ? 'Verifying…' : '▶ Verify  ⌘↵'}
        </button>

        <VerifyBadge valid={valid} details={details} />
      </div>

      <div className="flex flex-col gap-4">
        <KeyTextarea
          label="Public Key"
          value={publicKey}
          onChange={setPublicKey}
          hint="PEM (SPKI) or JWK format."
        />
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-secondary">Hash</label>
            <div className="flex gap-2 flex-wrap">
              {HASHES.map(h => (
                <button key={h} onClick={() => setHash(h)} className={`btn text-xs ${hash === h ? 'btn-primary' : 'btn-secondary'}`}>{h}</button>
              ))}
            </div>
          </div>
          {algorithm === 'ECDSA' && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-text-secondary">Curve</label>
              <div className="flex gap-2 flex-wrap">
                {EC_CURVES.map(c => (
                  <button key={c} onClick={() => setCurve(c)} className={`btn text-xs ${curve === c ? 'btn-primary' : 'btn-secondary'}`}>{c}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
