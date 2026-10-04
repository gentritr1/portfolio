import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { transitionOldDraft } from '../../components/portfolio/oldDraftTransition'
import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent, KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { projects } from '../../content/projects'
import type { Project } from '../../content/projects'
import { links } from '../../content/links'
import { createProjectSound } from './projectSound'
import './savefile.css'

type Panel = 'projects' | 'about' | 'save'
type Save = { lastOpened: string; visited: string[] }
const saveKey = 'gentrit-savefile-v1'
const worlds = { healthcare: 'Healthcare', streaming: 'Streaming', reading: 'Mobile apps', web3: 'Web3', ai: 'Web & AI', personal: 'Personal' }
const firstProject = projects.find(project => project.slug === 'fjale')!

function Arrow({ back = false }: { back?: boolean }) {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="currentColor" style={back ? { transform: 'rotate(180deg)' } : undefined}><path d="M3 8h8V4h3v3h3v6h-3v3h-3v-4H3z" /></svg>
}

function readSave(): Save | null {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(saveKey) ?? 'null')
    if (!value || typeof value !== 'object' || !('lastOpened' in value) || !('visited' in value)) return null
    if (typeof value.lastOpened !== 'string' || !projects.some(project => project.slug === value.lastOpened) || !Array.isArray(value.visited)) return null
    return { lastOpened: value.lastOpened, visited: value.visited.filter((slug): slug is string => typeof slug === 'string' && projects.some(project => project.slug === slug)) }
  } catch { return null }
}

function WordDemo() {
  const [guess, setGuess] = useState('')
  const [attempts, setAttempts] = useState<string[]>([])
  const [message, setMessage] = useState('Hint: the Albanian word for “light”.')
  const answer = 'DRITË'
  const won = attempts.includes(answer)
  const over = won || attempts.length >= 4

  function submit(event: FormEvent) {
    event.preventDefault()
    const word = guess.trim().toLocaleUpperCase('sq')
    if (word.length !== 5 || !/^[A-ZÇË]+$/.test(word)) { setMessage('Enter five letters. Ë and Ç are supported.'); return }
    const next = [...attempts, word]
    setAttempts(next); setGuess('')
    setMessage(word === answer ? 'Correct: DRITË means light.' : next.length === 4 ? 'The word was DRITË. Play again to try a new approach.' : 'Green: right position. Orange: another position. Blue: not in the word.')
  }

  function colors(word: string) {
    const result = Array<string>(5).fill('absent')
    const remaining = answer.split('')
    word.split('').forEach((letter, index) => { if (letter === answer[index]) { result[index] = 'correct'; remaining[index] = '' } })
    word.split('').forEach((letter, index) => { if (result[index] === 'correct') return; const found = remaining.indexOf(letter); if (found >= 0) { result[index] = 'present'; remaining[found] = '' } })
    return result
  }

  const shownWord = attempts.at(-1) ?? 'FJALË'
  const shownColors = attempts.length ? colors(shownWord) : Array<string>(5).fill('title')
  return <div className="savefile-demo">
    <div className="savefile-word" aria-label={attempts.length ? `Latest guess: ${shownWord}. ${shownColors.join(', ')}` : 'FJALË'}>{shownWord.split('').map((letter, index) => <span className={`is-${shownColors[index]}`} key={index}>{letter}</span>)}</div>
    <div className="savefile-demo-label"><strong>Mini demo</strong><span>{attempts.length}/4 guesses</span></div>
    <p className="savefile-demo-message" role="status">{message}</p>
    {!over ? <form onSubmit={submit}><label className="savefile-sr-only" htmlFor="savefile-guess">Five-letter guess</label><input id="savefile-guess" value={guess} onChange={event => setGuess(event.target.value.toLocaleUpperCase('sq').slice(0, 5))} placeholder="5 letters" autoComplete="off" spellCheck={false} maxLength={5} /><button type="submit" aria-label="Submit guess"><Arrow /></button><button type="button" className="savefile-accent-key" aria-label="Add Ë to guess" onClick={() => setGuess(value => `${value}Ë`.slice(0, 5))}>Ë</button></form> : <button className="savefile-demo-reset" type="button" onClick={() => { setAttempts([]); setGuess(''); setMessage('Hint: the Albanian word for “light”.') }}>Play again <Arrow /></button>}
    <p className="savefile-demo-note">A small portfolio demo. The full game has a daily word, a dictionary and an archive.</p>
  </div>
}

