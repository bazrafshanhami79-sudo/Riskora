import { ArrowLeft, CalendarClock, Gauge } from 'lucide-react'
import { L } from '@/labels'
import { AppHeader } from '@/components/AppHeader'
import { Disclaimer } from '@/components/Disclaimer'
import type { Route } from '@/routes'

const TOOLS: {
  route: Route
  title: string
  description: string
  cta: string
  Icon: typeof Gauge
}[] = [
  {
    route: 'ear',
    title: L.toolEarTitle,
    description: L.toolEarDesc,
    cta: L.toolEarCta,
    Icon: Gauge,
  },
  {
    route: 'endorsement',
    title: L.toolEndorsementTitle,
    description: L.toolEndorsementDesc,
    cta: L.toolEndorsementCta,
    Icon: CalendarClock,
  },
]

export function Landing({
  dark,
  onToggleTheme,
  onNavigate,
}: {
  dark: boolean
  onToggleTheme: () => void
  onNavigate: (route: Route) => void
}) {
  return (
    <div className="relative min-h-dvh text-fg">
      <AppHeader dark={dark} onToggleTheme={onToggleTheme} subtitle={L.appSubtitle} />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold text-fg sm:text-3xl">{L.landingTitle}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-[1.9] text-fg-muted">{L.landingSubtitle}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {TOOLS.map(({ route, title, description, cta, Icon }) => (
            <button
              key={route}
              type="button"
              onClick={() => onNavigate(route)}
              className="card group flex cursor-pointer flex-col items-start gap-4 p-6 text-start transition-colors duration-[--duration-base] hover:border-accent/50"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent-quiet text-accent">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-base font-semibold text-fg">{title}</span>
              <span className="text-sm leading-[1.9] text-fg-muted">{description}</span>
              <span className="mt-auto flex items-center gap-1.5 pt-2 text-sm font-medium text-accent">
                {cta}
                <ArrowLeft
                  className="size-4 transition-transform duration-[--duration-base] group-hover:-translate-x-1"
                  aria-hidden
                />
              </span>
            </button>
          ))}
        </div>

        <div className="mt-10">
          <Disclaimer />
        </div>
      </main>
    </div>
  )
}
