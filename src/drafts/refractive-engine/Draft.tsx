import { startTransition, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router'
import { flushSync } from 'react-dom'
import { ArrowCounterClockwiseIcon, ArrowUpRightIcon } from '@phosphor-icons/react'
import { createScene, hasWebGL, STAGE, type RefractiveScene, type Stats } from './scene'
import { BASE, HOME, ledger, links, systems, type Value } from './data'
import { AllWork } from './AllWork'
import { AREAS, AreaMap } from './AreaMap'
import { CasePage } from './CasePage'
import { channels, type ChannelKey } from '../../content/channels'
import { Lab } from './Lab'
import { Own } from './Own'
import { cases } from './products'
import { Production } from './Production'
import { TunePanel } from './TunePanel'
import './refractive-engine.css'

type Mode = 'lens' | 'tensor'
const MODE_KEY = 're:mode'
const readMode = (): Mode => {
  try {
    return localStorage.getItem(MODE_KEY) === 'tensor' ? 'tensor' : 'lens'
  } catch {
    return 'lens'
  }
}
const saveMode = (m: Mode) => {
  try {
    localStorage.setItem(MODE_KEY, m)
  } catch {
    /* private mode: the choice lasts for this visit */
  }
}
const RATIOS = [1, 1.5, 2] as const

/**
 * The four areas the hero's sentence names, each shown by a real screen of its lead product and labelled with the owner's
 * channel name (CONTENT.md, 2026-10-02) and the years of its projects. Each one jumps to its work on this page.
 * `?hero=bare` shows the hero without them, to compare.
 */
const DOMAINS: { key: ChannelKey; slug: string; href: string; img: [src: string, w: number, h: number]; pos?: string }[] = [
  { key: 'healthcare', slug: 'care-platform', href: '#work-care', img: ['/eh/care-platform.webp', 1280, 800] },
  { key: 'streaming', slug: 'bayyinah-tv', href: '#work-bayyinah', img: ['/eh/bayyinah-tv.webp', 1280, 800] },
  // The full 780 px phone capture, not the 523 px field texture: the tile draws about 315 px wide, so it needs 630+.
  // The store image opens on a banner; 42% down is the app itself (logo, My Books, the reading cards).
  { key: 'reading', slug: 'read-to-feed', href: '#work-reading', img: ['/mobile/reading-1.webp', 780, 1689], pos: '50% 42%' },
  { key: 'web3', slug: 'incentiv', href: '#re-lab', img: ['/eh/incentiv.webp', 1280, 800] },
]
const BARE = new URLSearchParams(location.search).get('hero') === 'bare'
const fmt = (n: number) => n.toLocaleString('en-US')

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

/** Draws the last 120 real frame times, oldest on the left, against a 16.7 ms line. */
function drawSpark(c: HTMLCanvasElement, s: Stats) {
  const r = c.getBoundingClientRect()
  if (!r.width || r.bottom < 0 || r.top > innerHeight) return
  const dpr = Math.min(devicePixelRatio || 1, 2)
  const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr)
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h }
  const ctx = c.getContext('2d')
  if (!ctx) return
  const n = s.history.length
  const top = 40
  ctx.clearRect(0, 0, w, h)
  const y = (ms: number) => h - (Math.min(ms, top) / top) * (h - 2 * dpr) - dpr
  ctx.strokeStyle = 'rgba(255,255,255,0.16)'
  ctx.lineWidth = dpr
  ctx.setLineDash([3 * dpr, 3 * dpr])
  ctx.beginPath()
  ctx.moveTo(0, y(1000 / 60))
  ctx.lineTo(w, y(1000 / 60))
  ctx.stroke()
  ctx.setLineDash([])
  ctx.strokeStyle = getComputedStyle(c).color
  ctx.lineWidth = 1.5 * dpr
  ctx.beginPath()
  const count = Math.min(n, s.frames)
  for (let i = 0; i < count; i++) {
    const v = s.history[(s.head - count + i + n) % n]
    const x = (i / (n - 1)) * w
    if (i === 0) ctx.moveTo(x, y(v))
    else ctx.lineTo(x, y(v))
  }
  ctx.stroke()
}

