import { useState, useCallback, useRef } from 'react'
import type { OutputFormat, CryptoDetails } from '../types/crypto'
import { rsaOaepEncrypt } from '../lib/asymmetric'
import { convertFormat } from '../lib/encoding'
import { InputPanel } from './InputPanel'
import { OutputPanel } from './OutputPanel'
import { KeyTextarea } from './KeyTextarea'
import { DetailsPanel } from './DetailsPanel'

interface RsaEncryptModeProps {
  outputFormat: OutputFormat
  onOutputFormatChange: (fmt: OutputFormat) => void
}

export function RsaEncryptMode({ outputFormat, onOutputFormatChange }: RsaEncryptModeProps) {
  const [input, setInput] = useState('')
  const [publicKey, setPublicKey] = useState('')
  const [output, setOutput] = useState('')
  const [outputRaw, setOutputRaw] = useState('')
  const [outputFmt, setOutputFmt] = useState<OutputFormat>(outputFormat)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<CryptoDetails | null>(null)

  const fmtRef = useRef(outputFmt)
  fmtRef.current = outputFmt

  const handleFormatChange = useCallback((fmt: OutputFormat) => {
    setOutputFmt(fmt)
    onOutputFormatChange(fmt)
    if (outputRaw) {
      try {
        setOutput(convertFormat(outputRaw, 'base64', fmt))
      } catch { /* ignore */ }
    }
  }, [outputRaw, onOutputFormatChange])

  const handleRun = useCallback(async () => {
    if (!input.trim() || !publicKey.trim()) return
    setLoading(true)
    setError('')
    setOutput('')
    setDetails(null)
    try {
      const result = await rsaOaepEncrypt(input, publicKey, 'base64')
      setOutputRaw(result.output)
      setOutput(convertFormat(result.output, 'base64', fmtRef.current))
      setDetails(result.details)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [input, publicKey])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }, [handleRun])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onKeyDown={handleKeyDown}>
      <div className="flex flex-col gap-4">
        <InputPanel
          label="Plaintext"
          value={input}
          onChange={setInput}
          placeholder="Enter text to encrypt…"
        />
        {error && (
          <p className="text-sm text-danger bg-danger/10 border border-danger/30 rounded-md px-3 py-2">{error}</p>
        )}
        <button
          onClick={handleRun}
          disabled={loading || !input.trim() || !publicKey.trim()}
          className="btn-primary w-fit"
        >
          {loading ? 'Encrypting…' : '▶ Encrypt  ⌘↵'}
        </button>
        <OutputPanel
          label="Ciphertext"
          value={output}
          format={outputFmt}
          onFormatChange={handleFormatChange}
          filename="ciphertext.txt"
        />
      </div>
      <div className="flex flex-col gap-4">
        <KeyTextarea
          label="Public Key"
          value={publicKey}
          onChange={setPublicKey}
          hint="PEM (SPKI) or JWK format. Generate a keypair using Key Gen mode."
        />
        <DetailsPanel details={details} />
      </div>
    </div>
  )
}
