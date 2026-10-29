import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon } from '@phosphor-icons/react'
import { caseDetails, questionOf } from '../exploded-view/cases'
import { STAGE } from './scene'
import { cropVars, LEADS } from './screens'
import { FullSize, type FullSizeHandle } from './FullSize'
import { INVENTED, systems } from './data'

const BASE = '/drafts/refractive-engine'
type Vars = CSSProperties & Record<`--${string}`, string | number>

const leadOf = (slug: string, name: string) => LEADS[slug] ?? { shot: { src: `/eh/${slug}.webp`, w: 1280, h: 800, alt: name } }
const isPhone = (slug: string, name: string) => {
  const { shot, crop } = leadOf(slug, name)
  return (crop ? crop[2] / crop[3] : shot.w / shot.h) < 1
}

/** The case's opening screen: the chapter's own screen and crop, as a glass slab. */
function Hero({ slug, name, named }: { slug: string; name: string; named?: boolean }) {
  const { shot, crop, phoneCrop } = leadOf(slug, name)
  const c = crop ?? [0, 0, shot.w, shot.h]
  const n = phoneCrop ?? c
  const style = { ...cropVars(shot, crop), ...cropVars(shot, phoneCrop ?? crop, 'n'), '--a': c[2] / c[3], '--na': n[2] / n[3] } as Vars
  return (
    <figure className="re-sw-slab re-cs-hero" style={style} data-shape={isPhone(slug, name) ? 'phone' : 'wide'} data-hero={named || undefined}>
      <div className="re-sw-screen"><img src={shot.src} width={shot.w} height={shot.h} alt={shot.alt} decoding="async" /></div>
    </figure>
  )
}

/**
 * Decisions shown where they live on a real screen: the screenshot, a point in its own pixels, and the case's decision.
 * Positions from design/selected-work-concepts/decision-markers (Codex, 2026-10-29, checked by its verify.mjs), cut to the
 * three that carry a decision; the rest named a feature the picture already shows. Points are in the file's own pixels
 * (w × h), not the gallery's display size; each product's screenshots share one aspect, so a point is a percentage of
 * the stage.
 */
// `up`: the label opens above the point, so it never covers what is marked (the plan's price, the reader's text). The
// pricing point moved from Codex's 2310 to 2218, into the gap before the "$", so the ring does not sit on the digits.
// The live point sits just above the LIVE badge, not on it: at phone scale a ring on the badge hid its "L".
const MARKERS: Record<string, { x: number; y: number; w: number; h: number; slug: string; decision: number; up?: boolean }> = {
  '/showcase/bayyinah/web-02.webp': { x: 1480, y: 1132, w: 2880, h: 1800, slug: 'bayyinah-tv', decision: 1, up: true },
  '/showcase/bayyinah/web-06.webp': { x: 2218, y: 452, w: 2880, h: 1800, slug: 'bayyinah-tv', decision: 2, up: true },
  '/mobile/reading-3.webp': { x: 112, y: 604, w: 780, h: 1689, slug: 'read-to-feed', decision: 0, up: true },
}

/**
 * The care platform's boards, live: the words of public/showcase/care-dashboard/boards/board-03 and board-04 (the Loop's
 * case boards, word for word) and their callout areas from boards.json `detail`, in the screen's 1440 × 900 CSS pixels.
 * The callout is the same file enlarged, so its pixels are real. Board 02 shows vitals-graph.webp, which this gallery
 * does not carry.
 */
