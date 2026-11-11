import { DecisionStories } from "./DecisionStories"
import { decisionStories } from "./decisionStoryData"
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon, CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react'
import { caseDetails } from "./caseDetails"
import { STAGE } from "./sceneSupport"
import { cropVars, LEADS, srcSetOf } from "./screens"
import { FullSize, type FullSizeHandle } from "./FullSize"
import { BASE, INVENTED } from "./data"
import { cases } from "./products"
import { pixelReveal } from "./pixelReveal"

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
      <div className="re-sw-screen"><img src={shot.src} width={shot.w} height={shot.h} alt={shot.alt} fetchPriority="high" decoding="async" /></div>
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
 * The care platform's boards: the titles of public/showcase/care-dashboard/boards/board-03 and board-04 (the Loop's case
 * boards, word for word), which say what the claims and calendar screens are for. They are those screens' lines.
 */
const BOARDS: Record<string, { title: string }> = {
  '/showcase/care-dashboard/claims.webp': { title: 'Claims that need another look stand out.' },
  '/showcase/care-dashboard/appointments-week.webp': { title: 'A care team’s week on one calendar.' },
}

type Rect = [x: number, y: number, w: number, h: number]

/** The decision a stage or a list item is pointing at: lit while hovered or focused, pinned by a click or tap. */
type Mark = { lit: number | null; pinned: number | null; setLit(d: number | null): void; pin(d: number | null): void }

/**
 * Case headings are statements, not questions (owner, 2026-10-29), each an existing line: the care platform's is the
 * owner's own H1 (CONTENT.md §2); Bayyinah leads with the rebuild and its live streams (§3 title, per the owner's
 * 2026-10-27 emphasis); the rest are the chapter headlines or the cases' own lines. The own products use their own words:
 * Offday's landing headline, and the first line of LeakScan's README. Alternatives:
 * design/reviews/refractive-engine-hiring/CASE-H1-OPTIONS.md.
 */
const CASE_H1: Record<string, string> = {
  'care-platform': 'Rebuilding a live care platform, one tested screen at a time.',
  'bayyinah-tv': 'A video-learning platform, rebuilt from scratch with live streams.',
  'read-to-feed': "Kept a children's reading app shipping for four years.",
  'design-system-react': 'One shared library, checked before release.',
  'viva-fresh': 'A grocery shop, delivery slots and loyalty in one mobile app.',
  incentiv: 'Signing in to a Web3 wallet as simply as to a normal app.',
  'dukagjini-bookstore': 'Bringing readers back to a book they were looking at.',
  futurisma: 'A 3D racing game built with an AI crew, quality kept in hand.',
  offday: 'Time off, without the back-and-forth.',
  leakscan: 'Security scans for AI-built apps.',
}

type Picture = { src: string; alt: string; caption: string; width: number; height: number }

/**
 * Phone screens without their store art: the app's own area of each store frame (780 × 1689, in its pixels), in the
 * order the app is used, with one line each, taken from the frame's own description.
 */
const APP: Record<string, { crop: Rect; line: string }> = {
  '/mobile/reading-1.webp': { crop: [100, 540, 580, 1060], line: 'Reading progress for each book' },
  '/mobile/reading-3.webp': { crop: [100, 440, 580, 1060], line: 'The chapter reader, with a Keep Reading sheet' },
  '/mobile/reading-2.webp': { crop: [100, 600, 580, 1060], line: 'Eggs collected and quiz badges' },
  '/mobile/reading-4.webp': { crop: [100, 629, 580, 1060], line: 'Each egg earned helps a child in need' },
  '/mobile/grocery-1.webp': { crop: [100, 380, 580, 1060], line: 'Product categories and the latest products' },
  '/mobile/grocery-2.webp': { crop: [100, 380, 580, 1060], line: 'One category, with the cart total' },
  '/mobile/grocery-3.webp': { crop: [100, 380, 580, 1060], line: 'Quantities, discount and checkout' },
  '/mobile/bookstore-1.webp': { crop: [108, 714, 564, 975], line: 'Book search, top categories and books on sale' },
  '/mobile/bookstore-2.webp': { crop: [108, 714, 564, 975], line: 'Ratings, prices and favourites' },
  '/mobile/bookstore-3.webp': { crop: [108, 714, 564, 975], line: 'Favourite lists and book categories' },
}
const order = Object.keys(APP)
/** The frames' captions name the device too ("Home, iPhone"); the loop is all one phone. */
const name = (p: Picture) => p.caption.replace(/, iPhone$/, '')

