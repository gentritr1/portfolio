export type WorldId = 'healthcare' | 'streaming' | 'reading' | 'web3' | 'ai'
export type PageWorld = WorldId | 'base'

export interface WorldInfo {
  id: WorldId
  label: string
  employer: string
  period: string
  /** Short period for tight places such as the hero bars. */
  short: string
}

export const worlds: Record<WorldId, WorldInfo> = {
  healthcare: { id: 'healthcare', label: 'Healthcare', employer: 'Vianova', period: '2021 - present', short: 'Since 2021' },
  streaming: { id: 'streaming', label: 'Streaming', employer: 'Agency work', period: '2023 - 2026', short: '2023-2026' },
  reading: { id: 'reading', label: 'Reading', employer: 'Agency work', period: '2021 - 2025', short: '2021-2025' },
  web3: { id: 'web3', label: 'Web3', employer: 'Incentiv', period: '2024', short: '2024' },
  ai: { id: 'ai', label: 'AI dashboards', employer: 'AvahiTech', period: 'Freelance', short: 'Freelance' },
}

/** The four worlds the hero test card shows, in page order. */
export const primaryWorlds: WorldId[] = ['healthcare', 'streaming', 'reading', 'web3']

