import { useCallback } from 'react'
import { detectKeyFormat } from '../lib/keyUtils'

interface KeyTextareaProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
  hint?: string
}

export function KeyTextarea({ label, value, onChange, placeholder, rows = 6, hint }: KeyTextareaProps) {
  const fmt = value.trim() ? detectKeyFormat(value) : null
  const fmtLabel = fmt === 'pem-public' ? 'PEM public key detected'
    : fmt === 'pem-private' ? 'PEM private key detected'
    : fmt === 'jwk' ? 'JWK detected'
    : null

  const handleClear = useCallback(() => onChange(''), [onChange])

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-2">
          {fmtLabel && <span className="text-xs text-success">{fmtLabel}</span>}
          {value && (
            <button onClick={handleClear} className="text-xs text-text-muted hover:text-danger transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder ?? '-----BEGIN PUBLIC KEY-----\n…\n-----END PUBLIC KEY-----'}
        spellCheck={false}
        className="w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 text-xs font-mono text-text-primary placeholder-text-muted resize-y focus:outline-none focus:border-accent transition-colors"
      />
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </div>
  )
}
