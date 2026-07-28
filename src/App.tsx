import * as React from 'react'
import { Moon, Settings2, Sun } from 'lucide-react'
import {
  DEFAULT_CURRENCY,
  DEFAULT_INPUTS,
  EXISTING_PROPERTY_FA,
  calculate,
  citiesFor,
  existingPropertyOptions,
  findCity,
  industryGroups,
  machines,
  provinces,
  subGroupsFor,
  type CurrencySettings,
  type EarInputs,
  type EqSensitivityClass,
  type StructureClass,
} from '@/engine'
import {
  EQ_SENSITIVITY_FA,
  HAZARD_TONE,
  L,
  STRUCTURE_FA,
  TPL_CATEGORY_FA,
  TPL_SURROUNDINGS_FA,
} from '@/labels'
import { formatDecimal, formatMoney, formatRial } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Badge, Card, CardHeader } from '@/components/ui/misc'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChoiceField, NumberField, SelectField } from '@/components/Fields'
import { PremiumWaterfall, RateBuildUp } from '@/components/RateBreakdown'
import { ResultBar, ValidationPanel } from '@/components/Summary'

const YES_NO = [
  { value: 'Yes' as const, label: L.yes },
  { value: 'No' as const, label: L.no },
]

const grid = 'grid gap-x-5 gap-y-4 sm:grid-cols-2'

/**
 * Keep a selected value visible even when it falls outside the currently
 * filtered list, so a select can never render blank.
 */
function withCurrent(options: { value: string; label: string }[], current: string) {
  if (!current || options.some((o) => o.value === current)) return options
  return [{ value: current, label: current }, ...options]
}

