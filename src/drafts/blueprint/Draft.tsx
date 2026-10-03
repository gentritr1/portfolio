import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { projects, featuredProjects, findProject } from '../../content/projects'
import { links } from '../../content/links'
import preview from '../../components/case/studio-previews/bayyinah-home.webp?inline'
import type { BlueprintScene, PartPoints } from './scene'
import './blueprint.css'

const project = findProject('bayyinah-tv')!
const layers = ['Display glass', 'Public web screen', 'Laptop base']
const targetY = [130, 278, 445]

function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg> }

export default function Draft() {
  const heroRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const diagramRef = useRef<SVGSVGElement>(null)
  const sceneRef = useRef<BlueprintScene | null>(null)
  const separationRef = useRef(1)
  const startedRef = useRef(0)
  const pausedRef = useRef(false)
  const [separation, setSeparation] = useState(1)
  const [paused, setPaused] = useState(false)
  const [ready, setReady] = useState(false)
  const [decoded, setDecoded] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [all, setAll] = useState(false)
  const [replay, setReplay] = useState(0)

  useEffect(() => {
    startedRef.current = performance.now()
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const hero = heroRef.current
      if (!hero) return
      const distance = Math.max(0, -hero.getBoundingClientRect().top)
      const value = 1 - Math.min(1, distance / (hero.offsetHeight * .8))
      separationRef.current = value
      setSeparation(value)
      sceneRef.current?.setSeparation(value)
    }
    const request = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [])

  useEffect(() => {
    if (reduced || !imageRef.current) return
    let cancelled = false
    let dispose: (() => void) | undefined
    function updatePoints(points: PartPoints) {
      const paths = diagramRef.current?.querySelectorAll<SVGPathElement>('[data-leader]')
      points.forEach((point, index) => {
        const x = point[0] * 1000, y = point[1] * 600
        paths?.[index]?.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} L770 ${targetY[index]} H965`)
      })
    }
    const start = async () => {
      try {
        const image = imageRef.current!
        const [module] = await Promise.all([import('./scene'), image.decode()])
        if (cancelled || !canvasRef.current) return
        const scene = module.createBlueprintScene(canvasRef.current, image, startedRef.current, updatePoints, () => { if (!cancelled) setReady(true) }, () => { if (!cancelled) setReady(false) })
        if (!scene) return
        sceneRef.current = scene
        scene.setSeparation(separationRef.current)
        scene.setPaused(pausedRef.current)
        dispose = scene.dispose
      } catch { /* The public screenshot and CSS laptop remain visible. */ }
    }
    void start()
    return () => { cancelled = true; dispose?.(); sceneRef.current = null; setReady(false) }
  }, [reduced])

  useEffect(() => {
    pausedRef.current = paused
    sceneRef.current?.setPaused(paused)
  }, [paused])

  function changeSeparation(value: number) {
    setSeparation(value)
    separationRef.current = value
    sceneRef.current?.setSeparation(value)
  }
  function replayOpening() {
    setPaused(false)
    changeSeparation(1)
    setReplay(value => value + 1)
    sceneRef.current?.replay()
  }

  return <main className="draft-blueprint" data-motion={reduced ? 'reduced' : paused ? 'paused' : 'active'}>
    <a className="draft-blueprint-skip" href="#blueprint-work">Skip to work index</a>
    <header className="draft-blueprint-header"><a className="draft-blueprint-name" href="#blueprint-home">Gentrit Rashiti</a><nav aria-label="Blueprint navigation"><a href="#blueprint-work">Work</a><a href="#blueprint-about">About</a><a href="#blueprint-contact">Contact<Arrow /></a></nav></header>
    <section className="draft-blueprint-hero" id="blueprint-home" ref={heroRef} aria-labelledby="blueprint-title">
      <div className="draft-blueprint-heading"><h1 id="blueprint-title">Built in layers.</h1><p>Frontend & mobile developer,<br />now full stack.<br /><span>5+ years · Kosovo</span></p></div>
      <figure className="draft-blueprint-drawing" style={{ '--blueprint-separation': separation } as CSSProperties} data-ready={ready}>
        <div className="draft-blueprint-figure-title"><strong>Bayyinah TV</strong><a href="#blueprint-case">Explore the project<Arrow /></a></div>
        <div className="draft-blueprint-model">
          <div className="draft-blueprint-static" key={replay}>
            <div className="draft-blueprint-static-device">
              <div className="draft-blueprint-base"><span className="draft-blueprint-trackpad" /></div>
              <div className="draft-blueprint-display"><img src={preview} alt="" aria-hidden="true" /><img ref={imageRef} src="/showcase/bayyinah/web-01.webp" alt="Bayyinah TV’s public home page" loading="eager" fetchPriority="high" style={{ opacity: decoded ? 1 : 0 }} onLoad={event => { void event.currentTarget.decode().then(() => setDecoded(true)).catch(() => {}) }} /></div>
              <div className="draft-blueprint-glass" />
            </div>
          </div>
          <div className="draft-blueprint-canvas" ref={canvasRef} aria-hidden="true" />
          <svg ref={diagramRef} className="draft-blueprint-leaders" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true" key={`lines-${replay}`}>
            {layers.map((layer, index) => <g key={layer}><path data-leader="true" className="draft-blueprint-leader" pathLength="1" d={`M${610 - index * 40} ${200 + index * 95} L770 ${targetY[index]} H965`} /><path d={`M965 ${targetY[index] - 6} v12`} /></g>)}
          </svg>
          <div className="draft-blueprint-part-labels" aria-hidden="true">{layers.map((layer, index) => <span key={layer} style={{ top: `calc(${targetY[index] / 6}% - 28px)` }}>{layer}</span>)}</div>
        </div>
        <figcaption><span>Public website screenshot. Device shown as a visual model.</span><span className="draft-blueprint-mobile-parts">Glass / Display / Base</span></figcaption>
      </figure>
      <div className="draft-blueprint-controls">
        <div className="draft-blueprint-assembly-buttons"><button type="button" aria-pressed={separation < .05} onClick={() => changeSeparation(0)}>Assemble</button><button type="button" aria-pressed={separation > .95} onClick={() => changeSeparation(1)}>Explode</button></div>
        <label className="draft-blueprint-slider">Separation<input type="range" min="0" max="100" value={Math.round(separation * 100)} onChange={event => changeSeparation(Number(event.target.value) / 100)} aria-valuetext={`${Math.round(separation * 100)} percent separated`} /></label>
        {!reduced && <div className="draft-blueprint-playback"><button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={replayOpening}>Replay</button></div>}
      </div>
      <p className="draft-blueprint-instruction">Scroll to assemble, or move the slider.</p>
    </section>

    <article className="draft-blueprint-case" id="blueprint-case" aria-labelledby="blueprint-case-title">
      <div className="draft-blueprint-case-title"><h2 id="blueprint-case-title">One platform.<br />Every screen.</h2><p>Bayyinah TV<br />2023–26 · Frontend, core team</p></div>
      <div className="draft-blueprint-case-layout"><p className="draft-blueprint-summary">{project.summary}</p><dl>{project.featured!.readouts!.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></div>
      <div className="draft-blueprint-system">
        <section><h3>The interface</h3><p>The Nuxt 3 rebuild started from an empty template. It serves 34 routes, with 270+ components and 25 Pinia stores. English and Arabic include a complete right-to-left layout.</p><span>Nuxt 3 · Vue 3 · Pinia</span></section>
        <section><h3>The live room</h3><p>AWS IVS brings live streaming together with realtime chat and moderation. An HLS player handles on-demand video, with quality selection and a paywall for premium content.</p><span>AWS IVS · video.js · Pusher</span></section>
        <section><h3>The membership</h3><p>Stripe, Apple and Google subscriptions sit alongside gifts and promo codes. The same web app also runs inside the native iOS and Android apps.</p><span>Web · iOS · Android</span></section>
      </div>
      <div className="draft-blueprint-case-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div>
    </article>

    <section className="draft-blueprint-work" id="blueprint-work" aria-labelledby="blueprint-work-title">
      <div className="draft-blueprint-section-title"><h2 id="blueprint-work-title">Work, in detail.</h2><button type="button" aria-expanded={all} onClick={() => setAll(value => !value)}>{all ? 'Selected projects' : `All ${projects.length} projects`}<Arrow /></button></div>
      <div className="draft-blueprint-work-columns" aria-hidden="true"><span>Project</span><span>Field</span><span>Period</span><span /></div>
      {(all ? projects : featuredProjects).map(item => <details className="draft-blueprint-project" key={item.slug}><summary><strong>{item.name}</strong><span>{item.kind}</span><span>{item.years ?? '—'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 4v16M4 12h16" /></svg></summary><div className="draft-blueprint-project-detail"><p>{item.summary}</p><div><p>{item.stack.join(' · ')}</p><div className="draft-blueprint-project-links">{item.slug === project.slug && <a href="#blueprint-case">Read this case<Arrow /></a>}{item.featured && item.slug !== project.slug && <a href={`/work/${item.slug}`}>View case<Arrow /></a>}{item.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div></div></div></details>)}
    </section>

    <section className="draft-blueprint-about" id="blueprint-about" aria-labelledby="blueprint-about-title"><h2 id="blueprint-about-title">The person<br />behind the parts.</h2><div><p>Gentrit Rashiti is a frontend and mobile developer, now full stack. Work spans healthcare, video streaming, e-reading and Web3, from the first screen to release.</p><dl><div><dt>Experience</dt><dd>5+ years. Part of two platform rewrites.</dd></div><div><dt>Based in</dt><dd>Kosovo, working remotely.</dd></div><div><dt>Education</dt><dd>Bachelor’s degree · UBT</dd></div></dl><a href={links.cv} download>Download CV<Arrow /></a></div></section>
    <footer className="draft-blueprint-contact" id="blueprint-contact"><h2>Next, together.</h2><a className="draft-blueprint-email" href={`mailto:${links.email}`}>{links.email}<Arrow /></a><div><span>Gentrit Rashiti · Kosovo</span><nav aria-label="Contact links"><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<Arrow /></a><a href="/drafts">All drafts<Arrow /></a></nav></div></footer>
  </main>
}