function ProjectView({ project, onVisit, visited }: { project: Project; onVisit: (slug: string) => void; visited: boolean }) {
  const [view, setView] = useState<'preview' | 'case' | 'screen'>('preview')
  const image = project.media.galleries?.[0]?.items[0] ?? project.media.shot
  const isFjale = project.slug === 'fjale'

  function openCase() { transitionOldDraft(() => setView('case')); onVisit(project.slug) }
  return <article id="savefile-project-panel" tabIndex={-1} className="savefile-project" aria-label={`${project.name} project`}>
    <div className="savefile-project-top"><span>{worlds[project.channel]}</span><span>{project.years ?? project.role}</span></div>
    <h2>{project.name}</h2>
    {view === 'preview' && (isFjale ? <WordDemo /> : image ? <figure className="savefile-project-shot"><img src={image.src} alt={image.alt} /><figcaption>Public product screenshot</figcaption></figure> : <p className="savefile-project-summary">{project.summary}</p>)}
    {view === 'case' && <div className="savefile-case-copy"><OldCareFile slug={project.slug} /><h3>{isFjale ? 'A daily word, in Albanian.' : project.kind}</h3><p>{project.summary}</p><dl><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Technology</dt><dd>{project.stack.join(', ')}</dd></div>{isFjale && <><div><dt>Dictionary</dt><dd>21,000 words</dd></div><div><dt>Play</dt><dd>Daily puzzles, archive, offline support</dd></div></>}</dl>{isFjale && <p>Vanilla JavaScript keeps the game in the browser. The progressive web app can be installed, with an Albanian keyboard, hints and earlier daily puzzles available to replay.</p>}</div>}
    {view === 'screen' && image && <figure className="savefile-project-shot"><img src={image.src} alt={image.alt} /><figcaption>{isFjale ? 'The actual FJALË website' : 'Public product screenshot'}</figcaption></figure>}
    <div className="savefile-project-actions">{view !== 'case' ? <button type="button" className="savefile-action" onClick={openCase}>Read project<Arrow /></button> : <button type="button" className="savefile-action" onClick={() => transitionOldDraft(() => setView('preview'))}><Arrow back />Back to {isFjale ? 'demo' : 'preview'}</button>}{image && <button type="button" className="savefile-screen-toggle" onClick={() => transitionOldDraft(() => setView(view === 'screen' ? 'preview' : 'screen'))}>{view === 'screen' ? 'Back' : 'Real screen'}</button>}</div>
    <div className="savefile-public-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer" onClick={() => onVisit(project.slug)}>{isFjale ? 'Play the full game' : link.label}<Arrow /></a>)}</div>
    {visited && <p className="savefile-visited-note">Opened on this device</p>}
  </article>
}

