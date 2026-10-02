import { ArrowRightIcon, ArrowUpRightIcon, XIcon } from '@phosphor-icons/react'
import { Suspense, useId, useLayoutEffect, useRef, useState, type PointerEvent } from 'react'
import { channels } from '../../content/channels'
import { caseHref, worldOf, type Project } from '../../content/projects'
import { cn } from '../../lib/cn'
import { recreations } from '../../lib/recreations'
import { preloadCase } from '../../lib/routes'
import { ChannelBadge } from '../ChannelBadge'
import { Monitor, MonitorTuning } from '../Monitor'
import { Showcase } from '../Showcase'
import { Thumb } from '../Thumb'
import { TransitionLink } from '../TransitionLink'

const OPEN_MS = 480
const CLOSE_MS = 260

function Media({ project }: { project: Project }) {
  const key = project.media.recreation
  if (key) {
    const recreation = recreations[key]
    const Recreation = recreation.Component
    return (
      <Monitor
        channel={project.channel}
        label={recreation.name}
        live
        aspect={recreation.aspect}
        world={recreation.world}
        className="mt-8"
      >
        <Suspense fallback={<MonitorTuning />}>
          <Recreation />
        </Suspense>
      </Monitor>
    )
  }
  const gallery = project.media.galleries?.[0]
  if (gallery) {
    return (
      <div className="mt-8 lg:[&_ul]:grid-cols-3!">
        <Showcase
          title={gallery.title === project.name ? 'Screenshots' : gallery.title}
          links={[]}
          items={gallery.items}
          aspect={gallery.aspect}
        />
      </div>
    )
  }
  if (project.media.shot) {
    return (
      <img
        src={project.media.shot.src}
        alt={project.media.shot.alt}
        width={256}
        height={160}
        loading="lazy"
        decoding="async"
        className="mt-8 block aspect-[16/10] w-full rounded-panel border border-hairline bg-panel-1 object-cover object-top"
      />
    )
  }
  if (project.media.thumb) {
    return (
      <div
        className="mt-8 aspect-[16/10] overflow-hidden rounded-panel border border-hairline bg-surface"
        data-world={worldOf(project)}
      >
        <Thumb kind={project.media.thumb} world={worldOf(project)} className="size-full! rounded-none! border-0!" />
      </div>
    )
  }
  return null
}

interface ProjectDrawerProps {
  project: Project
  onClose: () => void
}

