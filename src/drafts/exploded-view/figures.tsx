import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ArrowLeftIcon, ArrowRightIcon, PauseIcon, PlayIcon } from '@phosphor-icons/react'
import { useReducedMotion } from './motion'
import { fullSize, parityFrames, type Shot } from './shots'

/**
 * Runs `onEnter` once, the first time `ref` is at least `threshold` in view. The first report can arrive with only a
 * sliver showing, so the ratio is checked too; otherwise the one-time reveal would be spent before anyone sees it.
 */
function useOnceInView(ref: React.RefObject<Element | null>, onEnter: () => void, threshold = 0.5) {
  const cb = useRef(onEnter)
  useEffect(() => { cb.current = onEnter })
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || e.intersectionRatio < threshold) return
      cb.current()
      io.disconnect()
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [ref, threshold])
}

const STEP_MS = 2400

/**
 * The parity claim, shown rather than told: the same six steps of one parity test, captured on the old app
 * and on the new one, stepping together. It plays through once when it comes into view, then rests on the
 * last step; the step buttons and Play replay it. Keyboard steps switch at once. With reduced motion it never
 * plays and has no Play button: the step buttons show each step. A hidden tab or an off-screen player pauses.
 */
export function ParityPlayer() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [step, setStep] = useState(0)
  const [play, setPlay] = useState(false)
  const [instant, setInstant] = useState(false)
  const last = parityFrames.length - 1
  // Reduced motion switched on mid-play stops it where it is.
  const playing = play && !reduced

  useOnceInView(ref, () => { if (!reduced) setPlay(true) })
  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      setInstant(false)
      setStep(step + 1)
      if (step + 1 >= last) setPlay(false)
    }, STEP_MS)
    return () => clearTimeout(t)
  }, [playing, step, last])
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const stop = () => setPlay(false)
    const io = new IntersectionObserver(([e]) => { if (!e.isIntersecting) stop() })
    io.observe(el)
    const onVis = () => { if (document.hidden) stop() }
    document.addEventListener('visibilitychange', onVis)
    return () => { io.disconnect(); document.removeEventListener('visibilitychange', onVis) }
  }, [])

  const go = (i: number, byKey: boolean) => { setPlay(false); setInstant(byKey); setStep(i) }
  const toggle = () => {
    if (playing) { setPlay(false); return }
    setInstant(false)
    if (step >= last) setStep(0)
    setPlay(true)
  }
  const frame = parityFrames[step]

  return (
    <section className="xv-parity" ref={ref} aria-labelledby="xv-parity-h" data-instant={instant || undefined}>
      <div className="xv-parity-head">
        <h2 id="xv-parity-h" className="xv-case-h2">One test, both apps</h2>
        {/* With reduced motion nothing plays on its own, so Play goes too; the six steps remain. */}
        {!reduced && (
          <button type="button" className="xv-btn xv-btn-quiet xv-parity-play" onClick={toggle} aria-pressed={playing}>
            {playing ? <PauseIcon size={16} weight="bold" aria-hidden="true" /> : <PlayIcon size={16} weight="bold" aria-hidden="true" />}
            {playing ? 'Pause' : step >= last ? 'Play again' : 'Play'}
          </button>
        )}
      </div>
      <div className="xv-parity-screens">
        {(['old', 'new'] as const).map((app) => (
          <figure key={app} className="xv-parity-screen">
            <div className="xv-parity-stack">
              {parityFrames.map((f, i) => (
                <img
                  key={f.step}
                  src={f[app]}
                  width={1080}
                  height={675}
                  alt={i === step ? `${app === 'old' ? 'The old Vue app' : 'The new React app'}, step ${i + 1}: ${f.caption} ${f.detail} Invented data.` : ''}
                  aria-hidden={i === step ? undefined : true}
                  data-on={i === step || undefined}
                  loading="lazy"
                  decoding="async"
                />
              ))}
            </div>
            <figcaption className="xv-note">{app === 'old' ? 'Old app · Vue' : 'New app · React'}</figcaption>
          </figure>
        ))}
      </div>
      <ol className="xv-parity-steps">
        {parityFrames.map((f, i) => (
          <li key={f.step}>
            <button
              type="button"
              aria-current={i === step ? 'step' : undefined}
              onClick={(e) => go(i, e.detail === 0)}
              style={{ '--step-ms': `${STEP_MS}ms` } as CSSProperties}
              data-running={(playing && i === step) || undefined}
            >
              <span className="xv-parity-n">{i + 1}</span> {f.caption}
            </button>
          </li>
        ))}
      </ol>
      <p className="xv-parity-detail" aria-live={playing ? 'off' : 'polite'}>
        <strong>Step {step + 1}.</strong> {frame.detail}
      </p>
      <p className="xv-note xv-parity-note">The same parity test file runs each step on both apps. Real product screens, invented data.</p>
    </section>
  )
}

/**
 * The same two rows before and after, one over the other: a native range input moves the line between them,
 * by drag or arrow keys. When it first comes into view the line leans once (650 ms), to show it moves.
 */