/**
 * A screen's one line: the phone apps' own line, a care board's title, or the first clause of the picture's description
 * (after its "Product screen:" label, without "Invented data."), cut at a comma near 90 characters. LINES rewrites the
 * ones that read badly that way, from the same description.
 */
const LINES: Record<string, string> = {
  '/showcase/care-dashboard/vitals-graph.webp': "One patient's glucose graph, with a 7-day trend",
  '/showcase/bayyinah/web-01.webp': 'The hero, with the app on a laptop, a monitor and phones',
  '/showcase/bayyinah/web-06.webp': 'Choose Your Plan, with a monthly and annual switch',
  '/showcase/bayyinah/store-01.webp': 'The App Store frame for the home screen',
  '/showcase/bayyinah/store-02.webp': 'The surah list and the video player',
  '/showcase/design-system/boards/board-03-1080.webp': "Four variants by seven tones, each label's contrast measured",
  '/showcase/design-system/boards/board-04-1080.webp': 'A complete care-team screen made only from library parts',
  '/showcase/design-system/boards/board-07-1080.webp': 'Six steps from edit to release, and 96.6% less JavaScript',
  '/personal/shots/futurisma-frostline-2.webp': 'Under a clock tower and the FROSTLINE / MIDNIGHT RUN arch',
  '/showcase/offday/offday-landing-hero.webp': 'The headline, the pitch and the top of the product demo',
  '/showcase/offday/offday-landing-rest.webp': 'Best dates, who needs a break, heads-ups and bridge days',
  '/showcase/offday/offday-landing-features.webp': 'The shared calendar, balances, roles, overlaps and private notes',
  '/showcase/offday/offday-landing-security.webp': 'One request as four people see it, above six safeguards',
  '/showcase/leakscan/leakscan-desktop-hero-scan.webp': 'The address field and the app model with the scan passing through it',
  '/showcase/leakscan/leakscan-desktop-checks.webp': 'Seven checks, each tagged Free check or Full Scan',
  '/showcase/leakscan/leakscan-desktop-fix.webp': 'A finding beside the fix prompt written for it',
  '/showcase/leakscan/leakscan-desktop-how.webp': 'Seven steps from proving the app is yours to the report',
}
const lineOf = (p: Picture) => {
  const own = APP[p.src]?.line ?? BOARDS[p.src]?.title ?? LINES[p.src]
  if (own) return own
  let t = p.alt.replace(/\s*Invented data\.?$/, '')
  const label = t.indexOf(': ')
  if (label > 0 && label < 60) t = t.slice(label + 2)
  t = t.split(/(?<=[a-z0-9)])\. /)[0].replace(/\.$/, '')
  const cut = t.lastIndexOf(', ', 90)
  if (t.length > 90 && cut > 0) t = t.slice(0, cut)
  return t[0].toUpperCase() + t.slice(1)
}

/**
 * A case's screens as one loop. Phone apps show all their screens at once on a desktop; wide screens (and phones on a
 * phone) are a sideways row, the next screen peeking in, with dots that follow it and, for wide screens, ‹ › to step.
 * Each screen opens at full size; a screen that carries a decision shows its marker.
 */
