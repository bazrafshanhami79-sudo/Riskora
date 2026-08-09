import * as React from 'react'
import { Settings2 } from 'lucide-react'
import {
  DEFAULT_CURRENCY,
  DEFAULT_EXCESS_CALIBRATION,
  DEFAULT_INPUTS,
  EXISTING_PROPERTY_FA,
  calculate,
  citiesFor,
  existingPropertyOptions,
  industryGroups,
  machines,
  provinces,
  subGroupsFor,
  type CurrencySettings,
  type DeductiblePercent,
  type EarInputs,
  type ExcessCalibration,
  type TplExcessPerMille,
  type EqSensitivityClass,
  type StructureClass,
} from '@/engine'
import {
  EQ_SENSITIVITY_FA,
  L,
  STRUCTURE_FA,
  TPL_CATEGORY_FA,
  TPL_SURROUNDINGS_FA,
} from '@/labels'
import { formatInt, formatRial } from '@/lib/format'
import { machineLabel, subGroupLabel, withCode } from '@/classifications'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/misc'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ChoiceField, NumberField, SelectField } from '@/components/Fields'
import { Disclaimer } from '@/components/Disclaimer'
import { AppHeader } from '@/components/AppHeader'
import { RatePanel } from '@/components/RatePanel'
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
  return [{ value: current, label: subGroupLabel(current) }, ...options]
}

