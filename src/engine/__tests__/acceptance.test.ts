/**
 * Acceptance tests T1–T9 from the build specification, §7.
 *
 * These values are verified against `EAR_Rating_v18.xlsx` by forced
 * recalculation. If one fails, the ENGINE is wrong — never adjust the expected
 * value to match the code.
 */

import { describe, expect, it } from 'vitest'
import { DEFAULT_INPUTS, calculate, tplLimitFactor } from '../calc'
import { DEFAULT_CURRENCY, subGroupsFor } from '../data'
import type { EarInputs } from '../types'

/**
 * §7 common scenario. Industry `05 — Metal Industry`; sub-group
 * `12.5 Paint factories…`; province/city `قم` (hazard `زیاد` → Zone C);
 * SI 20,000,000,000 ﷼; TPL limit 0; hot testing Yes; maintenance Light;
 * EQ sensitivity 2; structure 3; TPL I/a; no cross-liability; TPL included;
 * no EQ exclusion; all Block-4 fields 0; UW adj 0; brokerage 0.10; tax 0.10.
 */
const BASE: EarInputs = {
  projectScope: 'ENTIRE_PROJECT',
  industryGroup: '05 — Metal Industry',
  subGroup: '12.5 Paint factories and processing of comparable products',
  machine: '02.0.1 — Boiler feed pumps, incl. drive — turbine driven',
  durationMonths: 15,
  erectionMonths: 3,
  testingMonths: 1,
  province: 'قم',
  city: 'قم',

  sumInsured: 20_000_000_000,
  tplLimit: 0,

  tplIncluded: 'Yes',
  hotTestingIncluded: 'Yes',
  maintenanceClass: 'Light',
  visitsMaintenanceMonths: 0,
  extendedMaintenanceMonths: 0,
  eqSensitivityClass: 2,
  structureClass: 3,
  tplCategory: 'I',
  tplSurroundings: 'a',
  crossLiability: 'No',

  manufacturerRiskMaterialMonths: 0,
  manufacturerRiskDesignMonths: 0,
  expeditingCostsPct: 0,
  riotStrikeRate: 0,
  riotStrikePeriodBasis: 'Erection period',
  airFreightLimit: 0,
  airFreightRate: 0,
  storageValue: 0,
  storageMonths: 0,
  transitValue: 0,
  debrisLimit: 0,
  existingProperty: 'Not included — existing property not covered',
  existingPropertyLimit: 0,
  earthquakeExclusion: 'No',

  underwritingAdjustment: 0,
  brokerage: 0.1,
  insuranceTax: 0.1,

  natureRiskLoadingForMachine: 'No',
}

const MACHINE_BASE: EarInputs = {
  ...BASE,
  projectScope: 'INDIVIDUAL_MACHINES',
  machine: '02.0.1 — Boiler feed pumps, incl. drive — turbine driven',
  erectionMonths: 3,
  testingMonths: 1,
}

const v = (r: ReturnType<typeof calculate>, id: string) =>
  r.validations.find((x) => x.id === id)!

describe('T1 — Entire Project, 15 months', () => {
  const r = calculate(BASE)

  it('floors the erection rate up to the sub-group minimum', () => {
    expect(r.rate.bandedBaseRate).toBeCloseTo(3.025, 10)
    expect(r.rate.effectiveErection).toBe(3.65)
  })

  it('charges the hot-testing rate', () => {
    expect(r.rate.hotTestingRate).toBe(0.45)
  })

  it('applies no earthquake loading in Zone C at E = 4', () => {
    expect(r.earthquake.zone).toBe('C')
    expect(r.earthquake.eRounded).toBe(4)
    expect(r.rate.eqLoadingApplied).toBe(0)
  })

  it('produces the expected MD technical rate and premiums', () => {
    expect(r.rate.mdTechnicalRate).toBeCloseTo(4.1, 10)
    expect(r.grossMDPremium).toBe(82_000_000)
    expect(r.tpl.total).toBe(4_000_000)
    expect(r.totalPayable).toBe(94_600_000)
  })

  it('passes every applicable validation', () => {
    expect(r.allValid).toBe(true)
  })
})

