import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { projects } from '../../content/projects'
import { CLUSTERS, createScene, hasWebGL, type EventHorizonScene } from './scene'
import './event-horizon.css'

const work = projects.slice(0, 6).map((p, i) => ({
  slug: p.slug,
  name: p.name,
  kind: p.kind,
  years: p.years,
  role: p.role,
  stack: p.stack,
  summary: p.summary,
  metric: p.featured?.readouts?.[0] ? `${p.featured.readouts[0].value}${p.featured.readouts[0].to ? ` → ${p.featured.readouts[0].to}` : ''} · ${p.featured.readouts[0].label}` : p.line,
  readouts: p.featured?.readouts ?? [],
  cluster: i % CLUSTERS,
}))

export default function Draft() {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<EventHorizonScene | null>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [fps, setFps] = useState(0)
  const [count] = useState(() => (innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 ? 40_000 : 120_000))
  const [noGl, setNoGl] = useState(() => !hasWebGL())
  const [open, setOpen] = useState<number | null>(null)
  const [reduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const host = hostRef.current
    if (!host || noGl) return
    let scene: EventHorizonScene
    try { scene = createScene(host, count, reduced, setFps) } catch { queueMicrotask(() => setNoGl(true)); return }
    sceneRef.current = scene
    let pending = false, px = 0, py = 0, inside = false
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      scene.setMorph(max > 0 ? Math.min(2, (scrollY / max) * 2.2) : 0)
    }
    const onMove = (e: PointerEvent) => {
      px = (e.clientX / innerWidth) * 2 - 1; py = -(e.clientY / innerHeight) * 2 + 1; inside = true
      if (pending) return
      pending = true
      requestAnimationFrame(() => { pending = false; scene.setPointer(px, py, inside) })
    }
    const onLeave = () => { inside = false; scene.setPointer(px, py, false) }
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a, [role="dialog"]')) return
      scene.shock((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)
    }
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    addEventListener('pointerdown', onDown)
    return () => {
      removeEventListener('scroll', onScroll)
      removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      removeEventListener('pointerdown', onDown)
      scene.dispose()
      sceneRef.current = null
    }
  }, [reduced, count, noGl])

  useEffect(() => {
    sceneRef.current?.focus(open === null ? null : work[open].cluster)
    if (open === null) { lastFocus.current?.focus(); return }
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(null) }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [open])

  const p = open === null ? null : work[open]

  return (
    <div className="eh-root">
      <div className="eh-canvas" ref={hostRef} aria-hidden="true" />
      {noGl && <p className="eh-nogl">WebGL is unavailable in this browser, so the particle field is off. Everything else still works.</p>}
      <div className="eh-hud" aria-hidden="true"><span /><span /><span /><span /></div>

      <nav className="eh-nav" aria-label="Primary">
        <span className="eh-logo">G/R</span>
        <span className="eh-status"><i className="eh-pulse" />Status: Online // Deploying Agents</span>
        <a href="#eh-work" className="eh-navlink">Work</a>
      </nav>

      <header className="eh-hero">
        <h1 className="eh-title">GENTRIT</h1>
        <p className="eh-sub">Senior Frontend &amp; AI Engineer // Building Fluid Interfaces for Complex Model Architectures</p>
        <dl className="eh-tele" aria-label="Render telemetry">
          <div><dt>FPS</dt><dd data-testid="eh-fps">{noGl ? '—' : fps}</dd></div>
          <div><dt>MESH DENSITY</dt><dd data-testid="eh-count">{noGl ? '—' : `${count.toLocaleString('en-US')} pts`}</dd></div>
          <div><dt>MODEL INFERENCE</dt><dd>0.04s <small>(placeholder)</small></dd></div>
        </dl>
      </header>

      <section className="eh-spacer" aria-hidden="true" />

      <section id="eh-work" className="eh-work" aria-labelledby="eh-work-h">
        <h2 id="eh-work-h" className="eh-h2">Selected systems</h2>
        <ul className="eh-grid">
          {work.map((w, i) => (
            <li key={w.slug} className={`eh-cell eh-cell-${i}`}>
              <button type="button" className="eh-card" onClick={(e) => { lastFocus.current = e.currentTarget; setOpen(i) }} aria-haspopup="dialog">
                <span className="eh-kind">{w.kind}{w.years ? ` · ${w.years}` : ''}</span>
                <span className="eh-name">{w.name}</span>
                <span className="eh-metric">{w.metric}</span>
                <span className="eh-tags">{w.stack.slice(0, 4).map((t) => <span key={t}>{t}</span>)}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <footer className="eh-foot">Draft · Event Horizon · particles computed on the GPU</footer>

      <AnimatePresence>
        {p && (
          <motion.aside
            key={p.slug}
            role="dialog" aria-modal="true" aria-labelledby="eh-drawer-h"
            className="eh-drawer"
            initial={reduced ? { opacity: 0 } : { x: '100%' }}
            animate={reduced ? { opacity: 1 } : { x: 0 }}
            exit={reduced ? { opacity: 0 } : { x: '100%' }}
            transition={{ type: 'tween', duration: reduced ? 0.01 : 0.45, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <button ref={closeRef} type="button" className="eh-close" onClick={() => setOpen(null)}>Close <kbd>Esc</kbd></button>
            <h2 id="eh-drawer-h" className="eh-dname">{p.name}</h2>
            <h3>System Specs</h3>
            <dl className="eh-specs">
              <div><dt>Role</dt><dd>{p.role}</dd></div>
              <div><dt>Years</dt><dd>{p.years ?? 'n/a'}</dd></div>
              <div><dt>Stack</dt><dd>{p.stack.join(' · ')}</dd></div>
            </dl>
            <p className="eh-summary">{p.summary}</p>
            <h3>Architecture</h3>
            <div className="eh-arch" aria-label="Architecture diagram placeholder">
              {['Client', p.stack[0] ?? 'UI', p.stack[1] ?? 'State', 'API'].map((n, i, a) => (
                <span key={n + i} className="eh-node">{n}{i < a.length - 1 && <i aria-hidden="true">→</i>}</span>
              ))}
              <small>Placeholder diagram</small>
            </div>
            <h3>Metrics &amp; Performance</h3>
            {p.readouts.length ? (
              <ul className="eh-readouts">{p.readouts.map((r) => <li key={r.label}><b>{r.value}{r.to ? `→${r.to}` : ''}</b>{r.label}</li>)}</ul>
            ) : <p className="eh-summary">{p.metric}</p>}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
