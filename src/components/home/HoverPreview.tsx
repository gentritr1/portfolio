import { useEffect, useRef, useState } from 'react'
import { channels } from '../../content/channels'
import { worldOf, type Project } from '../../content/projects'
import { cn } from '../../lib/cn'
import { Thumb } from '../Thumb'

const CARD_W = 288
const CARD_H = 216
const OFFSET = 22
const EDGE = 12

/**
 * A small monitor that trails the pointer over the schedule. The parent
 * mounts it only for a fine pointer without reduced motion.
 */
export function HoverPreview({ project }: { project: Project | null }) {
  const frame = useRef<HTMLDivElement>(null)
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const [last, setLast] = useState<Project | null>(project)
  if (project && project !== last) setLast(project)
  const visible = project !== null

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current = { x: event.clientX, y: event.clientY }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  useEffect(() => {
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
      tx = right ? px - OFFSET - CARD_W : px + OFFSET
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

  const shown = project ?? last
  return (
    <div ref={frame} aria-hidden className="pointer-events-none fixed top-0 left-0 z-(--z-overlay) w-72 will-change-transform">
      <div
        data-channel={shown?.channel}
        className={cn(
          'origin-top-left rounded-stage bg-bezel p-1 pt-0 shadow-stage ring-1 ring-[color-mix(in_oklab,var(--tint)_30%,var(--bezel-line))] ring-inset transition-[opacity,scale]',
          visible ? 'scale-100 opacity-100 duration-(--dur-preview) ease-out' : 'scale-96 opacity-0 duration-150 ease-out',
        )}
      >
        {shown && (
          <>
            <div className="flex min-h-7 items-center gap-2 px-1.5 label text-bezel-ink [color-scheme:dark]">
              <span className="text-tint">{channels[shown.channel].number}</span>
              <span className="truncate">{shown.name}</span>
            </div>
            <div className="aspect-[16/10] overflow-hidden rounded-stage-inner bg-panel-2">
              {shown.media.shot ? (
                <img
                  src={shown.media.shot.src}
                  alt=""
                  width={256}
                  height={160}
                  decoding="async"
                  className="block size-full object-cover object-top"
                />
              ) : shown.media.thumb ? (
                <Thumb kind={shown.media.thumb} world={worldOf(shown)} className="size-full! rounded-none! border-0!" />
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
