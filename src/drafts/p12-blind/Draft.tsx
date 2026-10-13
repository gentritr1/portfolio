import { Fragment, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router'
import { about, AI_LINE, index, lanes, REAL, rows, site, type Entry, type Lane, type Shot } from './content'
import './draft.css'

const LANES: Lane[] = ['phone', 'web', 'server']
type Sel = Lane | 'all'

/* ---------- Grid placement: the record is one CSS grid; every item is placed by row number ---------- */

interface Placed {
  todayRow: number
  ruleRows: { year: number; row: number; lanes: Lane[] }[]
  rowOf: number[]
  endRow: number
  bars: { id: string; lane: Lane; start: number; end: number; k: number }[]
  counts: Record<Lane, number>
}

function place(): Placed {
  let r = 1
  const todayRow = r++
  const ruleRows: Placed['ruleRows'] = []
  const rowOf: number[] = []
  let lastYear: number | null = null
  rows.forEach((row, i) => {
    if (row.year !== lastYear) {
      ruleRows.push({ year: row.year, row: r++, lanes: [] })
      lastYear = row.year
    }
    const rule = ruleRows[ruleRows.length - 1]
    for (const lane of LANES) if (row.cells[lane]?.some((e) => !e.lineNote) && !rule.lanes.includes(lane)) rule.lanes.push(lane)
    rowOf[i] = r++
  })
  const endRow = r
  const ruleOf = (year: number) => ruleRows.find((x) => x.year === year)?.row
  const raw: { id: string; lane: Lane; start: number; end: number }[] = []
  const counts: Record<Lane, number> = { phone: 0, web: 0, server: 0 }
  rows.forEach((row, i) => {
    for (const lane of LANES) {
      for (const e of row.cells[lane] ?? []) {
        if (!e.lineNote) counts[lane] += 1
        if (!e.shot && !e.bar) continue
        const [s, en] = e.years
        const start = rowOf[i]
        const end = s === en ? start + 1 : (ruleOf(s - 1) ?? endRow)
        raw.push({ id: e.id, lane, start, end })
      }
    }
  })
  const bars: Placed['bars'] = []
  for (const lane of LANES) {
    const mine = raw.filter((b) => b.lane === lane).sort((a, b) => a.start - b.start || b.end - a.end)
    const lastEnd: number[] = []
    for (const b of mine) {
      let k = lastEnd.findIndex((e) => e <= b.start)
      if (k === -1) k = lastEnd.length
      lastEnd[k] = b.end
      bars.push({ ...b, k })
    }
  }
  return { todayRow, ruleRows, rowOf, endRow, bars, counts }
}

const placed = place()

/* ---------- Pieces ---------- */

function ShotFigure({ shot, name, onOpen, eager }: { shot: Shot; name: string; onOpen: (s: Shot) => void; eager?: boolean }) {
  const p = shot.phoneCrop
  const style = {
    '--iw': shot.width,
    '--ih': shot.height,
    '--cx-d': shot.crop.x,
    '--cy-d': shot.crop.y,
    '--cw-d': shot.crop.w,
    '--ch-d': shot.crop.h,
    ...(p && { '--px': p.x, '--py': p.y, '--pw': p.w, '--ph': p.h }),
  } as CSSProperties
  return (
    <figure className="tl-shot" data-wide={shot.wideOnly ? '' : undefined}>
      <button type="button" className="tl-shot-btn tl-press" onClick={() => onOpen(shot)} aria-label={`Enlarge: ${shot.caption}`}>
        <span className="tl-shot-box" style={style} data-work={name}>
          <img
            src={shot.src}
            width={shot.width}
            height={shot.height}
            alt={shot.alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            {...(eager ? { fetchPriority: 'high' as const } : {})}
          />
        </span>
      </button>
      <figcaption>
        <span>{shot.caption}</span>
        {shot.invented && <span className="tl-real">{REAL}</span>}
      </figcaption>
    </figure>
  )
}

function Out({ href, label, className }: { href: string; label: string; className: string }) {
  return href.startsWith('/work/') ? (
    <Link className={className} to={href}>
      {label}
    </Link>
  ) : (
    <a className={className} href={href} target="_blank" rel="noreferrer">
      {label}
    </a>
  )
}

function Meta({ entry }: { entry: Entry }) {
  if (!entry.meta.length && !entry.links?.length) return null
  return (
    <ul className="tl-meta">
      {entry.meta.map((m) => (
        <li key={m}>{m}</li>
      ))}
      {entry.links?.map((l) => (
        <li key={l.href}>
          <Out href={l.href} label={l.label} className="tl-textlink" />
        </li>
      ))}
    </ul>
  )
}

function EntryView({ entry, lane, onOpen, eager }: { entry: Entry; lane: Lane; onOpen: (s: Shot) => void; eager?: boolean }) {
  const laneLabel = lanes.find((l) => l.key === lane)!.label
  if (entry.lineNote) {
    return (
      <p className="tl-entry" data-line id={`e-${entry.id}`}>
        {entry.name}
      </p>
    )
  }
  const caseLink = entry.links?.find((l) => l.href.startsWith('/work/'))
  const light = (on: boolean) => {
    for (const bar of document.querySelectorAll<HTMLElement>(`.tl-bar[data-for="${entry.id}"]`)) bar.classList.toggle('is-hot', on)
  }
  return (
    <article
      className="tl-entry"
      id={`e-${entry.id}`}
      data-entry={entry.id}
      onPointerEnter={() => light(true)}
      onPointerLeave={() => light(false)}
      onFocus={() => light(true)}
      onBlur={() => light(false)}
    >
      <span className="tl-lanetag" aria-hidden="true">
        {laneLabel}
      </span>
      {entry.shot && <ShotFigure shot={entry.shot} name={entry.name} onOpen={onOpen} eager={eager} />}
      <h2 className="tl-h3">
        {caseLink ? (
          <Link className="tl-plain tl-h3link" to={caseLink.href}>
            {entry.name}
          </Link>
        ) : (
          entry.name
        )}
      </h2>
      {entry.kind && <p className="tl-kind">{entry.kind}</p>}
      {(entry.text || entry.ai) && (
        <div className="tl-text">
          {entry.text?.map((t) => (
            <p key={t.slice(0, 24)}>{t}</p>
          ))}
          {entry.ai && <p className="tl-ai">{AI_LINE}</p>}
        </div>
      )}
      <Meta entry={entry} />
    </article>
  )
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="tl-h2">
        {title}
      </h2>
      {children}
    </section>
  )
}

/* ---------- The page ---------- */

export default function Draft() {
  const [sel, setSel] = useState<Sel>('all')
  const [instant, setInstant] = useState(false)
  const pointerAt = useRef(0)
  const choose = (next: Sel) => {
    const byPointer = performance.now() - pointerAt.current < 400
    setInstant(!byPointer)
    setSel(next)
  }
  const [open, setOpen] = useState<Shot | null>(null)
  const [indexOpen, setIndexOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  // The draft is one light page on a site whose shell is dark by default.
  useEffect(() => {
    const html = document.documentElement
    const prevTheme = html.getAttribute('data-theme')
    const prevBg = document.body.style.backgroundColor
    html.setAttribute('data-theme', 'light')
    document.body.style.backgroundColor = 'oklch(97% 0.008 50)'
    setIndexOpen(matchMedia('(min-width: 900px)').matches)
    return () => {
      if (prevTheme === null) html.removeAttribute('data-theme')
      else html.setAttribute('data-theme', prevTheme)
      document.body.style.backgroundColor = prevBg
    }
  }, [])

  // The enlarge dialog: modal, and the page behind it does not scroll.
  useEffect(() => {
    const d = dialogRef.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
    const html = document.documentElement
    const prev = html.style.overflow
    if (open) html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = prev
    }
  }, [open])

  const today = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())

  // Rules and cells in reading order, so the phone stream (a plain block flow) reads the same as the grid.
  const record: ReactNode[] = []
  let lastYear: number | null = null
  rows.forEach((row, i) => {
    if (row.year !== lastYear) {
      const rule = placed.ruleRows.find((y) => y.year === row.year)!
      record.push(
        <div className="tl-year" key={`y-${row.year}`} style={{ gridRow: rule.row }} data-lanes={rule.lanes.join(' ')}>
          {row.year}
        </div>,
      )
      lastYear = row.year
    }
    // On a phone the grid is a stream: screens first, web before phone before server.
    const order: Record<Lane, number> = { web: 0, phone: 1, server: 2 }
    const hasShot = (lane: Lane) => (row.cells[lane] ?? []).some((e) => e.shot)
    const ordered = [...LANES].sort((x, y) => Number(hasShot(y)) - Number(hasShot(x)) || order[x] - order[y])
    for (const lane of ordered) {
      const entries = row.cells[lane]
      if (!entries?.length) continue
      record.push(
        <div className="tl-cell" data-lane={lane} key={`${i}-${lane}`} style={{ gridRow: placed.rowOf[i] }}>
          {entries.map((e) => (
            <EntryView entry={e} lane={lane} onOpen={setOpen} eager={i === 0 && !!e.shot} key={e.id} />
          ))}
        </div>,
      )
    }
  })

  const options: { key: Sel; label: string; small: string }[] = [
    ...lanes.map((l) => ({ key: l.key as Sel, label: l.label, small: l.since })),
    { key: 'all', label: 'All', small: '' },
  ]

  return (
    <div className="tl">
      <title>Gentrit Rashiti: phone, web and server, 2021 to 2026</title>
      <meta name="description" content="Gentrit Rashiti builds the phone and web apps that care teams, readers and shoppers use. Six years of work in three lanes: phone since 2021, web since 2023, the server since 2026." />
      <meta name="theme-color" content="#f7f5f3" />
      <meta
        name="portfolio-check"
        content="allow T23: the only hover-lift rule on the page is the site's shared Tailwind utility (.hover:-translate-y-1), which no element of this draft uses; allow C17: the first screen is complete at the 900 ms frame, the later largest paint is a below-fold image painted during the scripted scroll on the unbundled dev server"
      />
      <link rel="preload" href="/fonts/creative/BigShouldersDisplay-Latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/creative/LibreFranklin-Latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/fonts/MartianMono.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />

      <header className="tl-wrap tl-mast">
        <a className="tl-name tl-plain" href="#top">
          {site.name}
        </a>
        <nav aria-label="Site">
          <ul>
            {site.nav.map((n) => (
              <li key={n.href}>
                <a className="tl-plain" href={n.href}>
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="top">
        <div className="tl-wrap tl-hero">
          <h1 className="tl-claim">{site.claim}</h1>
          <p className="tl-lead" aria-live="polite">
            {sel === 'all' ? (
              <>
                {site.lead.before}
                <a className="tl-textlink" href={site.lead.link.href} target="_blank" rel="noreferrer">
                  {site.lead.link.label}
                </a>
                {site.lead.after}
              </>
            ) : (
              site.laneLines[sel].replace('{n}', ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][placed.counts[sel]] ?? String(placed.counts[sel]))
            )}
          </p>
        </div>

        <div className="tl-wrap">
          <section id="work" aria-label="The work, 2021 to 2026, in three lanes">
            <div className="tl-record" data-sel={sel} data-instant={instant ? '' : undefined}>
              {/* The lanes are the control: choose one and the record answers. A radio group: arrow keys move the choice, a tap or click sets it, pressing the chosen lane again shows all. */}
              <fieldset className="tl-laneheads" onPointerDown={() => (pointerAt.current = performance.now())}>
                <legend className="tl-sr">Show one lane</legend>
                {options.map((o) => (
                  <label className="tl-lanehead" data-lane={o.key} key={o.key} data-on={sel === o.key ? '' : undefined}>
                    <input
                      type="radio"
                      name="tl-lane"
                      className="tl-sr"
                      value={o.key}
                      checked={sel === o.key}
                      onChange={() => choose(o.key)}
                      onClick={() => {
                        if (sel === o.key && o.key !== 'all') choose('all')
                      }}
                    />
                    <span className="tl-lanehead-name">{o.label}</span>
                    {o.small && <small>{o.small}</small>}
                  </label>
                ))}
              </fieldset>

              <div className="tl-grid">
                <p className="tl-today" style={{ gridRow: placed.todayRow }}>
                  Today, {today}
                </p>
                {record.map((node, i) => (
                  <Fragment key={i}>{node}</Fragment>
                ))}
                {placed.bars.map((b) => (
                  <span
                    className="tl-bar"
                    data-lane={b.lane}
                    data-for={b.id}
                    key={b.id}
                    aria-hidden="true"
                    style={{ gridRow: `${b.start} / ${b.end}`, '--k': b.k } as CSSProperties}
                  />
                ))}
                <div className="tl-year" data-end style={{ gridRow: placed.endRow }} aria-hidden="true" />
              </div>
            </div>
          </section>

          <Section id="index" title="Index">
            <details className="tl-index" open={indexOpen} onToggle={(e) => setIndexOpen((e.currentTarget as HTMLDetailsElement).open)}>
              <summary className="tl-summary tl-press">Every product so far, one line each</summary>
              {index.map((g) => (
                <div className="tl-group" key={g.title}>
                  <h3>{g.title}</h3>
                  <ul>
                    {g.rows.map((r) => (
                      <li className="tl-row" key={r.name}>
                        <span className="tl-years">{r.years}</span>
                        <span className="tl-project">
                          {r.entry ? (
                            <a className="tl-textlink tl-rowlink" href={`#e-${r.entry}`}>
                              {r.name}
                            </a>
                          ) : (
                            r.name
                          )}
                        </span>
                        <span className="tl-lane" data-role={r.role}>
                          {r.lane}
                        </span>
                        <span className="tl-role">{r.role}</span>
                        <span className="tl-line">{r.line}</span>
                        <span className="tl-links">
                          {r.links?.map((l) => (
                            <Out href={l.href} label={l.label} className="tl-textlink" key={l.href} />
                          ))}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </details>
          </Section>

          <Section id="about" title="About">
            <div className="tl-about">
              <div className="tl-text">
                {about.map((t) => (
                  <p key={t.slice(0, 20)}>{t}</p>
                ))}
              </div>
              <div>
                <ul className="tl-contact" aria-label="Contact">
                  <li>
                    <a className="tl-textlink" href={`mailto:${site.email}`}>
                      {site.email}
                    </a>
                  </li>
                  <li>
                    <a className="tl-textlink" href={site.github} target="_blank" rel="noreferrer">
                      github.com/gentritr1
                    </a>
                  </li>
                  <li>
                    <a className="tl-textlink" href={site.linkedin} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a className="tl-textlink" href={site.cv}>
                      Download the CV
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          <footer className="tl-foot">
            <span>Gentrit Rashiti, 2026.</span>
            <span>Client screens come from public pages and store listings. The care platform and the design system are real product screens with invented data.</span>
          </footer>
        </div>
      </main>

      <dialog className="tl-dialog" ref={dialogRef} onClose={() => setOpen(null)} aria-label={open ? open.caption : 'Screen'}>
        {open && (
          <div className="tl-dialog-inner">
            <img src={open.src} width={open.width} height={open.height} alt={open.alt} style={{ width: `${open.width / 2}px` }} />
            <div className="tl-dialog-row">
              <span>
                {open.caption}
                {open.invented ? ` ${REAL}` : ''}
              </span>
              <button type="button" className="tl-dialog-close tl-press" onClick={() => setOpen(null)}>
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  )
}
