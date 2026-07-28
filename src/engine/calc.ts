/**
 * EAR premium rating engine — Swiss Re methodology, Iran-localized.
 *
 * Pure and dependency-free apart from the static rate tables. No UI imports.
 * Every step follows the order in the build specification; the numbered
 * comments map onto its section numbers.
 */

import {
  DEBRIS_THRESHOLD_CU,
  DEFAULT_CURRENCY,
  E_LADDER,
  e1Factor,
  e2Factor,
  existingPropertyRate,
  findCity,
  findMachine,
  findSubGroup,
  monthlyEqRate,
  tpl as tplData,
  zoneForHazard,
} from './data'
import { clamp, excelRound, num } from './round'
import type {
  AddOnsDetail,
  CurrencySettings,
  EarInputs,
  EarResult,
  EarthquakeDetail,
  EngineWarning,
  RateBuildUp,
  TplDetail,
  ValidationResult,
} from './types'

/** Swiss Re §2.5 caps: basic rate covers 3 erection + 1 testing month. */
export const MACHINE_ERECTION_CAP = 9
export const MACHINE_TESTING_CAP = 3

export const DEFAULT_INPUTS: EarInputs = {
  projectScope: 'ENTIRE_PROJECT',
  // The §7 reference scenario names industry group `05 — Metal Industry`
  // alongside sub-group `12.5 Paint factories…`, which is the workbook's own
  // stale pairing — 12.5 belongs to group 12. `industryGroup` only filters the
  // sub-group picker and never feeds the calculation, so the coherent group is
  // used here; the reference premium is unchanged.
  industryGroup: '12 — Plastic & Rubber',
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

/** §5.4 Manufacturer's-Risk band: 5% (1–3 mo) / 7.5% (4–6) / 10% (7+). */
function manufacturerRiskFactor(months: number): number {
  if (months <= 0) return 0
  if (months <= 3) return 0.05
  if (months <= 6) return 0.075
  return 0.1
}

/**
 * §5.3 Round E up to the next tabulated value, capped at the top of the ladder.
 * Mirrors the workbook's `Data!G18` IF-chain.
 */
export function roundUpE(e: number): number {
  for (const step of E_LADDER) {
    if (e <= step) return step
  }
  return E_LADDER[E_LADDER.length - 1]
}

/**
 * §5.7 TPL limit adaptation factor.
 *
 * `Rate-TPL` B.2 tabulates the bands as UPPER bounds (`≤ 0.5 mio`, `1 mio`,
 * `2 mio (base)`, `4 mio`, `6 mio`, `8 mio`, `10 mio`), so a limit that falls
 * between two tabulated values takes the NEXT band up — the same round-up
 * convention the workbook applies to the earthquake E factor. A 7 mio c-unit
 * limit therefore takes the 8 mio factor, 1.56 (acceptance test T9).
 *
 * A limit below the first band carries no adaptation at all (factor 1), which
 * is what the workbook's `IFERROR(..., 1)` produces for a zero/blank limit.
 *
 * This deliberately implements the CORRECT bands. The workbook's
 * `Currency-Conversion!B22`/`B23` hold stray Persian text instead of 6,000,000
 * and 8,000,000, which collapses the factor to 1.20 across the 4–10 mio band.
 * `tpl.json` carries the repaired thresholds.
 */
export function tplLimitFactor(tplLimit: number, rialPerCUnit: number): number {
  const bands = tplData.limitFactors
  const firstThresholdRial = bands[0].thresholdCU * rialPerCUnit
  if (tplLimit < firstThresholdRial) return 1
  for (const band of bands) {
    if (tplLimit <= band.thresholdCU * rialPerCUnit) return band.factor
  }
  return bands[bands.length - 1].factor
}

/**
 * §5.2 Banded erection-rate build-up over the project duration (Entire Project).
 */
export function bandedErectionRate(
  months: number,
  b: { base: number; m2_12: number; m13_24: number; m25plus: number },
): number {
  if (months <= 1) return b.base
  if (months <= 12) return b.base + (months - 1) * b.m2_12
  if (months <= 24) return b.base + 11 * b.m2_12 + (months - 12) * b.m13_24
  return b.base + 11 * b.m2_12 + 12 * b.m13_24 + (months - 24) * b.m25plus
}

export function calculate(
  rawInputs: EarInputs,
  currencySettings: CurrencySettings = DEFAULT_CURRENCY,
): EarResult {
  const i = rawInputs
  const isMachine = i.projectScope === 'INDIVIDUAL_MACHINES'
  const warnings: EngineWarning[] = []

  // --- 5.0 Currency --------------------------------------------------------
  const rialPerCUnit = num(currencySettings.nimaRate) * num(currencySettings.inflationFactor)

  // --- 5.2 Base erection rate ---------------------------------------------
  const subGroup = findSubGroup(i.subGroup)
  const machine = findMachine(i.machine)

  // Swiss Re §2.5 caps. Clamped, and warned about via V7.
  const rawErection = num(i.erectionMonths)
  const rawTesting = num(i.testingMonths)
  const effectiveErectionMonths = clamp(rawErection, 0, MACHINE_ERECTION_CAP)
  const effectiveTestingMonths = clamp(rawTesting, 0, MACHINE_TESTING_CAP)

  if (isMachine && (rawErection > MACHINE_ERECTION_CAP || rawTesting > MACHINE_TESTING_CAP)) {
    warnings.push({
      code: 'MACHINE_PERIOD_CLAMPED',
      message:
        'مدت واردشده از سقف سوئیس‌ری فراتر است و برای محاسبه محدود شد ' +
        `(نصب حداکثر ${MACHINE_ERECTION_CAP} ماه، آزمایش حداکثر ${MACHINE_TESTING_CAP} ماه).`,
    })
  }

  let bandedBaseRate = 0
  let minRate = 0
  let effectiveErection = 0
  let referenceRate = 0
  let hotTestingRate = 0

  if (isMachine) {
    // The blue basic rate already includes 1 month of testing, so no separate
    // hot-testing rate is charged, and the basic rate IS the minimum rate.
    if (machine) {
      effectiveErection =
        machine.basic +
        Math.max(0, effectiveErectionMonths - 3) * machine.addErect +
        Math.max(0, effectiveTestingMonths - 1) * machine.addTest
      referenceRate = machine.refRate
    }
    hotTestingRate = 0
  } else {
    if (subGroup) {
      bandedBaseRate = bandedErectionRate(num(i.durationMonths), subGroup)
      minRate = subGroup.minRate
      effectiveErection = Math.max(bandedBaseRate, minRate)
      referenceRate = subGroup.refRate
      hotTestingRate = i.hotTestingIncluded === 'Yes' ? subGroup.hotTest : 0
    }
  }

  // --- 5.3 Earthquake loading ---------------------------------------------
  const cityRow = findCity(i.province, i.city)
  const e1 = e1Factor(i.eqSensitivityClass)
  const e2 = e2Factor(i.structureClass)
  const e = e1 * e2
  const eRounded = roundUpE(e)
  const zone = zoneForHazard(cityRow?.hazard)
  const monthlyRate = monthlyEqRate(eRounded, zone)

  // Open question, surfaced rather than resolved silently: `durationMonths` is
  // an Entire-Project input, so in Individual-Machines scope the analogue is
  // erection + testing months.
  const useMachineMonths = isMachine && i.natureRiskLoadingForMachine === 'Yes'
  const monthsApplied = useMachineMonths
    ? effectiveErectionMonths + effectiveTestingMonths
    : num(i.durationMonths)

  if (useMachineMonths) {
    warnings.push({
      code: 'EQ_DURATION_BASIS_MACHINE',
      message:
        'در حالت ماشین‌آلات منفرد، مبنای مدتِ بارگذاری زلزله «ماه‌های نصب + آزمایش» ' +
        `(${monthsApplied} ماه) در نظر گرفته شده است، نه مدت کل پروژه.`,
    })
  }

  // The workbook rounds the loading to 4 decimals (Data!E21).
  const eqLoading =
    i.earthquakeExclusion === 'Yes' ? 0 : excelRound(monthlyRate * monthsApplied, 4)

  // Swiss Re §2.5: no perils-of-nature rate for individual machines unless the
  // site's catastrophic return period is under 10 years — an underwriting
  // judgement, so it is an explicit toggle rather than an inference.
  const eqLoadingApplied = isMachine && i.natureRiskLoadingForMachine === 'No' ? 0 : eqLoading

  const earthquake: EarthquakeDetail = {
    e1,
    e2,
    e,
    eRounded,
    hazard: cityRow?.hazard ?? null,
    zone,
    monthlyRate,
    monthsApplied,
    monthsBasis: useMachineMonths ? 'erectionMonths + testingMonths' : 'durationMonths',
  }

  // --- 5.4 Rate loadings ---------------------------------------------------
  const mrMaterialMonths = num(i.manufacturerRiskMaterialMonths)
  const mrDesignMonths = num(i.manufacturerRiskDesignMonths)
  const visitsMonths = num(i.visitsMaintenanceMonths)
  const extendedMonths = num(i.extendedMaintenanceMonths)
  const heavy = i.maintenanceClass === 'Heavy'

  const mrMaterial = manufacturerRiskFactor(mrMaterialMonths) * referenceRate
  const mrDesign = manufacturerRiskFactor(mrDesignMonths) * referenceRate
  const visitsMaint =
    visitsMonths <= 0 ? 0 : (heavy ? 0.075 : 0.05) * referenceRate * (visitsMonths / 12)
  const extendedMaint =
    extendedMonths <= 0 ? 0 : (heavy ? 0.125 : 0.075) * referenceRate * (extendedMonths / 12)
  const expediting =
    num(i.expeditingCostsPct) <= 0 ? 0 : num(i.expeditingCostsPct) * effectiveErection
  const riotStrike =
    num(i.riotStrikeRate) <= 0
      ? 0
      : num(i.riotStrikeRate) *
        (i.riotStrikePeriodBasis === 'Testing/Commissioning period' ? 1 : 0.5)

  const loadingsSubtotal =
    mrMaterial + mrDesign + visitsMaint + extendedMaint + expediting + riotStrike

  // Known gap §6.3: the blue basic rate already includes defective
  // material/workmanship cover, so this loading double-counts. Left active by
  // instruction, warned about here.
  if (isMachine && (mrMaterialMonths > 0 || mrDesignMonths > 0)) {
    warnings.push({
      code: 'MR_DOUBLE_COUNT_IN_MACHINE_SCOPE',
      message:
        'هشدار: در حالت ماشین‌آلات منفرد، نرخ پایهٔ جدول آبی خودْ پوشش نقص مواد/کارگری را ' +
        'در بر دارد؛ بارگذاری «ریسک سازندهٔ تجهیزات» این پوشش را دوباره حساب می‌کند.',
    })
  }

  // --- 5.5 MD technical rate and premium -----------------------------------
  const mdTechnicalRate = effectiveErection + hotTestingRate + eqLoadingApplied + loadingsSubtotal
  const mdOfficeRate = excelRound(mdTechnicalRate * (1 + num(i.underwritingAdjustment)), 4)
  // No minimum-premium floor on MD — removed in workbook revision v15 after an
  // audit found the referenced cell was the General Excess, not a minimum.
  const grossMDPremium = excelRound((num(i.sumInsured) * mdOfficeRate) / 1000, 0)

  const rate: RateBuildUp = {
    bandedBaseRate,
    minRate,
    effectiveErection,
    referenceRate,
    hotTestingRate,
    eqLoading,
    eqLoadingApplied,
    loadings: {
      mrMaterial,
      mrDesign,
      visitsMaint,
      extendedMaint,
      expediting,
      riotStrike,
      subtotal: loadingsSubtotal,
    },
    mdTechnicalRate,
    mdOfficeRate,
  }

  // --- 5.6 Premium add-ons (each on its own basis, not on the Sum Insured) --
  const debrisThresholdRial = DEBRIS_THRESHOLD_CU * rialPerCUnit
  const existingProperty = excelRound(
    (existingPropertyRate(i.existingProperty) * num(i.existingPropertyLimit)) / 1000,
    0,
  )
  const airFreight = excelRound((num(i.airFreightRate) * num(i.airFreightLimit)) / 1000, 0)
  const storage = excelRound((0.1 * num(i.storageValue) * num(i.storageMonths)) / 1000, 0)
  const transit = excelRound((1 * num(i.transitValue)) / 1000, 0)
  const debris =
    num(i.debrisLimit) > debrisThresholdRial
      ? excelRound((effectiveErection * num(i.debrisLimit)) / 1000, 0)
      : 0

  const addOns: AddOnsDetail = {
    existingProperty,
    airFreight,
    storage,
    transit,
    debris,
    debrisThresholdRial,
    subtotal: existingProperty + airFreight + storage + transit + debris,
  }

  // --- 5.7 TPL -------------------------------------------------------------
  const tplBaseRate = tplData.baseRates[i.tplCategory]?.[i.tplSurroundings] ?? 0
  const informationalMinPremiumRial =
    (tplData.minPremiumCU[i.tplCategory]?.[i.tplSurroundings] ?? 0) * rialPerCUnit

  let tpl: TplDetail
  if (i.tplIncluded === 'No') {
    tpl = {
      included: false,
      baseRate: tplBaseRate,
      limitFactor: 0,
      effectiveRate: 0,
      premium: 0,
      crossLiabilitySurcharge: 0,
      total: 0,
      informationalMinPremiumRial,
    }
  } else {
    const limitFactor = tplLimitFactor(num(i.tplLimit), rialPerCUnit)
    const tplEffective = tplBaseRate * limitFactor
    // TPL is rated on the Sum Insured; the limit only sets the adaptation
    // factor. No TPL minimum premium is applied (removed in v15).
    const premium = excelRound((num(i.sumInsured) * tplEffective) / 1000, 0)
    const crossLiabilitySurcharge =
      i.crossLiability === 'Yes' ? excelRound(0.35 * premium, 0) : 0
    tpl = {
      included: true,
      baseRate: tplBaseRate,
      limitFactor,
      effectiveRate: tplEffective,
      premium,
      crossLiabilitySurcharge,
      total: premium + crossLiabilitySurcharge,
      informationalMinPremiumRial,
    }
  }

  // --- 5.8 Final premium ---------------------------------------------------
  const grossPremium = grossMDPremium + addOns.subtotal + tpl.total
  // Both derived from gross independently: brokerage is paid out of gross, tax
  // is added on top. Deliberately not chained.
  const netToInsurer = excelRound(grossPremium * (1 - num(i.brokerage)), 0)
  const totalPayable = excelRound(grossPremium * (1 + num(i.insuranceTax)), 0)

  // --- 5.9 Validation checks ----------------------------------------------
  const validations: ValidationResult[] = [
    check(
      'V1',
      isMachine,
      !!subGroup && Number.isFinite(subGroup.minRate) && subGroup.minRate > 0,
      'زیرگروه پروژه به نرخ معتبر رسید.',
      'زیرگروه پروژه یافت نشد یا نرخ معتبری ندارد.',
      'در حالت ماشین‌آلات منفرد کاربرد ندارد.',
    ),
    check(
      'V2',
      isMachine,
      effectiveErection >= minRate,
      'نرخ مؤثر نصب برابر یا بالاتر از کف نرخ است.',
      'نرخ مؤثر نصب پایین‌تر از کف نرخ زیرگروه است.',
      'در جدول آبی، نرخ پایه خودْ حداقلِ نرخ است (بند ۲.۵).',
    ),
    check(
      'V3',
      isMachine,
      num(i.durationMonths) >= 1 && num(i.durationMonths) <= 120,
      'مدت پروژه در بازهٔ ۱ تا ۱۲۰ ماه است.',
      'مدت پروژه باید بین ۱ تا ۱۲۰ ماه باشد.',
      'در حالت ماشین‌آلات منفرد کاربرد ندارد.',
    ),
    check(
      'V4',
      false,
      i.earthquakeExclusion !== 'Yes' || eqLoading === 0,
      'وضعیت معافیت زلزله با بارگذاری زلزله سازگار است.',
      'معافیت زلزله فعال است ولی بارگذاری زلزله صفر نشده.',
      '',
    ),
    check(
      'V5',
      false,
      i.tplIncluded === 'No' || tplBaseRate > 0,
      i.tplIncluded === 'No'
        ? 'پوشش مسئولیت شخص ثالث انتخاب نشده است.'
        : 'ورودی‌های مسئولیت شخص ثالث معتبرند.',
      'ردهٔ ریسک یا محیط اطراف برای مسئولیت شخص ثالث معتبر نیست.',
      '',
    ),
    check(
      'V6',
      false,
      num(i.sumInsured) > 0,
      'مبلغ بیمه وارد شده است.',
      'مبلغ بیمه باید وارد شود و بزرگ‌تر از صفر باشد.',
      '',
    ),
    check(
      'V7',
      !isMachine,
      rawErection >= 0 &&
        rawErection <= MACHINE_ERECTION_CAP &&
        rawTesting >= 0 &&
        rawTesting <= MACHINE_TESTING_CAP,
      'مدت نصب و آزمایش در سقف‌های سوئیس‌ری است.',
      `مدت نصب باید حداکثر ${MACHINE_ERECTION_CAP} ماه و مدت آزمایش حداکثر ${MACHINE_TESTING_CAP} ماه باشد.`,
      'در حالت کل پروژه کاربرد ندارد.',
    ),
  ]

  const allValid = validations.every((v) => v.notApplicable || v.ok)

  return {
    rialPerCUnit,
    effectiveErectionMonths,
    effectiveTestingMonths,
    rate,
    earthquake,
    addOns,
    tpl,
    grossMDPremium,
    grossPremium,
    netToInsurer,
    totalPayable,
    validations,
    allValid,
    warnings,
  }
}

function check(
  id: ValidationResult['id'],
  notApplicable: boolean,
  ok: boolean,
  passMessage: string,
  failMessage: string,
  naMessage: string,
): ValidationResult {
  if (notApplicable) return { id, ok: true, notApplicable: true, message: naMessage }
  return { id, ok, notApplicable: false, message: ok ? passMessage : failMessage }
}
