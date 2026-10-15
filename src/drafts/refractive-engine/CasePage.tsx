import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon, CaretDownIcon } from '@phosphor-icons/react'
import { caseDetails, questionOf } from '../exploded-view/cases'
import { STAGE } from './scene'
import { INVENTED, systems } from './data'

const BASE = '/drafts/refractive-engine'

/**
 * The prism from the lab, split into its three layers and drawn flat, so the page keeps the object it was
 * opened from. The plates part once on arrival; the layer being read lights up.
 */
function Prism({ layers, active, onActive }: { layers: { title: string; stack: string }[]; active: number | null; onActive(i: number | null): void }) {
  const cx = 130, hw = 112, hh = 56, gap = 132, top = 70, depth = 9
  return (
    <figure className="re-prism" aria-label={`Built in ${layers.length} layers: ${layers.map((l) => l.title).join(', ')}.`}>
      <svg viewBox={`0 0 260 ${top * 2 + gap * (layers.length - 1)}`} aria-hidden="true">
        {layers.map((_, i) => {
          const cy = top + i * gap
          const mid = (layers.length - 1) / 2
          return (
            <g key={i} className="re-plate" data-active={active === i || undefined} style={{ '--from': `${(mid - i) * gap}px`, '--i': i } as CSSProperties}>
              <path className="re-plate-side" d={`M${cx - hw} ${cy} L${cx} ${cy + hh} L${cx + hw} ${cy} L${cx + hw} ${cy + depth} L${cx} ${cy + hh + depth} L${cx - hw} ${cy + depth} Z`} />
              <path className="re-plate-top" d={`M${cx} ${cy - hh} L${cx + hw} ${cy} L${cx} ${cy + hh} L${cx - hw} ${cy} Z`} />
            </g>
          )
        })}
      </svg>
      <ol className="re-prism-labels">
        {layers.map((l, i) => (
          <li
            key={l.title}
            data-active={active === i || undefined}
            style={{ '--y': (top + i * gap) / (top * 2 + gap * (layers.length - 1)) } as CSSProperties}
            onMouseEnter={() => onActive(i)}
            onMouseLeave={() => onActive(null)}
          >
            <strong>{l.title}</strong>
            <span className="re-num">{l.stack}</span>
          </li>
        ))}
      </ol>
    </figure>
  )
}

/**
 * A product's full case, inside the draft: the question it answered, the context, what got in the way, what
 * worked and what came of it. The writing is the same sourced brief the Exploded View pages use.
 */
