import { useState, useCallback, useEffect } from 'react'

interface ShortcutHintsProps {
  onDismiss?: () => void
}

const SHORTCUTS = [
  { keys: '⌘↵', label: 'Run' },
  { keys: '⌘⇧C', label: 'Copy output' },
  { keys: '⌘⇧X', label: 'Clear all' },
  { keys: '⌘1–5', label: 'Switch mode' },
]

export function ShortcutHints({ onDismiss }: ShortcutHintsProps) {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem('ct-shortcut-hints') !== 'dismissed' } catch { return true }
  })

  const handleDismiss = useCallback(() => {
    setVisible(false)
    try { localStorage.setItem('ct-shortcut-hints', 'dismissed') } catch { /* ignore */ }
    onDismiss?.()
  }, [onDismiss])

  useEffect(() => {
    if (!visible) return
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'H') {
        setVisible(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible])

  if (!visible) return null

  return (
    <div className="flex items-center gap-4 flex-wrap bg-surface-800 border border-surface-700 rounded-md px-3 py-2">
      <span className="text-xs text-text-muted">Keyboard shortcuts:</span>
      {SHORTCUTS.map(s => (
        <span key={s.keys} className="flex items-center gap-1.5">
          <kbd className="tag text-xs">{s.keys}</kbd>
          <span className="text-xs text-text-muted">{s.label}</span>
        </span>
      ))}
      <button onClick={handleDismiss} className="ml-auto text-xs text-text-muted hover:text-text-secondary transition-colors">
        Dismiss
      </button>
    </div>
  )
}
