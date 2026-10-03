import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent, ReactNode } from 'react'
import { Link } from 'react-router'
import { projects } from '../../content/projects'
import type { Project } from '../../content/projects'
import { links } from '../../content/links'
import './desktop.css'

type IconName = 'apps' | 'about' | 'contact' | 'cv' | 'healthcare' | 'streaming' | 'reading' | 'web3' | 'ai' | 'personal' | 'close' | 'minimize' | 'maximize' | 'arrow' | 'search' | 'help'
type WindowState = { id: string; order: number; minimized: boolean }
type Point = { x: number; y: number }

const utilityTitles: Record<string, string> = { apps: 'All projects', about: 'About Gentrit', contact: 'Contact', cv: 'Curriculum vitae', help: 'Desktop controls' }
const categories = ['All', 'Healthcare', 'Streaming', 'Mobile', 'Web3', 'Web & AI', 'Personal']
const categoryFor = { healthcare: 'Healthcare', streaming: 'Streaming', reading: 'Mobile', web3: 'Web3', ai: 'Web & AI', personal: 'Personal' }
const pinnedSlugs = ['bayyinah-tv', 'read-to-feed', 'care-platform', 'incentiv']
const dockItems = [
  { id: 'apps', label: 'Projects', icon: 'apps' },
  { id: 'incentiv', label: 'Incentiv', icon: 'web3' },
  { id: 'bayyinah-tv', label: 'Bayyinah', icon: 'streaming' },
  { id: 'about', label: 'About', icon: 'about' },
  { id: 'contact', label: 'Contact', icon: 'contact' },
  { id: 'cv', label: 'CV', icon: 'cv' },
] as const

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    apps: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="3" width="6" height="6" rx="1" /><rect x="3" y="15" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /></>,
    about: <><circle cx="12" cy="8" r="4" /><path d="M4 22v-3a8 8 0 0 1 16 0v3" /></>,
    contact: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m3 6 9 7 9-7" /></>,
    cv: <><path d="M14 2H5v20h14V7zM14 2v6h5M8 12h8M8 16h8" /></>,
    healthcare: <path d="M2 12h5l3-8 4 16 3-8h5" />,
    streaming: <><rect x="2" y="5" width="20" height="15" rx="3" /><path d="m9 9 6 4-6 4zM7 2l5 3 5-3" /></>,
    reading: <><path d="M12 5C9 2 5 2 2 3v17c3-1 7-1 10 2 3-3 7-3 10-2V3c-3-1-7-1-10 2zm0 0v17" /></>,
    web3: <><path d="m12 2 9 5v10l-9 5-9-5V7zM3 7l9 5 9-5M12 12v10M8 5l9 5" /></>,
    ai: <><rect x="2" y="3" width="20" height="16" rx="2" /><path d="M8 23h8M12 19v4M6 8h4M6 12h8" /></>,
    personal: <><path d="M7 6h10c3 0 5 3 5 7v4c0 3-3 4-5 1l-1-2H8l-1 2c-2 3-5 2-5-1v-4c0-4 2-7 5-7zM7 9v5M4.5 11.5h5" /><circle cx="16" cy="10" r=".5" /><circle cx="19" cy="13" r=".5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    minimize: <path d="M5 16h14" />,
    maximize: <rect x="5" y="5" width="14" height="14" rx="1" />,
    arrow: <path d="M5 19 19 5M5 5h14v14" />,
    search: <><circle cx="10" cy="10" r="7" /><path d="m15 15 7 7" /></>,
    help: <><circle cx="12" cy="12" r="10" /><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17v.1" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function AppIcon({ icon, large = false }: { icon: IconName; large?: boolean }) {
  return <span className={`desktop-app-icon desktop-app-icon--${icon}${large ? ' desktop-app-icon--large' : ''}`}><Icon name={icon} size={large ? 35 : 26} /></span>
}

function PublicLinks({ project }: { project: Project }) {
  return <div className="desktop-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<Icon name="arrow" size={16} /></a>)}</div>
}

