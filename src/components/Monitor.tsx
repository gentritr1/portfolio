import type { CSSProperties, ReactNode } from 'react'
import { channels, type ChannelKey } from '../content/channels'
import { cn } from '../lib/cn'
import type { MonitorAspect } from '../lib/recreations'
import type { PageWorld } from '../lib/worlds'
import { SignalDot } from './SignalDot'

interface MonitorProps {
  channel: ChannelKey
  /** What the monitor shows, for example "Live room". */
  label: string
  /** Right side of the label bar, for example "2023–26". */
  timecode?: string
  /** Lights the lamp in the signal colour. */
  live?: boolean
  aspect: MonitorAspect
  /** Recreation palette for the stage. */
  world?: PageWorld
  /** Shared-element name for route transitions, unique on the page. */
  viewTransitionName?: string
  caption?: ReactNode
  className?: string
  children: ReactNode
}

function ratio(aspect: string): number {
  const [w, h] = aspect.split('/').map((part) => Number.parseFloat(part))
  return w && h ? w / h : 16 / 10
}

/**
 * A graphite bezel with a label bar and a stage. The stage is a size
 * container, so a recreation measures the stage, not the page. The bezel
 * stays dark in daylight, like real hardware; the stage follows the theme.
 */
export function Monitor({
  channel,
  label,
  timecode,
  live = false,
  aspect,
  world = 'base',
  viewTransitionName,
  caption,
  className,
  children,
}: MonitorProps) {
  const style = {
    viewTransitionName,
    '--m-aspect-base': aspect.base,
    '--m-aspect-sm': aspect.sm,
    '--m-aspect-lg': aspect.lg,
    '--m-ratio-sm': ratio(aspect.sm),
    '--m-ratio-lg': ratio(aspect.lg),
  } as CSSProperties

  return (
    <figure
      data-channel={channel}
      style={style}
      className={cn(
        'mx-auto w-full sm:max-w-[calc(78svh*var(--m-ratio-sm))] lg:max-w-[calc(76svh*var(--m-ratio-lg))]',
        className,
      )}
    >
      <div className="rounded-stage bg-bezel p-1.5 pt-0 shadow-stage ring-1 ring-[color-mix(in_oklab,var(--tint)_30%,var(--bezel-line))] ring-inset">
        <div className="flex min-h-9 items-center justify-between gap-4 px-1.5 label text-bezel-ink [color-scheme:dark]">
          <span className="flex min-w-0 items-center gap-2">
            <SignalDot tone={live ? 'signal' : 'off'} />
            <span style={{ color: `var(${channels[channel].tint})` }}>{channels[channel].number}</span>
            <span className="truncate">{label}</span>
          </span>
          {timecode && <span className="shrink-0 tabular">{timecode}</span>}
        </div>
        <div
          data-world={world}
          className="@container relative aspect-(--m-aspect-base) w-full overflow-hidden rounded-stage-inner bg-surface sm:aspect-(--m-aspect-sm) lg:aspect-(--m-aspect-lg)"
        >
          {children}
        </div>
      </div>
      {caption && <figcaption className="mt-3 px-1 font-mono text-meta text-ink-3">{caption}</figcaption>}
    </figure>
  )
}

/** Stage content while a recreation's code loads. Same box, so nothing shifts. */
export function MonitorTuning() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-panel-2">
      <span className="flex items-center gap-2 label text-ink-3">
        <SignalDot tone="off" />
        Tuning
      </span>
    </div>
  )
}
