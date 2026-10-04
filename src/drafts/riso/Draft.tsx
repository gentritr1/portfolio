import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { projects } from '../../content/projects'
import type { Project } from '../../content/projects'
import { caseNarratives } from '../../content/caseNarratives'
import { channels } from '../../content/channels'
import { links } from '../../content/links'
import { Poster, pad, titleScale } from './Poster'
import { spring } from './motion'
import type { PosterHandle } from './Poster'
import './riso.css'

const firstProject = projects.find(project => project.slug === 'snaxx-tech')!
const numberOf = (project: Project) => projects.indexOf(project) + 1

function Arrow({ direction = 'up' }: { direction?: 'up' | 'left' | 'right' | 'down' }) {
  const turn = { up: 0, right: 45, down: 135, left: -135 }[direction]
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={turn ? { transform: `rotate(${turn}deg)` } : undefined}><path d="M5 19 19 5M5 5h14v14" /></svg>
}

function Register() {
  return <svg className="rh-register" aria-hidden="true" viewBox="0 0 24 24" width="22" height="22"><g fill="none" strokeWidth="1.6"><g stroke="var(--blue)"><circle cx="12" cy="12" r="6.5" /><path d="M12 1v22M1 12h22" /></g><g stroke="var(--pink)" transform="translate(1.4 1.1)"><circle cx="12" cy="12" r="6.5" /><path d="M12 1v22M1 12h22" /></g></g></svg>
}

function Thumb({ project, order, selected, onSelect }: { project: Project; order: number; selected: boolean; onSelect: () => void }) {
  const number = numberOf(project)
  return <button type="button" role="tab" id={`riso-tab-${project.slug}`} aria-selected={selected} aria-controls="riso-poster" tabIndex={selected ? 0 : -1} className="rs-thumb" aria-label={`${pad(number)}. ${project.name}`} onClick={onSelect} style={{ '--t-mini': `${titleScale(project.name).portrait * .98}cqw`, '--i': order } as CSSProperties}>
    <span className="rs-mini" aria-hidden="true">
      <span className={`rs-flood rp-flood--${project.channel}`} />
      <span className="rs-no">{pad(number)}</span>
      <span className="rs-title rs-title--pink">{project.name}</span>
      <span className="rs-title rs-title--blue">{project.name}</span>
    </span>
  </button>
}

