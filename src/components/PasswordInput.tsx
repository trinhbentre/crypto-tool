import { useState, useCallback } from 'react'

interface PasswordInputProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  label?: string
}

export function PasswordInput({ value, onChange, placeholder = 'Enter passphrase…', label }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  const handleToggle = useCallback(() => setShow(s => !s), [])

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-text-secondary">{label}</label>}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full bg-surface-900 border border-surface-700 rounded-md px-3 py-2 pr-10 text-sm font-mono text-text-primary placeholder-text-muted focus:outline-none focus:border-accent transition-colors"
        />
        <button
          type="button"
          onClick={handleToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors text-xs select-none"
          title={show ? 'Hide' : 'Show'}
          aria-label={show ? 'Hide passphrase' : 'Show passphrase'}
        >
          {show ? '🙈' : '👁'}
        </button>
      </div>
    </div>
  )
}
