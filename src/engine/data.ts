/**
 * Typed, normalized access to the rate tables in `rate-data/`.
 *
 * The JSON was extracted and verified from `EAR_Rating_v18.xlsx`. Nothing here
 * changes a rate — this module only indexes the tables and repairs the two
 * naming defects documented below.
 */

import currencyJson from '@rate-data/currency.json'
import earthquakeJson from '@rate-data/earthquake.json'
import existingPropertyJson from '@rate-data/existing_property.json'
import industryGroupsJson from '@rate-data/industry_groups.json'
import machinesJson from '@rate-data/machines.json'
import subgroupsJson from '@rate-data/subgroups.json'
import citiesJson from '@rate-data/cities_2800.json'
import tplJson from '@rate-data/tpl.json'

import type {
  CurrencySettings,
  Hazard2800,
  SwissReZone,
  TplCategory,
  TplSurroundings,
} from './types'

// ---------------------------------------------------------------------------
// Sub-groups (white tables)
// ---------------------------------------------------------------------------

export interface SubGroupRow {
  name: string
  /** First-month rate (‰). */
  base: number
  /** Per-month increment, months 2–12. */
  m2_12: number
  /** Per-month increment, months 13–24. */
  m13_24: number
  /** Per-month increment, months 25+. */
  m25plus: number
  /** Hot testing / commissioning rate (‰). */
  hotTest: number
  /** Reference rate (‰) — basis for the MR and maintenance loadings. */
  refRate: number
  /** Minimum-rate floor (‰). */
  minRate: number
  genExcessCU: number | string
  aogExcessCU: number | string
}

export const subGroups: SubGroupRow[] = subgroupsJson as SubGroupRow[]

const subGroupByName = new Map(subGroups.map((s) => [s.name, s]))

export function findSubGroup(name: string): SubGroupRow | undefined {
  return subGroupByName.get(name)
}

// ---------------------------------------------------------------------------
// Individual machines (blue tables)
// ---------------------------------------------------------------------------

export interface MachineRow {
  /** EAR code + description. Unique across all 108 rows — the only safe key. */
  key: string
  /** Basic rate (‰): covers 3 months erection + 1 month testing. */
  basic: number
  /** Additional rate (‰) per erection month beyond 3. */
  addErect: number
  /** Additional rate (‰) per testing month beyond 1. */
  addTest: number
  refRate: number
}

export const machines: MachineRow[] = machinesJson as MachineRow[]

const machineByKey = new Map(machines.map((m) => [m.key, m]))

/**
 * Machines MUST be matched on `key`, never on the description alone: 14 rows
 * share the description "Other individual machines, not specified elsewhere",
 * and description matching silently returns the first (wrong) industry's rate.
 */
export function findMachine(key: string): MachineRow | undefined {
  return machineByKey.get(key)
}

// ---------------------------------------------------------------------------
// Industry groups → sub-groups
// ---------------------------------------------------------------------------

const rawIndustryGroups = industryGroupsJson as Record<string, string[]>

/**
 * The JSON keys are Excel defined-name codes (`EAR_05___Metal_Industry`) whose
 * encoding is lossy — `___` stands for both ` — ` and ` & `, and `_` for spaces
 * and for stripped parentheses. Reversing it by string substitution produces
 * wrong labels, so the 19 display names are mapped explicitly.
 */
const INDUSTRY_GROUP_LABELS: Record<string, string> = {
  EAR_01___Public_Utilities: '01 — Public Utilities',
  EAR_02___Industrial_Plant_Utilities: '02 — Industrial Plant Utilities',
  EAR_03___Mining_Industry: '03 — Mining Industry',
  EAR_04___Chemical_Industry: '04 — Chemical Industry',
  EAR_05___Metal_Industry: '05 — Metal Industry',
  EAR_06___Building_Industry: '06 — Building Industry',
  EAR_07___Timber___Wood: '07 — Timber & Wood',
  EAR_08___Pulp___Paper: '08 — Pulp & Paper',
  EAR_09___Printing___Packing: '09 — Printing & Packing',
  EAR_10___Leather_Industry: '10 — Leather Industry',
  EAR_11___Textile_Industry: '11 — Textile Industry',
  EAR_12___Plastic___Rubber: '12 — Plastic & Rubber',
  EAR_13___Food__Vegetable_: '13 — Food (Vegetable)',
  EAR_14___Food__Animal_: '14 — Food (Animal)',
  EAR_15___Food_Refrigeration: '15 — Food Refrigeration',
  EAR_16___Transport___Warehouses: '16 — Transport & Warehouses',
  EAR_17___Public_Services: '17 — Public Services',
  EAR_18___Hospitals___Hotels: '18 — Hospitals & Hotels',
  EAR_19___Farming___Agriculture: '19 — Farming & Agriculture',
}

