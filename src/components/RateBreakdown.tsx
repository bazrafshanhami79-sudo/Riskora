import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatDecimal, formatInt, formatPerMille, formatPercent, formatRial } from '@/lib/format'
import { L } from '@/labels'
import { Badge } from '@/components/ui/misc'
import type { EarInputs, EarResult } from '@/engine'

/* -------------------------------------------------------------------------
   Row primitives
   ------------------------------------------------------------------------- */

function Row({
  label,
  value,
  note,
  tone = 'normal',
  indent,
}: {
  label: React.ReactNode
  value: React.ReactNode
  note?: React.ReactNode
  tone?: 'normal' | 'muted' | 'total' | 'grand'
  indent?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-2',
        indent && 'ps-4',
        tone === 'total' && 'border-t rule-hair mt-1 pt-3 font-semibold',
        tone === 'grand' && 'border-t border-accent/40 mt-1 pt-3',
      )}
    >
      <div className="min-w-0">
        <span
          className={cn(
            'text-sm',
            tone === 'muted' && 'text-fg-subtle',
            tone === 'grand' && 'font-semibold text-fg',
          )}
        >
          {label}
        </span>
        {note ? <span className="field-help block">{note}</span> : null}
      </div>
      <span
        className={cn(
          'tabular shrink-0 text-sm',
          tone === 'muted' ? 'text-fg-subtle' : 'text-fg',
          (tone === 'total' || tone === 'grand') && 'font-semibold',
          tone === 'grand' && 'text-accent text-base',
        )}
      >
        {value}
      </span>
    </div>
  )
}

