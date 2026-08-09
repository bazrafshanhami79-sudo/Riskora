/**
 * Unified daily-rate premium formula used by the base/renewal and
 * capital increase/decrease scenarios — matches the source spreadsheets
 * exactly:
 *   dailyRate = annualRate / referenceDays
 *   premium   = value * dailyRate * chargedDays
 *
 * referenceDays: total days of the original/base policy term.
 * chargedDays: days actually being charged in this transaction — equals
 *   referenceDays for a full-term issuance/renewal, or the remaining days
 *   from an effective date to the policy end for a mid-term capital change.
 */
export interface PremiumInput {
  value: number
  annualRate: number
  referenceDays: number
  chargedDays: number
}

export interface PremiumResult {
  dailyRate: number
  premium: number
}

export function computePremium({ value, annualRate, referenceDays, chargedDays }: PremiumInput): PremiumResult {
  const dailyRate = (annualRate / referenceDays) * chargedDays
  return { dailyRate, premium: value * dailyRate }
}

/**
 * Rate-change endorsement (no capital change): the premium is the
 * day-counted value of the RATE DIFFERENCE over the remaining term, not a
 * flat previously-collected amount. A lower new rate naturally yields a
 * negative premium (a refund) with no separate sign handling needed.
 */
export interface RateChangePremiumInput {
  value: number
  previousRate: number
  newRate: number
  referenceDays: number
  chargedDays: number
}

export interface RateChangePremiumResult {
  dailyRateDelta: number
  premium: number
}

export function computeRateChangePremium({
  value,
  previousRate,
  newRate,
  referenceDays,
  chargedDays,
}: RateChangePremiumInput): RateChangePremiumResult {
  const dailyRateDelta = ((newRate - previousRate) / referenceDays) * chargedDays
  return { dailyRateDelta, premium: value * dailyRateDelta }
}

export function computeTotal(rows: { premium: number }[]): number {
  return rows.reduce((sum, row) => sum + row.premium, 0)
}
