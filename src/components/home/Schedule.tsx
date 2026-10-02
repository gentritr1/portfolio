import { ArrowRightIcon, ArrowUpRightIcon } from '@phosphor-icons/react'
import { Fragment, Suspense, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { channelOrder, channels, type ChannelKey } from '../../content/channels'
import { caseHref, findProject, groupPeriods, projects, type Project, type ProjectGroupName } from '../../content/projects'
import { cn } from '../../lib/cn'
import { preloadable } from '../../lib/preloadable'
import { preloadCase } from '../../lib/routes'
import { ChannelBadge } from '../ChannelBadge'
import { Container } from '../Container'
import { TransitionLink } from '../TransitionLink'
import { finePointer, reducedMotion, useMediaQuery } from './useMediaQuery'

const hoverPreview = preloadable(() => import('./HoverPreview').then((m) => m.HoverPreview))
const HoverPreview = hoverPreview.Component

const drawer = preloadable(() => import('./ProjectDrawer').then((m) => m.ProjectDrawer))
const Drawer = drawer.Component
const preloadDrawer = () => void drawer.load().catch(() => undefined)

const groupOrder: ProjectGroupName[] = ['Vianova', 'Agency work', 'Incentiv', 'AvahiTech', 'Personal']

const counts = Object.fromEntries(channelOrder.map((key) => [key, projects.filter((p) => p.channel === key).length])) as Record<
  ChannelKey,
  number
>

function isChannel(value: string | null): value is ChannelKey {
  return value !== null && (channelOrder as string[]).includes(value)
}

const chip =
  'inline-flex min-h-11 shrink-0 snap-start items-center whitespace-nowrap gap-2 rounded-chip border px-3 label transition-[background-color,border-color,color] duration-200 ease-out'

function Row({
  project,
  onOpen,
  onHover,
}: {
  project: Project
  onOpen: (project: Project, opener: HTMLElement) => void
  onHover: (project: Project) => void
}) {
  const action = 'outline-none after:absolute after:inset-0 after:content-[""]'
  return (
    <li
      data-channel={project.channel}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') onHover(project)
      }}
      className="group relative grid grid-cols-[4.75rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 border-b border-hairline py-3.5 transition-colors duration-150 ease-out hover:bg-panel-1 has-[[data-row-action]:focus-visible]:outline-2 has-[[data-row-action]:focus-visible]:-outline-offset-2 has-[[data-row-action]:focus-visible]:outline-signal sm:grid-cols-[5.5rem_minmax(0,1fr)_11.5rem] sm:px-2 lg:grid-cols-[5.5rem_minmax(0,1.5fr)_11.5rem_minmax(0,1fr)_10.5rem]"
    >
      <span className="label pt-1.5 text-ink-3 tabular">{project.years ?? channels[project.channel].period}</span>
      <div className="min-w-0">
        {project.featured ? (
          <TransitionLink
            to={caseHref(project)}
            preload={() => preloadCase(project.slug)}
            data-row-action={project.slug}
            className={cn(
              action,
              'inline-flex items-center gap-1.5 font-display text-[1.0625rem] font-semibold text-ink [font-stretch:112%]',
            )}
          >
            {project.name}
            <ArrowRightIcon
              size={14}
              weight="light"
              aria-hidden
              className="text-tint transition-transform duration-200 ease-out group-hover:translate-x-0.5"
            />
            <span className="sr-only">, case study</span>
          </TransitionLink>
        ) : (
          <button
            type="button"
            aria-haspopup="dialog"
            data-row-action={project.slug}
            onClick={(event) => onOpen(project, event.currentTarget)}
            onFocus={preloadDrawer}
            onPointerEnter={preloadDrawer}
            className={cn(
              action,
              'cursor-pointer text-left font-display text-[1.0625rem] font-semibold text-ink [font-stretch:112%]',
            )}
          >
            {project.name}
          </button>
        )}
        <p className="mt-0.5 text-meta text-ink-2">{project.line}</p>
      </div>
      <ChannelBadge channel={project.channel} className="col-start-2 self-start sm:col-start-auto sm:pt-1.5" />
      <div className="hidden min-w-0 sm:col-start-3 sm:block lg:col-start-auto">
        <p className="text-meta text-ink-2">{project.role}</p>
        <p className="mt-1 truncate label text-ink-3">{project.stack.slice(0, 3).join(' · ')}</p>
      </div>
      {project.links.length > 0 && (
        <ul className="relative col-start-2 -my-1 flex flex-wrap gap-x-4 self-start sm:col-end-4 lg:col-start-auto lg:col-end-auto lg:-mt-2.5 lg:flex-col lg:gap-0">
          {project.links.slice(0, 3).map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1 whitespace-nowrap label text-ink-2 transition-colors duration-150 ease-out hover:text-ink lg:min-h-8"
              >
                {link.label}
                <ArrowUpRightIcon size={12} weight="light" aria-hidden className="text-tint" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function Schedule() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('ch')
  const filter = isChannel(raw) ? raw : null
  const openProject = findProject(params.get('p') ?? undefined)
  const fine = useMediaQuery(finePointer)
  const reduce = useMediaQuery(reducedMotion)
  const preview = fine && !reduce
  const [hovered, setHovered] = useState<Project | null>(null)
  const opener = useRef<HTMLElement | null>(null)
  const list = useRef<HTMLOListElement>(null)
  const firstFilter = useRef(true)

  useLayoutEffect(() => {
    if (firstFilter.current) {
      firstFilter.current = false
      return
    }
    list.current?.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: 200,
      easing: 'cubic-bezier(0.23, 1, 0.32, 1)',
    })
  }, [filter])

  function update(change: (next: URLSearchParams) => void) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        change(next)
        return next
      },
      { replace: true, preventScrollReset: true },
    )
  }

  function setFilter(key: ChannelKey | null) {
    update((next) => (key ? next.set('ch', key) : next.delete('ch')))
  }

  function open(project: Project, from: HTMLElement) {
    opener.current = from
    setHovered(null)
    update((next) => next.set('p', project.slug))
  }

  function close() {
    const slug = openProject?.slug
    update((next) => next.delete('p'))
    const target = opener.current ?? document.querySelector<HTMLElement>(`[data-row-action="${slug}"]`)
    opener.current = null
    target?.focus({ preventScroll: true })
  }

  const visible = projects.filter((project) => !filter || project.channel === filter)
  const groups = groupOrder.map((group) => ({
    group,
    items: visible.filter((project) => project.group === group),
  }))

  return (
    <section id="schedule" aria-labelledby="schedule-title" className="pt-section">
      <Container>
        <h2 id="schedule-title" className="text-h2 text-ink">
          Schedule
        </h2>
        <p className="mt-3 text-meta text-ink-2" aria-live="polite">
          {filter
            ? `${visible.length} ${visible.length === 1 ? 'project' : 'projects'} on ${channels[filter].number} ${channels[filter].label}.`
            : `${projects.length} projects on ${channelOrder.length} channels.`}
        </p>

        <div
          role="group"
          aria-label="Filter by channel"
          className="-mx-gutter mt-6 flex snap-x gap-2 overflow-x-auto scroll-px-gutter px-gutter pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
        >
          <button
            type="button"
            aria-pressed={filter === null}
            onClick={() => setFilter(null)}
            className={cn(
              chip,
              filter === null
                ? 'border-ink bg-panel-2 text-ink'
                : 'border-hairline text-ink-2 hover:border-hairline-strong hover:text-ink',
            )}
          >
            All
            <span className="text-ink-3 tabular">{projects.length}</span>
          </button>
          {channelOrder.map((key) => {
            const on = filter === key
            return (
              <button
                key={key}
                type="button"
                data-channel={key}
                aria-pressed={on}
                onClick={() => setFilter(on ? null : key)}
                className={cn(
                  chip,
                  on
                    ? 'border-tint bg-panel-2 text-ink'
                    : 'border-hairline text-ink-2 hover:border-hairline-strong hover:text-ink',
                )}
              >
                <span className="text-tint">{channels[key].number}</span>
                {channels[key].label}
                <span className="text-ink-3 tabular">{counts[key]}</span>
              </button>
            )
          })}
        </div>

        <ol ref={list} onPointerLeave={() => setHovered(null)} className="mt-8 border-t border-hairline">
          {groups.map(({ group, items }) =>
            items.length === 0 ? null : (
              <Fragment key={group}>
                {!filter && (
                  <li className="flex items-center gap-3 pt-7 pb-2.5 label text-ink-3 sm:px-2">
                    <span className="text-ink-2">{group}</span>
                    <span className="h-px flex-1 bg-hairline" />
                    <span className="tabular">{groupPeriods[group] ?? channels.personal.period}</span>
                  </li>
                )}
                {items.map((project) => (
                  <Row key={project.slug} project={project} onOpen={open} onHover={setHovered} />
                ))}
              </Fragment>
            ),
          )}
        </ol>
      </Container>

      {preview && (
        <Suspense fallback={null}>
          <HoverPreview project={openProject ? null : hovered} />
        </Suspense>
      )}
      {openProject && (
        <Suspense fallback={null}>
          <Drawer project={openProject} onClose={close} />
        </Suspense>
      )}
    </section>
  )
}