function ProjectApp({ project }: { project: Project }) {
  const [tab, setTab] = useState<'overview' | 'screens' | 'details'>('overview')
  const [screen, setScreen] = useState(0)
  const shots = project.media.galleries?.flatMap(gallery => gallery.items) ?? []
  const isIncentiv = project.slug === 'incentiv'
  const image = shots[screen] ?? project.media.shot

  return <div className="desktop-project-app">
    <nav className="desktop-app-tabs" aria-label={`${project.name} views`}>
      <button type="button" aria-pressed={tab === 'overview'} onClick={() => setTab('overview')}>Overview</button>
      {shots.length > 0 && <button type="button" aria-pressed={tab === 'screens'} onClick={() => setTab('screens')}>Public screens <span>{shots.length}</span></button>}
      <button type="button" aria-pressed={tab === 'details'} onClick={() => setTab('details')}>Details</button>
    </nav>
    {tab === 'overview' && <>
      <div className="desktop-project-heading"><div><h2>{project.name}</h2><p>{project.kind}</p></div><span>{project.years}</span></div>
      {image && <button className={`desktop-project-image${isIncentiv ? ' desktop-project-image--incentiv' : ''}`} type="button" onClick={() => shots.length > 0 && setTab('screens')} aria-label={`View ${project.name} public screenshots`} disabled={!shots.length}><img src={image.src} alt={image.alt} /></button>}
      <div className="desktop-project-copy">
        <h3>{isIncentiv ? 'The frontend of a smart wallet.' : project.line}</h3>
        <p>{isIncentiv ? 'Passkey sign-in, animated onboarding and a wallet dashboard, in English and French. Frontend and UI layer; teammates built the wallet and blockchain layer.' : project.summary}</p>
        <PublicLinks project={project} />
      </div>
    </>}
    {tab === 'screens' && <div className="desktop-screens">
      <div className="desktop-screen-picker" aria-label="Choose a public screenshot">{shots.map((shot, index) => <button key={shot.src} type="button" aria-pressed={screen === index} onClick={() => setScreen(index)}>{shot.caption}</button>)}</div>
      {image && <figure><img src={image.src} alt={image.alt} /><figcaption>{shots[screen]?.caption} · Public {shots[screen]?.src.includes('/mobile/') ? 'store listing' : 'website'}</figcaption></figure>}
      <PublicLinks project={project} />
    </div>}
    {tab === 'details' && <div className="desktop-project-copy desktop-project-details">
      <h2>{isIncentiv ? 'What went into the interface.' : project.name}</h2>
      <p>{project.summary}</p>
      <dl><div><dt>Role</dt><dd>{project.role}</dd></div>{project.years && <div><dt>Years</dt><dd>{project.years}</dd></div>}<div><dt>Technology</dt><dd>{project.stack.join(', ')}</dd></div>{isIncentiv && <div><dt>Languages</dt><dd>English, French</dd></div>}</dl>
      {isIncentiv && <><h3>From sign-in to the dashboard</h3><p>Next.js 14 App Router and RTK Query connect the interface: passkey and wallet sign-in, dashboard cards, an asset list, a balance popup with a QR address, and public and private route middleware. Framer Motion powers the onboarding, with next-intl handling the translations.</p></>}
      <PublicLinks project={project} />
    </div>}
  </div>
}