describe('shipped defaults', () => {
  const r = calculate(DEFAULT_INPUTS)

  it('default to Entire Project scope', () => {
    expect(DEFAULT_INPUTS.projectScope).toBe('ENTIRE_PROJECT')
  })

  it('reproduce T1 out of the box', () => {
    expect(r.rate.effectiveErection).toBe(3.65)
    expect(r.rate.mdTechnicalRate).toBeCloseTo(4.1, 10)
    expect(r.grossMDPremium).toBe(82_000_000)
    expect(r.totalPayable).toBe(94_600_000)
    expect(r.allValid).toBe(true)
  })

  it('pair the default sub-group with the industry group that actually contains it', () => {
    // Otherwise the cascading picker opens on an empty selection.
    const names = subGroupsFor(DEFAULT_INPUTS.industryGroup).map((s) => s.name)
    expect(names).toContain(DEFAULT_INPUTS.subGroup)
  })

  it('are unaffected by the industry group, which never feeds the calculation', () => {
    const viaOtherGroup = calculate({ ...DEFAULT_INPUTS, industryGroup: '05 — Metal Industry' })
    expect(viaOtherGroup.totalPayable).toBe(r.totalPayable)
    expect(viaOtherGroup.rate.mdTechnicalRate).toBe(r.rate.mdTechnicalRate)
  })
})

describe('T2 — as T1 with TPL excluded', () => {
  const r = calculate({ ...BASE, tplIncluded: 'No' })

  it('zeroes the TPL premium and total', () => {
    expect(r.tpl.premium).toBe(0)
    expect(r.tpl.total).toBe(0)
  })

  it('produces the expected total payable', () => {
    expect(r.totalPayable).toBe(90_200_000)
  })

  it('reports V5 as satisfied because TPL is excluded', () => {
    expect(v(r, 'V5').ok).toBe(true)
    expect(r.allValid).toBe(true)
  })
})

describe('T3 — Individual Machines, erection 3 / testing 1', () => {
  const r = calculate(MACHINE_BASE)

  it('uses the blue-table basic rate unchanged', () => {
    expect(r.rate.effectiveErection).toBe(4.0)
    expect(r.rate.referenceRate).toBe(12.0)
  })

  it('charges no separate hot-testing rate', () => {
    expect(r.rate.hotTestingRate).toBe(0)
  })

  it('produces the expected MD rate and total payable', () => {
    expect(r.rate.mdTechnicalRate).toBe(4.0)
    expect(r.totalPayable).toBe(92_400_000)
  })
})

describe('T4 — Individual Machines, erection 9 / testing 3', () => {
  const r = calculate({ ...MACHINE_BASE, erectionMonths: 9, testingMonths: 3 })

  it('adds the capped erection and testing extensions', () => {
    // 4.0 + 6 × 0.25 + 2 × 1.0
    expect(r.rate.effectiveErection).toBe(7.5)
  })

  it('produces the expected total payable', () => {
    expect(r.totalPayable).toBe(169_400_000)
  })

  it('passes V7 at exactly the caps', () => {
    expect(v(r, 'V7').ok).toBe(true)
  })
})

describe('T5 — erection months beyond the Swiss Re cap', () => {
  const r = calculate({ ...MACHINE_BASE, erectionMonths: 24, testingMonths: 3 })

  it('clamps to 9 erection months', () => {
    expect(r.effectiveErectionMonths).toBe(9)
    expect(r.rate.effectiveErection).toBe(7.5)
  })

  it('fails V7 with the cap warning', () => {
    expect(v(r, 'V7').ok).toBe(false)
    expect(r.allValid).toBe(false)
    expect(r.warnings.some((w) => w.code === 'MACHINE_PERIOD_CLAMPED')).toBe(true)
  })
})

