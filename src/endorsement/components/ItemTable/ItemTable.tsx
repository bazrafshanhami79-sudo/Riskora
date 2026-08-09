import { v4 as uuid } from 'uuid'
import { NumberInput } from '../NumberInput'
import { RateInput } from '../RateInput'
import { DatePickerField } from '../DatePickerField'
import { IconCoins, IconInbox, IconPlus, IconTrash } from '../icons'
import { daysBetweenJalali, formatJalaliDate, todayJalali } from '../../lib/calc/jalaliDate'
import { computePremium, computeRateChangePremium, computeTotal } from '../../lib/calc/premium'
import { formatDays, formatRate, formatRial } from '../../lib/calc/formatting'
import type { JalaliDate, PolicyItemRow } from '../../lib/calc/types'

export type ItemTableMode = 'base' | 'capitalChange'
type ChangeType = NonNullable<PolicyItemRow['changeType']>

interface ItemTableProps {
  mode: ItemTableMode
  rows: PolicyItemRow[]
  onRowsChange: (rows: PolicyItemRow[]) => void
  /** Base policy term (annualization basis) in days — e.g. the original policy was 200 days. */
  referenceDays: number
  /**
   * For mode="base" only: the actual number of days being charged (e.g. a 32-day
   * renewal on a 200-day base policy), independent of referenceDays. Ignored for
   * capitalChange mode, where each row's charged days come from its own
   * effectiveDate instead. Falls back to referenceDays if omitted.
   */
  chargedDays?: number
  /** Required for capitalChange mode: bounds for each row's effective-date picker and the remaining-days calc. */
  policyStartDate?: JalaliDate | null
  policyEndDate?: JalaliDate | null
  /** Optional, print-only letterhead fields (no effect on the calculation). */
  policyType?: string
  policySubject?: string
}

function emptyRow(): PolicyItemRow {
  return { id: uuid(), name: '', value: 0, annualRate: 0, changeType: 'increase' }
}

function updateRow(rows: PolicyItemRow[], id: string, patch: Partial<PolicyItemRow>): PolicyItemRow[] {
  return rows.map((row) => (row.id === id ? { ...row, ...patch } : row))
}

function onChangeTypeSelected(rows: PolicyItemRow[], id: string, changeType: ChangeType): PolicyItemRow[] {
  if (changeType !== 'rateChange') {
    return updateRow(rows, id, { changeType })
  }
  const current = rows.find((r) => r.id === id)
  return updateRow(rows, id, {
    changeType,
    previousRate: current?.previousRate ?? 0,
    newRate: current?.newRate ?? 0,
  })
}

const thClass = 'p-3.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground'
const tdClass = 'p-3.5 align-middle'
const fieldClass =
  'w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  increase: 'افزایش سرمایه',
  decrease: 'کاهش سرمایه',
  rateChange: 'تغییر نرخ (بدون تغییر سرمایه)',
}

function PremiumAmount({ amount }: { amount: number }) {
  const isRefund = amount < 0
  return (
    <span className={isRefund ? 'text-destructive' : ''}>
      {formatRial(Math.abs(amount))} ریال{isRefund ? ' (قابل استرداد)' : ''}
    </span>
  )
}

interface RowResult {
  row: PolicyItemRow
  chargedDays: number
  dailyRate: number
  premium: number
}

