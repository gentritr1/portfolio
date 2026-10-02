import { channels, type ChannelKey } from '../content/channels'
import { cn } from '../lib/cn'

interface ChannelBadgeProps {
  channel: ChannelKey
  /** Show the channel name after the number. */
  showLabel?: boolean
  size?: 'sm' | 'md'
  className?: string
}

/** Channel number in its tint, a short tint rule, then the channel name. */
export function ChannelBadge({ channel, showLabel = true, size = 'sm', className }: ChannelBadgeProps) {
  const info = channels[channel]
  return (
    <span data-channel={channel} className={cn('inline-flex items-center gap-2 whitespace-nowrap', size === 'sm' ? 'label' : 'label-lg', className)}>
      <span className="text-tint">{info.number}</span>
      {showLabel && (
        <>
          <span aria-hidden className="h-2.5 w-px bg-tint" />
          <span className="text-ink-2">{info.label}</span>
        </>
      )}
    </span>
  )
}