export function CompareSlider({ before, after }: { before: Shot; after: Shot }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [pos, setPos] = useState(50)
  const raf = useRef(0)
  useOnceInView(ref, () => {
    if (reduced) return
    const t0 = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / 650)
      // One restrained hint: the line leans toward the new app and settles back in the middle.
      setPos(50 - Math.sin(t * Math.PI) * 8)
      raf.current = t < 1 ? requestAnimationFrame(tick) : 0
    }
    raf.current = requestAnimationFrame(tick)
  }, 0.7)
  useEffect(() => () => cancelAnimationFrame(raf.current), [])
  const take = (v: number) => { cancelAnimationFrame(raf.current); setPos(v) }

  return (
    <figure className="xv-compare" ref={ref} style={{ '--pos': `${pos}%` } as CSSProperties}>
      <div className="xv-compare-tags xv-note" aria-hidden="true"><span>Before · Vue</span><span>After · React</span></div>
      <div className="xv-compare-box">
        <img src={before.src} alt={before.alt} width={before.width} height={before.height} loading="lazy" decoding="async" />
        <img className="xv-compare-after" src={after.src} alt={after.alt} width={after.width} height={after.height} loading="lazy" decoding="async" />
        <span className="xv-compare-line" aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(pos)}
          onChange={(e) => take(+e.target.value)}
          onPointerDown={() => cancelAnimationFrame(raf.current)}
          aria-label="Compare the old app and the new app: move left for more of the new app"
          aria-valuetext={`${Math.round(100 - pos)}% new app`}
        />
      </div>
      <figcaption className="xv-note">The same two rows, up close. Drag the line or use the arrow keys. Real product screens, invented data.</figcaption>
    </figure>
  )
}

/**
 * A concept, not a product screen: one API above three data partitions. When it first comes into view the
 * three locks close one after another; with reduced motion they are closed from the start.
 */
export function TenantConcept() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const [locked, setLocked] = useState(false)
  useOnceInView(ref, () => setLocked(true), 0.6)
  return (
    <figure className="xv-ev xv-concept" ref={ref} data-locked={locked || reduced || undefined}>
      <svg viewBox="0 0 240 172" role="img" aria-label="Concept: one shared API above three data partitions, each locked to one organization.">
        <g className="xv-layer"><rect x="12" y="10" width="216" height="40" rx="7" /></g>
        <text x="120" y="35" textAnchor="middle">One API</text>
        {[0, 1, 2].map((k) => (
          <g key={k} className="xv-concept-part" style={{ '--k': k } as CSSProperties}>
            <line className="xv-align" x1={44 + k * 76} y1="50" x2={44 + k * 76} y2="92" />
            <g className="xv-layer"><rect x={12 + k * 76} y="92" width="64" height="60" rx="7" /></g>
            <path className="xv-lock" d={`M${36 + k * 76} 118h16v14h-16z`} />
            <path className="xv-lock xv-lock-shackle" d={`M${39 + k * 76} 118v-4a5 5 0 0 1 10 0v4`} />
          </g>
        ))}
      </svg>
      <figcaption className="xv-note">A concept, not a product screen: one API, and each organization’s data kept apart.</figcaption>
    </figure>
  )
}

/**
 * The boards, one at a time, at full width. The visitor steps through them; nothing plays on its own. A pointer
 * step crossfades (220 ms); a keyboard step switches at once. It opens on the board its homepage story showed,
 * so that board carries across the page change (`carry`).
 */
export function BoardViewer({ boards, start = 0, carry, label }: { boards: Shot[]; start?: number; carry?: string; label: string }) {
  const [at, setAt] = useState(start)
  const [instant, setInstant] = useState(false)
  const go = (n: number, byKey: boolean) => { setInstant(byKey); setAt((n + boards.length) % boards.length) }
  const cur = boards[at]
  return (
    <section className="xv-boards" aria-roledescription="carousel" aria-label={label} data-instant={instant || undefined}>
      <a className="xv-boards-stage xv-full" href={fullSize(cur.src)} target="_blank" rel="noreferrer">
        {boards.map((b, i) => (
          <img
            key={b.src}
            src={b.src}
            width={b.width}
            height={b.height}
            alt={i === at ? b.alt : ''}
            aria-hidden={i === at ? undefined : true}
            data-on={i === at || undefined}
            data-carry={carry && i === start ? '' : undefined}
            style={carry && i === start ? ({ '--carry': `xv-shot-${carry}` } as CSSProperties) : undefined}
            loading={i === at ? 'eager' : 'lazy'}
            decoding="async"
          />
        ))}
        <span className="xv-sr"> (full size, opens in a new tab)</span>
      </a>
      <div className="xv-boards-bar">
        <p className="xv-boards-title" aria-live="polite">
          <span className="xv-boards-count">{at + 1} / {boards.length}</span> {cur.caption}
        </p>
        <button type="button" className="xv-btn xv-boards-step" aria-label="Previous board" onClick={(e) => go(at - 1, e.detail === 0)}>
          <ArrowLeftIcon size={16} weight="bold" aria-hidden="true" />
        </button>
        <button type="button" className="xv-btn xv-boards-step" aria-label="Next board" onClick={(e) => go(at + 1, e.detail === 0)}>
          <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
        </button>
      </div>
      <ol className="xv-boards-dots">
        {boards.map((b, i) => (
          <li key={b.src}>
            <button type="button" aria-label={`Board ${i + 1}: ${b.caption}`} aria-current={i === at || undefined} onClick={(e) => go(i, e.detail === 0)} />
          </li>
        ))}
      </ol>
      <p className="xv-note xv-boards-note">Real product screens, invented data. Select the board for full size.</p>
    </section>
  )
}