function ProjectFinder({ onOpen }: { onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const visible = projects.filter(project => (category === 'All' || categoryFor[project.channel] === category) && `${project.name} ${project.kind} ${project.stack.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))
  return <div className="desktop-finder">
    <label className="desktop-search"><Icon name="search" /><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a project or technology" aria-label="Search all projects" autoFocus /></label>
    <div className="desktop-finder-categories" aria-label="Filter projects">{categories.map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <p className="desktop-result-count" role="status">{visible.length} of {projects.length} projects</p>
    <div className="desktop-project-list">{visible.map(project => <button key={project.slug} type="button" onClick={() => onOpen(project.slug)}><AppIcon icon={project.channel} /><span><strong>{project.name}</strong><small>{project.kind}</small></span><span className="desktop-list-year">{project.years}</span><Icon name="arrow" size={17} /></button>)}</div>
    {visible.length === 0 && <p className="desktop-empty">No projects match. Try a name such as “Bayyinah” or a technology such as “React”.</p>}
  </div>
}

function UtilityApp({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  if (id === 'apps') return <ProjectFinder onOpen={onOpen} />
  if (id === 'about') return <div className="desktop-document"><h2>Gentrit<br />Rashiti.</h2><p className="desktop-document-lead">Frontend & mobile developer,<br />now full stack.</p><p>Web and mobile products, from the first screen to release: healthcare, video streaming, e-reading and Web3.</p><p>5+ years. Part of two platform rewrites. Based in Kosovo, working remotely.</p><dl><div><dt>Frontend</dt><dd>React, Next.js, Vue, Nuxt, TypeScript</dd></div><div><dt>Mobile</dt><dd>React Native, iOS and Android</dd></div><div><dt>Backend</dt><dd>Laravel, PHP, FastAPI, MySQL, Redis</dd></div><div><dt>Quality</dt><dd>Playwright, Vitest, Pest, CI/CD</dd></div></dl><div className="desktop-links"><button type="button" onClick={() => onOpen('contact')}>Contact<Icon name="arrow" size={16} /></button><button type="button" onClick={() => onOpen('cv')}>View CV<Icon name="arrow" size={16} /></button></div></div>
  if (id === 'contact') return <div className="desktop-document desktop-contact"><Icon name="contact" size={56} /><h2>Say hello.</h2><p>Based in Kosovo.<br />Working remotely.</p><a className="desktop-contact-email" href={`mailto:${links.email}`}>{links.email}<Icon name="arrow" /></a><div className="desktop-links"><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Icon name="arrow" size={16} /></a><a href={links.github} target="_blank" rel="noreferrer">GitHub<Icon name="arrow" size={16} /></a></div></div>
  if (id === 'cv') return <div className="desktop-document"><Icon name="cv" size={54} /><h2>Curriculum<br />vitae.</h2><p className="desktop-document-lead">Gentrit Rashiti</p><p>Frontend and mobile development, platform rewrites, and full-stack work. Experience, skills and education in one document.</p><a className="desktop-primary-link" href={links.cv} download>Download CV <Icon name="arrow" size={18} /></a><a className="desktop-text-link" href={links.cv} target="_blank" rel="noreferrer">Open PDF in a new tab</a></div>
  return <div className="desktop-document"><h2>Make yourself<br />at home.</h2><p>Open a project from the desktop or the dock. Drag its title bar to move the window. The three buttons minimize, expand and close it.</p><dl><div><dt>Find a project</dt><dd><kbd>Ctrl / ⌘</kbd> + <kbd>K</kbd></dd></div><div><dt>Move a window</dt><dd>Focus its title, then use the arrow keys. Hold Shift for a larger step.</dd></div><div><dt>Next window</dt><dd><kbd>Alt</kbd> + <kbd>`</kbd></dd></div><div><dt>Close a window</dt><dd><kbd>Escape</kbd> while its contents are focused.</dd></div><div><dt>Restore</dt><dd>Select the app in the dock or the open-windows menu.</dd></div></dl><p>On a phone, one window is shown at a time. The dock and open-windows menu switch between them.</p></div>
}

function DesktopWindow({ window, active, initial, onFocus, onClose, onMinimize, onOpen }: {
  window: WindowState; active: boolean; initial: boolean; onFocus: (id: string) => void; onClose: (id: string) => void; onMinimize: (id: string) => void; onOpen: (id: string) => void
}) {
  const frame = useRef<HTMLElement>(null)
  const drag = useRef<{ pointer: number; cursor: Point; origin: Point } | null>(null)
  const [position, setPosition] = useState<Point | null>(null)
  const [maximized, setMaximized] = useState(false)
  const [dragging, setDragging] = useState(false)
  const project = projects.find(item => item.slug === window.id)
  const title = project?.name ?? utilityTitles[window.id]

  function bounded(point: Point) {
    const element = frame.current
    const parent = element?.parentElement
    if (!element || !parent) return point
    return { x: Math.max(8, Math.min(point.x, parent.clientWidth - element.offsetWidth - 8)), y: Math.max(8, Math.min(point.y, parent.clientHeight - element.offsetHeight - 8)) }
  }

  useEffect(() => {
    const element = frame.current
    const parent = element?.parentElement
    if (!element || !parent) return
    const observer = new ResizeObserver(() => {
      setPosition(current => bounded(current ?? { x: project ? parent.clientWidth * .44 : parent.clientWidth * .27, y: project ? 56 : 96 }))
    })
    observer.observe(parent)
    return () => observer.disconnect()
  }, [project])

  function startDrag(event: PointerEvent<HTMLButtonElement>) {
    if (event.button !== 0 || maximized || matchMedia('(max-width: 700px)').matches) return
    const element = frame.current
    if (!element) return
    drag.current = { pointer: event.pointerId, cursor: { x: event.clientX, y: event.clientY }, origin: position ?? { x: element.offsetLeft, y: element.offsetTop } }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragging(true)
  }

  function moveDrag(event: PointerEvent<HTMLButtonElement>) {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) return
    setPosition(bounded({ x: current.origin.x + event.clientX - current.cursor.x, y: current.origin.y + event.clientY - current.cursor.y }))
  }

  function endDrag() { drag.current = null; setDragging(false) }

  function moveKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) || maximized || matchMedia('(max-width: 700px)').matches) return
    event.preventDefault()
    const step = event.shiftKey ? 64 : 16
    const current = position ?? { x: 16, y: 16 }
    setPosition(bounded({ x: current.x + (event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0), y: current.y + (event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0) }))
  }

  const style = { '--window-x': `${position?.x ?? 0}px`, '--window-y': `${position?.y ?? 0}px`, zIndex: window.order } as CSSProperties
  return <section ref={frame} id={`desktop-window-${window.id}`} className={`desktop-window${project ? ' desktop-window--project' : ''}${active ? ' is-active' : ''}${initial ? ' is-opening' : ''}${dragging ? ' is-dragging' : ''}${maximized ? ' is-maximized' : ''}`} style={style} hidden={window.minimized} aria-label={`${title} window`} onPointerDownCapture={() => onFocus(window.id)} onFocusCapture={() => onFocus(window.id)} onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); onClose(window.id) } }}>
    <header className="desktop-window-bar"><button type="button" className="desktop-window-title" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={moveKey} onDoubleClick={() => setMaximized(value => !value)} aria-label={`${title}. Drag or use arrow keys to move the window.`}><Icon name={project?.channel ?? (window.id as IconName)} size={18} /><span>{title}</span></button><div className="desktop-window-controls"><button type="button" aria-label={`Minimize ${title}`} onClick={() => onMinimize(window.id)}><Icon name="minimize" size={17} /></button><button type="button" className="desktop-maximize" aria-label={`${maximized ? 'Restore size of' : 'Expand'} ${title}`} aria-pressed={maximized} onClick={() => setMaximized(value => !value)}><Icon name="maximize" size={15} /></button><button type="button" aria-label={`Close ${title}`} onClick={() => onClose(window.id)}><Icon name="close" size={18} /></button></div></header>
    <div className="desktop-window-body">{project ? <ProjectApp project={project} /> : <UtilityApp id={window.id} onOpen={onOpen} />}</div>
  </section>
}

