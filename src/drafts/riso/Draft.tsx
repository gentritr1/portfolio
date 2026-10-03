import { useRef, useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import { Link } from 'react-router'
import { projects } from '../../content/projects'
import type { Project } from '../../content/projects'
import { links } from '../../content/links'
import './riso.css'

const worlds = { healthcare: 'Healthcare', streaming: 'Streaming', reading: 'Mobile apps', web3: 'Web3', ai: 'Web & AI', personal: 'Personal' }
const firstProject = projects.find(project => project.slug === 'snaxx-tech')!

function Arrow({ direction = 'up' }: { direction?: 'up' | 'left' | 'right' }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={direction === 'left' ? { transform: 'rotate(-135deg)' } : direction === 'right' ? { transform: 'rotate(45deg)' } : undefined}><path d="M5 19 19 5M5 5h14v14" /></svg>
}

function PrintIcon() {
  return <svg aria-hidden="true" width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 8V2h12v6M6 17H3V8h18v9h-3M6 14h12v8H6zM17 11h2" /></svg>
}

function Poster({ project, plainImage }: { project: Project; plainImage: boolean }) {
  const poster = useRef<HTMLElement>(null)
  const image = project.media.galleries?.[0]?.items[0] ?? project.media.shot
  const words = project.name.split(' ')
  const fontSize = `${Math.min(18, 158 / project.name.length)}cqw`
  const mobileFontSize = `${Math.min(34, 165 / Math.max(...words.map(word => word.length)))}cqw`

  function separateInk(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--riso-shift-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 9}px`)
    event.currentTarget.style.setProperty('--riso-shift-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 7}px`)
  }

  function registerInk() { poster.current?.style.setProperty('--riso-shift-x', '2px'); poster.current?.style.setProperty('--riso-shift-y', '2px') }

  return <article ref={poster} tabIndex={-1} className={`riso-poster${plainImage ? ' riso-poster--original' : ''}`} style={{ '--riso-title-size': fontSize, '--riso-mobile-title-size': mobileFontSize } as CSSProperties} onPointerMove={separateInk} onPointerLeave={registerInk} aria-label={`${project.name} printable project poster`}>
    <div className="riso-poster-byline"><span>Gentrit Rashiti</span><span>{project.years ?? 'Selected work'}</span></div>
    <div className="riso-title-wrap"><h1>{words.map((word, index) => <span key={index}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}</h1><div className="riso-title-plate" aria-hidden="true">{words.map((word, index) => <span key={index}>{word}{index < words.length - 1 ? ' ' : ''}</span>)}</div></div>
    <div className="riso-poster-subtitle"><p>{project.kind}</p><span>{worlds[project.channel]}</span></div>
    {image ? <figure className="riso-image"><img className="riso-image-key" src={image.src} alt={image.alt} /><img className="riso-image-color" src={image.src} alt="" aria-hidden="true" /><figcaption className="riso-print-caption">Public product screenshot</figcaption></figure> : <div className="riso-type-poster"><p>{project.line}</p><span>{project.stack.slice(0, 3).join(' / ')}</span></div>}
    <div className="riso-poster-description"><p>{project.line}</p><div><span>{project.role}</span><span>{project.stack.slice(0, 4).join(' / ')}</span></div></div>
    <div className="riso-poster-footer"><span>Web & mobile development</span><span>{links.githubLabel}</span></div>
    <div className="riso-print-contact">Gentrit Rashiti · {links.email}</div>
  </article>
}

function CaseDetails({ project }: { project: Project }) {
  return <section className="riso-case" id="riso-case" aria-labelledby="riso-case-title">
    <div><h2 id="riso-case-title">{project.name === 'Snaxx Tech' ? 'A small studio.\nAn entire world.' : project.name}</h2><div className="riso-case-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow /></a>)}</div></div>
    <div><p>{project.summary}</p><dl><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Year</dt><dd>{project.years ?? 'Not listed'}</dd></div><div><dt>Technology</dt><dd>{project.stack.join(', ')}</dd></div></dl>{project.slug === 'snaxx-tech' && <><h3>A lighter site, with the same world.</h3><p>The three.js hero and seamless cinemagraph loop sit inside the Almanac visual theme. The site runs on Vercel under a strict content security policy. Image assets went from 972 KB to 337 KB, and the deploy from 28 MB to 9.5 MB.</p></>}</div>
  </section>
}

