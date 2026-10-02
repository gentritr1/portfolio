import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { ChannelBadge } from '../ChannelBadge'
import { Container } from '../Container'
import { channels } from '../../content/channels'
import type { Featured, Project } from '../../content/projects'

const linkClass =
  'group inline-flex min-h-11 items-center gap-1 text-ink underline decoration-hairline-strong underline-offset-4 transition-colors duration-200 ease-out hover:decoration-current'

/** Channel header: badge, kind and time code, the title and line, and a spec column. */
export function CaseHeader({ project, featured }: { project: Project; featured: Featured }) {
  const platforms = featured.facts.find((fact) => fact.label === 'Platforms')?.value
  const timecode = project.years ?? channels[project.channel].period

  return (
    <header className="pt-10 sm:pt-14">
      <Container>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <ChannelBadge channel={project.channel} size="md" />
          <span className="label-lg text-ink-3">{project.kind}</span>
          <span className="ml-auto label-lg text-ink-3 tabular">{timecode}</span>
        </div>
        <div aria-hidden className="mt-3 h-px bg-tint opacity-70" />

        <div className="mt-8 grid gap-x-12 gap-y-8 sm:mt-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <h1 id="case-title" className="text-h1 text-ink">
              {project.name}
            </h1>
            <p className="mt-5 max-w-[46ch] text-lede text-ink-2">{project.line}</p>
          </div>

          <dl className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:border-l lg:border-hairline lg:pl-8">
            <div>
              <dt className="label text-ink-3">Role</dt>
              <dd className="mt-1.5 text-ink">{project.role}</dd>
            </div>
            {platforms && (
              <div>
                <dt className="label text-ink-3">Platforms</dt>
                <dd className="mt-1.5 text-ink">{platforms}</dd>
              </div>
            )}
            {project.links.length > 0 && (
              <div className="sm:col-span-2 lg:col-span-1">
                <dt className="label text-ink-3">Public pages</dt>
                <dd>
                  <ul className="flex flex-wrap gap-x-5">
                    {project.links.map((link) => (
                      <li key={link.href}>
                        <a href={link.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                          {link.label}
                          <ArrowUpRightIcon
                            size={14}
                            weight="light"
                            aria-hidden
                            className="text-tint transition-transform duration-200 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
                          />
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
  )
}
