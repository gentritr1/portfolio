import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { CaseDiagram } from './StackPoster'
import { caseDetails, caseOrder, questionOf } from './cases'

/**
 * A case study in the brief's order, readable in about two minutes: context, the question, constraints,
 * what didn't work, the decision, the result, what I'd do differently. Engineering detail waits behind a
 * disclosure. Healthcare rule: no real screens; the drawing explains the system instead.
 */
export function CasePage({ slug }: { slug: string }) {
  const c = caseDetails[slug]
  const question = questionOf(slug) ?? ''
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
        <h1 id="xv-case-h" ref={heading} tabIndex={-1} className="xv-case-question">{question}</h1>
        <dl className="xv-context">
          <div><dt className="xv-mono">Product</dt><dd>{c.context.product}</dd></div>
          <div><dt className="xv-mono">Users</dt><dd>{c.context.users}</dd></div>
          <div><dt className="xv-mono">My role</dt><dd>{c.context.role}</dd></div>
          <div><dt className="xv-mono">Time</dt><dd>{c.context.time}</dd></div>
        </dl>
      </header>

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
                  <h3 className="xv-mono">{g.title}</h3>
                  <ul className="xv-case-list">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
                </section>
              ))}
              {c.record && (
                <section>
                  <h3 className="xv-mono">{c.record.title}</h3>
                  <ol className="xv-record">
                    {c.record.rows.map((r) => (
                      <li key={r.what}>
                        <span className="xv-mono">{r.when}</span>
                        <div>
                          <strong>{r.what}</strong>
                          <pre className="xv-mono">{r.lines.join('\n')}</pre>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              )}
              <ul className="xv-case-links">
                {c.links.map((l) => (
                  <li key={l.href}>
                    {l.href.startsWith('/') ? (
                      <a className="xv-link" href={l.href}>{l.label}</a>
                    ) : (
                      <a className="xv-link" href={l.href} target="_blank" rel="noreferrer">{l.label}<span className="xv-sr"> (opens in a new tab)</span></a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </details>
        </article>

        <aside className="xv-case-figure">
          <CaseDiagram items={c.diagram} title={`How it is built, in ${c.diagram.length} layers: ${c.diagram.map((d) => d.title).join(', ')}.`} />
        </aside>
      </div>

      <nav className="xv-case-more" aria-label="More cases">
        {[{ label: 'Previous', s: prev }, { label: 'Next', s: next }].map(({ label, s }) => (
          <Link key={label} className="xv-case-next" to={`/drafts/exploded-view/${s}`} viewTransition>
            <span className="xv-mono">{label}</span>
            <span className="xv-case-next-q">{questionOf(s)}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