function Loop({ items, slug, at, instant, setAt, mark, decisions }: {
  items: Picture[]; slug: string; at: number; instant: boolean; setAt(i: number, instant: boolean): void; mark: Mark; decisions: string[]
}) {
  const full = useRef<FullSizeHandle>(null)
  const row = useRef<HTMLOListElement>(null)
  const wide = items[0].width > items[0].height
  // Which screen leads the row (for the dots), and whether the row can step either way (for ‹ ›).
  const [lead, setLead] = useState(0)
  const [ends, setEnds] = useState({ start: true, end: false })
  const shots = wide ? items : [...items].sort((a, b) => order.indexOf(a.src) - order.indexOf(b.src))
  // `at` indexes `items`; a phone loop shows them in the app's order.
  const g = items[at] ?? items[0]
  const here = shots.indexOf(g)
  const motion = (inst: boolean) => (inst || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth')
  const kids = () => [...(row.current?.children ?? [])] as HTMLElement[]
  const go = (i: number, inst: boolean) => {
    const r = row.current, k = kids()
    if (r && k[i]) r.scrollTo({ left: k[i].offsetLeft - k[0].offsetLeft, behavior: motion(inst) })
  }
  // "Show on screen" picks a screen: bring it into the row's view, sideways only.
  useEffect(() => {
    const r = row.current
    if (r && r.scrollWidth > r.clientWidth) go(here, instant)
  }, [here, instant]) // eslint-disable-line react-hooks/exhaustive-deps
  const scrolled = () => {
    const r = row.current, k = kids()
    if (!r || !k.length) return
    const end = r.scrollLeft + r.clientWidth >= r.scrollWidth - 2
    setLead(end ? k.length - 1 : k.reduce((b, c, i) => (Math.abs(c.offsetLeft - k[0].offsetLeft - r.scrollLeft) < Math.abs(k[b].offsetLeft - k[0].offsetLeft - r.scrollLeft) ? i : b), 0))
    setEnds({ start: r.scrollLeft < 2, end })
  }
  const step = (d: number) => setAt(items.indexOf(shots[(here + d + shots.length) % shots.length]), true)
  return (
    <div className="re-cs-loop-wrap" data-shape={wide ? 'wide' : 'phone'}>
      <ol ref={row} className="re-cs-loop" style={{ '--n': shots.length } as Vars} onScroll={scrolled}>
        {shots.map((it) => {
          const crop: Rect = APP[it.src]?.crop ?? [0, 0, it.width, it.height]
          const m = MARKERS[it.src]?.slug === slug ? MARKERS[it.src] : undefined
          const open = !!m && (mark.lit === m.decision || mark.pinned === m.decision)
          const shot = { src: it.src, alt: it.alt, w: it.width, h: it.height }
          // A marker's point is in its own file's pixels, which may be twice the picture's.
          const [mx, my] = m ? [((m.x * it.width) / m.w - crop[0]) / crop[2], ((m.y * it.width) / m.w - crop[1]) / crop[3]] : [0, 0]
          return (
            <li key={it.src} style={{ '--a': crop[2] / crop[3] } as Vars}>
              <figure className="re-cs-loop-card">
                <div className="re-cs-loop-shot">
                  <div className="re-sw-screen" style={{ ...cropVars(shot, crop), ...cropVars(shot, crop, 'n') } as Vars}>
                    <img ref={pixelReveal} src={it.src} srcSet={srcSetOf(it.src)} sizes={wide ? '(max-width: 599px) 88vw, (max-width: 1023px) 82vw, 900px' : undefined}
                      width={it.width} height={it.height} alt={it.alt} draggable={false} loading="lazy" decoding="async" />
                  </div>
                  <button type="button" className="re-sw-real" aria-label={`${name(it)}, at full size`} onClick={() => { setAt(items.indexOf(it), false); full.current?.open() }} />
                  {m && (
                    <button
                      type="button" className="re-cs-mark" aria-expanded={open} aria-controls="re-cs-mark-text"
                      aria-label="The decision on this screen" data-open={open || undefined} data-side={mx > 0.6 ? 'left' : 'right'} data-up={m.up || undefined}
                      style={{ left: `${mx * 100}%`, top: `${my * 100}%` }}
                      onPointerEnter={(e) => { if (e.pointerType === 'mouse') mark.setLit(m.decision) }} onPointerLeave={() => mark.setLit(null)}
                      onFocus={() => mark.setLit(m.decision)} onBlur={() => mark.setLit(null)}
                      onClick={() => mark.pin(mark.pinned === m.decision ? null : m.decision)}
                    >
                      <span className="re-cs-mark-label" aria-hidden="true">{decisions[m.decision]}</span>
                    </button>
                  )}
                </div>
                <figcaption><span className="re-cs-loop-name">{name(it)}</span>{lineOf(it)}</figcaption>
              </figure>
            </li>
          )
        })}
      </ol>
      {shots.length > 1 && (
        <div className="re-cs-loop-bar">
          <p className="re-cs-loop-dots" aria-hidden="true">{shots.map((it, i) => <i key={it.src} data-on={i === lead || undefined} />)}</p>
          {wide && (
            <>
              <button type="button" className="re-cs-loop-step" aria-label="Previous screens" disabled={ends.start} onClick={(e) => go(Math.max(lead - 1, 0), e.detail === 0)}>
                <CaretLeftIcon size={18} weight="regular" aria-hidden="true" />
              </button>
              <button type="button" className="re-cs-loop-step" aria-label="Next screens" disabled={ends.end} onClick={(e) => go(Math.min(lead + 1, shots.length - 1), e.detail === 0)}>
                <CaretRightIcon size={18} weight="regular" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
      {shots.map((it) => {
        const m = MARKERS[it.src]?.slug === slug ? MARKERS[it.src] : undefined
        return m && <p key={it.src} id="re-cs-mark-text" className="re-cs-mark-text" hidden={!(mark.lit === m.decision || mark.pinned === m.decision)}>{decisions[m.decision]}</p>
      })}
      <FullSize ref={full} src={g.src} w={g.width} h={g.height} alt={g.alt} label={g.caption || undefined} step={step} />
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
/**
 * `rest` false (or 0) renders the first screen only (the top bar and the landing), for the frame a case opens on. After
 * that the body (1), the screens (2) and the next case (3) mount a frame apart: mounted together they were one 52-78 ms
 * frame at 4x CPU (measured 2026-11-11), each alone stays inside a frame. `true` is everything at once (a direct visit).
 */
export function CasePage({ slug, rest = true, onBack }: { slug: string; rest?: boolean | number; onBack(): void }) {
  const part = rest === true ? 3 : rest === false ? 0 : rest
  const at = cases.findIndex((s) => s.slug === slug)
  const s = cases[at]
  const c = caseDetails[slug]
  const prev = cases[(at - 1 + cases.length) % cases.length]
  const next = cases[(at + 1) % cases.length]
  const heading = useRef<HTMLHeadingElement>(null)
  const stage = useRef<HTMLElement>(null)
  // The stage's screen and the lit or pinned decision belong to this case: another case starts from the first screen.
  // `instant`: the shown screen came from a key, so it and its marks arrive without motion.
  const [view, setView] = useState({ slug, shown: 0, instant: false, lit: null as number | null, pinned: null as number | null })
  const v = view.slug === slug ? view : { slug, shown: 0, instant: false, lit: null, pinned: null }
  const { shown, instant, lit, pinned } = v
  const setShown = (i: number, instant: boolean) => setView((o) => ({ ...(o.slug === slug ? o : v), shown: i, instant }))
  const setLit = (d: number | null) => setView((o) => ({ ...(o.slug === slug ? o : v), lit: d }))
  const setPinned = (d: number | null) => setView((o) => ({ ...(o.slug === slug ? o : v), pinned: d }))
  const mark: Mark = { lit, pinned, setLit, pin: setPinned }

  // Focus waits for the frame that lays the case out: focusing inside the open's commit made the browser lay out the whole
  // new page right there (22-24 ms at 4x CPU, measured 2026-11-11); a task after that frame finds the layout done.
  useEffect(() => {
    let timer = 0
    const frame = requestAnimationFrame(() => { timer = window.setTimeout(() => heading.current?.focus({ preventScroll: true })) })
    return () => { cancelAnimationFrame(frame); clearTimeout(timer) }
  }, [slug])

  // From the decision list to the screen: show the screen that carries this decision, mark it, and bring the stage into view.
  const showOnScreen = (d: number, keyboard: boolean) => {
    const i = s.gallery.findIndex((g) => MARKERS[g.src]?.slug === slug && MARKERS[g.src].decision === d)
    if (i < 0) return
    setView({ ...v, shown: i, instant: keyboard, pinned: d })
    stage.current?.scrollIntoView({ block: 'center', behavior: keyboard || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  const marked = new Set(Object.values(MARKERS).filter((x) => x.slug === slug).map((x) => x.decision))

  const links = [...s.links, ...(c?.links ?? [])].filter((l, i, all) => !l.href.startsWith('/') && all.findIndex((x) => x.href === l.href) === i)
  const result = c?.result ?? s.story?.result
  const problem = c?.didntWork ? { title: c.didntWork.label, items: [c.didntWork.text] } : c && { title: 'Constraints', items: c.constraints }

  return (
    <article className="re-casepage" data-stage={STAGE.ledger} data-landing-only={part === 0 || undefined} aria-labelledby="re-case-h" key={slug}>
      <nav className="re-case-top">
        <button type="button" className="re-btn re-btn-quiet re-solid" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          All work
        </button>
      </nav>

      <header className="re-cs-landing" data-shape={isPhone(slug, s.name) ? 'phone' : 'wide'}>
        <div className="re-cs-words">
          <div className="re-cs-summary">
            <h1 id="re-case-h" ref={heading} tabIndex={-1} className="re-cs-q">{CASE_H1[slug] ?? s.line}</h1>
            <p className="re-cs-name">{[s.name, s.kind, s.years].filter(Boolean).join(' · ')}</p>
            {/* A case without its context table (the own products) names the role on a line of its own. */}
            {!c && <p className="re-cs-name">{s.role}</p>}
            {result && <p className="re-cs-result">{result}</p>}
          </div>
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
        <div className="re-cs-media">
          <Hero slug={slug} name={s.name} named />
          {INVENTED.has(s.slug) && <p className="re-cs-cap">Real product screens, invented data.</p>}
        </div>
      </header>

      {part >= 1 && (
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
                  <h3 className="re-cs-h2">{problem.title}</h3>
                  <ul className="re-cs-list">{problem.items.map((x) => <li key={x}>{x}</li>)}</ul>
                </li>
                <li>
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
                    <h3 className="re-cs-h2">What I'd do differently</h3>
                    <p className="re-cs-text">{c.differently}</p>
                  </li>
                )}
              </ol>
            </section>
          ) : (
            !decisionStories[slug] && s.story && <section><h2 className="re-cs-h2">What was built</h2><p className="re-cs-text">{s.story.built}</p><p className="re-cs-stack">{s.stack.join(', ')}</p></section>
          )}

          <DecisionStories slug={slug} />

          {s.layers.length > 0 && (
            <section aria-labelledby="re-layers-h">
              <h2 id="re-layers-h" className="re-cs-h2">{s.layersTitle ?? 'The three layers'}</h2>
              <ol className="re-cs-layers">
                {s.layers.map((l) => (
                  <li key={l.title}>
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
      )}

        {part >= 2 && s.gallery.length > 0 && (
          <section ref={stage} className="re-cs-screens" aria-labelledby="re-screens-h">
            <h2 id="re-screens-h" className="re-cs-h2">Screens</h2>
            {s.gallery.some((g) => g.alt.includes('Invented data')) && <p className="re-case-note re-num">Real product screens, invented data.</p>}
            {/* Web screens and phone screens each get their own loop (Bayyinah has both): one row shares one height. */}
            {[s.gallery.filter((g) => g.width > g.height), s.gallery.filter((g) => g.width <= g.height)].filter((part) => part.length > 0).map((part) => (
              <Loop key={part[0].src} items={part} slug={slug} at={Math.max(part.indexOf(s.gallery[shown]), 0)} instant={instant}
                setAt={(i, inst) => setShown(s.gallery.indexOf(part[i]), inst)} mark={mark} decisions={c?.decision ?? []} />
            ))}
          </section>
        )}

        {part >= 3 && <nav className="re-cs-next" aria-label="More cases">
          <Link className="re-cs-next-main re-solid" to={`${BASE}/${next.slug}`}>
            <span className="re-cs-next-words">
              <span className="re-cs-next-label">Next</span>
              <strong>{next.name}</strong>
              <span className="re-cs-next-q">{CASE_H1[next.slug] ?? next.line}</span>
            </span>
            <Hero slug={next.slug} name={next.name} />
          </Link>
          <Link className="re-cs-prev re-solid" to={`${BASE}/${prev.slug}`}>
            <ArrowLeftIcon size={14} weight="regular" aria-hidden="true" />
            <span>Previous: {prev.name}</span>
          </Link>
        </nav>}
    </article>
  )
}
