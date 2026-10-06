import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { links } from '../../content/links'
import { preloadCase } from '../../lib/routes'
import { CropShot } from '../../components/CropShot'
import { firstYear, groups, lastYear, match, rows, type Row } from './data'
import { createMark } from './mark'
import './orbit-index.css'

type Mark = ReturnType<typeof createMark>
type Source = 'pointer' | 'keyboard'

const WIDE = '(min-width: 1200px)'
const REDUCED = '(prefers-reduced-motion: reduce)'
const bySlug = new Map(rows.map((row) => [row.slug, row]))
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function useMedia(query: string) {
  const [on, setOn] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const list = window.matchMedia(query)
    const update = () => setOn(list.matches)
    update()
    list.addEventListener('change', update)
    return () => list.removeEventListener('change', update)
  }, [query])
  return on
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="oi-icon">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
    </svg>
  )
}

function Plus({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="oi-icon">
      <path d={open ? 'M4 8h8' : 'M4 8h8M8 4v8'} />
    </svg>
  )
}

function Into() {
  return (
    <svg viewBox="0 0 24 12" aria-hidden="true" className="oi-into">
      <path d="M1 6h20M16 1.5 21 6l-5 4.5" />
    </svg>
  )
}

const YEARS = lastYear - firstYear + 1
const TRACK = 60
const tick = (year: number) => 5 + ((year - firstYear) * (TRACK - 10)) / (YEARS - 1)

function Track({ span }: { span: Row['span'] }) {
  return (
    <svg className="oi-track" viewBox={`0 0 ${TRACK} 10`} width={TRACK} height="10" aria-hidden="true">
      {Array.from({ length: YEARS }, (_, index) => (
        <circle key={index} className="oi-track-year" cx={tick(firstYear + index)} cy="5" r="1" />
      ))}
      {span &&
        (span[0] === span[1] ? (
          <circle className="oi-track-span" cx={tick(span[0])} cy="5" r="2.5" />
        ) : (
          <line className="oi-track-span" x1={tick(span[0])} x2={tick(span[1])} y1="5" y2="5" />
        ))}
    </svg>
  )
}

function Media({ row, caption = false }: { row: Row; caption?: boolean }) {
  const { media } = row
  return (
    <figure className="oi-media" data-kind={media.kind}>
      <div className="oi-frame">
        {media.kind === 'shot' && <img src={media.src} alt={media.alt} decoding="async" />}
        {media.kind === 'screen' && <CropShot shot={media.shot} fill />}
        {media.kind === 'phones' &&
          media.srcs.map((src, index) => (
            <img key={src} src={src} alt={index === 0 ? media.alt : ''} decoding="async" />
          ))}
        {media.kind === 'readout' && (
          <div className="oi-readout">
            <strong>
              {media.value}
              {media.to && (
                <>
                  <Into />
                  {media.to}
                </>
              )}
            </strong>
            <span>{media.label}</span>
          </div>
        )}
      </div>
      {caption && (media.kind === 'shot' || media.kind === 'screen') && media.note && <figcaption>{media.note}</figcaption>}
    </figure>
  )
}

function Outcome({ row }: { row: Row }) {
  return (
    <dl className="oi-pr">
      <dt>Problem</dt>
      <dd>{row.problem}</dd>
      <dt>Result</dt>
      <dd>{row.result}</dd>
    </dl>
  )
}

function PublicLinks({ row }: { row: Row }) {
  if (!row.project.links.length) return null
  return (
    <p className="oi-links">
      {row.project.links.map((link) => (
        <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
          {link.label}
          <Arrow />
        </a>
      ))}
    </p>
  )
}

