import { REAL_SCREENS, careShots, dsShots, type ScreenShot } from '../../content/careShots'
import { projects, type Project, type PublicLink, type RecreationKey } from '../../content/projects'

export type Variant = 'frontend' | 'mobile' | 'fullstack'

export const variants: { id: Variant; label: string }[] = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'mobile', label: 'Mobile' },
  { id: 'fullstack', label: 'Full stack' },
]

type PerVariant<T> = T | Record<Variant, T>

export const pick = <T,>(value: PerVariant<T>, variant: Variant): T =>
  value !== null && typeof value === 'object' && !Array.isArray(value) && 'frontend' in (value as object)
    ? (value as Record<Variant, T>)[variant]
    : (value as T)

export interface PropRow {
  name: string
  type: string
  value: PerVariant<string>
  detail?: PerVariant<string>
  proof: PerVariant<string[]>
}

export const platforms = [
  { id: 'web', label: 'Web' },
  { id: 'ios', label: 'iOS' },
  { id: 'android', label: 'Android' },
  { id: 'api', label: 'API' },
] as const

export const platformFocus: Record<Variant, string[]> = {
  frontend: ['web'],
  mobile: ['ios', 'android'],
  fullstack: ['web', 'api'],
}

export const propRows: PropRow[] = [
  {
    name: 'role',
    type: 'string',
    value: {
      frontend: 'Frontend developer',
      mobile: 'Mobile developer',
      fullstack: 'Full stack developer',
    },
    detail: {
      frontend: 'Web apps, design systems, rewrites',
      mobile: 'iOS and Android, from build to store release',
      fullstack: 'Laravel and FastAPI behind the interface, since 2026',
    },
    proof: {
      frontend: ['design-system-react', 'bayyinah-tv'],
      mobile: ['read-to-feed', 'viva-fresh'],
      fullstack: ['care-platform', 'offday'],
    },
  },
  {
    name: 'years',
    type: 'number',
    value: '5+',
    detail: 'Since 2021. Kosovo, working remotely',
    proof: ['dukagjini-bookstore'],
  },
  {
    name: 'platforms',
    type: 'Platform[]',
    value: '',
    proof: {
      frontend: ['incentiv', 'bayyinah-tv'],
      mobile: ['read-to-feed', 'dukagjini-bookstore'],
      fullstack: ['care-platform', 'offday'],
    },
  },
  {
    name: 'rewrites',
    type: 'number',
    value: '2',
    detail: 'Vue to React, route by route. Nuxt 3, from an empty template',
    proof: ['care-platform', 'bayyinah-tv'],
  },
  {
    name: 'designSystem',
    type: 'Library',
    value: '36 components',
    detail: '805 tokens in three tiers, 20 releases in about six weeks',
    proof: ['design-system-react'],
  },
  {
    name: 'tenancy',
    type: '"multi-tenant"',
    value: 'Multi-tenant',
    detail: 'Data, roles and timezones kept apart for each organization',
    proof: ['care-platform', 'offday'],
  },
  {
    name: 'storeReleases',
    type: 'number',
    value: 'About 14',
    detail: 'One app to both stores, React Native 0.63 to 0.81',
    proof: ['read-to-feed'],
  },
]

export interface Frame {
  src: string
  alt: string
  width: number
  height: number
  /** The screen inside a store frame, in source pixels. */
  crop?: { x: number; y: number; w: number; h: number }
}

export type Canvas =
  | { kind: 'recreation'; key: RecreationKey }
  /** A real product screen. `brief` is the crop for a closed brief card. */
  | { kind: 'screen'; shot: ScreenShot; brief?: ScreenShot }
  | { kind: 'web'; frames: Frame[] }
  | { kind: 'phone'; frames: Frame[] }

export interface Example {
  slug: string
  name: string
  short: string
  years: string
  role: string
  variants: Variant[]
  problem: string
  built: string
  result: string
  canvas: Canvas
  /** Shown only when the example is expanded. */
  more: { text: string; canvas?: Canvas; links: PublicLink[] }
  label: string
}

const project = (slug: string): Project => {
  const found = projects.find((p) => p.slug === slug)
  if (!found) throw new Error(`Unknown project ${slug}`)
  return found
}

const frames = (slug: string, gallery = 0, from = 0, to?: number): Frame[] =>
  (project(slug).media.galleries?.[gallery]?.items ?? []).slice(from, to).map(({ src, alt, width, height }) => ({ src, alt, width, height }))

