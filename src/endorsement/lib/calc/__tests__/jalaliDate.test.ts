import { describe, expect, it } from 'vitest'
import { daysBetweenJalali, formatJalaliDate, normalizeDigits, toPersianDigits } from '../jalaliDate'

describe('daysBetweenJalali', () => {
  it('counts 30 days for the leap month of 1403 (اسفند has 30 days in a leap year)', () => {
    expect(daysBetweenJalali({ jy: 1403, jm: 12, jd: 1 }, { jy: 1404, jm: 1, jd: 1 })).toBe(30)
  })

  it('counts 29 days for the non-leap year 1404', () => {
    expect(daysBetweenJalali({ jy: 1404, jm: 12, jd: 1 }, { jy: 1405, jm: 1, jd: 1 })).toBe(29)
  })

  it("matches the user's example span: 3 تیر 1404 to 10 مرداد 1405", () => {
    expect(daysBetweenJalali({ jy: 1404, jm: 4, jd: 3 }, { jy: 1405, jm: 5, jd: 10 })).toBe(403)
  })

  it('returns 0 for identical dates and is antisymmetric', () => {
    const start = { jy: 1404, jm: 1, jd: 1 }
    const end = { jy: 1404, jm: 6, jd: 15 }
    expect(daysBetweenJalali(start, start)).toBe(0)
    expect(daysBetweenJalali(start, end)).toBe(-daysBetweenJalali(end, start))
  })
})

describe('formatJalaliDate / toPersianDigits', () => {
  it('formats a Jalali date with Persian digits and month name', () => {
    expect(formatJalaliDate({ jy: 1404, jm: 4, jd: 3 })).toBe('۳ تیر ۱۴۰۴')
  })

  it('converts Latin digits to Persian digits', () => {
    expect(toPersianDigits(1404)).toBe('۱۴۰۴')
  })
})

describe('normalizeDigits', () => {
  it('converts Persian digits to ASCII', () => {
    expect(normalizeDigits('۲٬۳۴۰٬۰۰۰')).toBe('2٬340٬000')
  })

  it('converts Arabic-Indic digits to ASCII', () => {
    expect(normalizeDigits('٢٫٥')).toBe('2٫5')
  })

  it('leaves ASCII digits and other characters untouched', () => {
    expect(normalizeDigits('0.00125')).toBe('0.00125')
  })

  it('handles a mix of Persian and ASCII digits', () => {
    expect(normalizeDigits('۱404')).toBe('1404')
  })
})
