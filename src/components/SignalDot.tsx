import { cn } from '../lib/cn'

interface SignalDotProps {
  /** `signal` is on air, `tint` follows the channel, `off` is an unlit lamp. */
  tone?: 'signal' | 'tint' | 'off'
  className?: string
}

/** A steady status lamp. It carries state, so it never pulses. */
export function SignalDot({ tone = 'signal', className }: SignalDotProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block size-2 shrink-0 rounded-full',
        tone === 'signal' && 'bg-signal',
        tone === 'tint' && 'bg-tint',
        tone === 'off' && 'ring-1 ring-current ring-inset opacity-60',
        className,
      )}
    />
  )
}
