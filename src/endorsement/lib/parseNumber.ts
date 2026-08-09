import { normalizeDigits } from './calc/jalaliDate'

export function parseInput(raw: string): number {
  const cleaned = normalizeDigits(raw).replace(/[^0-9.-]/g, '')
  const parsed = Number(cleaned)
  return Number.isNaN(parsed) ? 0 : parsed
}
