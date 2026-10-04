import { projects } from '../../content/projects'
import { wallAssets } from '../../components/portfolio/wallAssets'

export const shelves = [
  { id: 'platforms', title: 'Platforms & systems', note: 'Web, API, architecture', slugs: ['bayyinah-tv', 'care-platform', 'incentiv', 'care-api', 'design-system-react', 'design-system-vue', 'design-dashboard', 'bayyinah-institute', 'member-portal', 'ai-dashboard'] },
  { id: 'mobile', title: 'Made for the pocket', note: 'Mobile, readers, libraries', slugs: ['viva-fresh', 'read-to-feed', 'dukagjini-bookstore', 'chatbot-runtime', 'chatbot-runtime-web', 'epub-reader-prototype', 'donation-app', 'coaching-app', 'fuel-loyalty-app'] },
  { id: 'independent', title: 'Independent work', note: 'Games, tools, personal projects', slugs: ['fjale', 'za', 'morse-trainer', 'snaxx-tech', 'offday', 'geo-guesser', 'futurisma', 'secret-dictator', 'open-source-forks'] },
] as const

const facts: Record<string, { value: string; label: string }> = {
  'bayyinah-tv': { value: '34', label: 'routes · EN / AR' },
  'care-platform': { value: '31', label: 'architecture decisions' },
  incentiv: { value: 'QR', label: 'balances & passkeys' },
  'care-api': { value: '16 → 2', label: 'report queries' },
  'design-system-react': { value: '34', label: 'accessible components' },
  'design-system-vue': { value: 'FIGMA', label: 'tokens to components' },
  'design-dashboard': { value: 'DEMO', label: 'design reference' },
  'bayyinah-institute': { value: '1 PAGE', label: 'mission & support' },
  'member-portal': { value: 'SIGN IN', label: 'protected routes' },
  'ai-dashboard': { value: 'PDF', label: 'to chat assistant' },
  'viva-fresh': { value: 'LOYALTY', label: 'groceries & delivery' },
  'read-to-feed': { value: '0.63 → 0.81', label: 'React Native' },
  'dukagjini-bookstore': { value: 'BOOKS', label: 'iOS & Android' },
  'chatbot-runtime': { value: 'QUEUE', label: 'scripted conversations' },
  'chatbot-runtime-web': { value: 'WEB', label: 'typed runtime port' },
  'epub-reader-prototype': { value: 'EPUB', label: 'download, read, resize' },
  'donation-app': { value: 'STRIPE', label: 'donations & subscriptions' },
  'coaching-app': { value: 'DAILY', label: 'calendar & coaching' },
  'fuel-loyalty-app': { value: 'ARM64', label: 'simulator support' },
  fjale: { value: '21K', label: 'Albanian words' },
  za: { value: '2–8', label: 'players · live multiplayer' },
  'morse-trainer': { value: 'MORSE', label: 'Farnsworth timing' },
  'snaxx-tech': { value: '972 → 337', label: 'KB of image assets' },
  offday: { value: '16', label: 'security & isolation tests' },
  'geo-guesser': { value: 'PLAY', label: 'published on Google Play' },
  futurisma: { value: '7', label: 'circuits · weather & tides' },
  'secret-dictator': { value: 'AI', label: 'opponents in a 3D town' },
  'open-source-forks': { value: 'EPUB / PDF', label: 'maintained reader forks' },
}

export const aisleProducts = projects.map((project, index) => {
  const asset = wallAssets[project.slug]
  return {
    project,
    reference: String(index + 1).padStart(2, '0'),
    fact: facts[project.slug],
    image: asset ? { src: asset.src, alt: asset.recreation ? 'Care-management interface recreation with invented data' : project.name + ', public product image', position: asset.position ?? [.5, .35], recreation: Boolean(asset.recreation) } : null,
  }
})

export const productBySlug = new Map(aisleProducts.map(product => [product.project.slug, product]))
