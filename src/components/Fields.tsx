import * as React from 'react'
import { cn } from '@/lib/utils'
import { formatMoney, parseNumber, toPersianDigits } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FieldShellProps {
  id: string
  label: React.ReactNode
  help?: React.ReactNode
  error?: string
  children: React.ReactNode
  className?: string
  /**
   * Render the label as a plain span instead of a <label>. Required for
   * composite controls (radiogroup), which are not labelable elements and must
   * be named with aria-labelledby instead.
   */
  asGroup?: boolean
}

/**
 * Every input carries a visible label bound by id, and its helper text is
 * wired through aria-describedby so screen readers announce it with the field.
 */
export function FieldShell({
  id,
  label,
  help,
  error,
  children,
  className,
  asGroup,
}: FieldShellProps) {
  return (
    <div className={cn('min-w-0', className)}>
      {asGroup ? (
        <span id={`${id}-label`} className="field-label">
          {label}
        </span>
      ) : (
        <label htmlFor={id} className="field-label">
          {label}
        </label>
      )}
      <div className="mt-1.5">{children}</div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="field-help mt-1 text-danger">
          {error}
        </p>
      ) : help ? (
        <p id={`${id}-help`} className="field-help mt-1">
          {help}
        </p>
      ) : null}
    </div>
  )
}

function describedBy(id: string, help?: React.ReactNode, error?: string) {
  if (error) return `${id}-error`
  return help ? `${id}-help` : undefined
}

// ---------------------------------------------------------------------------

export function SelectField({
  id,
  label,
  help,
  error,
  value,
  onChange,
  options,
  disabled,
  ltrOptions,
  className,
}: {
  id: string
  label: React.ReactNode
  help?: React.ReactNode
  error?: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
  /** Render option text left-to-right (English EAR identifiers). */
  ltrOptions?: boolean
  className?: string
}) {
  return (
    <FieldShell id={id} label={label} help={help} error={error} className={className}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-describedby={describedBy(id, help, error)}
          aria-invalid={error ? true : undefined}
          className={ltrOptions ? 'ltr-inline' : undefined}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className={ltrOptions ? 'ltr-inline' : ''}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldShell>
  )
}

// ---------------------------------------------------------------------------

/**
 * Numeric input that displays Persian digits but accepts Latin, Persian and
 * Arabic-Indic digits. Kept as free text while focused so the caret never
 * jumps mid-edit; reformatted on blur.
 */
export function NumberField({
  id,
  label,
  help,
  error,
  value,
  onChange,
  disabled,
  money,
  step,
  min,
  max,
  className,
}: {
  id: string
  label: React.ReactNode
  help?: React.ReactNode
  error?: string
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  /** Format with thousands separators when not focused. */
  money?: boolean
  step?: number
  min?: number
  max?: number
  className?: string
}) {
  const [draft, setDraft] = React.useState<string | null>(null)

  const display =
    draft !== null
      ? draft
      : money
        ? formatMoney(value)
        : toPersianDigits(String(Number(value.toFixed(6))))

  return (
    <FieldShell id={id} label={label} help={help} error={error} className={className}>
      <Input
        id={id}
        inputMode="decimal"
        dir="ltr"
        className="text-end"
        value={display}
        disabled={disabled}
        aria-describedby={describedBy(id, help, error)}
        aria-invalid={error ? true : undefined}
        onFocus={() => setDraft(value === 0 ? '' : String(value))}
        onChange={(e) => {
          setDraft(e.target.value)
          const parsed = parseNumber(e.target.value)
          if (parsed !== null) onChange(parsed)
          else if (e.target.value.trim() === '') onChange(0)
        }}
        onBlur={() => setDraft(null)}
        step={step}
        min={min}
        max={max}
      />
    </FieldShell>
  )
}

// ---------------------------------------------------------------------------

/**
 * Segmented control for small closed choices (Yes/No, Light/Heavy, scope).
 * A radiogroup rather than a switch, so both options are always named.
 */
export function ChoiceField<T extends string>({
  id,
  label,
  help,
  value,
  onChange,
  options,
  disabled,
  className,
}: {
  id: string
  label: React.ReactNode
  help?: React.ReactNode
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  disabled?: boolean
  className?: string
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([])
  const index = options.findIndex((o) => o.value === value)

  /** Arrow keys move between radios, as the radiogroup pattern requires. */
  const onKeyDown = (e: React.KeyboardEvent) => {
    const forward = e.key === 'ArrowDown' || e.key === 'ArrowLeft' // RTL: left advances
    const backward = e.key === 'ArrowUp' || e.key === 'ArrowRight'
    if (!forward && !backward) return
    e.preventDefault()
    const next =
      (index + (forward ? 1 : -1) + options.length) % options.length
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <FieldShell id={id} label={label} help={help} className={className} asGroup>
      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={help ? `${id}-help` : undefined}
        id={id}
        onKeyDown={onKeyDown}
        className={cn(
          'inline-flex rounded-md border border-border bg-surface-sunken p-0.5',
          disabled && 'pointer-events-none opacity-55',
        )}
      >
        {options.map((o, i) => {
          const active = o.value === value
          return (
            <button
              key={o.value}
              ref={(el) => {
                refs.current[i] = el
              }}
              type="button"
              role="radio"
              aria-checked={active}
              // Roving tabindex: the group is one tab stop, arrows move inside.
              tabIndex={active || (index === -1 && i === 0) ? 0 : -1}
              disabled={disabled}
              onClick={() => onChange(o.value)}
              className={cn(
                'cursor-pointer rounded-[5px] px-3 py-1.5 text-xs font-medium',
                'transition-colors duration-[--duration-fast]',
                active
                  ? 'bg-accent text-accent-fg'
                  : 'text-fg-muted hover:bg-bg-subtle hover:text-fg',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </FieldShell>
  )
}
