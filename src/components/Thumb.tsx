import { StarIcon } from '@phosphor-icons/react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../lib/cn'
import type { PageWorld } from '../lib/worlds'

export type ThumbKind =
  | 'dashboard-vitals'
  | 'care-plan'
  | 'api-terminal'
  | 'component-sheet'
  | 'tokens'
  | 'player-chat'
  | 'chat-choices'
  | 'donation-ring'
  | 'calendar-strip'
  | 'portal-shell'
  | 'wallet-card'
  | 'doc-chat'
  | 'track'
  | 'town'
  | 'fork'

const acc = 'fill-(--thumb-accent)'
const soft = 'fill-accent-soft'
const base = 'fill-line'
const bar = 'fill-(--thumb-bar)'
const panel = 'fill-(--thumb-panel)'
const onPanel = 'fill-(--thumb-on-panel)'
const outline = 'fill-none stroke-(--thumb-bar) stroke-[1.5]'
const lineBar = 'fill-none stroke-(--thumb-bar) stroke-2 [stroke-linecap:round] [stroke-linejoin:round]'
const lineAcc = 'fill-none stroke-(--thumb-accent) stroke-2 [stroke-linecap:round] [stroke-linejoin:round]'
const tick = 'fill-none stroke-on-accent stroke-2 [stroke-linecap:round] [stroke-linejoin:round]'
const icon = 'text-(--thumb-accent)'

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const qr = [1, 0, 1, 0, 1, 1, 1, 1, 0]
  .flatMap((on, i) => (on ? [`M${62 + (i % 3) * 6} ${18 + Math.floor(i / 3) * 6}h5v5h-5z`] : []))
  .join('')

