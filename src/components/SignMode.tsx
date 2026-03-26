import { useState, useCallback } from 'react'
import type { SignatureAlgorithm, OutputFormat, CryptoDetails, EcNamedCurve } from '../types/crypto'
import { DEFAULT_EC_CURVE } from '../lib/constants'
import { signMessage, type SignHash } from '../lib/signatures'
import { convertFormat } from '../lib/encoding'
import { InputPanel } from './InputPanel'
import { OutputPanel } from './OutputPanel'
import { KeyTextarea } from './KeyTextarea'
import { DetailsPanel } from './DetailsPanel'

interface SignModeProps {
  algorithm: SignatureAlgorithm
  outputFormat: OutputFormat
  onOutputFormatChange: (fmt: OutputFormat) => void
}

const HASHES: SignHash[] = ['SHA-256', 'SHA-384', 'SHA-512']
const EC_CURVES: EcNamedCurve[] = ['P-256', 'P-384', 'P-521']

export function SignMode({ algorithm, outputFormat, onOutputFormatChange }: SignModeProps) {
  const [message, setMessage] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [output, setOutput] = useState('')
  const [outputRaw, setOutputRaw] = useState('')
  const [outputFmt, setOutputFmt] = useState<OutputFormat>(outputFormat)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<CryptoDetails | null>(null)
  const [hash, setHash] = useState<SignHash>('SHA-256')
  const [curve, setCurve] = useState<EcNamedCurve>(DEFAULT_EC_CURVE)

  const handleFormatChange = useCallback((fmt: OutputFormat) => {
    setOutputFmt(fmt)
    onOutputFormatChange(fmt)
    if (outputRaw) {
      try { setOutput(convertFormat(outputRaw, 'base64', fmt)) } catch { /* ignore */ }
    }
  }, [outputRaw, onOutputFormatChange])

  const handleRun = useCallback(async () => {
    if (!message.trim() || !privateKey.trim()) return
    setLoading(true)
    setError('')
    setOutput('')
    setDetails(null)
    try {
      const result = await signMessage(message, privateKey, algorithm, hash, curve, 'base64')
      setOutputRaw(result.output)
      setOutput(convertFormat(result.output, 'base64', outputFmt))
      setDetails(result.details)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [message, privateKey, algorithm, hash, curve, outputFmt])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleRun() }
  }, [handleRun])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onKeyDown={handleKeyDown}>
      <div className="flex flex-col gap-4">
        <InputPanel label="Message" value={message} onChange={setMessage} placeholder="Enter message to sign…" />
        {error && <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">{error}</p>}
        <button onClick={handleRun} disabled={loading || !message.trim() || !privateKey.trim()} className="btn-primary w-fit">
          {loading ? 'Signing…' : '▶ Sign  ⌘↵'}
        </button>
        <OutputPanel label="Signature" value={output} format={outputFmt} onFormatChange={handleFormatChange} filename="signature.txt" />
      </div>
      <div className="flex flex-col gap-4">
        <KeyTextarea
          label="Private Key"
          value={privateKey}
          onChange={setPrivateKey}
          placeholder="-----BEGIN PRIVATE KEY-----&#10;…&#10;-----END PRIVATE KEY-----"
          hint="PEM (PKCS8) or JWK format. Generate using Key Gen mode."
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
        <DetailsPanel details={details} />
      </div>
    </div>
  )
}
