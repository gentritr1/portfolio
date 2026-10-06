import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { transitionOldDraft } from '../../components/portfolio/oldDraftTransition'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { projects, currentYear, firstYear } from '../../content/projects'
import { caseNarratives } from '../../content/caseNarratives'
import { links } from '../../content/links'
import DitherImage from './DitherImage'
import CareDemo from './CareDemo'
import './dither.css'

const selected = [
  { slug: 'care-platform', short: 'Care platform', image: '/signal-posters/healthcare.avif', alt: 'Care-management interface recreation with invented data', source: 'Recreation · invented data' },
  { slug: 'bayyinah-tv', short: 'Bayyinah TV', image: '/showcase/bayyinah/store-02.webp', alt: 'Bayyinah TV public App Store frame', source: 'Public App Store frame' },
  { slug: 'read-to-feed', short: 'Read to Feed', image: '/mobile/reading-1.webp', alt: 'Read to Feed public store frame', source: 'Public store frame' },
].map((art) => ({ ...art, project: projects.find((project) => project.slug === art.slug)! }))
const care = caseNarratives['care-platform']!

function Arrow() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12h15M12 5l7 7-7 7" /></svg>
}

export default function Draft() {
  const [active, setActive] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [allColour, setAllColour] = useState(false)
  const [query, setQuery] = useState('')
  const tabButtons = useRef<(HTMLButtonElement | null)[]>([])
  const rows = projects.filter((project) => `${project.name} ${project.stack.join(' ')} ${project.group}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const current = selected[active]

  useEffect(() => {
    const timer = window.setTimeout(() => setRevealed(true), 350)
    return () => window.clearTimeout(timer)
  }, [])

  function select(index: number) { transitionOldDraft(() => { setActive(index); setRevealed(true) }) }
  function moveSelection(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % selected.length
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + selected.length - 1) % selected.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = selected.length - 1
    else return
    event.preventDefault()
    select(next)
    tabButtons.current[next]?.focus()
  }

  return <div className="draft-dither">
      <OldDraftMotion />
    <title>Work in colour — Gentrit Rashiti</title>
    <header className="dd-header"><a href="/drafts">Gentrit Rashiti</a><nav aria-label="Portfolio navigation"><a href="#dd-work">All {projects.length}</a><a href="#dd-about">About</a><a href={links.cv} download>CV <Arrow /></a></nav></header>
    <main>
      <section className="dd-cover" aria-labelledby="dd-title">
        <div className="dd-title-block"><h1 id="dd-title"><span>Gentrit</span> <span>Rashiti.</span></h1><div className="dd-intro"><p>Frontend & mobile developer,<br />now full stack.</p><p>Kosovo · Remote<br />{firstYear}—{currentYear}</p><button type="button" aria-pressed={allColour} onClick={() => setAllColour(!allColour)}>{allColour ? 'Restore the dots' : 'Show all in colour'}<Arrow /></button></div></div>
        <div className="dd-plates" role="tablist" aria-label="Selected projects. Arrow keys change the colour preview.">
          {selected.map((item, index) => <button className="dd-plate" type="button" role="tab" id={`dd-tab-${index}`} aria-controls="dd-selection" aria-selected={index === active} tabIndex={index === active ? 0 : -1} key={item.slug} data-selected={index === active} ref={(node) => { tabButtons.current[index] = node }} onClick={() => select(index)} onKeyDown={(event) => moveSelection(event, index)}>
            <DitherImage src={item.image} alt={item.alt} name={item.short} colour={allColour || item.slug === 'bayyinah-tv' || (revealed && index === active)} />
            <span className="dd-plate-label"><strong>{item.short}</strong><span>{item.source}</span></span>
          </button>)}
        </div>
        <div className="dd-selection" id="dd-selection" role="tabpanel" aria-labelledby={`dd-tab-${active}`}><div><h2>{current.project.name}</h2><p>{current.project.kind} · {current.project.years}</p></div><p>{current.project.line}</p><a href={current.slug === 'care-platform' ? '#dd-care' : `/work/${current.slug}`}>Read the case<Arrow /></a></div>
      </section>

      <article id="dd-care" className="dd-case" aria-labelledby="dd-case-title">
        <div className="dd-case-heading"><h2 id="dd-case-title">Care,<br />continued.</h2><div><p>{care.story.product}</p><dl><div><dt>Role</dt><dd>Frontend and mobile, full stack since 2026</dd></div><div><dt>Years</dt><dd>2023–26</dd></div></dl></div></div>
        <OldCareFile slug="care-platform" /><div className="dd-case-demo"><CareDemo /><div><h3>A working interface.<br />A careful rewrite.</h3><p>{care.story.built}</p><p>{care.story.result}</p><p className="dd-source-note">The product is private. The visual above and the interactive example are recreations with invented data.</p></div></div>
      </article>

      <section id="dd-work" className="dd-work" aria-labelledby="dd-work-title"><div className="dd-work-heading"><h2 id="dd-work-title">All the work.</h2><p>{projects.length} projects · {firstYear}—{currentYear}</p></div>
        <div className="dd-search"><label htmlFor="dd-search">Find a project or technology</label><input id="dd-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Project, React, Laravel…" /><p role="status">{rows.length} {rows.length === 1 ? 'project' : 'projects'}</p></div>
        <div className="dd-projects">{rows.map((project) => <details key={project.slug}><summary><span>{project.name}</span><span>{project.years ?? '—'}</span><Arrow /></summary><div className="dd-project-body"><OldCareFile slug={project.slug} /><p>{project.summary}</p><dl><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Stack</dt><dd>{project.stack.join(' · ')}</dd></div></dl><div className="dd-project-links">{project.slug === 'care-platform' && <a href="#dd-care">Read the featured case<Arrow /></a>}{project.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /><span className="dd-sr"> (opens in a new tab)</span></a>)}</div></div></details>)}</div>
        {!rows.length && <p className="dd-empty">No projects match “{query}”. <button type="button" onClick={() => setQuery('')}>Show all projects</button></p>}
      </section>

      <section className="dd-about" id="dd-about" aria-labelledby="dd-about-title"><h2 id="dd-about-title">From screen<br />to release.</h2><div className="dd-about-body"><p>Gentrit Rashiti. Five-plus years building web and mobile products, including two platform rewrites.</p><p>React, Next.js, Vue and Nuxt on the web. React Native on iOS and Android. Laravel and FastAPI behind the interface.</p><p>Based in Kosovo, working remotely.<br />Bachelor’s degree · UBT.</p><nav aria-label="Contact and profile"><a href={links.cv} download>Download CV<Arrow /></a><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<Arrow /><span className="dd-sr"> (opens in a new tab)</span></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow /><span className="dd-sr"> (opens in a new tab)</span></a></nav></div><a className="dd-email" href={`mailto:${links.email}`}>{links.email}<Arrow /></a></section>
    </main><footer className="dd-footer"><a href="/drafts">All art directions</a><span>Gentrit Rashiti · {currentYear}</span><a href="#dd-title">Back to top<Arrow /></a></footer>
  </div>
}
