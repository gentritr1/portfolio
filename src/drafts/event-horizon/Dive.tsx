import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { stations, twinBase, twinSteps, type System } from './data'
import { caseDetails, questionOf } from '../exploded-view/cases'

const rise = {
  hidden: { opacity: 0, transform: 'translateY(10px)' },
  shown: { opacity: 1, transform: 'translateY(0px)' },
}

function Block({ title, children, reduced }: { title: string; children: React.ReactNode; reduced: boolean }) {
  return (
    <motion.section className="eh-block" variants={reduced ? undefined : rise}>
      <h3>{title}</h3>
      {children}
    </motion.section>
  )
}

/** The same compliance-screen test, one step at a time, on the old app and the new app. */
function Twin() {
  const [step, setStep] = useState(0)
  const n = String(step + 1).padStart(2, '0')
  return (
    <div className="eh-twin">
      <div className="eh-twin-pair">
        {(['old', 'new'] as const).map((app) => (
          <figure key={app}>
            <img src={`${twinBase}${app}-${n}-1080.webp`} alt={`${app === 'old' ? 'Old' : 'New'} app, step ${step + 1}: ${twinSteps[step]} Invented data.`} width={1080} height={675} loading="lazy" decoding="async" />
            <figcaption>{app === 'old' ? 'Old app · Nuxt 2' : 'New app · React'}</figcaption>
          </figure>
        ))}
      </div>
      <div className="eh-twin-steps" role="group" aria-label="Test steps">
        {twinSteps.map((s, i) => (
          <button key={s} type="button" aria-pressed={i === step} onClick={() => setStep(i)}>
            <span className="eh-num">{i + 1}</span> {s}
          </button>
        ))}
      </div>
    </div>
  )
}

/** The deep dive: in the drawer, or as the full case page (`page`), where the name is the page's heading. */
export function Dive({ system: s, reduced, page = false, onLeave }: { system: System; reduced: boolean; page?: boolean; onLeave?(): void }) {
  const Heading = page ? 'h1' : 'h2'
  // The full case page carries the written brief (question, constraints, decision, result); the drawer stays short.
  const c = page ? caseDetails[s.slug] : undefined
  const question = page ? questionOf(s.slug) : undefined
  return (
    <motion.div className={page ? 'eh-dive eh-dive-page' : 'eh-dive'} initial="hidden" animate="shown" variants={{ shown: { transition: { staggerChildren: reduced ? 0 : 0.045, delayChildren: reduced ? 0 : 0.18 } } }}>
      <motion.header className="eh-dive-head" variants={reduced ? undefined : rise}>
        <Heading id={page ? 'eh-case-h' : 'eh-drawer-h'} tabIndex={page ? -1 : undefined}>{s.name}</Heading>
        <p className="eh-dive-meta">{[s.kind, s.years, s.role].filter(Boolean).join(' · ')}</p>
        {question && <p className="eh-dive-q">{question}</p>}
        {s.story && <p className="eh-dive-lede">{s.story.product}</p>}
      </motion.header>

      {s.readouts.length > 0 && (
        <motion.ul className="eh-dive-readouts" variants={reduced ? undefined : rise}>
          {s.readouts.map((r) => (
            <li key={r.label}>
              <b>
                {r.value}
                {r.to && (
                  <>
                    <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
                    <span className="eh-sr"> to </span>
                    {r.to}
                  </>
                )}
              </b>
              <span>{r.label}</span>
            </li>
          ))}
        </motion.ul>
      )}

      {c && (
        <>
          <Block title="Context" reduced={reduced}>
            <dl className="eh-specs">
              <div><dt>Users</dt><dd>{c.context.users}</dd></div>
              <div><dt>My role</dt><dd>{c.context.role}</dd></div>
              <div><dt>Time</dt><dd>{c.context.time}</dd></div>
            </dl>
          </Block>
          <Block title="Constraints" reduced={reduced}>
            <ul className="eh-list">{c.constraints.map((x) => <li key={x}>{x}</li>)}</ul>
          </Block>
          {c.didntWork && (
            <Block title={c.didntWork.label} reduced={reduced}>
              <p>{c.didntWork.text}</p>
            </Block>
          )}
          <Block title="The decision that worked" reduced={reduced}>
            <ul className="eh-list">{c.decision.map((x) => <li key={x}>{x}</li>)}</ul>
          </Block>
        </>
      )}

      {s.gallery.length > 0 && (
        <Block title="Screens" reduced={reduced}>
          <ul className="eh-strip">
            {s.gallery.map((g) => (
              <li key={g.src} data-shape={g.height > g.width ? 'phone' : 'wide'}>
                <img src={g.src} alt={g.alt} width={g.width} height={g.height} loading="lazy" decoding="async" />
                {g.caption && <span>{g.caption}</span>}
              </li>
            ))}
          </ul>
        </Block>
      )}

      {s.layers.length > 0 && (
        <Block title="System architecture" reduced={reduced}>
          <ol className="eh-layers">
            {s.layers.map((l, i) => (
              <li key={l.title} style={{ '--i': i } as React.CSSProperties}>
                <span className="eh-layer-stack">{l.stack}</span>
                <strong>{l.title}</strong>
                <p>{l.description}</p>
              </li>
            ))}
          </ol>
        </Block>
      )}

      {s.story && (
        <Block title="What was built" reduced={reduced}>
          <p>{s.story.built}</p>
        </Block>
      )}

      {s.slug === 'care-platform' && (
        <>
          <Block title="One screen, one working day" reduced={reduced}>
            <ol className="eh-day">
              {stations.map((st) => (
                <li key={st.name}>
                  <span className="eh-day-time eh-num">{st.time}</span>
                  <div>
                    <strong>{st.name}</strong>
                    <p>{st.line}</p>
                    <pre>{st.artefact.join('\n')}</pre>
                    <small>{st.source}</small>
                  </div>
                </li>
              ))}
            </ol>
          </Block>
          <Block title="The same test on both apps" reduced={reduced}>
            <Twin />
          </Block>
        </>
      )}

      {(c || s.story) && (
        <Block title="The result" reduced={reduced}>
          <p className={c ? 'eh-dive-result' : undefined}>{c ? c.result : s.story?.result}</p>
        </Block>
      )}

      {c?.differently && (
        <Block title="What I'd do differently" reduced={reduced}>
          <p>{c.differently}</p>
        </Block>
      )}

      {s.facts.length > 0 && (
        <Block title="System specs" reduced={reduced}>
          <dl className="eh-specs">
            {s.facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </Block>
      )}

      {c && c.engineering.length > 0 && (
        <motion.details className="eh-eng" variants={reduced ? undefined : rise}>
          <summary>Engineering details</summary>
          {c.engineering.map((g) => (
            <section key={g.title}>
              <h4>{g.title}</h4>
              <ul className="eh-list">{g.items.map((x) => <li key={x}>{x}</li>)}</ul>
            </section>
          ))}
        </motion.details>
      )}

      <motion.footer className="eh-dive-foot" variants={reduced ? undefined : rise}>
        {!page && (
          <Link className="eh-btn eh-btn-solid" to={`/drafts/event-horizon/${s.slug}`} onClick={onLeave}>
            Read the full case
            <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
          </Link>
        )}
        {s.links.map((l) => (
          <a key={l.href} className="eh-btn" href={l.href} target="_blank" rel="noreferrer">
            {l.label}
            <span className="eh-sr"> (opens in a new tab)</span>
          </a>
        ))}
      </motion.footer>
    </motion.div>
  )
}
