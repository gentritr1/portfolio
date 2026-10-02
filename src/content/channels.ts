export type ChannelKey = 'healthcare' | 'streaming' | 'reading' | 'web3' | 'ai' | 'personal'
export type ChannelNumber = 'CH01' | 'CH02' | 'CH03' | 'CH04' | 'CH05' | 'CH06'

export interface Channel {
  key: ChannelKey
  number: ChannelNumber
  label: string
  /** CSS custom property that holds the channel tint. `[data-channel]` copies it into `--tint`. */
  tint: `--ch-${ChannelKey}`
  /** Time code of the channel's first and last year on air. */
  period: string
}

export const channels: Record<ChannelKey, Channel> = {
  healthcare: { key: 'healthcare', number: 'CH01', label: 'Healthcare', tint: '--ch-healthcare', period: '2021–now' },
  streaming: { key: 'streaming', number: 'CH02', label: 'Streaming', tint: '--ch-streaming', period: '2023–26' },
  reading: { key: 'reading', number: 'CH03', label: 'E-reading & mobile', tint: '--ch-reading', period: '2021–26' },
  web3: { key: 'web3', number: 'CH04', label: 'Web3', tint: '--ch-web3', period: '2024–25' },
  ai: { key: 'ai', number: 'CH05', label: 'AI & web apps', tint: '--ch-ai', period: 'Freelance' },
  personal: { key: 'personal', number: 'CH06', label: 'Games & personal', tint: '--ch-personal', period: '2022–26' },
}

export const channelOrder: ChannelKey[] = ['healthcare', 'streaming', 'reading', 'web3', 'ai', 'personal']
