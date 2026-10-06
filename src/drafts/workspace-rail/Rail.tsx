import { Fragment, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { CropShot } from '../../components/CropShot'
import { recreations } from '../../lib/recreations'
import type { Card, Pin, Plate, Row } from './data'

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)'
const DRAW_MS = 180
const RING = 6

interface Box {
  x: number
  y: number
  w: number
  h: number
}

interface Geometry {
  plate: Box
  gutter: number
  dot: { x: number; y: number }
  targets: Record<string, Box>
}

type Point = [number, number]

function cite(text: string): ReactNode {
  return text.split(/(\{[^}]+\})/).map((part, index) =>
    part.startsWith('{') ? (
      <strong key={index} className="wr-cite">
        {part.slice(1, -1)}
      </strong>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  )
}

/** A text pin measures the glyphs, not the box, so a stretched element does not move the ring away from its words. */
function findTarget(plate: HTMLElement, pin: Pin, shotWidth: number): DOMRect | null {
  if (pin.kind === 'shot') {
    const image = plate.querySelector('img')
    if (!image || !shotWidth) return null
    const frame = image.getBoundingClientRect()
    const scale = frame.width / shotWidth
    const box = new DOMRect(frame.left + pin.x * scale, frame.top + pin.y * scale, pin.w * scale, pin.h * scale)
    const edge = plate.getBoundingClientRect()
    const inside = box.left >= edge.left && box.top >= edge.top && box.right <= edge.right && box.bottom <= edge.bottom
    return inside ? box : null
  }
  if (pin.kind !== 'css') return null
  for (const element of plate.querySelectorAll<HTMLElement>(pin.css)) {
    if (pin.text === undefined) return element.getBoundingClientRect()
    if (element.textContent?.trim() !== pin.text) continue
    const range = document.createRange()
    range.selectNodeContents(element)
    return range.getBoundingClientRect()
  }
  return null
}

/** The ring sits beside the part, and the line ends on the ring. */
function anchor(row: Row, box: Box, isPoint: boolean) {
  const route = row.route ?? 'side'
  const cx = box.x + box.w / 2
  const cy = row.pin?.kind === 'css' && row.pin.at === 'mid' ? box.y + box.h * 0.42 : box.y + box.h / 2
  if (isPoint) {
    if (route === 'over') return { ring: [cx, cy] as Point, end: [cx, cy - RING] as Point }
    if (route === 'under') return { ring: [cx, cy] as Point, end: [cx, cy + RING] as Point }
    return { ring: [cx, cy] as Point, end: [cx + RING, cy] as Point }
  }
  if (route === 'over') return { ring: [cx, box.y - RING - 3] as Point, end: [cx, box.y - 2 * RING - 3] as Point }
  if (route === 'under') return { ring: [cx, box.y + box.h + RING + 3] as Point, end: [cx, box.y + box.h + 2 * RING + 3] as Point }
  const y = Math.min(cy, box.y + 22)
  return { ring: [box.x + box.w + RING + 3, row.pin?.kind === 'css' && row.pin.at === 'mid' ? cy : y] as Point, end: [box.x + box.w + 2 * RING + 3, row.pin?.kind === 'css' && row.pin.at === 'mid' ? cy : y] as Point }
}

function wirePoints(row: Row, g: Geometry, box: Box, isPoint: boolean) {
  const { ring, end } = anchor(row, box, isPoint)
  const start: Point = [g.dot.x - 7, g.dot.y]
  const route = row.route ?? 'side'
  const points: Point[] = [start, [g.gutter, start[1]]]
  if (route === 'side') {
    points.push([g.gutter, end[1]], end)
  } else {
    const lane = route === 'over' ? g.plate.y - 16 : g.plate.y + g.plate.h + 16
    points.push([g.gutter, lane], [end[0], lane], end)
  }
  return { ring, points: points.filter((p, i) => i === 0 || Math.hypot(p[0] - points[i - 1][0], p[1] - points[i - 1][1]) > 0.5) }
}

