import { ArrowRightIcon } from '@phosphor-icons/react'
import { Suspense } from 'react'
import { useParams } from 'react-router'
import { CaseFacts, LowerThird } from '../components/case/CaseHeader'
import { BuildTimeline } from '../components/case/BuildTimeline'
import { NextChannel } from '../components/case/NextChannel'
import { Readouts } from '../components/case/Readouts'
import { SpecSheet } from '../components/case/SpecSheet'
import { StoryBlocks } from '../components/case/StoryBlocks'
import { useDocumentMeta } from '../components/case/useDocumentMeta'
import { WatchItWork } from '../components/case/WatchItWork'
import { Container } from '../components/Container'
import { Monitor, MonitorTuning } from '../components/Monitor'
import { MonitorGallery } from '../components/MonitorGallery'
import { Showcase } from '../components/Showcase'
import { TransitionLink } from '../components/TransitionLink'
import { findProject, nextFeatured, projects, type Featured, type Gallery, type Project } from '../content/projects'
import { caseNarratives } from '../content/caseNarratives'
import { recreations } from '../lib/recreations'
import { NoSignalPage } from './NoSignalPage'

const galleryAspect = { base: '3 / 4', sm: '4 / 3', lg: '21 / 9' }

function CaseMonitor({ project, featured }: { project: Project; featured: Featured }) {
  const shared = {
    channel: project.channel,
    viewTransitionName: `monitor-${project.slug}`,
    lowerThird: <LowerThird project={project} />,
  }

  if (featured.monitor === 'gallery') {
    const gallery = project.media.galleries?.[0]
    return (
      <Monitor {...shared} label={gallery?.title ?? 'Store frames'} aspect={galleryAspect} caption="Store frames · from the public listings">
        <MonitorGallery items={gallery?.items ?? []} />
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
      maxWidth={recreation.maxWidth}
      caption="Live recreation · invented data">
      <Suspense fallback={<MonitorTuning />}>
        <Recreation />
      </Suspense>
    </Monitor>
  )
}

/** Another project that owns this gallery, shown as work built beside the featured product. */
function alsoBuilt(gallery: Gallery, owner: Project): Project | undefined {
  return projects.find((project) => project !== owner && project.media.galleries?.includes(gallery))
}

function hostOf(href: string | undefined): string | undefined {
  return href ? new URL(href).hostname.replace(/^www\./, '') : undefined
}

function AlsoOnChannel({ slugs }: { slugs: string[] }) {
  const rows = slugs.map((slug) => findProject(slug)).filter((project): project is Project => project !== undefined)
  return (
    <section aria-labelledby="also-title" className="pt-section">
      <Container>
        <h2 id="also-title" className="label-lg text-ink">
          Also on this channel
        </h2>
        <ul className="mt-4 border-t border-hairline">
          {rows.map((row) => (
            <li key={row.slug} className="border-b border-hairline">
              <TransitionLink
                to={`/?p=${row.slug}`}
                className="group grid min-h-11 grid-cols-[4.75rem_minmax(0,1fr)_auto] items-center gap-x-4 py-3 transition-colors duration-150 ease-out hover:bg-panel-1 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto] sm:px-2"
              >
                <span className="label text-ink-3 tabular">{row.years}</span>
                <span className="min-w-0">
                  <span className="block font-display text-[1.0625rem] font-semibold text-ink [font-stretch:112%]">{row.name}</span>
                  <span className="mt-0.5 block text-meta text-ink-2">{row.line}</span>
                </span>
                <ArrowRightIcon
                  size={16}
                  weight="light"
                  aria-hidden
                  className="text-tint transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </TransitionLink>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}

function CaseStudy({ project, featured }: { project: Project; featured: Featured }) {
  useDocumentMeta(`${project.name} · Gentrit Rashiti`, project.line)
  const next = nextFeatured(project)
  const galleries = featured.monitor === 'gallery' ? (project.media.galleries ?? []).slice(1) : (project.media.galleries ?? [])

  return (
    <article data-channel={project.channel} aria-labelledby="case-title">
      <div className="pt-8 sm:pt-10">
        <Container>
          <CaseMonitor project={project} featured={featured} />
          {featured.readouts && <Readouts readouts={featured.readouts} />}
        </Container>
      </div>

      <div className="pt-section">
        <Container className="grid gap-x-12 gap-y-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <p className="max-w-[52ch] text-lede text-ink-2">{project.line}</p>
            <div className="mt-10">
              <StoryBlocks story={featured.story} />
            </div>
            <BuildTimeline slug={project.slug} />
          </div>
          <aside aria-label="Project facts" className="lg:col-span-4">
            <CaseFacts project={project} featured={featured} />
          </aside>
        </Container>
      </div>

      <WatchItWork project={project} featured={featured} />

      {galleries.length > 0 && (
        <section aria-labelledby="galleries-title" className="pt-section">
          <Container>
            <h2 id="galleries-title" className="label-lg text-ink">
              Public pages and store listings
            </h2>
            <div className="mt-6 flex flex-col gap-12 lg:gap-14">
              {galleries.map((gallery) => {
                const other = alsoBuilt(gallery, project)
                return (
                  <div key={gallery.title}>
                    {other && (
                      <p className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 label-lg">
                        <span className="text-tint">Also built:</span>
                        <span className="text-ink">
                          {other.name} ({hostOf(other.links[0]?.href)}){other.years && `, ${other.years}`}
                        </span>
                      </p>
                    )}
                    <Showcase {...gallery} />
                  </div>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      {featured.related && <AlsoOnChannel slugs={featured.related} />}

      <section aria-labelledby="spec-title" className="pt-section">
        <Container>
          <SpecSheet facts={featured.facts} />
        </Container>
      </section>

      <nav aria-label="Next channel" className="pt-section">
        <Container>
          <NextChannel next={next} />
        </Container>
      </nav>
    </article>
  )
}

export function CaseStudyPage() {
  const { slug } = useParams()
  const project = findProject(slug)
  const narrative = project ? caseNarratives[project.slug] : undefined
  if (!project?.featured || !narrative) return <NoSignalPage />
  return <CaseStudy key={project.slug} project={project} featured={{ ...project.featured, ...narrative }} />
}
