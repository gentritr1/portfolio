import { useEffect, useState, type RefObject } from 'react'
import type { RefractiveScene } from './scene'
import { tune } from './tune'

/**
 * The debug view, shown only with ?tune in the URL. It draws what is otherwise invisible: tap targets (mint ≥ 44 px, red
 * under), the settle line at 60% of the view with each chapter's progress, the field's energy, and the timings of the last
 * "Read the case". The motion variants compared here on 2026-10-28 are gone; the chosen values live in the code.
 */
export function TunePanel({ scene }: { scene: RefObject<RefractiveScene | null> }) {
  const [debug, setDebug] = useState(tune.debug)
  const [ring, setRing] = useState(0)
  const [log, setLog] = useState<string[]>([])

  useEffect(() => {
    tune.debug = debug
    document.documentElement.toggleAttribute('data-tune-debug', debug)
    if (!debug) return
    dispatchEvent(new Event('scroll'))
    // Tap targets: every link and button, outlined by whether it meets 44 × 44.
    const mark = () => document.querySelectorAll<HTMLElement>('.re-root :is(a, button, summary, input):not(.re-tune *)').forEach((el) => {
      const r = el.getBoundingClientRect()
      el.dataset.tap = r.width && (r.width < 44 || r.height < 44) ? 'small' : 'ok'
    })
    mark()
    const t = setInterval(() => { mark(); setRing(scene.current?.stats.ring ?? 0) }, 250)
    // State transitions: when "Read the case" starts, is ready, and finishes.
    const start = document.startViewTransition?.bind(document)
    if (start) {
      document.startViewTransition = ((cb: Parameters<typeof start>[0]) => {
        const t0 = performance.now()
        const vt = start(cb)
        const ms = () => `${Math.round(performance.now() - t0)} ms`
        vt.ready.then(() => setLog((l) => [`ready ${ms()}`, ...l].slice(0, 6)))
        vt.finished.then(() => setLog((l) => [`finished ${ms()}`, ...l].slice(0, 6)))
        setLog((l) => [`start ${location.pathname.split('/').pop()}`, ...l].slice(0, 6))
        return vt
      }) as typeof document.startViewTransition
    }
    return () => {
      clearInterval(t)
      if (start) document.startViewTransition = start
      document.querySelectorAll<HTMLElement>('[data-tap]').forEach((el) => delete el.dataset.tap)
    }
  }, [debug, scene])

  return (
    <aside className="re-tune re-solid" aria-label="Debug view">
      <div className="re-tune-row">
        <span>Debug</span>
        <button type="button" aria-pressed={debug} onClick={() => setDebug((d) => !d)}>{debug ? 'On' : 'Off'}</button>
        {debug && <span className="re-num">field energy {ring.toFixed(3)}</span>}
      </div>
      {debug && log.length > 0 && <p className="re-tune-log re-num">{log.join(' · ')}</p>}
    </aside>
  )
}
