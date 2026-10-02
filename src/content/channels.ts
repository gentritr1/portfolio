import { projects } from './projects'

export type ChannelKey = 'healthcare' | 'streaming' | 'reading' | 'web3' | 'ai' | 'personal'
export type ChannelNumber = 'CH01' | 'CH02' | 'CH03' | 'CH04' | 'CH05' | 'CH06'

export interface Channel {
  key: ChannelKey
  number: ChannelNumber
  label: string
  /** CSS custom property that holds the channel tint. `[data-channel]` copies it into `--tint`. */
  tint: `--ch-${ChannelKey}`
  /** Time code from the first to the last year of the channel's projects. Null when no project gives years. */
  period: string | null
}

/** Reads "2023–26", "2021–22" or "2026" as a first and a last year. */
function yearSpan(years: string): [number, number] | null {
  const match = /^(\d{4})(?:–(\d{2}|\d{4}))?$/.exec(years)
  if (!match) return null
  const first = Number(match[1])
  const end = match[2]
  if (!end) return [first, first]
  return [first, end.length === 2 ? Math.floor(first / 100) * 100 + Number(end) : Number(end)]
}

function timecode(first: number, last: number): string {
  return first === last ? String(first) : `${first}–${String(last).slice(-2)}`
}

function periodOf(key: ChannelKey): string | null {
  const spans = projects
    .filter((project) => project.channel === key && project.years)
    .map((project) => yearSpan(project.years ?? ''))
    .filter((span): span is [number, number] => span !== null)
  if (spans.length === 0) return null
  return timecode(Math.min(...spans.map((span) => span[0])), Math.max(...spans.map((span) => span[1])))
}

const base: Record<ChannelKey, Omit<Channel, 'period'>> = {
  healthcare: { key: 'healthcare', number: 'CH01', label: 'Healthcare', tint: '--ch-healthcare' },
  streaming: { key: 'streaming', number: 'CH02', label: 'Streaming', tint: '--ch-streaming' },
  reading: { key: 'reading', number: 'CH03', label: 'Mobile apps', tint: '--ch-reading' },
  web3: { key: 'web3', number: 'CH04', label: 'Web3', tint: '--ch-web3' },
  ai: { key: 'ai', number: 'CH05', label: 'Web apps & AI', tint: '--ch-ai' },
  personal: { key: 'personal', number: 'CH06', label: 'Games & personal', tint: '--ch-personal' },
}

export const channelOrder: ChannelKey[] = ['healthcare', 'streaming', 'reading', 'web3', 'ai', 'personal']

export const channels = Object.fromEntries(
  channelOrder.map((key) => [key, { ...base[key], period: periodOf(key) }]),
) as Record<ChannelKey, Channel>
