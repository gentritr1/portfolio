import type { Project } from '../../content/projects'

export interface WallAsset {
  src: string
  aspect: number
  colour: number
  position?: [number, number]
  zoom?: number
  recreation?: boolean
}

/** Existing public/store captures and the authored, invented-data care recreation. */
export const wallAssets: Record<string, WallAsset> = {
  'bayyinah-tv': { src: '/showcase/bayyinah/store-01.webp', aspect: 0.55, colour: 0 },
  'viva-fresh': { src: '/mobile/grocery-1.webp', aspect: 0.56, colour: 1 },
  'dukagjini-bookstore': { src: '/mobile/bookstore-1.webp', aspect: 0.7, colour: 2, position: [0.5, 0.2] },
  'snaxx-tech': { src: '/personal/shots/snaxx-desktop.webp', aspect: 0.85, colour: 3, position: [0.54, 0.65], zoom: 1.3 },
  'read-to-feed': { src: '/mobile/reading-1.webp', aspect: 0.51, colour: 4 },
  'morse-trainer': { src: '/personal/shots/morse-desktop.webp', aspect: 1.2, colour: 5, position: [0.35, 0.5] },
  za: { src: '/personal/shots/za-desktop.webp', aspect: 1, colour: 6 },
  fjale: { src: '/personal/shots/fjale-desktop.webp', aspect: 0.95, colour: 7 },
  offday: { src: '/personal/shots/offday-app-desktop.webp', aspect: 1.15, colour: 8, position: [0.64, 0.2] },
  'care-platform': { src: '/signal-posters/healthcare.avif', aspect: 1.1, colour: 9, recreation: true },
  'bayyinah-institute': { src: '/showcase/bayyinah/org-01.webp', aspect: 1.25, colour: 10 },
  'geo-guesser': { src: '/mobile/thumbs/geoguesser.webp', aspect: 1.6, colour: 11 },
  incentiv: { src: '/showcase/incentiv/web-01.webp', aspect: 0.9, colour: 12, position: [0.5, 0.2] },
}

export function wallPlatform(project: Project): string {
  if (/librar|runtime|fork/i.test(project.kind)) return 'Libraries'
  if (/API/.test(project.kind)) return 'Backend'
  if (project.stack.some((item) => /React Native|Expo/.test(item))) return 'Mobile'
  return 'Web'
}

export function wallYear(project: Project): number {
  if (!project.years) return 0
  const [first, last] = project.years.split('–')
  return last ? Number(last.length === 2 ? `20${last}` : last) : Number(first)
}
