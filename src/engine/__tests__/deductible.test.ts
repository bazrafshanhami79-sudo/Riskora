/**
 * Deductibles, the stepped maintenance table, and cross-liability.
 *
 * Values are derived from the Swiss Re tables reproduced in
 * `EAR_Rating_v26.xlsx` (`Deductible-Engine`), Sec. 3.2 / Sec. 9 point 3.2 /
 * Sec. 9 point 3.3.5 / TPL Rating Table 20 point B.3.
 */

import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS, calculate } from '../calc'
import { maintenanceMonthsFactor } from '../data'
import type { EarInputs } from '../types'

// Sub-group 12.5 has a 1,000 c-unit table minimum; the default calibration is
// 50,000,000 IRR per 1,000 c-units, so the table minimum is 50,000,000 IRR.
const BASE: EarInputs = { ...DEFAULT_INPUTS }
const TABLE_MIN_IRR = 50_000_000

describe('excess calibration (Sec. 3.2.3)', () => {
  const r = calculate(BASE)

  it('converts the table minimum through the local-market calibration', () => {
    expect(r.deductible.tableMinimumCU).toBe(1000)
    expect(r.deductible.conversionFactorIRR).toBe(50_000)
    expect(r.deductible.tableMinimumIRR).toBe(TABLE_MIN_IRR)
  })

  it('applies no rebate when no excess has been entered', () => {
    expect(r.deductible.multipleAchieved).toBe(0)
    expect(r.deductible.totalRateRebateFactor).toBe(1)
    expect(r.rate.mdTechnicalRate).toBeCloseTo(4.1, 10)
  })
})

describe('D.1 — rebate by multiple of the table minimum', () => {
  const at = (amount: number) => calculate({ ...BASE, deductibleMinAmount: amount })

  it('steps down between tabulated multiples', () => {
    expect(at(TABLE_MIN_IRR).deductible.d1Factor).toBe(1) // 1x
    expect(at(2 * TABLE_MIN_IRR).deductible.d1Factor).toBe(0.9) // 2x
    expect(at(3 * TABLE_MIN_IRR).deductible.d1Factor).toBe(0.85) // 3x
    expect(at(4 * TABLE_MIN_IRR).deductible.d1Factor).toBe(0.85) // between 3 and 5 → lower row
    expect(at(10 * TABLE_MIN_IRR).deductible.d1Factor).toBe(0.7)
    expect(at(100 * TABLE_MIN_IRR).deductible.d1Factor).toBe(0.45)
  })

  it('rebates the erection and testing rate but never the earthquake loading', () => {
    // Sensitivity 4 / structure 6 gives the 1.095 permille Zone C loading.
    const r = calculate({
      ...BASE,
      eqSensitivityClass: 4,
      structureClass: 6,
      deductibleMinAmount: 2 * TABLE_MIN_IRR,
    })
    expect(r.deductible.totalRateRebateFactor).toBe(0.9)
    // (3.65 + 0.45) x 0.9 + 1.095, the loading carried at full rate.
    expect(r.rate.mdTechnicalRate).toBeCloseTo(3.69 + 1.095, 10)
  })

  it('caps below the table minimum and warns rather than penalising', () => {
    const r = at(TABLE_MIN_IRR / 2)
    expect(r.deductible.d1Factor).toBe(1)
    expect(r.warnings.some((w) => w.code === 'EXCESS_BELOW_TABLE_MINIMUM')).toBe(true)
  })

  it('warns above the top of the table', () => {
    const r = at(200 * TABLE_MIN_IRR)
    expect(r.deductible.d1Factor).toBe(0.45)
    expect(r.warnings.some((w) => w.code === 'EXCESS_MULTIPLE_ABOVE_TABLE')).toBe(true)
  })
})

describe('D.2 — proportional excess, and the two structures', () => {
  it('multiplies the two rebates together under percent-with-minimum', () => {
    const r = calculate({
      ...BASE,
      deductibleStructure: 'PERCENT_WITH_MIN',
      deductibleMinAmount: 2 * TABLE_MIN_IRR,
      deductiblePercent: 10,
    })
    expect(r.deductible.d1Factor).toBe(0.9)
    expect(r.deductible.d2Factor).toBe(0.9)
    expect(r.deductible.totalRateRebateFactor).toBe(0.81)
  })

  it('ignores the percentage entirely under amount-only', () => {
    const r = calculate({
      ...BASE,
      deductibleStructure: 'AMOUNT_ONLY',
      deductibleMinAmount: 2 * TABLE_MIN_IRR,
      deductiblePercent: 20,
    })
    expect(r.deductible.d2Factor).toBe(1)
    expect(r.deductible.totalRateRebateFactor).toBe(0.9)
  })
})

