/**
 * EAR premium rating engine — type definitions.
 *
 * Pure domain types. This module must never import anything from the UI layer.
 */

export type ProjectScope = 'ENTIRE_PROJECT' | 'INDIVIDUAL_MACHINES'
export type YesNo = 'Yes' | 'No'
export type MaintenanceClass = 'Light' | 'Heavy'
export type TplCategory = 'I' | 'II' | 'III'
export type TplSurroundings = 'a' | 'b' | 'c'
export type RiotStrikePeriodBasis = 'Erection period' | 'Testing/Commissioning period'
/**
 * General-excess structure. The Swiss Re "multiple of the table minimum"
 * structure is deliberately not offered — the excess is always entered as a
 * Rial amount and the engine derives the multiple from it.
 */
export type DeductibleStructure = 'PERCENT_WITH_MIN' | 'AMOUNT_ONLY'
/** Proportional excess, % of each claim (Sec. 9 table D.2). */
export type DeductiblePercent = 0 | 10 | 20
/** TPL excess as ‰ of the limit (TPL Rating Table 20 point B.3). */
export type TplExcessPerMille = 1 | 2 | 3 | 5
export type EqSensitivityClass = 1 | 2 | 3 | 4
export type StructureClass = 1 | 2 | 3 | 4 | 5 | 6
export type SwissReZone = 'A' | 'B' | 'C' | 'D' | 'E'
export type Hazard2800 = 'خیلی زیاد' | 'زیاد' | 'متوسط' | 'کم'

/** FX / inflation settings. Editable because NIMA moves. */
export interface CurrencySettings {
  /** NIMA USD/IRR rate. */
  nimaRate: number
  /** US CPI-U 1997 → 2026 adjustment factor. */
  inflationFactor: number
}

export interface EarInputs {
  // ---- Block 1: project type & core information -------------------------
  projectScope: ProjectScope
  /** Display name of the industry group, e.g. `05 — Metal Industry`. */
  industryGroup: string
  /** Full sub-group name; the lookup key into `subgroups.json`. Entire Project only. */
  subGroup: string
  /** `key` field of `machines.json` (EAR code + description). Individual Machines only. */
  machine: string
  /** 1–120. Entire Project only. */
  durationMonths: number
  /** 0–9. Individual Machines only. */
  erectionMonths: number
  /** 0–3. Individual Machines only. */
  testingMonths: number
  province: string
  city: string

  // ---- Block 2: amounts --------------------------------------------------
  sumInsured: number
  tplLimit: number

  // ---- Block 3: common options ------------------------------------------
  tplIncluded: YesNo
  hotTestingIncluded: YesNo
  maintenanceClass: MaintenanceClass
  visitsMaintenanceMonths: number
  extendedMaintenanceMonths: number
  eqSensitivityClass: EqSensitivityClass
  structureClass: StructureClass
  tplCategory: TplCategory
  tplSurroundings: TplSurroundings
  crossLiability: YesNo

  // ---- Block 4: supplementary -------------------------------------------
  manufacturerRiskMaterialMonths: number
  manufacturerRiskDesignMonths: number
  /** Decimal, e.g. 0.075 for 7.5%. */
  expeditingCostsPct: number
  /** ‰, sourced externally from the local fire market. */
  riotStrikeRate: number
  riotStrikePeriodBasis: RiotStrikePeriodBasis
  airFreightLimit: number
  /** ‰ */
  airFreightRate: number
  storageValue: number
  storageMonths: number
  transitValue: number
  debrisLimit: number
  /** `option` field of `existing_property.json`. */
  existingProperty: string
  existingPropertyLimit: number
  earthquakeExclusion: YesNo

  // ---- Block 5: commercial ----------------------------------------------
  /** Decimal; negative = discount. */
  underwritingAdjustment: number
  brokerage: number
  insuranceTax: number

  // ---- Block 6: individual-machine nature perils ------------------------
  natureRiskLoadingForMachine: YesNo

  // ---- Block 7: deductibles / excesses ----------------------------------
  deductibleStructure: DeductibleStructure
  /** Minimum excess amount per loss, in Rial. 0 = not specified, no rebate. */
  deductibleMinAmount: number
  /** Only meaningful for PERCENT_WITH_MIN; forced to 0 for AMOUNT_ONLY. */
  deductiblePercent: DeductiblePercent
  /** ‰ of the TPL limit. 1‰ is the mandatory minimum and earns no rebate. */
  tplExcessPerMille: TplExcessPerMille
}

