export interface JalaliDate {
  jy: number
  jm: number
  jd: number
}

export interface PolicyItemRow {
  id: string
  name: string
  value: number
  annualRate: number
  // Only used by the capital-change scenario (ItemTable mode="capitalChange"):
  // each row can independently increase capital, decrease capital, or change
  // rate without any capital change. Renewal reuses the same base premium
  // engine (ItemTable mode="base") as a full-term day-counted calculation,
  // just with renewal-specific date labels — see RenewalScenario.tsx.
  effectiveDate?: JalaliDate
  changeType?: 'increase' | 'decrease' | 'rateChange'
  // Only used when changeType === 'rateChange': the premium is the
  // day-counted difference between the two rates (see computeRateChangePremium),
  // not the item's own annualRate.
  previousRate?: number
  newRate?: number
}

export interface ItemResultRow extends PolicyItemRow {
  referenceDays: number
  chargedDays: number
  dailyRate: number
  premium: number
}
