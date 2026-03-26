import { useState } from 'react'
import type { HistoryEntry, Mode } from '../types/crypto'

interface HistoryPanelProps {
  entries: HistoryEntry[]
  onClear: () => void
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString()
}

function modeLabel(mode: Mode): string {
  return { encrypt: 'ENC', decrypt: 'DEC', sign: 'SIGN', verify: 'VER', keygen: 'KEY' }[mode]
}

export function HistoryPanel({ entries, onClear }: HistoryPanelProps) {
  const [open, setOpen] = useState(false)

  if (entries.length === 0) return null

  return (
    <div className="border border-surface-700 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-surface-800 hover:bg-surface-700 text-sm text-text-secondary transition-colors"
      >
        <span>{open ? '▲' : '▼'} History ({entries.length})</span>
        <button
          onClick={e => { e.stopPropagation(); onClear() }}
          className="text-xs text-text-muted hover:text-danger transition-colors"
        >
          Clear
        </button>
      </button>
      {open && (
        <div className="divide-y divide-surface-700 max-h-64 overflow-y-auto bg-surface-900">
          {entries.map(e => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-2">
              <span className="tag text-xs shrink-0">{modeLabel(e.mode)}</span>
              <span className="text-xs font-mono text-text-muted shrink-0">{e.algorithm}</span>
              <span className="text-xs text-text-secondary truncate flex-1">{e.inputPreview}</span>
              <span className="text-xs text-text-muted shrink-0">{formatTime(e.timestamp)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
