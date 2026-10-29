import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { channelOrder, channels, type ChannelKey } from '../../content/channels'
import type { RefractiveScene } from './scene'
import { period, work } from './products'

/** The six areas the field maps (CONTENT.md channels, owner 2026-10-02), in the scene's cluster order, with their counts. */
export const AREAS = channelOrder.map((key) => ({ key, n: work.filter((p) => p.channel === key).length }))

/** Where each area's work is on this page. */
const HREF: Record<ChannelKey, string> = {
  healthcare: '#work-care', streaming: '#work-bayyinah', reading: '#work-reading', web3: '#re-lab', ai: '#re-all', personal: '#re-all',
}

/**
 * The field as a map of the work (owner's choice, 2026-10-29): while this band is on screen the particles gather into
 * six clouds, one per area, each sized by its number of projects (`weights` in createScene), and every cloud carries its
 * label. Pointing at a cloud or its label lights it in the accent; a click goes to that work. Labels follow the clouds on
 * scroll and resize and every 250 ms for their slow drift, only while the band is in view. On phones, and without WebGL,
 * the labels are a plain list.
 */
export function AreaMap({ scene, userMode, stage }: { scene: RefractiveScene | null; userMode: 0 | 1; stage: number }) {
  const ref = useRef<HTMLElement>(null)
  const links = useRef<(HTMLAnchorElement | null)[]>([])
  const [on, setOn] = useState(false)
  const [hot, setHot] = useState(-1)
  const [pos, setPos] = useState<{ x: number; y: number; on: boolean }[]>([])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setOn(e.intersectionRatio >= 0.45), { threshold: [0, 0.45, 1] })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // In view, the field takes the map; out of view it returns to the visitor's own choice.
  useEffect(() => {
    scene?.setMode(on ? 1 : userMode)
    if (!on) setHot(-1)
  }, [on, scene, userMode])
  useEffect(() => { scene?.highlight(hot) }, [hot, scene])

  useEffect(() => {
    if (!on || !scene) return
    const el = ref.current
    if (!el) return
    let raf = 0
    const place = () => {
      const r = el.getBoundingClientRect()
      setPos(scene.project().map((p) => ({ x: p.x - r.left, y: p.y - r.top, on: p.on })))
    }
    const soon = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(place) }
    place()
    const drift = setInterval(place, 250)
    addEventListener('scroll', soon, { passive: true })
    addEventListener('resize', soon)
    return () => { clearInterval(drift); cancelAnimationFrame(raf); removeEventListener('scroll', soon); removeEventListener('resize', soon) }
  }, [on, scene])

  // Pointing near a cloud (mouse) names it; a click there follows its link.
  const near = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !pos.length) return
    const r = e.currentTarget.getBoundingClientRect()
    let best = -1, d = 110
    pos.forEach((p, k) => {
      const dk = Math.hypot(p.x - (e.clientX - r.left), p.y - (e.clientY - r.top))
      if (p.on && dk < d) { d = dk; best = k }
    })
    setHot(best)
  }

  return (
    <section id="re-map" ref={ref} className="re-map" data-stage={stage} data-live={(scene && on && pos.length > 0) || undefined}
      aria-labelledby="re-map-h" onPointerMove={near} onPointerLeave={() => setHot(-1)}
      onClick={(e) => { if (hot >= 0 && !(e.target as HTMLElement).closest('a')) links.current[hot]?.click() }}>
      <div className="re-map-head">
        <h2 id="re-map-h" className="re-h2">Six areas of work</h2>
        <p className="re-lede">Each cloud in the field is one area. Its size is the number of projects in it.</p>
      </div>
      <ol className="re-map-labels">
        {AREAS.map((a, k) => {
          const area = channels[a.key]
          const p = pos[k]
          return (
            <li key={a.key} data-hot={hot === k || undefined} style={p ? ({ '--x': `${p.x}px`, '--y': `${p.y}px` } as CSSProperties) : undefined}>
              <a ref={(el) => { links.current[k] = el }} href={HREF[a.key]}
                onPointerEnter={() => setHot(k)} onPointerLeave={() => setHot(-1)} onFocus={() => setHot(k)} onBlur={() => setHot(-1)}>
                <span className="re-map-name">{area.label}</span>
                <span className="re-map-meta re-num">{[period(a.key), `${a.n} ${a.n === 1 ? 'project' : 'projects'}`].filter(Boolean).join(' · ')}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
