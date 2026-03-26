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

  const btnClass = (alg: Algorithm) =>
    `px-3 py-1.5 rounded-md text-sm font-mono transition-colors duration-150 cursor-pointer ${
      algorithm === alg
        ? 'bg-accent text-surface-900 font-semibold'
        : 'bg-surface-700 text-text-secondary border border-surface-600 hover:bg-surface-600'
    }`

  return (
    <div className="flex gap-2 flex-wrap items-center">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-1.5 flex-wrap">
          {gi > 0 && <span className="text-surface-600">|</span>}
          {group.map(alg => (
            <button
              key={alg}
              onClick={() => onAlgorithmChange(alg)}
              className={btnClass(alg)}
            >
              {alg}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
