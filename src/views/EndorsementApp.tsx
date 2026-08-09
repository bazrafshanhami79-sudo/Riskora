import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { L } from '@/labels'
import { AppHeader } from '@/components/AppHeader'
import { CapitalChangeScenario } from '@/endorsement/scenarios/CapitalChangeScenario'
import { RenewalScenario } from '@/endorsement/scenarios/RenewalScenario'
import { Home, type ScenarioId } from '@/endorsement/pages/Home'

type View = 'home' | ScenarioId

/**
 * The endorsement premium calculator.
 *
 * The scenario components, its Home page and the whole `src/endorsement/calc`
 * engine are the supplied code, unmodified. Only this shell changed: it uses
 * Riskora's shared header instead of the calculator's own title bar, so the
 * two tools read as one product.
 */
export function EndorsementApp({ onHome }: { onHome: () => void }) {
  const [view, setView] = useState<View>('home')

  return (
    <div className="relative min-h-dvh text-foreground">
      <AppHeader onHome={onHome} eyebrow={L.endorsementBadge} />

      <main className="print-container mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6">
        <h1 className="sr-only">{L.toolEndorsementTitle}</h1>

        {view !== 'home' && (
          <button
            type="button"
            onClick={() => setView('home')}
            className="press no-print inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <ArrowRight className="size-4" aria-hidden />
            بازگشت به انتخاب سناریو
          </button>
        )}

        <div className={view === 'home' ? '' : 'glass rounded-2xl p-5 sm:p-8'}>
          {view === 'home' && <Home onSelect={setView} />}
          {view === 'capitalChange' && <CapitalChangeScenario />}
          {view === 'renewal' && <RenewalScenario />}
        </div>

        <p className="no-print pb-4 text-center text-xs text-muted-foreground">
          مبالغ به ریال است. اعداد بر اساس نرخ و تاریخ‌های واردشده به‌صورت آنی محاسبه می‌شوند.
        </p>
      </main>
    </div>
  )
}
