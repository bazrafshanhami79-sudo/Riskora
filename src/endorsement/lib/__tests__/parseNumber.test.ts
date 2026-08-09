import { describe, expect, it } from 'vitest'
import { parseInput } from '../parseNumber'

describe('parseInput', () => {
  it('parses a Persian-digit string instead of returning zero', () => {
    expect(parseInput('۲۳۴۰')).toBe(2340)
  })

  it('parses a Persian-digit decimal rate', () => {
    expect(parseInput('۰.۰۰۱۲۵')).toBe(0.00125)
  })

  it('parses a mixed Persian/ASCII grouped string', () => {
    expect(parseInput('2,۳40,000')).toBe(2340000)
  })

  it('still parses plain ASCII input', () => {
    expect(parseInput('1234.5')).toBe(1234.5)
  })

  it('returns 0 for empty input', () => {
    expect(parseInput('')).toBe(0)
  })
})
