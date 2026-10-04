import { useImperativeHandle, useLayoutEffect, useRef } from 'react'
import type { CSSProperties, PointerEvent, Ref } from 'react'
import type { Project } from '../../content/projects'
import { channels } from '../../content/channels'
import { links } from '../../content/links'
import { ease, spring } from './motion'

type Ink = 'blue' | 'pink'
interface Picture { kind: 'web' | 'phones' | 'type'; items: { src: string; alt: string }[] }

/** Private or unpublished products print as type only: no screenshot and no copy of their interface. */
const typeOnly = new Set(['care-platform', 'donation-app'])

export function pictureOf(project: Project): Picture {
  if (typeOnly.has(project.slug)) return { kind: 'type', items: [] }
  const gallery = project.media.galleries?.[0]
  if (gallery?.aspect === 'phone') return { kind: 'phones', items: gallery.items.slice(0, 3) }
  if (gallery) return { kind: 'web', items: [gallery.items[0]] }
  if (project.media.shot) return { kind: 'web', items: [project.media.shot] }
  return { kind: 'type', items: [] }
}

/** Title sizes as a share of the sheet width, from the longest unbreakable word and the name length. */
export function titleScale(name: string) {
  const longest = Math.max(...name.split(/[\s-]/).map(word => word.length))
  const length = name.length
  return {
    landscape: Math.min(13.5, 40 / (longest * .7), Math.sqrt(.19 / length) * 100),
    portrait: Math.min(25, 86 / (longest * .7), Math.sqrt(.55 / length) * 100),
  }
}

export const pad = (n: number) => String(n).padStart(2, '0')

function Title({ project, ink }: { project: Project; ink: Ink }) {
  const words = project.name.split(' ')
  const content = words.map((word, index) => <span key={index}>{word}{index < words.length - 1 ? ' ' : ''}</span>)
  return ink === 'blue' ? <h2 className="rp-title" id="riso-poster-title">{content}</h2> : <div className="rp-title">{content}</div>
}

function Halftone({ src, alt, ink }: { src: string; alt: string; ink: Ink }) {
  return <div className="rp-ht" role={ink === 'blue' ? 'img' : undefined} aria-label={ink === 'blue' ? alt : undefined}>
    <div className="rp-ht-screen"><div className="rp-ht-image" style={{ backgroundImage: `url("${src}")` }} /></div>
  </div>
}

function Sheet({ project, number, total, ink, plain }: { project: Project; number: number; total: number; ink: Ink; plain: boolean }) {
  const picture = pictureOf(project)
  return <div className={`rp-grid rp-grid--${picture.kind}`}>
    <div className={`rp-flood rp-flood--${project.channel} ink-pink`} />
    <div className="rp-byline ink-blue"><span>Gentrit Rashiti</span><span>No. {pad(number)} / {total}</span><span>{project.years ?? channels[project.channel].label}</span></div>
    <div className="rp-head">
      <Title project={project} ink={ink} />
      <p className="rp-kind ink-blue">{project.kind}<span>{channels[project.channel].label}</span></p>
    </div>
    {picture.kind === 'type'
      ? <div className="rp-picture rp-picture--type">
          <span className="rp-numeral ink-pink">{pad(number)}</span>
          <p className="rp-statement ink-blue">{project.line}</p>
        </div>
      : <div className={`rp-picture rp-picture--${picture.kind}`}>
          {plain
            ? picture.items.map(item => <img key={item.src} className="rp-original ink-blue" src={item.src} alt={item.alt} />)
            : picture.items.map(item => <Halftone key={item.src} src={item.src} alt={item.alt} ink={ink} />)}
        </div>}
    <div className="rp-text ink-blue">
      {picture.kind !== 'type' && <p className="rp-line">{project.line}</p>}
      <p className="rp-stack">{project.stack.slice(0, 5).join(' / ')}</p>
    </div>
    <div className="rp-foot ink-blue"><span>Web & mobile development</span><span>{links.githubLabel}</span></div>
  </div>
}

export interface PosterHandle { printRun: () => Promise<boolean>; release: () => void }

interface Parts { blue: HTMLElement; blueCounter: HTMLElement; pink: HTMLElement; pinkCounter: HTMLElement; pinkSheet: HTMLElement; blueRoller: HTMLElement; pinkRoller: HTMLElement; root: HTMLElement }

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches

/** Two roller passes. Each pass lays one plate down behind the roller; the pink plate lands off register, then settles. */
function run(parts: Parts, { feed, fast }: { feed: boolean; fast: boolean }) {
  const pass = fast ? 520 : 680
  const second = fast ? 300 : 520
  const start = feed ? 220 : 0
  const anims: Animation[] = []
  const timing = (delay: number, duration = pass): KeyframeAnimationOptions => ({ duration, delay, easing: ease.story, fill: 'backwards' })
  if (feed) anims.push(parts.root.animate([{ transform: 'translateY(40px)', opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 600, easing: ease.arrive, fill: 'backwards' }))
  const passes: [HTMLElement, HTMLElement, HTMLElement, number][] = [
    [parts.blue, parts.blueCounter, parts.blueRoller, start],
    [parts.pink, parts.pinkCounter, parts.pinkRoller, start + second],
  ]
  for (const [plate, counter, roller, delay] of passes) {
    anims.push(plate.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], timing(delay)))
    anims.push(counter.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], timing(delay)))
    anims.push(roller.animate([{ transform: 'translateY(-100%)' }, { transform: 'none' }], timing(delay)))
    anims.push(roller.animate([{ opacity: 1 }, { opacity: 1, offset: .86 }, { opacity: 0 }], { duration: pass + 140, delay, easing: 'linear', fill: 'backwards' }))
  }
  anims.push(parts.pinkSheet.animate([{ transform: 'translate(15px, -11px)' }, { transform: 'none' }], { duration: spring.play.duration, delay: start + second + pass * .82, easing: spring.play.easing, fill: 'backwards' }))
  return anims
}

export function Poster({ project, number, total, plain, feed, stamp, onPrint, ref }: { project: Project; number: number; total: number; plain: boolean; feed: boolean; stamp: 'idle' | 'running' | 'done'; onPrint: () => void; ref?: Ref<PosterHandle> }) {
  const root = useRef<HTMLElement>(null)
  const active = useRef<Animation[]>([])
  const scale = titleScale(project.name)

  function parts(): Parts | null {
    const element = root.current
    if (!element) return null
    const pick = (selector: string) => element.querySelector<HTMLElement>(selector)!
    return { root: element, blue: pick('.rp-plate--blue'), blueCounter: pick('.rp-plate--blue > .rp-counter'), pink: pick('.rp-plate--pink'), pinkCounter: pick('.rp-plate--pink > .rp-counter'), pinkSheet: pick('.rp-plate--pink .rp-sheet'), blueRoller: pick('.rp-roller--blue'), pinkRoller: pick('.rp-roller--pink') }
  }

  function stop() { active.current.forEach(animation => animation.cancel()); active.current = [] }

  useLayoutEffect(() => {
    const p = parts()
    if (!p || reducedMotion()) return
    active.current = run(p, { feed, fast: !feed })
    return stop
  }, [])

  useImperativeHandle(ref, () => ({
    async printRun() {
      const p = parts()
      if (!p) return false
      stop()
      p.root.dataset.ink = 'active'
      if (reducedMotion()) return true
      const empty = [p.blue, p.pink].map(plate => plate.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: ease.out, fill: 'forwards' }))
      active.current = empty
      try { await Promise.all(empty.map(animation => animation.finished)) } catch { return false }
      const passes = run(p, { feed: false, fast: false })
      empty.forEach(animation => animation.cancel())
      active.current = passes
      try { await Promise.all(passes.map(animation => animation.finished)) } catch { return false }
      return true
    },
    release() { if (root.current) root.current.dataset.ink = 'idle' },
  }))

  function separate(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || reducedMotion() || root.current?.dataset.ink === 'active') return
    const bounds = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--sx', `${((event.clientX - bounds.left) / bounds.width - .5) * 10}px`)
    event.currentTarget.style.setProperty('--sy', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`)
  }

  function register(event: PointerEvent<HTMLElement>) { event.currentTarget.style.setProperty('--sx', '0px'); event.currentTarget.style.setProperty('--sy', '0px') }

  return <article ref={root} id="riso-poster" role="tabpanel" aria-labelledby="riso-poster-title" tabIndex={-1} className="rp" data-ink="idle" data-picture={pictureOf(project).kind} style={{ '--t-land': `${scale.landscape}cqw`, '--t-port': `${scale.portrait}cqw` } as CSSProperties} onPointerMove={separate} onPointerLeave={register}>
    <div className="rp-plate rp-plate--blue"><div className="rp-counter"><div className="rp-sheet"><Sheet project={project} number={number} total={total} ink="blue" plain={plain} /></div></div></div>
    <div className="rp-plate rp-plate--pink" aria-hidden="true"><div className="rp-counter"><div className="rp-sheet"><Sheet project={project} number={number} total={total} ink="pink" plain={plain} /></div></div></div>
    <div className="rp-roller rp-roller--blue" aria-hidden="true" />
    <div className="rp-roller rp-roller--pink" aria-hidden="true" />
    <p className="rp-print-contact">Gentrit Rashiti · {links.email}</p>
    <button type="button" className="rp-stamp riso-screen-only" data-state={stamp} aria-busy={stamp === 'running'} onClick={onPrint}>{stamp === 'done' ? <><span>Sent</span><span>to</span><span>print</span></> : <><span>Print</span><span>this</span><span>poster</span></>}</button>
  </article>
}
