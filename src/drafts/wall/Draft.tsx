import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { OldDraftMotion } from '../../components/portfolio/OldDraftMotion'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { projects, findProject, type Project } from '../../content/projects'
import { links } from '../../content/links'
import { wallAssets as sharedAssets, wallPosters, wallYear, type WallAsset } from '../../components/portfolio/wallAssets'
import { wallPreviews } from './previews'
import type { WallScene } from './scene'
import './wall.css'

type Sort = 'selection' | 'colour' | 'year' | 'category'
const lead = ['bayyinah-tv', 'incentiv', 'read-to-feed', 'viva-fresh', 'snaxx-tech', 'offbeat', 'dukagjini-bookstore', 'bayyinah-institute', 'offday', 'form', 'fjale', 'za', 'morse-trainer', 'geo-guesser', 'care-platform']
const wallAssets: Record<string, WallAsset> = {
  ...sharedAssets,
  offbeat: { src: '/personal/shots/offbeat-home-desktop.webp', aspect: 1.05, colour: 1.2, position: [0.86, 0.45], zoom: 1, fallback: { background: '#ff5b3a', ink: '#121212' } },
  form: { src: '/personal/shots/form-home-desktop.webp', aspect: 0.9, colour: 2.4, position: [0.82, 0.5], zoom: 1.25, fallback: { background: '#2b2420', ink: '#f3e7dc' } },
  'bayyinah-tv': { ...sharedAssets['bayyinah-tv'], position: [0.5, 0.72] },
  'read-to-feed': { ...sharedAssets['read-to-feed'], position: [0.5, 0.62] },
  'dukagjini-bookstore': { ...sharedAssets['dukagjini-bookstore'], position: [0.5, 0.82] },
  'viva-fresh': { ...sharedAssets['viva-fresh'], position: [0.5, 0.45] },
  'bayyinah-institute': { ...sharedAssets['bayyinah-institute'], position: [0.5, 0.72], zoom: 1.8 },
  offday: { ...sharedAssets.offday, position: [1, 0.6] },
  'morse-trainer': { ...sharedAssets['morse-trainer'], position: [0.55, 0.85], zoom: 1.3 },
  incentiv: { ...sharedAssets.incentiv, src: '/showcase/incentiv/web-03.webp', position: [0.25, 0.5], zoom: 1 },
}
const spanPattern = [3, 4, 2, 3, 4, 2, 3, 3]
const spans = (() => {
  const list = projects.map((_, index) => spanPattern[index % spanPattern.length])
  let rowStart = 0, width = 0
  list.forEach((span, index) => { width += span; if (width === 12) { rowStart = index + 1; width = 0 } })
  const rest = list.length - rowStart
  for (let index = rowStart; index < list.length; index++) list[index] = 12 / rest
  return list
})()
const wallColour = (project: Project) => wallAssets[project.slug]?.colour ?? wallPosters[project.slug]?.colour ?? 100
const incentiv = findProject('incentiv')!

function Arrow() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14" /></svg> }

function TileImage({ project, eager }: { project: Project; eager: boolean }) {
  const reduced = useReducedMotion()
  const asset = wallAssets[project.slug]
  const poster = wallPosters[project.slug]
  const [ready, setReady] = useState(false)
  const colour = asset?.fallback ?? { background: poster?.background ?? '#ed5934', ink: poster?.ink ?? '#24170e' }
  const imageStyle: CSSProperties = { objectPosition: `${(asset?.position?.[0] ?? .5) * 100}% ${(asset?.position?.[1] ?? .5) * 100}%`, transform: `scale(${asset?.zoom ?? 1})`, transformOrigin: `${(asset?.position?.[0] ?? .5) * 100}% ${(asset?.position?.[1] ?? .5) * 100}%` }
  return <motion.span className="draft-wall-shared" layoutId={`wall-media-${project.slug}`} transition={reduced ? { duration: .01 } : { type: 'spring', stiffness: 350, damping: 35 }}><span className="draft-wall-media" data-wall-image={asset ? project.slug : undefined} data-zoom={asset?.zoom ?? 1} data-origin-x={asset?.position?.[0] ?? .5} data-origin-y={asset?.position?.[1] ?? .5} style={{ '--wall-ground': colour.background, '--wall-ink': colour.ink } as CSSProperties}>
    <span className="draft-wall-poster" aria-hidden="true" lang="en"><strong className={project.slug === 'dukagjini-bookstore' ? 'draft-wall-poster-fit' : undefined}>{asset ? project.name : (poster?.lines ?? [project.name]).map(line => <span key={line}>{line}</span>)}</strong>{!asset && <span>{project.kind}<br />{project.years ?? project.group}</span>}</span>
    {asset && <>
      <img className="draft-wall-preview" src={wallPreviews[project.slug]} alt="" aria-hidden="true" decoding="sync" style={imageStyle} />
      <img src={asset.src} alt="" loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" data-wall-full="true" data-ready={ready} style={imageStyle} onLoad={event => { void event.currentTarget.decode().then(() => setReady(true)).catch(() => {}) }} />
    </>}
  </span></motion.span>
}