function Bar({ v, scale, kind }: { v: Value; scale: number; kind: 'before' | 'after' }) {
  const low = v.low / scale
  const high = (v.high ?? v.low) / scale
  return (
    <div className="re-meter" data-kind={kind}>
      <span className="re-meter-kind">{kind === 'before' ? 'Before' : 'After'}</span>
      <b className="re-num">{v.text}</b>
      <span className="re-meter-track" aria-hidden="true">
        <i className="re-meter-fill" style={{ '--w': low } as CSSProperties} />
        {v.high !== undefined && <i className="re-meter-range" style={{ '--l': low, '--w': high - low } as CSSProperties} />}
        {v.low === 0 && <i className="re-meter-zero" />}
      </span>
    </div>
  )
}

export default function Draft() {
  const rootRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<RefractiveScene | null>(null)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const [count] = useState(() => (innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 ? 45_000 : 100_000))
  const [noGl, setNoGl] = useState(() => !hasWebGL())
  const [ready, setReady] = useState(false)
  const [sceneKey, setSceneKey] = useState(0)
  const [mode, setModeState] = useState<Mode>(readMode)
  const [stageQ, setStageQ] = useState(0)
  // The field's notes render only while open: closed, they cost nothing and their live readouts are not on the page.
  const [notesOpen, setNotesOpen] = useState(false)
  // Opening a case from a chapter renders its first screen inside the view transition and the rest once the flight ends.
  const [caseRest, setCaseRest] = useState(true)
  const [drawn, setDrawn] = useState(count)
  const [bloomOn, setBloomOn] = useState(true)
  const [caOn, setCaOn] = useState(true)
  const [ratio, setRatio] = useState(() => RATIOS.reduce((a, b) => (Math.abs(b - Math.min(devicePixelRatio || 1, 2)) < Math.abs(a - Math.min(devicePixelRatio || 1, 2)) ? b : a)))
  const [coords, setCoords] = useState<{ x: number; y: number; z: number }[]>([])
  const modeRef = useRef(mode)
  // /<slug> is that product's full case, read over the same field.
  const rest = useParams()['*']?.replace(/\/$/, '')
  const caseSlug = cases.some((s) => s.slug === rest) ? rest : undefined
  const navigate = useNavigate()
  const onCase = useRef(false)
  onCase.current = caseSlug !== undefined
  const homeScroll = useRef<number | null>(null)
  const productionTrigger = useRef<HTMLAnchorElement | null>(null)
  const lastCase = useRef<string | undefined>(undefined)

  const setMode = useCallback((m: Mode) => {
    setModeState(m)
    saveMode(m)
    sceneRef.current?.setMode(m === 'tensor' ? 1 : 0)
  }, [])

  // Native scrolling (owner, 2026-10-29: the browser's own wheel settles a 500 px scroll in 0.28 s against Lenis's 1.2 s,
  // frames equally clean, and keyboard and touch were native anyway). The class carries the draft's document styles: the
  // masthead's scroll padding, no smooth scroll-behavior, the ground colour.
  useEffect(() => {
    const html = document.documentElement
    html.classList.add('re-html')
    return () => html.classList.remove('re-html')
  }, [])

  // The scene, the scroll stages and the pointer.
  useEffect(() => {
    const host = hostRef.current
    if (!host || noGl) return
    let scene: RefractiveScene
    try {
      scene = createScene(host, {
        count,
        reduced,
        mode: modeRef.current === 'tensor' ? 1 : 0,
        onReady: () => setReady(true),
        weights: AREAS.map((a) => a.n),
      })
    } catch {
      queueMicrotask(() => setNoGl(true))
      return
    }
    sceneRef.current = scene
    queueMicrotask(() => setSceneKey((k) => k + 1))

    // Each section's centre maps to its stage. A section taller than the screen holds its stage while it fills the view.
    let anchors: { y: number; s: number }[] = []
    const measure = () => {
      anchors = [...document.querySelectorAll<HTMLElement>('[data-stage]')]
        .flatMap((el) => {
          const r = el.getBoundingClientRect()
          if (!r.height) return []
          const c = r.top + scrollY + r.height / 2
          const hold = Math.max(0, (r.height - innerHeight) / 2)
          const s = Number(el.dataset.stage)
          return hold > 0 ? [{ y: c - hold, s }, { y: c + hold, s }] : [{ y: c, s }]
        })
        .sort((a, b) => a.y - b.y)
    }
    let shownQ = -1, lastY = scrollY, lastT = performance.now()
    const onScroll = () => {
      // Scroll speed wakes the field: 1200 px/s is full energy; it rings down by itself once the page stops.
      const now = performance.now()
      if (now > lastT) scene.wake(Math.abs(scrollY - lastY) / (now - lastT) / 1.2)
      lastY = scrollY
      lastT = now
      const y = scrollY + innerHeight / 2
      let s = anchors[0]?.s ?? 0
      for (let i = 0; i < anchors.length - 1; i++) {
        const a = anchors[i], b = anchors[i + 1]
        if (y >= a.y && y <= b.y) s = b.y > a.y ? a.s + ((y - a.y) / (b.y - a.y)) * (b.s - a.s) : b.s
        else if (y > b.y) s = b.s
      }
      scene.setStage(s)
      const q = Math.round(s * 4) / 4
      if (q !== shownQ) { shownQ = q; setStageQ(q) }
    }
    let pending = false, px = 0, py = 0, inside = false
    // The lens and the lean follow a mouse only: on touch the same finger is scrolling.
    let moveT = performance.now()
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      // Pointer speed wakes it too: 900 px/s is full energy.
      const now = performance.now()
      if (now > moveT) scene.wake(Math.hypot(e.clientX - px, e.clientY - py) / (now - moveT) / 0.9)
      moveT = now
      px = e.clientX
      py = e.clientY
      inside = !onCase.current && !(e.target as HTMLElement).closest('.re-solid, .re-sw-at, .re-sw-slab, button, a, input')
      if (pending) return
      pending = true
      requestAnimationFrame(() => { pending = false; scene.setPointer(px, py, inside) })
    }
    const onLeave = () => { inside = false; scene.setPointer(px, py, false) }
    // A mouse click ripples the field. It counts on release, and only if the pointer barely moved, so starting a scroll never fires it.
    let downX = 0, downY = 0, downOk = false
    const onDown = (e: PointerEvent) => {
      downOk = e.pointerType === 'mouse' && !onCase.current && !(e.target as HTMLElement).closest('.re-solid, .re-sw-at, .re-sw-slab, button, a, input')
      downX = e.clientX
      downY = e.clientY
    }
    const onUp = (e: PointerEvent) => {
      if (!downOk || Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return
      scene.ripple(e.clientX, e.clientY)
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
  }, [reduced, count, noGl])

  useEffect(() => { modeRef.current = mode }, [mode])

  // Frame budget controls act on the live scene.
  useEffect(() => { sceneRef.current?.setDrawCount(drawn) }, [drawn, sceneKey])
  useEffect(() => { sceneRef.current?.setBloom(bloomOn) }, [bloomOn, sceneKey])
  useEffect(() => { sceneRef.current?.setAberration(caOn) }, [caOn, sceneKey])
  useEffect(() => { sceneRef.current?.setPixelRatio(ratio) }, [ratio, sceneKey])

  // Readouts: every number is read from the renderer or the page, four times a second.
  useEffect(() => {
    const tick = () => {
      const root = rootRef.current
      if (!root || document.hidden) return
      const s = sceneRef.current?.stats
      const vals: Record<string, string> = { dom: fmt(document.querySelectorAll('*').length) }
      if (s) {
        vals.fps = s.fps ? String(s.fps) : '...'
        vals.ms = s.frameMs ? s.frameMs.toFixed(1) : '...'
        vals.worst = s.worstMs ? s.worstMs.toFixed(1) : '...'
        vals.calls = s.calls ? String(s.calls) : '...'
        vals.drawn = fmt(s.drawn)
      }
      root.querySelectorAll<HTMLElement>('[data-stat]').forEach((el) => {
        const v = vals[el.dataset.stat ?? '']
        if (v !== undefined && el.textContent !== v) el.textContent = v
      })
      if (s) root.querySelectorAll<HTMLCanvasElement>('canvas[data-spark]').forEach((c) => drawSpark(c, s))
    }
    const id = setInterval(tick, 250)
    tick()
    return () => clearInterval(id)
  }, [])

  // Scene coordinates for the tensor field: the live cluster centres, twice a second.
  const coordsOn = mode === 'tensor' && Math.abs(stageQ - STAGE.modes) <= 0.75
  useEffect(() => {
    if (!coordsOn) return
    const read = () => { const c = sceneRef.current?.centroids(); if (c) setCoords(c) }
    read()
    const id = setInterval(read, 500)
    return () => clearInterval(id)
  }, [coordsOn, sceneKey])

  // The draft places the scroll itself on every route change, so the browser's restore on Back must not move it again.
  useEffect(() => {
    const was = history.scrollRestoration
    history.scrollRestoration = 'manual'
    return () => { history.scrollRestoration = was }
  }, [])

  // Into a case: start at its top. Back out (the button, the mark or the browser): land where the reader left the lab.
  useLayoutEffect(() => {
    const jump = (y: number) => window.scrollTo({ top: y, behavior: 'instant' })
    const from = lastCase.current
    lastCase.current = caseSlug
    if (caseSlug) {
      // The old page is already captured for the view transition; the name must not stay on a slab the case hides.
      document.querySelectorAll<HTMLElement>('.re-sw [style*="view-transition-name"]').forEach((el) => el.style.removeProperty('view-transition-name'))
      document.querySelectorAll('.re-sw[data-lift]').forEach((el) => el.removeAttribute('data-lift'))
      if (from !== caseSlug) jump(0)
      return
    }
    if (from === undefined) return
    const lab = document.querySelector<HTMLElement>('.re-lab')
    jump(homeScroll.current ?? (lab ? lab.getBoundingClientRect().top + scrollY : 0))
    requestAnimationFrame(() => {
      // Production has a title link and a case link, often a screen apart. Restore the actual trigger before looking
      // for a visible chamber action or product row.
      const inView = (el: HTMLElement | null) => { const r = el?.getBoundingClientRect(); return el && r && r.bottom > 0 && r.top < innerHeight ? el : null }
      const back =
        inView(productionTrigger.current) ??
        inView(document.querySelector<HTMLElement>(`.re-prod-case[href="${BASE}/${from}"]`)) ??
        inView(document.querySelector<HTMLElement>(`.re-prod-name a[href="${BASE}/${from}"]`)) ??
        inView(document.querySelector<HTMLElement>(`.re-ch-open[href="${BASE}/${from}"]`)) ??
        inView(document.querySelector<HTMLElement>(`.re-ch-index button[data-slug="${from}"]`))
      ;(back ?? document.getElementById('re-lab-h'))?.focus({ preventScroll: true })
    })
  }, [caseSlug])

  const focusField = useCallback((x: number, y: number, r: number, w: number) => sceneRef.current?.setFocus(x, y, r, w), [])
  // The browser bar takes the page's own ground, not the site's sky colour for the time of day.
  useEffect(() => {
    const m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const was = m?.content
    m?.setAttribute('content', '#050508')
    return () => { if (m && was) m.content = was }
  }, [])
  const toCase = (slug: string, trigger?: HTMLAnchorElement, keyboard = false) => {
    homeScroll.current = scrollY
    productionTrigger.current = trigger ?? null
    const hero = trigger?.closest('.re-sw, .re-own-item')?.querySelector<HTMLElement>('.re-sw-lead')
    // The case opens on a screen the same width as the one clicked: no shrink, no growth. The width rides on that case's
    // own slab, so the next case keeps its default size.
    const width = hero?.getBoundingClientRect().width
    const go = (lite = false) => {
      flushSync(() => { setCaseRest(!lite); navigate(`${BASE}/${slug}`) })
      const landing = document.querySelector<HTMLElement>('.re-cs-hero[data-hero]')
      if (landing && width) landing.style.setProperty('--re-land-w', `${width}px`)
      return landing
    }
    // A chapter's main slab, frame and screen together, grows into the case (it carries the transition's one named element).
    // The router's own viewTransition flag does not start one here, so the page does, as the home page does. A key press
    // opens at once. Inside the transition only the case's first screen renders: the rest waits for the flight to end
    // (it would not show before 640 ms anyway), so the frame that swaps the pages carries the landing alone.
    if (hero && !keyboard && !reduced && typeof document.startViewTransition === 'function') {
      hero.style.setProperty('view-transition-name', 're-case-hero')
      const t = document.startViewTransition(async () => {
        const landing = go(true)
        landing?.style.setProperty('view-transition-name', 're-case-hero')
        // The new snapshot waits for the screen to decode, so it never lands as an empty slab.
        await landing?.querySelector('img')?.decode().catch(() => {})
      })
      t.finished.finally(() => {
        document.querySelector<HTMLElement>('.re-cs-hero[data-hero]')?.style.removeProperty('view-transition-name')
        startTransition(() => setCaseRest(true))
      })
    } else go()
  }
  const toHome = (top = false) => {
    if (top) homeScroll.current = 0
    navigate(HOME, { viewTransition: true })
  }

  const coordTable = mode === 'tensor' ? (
    <table className="re-coords re-num">
      <caption>Scene coordinates, cluster centres</caption>
      <thead><tr><th scope="col"><span className="re-sr">Cluster</span></th><th scope="col">x</th><th scope="col">y</th><th scope="col">z</th></tr></thead>
      <tbody>
        {coords.map((c, i) => (
          <tr key={i}><th scope="row">c{i + 1}</th><td>{c.x.toFixed(2)}</td><td>{c.y.toFixed(2)}</td><td>{c.z.toFixed(2)}</td></tr>
        ))}
      </tbody>
    </table>
  ) : (
    <dl className="re-coords re-coords-grid re-num">
      <dt>Scene coordinates, layout grid</dt>
      <dd>12 columns, pitch {(25 / 12).toFixed(2)} units, from x -12.50 to 12.50</dd>
    </dl>
  )

  return (
    <div ref={rootRef} className="re-root" data-mode={mode} data-reduced={reduced || undefined} data-ready={ready || noGl || undefined} data-case={caseSlug !== undefined || undefined}>
      <div className="re-canvas" ref={hostRef} aria-hidden="true" />
      <div className="re-shade" aria-hidden="true" />
      {noGl && <p className="re-nogl re-num">WebGL 2 is off in this browser, so the field is hidden. Every project still opens.</p>}

      <header className="re-bar re-solid">
        {caseSlug ? (
          <a className="re-mark" href={HOME} onClick={(e) => { e.preventDefault(); toHome(true) }}>Gentrit Rashiti</a>
        ) : (
          <a className="re-mark" href="#re-top">Gentrit Rashiti</a>
        )}
        {!caseSlug && (
          <nav className="re-nav" aria-label="Sections">
            <a href="#re-work">Work</a>
            <a href="#re-contact">Contact</a>
            <a href={links.cv}>CV</a>
          </nav>
        )}
      </header>


      {new URLSearchParams(location.search).has('tune') && <TunePanel scene={sceneRef} />}
      {caseSlug && <CasePage slug={caseSlug} rest={caseRest} onBack={() => toHome()} />}

      <main hidden={caseSlug !== undefined}>
        <header id="re-top" className="re-hero" data-stage={STAGE.hero}>
          <h1 className="re-title">Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.</h1>
          <p className="re-who">Frontend &amp; Mobile Developer → Full Stack</p>
          <p className="re-sub">5+ years. Part of two platform rewrites. React, React Native, Vue, TypeScript, Laravel. Based in Kosovo, working remotely.</p>
          {/* One action: the CV is in the masthead. */}
          <div className="re-cta"><a className="re-btn re-btn-solid" href="#re-work">See the work</a></div>
          {!BARE && (
            <ul className="re-domains" data-work="care-platform bayyinah-tv read-to-feed incentiv">
              {DOMAINS.map((d) => {
                const sys = systems.find((x) => x.slug === d.slug)
                const area = channels[d.key]
                return (
                  <li key={d.key}>
                    <a href={d.href}>
                      <img src={d.img[0]} width={d.img[1]} height={d.img[2]} style={d.pos ? { objectPosition: d.pos } : undefined} alt={sys ? `${sys.name}, a real screen` : ''} decoding="async" />
                      <span className="re-domain-name">{area.label}</span>
                      {area.period && <span className="re-domain-years re-num">{area.period}</span>}
                    </a>
                  </li>
                )
              })}
            </ul>
          )}
        </header>

        <Production onOpen={toCase} reduced={reduced} onFocus={focusField} />

        <Own onOpen={toCase} />

        <Lab mode={mode} reduced={reduced} noGl={noGl} onOpen={toCase} />

        {!noGl && <AreaMap scene={sceneRef.current} userMode={mode === 'tensor' ? 1 : 0} stage={STAGE.modes} />}

        <AllWork onOpen={(slug) => toCase(slug)} />

        <section className="re-ledger" data-stage={STAGE.ledger} aria-labelledby="re-ledger-h">
          <div className="re-ledger-head">
            <h2 id="re-ledger-h" className="re-h2">Before and after</h2>
            <p className="re-lede">Measured results, drawn to scale. Each row names its source.</p>
          </div>
          <ol className="re-rows">
            {ledger.map((row) => (
              <li key={row.id} className="re-row re-solid">
                <h3>{row.name}</h3>
                {row.bars.map((b) => (
                  <div key={b.label} className="re-pair">
                    <p className="re-pair-label">{b.label}</p>
                    <div className="re-pair-bars">
                      <Bar v={b.before} scale={b.scale} kind="before" />
                      <Bar v={b.after} scale={b.scale} kind="after" />
                    </div>
                  </div>
                ))}
                <p className="re-row-note">{row.note}</p>
                <p className="re-src re-num">Source: {row.source}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* The field explains itself here, folded away: it is the page's ground, not its subject. */}
        <details className="re-field-notes" onToggle={(e) => setNotesOpen(e.currentTarget.open)}>
          <summary>The field behind this page</summary>
          {notesOpen && (<>
          <section className="re-modes" data-stage={STAGE.modes} aria-labelledby="re-modes-h">
            <div className="re-card re-solid">
              <h2 id="re-modes-h" className="re-h2">One field, two lenses</h2>
              <p className="re-lede">The same {fmt(count)} particles, arranged by two rules.</p>
              <div className="re-options">
                <button type="button" className="re-option" aria-pressed={mode === 'lens'} onClick={() => setMode('lens')}>
                  <strong>Frontend Lens</strong>
                  <span>A dot grid in one plane. Under the cursor it becomes a page layout.</span>
                </button>
                <button type="button" className="re-option" aria-pressed={mode === 'tensor'} onClick={() => setMode('tensor')}>
                  <strong>AI Tensor Field</strong>
                  <span>Seven clusters and the links between them, the way related items group in an embedding.</span>
                </button>
              </div>
              {mode === 'tensor' && <p className="re-tag re-num">Simulation: the clusters are drawn by the shader, not taken from a model.</p>}
              {!noGl && coordTable}
            </div>
          </section>

          <section className="re-sim" data-stage={STAGE.sim} aria-labelledby="re-sim-h">
            <div className="re-card re-solid">
              <h2 id="re-sim-h" className="re-h2">Frame budget</h2>
              <p className="re-lede">These controls change the scene behind this page. The numbers are measured live in this tab. A 60 Hz screen caps the rate at 60 frames a second, so watch the frame time too.</p>
              <div className="re-ctl">
                <label htmlFor="re-count">Particles drawn</label>
                <output htmlFor="re-count" className="re-num">{fmt(drawn)}</output>
                <input id="re-count" type="range" min={5000} max={count} step={5000} value={drawn} onChange={(e) => setDrawn(Number(e.target.value))} style={{ '--p': (drawn - 5000) / (count - 5000) } as CSSProperties} />
              </div>
              <div className="re-ctl re-ctl-row">
                <span id="re-bloom-l">Bloom</span>
                <button type="button" className="re-toggle" role="switch" aria-checked={bloomOn} aria-labelledby="re-bloom-l" onClick={() => setBloomOn((b) => !b)}><i /></button>
              </div>
              <div className="re-ctl re-ctl-row">
                <span id="re-ca-l">Chromatic aberration at the lens edge</span>
                <button type="button" className="re-toggle" role="switch" aria-checked={caOn} aria-labelledby="re-ca-l" onClick={() => setCaOn((b) => !b)}><i /></button>
              </div>
              <div className="re-ctl re-ctl-row">
                <span id="re-pr-l">Pixel ratio</span>
                <div className="re-seg" role="group" aria-labelledby="re-pr-l">
                  {RATIOS.map((r) => (
                    <button key={r} type="button" aria-pressed={ratio === r} onClick={() => setRatio(r)} className="re-num">{r}x</button>
                  ))}
                </div>
              </div>
              <dl className="re-live re-num">
                <div><dt>Frames / s</dt><dd data-stat="fps">...</dd></div>
                <div><dt>Frame time</dt><dd><span data-stat="ms">...</span> ms</dd></div>
                <div><dt>Worst of 120</dt><dd><span data-stat="worst">...</span> ms</dd></div>
                <div><dt>Draw calls</dt><dd data-stat="calls">...</dd></div>
              </dl>
              <div className="re-spark re-spark-lg">
                <canvas data-spark aria-hidden="true" />
                <p className="re-num">Last 120 frames, ms. Dashed line: 16.7 ms.</p>
              </div>
              <button type="button" className="re-btn re-btn-quiet" onClick={() => { setDrawn(count); setBloomOn(true); setCaOn(true); setRatio(RATIOS.reduce((a, b) => (Math.abs(b - Math.min(devicePixelRatio || 1, 2)) < Math.abs(a - Math.min(devicePixelRatio || 1, 2)) ? b : a))) }}>
                <ArrowCounterClockwiseIcon size={14} weight="bold" aria-hidden="true" />
                Reset
              </button>
            </div>
          </section>
          </>)}
        </details>

        <footer id="re-contact" className="re-contact" data-stage={STAGE.contact}>
          <div className="re-card re-solid">
            <h2 className="re-h2">Contact</h2>
            <p className="re-lede">Based in Kosovo, working remotely. Bachelor's degree, UBT.</p>
            <div className="re-links">
              <a className="re-btn re-btn-solid" href={`mailto:${links.email}`}>{links.email}</a>
              <a className="re-btn" href={links.github} target="_blank" rel="noreferrer">GitHub<ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" /><span className="re-sr"> (opens in a new tab)</span></a>
              <a className="re-btn" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" /><span className="re-sr"> (opens in a new tab)</span></a>
              <a className="re-btn" href={links.cv}>CV (PDF)</a>
            </div>
            <p className="re-foot re-num">Draft · The Refractive Engine · {fmt(count)} particles positioned on the GPU</p>
          </div>
        </footer>
      </main>

    </div>
  )
}
