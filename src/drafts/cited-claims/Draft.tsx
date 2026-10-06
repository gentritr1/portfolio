import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import { links } from '../../content/links'
import { preloadCase } from '../../lib/routes'
import { CropShot } from '../../components/CropShot'
import { claims, groups, rows, total, type Cite, type Claim, type Part, type Row } from './data'
import './cited-claims.css'

const WIDE = '(min-width: 1080px)'

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

const sentence = (parts: Part[]) => parts.map((part) => (typeof part === 'string' ? part : part.n)).join('')

function ClaimText({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((part, index) =>
        typeof part === 'string' ? (
          <span key={index}>{part}</span>
        ) : (
          <span key={index} className="cc-n">
            {part.n}
          </span>
        ),
      )}
    </>
  )
}

function Cited({ cite }: { cite: Cite }) {
  const [start, end] = cite.mark
  return (
    <>
      {cite.text.slice(0, start)}
      <mark className="cc-mark">{cite.text.slice(start, end)}</mark>
      {cite.text.slice(end)}
    </>
  )
}

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="cc-icon">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
    </svg>
  )
}

function Media({ row }: { row: Row }) {
  const { media } = row
  return (
    <figure className="cc-media" data-kind={media.kind}>
      <div className="cc-frame">
        {media.kind === 'shot' && <img src={media.src} alt={media.alt} decoding="async" />}
        {media.kind === 'screen' && <CropShot shot={media.shot} fill />}
        {media.kind === 'phones' &&
          media.srcs.map((src, index) => <img key={src} src={src} alt={index === 0 ? media.alt : ''} decoding="async" />)}
        {media.kind === 'readout' && (
          <div className="cc-readout">
            <strong>
              {media.value}
              {media.to && (
                <>
                  <span className="cc-into" aria-label="to">
                    {' → '}
                  </span>
                  {media.to}
                </>
              )}
            </strong>
            <span>{media.label}</span>
          </div>
        )}
      </div>
      {(media.kind === 'shot' || media.kind === 'screen') && media.note && <figcaption>{media.note}</figcaption>}
    </figure>
  )
}

function Preview({ row, claim }: { row: Row; claim: Claim | null }) {
  const cite = claim?.cites.get(row.slug)
  return (
    <div className="cc-preview" key={row.slug}>
      <Media row={row} />
      <div className="cc-pv-head">
        <h3>{row.name}</h3>
        <span>{row.years}</span>
      </div>
      <p className="cc-role">
        {row.project.kind} · {row.project.role}
      </p>
      {cite && claim && (
        <p className="cc-why">
          <span>Proves</span> {sentence(claim.parts)}
        </p>
      )}
      <dl className="cc-pr">
        <dt>Problem</dt>
        <dd>{row.problem}</dd>
        <dt>Result</dt>
        <dd>{row.result}</dd>
      </dl>
      <p className="cc-links">
        {row.project.featured && (
          <Link to={`/work/${row.slug}`} onPointerEnter={() => void preloadCase(row.slug)}>
            Read the case
            <Arrow />
          </Link>
        )}
        {row.project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
            <Arrow />
          </a>
        ))}
      </p>
    </div>
  )
}

