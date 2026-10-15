import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { CaseDiagram } from './StackPoster'
import { caseDetails, caseOrder, questionOf } from './cases'
import { caseNames, caseShots, type Shot } from './shots'

/** Real product screens, lazy, with their true size so nothing shifts as they load. */
const INVENTED = /^\/showcase\/(care|care-dashboard|design-system)\//

export function Shots({ shots }: { shots: Shot[] }) {
  if (!shots.length) return null
  return (
    <div className="xv-shots">
      {shots.map((s) => (
        <figure key={s.src} className={s.phone ? 'xv-shot xv-shot-phone' : 'xv-shot'}>
          <img src={s.src} alt={s.alt} width={s.width} height={s.height} loading="lazy" decoding="async" />
          {/* Owner rule (PRODUCT.md, 2026-10-06): every internal care / design-system screen says it holds invented data. */}
          {INVENTED.test(s.src) && <figcaption>Real product screens · invented data</figcaption>}
        </figure>
      ))}
    </div>
  )
}

/**
 * A case study in the brief's order, readable in about two minutes: context, the question, constraints,
 * what didn't work, the decision, the result, what I'd do differently. Engineering detail waits behind a
 * disclosure. The drawing explains the system; the screens beside it are real product screens (the healthcare
 * ones ran on a mock API with invented data).
 */
export function CasePage({ slug }: { slug: string }) {
  const c = caseDetails[slug]
  const question = questionOf(slug) ?? ''
  const shots = caseShots[slug] ?? []
  const at = caseOrder.indexOf(slug)
  const prev = caseOrder[(at - 1 + caseOrder.length) % caseOrder.length]
  const next = caseOrder[(at + 1) % caseOrder.length]
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    heading.current?.focus({ preventScroll: true })
  }, [slug])

  return (
    <main className="xv-casepage" aria-labelledby="xv-case-h">
      <nav className="xv-case-top">
        <Link className="xv-link" to="/drafts/exploded-view" state={{ at: 'work' }} viewTransition>
          <ArrowLeftIcon size={14} weight="bold" aria-hidden="true" />
          All work
        </Link>
      </nav>

      <header className="xv-case-head">
        <h1 id="xv-case-h" ref={heading} tabIndex={-1} className="xv-case-name">{caseNames[slug] ?? question}</h1>
        <p className="xv-case-question">{question}</p>
        <dl className="xv-context">
          <div><dt className="xv-note">Product</dt><dd>{c.context.product}</dd></div>
          <div><dt className="xv-note">Users</dt><dd>{c.context.users}</dd></div>
          <div><dt className="xv-note">My role</dt><dd>{c.context.role}</dd></div>
          <div><dt className="xv-note">Time</dt><dd>{c.context.time}</dd></div>
        </dl>
      </header>

      {shots.length > 0 && (
        <section className="xv-case-shots" aria-label="Product screens" data-phone={shots[0].phone || undefined} data-count={shots.length}>
          {shots.map((s) => (
            <figure key={s.src} className="xv-shot">
              <img src={s.src} alt={s.alt} width={s.width} height={s.height} loading="lazy" decoding="async" />
              {(s.caption || INVENTED.test(s.src)) && <figcaption className="xv-note">{[s.caption, INVENTED.test(s.src) && 'Real product screens, invented data'].filter(Boolean).join('. ')}</figcaption>}
            </figure>
          ))}
        </section>
      )}

      <div className="xv-case-grid">
        <article className="xv-case-text">
          <section>
            <h2 className="xv-case-h2">Constraints</h2>
            <ul className="xv-case-list">{c.constraints.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          {c.didntWork && (
            <section>
              <h2 className="xv-case-h2">{c.didntWork.label}</h2>
              <p>{c.didntWork.text}</p>
            </section>
          )}
          <section>
            <h2 className="xv-case-h2">The decision that worked</h2>
            <ul className="xv-case-list">{c.decision.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
          <section>
            <h2 className="xv-case-h2">Result</h2>
            <p className="xv-result xv-case-result">{c.result}</p>
          </section>
          {c.differently && (
            <section>
              <h2 className="xv-case-h2">What I'd do differently</h2>
              <p>{c.differently}</p>
            </section>
          )}

          <details className="xv-eng">
            <summary>
              <span>Engineering details</span>
              <ArrowRightIcon className="xv-eng-arrow" size={14} weight="bold" aria-hidden="true" />
            </summary>
            <div className="xv-eng-body">
              {c.engineering.map((g) => (
                <section key={g.title}>
                  <h3 className="xv-note">{g.title}</h3>
                  <ul className="xv-case-list">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
                </section>
              ))}
              {c.record && (
                <section>
                  <h3 className="xv-note">{c.record.title}</h3>
                  <ol className="xv-record">
                    {c.record.rows.map((r) => (
                      <li key={r.what}>
                        <span className="xv-note">{r.when}</span>
                        <div>
                          <strong>{r.what}</strong>
                          <pre>{r.lines.join('\n')}</pre>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              {c.links.length > 0 && (
                <ul className="xv-case-links">
                  {c.links.map((l) => (
                    <li key={l.href}>
                      <a className="xv-link" href={l.href} target="_blank" rel="noreferrer">{l.label}<span className="xv-sr"> (opens in a new tab)</span></a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </details>
        </article>

        <aside className="xv-case-figure">
          <CaseDiagram items={c.diagram} title={`How it is built, in ${c.diagram.length} layers: ${c.diagram.map((d) => d.title).join(', ')}.`} />
          {/* On narrow screens the drawing's notes move here, at a readable size; beside the text the drawing carries them. */}
          <ol className="xv-diagram-key">
            {c.diagram.map((d) => (
              <li key={d.title}><strong>{d.title}</strong><span>{d.stack}</span><span>{d.note}</span></li>
            ))}
          </ol>
        </aside>
      </div>

      <nav className="xv-case-more" aria-label="More cases">
        {[{ label: 'Previous', s: prev }, { label: 'Next', s: next }].map(({ label, s }) => (
          <Link key={label} className="xv-case-next" to={`/drafts/exploded-view/${s}`} viewTransition>
            <span className="xv-note">{label}</span>
            <span className="xv-case-next-q">{questionOf(s)}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
