import { AlertTriangle, CheckCircle2, Info, MinusCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPerMille, formatRial, formatRialCompact } from '@/lib/format'
import { L } from '@/labels'
import { AnimatedValue, Badge } from '@/components/ui/misc'
import type { EarResult } from '@/engine'

/**
 * The premium is always visible. Pinned to the bottom of the viewport so it
 * stays on screen while the underwriter works down the form.
 */
export function ResultBar({ result }: { result: EarResult }) {
  const ready = result.allValid
  const failing = result.validations.filter((v) => !v.notApplicable && !v.ok)

  return (
    <div className="sticky bottom-0 z-30 border-t border-border bg-card">
      <div
        className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-4 py-3 sm:px-6"
        style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
      >
        <div
          className={cn('flex items-center gap-2 text-sm font-medium', ready ? 'text-success' : 'text-destructive')}
          role="status"
          aria-live="polite"
        >
          {ready ? (
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
          ) : (
            <XCircle className="size-4 shrink-0" aria-hidden />
          )}
          <span>
            {ready ? L.readyTitle : `${L.notReadyTitle} — ${failing.map((f) => f.id).join('، ')}`}
          </span>
        </div>

        <div className="ms-auto flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <div>
            <div className="field-help">{L.mdTechnicalRate}</div>
            <AnimatedValue
              value={result.rate.mdTechnicalRate}
              className="text-lg font-semibold text-foreground"
            >
              {formatPerMille(result.rate.mdTechnicalRate)}
            </AnimatedValue>
          </div>
          <div>
            <div className="field-help">{L.totalPayable}</div>
            <AnimatedValue
              value={result.totalPayable}
              className="text-xl font-semibold text-foreground"
            >
              {formatRial(result.totalPayable)}
            </AnimatedValue>
            <div className="field-help">{formatRialCompact(result.totalPayable)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ValidationPanel({ result }: { result: EarResult }) {
  return (
    <div>
      <ul className="space-y-2">
        {result.validations.map((v) => {
          const Icon = v.notApplicable ? MinusCircle : v.ok ? CheckCircle2 : AlertTriangle
          return (
            <li key={v.id} className="flex items-start gap-2.5">
              <Icon
                className={cn(
                  'mt-1 size-4 shrink-0',
                  v.notApplicable ? 'text-muted-foreground' : v.ok ? 'text-success' : 'text-destructive',
                )}
                aria-hidden
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-foreground/70">{v.id}</span>
                <p
                  className={cn(
                    'text-sm',
                    v.notApplicable ? 'text-muted-foreground' : v.ok ? 'text-foreground/70' : 'text-destructive',
                  )}
                >
                  {v.message}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {result.warnings.length > 0 && (
        <div className="mt-4 space-y-2 border-t rule-hair pt-4">
          {result.warnings.map((w) => (
            <div key={w.code} className="flex items-start gap-2.5">
              <Info className="mt-1 size-4 shrink-0 text-warning" aria-hidden />
              <p className="text-sm text-foreground/70">{w.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** Read-only reference figures that deliberately do not feed the calculation. */
export function NotAppliedNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="field-help flex items-start gap-2">
      <Badge tone="neutral" className="shrink-0">
        اعمال نشده
      </Badge>
      <span>{children}</span>
    </p>
  )
}
