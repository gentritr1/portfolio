import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Project } from '../../content/projects'
import { Container } from '../Container'
import { ArrowRightIcon, ArrowUpRightIcon } from '../ShellIcons'
import { studioShots, type StudioShot } from './studioShots'
import './studio.css'

export function StudioImage({ shot, eager = false }: { shot: StudioShot; eager?: boolean }) {
  const [decodedSource, setDecodedSource] = useState<string | null>(null)
  const [x, y, width, height] = shot.crop ?? [0, 0, 1, 1]
  const style = { left: `${-x / width * 100}%`, top: `${-y / height * 100}%`, width: `${100 / width}%`, height: `${100 / height}%` }
  return <>
    <img src={shot.preview} alt="" aria-hidden decoding="sync" style={style} />
    <img
      src={shot.src} alt={shot.alt} loading={eager ? 'eager' : 'lazy'}
      fetchPriority={eager ? 'high' : 'auto'} decoding="async" style={style}
      data-studio-screen data-decoded={decodedSource === shot.src}
      onLoad={event => {
        const image = event.currentTarget
        image.decode().then(() => {
          if (image.isConnected) setDecodedSource(shot.src)
        }).catch(() => {})
      }}
    />
  </>
}

export function StudioHero({ project }: { project: Project }) {
  const composition = studioShots[project.slug]
  const host = useRef<HTMLDivElement>(null)
  const fallback = useRef<HTMLDivElement>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    const node = host.current
    if (!node || !composition) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    let cancelled = false
    let dispose: (() => void) | undefined
    const disable = () => { dispose?.(); dispose = undefined; if (!cancelled) setRendered(false) }
    const preferenceChanged = () => { if (preference.matches) disable() }
    preference.addEventListener('change', preferenceChanged)
    if (!preference.matches && !nav.connection?.saveData && (nav.deviceMemory === undefined || nav.deviceMemory >= 4)) {
      const screens = Array.from(fallback.current?.querySelectorAll<HTMLImageElement>('[data-studio-screen]') ?? [])
      Promise.all(screens.map(image => image.decode())).then(() => {
        if (cancelled || preference.matches) return null
        return import('./studioScene')
      }).then(scene => {
        if (!scene || cancelled || preference.matches) return
        dispose = scene.createStudioScene(node, composition, screens, () => {
          if (!cancelled) setRendered(true)
        }, disable)
        if (cancelled || preference.matches) { dispose?.(); dispose = undefined }
      }).catch(disable)
    }
    return () => { cancelled = true; preference.removeEventListener('change', preferenceChanged); dispose?.() }
  }, [composition])

  if (!composition) return null
  const primary = project.links[0]
  return (
    <header className="studio-hero">
      <Container>
        <div className="studio-heading">
          <h1 id="case-title">{composition.title}</h1>
          <div className="studio-heading-meta"><p>{project.kind}</p><p>{project.years}</p></div>
        </div>
        <div className="studio-stage" data-device={composition.device} style={{ '--studio-colour': composition.colour, viewTransitionName: `monitor-${project.slug}` } as CSSProperties}>
          <div className="studio-floor" aria-hidden />
          <div ref={fallback} className="studio-fallback" data-hidden={rendered}>
            {composition.shots.map((shot, index) => <div className="studio-device" data-slot={index} key={shot.src}>
              <div className="studio-device-screen"><StudioImage shot={shot} eager /></div>
            </div>)}
          </div>
          <div ref={host} className="studio-webgl" aria-hidden data-ready={rendered} />
          {(project.slug === 'care-platform' || project.slug === 'design-system-react') && <p className="studio-source">Real product screens, invented data.</p>}
        </div>
        <div className="studio-caption">
          <p>{composition.platform}</p>
          <div><a href="#technical-story">Explore the build <ArrowRightIcon className="studio-arrow-down" aria-hidden /></a>{primary && <a href={primary.href} target="_blank" rel="noopener noreferrer">{primary.label} <ArrowUpRightIcon aria-hidden /><span className="sr-only"> (opens in a new tab)</span></a>}</div>
        </div>
      </Container>
    </header>
  )
}
