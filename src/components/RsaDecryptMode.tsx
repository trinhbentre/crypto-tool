import { useState, useCallback } from 'react'
import type { OutputFormat, CryptoDetails } from '../types/crypto'
import { rsaOaepDecrypt } from '../lib/asymmetric'
import { InputPanel } from './InputPanel'
import { KeyTextarea } from './KeyTextarea'
import { DetailsPanel } from './DetailsPanel'

interface RsaDecryptModeProps {
  outputFormat: OutputFormat
  onOutputFormatChange: (fmt: OutputFormat) => void
}

export function RsaDecryptMode({ outputFormat, onOutputFormatChange }: RsaDecryptModeProps) {
  const [input, setInput] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<CryptoDetails | null>(null)
  const [inputFormat, setInputFormat] = useState<OutputFormat>(outputFormat)

  const handleInputFormatChange = useCallback((fmt: OutputFormat) => {
    setInputFormat(fmt)
    onOutputFormatChange(fmt)
  }, [onOutputFormatChange])

  const handleRun = useCallback(async () => {
    if (!input.trim() || !privateKey.trim()) return
    setLoading(true)
    setError('')
    setOutput('')
    setDetails(null)
    try {
      const result = await rsaOaepDecrypt(input.trim(), privateKey, inputFormat)
      setOutput(result.output)
      setDetails(result.details)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [input, privateKey, inputFormat])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }, [handleRun])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onKeyDown={handleKeyDown}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Ciphertext Format</label>
          <div className="flex gap-2">
            <button onClick={() => handleInputFormatChange('base64')} className={`btn text-xs ${inputFormat === 'base64' ? 'btn-primary' : 'btn-secondary'}`}>base64</button>
            <button onClick={() => handleInputFormatChange('hex')} className={`btn text-xs ${inputFormat === 'hex' ? 'btn-primary' : 'btn-secondary'}`}>hex</button>
          </div>
        </div>
        <InputPanel
          label="Ciphertext"
          value={input}
          onChange={setInput}
          placeholder="Paste ciphertext here…"
        />
        {error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">{error}</p>
        )}
        <button
          onClick={handleRun}
          disabled={loading || !input.trim() || !privateKey.trim()}
          className="btn-primary w-fit"
        >
          {loading ? 'Decrypting…' : '▶ Decrypt  ⌘↵'}
        </button>
        <InputPanel label="Plaintext" value={output} onChange={() => {}} readOnly placeholder="Decrypted text will appear here…" />
      </div>
      <div className="flex flex-col gap-4">
        <KeyTextarea
          label="Private Key"
          value={privateKey}
          onChange={setPrivateKey}
          placeholder="-----BEGIN PRIVATE KEY-----&#10;…&#10;-----END PRIVATE KEY-----"
          hint="PEM (PKCS8) or JWK format. Keep private keys secure."
        />
        <DetailsPanel details={details} />
      </div>
    </div>
  )
}
