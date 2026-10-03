import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { makeClusters, type Artboard } from './canvasData'
import { contain, fit, worldSize, zoomAt, type Area, type Camera } from './geometry'
import { CareArtboard, ReadingArtboard } from './LiveArtboards'

function Icon({ name }: { name: 'left' | 'right' | 'plus' | 'minus' | 'fit' }) {
  const paths = { left: 'M15 5l-7 7 7 7', right: 'M9 5l7 7-7 7', plus: 'M12 4v16M4 12h16', minus: 'M4 12h16', fit: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5' }
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}

function Picture({ frame, interactive }: { frame: Artboard; interactive: boolean }) {
  const [loaded, setLoaded] = useState(false)
  if (frame.live) return <div className="dc-artboard-live" inert={!interactive} aria-hidden={!interactive}>{frame.live === 'care' ? <CareArtboard /> : <ReadingArtboard />}</div>
  return <div className="dc-picture" style={{ background: frame.background, color: frame.ink ?? '#172114' }}>
    <span aria-hidden="true">{frame.title}</span>
    <img src={frame.src} alt={frame.alt} draggable={false} loading="lazy" decoding="async" data-loaded={loaded} onLoad={(event) => {
      const image = event.currentTarget
      void image.decode().then(() => setLoaded(true)).catch(() => setLoaded(false))
    }} onError={() => setLoaded(false)} />
  </div>
}

export default function CanvasStage({ onRead }: { onRead: (section?: string) => void }) {
  const viewport = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const mapView = useRef<SVGRectElement>(null)
  const zoomLabel = useRef<HTMLOutputElement>(null)
  const camera = useRef<Camera>({ x: -72, y: -40, scale: 1 })
  const size = useRef({ width: window.innerWidth, height: 600 })
  const animation = useRef(0)
  const reduce = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const last = useRef({ x: 0, y: 0, time: 0, vx: 0, vy: 0 })
  const pinch = useRef<{ distance: number; x: number; y: number } | null>(null)
  const [width, setWidth] = useState(window.innerWidth)
  const [selected, setSelected] = useState(-1)
  const [presenting, setPresenting] = useState(false)
  const [interactive, setInteractive] = useState<string | null>(null)
  const [notice, setNotice] = useState('Portfolio canvas. Drag to pan, scroll or pinch to zoom. A linear reading mode is available above.')
  const clusters = useMemo(() => makeClusters(width), [width])
  const active = clusters[Math.max(0, selected)]
  const liveFrame = active.frames.find((frame) => frame.live)

  function stop() { cancelAnimationFrame(animation.current); animation.current = 0 }
  function apply(next: Camera) {
    const bounded = contain(next, size.current)
    camera.current = bounded
    if (world.current) world.current.style.transform = `translate3d(${bounded.x}px, ${bounded.y}px, 0) scale(${bounded.scale})`
    if (zoomLabel.current) zoomLabel.current.textContent = `${Math.round(bounded.scale * 100)}%`
    if (mapView.current) {
      mapView.current.setAttribute('x', String(-bounded.x / bounded.scale))
      mapView.current.setAttribute('y', String(-bounded.y / bounded.scale))
      mapView.current.setAttribute('width', String(size.current.width / bounded.scale))
      mapView.current.setAttribute('height', String(size.current.height / bounded.scale))
    }
  }
  function travel(next: Camera, duration = 440, done?: () => void) {
    stop()
    if (reduce.current || duration === 0) { apply(next); done?.(); return }
    const from = { ...camera.current }
    let began = 0
    function frame(now: number) {
      if (!began) began = now
      const progress = Math.min(1, (now - began) / duration)
      const eased = 1 - (1 - progress) ** 4
      apply({ x: from.x + (next.x - from.x) * eased, y: from.y + (next.y - from.y) * eased, scale: from.scale + (next.scale - from.scale) * eased })
      if (progress < 1) animation.current = requestAnimationFrame(frame)
      else { animation.current = 0; done?.() }
    }
    animation.current = requestAnimationFrame(frame)
  }
  function overview() {
    setSelected(-1)
    setInteractive(null)
    setPresenting(false)
    travel({ x: -72, y: -40, scale: 1 })
    setNotice('Overview. Gentrit Rashiti, frontend and mobile developer, now full stack.')
  }
  function focusCluster(index: number) {
    const next = (index + clusters.length) % clusters.length
    const cluster = clusters[next]
    const first = cluster.frames[0]
    const area: Area = width < 650
      ? { x: cluster.x + first.x, y: cluster.y + first.y - 46, width: first.width, height: first.height + 46 }
      : { ...cluster, y: cluster.y - 116, height: cluster.height + 116 }
    setSelected(next)
    setInteractive(null)
    travel(fit(area, size.current, 24))
    setNotice(`${cluster.title}. ${next + 1} of ${clusters.length}. ${cluster.description}`)
  }
  function fitAll() {
    setInteractive(null)
    travel(fit({ x: 0, y: 0, ...worldSize }, size.current, 32))
    setNotice('All project clusters in view. Choose a cluster to move closer.')
  }
  function zoom(factor: number) {
    setInteractive(null)
    travel(zoomAt(camera.current, camera.current.scale * factor, { x: size.current.width / 2, y: size.current.height / 2 }), 0)
  }
  function activateLive() {
    if (!liveFrame) return
    if (interactive) { setInteractive(null); viewport.current?.focus(); return }
    setSelected(Math.max(0, selected))
    // A 100% camera is deliberate: native demo controls retain their 44px targets.
    travel({ scale: 1, x: (size.current.width - liveFrame.width) / 2 - active.x - liveFrame.x, y: (size.current.height - liveFrame.height) / 2 - active.y - liveFrame.y + 12 }, 440, () => {
      setInteractive(liveFrame.id)
      setNotice(`${liveFrame.title} demo is interactive. All displayed data is invented. Escape returns to the canvas.`)
      requestAnimationFrame(() => world.current?.querySelector<HTMLElement>(`[data-frame="${liveFrame.id}"] select, [data-frame="${liveFrame.id}"] button`)?.focus({ preventScroll: true }))
    })
  }

  useLayoutEffect(() => {
    const view = viewport.current
    if (!view) return
    let initial = true
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    reduce.current = preference.matches
    const change = () => { reduce.current = preference.matches; if (reduce.current) stop() }
    preference.addEventListener('change', change)
    const observer = new ResizeObserver(([entry]) => {
      if (!entry.contentRect.width || !entry.contentRect.height) return
      size.current = { width: entry.contentRect.width, height: entry.contentRect.height }
      setWidth(entry.contentRect.width)
      if (initial) {
        initial = false
        const target = { x: -72, y: -40, scale: 1 }
        apply(reduce.current ? target : { x: 20, y: -6, scale: 1.055 })
        travel(target, 1250)
      } else apply(camera.current)
    })
    observer.observe(view)
    const wheel = (event: WheelEvent) => {
      if ((event.target as HTMLElement).closest('[data-interactive="true"]')) return
      event.preventDefault()
      stop()
      setInteractive(null)
      const box = view.getBoundingClientRect()
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? box.height : 1)
      apply(zoomAt(camera.current, camera.current.scale * Math.exp(-delta * (event.ctrlKey ? 0.008 : 0.0015)), { x: event.clientX - box.left, y: event.clientY - box.top }))
    }
    view.addEventListener('wheel', wheel, { passive: false })
    const hidden = () => {
      if (!document.hidden) return
      stop()
      pointers.current.clear()
      pinch.current = null
      view.dataset.dragging = 'false'
    }
    document.addEventListener('visibilitychange', hidden)
    return () => { stop(); observer.disconnect(); preference.removeEventListener('change', change); view.removeEventListener('wheel', wheel); document.removeEventListener('visibilitychange', hidden) }
  }, [])

  useEffect(() => {
    // A compact viewport may not fit the full live artboard. Its linear version always does.
    if (interactive && size.current.height < 450) setNotice('The demo also appears at full size in Read as a page.')
  }, [interactive])

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest('[data-interactive="true"]')) return
    stop()
    setInteractive(null)
    event.currentTarget.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    last.current = { x: event.clientX, y: event.clientY, time: event.timeStamp, vx: 0, vy: 0 }
    event.currentTarget.dataset.dragging = 'true'
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
    }
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (pointers.current.size >= 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()]
      const next = { distance: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const box = event.currentTarget.getBoundingClientRect()
      const previous = pinch.current
      const zoomed = zoomAt(camera.current, camera.current.scale * next.distance / Math.max(1, previous.distance), { x: previous.x - box.left, y: previous.y - box.top })
      apply({ ...zoomed, x: zoomed.x + next.x - previous.x, y: zoomed.y + next.y - previous.y })
      pinch.current = next
      return
    }
    const previous = last.current
    const dx = event.clientX - previous.x, dy = event.clientY - previous.y
    const elapsed = Math.max(8, event.timeStamp - previous.time)
    apply({ ...camera.current, x: camera.current.x + dx, y: camera.current.y + dy })
    last.current = { x: event.clientX, y: event.clientY, time: event.timeStamp, vx: Math.max(-3, Math.min(3, dx / elapsed)), vy: Math.max(-3, Math.min(3, dy / elapsed)) }
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>, cancelled = false) {
    if (!pointers.current.has(event.pointerId)) return
    pointers.current.delete(event.pointerId)
    pinch.current = null
    if (pointers.current.size) {
      const [point] = [...pointers.current.values()]
      last.current = { ...point, time: event.timeStamp, vx: 0, vy: 0 }
      return
    }
    event.currentTarget.dataset.dragging = 'false'
    if (cancelled || reduce.current || event.timeStamp - last.current.time > 80) return
    let { vx, vy } = last.current
    let previous = 0
    function coast(now: number) {
      const dt = previous ? Math.min(32, now - previous) : 16
      previous = now
      const friction = Math.exp(-dt / 150)
      vx *= friction; vy *= friction
      apply({ ...camera.current, x: camera.current.x + vx * dt, y: camera.current.y + vy * dt })
      animation.current = Math.hypot(vx, vy) > 0.025 ? requestAnimationFrame(coast) : 0
    }
    if (Math.hypot(vx, vy) > 0.025) animation.current = requestAnimationFrame(coast)
  }
  function keyboard(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      stop(); setInteractive(null); setPresenting(false); viewport.current?.focus(); setNotice('Canvas navigation. Arrow keys pan.'); return
    }
    const target = event.target as HTMLElement
    if (target.closest('input,select,textarea,[contenteditable="true"],[data-interactive="true"]') || event.metaKey || event.ctrlKey || event.altKey) return
    if (event.key === '+' || event.key === '=') { event.preventDefault(); zoom(1.2) }
    if (event.key === '-') { event.preventDefault(); zoom(1 / 1.2) }
    if (event.key.toLowerCase() === 'f') { event.preventDefault(); fitAll() }
    if (event.key === 'Home') { event.preventDefault(); overview() }
    const arrows: Record<string, [number, number]> = { ArrowLeft: [90, 0], ArrowRight: [-90, 0], ArrowUp: [0, 90], ArrowDown: [0, -90] }
    const delta = arrows[event.key]
    if (!delta) return
    if (presenting) { event.preventDefault(); focusCluster(selected + (delta[0] > 0 || delta[1] > 0 ? -1 : 1)) }
    else if (target === viewport.current) { event.preventDefault(); travel({ ...camera.current, x: camera.current.x + delta[0], y: camera.current.y + delta[1] }, 0) }
  }

  return (
    <main className="dc-spatial" aria-label="Spatial portfolio" onKeyDown={keyboard}>
      <nav className="dc-cluster-nav" aria-label="Move to a project cluster">
        <button type="button" aria-current={selected < 0 ? 'true' : undefined} onClick={overview}>Overview</button>
        {clusters.map((cluster, i) => <button type="button" key={cluster.id} aria-current={selected === i ? 'true' : undefined} onClick={() => focusCluster(i)}>{cluster.title}</button>)}
      </nav>
      <div className="dc-stage-wrap">
        <div ref={viewport} className="dc-viewport" data-interacting={Boolean(interactive)} tabIndex={0} aria-label="Canvas. Arrow keys pan. Plus and minus zoom. F fits all, Home returns to overview. Escape ends demo interaction." onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={(e) => pointerUp(e)} onPointerCancel={(e) => pointerUp(e, true)}>
          <div ref={world} className="dc-world" style={{ width: worldSize.width, height: worldSize.height }}>
            <div className="dc-world-cover">
              <h1><span>Gentrit</span><span>Rashiti.</span></h1>
              <p>Frontend & mobile developer,<br />now full stack.</p>
              <p className="dc-cover-facts">Kosovo · Remote · 5+ years</p>
            </div>
            {clusters.map((cluster, index) => <section key={cluster.id} className="dc-cluster" aria-label={cluster.title} data-selected={selected === index} style={{ left: cluster.x, top: cluster.y, width: cluster.width, height: cluster.height }}>
              <h2>{cluster.title}</h2><p className="dc-cluster-description">{cluster.description}</p>
              {cluster.frames.map((frame) => <figure key={frame.id} data-frame={frame.id} className="dc-artboard" data-interactive={interactive === frame.id} style={{ left: frame.x, top: frame.y, width: frame.width, height: frame.height, '--art-ground': frame.background } as CSSProperties}>
                <figcaption><strong>{frame.title}</strong><span>{frame.caption}</span></figcaption>
                <Picture frame={frame} interactive={interactive === frame.id} />
              </figure>)}
            </section>)}
          </div>
        </div>
        <button className="dc-minimap" type="button" aria-label="Minimap. Click to recenter the canvas, or press Enter to fit all." onClick={(event) => {
          if (event.detail === 0) { fitAll(); return }
          setInteractive(null)
          const rect = event.currentTarget.querySelector('svg')!.getBoundingClientRect()
          const x = (event.clientX - rect.left) / rect.width * worldSize.width
          const y = (event.clientY - rect.top) / rect.height * worldSize.height
          travel({ ...camera.current, x: size.current.width / 2 - x * camera.current.scale, y: size.current.height / 2 - y * camera.current.scale })
        }}>
          <svg viewBox={`0 0 ${worldSize.width} ${worldSize.height}`} preserveAspectRatio="none" aria-hidden="true">
            <rect x="96" y="76" width="700" height="460" className="dc-map-cover" />
            {clusters.flatMap((cluster) => cluster.frames.map((frame) => <rect key={frame.id} x={cluster.x + frame.x} y={cluster.y + frame.y} width={frame.width} height={frame.height} fill={frame.background} />))}
            <rect ref={mapView} className="dc-map-view" />
          </svg>
        </button>
        <p className="dc-stage-help">{interactive ? 'Escape returns to the canvas' : presenting ? 'Presenting · arrow keys change clusters' : 'Drag to pan. Scroll or pinch to zoom.'}</p>
      </div>
      <footer className="dc-controls">
        <div className="dc-project-controls">
          <button type="button" className="dc-solid" aria-pressed={presenting} onClick={() => { setPresenting(!presenting); if (!presenting) focusCluster(Math.max(0, selected)); viewport.current?.focus(); setNotice(presenting ? 'Presentation ended.' : 'Presentation started. Arrow keys move between project clusters. Escape ends.')}}>{presenting ? 'End presentation' : 'Present'}</button>
          {liveFrame && <button type="button" onClick={activateLive} aria-pressed={interactive === liveFrame.id}>{interactive ? 'Finish demo' : 'Try demo'}</button>}
          <button type="button" onClick={() => onRead('dc-case')}>Care case study</button>
        </div>
        <div className="dc-camera-controls" role="group" aria-label="Camera controls">
          <button type="button" aria-label="Previous cluster" onClick={() => focusCluster(selected - 1)}><Icon name="left" /></button>
          <button type="button" aria-label="Next cluster" onClick={() => focusCluster(selected + 1)}><Icon name="right" /></button>
          <button type="button" aria-label="Zoom out" onClick={() => zoom(1 / 1.2)}><Icon name="minus" /></button>
          <output ref={zoomLabel} aria-label="Zoom level">100%</output>
          <button type="button" aria-label="Zoom in" onClick={() => zoom(1.2)}><Icon name="plus" /></button>
          <button type="button" aria-label="Fit all project clusters" onClick={fitAll}><Icon name="fit" /></button>
        </div>
      </footer>
      <p className="dc-sr" role="status">{notice}</p>
    </main>
  )
}