/** Proportional bar showing how the MD technical rate is composed. */
function CompositionBar({
  segments,
  total,
}: {
  segments: { key: string; label: string; value: number; className: string }[]
  total: number
}) {
  const visible = segments.filter((s) => s.value > 0)
  if (total <= 0 || visible.length === 0) return null

  return (
    <div className="mb-4">
      <div
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-bg-subtle"
        role="img"
        aria-label={`ترکیب نرخ فنی: ${visible
          .map((s) => `${s.label} ${formatPerMille(s.value)}`)
          .join('، ')}`}
      >
        {visible.map((s) => (
          <div
            key={s.key}
            className={cn('h-full', s.className)}
            style={{ width: `${(s.value / total) * 100}%` }}
          />
        ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {visible.map((s) => (
          <li key={s.key} className="flex items-center gap-1.5 text-xs text-fg-muted">
            <span className={cn('size-2 shrink-0 rounded-[3px]', s.className)} aria-hidden />
            {s.label}
            <span className="tabular text-fg-subtle">{formatPerMille(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------
   Panels
   ------------------------------------------------------------------------- */

export function RateBuildUp({ result, inputs }: { result: EarResult; inputs: EarInputs }) {
  const { rate, earthquake } = result
  const isMachine = inputs.projectScope === 'INDIVIDUAL_MACHINES'
  const floored = !isMachine && rate.effectiveErection > rate.bandedBaseRate

  const segments = [
    {
      key: 'erection',
      label: L.effectiveErection,
      value: rate.effectiveErection,
      className: 'bg-accent',
    },
    {
      key: 'hot',
      label: L.hotTesting,
      value: rate.hotTestingRate,
      className: 'bg-accent/55',
    },
    {
      key: 'eq',
      label: L.eqLoading,
      value: rate.eqLoadingApplied,
      className: 'bg-fg-muted',
    },
    {
      key: 'loadings',
      label: L.loadingsSubtotal,
      value: rate.loadings.subtotal,
      className: 'bg-fg-subtle/60',
    },
  ]

  const l = rate.loadings

  return (
    <div>
      <CompositionBar segments={segments} total={rate.mdTechnicalRate} />

      <Row
        label={L.effectiveErection}
        value={formatPerMille(rate.effectiveErection)}
        note={
          isMachine
            ? 'نرخ پایهٔ جدول آبی + تمدید نصب و آزمایش'
            : floored
              ? `کف نرخ اعمال شد — نرخ باندبندی‌شده ${formatPerMille(rate.bandedBaseRate)} بود`
              : 'نرخ باندبندی‌شده بالاتر از کف است'
        }
      />
      {!isMachine && (
        <>
          <Row
            indent
            tone="muted"
            label={L.bandedBase}
            value={formatPerMille(rate.bandedBaseRate)}
            note={`مدت ${formatInt(inputs.durationMonths)} ماه`}
          />
          <Row indent tone="muted" label={L.minRateFloor} value={formatPerMille(rate.minRate)} />
        </>
      )}

      <Row
        label={L.hotTesting}
        value={formatPerMille(rate.hotTestingRate)}
        note={
          isMachine
            ? 'در جدول آبی، نرخ پایه خودْ ۱ ماه آزمایش را در بر دارد'
            : inputs.hotTestingIncluded === 'Yes'
              ? undefined
              : 'انتخاب نشده'
        }
      />

      <Row
        label={L.eqLoading}
        value={formatPerMille(rate.eqLoadingApplied)}
        note={
          inputs.earthquakeExclusion === 'Yes'
            ? 'معافیت زلزله فعال است'
            : isMachine && inputs.natureRiskLoadingForMachine === 'No'
              ? 'ماشین منفرد — طبق بند ۲.۵ بارگذاری بلایای طبیعی اعمال نشد'
              : undefined
        }
      />
      {rate.eqLoadingApplied > 0 && (
        <Row
          indent
          tone="muted"
          label={`E = E۱ × E۲ = ${formatInt(earthquake.e1)} × ${formatInt(earthquake.e2)} = ${formatInt(earthquake.e)}`}
          value={`${formatPerMille(earthquake.monthlyRate)} × ${formatInt(earthquake.monthsApplied)} ماه`}
          note={
            <>
              گِرد شده به {formatInt(earthquake.eRounded)} · پهنهٔ {earthquake.zone} ·{' '}
              {earthquake.monthsBasis === 'erectionMonths + testingMonths'
                ? 'مبنای مدت: ماه‌های نصب + آزمایش'
                : 'مبنای مدت: مدت کل پروژه'}
            </>
          }
        />
      )}

      <Row label={L.loadingsSubtotal} value={formatPerMille(rate.loadings.subtotal)} />
      {l.subtotal > 0 && (
        <>
          {l.mrMaterial > 0 && (
            <Row indent tone="muted" label="نقص مواد/کارگری" value={formatPerMille(l.mrMaterial)} />
          )}
          {l.mrDesign > 0 && (
            <Row indent tone="muted" label="نقص طراحی" value={formatPerMille(l.mrDesign)} />
          )}
          {l.visitsMaint > 0 && (
            <Row indent tone="muted" label="نگهداری ساده" value={formatPerMille(l.visitsMaint)} />
          )}
          {l.extendedMaint > 0 && (
            <Row
              indent
              tone="muted"
              label="نگهداری گسترده"
              value={formatPerMille(l.extendedMaint)}
            />
          )}
          {l.expediting > 0 && (
            <Row indent tone="muted" label="هزینهٔ تسریع" value={formatPerMille(l.expediting)} />
          )}
          {l.riotStrike > 0 && (
            <Row indent tone="muted" label="شورش و اعتصاب" value={formatPerMille(l.riotStrike)} />
          )}
        </>
      )}

      <Row tone="total" label={L.mdTechnicalRate} value={formatPerMille(rate.mdTechnicalRate)} />
      {inputs.underwritingAdjustment !== 0 && (
        <Row
          tone="muted"
          label={`تعدیل نرخ‌گذار (${formatPercent(inputs.underwritingAdjustment)})`}
          value={formatPerMille(rate.mdOfficeRate - rate.mdTechnicalRate)}
        />
      )}
      <Row tone="grand" label={L.mdOfficeRate} value={formatPerMille(rate.mdOfficeRate, 4)} />

      <p className="field-help mt-3 border-t rule-hair pt-3">
        نرخ مسئولیت شخص ثالث جزئی از نرخ خسارت مادی نیست و جداگانه محاسبه می‌شود.
      </p>
    </div>
  )
}

export function PremiumWaterfall({ result, inputs }: { result: EarResult; inputs: EarInputs }) {
  const { addOns, tpl } = result

  return (
    <div>
      <Row
        label={L.grossMDPremium}
        value={formatRial(result.grossMDPremium)}
        note={`مبلغ بیمه × ${formatPerMille(result.rate.mdOfficeRate, 4)} ÷ ۱۰۰۰`}
      />

      {addOns.subtotal > 0 && (
        <>
          <Row label={L.addOns} value={formatRial(addOns.subtotal)} />
          {addOns.existingProperty > 0 && (
            <Row indent tone="muted" label="اموال مجاور" value={formatRial(addOns.existingProperty)} />
          )}
          {addOns.airFreight > 0 && (
            <Row indent tone="muted" label="هوابرد" value={formatRial(addOns.airFreight)} />
          )}
          {addOns.storage > 0 && (
            <Row indent tone="muted" label="انبارداری" value={formatRial(addOns.storage)} />
          )}
          {addOns.transit > 0 && (
            <Row indent tone="muted" label="ترانزیت زمینی" value={formatRial(addOns.transit)} />
          )}
          {addOns.debris > 0 && (
            <Row indent tone="muted" label="رفع نخاله" value={formatRial(addOns.debris)} />
          )}
        </>
      )}
      {addOns.subtotal === 0 && (
        <Row tone="muted" label={L.addOns} value={formatRial(0)} note="پوشش الحاقی انتخاب نشده" />
      )}

      <Row
        label={L.tplSection}
        value={formatRial(tpl.total)}
        note={
          tpl.included
            ? `نرخ پایه ${formatPerMille(tpl.baseRate)} × ضریب سقف ${formatDecimal(tpl.limitFactor)} = ${formatPerMille(tpl.effectiveRate)}`
            : 'پوشش مسئولیت شخص ثالث انتخاب نشده'
        }
      />
      {tpl.included && (
        <>
          <Row indent tone="muted" label="حق‌بیمهٔ پایهٔ TPL" value={formatRial(tpl.premium)} />
          {inputs.crossLiability === 'Yes' && (
            <Row
              indent
              tone="muted"
              label="مسئولیت متقابل (۳۵٪)"
              value={formatRial(tpl.crossLiabilitySurcharge)}
            />
          )}
        </>
      )}

      <Row tone="total" label={L.grossPremium} value={formatRial(result.grossPremium)} />
      <Row
        tone="muted"
        label={`${L.netToInsurer} — پس از کارمزد ${formatPercent(inputs.brokerage)}`}
        value={formatRial(result.netToInsurer)}
      />
      <Row
        tone="grand"
        label={`${L.totalPayable} — با مالیات ${formatPercent(inputs.insuranceTax)}`}
        value={formatRial(result.totalPayable)}
      />

      {tpl.included && (
        <p className="field-help mt-3 border-t rule-hair pt-3">
          حداقل حق‌بیمهٔ مرجع سوئیس‌ری برای این ردهٔ TPL{' '}
          <span className="tabular">{formatRial(tpl.informationalMinPremiumRial)}</span> است.{' '}
          <Badge tone="neutral">اعمال نشده — فقط اطلاعاتی</Badge>
        </p>
      )}
    </div>
  )
}
