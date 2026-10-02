import { Suspense } from 'react'
import { useParams } from 'react-router'
import { CaseHeader } from '../components/case/CaseHeader'
import { NextChannel } from '../components/case/NextChannel'
import { Readouts } from '../components/case/Readouts'
import { SpecSheet } from '../components/case/SpecSheet'
import { StoryBlocks } from '../components/case/StoryBlocks'
import { useDocumentMeta } from '../components/case/useDocumentMeta'
import { Container } from '../components/Container'
import { Monitor, MonitorTuning } from '../components/Monitor'
import { MonitorGallery } from '../components/MonitorGallery'
import { Showcase } from '../components/Showcase'
import { findProject, nextFeatured, projects, type Featured, type Gallery, type Project } from '../content/projects'
import { recreations } from '../lib/recreations'
import { NoSignalPage } from './NoSignalPage'

const galleryAspect = { base: '3 / 4', sm: '4 / 3', lg: '21 / 9' }

function CaseMonitor({ project, featured }: { project: Project; featured: Featured }) {
  const shared = { channel: project.channel, timecode: project.years ?? undefined, viewTransitionName: `monitor-${project.slug}` }

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
    <Monitor {...shared} live label={recreation.name} aspect={recreation.aspect} world={recreation.world} caption="Live recreation · invented data">
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

function CaseStudy({ project, featured }: { project: Project; featured: Featured }) {
  useDocumentMeta(`${project.name} · Gentrit Rashiti`, project.line)
  const next = nextFeatured(project)
  const galleries = featured.monitor === 'gallery' ? (project.media.galleries ?? []).slice(1) : (project.media.galleries ?? [])

  return (
    <article data-channel={project.channel} aria-labelledby="case-title">
      <CaseHeader project={project} featured={featured} />

      <div className="mt-10 sm:mt-14">
        <Container>
          <CaseMonitor project={project} featured={featured} />
          {featured.readouts && <Readouts readouts={featured.readouts} />}
        </Container>
      </div>

      <div className="pt-section">
        <Container>
          <StoryBlocks story={featured.story} />
        </Container>
      </div>

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
                          {other.name} ({hostOf(other.links[0]?.href)})
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
  if (!project?.featured) return <NoSignalPage />
  return <CaseStudy key={project.slug} project={project} featured={project.featured} />
}