export default function Draft() {
  const [selected, setSelected] = useState(firstProject.slug)
  const [panel, setPanel] = useState<Panel>('projects')
  const [save, setSave] = useState<Save | null>(readSave)
  const [saveMessage, setSaveMessage] = useState('')
  const [query, setQuery] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const sound = useRef<ReturnType<typeof createProjectSound> | null>(null)
  const levelGrid = useRef<HTMLDivElement>(null)
  const project = projects.find(item => item.slug === selected) ?? firstProject
  const visible = projects.filter(item => `${item.name} ${item.kind} ${item.stack.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))

  useEffect(() => () => { sound.current?.dispose(); sound.current = null }, [])

  function toggleSound() {
    if (soundEnabled) { sound.current?.stop(); setSoundEnabled(false); return }
    sound.current ??= createProjectSound()
    setSoundEnabled(sound.current.unlock())
  }

  function focusMobilePreview() {
    if (!matchMedia('(max-width: 700px)').matches) return
    requestAnimationFrame(() => {
      const preview = document.querySelector<HTMLElement>('.draft-savefile #savefile-project-panel')
      preview?.focus({ preventScroll: true })
      preview?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
  }

  function chooseProject(slug: string) { transitionOldDraft(() => setSelected(slug)); focusMobilePreview(); if (soundEnabled) sound.current?.play() }

  function showProjectSelector() {
    setPanel('projects')
    requestAnimationFrame(() => {
      const selector = document.querySelector<HTMLElement>('.draft-savefile #savefile-select-title')
      selector?.focus({ preventScroll: true })
      selector?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
  }

  function saveVisit(slug: string) {
    const next = { lastOpened: slug, visited: Array.from(new Set([...(save?.visited ?? []), slug])) }
    setSave(next)
    try { localStorage.setItem(saveKey, JSON.stringify(next)); setSaveMessage('Your place is saved on this device.') } catch { setSaveMessage('Your browser could not save this visit. It is remembered for this session.') }
  }

  function levelKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const columns = matchMedia('(max-width: 700px)').matches ? 4 : 7
    let next = index
    if (event.key === 'ArrowRight') next++
    else if (event.key === 'ArrowLeft') next--
    else if (event.key === 'ArrowDown') next += columns
    else if (event.key === 'ArrowUp') next -= columns
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = visible.length - 1
    else return
    event.preventDefault()
    const target = visible[Math.max(0, Math.min(next, visible.length - 1))]
    if (target) { setSelected(target.slug); levelGrid.current?.querySelector<HTMLButtonElement>(`[data-project="${target.slug}"]`)?.focus() }
  }

  function continueSave() { if (save) { setSelected(save.lastOpened); setQuery(''); setPanel('projects'); focusMobilePreview() } }

  function clearSave() {
    try { localStorage.removeItem(saveKey); setSave(null); setSaveMessage('Local save cleared.') } catch { setSaveMessage('Your browser could not clear the saved data. Try its site-storage settings.') }
  }

  return <div className="draft-savefile">
      <OldDraftMotion />
    <header className="savefile-header"><Link to="/drafts" className="savefile-logo">SAVE FILE</Link><nav aria-label="Save File navigation"><button type="button" aria-pressed={panel === 'projects'} onClick={showProjectSelector}>Projects <span>{projects.length}</span></button><button type="button" aria-pressed={panel === 'about'} onClick={() => setPanel('about')}>About / Contact</button><button type="button" aria-pressed={panel === 'save'} onClick={() => setPanel('save')}>Your save</button><button type="button" aria-pressed={soundEnabled} onClick={toggleSound}>Sound {soundEnabled ? 'on' : 'off'}</button></nav><Link className="savefile-back" to="/drafts">All drafts <Arrow /></Link></header>
    <main>
      <div className="savefile-identity"><h1>GENTRIT <span>RASHITI</span></h1><div><p>Frontend & mobile developer. Now full stack.</p><span>Kosovo · Working remotely</span></div></div>
      {panel === 'projects' && <div className="savefile-playfield"><section className="savefile-level-select" aria-labelledby="savefile-select-title"><div className="savefile-select-header"><h2 id="savefile-select-title" tabIndex={-1}>SELECT PROJECT</h2><label><span className="savefile-sr-only">Find a project or technology</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a project" /></label></div><div className="savefile-level-grid" ref={levelGrid} aria-label="Project levels">{visible.map((item, index) => <button key={item.slug} type="button" data-project={item.slug} data-world={item.channel} aria-pressed={selected === item.slug} onClick={() => chooseProject(item.slug)} onKeyDown={event => levelKeys(event, index)} style={{ '--level-delay': `${Math.floor(index / 7) * 100}ms` } as CSSProperties}><span className="savefile-level-number">{String(projects.indexOf(item) + 1).padStart(2, '0')}</span><span className="savefile-level-name">{item.name}</span>{selected === item.slug && <span className="savefile-selection-arrow"><Arrow /></span>}{save?.visited.includes(item.slug) && <span className="savefile-seen" aria-label="Opened on this device" />}</button>)}</div>{visible.length === 0 && <p className="savefile-no-results">No project matches. Try “React” or “Bayyinah”.</p>}<div className="savefile-controls"><span>Arrow keys to select. Enter to choose.</span><span>{visible.length} projects</span></div><div className="savefile-selected-name" aria-live="polite"><span>{worlds[project.channel]}</span><strong>{project.name}</strong><p>{project.kind}</p></div></section><ProjectView key={project.slug} project={project} onVisit={saveVisit} visited={save?.visited.includes(project.slug) ?? false} /></div>}
      {panel === 'about' && <section className="savefile-about"><div><h2>MEET THE<br />DEVELOPER.</h2><p>Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.</p><p>5+ years. Part of two platform rewrites. React, React Native, Vue, TypeScript and Laravel.</p><a className="savefile-action" href={links.cv} download>Download CV<Arrow /></a></div><div className="savefile-contact"><h3>LET’S TALK.</h3><a href={`mailto:${links.email}`}>{links.email}<Arrow /></a><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noreferrer">GitHub<Arrow /></a><p>Based in Kosovo.<br />Working remotely.</p></div></section>}
      {panel === 'save' && <section className="savefile-save-screen"><div className="savefile-save-symbol" aria-hidden="true"><svg viewBox="0 0 64 64" fill="currentColor"><path d="M8 4h44l8 8v48H4V4h4zm8 0v20h32V4H16zm-4 32v20h40V36H12zm24-28h8v12h-8V8z" /></svg></div><div><h2>{save ? 'WELCOME BACK.' : 'A FRESH SAVE.'}</h2>{save ? <><p>Last opened: <strong>{projects.find(item => item.slug === save.lastOpened)?.name}</strong></p><p>{save.visited.length} {save.visited.length === 1 ? 'project' : 'projects'} opened on this device.</p><button type="button" className="savefile-action" onClick={continueSave}>Continue exploring<Arrow /></button><button className="savefile-clear" type="button" onClick={clearSave}>Clear local save</button></> : <><p>Read a project or open its public link to save your place.</p><button type="button" className="savefile-action" onClick={() => setPanel('projects')}>Choose a project<Arrow /></button></>}<p className="savefile-save-explainer">Only the last opened project and your visited projects are saved in this browser. No accounts, scores or completion claims.</p><p role="status">{saveMessage}</p></div></section>}
    </main>
    <footer className="savefile-footer"><span>28 projects. Pick your next one.</span><a href={links.cv} download>Download CV <Arrow /></a><a href={`mailto:${links.email}`}>Say hello <Arrow /></a></footer>
  </div>
}
