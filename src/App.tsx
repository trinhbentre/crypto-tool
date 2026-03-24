import { useState } from 'react'
import { Header } from './components/Header'

// AES-GCM with PBKDF2 key derivation
// Output format: base64(salt[16] + iv[12] + ciphertext)

const SALT_LEN = 16
const IV_LEN = 12
const PBKDF2_ITERATIONS = 200_000

function toBase64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function fromBase64(b64: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>
}

async function deriveKey(passphrase: string, salt: BufferSource): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey'],
  )
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

async function encryptText(plaintext: string, passphrase: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LEN))
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN))
  const key = await deriveKey(passphrase, salt)
  const enc = new TextEncoder()
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(plaintext))
  const combined = new Uint8Array(SALT_LEN + IV_LEN + ciphertext.byteLength)
  combined.set(salt, 0)
  combined.set(iv, SALT_LEN)
  combined.set(new Uint8Array(ciphertext), SALT_LEN + IV_LEN)
  return toBase64(combined.buffer)
}

async function decryptText(ciphertextB64: string, passphrase: string): Promise<string> {
  const combined = fromBase64(ciphertextB64)
  if (combined.length <= SALT_LEN + IV_LEN) throw new Error('Invalid ciphertext')
  const salt = combined.slice(0, SALT_LEN)
  const iv = combined.slice(SALT_LEN, SALT_LEN + IV_LEN)
  const ciphertext = combined.slice(SALT_LEN + IV_LEN)
  const key = await deriveKey(passphrase, salt)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  return new TextDecoder().decode(plaintext)
}

type Tab = 'encrypt' | 'decrypt'

export default function App() {
  const [tab, setTab] = useState<Tab>('encrypt')
  const [input, setInput] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleRun = async () => {
    if (!input.trim() || !passphrase) return
    setLoading(true)
    setError('')
    setOutput('')
    try {
      const result = tab === 'encrypt'
        ? await encryptText(input, passphrase)
        : await decryptText(input.trim(), passphrase)
      setOutput(result)
    } catch (e) {
      setError(tab === 'decrypt'
        ? 'Decryption failed — wrong passphrase or corrupted ciphertext'
        : (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleTabChange = (t: Tab) => {
    setTab(t)
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-6">
        {/* Tabs */}
        <div className="flex gap-1">
          {(['encrypt', 'decrypt'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => handleTabChange(t)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors cursor-pointer ${
                tab === t
                  ? 'bg-accent text-surface-900'
                  : 'bg-surface-700 text-text-secondary border border-surface-600 hover:bg-surface-600'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Passphrase */}
        <div className="flex flex-col gap-1.5">
          <label className="text-text-muted text-xs uppercase tracking-wider">Passphrase</label>
          <input
            type="password"
            className="bg-surface-800 border border-surface-700 rounded-lg px-3 py-2
                       font-mono text-sm text-text-primary placeholder-text-muted
                       focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent"
            placeholder="Enter a strong passphrase…"
            value={passphrase}
            onChange={e => setPassphrase(e.target.value)}
          />
          <p className="text-text-muted text-xs">
            AES-256-GCM · PBKDF2-SHA256 · {PBKDF2_ITERATIONS.toLocaleString()} iterations · random salt + IV per encryption
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-text-muted text-xs uppercase tracking-wider">
            {tab === 'encrypt' ? 'Plaintext' : 'Ciphertext (base64)'}
          </label>
          <textarea
            className="min-h-[140px] bg-surface-800 border border-surface-700 rounded-lg p-3
                       font-mono text-sm text-text-primary placeholder-text-muted
                       focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent
                       resize-none"
            placeholder={tab === 'encrypt' ? 'Text to encrypt…' : 'Base64 ciphertext to decrypt…'}
            value={input}
            onChange={e => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={!input.trim() || !passphrase || loading}
          className="px-4 py-2 rounded-md text-sm font-semibold bg-accent hover:bg-accent-hover
                     text-surface-900 transition-colors cursor-pointer
                     disabled:opacity-40 disabled:cursor-not-allowed self-start"
        >
          {loading ? 'Processing…' : tab === 'encrypt' ? 'Encrypt' : 'Decrypt'}
        </button>

        {error && (
          <p className="text-danger text-sm bg-danger/10 border border-danger/30 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {output && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-text-muted text-xs uppercase tracking-wider">
                {tab === 'encrypt' ? 'Ciphertext (base64)' : 'Plaintext'}
              </label>
              <button
                onClick={handleCopy}
                className="text-xs text-text-secondary hover:text-accent transition-colors cursor-pointer"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <textarea
              className="min-h-[100px] bg-surface-800 border border-surface-700 rounded-lg p-3
                         font-mono text-sm text-text-primary resize-none
                         focus:outline-none focus:ring-1 focus:ring-accent/50 focus:border-accent"
              readOnly
              value={output}
              spellCheck={false}
            />
          </div>
        )}

        <p className="text-text-muted text-xs text-center">
          All cryptographic operations run in-browser using the Web Crypto API — no data leaves your device
        </p>
      </main>
    </div>
  )
}
