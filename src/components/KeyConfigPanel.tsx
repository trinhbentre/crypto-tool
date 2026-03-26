import type { SymmetricAlgorithm, KeySource, OutputFormat, AesKeySize, IvMode } from '../types/crypto'
import { MIN_PBKDF2_ITERATIONS, WARN_PBKDF2_ITERATIONS, AES_KEY_SIZES } from '../lib/constants'
import { PasswordInput } from './PasswordInput'

interface KeyConfigPanelProps {
  keySource: KeySource
  onKeySourceChange: (s: KeySource) => void
  passphrase: string
  onPassphraseChange: (v: string) => void
  rawKey: string
  onRawKeyChange: (v: string) => void
  iterations: number
  onIterationsChange: (n: number) => void
  keySize: AesKeySize
  onKeySizeChange: (s: AesKeySize) => void
  ivMode: IvMode
  onIvModeChange: (m: IvMode) => void
  manualIv: string
  onManualIvChange: (v: string) => void
  algorithm: SymmetricAlgorithm
  outputFormat: OutputFormat
  onOutputFormatChange: (f: OutputFormat) => void
}

export function KeyConfigPanel({
  keySource, onKeySourceChange,
  passphrase, onPassphraseChange,
  rawKey, onRawKeyChange,
  iterations, onIterationsChange,
  keySize, onKeySizeChange,
  ivMode, onIvModeChange,
  manualIv, onManualIvChange,
}: KeyConfigPanelProps) {
  const iterWarn = iterations < WARN_PBKDF2_ITERATIONS

  return (
    <div className="flex flex-col gap-4">
      {/* Key Source */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Key Source</label>
        <div className="flex gap-2">
          <button
            onClick={() => onKeySourceChange('passphrase')}
            className={`btn text-xs ${keySource === 'passphrase' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Passphrase
          </button>
          <button
            onClick={() => onKeySourceChange('raw')}
            className={`btn text-xs ${keySource === 'raw' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Raw Key
          </button>
        </div>
      </div>

      {keySource === 'passphrase' ? (
        <>
          <PasswordInput value={passphrase} onChange={onPassphraseChange} label="Passphrase" />

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-text-secondary">PBKDF2 Iterations</label>
              {iterWarn && (
                <span className="text-xs text-warning">⚠ Low</span>
              )}
            </div>
            <input
              type="number"
              value={iterations}
              min={MIN_PBKDF2_ITERATIONS}
              step={50000}
              onChange={e => onIterationsChange(Math.max(MIN_PBKDF2_ITERATIONS, Number(e.target.value)))}
              className="w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 text-sm font-mono text-text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-1">
          <label className="text-xs text-text-secondary">Raw Key (hex or base64)</label>
          <input
            type="text"
            value={rawKey}
            onChange={e => onRawKeyChange(e.target.value)}
            placeholder={`${keySize / 8} bytes (${keySize / 4} hex chars or ${Math.ceil(keySize / 6)} base64 chars)`}
            className="w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      )}

      {/* Key Size */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-text-secondary">Key Size</label>
        <div className="flex gap-2">
          {AES_KEY_SIZES.map(size => (
            <button
              key={size}
              onClick={() => onKeySizeChange(size)}
              className={`btn text-xs ${keySize === size ? 'btn-primary' : 'btn-secondary'}`}
            >
              {size} bit
            </button>
          ))}
        </div>
      </div>

      {/* IV Mode */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-text-secondary">IV / Nonce</label>
        <div className="flex gap-2">
          <button
            onClick={() => onIvModeChange('auto')}
            className={`btn text-xs ${ivMode === 'auto' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Auto (random)
          </button>
          <button
            onClick={() => onIvModeChange('manual')}
            className={`btn text-xs ${ivMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Manual
          </button>
        </div>
        {ivMode === 'manual' && (
          <input
            type="text"
            value={manualIv}
            onChange={e => onManualIvChange(e.target.value)}
            placeholder="Hex or base64 IV"
            className="w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        )}
      </div>
    </div>
  )
}
