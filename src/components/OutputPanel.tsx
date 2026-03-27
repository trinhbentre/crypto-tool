import { useCallback } from 'react'
import type { OutputFormat } from '../types/crypto'
import { FormatToggle } from './FormatToggle'
import { convertFormat } from '../lib/encoding'
import { CopyButton, Button } from '@web-tools/ui'

interface OutputPanelProps {
  label?: string
  value: string
  format: OutputFormat
  onFormatChange: (fmt: OutputFormat) => void
  filename?: string
  rows?: number
}

export function OutputPanel({ label = 'Output', value, format, onFormatChange, filename = 'output.txt', rows = 8 }: OutputPanelProps) {
  const handleFormatChange = useCallback((fmt: OutputFormat) => {
    onFormatChange(fmt)
  }, [onFormatChange])

  const handleDownload = useCallback(() => {
    if (!value) return
    const blob = new Blob([value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }, [value, filename])

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">{label}</label>
        {value && <FormatToggle format={format} onChange={handleFormatChange} />}
      </div>
      <textarea
        value={value}
        readOnly
        rows={rows}
        spellCheck={false}
        placeholder="Output will appear here…"
        className="w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 text-sm font-mono text-text-primary placeholder-text-muted resize-y cursor-default focus:outline-none focus:border-accent transition-colors select-all"
        onClick={e => (e.target as HTMLTextAreaElement).select()}
      />
      {value && (
        <div className="flex items-center gap-2">
          <CopyButton value={value} size="sm" />
          <Button size="sm" variant="secondary" onClick={handleDownload}>Download</Button>
        </div>
      )}
    </div>
  )
}

// Re-export for use in symmetric modes to handle format conversion
export { convertFormat }
