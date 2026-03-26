import { useState, useCallback, useRef } from 'react'
import type { SymmetricAlgorithm, KeySource, OutputFormat, AesKeySize, IvMode, CryptoDetails } from '../types/crypto'
import { DEFAULT_PBKDF2_ITERATIONS, DEFAULT_AES_KEY_SIZE } from '../lib/constants'
import { symmetricDecrypt } from '../lib/symmetric'
import { InputPanel } from './InputPanel'
import { KeyConfigPanel } from './KeyConfigPanel'
import { DetailsPanel } from './DetailsPanel'

interface DecryptModeProps {
  algorithm: SymmetricAlgorithm
  outputFormat: OutputFormat
  onOutputFormatChange: (fmt: OutputFormat) => void
}

export function DecryptMode({ algorithm, outputFormat, onOutputFormatChange }: DecryptModeProps) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [details, setDetails] = useState<CryptoDetails | null>(null)
  const [inputFormat, setInputFormat] = useState<OutputFormat>(outputFormat)

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
    setDetails(null)
    setError('')
  }

  const handleInputFormatChange = useCallback((fmt: OutputFormat) => {
    setInputFormat(fmt)
    onOutputFormatChange(fmt)
  }, [onOutputFormatChange])

  const handleRun = useCallback(async () => {
    if (!input.trim()) return
    if (keySource === 'passphrase' && !passphrase) { setError('Passphrase is required'); return }
    if (keySource === 'raw' && !rawKey) { setError('Raw key is required'); return }

    setLoading(true)
    setError('')
    setOutput('')
    setDetails(null)

    try {
      const result = await symmetricDecrypt(input.trim(), {
        algorithm,
        keySource,
        keySize,
        passphrase,
        rawKey,
        iterations,
        inputFormat,
      })
      setOutput(result.output)
      setDetails(result.details)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [input, keySource, passphrase, rawKey, algorithm, keySize, iterations, inputFormat])

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
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Ciphertext Format</label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleInputFormatChange('base64')}
              className={`btn text-xs ${inputFormat === 'base64' ? 'btn-primary' : 'btn-secondary'}`}
            >
              base64
            </button>
            <button
              onClick={() => handleInputFormatChange('hex')}
              className={`btn text-xs ${inputFormat === 'hex' ? 'btn-primary' : 'btn-secondary'}`}
            >
              hex
            </button>
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
          disabled={loading || !input.trim() || (keySource === 'passphrase' ? !passphrase : !rawKey)}
          className="btn-primary w-fit"
        >
          {loading ? 'Decrypting…' : '▶ Decrypt  ⌘↵'}
        </button>

        <InputPanel
          label="Plaintext"
          value={output}
          onChange={() => {}}
          readOnly
          placeholder="Decrypted text will appear here…"
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
          outputFormat={inputFormat}
          onOutputFormatChange={handleInputFormatChange}
        />
        <DetailsPanel details={details} />
      </div>
    </div>
  )
}
