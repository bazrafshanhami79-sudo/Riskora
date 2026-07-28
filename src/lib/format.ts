/**
 * Persian number formatting.
 *
 * Display uses Persian digits; input accepts Latin, Persian and Arabic-Indic
 * digits alike, because underwriters paste figures from mixed sources.
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

/** Latin digits → Persian digits. */
export function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => PERSIAN_DIGITS[Number(d)])
}

/** Persian and Arabic-Indic digits → Latin, for parsing. */
export function toLatinDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
}

/**
 * Parse a user-entered number. Tolerates Persian/Arabic digits, thousands
 * separators (Latin and Persian), and the Persian decimal mark.
 */
export function parseNumber(value: string): number | null {
  const normalized = toLatinDigits(value)
    .replace(/[,٬\s‏‎]/g, '')
    .replace(/٫/g, '.')
    .trim()
  if (normalized === '' || normalized === '-') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

/** Thousands-separated Persian integer. */
export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return toPersianDigits(Math.round(value).toLocaleString('en-US'))
}

/** Money with the Rial symbol. */
export function formatRial(value: number): string {
  return `${formatMoney(value)} ﷼`
}

/** Per-mille rate, fixed decimals, Persian digits. */
export function formatRate(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—'
  return toPersianDigits(value.toFixed(digits))
}

/** Rate with the per-mille sign. */
export function formatPerMille(value: number, digits = 3): string {
  return `${formatRate(value, digits)}‰`
}

/** Plain integer in Persian digits. */
export function formatInt(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return toPersianDigits(String(Math.round(value)))
}

/** Decimal (e.g. an adjustment factor) in Persian digits. */
export function formatDecimal(value: number, digits = 2): string {
  if (!Number.isFinite(value)) return '—'
  return toPersianDigits(value.toFixed(digits))
}

/** Decimal fraction rendered as a percentage, e.g. 0.1 → «۱۰٪». */
export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return '—'
  const pct = value * 100
  const text = Number.isInteger(pct) ? String(pct) : pct.toFixed(digits)
  return `${toPersianDigits(text)}٪`
}

/** Compact Rial for tight spaces: میلیارد / میلیون. */
export function formatRialCompact(value: number): string {
  if (!Number.isFinite(value)) return '—'
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000_000)
    return `${toPersianDigits((value / 1_000_000_000_000).toFixed(2))} هزار میلیارد ﷼`
  if (abs >= 1_000_000_000)
    return `${toPersianDigits((value / 1_000_000_000).toFixed(2))} میلیارد ﷼`
  if (abs >= 1_000_000) return `${toPersianDigits((value / 1_000_000).toFixed(2))} میلیون ﷼`
  return formatRial(value)
}