export default function CitedClaims() {
  const wide = useMedia(WIDE)
  const [params, setParams] = useSearchParams()
  const claim = claims.find((item) => item.id === params.get('claim')) ?? null
  const proof = claim ? new Set(claim.proof.map((row) => row.slug)) : null
  const visible = proof ? rows.filter((row) => proof.has(row.slug)) : rows
  const [active, setActive] = useState<string | null>(() => claim?.primary.slug ?? rows[0].slug)
  const current = visible.find((row) => row.slug === active) ?? (wide ? visible[0] : undefined)
  const rowRefs = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    const previous = { root: root.style.background, body: body.style.background, scheme: root.style.colorScheme }
    root.style.background = body.style.background = '#f7f6f1'
    root.style.colorScheme = 'light'
    return () => {
      root.style.background = previous.root
      body.style.background = previous.body
      root.style.colorScheme = previous.scheme
    }
  }, [])

  const choose = (next: Claim | null) => {
    setParams(next ? { claim: next.id } : {}, { replace: true, preventScrollReset: true })
    setActive(next ? next.primary.slug : rows[0].slug)
  }

  const toggle = (next: Claim) => choose(claim?.id === next.id ? null : next)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target
      if (target instanceof Element && target.closest('input, textarea, select, [contenteditable="true"]')) return
      const byKey = claims.find((item) => item.key === event.key)
      if (byKey) {
        event.preventDefault()
        toggle(byKey)
      } else if (event.key === 'Escape' && claim) {
        event.preventDefault()
        choose(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const onRowKey = (row: Row) => (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return
    event.preventDefault()
    const index = visible.findIndex((item) => item.slug === row.slug)
    const next = visible[Math.min(visible.length - 1, Math.max(0, index + (event.key === 'ArrowDown' ? 1 : -1)))]
    rowRefs.current.get(next.slug)?.focus()
    setActive(next.slug)
  }

  const select = (row: Row) => {
    if (wide) setActive(row.slug)
    else setActive((value) => (value === row.slug ? null : row.slug))
  }

  return (
    <div className="cc" data-claim={claim?.id ?? ''}>
      <title>Gentrit Rashiti, web and mobile developer</title>
      <header className="cc-top">
        <p className="cc-who">
          <strong>Gentrit Rashiti</strong>
          <span>Frontend and mobile developer, full stack since 2026. 5+ years, Kosovo, remote.</span>
        </p>
        <nav aria-label="Contact">
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.cv} download>
            CV
          </a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
      </header>

      <section className="cc-claims" aria-labelledby="cc-lead">
        <p id="cc-lead" className="cc-lead">
          Web and mobile products, from the first screen to the store release. Three claims about the work. Select one to keep only the projects
          that prove it.
        </p>
        <ol>
          {claims.map((item) => {
            const on = claim?.id === item.id
            return (
              <li key={item.id}>
                <button type="button" className="cc-claim" aria-pressed={on} aria-controls="cc-index" onClick={() => toggle(item)}>
                  <span className="cc-key" aria-hidden="true">
                    {item.key}
                  </span>
                  <span className="cc-say">
                    <span className="cc-hl">
                      <ClaimText parts={item.parts} />
                    </span>
                  </span>
                  <span className="cc-count">
                    {item.proof.length} {item.proof.length === 1 ? 'project' : 'projects'}
                    <span className="cc-down" aria-hidden="true">
                      ↓
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
        <p className="cc-keys" aria-hidden="true">
          Keys 1 to 3 select a claim. Esc shows all {total}.
        </p>
      </section>

      <div className="cc-body">
        <main id="cc-index" className="cc-index">
          <div className="cc-ihead">
            <h2>{claim ? `Proof for claim ${claim.key}` : 'All projects'}</h2>
            <p className="cc-tally" aria-hidden="true">
              <span className="cc-tally-n" style={{ '--tally': visible.length } as CSSProperties} /> of {total}
            </p>
            {claim && (
              <button type="button" className="cc-all" onClick={() => choose(null)}>
                Show all {total}
              </button>
            )}
            <p className="cc-visually-hidden" aria-live="polite">
              {claim ? `${sentence(claim.parts)} ${visible.length} of ${total} projects prove it.` : `All ${total} projects.`}
            </p>
          </div>
          <div className="cc-cols cc-grid" aria-hidden="true">
            <span>Year</span>
            <span>Project</span>
            <span>{claim ? 'Cited words' : 'Work'}</span>
            <span>Scope</span>
          </div>

          {groups.map((group) => {
            const kept = group.rows.filter((row) => !proof || proof.has(row.slug))
            const id = `cc-g-${group.name.replace(/\W+/g, '-').toLowerCase()}`
            return (
              <section key={group.name} className="cc-fold" data-folded={!kept.length} inert={!kept.length} aria-labelledby={id}>
                <div className="cc-clip">
                  <h2 id={id} className="cc-ghead">
                    <span>{group.name}</span>
                    <span className="cc-period">{group.period}</span>
                    <span className="cc-gcount">{proof ? `${kept.length} of ${group.rows.length}` : group.rows.length}</span>
                  </h2>
                  <ul>
                    {group.rows.map((row) => {
                      const folded = Boolean(proof && !proof.has(row.slug))
                      const cite = claim?.cites.get(row.slug)
                      const isActive = current?.slug === row.slug
                      return (
                        <li key={row.slug} className="cc-fold" data-folded={folded} inert={folded}>
                          <div className="cc-clip">
                            <button
                              type="button"
                              id={`cc-row-${row.slug}`}
                              className="cc-row cc-grid"
                              data-active={isActive}
                              aria-expanded={wide ? undefined : isActive}
                              aria-current={wide && isActive ? 'true' : undefined}
                              ref={(element) => {
                                if (element) rowRefs.current.set(row.slug, element)
                                else rowRefs.current.delete(row.slug)
                              }}
                              onClick={() => select(row)}
                              onFocus={() => wide && setActive(row.slug)}
                              onPointerEnter={(event) => {
                                if (wide && event.pointerType === 'mouse') setActive(row.slug)
                              }}
                              onKeyDown={onRowKey(row)}
                            >
                              <span className="cc-year">{row.years}</span>
                              <span className="cc-name">{row.name}</span>
                              <span className="cc-did">{cite ? <Cited key={claim?.id} cite={cite} /> : row.did}</span>
                              <span className="cc-scope">{row.scope}</span>
                            </button>
                            {!wide && isActive && <Preview row={row} claim={claim} />}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </section>
            )
          })}
        </main>

        {wide && current && (
          <aside className="cc-aside" aria-label={`Preview: ${current.name}`}>
            <div className="cc-sticky">
              <Preview row={current} claim={claim} />
            </div>
          </aside>
        )}
      </div>

      <footer className="cc-foot">
        <p>
          Write to <a href={`mailto:${links.email}`}>{links.email}</a>
        </p>
        <p>Vianova care and design-system screens are real product screens with invented data. Other images come from public pages and store listings, or are labelled recreations.</p>
      </footer>
    </div>
  )
}
