import { lazy, Suspense, useEffect, useState, type CSSProperties } from 'react'
import { Link, useParams } from 'react-router'
import { motion, useReducedMotion } from 'motion/react'
import { findProject, nextFeatured, type Featured, type Project } from '../content/projects'
import { caseNarratives } from '../content/caseNarratives'
import { links } from '../content/links'
import { recreations } from '../lib/recreations'
import { StudioImage } from '../components/case/StudioHero'
import { studioShots } from '../components/case/studioShots'
import { systems } from '../components/case/TechnicalDiagram'
import { milestones } from '../components/case/BuildTimeline'
import { productBySlug } from '../drafts/aisle/products'
import NoSignalPage from './NoSignalPage'
import './aisle-case.css'

const OldCareFile = lazy(() => import('../components/portfolio/OldCareFile').then((module) => ({ default: module.OldCareFile })))

const arrive = [0.16, 1, 0.3, 1] as const
const pop = [0.34, 1.35, 0.64, 1] as const

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="none" style={back ? { transform: 'rotate(180deg)' } : undefined}>
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

/** Bar widths come from the slug, so each product keeps the same barcode. */
function Barcode({ code }: { code: string }) {
  const bars: { x: number; w: number }[] = []
  let x = 0
  for (const char of `*${code}*`) {
    const value = char.charCodeAt(0)
    for (let bit = 0; bit < 4; bit += 1) {
      const w = ((value >> bit) & 3) + 1
      if (bit % 2 === 0) bars.push({ x, w })
      x += w + 1
    }
  }
  return (
    <svg className="ac-barcode" viewBox={`0 0 ${x} 40`} preserveAspectRatio="none" aria-hidden="true">
      {bars.map((bar) => <rect key={bar.x} x={bar.x} y="0" width={bar.w} height="40" />)}
    </svg>
  )
}

function Window({ project }: { project: Project }) {
  const composition = studioShots[project.slug]
  if (!composition) return null
  return (
    <div className="ac-window" data-device={composition.device}>
      {composition.shots.slice(0, composition.device === 'phone' ? 3 : 2).map((shot, index) => (
        <div className="ac-screen" data-slot={index} key={shot.src}>
          <StudioImage shot={shot} eager={index === 0} />
        </div>
      ))}
      {project.slug === 'care-platform' && <p className="ac-small-print">Recreation · invented data</p>}
    </div>
  )
}

