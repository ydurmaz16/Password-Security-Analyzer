import { useState } from 'react'
import { analyzePassword, type Analysis } from '../lib/analyzer'

const SEGMENT_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-400', 'bg-lime-400', 'bg-emerald-400']

export default function PasswordAnalyzer() {
  const [password, setPassword] = useState('')
  const [visible, setVisible] = useState(false)
  const [result, setResult] = useState<Analysis | null>(null)

  const analyze = () => setResult(analyzePassword(password))

  const stats: [string, number][] = result
    ? [
        ['Length', result.length],
        ['Uppercase', result.uppercase],
        ['Lowercase', result.lowercase],
        ['Numbers', result.numbers],
        ['Special', result.special],
        ['Variety', result.variety],
      ]
    : []

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-100">Analyze</h2>

      <label htmlFor="pw" className="mb-1 block text-sm text-slate-400">
        Password
      </label>
      <div className="flex gap-2">
        <input
          id="pw"
          type={visible ? 'text' : 'password'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setResult(null)
          }}
          onKeyDown={(e) => e.key === 'Enter' && analyze()}
          autoComplete="off"
          spellCheck={false}
          placeholder="Enter a password"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-slate-100 outline-none focus:border-emerald-400"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="rounded-lg border border-slate-700 px-3 text-sm text-slate-300 hover:bg-slate-800"
        >
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      <button
        type="button"
        onClick={analyze}
        disabled={!password}
        className="mt-3 w-full rounded-lg bg-emerald-500 py-2 font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
      >
        Analyze
      </button>

      {result && (
        <div className="mt-6 space-y-5">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-400">Strength</span>
              <span className="font-semibold text-slate-100">{result.strength}</span>
            </div>
            <div className="flex gap-1">
              {SEGMENT_COLORS.map((color, i) => (
                <div
                  key={color}
                  className={`h-2 flex-1 rounded ${i <= result.strengthIndex ? color : 'bg-slate-800'}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-slate-950 p-3">
              <div className="text-xs text-slate-500">Estimated entropy</div>
              <div className="text-xl font-semibold text-emerald-400">{result.entropyBits} bits</div>
            </div>
            <div className="rounded-lg bg-slate-950 p-3">
              <div className="text-xs text-slate-500">Estimated resistance</div>
              <div className="text-xl font-semibold text-emerald-400">{result.resistance.level}</div>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            ≈ {result.resistance.duration} at 10^10 guesses/sec. This is a theoretical estimate based on
            assumptions, not a real attack.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {stats.map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-950 p-2 text-center">
                <div className="text-lg font-semibold text-slate-100">{value}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>

          <ul className="space-y-1 text-sm">
            {result.warnings.map((w) => (
              <li key={w.text} className={w.ok ? 'text-emerald-400' : 'text-amber-400'}>
                {w.ok ? '✓' : '⚠'} {w.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
