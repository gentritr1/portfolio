/**
 * Content for Event Horizon. Every fact comes from the site's own content files
 * (projects.ts, caseNarratives.ts, the case diagrams) or from THE LOOP draft's sourced data.
 */
import { featuredProjects, type Readout } from '../../content/projects'
import { caseNarratives } from '../../content/caseNarratives'
import { systems as layersBySlug } from '../../components/case/TechnicalDiagram'
import { boards } from '../the-loop/data'

export { stations, steps, own, breadth, learned, ringProof, twinSteps, twinBase } from '../the-loop/data'
export { links } from '../../content/links'

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
    years: p.years,
    role: p.role,
    line: p.line,
    stack: p.stack,
    readouts: p.featured?.readouts ?? [],
    texture: `/eh/${p.slug}.webp`,
    aspect: aspects[p.slug] ?? 1.6,
    story: narrative?.story,
    facts: narrative?.facts ?? [],
    layers: layersBySlug[p.slug]?.layers ?? [],
    gallery,
    links: p.links,
  }
})