function Wire({ points, ring, draw, leaving }: { points: Point[]; ring: Point; draw: boolean; leaving?: boolean }) {
  const segRefs = useRef<Array<HTMLSpanElement | null>>([])
  const ringRef = useRef<HTMLSpanElement>(null)
  const segments = points.slice(1).map((p, i) => {
    const a = points[i]
    const horizontal = Math.abs(p[1] - a[1]) < 0.5
    const length = horizontal ? Math.abs(p[0] - a[0]) : Math.abs(p[1] - a[1])
    const forward = horizontal ? p[0] >= a[0] : p[1] >= a[1]
    const style: CSSProperties = horizontal
      ? { left: Math.min(a[0], p[0]), top: a[1] - 0.5, width: length, height: 1, transformOrigin: forward ? 'left center' : 'right center' }
      : { left: a[0] - 0.5, top: Math.min(a[1], p[1]), width: 1, height: length, transformOrigin: forward ? 'center top' : 'center bottom' }
    return { horizontal, length, style }
  })

  useLayoutEffect(() => {
    if (!draw) return
    const total = segments.reduce((sum, s) => sum + s.length, 0) || 1
    let delay = 0
    segments.forEach((segment, index) => {
      const el = segRefs.current[index]
      if (!el) return
      const duration = (DRAW_MS * segment.length) / total
      const axis = segment.horizontal ? 'scaleX' : 'scaleY'
      el.animate([{ transform: `${axis}(0)` }, { transform: `${axis}(1)` }], {
        duration,
        delay,
        easing: index === segments.length - 1 ? EASE_OUT : 'linear',
        fill: 'backwards',
      })
      delay += duration
    })
    ringRef.current?.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.8)' },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
      ],
      { duration: 120, delay: DRAW_MS - 40, easing: EASE_OUT, fill: 'backwards' },
    )
    // Draw once per mount; a re-measure moves the wire without drawing it again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <span className="wr-wire" data-leaving={leaving || undefined} aria-hidden="true">
      {segments.map((segment, index) => (
        <span
          key={index}
          ref={(el) => {
            segRefs.current[index] = el
          }}
          className="wr-seg"
          style={segment.style}
        />
      ))}
      <span ref={ringRef} className="wr-ring" style={{ left: ring[0], top: ring[1] }} />
    </span>
  )
}

function PlateView({ plate, mounted, eager, wide }: { plate: Plate; mounted: boolean; eager: boolean; wide: boolean }) {
  if (plate.kind === 'screen') return <CropShot shot={wide ? plate.shot : plate.narrow} eager={eager} />
  if (plate.kind === 'live') {
    const entry = recreations[plate.key]
    const Recreation = entry.Component
    return (
      <div className="wr-screen" data-world={plate.world} style={{ '--wr-ratio': plate.ratio, '--wr-ratio-n': plate.phoneRatio } as CSSProperties}>
        {mounted && (
          <Suspense fallback={null}>
            <Recreation />
          </Suspense>
        )}
      </div>
    )
  }
  if (plate.kind === 'shot') {
    const { shot } = plate
    return (
      <div className="wr-shot">
        <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    )
  }
  return (
    <div className="wr-phones">
      {plate.shots.map((shot) => {
        const crop = shot.crop ?? { x: 0, y: 0, w: shot.width, h: shot.height }
        return (
          <span key={shot.id} data-shot={shot.id} className="wr-crop" style={{ aspectRatio: `${crop.w} / ${crop.h}`, flexGrow: crop.w / crop.h }}>
            <img
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              loading={eager ? 'eager' : 'lazy'}
              decoding="async"
              style={{ width: `${(shot.width / crop.w) * 100}%`, left: `${(-crop.x / crop.w) * 100}%`, top: `${(-crop.y / crop.h) * 100}%` }}
            />
          </span>
        )
      })}
    </div>
  )
}

