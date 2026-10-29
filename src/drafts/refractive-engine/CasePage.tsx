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

/** A loupe that follows a fine pointer over a screen at twice its shown size. Touch and keyboard get the plain screen. */
function useLoupe(src: string) {
  const lens = useRef<HTMLDivElement>(null)
  const move = (e: React.PointerEvent<HTMLElement>) => {
    const l = lens.current
    if (!l || e.pointerType !== 'mouse') return
    // Measured on the screen itself: the slab's bevel and the full-size button around it are not part of the picture.
    const r = (e.currentTarget.querySelector('.re-sw-screen') ?? e.currentTarget).getBoundingClientRect()
    const x = e.clientX - r.left, y = e.clientY - r.top
    l.style.transform = `translate(${x - 90}px, ${y - 90}px)`
    l.style.backgroundSize = `${r.width * 2}px ${r.height * 2}px`
    l.style.backgroundPosition = `${90 - x * 2}px ${90 - y * 2}px`
  }
  return { move, el: <div ref={lens} className="re-cs-loupe" style={{ backgroundImage: `url("${src}")` }} aria-hidden="true" /> }
}

type Picture = { src: string; alt: string; caption: string; width: number; height: number }

/**
 * The case's screens as one guided stage: a single large glass slab and, beside it, the screens by name. Picking a name
 * crossfades the slab (2 px blur, exit 160 ms, entry 220 ms; instant from the keyboard), so each screen is shown big
 * enough to read and they read in order. A click or tap opens the screen at full size; a fine pointer gets the 2×
 * loupe; on phones the names become a swipeable row and the slab takes a sideways swipe.
 */
function Gallery({ items }: { items: Picture[] }) {
  const [at, setAt] = useState(0)
  const [armed, setArmed] = useState(false)
  const [instant, setInstant] = useState(false)
  const full = useRef<FullSizeHandle>(null)
  const start = useRef<{ x: number; y: number } | null>(null)
  const g = items[at]
  const { move, el } = useLoupe(g.src)
  const phone = items[0].height > items[0].width
  const pick = (i: number, inst: boolean) => { setArmed(true); setInstant(inst); setAt(((i % items.length) + items.length) % items.length) }
  return (
    <div className="re-cs-gallery" data-shape={phone ? 'phone' : 'wide'}>
      <figure
        className="re-sw-slab re-cs-stage" style={{ '--ga': `${items[0].width} / ${items[0].height}` } as Vars} data-swipe=""
        onPointerMove={move}
        onPointerDown={(e) => { if (e.pointerType === 'touch') { start.current = { x: e.clientX, y: e.clientY }; setArmed(true) } }}
        onPointerUp={(e) => {
          const s0 = start.current
          start.current = null
          if (!s0) return
          const dx = e.clientX - s0.x, dy = e.clientY - s0.y
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) pick(at + (dx < 0 ? 1 : -1), false)
        }}
      >
        <div className="re-sw-screen re-cs-stage-screen" data-swap data-instant={instant || undefined}>
          {items.map((it, i) => (i === at || armed) && (
            <img key={it.src} src={it.src} width={it.width} height={it.height} alt={i === at ? it.alt : ''} aria-hidden={i !== at || undefined}
              data-on={i === at || undefined} loading="lazy" decoding="async" />
          ))}
          {el}
        </div>
        <button type="button" className="re-sw-real" aria-label={`${g.alt}, at full size`} onClick={() => full.current?.open()} />
        <figcaption aria-live="polite">{g.caption || g.alt}</figcaption>
      </figure>
      <ol className="re-cs-stage-list" aria-label="Screens" onPointerEnter={() => setArmed(true)} onFocus={() => setArmed(true)}>
        {items.map((it, i) => (
          <li key={it.src}>
            <button type="button" aria-pressed={i === at} onClick={(e) => pick(i, e.detail === 0)}>
              <img src={it.src} alt="" loading="lazy" decoding="async" />
              <span>{it.caption || it.alt}</span>
            </button>
          </li>
        ))}
      </ol>
      <FullSize ref={full} src={g.src} w={g.width} h={g.height} alt={g.alt} />
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
                <ul className="re-cs-list">{c.decision.map((x) => <li key={x}><Road text={x} /></li>)}</ul>
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
        <section className="re-cs-screens" aria-labelledby="re-screens-h">
          <h2 id="re-screens-h" className="re-cs-h2">Screens</h2>
          {s.gallery.some((g) => g.alt.includes('Invented data')) && <p className="re-case-note re-num">Recreated screens, with invented data.</p>}
          <Gallery items={s.gallery} />
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
