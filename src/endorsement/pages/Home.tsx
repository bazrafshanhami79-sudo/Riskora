import { IconArrowRight, IconCoins, IconRefresh, IconTrendingUpDown } from '../components/icons'
import { DayArcIllustration } from '../components/DayArcIllustration'

export type ScenarioId = 'capitalChange' | 'renewal'

const CARDS: { id: ScenarioId; title: string; description: string; Icon: typeof IconRefresh; accent: string }[] = [
  {
    id: 'capitalChange',
    title: 'افزایش یا کاهش سرمایه',
    description: 'محاسبه حق بیمه الحاقیه برای افزایش یا کاهش سرمایه حین مدت بیمه‌نامه، بر اساس مدت باقی‌مانده هر قلم.',
    Icon: IconTrendingUpDown,
    accent: 'from-primary to-primary-light',
  },
  {
    id: 'renewal',
    title: 'تمدید بیمه‌نامه',
    description: 'محاسبه حق بیمه دوره جدید تمدید، با مدت مبنا و مدت تمدید کاملاً مستقل از هم.',
    Icon: IconRefresh,
    accent: 'from-accent to-primary-light',
  },
]

function FormulaChip({ label }: { label: string }) {
  return <span className="glass rounded-xl px-3 py-2 text-xs font-semibold text-foreground sm:text-sm">{label}</span>
}

function FormulaOperator({ children }: { children: string }) {
  return <span className="text-lg font-bold text-primary-light sm:text-xl">{children}</span>
}

export function Home({ onSelect }: { onSelect: (id: ScenarioId) => void }) {
  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 items-center gap-8 sm:grid-cols-[1.2fr_1fr]">
        <div className="text-center sm:text-right">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">چه محاسبه‌ای می‌خواهید انجام دهید؟</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            حق بیمه به‌صورت روزشمار، دقیقاً بر اساس تعداد روزهای واقعی محاسبه می‌شود — یکی از دو سناریوی زیر را انتخاب
            کنید.
          </p>
        </div>
        <DayArcIllustration className="mx-auto h-40 w-40 sm:h-52 sm:w-52" />
      </div>

      <div className="glass no-print flex flex-wrap items-center justify-center gap-2 rounded-2xl p-4 sm:gap-3 sm:p-5">
        <FormulaChip label="نرخ بیمه‌نامه" />
        <FormulaOperator>÷</FormulaOperator>
        <FormulaChip label="مدت مبنا (روز)" />
        <FormulaOperator>×</FormulaOperator>
        <FormulaChip label="مدت مورد محاسبه (روز)" />
        <FormulaOperator>=</FormulaOperator>
        <span className="flex items-center gap-1.5 rounded-xl bg-gradient-to-l from-primary to-primary-light px-3 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/25 sm:text-sm">
          <IconCoins className="h-4 w-4" />
          حق بیمه
        </span>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {CARDS.map(({ id, title, description, Icon, accent }) => (
          <button
            key={id}
            type="button"
            onClick={() => onSelect(id)}
            className="press group glass relative flex cursor-pointer flex-col items-start gap-4 overflow-hidden rounded-3xl p-6 text-right shadow-lg shadow-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/20 sm:p-8"
          >
            <span
              aria-hidden="true"
              className={`absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-25`}
            />
            <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-primary-foreground shadow-md shadow-primary/30 transition-transform duration-300 group-hover:scale-105`}>
              <Icon className="h-7 w-7" />
            </span>
            <span className="relative text-lg font-bold text-foreground">{title}</span>
            <span className="relative text-sm leading-relaxed text-muted-foreground">{description}</span>
            <span className="relative mt-1 flex items-center gap-1.5 text-sm font-semibold text-primary-light">
              شروع محاسبه
              <IconArrowRight className="h-4 w-4 -scale-x-100 transition-transform duration-300 group-hover:-translate-x-1" />
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
