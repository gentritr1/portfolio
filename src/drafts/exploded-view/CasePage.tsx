import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link } from 'react-router'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@phosphor-icons/react'
import { CaseDiagram, StackPoster } from './StackPoster'
import { caseDetails, caseOrder, questionOf } from './cases'
import { layers } from './data'
import { canUseWebGL, useReducedMotion } from './motion'
import { CASE_STATES, createCaseScene, type CaseScene, type CaseState } from './scene'
import { caseNames, caseShots, detailShots, fullSize, type Shot } from './shots'

/** Owner rule (PRODUCT.md, 2026-10-06): every care-platform and design-system screen says it holds invented data. */
const INVENTED = /^\/showcase\/(care|care-dashboard|design-system)\//
export const INVENTED_CAPTION = 'Real product screens, invented data.'
const captionOf = (s: Shot) => (INVENTED.test(s.src) ? (s.caption ? `${s.caption}. ${INVENTED_CAPTION}` : INVENTED_CAPTION) : s.caption ?? '')

/** A real screen at its true size (nothing shifts as it loads), linked to its full-resolution original. */
export function ShotImage({ shot, eager }: { shot: Shot; eager?: boolean }) {
  return (
    <a className="xv-full" href={fullSize(shot.src)} target="_blank" rel="noreferrer">
      <img src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      <span className="xv-sr"> (full size, opens in a new tab)</span>
    </a>
  )
}

/** The case each 3D explanation belongs to, and what it shows, in words for every reader. */
const CASE_MOTION: Record<string, { state: CaseState; caption: string }> = {
  'care-platform': { state: 'rewrite', caption: 'The rewrite in the stack: screens on the Interface layer turn from the old app to the new one, one at a time, each with a passed check.' },
  'design-system-react': { state: 'tokens', caption: 'A token in the stack: a colour changes on the Quality layer and reaches every component on the Interface layer, and the rendered contrast check still passes.' },
  'multi-tenant': { state: 'tenants', caption: 'Tenants in the stack: the API layer stays whole while the Data layer splits into one locked partition per organization.' },
  'read-to-feed': { state: 'reader', caption: 'The reader in the stack: the Mobile layer lifts, a page turns, and a fix snaps onto a maintained library fork.' },
}

/**
 * A bounded figure beside the story: the drawing first, then the 3D stack over it, which plays the case's one
 * animation when the figure is in view and then rests. Reduced motion shows the last frame; without WebGL the
 * drawing stays. `?xvPlay` plays it at once (QA).
 */
function CaseMotion({ state, caption }: { state: CaseState; caption: string }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const badgeRef = useRef<HTMLSpanElement>(null)
  const sceneRef = useRef<CaseScene | null>(null)
  const [live, setLive] = useState(false)
  const reduced = useReducedMotion()
  const reducedRef = useRef(reduced)

  useEffect(() => {
    const host = hostRef.current, anchor = host?.querySelector<HTMLElement>('.xv-stack')
    if (!host || !anchor || !canUseWebGL()) return
    let scene: CaseScene
    try {
      scene = createCaseScene(host, { anchor, state, labels: labelRefs.current, badge: badgeRef.current, onReady: () => setLive(true) })
    } catch {
      return
    }
    sceneRef.current = scene
    if (reducedRef.current) scene.finish()
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      if (reducedRef.current) scene.finish()
      else scene.play()
      io.disconnect()
    }, { threshold: 0.6 })
    if (new URLSearchParams(location.search).has('xvPlay')) scene.play()
    else io.observe(host)
    return () => {
      io.disconnect()
      scene.dispose()
      sceneRef.current = null
      setLive(false)
    }
  }, [state])

  useEffect(() => {
    reducedRef.current = reduced
    if (reduced) sceneRef.current?.finish()
  }, [reduced])

  return (
    <figure className="xv-case-motion">
      <div className="xv-motion-box" ref={hostRef} data-live={live || undefined}>
        <StackPoster lit={CASE_STATES[state].lit} title={caption} />
        <div className="xv-3d-labels" aria-hidden="true">
          {layers.map((l, i) => (
            <span key={l.id} ref={(el) => { labelRefs.current[i] = el }} style={{ '--i': i } as CSSProperties}>{l.name}</span>
          ))}
          <span className="xv-badge" ref={badgeRef}>AA <CheckIcon size={13} weight="bold" /></span>
        </div>
      </div>
      <figcaption className="xv-note">{caption}</figcaption>
    </figure>
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
  const detail = detailShots[slug] ?? []
  const motion = CASE_MOTION[slug]
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
              <ShotImage shot={s} />
              {captionOf(s) && <figcaption className="xv-note">{captionOf(s)}</figcaption>}
            </figure>
          ))}
        </section>
      )}
      {detail.length > 0 && (
        <section className="xv-case-detail" aria-label="The same rows, before and after, at full size">
          {detail.map((s) => (
            <figure key={s.src} className="xv-shot">
              <ShotImage shot={s} />
              <figcaption className="xv-note">{captionOf(s)}</figcaption>
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
          {motion && <CaseMotion key={slug} state={motion.state} caption={motion.caption} />}
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
