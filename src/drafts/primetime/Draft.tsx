import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { transitionOldDraft } from '../../components/portfolio/oldDraftTransition'
import { useEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router'
import { projects } from '../../content/projects'
import type { Project } from '../../content/projects'
import { links } from '../../content/links'
import { createChannelSound } from './channelSound'
import './primetime.css'

const initialIndex = projects.findIndex(project => project.slug === 'bayyinah-tv')
const worlds = { healthcare: 'Healthcare', streaming: 'Streaming', reading: 'Mobile apps', web3: 'Web3', ai: 'Web & AI', personal: 'Personal' }

function Arrow({ direction = 'right' }: { direction?: 'left' | 'right' | 'up' | 'down' }) {
  const rotation = { right: 0, down: 90, left: 180, up: 270 }[direction]
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" style={{ transform: `rotate(${rotation}deg)` }}><path d="M4 12h16M13 5l7 7-7 7" /></svg>
}

function ProjectPicture({ project }: { project: Project }) {
  const gallery = project.media.galleries?.[0]
  const image = gallery?.items[0] ?? project.media.shot
  if (gallery?.aspect === 'phone') return <div className="primetime-phone-show">{gallery.items.slice(0, 3).map(item => <img key={item.src} src={item.src} alt={item.alt} />)}</div>
  if (image) return <img className="primetime-public-screen" src={image.src} alt={image.alt} />
  return <div className="primetime-type-show"><strong>{project.name}</strong><p>{project.summary}</p><span>{project.stack.slice(0, 4).join(' / ')}</span></div>
}

export default function Draft() {
  const [channel, setChannel] = useState(initialIndex)
  const [tuning, setTuning] = useState(1)
  const [digits, setDigits] = useState('')
  const [numericError, setNumericError] = useState('')
  const [query, setQuery] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const soundEnabledRef = useRef(false)
  const numericTimer = useRef<number | null>(null)
  const sound = useRef<ReturnType<typeof createChannelSound> | null>(null)
  const tv = useRef<HTMLElement>(null)
  const guide = useRef<HTMLHeadingElement>(null)
  const project = projects[channel]
  const visible = projects.filter(item => `${item.name} ${item.kind} ${item.stack.join(' ')}`.toLowerCase().includes(query.toLowerCase().trim()))

  useEffect(() => () => { if (numericTimer.current !== null) window.clearTimeout(numericTimer.current); sound.current?.dispose(); sound.current = null }, [])

  function tune(next: number, reveal = false) {
    if (numericTimer.current !== null) window.clearTimeout(numericTimer.current)
    setDigits(''); setNumericError('')
    transitionOldDraft(() => setChannel((next + projects.length) % projects.length))
    setTuning(value => value + 1)
    if (soundEnabledRef.current) sound.current?.play()
    if (reveal) requestAnimationFrame(() => {
      tv.current?.focus({ preventScroll: true })
      tv.current?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    })
  }

  function commitNumber(value: string) {
    const number = Number(value)
    if (number >= 1 && number <= projects.length) tune(number - 1)
    else { setDigits(''); setNumericError(`Choose 01–${projects.length}`) }
  }

  function pressNumber(value: string) {
    if (numericTimer.current !== null) window.clearTimeout(numericTimer.current)
    const next = `${digits}${value}`.slice(-2)
    setDigits(next); setNumericError('')
    if (next.length === 2) commitNumber(next)
    else numericTimer.current = window.setTimeout(() => commitNumber(next), 800)
  }

  function toggleSound() {
    if (soundEnabled) { soundEnabledRef.current = false; sound.current?.stop(); setSoundEnabled(false); return }
    sound.current ??= createChannelSound()
    soundEnabledRef.current = sound.current.unlock()
    setSoundEnabled(soundEnabledRef.current)
  }

  function showGuide() {
    guide.current?.focus({ preventScroll: true })
    guide.current?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  function remoteKeys(event: KeyboardEvent<HTMLDivElement>) {
    if (!(event.target instanceof Element) || !event.target.closest('.primetime-tv, .primetime-remote')) return
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement || event.metaKey || event.ctrlKey || event.altKey) return
    if (/^\d$/.test(event.key)) { event.preventDefault(); pressNumber(event.key) }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') { event.preventDefault(); tune(channel - 1) }
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') { event.preventDefault(); tune(channel + 1) }
  }

  return <div className="draft-primetime" onKeyDown={remoteKeys}>
      <OldDraftMotion />
    <header className="primetime-header"><Link to="/drafts" className="primetime-name">Gentrit Rashiti</Link><p>Frontend & mobile developer,<br />now full stack.</p><nav aria-label="Primetime navigation"><button type="button" onClick={showGuide}>Channel guide</button><a href="#primetime-about">About / Contact</a><Link to="/drafts">All drafts<Arrow /></Link></nav></header>
    <main>
      <section className="primetime-programme" aria-labelledby="primetime-title"><div className="primetime-programme-heading"><h1 id="primetime-title">{project.name}</h1><p>{project.kind}<br /><span>{project.years ?? worlds[project.channel]}</span></p></div>
        <div className="primetime-set-layout"><figure ref={tv} tabIndex={0} className="primetime-tv" aria-label={`${project.name}. Use the arrow keys to change project, or type a channel number from 1 to ${projects.length}.`}><div className="primetime-cabinet"><div className="primetime-picture"><ProjectPicture key={project.slug} project={project} /><div className="primetime-tuning" key={tuning} aria-hidden="true" /></div><div className="primetime-speaker" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="primetime-cabinet-bottom"><span>G. RASHITI</span><div className="primetime-hardware-controls"><button type="button" onClick={() => tune(channel - 1)} aria-label="Previous project channel"><Arrow direction="left" /></button><button type="button" onClick={() => tune(channel + 1)} aria-label="Next project channel"><Arrow /></button></div><span>{project.media.galleries?.length || project.media.shot ? 'Public product screen' : 'Project overview'}</span></div></div><figcaption><span>Channel {String(channel + 1).padStart(2, '0')} of {projects.length}</span><a href="#primetime-case">Read this project<Arrow /></a></figcaption></figure>
          <aside className="primetime-remote" aria-label="Television remote"><div className="primetime-remote-top"><h2>Remote</h2><button type="button" aria-pressed={soundEnabled} onClick={toggleSound}>Sound {soundEnabled ? 'on' : 'off'}</button></div><div className="primetime-channel-display" aria-live="polite"><span>{numericError || 'Channel'}</span><strong>{digits ? digits.padEnd(2, '_') : String(channel + 1).padStart(2, '0')}</strong></div><div className="primetime-channel-step"><button type="button" onClick={() => tune(channel - 1)} aria-label="Previous channel"><Arrow direction="left" /><span>Prev</span></button><button type="button" onClick={() => tune(channel + 1)} aria-label="Next channel"><span>Next</span><Arrow /></button></div><div className="primetime-number-pad" aria-label="Enter a channel number">{['1','2','3','4','5','6','7','8','9'].map(number => <button type="button" key={number} onClick={() => pressNumber(number)}>{number}</button>)}<button type="button" onClick={showGuide}>Guide</button><button type="button" onClick={() => pressNumber('0')}>0</button><button type="button" onClick={() => { if (numericTimer.current !== null) window.clearTimeout(numericTimer.current); setDigits(''); setNumericError('') }} aria-label="Clear channel number">Clear</button></div><p>Use the arrow keys or enter 01–{projects.length}.</p></aside>
        </div>
      </section>
      <section className="primetime-case" id="primetime-case" aria-labelledby="primetime-case-title"><div><h2 id="primetime-case-title">{project.slug === 'bayyinah-tv' ? 'One platform.\nEvery screen.' : project.name}</h2><p>{project.role}</p><div className="primetime-links">{project.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}<Arrow /></a>)}</div></div><div><OldCareFile slug={project.slug} /><p>{project.summary}</p>{project.slug === 'bayyinah-tv' && <><h3>A rebuild, from the first route.</h3><p>The Nuxt 3 rebuild adds AWS IVS live streams, realtime chat and moderation, an HLS player, and Stripe, Apple and Google subscriptions. English and Arabic include a complete right-to-left layout. The same web app also runs inside the iOS and Android apps.</p></>}<dl><div><dt>Technology</dt><dd>{project.stack.join(', ')}</dd></div>{project.slug === 'bayyinah-tv' && <><div><dt>Scope</dt><dd>34 routes, 270+ components, 25 Pinia stores</dd></div><div><dt>Languages</dt><dd>English and Arabic, including RTL</dd></div></>}</dl></div></section>
      <section className="primetime-guide" aria-labelledby="primetime-guide-title"><div className="primetime-guide-heading"><h2 ref={guide} tabIndex={-1} id="primetime-guide-title">Channel guide.</h2><label><span className="primetime-sr-only">Search projects or technology</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a project or technology" /></label></div><div className="primetime-guide-list">{visible.map(item => <button type="button" key={item.slug} aria-pressed={item.slug === project.slug} onClick={() => tune(projects.indexOf(item), true)}><span className="primetime-guide-number">{String(projects.indexOf(item) + 1).padStart(2, '0')}</span><span><strong>{item.name}</strong><small>{item.kind}</small></span><span className="primetime-guide-year">{item.years}</span><Arrow /></button>)}</div>{visible.length === 0 && <p className="primetime-no-results">No channels match. Try “React” or “Bayyinah”.</p>}</section>
      <section className="primetime-about" id="primetime-about"><div><h2>Behind<br />the screen.</h2><p>Gentrit Rashiti is a frontend and mobile developer, now full stack. Web and mobile products, from the first screen to release: healthcare, streaming, e-reading and Web3.</p><p>5+ years. Part of two platform rewrites. Based in Kosovo, working remotely.</p></div><div><h3>Say hello.</h3><a className="primetime-email" href={`mailto:${links.email}`}>{links.email}<Arrow /></a><div className="primetime-links"><a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noreferrer">GitHub<Arrow /></a><a href={links.cv} download>Download CV<Arrow /></a></div></div></section>
    </main><footer className="primetime-footer"><Link to="/drafts">All art directions<Arrow /></Link><button type="button" onClick={showGuide}>Choose another channel<Arrow /></button></footer>
  </div>
}