/** One phone screen from a store frame, cut inside the glass. */
const screen = (slug: string, index: number, crop: Frame['crop']): Frame[] => frames(slug, 0, index, index + 1).map((f) => ({ ...f, crop }))

const span = (years: string | null) => (years ?? '').replace('–', '-')

const base = (slug: string) => {
  const p = project(slug)
  return { slug, name: p.name, years: span(p.years), role: p.role, links: p.links, summary: p.summary }
}

const recreationLabel = 'Recreation with invented data'
const realLabel = REAL_SCREENS.replace(/\.$/, '')
const publicLabel = 'Public pages'
const storeLabel = 'Public store listing'

const ds = base('design-system-react')
const care = base('care-platform')
const bay = base('bayyinah-tv')
const rtf = base('read-to-feed')
const viva = base('viva-fresh')
const duka = base('dukagjini-bookstore')
const inc = base('incentiv')
const off = base('offday')
const ai = base('ai-dashboard')

export const examples: Example[] = [
  {
    ...ds,
    short: 'Design System v2',
    variants: ['frontend'],
    problem: 'A React rewrite needed one shared, accessible base of controls.',
    built: 'One token source in three tiers, generated to CSS, TypeScript and Figma; 36 components on top.',
    result: '20 releases in about six weeks. A Button-only consumer ships 96.6% less JavaScript.',
    canvas: { kind: 'screen', shot: dsShots.buttonAlert, brief: dsShots.top },
    more: {
      text: 'Each component is built to WCAG 2.1 AA floors with automated, rendered evidence: axe tests and in-browser contrast checks, with negative controls that prove the checks can fail. The new React dashboard uses the system through one adapter layer; it is not in production yet.',
      links: [],
    },
    label: realLabel,
  },
  {
    ...care,
    short: 'Care platform',
    name: 'Care-management platform',
    variants: ['frontend', 'fullstack'],
    problem: 'A live multi-tenant care platform had to move from Vue to React.',
    built: 'Route by route. Each route moves only after its parity test passes against both apps.',
    result: 'Most screens are rebuilt in React. One billing report went from 16 queries to 2.',
    canvas: { kind: 'screen', shot: careShots.patients },
    more: {
      text: 'Care teams follow vitals from connected devices, care plans, labs, claims, calls and chat, in four languages. Every screen keeps each organization’s data separate and respects each user’s role and timezone. The Laravel API gained enrollment drafts, a lab catalog and multi-tenant security fixes.',
      links: [],
    },
    label: realLabel,
  },
  {
    ...bay,
    short: 'Bayyinah TV',
    variants: ['frontend', 'mobile'],
    problem: 'A video-learning platform needed a second version with live streams and paid plans.',
    built: 'A full Nuxt 3 rebuild: live chat with moderation, an HLS paywall, Stripe, Apple and Google plans, English and Arabic.',
    result: 'Live on the web and inside the iOS and Android apps. 34 routes, 270+ components.',
    canvas: { kind: 'web', frames: frames('bayyinah-tv', 0, 4, 5) },
    more: {
      text: 'Stripe, Apple and Google subscriptions, gifting and promo codes. The interface runs in English and Arabic with a complete right-to-left layout, and the same web app runs inside the native apps.',
      canvas: { kind: 'phone', frames: frames('bayyinah-tv', 1, 0, 1) },
      links: bay.links,
    },
    label: publicLabel,
  },
  {
    ...rtf,
    short: 'Read to Feed',
    variants: ['mobile'],
    problem: 'A children’s reading app had to keep shipping through React Native upgrades.',
    built: 'A PDF and EPUB reader, ISBN barcode scanning, badges and streaks, and maintained reader forks.',
    result: 'About 14 releases to both stores, from React Native 0.63 to 0.81.',
    canvas: { kind: 'phone', frames: screen('read-to-feed', 0, { x: 91, y: 646, w: 598, h: 648 }) },
    more: {
      text: 'Three major React Native upgrades over four years, push notifications with deep links, a notification center and three languages. The forks of epubjs-react-native and react-native-pdf are public on GitHub. The listings are removed, so the links open archived copies.',
      canvas: { kind: 'phone', frames: screen('read-to-feed', 1, { x: 91, y: 600, w: 598, h: 740 }) },
      links: rtf.links,
    },
    label: storeLabel,
  },
  {
    ...viva,
    short: 'Viva Fresh',
    variants: ['mobile'],
    problem: 'Shoppers needed to order groceries for delivery from their phone.',
    built: 'Delivery slots, loyalty, a wishlist and address search on a map, in React Native.',
    result: 'Live in the App Store and on Google Play from one codebase.',
    canvas: { kind: 'phone', frames: screen('viva-fresh', 0, { x: 100, y: 476, w: 580, h: 766 }) },
    more: {
      text: 'The cart keeps quantities, discounts and the running total in view. The interface is in Albanian, and the store listings show the same app on iPhone and on Android.',
      canvas: { kind: 'phone', frames: screen('viva-fresh', 2, { x: 100, y: 656, w: 580, h: 818 }) },
      links: viva.links,
    },
    label: storeLabel,
  },
  {
    ...duka,
    short: 'Dukagjini Bookstore',
    variants: ['mobile'],
    problem: 'A book publisher needed a shopping app on iOS and Android.',
    built: 'Search, favourites and promo-code checkout. A push notification opens the right book.',
    result: 'Live in both stores from one React Native codebase.',
    canvas: { kind: 'phone', frames: screen('dukagjini-bookstore', 1, { x: 117, y: 740, w: 546, h: 730 }) },
    more: {
      text: 'The book-detail header animates as the page scrolls, and modals close with a swipe. Firebase Messaging carries push notifications, and deep links bring readers back to a book.',
      links: duka.links,
    },
    label: storeLabel,
  },
  {
    ...inc,
    short: 'Incentiv',
    variants: ['frontend'],
    problem: 'A smart-wallet dashboard needed its sign-in and dashboard interface.',
    built: 'The Next.js 14 UI layer: passkey and wallet sign-in, onboarding, balances, a QR address, EN and FR.',
    result: 'Live at portal.incentiv.io. Teammates built the wallet and blockchain layer.',
    canvas: { kind: 'web', frames: frames('incentiv', 0, 2, 3) },
    more: {
      text: 'Public and private route middleware keeps the dashboard behind sign-in. RTK Query fetches balances, assets, gas saved and transactions for the dashboard cards.',
      canvas: { kind: 'web', frames: frames('incentiv', 0, 0, 2) },
      links: inc.links,
    },
    label: publicLabel,
  },
  {
    ...off,
    short: 'Offday',
    variants: ['fullstack'],
    problem: 'A time-off app where each company’s data must stay its own.',
    built: 'Next.js 16, SQLite and Zod: requests, approvals, a team calendar and a streaming AI assistant.',
    result: 'About 200 Playwright tests guard security and tenant isolation.',
    canvas: { kind: 'web', frames: frames('offday', 0, 1, 2) },
    more: {
      text: 'Employees request leave, managers approve it, and the team calendar shows who is away, with drag-select to pick dates. Invite links bring people into a workspace. A personal project, with real screenshots.',
      canvas: { kind: 'web', frames: [...frames('offday', 0, 0, 1), ...frames('offday', 0, 2, 3)] },
      links: [],
    },
    label: 'Own project',
  },
  {
    ...ai,
    short: 'AI dashboard',
    name: 'Business dashboard with AI',
    variants: ['fullstack'],
    problem: 'Staff needed answers from their own PDF documents.',
    built: 'A React dashboard with PDF-to-chat and headshot generation, plus FastAPI backend features.',
    result: 'Both AI flows run in one dashboard: photos to headshots, PDFs to a chat.',
    canvas: { kind: 'recreation', key: 'doc-chat' },
    more: { text: ai.summary, links: [] },
    label: recreationLabel,
  },
]

export const bySlug = Object.fromEntries(examples.map((e) => [e.slug, e])) as Record<string, Example>

export const order: Record<Variant, string[]> = {
  frontend: ['design-system-react', 'care-platform', 'bayyinah-tv', 'incentiv'],
  mobile: ['read-to-feed', 'viva-fresh', 'dukagjini-bookstore', 'bayyinah-tv'],
  fullstack: ['care-platform', 'offday', 'ai-dashboard'],
}

export function arrange(variant: Variant) {
  const lead = order[variant].map((slug) => bySlug[slug])
  const rest = examples.filter((e) => !order[variant].includes(e.slug))
  return { lead, rest }
}
