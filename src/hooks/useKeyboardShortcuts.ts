import { useEffect, useCallback } from 'react'
import type { Mode } from '../types/crypto'

export interface ShortcutHandlers {
  onRun?: () => void
  onCopy?: () => void
  onClear?: () => void
  onModeChange?: (mode: Mode) => void
}

const MODES: Mode[] = ['encrypt', 'decrypt', 'sign', 'verify', 'keygen']

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const { onCopy, onClear, onModeChange } = handlers

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey

    // Ctrl+Shift+C — copy output
    if (ctrl && e.shiftKey && e.key === 'C') {
      e.preventDefault()
      onCopy?.()
      return
    }

    // Ctrl+Shift+X — clear all
    if (ctrl && e.shiftKey && e.key === 'X') {
      e.preventDefault()
      onClear?.()
      return
    }

    // Ctrl+Enter — run (handled inline in mode components, but also global)
    if (ctrl && e.key === 'Enter' && !e.shiftKey) {
      // Only fire if not already handled by inner onKeyDown
      // The mode components handle this themselves, so we skip here
      return
    }

    // Ctrl+1–5 — switch mode
    if (ctrl && !e.shiftKey && ['1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault()
      const idx = parseInt(e.key, 10) - 1
      if (onModeChange && idx >= 0 && idx < MODES.length) {
        onModeChange(MODES[idx])
      }
    }
  }, [onCopy, onClear, onModeChange])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
