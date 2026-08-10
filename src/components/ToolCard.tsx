import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/misc'
import { L } from '@/labels'

/**
 * One entry in the landing page's tool grid. Live tools render as a button;
 * the not-yet-built entry renders as a non-interactive group so it is never
 * mistaken for something clickable by pointer or assistive tech.
 */
export function ToolCard({
  icon: Icon,
  title,
  description,
  cta,
  onClick,
  disabled = false,
}: {
  icon: LucideIcon
  title: string
  description: string
  cta?: string
  onClick?: () => void
  disabled?: boolean
}) {
  const iconChip = (
    <span
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-lg border',
        disabled ? 'border-border bg-muted/30 text-foreground/50' : 'border-border bg-muted/50 text-foreground',
      )}
    >
      <Icon className="size-5" aria-hidden />
    </span>
  )

  const body = (
    <>
      {iconChip}
      <span
        className={cn(
          'mt-5 block text-lg font-semibold leading-tight',
          disabled ? 'text-foreground/70' : 'text-foreground',
        )}
      >
        {title}
      </span>
      <span
        className={cn(
          'mt-2 block text-sm leading-[1.9]',
          disabled ? 'text-foreground/50' : 'text-foreground/70',
        )}
      >
        {description}
      </span>
      <span className="mt-5 block">
        {disabled ? (
          <Badge tone="neutral">{L.comingSoonBadge}</Badge>
        ) : (
          <span className="inline-flex items-center gap-2 text-sm">
            {cta}
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
              aria-hidden
            />
          </span>
        )}
      </span>
    </>
  )

  if (disabled) {
    return (
      <div
        role="group"
        aria-label={`${title} — ${L.comingSoonBadge}`}
        aria-disabled="true"
        className="card block rounded-xl p-6 text-start opacity-60 select-none cursor-not-allowed"
      >
        {body}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'card group block w-full rounded-xl p-6 text-start transition-[transform,border-color,background-color] duration-300',
        'hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-muted/30',
      )}
    >
      {body}
    </button>
  )
}
