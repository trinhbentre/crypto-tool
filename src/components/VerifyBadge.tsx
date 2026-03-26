import type { CryptoDetails } from '../types/crypto'

interface VerifyBadgeProps {
  valid: boolean | null
  details: CryptoDetails | null
}

export function VerifyBadge({ valid, details }: VerifyBadgeProps) {
  if (valid === null) return null

  return (
    <div className={`rounded-lg border p-4 flex flex-col gap-2 ${
      valid
        ? 'bg-success/10 border-success/40'
        : 'bg-danger/10 border-danger/40'
    }`}>
      <div className={`text-2xl font-bold ${valid ? 'text-success' : 'text-danger'}`}>
        {valid ? '✓  Signature is VALID' : '✗  Signature is INVALID'}
      </div>
      {details?.algorithm && (
        <div className="text-sm text-text-secondary">Algorithm: {details.algorithm}</div>
      )}
      {details?.timingMs !== undefined && (
        <div className="text-xs text-text-muted">Verified in {details.timingMs} ms</div>
      )}
    </div>
  )
}
