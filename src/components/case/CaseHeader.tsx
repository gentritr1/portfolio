import { SignalStack } from '../signal-stack/SignalStack'
import { ArrowUpRightIcon } from '@phosphor-icons/react'
import { ChannelBadge } from '../ChannelBadge'
import type { Featured, Project } from '../../content/projects'

const linkClass =
  'group inline-flex min-h-11 items-center gap-1 text-ink underline decoration-hairline-strong underline-offset-4 transition-colors duration-200 ease-out hover:decoration-current'

/** The case title as a broadcast lower third on the monitor bezel: channel, kind, title and time code. */
export function LowerThird({ project }: { project: Project }) {
  return (
    <div className="relative isolate overflow-hidden grid gap-x-6 gap-y-2 px-1.5 pt-3 pb-3.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:px-3 sm:pb-4">
      <div className="absolute inset-y-0 right-0 -z-10 w-[180px] opacity-25">
        <SignalStack channels={[project.channel]} active={project.channel} still className="size-full" />
      </div>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <ChannelBadge channel={project.channel} size="md" />
          <span className="label-lg text-bezel-ink">{project.kind}</span>
        </p>
        <h1
          id="case-title"
          className="mt-2.5 border-l border-tint pl-3 font-display text-[clamp(1.75rem,1.15rem+2.4vw,3.25rem)] leading-[1.02] tracking-[-0.026em] text-ink"
        >
          {project.name}
        </h1>
      </div>
      {project.years && <span className="label-lg text-bezel-ink tabular sm:pb-1.5">{project.years}</span>}
    </div>
  )
}

/** Role, platforms and public pages, beside the story. */
export function CaseFacts({ project, featured }: { project: Project; featured: Featured }) {
  const platforms = featured.facts.find((fact) => fact.label === 'Platforms')?.value

  return (
    <dl className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-hairline lg:pl-8">
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
  )
}
