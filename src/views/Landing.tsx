import { ArrowLeft } from 'lucide-react'
import { L } from '@/labels'
import { AppHeader } from '@/components/AppHeader'
import { Disclaimer } from '@/components/Disclaimer'
import type { Route } from '@/routes'

const TOOLS: { route: Route; number: string; title: string; description: string; cta: string }[] = [
  {
    route: 'ear',
    number: '۰۱',
    title: L.toolEarTitle,
    description: L.toolEarDesc,
    cta: L.toolEarCta,
  },
  {
    route: 'endorsement',
    number: '۰۲',
    title: L.toolEndorsementTitle,
    description: L.toolEndorsementDesc,
    cta: L.toolEndorsementCta,
  },
]

/** The reference's faint measure grid, behind the hero. */
function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-30" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute inset-x-0 h-px bg-foreground/10"
          style={{ top: `${12.5 * (i + 1)}%` }}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute inset-y-0 w-px bg-foreground/10"
          style={{ left: `${8.33 * (i + 1)}%` }}
        />
      ))}
    </div>
  )
}

export function Landing({ onNavigate }: { onNavigate: (route: Route) => void }) {
  return (
    <div className="relative min-h-dvh">
      <AppHeader />

      <section className="relative overflow-hidden">
        <GridLines />

        <div className="relative z-10 mx-auto max-w-[1400px] px-6 pb-16 pt-16 lg:px-12 lg:pb-24 lg:pt-24">
          <span className="eyebrow">{L.appSubtitle}</span>

          <h1 className="mt-8 font-display text-[clamp(2.5rem,8vw,6rem)] leading-[1.05]">
            {L.landingTitle}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-[1.9] text-foreground/70">
            {L.landingSubtitle}
          </p>

          {/* Tools as the reference's numbered rows, not boxed cards. */}
          <div className="mt-16 border-t border-border">
            {TOOLS.map(({ route, number, title, description, cta }) => (
              <button
                key={route}
                type="button"
                onClick={() => onNavigate(route)}
                className="group grid w-full cursor-pointer grid-cols-1 items-start gap-4 border-b border-border py-10 text-start transition-colors duration-300 hover:bg-muted/60 sm:grid-cols-[auto_1fr_auto] sm:gap-10 sm:px-4"
              >
                <span className="font-mono text-sm text-muted-foreground">{number}</span>

                <span className="min-w-0">
                  <span className="block font-display text-2xl leading-tight sm:text-3xl">
                    {title}
                  </span>
                  <span className="mt-3 block max-w-xl text-sm leading-[1.9] text-foreground/70">
                    {description}
                  </span>
                </span>

                <span className="inline-flex items-center gap-2 self-center whitespace-nowrap text-sm">
                  {cta}
                  <ArrowLeft
                    className="size-4 transition-transform duration-300 group-hover:-translate-x-1"
                    aria-hidden
                  />
                </span>
              </button>
            ))}
          </div>

          <div className="mt-16 max-w-3xl">
            <Disclaimer />
          </div>
        </div>
      </section>
    </div>
  )
}
