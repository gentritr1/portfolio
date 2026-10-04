import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { transitionOldDraft } from '../../components/portfolio/oldDraftTransition'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { projects, featuredProjects, findProject } from '../../content/projects'
import { links } from '../../content/links'
import { orbitProjects } from './data'
import type { OrbitScene } from './scene'
import './orbit.css'

const reading = findProject('read-to-feed')!
function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg> }

export default function Draft() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const fallbackRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<OrbitScene | null>(null)
  const activeRef = useRef(0)
  const textureIndexRef = useRef(0)
  const pausedRef = useRef(false)
  const [active, setActive] = useState(0)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  const [focused, setFocused] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [all, setAll] = useState(false)
  const [decoded, setDecoded] = useState<number[]>([])
  const current = orbitProjects[active]
  const selectedProject = findProject(current.slug)!

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (reduced) return
    let cancelled = false
    let dispose: (() => void) | undefined
    const start = async () => {
      try {
        const module = await import('./scene')
        const index = activeRef.current
        const image = fallbackRef.current?.querySelectorAll<HTMLImageElement>('[data-orbit-texture]')[index]
        if (!image) return
        await image.decode()
        if (cancelled || !canvasRef.current) return
        textureIndexRef.current = index
        const orbit = module.createOrbit(canvasRef.current, image, orbitProjects[index], time => {
          const mobile = innerWidth < 650
          buttonsRef.current?.querySelectorAll<HTMLElement>('button').forEach((button, i) => {
            const angle = i * Math.PI / 2 - Math.PI / 3 + time * .10
            button.style.left = `${50 + Math.cos(angle) * (mobile ? 29 : 40)}%`
            button.style.top = `${50 + Math.sin(angle) * (mobile ? 30 : 37)}%`
          })
        }, () => { if (!cancelled && activeRef.current === textureIndexRef.current) setReady(true) }, () => { if (!cancelled) setReady(false) })
        if (!orbit) return
        sceneRef.current = orbit
        orbit.setPaused(pausedRef.current)
        dispose = orbit.dispose
        if (activeRef.current !== index) {
          const nextIndex = activeRef.current
          const nextImage = fallbackRef.current?.querySelectorAll<HTMLImageElement>('[data-orbit-texture]')[nextIndex]
          if (nextImage) { await nextImage.decode(); if (!cancelled && activeRef.current === nextIndex) { textureIndexRef.current = nextIndex; orbit.setImage(nextImage, orbitProjects[nextIndex]) } }
        }
      } catch { /* A complete public-image fallback remains visible. */ }
    }
    void start()
    return () => { cancelled = true; dispose?.(); sceneRef.current = null; setReady(false) }
  }, [reduced])

  useEffect(() => {
    activeRef.current = active
    const scene = sceneRef.current
    const image = fallbackRef.current?.querySelectorAll<HTMLImageElement>('[data-orbit-texture]')[active]
    if (!scene || !image) return
    let current = true
    setReady(false)
    void image.decode().then(() => { if (current) { textureIndexRef.current = active; scene.setImage(image, orbitProjects[active]) } }).catch(() => {})
    return () => { current = false }
  }, [active])

  useEffect(() => {
    pausedRef.current = paused || held || focused
    sceneRef.current?.setPaused(paused || held || focused)
  }, [paused, held, focused])

  return <main className="draft-orbit" data-motion={reduced ? 'reduced' : paused || held || focused ? 'paused' : 'active'} style={{ '--orbit-ground': current.background, '--orbit-ink': current.ink } as CSSProperties}>
      <OldDraftMotion />
    <section className="draft-orbit-hero" aria-labelledby="orbit-title">
      <header className="draft-orbit-header"><a href="#orbit-index">Gentrit Rashiti</a><nav aria-label="Orbit navigation"><a href="#orbit-index">All work</a><a href="#orbit-about">About</a><a href="#orbit-contact">Contact<Arrow /></a></nav>{!reduced && <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button>}</header>
      <p className="draft-orbit-role">Frontend & mobile developer,<br />now full stack.<span>5+ years · Kosovo</span></p>
      <div className="draft-orbit-stage" data-ready={ready}>
        <div ref={fallbackRef} className="draft-orbit-fallback">{orbitProjects.map((project, index) => <div className="draft-orbit-still" key={project.slug} hidden={index !== active}><img src={project.preview} alt="" aria-hidden="true" /><img src={project.src} alt={project.alt} data-orbit-texture="true" loading="eager" fetchPriority={index === 0 ? 'high' : 'auto'} style={{ opacity: decoded.includes(index) ? 1 : 0 }} onLoad={event => { void event.currentTarget.decode().then(() => setDecoded(previous => previous.includes(index) ? previous : [...previous, index])).catch(() => {}) }} /></div>)}</div>
        <div className="draft-orbit-canvas" ref={canvasRef} aria-hidden="true" />
        <div className="draft-orbit-projects" ref={buttonsRef} role="group" aria-label="Choose the work in orbit">{orbitProjects.map((project, index) => <button type="button" className={`draft-orbit-project draft-orbit-project-${index}`} key={project.slug} aria-pressed={active === index} onClick={() => transitionOldDraft(() => setActive(index))} onPointerEnter={() => setHeld(true)} onPointerLeave={() => setHeld(false)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}><img src={project.preview} alt="" aria-hidden="true" /><span>{project.name}</span></button>)}</div>
      </div>
      <div className="draft-orbit-selection" aria-live="polite"><h2>{current.name}</h2><p>{selectedProject.kind}</p><a href={current.slug === reading.slug ? '#orbit-case' : `/work/${current.slug}`}>Explore project<Arrow /></a></div>
      <h1 id="orbit-title"><span>Gentrit</span><span>Rashiti.</span></h1>
    </section>

    <article className="draft-orbit-case" id="orbit-case" aria-labelledby="orbit-case-title"><div className="draft-orbit-case-heading"><h2 id="orbit-case-title">Read to Feed.</h2><p>Children’s reading app<br />2022–25 · iOS & Android</p></div><div className="draft-orbit-case-layout"><div className="draft-orbit-case-art"><img src="/mobile/reading-1.webp" alt="Read to Feed’s My Books screen, public store frame" loading="lazy" /><img src="/mobile/reading-2.webp" alt="Read to Feed’s achievements, public store frame" loading="lazy" /></div><div className="draft-orbit-case-copy"><h3>A little further,<br />every day.</h3><p>{reading.summary}</p><dl>{reading.featured!.readouts!.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}{item.to && ` → ${item.to}`}</dd></div>)}</dl><p>Maintained forks of epubjs-react-native and react-native-pdf keep both readers working on current React Native. Redux Toolkit holds the app state; parents verify accounts by email.</p><p className="draft-orbit-source">Screens are from the public store listings. The listings are now removed; the links open archived copies.</p><div className="draft-orbit-links">{reading.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div></div></div></article>

    <section className="draft-orbit-index" id="orbit-index" aria-labelledby="orbit-index-title"><div className="draft-orbit-index-heading"><h2 id="orbit-index-title">A closer look.</h2><button type="button" aria-expanded={all} onClick={() => setAll(value => !value)}>{all ? 'Show selected work' : `Explore all ${projects.length} projects`}<Arrow /></button></div>{(all ? projects : featuredProjects).map(project => <details key={project.slug}><summary><strong>{project.name}</strong><span>{project.kind}</span><span>{project.years ?? '—'}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M12 4v16M4 12h16" /></svg></summary><div className="draft-orbit-project-detail"><OldCareFile slug={project.slug} /><p>{project.summary}</p><div><p>{project.stack.join(' · ')}</p><div className="draft-orbit-links">{project.slug === reading.slug && <a href="#orbit-case">Read this case<Arrow /></a>}{project.featured && project.slug !== reading.slug && <a href={`/work/${project.slug}`}>Full case<Arrow /></a>}{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div></div></div></details>)}</section>

    <section className="draft-orbit-about" id="orbit-about" aria-labelledby="orbit-about-title"><h2 id="orbit-about-title">A person.<br />Many products.</h2><div><p>Gentrit Rashiti is a frontend and mobile developer, now full stack, with 5+ years across healthcare, video streaming, e-reading and Web3.</p><p>React, React Native, Vue, Nuxt and Next.js. Laravel and FastAPI. From the first screen to release.</p><dl><div><dt>Based in</dt><dd>Kosovo, working remotely</dd></div><div><dt>Education</dt><dd>Bachelor’s degree · UBT</dd></div></dl><a href={links.cv} download>Download CV<Arrow /></a></div></section>
    <footer className="draft-orbit-contact" id="orbit-contact"><h2>Say hello.</h2><a className="draft-orbit-email" href={`mailto:${links.email}`}>{links.email}<Arrow /></a><div><span>Gentrit Rashiti · Kosovo</span><nav aria-label="Contact links"><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<Arrow /></a><a href="/drafts">All drafts<Arrow /></a></nav></div></footer>
  </main>
}