const BOARDS: Record<string, { title: string; lead: string; items: string[]; zoom: string; detail: [x: number, y: number, w: number, h: number] }> = {
  '/showcase/care-dashboard/claims.webp': {
    title: 'Claims that need another look stand out.',
    lead: "Each month's claims are counted by status. A claim that changed after approval gets a mark, so the team checks it again before billing.",
    items: ['Counts by status', 'Filters by month and program', 'Marks for updated claims', 'Retry when a transfer fails'],
    zoom: 'Needs attention · Retry', detail: [958, 700, 414, 116],
  },
  '/showcase/care-dashboard/appointments-week.webp': {
    title: 'A care team’s week on one calendar.',
    lead: 'Visits, calls and tasks for every patient. Filters narrow the week to one person, one type or one priority.',
    items: ['Week, day and list views', 'Six filters', 'Visits and calls in two colours', 'A line for the current time'],
    zoom: 'Now · Tuesday', detail: [604, 538, 352, 168],
  },
}
/** The callout shows its area at this many times the stage's scale. */
const ZOOM = 1.75

type Rect = [x: number, y: number, w: number, h: number]

/**
 * One part of every other screen, for phones, where a whole screen draws at about a quarter of real size: the stage
 * outlines it and the same file shows it under the stage at 0.75 of real size or more. Rectangles are in each screen's
 * CSS pixels (`size`), chosen by Codex and checked by design/selected-work-concepts/phone-crops/verify.mjs (no text or
 * control cut by an edge, 0 changed pixels). `file` is the full-size board a small gallery copy stands for. Board
 * screens keep their board callout; Bayyinah's first store image has none, its heading already reads large.
 */
const CROPS: Record<string, { d: Rect; size: [w: number, h: number]; file?: string }> = {
  '/showcase/care-dashboard/overview.webp': { d: [870, 305, 210, 175], size: [1440, 900] },
  '/showcase/care-dashboard/rpm-overview-cgm.webp': { d: [255, 156, 415, 68], size: [1440, 900] },
  '/showcase/bayyinah/web-01.webp': { d: [36, 230, 453, 180], size: [1440, 900] },
  '/showcase/bayyinah/web-02.webp': { d: [704, 559, 300, 274], size: [1440, 900] },
  '/showcase/bayyinah/web-03.webp': { d: [444, 359, 246, 177], size: [1440, 900] },
  '/showcase/bayyinah/web-04.webp': { d: [105, 570, 302, 275], size: [1440, 900] },
  '/showcase/bayyinah/web-05.webp': { d: [352, 545, 320, 290], size: [1440, 900] },
  '/showcase/bayyinah/web-06.webp': { d: [1055, 110, 250, 200], size: [1440, 900] },
  '/showcase/bayyinah/store-02.webp': { d: [208, 275, 172, 56], size: [389, 845] },
  '/mobile/reading-1.webp': { d: [64, 361, 261, 97], size: [390, 844.5] },
  '/mobile/reading-2.webp': { d: [66, 374, 265, 119], size: [390, 844.5] },
  '/mobile/reading-3.webp': { d: [52, 290, 286, 105], size: [390, 844.5] },
  '/mobile/reading-4.webp': { d: [70, 640, 250, 118], size: [390, 844.5] },
  '/mobile/grocery-1.webp': { d: [50, 413, 292, 212], size: [390, 844.5] },
  '/mobile/grocery-2.webp': { d: [51, 564, 140, 96], size: [390, 844.5] },
  '/mobile/grocery-3.webp': { d: [56, 699, 281, 27], size: [390, 844.5] },
  '/showcase/incentiv/web-03.webp': { d: [220, 496, 453, 45], size: [1440, 900] },
  '/mobile/bookstore-1.webp': { d: [74, 539, 242, 76], size: [390, 844.5] },
  '/mobile/bookstore-2.webp': { d: [59, 494, 274, 121], size: [390, 844.5] },
  '/mobile/bookstore-3.webp': { d: [58, 545, 275, 156], size: [390, 844.5] },
  '/showcase/design-system/boards/board-02-1080.webp': { d: [1175, 485, 320, 190], size: [1600, 1000], file: '/showcase/design-system/boards/board-02.webp' },
  '/showcase/design-system/boards/board-03-1080.webp': { d: [1010, 715, 310, 120], size: [1600, 1000], file: '/showcase/design-system/boards/board-03.webp' },
  '/showcase/design-system/boards/board-04-1080.webp': { d: [740, 390, 400, 230], size: [1600, 1000], file: '/showcase/design-system/boards/board-04.webp' },
  '/showcase/design-system/boards/board-05-1080.webp': { d: [925, 340, 280, 240], size: [1600, 1000], file: '/showcase/design-system/boards/board-05.webp' },
  '/showcase/design-system/boards/board-06-1080.webp': { d: [600, 560, 400, 250], size: [1600, 1000], file: '/showcase/design-system/boards/board-06.webp' },
  '/showcase/design-system/boards/board-07-1080.webp': { d: [1255, 427, 255, 210], size: [1600, 1000], file: '/showcase/design-system/boards/board-07.webp' },
  '/personal/shots/futurisma-frostline-1.webp': { d: [1124, 770, 274, 94], size: [1440, 900] },
  '/personal/shots/futurisma-frostline-2.webp': { d: [1124, 770, 277, 94], size: [1440, 900] },
  '/personal/shots/futurisma-frostline-3.webp': { d: [1124, 770, 274, 94], size: [1440, 900] },
  '/personal/shots/futurisma-garage.webp': { d: [1095, 293, 310, 287], size: [1440, 900] },
}

