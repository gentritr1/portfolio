import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { currentYear, firstYear, projects } from '../../content/projects'
import { caseNarratives } from '../../content/caseNarratives'
import { links } from '../../content/links'
import './zine.css'

const viva = projects.find((project) => project.slug === 'viva-fresh')!
const caseStory = caseNarratives['viva-fresh']!.story
const storeFrames = viva.media.galleries![0].items.slice(0, 3)
const bands = [
  ['Viva Fresh', 'FJALË', 'Read to Feed', 'Bayyinah TV', 'Offday'],
  ['Snaxx Tech', 'Incentiv', 'Morse Trainer', 'Za!', 'Dukagjini Bookstore'],
]

function Arrow({ down = false }: { down?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" style={down ? { transform: 'rotate(90deg)' } : undefined}><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

function StoreImage({ src, alt, eager = false }: { src: string; alt: string; eager?: boolean }) {
  const [ready, setReady] = useState(false)
  return <div className="zn-image">
    <span aria-hidden="true">Viva<br />Fresh.</span>
    <img src={src} alt={alt} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" data-ready={ready} onLoad={(event) => {
      void event.currentTarget.decode().then(() => setReady(true)).catch(() => setReady(false))
    }} onError={() => setReady(false)} />
  </div>
}

export default function Draft() {
  const cover = useRef<HTMLElement>(null)
  const gallery = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [visible, setVisible] = useState(true)
  const [filter, setFilter] = useState('All')
  const rows = filter === 'All' ? projects : projects.filter((project) => project.group === filter)
  const groups = [...new Set(projects.map((project) => project.group))]

  useEffect(() => {
    const node = cover.current
    if (!node) return
    let inView = true
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; setVisible(inView && !document.hidden) })
    observer.observe(node)
    const visibility = () => setVisible(inView && !document.hidden)
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const preference = () => setReduced(motion.matches)
    document.addEventListener('visibilitychange', visibility)
    motion.addEventListener('change', preference)
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); motion.removeEventListener('change', preference) }
  }, [])

  function moveGallery(direction: number) {
    const node = gallery.current
    const frame = node?.querySelector('figure')
    if (node && frame) node.scrollBy({ left: direction * (frame.getBoundingClientRect().width + 28), behavior: reduced ? 'instant' : 'smooth' })
  }

  return (
    <div className="draft-zine" style={{ '--zn-play': paused || reduced || !visible ? 'paused' : 'running' } as CSSProperties}>
      <header className="zn-header">
        <a href="/drafts" className="zn-brand">Gentrit Rashiti<span>Zine</span></a>
        <nav aria-label="Portfolio navigation"><a href="#zn-index">All {projects.length}</a><a href="#zn-about">About</a><button type="button" aria-pressed={paused || reduced} disabled={reduced} onClick={() => setPaused(!paused)}>{reduced ? 'Motion off' : paused ? 'Play motion' : 'Pause motion'}</button></nav>
      </header>

      <main>
        <section ref={cover} className="zn-cover" aria-labelledby="zn-title">
          <h1 id="zn-title"><span>Gentrit</span><span>Rashiti.</span></h1>
          <div className="zn-cover-copy"><p>Frontend & mobile developer,<br />now full stack.</p><p>Kosovo · Remote · 5+ years</p><a href="#zn-viva">Read Viva Fresh <Arrow down /></a></div>
          <div className="zn-cover-collage" aria-label="Viva Fresh public store imagery">
            <figure className="zn-cover-main"><StoreImage src="/mobile/grocery-1.webp" alt="Viva Fresh public store frame showing the mobile home screen with grocery categories" eager /><figcaption>Viva Fresh · Public store frame</figcaption></figure>
            <figure className="zn-cover-crop"><StoreImage src="/mobile/grocery-2.webp" alt="Viva Fresh public store frame showing the fresh grocery category" eager /></figure>
          </div>
          <div className="zn-crossing" aria-hidden="true">
            {bands.map((names, i) => <div className={`zn-band zn-band-${i}`} key={i}><div className="zn-band-track">{[0, 1].map((copy) => <div className="zn-band-copy" key={copy}>{names.map((name) => <span key={name}>{name}<i>/</i></span>)}</div>)}</div></div>)}
          </div>
        </section>

        <article className="zn-case" id="zn-viva" aria-labelledby="zn-viva-title">
          <div className="zn-case-opening"><h2 id="zn-viva-title">Viva<br /><span>Fresh.</span></h2><div><p>{caseStory.product}</p><dl><div><dt>Role</dt><dd>{viva.role}</dd></div><div><dt>Year</dt><dd>{viva.years}</dd></div><div><dt>Platforms</dt><dd>iOS & Android</dd></div></dl></div></div>
          <div className="zn-gallery-heading"><h3>From shelf to checkout.</h3><div><button type="button" aria-label="Previous public store frame" onClick={() => moveGallery(-1)}><span className="zn-back-arrow"><Arrow /></span></button><button type="button" aria-label="Next public store frame" onClick={() => moveGallery(1)}><Arrow /></button></div></div>
          <div className="zn-gallery" ref={gallery} tabIndex={0} role="region" aria-label="Viva Fresh public store screenshots. Scroll horizontally for three frames.">
            {storeFrames.map((frame, i) => <figure key={frame.src}><StoreImage src={frame.src} alt={frame.alt} /><figcaption><strong>{i === 0 ? 'Browse' : i === 1 ? 'Choose' : 'Checkout'}</strong><span>{frame.caption}</span></figcaption></figure>)}
          </div>
          <div className="zn-case-reading"><h3>One codebase.<br />Both stores.</h3><div><p>{caseStory.built}</p><p>{caseStory.result}</p><p className="zn-case-stack">{viva.stack.join(' · ')}</p><div className="zn-store-links">{viva.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /><span className="zn-sr"> (opens in a new tab)</span></a>)}</div></div></div>
        </article>

        <section id="zn-index" className="zn-index" aria-labelledby="zn-index-title">
          <div className="zn-index-title"><h2 id="zn-index-title">The whole<br /><span>collection.</span></h2><p>{projects.length} projects.<br />{firstYear}–{currentYear}.</p></div>
          <div className="zn-index-tools"><label>Show <select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="All">All projects</option>{groups.map((group) => <option key={group}>{group}</option>)}</select></label><p role="status">{rows.length} {rows.length === 1 ? 'project' : 'projects'}</p></div>
          <div className="zn-projects">{rows.map((project) => <details key={project.slug}>
            <summary><span>{project.name}</span><span>{project.years ?? '—'}</span><span className="zn-expand" aria-hidden="true" /></summary>
            <div className="zn-project-story"><p>{project.summary}</p><dl><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Stack</dt><dd>{project.stack.join(' · ')}</dd></div></dl><div className="zn-project-links">{project.slug === 'viva-fresh' && <a href="#zn-viva">Read the featured case <Arrow /></a>}{project.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /><span className="zn-sr"> (opens in a new tab)</span></a>)}</div></div>
          </details>)}</div>
        </section>

        <section className="zn-about" id="zn-about" aria-labelledby="zn-about-title">
          <h2 id="zn-about-title">Web.<br />Mobile.<br /><span>Full stack.</span></h2>
          <div className="zn-about-reading"><p>Gentrit Rashiti builds web and mobile products, from the first screen to release. The work includes two platform rewrites, healthcare, video streaming, e-reading and Web3.</p><p>React, Next.js, Vue and Nuxt on the web. React Native on iOS and Android. Laravel and FastAPI behind the interface.</p><p>Based in Kosovo, working remotely.<br />Bachelor’s degree · UBT.</p><div className="zn-about-links"><a href={links.cv} download>Download CV<Arrow down /></a><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<Arrow /><span className="zn-sr"> (opens in a new tab)</span></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow /><span className="zn-sr"> (opens in a new tab)</span></a></div></div>
          <a className="zn-email" href={`mailto:${links.email}`}>{links.email}<Arrow /></a>
        </section>
      </main>
      <footer className="zn-footer"><a href="/drafts">All art directions</a><span>Gentrit Rashiti · {currentYear}</span><a href="#zn-title">Back to top <Arrow down /></a></footer>
    </div>
  )
}
