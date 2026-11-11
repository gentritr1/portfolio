/** Shared scroll landmarks and capability detection; neither needs the graphics runtime. */
export const STAGE = { hero: 0, lab: 1, ledger: 2, modes: 3, sim: 4, contact: 5 } as const

export function hasWebGL() {
  try {
    const context = document.createElement('canvas').getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/** `?debug=1`: one console line per motion event (scene ready, first field frame, each reveal, each case open), with times. */
const DEBUG = typeof location !== 'undefined' && new URLSearchParams(location.search).get('debug') === '1'
export function dlog(event: string, detail = '') {
  if (DEBUG) console.info(`[motion] ${event} t=${Math.round(performance.now())}ms${detail ? ' ' + detail : ''}`)
}

/** When the visitor last pressed, typed, scrolled or touched: start-up work that cannot be split waits for a quiet moment. */
export let lastInput = 0
if (typeof addEventListener === 'function') {
  for (const type of ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'])
    addEventListener(type, () => { lastInput = performance.now() }, { capture: true, passive: true })
}
