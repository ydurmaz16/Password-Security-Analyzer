export interface GeneratorOptions {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

const SETS: Record<keyof GeneratorOptions, string> = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?',
}

/** Unbiased random integer in [0, max) using rejection sampling. */
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max
  const buf = new Uint32Array(1)
  do {
    crypto.getRandomValues(buf)
  } while (buf[0] >= limit)
  return buf[0] % max
}

export function generatePassword(length: number, options: GeneratorOptions): string {
  const pools = (Object.keys(SETS) as (keyof GeneratorOptions)[])
    .filter((key) => options[key])
    .map((key) => SETS[key])
  if (pools.length === 0) throw new Error('Select at least one character type')

  const size = Math.min(64, Math.max(length, pools.length, 8))
  const all = pools.join('')

  // Guarantee at least one character from every selected set, then fill the rest.
  const chars = pools.map((p) => p[randomInt(p.length)])
  while (chars.length < size) chars.push(all[randomInt(all.length)])

  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
