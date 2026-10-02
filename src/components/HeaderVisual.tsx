import type { CSSProperties } from 'react'
import { channelOrder, channels, type ChannelKey } from '../content/channels'
import { cn } from '../lib/cn'

const W = 120
const H = 40
const mid = H / 2

function points(fn: (x: number) => number): string {
  return Array.from({ length: 61 }, (_, i) => {
    const x = (i / 60) * W
    return `${x.toFixed(1)},${(mid - fn(x)).toFixed(1)}`
  }).join(' ')
}

const waves: Record<ChannelKey, string> = {
  healthcare: '0,22 34,22 40,22 44,14 48,30 53,5 58,34 62,20 66,22 120,22',
  streaming: points((x) => Math.sin(x / 7) * 9),
  reading: points((x) => (Math.floor(x / 15) % 4) * 5 - 7),
  web3: points((x) => (Math.floor(x / 12) % 2 ? 8 : -8)),
  ai: points((x) => Math.sin(x / 3.1) * 5 + Math.sin(x / 9.7) * 6 * Math.cos(x / 23)),
  personal: points((x) => (Math.abs(((x / 10) % 4) - 2) - 1) * 9),
}

interface HeaderVisualProps {
  active: ChannelKey
  className?: string
}

/**
 * Six channel panes on a shallow arc. The active channel's pane steps
 * forward in the signal colour. A static stand-in for the 3D signal stack.
 */
export function HeaderVisual({ active, className }: HeaderVisualProps) {
  return (
    <div aria-hidden className={cn('relative overflow-hidden [perspective:1100px] [perspective-origin:20%_45%]', className)}>
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        {channelOrder.map((key, i) => {
          const on = key === active
          const style = {
            left: `${1 + i * 9.4}%`,
            transform: `rotateY(-32deg) translateZ(${on ? 56 : -i * 22}px)`,
            zIndex: on ? 10 : channelOrder.length - i,
          } as CSSProperties
          return (
            <div
              key={key}
              data-channel={key}
              style={style}
              className={cn(
                'absolute top-[13%] flex h-[70%] w-[38%] flex-col justify-between rounded-md border bg-panel-1 p-[5%] transition-[transform,border-color] duration-200 ease-out motion-reduce:transition-none',
                on ? 'border-signal' : 'border-[color-mix(in_oklab,var(--tint)_55%,var(--hairline))]',
              )}
            >
              <span className={cn('label', on ? 'text-signal' : 'text-tint')}>{channels[key].number}</span>
              <span className="flex flex-col gap-[6%]">
                <span className="h-px w-3/4 bg-hairline" />
                <span className="h-px w-1/2 bg-hairline" />
              </span>
              <svg viewBox={`0 0 ${W} ${H}`} className={cn('block w-full', on ? 'text-signal' : 'text-tint')}>
                <line
                  x1="0"
                  x2={W}
                  y1={mid}
                  y2={mid}
                  className="stroke-hairline"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <polyline
                  points={waves[key]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
          )
        })}
      </div>
    </div>
  )
}
