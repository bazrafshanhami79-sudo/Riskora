import { Calculator, FileEdit, FileWarning, type LucideIcon } from 'lucide-react'
import { L } from '@/labels'
import { AppHeader } from '@/components/AppHeader'
import { Disclaimer } from '@/components/Disclaimer'
import { GradientBackground } from '@/components/GradientBackground'
import { ToolCard } from '@/components/ToolCard'
import type { Route } from '@/routes'

type ToolEntry =
  | { status: 'live'; route: Route; icon: LucideIcon; title: string; description: string; cta: string }
  | { status: 'comingSoon'; icon: LucideIcon; title: string; description: string }

const TOOLS: ToolEntry[] = [
  {
    status: 'live',
    route: 'ear',
    icon: Calculator,
    title: L.toolEarTitle,
    description: L.toolEarDesc,
    cta: L.toolEarCta,
  },
  {
    status: 'live',
    route: 'endorsement',
    icon: FileEdit,
    title: L.toolEndorsementTitle,
    description: L.toolEndorsementDesc,
    cta: L.toolEndorsementCta,
  },
  {
    status: 'comingSoon',
    icon: FileWarning,
    title: L.toolClaimsTitle,
    description: L.toolClaimsDesc,
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

      {/* Tools as an icon-fronted card grid. */}
      <section className="mx-auto max-w-[1400px] px-6 py-20 lg:px-12">
        <span className="eyebrow">{L.landingToolsEyebrow}</span>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) =>
            tool.status === 'live' ? (
              <ToolCard
                key={tool.route}
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                cta={tool.cta}
                onClick={() => onNavigate(tool.route)}
              />
            ) : (
              <ToolCard
                key="claims"
                icon={tool.icon}
                title={tool.title}
                description={tool.description}
                disabled
              />
            ),
          )}
        </div>

        <div className="mt-16 max-w-3xl">
          <Disclaimer />
        </div>
      </section>
    </div>
  )
}