/** Persian gloss for the 19 groups. Labels only — never used as a lookup key. */
const INDUSTRY_GROUP_FA: Record<string, string> = {
  EAR_01___Public_Utilities: 'تأسیسات زیربنایی و خدمات عمومی',
  EAR_02___Industrial_Plant_Utilities: 'تأسیسات جانبی کارخانه‌ها',
  EAR_03___Mining_Industry: 'صنعت معدن',
  EAR_04___Chemical_Industry: 'صنایع شیمیایی',
  EAR_05___Metal_Industry: 'صنایع فلزی',
  EAR_06___Building_Industry: 'صنعت ساختمان',
  EAR_07___Timber___Wood: 'چوب و صنایع چوبی',
  EAR_08___Pulp___Paper: 'خمیر کاغذ و کاغذ',
  EAR_09___Printing___Packing: 'چاپ و بسته‌بندی',
  EAR_10___Leather_Industry: 'صنعت چرم',
  EAR_11___Textile_Industry: 'صنعت نساجی',
  EAR_12___Plastic___Rubber: 'پلاستیک و لاستیک',
  EAR_13___Food__Vegetable_: 'صنایع غذایی (گیاهی)',
  EAR_14___Food__Animal_: 'صنایع غذایی (دامی)',
  EAR_15___Food_Refrigeration: 'سردخانه و صنایع برودتی',
  EAR_16___Transport___Warehouses: 'حمل‌ونقل و انبارها',
  EAR_17___Public_Services: 'خدمات عمومی',
  EAR_18___Hospitals___Hotels: 'بیمارستان‌ها و هتل‌ها',
  EAR_19___Farming___Agriculture: 'کشاورزی و دامپروری',
}

export interface IndustryGroup {
  /** Excel defined-name code — stable internal id. */
  code: string
  /** English EAR label, e.g. `05 — Metal Industry`. */
  label: string
  /** Persian gloss. */
  labelFa: string
  /** Sub-group names belonging to this group. */
  subGroups: string[]
}

export const industryGroups: IndustryGroup[] = Object.keys(rawIndustryGroups)
  .sort()
  .map((code) => ({
    code,
    label: INDUSTRY_GROUP_LABELS[code] ?? code,
    labelFa: INDUSTRY_GROUP_FA[code] ?? '',
    subGroups: rawIndustryGroups[code],
  }))

const industryGroupByLabel = new Map(industryGroups.map((g) => [g.label, g]))

export function findIndustryGroup(label: string): IndustryGroup | undefined {
  return industryGroupByLabel.get(label)
}

export function subGroupsFor(industryGroupLabel: string): SubGroupRow[] {
  const group = findIndustryGroup(industryGroupLabel)
  if (!group) return []
  return group.subGroups
    .map((name) => subGroupByName.get(name))
    .filter((s): s is SubGroupRow => s !== undefined)
}

// ---------------------------------------------------------------------------
// Cities — Iranian Standard 2800, 4th ed. (1393), Appendix 1
// ---------------------------------------------------------------------------

interface RawCityRow {
  key: string
  /** MISLABELLED IN SOURCE: holds the CITY name. */
  province: string
  /** MISLABELLED IN SOURCE: holds the PROVINCE name. */
  city: string
  hazard: Hazard2800
}

export interface CityRow {
  /** `<city> — <province>`, matching the workbook's `C8 & " — " & C7` key. */
  key: string
  city: string
  province: string
  hazard: Hazard2800
}

