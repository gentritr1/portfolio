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
  /** Upper bound on the monitor width, for content that leaves a wide stage empty. */
  maxWidth?: string
  caption?: ReactNode
  /** Controls at the right end of the label bar, for example the "Tune in" link. */
  actions?: ReactNode
  /** A band under the stage, inside the bezel: channel, title and time code. */
  lowerThird?: ReactNode
  /**
   * Fixed stage height from 640 px up, for a monitor whose content changes.
   * The content keeps its own aspect and sits centred in the stage.
   */
  fit?: boolean
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
  maxWidth = '100%',
  caption,
  actions,
  lowerThird,
  fit = false,
  className,
  children,
}: MonitorProps) {
  const style = {
    viewTransitionName,
    '--m-aspect-base': aspect.base,
    '--m-aspect-sm': aspect.sm,
    '--m-aspect-lg': aspect.lg,
    '--m-ratio-base': ratio(aspect.base),
    '--m-ratio-sm': ratio(aspect.sm),
    '--m-ratio-lg': ratio(aspect.lg),
    '--m-max': maxWidth,
  } as CSSProperties

  return (
    <figure
      data-channel={channel}
      style={style}
      className={cn(
        'mx-auto w-full',
        !fit && 'sm:max-w-[min(calc(70svh*var(--m-ratio-sm)),var(--m-max))] lg:max-w-[min(calc(70svh*var(--m-ratio-lg)),var(--m-max))]',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-stage bg-bezel p-1.5 pt-0 shadow-stage ring-1 ring-[color-mix(in_oklab,var(--tint)_30%,var(--bezel-line))] ring-inset',
          lowerThird ? 'pb-0' : undefined,
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between gap-4 px-1.5 label text-bezel-ink [color-scheme:dark]',
            actions ? 'min-h-11 py-1' : 'min-h-9',
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <SignalDot tone={live ? 'signal' : 'off'} />
            <span style={{ color: `var(${channels[channel].tint})` }}>{channels[channel].number}</span>
            <span className="truncate">{label}</span>
          </span>
          {(timecode || actions) && (
            <span className="flex shrink-0 items-center gap-3">
              {timecode && <span className="whitespace-nowrap tabular">{timecode}</span>}
              {actions}
            </span>
          )}
        </div>
        {fit ? (
          <div
            data-world={world}
            className="relative aspect-(--m-aspect-base) w-full overflow-hidden rounded-stage-inner bg-bezel [container-type:size] [--m-ratio:var(--m-ratio-base)] sm:aspect-auto sm:h-[min(62svh,560px)] sm:[--m-ratio:var(--m-ratio-sm)] lg:h-[min(58svh,620px)] lg:[--m-ratio:var(--m-ratio-lg)]"
          >
            <div className="@container absolute inset-0 m-auto h-[min(100cqh,calc(100cqw/var(--m-ratio)))] w-[min(100cqw,calc(100cqh*var(--m-ratio)))] overflow-hidden rounded-stage-inner bg-surface">
              {children}
            </div>
          </div>
        ) : (
          <div
            data-world={world}
            className="@container relative aspect-(--m-aspect-base) w-full overflow-hidden rounded-stage-inner bg-surface sm:aspect-(--m-aspect-sm) lg:aspect-(--m-aspect-lg)"
          >
            {children}
          </div>
        )}
        {lowerThird && <div className="[color-scheme:dark]">{lowerThird}</div>}
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
