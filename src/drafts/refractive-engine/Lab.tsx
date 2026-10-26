import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { createChamber, type Chamber } from './chamber'
import { INVENTED, systems } from './data'
import { STAGE } from './scene'

const BASE = '/drafts/refractive-engine'
const FIRST = 'bayyinah-tv'
/**
 * Approved full-size originals of the landscape textures: the same framing as public/eh/ (mean pixel difference under
 * 1% when scaled down to it). The phone screens have no larger source than their 1,024 px crops.
 */
const SHARP: Record<string, { src: string; width: number }> = {
  'care-platform': { src: '/showcase/care-dashboard/appointments-week.webp', width: 2880 },
  'bayyinah-tv': { src: '/showcase/bayyinah/web-02.webp', width: 2880 },
  incentiv: { src: '/showcase/incentiv/web-03.webp', width: 2880 },
  'design-system-react': { src: '/showcase/design-system/boards/board-04.webp', width: 3200 },
  futurisma: { src: '/personal/shots/futurisma-frostline-1.webp', width: 2880 },
}
const plain = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)

/** Eight products, one in focus: a text index beside one large screen whose glass splits into its three layers. */
export function Lab({ mode, reduced, noGl, onOpen }: { mode: 'lens' | 'tensor'; reduced: boolean; noGl: boolean; onOpen(slug: string): void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const chamber = useRef<Chamber | null>(null)
  const [selectedSlug, setSelectedSlug] = useState(FIRST)
  const [layersExpanded, setLayersExpanded] = useState(true)
  const [activeLayer, setActiveLayer] = useState<number | null>(null)
  const [glReady, setGlReady] = useState(false)
  const [glLost, setGlLost] = useState(false)
  const selected = Math.max(0, systems.findIndex((s) => s.slug === selectedSlug))
  const sys = systems[selected]
  // A new chamber (first mount, or a change of motion preference) starts from all three choices the reader has made.
  const latest = useRef({ selected, layersExpanded, activeLayer, mode })
  useEffect(() => { latest.current = { selected, layersExpanded, activeLayer, mode } })

  useEffect(() => {
    const host = stageRef.current
    if (!host || noGl || glLost) return
    const now = latest.current
    let c: Chamber
    try {
      c = createChamber(host, {
        products: systems.map((s) => ({ texture: s.texture, sharp: SHARP[s.slug]?.src, aspect: s.aspect })),
        selected: now.selected,
        expanded: now.layersExpanded,
        layer: now.activeLayer,
        mode: now.mode === 'tensor' ? 1 : 0,
        reduced,
        labels: labelRefs.current,
        onReady: setGlReady,
        onLost: () => setGlLost(true),
      })
    } catch {
      queueMicrotask(() => setGlLost(true))
      return
    }
    chamber.current = c
    return () => {
      c.dispose()
      chamber.current = null
      setGlReady(false)
    }
  }, [noGl, glLost, reduced])

  useEffect(() => { chamber.current?.setMode(mode === 'tensor' ? 1 : 0) }, [mode])

  // A keyboard press (detail 0) changes the chamber at once; a click or tap animates. The effects above then find it settled.
  const select = (i: number, instant: boolean) => {
    setSelectedSlug(systems[i].slug)
    setActiveLayer(null)
    chamber.current?.select(i, instant)
  }
  const expand = (on: boolean, instant: boolean) => {
    setLayersExpanded(on)
    chamber.current?.setExpanded(on, instant)
  }
  const highlight = (k: number | null, instant: boolean) => {
    setActiveLayer(k)
    chamber.current?.setLayer(k, instant)
  }
  const sharp = SHARP[sys.slug]

  return (
    <section className="re-lab" data-stage={STAGE.lab} aria-labelledby="re-lab-h">
      <div className="re-lab-head">
        <h2 id="re-lab-h" className="re-h2" tabIndex={-1}>Eight products, three layers each</h2>
        <p className="re-lede">Select a product to explore the three layers it is built from.</p>
      </div>
      <div className="re-ch re-solid">
        <div ref={stageRef} className="re-ch-stage" data-expanded={layersExpanded || undefined} data-ready={glReady || undefined} data-shape={sys.aspect < 1 ? 'phone' : 'wide'}>
          {/* The real screen as a page image: what shows before the glass is ready, and without WebGL. */}
          <figure className="re-ch-still" style={{ '--a': sys.aspect } as CSSProperties}>
            <span className="re-ch-plate" aria-hidden="true" />
            <span className="re-ch-plate" aria-hidden="true" />
            <img
              key={sys.slug}
              src={sys.texture}
              srcSet={sharp ? `${sys.texture} 1280w, ${sharp.src} ${sharp.width}w` : undefined}
              sizes={sharp ? '(min-width: 900px) 56vw, 92vw' : undefined}
              alt={`${sys.name}, a screen from the product`}
              width={sys.aspect < 1 ? Math.round(1024 * sys.aspect) : 1280}
              height={sys.aspect < 1 ? 1024 : 800}
              decoding="async"
            />
          </figure>
          <div className="re-ch-labels" aria-hidden="true">
            {[0, 1, 2].map((k) => (
              <span key={k} ref={(el) => { labelRefs.current[k] = el }} className="re-ch-label" data-active={activeLayer === k || undefined}>{sys.layers[k]?.title}</span>
            ))}
          </div>
        </div>

        <div className="re-ch-bar">
          <div className="re-ch-view" role="group" aria-label="View">
            <button type="button" aria-pressed={!layersExpanded} onClick={(e) => expand(false, e.detail === 0)}>Assembled</button>
            <span aria-hidden="true">/</span>
            <button type="button" aria-pressed={layersExpanded} onClick={(e) => expand(true, e.detail === 0)}>Layers</button>
          </div>
          <div className="re-ch-now">
            <h3>{sys.name}</h3>
            <p>{sys.line}</p>
            {INVENTED.has(sys.slug) && <p className="re-ch-note">Real product screens, invented data.</p>}
          </div>
          <a className="re-ch-open" href={`${BASE}/${sys.slug}`} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(sys.slug) }}>
            Open project
            <ArrowRightIcon size={20} weight="regular" aria-hidden="true" />
          </a>
        </div>

        <ol className="re-ch-index" aria-label="Products">
          {systems.map((s, i) => (
            <li key={s.slug}>
              <button type="button" data-slug={s.slug} aria-pressed={i === selected} onClick={(e) => select(i, e.detail === 0)}>
                <span className="re-ch-n re-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="re-ch-name">{s.name}</span>
                <ArrowRightIcon className="re-ch-arrow" size={18} weight="regular" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>

        <ol className="re-ch-layers" aria-label={`${sys.name}, its three layers`}>
          {sys.layers.map((l, k) => (
            <li key={l.title} data-active={activeLayer === k || undefined}>
              <button
                type="button"
                aria-pressed={activeLayer === k}
                onClick={(e) => highlight(activeLayer === k ? null : k, e.detail === 0)}
                onFocus={(e) => { if (e.currentTarget.matches(':focus-visible')) highlight(k, true) }}
              >
                {l.title}
              </button>
              <p className="re-num re-layer-stack">{l.stack}</p>
              <p>{l.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
