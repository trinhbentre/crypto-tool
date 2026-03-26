import type { OutputFormat } from '../types/crypto'

interface FormatToggleProps {
  format: OutputFormat
  onChange: (fmt: OutputFormat) => void
}

export function FormatToggle({ format, onChange }: FormatToggleProps) {
  const btnClass = (fmt: OutputFormat) =>
    `px-2 py-0.5 text-xs rounded cursor-pointer transition-colors ${
      format === fmt
        ? 'bg-accent text-surface-900 font-semibold'
        : 'text-text-muted hover:text-text-secondary'
    }`

  return (
    <div className="flex items-center gap-0.5 bg-surface-900 rounded border border-surface-700 p-0.5">
      <button className={btnClass('base64')} onClick={() => onChange('base64')}>base64</button>
      <button className={btnClass('hex')} onClick={() => onChange('hex')}>hex</button>
    </div>
  )
}
