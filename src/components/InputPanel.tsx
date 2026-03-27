import { useCallback } from 'react'
import { TextArea, Button } from '@web-tools/ui'

interface InputPanelProps {
  label: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  readOnly?: boolean
  rows?: number
}

export function InputPanel({ label, value, onChange, placeholder, readOnly = false, rows = 8 }: InputPanelProps) {
  const handleClear = useCallback(() => onChange(''), [onChange])

  return (
    <TextArea
      label={label}
      value={value}
      onChange={readOnly ? undefined : onChange}
      readOnly={readOnly}
      showByteCount={!readOnly}
      placeholder={placeholder}
      rows={rows}
      actions={
        !readOnly && value ? (
          <Button size="sm" variant="ghost" onClick={handleClear}>Clear</Button>
        ) : undefined
      }
    />
  )
}
