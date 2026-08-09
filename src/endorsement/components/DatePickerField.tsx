import * as ReactMultiDatePicker from 'react-multi-date-picker'
import DateObject from 'react-date-object'
import persian from 'react-date-object/calendars/persian'
import persian_fa from 'react-date-object/locales/persian_fa'
import { IconCalendar } from './icons'
import { jalaliToJsDate } from '../lib/calc/jalaliDate'
import type { JalaliDate } from '../lib/calc/types'

// react-multi-date-picker ships a CJS build whose default export is not
// consistently unwrapped by esbuild's dev-server interop (its dev chunk
// resolves the default import to the whole module object instead of the
// component). Resolve robustly regardless of how the bundler unwrapped it.
const DatePicker = (
  'default' in ReactMultiDatePicker.default ? (ReactMultiDatePicker.default as any).default : ReactMultiDatePicker.default
) as typeof ReactMultiDatePicker.default

interface DatePickerFieldProps {
  label: string
  value: JalaliDate | null
  onChange: (date: JalaliDate) => void
  className?: string
  minDate?: JalaliDate | null
  maxDate?: JalaliDate | null
}

export function DatePickerField({ label, value, onChange, className, minDate, maxDate }: DatePickerFieldProps) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? ''}`}>
      {label && <span className="font-medium text-foreground">{label}</span>}
      <div className="relative">
        <IconCalendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <DatePicker
          calendar={persian}
          locale={persian_fa}
          value={
            value
              ? new DateObject({ year: value.jy, month: value.jm, day: value.jd, calendar: persian, locale: persian_fa })
              : undefined
          }
          onChange={(date) => {
            if (!date || Array.isArray(date)) return
            onChange({ jy: date.year, jm: date.month.number, jd: date.day })
          }}
          inputClass="w-full rounded-lg border border-border bg-white/5 py-2 pr-9 pl-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          containerClassName="w-full"
          calendarPosition="bottom-right"
          placeholder="انتخاب تاریخ"
          minDate={minDate ? jalaliToJsDate(minDate) : undefined}
          maxDate={maxDate ? jalaliToJsDate(maxDate) : undefined}
          portal
          portalTarget={document.body}
        />
      </div>
    </label>
  )
}
