import { ArrowLeft } from 'lucide-react'
import { L } from '@/labels'
import { AppHeader } from '@/components/AppHeader'
import { Disclaimer } from '@/components/Disclaimer'
import { GradientBackground } from '@/components/GradientBackground'
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

export function Landing({ onNavigate }: { onNavigate: (route: Route) => void }) {
  return (
    // Typeface is Vazirmatn throughout this page — no serif display stack.
    <div className="relative min-h-dvh font-sans">
      <AppHeader />

      {/* Hero: the animated gradient, with the headline over it. */}
      <section className="relative flex min-h-[62vh] items-center overflow-hidden">
        <GradientBackground />
        {/* Scrim: holds the headline's contrast steady as the shader animates. */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-black/35" aria-hidden />

        <div className="relative mx-auto w-full max-w-[1400px] px-6 py-20 lg:px-12 lg:py-28">
          <span className="text-sm text-white/75">{L.appSubtitle}</span>
          <h1 className="mt-6 text-[clamp(2.25rem,7vw,5rem)] font-bold leading-[1.25] text-white">
            {L.landingTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-[1.9] text-white/80">
            {L.landingSubtitle}
          </p>
        </div>
      </section>

      {/* Tools as numbered rows separated by hairlines. */}
      <section className="mx-auto max-w-[1400px] px-6 pb-20 lg:px-12">
        <div className="border-t border-border">
          {TOOLS.map(({ route, number, title, description, cta }) => (
            <button
              key={route}
              type="button"
              onClick={() => onNavigate(route)}
              className="group grid w-full cursor-pointer grid-cols-1 items-start gap-4 border-b border-border py-10 text-start transition-colors duration-300 hover:bg-muted/60 sm:grid-cols-[auto_1fr_auto] sm:gap-10 sm:px-4"
            >
              <span className="font-mono text-sm text-muted-foreground">{number}</span>

              <span className="min-w-0">
                <span className="block text-2xl font-semibold leading-tight sm:text-3xl">
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
      </section>
    </div>
  )
}
