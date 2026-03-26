import { useState, useCallback, useRef } from 'react'
import type { SymmetricAlgorithm, KeySource, OutputFormat, AesKeySize, IvMode, CryptoDetails } from '../types/crypto'
import { DEFAULT_PBKDF2_ITERATIONS, DEFAULT_AES_KEY_SIZE } from '../lib/constants'
import { symmetricEncrypt } from '../lib/symmetric'
import { convertFormat } from '../lib/encoding'
import { InputPanel } from './InputPanel'
import { OutputPanel } from './OutputPanel'
import { KeyConfigPanel } from './KeyConfigPanel'
import { DetailsPanel } from './DetailsPanel'

interface EncryptModeProps {
  algorithm: SymmetricAlgorithm
  outputFormat: OutputFormat
  onOutputFormatChange: (fmt: OutputFormat) => void
}

export function EncryptMode({ algorithm, outputFormat, onOutputFormatChange }: EncryptModeProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [outputRaw, setOutputRaw] = useState('')  // always base64 internally
  const [outputFmt, setOutputFmt] = useState<OutputFormat>(outputFormat)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<CryptoDetails | null>(null)

  const [keySource, setKeySource] = useState<KeySource>('passphrase')
  const [passphrase, setPassphrase] = useState('')
  const [rawKey, setRawKey] = useState('')
  const [iterations, setIterations] = useState(DEFAULT_PBKDF2_ITERATIONS)
  const [keySize, setKeySize] = useState<AesKeySize>(DEFAULT_AES_KEY_SIZE)
  const [ivMode, setIvMode] = useState<IvMode>('auto')
  const [manualIv, setManualIv] = useState('')

  const prevAlgorithmRef = useRef(algorithm)
  if (prevAlgorithmRef.current !== algorithm) {
    prevAlgorithmRef.current = algorithm
    setOutput('')
    setOutputRaw('')
    setDetails(null)
    setError('')
  }

  const handleFormatChange = useCallback((fmt: OutputFormat) => {
    setOutputFmt(fmt)
    onOutputFormatChange(fmt)
    if (outputRaw) {
      try {
        setOutput(convertFormat(outputRaw, 'base64', fmt))
      } catch {
        // ignore conversion error
      }
    }
  }, [outputRaw, onOutputFormatChange])

  const handleRun = useCallback(async () => {
    if (!input.trim()) return
    if (keySource === 'passphrase' && !passphrase) { setError('Passphrase is required'); return }
    if (keySource === 'raw' && !rawKey) { setError('Raw key is required'); return }

    setLoading(true)
    setError('')
    setOutput('')
    setDetails(null)

    try {
      const result = await symmetricEncrypt(input, {
        algorithm,
        keySource,
        keySize,
        passphrase,
        rawKey,
        manualIv: ivMode === 'manual' ? manualIv : undefined,
        iterations,
        outputFormat: 'base64',
      })
      setOutputRaw(result.output)
      setOutput(convertFormat(result.output, 'base64', outputFmt))
      setDetails(result.details)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [input, keySource, passphrase, rawKey, algorithm, keySize, ivMode, manualIv, iterations, outputFmt])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      handleRun()
    }
  }, [handleRun])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" onKeyDown={handleKeyDown}>
      {/* Left column */}
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
          disabled={loading || !input.trim() || (keySource === 'passphrase' ? !passphrase : !rawKey)}
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

      {/* Right column */}
      <div className="flex flex-col gap-4">
        <KeyConfigPanel
          keySource={keySource}
          onKeySourceChange={setKeySource}
          passphrase={passphrase}
          onPassphraseChange={setPassphrase}
          rawKey={rawKey}
          onRawKeyChange={setRawKey}
          iterations={iterations}
          onIterationsChange={setIterations}
          keySize={keySize}
          onKeySizeChange={setKeySize}
          ivMode={ivMode}
          onIvModeChange={setIvMode}
          manualIv={manualIv}
          onManualIvChange={setManualIv}
          algorithm={algorithm}
          outputFormat={outputFmt}
          onOutputFormatChange={handleFormatChange}
        />
        <DetailsPanel details={details} />
      </div>
    </div>
  )
}
