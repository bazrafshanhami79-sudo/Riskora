import { useEffect, useState } from 'react'
import { parseInput } from '../lib/parseNumber'

interface NumberInputProps {
  label?: string
  value: number
  onChange: (value: number) => void
  placeholder?: string
  className?: string
  min?: number
}

const groupFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 10 })

function formatForDisplay(value: number): string {
  if (Number.isNaN(value) || value === 0) return ''
  return groupFormatter.format(value)
}

export function NumberInput({ label, value, onChange, placeholder, className, min }: NumberInputProps) {
  const [text, setText] = useState(formatForDisplay(value))

  useEffect(() => {
    setText(formatForDisplay(value))
  }, [value])

  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ''}`}>
      {label && <span className="font-medium text-foreground">{label}</span>}
      <input
        type="text"
        inputMode="decimal"
        dir="ltr"
        className="w-full rounded-lg border border-border bg-white/5 px-3 py-2 text-left tabular-fa text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => {
          const parsed = parseInput(text)
          const clamped = min !== undefined ? Math.max(min, parsed) : parsed
          onChange(clamped)
          setText(formatForDisplay(clamped))
        }}
      />
    </label>
  )
}