export function EarRating({ onHome }: { onHome: () => void }) {
  const [inputs, setInputs] = React.useState<EarInputs>(DEFAULT_INPUTS)
  const [currency, setCurrency] = React.useState<CurrencySettings>(DEFAULT_CURRENCY)
  const [calibration, setCalibration] = React.useState<ExcessCalibration>(
    DEFAULT_EXCESS_CALIBRATION,
  )
  const [showSettings, setShowSettings] = React.useState(false)

  const set = React.useCallback(<K extends keyof EarInputs>(key: K, value: EarInputs[K]) => {
    setInputs((prev) => ({ ...prev, [key]: value }))
  }, [])

  const result = React.useMemo(
    () => calculate(inputs, currency, calibration),
    [inputs, currency, calibration],
  )

  const isMachine = inputs.projectScope === 'INDIVIDUAL_MACHINES'
  const groupSubGroups = React.useMemo(
    () => subGroupsFor(inputs.industryGroup),
    [inputs.industryGroup],
  )
  const provinceCities = React.useMemo(() => citiesFor(inputs.province), [inputs.province])

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
    <div className="relative min-h-dvh text-foreground">
      <AppHeader
        onHome={onHome}
        eyebrow="EAR"
        actions={
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
        }
        panel={
          showSettings ? (
            <div id="currency-settings" className="border-t rule-hair bg-background">
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                <div className={grid}>
                  <NumberField
                    id="nimaRate"
                    money
                    label={L.nimaRate}
                    value={currency.nimaRate}
                    onChange={(v) => setCurrency((c) => ({ ...c, nimaRate: v }))}
                  />
                  <NumberField
                    id="inflationFactor"
                    step={0.01}
                    label={L.inflationFactor}
                    value={currency.inflationFactor}
                    onChange={(v) => setCurrency((c) => ({ ...c, inflationFactor: v }))}
                  />
                </div>
                <div className={`${grid} mt-4`}>
                  <NumberField
                    id="excessCalibration"
                    money
                    label={L.excessCalibration}
                    value={calibration.localMinimumIRR}
                    onChange={(v) => setCalibration((c) => ({ ...c, localMinimumIRR: v }))}
                  />
                  <NumberField
                    id="excessCalibrationRef"
                    label={L.excessCalibrationRef}
                    value={calibration.referenceItemCU}
                    onChange={(v) => setCalibration((c) => ({ ...c, referenceItemCU: v }))}
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="field-help">
                    {L.rialPerCUnit}{' '}
                    <span className="tabular font-medium text-foreground">
                      {formatRial(result.rialPerCUnit)}
                    </span>
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setCurrency(DEFAULT_CURRENCY)}>
                    {L.reset}
                  </Button>
                </div>
              </div>
            </div>
          ) : null
        }
      />

      {/* ---------------- body ---------------- */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <h1 className="sr-only">{L.appTitle}</h1>

        <Disclaimer />

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
                    label={L.industryGroup}
                    value={inputs.industryGroup}
                    onChange={changeIndustryGroup}
                    options={industryGroups.map((g) => ({
                      value: g.label,
                      // The English label stays the value — it is the key that
                      // filters the sub-group list. Only the display changes.
                      label: withCode(g.label.split(' — ')[0], g.labelFa || g.label),
                    }))}
                  />

                  {!isMachine && (
                    <SelectField
                      id="subGroup"
                      className="sm:col-span-2"
                      label={L.subGroup}
                      value={inputs.subGroup}
                      onChange={(v) => set('subGroup', v)}
                      options={withCurrent(
                        groupSubGroups.map((s) => ({
                          value: s.name,
                          label: subGroupLabel(s.name),
                        })),
                        inputs.subGroup,
                      )}
                    />
                  )}

                  {isMachine && (
                    <SelectField
                      id="machine"
                      className="sm:col-span-2"
                      label={L.machine}
                      value={inputs.machine}
                      onChange={(v) => set('machine', v)}
                      options={machines.map((m) => ({
                        value: m.key,
                        label: machineLabel(m.key),
                      }))}
                    />
                  )}

                  {!isMachine ? (
                    <NumberField
                      id="durationMonths"
                      min={1}
                      max={120}
                      label={L.durationMonths}
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
                  value={inputs.sumInsured}
                  onChange={(v) => set('sumInsured', v)}
                  error={inputs.sumInsured <= 0 ? 'مبلغ بیمه باید بزرگ‌تر از صفر باشد.' : undefined}
                />
                <NumberField
                  id="tplLimit"
                  money
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.tplLimit}
                  value={inputs.tplLimit}
                  onChange={(v) => set('tplLimit', v)}
                />
              </div>
            </Card>

            {/* Section 3 */}
            <Card>
              <CardHeader title={L.sec3} />
              <div className={`${grid} px-5 pb-5`}>
                <ChoiceField
                  id="tplIncluded"
                  label={L.tplIncluded}
                  value={inputs.tplIncluded}
                  onChange={(v) => set('tplIncluded', v)}
                  options={YES_NO}
                />
                {!isMachine ? (
                  <ChoiceField
                    id="hotTestingIncluded"
                    label={L.hotTestingIncluded}
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
                  value={inputs.visitsMaintenanceMonths}
                  onChange={(v) => set('visitsMaintenanceMonths', v)}
                />
                <NumberField
                  id="extendedMaintenanceMonths"
                  min={0}
                  label={L.extendedMaintenanceMonths}
                  value={inputs.extendedMaintenanceMonths}
                  onChange={(v) => set('extendedMaintenanceMonths', v)}
                />

                <SelectField
                  id="eqSensitivityClass"
                  label={L.eqSensitivityClass}
                  value={String(inputs.eqSensitivityClass)}
                  onChange={(v) => set('eqSensitivityClass', Number(v) as EqSensitivityClass)}
                  options={[1, 2, 3, 4].map((n) => ({ value: String(n), label: EQ_SENSITIVITY_FA[n] }))}
                />
                <SelectField
                  id="structureClass"
                  label={L.structureClass}
                  value={String(inputs.structureClass)}
                  onChange={(v) => set('structureClass', Number(v) as StructureClass)}
                  options={[1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: STRUCTURE_FA[n] }))}
                />

                <SelectField
                  id="tplCategory"
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.tplCategory}
                  value={inputs.tplCategory}
                  onChange={(v) => set('tplCategory', v as EarInputs['tplCategory'])}
                  options={['I', 'II', 'III'].map((c) => ({ value: c, label: TPL_CATEGORY_FA[c] }))}
                />
                <SelectField
                  id="tplSurroundings"
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.tplSurroundings}
                  value={inputs.tplSurroundings}
                  onChange={(v) => set('tplSurroundings', v as EarInputs['tplSurroundings'])}
                  options={['a', 'b', 'c'].map((s) => ({ value: s, label: TPL_SURROUNDINGS_FA[s] }))}
                />

                <ChoiceField
                  id="crossLiability"
                  disabled={inputs.tplIncluded === 'No'}
                  label={L.crossLiability}
                  value={inputs.crossLiability}
                  onChange={(v) => set('crossLiability', v)}
                  options={YES_NO}
                />
                <ChoiceField
                  id="earthquakeExclusion"
                  label={L.earthquakeExclusion}
                  value={inputs.earthquakeExclusion}
                  onChange={(v) => set('earthquakeExclusion', v)}
                  options={YES_NO}
                />
              </div>
            </Card>

            {/* Section 7 — deductible */}
            <Card>
              <CardHeader title={L.sec7} />
              <div className={`${grid} px-5 pb-5`}>
                <ChoiceField
                  id="deductibleStructure"
                  className="sm:col-span-2"
                  label={L.deductibleStructure}
                  value={inputs.deductibleStructure}
                  onChange={(v) => set('deductibleStructure', v)}
                  options={[
                    { value: 'PERCENT_WITH_MIN' as const, label: L.structPercentWithMin },
                    { value: 'AMOUNT_ONLY' as const, label: L.structAmountOnly },
                  ]}
                />
                <NumberField
                  id="deductibleMinAmount"
                  money
                  min={0}
                  label={L.deductibleMinAmount}
                  value={inputs.deductibleMinAmount}
                  onChange={(v) => set('deductibleMinAmount', v)}
                />
                <SelectField
                  id="deductiblePercent"
                  disabled={inputs.deductibleStructure !== 'PERCENT_WITH_MIN'}
                  label={L.deductiblePercent}
                  value={String(inputs.deductiblePercent)}
                  onChange={(v) => set('deductiblePercent', Number(v) as DeductiblePercent)}
                  options={[0, 10, 20].map((n) => ({
                    value: String(n),
                    label: `${formatInt(n)}٪`,
                  }))}
                />
                <SelectField
                  id="tplExcessPerMille"
                  disabled={inputs.tplIncluded === 'No'}
                  className="sm:col-span-2"
                  label={L.tplExcessPerMille}
                  value={String(inputs.tplExcessPerMille)}
                  onChange={(v) => set('tplExcessPerMille', Number(v) as TplExcessPerMille)}
                  options={[1, 2, 3, 5].map((n) => ({
                    value: String(n),
                    label: `${formatInt(n)}‰`,
                  }))}
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
                <AccordionTrigger>{L.sec4}</AccordionTrigger>
                <AccordionContent>
                  <div className={grid}>
                    <NumberField
                      id="mrMaterial"
                      min={0}
                      label={L.mrMaterial}
                      value={inputs.manufacturerRiskMaterialMonths}
                      onChange={(v) => set('manufacturerRiskMaterialMonths', v)}
                    />
                    <NumberField
                      id="mrDesign"
                      min={0}
                      label={L.mrDesign}
                      value={inputs.manufacturerRiskDesignMonths}
                      onChange={(v) => set('manufacturerRiskDesignMonths', v)}
                    />
                    <NumberField
                      id="expediting"
                      step={0.005}
                      min={0}
                      label={L.expediting}
                      value={inputs.expeditingCostsPct}
                      onChange={(v) => set('expeditingCostsPct', v)}
                    />
                    <div />
                    <NumberField
                      id="riotStrikeRate"
                      step={0.05}
                      min={0}
                      label={L.riotStrikeRate}
                      value={inputs.riotStrikeRate}
                      onChange={(v) => set('riotStrikeRate', v)}
                    />
                    <ChoiceField
                      id="riotStrikePeriodBasis"
                      label={L.riotStrikeBasis}
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
                      value={inputs.airFreightLimit}
                      onChange={(v) => set('airFreightLimit', v)}
                    />
                    <NumberField
                      id="airFreightRate"
                      step={0.5}
                      min={0}
                      label={L.airFreightRate}
                      value={inputs.airFreightRate}
                      onChange={(v) => set('airFreightRate', v)}
                    />
                    <NumberField
                      id="storageValue"
                      money
                      min={0}
                      label={L.storageValue}
                      value={inputs.storageValue}
                      onChange={(v) => set('storageValue', v)}
                    />
                    <NumberField
                      id="storageMonths"
                      min={0}
                      label={L.storageMonths}
                      value={inputs.storageMonths}
                      onChange={(v) => set('storageMonths', v)}
                    />
                    <NumberField
                      id="transitValue"
                      money
                      min={0}
                      label={L.transitValue}
                      value={inputs.transitValue}
                      onChange={(v) => set('transitValue', v)}
                    />
                    <NumberField
                      id="debrisLimit"
                      money
                      min={0}
                      label={L.debrisLimit}
                      value={inputs.debrisLimit}
                      onChange={(v) => set('debrisLimit', v)}
                    />
                    <SelectField
                      id="existingProperty"
                      label={L.existingProperty}
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
                      value={inputs.existingPropertyLimit}
                      onChange={(v) => set('existingPropertyLimit', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="commercial">
                <AccordionTrigger>{L.sec5}</AccordionTrigger>
                <AccordionContent>
                  <div className={grid}>
                    <NumberField
                      id="underwritingAdjustment"
                      step={0.05}
                      label={L.underwritingAdjustment}
                      value={inputs.underwritingAdjustment}
                      onChange={(v) => set('underwritingAdjustment', v)}
                    />
                    <div />
                    <NumberField
                      id="brokerage"
                      step={0.01}
                      min={0}
                      label={L.brokerage}
                      value={inputs.brokerage}
                      onChange={(v) => set('brokerage', v)}
                    />
                    <NumberField
                      id="insuranceTax"
                      step={0.01}
                      min={0}
                      label={L.insuranceTax}
                      value={inputs.insuranceTax}
                      onChange={(v) => set('insuranceTax', v)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          {/* ------------- breakdown ------------- */}
          {/* The aside stretches to the row height so the inner wrapper has
              somewhere to travel; sticky on a self-start grid item cannot move. */}
          <aside>
            <div className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardHeader title={L.ratePanelTitle} />
              <div className="px-5 pb-5">
                <RatePanel result={result} />
              </div>
            </Card>

            {/* Only rendered when something actually needs fixing. */}
            {!result.allValid || result.warnings.length > 0 ? (
              <Card>
                <CardHeader title={L.issuesTitle} />
                <div className="px-5 pb-5">
                  <ValidationPanel result={result} />
                </div>
              </Card>
              ) : null}
            </div>
          </aside>
        </div>
      </main>

      <ResultBar result={result} />
    </div>
  )
}
