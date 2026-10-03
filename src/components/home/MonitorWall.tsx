import { ArrowRightIcon } from '../ShellIcons'
import {
  Suspense,
  useDeferredValue,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { channels } from '../../content/channels'
import { featuredProjects, findProject, caseHref, type Project } from '../../content/projects'
import { cn } from '../../lib/cn'
import { recreations, type MonitorAspect } from '../../lib/recreations'
import { preloadCase } from '../../lib/routes'
import { Container } from '../Container'
import { Monitor, MonitorTuning } from '../Monitor'
import { TransitionLink } from '../TransitionLink'

const galleryAspect: MonitorAspect = { base: '3 / 4', sm: '4 / 3', lg: '21 / 9' }

function aspectOf(project: Project): MonitorAspect {
  const monitor = project.featured?.monitor
  return monitor && monitor !== 'gallery' ? recreations[monitor].aspect : galleryAspect
}

function preloadMonitor(project: Project) {
  const monitor = project.featured?.monitor
  if (monitor && monitor !== 'gallery') void recreations[monitor].load().catch(() => undefined)
}

const easeOut = 'cubic-bezier(0.23, 1, 0.32, 1)'

/** Mounts once per channel and plays the tune: a scan line sweeps down while the picture clears. */
function Tune({ play, children }: { play: boolean; children: ReactNode }) {
  const picture = useRef<HTMLDivElement>(null)
  const scan = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!play || !picture.current || !scan.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      picture.current.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 200,
        easing: easeOut,
      })
      return
    }
    picture.current.animate(
      [
        { opacity: 0, filter: 'blur(4px)' },
        { opacity: 1, filter: 'blur(0px)' },
      ],
      { duration: 260, easing: easeOut },
    )
    scan.current.animate(
      [
        { transform: 'translateY(-100%)', opacity: 1 },
        { transform: 'translateY(0%)', opacity: 1, offset: 0.85 },
        { transform: 'translateY(0%)', opacity: 0 },
      ],
      { duration: 260, easing: 'linear' },
    )
  }, [play])

  return (
    <>
      <div ref={picture} className="absolute inset-0">
        {children}
      </div>
      <div ref={scan} aria-hidden className="pointer-events-none absolute inset-0 -translate-y-full border-b border-signal" />
    </>
  )
}

function PhoneRow({ project }: { project: Project }) {
  const items = project.media.galleries?.[0]?.items.slice(0, 4) ?? []
  return (
    <ul className="absolute inset-0 flex items-center justify-center gap-[3%] overflow-hidden bg-panel-2 px-[5%]">
      {items.map((item, i) => (
        <li key={item.src} className={cn('h-[80%] shrink-0', i > 1 && 'hidden sm:block')}>
          <img
            src={item.src}
            width={item.width}
            height={item.height}
            alt={item.alt}
            loading="lazy"
            decoding="async"
            className="block h-full w-auto rounded-md border border-hairline"
          />
        </li>
      ))}
    </ul>
  )
}

function Picture({ project }: { project: Project }) {
  const monitor = project.featured?.monitor
  if (!monitor || monitor === 'gallery') return <PhoneRow project={project} />
  const Recreation = recreations[monitor].Component
  return <Recreation />
}

function featuredAt(next: number): Project {
  const count = featuredProjects.length
  return featuredProjects[((next % count) + count) % count]
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]') !== null
}

const ownArrowKeys =
  '[role="tablist"], [role="slider"], [role="radiogroup"], [role="listbox"], [role="menu"], [role="grid"], [data-world]'

interface MonitorWallProps {
  beforeTransition?: () => Promise<(() => void) | undefined>
  tuningCamera?: boolean
  activeSlug: string
  onSelect: (slug: string) => void
}

