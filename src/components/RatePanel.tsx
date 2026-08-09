import { L } from '@/labels'
import { formatPerMille } from '@/lib/format'
import { AnimatedValue } from '@/components/ui/misc'
import type { EarResult } from '@/engine'

/**
 * The two rates, and nothing else.
 *
 * Both are read straight off the engine, so every input feeds them: the MD
 * technical rate is `effectiveErection + hotTesting + earthquakeLoading +
 * loadingsSubtotal`, and the TPL rate is `baseRate × limitFactor`. Adding an
 * earthquake loading, a maintenance period or an expediting percentage moves
 * the first; changing the TPL category, surroundings or limit moves the second.
 */
export function RatePanel({ result }: { result: EarResult }) {
  const rates = [
    { label: L.mdTechnicalRate, value: result.rate.mdTechnicalRate },
    { label: L.tplRate, value: result.tpl.included ? result.tpl.effectiveRate : 0 },
  ]

  return (
    <dl className="divide-y divide-border">
      {rates.map(({ label, value }) => (
        <div key={label} className="flex items-baseline justify-between gap-4 py-5 first:pt-0">
          <dt className="text-sm text-foreground/70">{label}</dt>
          <dd>
            <AnimatedValue value={value} className="text-2xl font-semibold text-foreground">
              {formatPerMille(value)}
            </AnimatedValue>
          </dd>
        </div>
      ))}
    </dl>
  )
}
