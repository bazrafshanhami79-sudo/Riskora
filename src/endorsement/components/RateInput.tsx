import { useEffect, useState } from 'react'
import { parseInput } from '../lib/parseNumber'

interface RateInputProps {
  label?: string
  /** Decimal fraction in memory (e.g. 0.00125) — matches what premium.ts expects. */
  value: number
  onChange: (value: number) => void
  /** In per-mille units, e.g. "1.25" for a placeholder of 0.00125. */
  placeholder?: string
  className?: string
}

const perMilleFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 6 })

function formatForDisplay(value: number): string {
  if (Number.isNaN(value) || value === 0) return ''
  return perMilleFormatter.format(value * 1000)
}

/**
 * Rate input shown/typed in per-mille (در هزار) units, since that's how the
 * business communicates rates, while storing the decimal fraction the
 * calculation engine expects (e.g. displays/accepts "2.5", stores 0.0025).
 */
export function RateInput({ label, value, onChange, placeholder, className }: RateInputProps) {
  const [text, setText] = useState(formatForDisplay(value))

  useEffect(() => {
    setText(formatForDisplay(value))
  }, [value])

  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ''}`}>
      {label && <span className="font-medium text-foreground">{label}</span>}
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          dir="ltr"
          className="w-full rounded-lg border border-border bg-white/5 py-2 pl-3 pr-8 text-left tabular-fa text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            const perMille = parseInput(text)
            const decimal = perMille / 1000
            onChange(decimal)
            setText(formatForDisplay(decimal))
          }}
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">‰</span>
      </div>
    </label>
  )
}
