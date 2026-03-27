import { Button } from '@web-tools/ui'
import type { Mode, Algorithm } from '../types/crypto'

interface AlgorithmPickerProps {
  mode: Mode
  algorithm: Algorithm
  onAlgorithmChange: (alg: Algorithm) => void
}

const SYMMETRIC_ALGOS: Algorithm[] = ['AES-GCM', 'AES-CBC', 'AES-CTR']
const ASYMMETRIC_ENCRYPT_ALGOS: Algorithm[] = ['RSA-OAEP']
const SIGNATURE_ALGOS: Algorithm[] = ['RSA-PSS', 'ECDSA']
const KEYGEN_TYPES: Algorithm[] = ['AES', 'RSA', 'EC']

function getAlgosForMode(mode: Mode): Algorithm[][] {
  if (mode === 'encrypt' || mode === 'decrypt') {
    return [SYMMETRIC_ALGOS, ASYMMETRIC_ENCRYPT_ALGOS]
  }
  if (mode === 'sign' || mode === 'verify') {
    return [SIGNATURE_ALGOS]
  }
  if (mode === 'keygen') {
    return [KEYGEN_TYPES]
  }
  return []
}

export function AlgorithmPicker({ mode, algorithm, onAlgorithmChange }: AlgorithmPickerProps) {
  const groups = getAlgosForMode(mode)

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1.5 flex-wrap">
          {gi > 0 && <span className="text-surface-600">|</span>}
          {group.map(alg => (
            <Button
              key={alg}
              size="md"
              variant={algorithm === alg ? 'primary' : 'secondary'}
              onClick={() => onAlgorithmChange(alg)}
              className="font-mono"
            >
              {alg}
            </Button>
          ))}
        </div>
      ))}
    </div>
  )
}
