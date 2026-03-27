import { ModeSelector } from '@web-tools/ui'
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
    <ModeSelector
      options={MODES.map(m => ({ id: m.id, label: m.label, shortcut: m.shortcut }))}
      activeId={mode}
      onChange={id => onModeChange(id as Mode)}
      variant="pill"
      aria-label="Select mode"
    />
  )
}
