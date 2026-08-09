import { j2d, toGregorian, toJalaali } from 'jalaali-js'
import type { JalaliDate } from './types'

/** Absolute day number (Julian day) for a Jalali calendar date. */
export function jalaliOrdinal(date: JalaliDate): number {
  return j2d(date.jy, date.jm, date.jd)
}

/** Calendar-day difference `end - start`, correctly handling Jalali leap years. */
export function daysBetweenJalali(start: JalaliDate, end: JalaliDate): number {
  return jalaliOrdinal(end) - jalaliOrdinal(start)
}

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
}

const DIGIT_TO_LATIN: Record<string, string> = {
  '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4', '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
}

/** Converts Persian (۰-۹) and Arabic-Indic (٠-٩) digits to ASCII, leaving everything else untouched. */
export function normalizeDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (d) => DIGIT_TO_LATIN[d] ?? d)
}

/** e.g. { jy: 1404, jm: 4, jd: 3 } -> "۳ تیر ۱۴۰۴" */
export function formatJalaliDate(date: JalaliDate): string {
  return toPersianDigits(`${date.jd} ${PERSIAN_MONTHS[date.jm - 1]} ${date.jy}`)
}

/** Converts a Jalali date to a native JS Date (UTC midnight), for use with date-picker components. */
export function jalaliToJsDate(date: JalaliDate): Date {
  const g = toGregorian(date.jy, date.jm, date.jd)
  return new Date(Date.UTC(g.gy, g.gm - 1, g.gd))
}

/** Today's date converted to the Jalali calendar (for the print-only "تاریخ محاسبه" line). */
export function todayJalali(): JalaliDate {
  const { jy, jm, jd } = toJalaali(new Date())
  return { jy, jm, jd }
}