export default function Draft() {
  const [selected, setSelected] = useState(firstProject.slug)
  const [query, setQuery] = useState('')
  const [plainImage, setPlainImage] = useState(false)
  const [printMessage, setPrintMessage] = useState('')
  const project = projects.find(item => item.slug === selected) ?? firstProject
  const selectedIndex = projects.indexOf(project)
  const visible = projects.filter(item => `${item.name} ${item.kind} ${item.stack.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))

  function selectProject(slug: string, revealPoster = false) {
    setSelected(slug); setPlainImage(false); setPrintMessage('')
    if (revealPoster && matchMedia('(max-width: 700px)').matches) {
      requestAnimationFrame(() => {
        const poster = document.querySelector<HTMLElement>('.draft-riso .riso-poster')
        poster?.focus({ preventScroll: true })
        poster?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
      })
    }
  }

  async function printPoster() {
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.draft-riso .riso-poster img'))
    await Promise.allSettled(images.map(image => image.decode()))
    await document.fonts.ready
    try { window.print(); setPrintMessage('Print dialog opened for the selected poster.') } catch { setPrintMessage('The browser could not open printing. Use its Print command to print this poster.') }
  }

  return <div className="draft-riso">
    <header className="riso-header riso-screen-only"><Link to="/drafts" className="riso-owner">Gentrit Rashiti</Link><p>Frontend & mobile developer.<br />Now full stack.</p><nav aria-label="Riso navigation"><a href="#riso-index">All projects <span>{projects.length}</span></a><a href="#riso-about">About / Contact</a><Link to="/drafts">All drafts<Arrow /></Link></nav></header>
    <main>
      <div className="riso-workspace">
        <div className="riso-poster-column"><div className="riso-toolbar riso-screen-only"><div className="riso-step"><button type="button" aria-label="Previous project poster" onClick={() => selectProject(projects[(selectedIndex - 1 + projects.length) % projects.length].slug)}><Arrow direction="left" /></button><span>{String(selectedIndex + 1).padStart(2, '0')} / {projects.length}</span><button type="button" aria-label="Next project poster" onClick={() => selectProject(projects[(selectedIndex + 1) % projects.length].slug)}><Arrow direction="right" /></button></div><button className="riso-print-button" type="button" onClick={printPoster}><PrintIcon />Print this poster</button></div><Poster key={project.slug} project={project} plainImage={plainImage} /><div className="riso-poster-controls riso-screen-only"><button type="button" hidden={!project.media.galleries?.[0]?.items[0] && !project.media.shot} aria-pressed={plainImage} onClick={() => setPlainImage(value => !value)}>{plainImage ? 'Show two-ink image' : 'View original image'}</button><a href="#riso-case">Read project<Arrow /></a></div><p className="riso-print-status riso-screen-only" role="status">{printMessage}</p></div>
        <aside className="riso-index riso-screen-only" id="riso-index" aria-labelledby="riso-index-title"><div className="riso-index-heading"><h2 id="riso-index-title">The work.</h2><span>{projects.length} projects</span></div><label><span className="riso-sr-only">Find a project or technology</span><input type="search" placeholder="Find a project" value={query} onChange={event => setQuery(event.target.value)} /></label><div className="riso-project-index">{visible.map(item => <button key={item.slug} type="button" aria-pressed={item.slug === selected} onClick={() => selectProject(item.slug, true)}><span>{item.name}</span><small>{worlds[item.channel]}</small><Arrow /></button>)}</div>{visible.length === 0 && <p className="riso-empty">No match. Try “React” or “mobile”.</p>}<p className="riso-index-foot">Every project has a poster.<br />Choose one, then print a copy.</p></aside>
      </div>
      <div className="riso-screen-only"><CaseDetails project={project} /><section className="riso-about" id="riso-about"><div><h2>GENTRIT<br />RASHITI.</h2><p>Frontend & mobile developer, now full stack. Web and mobile products, from the first screen to release.</p><p>5+ years. Part of two platform rewrites. Healthcare, video streaming, e-reading and Web3. Based in Kosovo, working remotely.</p></div><div className="riso-contact"><h3>Let’s talk.</h3><a href={`mailto:${links.email}`}>{links.email}<Arrow /></a><div><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noreferrer">GitHub<Arrow /></a><a href={links.cv} download>Download CV<Arrow /></a></div></div></section></div>
    </main>
    <footer className="riso-footer riso-screen-only"><Link to="/drafts">Back to all drafts<Arrow /></Link><a href="#riso-index">Choose another poster<Arrow /></a></footer>
  </div>
}
