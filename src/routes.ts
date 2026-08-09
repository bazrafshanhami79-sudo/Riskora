/**
 * Hash-based routing.
 *
 * Deliberately hash-based rather than path-based: it gives deep links and
 * working back/forward with no router dependency, and needs no SPA rewrite
 * rule on the host (a path-based router would 404 on refresh at /ear).
 */
export type Route = 'home' | 'ear' | 'endorsement'

const ROUTES: Route[] = ['home', 'ear', 'endorsement']

export function routeFromHash(hash: string): Route {
  const value = hash.replace(/^#\/?/, '')
  return (ROUTES as string[]).includes(value) ? (value as Route) : 'home'
}

export function hashForRoute(route: Route): string {
  return route === 'home' ? '#/' : `#/${route}`
}