describe('D.3 — TPL excess deduction', () => {
  const at = (perMille: 1 | 2 | 3 | 5) => calculate({ ...BASE, tplExcessPerMille: perMille })

  it('follows the Table 20 B.3 scale', () => {
    expect(at(1).deductible.tplPremiumDeduction).toBe(0)
    expect(at(2).deductible.tplPremiumDeduction).toBe(0.1)
    expect(at(3).deductible.tplPremiumDeduction).toBe(0.15)
    expect(at(5).deductible.tplPremiumDeduction).toBe(0.2)
  })

  it('reduces the TPL premium, leaving the MD rate untouched', () => {
    const r = at(5)
    // 20,000,000,000 x 0.2 permille x (1 - 0.20)
    expect(r.tpl.premium).toBe(3_200_000)
    expect(r.rate.mdTechnicalRate).toBeCloseTo(4.1, 10)
  })
})

describe('cross-liability', () => {
  const off = calculate({ ...BASE, crossLiability: 'No' })
  const on = calculate({ ...BASE, crossLiability: 'Yes' })

  it('adds 35% of the TPL premium', () => {
    expect(off.tpl.crossLiabilitySurcharge).toBe(0)
    expect(on.tpl.premium).toBe(4_000_000)
    expect(on.tpl.crossLiabilitySurcharge).toBe(1_400_000)
    expect(on.tpl.total).toBe(5_400_000)
  })

  it('reaches the final premium', () => {
    // gross 82,000,000 + 5,400,000 = 87,400,000, then +10% tax
    expect(on.grossPremium).toBe(87_400_000)
    expect(on.totalPayable).toBe(96_140_000)
  })

  it('is visible in the charged TPL rate, not only in the premium', () => {
    // This is what the two-rate panel shows; the surcharge is a pure
    // multiplier on the premium, so it is exact in the rate too.
    expect(off.tpl.chargedRate).toBeCloseTo(0.2, 10)
    expect(on.tpl.chargedRate).toBeCloseTo(0.27, 10)
  })

  it('is taken after the TPL excess deduction, not before', () => {
    const r = calculate({ ...BASE, crossLiability: 'Yes', tplExcessPerMille: 5 })
    expect(r.tpl.premium).toBe(3_200_000)
    expect(r.tpl.crossLiabilitySurcharge).toBe(1_120_000) // 35% of the reduced premium
    expect(r.tpl.chargedRate).toBeCloseTo(0.2 * 0.8 * 1.35, 10)
  })

  it('stays zero when TPL is excluded altogether', () => {
    const r = calculate({ ...BASE, tplIncluded: 'No', crossLiability: 'Yes' })
    expect(r.tpl.crossLiabilitySurcharge).toBe(0)
    expect(r.tpl.total).toBe(0)
  })
})

describe('maintenance period factor (Sec. 9 point 3.3.5)', () => {
  it('is stepped, not linear', () => {
    expect(maintenanceMonthsFactor(6)).toBeCloseTo(0.75, 10)
    expect(maintenanceMonthsFactor(12)).toBeCloseTo(1.0, 10)
    expect(maintenanceMonthsFactor(18)).toBeCloseTo(1.4, 10)
    expect(maintenanceMonthsFactor(24)).toBeCloseTo(1.75, 10)
  })

  it('interpolates between the tabulated steps', () => {
    expect(maintenanceMonthsFactor(9)).toBeCloseTo(0.875, 10)
    expect(maintenanceMonthsFactor(0)).toBe(0)
  })

  it('no longer under-rates at 6 months the way months/12 did', () => {
    // The old linear form gave 0.5; the table says 0.75.
    expect(maintenanceMonthsFactor(6)).toBeGreaterThan(6 / 12)
  })

  it('feeds the visits-maintenance loading', () => {
    const r = calculate({ ...BASE, visitsMaintenanceMonths: 6 })
    // Light = 5% of the 3 permille reference rate x 0.75
    expect(r.rate.loadings.visitsMaint).toBeCloseTo(0.05 * 3 * 0.75, 10)
  })

  it('warns beyond the end of the table', () => {
    const r = calculate({ ...BASE, extendedMaintenanceMonths: 36 })
    expect(r.warnings.some((w) => w.code === 'MAINTENANCE_BEYOND_TABLE')).toBe(true)
  })
})
