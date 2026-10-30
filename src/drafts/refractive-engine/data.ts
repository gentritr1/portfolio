/** The page is the site's home: a case is BASE + '/' + slug (so `/care-platform`), and HOME is the page itself. */
export const BASE = ''
export const HOME = '/'
/** A plain left click: modified clicks keep the browser's own behaviour (new tab, new window). */
export const plain = (e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number }) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)

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
]

/** Owner rule (PRODUCT.md, 2026-10-06): internal care / design-system screens are captioned as invented data. */
export const INVENTED = new Set(['care-platform', 'design-system-react', 'multi-tenant', 'offday', 'leakscan'])
