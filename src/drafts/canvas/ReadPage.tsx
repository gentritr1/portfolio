import { OldCareFile } from '../../components/portfolio/OldCareFile'
import { currentYear, firstYear, projects } from '../../content/projects'
import { links } from '../../content/links'
import { caseNarratives } from '../../content/caseNarratives'
import { CropShot } from '../../components/CropShot'
import { careShots, REAL_SCREENS } from '../../content/careShots'
import { useLayoutEffect } from 'react'

const care = projects.find((project) => project.slug === 'care-platform')!
const story = caseNarratives['care-platform']!.story

export default function ReadPage({ destination, onCanvas }: { destination: string | null; onCanvas: () => void }) {
  useLayoutEffect(() => {
    const target = document.getElementById(destination ?? 'dc-read')
    if (!target) return
    target.tabIndex = -1
    target.focus({ preventScroll: true })
    target.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [destination])
  return (
    <main className="dc-read" id="dc-read" tabIndex={-1}>
      <section className="dc-read-intro">
        <h1>Web & mobile.<br />Screen to release.</h1>
        <div><p>Gentrit Rashiti.<br />Frontend & mobile developer, now full stack.</p><p>Based in Kosovo, working remotely. 5+ years across healthcare, video streaming, e-reading and Web3.</p></div>
        <nav aria-label="Page sections"><a href="#dc-projects">All {projects.length} projects</a><a href="#dc-case">Care case study</a><a href="#dc-about">About & contact</a><button type="button" onClick={onCanvas}>Explore the canvas</button></nav>
      </section>

      <section id="dc-projects" className="dc-project-index" aria-labelledby="dc-projects-title">
        <div className="dc-section-heading"><h2 id="dc-projects-title">All {projects.length} projects.</h2><p>{firstYear}–{currentYear}</p></div>
        <div className="dc-project-list">
          {projects.map((project) => <details key={project.slug}>
            <summary><span className="dc-project-name">{project.name}</span><span className="dc-project-kind">{project.kind}</span><span className="dc-project-year">{project.years ?? '—'}</span><span className="dc-details-mark" aria-hidden="true" /></summary>
            <div className="dc-project-detail">
              <OldCareFile slug={project.slug} /><p>{project.summary}</p>
              <dl><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Stack</dt><dd>{project.stack.join(' · ')}</dd></div></dl>
              <div className="dc-detail-links">
                {project.slug === 'care-platform' && <a href="#dc-case">Read the case study</a>}
                {project.links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}<span className="dc-sr"> (opens in a new tab)</span></a>)}
              </div>
            </div>
          </details>)}
        </div>
      </section>

      <article id="dc-case" className="dc-case" aria-labelledby="dc-case-title">
        <h2 id="dc-case-title">Care management,<br />one route at a time.</h2>
        <OldCareFile slug="care-platform" /><div className="dc-case-story"><p>{story.product}</p><p>{story.built}</p></div>
        <div className="dc-case-demo">
          <div className="dc-case-demo-title"><h3>Glucose overview</h3><p>{REAL_SCREENS}</p></div>
          <CropShot shot={careShots.glucoseChart} className="dc-case-shot" />
        </div>
        <div className="dc-case-results"><h3>What changed</h3><p>{story.result}</p></div>
        <dl className="dc-case-facts"><div><dt>Role</dt><dd>{care.role}</dd></div><div><dt>Period</dt><dd>{care.years}</dd></div><div><dt>Platforms</dt><dd>Web and mobile apps · Laravel API</dd></div><div><dt>Languages</dt><dd>English · German · Spanish · Turkish</dd></div></dl>
      </article>

      <section id="dc-about" className="dc-about" aria-labelledby="dc-about-title">
        <h2 id="dc-about-title">Gentrit Rashiti.</h2>
        <div className="dc-about-copy"><p>Web and mobile products, from the first screen to release. The work includes two platform rewrites, mobile store releases, multi-tenant platforms, streaming, payments and APIs.</p><p>React, Next.js, Vue and Nuxt on the web. React Native on iOS and Android. Laravel and FastAPI behind the interface.</p><p>Based in Kosovo, working remotely.<br />Bachelor’s degree · UBT</p></div>
        <div className="dc-contact"><a className="dc-email" href={`mailto:${links.email}`}>{links.email}</a><div><a href={links.cv} download>Download CV</a><a href={links.github} target="_blank" rel="noopener noreferrer">GitHub<span className="dc-sr"> (opens in a new tab)</span></a><a href={links.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn<span className="dc-sr"> (opens in a new tab)</span></a></div></div>
      </section>
      <footer className="dc-read-footer"><span>Gentrit Rashiti · {currentYear}</span><button type="button" onClick={onCanvas}>Back to the canvas</button></footer>
    </main>
  )
}