function JobNotes({ project }: { project: Project }) {
  const narrative = caseNarratives[project.slug]
  if (!narrative && project.slug !== 'care-platform') return null
  return <section className="rn riso-screen-only" id="riso-notes" aria-labelledby="riso-notes-title">
    <header className="rn-head"><p className="rn-label">Job notes · No. {pad(numberOf(project))}</p><h2 id="riso-notes-title">{project.name}</h2><Link className="rn-case" to={`/work/${project.slug}`}>Open the full case<Arrow /></Link></header>
    <div className="rn-body">
      <OldCareFile slug={project.slug} />
      {narrative && <div className="rn-story">{(['product', 'built', 'result'] as const).map(part => <div key={part}><h3>{{ product: 'The product', built: 'What was built', result: 'The result' }[part]}</h3><p>{narrative.story[part]}</p></div>)}</div>}
      {narrative && <dl className="rn-facts">{narrative.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}
    </div>
  </section>
}

export default function Draft() {
  const [selected, setSelected] = useState(firstProject.slug)
  const [query, setQuery] = useState('')
  const [plain, setPlain] = useState(false)
  const [first, setFirst] = useState(true)
  const [stamp, setStamp] = useState<'idle' | 'running' | 'done'>('idle')
  const [status, setStatus] = useState('')
  const [entered, setEntered] = useState(false)
  const poster = useRef<PosterHandle>(null)
  const strip = useRef<HTMLDivElement>(null)
  const project = projects.find(item => item.slug === selected) ?? firstProject
  const index = projects.indexOf(project)
  const visible = projects.filter(item => `${item.name} ${item.kind} ${item.stack.join(' ')} ${channels[item.channel].label}`.toLowerCase().includes(query.toLowerCase().trim()))
  const hasImage = Boolean(project.media.galleries?.[0] || project.media.shot) && project.slug !== 'care-platform'
  const featured = Boolean(caseNarratives[project.slug])

  useEffect(() => {
    const thumb = strip.current?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!thumb || !strip.current) return
    const box = strip.current
    const left = thumb.offsetLeft - box.clientWidth / 2 + thumb.offsetWidth / 2
    box.scrollTo({ left, behavior: first || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }, [selected, first])

  useEffect(() => { const timer = window.setTimeout(() => setEntered(true), 1600); return () => window.clearTimeout(timer) }, [])

  function select(slug: string) {
    if (slug === selected) return
    setSelected(slug); setPlain(false); setFirst(false); setStamp('idle'); setStatus('')
  }
  const step = (by: number) => select(projects[(index + by + projects.length) % projects.length].slug)

  function roving(event: KeyboardEvent<HTMLDivElement>) {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }
    const at = visible.indexOf(project)
    let next: Project | undefined
    if (event.key in keys) next = visible[(Math.max(at, 0) + keys[event.key] + visible.length) % visible.length]
    if (event.key === 'Home') next = visible[0]
    if (event.key === 'End') next = visible.at(-1)
    if (!next) return
    event.preventDefault()
    const target = next.slug
    select(target)
    requestAnimationFrame(() => document.getElementById(`riso-tab-${target}`)?.focus())
  }

  async function print() {
    if (stamp === 'running') return
    setStamp('running')
    const images = Array.from(document.querySelectorAll<HTMLImageElement>('.draft-riso .rp img'))
    await Promise.allSettled(images.map(image => image.decode()))
    await document.fonts.ready
    const ready = await poster.current?.printRun()
    if (!ready) { setStamp('idle'); return }
    try { window.print(); setStatus(`Print dialog opened for the ${project.name} poster.`) } catch { setStatus('The browser could not open printing. Use its Print command to print this poster.') }
    poster.current?.release()
    setStamp('done')
    window.setTimeout(() => setStamp(value => value === 'done' ? 'idle' : value), 1800)
  }

  return <div className="draft-riso" style={{ '--spring-ui': spring.ui.easing } as CSSProperties}>
    <OldDraftMotion />
    <h1 className="riso-sr-only">Gentrit Rashiti: {projects.length} project posters, 2021 to 2026</h1>
    <header className="rh riso-screen-only">
      <div className="rh-slug">
        <Register />
        <Link to="/drafts" className="rh-name">Gentrit Rashiti</Link>
        <span className="rh-field rh-job"><span className="rh-key">Job</span>{pad(index + 1)}/{projects.length} {project.name}</span>
        <span className="rh-field rh-inks"><span className="rh-key">Inks</span><i className="rh-swatch rh-swatch--blue" />Blue 0078BF <i className="rh-swatch rh-swatch--pink" />Fluo pink FF48B0</span>
        <span className="rh-field rh-paper"><span className="rh-key">Stock</span>Natural 90 g/m² · {projects.length} posters, 2021–26</span>
      </div>
      <nav aria-label="Riso"><a href="#riso-contact">Contact<Arrow direction="down" /></a><Link to="/drafts">All drafts<Arrow /></Link></nav>
    </header>
    <main>
      <div className="rw">
        <div className="rw-poster">
          <Poster key={project.slug} ref={poster} project={project} number={index + 1} total={projects.length} plain={plain} feed={first} stamp={stamp} onPrint={print} />
        </div>
        <div className="rw-counter riso-screen-only">
          <button type="button" aria-label="Previous poster" onClick={() => step(-1)}><Arrow direction="left" /></button>
          <p><span className="rw-counter-label">Job</span><strong>{pad(index + 1)}</strong><span>/ {projects.length}</span></p>
          <button type="button" aria-label="Next poster" onClick={() => step(1)}><Arrow direction="right" /></button>
        </div>
        <aside className="rt riso-screen-only" aria-label={`Job ticket for ${project.name}`}>
          <p className="rt-summary">{project.summary}</p>
          <dl>
            <div><dt>Role</dt><dd>{project.role}</dd></div>
            <div><dt>Years</dt><dd>{project.years ?? 'Not listed'}</dd></div>
            <div><dt>Stack</dt><dd>{project.stack.join(', ')}</dd></div>
            <div><dt>Shelf</dt><dd>{channels[project.channel].number} {channels[project.channel].label}</dd></div>
          </dl>
          <div className="rt-actions">
            {project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow /></a>)}
            {featured && <a href="#riso-notes">Job notes<Arrow direction="down" /></a>}
            {hasImage && <button type="button" aria-pressed={plain} onClick={() => setPlain(value => !value)}>Original image</button>}
          </div>
        </aside>
        <section className="rs riso-screen-only" data-entered={entered || undefined} aria-label="Contact strip of all posters">
          <label className="rs-search"><span className="riso-sr-only">Find a poster by project, technology or shelf</span><input type="search" placeholder="Find a poster" value={query} onChange={event => setQuery(event.target.value)} /><span className="rs-count" aria-hidden="true">{visible.length}/{projects.length}</span></label>
          <div className="rs-strip" ref={strip} role="tablist" aria-label="Project posters" onKeyDown={roving}>
            {visible.map((item, order) => <Thumb key={item.slug} project={item} order={order} selected={item.slug === selected} onSelect={() => select(item.slug)} />)}
            {visible.length === 0 && <p className="rs-empty">No poster matches “{query}”.</p>}
          </div>
        </section>
      </div>
      <p className="riso-sr-only" role="status">{status}</p>
      <JobNotes project={project} />
      <section className="ra riso-screen-only" id="riso-contact" aria-labelledby="riso-contact-title">
        <div className="ra-flood ra-flood--pink" aria-hidden="true" /><div className="ra-flood ra-flood--blue" aria-hidden="true" />
        <div className="ra-body">
          <div>
            <h2 id="riso-contact-title">Gentrit<br />Rashiti</h2>
            <p>Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.</p>
            <p>5+ years. Part of two platform rewrites. React, React Native, Vue, TypeScript, Laravel. Based in Kosovo, working remotely.</p>
          </div>
          <div className="ra-contact">
            <a className="ra-mail" href={`mailto:${links.email}`}>{links.email}<Arrow /></a>
            <div><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noreferrer">GitHub<Arrow /></a><a href={links.cv} download>Download CV<Arrow direction="down" /></a></div>
          </div>
        </div>
      </section>
    </main>
    <footer className="rf riso-screen-only"><p>Printed in two inks, Blue 0078BF and Fluorescent Pink FF48B0, on natural stock. Every halftone is screened in the browser.</p><Link to="/drafts">All drafts<Arrow /></Link></footer>
  </div>
}
