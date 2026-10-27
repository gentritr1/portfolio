import { useSyncExternalStore } from 'react'

/** cubic-bezier(x1, y1, x2, y2) as a function of progress, solved for x by Newton's method. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const a = (p: number, q: number) => 1 - 3 * q + 3 * p, b = (p: number, q: number) => 3 * q - 6 * p, c = (p: number) => 3 * p
  const at = (t: number, p: number, q: number) => ((a(p, q) * t + b(p, q)) * t + c(p)) * t
  const slope = (t: number, p: number, q: number) => 3 * a(p, q) * t * t + 2 * b(p, q) * t + c(p)
  return (x: number) => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const err = at(t, x1, x2) - x, d = slope(t, x1, x2)
      if (Math.abs(err) < 1e-6 || Math.abs(d) < 1e-6) break
      t = Math.min(1, Math.max(0, t - err / d))
    }
    return at(t, y1, y2)
  }
}

/** The draft's one settling curve, as in the CSS: cubic-bezier(.16, 1, .3, 1). */
export const ease = bezier(0.16, 1, 0.3, 1)

const reducedQuery = () => matchMedia('(prefers-reduced-motion: reduce)')

/** Live prefers-reduced-motion: re-renders when the setting changes while the page is open. */
export function useReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const q = reducedQuery()
      q.addEventListener('change', onChange)
      return () => q.removeEventListener('change', onChange)
    },
    () => reducedQuery().matches,
    () => false,
  )
}

let webgl: boolean | undefined
export function canUseWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement('canvas')
      webgl = !!(c.getContext('webgl2') || c.getContext('webgl'))
    } catch {
      webgl = false
    }
  }
  return webgl
}