export function MonitorWall({ activeSlug, onSelect, beforeTransition, tuningCamera }: MonitorWallProps) {
  const shownSlug = useDeferredValue(activeSlug)
  const active = findProject(activeSlug) ?? featuredProjects[0]
  const shown = findProject(shownSlug) ?? active
  const tuning = shownSlug !== activeSlug
  const tabs = useRef<Array<HTMLButtonElement | null>>([])
  const [switched, setSwitched] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const section = useRef<HTMLElement>(null)
  const inView = useRef(false)
  const swipe = useRef<{ x: number; y: number; time: number } | null>(null)
  const suppressClick = useRef(false)

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    suppressClick.current = false
    swipe.current = null
    if (event.pointerType !== 'touch' || !event.isPrimary || window.innerWidth >= 640) return
    if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea, [role="slider"]')) return
    swipe.current = { x: event.clientX, y: event.clientY, time: event.timeStamp }
  }

  function finishSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = swipe.current
    swipe.current = null
    if (!start || !event.isPrimary || event.pointerType !== 'touch') return
    const dx = event.clientX - start.x
    const dy = event.clientY - start.y
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5 || event.timeStamp - start.time > 800) return
    suppressClick.current = true
    select(index + (dx < 0 ? 1 : -1), false)
  }

  useEffect(() => {
    const node = section.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView.current = entry.isIntersecting
      },
      { threshold: 0.2 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const index = featuredProjects.findIndex((project) => project.slug === activeSlug)

  function select(next: number, focus: boolean) {
    if (tuningCamera) return
    const project = featuredAt(next)
    preloadMonitor(project)
    setSwitched(true)
    onSelect(project.slug)
    setAnnouncement(`${channels[project.channel].number}, ${project.name}`)
    const tab = tabs.current[featuredProjects.indexOf(project)]
    if (window.innerWidth < 640 && tab?.parentElement?.parentElement) {
      const strip = tab.parentElement.parentElement
      strip.scrollTo({ left: tab.parentElement.offsetLeft - strip.offsetLeft - 16, behavior: 'instant' })
    }
    if (focus) tabs.current[featuredProjects.indexOf(project)]?.focus()
  }

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      if (tuningCamera || !inView.current || event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return
      if (isTypingTarget(event.target) || document.querySelector('dialog[open]')) return
      let next: number | null = null
      if (/^[1-9]$/.test(event.key) && Number(event.key) <= featuredProjects.length) next = Number(event.key) - 1
      else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        if (event.target instanceof Element && event.target.closest(ownArrowKeys)) return
        next = index + (event.key === 'ArrowRight' ? 1 : -1)
      }
      if (next === null) return
      event.preventDefault()
      const project = featuredAt(next)
      preloadMonitor(project)
      setSwitched(true)
      onSelect(project.slug)
      setAnnouncement(`${channels[project.channel].number}, ${project.name}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, onSelect, tuningCamera])

  function onTabKey(event: KeyboardEvent<HTMLUListElement>) {
    const moves: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowLeft: index - 1,
      Home: 0,
      End: featuredProjects.length - 1,
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    select(moves[event.key], true)
  }

  const monitor = shown.featured?.monitor
  const recreation = monitor && monitor !== 'gallery' ? recreations[monitor] : null

  return (
    <section ref={section} aria-label="Featured channels" data-channel={active.channel} className="mt-8 sm:mt-10">
      <Container>
        <ul
          role="tablist"
          aria-label="Featured channels"
          onKeyDown={onTabKey}
          className="-mx-gutter flex snap-x snap-mandatory scroll-px-gutter overflow-x-auto border-y border-hairline px-gutter sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0"
        >
          {featuredProjects.map((project, i) => {
            const selected = project.slug === activeSlug
            return (
              <li
                key={project.slug}
                role="presentation"
                data-channel={project.channel}
                className="w-40 shrink-0 snap-start sm:w-auto"
              >
                <button
                  ref={(node) => {
                    tabs.current[i] = node
                  }}
                  type="button"
                  role="tab"
                  id={`tab-${project.slug}`}
                  aria-selected={selected}
                  aria-controls="monitor-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i, false)}
                  onPointerEnter={() => preloadMonitor(project)}
                  onFocus={() => preloadMonitor(project)}
                  className={cn(
                    'group relative flex h-full min-h-22 w-full flex-col gap-2 px-3 py-4 text-left transition-colors duration-200 ease-out outline-offset-[-2px] sm:px-4',
                    selected ? 'bg-panel-1' : 'hover:bg-panel-1',
                  )}
                >
                  <span className="flex items-center justify-between gap-3 label whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span className="text-tint">{channels[project.channel].number}</span>
                      <kbd
                        aria-hidden
                        className="hidden min-w-4.5 rounded-xs border border-hairline px-1 py-px text-center font-mono text-ink-3 pointer-fine:inline-block"
                      >
                        {i + 1}
                      </kbd>
                    </span>
                    <span className="text-ink-3 tabular">{project.years}</span>
                  </span>
                  <span
                    className={cn(
                      'font-display text-[1.0625rem] leading-tight font-semibold [font-stretch:112%] transition-colors duration-200 ease-out lg:text-h3',
                      selected ? 'text-ink' : 'text-ink-2 group-hover:text-ink',
                    )}
                  >
                    {project.name}
                  </span>
                  <span className="hidden text-meta text-ink-3 lg:block">{project.kind}</span>
                  <span
                    aria-hidden
                    className={cn(
                      'absolute inset-x-0 bottom-0 h-0.5 origin-left bg-signal transition-transform duration-200 ease-out motion-reduce:transition-none',
                      selected ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </button>
              </li>
            )
          })}
        </ul>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        <div id="monitor-panel" role="tabpanel" aria-labelledby={`tab-${activeSlug}`} className="-mx-gutter mt-4 [touch-action:pan-y_pinch-zoom] sm:mx-0 sm:mt-5"
          onPointerDown={startSwipe}
          onPointerUp={finishSwipe}
          onPointerCancel={() => { swipe.current = null }}
          onClickCapture={(event) => {
            if (suppressClick.current && event.detail > 0) { event.preventDefault(); event.stopPropagation(); suppressClick.current = false }
          }}
        >
          <Monitor
            channel={shown.channel}
            label={tuning ? 'Tuning' : (recreation?.name ?? 'Store frames')}
            timecode={shown.years ?? undefined}
            live={Boolean(recreation) && !tuning}
            aspect={aspectOf(shown)}
            world={recreation?.world ?? 'base'}
            viewTransitionName={tuningCamera ? undefined : `monitor-${shown.slug}`}
            fit
            actions={
              <TransitionLink
                to={caseHref(active)}
                preload={() => preloadCase(active.slug)}
                beforeTransition={beforeTransition}
                className="group inline-flex min-h-11 items-center gap-2 rounded-sm bg-ink px-3.5 label-lg text-panel-0 transition-[background-color,transform] duration-150 ease-out hover:bg-ink-2 active:scale-[0.98] sm:px-4"
              >
                Tune in
                <span className="sr-only">: {active.name}</span>
                <ArrowRightIcon
                  size={15}
                  aria-hidden
                  className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                />
              </TransitionLink>
            }
          >
            <Suspense fallback={<MonitorTuning />}>
              <Tune key={shown.slug} play={switched}>
                <Picture project={shown} />
              </Tune>
            </Suspense>
          </Monitor>

          <div className="flex min-h-12 items-center justify-between border-b border-hairline px-gutter sm:hidden">
            <span className="label text-ink-3 tabular">{active.years}</span>
            <span className="label text-ink-3">Swipe to switch</span>
            <div className="flex">
              <button type="button" aria-label="Previous channel" onClick={() => select(index - 1, false)} className="grid size-11 place-items-center text-ink">
                <ArrowRightIcon size={18} aria-hidden className="rotate-180" />
              </button>
              <button type="button" aria-label="Next channel" onClick={() => select(index + 1, false)} className="grid size-11 place-items-center text-ink">
                <ArrowRightIcon size={18} aria-hidden />
              </button>
            </div>
          </div>
          <div className="mt-4 max-w-[70ch] max-sm:px-gutter">
            <p className="text-lede text-ink min-h-[3lh] sm:min-h-[2lh]">{active.line}</p>
            <p className="mt-1.5 min-h-[3lh] label text-ink-3 sm:min-h-[2lh]">{active.stack.slice(0, 4).join(' · ')}</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