/**
 * A board's geometry as CSS variables, in % of the screen's width (`--b*` and `--c*`) or height (`--by`, `--bh`): the
 * marked area, the callout under it (centred on the area, kept on the screen), and `--drop`, how far the callout reaches
 * below the screen, so the board's words start under it. `-n` is the phone layout, where the callout sits under the
 * screen at full width.
 */
function boardVars([x, y, w, h]: Rect, [W, H]: [number, number] = [1440, 900]) {
  const cw = (w / W) * ZOOM * 100
  const cx = ((x + w / 2) / W) * 100
  return {
    '--bx': `${(x / W) * 100}%`, '--by': `${(y / H) * 100}%`, '--bw': `${(w / W) * 100}%`, '--bh': `${(h / H) * 100}%`,
    '--cx': `${cx}%`, '--cw': `${cw}%`, '--cl': `${Math.min(Math.max(cx - cw / 2, 0), 102 - cw)}%`, '--ca': `${w} / ${h}`,
    '--zx': `${(x / (W - w)) * 100}%`, '--zy': `${(y / (H - h)) * 100}%`, '--zs': `${(W / w) * 100}%`,
    '--drop': `${Math.max(((y + h) / W) * 100 + (cw * h) / w - (H / W) * 100, 0)}%`, '--drop-n': `${(100 * h) / w}%`,
  } as Vars
}

/** The decision a stage or a list item is pointing at: lit while hovered or focused, pinned by a click or tap. */
type Mark = { lit: number | null; pinned: number | null; setLit(d: number | null): void; pin(d: number | null): void }

type Picture = { src: string; alt: string; caption: string; width: number; height: number }

/**
 * The case's screens as one guided stage: a single large glass slab and, beside it, the screens by name. Picking a name
 * crossfades the slab (2 px blur, exit 160 ms, entry 220 ms; instant from the keyboard), so each screen is shown big
 * enough to read and they read in order. A click or tap opens the screen at full size; a screen that carries a decision
 * shows its marker; on phones the names become a swipeable row and the slab takes a sideways swipe.
 */