export default function Draft() {
  const gridRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<WallScene | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const pausedRef = useRef(false)
  const [sort, setSort] = useState<Sort>('selection')
  const [paused, setPaused] = useState(false)
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [selected, setSelected] = useState<Project | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const ordered = useMemo(() => [...projects].sort((a, b) => {
    if (sort === 'colour') return wallColour(a) - wallColour(b)
    if (sort === 'year') return wallYear(b) - wallYear(a) || a.name.localeCompare(b.name)
    if (sort === 'category') return a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name)
    const left = lead.indexOf(a.slug), right = lead.indexOf(b.slug)
    return (left < 0 ? 100 : left) - (right < 0 ? 100 : right)
  }), [sort])

  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const change = () => setReduced(media.matches)
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [])

  useEffect(() => {
    if (reduced || !gridRef.current) return
    let cancelled = false
    let dispose: (() => void) | undefined
    void import('./scene').then(module => {
      if (cancelled || !gridRef.current) return
      const scene = module.createWallScene(gridRef.current)
      if (!scene) return
      sceneRef.current = scene
      scene.setPaused(pausedRef.current)
      dispose = scene.dispose
    }).catch(() => {})
    return () => { cancelled = true; dispose?.(); sceneRef.current = null }
  }, [reduced])

  useEffect(() => { pausedRef.current = paused; sceneRef.current?.setPaused(paused) }, [paused])

  useEffect(() => {
    if (dialogOpen) dialogRef.current?.showModal()
  }, [dialogOpen])

  function expand(slug: string | null) {
    if (innerWidth < 900) return
    setExpanded(slug)
    sceneRef.current?.refresh(450)
  }

  function changeSort(next: Sort) {
    if (sort === next) return
    sceneRef.current?.leave()
    setExpanded(null)
    setSort(next)
    setAnnouncement(`${projects.length} projects sorted by ${next}.`)
    sceneRef.current?.refresh(650)
  }
  function openProject(project: Project, button: HTMLElement) {
    if (project.slug === incentiv.slug) {
      document.getElementById('wall-case')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
      return
    }
    returnFocusRef.current = button
    // The destination must be measurable when Motion takes its layout snapshot.
    dialogRef.current?.showModal()
    setSelected(project)
    setDialogOpen(true)
  }

  return <main className="draft-wall" data-motion={reduced ? 'reduced' : paused ? 'paused' : 'active'}>
      <OldDraftMotion />
    <a href="#wall-case" className="draft-wall-skip">Skip to the featured case</a>
    <header className="draft-wall-header"><a href="#wall-top" className="draft-wall-name">Gentrit Rashiti</a><nav aria-label="Wall navigation"><a href="#wall-about">About</a><a href="#wall-contact">Contact<Arrow /></a>{!reduced && <button type="button" aria-pressed={paused} aria-label={paused ? 'Resume motion' : 'Pause motion'} onClick={() => setPaused(value => !value)}>{paused ? 'Resume' : 'Pause'}</button>}</nav><div className="draft-wall-sorting" role="group" aria-label="Sort the work">{(['selection', 'colour', 'year', 'category'] as Sort[]).map(value => <button type="button" key={value} aria-pressed={sort === value} onClick={() => changeSort(value)}>{value === 'selection' ? 'Selected' : value[0].toUpperCase() + value.slice(1)}</button>)}</div></header>
    <section className="draft-wall-gallery" id="wall-top" aria-label={`All ${projects.length} projects`}>
      <div className="draft-wall-identity"><h1 aria-label="Gentrit Rashiti"><span>Gentrit</span><span>Rashiti</span></h1><p>Frontend & mobile developer, now full stack.</p></div>
      <div className="draft-wall-grid" ref={gridRef} role="list" onPointerLeave={() => expand(null)}><AnimatePresence mode="popLayout">{ordered.map((project, index) => <motion.div layout transition={reduced || paused ? { duration: .01 } : { type: "spring", stiffness: 350, damping: 35 }} onLayoutAnimationStart={() => sceneRef.current?.refresh(450)} data-expanded={expanded === project.slug} className={`draft-wall-tile draft-wall-span-${spans[index]}`} data-wall-tile={project.slug} key={project.slug} role="listitem"><button className="draft-wall-project" type="button" aria-label={`Explore ${project.name}`} onClick={event => openProject(project, event.currentTarget)} onFocus={() => { expand(project.slug); sceneRef.current?.activate(project.slug) }} onBlur={event => { sceneRef.current?.leave(); if (!gridRef.current?.contains(event.relatedTarget as Node)) expand(null) }} onPointerEnter={event => { if (event.pointerType === 'mouse') expand(project.slug) }} onPointerMove={event => {
        if (event.pointerType !== 'mouse') return
        const box = event.currentTarget.getBoundingClientRect()
        sceneRef.current?.activate(project.slug, (event.clientX - box.left) / box.width, (event.clientY - box.top) / box.height)
      }} onPointerLeave={() => sceneRef.current?.leave()}><TileImage project={project} eager={index < 8} />{wallAssets[project.slug]?.recreation && <span className="draft-wall-provenance">Recreation · invented data</span>}<span className="draft-wall-caption"><span>{project.name}</span><span>{project.years ?? project.group}<Arrow /></span></span></button></motion.div>)}</AnimatePresence></div>
      <div className="draft-wall-gallery-foot"><p>{projects.length} projects. Web, mobile, APIs and libraries.</p>{!reduced && <button type="button" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? 'Resume motion' : 'Pause motion'}</button>}<p role="status" className="draft-wall-sr-only">{announcement}</p></div>
    </section>

    <article className="draft-wall-case" id="wall-case" aria-labelledby="wall-case-title"><div className="draft-wall-case-heading"><h2 id="wall-case-title">Incentiv.</h2><p>Smart-wallet dashboard<br />2024 · Frontend, UI layer</p></div><div className="draft-wall-case-image"><img src="/showcase/incentiv/web-03.webp" alt="Incentiv’s public portal sign-in screen; no wallet is connected" loading="lazy" /><p>Public portal · sign-in screen</p></div><div className="draft-wall-case-copy"><h3>The wallet’s<br />front door.</h3><div><p>{incentiv.summary}</p><p>Passkeys and external wallets open the sign-in flow. Animated onboarding, asset lists, a balance popup with a QR address and private-route middleware connect the rest of the interface. English and French translations use next-intl.</p><p className="draft-wall-case-scope">Teammates built the wallet and blockchain layer.</p><div className="draft-wall-case-links">{incentiv.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div></div></div></article>

    <section className="draft-wall-about" id="wall-about" aria-labelledby="wall-about-title"><h2 id="wall-about-title">Behind<br />the work.</h2><div><p>Gentrit Rashiti is a frontend and mobile developer, now full stack, with 5+ years across healthcare, video streaming, e-reading and Web3.</p><p>From the first screen to release. React, React Native, Vue, Nuxt, Next.js, Laravel and FastAPI.</p><dl><div><dt>Based in</dt><dd>Kosovo, working remotely</dd></div><div><dt>Education</dt><dd>Bachelor’s degree · UBT</dd></div></dl><a href={links.cv} download>Download CV<Arrow /></a></div></section>
    <footer className="draft-wall-contact" id="wall-contact"><h2>Make contact.</h2><a className="draft-wall-email" href={`mailto:${links.email}`}>{links.email}<Arrow /></a><div><span>Gentrit Rashiti · Kosovo</span><nav aria-label="Contact links"><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<Arrow /></a><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<Arrow /></a><a href="/drafts">All drafts<Arrow /></a></nav></div></footer>

    <dialog className="draft-wall-dialog" ref={dialogRef} aria-labelledby="wall-project-title" onCancel={event => { event.preventDefault(); setDialogOpen(false) }} onClose={() => { setSelected(null); setDialogOpen(false); returnFocusRef.current?.focus() }} onClick={event => { if (event.target === event.currentTarget) setDialogOpen(false) }}>
      <AnimatePresence onExitComplete={() => { if (!dialogOpen) dialogRef.current?.close() }}>{selected && dialogOpen && <motion.div key={selected.slug} initial={{ opacity: 0, y: reduced ? 0 : 8, filter: reduced ? "blur(0px)" : "blur(4px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: reduced ? 0 : 8, filter: reduced ? "blur(0px)" : "blur(4px)" }} transition={{ duration: reduced ? .01 : .3, ease: [.32,.72,0,1] }} className="draft-wall-dialog-content"><button className="draft-wall-close" type="button" onClick={() => setDialogOpen(false)} aria-label="Close project"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="m5 5 14 14M5 19 19 5" /></svg></button><div className="draft-wall-dialog-media"><TileImage project={selected} eager /></div><h2 id="wall-project-title">{selected.name}</h2><p className="draft-wall-dialog-meta">{selected.kind} · {selected.years ?? selected.group}</p><OldCareFile slug={selected.slug} /><p>{selected.summary}</p><p className="draft-wall-dialog-stack">{selected.stack.join(' · ')}</p><div className="draft-wall-case-links">{selected.featured && <a href={`/work/${selected.slug}`}>Full case<Arrow /></a>}{selected.links.map(link => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<Arrow /></a>)}</div></motion.div>}</AnimatePresence>
    </dialog>
  </main>
}
