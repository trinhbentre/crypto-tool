import { useCallback } from 'react'
import { Header } from './components/Header'
import { ModeBar } from './components/ModeBar'
import { AlgorithmPicker } from './components/AlgorithmPicker'
import { EncryptMode } from './components/EncryptMode'
import { DecryptMode } from './components/DecryptMode'
import { RsaEncryptMode } from './components/RsaEncryptMode'
import { RsaDecryptMode } from './components/RsaDecryptMode'
import { SignMode } from './components/SignMode'
import { VerifyMode } from './components/VerifyMode'
import { KeyGenMode } from './components/KeyGenMode'
import { ShortcutHints } from './components/ShortcutHints'
import { HistoryPanel } from './components/HistoryPanel'
import { useHistory } from './hooks/useHistory'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { useStorage } from './hooks/useStorage'
import type { Mode, Algorithm, SymmetricAlgorithm, SignatureAlgorithm, KeyGenType, OutputFormat } from './types/crypto'

const DEFAULT_ENCRYPT_ALG: SymmetricAlgorithm = 'AES-GCM'

function isSymmetricAlgorithm(alg: Algorithm): alg is SymmetricAlgorithm {
  return alg === 'AES-GCM' || alg === 'AES-CBC' || alg === 'AES-CTR'
}

function isSignatureAlgorithm(alg: Algorithm): alg is SignatureAlgorithm {
  return alg === 'RSA-PSS' || alg === 'ECDSA'
}

function isKeyGenType(alg: Algorithm): alg is KeyGenType {
  return alg === 'AES' || alg === 'RSA' || alg === 'EC'
}

export default function App() {
  const [mode, setMode] = useStorage<Mode>('ct-mode', 'encrypt')
  const [algorithm, setAlgorithm] = useStorage<Algorithm>('ct-algorithm', DEFAULT_ENCRYPT_ALG)
  const [outputFormat, setOutputFormat] = useStorage<OutputFormat>('ct-output-format', 'base64')
  const { entries, clearHistory } = useHistory()

  useKeyboardShortcuts({ onModeChange: setMode })

  const handleModeChange = useCallback((newMode: Mode) => {
    setMode(newMode)
    if ((newMode === 'encrypt' || newMode === 'decrypt') && algorithm !== 'RSA-OAEP' && !isSymmetricAlgorithm(algorithm)) {
      setAlgorithm('AES-GCM')
    } else if ((newMode === 'sign' || newMode === 'verify') && (isSymmetricAlgorithm(algorithm) || algorithm === 'RSA-OAEP')) {
      setAlgorithm('RSA-PSS')
    } else if (newMode === 'keygen') {
      setAlgorithm('AES')
    }
  }, [algorithm, setMode, setAlgorithm])

  const handleAlgorithmChange = useCallback((alg: Algorithm) => {
    setAlgorithm(alg)
  }, [setAlgorithm])

  const renderMode = () => {
    // Symmetric modes
    if ((mode === 'encrypt' || mode === 'decrypt') && isSymmetricAlgorithm(algorithm)) {
      if (mode === 'encrypt') {
        return <EncryptMode algorithm={algorithm} outputFormat={outputFormat} onOutputFormatChange={setOutputFormat} />
      }
      return <DecryptMode algorithm={algorithm} outputFormat={outputFormat} onOutputFormatChange={setOutputFormat} />
    }

    // RSA-OAEP modes
    if ((mode === 'encrypt' || mode === 'decrypt') && algorithm === 'RSA-OAEP') {
      if (mode === 'encrypt') {
        return <RsaEncryptMode outputFormat={outputFormat} onOutputFormatChange={setOutputFormat} />
      }
      return <RsaDecryptMode outputFormat={outputFormat} onOutputFormatChange={setOutputFormat} />
    }

    // Sign / Verify
    if (mode === 'sign' && isSignatureAlgorithm(algorithm)) {
      return <SignMode algorithm={algorithm} outputFormat={outputFormat} onOutputFormatChange={setOutputFormat} />
    }
    if (mode === 'verify' && isSignatureAlgorithm(algorithm)) {
      return <VerifyMode algorithm={algorithm} outputFormat={outputFormat} onOutputFormatChange={setOutputFormat} />
    }

    // KeyGen
    if (mode === 'keygen' && isKeyGenType(algorithm)) {
      return <KeyGenMode algorithm={algorithm} />
    }

    // Fallback
    return (
      <div className="card flex items-center justify-center py-16">
        <p className="text-text-muted text-sm">Select a mode and algorithm to begin.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-900">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">
        {typeof crypto === 'undefined' || !crypto.subtle ? (
          <div className="card border-danger/50 text-danger text-sm p-4">
            ⚠ Web Crypto API is not available. This tool requires a secure context (HTTPS or localhost).
          </div>
        ) : null}
        <div className="flex flex-col gap-4">
          <ModeBar mode={mode} onModeChange={handleModeChange} />
          <AlgorithmPicker mode={mode} algorithm={algorithm} onAlgorithmChange={handleAlgorithmChange} />
        </div>
        {renderMode()}
        <HistoryPanel entries={entries} onClear={clearHistory} />
        <ShortcutHints />
      </main>
    </div>
  )
}

// Phase 2 complete

