import { IconBuilding } from './icons'

/**
 * Signature decorative graphic for the Home hero: a radial "day-counting"
 * dial (ticks around a ring, a partially-filled arc, a pulsing "today"
 * marker) with the brand mark at the center. Purely decorative — no data.
 */
export function DayArcIllustration({ className }: { className?: string }) {
  const ticks = Array.from({ length: 36 }, (_, i) => i)
  const arcProgress = 0.68 // how much of the ring reads as "elapsed"

  return (
    <div className={`relative flex items-center justify-center ${className ?? ''}`}>
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="dayArcGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {ticks.map((i) => {
          const angle = (i / ticks.length) * 360
          const major = i % 3 === 0
          return (
            <rect
              key={i}
              x="99"
              y={major ? '10' : '14'}
              width={major ? '2' : '1.2'}
              height={major ? '10' : '6'}
              rx="1"
              fill="currentColor"
              className="text-white/15"
              transform={`rotate(${angle} 100 100)`}
            />
          )
        })}

        <circle cx="100" cy="100" r="72" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="100"
          cy="100"
          r="72"
          fill="none"
          stroke="url(#dayArcGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${2 * Math.PI * 72 * arcProgress} ${2 * Math.PI * 72}`}
          transform="rotate(-90 100 100)"
        />

        <circle cx="100" cy="27" r="5" fill="#22d3ee" className="animate-pulse">
          <title>امروز</title>
        </circle>
      </svg>

      <div className="glass absolute flex h-20 w-20 items-center justify-center rounded-full text-primary-light shadow-lg shadow-primary/20 sm:h-24 sm:w-24">
        <IconBuilding className="h-9 w-9 sm:h-10 sm:w-10" />
      </div>
    </div>
  )
}
