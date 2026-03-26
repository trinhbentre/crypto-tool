import type { Mode } from '../types/crypto'

interface ModeBarProps {
  mode: Mode
  onModeChange: (mode: Mode) => void
}

const MODES: { id: Mode; label: string; shortcut: string }[] = [
  { id: 'encrypt', label: 'Encrypt', shortcut: '⌘1' },
  { id: 'decrypt', label: 'Decrypt', shortcut: '⌘2' },
  { id: 'sign', label: 'Sign', shortcut: '⌘3' },
  { id: 'verify', label: 'Verify', shortcut: '⌘4' },
  { id: 'keygen', label: 'Key Gen', shortcut: '⌘5' },
]

export function ModeBar({ mode, onModeChange }: ModeBarProps) {
  return (
    <div className="flex gap-1 bg-surface-900 p-1 rounded-lg border border-surface-700 w-fit flex-wrap">
      {MODES.map(m => (
        <button
          key={m.id}
          onClick={() => onModeChange(m.id)}
          title={m.shortcut}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 cursor-pointer ${
            mode === m.id
              ? 'bg-accent text-surface-900 font-semibold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  )
}
