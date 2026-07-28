/**
 * Excel-compatible rounding.
 *
 * Excel's ROUND() rounds half AWAY FROM ZERO; JavaScript's Math.round() rounds
 * half toward +Infinity. The two disagree on negative halves, which matters
 * because the underwriting adjustment can be negative.
 */
export function excelRound(value: number, digits = 0): number {
  if (!Number.isFinite(value)) return 0
  const factor = 10 ** digits
  const scaled = value * factor
  // Undo binary representation drift (e.g. 0.073 * 15 = 1.0949999999999998)
  // before applying the half-away-from-zero rule, exactly as Excel does.
  const corrected = Number(scaled.toPrecision(15))
  const rounded = corrected < 0 ? -Math.round(-corrected) : Math.round(corrected)
  return rounded / factor
}

/** Clamp to a closed interval. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Coerce anything non-finite to 0 — blank inputs must not poison the maths. */
export function num(value: number | null | undefined): number {
  return Number.isFinite(value) ? (value as number) : 0
}