export function ItemTable({
  mode,
  rows,
  onRowsChange,
  referenceDays,
  chargedDays: baseModeChargedDays,
  policyStartDate,
  policyEndDate,
  policyType,
  policySubject,
}: ItemTableProps) {
  const results: RowResult[] = rows.map((row) => {
    const chargedDays =
      mode === 'capitalChange' && row.effectiveDate && policyEndDate
        ? Math.max(0, daysBetweenJalali(row.effectiveDate, policyEndDate))
        : (baseModeChargedDays ?? referenceDays)

    if (mode === 'capitalChange' && row.changeType === 'rateChange') {
      const { dailyRateDelta, premium } = computeRateChangePremium({
        value: row.value,
        previousRate: row.previousRate ?? 0,
        newRate: row.newRate ?? 0,
        referenceDays,
        chargedDays,
      })
      return { row, chargedDays, dailyRate: dailyRateDelta, premium }
    }

    const sign = mode === 'capitalChange' && row.changeType === 'decrease' ? -1 : 1
    const { dailyRate, premium } = computePremium({ value: row.value, annualRate: row.annualRate, referenceDays, chargedDays })
    return { row, chargedDays, dailyRate, premium: premium * sign }
  })

  const total = computeTotal(results)
  const premiumColumnLabel = mode === 'capitalChange' ? 'حق بیمه الحاقیه' : 'حق بیمه'

  return (
    <div className="print-area overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <div className="print-only border-b border-border p-3 text-xs text-muted-foreground">
        {(policyType || policySubject) && (
          <div className="mb-1 flex flex-wrap gap-x-4">
            {policyType && (
              <span>
                <strong className="text-foreground">نوع بیمه‌نامه:</strong> {policyType}
              </span>
            )}
            {policySubject && (
              <span>
                <strong className="text-foreground">موضوع بیمه‌نامه:</strong> {policySubject}
              </span>
            )}
          </div>
        )}
        <div>تاریخ محاسبه: {formatJalaliDate(todayJalali())}</div>
      </div>

      {rows.length === 0 ? (
        <div className="no-print flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <IconInbox className="h-7 w-7" />
          </span>
          <p className="text-sm text-muted-foreground">هنوز هیچ قلمی اضافه نشده. برای شروع محاسبه یک ردیف اضافه کنید.</p>
        </div>
      ) : (
        <>
        {/* Desktop/tablet: full table. Hidden below md to avoid horizontal scroll on mobile. */}
        <div className="hidden overflow-x-auto md:block" dir="rtl">
          <table className={`w-full border-collapse text-sm ${mode === 'capitalChange' ? 'min-w-[1200px]' : 'min-w-[820px]'}`}>
            <thead>
              <tr className="border-b border-border bg-muted text-right">
                <th className={thClass}>مورد بیمه</th>
                <th className={thClass}>ارزش</th>
                {mode === 'capitalChange' && <th className={thClass}>نوع تغییر</th>}
                <th className={thClass}>نرخ بیمه‌نامه</th>
                {mode === 'capitalChange' && <th className={thClass}>تاریخ اثر</th>}
                <th className={thClass}>مدت مبنا (روز)</th>
                <th className={thClass}>{mode === 'capitalChange' ? 'مدت باقی‌مانده (روز)' : 'مدت (روز)'}</th>
                <th className={thClass}>نرخ روزشمار</th>
                <th className={thClass}>{premiumColumnLabel}</th>
                <th className="p-3.5 no-print" />
              </tr>
            </thead>
            <tbody>
              {results.map(({ row, chargedDays, dailyRate, premium }) => (
                <tr key={row.id} className="border-b border-border transition-colors last:border-b-0 hover:bg-muted/40">
                  <td className={`min-w-[140px] ${tdClass}`}>
                    <input
                      type="text"
                      value={row.name}
                      placeholder="نام مورد بیمه"
                      onChange={(e) => onRowsChange(updateRow(rows, row.id, { name: e.target.value }))}
                      className={fieldClass}
                    />
                  </td>
                  <td className={`min-w-[170px] ${tdClass}`}>
                    <NumberInput value={row.value} onChange={(value) => onRowsChange(updateRow(rows, row.id, { value }))} placeholder="۰" />
                  </td>
                  {mode === 'capitalChange' && (
                    <td className={`min-w-[190px] ${tdClass}`}>
                      <select
                        value={row.changeType ?? 'increase'}
                        onChange={(e) => onRowsChange(onChangeTypeSelected(rows, row.id, e.target.value as ChangeType))}
                        className={`cursor-pointer ${fieldClass}`}
                      >
                        {(Object.keys(CHANGE_TYPE_LABELS) as ChangeType[]).map((key) => (
                          <option key={key} value={key}>
                            {CHANGE_TYPE_LABELS[key]}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  <td className={`min-w-[190px] ${tdClass}`}>
                    {row.changeType === 'rateChange' ? (
                      <div className="flex items-center gap-2">
                        <RateInput
                          label=""
                          value={row.previousRate ?? 0}
                          onChange={(previousRate) => onRowsChange(updateRow(rows, row.id, { previousRate }))}
                          placeholder="۱.۵"
                        />
                        <RateInput
                          label=""
                          value={row.newRate ?? 0}
                          onChange={(newRate) => onRowsChange(updateRow(rows, row.id, { newRate }))}
                          placeholder="۲.۵"
                        />
                      </div>
                    ) : (
                      <RateInput
                        label=""
                        value={row.annualRate}
                        onChange={(annualRate) => onRowsChange(updateRow(rows, row.id, { annualRate }))}
                        placeholder="1.25"
                      />
                    )}
                  </td>
                  {mode === 'capitalChange' && (
                    <td className={`min-w-[160px] ${tdClass}`}>
                      <DatePickerField
                        label=""
                        value={row.effectiveDate ?? null}
                        onChange={(effectiveDate) => onRowsChange(updateRow(rows, row.id, { effectiveDate }))}
                        minDate={policyStartDate}
                        maxDate={policyEndDate}
                      />
                    </td>
                  )}
                  <td className={`${tdClass} text-center tabular-fa text-muted-foreground`}>{formatDays(referenceDays)}</td>
                  <td className={`${tdClass} text-center tabular-fa text-muted-foreground`}>{formatDays(chargedDays)}</td>
                  <td className={`${tdClass} text-center tabular-fa text-muted-foreground`}>{formatRate(dailyRate)}</td>
                  <td className={`${tdClass} text-center font-semibold tabular-fa`}>
                    <PremiumAmount amount={premium} />
                  </td>
                  <td className={`${tdClass} text-center no-print`}>
                    <button
                      type="button"
                      onClick={() => onRowsChange(rows.filter((r) => r.id !== row.id))}
                      className="press inline-flex cursor-pointer items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label="حذف ردیف"
                    >
                      <IconTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: one vertical card per row instead of a table, so nothing forces horizontal scroll. */}
        <div className="flex flex-col gap-3 p-3 md:hidden">
          {results.map(({ row, chargedDays, dailyRate, premium }) => (
            <div key={row.id} className="rounded-2xl border border-border bg-white/5 p-4">
              <div className="flex items-start justify-between gap-2">
                <input
                  type="text"
                  value={row.name}
                  placeholder="نام مورد بیمه"
                  onChange={(e) => onRowsChange(updateRow(rows, row.id, { name: e.target.value }))}
                  className={`${fieldClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => onRowsChange(rows.filter((r) => r.id !== row.id))}
                  className="press inline-flex shrink-0 cursor-pointer items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  aria-label="حذف ردیف"
                >
                  <IconTrash className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumberInput label="ارزش" value={row.value} onChange={(value) => onRowsChange(updateRow(rows, row.id, { value }))} placeholder="۰" />
                {mode === 'capitalChange' && (
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="font-medium text-foreground">نوع تغییر</span>
                    <select
                      value={row.changeType ?? 'increase'}
                      onChange={(e) => onRowsChange(onChangeTypeSelected(rows, row.id, e.target.value as ChangeType))}
                      className={`cursor-pointer ${fieldClass}`}
                    >
                      {(Object.keys(CHANGE_TYPE_LABELS) as ChangeType[]).map((key) => (
                        <option key={key} value={key}>
                          {CHANGE_TYPE_LABELS[key]}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {mode === 'capitalChange' && (
                <div className="mt-3">
                  <DatePickerField
                    label="تاریخ اثر"
                    value={row.effectiveDate ?? null}
                    onChange={(effectiveDate) => onRowsChange(updateRow(rows, row.id, { effectiveDate }))}
                    minDate={policyStartDate}
                    maxDate={policyEndDate}
                  />
                </div>
              )}

              <div className="mt-3 grid grid-cols-2 gap-3">
                {row.changeType === 'rateChange' ? (
                  <>
                    <RateInput label="نرخ قبلی" value={row.previousRate ?? 0} onChange={(previousRate) => onRowsChange(updateRow(rows, row.id, { previousRate }))} placeholder="۱.۵" />
                    <RateInput label="نرخ جدید" value={row.newRate ?? 0} onChange={(newRate) => onRowsChange(updateRow(rows, row.id, { newRate }))} placeholder="۲.۵" />
                  </>
                ) : (
                  <RateInput label="نرخ بیمه‌نامه" value={row.annualRate} onChange={(annualRate) => onRowsChange(updateRow(rows, row.id, { annualRate }))} placeholder="1.25" />
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 rounded-xl bg-muted/40 p-2.5 text-center text-xs text-muted-foreground">
                <div>
                  <div>مدت مبنا</div>
                  <div className="mt-0.5 tabular-fa text-foreground">{formatDays(referenceDays)}</div>
                </div>
                <div>
                  <div>{mode === 'capitalChange' ? 'مدت باقی‌مانده' : 'مدت'}</div>
                  <div className="mt-0.5 tabular-fa text-foreground">{formatDays(chargedDays)}</div>
                </div>
                <div>
                  <div>نرخ روزشمار</div>
                  <div className="mt-0.5 tabular-fa text-foreground">{formatRate(dailyRate)}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-semibold">
                <span className="text-muted-foreground">{premiumColumnLabel}</span>
                <span className="tabular-fa">
                  <PremiumAmount amount={premium} />
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="print-total-bar glass-accent relative z-[1] flex items-center justify-between gap-3 p-4 text-foreground">
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-primary-light">
              <IconCoins className="h-4 w-4" />
            </span>
            جمع کل حق بیمه
          </span>
          <span className="text-lg font-extrabold tabular-fa text-primary-light">
            <PremiumAmount amount={total} />
          </span>
        </div>
        </>
      )}

      <div className="no-print border-t border-border bg-muted/40 p-3">
        <button
          type="button"
          onClick={() => onRowsChange([...rows, emptyRow()])}
          className="press inline-flex cursor-pointer items-center gap-2 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-all duration-200 hover:bg-primary hover:text-primary-foreground"
        >
          <IconPlus className="h-4 w-4" />
          افزودن ردیف
        </button>
      </div>
    </div>
  )
}