function Sample({ project, featured }: { project: Project; featured: Featured }) {
  if (featured.monitor === 'gallery') {
    const gallery = project.media.galleries?.[0]
    if (!gallery) return null
    return (
      <div className="ac-frames">
        {gallery.items.map((item) => (
          <figure key={item.src}>
            <img src={item.src} alt={item.alt} width={item.width} height={item.height} loading="lazy" decoding="async" />
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
    )
  }
  const entry = recreations[featured.monitor]
  const Recreation = entry.Component
  return (
    <div
      className="ac-sample-stage"
      data-world={entry.world}
      style={{ '--ac-aspect-base': entry.aspect.base, '--ac-aspect-sm': entry.aspect.sm, '--ac-aspect-lg': entry.aspect.lg } as CSSProperties}
    >
      <Suspense fallback={<p className="ac-loading">Opening the sample…</p>}>
        <Recreation />
      </Suspense>
    </div>
  )
}

function CasePage({ project, featured }: { project: Project; featured: Featured }) {
  const reduced = Boolean(useReducedMotion())
  const product = productBySlug.get(project.slug)
  const pack = product?.pack ?? { field: '#1f4e7a', ink: '#fafaf5', window: '#fafaf5' }
  const system = systems[project.slug]
  const steps = milestones[project.slug] ?? []
  const next = nextFeatured(project)
  const nextPack = productBySlug.get(next.slug)?.pack ?? pack
  const stack = featured.facts.find((fact) => /stack|frontend/i.test(fact.label))?.value ?? project.stack.join(', ')
  const labelRows = featured.facts.filter((fact) => fact.value !== stack)
  const [arrived, setArrived] = useState(reduced)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [project.slug])

  const enter = (delay: number) =>
    reduced
      ? { initial: false as const }
      : { initial: { opacity: 0, y: 12, filter: 'blur(4px)' }, animate: { opacity: 1, y: 0, filter: 'blur(0px)' }, transition: { duration: 0.5, ease: arrive, delay } }

  return (
    <main className="aisle-case" style={{ '--ac-field': pack.field, '--ac-pack-ink': pack.ink, '--ac-window': pack.window } as CSSProperties}>
      <title>{`${project.name} — Gentrit Rashiti`}</title>
      <a className="ac-skip" href="#ac-back">Skip to the details</a>

      <header className="ac-talker">
        <Link to="/" className="ac-mark" aria-label="Aisle 7, back to the shelf">AISLE <em>7</em></Link>
        <p className="ac-talker-line"><span>Gentrit Rashiti</span><i aria-hidden="true">—</i><span>Web · Mobile · Full stack</span></p>
        <nav className="ac-tools" aria-label="Site">
          <Link to="/"><Arrow back />Back to the shelf</Link>
          <a href={links.cv} download>CV <Arrow /></a>
        </nav>
      </header>

      <section className="ac-front" aria-labelledby="ac-title">
        <motion.div
          className="ac-box"
          initial={reduced ? false : { y: 48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: reduced ? 0.01 : 0.7, ease: arrive }}
          onAnimationComplete={() => setArrived(true)}
        >
          <div className="ac-box-face">
            <p className="ac-box-ref">GR / {product?.reference ?? '00'} · {project.years}</p>
            <h1 id="ac-title">{project.name}</h1>
            <p className="ac-box-kind">{project.kind}</p>
            <Window project={project} />
            <p className="ac-box-line">{project.line}</p>
          </div>
          <div className="ac-box-side" aria-hidden="true"><span>{project.name}</span></div>
          {product?.fact && (
            <motion.p
              className="ac-tag"
              initial={reduced ? false : { rotateX: -90 }}
              animate={{ rotateX: arrived ? 0 : -90 }}
              transition={{ duration: reduced ? 0.01 : 0.45, ease: pop }}
            >
              <strong>{product.fact.value}</strong>
              <span>{product.fact.label}</span>
            </motion.p>
          )}
        </motion.div>

        <motion.aside className="ac-label" aria-labelledby="ac-label-title" {...enter(0.3)}>
          <h2 id="ac-label-title">Project facts</h2>
          <p className="ac-serving">Serving size: one product · {project.years}</p>
          <dl>
            {labelRows.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <p className="ac-ingredients"><strong>Ingredients:</strong> {stack}.</p>
          {project.links.length > 0 && (
            <nav aria-label={`${project.name} public pages`}>
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label} <Arrow /></a>
              ))}
            </nav>
          )}
        </motion.aside>
      </section>

      {featured.readouts && (
        <section className="ac-readouts" aria-label="Key numbers">
          {featured.readouts.map((readout, index) => (
            <motion.p key={readout.label} className="ac-readout" {...enter(0.45 + index * 0.08)}>
              <strong>{readout.value}{readout.to && <><i aria-hidden="true">→</i><span className="ac-sr">to</span>{readout.to}</>}</strong>
              <span>{readout.label}</span>
            </motion.p>
          ))}
        </section>
      )}

      <section className="ac-back" id="ac-back" aria-label="On the back of the box">
        <div>
          <h2>What it is</h2>
          <p>{featured.story.product}</p>
        </div>
        <div>
          <h2>What was built</h2>
          <p>{featured.story.built}</p>
        </div>
        <div>
          <h2>Where it is now</h2>
          <p>{featured.story.result}</p>
        </div>
      </section>

      {project.slug === 'care-platform' && (
        <section className="ac-section" aria-labelledby="ac-file-title">
          <h2 id="ac-file-title" className="ac-heading">Confidential file</h2>
          <Suspense fallback={null}><OldCareFile slug={project.slug} /></Suspense>
        </section>
      )}

      {system && (
        <section className="ac-section" aria-labelledby="ac-inside-title">
          <h2 id="ac-inside-title" className="ac-heading">What's inside</h2>
          <p className="ac-heading-note">{system.title.replace('\n', ' ')}</p>
          <ol className="ac-compartments">
            {system.layers.map((layer, index) => (
              <li key={layer.title}>
                <span className="ac-compartment-no">{String(index + 1).padStart(2, '0')}</span>
                <h3>{layer.title}</h3>
                <p className="ac-mono">{layer.stack}</p>
                <p>{layer.description}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {steps.length > 0 && (
        <section className="ac-section" aria-labelledby="ac-directions-title">
          <h2 id="ac-directions-title" className="ac-heading">Directions</h2>
          <ol className="ac-directions">
            {steps.map((step) => (
              <li key={step.title}><p><strong>{step.title}.</strong> {step.detail}</p></li>
            ))}
          </ol>
        </section>
      )}

      <section className="ac-section ac-sample" aria-labelledby="ac-sample-title">
        <h2 id="ac-sample-title" className="ac-heading">{featured.monitor === 'gallery' ? 'From the store listing' : 'Try a sample'}</h2>
        <p className="ac-heading-note">
          {featured.monitor === 'gallery'
            ? 'Frames from the public store listing.'
            : 'A working recreation with invented data. Click, scroll and type inside it.'}
        </p>
        <Sample project={project} featured={featured} />
      </section>

      <footer className="ac-till">
        <div className="ac-till-code">
          <Barcode code={project.slug} />
          <p>GR-{product?.reference ?? '00'}-{project.years?.slice(0, 4) ?? '2026'}</p>
        </div>
        <Link to={`/work/${next.slug}`} className="ac-next" style={{ '--ac-next-field': nextPack.field, '--ac-next-ink': nextPack.ink } as CSSProperties}>
          <span className="ac-next-label">Next on the shelf</span>
          <span className="ac-next-box">
            <strong>{next.name}</strong>
            <span>{next.kind}</span>
          </span>
          <Arrow />
        </Link>
        <nav className="ac-contact" aria-label="Contact">
          <a className="ac-contact-email" href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.github} target="_blank" rel="noreferrer">GitHub <Arrow /></a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">LinkedIn <Arrow /></a>
        </nav>
      </footer>
    </main>
  )
}

export function CaseStudyPage() {
  const { slug } = useParams()
  const project = findProject(slug)
  const narrative = project ? caseNarratives[project.slug] : undefined
  if (!project?.featured || !narrative) return <NoSignalPage />
  return <CasePage key={project.slug} project={project} featured={{ ...project.featured, ...narrative }} />
}
