import { useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRightIcon } from '@phosphor-icons/react'
import { stations, twinBase, twinSteps, type System } from './data'

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
            <span className="eh-mono">{String(i + 1).padStart(2, '0')}</span> {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Dive({ system: s, reduced }: { system: System; reduced: boolean }) {
  return (
    <motion.div className="eh-dive" initial="hidden" animate="shown" variants={{ shown: { transition: { staggerChildren: reduced ? 0 : 0.045, delayChildren: reduced ? 0 : 0.18 } } }}>
      <motion.header className="eh-dive-head" variants={reduced ? undefined : rise}>
        <h2 id="eh-drawer-h">{s.name}</h2>
        <p className="eh-dive-meta eh-mono">{[s.kind, s.years, s.role].filter(Boolean).join(' · ')}</p>
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
                <span className="eh-layer-stack eh-mono">{l.stack}</span>
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
                  <span className="eh-day-time eh-mono">{st.time}</span>
                  <div>
                    <strong>{st.name}</strong>
                    <p>{st.line}</p>
                    <pre className="eh-mono">{st.artefact.join('\n')}</pre>
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

      {s.story && (
        <Block title="The result" reduced={reduced}>
          <p>{s.story.result}</p>
        </Block>
      )}

      {s.facts.length > 0 && (
        <Block title="System specs" reduced={reduced}>
          <dl className="eh-specs">
            {s.facts.map((f) => (
              <div key={f.label}>
                <dt className="eh-mono">{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
        </Block>
      )}

      <motion.footer className="eh-dive-foot" variants={reduced ? undefined : rise}>
        <Link className="eh-btn eh-btn-solid" to={`/work/${s.slug}`}>
          Read the full case
          <ArrowRightIcon size={16} weight="bold" aria-hidden="true" />
        </Link>
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