export default function Draft() {
  const root = useRef<HTMLDivElement>(null)
  const openers = useRef(new Map<string, HTMLElement>())
  const [windows, setWindows] = useState<WindowState[]>([{ id: 'incentiv', order: 1, minimized: false }])
  const [windowMenu, setWindowMenu] = useState(false)
  const [opening, setOpening] = useState(true)
  const visibleWindows = windows.filter(window => !window.minimized)
  const activeWindow = visibleWindows.reduce<WindowState | undefined>((active, window) => !active || window.order > active.order ? window : active, undefined)

  useEffect(() => { const timer = globalThis.setTimeout(() => setOpening(false), 1200); return () => globalThis.clearTimeout(timer) }, [])

  function focusWindow(id: string) {
    setWindows(current => {
      const highest = Math.max(...current.filter(window => !window.minimized).map(window => window.order))
      if (current.find(window => window.id === id)?.order === highest) return current
      return current.map(window => window.id === id ? { ...window, order: Math.max(...current.map(item => item.order)) + 1 } : window)
    })
  }

  function openWindow(id: string) {
    if (document.activeElement instanceof HTMLElement) openers.current.set(id, document.activeElement)
    setWindows(current => {
      const nextOrder = Math.max(0, ...current.map(window => window.order)) + 1
      return current.some(window => window.id === id) ? current.map(window => window.id === id ? { ...window, minimized: false, order: nextOrder } : window) : [...current, { id, minimized: false, order: nextOrder }]
    })
    setWindowMenu(false)
    requestAnimationFrame(() => root.current?.querySelector<HTMLElement>(`#desktop-window-${id} ${id === 'apps' ? 'input' : '.desktop-window-title'}`)?.focus())
  }

  function restoreFocus(id: string) {
    requestAnimationFrame(() => {
      const opener = openers.current.get(id)
      const openerWindow = opener?.closest<HTMLElement>('.desktop-window')
      const validOpener = opener?.isConnected && (!openerWindow || (!openerWindow.hidden && (!matchMedia('(max-width: 700px)').matches || openerWindow.classList.contains('is-active'))))
      if (validOpener) opener.focus()
      else {
        const dock = root.current?.querySelector<HTMLButtonElement>(`.desktop-dock [data-open="${id}"]`) ?? root.current?.querySelector<HTMLButtonElement>('.desktop-dock [data-open="apps"]')
        dock?.focus()
      }
    })
  }

  function closeWindow(id: string) { setWindows(current => current.filter(window => window.id !== id)); restoreFocus(id) }
  function minimizeWindow(id: string) { setWindows(current => current.map(window => window.id === id ? { ...window, minimized: true } : window)); restoreFocus(id) }

  function desktopKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape' && windowMenu) { setWindowMenu(false); return }
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openWindow('apps') }
    if (event.altKey && event.code === 'Backquote' && visibleWindows.length > 1) {
      event.preventDefault()
      const sorted = visibleWindows.toSorted((a, b) => a.order - b.order)
      openWindow(sorted[0].id)
    }
  }

  return <div ref={root} className="draft-desktop" onKeyDown={desktopKeys}>
    <header className="desktop-menubar"><Link className="desktop-brand" to="/drafts" aria-label="Back to draft gallery">gr.</Link><button type="button" onClick={() => openWindow('apps')}>Projects <span>{projects.length}</span></button><button type="button" onClick={() => openWindow('about')}>About</button><div className="desktop-menubar-spacer" /><div className="desktop-open-menu"><button type="button" aria-expanded={windowMenu} aria-controls="desktop-window-menu" onClick={() => setWindowMenu(value => !value)}>Windows <span>{windows.length}</span></button>{windowMenu && <div id="desktop-window-menu" className="desktop-window-menu"><strong>Open windows</strong>{windows.length ? windows.toSorted((a, b) => b.order - a.order).map(window => <button key={window.id} type="button" onClick={() => openWindow(window.id)}>{projects.find(project => project.slug === window.id)?.name ?? utilityTitles[window.id]}<small>{window.minimized ? 'Minimized' : window.id === activeWindow?.id ? 'Active' : 'Open'}</small></button>) : <p>No windows open. Choose a project from the dock.</p>}</div>}</div><button className="desktop-help" type="button" aria-label="Desktop keyboard and pointer controls" onClick={() => openWindow('help')}><Icon name="help" size={19} /></button><Link className="desktop-gallery-link" to="/drafts">All drafts<Icon name="arrow" size={15} /></Link></header>
    <main className="desktop-stage" aria-label="Portfolio desktop">
      <div className="desktop-wallpaper"><h1>Gentrit<br />Rashiti<span>.</span></h1><p>Frontend & mobile.<br />Now full stack.</p><div className="desktop-location">Kosovo · Working remotely</div></div>
      <nav className="desktop-shortcuts" aria-label="Project shortcuts">{pinnedSlugs.map(slug => { const project = projects.find(item => item.slug === slug)!; return <button key={slug} type="button" data-open={slug} onClick={() => openWindow(slug)}><AppIcon icon={project.channel} large /><span>{slug === 'care-platform' ? 'Healthcare' : project.name}</span></button> })}<button type="button" data-open="apps" onClick={() => openWindow('apps')}><AppIcon icon="apps" large /><span>All {projects.length} projects</span></button></nav>
      {windows.map(window => <DesktopWindow key={window.id} window={window} active={window.id === activeWindow?.id} initial={opening && window.id === 'incentiv'} onFocus={focusWindow} onClose={closeWindow} onMinimize={minimizeWindow} onOpen={openWindow} />)}
      {visibleWindows.length === 0 && <button type="button" className="desktop-empty-desktop" onClick={() => openWindow('apps')}>Open a project<Icon name="arrow" /></button>}
    </main>
    <footer className="desktop-dock-zone"><p>Open something.<br />Make yourself at home.</p><nav className="desktop-dock" aria-label="App dock">{dockItems.map(item => { const running = windows.find(window => window.id === item.id); return <button key={item.id} type="button" data-open={item.id} className={running ? 'is-running' : ''} aria-label={`${item.label}${running?.minimized ? ', minimized' : running ? ', open' : ''}`} aria-pressed={activeWindow?.id === item.id} onClick={() => openWindow(item.id)}><AppIcon icon={item.icon} /><span>{item.label}</span></button> })}</nav><button className="desktop-dock-search" type="button" onClick={() => openWindow('apps')}><Icon name="search" size={18} /><span>Find anything</span><kbd>⌘ K</kbd></button></footer>
  </div>
}