/** Sec. 3.2.3 calibration of the table minimum excess to the local market. */
export interface ExcessCalibration {
  /** The minimum you apply locally to the reference item, in Rial. */
  localMinimumIRR: number
  /** The reference item's table minimum, in c-units. Swiss Re light equipment = 1000. */
  referenceItemCU: number
}

export type ValidationId = 'V1' | 'V2' | 'V3' | 'V4' | 'V5' | 'V6' | 'V7'

export interface ValidationResult {
  id: ValidationId
  /** `true` when the check passes or is not applicable in the current scope. */
  ok: boolean
  /** `true` when the check does not apply to the current scope. */
  notApplicable: boolean
  /** Persian message shown to the underwriter. */
  message: string
}

/** Non-blocking advisories (known gaps that need underwriter attention). */
export interface EngineWarning {
  code:
    | 'MACHINE_PERIOD_CLAMPED'
    | 'MR_DOUBLE_COUNT_IN_MACHINE_SCOPE'
    | 'EQ_DURATION_BASIS_MACHINE'
    | 'MAINTENANCE_BEYOND_TABLE'
    | 'EXCESS_BELOW_TABLE_MINIMUM'
    | 'EXCESS_MULTIPLE_ABOVE_TABLE'
  message: string
}

export interface DeductibleDetail {
  /** Table minimum general excess for the selected item, in c-units. */
  tableMinimumCU: number
  /** Rial per c-unit used for excesses only (Sec. 3.2.3 indexation). */
  conversionFactorIRR: number
  /** Table minimum converted to Rial. */
  tableMinimumIRR: number
  /** The excess actually applied in the policy, in Rial. */
  excessAppliedIRR: number
  /** excessApplied / tableMinimum. Feeds the D.1 rebate scale. */
  multipleAchieved: number
  /** D.1 rebate factor from the multiple. */
  d1Factor: number
  /** D.2 rebate factor from the proportional percentage. */
  d2Factor: number
  /** d1 x d2, rounded to 4 dp. Applied to the MD rate components. */
  totalRateRebateFactor: number
  /** D.3 deduction from the TPL premium. */
  tplPremiumDeduction: number
}

export interface RateBuildUp {
  /** Banded build-up before the minimum-rate floor (Entire Project only). */
  bandedBaseRate: number
  minRate: number
  effectiveErection: number
  referenceRate: number
  hotTestingRate: number
  eqLoading: number
  eqLoadingApplied: number
  loadings: {
    mrMaterial: number
    mrDesign: number
    visitsMaint: number
    extendedMaint: number
    expediting: number
    riotStrike: number
    subtotal: number
  }
  mdTechnicalRate: number
  mdOfficeRate: number
}

export interface EarthquakeDetail {
  e1: number
  e2: number
  e: number
  eRounded: number
  hazard: Hazard2800 | null
  zone: SwissReZone | null
  monthlyRate: number
  /** Months the monthly rate was multiplied by, and where that number came from. */
  monthsApplied: number
  monthsBasis: 'durationMonths' | 'erectionMonths + testingMonths'
}

export interface TplDetail {
  included: boolean
  baseRate: number
  limitFactor: number
  effectiveRate: number
  /**
   * The rate the underwriter is actually charged, after the excess deduction
   * and the cross-liability surcharge. Both are pure multipliers on the
   * premium, so they are exactly expressible in the rate.
   */
  chargedRate: number
  premium: number
  crossLiabilitySurcharge: number
  total: number
  /** Swiss Re per-category minimum premium — informational only, NEVER applied. */
  informationalMinPremiumRial: number
}

export interface AddOnsDetail {
  existingProperty: number
  airFreight: number
  storage: number
  transit: number
  debris: number
  /** Rial threshold above which debris clearance is rated at all. */
  debrisThresholdRial: number
  subtotal: number
}

export interface EarResult {
  rialPerCUnit: number
  deductible: DeductibleDetail
  /** Erection/testing months actually used after clamping to the Swiss Re caps. */
  effectiveErectionMonths: number
  effectiveTestingMonths: number
  rate: RateBuildUp
  earthquake: EarthquakeDetail
  addOns: AddOnsDetail
  tpl: TplDetail
  grossMDPremium: number
  grossPremium: number
  netToInsurer: number
  totalPayable: number
  validations: ValidationResult[]
  allValid: boolean
  warnings: EngineWarning[]
}
