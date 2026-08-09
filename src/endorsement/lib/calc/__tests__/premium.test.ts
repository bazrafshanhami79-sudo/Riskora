import { describe, expect, it } from 'vitest'
import { computePremium, computeRateChangePremium, computeTotal } from '../premium'
import { daysBetweenJalali } from '../jalaliDate'

// Fixtures reproduce the exact formulas/values from the source spreadsheet
// (referenceDays = D column "مدت زمان بیمه‌نامه", chargedDays = E column "مدت زمان باقی‌مانده").
describe('computePremium — spreadsheet 1 (multi-item, referenceDays=365, chargedDays=176)', () => {
  const referenceDays = 365
  const chargedDays = 176
  const rows = [
    { name: 'ساختمان و تاسیسات', value: 2_340_000_000_000, annualRate: 0.00125 },
    { name: 'ماشین آلات و تجهیزات', value: 640_000_000_000, annualRate: 0.00125 },
    { name: 'مواد اولیه', value: 60_000_000_000, annualRate: 0.00125 },
    { name: 'ابزار الات و منصوبات', value: 30_000_000_000, annualRate: 0.00125 },
    { name: 'اثاثیه و ملزومات', value: 30_000_000_000, annualRate: 0.00125 },
  ]
  const expectedPremiums = [
    1_410_410_958.9041097, 385_753_424.6575343, 36_164_383.56164384, 18_082_191.78082192, 18_082_191.78082192,
  ]

  it.each(rows.map((row, i) => [row, expectedPremiums[i]] as const))('computes premium for %s', (row, expected) => {
    const { premium } = computePremium({ value: row.value, annualRate: row.annualRate, referenceDays, chargedDays })
    expect(premium).toBeCloseTo(expected, 4)
  })

  it('sums the grand total (جمع row)', () => {
    const results = rows.map((row) => computePremium({ value: row.value, annualRate: row.annualRate, referenceDays, chargedDays }))
    expect(computeTotal(results)).toBeCloseTo(1_868_493_150.6849318, 4)
  })
})

describe('computeRateChangePremium — rate-change endorsement (no capital change)', () => {
  // Regression scenario: item originally covered at a limited rate of 1.5 در هزار;
  // two months into a 365-day policy the rate is changed to a full 2.5 در هزار,
  // effective from that date to the end of the term. The premium must be the
  // day-counted RATE DIFFERENCE over the remaining days, not a flat amount.
  const value = 235_000_000_000
  const previousRate = 0.0015
  const newRate = 0.0025
  const referenceDays = 365
  const chargedDays = 305 // ~365 - 60 (two months) remaining days

  it('equals (newRate - previousRate) prorated by the remaining days, not a flat amount', () => {
    const { premium } = computeRateChangePremium({ value, previousRate, newRate, referenceDays, chargedDays })
    const expected = value * ((newRate - previousRate) / referenceDays) * chargedDays
    expect(premium).toBeCloseTo(expected, 6)
    expect(premium).toBeCloseTo(196_369_863.0136987, 4)
  })

  it('is negative (a refund) when the new rate is lower than the previous rate', () => {
    const { premium } = computeRateChangePremium({
      value,
      previousRate: newRate,
      newRate: previousRate,
      referenceDays,
      chargedDays,
    })
    expect(premium).toBeLessThan(0)
    expect(premium).toBeCloseTo(-196_369_863.0136987, 4)
  })

  it('is zero when the rate does not actually change', () => {
    const { premium } = computeRateChangePremium({ value, previousRate: 0.002, newRate: 0.002, referenceDays, chargedDays })
    expect(premium).toBe(0)
  })

  it('matches end-to-end using real Jalali dates (policy 1404/01/01–1404/12/29, rate changed 1404/03/01)', () => {
    const policyStart = { jy: 1404, jm: 1, jd: 1 }
    const policyEnd = { jy: 1404, jm: 12, jd: 29 }
    const rateChangeDate = { jy: 1404, jm: 3, jd: 1 }

    const derivedReferenceDays = daysBetweenJalali(policyStart, policyEnd)
    const derivedChargedDays = daysBetweenJalali(rateChangeDate, policyEnd)

    const { premium } = computeRateChangePremium({
      value,
      previousRate,
      newRate,
      referenceDays: derivedReferenceDays,
      chargedDays: derivedChargedDays,
    })

    expect(derivedReferenceDays).toBe(364)
    expect(derivedChargedDays).toBe(302)
    expect(premium).toBeCloseTo(194_972_527.47252747, 4)
  })
})

describe('computePremium — full-term issuance/renewal (chargedDays === referenceDays)', () => {
  it('reduces to value * annualRate when charging the full reference term', () => {
    const { premium } = computePremium({ value: 1_000_000, annualRate: 0.002, referenceDays: 365, chargedDays: 365 })
    expect(premium).toBeCloseTo(2000, 6)
  })
})

describe('computePremium — renewal with a base term different from the renewal duration', () => {
  // A policy whose own base term was 200 days can be renewed for a shorter (or
  // longer) span, e.g. 32 days — referenceDays (annualization basis) and
  // chargedDays (what's actually being charged) must stay independent inputs.
  it('uses the 200-day base term to annualize the rate while only charging 32 days', () => {
    const { dailyRate, premium } = computePremium({
      value: 100_000_000_000,
      annualRate: 0.0025,
      referenceDays: 200,
      chargedDays: 32,
    })
    expect(dailyRate).toBeCloseTo(0.0004, 10)
    expect(premium).toBeCloseTo(40_000_000, 4)
  })

  it('gives a different premium than if the base term were mistakenly equal to the renewal duration', () => {
    const decoupled = computePremium({ value: 100_000_000_000, annualRate: 0.0025, referenceDays: 200, chargedDays: 32 })
    const wronglyCoupled = computePremium({ value: 100_000_000_000, annualRate: 0.0025, referenceDays: 32, chargedDays: 32 })
    expect(decoupled.premium).not.toBeCloseTo(wronglyCoupled.premium, 0)
  })
})