export default function OrbitIndex() {
  const navigate = useNavigate()
  const wide = useMedia(WIDE)
  const reduced = useMedia(REDUCED)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(rows[0].slug)
  const [source, setSource] = useState<Source>('pointer')
  const [expanded, setExpanded] = useState<string | null>(null)

  const rowRefs = useRef(new Map<string, HTMLElement>())
  const searchRef = useRef<HTMLInputElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const leaderRef = useRef<SVGSVGElement>(null)
  const markRef = useRef<HTMLCanvasElement>(null)
  const markInlineRef = useRef<HTMLCanvasElement>(null)
  const marks = useRef<{ canvas: HTMLCanvasElement; mark: Mark }[]>([])
  const glide = useRef({ y: -1, frame: 0, last: 0 })
  const prefetched = useRef(false)
  const visible = useMemo(() => rows.filter((row) => match(row, query)), [query])
  const shown = useMemo(() => new Set(visible.map((row) => row.slug)), [visible])
  const focus = shown.has(active) || !visible.length ? active : visible[0].slug
  const current = bySlug.get(focus) ?? rows[0]
  const live = useRef({ active: focus, wide, reduced })

  useLayoutEffect(() => {
    live.current = { active: focus, wide, reduced }
  }, [focus, wide, reduced])

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const previous = { root: root.style.background, body: body.style.background, scheme: root.style.colorScheme }
    root.style.background = body.style.background = '#0f1012'
    root.style.colorScheme = 'dark'
    return () => {
      root.style.background = previous.root
      body.style.background = previous.body
      root.style.colorScheme = previous.scheme
    }
  }, [])

  useEffect(() => {
    const isReduced = () => live.current.reduced
    marks.current = [markRef.current, markInlineRef.current]
      .filter((canvas): canvas is HTMLCanvasElement => Boolean(canvas))
      .map((canvas) => ({ canvas, mark: createMark(canvas, isReduced) }))
    return () => marks.current.forEach(({ mark }) => mark.destroy())
  }, [])

  const measure = useCallback(() => {
    const sticky = stickyRef.current
    const panel = panelRef.current
    const mark = markRef.current
    const row = rowRefs.current.get(live.current.active)
    if (!live.current.wide || !sticky || !panel || !row || !mark) return null
    const frame = sticky.getBoundingClientRect()
    const rect = row.getBoundingClientRect()
    const height = panel.offsetHeight
    const min = mark.offsetTop + mark.offsetHeight + 36
    const max = Math.max(min, Math.min(frame.height, window.innerHeight - frame.top) - height - 20)
    return {
      media: panel.querySelector<HTMLElement>('.oi-frame')?.offsetHeight ?? height,
      mid: rect.top + rect.height / 2 - frame.top,
      gap: frame.left - rect.right,
      target: clamp(rect.top - frame.top - 14, min, max),
      frame,
    }
  }, [])

  const draw = useCallback((y: number, m: NonNullable<ReturnType<typeof measure>>) => {
    const panel = panelRef.current
    const svg = leaderRef.current
    if (!panel || !svg) return
    panel.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0)`
    const g = Math.max(8, m.gap)
    const y1 = m.mid
    const y2 = clamp(y1, y + 18, y + m.media - 18)
    const mid = g * 0.5
    const dy = y2 - y1
    const r = Math.min(7, Math.abs(dy) / 2, mid)
    const s = Math.sign(dy)
    const d =
      Math.abs(dy) < 0.5
        ? `M0 ${y1} H${g}`
        : `M0 ${y1} H${mid - r} Q${mid} ${y1} ${mid} ${y1 + s * r} V${y2 - s * r} Q${mid} ${y2} ${mid + r} ${y2} H${g}`
    svg.style.left = `${-g}px`
    svg.style.width = `${g}px`
    svg.querySelector('path')?.setAttribute('d', d)
    svg.querySelector('circle')?.setAttribute('cy', String(y2))
    svg.querySelector('circle')?.setAttribute('cx', String(g))
    svg.dataset.hidden = String(y1 < 0 || y1 > m.frame.height)
  }, [])

  const place = useCallback(
    (instant: boolean) => {
      const state = glide.current
      cancelAnimationFrame(state.frame)
      state.frame = 0
      const first = measure()
      if (!first) return
      if (instant || state.y < 0 || live.current.reduced) {
        state.y = first.target
        draw(state.y, first)
        return
      }
      state.last = 0
      const tick = (now: number) => {
        const m = measure()
        if (!m) return
        const dt = Math.min(64, now - (state.last || now))
        state.last = now
        state.y += (m.target - state.y) * (1 - Math.exp(-dt / 62))
        const done = Math.abs(m.target - state.y) < 0.4
        if (done) state.y = m.target
        draw(state.y, m)
        state.frame = done ? 0 : requestAnimationFrame(tick)
      }
      state.frame = requestAnimationFrame(tick)
    },
    [measure, draw],
  )

  const lean = useCallback((slug: string) => {
    const row = rowRefs.current.get(slug)
    const target = bySlug.get(slug)
    if (!row || !target) return
    const rect = row.getBoundingClientRect()
    for (const { canvas, mark } of marks.current) {
      const box = canvas.getBoundingClientRect()
      if (!box.width) continue
      const x = (live.current.wide ? rect.right - 32 : rect.left + rect.width * 0.4) - (box.left + box.width / 2)
      const y = rect.top + rect.height / 2 - (box.top + box.height / 2)
      mark.set(x, y, target.accent)
    }
  }, [])

  useLayoutEffect(() => {
    place(source === 'keyboard')
    lean(focus)
  }, [focus, source, wide, expanded, place, lean])

  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const observer = new ResizeObserver(() => place(true))
    observer.observe(panel)
    void document.fonts?.ready.then(() => place(true))
    return () => observer.disconnect()
  }, [place])

  useEffect(() => {
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        place(true)
        lean(live.current.active)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [place, lean])

  const prefetch = () => {
    if (prefetched.current) return
    prefetched.current = true
    for (const row of rows) {
      const srcs = row.media.kind === 'shot' ? [row.media.src] : row.media.kind === 'screen' ? [row.media.shot.src] : row.media.kind === 'phones' ? row.media.srcs : []
      for (const src of srcs) new Image().src = src
    }
  }

  const point = (row: Row) => (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return
    setSource('pointer')
    setActive(row.slug)
    if (row.featured) void preloadCase(row.slug)
  }

  const focusRow = (slug: string) => {
    const element = rowRefs.current.get(slug)
    if (!element) return
    element.focus({ preventScroll: true })
    element.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }

  const open = (row: Row) => {
    if (row.featured) navigate(`/work/${row.slug}`)
    else setExpanded((value) => (value === row.slug ? null : row.slug))
  }

  const move = (delta: number) => {
    if (!visible.length) return
    const index = visible.findIndex((row) => row.slug === live.current.active)
    const next = visible[clamp(index < 0 ? 0 : index + delta, 0, visible.length - 1)]
    setSource('keyboard')
    setActive(next.slug)
    focusRow(next.slug)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const inSearch = target === searchRef.current
      const typing = !inSearch && !!target?.closest('input, textarea, select, [contenteditable="true"]')
      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
        return
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === '/' && !inSearch) {
        event.preventDefault()
        searchRef.current?.focus()
        searchRef.current?.select()
        return
      }
      const onBody = !target || target === document.body
      const onRow = !!target?.closest('.oi-row')
      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && (onBody || onRow)) {
        event.preventDefault()
        const first = visible[0]?.slug
        if (onRow && event.key === 'ArrowUp' && live.current.active === first) {
          searchRef.current?.focus()
          return
        }
        if (onBody) {
          setSource('keyboard')
          focusRow(live.current.active)
          return
        }
        move(event.key === 'ArrowDown' ? 1 : -1)
        return
      }
      if (event.key === 'Enter' && onBody) {
        const row = bySlug.get(live.current.active)
        if (row) open(row)
        return
      }
      if (event.key === 'Escape' && expanded) {
        const slug = expanded
        setExpanded(null)
        if (onRow) focusRow(slug)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onSearchKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && visible.length) {
      event.preventDefault()
      const target = focus
      setSource('keyboard')
      setActive(target)
      focusRow(target)
    } else if (event.key === 'Enter' && visible.length) {
      event.preventDefault()
      open(current)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      if (query) setQuery('')
      else event.currentTarget.blur()
    }
  }

  const style = { '--accent': current.accent } as CSSProperties

  return (
    <div className="oi" data-source={source}>
      <title>Gentrit Rashiti, web and mobile developer</title>
      <header className="oi-top">
        <a className="oi-skip" href="#oi-search">
          Skip to the project index
        </a>
        <nav aria-label="Contact">
          <a href={links.cv} download>
            CV
          </a>
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
      </header>

      <div className="oi-page">
        <section className="oi-intro">
          <canvas ref={markInlineRef} className="oi-mark oi-mark-inline" aria-hidden="true" />
          <div>
            <h1>Gentrit Rashiti builds web and mobile products, from first screen to release.</h1>
            <p>Five-plus years. Two platform rewrites. Frontend and mobile, full stack since 2026.</p>
          </div>
        </section>

        <main className="oi-index" onPointerEnter={prefetch}>
          <div className="oi-search oi-grid">
            <svg viewBox="0 0 16 16" aria-hidden="true" className="oi-icon oi-lens">
              <circle cx="7" cy="7" r="4.25" />
              <path d="m10.25 10.25 3.25 3.25" />
            </svg>
            <label className="oi-visually-hidden" htmlFor="oi-search">
              Search the projects
            </label>
            <input
              id="oi-search"
              ref={searchRef}
              type="search"
              value={query}
              placeholder={`Search ${rows.length} projects`}
              autoComplete="off"
              spellCheck={false}
              onChange={(event) => {
                setSource('keyboard')
                setQuery(event.target.value)
              }}
              onKeyDown={onSearchKey}
            />
            <span className="oi-count" aria-live="polite">
              {query ? `${visible.length} of ${rows.length}` : rows.length}
            </span>
            <kbd className="oi-kbd" aria-hidden="true">
              /
            </kbd>
          </div>

          <div className="oi-cols oi-grid" aria-hidden="true">
            <span>Year</span>
            <span className="oi-when">
              <span>{String(firstYear).slice(2)}</span>
              <span>{String(lastYear).slice(2)}</span>
            </span>
            <span>Project</span>
            <span>Work</span>
            <span>Scope</span>
          </div>

          {groups.map((group) => {
            const members = group.rows.filter((row) => shown.has(row.slug))
            if (!members.length) return null
            const id = `oi-g-${group.name.replace(/\W+/g, '-').toLowerCase()}`
            return (
              <section key={group.name} className="oi-group" aria-labelledby={id}>
                <h2 id={id} className="oi-ghead oi-grid">
                  <span className="oi-year">{group.period}</span>
                  <span />
                  <span>{group.name}</span>
                  <span />
                  <span className="oi-gcount">{members.length}</span>
                </h2>
                <ul>
                  {members.map((row) => {
                    const isActive = row.slug === focus
                    const isOpen = expanded === row.slug
                    const cells = (
                      <>
                        <span className="oi-year">{row.years}</span>
                        <span className="oi-when">
                          <Track span={row.span} />
                        </span>
                        <span className="oi-name">{row.name}</span>
                        <span className="oi-did">{row.did}</span>
                        <span className="oi-scope">{row.scope}</span>
                        <span className="oi-go">{row.featured ? <Arrow /> : <Plus open={isOpen} />}</span>
                      </>
                    )
                    const shared = {
                      id: `oi-row-${row.slug}`,
                      className: 'oi-row oi-grid',
                      'data-active': isActive,
                      onPointerEnter: point(row),
                      onFocus: () => setActive(row.slug),
                      ref: (element: HTMLElement | null) => {
                        if (element) rowRefs.current.set(row.slug, element)
                        else rowRefs.current.delete(row.slug)
                      },
                    }
                    return (
                      <li key={row.slug} style={{ '--accent': row.accent } as CSSProperties}>
                        {row.featured ? (
                          <Link to={`/work/${row.slug}`} {...shared} aria-describedby={`oi-case-${row.slug}`}>
                            {cells}
                            <span id={`oi-case-${row.slug}`} className="oi-visually-hidden">
                              Opens the case study
                            </span>
                          </Link>
                        ) : (
                          <button type="button" {...shared} aria-expanded={isOpen} aria-controls={`oi-x-${row.slug}`} onClick={() => open(row)}>
                            {cells}
                          </button>
                        )}
                        {!row.featured && (
                          <div id={`oi-x-${row.slug}`} className="oi-expand" hidden={!isOpen}>
                            {isOpen && (
                              <>
                                <div className="oi-expand-preview">
                                  <Media row={row} caption />
                                  <Outcome row={row} />
                                </div>
                                <p className="oi-summary">{row.project.summary}</p>
                                <p className="oi-stack">{row.project.stack.join(', ')}</p>
                                <PublicLinks row={row} />
                              </>
                            )}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </section>
            )
          })}

          {!visible.length && (
            <p className="oi-empty">
              No project matches “{query}”. Try a year such as 2024, a stack such as React Native, or a scope such as Mobile.
            </p>
          )}

          <footer className="oi-foot">
            <p>
              Write to <a href={`mailto:${links.email}`}>{links.email}</a>
            </p>
            <p className="oi-note">
              Vianova care and design-system screens are real product screens with invented data. Other images come from public pages and store listings, or are labelled recreations.
            </p>
          </footer>
        </main>

        <aside className="oi-instrument" aria-label={`Preview: ${current.name}`} style={style}>
          <div className="oi-sticky" ref={stickyRef}>
            <canvas ref={markRef} className="oi-mark" aria-hidden="true" />
            <svg ref={leaderRef} className="oi-leader" aria-hidden="true">
              <path />
              <circle r="2.5" />
            </svg>
            <div className="oi-panel" ref={panelRef} data-instant={source === 'keyboard' || reduced}>
              <div key={current.slug} className="oi-swap">
                <Media row={current} />
                <div className="oi-pv-head">
                  <h2>{current.name}</h2>
                  <span>{current.years}</span>
                </div>
                <p className="oi-kind">
                  {current.project.kind}
                  {(current.media.kind === 'shot' || current.media.kind === 'screen') && current.media.note && <span>{current.media.note}</span>}
                </p>
                <Outcome row={current} />
                <div className="oi-pv-foot">
                  {current.featured ? (
                    <Link to={`/work/${current.slug}`} className="oi-open" onPointerEnter={() => void preloadCase(current.slug)}>
                      Open the case
                      <Arrow />
                    </Link>
                  ) : (
                    <PublicLinks row={current} />
                  )}
                  <p className="oi-legend" aria-hidden="true">
                    <span>↑↓ move</span>
                    <span>↵ {current.featured ? 'open' : 'expand'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
