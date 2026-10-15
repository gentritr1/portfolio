/**
 * Content for The Refractive Engine. Projects come from Event Horizon's data (itself built from the site's
 * content files); every ledger number is copied from the source named on its row (repo locations:
 * projects.ts / caseNarratives.ts, the-loop/data.ts board-07 and own[] snaxx, the event-horizon frame harness).
 */
export { systems, links } from '../event-horizon/data'

/** One measured value, or a measured range (low to high). */
export interface Value {
  low: number
  high?: number
  text: string
}

export interface Bar {
  label: string
  before: Value
  after: Value
  /** Both bars of a pair are drawn on this one scale, so their lengths compare. */
  scale: number
}

export interface LedgerRow {
  id: string
  name: string
  bars: Bar[]
  note: string
  source: string
}

export const ledger: LedgerRow[] = [
  {
    id: 'care',
    name: 'Care platform billing report',
    bars: [{ label: 'Database queries in one report', before: { low: 16, text: '16' }, after: { low: 2, text: '2' }, scale: 16 }],
    note: 'The report no longer times out.',
    source: 'The care platform API, from its commit history',
  },
  {
    id: 'ds',
    name: 'Design System v2',
    bars: [{ label: 'JavaScript for an app that imports only Button', before: { low: 186949, text: '186,949 bytes' }, after: { low: 6386, text: '6,386 bytes' }, scale: 186949 }],
    note: '96.6% less, from per-component builds.',
    source: 'Design System v2, measured in its release pipeline',
  },
  {
    id: 'futurisma',
    name: 'Futurisma, Frostline circuit',
    bars: [{ label: 'Floating props', before: { low: 1397, text: '1,397' }, after: { low: 0, text: '0' }, scale: 1397 }],
    note: 'A terrain fix, checked by the same audit before and after.',
    source: 'Futurisma, the same terrain audit before and after',
  },
  {
    id: 'snaxx',
    name: 'Snaxx Tech site',
    bars: [
      { label: 'Images', before: { low: 972, text: '972 KB' }, after: { low: 337, text: '337 KB' }, scale: 972 },
      { label: 'Deploy size', before: { low: 28, text: '28 MB' }, after: { low: 9.5, text: '9.5 MB' }, scale: 28 },
    ],
    note: 'The same site, with a smaller payload to ship.',
    source: 'Snaxx Tech, the site files before and after',
  },
  {
    id: 'eh-start',
    name: 'Event Horizon draft, startup',
    bars: [{ label: 'Longest frame in the opening, production build', before: { low: 100, high: 150, text: '100-150 ms' }, after: { low: 17, text: '17 ms' }, scale: 150 }],
    note: 'On the dev server the stalls were 300-650 ms. Now 240 of 240 frames land in the 4 s after the reveal.',
    source: 'Measured October 2026 in headless Chrome on the GPU',
  },
  {
    id: 'eh-hover',
    name: 'Event Horizon draft, hover',
    bars: [{ label: 'View roll from a 0.02-0.17 unit camera shift', before: { low: 63, high: 87, text: '63-87°' }, after: { low: 0.4, high: 3, text: '0.4-3.0°' }, scale: 90 }],
    note: 'The camera now sits 12° off vertical, so a small lean can no longer spin the view.',
    source: 'Measured October 2026 with the scene\'s own camera',
  },
]

/** Owner rule (PRODUCT.md, 2026-10-06): internal care / design-system screens are captioned as invented data. */
export const INVENTED = new Set(['care-platform', 'design-system-react', 'multi-tenant'])
