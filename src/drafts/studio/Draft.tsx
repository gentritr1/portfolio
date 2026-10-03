import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { featuredProjects, findProject, projects, type Project } from '../../content/projects'
import { links } from '../../content/links'
import { chapters, screenCrop, shots } from './shots'
import type { StudioScene } from './scene'
import './studio.css'

const reading = findProject('read-to-feed')!

function Arrow({ direction = 'diagonal' }: { direction?: 'diagonal' | 'down' }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={direction === 'down' ? 'M12 4v16m-7-7 7 7 7-7' : 'M5 19 19 5M5 5h14v14'} /></svg>
}

function Screen({ index }: { index: number }) {
  const [decoded, setDecoded] = useState(false)
  const shot = shots[index]
  const [x, y, width, height] = screenCrop
  const crop: CSSProperties = { left: `${-x / width * 100}%`, top: `${-y / height * 100}%`, width: `${100 / width}%`, height: `${100 / height}%` }
  return <div className={`draft-studio-phone draft-studio-phone-${index}`}>
    <div className="draft-studio-screen">
      <img src={shot.preview} alt="" aria-hidden="true" style={crop} decoding="sync" />
      <img src={shot.src} alt={shot.alt} style={{ ...crop, opacity: decoded ? 1 : 0 }} data-studio-texture="true" loading="eager" fetchPriority="high" onLoad={event => {
        const image = event.currentTarget
        void image.decode().then(() => setDecoded(true)).catch(() => {})
      }} />
    </div>
  </div>
}

function WorkRow({ project }: { project: Project }) {
  return <details className="draft-studio-work-row">
    <summary>
      <span className="draft-studio-work-name">{project.name}</span>
      <span className="draft-studio-work-kind">{project.kind}</span>
      <span className="draft-studio-work-year">{project.years ?? '—'}</span>
      <span className="draft-studio-work-expand" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 4v16M4 12h16" /></svg></span>
    </summary>
    <div className="draft-studio-work-details">
      <p>{project.summary}</p>
      <div><p className="draft-studio-work-stack">{project.stack.join(' · ')}</p>
        <div className="draft-studio-row-links">
          {project.slug === reading.slug && <a href="#studio-case">Read this case <Arrow /></a>}
          {project.featured && project.slug !== reading.slug && <a href={`/work/${project.slug}`}>View case <Arrow /></a>}
          {project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}
        </div>
      </div>
    </div>
  </details>
}

