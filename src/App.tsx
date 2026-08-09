import * as React from 'react'
import { Landing } from '@/views/Landing'
import { EarRating } from '@/views/EarRating'
import { EndorsementApp } from '@/views/EndorsementApp'
import { hashForRoute, routeFromHash, type Route } from '@/routes'

/**
 * Application shell: resolves the hash route and carries the page-wide noise
 * overlay from the design reference.
 */
export default function App() {
  const [route, setRoute] = React.useState<Route>(() => routeFromHash(window.location.hash))

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

  const goHome = React.useCallback(() => navigate('home'), [navigate])

  return (
    <div className="noise-overlay relative min-h-dvh overflow-x-hidden">
      {route === 'home' && <Landing onNavigate={navigate} />}
      {route === 'ear' && <EarRating onHome={goHome} />}
      {route === 'endorsement' && <EndorsementApp onHome={goHome} />}
    </div>
  )
}
