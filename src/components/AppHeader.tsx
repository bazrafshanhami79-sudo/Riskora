import * as React from 'react'
import { ArrowLeft } from 'lucide-react'
import { L } from '@/labels'
import { cn } from '@/lib/utils'

/**
 * Chrome shared by every view.
 *
 * Follows the reference navigation: transparent at rest, condensing into a
 * floating bordered bar once scrolled, with a serif wordmark and a mono
 * trademark tick.
 */
export function AppHeader({
  onHome,
  eyebrow,
  actions,
  panel,
}: {
  /** Omitted on the landing view, where there is nowhere to go back to. */
  onHome?: () => void
  eyebrow?: React.ReactNode
  actions?: React.ReactNode
  /** Expandable region rendered beneath the bar (e.g. currency settings). */
  panel?: React.ReactNode
}) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const condensed = scrolled || Boolean(panel)

  return (
    <header
      className={cn('sticky z-50 transition-all duration-500', condensed ? 'top-3 px-3' : 'top-0')}
    >
      <nav
        className={cn(
          'mx-auto transition-all duration-500',
          condensed
            ? 'max-w-[1200px] rounded-lg border border-border bg-background/85 backdrop-blur-xl'
            : 'max-w-[1400px] border border-transparent bg-transparent',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-4 px-5 transition-all duration-500 lg:px-8',
            condensed ? 'h-14' : 'h-20',
          )}
        >
          <div className="flex min-w-0 items-baseline gap-2">
            <span
              className={cn('font-display transition-all duration-500', condensed ? 'text-xl' : 'text-2xl')}
            >
              {L.appName}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">TM</span>
            {eyebrow ? (
              <span className="hidden truncate font-mono text-xs text-muted-foreground sm:inline">
                — {eyebrow}
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-4">
            {actions}
            {onHome ? (
              <button
                type="button"
                onClick={onHome}
                className="group relative cursor-pointer text-sm text-foreground/70 transition-colors duration-300 hover:text-foreground"
              >
                <span className="inline-flex items-center gap-1.5">
                  <ArrowLeft className="size-3.5 -scale-x-100" aria-hidden />
                  {L.backHome}
                </span>
                <span className="absolute -bottom-1 right-0 h-px w-0 bg-foreground transition-all duration-300 group-hover:w-full" />
              </button>
            ) : null}
          </div>
        </div>
        {panel}
      </nav>
    </header>
  )
}
