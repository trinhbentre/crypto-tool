import type { CryptoDetails } from '../types/crypto'

interface DetailsPanelProps {
  details: CryptoDetails | null
}

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs text-text-muted w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs font-mono text-text-secondary break-all">{value}</span>
    </div>
  )
}

export function DetailsPanel({ details }: DetailsPanelProps) {
  if (!details) return null

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Details</label>
      <div className="card flex flex-col gap-1.5 p-3">
        {details.algorithm && <DetailRow label="Algorithm" value={details.algorithm} />}
        {details.keySize && <DetailRow label="Key Size" value={`${details.keySize} bit`} />}
        {details.keyDerivation && <DetailRow label="Key" value={details.keyDerivation} />}
        {details.saltHex && (
          <DetailRow label={`Salt (${details.saltBytes}B)`} value={details.saltHex} />
        )}
        {details.ivHex && (
          <DetailRow label={`IV (${details.ivBytes}B)`} value={details.ivHex} />
        )}
        {details.tagBytes && (
          <DetailRow label="Auth Tag" value={`${details.tagBytes} bytes`} />
        )}
        {details.timingMs !== undefined && (
          <DetailRow label="Time" value={`${details.timingMs} ms`} />
        )}
      </div>
    </div>
  )
}