function CardText({ card }: { card: Card }) {
  return (
    <div className="wr-cardtext">
      <p className="wr-name">
        {card.name}
        <span className="wr-source">{card.source}</span>
      </p>
      <p className="wr-line">{card.line}</p>
      <div className="wr-meta">
        <span>{card.meta}</span>
        {card.href && (
          <Link className="wr-link" to={card.href}>
            Open the case <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>
    </div>
  )
}

interface BlockProps {
  card: Card
  wide: boolean
  eager: boolean
  reduced: boolean
}

export function Block({ card, wide, eager, reduced }: BlockProps) {
  const blockRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const plateRef = useRef<HTMLDivElement>(null)
  const colRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const signature = useRef('')
  const [geometry, setGeometry] = useState<Geometry | null>(null)
  const [station, setStation] = useState<{ top: number; offset: number; pad: number; stick: boolean } | null>(null)
  const [current, setCurrent] = useState<string | null>(eager ? card.rows[0].id : null)
  const [ghost, setGhost] = useState<{ id: string; points: Point[]; ring: Point } | null>(null)
  const [mounted, setMounted] = useState(eager)
  const lastWire = useRef<{ id: string; points: Point[]; ring: Point } | null>(null)

  useEffect(() => {
    if (mounted) return
    const el = wrapRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setMounted(true), { rootMargin: '120% 0px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [mounted])

  const measure = useCallback(() => {
    const block = blockRef.current
    const wrap = wrapRef.current
    const plate = plateRef.current
    const col = colRef.current
    const first = rowRefs.current[card.rows[0].id]
    const last = rowRefs.current[card.rows[card.rows.length - 1].id]
    if (!block || !wrap || !plate || !col || !first || !last) return
    const blockRect = block.getBoundingClientRect()
    const wrapRect = wrap.getBoundingClientRect()
    const slot = first.parentElement!.getBoundingClientRect()
    const top = parseFloat(getComputedStyle(wrap).top) || 0
    const wrapH = wrap.offsetHeight
    const offset = wide ? Math.round(slot.top - blockRect.top) : wrapH + 16
    const stick = wide || wrapH <= window.innerHeight * 0.7
    const pad = Math.max(0, Math.round(wrapH - offset - last.offsetHeight))
    setStation((prev) =>
      prev && prev.top === top && prev.offset === offset && prev.pad === pad && prev.stick === stick ? prev : { top, offset, pad, stick },
    )

    const plateRect = plate.getBoundingClientRect()
    const rel = (r: DOMRect): Box => ({ x: r.left - wrapRect.left, y: r.top - wrapRect.top, w: r.width, h: r.height })
    const plateBox = rel(plateRect)
    const targets: Record<string, Box> = {}
    for (const row of card.rows) {
      if (!row.pin) continue
      if (row.pin.kind === 'point') {
        targets[row.id] = { x: plateBox.x + row.pin.x * plateBox.w, y: plateBox.y + row.pin.y * plateBox.h, w: 0, h: 0 }
      } else {
        const shot = card.plate.kind === 'screen' ? (wide ? card.plate.shot : card.plate.narrow) : null
        const rect = findTarget(plate, row.pin, shot?.width ?? 0)
        if (rect) targets[row.id] = rel(rect)
      }
    }
    const dotEl = first.querySelector<HTMLElement>('.wr-dot')
    const dotRect = dotEl?.getBoundingClientRect()
    const firstRect = first.getBoundingClientRect()
    const colRect = col.getBoundingClientRect()
    const dot = dotRect
      ? { x: dotRect.left - wrapRect.left, y: offset + (dotRect.top - firstRect.top) + dotRect.height / 2 }
      : { x: colRect.left - wrapRect.left, y: offset + 11 }
    const next: Geometry = {
      plate: plateBox,
      gutter: Math.round(plateBox.x + plateBox.w + (colRect.left - plateRect.right) / 2),
      dot,
      targets,
    }
    const round = (n: number) => Math.round(n * 2) / 2
    const key = JSON.stringify(next, (_k, v: unknown) => (typeof v === 'number' ? round(v) : v))
    if (key !== signature.current) {
      signature.current = key
      setGeometry(next)
    }
  }, [card.rows, card.plate, wide])

  useLayoutEffect(() => {
    const plate = plateRef.current
    const block = blockRef.current
    if (!plate || !block) return
    let frame = 0
    const schedule = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(measure)
    }
    measure()
    const resize = new ResizeObserver(schedule)
    resize.observe(block)
    resize.observe(plate)
    const mutation = new MutationObserver(schedule)
    mutation.observe(plate, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['aria-label', 'class'] })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      resize.disconnect()
      mutation.disconnect()
      window.removeEventListener('resize', schedule)
    }
  }, [measure])

  useEffect(() => {
    if (!station) return
    const line = station.stick ? station.top + station.offset + 2 : Math.round(window.innerHeight * 0.5)
    const rows = card.rows.map((r) => rowRefs.current[r.id]).filter(Boolean) as HTMLDivElement[]
    const hits = new Set<string>()
    const decide = () => {
      if (hits.size) {
        const id = card.rows.find((r) => hits.has(r.id))?.id ?? null
        setCurrent(id)
        return
      }
      const firstTop = rows[0]?.getBoundingClientRect().top ?? 0
      const lastBottom = rows[rows.length - 1]?.getBoundingClientRect().bottom ?? 0
      if (firstTop > line) setCurrent(eager ? card.rows[0].id : null)
      else if (lastBottom < line) setCurrent(null)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.row!
          if (entry.isIntersecting) hits.add(id)
          else hits.delete(id)
        }
        decide()
      },
      { rootMargin: `-${line}px 0px -${Math.max(0, window.innerHeight - line - 1)}px 0px` },
    )
    rows.forEach((row) => observer.observe(row))
    const arrival = new IntersectionObserver(decide)
    if (blockRef.current) arrival.observe(blockRef.current)
    return () => {
      observer.disconnect()
      arrival.disconnect()
    }
  }, [station, card.rows, eager])

  const currentRow = card.rows.find((r) => r.id === current)
  const box = currentRow && geometry ? geometry.targets[currentRow.id] : undefined
  const wire = wide && currentRow && geometry && box ? { id: currentRow.id, ...wirePoints(currentRow, geometry, box, currentRow.pin?.kind === 'point') } : null

  useEffect(() => {
    const previous = lastWire.current
    lastWire.current = wire
    if (previous && previous.id !== wire?.id) {
      setGhost(previous)
      const timer = window.setTimeout(() => setGhost(null), 140)
      return () => window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wire?.id])

  const narrowRing = !wide && currentRow && geometry && box ? anchor(currentRow, box, currentRow.pin?.kind === 'point').ring : null
  const currentIndex = card.rows.findIndex((r) => r.id === current)

  const blockStyle = station
    ? ({ '--wr-station': `${station.offset}px`, '--wr-pad': `${station.pad}px` } as CSSProperties)
    : undefined

  return (
    <div
      ref={blockRef}
      className="wr-block"
      data-mode={wide ? 'wide' : 'narrow'}
      data-stick={station?.stick ? '' : undefined}
      data-ready={station ? '' : undefined}
      style={blockStyle}
    >
      <div ref={wrapRef} className="wr-wrap">
        <div ref={plateRef} className="wr-plate" data-kind={card.plate.kind}>
          <PlateView plate={card.plate} mounted={mounted} eager={eager} wide={wide} />
        </div>
        {ghost && <Wire key={`ghost-${ghost.id}`} points={ghost.points} ring={ghost.ring} draw={false} leaving />}
        {wire && <Wire key={wire.id} points={wire.points} ring={wire.ring} draw={!reduced} />}
        {narrowRing && (
          <span className="wr-wire" key={`ring-${currentRow!.id}`} aria-hidden="true">
            <span className="wr-ring wr-ring-solo" style={{ left: narrowRing[0], top: narrowRing[1] }} />
          </span>
        )}
      </div>
      <div ref={colRef} className="wr-col">
        <CardText card={card} />
        <ol className="wr-rows">
          {card.rows.map((row, index) => (
            <li key={row.id} id={`wr-row-${row.id}`} className="wr-slot" tabIndex={-1}>
              <div
                ref={(el) => {
                  rowRefs.current[row.id] = el
                }}
                data-row={row.id}
                className="wr-row"
                data-current={row.id === current || undefined}
                data-past={currentIndex >= 0 && index < currentIndex ? '' : undefined}
                data-pinned={row.pin ? '' : undefined}
              >
                <span className="wr-dot" aria-hidden="true" />
                <p className="wr-text">{cite(row.text)}</p>
                {row.caseSlug ? (
                  <Link className="wr-result wr-result-link" to={`/work/${row.caseSlug}`}>
                    {cite(row.result)} <span aria-hidden="true">→</span>
                  </Link>
                ) : (
                  <p className="wr-result">{cite(row.result)}</p>
                )}
                {row.caption && <p className="wr-caption">{row.caption}</p>}
              </div>
              <div className="wr-hold" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