/** Right-hand drawer on wide screens, bottom sheet on phones. A modal dialog, so focus stays inside. */
export function ProjectDrawer({ project, onClose }: ProjectDrawerProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const sheet = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const closing = useRef(false)
  const drag = useRef<{ y: number; t: number; dy: number } | null>(null)
  const titleId = useId()

  useLayoutEffect(() => {
    const node = dialog.current
    if (!node) return
    if (!node.open) node.showModal()
    const root = document.documentElement
    const gap = window.innerWidth - root.clientWidth
    const previous = {
      overflow: root.style.overflow,
      paddingRight: root.style.paddingRight,
    }
    root.style.overflow = 'hidden'
    if (gap > 0) root.style.paddingRight = `${gap}px`
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => setOpen(true))
    })
    return () => {
      cancelAnimationFrame(raf)
      root.style.overflow = previous.overflow
      root.style.paddingRight = previous.paddingRight
      if (node.open) node.close()
    }
  }, [])

  function dismiss() {
    if (closing.current) return
    closing.current = true
    setOpen(false)
    window.setTimeout(() => {
      dialog.current?.close()
      onClose()
    }, CLOSE_MS)
  }

  function onHandleDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { y: event.clientY, t: event.timeStamp, dy: 0 }
    if (sheet.current) sheet.current.style.transition = 'none'
  }

  function onHandleMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !sheet.current) return
    drag.current.dy = Math.max(0, event.clientY - drag.current.y)
    sheet.current.style.transform = `translateY(${drag.current.dy}px)`
  }

  function onHandleUp(event: PointerEvent<HTMLDivElement>) {
    const state = drag.current
    drag.current = null
    if (!state || !sheet.current) return
    const velocity = state.dy / Math.max(1, event.timeStamp - state.t)
    sheet.current.style.transition = ''
    sheet.current.style.transform = ''
    if (state.dy > 110 || velocity > 0.6) dismiss()
  }

  const links = project.links

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      aria-modal="true"
      onCancel={(event) => {
        event.preventDefault()
        dismiss()
      }}
      onClose={() => {
        if (closing.current || dialog.current?.open) return
        closing.current = true
        onClose()
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <div
        aria-hidden
        onClick={dismiss}
        className={cn(
          'absolute inset-0 bg-[color-mix(in_oklab,var(--panel-0)_72%,transparent)] transition-opacity ease-out',
          open ? 'opacity-100 duration-(--dur-ui)' : 'opacity-0 duration-200',
        )}
      />
      <div
        ref={sheet}
        data-channel={project.channel}
        style={{ transitionDuration: `${open ? OPEN_MS : CLOSE_MS}ms` }}
        className={cn(
          'absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-stage border-t border-hairline bg-panel-0 transition-[translate,transform,opacity] ease-drawer',
          'sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[min(30rem,calc(100vw-3rem))] sm:rounded-none sm:border-t-0 sm:border-l',
          'motion-reduce:translate-none!',
          open
            ? 'translate-x-0 translate-y-0 opacity-100'
            : 'translate-y-full motion-reduce:opacity-0 sm:translate-x-full sm:translate-y-0',
        )}
      >
        <div
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
          className="grid h-6 shrink-0 cursor-grab touch-none place-items-center sm:hidden"
        >
          <span className="h-1 w-10 rounded-full bg-hairline-strong" />
        </div>
        <div className="flex shrink-0 items-center justify-between gap-4 px-gutter pt-1 sm:pt-5">
          <span className="flex items-center gap-4">
            <ChannelBadge channel={project.channel} size="md" />
            <span className="label-lg text-ink-3 tabular">{project.years ?? channels[project.channel].period}</span>
          </span>
          <button
            type="button"
            autoFocus
            onClick={dismiss}
            aria-label="Close"
            className="-mr-2.5 grid size-11 shrink-0 place-items-center rounded-sm text-ink-2 transition-[background-color,color,transform] duration-150 ease-out hover:bg-panel-2 hover:text-ink active:scale-[0.96]"
          >
            <XIcon size={18} weight="light" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-gutter pt-4 pb-10">
          <h2 id={titleId} className="text-[1.875rem] leading-[1.05] tracking-[-0.022em] text-ink">
            {project.name}
          </h2>
          <p className="mt-2 text-meta text-ink-2">
            {project.kind} · {project.role}
          </p>
          <p className="mt-5 max-w-[62ch] text-story text-ink">{project.summary}</p>

          <Media project={project} />

          <h3 className="mt-8 label text-ink-3">Stack</h3>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {project.stack.map((item) => (
              <li key={item} className="rounded-chip border border-hairline px-2 py-1.5 label text-ink-2">
                {item}
              </li>
            ))}
          </ul>

          {(links.length > 0 || project.featured) && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {project.featured && (
                <li>
                  <TransitionLink
                    to={caseHref(project)}
                    preload={() => preloadCase(project.slug)}
                    className="group inline-flex min-h-11 items-center gap-2 rounded-sm bg-ink px-4 label-lg text-panel-0 transition-[background-color,transform] duration-150 ease-out hover:bg-ink-2 active:scale-[0.98]"
                  >
                    Full case study
                    <ArrowRightIcon
                      size={15}
                      weight="light"
                      aria-hidden
                      className="transition-transform duration-200 ease-out group-hover:translate-x-0.5"
                    />
                  </TransitionLink>
                </li>
              )}
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex min-h-11 items-center gap-1.5 rounded-sm border border-hairline-strong px-3 label text-ink transition-[background-color,border-color] duration-200 ease-out hover:border-transparent hover:bg-panel-2"
                  >
                    {link.label}
                    <ArrowUpRightIcon size={14} weight="light" aria-hidden className="text-tint" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </dialog>
  )
}
