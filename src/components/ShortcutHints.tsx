import { ShortcutHints as SharedShortcutHints } from '@web-tools/ui'

const SHORTCUTS = [
  { keys: '⌘1↵', label: 'Run' },
  { keys: '⌘⇧C', label: 'Copy output' },
  { keys: '⌘⇧X', label: 'Clear all' },
  { keys: '⌘1–5', label: 'Switch mode' },
]

export function ShortcutHints() {
  return (
    <SharedShortcutHints
      shortcuts={SHORTCUTS}
      dismissable
      storageKey="ct-shortcut-hints"
    />
  )
}
