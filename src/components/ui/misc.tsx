import * as React from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: React.ComponentProps<'section'>) {
  return <section className={cn('card', className)} {...props} />
}

export function CardHeader({
  title,
  description,
  actions,
  className,
}: {
  title: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-3 px-5 pb-3 pt-4', className)}>
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {description ? <p className="field-help mt-0.5">{description}</p> : null}
      </div>
      {actions}
    </div>
  )
}

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: React.ComponentProps<'span'> & { tone?: 'neutral' | 'accent' | 'success' | 'danger' | 'warning' }) {
  const tones: Record<string, string> = {
    neutral: 'bg-muted text-foreground/70 border-border',
    accent: 'bg-muted text-foreground border-transparent',
    success: 'bg-transparent text-success border-success/40',
    danger: 'bg-transparent text-destructive border-destructive/40',
    warning: 'bg-transparent text-warning border-warning/40',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium leading-5',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}

/**
 * A figure that re-animates whenever its value changes. Keying on the value
 * remounts the span, replaying the CSS animation — no effect, no state.
 */
export function AnimatedValue({
  value,
  className,
  children,
}: {
  value: string | number
  className?: string
  children?: React.ReactNode
}) {
  return (
    <span key={String(value)} className={cn('animate-value-settle tabular inline-block', className)}>
      {children ?? value}
    </span>
  )
}
