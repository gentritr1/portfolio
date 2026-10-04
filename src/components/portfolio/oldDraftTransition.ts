import { flushSync } from 'react-dom'

/** Native snapshots keep a local project's old and new state until both finish. */
let activeSwap: ViewTransition | undefined
export function transitionOldDraft(update: () => void) {
  activeSwap?.skipTransition()
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !document.startViewTransition) { update(); return }
  const transition = document.startViewTransition(() => flushSync(update))
  activeSwap = transition
  void transition.finished.catch(() => undefined).finally(() => { if (activeSwap === transition) activeSwap = undefined })
}
