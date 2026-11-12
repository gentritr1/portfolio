/** The page is the site's home: a case is BASE + '/' + slug (so `/care-platform`), and HOME is the page itself. */
export const BASE = ''
export const HOME = '/'
/** A plain left click: modified clicks keep the browser's own behaviour (new tab, new window). */
export const plain = (e: { metaKey: boolean; ctrlKey: boolean; shiftKey: boolean; altKey: boolean; button: number }) => !(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
/** Every link arrow on the home page: → for a page of this site, ↗ for another site, at this one size and weight. */
export const ARROW = { size: 20, weight: 'light', 'aria-hidden': true } as const

/**
 * Content for The Refractive Engine. Projects come from Event Horizon's data (itself built from the site's
 * content files); every ledger number is copied from the source named on its row (repo locations:
 * projects.ts / caseNarratives.ts, the-loop/data.ts board-07 and own[] snaxx, the event-horizon frame harness;
 * the fonts row: this page's font requests in Chrome on a production build, originals in scripts/fonts/originals).
 */
export { systems, links } from "./portfolioData"

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
    id: 'studio',
    name: 'Snaxx Tech studio site',
    bars: [
      { label: 'Images', before: { low: 972, text: '972 KB' }, after: { low: 337, text: '337 KB' }, scale: 972 },
      { label: 'Deploy size', before: { low: 28, text: '28 MB' }, after: { low: 9.5, text: '9.5 MB' }, scale: 28 },
    ],
    note: 'Both about a third of what they were.',
    source: 'The Snaxx Tech site, from its project record',
  },
  {
    id: 'fonts',
    name: 'The fonts on this site',
    bars: [{ label: 'Font bytes each page downloads', before: { low: 103328, text: '103,328 bytes' }, after: { low: 47284, text: '47,284 bytes' }, scale: 103328 }],
    note: '54.2% less, from fonts cut to the characters this site uses. The text renders the same, checked pixel by pixel.',
    source: 'This site’s production build, measured in Chrome',
  },
]

/** Owner rule (PRODUCT.md, 2026-10-06): internal care / design-system screens are captioned as invented data. */
export const INVENTED = new Set(['care-platform', 'design-system-react', 'multi-tenant', 'offday', 'leakscan'])
