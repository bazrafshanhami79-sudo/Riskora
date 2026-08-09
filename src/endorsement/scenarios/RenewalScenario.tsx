import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { NumberInput } from '../components/NumberInput'
import { DatePickerField } from '../components/DatePickerField'
import { ItemTable } from '../components/ItemTable/ItemTable'
import { PrintButton } from '../components/PrintButton'
import { DurationSummary, ErrorAlert } from '../components/Alert'
import { daysBetweenJalali, formatJalaliDate, toPersianDigits } from '../lib/calc/jalaliDate'
import type { JalaliDate, PolicyItemRow } from '../lib/calc/types'

const fieldClass =
  'w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function RenewalScenario() {
  const [baseDays, setBaseDays] = useState(0)
  const [expiryDate, setExpiryDate] = useState<JalaliDate | null>(null)
  const [renewUntilDate, setRenewUntilDate] = useState<JalaliDate | null>(null)
  const [policyType, setPolicyType] = useState('')
  const [policySubject, setPolicySubject] = useState('')
  const [rows, setRows] = useState<PolicyItemRow[]>([{ id: uuid(), name: '', value: 0, annualRate: 0 }])

  const renewalDays = expiryDate && renewUntilDate ? daysBetweenJalali(expiryDate, renewUntilDate) : 0
  const dateError = expiryDate && renewUntilDate && renewalDays <= 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">تمدید بیمه‌نامه</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          مدت زمان بیمه‌نامه پایه (برای محاسبه نرخ سالانه) و بازه تمدید را وارد کنید؛ این دو لزوماً یکی نیستند — مثلاً
          بیمه‌نامه‌ای که مبنایش ۲۰۰ روز بوده می‌تواند فقط ۳۲ روز تمدید شود.
        </p>
      </div>

      <div className="no-print grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">نوع بیمه‌نامه (اختیاری)</span>
          <input type="text" value={policyType} onChange={(e) => setPolicyType(e.target.value)} placeholder="مثلاً آتش‌سوزی" className={fieldClass} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-foreground">موضوع بیمه‌نامه (اختیاری)</span>
          <input type="text" value={policySubject} onChange={(e) => setPolicySubject(e.target.value)} placeholder="مثلاً ساختمان و تاسیسات کارخانه" className={fieldClass} />
        </label>
      </div>

      <div className="no-print rounded-2xl border border-border bg-white/5 p-4 sm:p-5">
        <NumberInput
          label="مدت زمان بیمه‌نامه پایه (روز)"
          value={baseDays}
          onChange={setBaseDays}
          placeholder="مثلاً ۲۰۰"
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          تعداد روزهای خودِ بیمه‌نامه‌ای که می‌خواهید تمدید کنید؛ نرخ سالانه بر همین مبنا روزشمار می‌شود، نه بر مبنای
          بازه تمدید زیر.
        </p>
      </div>

      <div className="no-print rounded-2xl border border-border bg-white/5 p-4 sm:p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePickerField label="تاریخ انقضای بیمه‌نامه فعلی" value={expiryDate} onChange={setExpiryDate} />
          <DatePickerField label="تمدید تا تاریخ" value={renewUntilDate} onChange={setRenewUntilDate} />
        </div>
      </div>

      {dateError && <ErrorAlert>تاریخ تمدید باید بعد از تاریخ انقضا باشد.</ErrorAlert>}

      {expiryDate && renewUntilDate && !dateError && (
        <DurationSummary>
          مدت مبنا: {toPersianDigits(baseDays)} روز — مدت تمدید: از {formatJalaliDate(expiryDate)} تا {formatJalaliDate(renewUntilDate)} (
          {toPersianDigits(renewalDays)} روز)
        </DurationSummary>
      )}

      {!dateError && (
        <>
          <ItemTable
            mode="base"
            rows={rows}
            onRowsChange={setRows}
            referenceDays={baseDays || 1}
            chargedDays={renewalDays || 1}
            policyType={policyType}
            policySubject={policySubject}
          />

          <div>
            <PrintButton />
          </div>
        </>
      )}
    </div>
  )
}
