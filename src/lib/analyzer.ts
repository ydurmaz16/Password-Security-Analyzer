import common from '../data/commonPasswords.json'

export type Strength = 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong'
export const STRENGTHS: Strength[] = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong']

export interface Warning {
  ok: boolean
  text: string
}

export interface Analysis {
  length: number
  uppercase: number
  lowercase: number
  numbers: number
  special: number
  variety: number
  entropyBits: number
  strength: Strength
  strengthIndex: number
  resistance: { seconds: number; duration: string; level: string }
  flags: { common: boolean; repeated: boolean; sequential: boolean }
  warnings: Warning[]
}

/** Theoretical attacker speed (offline attack, fast hash / GPU cluster). */
export const GUESSES_PER_SECOND = 1e10

const COMMON = new Set<string>(common)
const KEYBOARD_ROWS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']
const SYMBOL_POOL = 33 // printable ASCII symbols

function isCommon(password: string): boolean {
  const lower = password.toLowerCase()
  if (COMMON.has(lower)) return true
  const stripped = lower.replace(/[^a-z]+$/, '') // "password!!1" -> "password"
  return stripped.length >= 4 && COMMON.has(stripped)
}

function hasKeyboardPattern(lower: string): boolean {
  return KEYBOARD_ROWS.some((row) => {
    const reversed = [...row].reverse().join('')
    for (let i = 0; i <= row.length - 4; i++) {
      if (lower.includes(row.slice(i, i + 4)) || lower.includes(reversed.slice(i, i + 4))) return true
    }
    return false
  })
}

/** Finds runs of 3+ identical or consecutive (+1/-1) characters. */
function scanRuns(lower: string) {
  const c = Array.from(lower, (ch) => ch.charCodeAt(0))
  const n = c.length
  let redundant = 0
  let repeated = false
  let sequential = false
  let i = 0
  while (i < n - 1) {
    const step = c[i + 1] - c[i]
    if (Math.abs(step) > 1) {
      i++
      continue
    }
    let j = i + 1
    while (j < n - 1 && c[j + 1] - c[j] === step) j++
    const run = j - i + 1
    if (run >= 3) {
      redundant += run - 1
      if (step === 0) repeated = true
      else sequential = true
    }
    i = j
  }
  return { redundant, repeated, sequential }
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds)) return 'practically infinite'
  if (seconds < 1) return 'less than a second'
  const units: [number, string][] = [
    [60, 'seconds'],
    [3600, 'minutes'],
    [86400, 'hours'],
    [31_536_000, 'days'],
  ]
  let prev = 1
  for (const [limit, name] of units) {
    if (seconds < limit) return `~${Math.round(seconds / prev)} ${name}`
    prev = limit
  }
  const years = seconds / 31_536_000
  if (years < 1e6) return `~${Math.round(years).toLocaleString('en-US')} years`
  return `~10^${Math.floor(Math.log10(years))} years`
}

function resistanceLevel(seconds: number): string {
  if (seconds < 86400) return 'Very low'
  if (seconds < 31_536_000) return 'Low'
  if (seconds < 3_153_600_000) return 'Moderate' // < 100 years
  if (seconds < 3.15e13) return 'High' // < 1M years
  return 'Very high'
}

function strengthFromEntropy(bits: number): number {
  if (bits < 20) return 0
  if (bits < 36) return 1
  if (bits < 60) return 2
  if (bits < 100) return 3
  return 4
}

export function analyzePassword(password: string): Analysis {
  const length = password.length
  const uppercase = (password.match(/[A-Z]/g) ?? []).length
  const lowercase = (password.match(/[a-z]/g) ?? []).length
  const numbers = (password.match(/[0-9]/g) ?? []).length
  const special = length - uppercase - lowercase - numbers
  const variety = [uppercase, lowercase, numbers, special].filter((n) => n > 0).length

  const pool =
    (lowercase ? 26 : 0) + (uppercase ? 26 : 0) + (numbers ? 10 : 0) + (special ? SYMBOL_POOL : 0)
  const bitsPerChar = pool > 0 ? Math.log2(pool) : 0

  const lower = password.toLowerCase()
  const common = length > 0 && isCommon(password)
  const { redundant, repeated, sequential: seqRun } = scanRuns(lower)
  const keyboard = hasKeyboardPattern(lower)
  const sequential = seqRun || keyboard

  // Entropy = effective length * log2(pool). Predictable characters are not counted.
  let entropy = Math.max(0, length - redundant) * bitsPerChar - (keyboard ? 12 : 0)
  entropy = Math.max(0, entropy)
  if (common) entropy = Math.min(entropy, 25) // an attacker tries dictionaries first

  let strengthIndex = strengthFromEntropy(entropy)
  if (length < 8) strengthIndex = Math.min(strengthIndex, 1)
  if (common) strengthIndex = Math.min(strengthIndex, 1)

  const seconds = Math.pow(2, entropy) / 2 / GUESSES_PER_SECOND // average case = half the space
  const resistance = { seconds, duration: formatDuration(seconds), level: resistanceLevel(seconds) }

  const warnings: Warning[] = []
  warnings.push(
    common
      ? { ok: false, text: 'Matches a commonly used password' }
      : { ok: true, text: 'Not found in the common password list' },
  )
  warnings.push(
    repeated
      ? { ok: false, text: 'Contains repeated characters (e.g. aaa, 111)' }
      : { ok: true, text: 'No repeated character runs' },
  )
  warnings.push(
    sequential
      ? { ok: false, text: 'Contains sequential or keyboard patterns (e.g. 123, abc, qwer)' }
      : { ok: true, text: 'No sequential patterns' },
  )
  if (length < 8) warnings.push({ ok: false, text: 'Too short (use at least 12 characters)' })
  else if (length < 12) warnings.push({ ok: false, text: 'Acceptable length, but 12+ is recommended' })
  else warnings.push({ ok: true, text: 'Good length' })
  warnings.push(
    variety >= 3
      ? { ok: true, text: 'Good character variety' }
      : { ok: false, text: 'Low character variety (mix upper/lower case, digits, symbols)' },
  )

  return {
    length,
    uppercase,
    lowercase,
    numbers,
    special,
    variety,
    entropyBits: Math.round(entropy),
    strength: STRENGTHS[length === 0 ? 0 : strengthIndex],
    strengthIndex: length === 0 ? 0 : strengthIndex,
    resistance,
    flags: { common, repeated, sequential },
    warnings,
  }
}
