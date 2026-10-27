import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { ArrowDownIcon, ArrowRightIcon, CheckIcon, CopyIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { StackPoster } from './StackPoster'
import { CasePage, INVENTED_CAPTION, ShotImage } from './CasePage'
import { caseDetails, moreCases } from './cases'
import { caseNames, caseShots } from './shots'
import { alsoShipped, cases, howIWork, lab, labLesson, layers, links, type LayerId } from './data'
import { canUseWebGL, useReducedMotion } from './motion'
import { createHero, type HeroScene } from './hero'
import './exploded-view.css'

const HERO_SCREEN = caseShots['care-platform'][1]
const shot = (slug: string, i: number) => caseShots[slug][i]

/**
 * The first screen's object: the work in five layers, front to back, with a real product screen as the front
 * (Interface) layer. The HTML drawing below is the first paint, the reduced-motion view and the no-WebGL view;
 * the 3D scene takes over on its first frame, which is the same picture, and then settles once.
 */
function HeroObject() {
  const boxRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [live, setLive] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const box = boxRef.current, img = imgRef.current
    if (reduced || !box || !img || !canUseWebGL()) return
    let hero: HeroScene | null = null, gone = false
    img.decode().then(() => {
      if (gone) return
      try {
        hero = createHero(box, img, labelRefs.current, () => setLive(true))
      } catch {
        // The drawing stays.
      }
    }, () => {})
    return () => {
      gone = true
      hero?.dispose()
      setLive(false)
    }
  }, [reduced])

  return (
    <figure className="xv-hero-figure">
      <div
        className="xv-obj"
        ref={boxRef}
        data-live={live || undefined}
        role="img"
        aria-label="The work in five layers: Interface, Mobile, API and services, Data, and Quality. The Interface layer is a real screen from the care platform rewrite."
      >
        <div className="xv-obj-still">
          {[4, 3, 2, 1].map((i) => <span key={i} className="xv-plate" style={{ '--i': i } as CSSProperties} />)}
          <img
            ref={imgRef}
            className="xv-plate"
            style={{ '--i': 0 } as CSSProperties}
            src={HERO_SCREEN.src}
            width={HERO_SCREEN.width}
            height={HERO_SCREEN.height}
            alt=""
            fetchPriority="high"
          />
        </div>
        <div className="xv-obj-labels">
          {layers.map((l, i) => (
            <span key={l.id} className="xv-obj-label" ref={(el) => { labelRefs.current[i] = el }} style={{ '--i': i } as CSSProperties}>
              {l.name}
            </span>
          ))}
        </div>
      </div>
      <p className="xv-obj-key xv-note" aria-hidden="true">{layers.map((l) => l.name).join(' · ')}</p>
      <figcaption className="xv-note">
        <Link className="xv-link" to="/drafts/exploded-view/care-platform" viewTransition>Care platform rewrite</Link>
        , the new React app. {INVENTED_CAPTION}
      </figcaption>
    </figure>
  )
}

/** Each featured story shows its own kind of evidence, at a size where it reads. */
function Evidence({ slug }: { slug: string }) {
  switch (slug) {
    case 'care-platform':
      return (
        <figure className="xv-ev">
          <div className="xv-ev-pair">
            <div className="xv-shot"><ShotImage shot={shot(slug, 0)} /><span className="xv-note">Before · the Vue app</span></div>
            <div className="xv-shot"><ShotImage shot={shot(slug, 1)} /><span className="xv-note">After · the React app</span></div>
          </div>
          <figcaption className="xv-note">{INVENTED_CAPTION} Select a screen for full size.</figcaption>
        </figure>
      )
    case 'design-system-react':
      return (
        <figure className="xv-ev xv-ev-wide">
          <ShotImage shot={shot(slug, 0)} />
          <figcaption className="xv-note">The date range picker. {INVENTED_CAPTION}</figcaption>
        </figure>
      )
    case 'multi-tenant':
      return (
        <div className="xv-ev-split">
          <figure className="xv-ev">
            <ShotImage shot={shot(slug, 0)} />
            <figcaption className="xv-note">One organization’s dashboard. {INVENTED_CAPTION}</figcaption>
          </figure>
          <figure className="xv-ev xv-concept">
            <svg viewBox="0 0 240 172" role="img" aria-label="Concept: one shared API above three data partitions, each locked to one organization.">
              <g className="xv-layer"><rect x="12" y="10" width="216" height="40" rx="7" /></g>
              <text x="120" y="35" textAnchor="middle">One API</text>
              {[0, 1, 2].map((k) => (
                <g key={k}>
                  <line className="xv-align" x1={44 + k * 76} y1="50" x2={44 + k * 76} y2="92" />
                  <g className="xv-layer" data-on=""><rect x={12 + k * 76} y="92" width="64" height="60" rx="7" /></g>
                  <path className="xv-lock" d={`M${36 + k * 76} 118h16v14h-16z M${39 + k * 76} 118v-4a5 5 0 0 1 10 0v4`} />
                </g>
              ))}
            </svg>
            <figcaption className="xv-note">A concept, not a product screen: one API, and each organization’s data kept apart.</figcaption>
          </figure>
        </div>
      )
    case 'read-to-feed':
      return (
        <div className="xv-ev-phones">
          {[0, 2].map((i) => (
            <figure key={i} className="xv-ev">
              <ShotImage shot={shot(slug, i)} />
              <figcaption className="xv-note">{shot(slug, i).caption}</figcaption>
            </figure>
          ))}
        </div>
      )
    default:
      return null
  }
}

