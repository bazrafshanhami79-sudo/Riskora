import { GrainGradient } from '@paper-design/shaders-react'

/**
 * Animated grain-gradient hero backdrop, from the supplied component.
 *
 * Parameters are the component's own. `aria-hidden` and `pointer-events-none`
 * because it is purely decorative and must never take a click from the page.
 */
export function GradientBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
      <GrainGradient
        style={{ height: '100%', width: '100%' }}
        colorBack="hsl(0, 0%, 0%)"
        softness={0.76}
        intensity={0.45}
        noise={0}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={1}
        colors={['hsl(193, 85%, 66%)', 'hsl(196, 100%, 83%)', 'hsl(195, 100%, 50%)']}
      />
    </div>
  )
}