describe('T6 — machine-key disambiguation', () => {
  const a = calculate({
    ...MACHINE_BASE,
    machine: '02.0.8 — Other individual machines, not specified elsewhere',
  })
  const b = calculate({
    ...MACHINE_BASE,
    machine: '05.0.9 — Other individual machines, not specified elsewhere',
  })

  it('returns 02.0.8 rates', () => {
    expect(a.rate.effectiveErection).toBe(2.5)
    expect(a.rate.referenceRate).toBe(5.0)
  })

  it('returns 05.0.9 rates', () => {
    expect(b.rate.effectiveErection).toBe(2.3)
    expect(b.rate.referenceRate).toBe(4.0)
  })

  it('does not collapse the two identically-described machines', () => {
    expect(a.rate.effectiveErection).not.toBe(b.rate.effectiveErection)
    expect(a.rate.referenceRate).not.toBe(b.rate.referenceRate)
  })
})

describe('T7 — earthquake loading at maximum sensitivity', () => {
  const r = calculate({
    ...BASE,
    durationMonths: 15,
    eqSensitivityClass: 4,
    structureClass: 6,
    earthquakeExclusion: 'No',
  })

  it('combines E1 × E2 to 20 and reads the Zone C monthly rate', () => {
    expect(r.earthquake.e1).toBe(4)
    expect(r.earthquake.e2).toBe(5)
    expect(r.earthquake.e).toBe(20)
    expect(r.earthquake.eRounded).toBe(20)
    expect(r.earthquake.zone).toBe('C')
    expect(r.earthquake.monthlyRate).toBe(0.073)
  })

  it('accrues the loading monthly over the project duration', () => {
    expect(r.rate.eqLoading).toBe(1.095)
    expect(r.rate.eqLoadingApplied).toBe(1.095)
  })
})

describe('T8 — nature-perils loading switched on for an individual machine', () => {
  const off = calculate({
    ...MACHINE_BASE,
    erectionMonths: 9,
    testingMonths: 3,
    eqSensitivityClass: 4,
    structureClass: 6,
  })
  const on = calculate({
    ...MACHINE_BASE,
    erectionMonths: 9,
    testingMonths: 3,
    eqSensitivityClass: 4,
    structureClass: 6,
    natureRiskLoadingForMachine: 'Yes',
  })

  it('zeroes the loading by default', () => {
    expect(off.rate.eqLoadingApplied).toBe(0)
  })

  it('applies the loading when the toggle is on', () => {
    expect(on.rate.eqLoadingApplied).toBeGreaterThan(0)
    // Erection + testing months are the duration basis in machine scope.
    expect(on.earthquake.monthsBasis).toBe('erectionMonths + testingMonths')
    expect(on.earthquake.monthsApplied).toBe(12)
    expect(on.rate.eqLoadingApplied).toBe(0.876)
  })

  it('raises the MD technical rate above the loading-free case', () => {
    expect(on.rate.mdTechnicalRate).toBeGreaterThan(off.rate.mdTechnicalRate)
  })
})

describe('T9 — TPL limit adaptation factor', () => {
  const rialPerCUnit = DEFAULT_CURRENCY.nimaRate * DEFAULT_CURRENCY.inflationFactor

  it('returns 1.56 at 7,000,000 c-units, not the workbook bug value of 1.20', () => {
    const r = calculate({ ...BASE, tplLimit: 7_000_000 * rialPerCUnit })
    expect(r.tpl.limitFactor).toBe(1.56)
    expect(r.tpl.limitFactor).not.toBe(1.2)
  })

  it('is correct across all seven bands', () => {
    const f = (millionCU: number) => tplLimitFactor(millionCU * 1_000_000 * rialPerCUnit, rialPerCUnit)
    expect(f(0.5)).toBe(0.65)
    expect(f(1)).toBe(0.8)
    expect(f(2)).toBe(1.0)
    expect(f(4)).toBe(1.2)
    expect(f(6)).toBe(1.4)
    expect(f(8)).toBe(1.56)
    expect(f(10)).toBe(1.67)
  })

  it('carries no adaptation below the first band, and caps above the last', () => {
    expect(tplLimitFactor(0, rialPerCUnit)).toBe(1)
    expect(tplLimitFactor(50_000_000 * rialPerCUnit, rialPerCUnit)).toBe(1.67)
  })
})