export default function Draft() {
  // /drafts/exploded-view/<slug> is that project's case study.
  const { '*': rest } = useParams()
  const routeLocation = useLocation()
  const caseSlug = rest && caseDetails[rest] ? rest : null
  const [layer, setLayer] = useState<LayerId | ''>('')
  // Arrow keys change the selection at once: a keyboard action is never animated.
  const [byKeyboard, setByKeyboard] = useState(false)

  // "All work" from a case returns to the work list, not the top of the page.
  useEffect(() => {
    if (caseSlug || (routeLocation.state as { at?: string } | null)?.at !== 'work') return
    const raf = requestAnimationFrame(() => document.getElementById('xv-work-h')?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(raf)
  }, [caseSlug, routeLocation.state])

  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(links.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      location.href = `mailto:${links.email}`
    }
  }

  if (caseSlug) {
    return (
      <div className="xv-root">
        <CasePage slug={caseSlug} />
      </div>
    )
  }

  const selected = layers.find((l) => l.id === layer)
  return (
    <div className="xv-root">
      <header className="xv-hero">
        <div className="xv-hero-text">
          <h1 className="xv-tagline">I build clear software where clarity matters.</h1>
          <p className="xv-name">Gentrit Rashiti <span>· Frontend &amp; Full-Stack Developer · Healthcare &amp; Mobile</span></p>
          <p className="xv-lede">5+ years shipping web and mobile products, from first screen to store release.</p>
          <p className="xv-meta xv-note">Kosovo · CET · Open to remote, full-time</p>
        </div>
        <HeroObject />
        <div className="xv-actions">
          <a className="xv-btn xv-btn-primary" href="#xv-work-h">
            See the work
            <ArrowDownIcon size={16} weight="bold" aria-hidden="true" />
          </a>
          <a className="xv-btn" href={links.cv} download>
            <DownloadSimpleIcon size={16} weight="bold" aria-hidden="true" />
            Download CV
          </a>
          <span className="xv-actions-quiet">
            <a className="xv-btn xv-btn-quiet" href={`mailto:${links.email}`}>Email</a>
            <a className="xv-btn xv-btn-quiet" href={links.github} target="_blank" rel="noreferrer">GitHub<span className="xv-sr"> (opens in a new tab)</span></a>
            <a className="xv-btn xv-btn-quiet" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<span className="xv-sr"> (opens in a new tab)</span></a>
          </span>
        </div>
      </header>

      <main className="xv-main">
        <section className="xv-section" aria-labelledby="xv-work-h">
          <h2 id="xv-work-h" className="xv-h2">Selected work</h2>
          <ol className="xv-cases">
            {cases.map((c) => (
              <li key={c.slug} className="xv-case">
                <div className="xv-case-head">
                  <div className="xv-case-lead">
                    <h3 className="xv-case-title">{caseNames[c.slug]}</h3>
                    <p className="xv-question">{c.question}</p>
                  </div>
                  <div className="xv-case-side">
                    <p className="xv-answer">{c.answer}</p>
                    <p className="xv-result">{c.result}</p>
                    <div className="xv-case-foot">
                      <Link className="xv-link" to={`/drafts/exploded-view/${c.slug}`} viewTransition>
                        Read the case
                        <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
                      </Link>
                      <p className="xv-tags xv-note" aria-label="Layers">
                        {c.layers.map((id) => layers.find((l) => l.id === id)?.name).join(' / ')}
                      </p>
                    </div>
                  </div>
                </div>
                <Evidence slug={c.slug} />
              </li>
            ))}
          </ol>
          <h3 className="xv-more-h">More work</h3>
          <ul className="xv-more">
            {moreCases.map((m) => (
              <li key={m.slug}>
                <Link to={`/drafts/exploded-view/${m.slug}`} viewTransition>
                  <span className="xv-more-name">{caseNames[m.slug]}</span>
                  <span className="xv-more-line">{m.line}</span>
                  <ArrowRightIcon className="xv-more-arrow" size={16} weight="bold" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="xv-section" aria-labelledby="xv-stack-h" data-kbd={byKeyboard || undefined}>
          <h2 id="xv-stack-h" className="xv-h2">Across the stack</h2>
          <div className="xv-stack-grid">
            <StackPoster lit={selected ? [selected.id] : layers.map((l) => l.id)} lift={selected?.id} title={selected ? `The ${selected.name} layer, raised in the stack.` : 'All five layers of the stack.'} />
            <fieldset
              className="xv-layers"
              onKeyDown={() => setByKeyboard(true)}
              onPointerDown={() => setByKeyboard(false)}
            >
              <legend className="xv-note">Choose a layer to raise it in the drawing</legend>
              <label className="xv-layer-row">
                <input type="radio" name="xv-layer" value="" checked={!layer} onChange={() => setLayer('')} />
                <span className="xv-layer-name">All layers</span>
              </label>
              {layers.map((l) => (
                <label key={l.id} className="xv-layer-row">
                  <input type="radio" name="xv-layer" value={l.id} checked={layer === l.id} onChange={() => setLayer(l.id)} />
                  <span className="xv-layer-name">{l.name}</span>
                  <span className="xv-layer-tools">{l.tools.join(', ')}</span>
                </label>
              ))}
            </fieldset>
          </div>
          <p className="xv-also">{alsoShipped}</p>
        </section>

        <section className="xv-section" aria-labelledby="xv-lab-h">
          <h2 id="xv-lab-h" className="xv-h2">Lab</h2>
          {lab.slice(0, 1).map((item) => (
            <article key={item.name} className="xv-lab-feature">
              <figure className="xv-ev">
                <ShotImage shot={shot('futurisma', 1)} />
                <figcaption className="xv-note">Frostline at midnight, in the autopilot demo. A real game capture.</figcaption>
              </figure>
              <div className="xv-lab-text">
                <h3>{item.name}</h3>
                <p>{item.line}</p>
                <div className="xv-lab-links">
                  <Link className="xv-link" to="/drafts/exploded-view/futurisma" viewTransition>
                    Read the case
                    <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
                  </Link>
                  {item.link && (
                    <a className="xv-link" href={item.link.href} target="_blank" rel="noreferrer">
                      {item.link.label}<span className="xv-sr"> (opens in a new tab)</span>
                    </a>
                  )}
                </div>
                {item.agents && (
                  <details className="xv-eng">
                    <summary>
                      <span>How it is built</span>
                      <ArrowRightIcon className="xv-eng-arrow" size={14} weight="bold" aria-hidden="true" />
                    </summary>
                    <dl className="xv-agents">
                      <div><dt className="xv-note">The agents do</dt><dd>{item.agents.do}</dd></div>
                      <div><dt className="xv-note">I decide</dt><dd>{item.agents.decide}</dd></div>
                      <div><dt className="xv-note">One thing that failed</dt><dd>{item.agents.failed}</dd></div>
                    </dl>
                    {item.learned && <p className="xv-learned"><span className="xv-note">Learned</span> {item.learned}</p>}
                  </details>
                )}
              </div>
            </article>
          ))}
          <ul className="xv-lab-more">
            {lab.slice(1).map((item) => {
              const thumb = LAB_THUMBS[item.name]
              return (
                <li key={item.name}>
                  {thumb && <img src={thumb.src} alt={thumb.alt} width={256} height={160} loading="lazy" decoding="async" />}
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.line}</p>
                    {item.link && (
                      <a className="xv-link" href={item.link.href} target="_blank" rel="noreferrer">
                        {item.link.label}<span className="xv-sr"> for {item.name} (opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="xv-lab-learned"><span className="xv-note">What these taught me</span> {labLesson}</p>
        </section>

        <section className="xv-section" aria-labelledby="xv-how-h">
          <h2 id="xv-how-h" className="xv-h2">How I work</h2>
          <ul className="xv-how">
            {howIWork.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </section>

        <section className="xv-section xv-contact" aria-labelledby="xv-contact-h">
          <h2 id="xv-contact-h" className="xv-h2">Contact</h2>
          <p className="xv-contact-line">If you are building software where clarity matters, I would like to hear about it.</p>
          <p className="xv-contact-email">
            <a href={`mailto:${links.email}`}>{links.email}</a>
            <button type="button" className="xv-btn xv-copy" onClick={copy} data-copied={copied || undefined}>
              <span className="xv-copy-icon" aria-hidden="true">
                <CopyIcon size={16} weight="bold" />
                <CheckIcon size={16} weight="bold" />
              </span>
              <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </p>
          <div className="xv-actions">
            <a className="xv-btn" href={links.cv} download>
              <DownloadSimpleIcon size={16} weight="bold" aria-hidden="true" />
              Download CV
            </a>
            <a className="xv-btn xv-btn-quiet" href={links.github} target="_blank" rel="noreferrer">GitHub<span className="xv-sr"> (opens in a new tab)</span></a>
            <a className="xv-btn xv-btn-quiet" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<span className="xv-sr"> (opens in a new tab)</span></a>
          </div>
        </section>
      </main>
    </div>
  )
}

/** Compact previews for the smaller side projects: the same crops the main portfolio's index uses. */
const LAB_THUMBS: Record<string, { src: string; alt: string }> = {
  Offday: { src: '/personal/shots/thumbs/offday-app.webp', alt: 'Offday team calendar for October with leave bars' },
  'FJALË': { src: '/personal/shots/thumbs/fjale.webp', alt: 'FJALË word game board with Albanian keyboard' },
  'Za!': { src: '/personal/shots/thumbs/za.webp', alt: 'Za! card game lobby with pixel logo' },
}
