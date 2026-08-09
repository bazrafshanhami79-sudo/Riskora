import * as React from 'react'
import { ArrowLeft, Moon, Sun } from 'lucide-react'
import { L } from '@/labels'
import { Badge } from '@/components/ui/misc'
import { Button } from '@/components/ui/button'

/**
 * Chrome shared by every view: brand, optional back link, view-specific
 * actions, and the theme toggle. Solid rather than translucent — it sits over
 * scrolling content, where backdrop-filter repaints every frame.
 */
export function AppHeader({
  dark,
  onToggleTheme,
  onHome,
  badge,
  subtitle,
  actions,
  panel,
}: {
  dark: boolean
  onToggleTheme: () => void
  /** Omit on the landing view, where there is nowhere to go back to. */
  onHome?: () => void
  badge?: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  /** Expandable region rendered beneath the bar (e.g. currency settings). */
  panel?: React.ReactNode
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-base font-semibold text-fg">{L.appName}</span>
            {badge}
          </div>
          {subtitle ? <p className="field-help truncate">{subtitle}</p> : null}
        </div>

        <div className="ms-auto flex items-center gap-1">
          {onHome ? (
            <Button variant="ghost" size="sm" onClick={onHome} className="gap-1.5">
              <ArrowLeft aria-hidden className="-scale-x-100" />
              {L.backHome}
            </Button>
          ) : null}
          {actions}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label={dark ? 'تغییر به پوستهٔ روشن' : 'تغییر به پوستهٔ تیره'}
            title={dark ? 'پوستهٔ روشن' : 'پوستهٔ تیره'}
          >
            {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
          </Button>
        </div>
      </div>
      {panel}
    </header>
  )
}

export { Badge }
