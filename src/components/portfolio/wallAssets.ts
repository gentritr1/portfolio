import type { Project } from '../../content/projects'

export interface WallAsset {
  src: string
  aspect: number
  colour: number
  fallback: { background: string; ink: string }
  position?: [number, number]
  zoom?: number
  /** A real product screen captured on invented data. */
  inventedData?: boolean
}

export interface WallPoster {
  background: string
  ink: string
  colour: number
  lines: string[]
}

/** Public store and web captures, and real care screens captured on invented data. */
export const wallAssets: Record<string, WallAsset> = {
  'bayyinah-tv': { src: '/showcase/bayyinah/store-01.webp', aspect: 0.55, colour: 0, fallback: { background: '#a83819', ink: '#fffaf0' } },
  'viva-fresh': { src: '/mobile/grocery-1.webp', aspect: 0.56, colour: 1, fallback: { background: '#c92438', ink: '#fffaf0' } },
  'dukagjini-bookstore': { src: '/mobile/bookstore-1.webp', aspect: 0.7, colour: 2, position: [0.5, 0.2], fallback: { background: '#e9a6a4', ink: '#39151b' } },
  'snaxx-tech': { src: '/personal/shots/snaxx-desktop.webp', aspect: 0.85, colour: 3, position: [0.54, 0.65], zoom: 1.3, fallback: { background: '#f1d63d', ink: '#292308' } },
  'read-to-feed': { src: '/mobile/reading-1.webp', aspect: 0.51, colour: 4, fallback: { background: '#65b5d8', ink: '#102c38' } },
  'morse-trainer': { src: '/personal/shots/morse-desktop.webp', aspect: 1.2, colour: 5, position: [0.35, 0.5], fallback: { background: '#d2ac52', ink: '#2c2414' } },
  za: { src: '/personal/shots/za-desktop.webp', aspect: 1, colour: 6, fallback: { background: '#e69bd7', ink: '#2c1737' } },
  fjale: { src: '/personal/shots/fjale-desktop.webp', aspect: 0.95, colour: 7, fallback: { background: '#a9e928', ink: '#172312' } },
  offday: { src: '/personal/shots/offday-light-calendar-desktop.webp', aspect: 1.15, colour: 8, position: [0.64, 0.2], fallback: { background: '#b797fb', ink: '#221244' } },
  'care-platform': { src: '/showcase/care-dashboard/overview.webp', aspect: 1.1, colour: 9, position: [0.28, 0.42], zoom: 1.2, inventedData: true, fallback: { background: '#12cbbd', ink: '#102724' } },
  'bayyinah-institute': { src: '/showcase/bayyinah/org-01.webp', aspect: 1.25, colour: 10, fallback: { background: '#2351df', ink: '#fffaf0' } },
  'geo-guesser': { src: '/mobile/thumbs/geoguesser.webp', aspect: 1.6, colour: 11, fallback: { background: '#5adced', ink: '#0b2935' } },
  incentiv: { src: '/showcase/incentiv/web-03.webp', aspect: 0.9, colour: 12, position: [0.3, 0.5], fallback: { background: '#2b4ae6', ink: '#fffaf0' } },
}

/** Editorial poster colours, not invented product branding. Titles retain the project names. */
export const wallPosters: Record<string, WallPoster> = {
  'care-api': { background: '#2351df', ink: '#fffaf0', colour: 11.2, lines: ['Care-', 'management', 'API'] },
  'design-system-react': { background: '#2454e8', ink: '#fffaf0', colour: 9.2, lines: ['Design', 'System', 'v2'] },
  'design-system-vue': { background: '#a9e928', ink: '#172312', colour: 7.2, lines: ['Design', 'system,', 'Vue'] },
  'design-dashboard': { background: '#12cbbd', ink: '#102724', colour: 9.4, lines: ['Design', 'dashboard', '(prototype)'] },
  'chatbot-runtime': { background: '#5c34d8', ink: '#fffaf0', colour: 6.1, lines: ['Chatbot', 'runtime', 'library'] },
  'chatbot-runtime-web': { background: '#b797fb', ink: '#221244', colour: 6.3, lines: ['Chatbot', 'runtime,', 'web port'] },
  'epub-reader-prototype': { background: '#f1d63d', ink: '#292308', colour: 3.8, lines: ['EPUB', 'reader', 'prototype'] },
  'donation-app': { background: '#ff733b', ink: '#39190b', colour: 2.7, lines: ['Sadaqah', 'for Islamic', 'Relief USA'] },
  'coaching-app': { background: '#cef43b', ink: '#233006', colour: 7.5, lines: ['Coaching', 'app'] },
  'fuel-loyalty-app': { background: '#ffb800', ink: '#322208', colour: 3.4, lines: ['Fuel-station', 'loyalty app'] },
  'member-portal': { background: '#2b4ae6', ink: '#fffaf0', colour: 11.8, lines: ['Member', 'portal,', 'web'] },
  'ai-dashboard': { background: '#e64720', ink: '#210c06', colour: 1.5, lines: ['Smart', 'business', 'dashboard', 'with AI'] },
  futurisma: { background: '#1d35cd', ink: '#e3fb67', colour: 10.7, lines: ['Futurisma'] },
  'secret-dictator': { background: '#c92438', ink: '#fffaf0', colour: 0.7, lines: ['Secret', 'Dictator'] },
  'open-source-forks': { background: '#5adced', ink: '#0b2935', colour: 8.2, lines: ['Open-source', 'forks'] },
}

export function wallColour(project: Project): number {
  return wallAssets[project.slug]?.colour ?? wallPosters[project.slug]?.colour ?? 100
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
