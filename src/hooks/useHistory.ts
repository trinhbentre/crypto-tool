import { useState, useCallback } from 'react'
import type { HistoryEntry } from '../types/crypto'

const MAX_ENTRIES = 20

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  const addEntry = useCallback((entry: Omit<HistoryEntry, 'id' | 'timestamp'>) => {
    setEntries(prev => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }
      return [newEntry, ...prev].slice(0, MAX_ENTRIES)
    })
  }, [])

  const clearHistory = useCallback(() => setEntries([]), [])

  return { entries, addEntry, clearHistory }
}
