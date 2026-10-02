import { channelOrder, type ChannelKey } from '../content/channels'
import { SignalStack } from './signal-stack/SignalStack'

interface HeaderVisualProps {
  active: ChannelKey
  className?: string
}

export function HeaderVisual({ active, className }: HeaderVisualProps) {
  return <SignalStack channels={channelOrder} active={active} className={className} />
}
