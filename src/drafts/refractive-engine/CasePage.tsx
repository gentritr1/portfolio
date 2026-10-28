import { useEffect, useRef, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon } from '@phosphor-icons/react'
import { caseDetails, questionOf } from '../exploded-view/cases'
import { STAGE } from './scene'
import { cropVars, LEADS } from './screens'
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
  const style = { ...cropVars(shot, crop), ...cropVars(shot, phoneCrop ?? crop, 'n'), '--a': c[2] / c[3] } as Vars
  return (
    <figure className="re-sw-slab re-cs-hero" style={style} data-shape={isPhone(slug, name) ? 'phone' : 'wide'} data-hero={named || undefined}>
      <div className="re-sw-screen"><img src={shot.src} width={shot.w} height={shot.h} alt={shot.alt} decoding="async" /></div>
    </figure>
  )
}

/** A loupe that follows a fine pointer over a screen at twice its shown size. Touch and keyboard get the plain screen. */
function useLoupe(src: string) {
  const lens = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent<HTMLImageElement>) => {
    const l = lens.current
    if (!l || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    l.style.transform = `translate(${x - 90}px, ${y - 90}px)`
    l.style.backgroundSize = `${r.width * 2}px ${r.height * 2}px`
    l.style.backgroundPosition = `${90 - x * 2}px ${90 - y * 2}px`
  }
  return { move, el: <div ref={lens} className="re-cs-loupe" style={{ backgroundImage: `url("${src}")` }} aria-hidden="true" /> }
}

function Shot({ g }: { g: { src: string; alt: string; caption: string; width: number; height: number } }) {
  const { move, el } = useLoupe(g.src)
  return (
    <li className="re-cs-shot">
      <div className="re-cs-frame">
        <img src={g.src} alt={g.alt} width={g.width} height={g.height} loading="lazy" decoding="async" onPointerMove={move} />
        {el}
      </div>
      {g.caption && <span>{g.caption}</span>}
    </li>
  )
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

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [slug])

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
          <section className="re-cs-pair" aria-label="Problem and decision">
            <div>
              <h2 className="re-cs-h2">{problem.title}</h2>
              <ul className="re-cs-list">{problem.items.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
            <div className="re-cs-decision">
              <h2 className="re-cs-h2">The decision that worked</h2>
              <ul className="re-cs-list">{c.decision.map((x) => <li key={x}>{x}</li>)}</ul>
            </div>
          </section>
        ) : (
          s.story && <section><h2 className="re-cs-h2">What was built</h2><p className="re-cs-text">{s.story.built}</p></section>
        )}

        {c?.differently && (
          <section>
            <h2 className="re-cs-h2">What I'd do differently</h2>
            <p className="re-cs-text">{c.differently}</p>
          </section>
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
        <section className="re-cs-screens" aria-labelledby="re-screens-h">
          <h2 id="re-screens-h" className="re-cs-h2">Screens</h2>
          {s.gallery.some((g) => g.alt.includes('Invented data')) && <p className="re-case-note re-num">Recreated screens, with invented data.</p>}
          <ul data-shape={s.gallery[0].height > s.gallery[0].width ? 'phone' : 'wide'}>
            {s.gallery.map((g) => <Shot key={g.src} g={g} />)}
          </ul>
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
