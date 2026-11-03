import { useEffect, useRef, useState } from 'react'
import { ArrowUpRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react'
import { BASE, plain } from './data'

export type FocusItem = { slug: string; name: string; area: string; years: string | null; img: [src: string, w: number, h: number]; pos?: string; alt: string }

const HOLD = 4200

/**
 * The hero (direction A, owner 2026-11-03): one real screen at a time, pulled into focus from the page's dot field. The sharp copy is
 * the accessible image; the dotted copy under it is decoration. It goes round the four areas once, then rests; a pick or
 * the pause button stops it, and reduced motion shows each screen sharp with no sweep and no turn.
 */
export function FocusHero({ items, reduced, onOpen, onPulse, note }: {
  items: FocusItem[]; reduced: boolean; onOpen(slug: string, trigger: HTMLAnchorElement): void; onPulse?(x: number, y: number): void
  /** A disclosure that holds for every screen, said once under the areas. */
  note?: string
}) {
  const [at, setAt] = useState(0)
  // How the screen changed: the turn takes its slow sweep, a click a quick one, a key press none (Emil: keys never animate).
  const [how, setHow] = useState<'auto' | 'pick' | 'key'>('auto')
  const [playing, setPlaying] = useState(!reduced)
  const fig = useRef<HTMLAnchorElement>(null)
  const turns = useRef(0)
  // The sharp screen is the content, so it never depends on the sweep finishing: a timer settles it either way.
  const [settled, setSettled] = useState<number | null>(null)
  useEffect(() => {
    const id = setTimeout(() => setSettled(at), how === 'pick' ? 900 : 1600)
    return () => clearTimeout(id)
  }, [at, how])

  useEffect(() => { if (reduced) setPlaying(false) }, [reduced])
  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => {
      if (document.hidden) return
      setHow('auto')
      if (++turns.current >= items.length) { setPlaying(false); setAt(0); return }
      setAt((i) => (i + 1) % items.length)
    }, HOLD)
    return () => clearInterval(id)
  }, [playing, items.length])
  // The field answers each new screen with a ripple from its centre.
  useEffect(() => {
    const r = fig.current?.getBoundingClientRect()
    if (how !== 'key' && r && r.bottom > 0 && r.top < innerHeight) onPulse?.(r.left + r.width / 2, r.top + r.height / 2)
  }, [at, how, onPulse])

  const it = items[at]
  const portrait = it.img[2] > it.img[1]
  return (
    <div className="re-fh" data-reduced={reduced || undefined}>
      <a
        ref={fig}
        key={it.slug}
        className="re-fh-screen"
        data-portrait={portrait || undefined}
        data-settled={settled === at || how === 'key' || undefined}
        data-how={how}
        href={`${BASE}/${it.slug}`}
        onClick={(e) => { if (!plain(e)) return; e.preventDefault(); onOpen(it.slug, e.currentTarget) }}
      >
        <img className="re-fh-dots" src={it.img[0]} width={it.img[1]} height={it.img[2]} style={it.pos ? { objectPosition: it.pos } : undefined} alt="" aria-hidden="true" decoding="async" />
        <img className="re-fh-sharp" src={it.img[0]} width={it.img[1]} height={it.img[2]} style={it.pos ? { objectPosition: it.pos } : undefined} alt={it.alt} decoding="async" />
        <i className="re-fh-seam" aria-hidden="true" />
        <span className="re-fh-open"><span className="re-sr">Open the </span>{it.name}<span className="re-sr"> case</span><ArrowUpRightIcon size={16} aria-hidden="true" /></span>
      </a>
      {/* Phones: the product's name sits under its screen, never over it (owner, 2026-11-03). */}
      <p className="re-fh-name">{it.name}{it.years && <span className="re-num"> · {it.years}</span>}</p>
      <div className="re-fh-strip">
        <ol aria-label="Areas">
          {items.map((d, i) => (
            <li key={d.slug}>
              <button type="button" aria-pressed={i === at} onClick={(e) => { setPlaying(false); setHow(e.detail === 0 ? 'key' : 'pick'); setAt(i) }}>
                <span>{d.area}</span>
                <span>{d.name}{d.years && <span className="re-num"> · {d.years}</span>}</span>
                {i === at && playing && <i className="re-fh-timer" aria-hidden="true" />}
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
      {note && <p className="re-fh-note">{note}</p>}
    </div>
  )
}