/**
 * `cities_2800.json` has its `province` and `city` field names transposed: the
 * field called `province` holds the city and vice versa. Verified against the
 * workbook, whose lookup key is `City & " — " & Province` and whose rows match
 * this file's `key` exactly. Normalized here rather than edited in the data
 * file, so `rate-data/` stays a byte-faithful copy of the verified extract.
 */
export const cities: CityRow[] = (citiesJson as RawCityRow[]).map((row) => ({
  key: row.key,
  city: row.province,
  province: row.city,
  hazard: row.hazard,
}))

export const provinces: string[] = [...new Set(cities.map((c) => c.province))].sort((a, b) =>
  a.localeCompare(b, 'fa'),
)

export function citiesFor(province: string): CityRow[] {
  return cities
    .filter((c) => c.province === province)
    .sort((a, b) => a.city.localeCompare(b.city, 'fa'))
}

export function findCity(province: string, city: string): CityRow | undefined {
  return cities.find((c) => c.province === province && c.city === city)
}

// ---------------------------------------------------------------------------
// Earthquake
// ---------------------------------------------------------------------------

interface EarthquakeData {
  E1: { class: number; desc: string; factor: number }[]
  E2: { class: number; frame: string; wall: string; factor: number }[]
  zoneMap: { hazard2800: Hazard2800; zone: SwissReZone; A: number }[]
  tableE_monthlyRate: { EFactor: number; zones: Record<SwissReZone, number> }[]
}

export const earthquake = earthquakeJson as EarthquakeData

/** The tabulated E values. Non-tabulated E is rounded UP to the next one. */
export const E_LADDER: number[] = earthquake.tableE_monthlyRate.map((r) => r.EFactor)

export function e1Factor(sensitivityClass: number): number {
  return earthquake.E1.find((r) => r.class === sensitivityClass)?.factor ?? 0
}

export function e2Factor(structureClass: number): number {
  return earthquake.E2.find((r) => r.class === structureClass)?.factor ?? 0
}

export function zoneForHazard(hazard: Hazard2800 | null | undefined): SwissReZone | null {
  if (!hazard) return null
  return earthquake.zoneMap.find((r) => r.hazard2800 === hazard)?.zone ?? null
}

export function monthlyEqRate(eRounded: number, zone: SwissReZone | null): number {
  if (!zone) return 0
  return earthquake.tableE_monthlyRate.find((r) => r.EFactor === eRounded)?.zones[zone] ?? 0
}

// ---------------------------------------------------------------------------
// Existing property
// ---------------------------------------------------------------------------

export interface ExistingPropertyOption {
  option: string
  ratePerMille: number
}

export const existingPropertyOptions: ExistingPropertyOption[] =
  existingPropertyJson as ExistingPropertyOption[]

export function existingPropertyRate(option: string): number {
  return existingPropertyOptions.find((o) => o.option === option)?.ratePerMille ?? 0
}

/** Persian labels for the three options. */
export const EXISTING_PROPERTY_FA: Record<string, string> = {
  'Yes — Existing property, WITH explosion risk': 'بله — اموال مجاور، با خطر انفجار',
  'Yes — Existing property, WITHOUT explosion risk': 'بله — اموال مجاور، بدون خطر انفجار',
  'Not included — existing property not covered': 'ندارد — اموال مجاور تحت پوشش نیست',
}

// ---------------------------------------------------------------------------
// TPL
// ---------------------------------------------------------------------------

interface TplData {
  baseRates: Record<TplCategory, Record<TplSurroundings, number>>
  /** Swiss Re per-category minimum premiums (c-units). Reference only. */
  minPremiumCU: Record<TplCategory, Record<TplSurroundings, number>>
  limitFactors: { thresholdCU: number; factor: number }[]
}

export const tpl = tplJson as TplData

// ---------------------------------------------------------------------------
// Currency
// ---------------------------------------------------------------------------

interface CurrencyData {
  nimaRate: number
  inflationFactor: number
  thresholdsCU: {
    debrisClearance: number
    mdMinPremiumFallback: number
    tplBands: number[]
  }
}

export const currency = currencyJson as CurrencyData

export const DEFAULT_CURRENCY: CurrencySettings = {
  nimaRate: currency.nimaRate,
  inflationFactor: currency.inflationFactor,
}

export const DEBRIS_THRESHOLD_CU = currency.thresholdsCU.debrisClearance
