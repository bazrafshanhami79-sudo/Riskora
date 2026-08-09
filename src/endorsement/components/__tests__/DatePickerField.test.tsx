import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DatePickerField } from '../DatePickerField'

describe('DatePickerField', () => {
  it('resolves a valid React component from react-multi-date-picker (not undefined) and renders an input', () => {
    render(<DatePickerField label="تاریخ" value={null} onChange={() => {}} />)
    expect(screen.getByPlaceholderText('انتخاب تاریخ')).toBeInTheDocument()
  })

  it('disables out-of-range days in the calendar when minDate/maxDate are set', async () => {
    const user = userEvent.setup()
    render(
      <DatePickerField
        label="تاریخ اثر"
        value={null}
        onChange={() => {}}
        minDate={{ jy: 1404, jm: 4, jd: 1 }}
        maxDate={{ jy: 1404, jm: 4, jd: 10 }}
      />,
    )

    await user.click(screen.getByPlaceholderText('انتخاب تاریخ'))

    const days = document.querySelectorAll('.rmdp-day')
    expect(days.length).toBeGreaterThan(0)
    const disabledDays = document.querySelectorAll('.rmdp-day.rmdp-disabled')
    // A one-month view with only a 10-day valid window must have some disabled days.
    expect(disabledDays.length).toBeGreaterThan(0)
  })
})