export function CasePage({ slug, onBack }: { slug: string; onBack(): void }) {
  const at = systems.findIndex((s) => s.slug === slug)
  const s = systems[at]
  const c = caseDetails[slug]
  const prev = systems[(at - 1 + systems.length) % systems.length]
  const next = systems[(at + 1) % systems.length]
  const heading = useRef<HTMLHeadingElement>(null)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
  }, [slug])

  const links = [...s.links, ...(c?.links ?? [])].filter((l, i, all) => !l.href.startsWith('/') && all.findIndex((x) => x.href === l.href) === i)

  return (
    <article className="re-casepage" data-stage={STAGE.ledger} aria-labelledby="re-case-h" key={slug}>
      <nav className="re-case-top">
        <button type="button" className="re-btn re-btn-quiet re-solid" onClick={onBack}>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          All work
        </button>
      </nav>

      <header className="re-case-head">
        <h1 id="re-case-h" ref={heading} tabIndex={-1} className="re-case-name">{s.name}</h1>
        <p className="re-case-q">{questionOf(slug) ?? s.line}</p>
        <p className="re-num re-case-meta">{[s.kind, s.years].filter(Boolean).join(' · ')}</p>
        {s.readouts.length > 0 && (
          <ul className="re-readouts-list re-case-readouts">
            {s.readouts.map((r) => (
              <li key={r.label}>
                <b className="re-num">
                  {r.value}
                  {r.to && (<><ArrowRightIcon size={12} weight="bold" aria-hidden="true" /><span className="re-sr"> to </span>{r.to}</>)}
                </b>
                <span>{r.label}</span>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="re-case-grid">
        <div className="re-case-body re-solid">
          {c && (
            <dl className="re-case-context">
              <div><dt className="re-num">Product</dt><dd>{c.context.product}</dd></div>
              <div><dt className="re-num">Users</dt><dd>{c.context.users}</dd></div>
              <div><dt className="re-num">My role</dt><dd>{c.context.role}</dd></div>
              <div><dt className="re-num">Time</dt><dd>{c.context.time}</dd></div>
            </dl>
          )}

          {c ? (
            <>
              <section>
                <h2 className="re-case-h2">Constraints</h2>
                <ul className="re-case-list">{c.constraints.map((x) => <li key={x}>{x}</li>)}</ul>
              </section>
              {c.didntWork && (
                <section>
                  <h2 className="re-case-h2">{c.didntWork.label}</h2>
                  <p>{c.didntWork.text}</p>
                </section>
              )}
              <section>
                <h2 className="re-case-h2">The decision that worked</h2>
                <ul className="re-case-list">{c.decision.map((x) => <li key={x}>{x}</li>)}</ul>
              </section>
              <section>
                <h2 className="re-case-h2">Result</h2>
                <p className="re-case-result">{c.result}</p>
              </section>
              {c.differently && (
                <section>
                  <h2 className="re-case-h2">What I'd do differently</h2>
                  <p>{c.differently}</p>
                </section>
              )}
            </>
          ) : (
            s.story && (
              <>
                <section><h2 className="re-case-h2">What was built</h2><p>{s.story.built}</p></section>
                <section><h2 className="re-case-h2">Result</h2><p className="re-case-result">{s.story.result}</p></section>
              </>
            )
          )}

          <section>
            <h2 className="re-case-h2">The three layers</h2>
            <ol className="re-case-layers" onMouseLeave={() => setActive(null)}>
              {s.layers.map((l, i) => (
                <li key={l.title} data-active={active === i || undefined} onMouseEnter={() => setActive(i)}>
                  <h3>{l.title}</h3>
                  <p className="re-num re-layer-stack">{l.stack}</p>
                  <p>{l.description}</p>
                </li>
              ))}
            </ol>
          </section>

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

        <aside className="re-case-side">
          <figure className="re-case-shot" data-shape={s.aspect < 1 ? 'phone' : 'wide'}>
            <img src={s.texture} alt={`${s.name}, a screen from the product`} width={s.aspect < 1 ? Math.round(1024 * s.aspect) : 1280} height={s.aspect < 1 ? 1024 : 800} loading="lazy" decoding="async" />
            {INVENTED.has(s.slug) && <figcaption>Real product screens · invented data</figcaption>}
          </figure>
          <Prism layers={s.layers} active={active} onActive={setActive} />
        </aside>
      </div>

      {s.gallery.length > 0 && (
        <section className="re-case-screens" aria-labelledby="re-screens-h">
          <h2 id="re-screens-h" className="re-case-h2">Screens</h2>
          {s.gallery.some((g) => g.alt.includes('Invented data')) && <p className="re-case-note re-num">Recreated screens, with invented data.</p>}
          <ul data-shape={s.gallery[0].height > s.gallery[0].width ? 'phone' : 'wide'}>
            {s.gallery.map((g) => (
              <li key={g.src} className="re-solid">
                <img src={g.src} alt={g.alt} width={g.width} height={g.height} loading="lazy" decoding="async" />
                {g.caption && <span>{g.caption}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav className="re-case-more" aria-label="More cases">
        {[{ label: 'Previous', p: prev }, { label: 'Next', p: next }].map(({ label, p }) => (
          <Link key={label} className="re-case-next re-solid" to={`${BASE}/${p.slug}`} viewTransition>
            <span className="re-num">{label}</span>
            <strong>{p.name}</strong>
            <span className="re-case-next-q">{questionOf(p.slug) ?? p.line}</span>
          </Link>
        ))}
      </nav>
    </article>
  )
}
