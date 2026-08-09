const rialFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 })
const rateFormatter = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 6 })

/** Formats a Rial amount with Persian digits and thousand separators. */
export function formatRial(amount: number): string {
  return rialFormatter.format(Math.round(amount))
}

/** Formats a decimal rate (e.g. 0.00125) as per-mille with Persian digits (e.g. "۱.۲۵‰"). */
export function formatRate(rate: number): string {
  return `${rateFormatter.format(rate * 1000)}‰`
}

/** Formats a day count with Persian digits. */
export function formatDays(days: number): string {
  return new Intl.NumberFormat('fa-IR').format(Math.round(days))
}
