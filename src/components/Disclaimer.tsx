import { L } from '@/labels'

/**
 * Persistent scope notice. The tool produces indicative rates, not binding
 * ones, so this is deliberately not dismissible.
 *
 * Styled the way the reference styles asides: a hairline rule and a mono
 * eyebrow, with no tinted panel — the palette has no accent to tint with.
 */
export function Disclaimer() {
  return (
    <aside aria-label={L.disclaimerTitle} className="border-t border-border pt-5">
      <span className="eyebrow">{L.disclaimerTitle}</span>
      <p className="mt-3 text-sm leading-[1.9] text-foreground/70">{L.disclaimer}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        {L.creditsLabel}: <span className="text-foreground">{L.credits}</span>
      </p>
    </aside>
  )
}