export default function App() {
  const [dark, setDark] = React.useState(true)
  const [inputs, setInputs] = React.useState<EarInputs>(DEFAULT_INPUTS)
  const [currency, setCurrency] = React.useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [showSettings, setShowSettings] = React.useState(false)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const set = React.useCallback(<K extends keyof EarInputs>(key: K, value: EarInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const result = React.useMemo(() => calculate(inputs, currency), [inputs, currency])

  const isMachine = inputs.projectScope === 'INDIVIDUAL_MACHINES'
  const groupSubGroups = React.useMemo(
    () => subGroupsFor(inputs.industryGroup),
    [inputs.industryGroup],
  )
  const provinceCities = React.useMemo(() => citiesFor(inputs.province), [inputs.province])
  const selectedCity = findCity(inputs.province, inputs.city)

  // Cascading selects: keep the child valid when the parent changes.
  const changeIndustryGroup = (label: string) => {
    const next = subGroupsFor(label)
    setInputs((p) => ({
      ...p,
      industryGroup: label,
      subGroup: next[0]?.name ?? '',
    }))
  }
  const changeProvince = (province: string) => {
    const next = citiesFor(province)
    setInputs((p) => ({ ...p, province, city: next[0]?.city ?? '' }))
  }

  return (
    <div className="min-h-dvh bg-bg text-fg">
      {/* ---------------- header ---------------- */}
      {/* Solid rather than translucent+blur: these bars sit over scrolling
          content, where backdrop-filter repaints every frame. */}
      <header className="sticky top-0 z-40 border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-fg">{L.appName}</span>
              <Badge tone="accent">EAR</Badge>
            </div>
            <p className="field-help truncate">{L.appSubtitle}</p>
          </div>

          <div className="ms-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings((s) => !s)}
              aria-expanded={showSettings}
              aria-controls="currency-settings"
              aria-label={L.settings}
              title={L.settings}
            >
              <Settings2 aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDark((d) => !d)}
              aria-label={dark ? 'تغییر به پوستهٔ روشن' : 'تغییر به پوستهٔ تیره'}
              title={dark ? 'پوستهٔ روشن' : 'پوستهٔ تیره'}
            >
              {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
            </Button>
          </div>
        </div>

        {showSettings && (
          <div id="currency-settings" className="border-t rule-hair bg-surface-sunken">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
              <div className={grid}>
                <NumberField
                  id="nimaRate"
                  money
                  label={L.nimaRate}
                  help={L.nimaRateHelp}
                  value={currency.nimaRate}
                  onChange={(v) => setCurrency((c) => ({ ...c, nimaRate: v }))}
                />
                <NumberField
                  id="inflationFactor"
                  step={0.01}
                  label={L.inflationFactor}
                  help={L.inflationFactorHelp}
                  value={currency.inflationFactor}
                  onChange={(v) => setCurrency((c) => ({ ...c, inflationFactor: v }))}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="field-help">
                  {L.rialPerCUnit}{' '}
                  <span className="tabular font-medium text-fg">
                    {formatRial(result.rialPerCUnit)}
                  </span>
                </p>
                <Button variant="outline" size="sm" onClick={() => setCurrency(DEFAULT_CURRENCY)}>
                  {L.reset}
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ---------------- body ---------------- */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="sr-only">{L.appTitle}</h1>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* ------------- inputs ------------- */}
          <div className="space-y-4">
            {/* Section 1 */}
            <Card>
              <CardHeader title={L.sec1} />
              <div className="px-5 pb-5">
                <ChoiceField
                  id="projectScope"
                  className="mb-5"
                  label={L.projectScope}
                  help={L.projectScopeHelp}
                  value={inputs.projectScope}
                  onChange={(v) => set('projectScope', v)}
                  options={[
                    { value: 'ENTIRE_PROJECT', label: L.scopeEntire },
                    { value: 'INDIVIDUAL_MACHINES', label: L.scopeMachines },
                  ]}
                />

                <div className={grid}>
                  <SelectField
                    id="industryGroup"
                    className="sm:col-span-2"
                    ltrOptions
                    label={L.industryGroup}
                    help={L.industryGroupHelp}
                    value={inputs.industryGroup}
                    onChange={changeIndustryGroup}
                    options={industryGroups.map((g) => ({ value: g.label, label: g.label }))}
                  />

                  {!isMachine && (
                    <SelectField
                      id="subGroup"
                      className="sm:col-span-2"
                      ltrOptions
                      label={L.subGroup}
                      help={L.subGroupHelp}
                      value={inputs.subGroup}
                      onChange={(v) => set('subGroup', v)}
                      options={withCurrent(
                        groupSubGroups.map((s) => ({ value: s.name, label: s.name })),
                        inputs.subGroup,
                      )}
                    />
                  )}

                  {isMachine && (
                    <SelectField
                      id="machine"
                      className="sm:col-span-2"
                      ltrOptions
                      label={L.machine}
                      help={L.machineHelp}
                      value={inputs.machine}
                      onChange={(v) => set('machine', v)}
                      options={machines.map((m) => ({ value: m.key, label: m.key }))}
                    />
                  )}

                  {!isMachine ? (
                    <NumberField
                      id="durationMonths"
                      min={1}
                      max={120}
                      label={L.durationMonths}
                      help={L.durationMonthsHelp}
                      value={inputs.durationMonths}
                      onChange={(v) => set('durationMonths', v)}
                      error={
                        inputs.durationMonths < 1 || inputs.durationMonths > 120
                          ? 'مدت پروژه باید بین ۱ تا ۱۲۰ ماه باشد.'
                          : undefined
                      }
                    />
                  ) : (
                    <>
                      <NumberField
                        id="erectionMonths"
                        min={0}
                        max={9}
                        label={L.erectionMonths}
                        help={L.erectionMonthsHelp}
                        value={inputs.erectionMonths}
                        onChange={(v) => set('erectionMonths', v)}
                        error={
                          inputs.erectionMonths > 9
                            ? 'بیش از سقف ۹ ماه — برای محاسبه به ۹ ماه محدود شد.'
                            : undefined
                        }
                      />
                      <NumberField
                        id="testingMonths"
                        min={0}
                        max={3}
                        label={L.testingMonths}
                        help={L.testingMonthsHelp}
                        value={inputs.testingMonths}
                        onChange={(v) => set('testingMonths', v)}
                        error={
                          inputs.testingMonths > 3
                            ? 'بیش از سقف ۳ ماه — برای محاسبه به ۳ ماه محدود شد.'
                            : undefined
                        }
                      />
                    </>
                  )}

                  <SelectField
                    id="province"
                    label={L.province}
                    help={L.provinceHelp}
                    value={inputs.province}
                    onChange={changeProvince}
                    options={provinces.map((p) => ({ value: p, label: p }))}
                  />
                  <SelectField
                    id="city"
                    label={L.city}
                    value={inputs.city}
                    onChange={(v) => set('city', v)}
                    options={withCurrent(
                      provinceCities.map((c) => ({ value: c.city, label: c.city })),
                      inputs.city,
                    )}
                    help={
                      selectedCity ? (
                        <span className="inline-flex items-center gap-1.5">
                          سطح خطر زلزله:
                          <Badge tone={HAZARD_TONE[selectedCity.hazard] ?? 'neutral'}>
                            {selectedCity.hazard}
                          </Badge>
                          <span>· پهنهٔ {result.earthquake.zone}</span>
                        </span>
                      ) : (
                        L.cityHelp
                      )
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Section 2 */}
            <Card>
              <CardHeader title={L.sec2} />
              <div className={`${grid} px-5 pb-5`}>
                <NumberField
                  id="sumInsured"
                  money
                  label={L.sumInsured}
                  help={L.sumInsuredHelp}
                  value={inputs.sumInsured}
                  onChange={(v) => set('sumInsured', v)}
                  error={inputs.sumInsured <= 0 ? 'مبلغ بیمه باید بزرگ‌تر از صفر باشد.' : undefined}
                />
                <NumberField
                  id="tplLimit"
                  money
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.tplLimit}
                  help={
                    inputs.tplIncluded === 'No'
                      ? 'پوشش TPL انتخاب نشده است.'
                      : `${L.tplLimitHelp} · ضریب فعلی: ${formatDecimal(result.tpl.limitFactor)}`
                  }
                  value={inputs.tplLimit}
                  onChange={(v) => set('tplLimit', v)}
                />
              </div>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardHeader title={L.sec3} description={L.sec3Hint} />
              <div className={`${grid} px-5 pb-5`}>
                <ChoiceField
                  id="tplIncluded"
                  label={L.tplIncluded}
                  help={L.tplIncludedHelp}
                  value={inputs.tplIncluded}
                  onChange={(v) => set('tplIncluded', v)}
                  options={YES_NO}
                />
                {!isMachine ? (
                  <ChoiceField
                    id="hotTestingIncluded"
                    label={L.hotTestingIncluded}
                    help={L.hotTestingIncludedHelp}
                    value={inputs.hotTestingIncluded}
                    onChange={(v) => set('hotTestingIncluded', v)}
                    options={YES_NO}
                  />
                ) : (
                  <div />
                )}

                <ChoiceField
                  id="maintenanceClass"
                  label={L.maintenanceClass}
                  help={L.maintenanceClassHelp}
                  value={inputs.maintenanceClass}
                  onChange={(v) => set('maintenanceClass', v)}
                  options={[
                    { value: 'Light', label: L.light },
                    { value: 'Heavy', label: L.heavy },
                  ]}
                />
                <div />

                <NumberField
                  id="visitsMaintenanceMonths"
                  min={0}
                  label={L.visitsMaintenanceMonths}
                  help={L.zeroMeansNone}
                  value={inputs.visitsMaintenanceMonths}
                  onChange={(v) => set('visitsMaintenanceMonths', v)}
                />
                <NumberField
                  id="extendedMaintenanceMonths"
                  min={0}
                  label={L.extendedMaintenanceMonths}
                  help={L.zeroMeansNone}
                  value={inputs.extendedMaintenanceMonths}
                  onChange={(v) => set('extendedMaintenanceMonths', v)}
                />

                <SelectField
                  id="eqSensitivityClass"
                  label={L.eqSensitivityClass}
                  help={L.eqSensitivityClassHelp}
                  value={String(inputs.eqSensitivityClass)}
                  onChange={(v) => set('eqSensitivityClass', Number(v) as EqSensitivityClass)}
                  options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: EQ_SENSITIVITY_FA[n] }))}
                />
                <SelectField
                  id="structureClass"
                  label={L.structureClass}
                  help={L.structureClassHelp}
                  value={String(inputs.structureClass)}
                  onChange={(v) => set('structureClass', Number(v) as StructureClass)}
                  options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: STRUCTURE_FA[n] }))}
                />

                <SelectField
                  id="tplCategory"
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.tplCategory}
                  help={L.tplCategoryHelp}
                  value={inputs.tplCategory}
                  onChange={(v) => set('tplCategory', v as EarInputs['tplCategory'])}
                  options={['I', 'II', 'III'].map((c) => ({ value: c, label: TPL_CATEGORY_FA[c] }))}
                />
                <SelectField
                  id="tplSurroundings"
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.tplSurroundings}
                  help={L.tplSurroundingsHelp}
                  value={inputs.tplSurroundings}
                  onChange={(v) => set('tplSurroundings', v as EarInputs['tplSurroundings'])}
                  options={['a', 'b', 'c'].map((s) => ({ value: s, label: TPL_SURROUNDINGS_FA[s] }))}
                />

                <ChoiceField
                  id="crossLiability"
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.crossLiability}
                  help={L.crossLiabilityHelp}
                  value={inputs.crossLiability}
                  onChange={(v) => set('crossLiability', v)}
                  options={YES_NO}
                />
                <ChoiceField
                  id="earthquakeExclusion"
                  label={L.earthquakeExclusion}
                  help={L.earthquakeExclusionHelp}
                  value={inputs.earthquakeExclusion}
                  onChange={(v) => set('earthquakeExclusion', v)}
                  options={YES_NO}
                />
              </div>
            </Card>

            {/* Section 6 — machine scope only */}
            {isMachine && (
              <Card>
                <CardHeader title={L.sec6} />
                <div className="px-5 pb-5">
                  <ChoiceField
                    id="natureRiskLoadingForMachine"
                    label={L.natureRiskForMachine}
                    help={L.natureRiskForMachineHelp}
                    value={inputs.natureRiskLoadingForMachine}
                    onChange={(v) => set('natureRiskLoadingForMachine', v)}
                    options={YES_NO}
                  />
                </div>
              </Card>
            )}

            {/* Sections 4 & 5 — progressive disclosure */}
            <Accordion type="multiple" className="space-y-4">
              <AccordionItem value="supplementary">
                <AccordionTrigger hint={L.sec4Hint}>{L.sec4}</AccordionTrigger>
                <AccordionContent>
                  <div className={grid}>
                    <NumberField
                      id="mrMaterial"
                      min={0}
                      label={L.mrMaterial}
                      help={L.mrHelp}
                      value={inputs.manufacturerRiskMaterialMonths}
                      onChange={(v) => set('manufacturerRiskMaterialMonths', v)}
                    />
                    <NumberField
                      id="mrDesign"
                      min={0}
                      label={L.mrDesign}
                      help={L.mrHelp}
                      value={inputs.manufacturerRiskDesignMonths}
                      onChange={(v) => set('manufacturerRiskDesignMonths', v)}
                    />
                    <NumberField
                      id="expediting"
                      step={0.005}
                      min={0}
                      label={L.expediting}
                      help={L.expeditingHelp}
                      value={inputs.expeditingCostsPct}
                      onChange={(v) => set('expeditingCostsPct', v)}
                    />
                    <div />
                    <NumberField
                      id="riotStrikeRate"
                      step={0.05}
                      min={0}
                      label={L.riotStrikeRate}
                      help={L.riotStrikeRateHelp}
                      value={inputs.riotStrikeRate}
                      onChange={(v) => set('riotStrikeRate', v)}
                    />
                    <ChoiceField
                      id="riotStrikePeriodBasis"
                      label={L.riotStrikeBasis}
                      help={L.riotStrikeBasisHelp}
                      value={inputs.riotStrikePeriodBasis}
                      onChange={(v) => set('riotStrikePeriodBasis', v)}
                      options={[
                        { value: 'Erection period' as const, label: L.riotErection },
                        {
                          value: 'Testing/Commissioning period' as const,
                          label: L.riotTesting,
                        },
                      ]}
                    />
                    <NumberField
                      id="airFreightLimit"
                      money
                      min={0}
                      label={L.airFreightLimit}
                      help={L.zeroMeansNone}
                      value={inputs.airFreightLimit}
                      onChange={(v) => set('airFreightLimit', v)}
                    />
                    <NumberField
                      id="airFreightRate"
                      step={0.5}
                      min={0}
                      label={L.airFreightRate}
                      help={L.airFreightRateHelp}
                      value={inputs.airFreightRate}
                      onChange={(v) => set('airFreightRate', v)}
                    />
                    <NumberField
                      id="storageValue"
                      money
                      min={0}
                      label={L.storageValue}
                      help={L.storageHelp}
                      value={inputs.storageValue}
                      onChange={(v) => set('storageValue', v)}
                    />
                    <NumberField
                      id="storageMonths"
                      min={0}
                      label={L.storageMonths}
                      help={L.zeroMeansNone}
                      value={inputs.storageMonths}
                      onChange={(v) => set('storageMonths', v)}
                    />
                    <NumberField
                      id="transitValue"
                      money
                      min={0}
                      label={L.transitValue}
                      help={L.transitValueHelp}
                      value={inputs.transitValue}
                      onChange={(v) => set('transitValue', v)}
                    />
                    <NumberField
                      id="debrisLimit"
                      money
                      min={0}
                      label={L.debrisLimit}
                      help={`${L.debrisLimitHelp} · آستانه: ${formatMoney(result.addOns.debrisThresholdRial)} ﷼`}
                      value={inputs.debrisLimit}
                      onChange={(v) => set('debrisLimit', v)}
                    />
                    <SelectField
                      id="existingProperty"
                      label={L.existingProperty}
                      help={L.existingPropertyHelp}
                      value={inputs.existingProperty}
                      onChange={(v) => set('existingProperty', v)}
                      options={existingPropertyOptions.map((o) => ({
                        value: o.option,
                        label: EXISTING_PROPERTY_FA[o.option] ?? o.option,
                      }))}
                    />
                    <NumberField
                      id="existingPropertyLimit"
                      money
                      min={0}
                      label={L.existingPropertyLimit}
                      help={L.zeroMeansNone}
                      value={inputs.existingPropertyLimit}
                      onChange={(v) => set('existingPropertyLimit', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="commercial">
                <AccordionTrigger hint="تعدیل نرخ‌گذار، کارمزد و مالیات">{L.sec5}</AccordionTrigger>
                <AccordionContent>
                  <div className={grid}>
                    <NumberField
                      id="underwritingAdjustment"
                      step={0.05}
                      label={L.underwritingAdjustment}
                      help={L.underwritingAdjustmentHelp}
                      value={inputs.underwritingAdjustment}
                      onChange={(v) => set('underwritingAdjustment', v)}
                    />
                    <div />
                    <NumberField
                      id="brokerage"
                      step={0.01}
                      min={0}
                      label={L.brokerage}
                      help={L.brokerageHelp}
                      value={inputs.brokerage}
                      onChange={(v) => set('brokerage', v)}
                    />
                    <NumberField
                      id="insuranceTax"
                      step={0.01}
                      min={0}
                      label={L.insuranceTax}
                      help={L.insuranceTaxHelp}
                      value={inputs.insuranceTax}
                      onChange={(v) => set('insuranceTax', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* ------------- breakdown ------------- */}
          <aside className="space-y-4 lg:sticky lg:top-[4.75rem] lg:self-start">
            <Card>
              <CardHeader title={L.breakdownTitle} description={L.breakdownSubtitle} />
              <div className="px-5 pb-5">
                <h3 className="mb-3 text-xs font-semibold text-fg-subtle">
                  {L.rateBuildUp}
                </h3>
                <RateBuildUp result={result} inputs={inputs} />
              </div>
              <div className="border-t rule-hair px-5 py-5">
                <h3 className="mb-3 text-xs font-semibold text-fg-subtle">
                  {L.premiumWaterfall}
                </h3>
                <PremiumWaterfall result={result} inputs={inputs} />
              </div>
            </Card>

            <Card>
              <CardHeader title={L.validationTitle} />
              <div className="px-5 pb-5">
                <ValidationPanel result={result} />
              </div>
            </Card>
          </aside>
        </div>
      </main>

      <ResultBar result={result} />
    </div>
  )
}
