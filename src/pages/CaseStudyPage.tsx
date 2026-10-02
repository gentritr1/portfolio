import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'
import { Suspense } from 'react'
import { useParams } from 'react-router'
import { ChannelBadge } from '../components/ChannelBadge'
import { Container } from '../components/Container'
import { Monitor, MonitorTuning } from '../components/Monitor'
import { MonitorGallery } from '../components/MonitorGallery'
import { Showcase } from '../components/Showcase'
import { TransitionLink } from '../components/TransitionLink'
import { channels } from '../content/channels'
import { caseHref, findProject, nextFeatured, type Featured, type Project } from '../content/projects'
import { recreations } from '../lib/recreations'
import { preloadCase } from '../lib/routes'
import { NoSignalPage } from './NoSignalPage'

const storyBlocks: { key: keyof Featured['story']; title: string }[] = [
  { key: 'product', title: 'The product' },
  { key: 'built', title: 'What was built' },
  { key: 'result', title: 'Result' },
]

const galleryAspect = { base: '3 / 4', sm: '4 / 3', lg: '21 / 9' }

function CaseMonitor({ project, featured }: { project: Project; featured: Featured }) {
  const shared = { channel: project.channel, timecode: project.years ?? undefined, viewTransitionName: `monitor-${project.slug}` }

  if (featured.monitor === 'gallery') {
    const items = project.media.galleries?.[0]?.items ?? []
    return (
      <Monitor {...shared} label="Store frames" aspect={galleryAspect} caption="Screenshots from the public store listings.">
        <MonitorGallery items={items} />
      </Monitor>
    )
  }

  const recreation = recreations[featured.monitor]
  const Recreation = recreation.Component
  return (
    <Monitor
      {...shared}
      live
      label={recreation.name}
      aspect={recreation.aspect}
      world={recreation.world}
      caption={`Live recreation: ${recreation.name}. Invented data, no client screens.`}
    >
      <Suspense fallback={<MonitorTuning />}>
        <Recreation />
      </Suspense>
    </Monitor>
  )
}

export function CaseStudyPage() {
  const { slug } = useParams()
  const project = findProject(slug)
  const featured = project?.featured
  if (!project || !featured) return <NoSignalPage />

  const next = nextFeatured(project)
  const galleries = featured.monitor === 'gallery' ? (project.media.galleries ?? []).slice(1) : (project.media.galleries ?? [])
  const channel = channels[project.channel]

  return (
    <article data-channel={project.channel} aria-labelledby="case-title">
      <title>{`${project.name}, Gentrit Rashiti`}</title>

      <header className="pt-10 sm:pt-16">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
            <ChannelBadge channel={project.channel} size="md" />
            <span className="label-lg text-ink-3 tabular">{project.years ?? channel.period}</span>
          </div>
          <div aria-hidden className="mt-3 h-px bg-tint" />
          <div className="mt-8 grid gap-x-12 gap-y-6 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h1 id="case-title" className="text-h1 text-ink">
                {project.name}
              </h1>
              <p className="mt-4 max-w-[52ch] text-lede text-ink-2">{project.line}</p>
            </div>
            <dl className="grid content-start gap-4 lg:col-span-4 lg:pt-2">
              <div>
                <dt className="label text-ink-3">Product</dt>
                <dd className="mt-1 text-ink">{project.kind}</dd>
              </div>
              <div>
                <dt className="label text-ink-3">Role</dt>
                <dd className="mt-1 text-ink">{project.role}</dd>
              </div>
              {project.links.length > 0 && (
                <div>
                  <dt className="label text-ink-3">Public pages</dt>
                  <dd className="mt-1">
                    <ul className="flex flex-wrap gap-x-4">
                      {project.links.map((link) => (
                        <li key={link.href}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex min-h-11 items-center gap-1 text-ink underline decoration-hairline-strong underline-offset-4 transition-colors hover:decoration-current"
                          >
                            {link.label}
                            <ArrowUpRightIcon size={14} weight="light" aria-hidden className="text-tint" />
                            <span className="sr-only">(opens in a new tab)</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </Container>
      </header>

      <div className="mt-12 sm:mt-16">
        <Container>
          <CaseMonitor project={project} featured={featured} />
        </Container>
      </div>

      <section aria-label="Story" className="pt-section">
        <Container>
          <div className="border-t border-hairline">
            {storyBlocks.map((block) => (
              <div key={block.key} className="grid gap-x-12 gap-y-3 border-b border-hairline py-8 lg:grid-cols-12 lg:py-10">
                <h2 className="text-h3 text-ink lg:col-span-4">{block.title}</h2>
                <p className="max-w-[64ch] text-story text-ink lg:col-span-8">{featured.story[block.key]}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {galleries.length > 0 && (
        <section aria-label="Public pages and store listings" className="pt-section">
          <Container className="flex flex-col gap-12 lg:gap-14">
            {galleries.map((gallery) => (
              <Showcase key={gallery.title} {...gallery} />
            ))}
          </Container>
        </section>
      )}

      <section aria-labelledby="facts-title" className="pt-section">
        <Container>
          <div className="grid gap-x-12 gap-y-6 lg:grid-cols-12">
            <h2 id="facts-title" className="text-h3 text-ink lg:col-span-4">
              Facts
            </h2>
            <dl className="grid border-t border-hairline sm:grid-cols-[10rem_1fr] lg:col-span-8">
              {featured.facts.map((fact) => (
                <div key={fact.label} className="contents">
                  <dt className="label pt-3 text-ink-3 sm:border-b sm:border-hairline sm:py-3.5">{fact.label}</dt>
                  <dd className="border-b border-hairline pt-1 pb-3 text-ink sm:py-3">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <nav aria-label="Next channel" className="pt-section">
        <Container>
          <TransitionLink
            to={caseHref(next)}
            preload={() => preloadCase(next.slug)}
            data-channel={next.channel}
            className="group flex flex-wrap items-end justify-between gap-6 rounded-panel border border-hairline bg-panel-1 px-5 py-6 transition-colors duration-200 ease-out hover:border-hairline-strong sm:px-8 sm:py-8"
          >
            <span className="flex flex-col gap-3">
              <span className="label text-ink-3">Next channel</span>
              <ChannelBadge channel={next.channel} size="md" />
              <span className="font-display text-h2 text-ink [font-stretch:112%]">{next.name}</span>
            </span>
            <span className="flex items-center gap-2 label-lg text-ink-2 transition-colors group-hover:text-ink">
              Tune in
              <ArrowRightIcon size={16} weight="light" aria-hidden className="transition-transform duration-200 ease-out group-hover:translate-x-1" />
            </span>
          </TransitionLink>
        </Container>
      </nav>
    </article>
  )
}
