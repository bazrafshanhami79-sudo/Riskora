import { ShaderCanvas } from '@/components/ui/phosphor-30'

/**
 * Fullscreen shader backdrop, painted behind the whole app.
 *
 * Sits at -z-10 over an opaque `--bg` base, so the cards, header and result
 * bar stay fully opaque on top of it — the measured 4.5:1 text contrast is
 * unaffected by whatever the shader happens to be doing.
 *
 * `pointer-events: none` because the shader declares `iMouse` but never reads
 * it, so nothing is lost and the form can never lose a click to the canvas.
 * `pixelRatio={1}` keeps a HiDPI display from quadrupling the fragment work.
 */
export function Backdrop() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden bg-bg"
      style={{ pointerEvents: 'none' }}
    >
      <ShaderCanvas pixelRatio={1} style={{ opacity: 'var(--backdrop-opacity)' }} />
    </div>
  )
}
