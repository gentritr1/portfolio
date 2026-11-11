import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type Ref, type RefObject } from 'react'
import { ArrowUpRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react'
import { BASE, plain } from './data'

/** An art-directed crop of a real capture: `rect` is x, y, w, h in the capture's CSS px; the file holds 2 px per CSS px. */
export type Crop = { src: string; rect: [x: number, y: number, w: number, h: number]; /** When this crop shows something the item's alt does not say. */ alt?: string }
export type FocusItem = {
  slug: string; name: string; area: string; years: string | null; alt: string
  /** The capture both crops are cut from (public path). */
  source: string
  /** Wide: the 16:10 screen from 521 px up. Narrow: the 4:3 screen on phones, a tighter cut so its text stays legible. */
  wide: Crop; narrow: Crop
}

const HOLD = 4200
/** The one story beat: the pull on load and on the turn (≤ 800 ms, data-motion="story"); a pointer pick replays it faster. */
const PULL = 600
const PICK = 450
const NARROW = '(max-width: 520px)'

const onNarrow = (f: () => void) => { const m = matchMedia(NARROW); m.addEventListener('change', f); return () => m.removeEventListener('change', f) }

type How = 'load' | 'rest' | 'auto' | 'pick' | 'key'

function Shot({ it, className, alt, imgRef }: { it: FocusItem; className: string; alt: string; imgRef?: Ref<HTMLImageElement> }) {
  const [, , ww, wh] = it.wide.rect
  const [, , nw, nh] = it.narrow.rect
  return (
    <picture>
      <source media={NARROW} srcSet={it.narrow.src} width={nw * 2} height={nh * 2} />
      <img
        ref={imgRef} className={className} src={it.wide.src} width={ww * 2} height={wh * 2} alt={alt} decoding="async"
        style={{ '--wh': `${wh}px`, '--ww': `${ww}px`, '--nh': `${nh}px`, '--nw': `${nw}px` } as CSSProperties}
        aria-hidden={alt ? undefined : true} data-crop-wide={it.wide.rect.join(' ')} data-crop-narrow={it.narrow.rect.join(' ')}
        data-motion={alt ? 'story' : undefined}
      />
    </picture>
  )
}

/**
 * The hero (direction A, owner 2026-11-03): one real screen at a time, pulled into focus from the page's dot field. The sharp copy is
 * the accessible image; the dotted copy under it is decoration. The pull starts when the image has decoded, with no delay, and a
 * timer settles it sharp whether or not the animation runs (a throttled tab still shows the screen). It goes round the four areas
 * once, then rests; a pick or the pause button stops it, a key press swaps at once, and reduced motion shows each screen sharp
 * with no sweep and no turn. `?pull=rest` shows the first screen sharp at once and keeps the pull for turns and picks.
 *
 * The block renders as `display: contents`, so the screen, the caption row and the tab row are cells of the intro's own grid
 * (the left column spans them; on phones they sit between the headline and the role).
 */
export function FocusHero({ items, reduced, onOpen, onPulse, note }: {
  items: FocusItem[]; reduced: boolean; onOpen(slug: string, trigger: HTMLAnchorElement): void; onPulse?(x: number, y: number): void
  /** A disclosure that holds for every screen, said once beside the product's name. */
  note?: string
}) {
  const q = new URLSearchParams(location.search)
  const debug = q.get('debug') === '1'
  // ?seam=1 (owner comparison): a 2 px accent line rides the pull's leading edge; gone when settled.
  const seam = q.get('seam') === '1'
  const [at, setAt] = useState(0)
  const narrow = useSyncExternalStore(onNarrow, () => matchMedia(NARROW).matches)
  const atRef = useRef(0)
  atRef.current = at
  // How the screen changed: load and the turn take the story pull, a click a quicker one, a key press none (Emil: keys never animate).
  const [how, setHow] = useState<How>(q.get('pull') === 'rest' ? 'rest' : 'load')
  const [playing, setPlaying] = useState(!reduced)
  const fig = useRef<HTMLAnchorElement>(null)
  const sharp = useRef<HTMLImageElement>(null)
  const turns = useRef(0)
  const show = (i: number) => { setReady(null); setSettled(null); setAt(i) }
  const times = useRef({ ready: 0, settled: 0 })
  // `ready` starts the pull once the screen has decoded; `settled` ends it by a timer, never by the animation.
  const [ready, setReady] = useState<number | null>(null)
  const [settled, setSettled] = useState<number | null>(null)
  const instant = reduced || how === 'rest' || how === 'key'
  useEffect(() => {
    if (instant) { times.current = { ready: performance.now(), settled: performance.now() }; setSettled(at); return }
    let gone = false
    let id = 0
    const settle = () => { if (gone) return; times.current.settled = performance.now(); setSettled(at) }
    // Decode can hang on a broken or slow image; the screen still settles by 3 s.
    const late = window.setTimeout(settle, 3000)
    sharp.current?.decode().catch(() => {}).then(() => {
      if (gone) return
      times.current = { ready: performance.now(), settled: 0 }
      setReady(at)
      id = window.setTimeout(settle, (how === 'pick' ? PICK : PULL) + 40)
    })
    return () => { gone = true; clearTimeout(id); clearTimeout(late) }
  }, [at, how, instant])

  // Once the first screen is sharp, fetch and decode the other three, so a turn or a pick pulls at once instead of waiting
  // on the network (the turn would load them within 4 s anyway).
  const warmed = useRef(false)
  useEffect(() => {
    if (settled === null || warmed.current) return
    warmed.current = true
    const narrow = matchMedia(NARROW).matches
    for (const d of items) { const im = new Image(); im.src = narrow ? d.narrow.src : d.wide.src; im.decode().catch(() => {}) }
  }, [settled, items])
  useEffect(() => { if (reduced) setPlaying(false) }, [reduced])
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      if (document.hidden) return
      setHow('auto')
      if (++turns.current >= items.length) { setPlaying(false); show(0); return }
      show((atRef.current + 1) % items.length)
    }, HOLD)
    return () => clearInterval(id)
  }, [playing, items.length])
  // The field answers each new screen with a ripple from its centre.
  useEffect(() => {
    const r = fig.current?.getBoundingClientRect()
    if (how !== 'key' && r && r.bottom > 0 && r.top < innerHeight) onPulse?.(r.left + r.width / 2, r.top + r.height / 2)
  }, [at, how, onPulse])

  const it = items[at]
  // A narrow crop slimmer than the 4:3 phone window (a phone screen, a two-column calendar) is shown whole, height-filling,
  // with the figure's own ground at its sides, never above its own pixels.
  const contain = it.narrow.rect[2] / it.narrow.rect[3] < 4 / 3 - 0.01
  const alt = (narrow ? it.narrow.alt : it.wide.alt) ?? it.alt
  const isSettled = settled === at
  return (
    <div className="re-fh" data-reduced={reduced || undefined}>
      <a
        ref={fig}
        key={it.slug}
        className="re-fh-screen"
        data-ui=""
        data-contain={contain || undefined}
        data-ready={(ready === at && !isSettled) || undefined}
        data-settled={isSettled || instant || undefined}
        data-how={how}
        href={`${BASE}/${it.slug}`}
        onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(it.slug, e.currentTarget) }}
      >
        <Shot it={it} className="re-fh-dots" alt="" />
        <Shot it={it} className="re-fh-sharp" alt={alt} imgRef={sharp} />
        {seam && <i className="re-fh-seam" aria-hidden="true" />}
        <span className="re-fh-open"><span className="re-sr">Open the </span>{it.name}<span className="re-sr"> case</span><ArrowUpRightIcon size={16} aria-hidden="true" /></span>
      </a>
      {/* One row under the screen: the shown product, then the note that holds for every screen. */}
      <div className="re-fh-meta">
        <p className="re-fh-name">{it.name}{it.years && <span className="re-num"> · {it.years}</span>}</p>
        {note && <p className="re-fh-note">{note}</p>}
      </div>
      <div className="re-fh-strip">
        <ol aria-label="Areas">
          {items.map((d, i) => (
            <li key={d.slug}>
              <button type="button" aria-pressed={i === at} onClick={(e) => { setPlaying(false); setHow(e.detail === 0 ? 'key' : 'pick'); show(i) }}>
                <span>{d.area}</span>
                <span>{d.name}{d.years && <span className="re-num"> · {d.years}</span>}</span>
              </button>
            </li>
          ))}
        </ol>
        {!reduced && (
          <button type="button" className="re-fh-pause" aria-label={playing ? 'Pause the screens' : 'Play the screens'} onClick={() => { turns.current = 0; setPlaying((p) => !p) }}>
            {playing ? <PauseIcon size={18} aria-hidden="true" /> : <PlayIcon size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {debug && <HeroDebug it={it} sharp={sharp} times={times} />}
    </div>
  )
}

/** `?debug=1`: tap targets against 44 px, the shown crop and its scale, and the live sweep progress and settle time. */
function HeroDebug({ it, sharp, times }: { it: FocusItem; sharp: RefObject<HTMLImageElement | null>; times: RefObject<{ ready: number; settled: number }> }) {
  const [text, setText] = useState('')
  useEffect(() => {
    const id = setInterval(() => {
      for (const el of document.querySelectorAll<HTMLElement>('.re-intro a, .re-intro button, .re-evidence a')) {
        const r = el.getBoundingClientRect()
        el.dataset.tap = r.width >= 44 && r.height >= 44 ? 'ok' : 'bad'
      }
      const im = sharp.current
      if (!im) return
      const narrow = matchMedia(NARROW).matches
      const c = narrow ? it.narrow : it.wide
      const b = im.getBoundingClientRect()
      const [cw, ch] = [c.rect[2], c.rect[3]]
      const fit = getComputedStyle(im).objectFit
      const k = fit === 'cover' ? Math.max(b.width / cw, b.height / ch) : Math.min(b.width / cw, b.height / ch, fit === 'scale-down' ? 1 : Infinity)
      const a = im.getAnimations()[0]
      const p = a ? Math.round(Number(a.effect?.getComputedTiming().progress ?? 0) * 100) : 100
      const t = times.current
      setText(`${it.slug} ${narrow ? 'narrow' : 'wide'} crop ${c.rect.join(',')} of ${it.source}\nshown ${Math.round(cw * k)} css px · scale ${k.toFixed(2)} · density ${(2 / k).toFixed(2)}\nsweep ${p}% · settled ${t.settled ? Math.round(t.settled - t.ready) + ' ms after decode' : '…'}`)
    }, 50)
    return () => clearInterval(id)
  }, [it, sharp, times])
  return <pre className="re-fh-debug" aria-hidden="true">{text}</pre>
}
