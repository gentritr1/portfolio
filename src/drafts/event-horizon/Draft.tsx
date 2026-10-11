import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router'
import { createScene, hasWebGL, stageOf, type EventHorizonScene, type Variant } from './scene'
import { breadth, learned, links, own, ringProof, steps, systems } from './data'
import { Dive } from './Dive'
import './event-horizon.css'

const OVERVIEW = stageOf.overview(systems.length)
const BACKDROP = stageOf.backdrop(systems.length)
const TITLE = 'GENTRIT'

function useMedia(query: string) {
  const [match, setMatch] = useState(() => matchMedia(query).matches)
  useEffect(() => {
    const m = matchMedia(query)
    const on = () => setMatch(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [query])
  return match
}

/** The full case for one project, read over the live field: the camera holds on that project's screen beside the text. */
function CaseView({ index, reduced, onBack }: { index: number; reduced: boolean; onBack(): void }) {
  const s = systems[index]
  const prev = systems[(index - 1 + systems.length) % systems.length]
  const next = systems[(index + 1) % systems.length]
  const heading = useRef<HTMLDivElement>(null)
  useEffect(() => { heading.current?.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true }) }, [index])
  return (
    <main className="eh-case" aria-labelledby="eh-case-h">
      <div className="eh-case-col">
        <button type="button" className="eh-btn eh-case-back" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          Back to the orbit
        </button>
        <div className="eh-case-body eh-solid" ref={heading}>
          <Dive key={s.slug} system={s} reduced={reduced} page />
        </div>
        <nav className="eh-case-more" aria-label="More projects">
          {[{ label: 'Previous', p: prev }, { label: 'Next', p: next }].map(({ label, p }) => (
            <Link key={label} className="eh-case-link eh-solid" to={`/drafts/event-horizon/${p.slug}`}>
              <img src={p.texture} alt="" width={160} height={100} loading="lazy" decoding="async" data-shape={p.aspect < 1 ? 'phone' : 'wide'} />
              <span>
                <small className="eh-mono">{label}</small>
                <strong>{p.name}</strong>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </main>
  )
}

/** Ways to show the projects after the opening, to compare by eye. Halos is the current one. */
const VARIANTS: { id: Variant; label: string; note: string }[] = [
  { id: 'halo', label: 'Halos', note: 'Particles circle each screen.' },
  { id: 'glass', label: 'Glass', note: 'Dark glass panes lit by the disk.' },
  { id: 'orrery', label: 'Orrery', note: 'Orbits by year: outer orbits are older work.' },
  { id: 'lens', label: 'Lensing', note: 'The hole bends the light behind it.' },
]
const VARIANT_KEY = 'eh:variant'

export default function Draft() {
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<EventHorizonScene | null>(null)
  const drawerRef = useRef<HTMLElement>(null)
  const lastFocus = useRef<HTMLElement | null>(null)
  const labelRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [fps, setFps] = useState(0)
  const [calls, setCalls] = useState(0)
  const [sceneReady, setSceneReady] = useState(false)
  const [count] = useState(() => (innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 ? 45_000 : 120_000))
  const [noGl, setNoGl] = useState(() => !hasWebGL())
  const [open, setOpen] = useState<number | null>(null)
  const [stage, setStage] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const narrow = useMedia('(max-width: 767px)')
  // /drafts/event-horizon/<slug> shows that project's full case over the field.
  const { '*': rest } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const caseIdx = systems.findIndex((s) => s.slug === rest)
  // The variant lives in the address (?variant=glass), and is remembered for this visit so case pages keep it.
  const [params, setParams] = useSearchParams()
  const asked = params.get('variant')
  const variant: Variant = VARIANTS.find((v) => v.id === asked)?.id ?? (() => {
    try { return VARIANTS.find((v) => v.id === sessionStorage.getItem(VARIANT_KEY))?.id } catch { return undefined }
  })() ?? 'halo'
  useEffect(() => {
    try { sessionStorage.setItem(VARIANT_KEY, variant) } catch { /* private mode: the address still holds it */ }
    // A variant remembered from earlier in the visit shows in the address too, so a shared link opens the same one.
    if (!asked && variant !== 'halo') setParams((p) => { p.set('variant', variant); return p }, { replace: true, preventScrollReset: true })
  }, [variant, asked, setParams])
  const pickVariant = (v: Variant) => setParams((p) => { if (v === 'halo') p.delete('variant'); else p.set('variant', v); return p }, { replace: true, preventScrollReset: true })
  const inCase = caseIdx >= 0
  const caseRef = useRef(caseIdx)
  useEffect(() => { caseRef.current = caseIdx }, [caseIdx])

  const openSystem = useCallback((i: number, from?: HTMLElement | null) => {
    lastFocus.current = from ?? (document.activeElement as HTMLElement | null)
    setOpen(i)
  }, [])

  // The scene and the scroll journey.
  useEffect(() => {
    const host = hostRef.current
    if (!host || noGl) return
    let scene: EventHorizonScene
    try {
      scene = createScene(host, {
        count,
        reduced,
        bodies: systems.map((s) => ({ texture: s.texture, aspect: s.aspect, tint: s.tint, year: s.years ? Number(s.years.slice(0, 4)) : undefined })),
        variant,
        onStats: (f, c) => { setFps(f); setCalls(c) },
        onHover: setHover,
        onReady: () => setSceneReady(true),
      })
    } catch {
      queueMicrotask(() => setNoGl(true))
      return
    }
    sceneRef.current = scene
    scene.bindLabels(labelRefs.current)

    // Stage anchors: the centre of each anchored section maps to its stage; the viewport centre reads between them.
    let anchors: { y: number; s: number }[] = []
    const measure = () => {
      anchors = [...document.querySelectorAll<HTMLElement>('[data-stage]')]
        .map((el) => {
          const r = el.getBoundingClientRect()
          return { y: r.top + scrollY + r.height / 2, s: Number(el.dataset.stage) }
        })
        .sort((a, b) => a.y - b.y)
    }
    let shown = -1
    const onScroll = () => {
      // On a case page the camera holds on that project's screen, whatever the scroll.
      if (caseRef.current >= 0) { scene.setStage(stageOf.body(caseRef.current)); return }
      const y = scrollY + innerHeight / 2
      let s = anchors[0]?.s ?? 0
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i], b = anchors[i + 1]
        if (y >= a.y && y <= b.y) s = a.s + ((y - a.y) / (b.y - a.y)) * (b.s - a.s)
        else if (y > b.y) s = b.s
      }
      scene.setStage(s)
      const q = Math.round(s * 4) / 4
      if (q !== shown) { shown = q; setStage(q) }
    }
    let pending = false, px = 0, py = 0, inside = false
    // The lens and the camera lean follow a mouse only: on touch the same finger is scrolling.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      px = (e.clientX / innerWidth) * 2 - 1
      py = -(e.clientY / innerHeight) * 2 + 1
      inside = !(e.target as HTMLElement).closest('.eh-solid, [role="dialog"], button, a')
      if (pending) return
      pending = true
      requestAnimationFrame(() => { pending = false; scene.setPointer(px, py, inside) })
    }
    const onLeave = () => { inside = false; scene.setPointer(px, py, false) }
    // A press counts on release, and only if the pointer barely moved, so starting a scroll never fires it.
    // Touch can open a screen with a tap; only a mouse click ripples the field.
    let downX = 0, downY = 0, downOk = false
    const onDown = (e: PointerEvent) => {
      downOk = !(e.target as HTMLElement).closest('.eh-solid, .eh-scrim, [role="dialog"], button, a, input')
      downX = e.clientX
      downY = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      if (!downOk || Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return
      const hit = scene.press((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1, e.pointerType === 'mouse')
      if (hit !== null && caseRef.current < 0) openSystem(hit, null)
    }
    measure()
    onScroll()
    const ro = new ResizeObserver(() => { measure(); onScroll() })
    ro.observe(document.body)
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    addEventListener('pointerdown', onDown)
    addEventListener('pointerup', onUp)
    return () => {
      ro.disconnect()
      removeEventListener('scroll', onScroll)
      removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      removeEventListener('pointerdown', onDown)
      removeEventListener('pointerup', onUp)
      scene.dispose()
      sceneRef.current = null
    }
  }, [reduced, count, noGl, openSystem, variant])

  useEffect(() => {
    document.documentElement.style.cursor = hover !== null && open === null && !inCase ? 'pointer' : ''
    return () => { document.documentElement.style.cursor = '' }
  }, [hover, open, inCase])

  // Drawer: camera focus, scroll lock, Escape, focus trap, focus return.
  useEffect(() => {
    sceneRef.current?.focus(open)
    if (open === null) { lastFocus.current?.focus({ preventScroll: true }); return }
    const html = document.documentElement
    const gutter = innerWidth - html.clientWidth
    html.style.overflow = 'hidden'
    html.style.paddingRight = `${gutter}px`
    const t = setTimeout(() => drawerRef.current?.querySelector<HTMLElement>('.eh-close')?.focus({ preventScroll: true }), 30)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null)
      if (e.key !== 'Tab' || !drawerRef.current) return
      const items = [...drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')]
      const first = items[0], last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      removeEventListener('keydown', onKey)
      html.style.overflow = ''
      html.style.paddingRight = ''
    }
  }, [open])

  // Entering a case closes the drawer and glides the camera to its screen. Leaving returns you to your place in the flight.
  useEffect(() => {
    if (caseIdx >= 0) {
      sceneRef.current?.setStage(stageOf.body(caseIdx))
      return
    }
    const at = (location.state as { at?: string } | null)?.at
    const i = systems.findIndex((s) => s.slug === at)
    if (i < 0) return
    const raf = requestAnimationFrame(() => {
      const el = document.getElementById(`eh-sys-${systems[i].slug}`)
      if (!el) return
      sceneRef.current?.jumpTo(stageOf.body(i))
      const r = el.getBoundingClientRect()
      window.scrollTo({ top: r.top + scrollY + r.height / 2 - innerHeight / 2, behavior: 'instant' })
    })
    return () => cancelAnimationFrame(raf)
  }, [caseIdx, location.state])
  const backToOrbit = () => {
    setOpen(null)
    navigate('/drafts/event-horizon', { state: { at: systems[caseIdx]?.slug } })
  }

  const active = Math.round(stage - 2)
  const journey = !inCase && stage > 1.4 && stage < OVERVIEW - 0.4
  const labelsOn = stage >= OVERVIEW - 0.5 && stage <= OVERVIEW + 0.25
  const sys = open === null ? null : systems[open]
  // A neighbour glides; a far jump scrolls at once and moves the camera straight there, instead of flying past every stop.
  const jump = (i: number) => {
    const el = document.getElementById(`eh-sys-${systems[i].slug}`)
    if (!el) return
    const far = Math.abs(i - active) > 1
    if (far) sceneRef.current?.jumpTo(stageOf.body(i))
    el.scrollIntoView({ behavior: reduced || far ? 'instant' : 'smooth', block: 'center' })
  }

  return (
    <div className="eh-root" data-reduced={reduced || undefined} data-ready={sceneReady || noGl || undefined}>
      <div className="eh-canvas" ref={hostRef} aria-hidden="true" />
      <div className="eh-vignette" aria-hidden="true" />
      {noGl && <p className="eh-nogl eh-mono">WebGL is off in this browser, so the field is hidden. Every project below still opens.</p>}
      <div className="eh-hud" aria-hidden="true"><span /><span /><span /><span /></div>

      {!noGl && (
        <div className="eh-variants eh-solid" role="group" aria-label="How the projects are shown">
          <span className="eh-mono">Variant</span>
          {VARIANTS.map((v) => (
            <button key={v.id} type="button" aria-pressed={variant === v.id} title={v.note} onClick={() => pickVariant(v.id)}>{v.label}</button>
          ))}
          <p className="eh-mono">{VARIANTS.find((v) => v.id === variant)?.note}</p>
        </div>
      )}

      <nav className="eh-nav eh-solid" aria-label="Primary">
        <a className="eh-logo" href="#eh-top">G/R</a>
        <span className="eh-status eh-mono"><i className="eh-pulse" />Status: Online // Deploying Agents</span>
        <a href="#eh-work" className="eh-navlink">Work</a>
        <a href={`mailto:${links.email}`} className="eh-navlink">Contact</a>
      </nav>

      {/* The journey rail: where you are among the systems, and a way to jump. */}
      <ol className="eh-rail eh-solid" data-shown={(journey && open === null) || undefined} aria-label="Systems">
        {systems.map((s, i) => (
          <li key={s.slug}>
            <button type="button" aria-current={i === active || undefined} onClick={() => jump(i)} tabIndex={journey ? 0 : -1}>
              <span className="eh-rail-name">{s.name}</span>
            </button>
          </li>
        ))}
      </ol>

      {inCase ? (
        <CaseView index={caseIdx} reduced={reduced} onBack={backToOrbit} />
      ) : (
        <>
        <header id="eh-top" className="eh-hero" data-stage={0}>
          <h1 className="eh-title" aria-label={TITLE}>
            {TITLE.split('').map((ch, i) => (
              <span key={i} aria-hidden="true" style={{ '--i': i } as CSSProperties}>{ch}</span>
            ))}
          </h1>
          <p className="eh-role">Senior Frontend, Mobile &amp; AI Engineer</p>
          <p className="eh-sub">Eight products shipped across web and mobile. Now built faster with AI agents, and kept honest by tests.</p>
          {!noGl && (
            <dl className="eh-tele eh-mono" aria-label="Live render stats">
              <div><dt>Frames / s</dt><dd>{fps || '...'}</dd></div>
              <div><dt>Particles</dt><dd>{count.toLocaleString('en-US')}</dd></div>
              <div><dt>Draw calls</dt><dd>{calls || '...'}</dd></div>
            </dl>
          )}
        </header>

        <section id="eh-work" className="eh-pass" data-stage={1} aria-labelledby="eh-pass-h">
          <div className="eh-pass-inner">
            <h2 id="eh-pass-h" className="eh-h2">Eight products, one orbit.</h2>
            <p>Healthcare, streaming, reading, Web3, a design system and a game. Keep scrolling to visit each one.</p>
          </div>
        </section>

        {systems.map((s, i) => (
          <section key={s.slug} id={`eh-sys-${s.slug}`} className="eh-stop" data-stage={stageOf.body(i)} aria-labelledby={`eh-h-${s.slug}`}>
            <div className="eh-stop-inner">
              <article className="eh-panel eh-solid" style={{ '--tint': s.tint } as CSSProperties} data-active={(open === null && ((journey && i === active) || narrow || noGl)) || undefined}>
                <h2 id={`eh-h-${s.slug}`} className="eh-panel-name">{s.name}</h2>
                <p className="eh-panel-line">{s.line}</p>
                {s.readouts.length > 0 && (
                  <ul className="eh-panel-readouts">
                    {s.readouts.map((r) => (
                      <li key={r.label}>
                        <b className="eh-mono">
                          {r.value}
                          {r.to && (
                            <>
                              <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
                              <span className="eh-sr"> to </span>
                              {r.to}
                            </>
                          )}
                        </b>
                        <span>{r.label}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="eh-panel-meta eh-mono">{[s.kind, s.years].filter(Boolean).join(' · ')}</p>
                <ul className="eh-tags" aria-label="Stack">{s.stack.slice(0, 5).map((t) => <li key={t}>{t}</li>)}</ul>
                <div className="eh-panel-actions">
                  <button type="button" className="eh-btn eh-btn-solid" onClick={(e) => openSystem(i, e.currentTarget)} aria-haspopup="dialog" aria-label={`How ${s.name} was built`}>
                    How it was built
                    <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
                  </button>
                </div>
              </article>
            </div>
          </section>
        ))}

        <section className="eh-overview" data-stage={OVERVIEW} aria-labelledby="eh-overview-h">
          <div className="eh-overview-inner eh-solid">
            <h2 id="eh-overview-h" className="eh-h2">All eight at once.</h2>
            <p>Open any of them.</p>
          </div>
        </section>
        <div className="eh-labels" aria-hidden={!labelsOn}>
          {systems.map((s, i) => (
            <button key={s.slug} ref={(el) => { labelRefs.current[i] = el }} type="button" className="eh-label eh-mono" tabIndex={labelsOn ? 0 : -1} onClick={(e) => openSystem(i, e.currentTarget)}>
              {s.name}
            </button>
          ))}
        </div>

        <main className="eh-content" data-stage={BACKDROP}>
          <section className="eh-section eh-solid" aria-labelledby="eh-loop-h">
            <h2 id="eh-loop-h" className="eh-h2">How the work gets built</h2>
            <p className="eh-lede">AI agents write and build. Automatic checks decide. A person approves every change.</p>
            <div className="eh-loop">
              <svg className="eh-loop-ring" viewBox="0 0 200 200" aria-hidden="true">
                <circle cx="100" cy="100" r="80" />
                <path className="eh-loop-back" d="M 180 100 A 80 80 0 0 1 100 180" />
                <circle className="eh-loop-dot" r="3.5" />
              </svg>
              <ol className="eh-loop-steps">
                {steps.map((st, i) => (
                  <li key={st.name} style={{ '--i': i } as CSSProperties}>
                    <strong>{st.name}</strong>
                    <p>{st.text}</p>
                  </li>
                ))}
              </ol>
            </div>
            <ul className="eh-proof">
              {ringProof.map((r) => <li key={r}>{r}</li>)}
            </ul>
            <button type="button" className="eh-btn" onClick={(e) => openSystem(0, e.currentTarget)}>
              One screen, from note to merge in a day
              <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
            </button>
          </section>

          <section className="eh-section" aria-labelledby="eh-own-h">
            <h2 id="eh-own-h" className="eh-h2">Own projects</h2>
            <ul className="eh-own">
              {own.map((o) => (
                <li key={o.id} className="eh-own-card eh-solid">
                  <img src={o.shot.small} alt={o.shot.alt} width={1080} height={675} loading="lazy" decoding="async" />
                  <div className="eh-own-body">
                    <h3>{o.name}</h3>
                    <p>{o.line}</p>
                    {o.role && <p className="eh-own-role">{o.role}</p>}
                    <ul className="eh-own-eng eh-mono">{o.engineers.map((e) => <li key={e}>{e}</li>)}</ul>
                    {o.link && (
                      <a className="eh-btn" href={o.link.href} target="_blank" rel="noreferrer">
                        {o.link.label}<span className="eh-sr"> (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="eh-section eh-solid" aria-labelledby="eh-range-h">
            <h2 id="eh-range-h" className="eh-h2">Range</h2>
            <div className="eh-table-wrap">
              <table className="eh-table">
                <thead>
                  <tr><th scope="col"><span className="eh-sr">Domain</span></th>{breadth.columns.map((c) => <th key={c} scope="col" className="eh-mono">{c}</th>)}</tr>
                </thead>
                <tbody>
                  {breadth.rows.map((r) => (
                    <tr key={r.domain}>
                      <th scope="row">{r.domain}</th>
                      {r.cells.map((c, i) => <td key={i} data-empty={!c || undefined}>{c ?? <span className="eh-sr">None</span>}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ol className="eh-learned">
              {learned.map((l) => (
                <li key={l.what}><span className="eh-mono">{l.when}</span>{l.what}</li>
              ))}
            </ol>
          </section>

          <footer className="eh-foot eh-solid">
            <h2 className="eh-foot-h">Let's build the next one.</h2>
            <div className="eh-foot-links">
              <a className="eh-btn eh-btn-solid" href={`mailto:${links.email}`}>{links.email}</a>
              <a className="eh-btn" href={links.github} target="_blank" rel="noreferrer">GitHub<span className="eh-sr"> (opens in a new tab)</span></a>
              <a className="eh-btn" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<span className="eh-sr"> (opens in a new tab)</span></a>
              <a className="eh-btn" href={links.cv}>CV (PDF)</a>
            </div>
            <p className="eh-foot-note eh-mono">Draft · Event Horizon · {count.toLocaleString('en-US')} particles computed on the GPU</p>
          </footer>
        </main>
        </>
      )}

      <AnimatePresence>
        {sys && (
          <>
            <motion.div
              key="scrim"
              className="eh-scrim"
              onClick={() => setOpen(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={{ duration: reduced ? 0.15 : 0.3 }}
            />
            <motion.aside
              key="drawer"
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="eh-drawer-h"
              className="eh-drawer"
              initial={reduced ? { opacity: 0 } : { transform: narrow ? 'translateY(100%)' : 'translateX(100%)' }}
              animate={reduced ? { opacity: 1 } : { transform: 'translate(0%, 0%)' }}
              exit={reduced ? { opacity: 0, transition: { duration: 0.15 } } : { transform: narrow ? 'translateY(100%)' : 'translateX(100%)', transition: { duration: 0.28, ease: [0.23, 1, 0.32, 1] } }}
              transition={{ duration: reduced ? 0.18 : 0.45, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="eh-drawer-bar">
                <button type="button" className="eh-close" onClick={() => setOpen(null)}>
                  Close <kbd>Esc</kbd>
                </button>
              </div>
              <Dive key={sys.slug} system={sys} reduced={reduced} onLeave={() => setOpen(null)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
