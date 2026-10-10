import { useState } from 'react'
import { ArrowRightIcon, CopyIcon, CheckIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { StackPoster } from './StackPoster'
import { alsoShipped, cases, howIWork, lab, layers, links } from './data'
import './exploded-view.css'

/**
 * Exploded View, step 2 of the brief's process: the static, motion-off homepage, to judge content and
 * layout alone. The 3D stack and its scene states come next, after review.
 */
export default function Draft() {
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

  return (
    <div className="xv-root">
      <header className="xv-hero">
        <div className="xv-hero-text">
          <p className="xv-name">Gentrit Rashiti</p>
          <p className="xv-role">Frontend &amp; Full-Stack Developer · Healthcare &amp; Mobile</p>
          <h1 className="xv-tagline">I build clear software where clarity matters.</h1>
          <p className="xv-lede">5+ years shipping web and mobile products, from first screen to store release.</p>
          <p className="xv-meta xv-mono">Kosovo · Remote · CET</p>
          <div className="xv-actions">
            <a className="xv-btn xv-btn-primary" href={links.cv} download>
              <DownloadSimpleIcon size={16} weight="bold" aria-hidden="true" />
              Download CV
            </a>
            <a className="xv-btn" href={`mailto:${links.email}`}>Email</a>
            <a className="xv-btn xv-btn-quiet" href={links.github} target="_blank" rel="noreferrer">GitHub<span className="xv-sr"> (opens in a new tab)</span></a>
            <a className="xv-btn xv-btn-quiet" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<span className="xv-sr"> (opens in a new tab)</span></a>
          </div>
        </div>
        <figure className="xv-hero-figure">
          <StackPoster title="One product in exploded view: interface, mobile, API and services, data, and quality, stacked and labelled." />
          <figcaption className="xv-mono">The work, in five layers</figcaption>
        </figure>
      </header>

      <main>
        <section className="xv-section" aria-labelledby="xv-work-h">
          <h2 id="xv-work-h" className="xv-h2">Selected work</h2>
          <ol className="xv-cases">
            {cases.map((c) => (
              <li key={c.slug} className="xv-case">
                <StackPoster lit={c.layers} compact />
                <div className="xv-case-body">
                  <h3 className="xv-question">{c.question}</h3>
                  <p className="xv-answer">{c.answer}</p>
                  <p className="xv-result">{c.result}</p>
                  <p className="xv-tags xv-mono" aria-label="Layers">
                    {c.layers.map((id) => layers.find((l) => l.id === id)?.name).join(' / ')}
                  </p>
                  <a className="xv-link" href={c.href}>
                    Read the case
                    <ArrowRightIcon size={14} weight="bold" aria-hidden="true" />
                  </a>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="xv-section xv-stack-section" aria-labelledby="xv-stack-h">
          <h2 id="xv-stack-h" className="xv-h2">Across the stack</h2>
          <div className="xv-stack-grid">
            <StackPoster lit={layers.map((l) => l.id)} />
            <dl className="xv-layers">
              {layers.map((l, i) => (
                <div key={l.id}>
                  <dt><span className="xv-mono">{String(i + 1).padStart(2, '0')}</span> {l.name}</dt>
                  <dd>{l.tools.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p className="xv-also">{alsoShipped}</p>
        </section>

        <section className="xv-section" aria-labelledby="xv-lab-h">
          <h2 id="xv-lab-h" className="xv-h2">Lab</h2>
          <ul className="xv-lab">
            {lab.map((item) => (
              <li key={item.name}>
                <h3>
                  {item.name}
                  {item.link && (
                    <a className="xv-link" href={item.link.href} target="_blank" rel="noreferrer">
                      {item.link.label}<span className="xv-sr"> (opens in a new tab)</span>
                      <ArrowRightIcon size={13} weight="bold" aria-hidden="true" />
                    </a>
                  )}
                </h3>
                <p>{item.line}</p>
                {item.agents && (
                  <dl className="xv-agents">
                    <div><dt className="xv-mono">The agents do</dt><dd>{item.agents.do}</dd></div>
                    <div><dt className="xv-mono">I decide</dt><dd>{item.agents.decide}</dd></div>
                    <div><dt className="xv-mono">One thing that failed</dt><dd>{item.agents.failed}</dd></div>
                  </dl>
                )}
                {item.learned && <p className="xv-learned"><span className="xv-mono">Learned</span> {item.learned}</p>}
              </li>
            ))}
          </ul>
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
          <div className="xv-actions">
            <button type="button" className="xv-btn xv-btn-primary" onClick={copy} aria-live="polite">
              {copied ? <CheckIcon size={16} weight="bold" aria-hidden="true" /> : <CopyIcon size={16} weight="bold" aria-hidden="true" />}
              {copied ? 'Copied' : links.email}
            </button>
            <a className="xv-btn" href={links.cv} download>Download CV</a>
            <a className="xv-btn xv-btn-quiet" href={links.github} target="_blank" rel="noreferrer">GitHub<span className="xv-sr"> (opens in a new tab)</span></a>
            <a className="xv-btn xv-btn-quiet" href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn<span className="xv-sr"> (opens in a new tab)</span></a>
          </div>
        </section>
      </main>
    </div>
  )
}
