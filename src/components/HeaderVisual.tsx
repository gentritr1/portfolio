import type { Ref } from 'react'
import { channelOrder, type ChannelKey } from '../content/channels'
import { SignalStack, type SignalStackHandle } from './signal-stack/SignalStack'

interface HeaderVisualProps {
  stackRef?: Ref<SignalStackHandle>
  transitionName?: string
  active: ChannelKey
  className?: string
}

export function HeaderVisual({ active, className, stackRef, transitionName }: HeaderVisualProps) {
  return <SignalStack ref={stackRef} transitionName={transitionName} channels={channelOrder} active={active} className={className} />
}
