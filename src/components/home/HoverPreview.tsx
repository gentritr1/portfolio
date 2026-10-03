import { Suspense, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { channels } from '../../content/channels'
import { worldOf, type Project } from '../../content/projects'
import { cn } from '../../lib/cn'
import { recreations } from '../../lib/recreations'
import { SignalDot } from '../SignalDot'
import { Thumb } from '../Thumb'

const CARD_W = 288
const CARD_H = 235
const OFFSET = 22
const EDGE = 12

/**
 * A small monitor that trails the pointer over the schedule. The parent
 * mounts it only for a fine pointer without reduced motion.
 */
export function HoverPreview({ project, origin }: { project: Project | null; origin?: { x: number; y: number } }) {
  const frame = useRef<HTMLDivElement>(null)
  const picture = useRef<HTMLDivElement>(null)
  const scan = useRef<HTMLDivElement>(null)
  const pointer = useRef(origin)
  if (origin) pointer.current = origin
  const [last, setLast] = useState<Project | null>(project)
  if (project && project !== last) setLast(project)
  const visible = project !== null
  const [pageVisible, setPageVisible] = useState(() => !document.hidden)

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden)
    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY }
    }
    document.addEventListener('visibilitychange', update)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('pointermove', onMove)
    }
  }, [])

  useLayoutEffect(() => {
    if (!visible) return
    const node = frame.current
    if (!node) return
    let x = -1
    let y = -1
    let tx = -1
    let ty = -1
    let raf = 0
    let then = 0
    node.style.visibility = 'hidden'

    function target(px: number, py: number) {
      const right = px + OFFSET + CARD_W + EDGE > window.innerWidth
      tx = Math.max(EDGE, right ? px - OFFSET - CARD_W : px + OFFSET)
      ty = Math.min(Math.max(py + OFFSET, EDGE), window.innerHeight - CARD_H - EDGE)
      if (x < 0) {
        x = tx
        y = ty
        node!.style.transform = `translate3d(${x}px, ${y}px, 0)`
        node!.style.visibility = ''
      }
      if (!raf) {
        then = performance.now()
        raf = requestAnimationFrame(step)
      }
    }

    function step(now: number) {
      const k = 1 - Math.exp(-Math.min(now - then, 50) * 0.013)
      then = now
      x += (tx - x) * k
      y += (ty - y) * k
      node!.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(step) : 0
    }

    if (pointer.current) target(pointer.current.x, pointer.current.y)
    const onMove = (event: PointerEvent) => target(event.clientX, event.clientY)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [visible])

  useLayoutEffect(() => {
    if (!project || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const tuning = picture.current?.animate(
      [{ opacity: 0.35, filter: 'blur(2px)' }, { opacity: 1, filter: 'blur(0px)' }],
      { duration: 260, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
    )
    const sweep = scan.current?.animate(
      [{ transform: 'translateY(-100%)', opacity: 1 }, { transform: 'translateY(0)', opacity: 0 }],
      { duration: 260, easing: 'linear' },
    )
    return () => { tuning?.cancel(); sweep?.cancel() }
  }, [project])

  const shown = project ?? last
  const monitor = shown?.featured?.monitor
  const key = monitor && monitor !== 'gallery' ? monitor : shown?.media.recreation
  const recreation = key ? recreations[key] : null
  const Recreation = recreation?.Component
  const still = shown && (
    recreation || shown.media.shot ? (
      <img
        src={recreation ? `/signal-posters/${shown.channel}.avif` : shown.media.shot!.src}
        alt=""
        width={280}
        height={175}
        decoding="async"
        className="block size-full object-cover object-top"
      />
    ) : shown.media.thumb ? (
      <Thumb kind={shown.media.thumb} world={worldOf(shown)} className="size-full! rounded-none! border-0!" />
    ) : null
  )
  return (
    <div ref={frame} aria-hidden inert className="pointer-events-none fixed top-0 left-0 z-(--z-overlay) w-72" style={{ willChange: visible ? 'transform' : undefined }}>
      <div
        data-channel={shown?.channel}
        className={cn(
          'rounded-stage bg-bezel p-1 pt-0 shadow-stage ring-1 ring-[color-mix(in_oklab,var(--tint)_30%,var(--bezel-line))] ring-inset transition-opacity duration-150 ease-out',
          visible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {shown && (
          <>
            <div className="flex min-h-7 items-center gap-2 px-1.5 label text-bezel-ink [color-scheme:dark]">
              <SignalDot tone={recreation ? 'signal' : 'off'} />
              <span className="text-tint">{channels[shown.channel].number}</span>
              <span className="truncate">{shown.name}</span>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-stage-inner bg-panel-2">
              <div ref={picture} className="absolute inset-0">
                {Recreation && visible && pageVisible ? (
                  <Suspense fallback={still}>
                    <div key={shown.slug} data-world={recreation!.world} className="@container absolute top-0 left-0 h-[500px] w-[800px] origin-top-left scale-[0.35]">
                      <Recreation />
                    </div>
                  </Suspense>
                ) : still}
              </div>
              <div ref={scan} className="absolute inset-0 -translate-y-full border-b border-signal" />
            </div>
            <div className="flex min-h-7 items-center justify-between px-1.5 label text-bezel-ink [color-scheme:dark]">
              <span>{recreation ? 'Recreation' : shown.media.shot ? 'Public frame' : 'Illustration'}</span>
              <span>{recreation ? 'Invented data' : shown.years}</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
