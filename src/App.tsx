import * as React from 'react'
import { Backdrop } from '@/components/Backdrop'
import { Landing } from '@/views/Landing'
import { EarRating } from '@/views/EarRating'
import { EndorsementApp } from '@/views/EndorsementApp'
import { hashForRoute, routeFromHash, type Route } from '@/routes'

/**
 * Application shell: owns the theme, paints the shader backdrop behind every
 * view, and resolves the hash route.
 */
export default function App() {
  const [dark, setDark] = React.useState(true)
  const [route, setRoute] = React.useState<Route>(() => routeFromHash(window.location.hash))

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  // Keep the view in step with back/forward and hand-edited URLs.
  React.useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = React.useCallback((next: Route) => {
    window.location.hash = hashForRoute(next)
    setRoute(next)
    window.scrollTo({ top: 0 })
  }, [])

  const toggleTheme = React.useCallback(() => setDark((d) => !d), [])
  const goHome = React.useCallback(() => navigate('home'), [navigate])

  return (
    <>
      <Backdrop />
      {route === 'home' && (
        <Landing dark={dark} onToggleTheme={toggleTheme} onNavigate={navigate} />
      )}
      {route === 'ear' && (
        <EarRating dark={dark} onToggleTheme={toggleTheme} onHome={goHome} />
      )}
      {route === 'endorsement' && (
        <EndorsementApp dark={dark} onToggleTheme={toggleTheme} onHome={goHome} />
      )}
    </>
  )
}
