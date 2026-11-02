/**
 * Content for Event Horizon. Every fact comes from the site's own content files
 * (projects.ts, caseNarratives.ts, the case diagrams) or from THE LOOP draft's sourced data.
 */
import { featuredProjects, type Readout } from "../content/projects"
import { caseNarratives } from "../content/caseNarratives"
import { systems as layersBySlug } from "./caseSystems"
import { boards } from "./deliveryData"

export { stations, steps, own, breadth, learned, ringProof, twinSteps, twinBase } from "./deliveryData"
export { links } from "../content/links"

const tints: Record<string, string> = {
  'care-platform': '#3c807e',
  'bayyinah-tv': '#a84430',
  'read-to-feed': '#347b85',
  'viva-fresh': '#aa353b',
  'dukagjini-bookstore': '#2c5288',
  'design-system-react': '#2454e8',
  'incentiv': '#ad6036',
  'futurisma': '#3a4f8f',
}

export interface Picture {
  src: string
  alt: string
  caption: string
  width: number
  height: number
}

export interface System {
  slug: string
  name: string
  kind: string
  years: string | null
  role: string
  line: string
  stack: string[]
  readouts: Readout[]
  /** The cropped screen texture in public/eh/, and its width / height. */
  texture: string
  aspect: number
  /** The project's studio colour from its case page. */
  tint: string
  story?: { product: string; built: string; result: string }
  facts: { label: string; value: string }[]
  layers: { title: string; stack: string; description: string }[]
  gallery: Picture[]
  links: { label: string; href: string }[]
}

/** Width / height of each texture in public/eh/ (made from the public screenshots the case pages already use). */
const aspects: Record<string, number> = {
  'read-to-feed': 523 / 1024,
  'viva-fresh': 461 / 1024,
  'dukagjini-bookstore': 570 / 1013,
}

/** Design System boards 2 to 7: board 1 carries totals that differ from projects.ts, so it stays out until they agree. */
const boardPictures: Picture[] = boards.slice(1).map((b) => ({ src: b.small, alt: b.alt, caption: b.title, width: 1600, height: 1000 }))

/** Dashes on this page are plain hyphens: year ranges and asides alike. */
const plain = (text: string) => text.replace(/\s?[\u2013\u2014]\s?/g, (m) => (m.trim() === m ? '-' : ' - '))

export const systems: System[] = featuredProjects.map((p) => {
  const narrative = caseNarratives[p.slug]
  const gallery =
    p.slug === 'design-system-react'
      ? boardPictures
      : (p.media.galleries ?? []).flatMap((g) => g.items).slice(0, 8).map((i) => ({ src: i.src, alt: i.alt, caption: i.caption ?? '', width: i.width, height: i.height }))
  return {
    slug: p.slug,
    name: p.name,
    kind: p.kind,
    years: p.years && plain(p.years),
    role: p.role,
    line: plain(p.line),
    stack: p.stack,
    readouts: p.featured?.readouts ?? [],
    texture: `/eh/${p.slug}.webp`,
    aspect: aspects[p.slug] ?? 1.6,
    tint: tints[p.slug] ?? '#5fe3ff',
    story: narrative?.story && { product: plain(narrative.story.product), built: plain(narrative.story.built), result: plain(narrative.story.result) },
    facts: (narrative?.facts ?? []).map((f) => ({ label: f.label, value: plain(f.value) })),
    layers: layersBySlug[p.slug]?.layers ?? [],
    gallery,
    links: p.links,
  }
})