export default function Draft() {
  const journeyRef = useRef<HTMLElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<StudioScene | null>(null)
  const progressRef = useRef(0)
  const openingRef = useRef(0)
  const [chapter, setChapter] = useState(0)
  const [ready, setReady] = useState(false)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [allWork, setAllWork] = useState(false)
  const [replay, setReplay] = useState(0)
  const pausedRef = useRef(paused)

  useEffect(() => { openingRef.current = performance.now() }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const journey = journeyRef.current
      if (!journey) return
      const box = journey.getBoundingClientRect()
      const extent = box.height - window.innerHeight
      const progress = Math.max(0, Math.min(2, -box.top / Math.max(1, extent) * 2))
      progressRef.current = progress
      const next = Math.min(2, Math.floor(progress + 0.43))
      setChapter(previous => previous === next ? previous : next)
      stageRef.current?.style.setProperty('--draft-studio-scroll', String(progress))
      sceneRef.current?.setProgress(progress)
    }
    const request = () => { if (!frame) frame = requestAnimationFrame(update) }
    window.addEventListener('scroll', request, { passive: true })
    window.addEventListener('resize', request)
    update()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', request)
      window.removeEventListener('resize', request)
    }
  }, [])

  useEffect(() => {
    if (reduced || !visualRef.current || !canvasRef.current) return
    let cancelled = false
    let dispose: (() => void) | undefined
    const images = Array.from(visualRef.current.querySelectorAll<HTMLImageElement>('[data-studio-texture]'))
    const start = async () => {
      try {
        const [module] = await Promise.all([import('./scene'), Promise.all(images.map(image => image.decode()))])
        if (cancelled || !canvasRef.current) return
        const scene = module.createScene(canvasRef.current, images, openingRef.current, () => { if (!cancelled) setReady(true) }, () => { if (!cancelled) setReady(false) })
        if (!scene) return
        sceneRef.current = scene
        scene.setProgress(progressRef.current)
        scene.setPaused(pausedRef.current)
        dispose = scene.dispose
      } catch { /* The fully visible HTML devices remain the static fallback. */ }
    }
    void start()
    return () => {
      cancelled = true
      dispose?.()
      sceneRef.current = null
      setReady(false)
    }
  }, [reduced])

  useEffect(() => {
    pausedRef.current = paused
    sceneRef.current?.setPaused(paused)
  }, [paused])

  function goToChapter(index: number) {
    const journey = journeyRef.current
    if (!journey) return
    const top = journey.getBoundingClientRect().top + window.scrollY
    const extent = journey.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + Math.max(0, extent) * index / 2, behavior: reduced || paused ? 'instant' : 'smooth' })
  }

  function replayOpening() {
    setPaused(false)
    setReplay(value => value + 1)
    sceneRef.current?.replay()
    goToChapter(0)
  }

  const palette = chapters[chapter]

  return <main className="draft-studio" data-motion={reduced ? 'reduced' : paused ? 'paused' : 'active'}>
    <a className="draft-studio-skip" href="#studio-work">Skip to work index</a>
    <section className="draft-studio-journey" ref={journeyRef} aria-label="Read to Feed studio story">
      <div className="draft-studio-stage" ref={stageRef} data-chapter={chapter} style={{ '--draft-studio-backdrop': palette.colour, '--draft-studio-foreground': palette.text } as CSSProperties}>
        <header className="draft-studio-header">
          <a className="draft-studio-brand" href="#studio-top" onClick={event => { event.preventDefault(); goToChapter(0) }}>Gentrit Rashiti</a>
          <nav aria-label="Studio navigation"><a href="#studio-work">Work</a><a href="#studio-about">About</a><a href="#studio-contact">Contact <Arrow /></a></nav>
        </header>
        <div className="draft-studio-copy" id="studio-top">
          <div className="draft-studio-chapter-copy" hidden={chapter !== 0}>
            <h1>Gentrit<br />Rashiti.</h1>
            <p className="draft-studio-intro">Frontend & mobile developer,<br />now full stack.</p>
            <a className="draft-studio-story-link" href="#studio-case">Explore Read to Feed <Arrow direction="down" /></a>
          </div>
          <div className="draft-studio-chapter-copy" hidden={chapter !== 1}>
            <h2>A book.<br />Anywhere.</h2>
            <p className="draft-studio-intro">A PDF and EPUB reader.<br />Progress saved, page by page.</p>
            <a className="draft-studio-story-link" href="#studio-case">Inside Read to Feed <Arrow direction="down" /></a>
          </div>
          <div className="draft-studio-chapter-copy" hidden={chapter !== 2}>
            <h2>One more<br />chapter.</h2>
            <p className="draft-studio-intro">Reading streaks, badges and quizzes.<br />Three languages. Two platforms.</p>
            <a className="draft-studio-story-link" href="#studio-case">The project, in detail <Arrow direction="down" /></a>
          </div>
        </div>
        <div ref={visualRef} className="draft-studio-visual" data-ready={ready}>
          <div className="draft-studio-still" key={replay}><Screen index={0} /><Screen index={1} /><Screen index={2} /></div>
          <div className="draft-studio-canvas" ref={canvasRef} aria-hidden="true" />
        </div>
        <div className="draft-studio-stage-foot">
          <div className="draft-studio-product-credit"><strong>Read to Feed</strong><span>iOS & Android · 2022–25</span></div>
          <div className="draft-studio-chapters" aria-label="Studio chapters">
            {chapters.map((item, index) => <button key={item.title} type="button" aria-pressed={chapter === index} onClick={() => goToChapter(index)}><span className="draft-studio-chapter-dot" aria-hidden="true" />{item.title.replace('The ', '')}</button>)}
          </div>
          {!reduced && <div className="draft-studio-playback"><button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button><button type="button" onClick={replayOpening} aria-label="Replay opening motion"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M4 5v6h6M4.6 10.8a8 8 0 1 1 .2 3.3" /></svg></button></div>}
        </div>
      </div>
    </section>

    <article className="draft-studio-case" id="studio-case" aria-labelledby="studio-case-title">
      <div className="draft-studio-case-heading"><h2 id="studio-case-title">Read to Feed.</h2><p>Children’s reading app<br />Mobile · iOS & Android</p></div>
      <p className="draft-studio-case-lead">Books on a screen. Stories that stay.</p>
      <div className="draft-studio-case-body"><p>{reading.summary}</p><div className="draft-studio-case-stack"><strong>{reading.role}</strong><span>{reading.years}</span><p>{reading.stack.join(' · ')}</p></div></div>
      <dl className="draft-studio-readouts">{reading.featured!.readouts!.map(readout => <div key={readout.label}><dt>{readout.label}</dt><dd>{readout.value}{readout.to && <><span className="draft-studio-readout-to">to</span>{readout.to}</>}</dd></div>)}</dl>
      <div className="draft-studio-case-notes">
        <section><h3>The reader, kept current.</h3><p>Maintained forks of epubjs-react-native and react-native-pdf keep the PDF and EPUB reader working on current React Native. Redux Toolkit holds the app state; reading progress follows each book.</p></section>
        <section><h3>Beyond the page.</h3><p>An ISBN barcode scanner brings a child’s own books into the app. Quizzes play as chat conversations, with badges, streaks and coach marks. Push notifications open through deep links, and parents verify accounts by email.</p></section>
      </div>
      <div className="draft-studio-case-sources"><p>Device screens are from the public store listings.<br />The listings are now removed; these links open archived copies.</p><div>{reading.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div></div>
    </article>

    <section className="draft-studio-work" id="studio-work" aria-labelledby="studio-work-title">
      <div className="draft-studio-section-heading"><h2 id="studio-work-title">The work.</h2><p>Healthcare. Video. Reading.<br />Products across web and mobile.</p></div>
      <div className="draft-studio-work-list">{(allWork ? projects : featuredProjects).map(project => <WorkRow key={project.slug} project={project} />)}</div>
      <button className="draft-studio-all-work" type="button" aria-expanded={allWork} onClick={() => setAllWork(value => !value)}>{allWork ? 'Show selected work' : `Explore all ${projects.length} projects`}<Arrow direction="down" /></button>
    </section>

    <section className="draft-studio-about" id="studio-about" aria-labelledby="studio-about-title">
      <h2 id="studio-about-title">From first screen<br />to release.</h2>
      <div className="draft-studio-about-copy"><p>Gentrit Rashiti is a frontend and mobile developer, now full stack, with 5+ years across healthcare, video streaming, e-reading and Web3.</p><p>React and React Native. Vue, Nuxt and Next.js. Laravel and FastAPI. Work that spans the interface, the API and the release.</p><dl><div><dt>Based in</dt><dd>Kosovo, working remotely</dd></div><div><dt>Education</dt><dd>Bachelor’s degree · UBT</dd></div></dl><a className="draft-studio-cv" href={links.cv} download>Download CV<Arrow /></a></div>
    </section>

    <footer className="draft-studio-contact" id="studio-contact">
      <h2>Let’s talk.</h2>
      <a className="draft-studio-email" href={`mailto:${links.email}`}>{links.email}<Arrow /></a>
      <div className="draft-studio-footer-row"><span>Gentrit Rashiti · Kosovo</span><nav aria-label="Contact links"><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<Arrow /></a><a href="/drafts">All drafts<Arrow /></a></nav></div>
    </footer>
  </main>
}
