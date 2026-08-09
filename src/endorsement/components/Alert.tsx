import type { ReactNode } from 'react'
import { IconAlertTriangle, IconCalendar } from './icons'

export function ErrorAlert({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-3.5 text-sm font-medium text-destructive">
      <IconAlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

export function DurationSummary({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3.5 text-sm text-foreground">
      <IconCalendar className="h-5 w-5 shrink-0 text-primary" />
      <span>{children}</span>
    </div>
  )
}
