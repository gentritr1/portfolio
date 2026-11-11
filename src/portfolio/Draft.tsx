import { lazy, memo, Suspense, startTransition, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router'
import { flushSync } from 'react-dom'
import { ArrowCounterClockwiseIcon, ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon, MinusIcon, PlusIcon } from '@phosphor-icons/react'
import type { RefractiveScene, Stats } from "./scene"
import { dlog, hasWebGL, STAGE } from "./sceneSupport"
import { ARROW, BASE, HOME, ledger, links, plain, type Value } from "./data"
import { AllWork } from "./AllWork"
import { AREAS, AreaMap } from "./AreaMap"
import { CasePage } from "./CasePage"
import { HomeIntro } from "./HomeIntro"
import { Evidence } from "./Evidence"
import { cases } from "./products"
import { Production } from "./Production"
import { CUT } from "./cut"
import { TunePanel } from "./TunePanel"
import "./refractive-engine.css"
import "./home.css"

const Lab = lazy(() => import("./Lab").then((m) => ({ default: m.Lab })))
// The home's sections re-rendered on every case open (the page hides them, but Draft re-renders): memoized, with stable
// callbacks, they stay out of the open's commit.
const HomeIntroM = memo(HomeIntro)
const ProductionM = memo(Production)
const EvidenceM = memo(Evidence)
const AllWorkM = memo(AllWork)

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
  const dpr = Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.5)
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
  const [activeScene, setActiveScene] = useState<RefractiveScene | null>(null)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const [count] = useState(() => (innerWidth < 768 || (navigator.hardwareConcurrency ?? 8) <= 4 ? 45_000 : 100_000))
  const [noGl, setNoGl] = useState(() => (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true)
  const [ready, setReady] = useState(false)
  const [sceneKey, setSceneKey] = useState(0)
  const [mode, setModeState] = useState<Mode>(readMode)
  const [stageQ, setStageQ] = useState(0)
  const currentStage = useRef(0)
  const notesOpenRef = useRef(false)
  // The field's notes render only while open: closed, they cost nothing and their live readouts are not on the page.
  const [notesOpen, setNotesOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  // Opening a case from a chapter renders its first screen inside the view transition and the rest once the flight ends.
  const [caseRest, setCaseRest] = useState(3)
  // After a case opens on its landing, the rest mounts a part per frame (see CasePage): each step waits for the last to paint.
  useEffect(() => {
    if (caseRest === 0 || caseRest === 3) return
    let timer = 0
    const frame = requestAnimationFrame(() => { timer = window.setTimeout(() => startTransition(() => setCaseRest((r) => Math.min(3, r + 1)))) })
    return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
  }, [caseRest])
  const [drawn, setDrawn] = useState(count)
  const [bloomOn, setBloomOn] = useState(true)
  const [caOn, setCaOn] = useState(true)
  const [ratio, setRatio] = useState(() => RATIOS.reduce((a, b) => (Math.abs(b - Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.5)) < Math.abs(a - Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.5)) ? b : a)))
  const [coords, setCoords] = useState<{ x: number; y: number; z: number }[]>([])
  const modeRef = useRef(mode)
  // /<slug> is that product's full case, read over the same field.
  const rest = useParams()['*']?.replace(/\/$/, '')
  const caseSlug = cases.some((s) => s.slug === rest) ? rest : undefined
  // A direct case visit should not mount and fetch an unseen homepage. Preserve it after an actual home visit.
  const [hasVisitedHome, setHasVisitedHome] = useState(caseSlug === undefined)
  const navigate = useNavigate()
  useEffect(() => { if (caseRest === 3 && caseSlug) dlog('case-open end', caseSlug) }, [caseRest, caseSlug])
  const onCase = useRef(false)
  useLayoutEffect(() => { onCase.current = caseSlug !== undefined }, [caseSlug])
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
    let cancelled = false
    let cleanup = () => {}
    const mount = async () => {
      // The probe builds and drops a whole context (about 30 ms at 4x CPU): its own task, so it never stacks with the
      // mount's work into one long frame, and a browser without WebGL still never downloads three.
      await new Promise((r) => setTimeout(r))
      if (cancelled) return
      if (!hasWebGL()) { setNoGl(true); return }
      const { createScene } = await import("./scene")
      if (cancelled) return
      let scene: RefractiveScene
      try {
        scene = await createScene(host, {
          count,
          reduced,
          mode: modeRef.current === 'tensor' ? 1 : 0,
          onReady: () => setReady(true),
          weights: AREAS.map((a) => a.n),
        })
      } catch {
        if (!cancelled) setNoGl(true)
        return
      }
      // Built in slices, so the page may have left while it was being built.
      if (cancelled) { scene.dispose(); return }
      sceneRef.current = scene
      setActiveScene(scene)
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
        currentStage.current = q
        if (q !== shownQ) { shownQ = q; if (notesOpenRef.current) setStageQ(q) }
      }
      let pending = false, px = 0, py = 0, inside = false
      // The lens and the lean follow a mouse only: on touch the same finger is scrolling.
      let moveT = performance.now()
      const onMove = (e: PointerEvent) => {
        if (e.pointerType !== 'mouse') return
        // Pointer speed wakes it too: 900 px/s is full energy.
        const now = performance.now()
        const background = !onCase.current && !(e.target as HTMLElement).closest('.re-solid, .re-sw-at, .re-sw-slab, button, a, input')
        if (background && now > moveT) scene.wake(Math.hypot(e.clientX - px, e.clientY - py) / (now - moveT) / 0.9)
        moveT = now
        px = e.clientX
        py = e.clientY
        inside = background
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
      cleanup = () => {
        ro.disconnect()
        removeEventListener('scroll', onScroll)
        removeEventListener('pointermove', onMove)
        document.documentElement.removeEventListener('pointerleave', onLeave)
        removeEventListener('pointerdown', onDown)
        removeEventListener('pointerup', onUp)
        scene.dispose()
        sceneRef.current = null
        setActiveScene(null)
      }
    }
    // Let the first screen finish loading before importing and warming the graphics runtime.
    let idleId: number | undefined
    let timer: ReturnType<typeof setTimeout> | undefined
    const start = () => {
      const run = () => { if (!cancelled) void mount().catch(() => { if (!cancelled) setNoGl(true) }) }
      if ('requestIdleCallback' in window) idleId = window.requestIdleCallback(run, { timeout: 1500 })
      else timer = setTimeout(run, 200)
    }
    if (document.readyState === 'complete') start()
    else addEventListener('load', start, { once: true })
    return () => {
      cancelled = true
      removeEventListener('load', start)
      if (idleId !== undefined) window.cancelIdleCallback(idleId)
      if (timer !== undefined) clearTimeout(timer)
      cleanup()
    }
  }, [reduced, count, noGl])

  useEffect(() => { modeRef.current = mode }, [mode])

  // How the last activation came, a key (Enter or Space) or a pointer. A case opened from the keyboard arrives without its
  // entrance, whichever link opened it (a chapter, the index, Next, Previous): keyboard actions do not animate.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const key = (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') root.dataset.input = 'key' }
    const pointer = () => { root.dataset.input = 'pointer' }
    addEventListener('keydown', key, true)
    addEventListener('pointerdown', pointer, true)
    return () => {
      removeEventListener('keydown', key, true)
      removeEventListener('pointerdown', pointer, true)
    }
  }, [])

  // Frame budget controls act on the live scene.
  useEffect(() => { sceneRef.current?.setDrawCount(drawn) }, [drawn, sceneKey])
  useEffect(() => { sceneRef.current?.setBloom(bloomOn) }, [bloomOn, sceneKey])
  useEffect(() => { sceneRef.current?.setAberration(caOn) }, [caOn, sceneKey])
  useEffect(() => { sceneRef.current?.setPixelRatio(ratio) }, [ratio, sceneKey])

  // Readouts: every number is read from the renderer or the page, four times a second.
  useEffect(() => {
    if (!notesOpen) return
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
  }, [notesOpen])

  // Scene coordinates for the tensor field: the live cluster centres, twice a second.
  const coordsOn = notesOpen && mode === 'tensor' && Math.abs(stageQ - STAGE.modes) <= 0.75
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
    // Both axes: Chrome scrolls to (0, 0) without first laying the page out, so opening a case no longer forces a layout
    // in the click (32-40 ms at 4x CPU, measured 2026-11-11); the frame lays it out once, as it would anyway.
    const jump = (y: number) => window.scrollTo({ top: y, left: 0, behavior: 'instant' })
    const from = lastCase.current
    lastCase.current = caseSlug
    if (caseSlug) {
      // The old page is already captured for the view transition; the name must not stay on a slab the case hides. Anywhere
      // in main, the hero's stack included: a name left there made the next case's flight fail on a duplicate name.
      document.querySelectorAll<HTMLElement>('main [style*="view-transition-name"]').forEach((el) => el.style.removeProperty('view-transition-name'))
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
      ;(back ?? document.querySelector<HTMLElement>('.re-intro h1'))?.focus({ preventScroll: true })
    })
  }, [caseSlug])

  const pulse = useCallback((x: number, y: number) => sceneRef.current?.ripple(x, y), [])
  const focusField = useCallback((x: number, y: number, r: number, w: number) => sceneRef.current?.setFocus(x, y, r, w), [])
  // The browser bar takes the page's own ground, not the site's sky colour for the time of day.
  useEffect(() => {
    const m = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const was = m?.content
    m?.setAttribute('content', '#050508')
    return () => { if (m && was) m.content = was }
  }, [])
  const toCase = (slug: string, trigger?: HTMLAnchorElement, keyboard = false) => {
    dlog('case-open start', slug)
    if (!caseSlug) setHasVisitedHome(true)
    homeScroll.current = scrollY
    productionTrigger.current = trigger ?? null
    const hero = trigger?.closest('.re-sw, .re-own-item')?.querySelector<HTMLElement>('.re-sw-lead')
    // The case opens on a screen the same width as the one clicked: no shrink, no growth. The width rides on that case's
    // own slab, so the next case keeps its default size.
    const width = hero?.getBoundingClientRect().width
    const go = (lite = false) => {
      flushSync(() => { setCaseRest(lite ? 0 : 3); navigate(`${BASE}/${slug}`) })
      const landing = document.querySelector<HTMLElement>('.re-cs-hero[data-hero]')
      if (landing && width) landing.style.setProperty('--re-land-w', `${width}px`)
      return landing
    }
    // A chapter's main slab, frame and screen together, grows into the case (it carries the transition's one named element).
    // The router's own viewTransition flag does not start one here, so the page does, as the home page does. A key press
    // opens at once. The landing includes its title and result immediately; the body mounts after the screen's flight.
    if (hero && !keyboard && !reduced && typeof document.startViewTransition === 'function') {
      hero.style.setProperty('view-transition-name', 're-case-hero')
      const t = document.startViewTransition(async () => {
        const landing = go(true)
        landing?.style.setProperty('view-transition-name', 're-case-hero')
        // The new snapshot waits for the screen to decode, so it never lands as an empty slab, but never more than 150 ms:
        // a cold 2880 px screen took up to 1083 ms, a frozen page (measured 2026-11-04). Past that it lands and fills in.
        await Promise.race([landing?.querySelector('img')?.decode().catch(() => {}), new Promise((r) => setTimeout(r, 150))])
      })
      t.finished.finally(() => {
        document.querySelector<HTMLElement>('.re-cs-hero[data-hero]')?.style.removeProperty('view-transition-name')
        startTransition(() => setCaseRest(1))
      })
    } else {
      // Without a flight the landing still commits alone in the click, and the body follows after that frame is painted:
      // committing the whole case in one task cost one 121 ms frame at 4x CPU (64 ms of it layout), measured 2026-11-11.
      go(true)
      requestAnimationFrame(() => setTimeout(() => startTransition(() => setCaseRest(1))))
    }
  }
  const toCaseRef = useRef(toCase)
  useLayoutEffect(() => { toCaseRef.current = toCase })
  const openCase = useCallback((slug: string, trigger?: HTMLAnchorElement, keyboard?: boolean) => toCaseRef.current(slug, trigger, keyboard), [])
  const openFromIndex = useCallback((slug: string) => toCaseRef.current(slug), [])
  const toHome = (top = false) => {
    setHasVisitedHome(true)
    if (top) homeScroll.current = 0
    navigate(HOME)
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

      <header className="re-bar re-solid">
        {caseSlug ? (
          <a className="re-mark" href={HOME} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); toHome(true) }}>Gentrit Rashiti</a>
        ) : (
          <a className="re-mark" href="#re-top">Gentrit Rashiti</a>
        )}
        {/* CV and Email stay on case pages too: a case opened from a shared link should not need the home to reach them. */}
        <nav className="re-nav" aria-label="Site">
          {!caseSlug && <a href="#re-work">Work</a>}
          {!caseSlug && <a className="re-nav-about" href="#re-about">About</a>}
          <a href={links.cv}>CV</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>


      {new URLSearchParams(location.search).has('tune') && <TunePanel scene={sceneRef} />}
      {caseSlug && <CasePage slug={caseSlug} rest={caseRest} onBack={() => toHome()} />}

      {(hasVisitedHome || !caseSlug) && <main hidden={caseSlug !== undefined} data-cut={CUT || undefined}>
        <HomeIntroM onOpen={openCase} reduced={reduced} onPulse={pulse} />

        <ProductionM onOpen={openCase} reduced={reduced} onFocus={focusField} />

        <EvidenceM onOpen={openCase} />

        <details id="re-explore" className="re-disclosure re-solid" onToggle={(e) => setExploreOpen(e.currentTarget.open)}>
          <summary className="re-action">Explore the product layers <span>Eight products, from interface to infrastructure</span><CaretDownIcon className="re-disclosure-caret" size={20} aria-hidden="true" /></summary>
          {exploreOpen && <Suspense fallback={<p className="re-disclosure-loading" role="status">Opening the product layers…</p>}><Lab mode={mode} reduced={reduced} noGl={noGl} onOpen={openCase} /></Suspense>}
          {exploreOpen && !noGl && <AreaMap scene={activeScene} userMode={mode === 'tensor' ? 1 : 0} stage={STAGE.modes} />}
        </details>

        {/* Results before the full index (review 2026-10-31: on phones they sat 15,800 px down, after every project). */}
        <section id="re-results" className="re-ledger" data-stage={STAGE.ledger} aria-labelledby="re-ledger-h">
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

        <AllWorkM onOpen={openFromIndex} />

        {/* The field explains itself here, folded away: it is the page's ground, not its subject. */}
        <details className="re-field-notes" onToggle={(e) => { const open = e.currentTarget.open; notesOpenRef.current = open; setNotesOpen(open); if (open) setStageQ(currentStage.current) }}>
          <summary className="re-action"><PlusIcon {...ARROW} className="re-notes-closed" /><MinusIcon {...ARROW} className="re-notes-open" />The field behind this page</summary>
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
              <button type="button" className="re-btn re-btn-quiet" onClick={() => { setDrawn(count); setBloomOn(true); setCaOn(true); setRatio(RATIOS.reduce((a, b) => (Math.abs(b - Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.5)) < Math.abs(a - Math.min(devicePixelRatio || 1, innerWidth < 768 ? 1 : 1.5)) ? b : a))) }}>
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
            <p className="re-lede">Based in Kosovo, working remotely.</p>
            {/* The address is the ending's one large link; on a phone it breaks only before "@", and the arrow follows the last line. */}
            <a className="re-text-link re-contact-email" href={`mailto:${links.email}`}>{links.email.split('@')[0]}<wbr /><span className="re-contact-tail">@{links.email.split('@')[1]}<ArrowRightIcon {...ARROW} /></span></a>
            <div className="re-contact-more">
              <a className="re-link-secondary" href={links.github} target="_blank" rel="noreferrer">GitHub<ArrowUpRightIcon {...ARROW} /><span className="re-sr"> (opens in a new tab)</span></a>
              <a className="re-link-secondary" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<ArrowUpRightIcon {...ARROW} /><span className="re-sr"> (opens in a new tab)</span></a>
              <a className="re-link-secondary" href={links.cv}>CV (PDF)</a>
            </div>
            <p className="re-foot">Gentrit Rashiti</p>
          </div>
        </footer>
      </main>}

    </div>
  )
}
