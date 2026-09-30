import { describe, it, expect } from 'vitest'
import { analyzePassword } from './analyzer'
import { generatePassword } from './generator'

const ALL = { uppercase: true, lowercase: true, numbers: true, symbols: true }

describe('analyzePassword', () => {
  it('rates "123456" as Very Weak', () => {
    expect(analyzePassword('123456').strength).toBe('Very Weak')
  })

  it('rates "password" as Weak and flags it as common', () => {
    const r = analyzePassword('password')
    expect(r.strength).toBe('Weak')
    expect(r.flags.common).toBe(true)
  })

  it('rates "Yigit123" as Weak or Medium', () => {
    expect(['Weak', 'Medium']).toContain(analyzePassword('Yigit123').strength)
  })

  it('rates a long passphrase as Strong', () => {
    expect(analyzePassword('Correct-Horse-7').strength).toBe('Strong')
  })

  it('rates a random generated password as Very Strong', () => {
    expect(analyzePassword(generatePassword(20, ALL)).strength).toBe('Very Strong')
  })

  it('detects repeated characters', () => {
    expect(analyzePassword('xaaax9K!').flags.repeated).toBe(true)
  })

  it('detects sequential characters', () => {
    expect(analyzePassword('abcdef').flags.sequential).toBe(true)
    expect(analyzePassword('Zx!123kQ').flags.sequential).toBe(true)
  })

  it('counts character classes', () => {
    const r = analyzePassword('Ab1!cd')
    expect([r.uppercase, r.lowercase, r.numbers, r.special, r.variety]).toEqual([1, 3, 1, 1, 4])
  })

  it('handles an empty password', () => {
    const r = analyzePassword('')
    expect(r.length).toBe(0)
    expect(r.entropyBits).toBe(0)
  })
})

describe('generatePassword', () => {
  it('respects length and selected sets', () => {
    const pw = generatePassword(16, { uppercase: false, lowercase: true, numbers: true, symbols: false })
    expect(pw).toHaveLength(16)
    expect(pw).toMatch(/^[a-z0-9]+$/)
    expect(pw).toMatch(/[a-z]/)
    expect(pw).toMatch(/[0-9]/)
  })

  it('throws when no set is selected', () => {
    expect(() =>
      generatePassword(16, { uppercase: false, lowercase: false, numbers: false, symbols: false }),
    ).toThrow()
  })
})
