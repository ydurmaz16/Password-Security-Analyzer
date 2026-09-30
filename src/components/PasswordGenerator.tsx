import { useState } from 'react'
import { generatePassword, type GeneratorOptions } from '../lib/generator'

const LABELS: Record<keyof GeneratorOptions, string> = {
  uppercase: 'Uppercase',
  lowercase: 'Lowercase',
  numbers: 'Numbers',
  symbols: 'Symbols',
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState<GeneratorOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  })
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const noneSelected = !Object.values(options).some(Boolean)

  const generate = () => {
    setOutput(generatePassword(length, options))
    setCopied(false)
  }

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Generate</h2>

      <label htmlFor="len" className="mb-1 block text-sm text-slate-400">
        Length: <span className="font-semibold text-slate-100">{length}</span>
      </label>
      <input
        id="len"
        type="range"
        min={8}
        max={64}
        value={length}
        onChange={(e) => setLength(Number(e.target.value))}
        className="w-full accent-emerald-400"
      />

      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
        {(Object.keys(LABELS) as (keyof GeneratorOptions)[]).map((key) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
              className="accent-emerald-400"
            />
            {LABELS[key]}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={generate}
        disabled={noneSelected}
        className="mt-4 w-full rounded-lg bg-emerald-500 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
      >
        Generate Password
      </button>

      {output && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-slate-950 p-3">
          <code className="flex-1 break-all font-mono text-emerald-300">{output}</code>
          <button
            type="button"
            onClick={copy}
            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </section>
  )
}
