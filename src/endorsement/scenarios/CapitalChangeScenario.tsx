import { useState } from 'react'
import { v4 as uuid } from 'uuid'
import { DatePickerField } from '../components/DatePickerField'
import { ItemTable } from '../components/ItemTable/ItemTable'
import { PrintButton } from '../components/PrintButton'
import { DurationSummary, ErrorAlert } from '../components/Alert'
import { daysBetweenJalali, formatJalaliDate, toPersianDigits } from '../lib/calc/jalaliDate'
import type { JalaliDate, PolicyItemRow } from '../lib/calc/types'

const fieldClass =
  'w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20'

export function CapitalChangeScenario() {
  const [policyStartDate, setPolicyStartDate] = useState<JalaliDate | null>(null)
  const [policyEndDate, setPolicyEndDate] = useState<JalaliDate | null>(null)
  const [policyType, setPolicyType] = useState('')
  const [policySubject, setPolicySubject] = useState('')
  const [rows, setRows] = useState<PolicyItemRow[]>([
    { id: uuid(), name: '', value: 0, annualRate: 0, changeType: 'increase' },
  ])

  const referenceDays = policyStartDate && policyEndDate ? daysBetweenJalali(policyStartDate, policyEndDate) : 0
  const dateError = policyStartDate && policyEndDate && referenceDays <= 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">افزایش یا کاهش سرمایه</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          تاریخ شروع و پایان بیمه‌نامه اصلی را وارد کنید. برای هر قلم، تاریخ اثر افزایش یا کاهش سرمایه را جداگانه مشخص
          کنید؛ حق بیمه بر اساس مدت باقی‌مانده از آن تاریخ تا پایان بیمه‌نامه محاسبه می‌شود.
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DatePickerField label="تاریخ شروع بیمه‌نامه اصلی" value={policyStartDate} onChange={setPolicyStartDate} />
          <DatePickerField label="تاریخ پایان بیمه‌نامه اصلی" value={policyEndDate} onChange={setPolicyEndDate} />
        </div>
      </div>

      {dateError && <ErrorAlert>تاریخ پایان باید بعد از تاریخ شروع باشد.</ErrorAlert>}

      {policyStartDate && policyEndDate && !dateError && (
        <DurationSummary>
          مدت بیمه‌نامه اصلی: از {formatJalaliDate(policyStartDate)} تا {formatJalaliDate(policyEndDate)} —{' '}
          {toPersianDigits(referenceDays)} روز
        </DurationSummary>
      )}

      {!dateError && (
        <>
          <ItemTable
            mode="capitalChange"
            rows={rows}
            onRowsChange={setRows}
            referenceDays={referenceDays || 1}
            policyStartDate={policyStartDate}
            policyEndDate={policyEndDate}
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