const drawings: Record<ThumbKind, ReactNode> = {
  'dashboard-vitals': (
    <>
      <rect width="18" height="64" className={base} />
      <rect x="26" y="9" width="30" height="4" rx="2" className={bar} />
      <rect x="26" y="20" width="62" height="36" rx="4" className={soft} />
      <polyline points="32,47 39,41 46,44 53,34 60,39 67,31" className={lineAcc} />
      <circle cx="75" cy="28" r="2.5" className={acc} />
      <circle cx="81" cy="28" r="2.5" className={acc} />
    </>
  ),
  'care-plan': (
    <>
      {[44, 36, 40].map((width, i) => (
        <g key={i}>
          <circle cx="18" cy={14 + i * 18} r="5.5" className={i === 0 ? acc : outline} />
          <rect x="30" y={12 + i * 18} width={width} height="4" rx="2" className={i === 0 ? base : bar} />
        </g>
      ))}
      <path d="M15.5 14l2 2 3.5-4" className={tick} />
    </>
  ),
  'api-terminal': (
    <>
      <rect x="8" y="8" width="80" height="48" rx="5" className={panel} />
      <circle cx="17" cy="17" r="2.5" className={acc} />
      <path d="M20 25h-3v22h3M76 25h3v22h-3" className={lineBar} />
      <rect x="25" y="29" width="30" height="3.5" rx="1.75" className={onPanel} />
      <rect x="25" y="35" width="42" height="3.5" rx="1.75" className={bar} />
      <rect x="25" y="41" width="22" height="3.5" rx="1.75" className={acc} />
    </>
  ),
  'component-sheet': (
    <>
      <rect x="10" y="17" width="20" height="8" rx="4" className={acc} />
      <rect x="40" y="16.5" width="17" height="9" rx="4.5" className={acc} />
      <circle cx="52.5" cy="21" r="3" className="fill-surface" />
      <rect x="65" y="16.5" width="22" height="9" rx="2.5" className={outline} />
      <path d="M69 19v4" className={lineAcc} />
      <rect x="11" y="39" width="18" height="8" rx="4" className={soft} />
      <rect x="43.5" y="38.5" width="9" height="9" rx="2" className={acc} />
      <path d="M45.5 43l2 2 3-3.5" className={tick} />
      <circle cx="72" cy="43" r="4" className={acc} />
      <circle cx="81" cy="43" r="4" className={soft} />
    </>
  ),
  tokens: (
    <>
      <rect x="10" y="9" width="17" height="18" rx="3" className={acc} />
      <rect x="30" y="9" width="17" height="18" rx="3" className="fill-[color-mix(in_oklab,var(--thumb-accent)_62%,var(--accent-soft))]" />
      <rect x="50" y="9" width="17" height="18" rx="3" className="fill-[color-mix(in_oklab,var(--thumb-accent)_30%,var(--accent-soft))]" />
      <rect x="70" y="9" width="17" height="18" rx="3" className={soft} />
      <rect x="10" y="35" width="52" height="7" rx="2" className={bar} />
      <rect x="10" y="46" width="40" height="5" rx="2" className={bar} />
      <rect x="10" y="55" width="28" height="3" rx="1.5" className={bar} />
    </>
  ),
  'player-chat': (
    <>
      <rect x="6" y="10" width="58" height="33" rx="4" className={panel} />
      <path d="M32 21.5v10l8.5-5z" className={onPanel} />
      <rect x="10" y="14" width="13" height="6" rx="3" className={acc} />
      <rect x="6" y="49" width="34" height="4" rx="2" className={bar} />
      <rect x="68" y="10" width="22" height="7" rx="3.5" className={base} />
      <rect x="72" y="21" width="18" height="7" rx="3.5" className={soft} />
      <rect x="68" y="32" width="16" height="7" rx="3.5" className={base} />
    </>
  ),
  'chat-choices': (
    <>
      <rect x="8" y="7" width="46" height="10" rx="5" className={base} />
      <rect x="8" y="20" width="34" height="10" rx="5" className={base} />
      <rect x="46" y="33" width="42" height="10" rx="5" className={acc} />
      <rect x="20" y="48" width="30" height="9" rx="4.5" className={lineAcc} />
      <rect x="54" y="48" width="30" height="9" rx="4.5" className={lineAcc} />
    </>
  ),
  'donation-ring': (
    <>
      <circle cx="30" cy="32" r="16" className="fill-none stroke-line stroke-2" />
      <circle cx="30" cy="32" r="16" pathLength={100} strokeDasharray="70 100" transform="rotate(-90 30 32)" className={lineAcc} />
      <StarIcon x={24} y={26} size={12} weight="fill" className={icon} />
      <rect x="54" y="18" width="28" height="4" rx="2" className={bar} />
      <rect x="54" y="26" width="20" height="4" rx="2" className={base} />
      <rect x="54" y="38" width="32" height="10" rx="5" className={acc} />
    </>
  ),
  'calendar-strip': (
    <>
      {range(7).map((i) => (
        <rect key={i} x={8 + i * 11.6} y="8" width="9.6" height="13" rx="2.5" className={i === 3 ? acc : base} />
      ))}
      <rect x="8" y="27" width="80" height="20" rx="4" className={soft} />
      <rect x="14" y="33" width="48" height="3.5" rx="1.75" className={bar} />
      <rect x="14" y="39.5" width="32" height="3.5" rx="1.75" className={bar} />
      {range(3).map((i) => (
        <circle key={i} cx={13 + i * 9} cy="55" r="3" className={i === 1 ? acc : base} />
      ))}
    </>
  ),
  'portal-shell': (
    <>
      <rect width="18" height="64" className={base} />
      <rect x="18" y="12" width="78" height="1.5" className={base} />
      <circle cx="87" cy="6.5" r="3" className={acc} />
      <rect x="25" y="20" width="30" height="36" rx="3" className={outline} />
      <rect x="60" y="20" width="30" height="36" rx="3" className={outline} />
      <rect x="29" y="25" width="16" height="3.5" rx="1.75" className={acc} />
      <rect x="64" y="25" width="16" height="3.5" rx="1.75" className={bar} />
    </>
  ),
  'wallet-card': (
    <>
      <rect x="8" y="10" width="80" height="44" rx="6" className={panel} />
      <rect x="15" y="17" width="16" height="3" rx="1.5" className={bar} />
      <rect x="15" y="24" width="32" height="6" rx="2" className={onPanel} />
      <path d={qr} className={onPanel} />
      {range(3).map((i) => (
        <rect key={i} x={15 + i * 14} y="42" width="11" height="6" rx="3" className={acc} />
      ))}
    </>
  ),
  'doc-chat': (
    <>
      <rect x="8" y="6" width="42" height="52" rx="3" className={outline} />
      {range(5).map((i) => (
        <rect key={i} x="14" y={14 + i * 7} width={i === 2 ? 26 : 30} height="3.5" rx="1.75" className={i === 2 ? acc : bar} />
      ))}
      <rect x="62" y="14" width="26" height="10" rx="5" className={acc} />
      <rect x="56" y="30" width="32" height="14" rx="5" className={base} />
    </>
  ),
  track: (
    <>
      <path d="M4 50C28 52 30 20 52 18S84 30 92 14" className="fill-none stroke-line stroke-[8] [stroke-linecap:round]" />
      <path d="M4 50C28 52 30 20 52 18S84 30 92 14" strokeDasharray="3 3" className="fill-none stroke-(--thumb-bar) stroke-[1.5]" />
      <path d="M45 13.5l14 4.5-14 4.5 3-4.5z" className={acc} />
    </>
  ),
  town: (
    <>
      <path d="M10 52V38l10-8 10 8v14zM36 52V34l11-9 11 9v18zM64 52V40l9-7 9 7v12z" className={bar} />
      <rect x="44" y="38" width="6" height="6" rx="1" className={acc} />
      <path d="M6 52h84" className={lineBar} />
      <circle cx="78" cy="14" r="6" className={acc} />
      <circle cx="81" cy="11.5" r="5" className="fill-surface" />
    </>
  ),
  fork: (
    <>
      <path d="M14 32h26c12 0 16-16 32-16h10" className={lineBar} />
      <path d="M40 32c12 0 16 16 32 16h10" className={lineAcc} />
      <circle cx="14" cy="32" r="4" className="fill-surface stroke-(--thumb-bar) stroke-2" />
      <circle cx="82" cy="16" r="4" className="fill-surface stroke-(--thumb-bar) stroke-2" />
      <circle cx="82" cy="48" r="4" className="fill-surface stroke-(--thumb-accent) stroke-2" />
    </>
  ),
}

const frame = cn(
  'relative block h-[54px] w-20 shrink-0 overflow-hidden rounded-chip border border-line bg-surface md:h-16 md:w-24',
  'after:pointer-events-none after:absolute after:inset-0 after:rounded-[7px] after:shadow-[inset_0_1px_0_var(--thumb-highlight)]',
)

/** The 96 × 64 (phone 80 × 54) frame at the start of an index row. Empty, it holds the text column in place. */
export function ThumbFrame({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span data-thumb className={cn(frame, className)} {...props} />
}

interface ThumbProps {
  kind: ThumbKind
  /** Scopes the accent tokens of the drawing. */
  world: PageWorld
  className?: string
}

/** A stylized mini-screen with invented content. The row text carries the meaning. */
export function Thumb({ kind, world, className }: ThumbProps) {
  return (
    <ThumbFrame aria-hidden data-world={world} className={className}>
      <svg viewBox="0 0 96 64" preserveAspectRatio="xMidYMid meet" className="block size-full">
        {drawings[kind]}
      </svg>
    </ThumbFrame>
  )
}
