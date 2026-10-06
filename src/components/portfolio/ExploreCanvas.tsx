import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  ArrowsOutSimpleIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MinusIcon,
  PlusIcon,
  XIcon,
} from '@phosphor-icons/react'
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react'
import { caseHref, findProject, type RecreationKey } from '../../content/projects'
import { recreations } from '../../lib/recreations'
import { preloadCase } from '../../lib/routes'
import { TransitionLink } from '../TransitionLink'
import { canvasSize, containCamera, fitCamera, zoomCamera, type Area, type Camera } from './canvasGeometry'
import './explore-canvas.css'

interface Artboard extends Area {
  id: string
  project: string
  src: string
  alt: string
  caption: string
  live?: RecreationKey
}
interface Cluster extends Area {
  name: string
  project: string
  frames: Artboard[]
}

const clusters: Cluster[] = [
  {
    name: 'Streaming',
    project: 'bayyinah-tv',
    x: 96,
    y: 96,
    width: 1296,
    height: 896,
    frames: [
      {
        id: 'bayyinah-web',
        project: 'bayyinah-tv',
        x: 0,
        y: 72,
        width: 848,
        height: 530,
        src: '/showcase/bayyinah/web-01.webp',
        alt: 'Bayyinah TV public website',
        caption: 'Bayyinah TV · Web',
        live: 'live-room',
      },
      {
        id: 'bayyinah-app',
        project: 'bayyinah-tv',
        x: 880,
        y: 0,
        width: 360,
        height: 779,
        src: '/showcase/bayyinah/store-01.webp',
        alt: 'Bayyinah TV public app-store frame',
        caption: 'Bayyinah TV · iOS & Android',
      },
    ],
  },
  {
    name: 'Mobile',
    project: 'read-to-feed',
    x: 1680,
    y: 64,
    width: 1280,
    height: 1008,
    frames: [
      {
        id: 'viva',
        project: 'viva-fresh',
        x: 0,
        y: 144,
        width: 328,
        height: 710,
        src: '/mobile/grocery-1.webp',
        alt: 'Viva Fresh public store frame',
        caption: 'Viva Fresh · React Native',
      },
      {
        id: 'reader',
        project: 'read-to-feed',
        x: 376,
        y: 0,
        width: 392,
        height: 848,
        src: '/mobile/reading-1.webp',
        alt: 'Read to Feed public store frame',
        caption: 'Read to Feed · React Native',
      },
      {
        id: 'bookstore',
        project: 'dukagjini-bookstore',
        x: 816,
        y: 200,
        width: 328,
        height: 710,
        src: '/mobile/bookstore-1.webp',
        alt: 'Dukagjini Bookstore public store frame',
        caption: 'Dukagjini · React Native',
      },
    ],
  },
  {
    name: 'Healthcare',
    project: 'care-platform',
    x: 304,
    y: 1336,
    width: 1232,
    height: 1072,
    frames: [
      {
        id: 'care-live',
        project: 'care-platform',
        x: 0,
        y: 0,
        width: 960,
        height: 600,
        src: '/signal-posters/healthcare.avif',
        alt: 'Care-management recreation with invented patient readings',
        caption: 'Care management · Recreation with invented data',
        live: 'care',
      },
      {
        id: 'care-claims',
        project: 'care-platform',
        x: 528,
        y: 624,
        width: 688,
        height: 430,
        src: '/showcase/care-dashboard/claims.webp',
        alt: 'Care-platform claims for one month, with counts by status and claims that need attention. Invented data.',
        caption: 'Claims · Real screen, invented data',
      },
    ],
  },
  {
    name: 'Independent',
    project: 'offday',
    x: 1944,
    y: 1392,
    width: 1376,
    height: 1280,
    frames: [
      {
        id: 'offday',
        project: 'offday',
        x: 144,
        y: 0,
        width: 1056,
        height: 660,
        src: '/personal/shots/offday-light-calendar-desktop.webp',
        alt: 'Offday team calendar and approval queue',
        caption: 'Offday · Team calendar',
      },
      {
        id: 'snaxx',
        project: 'snaxx-tech',
        x: 0,
        y: 720,
        width: 768,
        height: 480,
        src: '/personal/shots/snaxx-desktop.webp',
        alt: 'Snaxx Tech studio website',
        caption: 'Snaxx Tech · Studio',
      },
    ],
  },
]

function inputTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLElement && (target.isContentEditable || Boolean(target.closest('input, textarea, select')))
  )
}

function LivePicture({ frame, enabled }: { frame: Artboard; enabled: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const node = host.current
    if (!node || !enabled) return
    let inView = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
        setVisible(inView && !document.hidden)
      },
      { threshold: 0.1 },
    )
    observer.observe(node)
    const visibility = () => setVisible(inView && !document.hidden)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [enabled])
  const entry = frame.live ? recreations[frame.live] : null
  const Recreation = entry?.Component
  const still = (
    <img
      src={frame.src}
      alt={frame.alt}
      width={frame.width}
      height={frame.height}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  )
  return (
    <div ref={host} className="ec-picture" data-world={entry?.world}>
      {enabled && visible && Recreation ? (
        <Suspense fallback={still}>
          <div
            inert
            aria-hidden
            className="ec-live-picture"
            style={{
              width: 960,
              height: (frame.height * 960) / frame.width,
              transform: `scale(${frame.width / 960})`,
              transformOrigin: 'top left',
            }}
          >
            <Recreation />
          </div>
        </Suspense>
      ) : (
        still
      )}
    </div>
  )
}

function ProjectWindow({
  frame,
  index,
  front,
  onFront,
  onClose,
}: {
  frame: Artboard
  index: number
  front: number
  onFront: () => void
  onClose: () => void
}) {
  const node = useRef<HTMLElement>(null)
  const position = useRef({ x: 32 + index * 40, y: 32 + index * 32 })
  const drag = useRef<{ id: number; x: number; y: number } | null>(null)
  const project = findProject(frame.project)
  function move(x: number, y: number) {
    const el = node.current
    if (!el?.parentElement) return
    position.current = {
      x: Math.max(0, Math.min(el.parentElement.clientWidth - el.offsetWidth, x)),
      y: Math.max(0, Math.min(el.parentElement.clientHeight - 96, y)),
    }
    el.style.transform = `translate(${position.current.x}px, ${position.current.y}px)`
  }
  useLayoutEffect(() => {
    const parent = node.current?.parentElement
    if (!parent) return
    const observer = new ResizeObserver(() => move(position.current.x, position.current.y))
    observer.observe(parent)
    return () => observer.disconnect()
  }, [])
  return (
    <section
      ref={node}
      className="ec-window"
      aria-label={`${project?.name} project window`}
      style={{ zIndex: front }}
      onPointerDownCapture={onFront}
      onFocusCapture={onFront}
    >
      <header>
        <button
          className="ec-window-title"
          aria-label={`Move ${project?.name} window. Use arrow keys.`}
          onPointerDown={(event) => {
            if (event.button !== 0) return
            event.currentTarget.setPointerCapture(event.pointerId)
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          }}
          onPointerMove={(event) => {
            const start = drag.current
            if (!start || start.id !== event.pointerId) return
            move(position.current.x + event.clientX - start.x, position.current.y + event.clientY - start.y)
            drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          }}
          onPointerUp={() => {
            drag.current = null
          }}
          onPointerCancel={() => {
            drag.current = null
          }}
          onKeyDown={(event) => {
            const directions: Record<string, [number, number]> = {
              ArrowLeft: [-24, 0],
              ArrowRight: [24, 0],
              ArrowUp: [0, -24],
              ArrowDown: [0, 24],
            }
            const delta = directions[event.key]
            if (delta) {
              event.preventDefault()
              event.stopPropagation()
              move(position.current.x + delta[0], position.current.y + delta[1])
            }
          }}
        >
          {project?.name}
        </button>
        <button className="ec-icon" aria-label={`Close ${project?.name} window`} onClick={onClose}>
          <XIcon size={18} />
        </button>
      </header>
      <div className="ec-window-body">
        <img src={frame.src} alt={frame.alt} draggable={false} />
        <p>{project?.line}</p>
        <div>
          {project?.links.slice(0, 2).map((link) => (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
              <ArrowUpRightIcon size={16} />
              <span className="ec-sr"> (opens in new tab)</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Self-contained modal. Mount conditionally; onClose removes it from the page. */
export default function ExploreCanvas({ onClose }: { onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const closing = useRef(false)
  const viewport = useRef<HTMLDivElement>(null)
  const world = useRef<HTMLDivElement>(null)
  const mapView = useRef<SVGRectElement>(null)
  const zoomLabel = useRef<HTMLOutputElement>(null)
  const camera = useRef<Camera>({ x: 0, y: 0, scale: 0.6 })
  const size = useRef({ width: 1, height: 1 })
  const animation = useRef(0)
  const reduce = useRef(false)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const last = useRef({ x: 0, y: 0, time: 0, vx: 0, vy: 0 })
  const pinch = useRef<{ distance: number; x: number; y: number } | null>(null)
  const [selected, setSelected] = useState(0)
  const [presenting, setPresenting] = useState(false)
  const [live, setLive] = useState<string | null>(null)
  const [desktop, setDesktop] = useState(false)
  const [windows, setWindows] = useState<Array<{ id: string; front: number }>>([{ id: 'bayyinah-web', front: 1 }])
  const [notice, setNotice] = useState('Streaming cluster. Drag to explore, or choose a cluster.')
  const active = clusters[selected]
  const project = findProject(active.project)
  const liveFrame = active.frames.find((frame) => frame.live)
  const allFrames = clusters.flatMap((cluster) => cluster.frames)

  function stop() {
    cancelAnimationFrame(animation.current)
    animation.current = 0
  }

  function apply(next: Camera) {
    const bounds = containCamera(next, size.current)
    camera.current = bounds
    if (world.current)
      world.current.style.transform = `translate3d(${bounds.x}px, ${bounds.y}px, 0) scale(${bounds.scale})`
    if (zoomLabel.current) zoomLabel.current.textContent = `${Math.round(bounds.scale * 100)}%`
    const map = mapView.current
    if (map) {
      map.setAttribute('x', String(-bounds.x / bounds.scale))
      map.setAttribute('y', String(-bounds.y / bounds.scale))
      map.setAttribute('width', String(size.current.width / bounds.scale))
      map.setAttribute('height', String(size.current.height / bounds.scale))
    }
  }

  function travel(next: Camera, smooth = true) {
    stop()
    if (reduce.current || !smooth) {
      apply(next)
      return
    }
    const from = { ...camera.current }
    const started = performance.now()
    function step(time: number) {
      const t = Math.min(1, (time - started) / 320)
      const eased = 1 - (1 - t) ** 3
      apply({
        x: from.x + (next.x - from.x) * eased,
        y: from.y + (next.y - from.y) * eased,
        scale: from.scale + (next.scale - from.scale) * eased,
      })
      animation.current = t < 1 ? requestAnimationFrame(step) : 0
    }
    animation.current = requestAnimationFrame(step)
  }

  function frameCamera(area: Area, padding = 32) {
    const topRail = 80
    const fitted = fitCamera(
      area,
      { width: size.current.width, height: Math.max(1, size.current.height - topRail) },
      padding,
    )
    return { ...fitted, y: fitted.y + topRail }
  }

  function focusCluster(index: number, smooth = true) {
    const next = (index + clusters.length) % clusters.length
    setSelected(next)
    setNotice(`${clusters[next].name} cluster. ${next + 1} of ${clusters.length}.`)
    const cluster = clusters[next]
    const first = cluster.frames[0]
    const area =
      size.current.width < 600
        ? { x: cluster.x + first.x, y: cluster.y + first.y + 32, width: first.width, height: first.height + 32 }
        : { ...cluster, y: cluster.y - 32, height: cluster.height + 32 }
    travel(frameCamera(area, size.current.width < 600 ? 20 : 32), smooth)
  }

  function fitAll() {
    setNotice('All four project clusters in view.')
    travel(frameCamera({ x: 0, y: 0, ...canvasSize }))
  }

  function zoom(factor: number) {
    travel(
      zoomCamera(camera.current, camera.current.scale * factor, {
        x: size.current.width / 2,
        y: size.current.height / 2,
      }),
      false,
    )
  }

  useLayoutEffect(() => {
    const node = dialog.current
    const view = viewport.current
    if (!node || !view) return
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closing.current = false
    node.showModal()
    const preference = matchMedia('(prefers-reduced-motion: reduce)')
    reduce.current = preference.matches
    const preferenceChanged = () => {
      reduce.current = preference.matches
      if (reduce.current) stop()
    }
    preference.addEventListener('change', preferenceChanged)
    let initial = true
    const resize = new ResizeObserver(([entry]) => {
      if (!entry.contentRect.width || !entry.contentRect.height) return
      size.current = { width: entry.contentRect.width, height: entry.contentRect.height }
      if (initial) {
        initial = false
        focusCluster(0, false)
      } else apply(camera.current)
    })
    resize.observe(view)
    const wheel = (event: WheelEvent) => {
      event.preventDefault()
      stop()
      const rect = view.getBoundingClientRect()
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? rect.height : 1)
      apply(
        zoomCamera(camera.current, camera.current.scale * Math.exp(-delta * (event.ctrlKey ? 0.008 : 0.0015)), {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        }),
      )
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
    return () => {
      stop()
      resize.disconnect()
      preference.removeEventListener('change', preferenceChanged)
      view.removeEventListener('wheel', wheel)
      document.removeEventListener('visibilitychange', hidden)
      document.body.style.overflow = overflow
      if (node.open) node.close()
      opener?.focus({ preventScroll: true })
    }
  }, [])

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    stop()
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
      const rect = event.currentTarget.getBoundingClientRect()
      const previous = pinch.current
      const zoomed = zoomCamera(
        camera.current,
        (camera.current.scale * next.distance) / Math.max(1, previous.distance),
        { x: previous.x - rect.left, y: previous.y - rect.top },
      )
      apply({ ...zoomed, x: zoomed.x + next.x - previous.x, y: zoomed.y + next.y - previous.y })
      pinch.current = next
      return
    }
    const previous = last.current
    const dx = event.clientX - previous.x
    const dy = event.clientY - previous.y
    const elapsed = Math.max(8, event.timeStamp - previous.time)
    apply({ ...camera.current, x: camera.current.x + dx, y: camera.current.y + dy })
    last.current = {
      x: event.clientX,
      y: event.clientY,
      time: event.timeStamp,
      vx: Math.max(-3, Math.min(3, dx / elapsed)),
      vy: Math.max(-3, Math.min(3, dy / elapsed)),
    }
  }

  function pointerUp(event: PointerEvent<HTMLDivElement>, cancelled = false) {
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
    let previous = performance.now()
    function coast(time: number) {
      const dt = Math.min(32, time - previous)
      previous = time
      const friction = Math.exp(-dt / 150)
      vx *= friction
      vy *= friction
      apply({ ...camera.current, x: camera.current.x + vx * dt, y: camera.current.y + vy * dt })
      animation.current = Math.hypot(vx, vy) > 0.025 ? requestAnimationFrame(coast) : 0
    }
    if (Math.hypot(vx, vy) > 0.025) animation.current = requestAnimationFrame(coast)
  }

  function keyboard(event: KeyboardEvent<HTMLDialogElement>) {
    if (inputTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
    const key = event.key.toLowerCase()
    if (key === 'o') {
      event.preventDefault()
      if (!event.repeat) {
        stop()
        setDesktop((value) => !value)
      }
      return
    }
    if (desktop) return
    if (key === '+' || key === '=') {
      event.preventDefault()
      zoom(1.2)
    }
    if (key === '-') {
      event.preventDefault()
      zoom(1 / 1.2)
    }
    if (key === 'f') {
      event.preventDefault()
      fitAll()
    }
    if (presenting && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      focusCluster(selected + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1), false)
    } else if (event.target === viewport.current) {
      const directions: Record<string, [number, number]> = {
        ArrowLeft: [80, 0],
        ArrowRight: [-80, 0],
        ArrowUp: [0, 80],
        ArrowDown: [0, -80],
      }
      const delta = directions[event.key]
      if (delta) {
        event.preventDefault()
        travel({ ...camera.current, x: camera.current.x + delta[0], y: camera.current.y + delta[1] }, false)
      }
    }
  }

  function frontWindow(id: string) {
    setWindows((current) => {
      const front = Math.max(0, ...current.map((item) => item.front)) + 1
      return current.some((item) => item.id === id)
        ? current.map((item) => (item.id === id ? { ...item, front } : item))
        : [...current, { id, front }]
    })
  }

  function closeCanvas() {
    closing.current = true
    dialog.current?.close()
  }

  return (
    <dialog
      ref={dialog}
      className="ec-dialog"
      aria-labelledby="ec-title"
      aria-describedby="ec-help"
      onCancel={() => {
        closing.current = true
      }}
      onClose={() => {
        if (closing.current) onClose()
      }}
      onKeyDown={keyboard}
    >
      <header className="ec-header">
        <button autoFocus className="ec-back" onClick={closeCanvas}>
          <ArrowLeftIcon size={18} />
          Back to index
        </button>
        <h2 id="ec-title">{desktop ? 'Gentrit’s desktop' : 'The project canvas'}</h2>
        {desktop ? (
          <button className="ec-control" onClick={() => setDesktop(false)}>
            Return to canvas
          </button>
        ) : (
          <button
            className="ec-control ec-present"
            aria-pressed={presenting}
            onClick={() => {
              setPresenting((value) => !value)
              viewport.current?.focus()
              setNotice(presenting ? 'Presenter mode off.' : 'Presenter mode. Arrow keys move between clusters.')
            }}
          >
            Present
          </button>
        )}
      </header>

      <div className="ec-body">
        <div
          ref={viewport}
          className="ec-viewport"
          hidden={desktop}
          tabIndex={0}
          aria-label="Project canvas. Arrow keys pan, plus and minus zoom, F fits all."
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={(event) => pointerUp(event)}
          onPointerCancel={(event) => pointerUp(event, true)}
        >
          <div ref={world} className="ec-world" style={{ width: canvasSize.width, height: canvasSize.height }}>
            {clusters.map((cluster, clusterIndex) => (
              <section
                key={cluster.name}
                className="ec-cluster"
                aria-label={cluster.name}
                data-selected={selected === clusterIndex}
                style={{ left: cluster.x, top: cluster.y, width: cluster.width, height: cluster.height }}
              >
                <h3>{cluster.name}</h3>
                {cluster.frames.map((frame) => (
                  <figure
                    key={frame.id}
                    className="ec-artboard"
                    style={
                      { left: frame.x, top: frame.y + 64, width: frame.width, height: frame.height } as CSSProperties
                    }
                  >
                    <figcaption>
                      {live === frame.id && frame.live === 'live-room' ? 'Live room · Recreation' : frame.caption}
                    </figcaption>
                    <LivePicture frame={frame} enabled={live === frame.id} />
                  </figure>
                ))}
              </section>
            ))}
          </div>
        </div>

        {!desktop && (
          <>
            <nav className="ec-clusters" aria-label="Canvas clusters">
              {clusters.map((cluster, index) => (
                <button
                  key={cluster.name}
                  aria-current={index === selected ? 'true' : undefined}
                  onClick={() => focusCluster(index)}
                >
                  {cluster.name}
                </button>
              ))}
            </nav>
            <button
              className="ec-minimap"
              aria-label="Canvas minimap. Click to recenter. Press Enter to fit all."
              onClick={(event) => {
                if (event.detail === 0) {
                  fitAll()
                  return
                }
                const rect = event.currentTarget.querySelector('svg')!.getBoundingClientRect()
                const x = ((event.clientX - rect.left) / rect.width) * canvasSize.width
                const y = ((event.clientY - rect.top) / rect.height) * canvasSize.height
                travel({
                  ...camera.current,
                  x: size.current.width / 2 - x * camera.current.scale,
                  y: size.current.height / 2 - y * camera.current.scale,
                })
              }}
            >
              <svg viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} aria-hidden preserveAspectRatio="none">
                {clusters.flatMap((cluster) =>
                  cluster.frames.map((frame) => (
                    <rect
                      key={frame.id}
                      x={cluster.x + frame.x}
                      y={cluster.y + frame.y + 64}
                      width={frame.width}
                      height={frame.height}
                      className="ec-map-frame"
                    />
                  )),
                )}
                <rect ref={mapView} className="ec-map-view" />
              </svg>
            </button>
          </>
        )}

        {desktop && (
          <div className="ec-desktop">
            <nav className="ec-desktop-dock" aria-label="Open a project window">
              {clusters.map((cluster) => {
                const frame = cluster.frames[0]
                const item = findProject(frame.project)
                return (
                  <button
                    key={frame.id}
                    data-desktop-project={frame.id}
                    aria-pressed={windows.some((window) => window.id === frame.id)}
                    onClick={() => frontWindow(frame.id)}
                  >
                    {item?.name}
                  </button>
                )
              })}
            </nav>
            <div className="ec-desktop-space">
              {windows.map((window, index) => {
                const frame = allFrames.find((frame) => frame.id === window.id)
                return frame ? (
                  <ProjectWindow
                    key={window.id}
                    frame={frame}
                    index={index}
                    front={window.front}
                    onFront={() => frontWindow(window.id)}
                    onClose={() => {
                      setWindows((current) => current.filter((item) => item.id !== window.id))
                      dialog.current?.querySelector<HTMLButtonElement>(`[data-desktop-project="${window.id}"]`)?.focus()
                    }}
                  />
                ) : null
              })}
              {!windows.length && <p className="ec-empty">Open a project from the dock.</p>}
            </div>
          </div>
        )}
      </div>

      <footer className="ec-toolbar">
        <p id="ec-help">
          {desktop
            ? 'Drag a window. Arrow keys move its title bar.'
            : presenting
              ? 'Presenter · Use arrow keys to move between clusters.'
              : 'Drag to pan · Scroll or pinch to zoom'}
        </p>
        {!desktop && (
          <>
            <div className="ec-project-actions">
              {liveFrame && (
                <button
                  className="ec-control"
                  aria-pressed={live === liveFrame.id}
                  onClick={() => {
                    setLive(live === liveFrame.id ? null : liveFrame.id)
                    travel(
                      frameCamera(
                        {
                          x: active.x + liveFrame.x,
                          y: active.y + liveFrame.y + 32,
                          width: liveFrame.width,
                          height: liveFrame.height + 32,
                        },
                        size.current.width < 600 ? 20 : 48,
                      ),
                    )
                  }}
                >
                  {live === liveFrame.id ? 'Stop preview' : 'Live preview'}
                </button>
              )}
              {project?.featured && (
                <TransitionLink to={caseHref(project)} preload={() => preloadCase(project.slug)} className="ec-control">
                  Open project
                  <ArrowUpRightIcon size={16} />
                </TransitionLink>
              )}
            </div>
            <div className="ec-zoom" aria-label="Canvas controls">
              <button className="ec-icon" aria-label="Previous cluster" onClick={() => focusCluster(selected - 1)}>
                <CaretLeftIcon size={18} />
              </button>
              <button className="ec-icon" aria-label="Next cluster" onClick={() => focusCluster(selected + 1)}>
                <CaretRightIcon size={18} />
              </button>
              <button className="ec-icon" aria-label="Zoom out" onClick={() => zoom(1 / 1.2)}>
                <MinusIcon size={18} />
              </button>
              <output ref={zoomLabel} aria-label="Zoom level">
                60%
              </output>
              <button className="ec-icon" aria-label="Zoom in" onClick={() => zoom(1.2)}>
                <PlusIcon size={18} />
              </button>
              <button className="ec-icon" aria-label="Fit all projects" onClick={fitAll}>
                <ArrowsOutSimpleIcon size={18} />
              </button>
            </div>
          </>
        )}
      </footer>
      <p className="ec-sr" role="status">
        {notice}
      </p>
    </dialog>
  )
}