function Gallery({ items, slug, at, setAt, mark, decisions }: {
  items: Picture[]; slug: string; at: number; setAt(i: number): void; mark: Mark; decisions: string[]
}) {
  const [armed, setArmed] = useState(false)
  const [instant, setInstant] = useState(false)
  const full = useRef<FullSizeHandle>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const row = useRef<HTMLOListElement>(null)
  // On phones the names are a sideways row: keep the shown screen's name in it, after a tap on a half-hidden name or a
  // swipe on the slab. Sideways only, so the page itself never moves.
  useEffect(() => {
    const r = row.current, b = r?.children[at] as HTMLElement | undefined
    if (!r || !b || r.scrollWidth <= r.clientWidth) return
    const rr = r.getBoundingClientRect(), br = b.getBoundingClientRect()
    if (br.left < rr.left || br.right > rr.right) {
      r.scrollTo({ left: r.scrollLeft + br.left - rr.left - (rr.width - br.width) / 2, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    }
  }, [at])
  const g = items[at]
  const m = MARKERS[g.src]?.slug === slug ? MARKERS[g.src] : undefined
  const open = !!m && (mark.lit === m.decision || mark.pinned === m.decision)
  const b = BOARDS[g.src]
  const bv = b && boardVars(b.detail)
  const c = b ? undefined : CROPS[g.src]
  const cv = c && boardVars(c.d, c.size)
  const phone = items[0].height > items[0].width
  const wrap = (i: number) => ((i % items.length) + items.length) % items.length
  // A new screen drops a pinned decision: the list must not light a line whose marker is no longer shown.
  const pick = (i: number, inst: boolean) => { setArmed(true); setInstant(inst); mark.pin(null); setAt(wrap(i)) }
  // The names are tabs (WAI-ARIA): one tab stop, arrows and Home/End move between them and show the screen at once.
  const keys = (e: React.KeyboardEvent) => {
    const d = ({ ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 } as Record<string, number>)[e.key]
    const i = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : d === undefined ? null : wrap(at + d)
    if (i === null) return
    e.preventDefault()
    pick(i, true)
    row.current?.querySelectorAll('button')[i]?.focus()
  }
  // The callout's area, in the capture's own pixels (its detail is in the screen's 1440-wide CSS pixels).
  const focusOf = ([x, y, w, h]: Rect, W = 1440): [number, number] => [(x + w / 2) * (g.width / W), (y + h / 2) * (g.width / W)]

  return (
    <div className="re-cs-gallery" data-shape={phone ? 'phone' : 'wide'}>
      <figure
        className="re-sw-slab re-cs-stage" style={{ '--ga': `${items[0].width} / ${items[0].height}` } as Vars} data-swipe=""
        onPointerDown={(e) => { if (e.pointerType === 'touch') { start.current = { x: e.clientX, y: e.clientY }; setArmed(true) } }}
        onPointerUp={(e) => {
          const s0 = start.current
          start.current = null
          if (!s0) return
          const dx = e.clientX - s0.x, dy = e.clientY - s0.y
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) pick(at + (dx < 0 ? 1 : -1), false)
        }}
      >
        <div className="re-sw-screen re-cs-stage-screen" id="re-cs-panel" role="tabpanel" aria-labelledby={`re-cs-tab-${at}`} data-swap data-instant={instant || undefined}>
          {items.map((it, i) => (i === at || armed) && (
            <img key={it.src} src={it.src} width={it.width} height={it.height} alt={i === at ? it.alt : ''} aria-hidden={i !== at || undefined}
              data-on={i === at || undefined} loading="lazy" decoding="async" />
          ))}
          {m && (
            <div className="re-cs-mark-layer">
              <button
                key={g.src} type="button" className="re-cs-mark" aria-expanded={open} aria-controls="re-cs-mark-text"
                aria-label="The decision on this screen" data-open={open || undefined}
                data-side={m.x / m.w > 0.6 ? 'left' : 'right'} data-up={m.up || undefined}
                style={{ left: `${(m.x / m.w) * 100}%`, top: `${(m.y / m.h) * 100}%` }}
                onPointerEnter={(e) => { if (e.pointerType === 'mouse') mark.setLit(m.decision) }} onPointerLeave={() => mark.setLit(null)}
                onFocus={() => mark.setLit(m.decision)} onBlur={() => mark.setLit(null)}
                onClick={() => mark.pin(mark.pinned === m.decision ? null : m.decision)}
              >
                <span className="re-cs-mark-label" aria-hidden="true">{decisions[m.decision]}</span>
              </button>
            </div>
          )}
          {b && (
            <div key={g.src} className="re-cs-mark-layer re-cs-board" style={bv}>
              <span className="re-cs-board-area" aria-hidden="true" />
              <span className="re-cs-board-lead" aria-hidden="true" />
              <button type="button" className="re-cs-board-zoom" aria-label={`${b.zoom}, at full size`} onClick={() => full.current?.open(focusOf(b.detail))}>
                <span className="re-cs-board-zoom-tag" aria-hidden="true">{b.zoom}</span>
                <span className="re-cs-board-crop" aria-hidden="true" style={{ backgroundImage: `url("${g.src}")` }} />
              </button>
            </div>
          )}
          {c && (
            <div key={g.src} className="re-cs-mark-layer re-cs-board re-cs-crop" style={{ ...cv, aspectRatio: `${c.size[0]} / ${c.size[1]}` }} aria-hidden="true">
              <span className="re-cs-board-area" />
            </div>
          )}
        </div>
        <button type="button" className="re-sw-real" aria-label={`${g.alt}, at full size`} onClick={() => full.current?.open()} />
        <figcaption aria-live="polite" className={b ? 're-sr' : undefined}>{b ? b.title : g.caption || g.alt}</figcaption>
      </figure>
      {c && (
        <button key={g.src} type="button" className="re-cs-crop-zoom" style={cv} aria-label={`${g.caption || g.alt}, the outlined part at full size`}
          onClick={() => full.current?.open(focusOf(c.d, c.size[0]))}>
          <span className="re-cs-board-crop" style={{ backgroundImage: `url("${c.file ?? g.src}")` }} />
        </button>
      )}
      {m && <p id="re-cs-mark-text" className="re-cs-mark-text" hidden={!open}>{decisions[m.decision]}</p>}
      {b && (
        <div key={g.src} className="re-cs-board-text" style={bv}>
          <h3 className="re-cs-board-title">{b.title}</h3>
          <p className="re-cs-board-line">{b.lead}</p>
          <div className="re-cs-board-on">
            <h4>On this screen</h4>
            <ol>{b.items.map((t) => <li key={t}>{t}</li>)}</ol>
          </div>
        </div>
      )}
      <ol ref={row} className="re-cs-stage-list" role="tablist" aria-label="Screens" onKeyDown={keys} onPointerEnter={() => setArmed(true)} onFocus={() => setArmed(true)}>
        {items.map((it, i) => (
          <li key={it.src} role="presentation">
            <button type="button" role="tab" id={`re-cs-tab-${i}`} aria-selected={i === at} aria-controls="re-cs-panel" tabIndex={i === at ? 0 : -1}
              onClick={(e) => pick(i, e.detail === 0)}>
              <img src={it.src} alt="" loading="lazy" decoding="async" />
              <span>{it.caption || it.alt}</span>
            </button>
          </li>
        ))}
      </ol>
      <FullSize ref={full} src={g.src} w={g.width} h={g.height} alt={g.alt} label={g.caption || undefined} step={(d) => pick(at + d, true)}
        refocus={() => row.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus()} />
    </div>
  )
}

/**
 * A decision with its road not taken: the clause from "rather than" or "instead of" on is the option that was turned down,
 * set apart so a reader sees both the choice and its cost. Decisions without one read as they are.
 */
function Road({ text }: { text: string }) {
  const m = text.match(/^(.*?)(,?\s)(rather than|instead of)\b(.*)$/)
  if (!m) return <>{text}</>
  return <>{m[1]}{m[2]}<span className="re-cs-not">{m[3]}{m[4]}</span></>
}

/**
 * A product's full case, inside the draft. It opens on the screen the chapter showed, then reads in one column: the
 * question and its answer, the context, the problem beside the decision, the three layers, the details, the screens, and
 * the next case. The writing is the same sourced brief the Exploded View pages use.
 */
export function CasePage({ slug, onBack }: { slug: string; onBack(): void }) {
  const at = systems.findIndex((s) => s.slug === slug)
  const s = systems[at]
  const c = caseDetails[slug]
  const prev = systems[(at - 1 + systems.length) % systems.length]
  const next = systems[(at + 1) % systems.length]
  const heading = useRef<HTMLHeadingElement>(null)
  const stage = useRef<HTMLElement>(null)
  // The stage's screen and the lit or pinned decision belong to this case: another case starts from the first screen.
  const [view, setView] = useState({ slug, shown: 0, lit: null as number | null, pinned: null as number | null })
  const v = view.slug === slug ? view : { slug, shown: 0, lit: null, pinned: null }
  const { shown, lit, pinned } = v
  const setShown = (i: number) => setView((o) => ({ ...(o.slug === slug ? o : v), shown: i }))
  const setLit = (d: number | null) => setView((o) => ({ ...(o.slug === slug ? o : v), lit: d }))
  const setPinned = (d: number | null) => setView((o) => ({ ...(o.slug === slug ? o : v), pinned: d }))
  const mark: Mark = { lit, pinned, setLit, pin: setPinned }

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [slug])

  // From the decision list to the screen: show the screen that carries this decision, mark it, and bring the stage into view.
  const showOnScreen = (d: number, keyboard: boolean) => {
    const i = s.gallery.findIndex((g) => MARKERS[g.src]?.slug === slug && MARKERS[g.src].decision === d)
    if (i < 0) return
    setView({ ...v, shown: i, pinned: d })
    stage.current?.scrollIntoView({ block: 'center', behavior: keyboard || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  const marked = new Set(Object.values(MARKERS).filter((x) => x.slug === slug).map((x) => x.decision))

  const links = [...s.links, ...(c?.links ?? [])].filter((l, i, all) => !l.href.startsWith('/') && all.findIndex((x) => x.href === l.href) === i)
  const result = c?.result ?? s.story?.result
  const problem = c?.didntWork ? { title: c.didntWork.label, items: [c.didntWork.text] } : c && { title: 'Constraints', items: c.constraints }

  return (
    <article className="re-casepage" data-stage={STAGE.ledger} aria-labelledby="re-case-h" key={slug}>
      <nav className="re-case-top">
        <button type="button" className="re-btn re-btn-quiet re-solid" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          All work
        </button>
      </nav>

      <header className="re-cs-landing" data-shape={isPhone(slug, s.name) ? 'phone' : 'wide'}>
        <div className="re-cs-media">
          <Hero slug={slug} name={s.name} named />
          {INVENTED.has(s.slug) && <p className="re-cs-cap">Real product screens, invented data.</p>}
        </div>
        <div className="re-cs-words">
          <p className="re-cs-name">{s.name}</p>
          <p className="re-cs-meta">{[s.kind, s.years].filter(Boolean).join(' · ')}</p>
          <h1 id="re-case-h" ref={heading} tabIndex={-1} className="re-cs-q">{questionOf(slug) ?? s.line}</h1>
          {result && <p className="re-cs-result">{result}</p>}
          {s.readouts.length > 0 && (
            <ul className="re-cs-readouts">
              {s.readouts.map((r) => (
                <li key={r.label}>
                  <b className="re-num">
                    {r.value}
                    {r.to && (<><ArrowRightIcon size={14} weight="regular" aria-hidden="true" /><span className="re-sr"> to </span>{r.to}</>)}
                  </b>
                  <span>{r.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <div className="re-cs-body re-solid">
        {c && (
          <dl className="re-case-context">
            <div><dt className="re-num">Product</dt><dd>{c.context.product}</dd></div>
            <div><dt className="re-num">Users</dt><dd>{c.context.users}</dd></div>
            <div><dt className="re-num">My role</dt><dd>{c.context.role}</dd></div>
            <div><dt className="re-num">Time</dt><dd>{c.context.time}</dd></div>
          </dl>
        )}

        {c && problem ? (
          <section aria-labelledby="re-road-h">
            <h2 id="re-road-h" className="re-sr">How the decision was made</h2>
            <ol className="re-cs-road">
              <li>
                <span className="re-num">01</span>
                <h3 className="re-cs-h2">{problem.title}</h3>
                <ul className="re-cs-list">{problem.items.map((x) => <li key={x}>{x}</li>)}</ul>
              </li>
              <li>
                <span className="re-num">02</span>
                <h3 className="re-cs-h2">The decision that worked</h3>
                <ul className="re-cs-list">
                  {c.decision.map((x, d) => (
                    <li key={x} data-lit={(marked.has(d) && (lit === d || pinned === d)) || undefined}>
                      <Road text={x} />
                      {marked.has(d) && (
                        <button type="button" className="re-cs-show" onClick={(e) => showOnScreen(d, e.detail === 0)}
                          onPointerEnter={() => setLit(d)} onPointerLeave={() => setLit(null)}>
                          Show on screen
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
              {c.differently && (
                <li>
                  <span className="re-num">03</span>
                  <h3 className="re-cs-h2">What I'd do differently</h3>
                  <p className="re-cs-text">{c.differently}</p>
                </li>
              )}
            </ol>
          </section>
        ) : (
          s.story && <section><h2 className="re-cs-h2">What was built</h2><p className="re-cs-text">{s.story.built}</p></section>
        )}

        {s.layers.length > 0 && (
          <section aria-labelledby="re-layers-h">
            <h2 id="re-layers-h" className="re-cs-h2">The three layers</h2>
            <ol className="re-cs-layers">
              {s.layers.map((l, i) => (
                <li key={l.title}>
                  <span className="re-num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{l.title}</h3>
                  <p className="re-cs-stack">{l.stack}</p>
                  <p>{l.description}</p>
                </li>
              ))}
            </ol>
          </section>
        )}
        {c && (c.engineering.length > 0 || c.record) && (
          <details className="re-eng">
            <summary>
              <span>Engineering details</span>
              <CaretDownIcon className="re-eng-caret" size={14} weight="bold" aria-hidden="true" />
            </summary>
            <div className="re-eng-body">
              {c.engineering.map((g) => (
                <section key={g.title}>
                  <h3 className="re-num">{g.title}</h3>
                  <ul className="re-case-list">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
                </section>
              ))}
              {c.record && (
                <section>
                  <h3 className="re-num">{c.record.title}</h3>
                  <ol className="re-record">
                    {c.record.rows.map((r) => (
                      <li key={r.what}>
                        <span className="re-num">{r.when}</span>
                        <div>
                          <strong>{r.what}</strong>
                          <pre className="re-num">{r.lines.join('\n')}</pre>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </div>
          </details>
        )}

        {links.length > 0 && (
          <ul className="re-links">
            {links.map((l) => (
              <li key={l.href}>
                <a className="re-btn" href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                  <ArrowUpRightIcon size={14} weight="bold" aria-hidden="true" />
                  <span className="re-sr"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {s.gallery.length > 0 && (
        <section ref={stage} className="re-cs-screens" aria-labelledby="re-screens-h">
          <h2 id="re-screens-h" className="re-cs-h2">Screens</h2>
          {s.gallery.some((g) => g.alt.includes('Invented data')) && <p className="re-case-note re-num">Recreated screens, with invented data.</p>}
          <Gallery items={s.gallery} slug={slug} at={Math.min(shown, s.gallery.length - 1)} setAt={setShown} mark={mark} decisions={c?.decision ?? []} />
        </section>
      )}

      <nav className="re-cs-next" aria-label="More cases">
        <Link className="re-cs-next-main re-solid" to={`${BASE}/${next.slug}`}>
          <span className="re-cs-next-words">
            <span className="re-cs-next-label">Next</span>
            <strong>{next.name}</strong>
            <span className="re-cs-next-q">{questionOf(next.slug) ?? next.line}</span>
          </span>
          <Hero slug={next.slug} name={next.name} />
        </Link>
        <Link className="re-cs-prev re-solid" to={`${BASE}/${prev.slug}`}>
          <ArrowLeftIcon size={14} weight="regular" aria-hidden="true" />
          <span>Previous: {prev.name}</span>
        </Link>
      </nav>
    </article>
  )
}
