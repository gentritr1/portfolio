import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ArrowRightIcon, CheckIcon, CopyIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { StackPoster } from './StackPoster'
import { createStack, type SceneState, type StackScene } from './scene'
import { CasePage } from './CasePage'
import { caseDetails, moreCases } from './cases'
import { alsoShipped, cases, howIWork, lab, labLesson, layers, links, type LayerId } from './data'
import './exploded-view.css'

/** The scene state each homepage case explains. */
const CASE_STATE: Record<string, SceneState> = {
  'care-platform': 'rewrite',
  'design-system-react': 'tokens',
  'multi-tenant': 'tenants',
  'read-to-feed': 'reader',
}
/** Layers lit per state, for the static drawing that stands in when motion is reduced or WebGL is missing. */
const STATE_LIT: Record<SceneState, LayerId[]> = {
  hero: [],
  rewrite: ['interface', 'quality'],
  tokens: ['interface', 'quality'],
  tenants: ['interface', 'api', 'data'],
  reader: ['mobile', 'interface'],
  stack: ['interface', 'mobile', 'api', 'data', 'quality'],
  contact: [],
}

function canUse3d() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export default function Draft() {
  // /drafts/exploded-view/<slug> is that project's case study.
  const { '*': rest } = useParams()
  const routeLocation = useLocation()
  const caseSlug = rest && caseDetails[rest] ? rest : null

  const rootRef = useRef<HTMLDivElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)
  const figureRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLElement>(null)
  /** The stage drawing's frame: the 3D lines up with the drawing it replaces. */
  const stageFrameRef = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLSpanElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sceneRef = useRef<StackScene | null>(null)
  const previewTimer = useRef(0)
  const scrollState = useRef<SceneState>('hero')
  const [live, setLive] = useState(false)
  const [labelsOn, setLabelsOn] = useState(false)
  const [shown, setShown] = useState<SceneState>('hero')
  const [hoverLayer, setHoverLayer] = useState<LayerId | null>(null)

  // The 3D stack replaces the drawing once compiled; with reduced motion or no WebGL the drawings stay.
  useEffect(() => {
    const host = hostRef.current, anchor = figureRef.current?.querySelector<HTMLElement>('.xv-stack') ?? null, theme = rootRef.current
    if (caseSlug || !host || !anchor || !theme || !canUse3d()) return
    let stack: StackScene
    try {
      stack = createStack(host, {
        anchor, theme, labels: labelRefs.current, badge: badgeRef.current, small: innerWidth < 768,
        onReady: () => setLive(true), onOpen: () => setLabelsOn(true),
      })
    } catch {
      return
    }
    sceneRef.current = stack
    return () => {
      stack.dispose()
      sceneRef.current = null
      setLive(false)
      setLabelsOn(false)
    }
  }, [caseSlug])

  // Sections set the scene: whichever crosses the middle of the viewport. The stack sits in the hero figure,
  // then in the sticky stage beside the sections. Phones have no stage, so there the stack stays in the hero.
  useEffect(() => {
    if (caseSlug) return
    const els = [...document.querySelectorAll<HTMLElement>('[data-scene]')]
    const apply = (state: SceneState) => {
      scrollState.current = state
      setShown(state)
      const scene = sceneRef.current, stage = stageRef.current, frame = stageFrameRef.current
      const figure = figureRef.current?.querySelector<HTMLElement>('.xv-stack')
      if (!scene || !figure) return
      const hasStage = !!stage && !!frame && stage.offsetParent !== null
      scene.setAnchor(state === 'hero' || !hasStage ? figure : frame)
      scene.setState(hasStage ? state : 'hero')
    }
    const io = new IntersectionObserver((entries) => {
      const hit = entries.filter((e) => e.isIntersecting).at(-1)
      if (hit) apply((hit.target as HTMLElement).dataset.scene as SceneState)
    }, { rootMargin: '-48% 0px -48% 0px' })
    els.forEach((el) => io.observe(el))
    // On phones, stop rendering once the hero figure is off screen.
    const heroIo = new IntersectionObserver(([e]) => {
      const stage = stageRef.current
      sceneRef.current?.setActive(!stage || stage.offsetParent === null ? e.isIntersecting : true)
    })
    if (figureRef.current) heroIo.observe(figureRef.current)
    return () => { io.disconnect(); heroIo.disconnect() }
  }, [caseSlug, live])

  useEffect(() => { sceneRef.current?.setHoverLayer(hoverLayer) }, [hoverLayer])
  useEffect(() => () => clearTimeout(previewTimer.current), [])

  // "All work" from a case returns to the work list, not the top of the page.
  useEffect(() => {
    if (caseSlug || (routeLocation.state as { at?: string } | null)?.at !== 'work') return
    const raf = requestAnimationFrame(() => document.getElementById('xv-work-h')?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(raf)
  }, [caseSlug, routeLocation.state])

  // Hovering or focusing a case card previews its state at half strength; leaving returns to the scroll state.
  // A short intent delay, so sweeping the mouse across the cards does not flicker through their states.
  const preview = (state: SceneState | null) => {
    clearTimeout(previewTimer.current)
    previewTimer.current = window.setTimeout(() => applyPreview(state), state ? 140 : 90)
  }
  const applyPreview = (state: SceneState | null) => {
    const scene = sceneRef.current, stage = stageRef.current, frame = stageFrameRef.current
    const figure = figureRef.current?.querySelector<HTMLElement>('.xv-stack')
    if (!scene || !stage || !frame || stage.offsetParent === null) return
    if (state && state !== scrollState.current) {
      scene.setAnchor(frame)
      scene.setState(state, 0.5)
    } else {
      scene.setAnchor(scrollState.current === 'hero' && figure ? figure : frame)
      scene.setState(scrollState.current, 1)
    }
  }

  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      location.href = `mailto:${links.email}`
    }
  }

  return (
    <div className="xv-root" ref={rootRef} data-live={live || undefined}>
      <div className="xv-canvas" ref={hostRef} aria-hidden="true">
        <div className="xv-3d-labels" data-on={labelsOn || undefined}>
          {layers.map((l, i) => (
            <span key={l.id} ref={(el) => { labelRefs.current[i] = el }} style={{ '--i': i } as CSSProperties}>
              <span className="xv-layer-no">{String(i + 1).padStart(2, '0')}</span> {l.name}
            </span>
          ))}
          <span className="xv-badge" ref={badgeRef}>AA <CheckIcon size={13} weight="bold" /></span>
        </div>
      </div>

      {caseSlug ? (
        <CasePage slug={caseSlug} />
      ) : (
        <>
          <header className="xv-hero" data-scene="hero">
            <div className="xv-hero-text">
              <p className="xv-name">Gentrit Rashiti</p>
              <p className="xv-role">Frontend &amp; Full-Stack Developer · Healthcare &amp; Mobile</p>
              <h1 className="xv-tagline">I build clear software where clarity matters.</h1>
              <p className="xv-lede">5+ years shipping web and mobile products, from first screen to store release.</p>
              <p className="xv-meta xv-mono">Kosovo · CET · Open to remote, full-time</p>
              <div className="xv-actions">
                <a className="xv-btn xv-btn-primary" href={links.cv} download>
                  <DownloadSimpleIcon size={16} weight="bold" aria-hidden="true" />
                  Download CV
                </a>
                <a className="xv-btn" href={`mailto:${links.email}`}>Email</a>
                <a className="xv-btn xv-btn-quiet" href={links.github} target="_blank" rel="noreferrer">GitHub<span className="xv-sr"> (opens in a new tab)</span></a>
                <a className="xv-btn xv-btn-quiet" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<span className="xv-sr"> (opens in a new tab)</span></a>
              </div>
            </div>
            <figure className="xv-hero-figure" ref={figureRef}>
              <StackPoster title="One product in exploded view: interface, mobile, API and services, data, and quality, stacked and labelled." />
              <figcaption className="xv-mono">The work, in five layers</figcaption>
            </figure>
          </header>

          <main className="xv-main">
            <div className="xv-flow">
              <section className="xv-section" aria-labelledby="xv-work-h">
                <h2 id="xv-work-h" className="xv-h2">Selected work</h2>
                <ol className="xv-cases">
                  {cases.map((c) => (
                    <li
                      key={c.slug}
                      className="xv-case"
                      data-scene={CASE_STATE[c.slug]}
                      onPointerEnter={(e) => e.pointerType === 'mouse' && preview(CASE_STATE[c.slug])}
                      onPointerLeave={(e) => e.pointerType === 'mouse' && preview(null)}
                      onFocus={() => preview(CASE_STATE[c.slug])}
                      onBlur={() => preview(null)}
                    >
                      <StackPoster lit={c.layers} compact />
                      <div className="xv-case-body">
                        <h3 className="xv-question">{c.question}</h3>
                        <p className="xv-answer">{c.answer}</p>
                        <p className="xv-result">{c.result}</p>
                        <p className="xv-tags xv-mono" aria-label="Layers">
                          {c.layers.map((id) => layers.find((l) => l.id === id)?.name).join(' / ')}
                        </p>
                        <Link className="xv-link" to={`/drafts/exploded-view/${c.slug}`} viewTransition>
                          Read the case
                          <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ol>
                <h3 className="xv-more-h">More work</h3>
                <ul className="xv-more">
                  {moreCases.map((m) => (
                    <li key={m.slug}>
                      <Link to={`/drafts/exploded-view/${m.slug}`} viewTransition>
                        <StackPoster lit={m.layers} compact />
                        <span className="xv-more-q">{m.question}</span>
                        <ArrowRightIcon className="xv-more-arrow" size={14} weight="bold" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="xv-section xv-stack-section" aria-labelledby="xv-stack-h" data-scene="stack">
                <h2 id="xv-stack-h" className="xv-h2">Across the stack</h2>
                <div className="xv-stack-grid">
                  <StackPoster lit={hoverLayer ? [hoverLayer] : layers.map((l) => l.id)} />
                  <dl className="xv-layers">
                    {layers.map((l, i) => (
                      <div
                        key={l.id}
                        tabIndex={0}
                        data-on={hoverLayer === l.id || undefined}
                        onPointerEnter={(e) => e.pointerType === 'mouse' && setHoverLayer(l.id)}
                        onPointerLeave={(e) => e.pointerType === 'mouse' && setHoverLayer(null)}
                        onFocus={() => setHoverLayer(l.id)}
                        onBlur={() => setHoverLayer(null)}
                      >
                        <dt><span className="xv-mono">{String(i + 1).padStart(2, '0')}</span> {l.name}</dt>
                        <dd>{l.tools.join(', ')}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <p className="xv-also">{alsoShipped}</p>
              </section>

              <section className="xv-section" aria-labelledby="xv-lab-h" data-scene="stack">
                <h2 id="xv-lab-h" className="xv-h2">Lab</h2>
                <ul className="xv-lab">
                  {lab.map((item) => (
                    <li key={item.name}>
                      <h3>
                        {item.name}
                        {item.link && (
                          <a className="xv-link" href={item.link.href} target="_blank" rel="noreferrer">
                            {item.link.label}<span className="xv-sr"> (opens in a new tab)</span>
                            <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
                          </a>
                        )}
                      </h3>
                      <p>{item.line}</p>
                      {item.agents && (
                        <dl className="xv-agents">
                          <div><dt className="xv-mono">The agents do</dt><dd>{item.agents.do}</dd></div>
                          <div><dt className="xv-mono">I decide</dt><dd>{item.agents.decide}</dd></div>
                          <div><dt className="xv-mono">One thing that failed</dt><dd>{item.agents.failed}</dd></div>
                        </dl>
                      )}
                      {item.learned && <p className="xv-learned"><span className="xv-mono">Learned</span> {item.learned}</p>}
                    </li>
                  ))}
                </ul>
                <p className="xv-lab-learned"><span className="xv-mono">What these taught me</span> {labLesson}</p>
              </section>

              <section className="xv-section" aria-labelledby="xv-how-h">
                <h2 id="xv-how-h" className="xv-h2">How I work</h2>
                <ul className="xv-how">
                  {howIWork.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </section>

              <section className="xv-section xv-contact" aria-labelledby="xv-contact-h" data-scene="contact">
                <h2 id="xv-contact-h" className="xv-h2">Contact</h2>
                <p className="xv-contact-line">If you are building software where clarity matters, I would like to hear about it.</p>
                <div className="xv-actions">
                  <button type="button" className="xv-btn xv-btn-primary xv-copy" onClick={copy} data-copied={copied || undefined}>
                    <span className="xv-copy-icon" aria-hidden="true">
                      <CopyIcon size={16} weight="bold" />
                      <CheckIcon size={16} weight="bold" />
                    </span>
                    <span aria-live="polite">{copied ? 'Copied' : links.email}</span>
                  </button>
                  <a className="xv-btn" href={links.cv} download>Download CV</a>
                  <a className="xv-btn xv-btn-quiet" href={links.github} target="_blank" rel="noreferrer">GitHub<span className="xv-sr"> (opens in a new tab)</span></a>
                  <a className="xv-btn xv-btn-quiet" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<span className="xv-sr"> (opens in a new tab)</span></a>
                </div>
              </section>
            </div>

            {/* The stage: the 3D stack lives here beside the sections. Without WebGL or with reduced motion it
                shows the matching static drawing, crossfaded per section. */}
            <aside className="xv-stage" ref={stageRef} aria-hidden="true">
              <div className="xv-stage-frame" ref={stageFrameRef}>
                <div className="xv-stage-poster" key={shown}>
                  <StackPoster lit={STATE_LIT[shown] ?? []} />
                </div>
              </div>
            </aside>
          </main>
        </>
      )}
    </div>
  )
}
