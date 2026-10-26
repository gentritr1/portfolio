import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react'
import { ArrowRightIcon, BookOpenTextIcon, XIcon } from '@phosphor-icons/react'
import { createChamber, type Chamber } from './chamber'
import { INVENTED, systems } from './data'
import { plates, proofKind } from './plates'
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
/**
 * Products with a hands-on demo beside the glass. Only Read to Feed for now: reading and scanning a book are the product,
 * and the site already has an authored recreation of both. It loads when first opened.
 */
const DEMOS = new Set(['read-to-feed'])
const ReaderDemo = lazy(() => import('../../worlds/reading/Recreation').then((m) => ({ default: m.Recreation })))
const plain = (e: MouseEvent) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)

/** Eight products, one in focus: a text index beside one large screen whose glass splits into its three layers. */
export function Lab({ mode, reduced, noGl, onOpen }: { mode: 'lens' | 'tensor'; reduced: boolean; noGl: boolean; onOpen(slug: string): void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const chamber = useRef<Chamber | null>(null)
  const [selectedSlug, setSelectedSlug] = useState(FIRST)
  // Arrive on the whole product; opening its layers is the reader's move, and that choice holds across products.
  const [layersExpanded, setLayersExpanded] = useState(false)
  const [activeLayer, setActiveLayer] = useState<number | null>(null)
  const [glReady, setGlReady] = useState(false)
  const [glLost, setGlLost] = useState(false)
  const [trying, setTrying] = useState(false)
  const tryRef = useRef<HTMLButtonElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)
  const selected = Math.max(0, systems.findIndex((s) => s.slug === selectedSlug))
  const sys = systems[selected]
  const tryOpen = trying && DEMOS.has(sys.slug)
  // A new chamber (first mount, or a change of motion preference) starts from all three choices the reader has made.
  const formation = useRef(1)
  const latest = useRef({ selected, layersExpanded, activeLayer, mode, tryOpen })
  useEffect(() => { latest.current = { selected, layersExpanded, activeLayer, mode, tryOpen } })

  useEffect(() => {
    const host = stageRef.current
    if (!host || noGl || glLost) return
    const now = latest.current
    let c: Chamber
    try {
      c = createChamber(host, {
        products: systems.map((s) => ({
          texture: s.texture,
          sharp: SHARP[s.slug]?.src,
          aspect: s.aspect,
          plates: plates[s.slug]?.slice(1).map((p, j) => ({ ...p, index: j + 2, title: s.layers[j + 1].title, stack: s.layers[j + 1].stack, proof: p.proof && { ...p.proof, kind: proofKind[p.proof.kind] } })),
        })),
        selected: now.selected,
        expanded: now.layersExpanded,
        layer: now.activeLayer,
        mode: now.mode === 'tensor' ? 1 : 0,
        formation: formation.current,
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
    c.setAside(now.tryOpen, true)
    return () => {
      c.dispose()
      chamber.current = null
      setGlReady(false)
    }
  }, [noGl, glLost, reduced])

  useEffect(() => { chamber.current?.setMode(mode === 'tensor' ? 1 : 0) }, [mode])

  // The formation runs while the product comes into view: from the stage's top at 92% of the viewport to 30% (Lenis smooths
  // the scroll it reads). Arriving by keyboard, or with reduced motion, it is already formed: nothing travels.
  useEffect(() => {
    const stage = stageRef.current
    const root = stage?.parentElement
    if (!stage || !root) return
    let formed = reduced
    const update = () => {
      const top = stage.getBoundingClientRect().top
      formation.current = formed ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.92 - top) / (innerHeight * 0.62)))
      chamber.current?.setFormation(formation.current)
    }
    // Only keyboard focus completes it: a click also focuses its button, and must not snap the arrival mid-scroll.
    const onFocus = (e: FocusEvent) => { if ((e.target as Element).matches?.(':focus-visible')) { formed = true; update() } }
    update()
    addEventListener('scroll', update, { passive: true })
    addEventListener('resize', update)
    root.addEventListener('focusin', onFocus)
    return () => {
      removeEventListener('scroll', update)
      removeEventListener('resize', update)
      root.removeEventListener('focusin', onFocus)
    }
  }, [reduced, glReady])

  // A keyboard press (detail 0) changes the chamber at once; a click or tap animates. The effects above then find it settled.
  const select = (i: number, instant: boolean) => {
    setSelectedSlug(systems[i].slug)
    setActiveLayer(null)
    setTrying(false)
    // Choosing the product already shown still clears its layer, in the glass as on the page.
    chamber.current?.setLayer(null, instant)
    chamber.current?.setAside(false, true)
    chamber.current?.select(i, instant)
  }
  const tryIt = (on: boolean, instant: boolean) => {
    setTrying(on)
    chamber.current?.setAside(on, instant)
    if (!on) tryRef.current?.focus({ preventScroll: true })
  }
  // Opening the demo brings its whole frame into view under the bar and moves focus into it; Escape or Close hands it back.
  useEffect(() => {
    const demo = demoRef.current
    if (!tryOpen || !demo) return
    const r = demo.getBoundingClientRect()
    if (r.top < 76 || r.bottom > innerHeight) demo.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' })
    demo.focus({ preventScroll: true })
  }, [tryOpen, reduced])
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
        <div ref={stageRef} className="re-ch-stage" data-expanded={layersExpanded || undefined} data-ready={glReady || undefined} data-trying={tryOpen || undefined} data-shape={sys.aspect < 1 ? 'phone' : 'wide'}>
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
          {tryOpen && (
            <div
              ref={demoRef}
              id="re-ch-demo"
              className="re-ch-demo"
              role="region"
              aria-label={`${sys.name}, interactive recreation`}
              tabIndex={-1}
              onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); tryIt(false, true) } }}
            >
              <div className="re-ch-demo-bar">
                <p>Interactive recreation</p>
                <button type="button" onClick={(e) => tryIt(false, e.detail === 0)}>
                  Close
                  <XIcon size={16} weight="regular" aria-hidden="true" />
                </button>
              </div>
              <div className="re-ch-demo-stage">
                <Suspense fallback={null}>
                  <ReaderDemo bare />
                </Suspense>
              </div>
            </div>
          )}
          {/* Phones: the chosen layer's words as page text over its plate, at a size the 3D texture cannot give them. */}
          {layersExpanded && !tryOpen && activeLayer && plates[sys.slug] && (
            <div className="re-ch-card">
              <p className="re-ch-card-n re-num">{String(activeLayer + 1).padStart(2, '0')}</p>
              <p className="re-ch-card-title">{sys.layers[activeLayer].title}</p>
              <p className="re-num re-layer-stack">{sys.layers[activeLayer].stack}</p>
              <LayerFacts plate={plates[sys.slug][activeLayer]} />
            </div>
          )}
          <div className="re-ch-labels" aria-hidden="true">
            {[0, 1, 2].map((k) => (
              <span key={k} ref={(el) => { labelRefs.current[k] = el }} className="re-ch-label" data-active={activeLayer === k || undefined}>
                <span className="re-num">{String(k + 1).padStart(2, '0')}</span> {sys.layers[k]?.title}
              </span>
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
          <div className="re-ch-actions">
            {DEMOS.has(sys.slug) && (
              <button ref={tryRef} type="button" className="re-ch-try" aria-expanded={tryOpen} aria-controls="re-ch-demo" onClick={(e) => tryIt(!tryOpen, e.detail === 0)}>
                <BookOpenTextIcon size={20} weight="regular" aria-hidden="true" />
                Try it
              </button>
            )}
            <a className="re-ch-open" href={`${BASE}/${sys.slug}`} onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(sys.slug) }}>
              Open project
              <ArrowRightIcon size={20} weight="regular" aria-hidden="true" />
            </a>
          </div>
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
              {plates[sys.slug] && <LayerFacts plate={plates[sys.slug][k]} />}
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/** The same words the plate carries, as page text: they never depend on the canvas. */
function LayerFacts({ plate }: { plate: (typeof plates)[string][number] }) {
  return (
    <>
      <ul className="re-ch-concepts">
        {plate.concepts.map((c) => <li key={c}>{c}</li>)}
      </ul>
      {plate.proof && (
        <p className="re-ch-proof">
          <span>{proofKind[plate.proof.kind]}</span>
          <b className="re-num">{plate.proof.value}</b>
          <span>{plate.proof.label}</span>
        </p>
      )}
      {plate.note && <p className="re-ch-scope">{plate.note}</p>}
    </>
  )
}
