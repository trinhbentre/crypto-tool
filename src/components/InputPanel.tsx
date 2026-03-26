import { useCallback } from 'react'

interface InputPanelProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  readOnly?: boolean
  rows?: number
}

export function InputPanel({ label, value, onChange, placeholder, readOnly = false, rows = 8 }: InputPanelProps) {
  const bytes = new TextEncoder().encode(value).length

  const handleClear = useCallback(() => onChange(''), [onChange])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</label>
        <div className="flex items-center gap-3">
          <span className="text-xs text-text-muted">{bytes > 0 ? `${bytes.toLocaleString()} B` : ''}</span>
          {!readOnly && value && (
            <button onClick={handleClear} className="text-xs text-text-muted hover:text-danger transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        rows={rows}
        placeholder={placeholder}
        spellCheck={false}
        className={`w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted resize-y focus:outline-none focus:border-accent transition-colors ${readOnly ? 'cursor-default select-all' : ''}`}
        onClick={readOnly ? e => (e.target as HTMLTextAreaElement).select() : undefined}
      />
    </div>
  )
}
