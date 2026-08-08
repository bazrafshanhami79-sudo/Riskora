import { Info } from 'lucide-react'
import { L } from '@/labels'

/**
 * Persistent scope notice. The tool produces indicative rates, not binding
 * ones, so this is deliberately not dismissible.
 */
export function Disclaimer() {
  return (
    <aside
      aria-label={L.disclaimerTitle}
      className="mb-5 rounded-lg border border-accent/25 bg-accent-quiet px-4 py-3.5"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-1 size-4 shrink-0 text-accent" aria-hidden />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-fg">{L.disclaimerTitle}</h2>
          <p className="mt-1 text-sm leading-[1.9] text-fg-muted">{L.disclaimer}</p>
          <p className="field-help mt-2.5 border-t border-accent/20 pt-2.5">
            {L.creditsLabel}: <span className="font-medium text-fg-muted">{L.credits}</span>
          </p>
        </div>
      </div>
    </aside>
  )
}
