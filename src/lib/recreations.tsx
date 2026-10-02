import type { RecreationKey } from '../content/projects'
import { preloadable, type Preloadable } from './preloadable'
import type { WorldId } from './worlds'

export interface MonitorAspect {
  /** Below 640 px. */
  base: string
  /** 640 to 1023 px. */
  sm: string
  /** 1024 px and up. */
  lg: string
}

export interface RecreationEntry extends Preloadable<object> {
  name: string
  /** Recreation palette that the monitor stage scopes with data-world. */
  world: WorldId
  aspect: MonitorAspect
}

export const recreations: Record<RecreationKey, RecreationEntry> = {
  care: {
    name: 'Vitals trend card',
    world: 'healthcare',
    aspect: { base: '4 / 5', sm: '4 / 3', lg: '16 / 10' },
    ...preloadable(() => import('../worlds/healthcare/Recreation').then((m) => m.Recreation)),
  },
  'live-room': {
    name: 'Live room',
    world: 'streaming',
    aspect: { base: '3 / 4', sm: '1 / 1', lg: '43 / 20' },
    ...preloadable(() => import('../worlds/streaming/Recreation').then((m) => m.Recreation)),
  },
  reader: {
    name: 'Reader page',
    world: 'reading',
    aspect: { base: '9 / 16', sm: '1 / 1', lg: '16 / 10' },
    ...preloadable(() => import('../worlds/reading/Recreation').then((m) => m.Recreation)),
  },
  wallet: {
    name: 'Wallet card',
    world: 'web3',
    aspect: { base: '3 / 4', sm: '6 / 5', lg: '21 / 9' },
    ...preloadable(() => import('../worlds/web3/Recreation').then((m) => m.Recreation)),
  },
  'doc-chat': {
    name: 'Document chat',
    world: 'ai',
    aspect: { base: '4 / 5', sm: '4 / 3', lg: '16 / 10' },
    ...preloadable(() => import('../worlds/ai/Recreation').then((m) => m.Recreation)),
  },
}
