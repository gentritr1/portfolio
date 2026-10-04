import { projects, groupPeriods, type Project, type ProjectGroupName } from '../../content/projects'

export type Scope = 'Web' | 'API' | 'System' | 'Mobile' | 'Site' | 'Library' | 'Game' | '3D'

export type Media =
  | { kind: 'shot'; src: string; alt: string; note?: string }
  | { kind: 'phones'; srcs: string[]; alt: string }
  | { kind: 'readout'; value: string; to?: string; label: string }

interface Entry {
  name: string
  did: string
  scope: Scope
  accent: string
  problem: string
  result: string
  media: Media
}

const recreation = 'Recreation with invented data'

const entries: Record<string, Entry> = {
  'care-platform': {
    name: 'Care-management platform',
    did: 'Vue to React, route by route, parity-tested',
    scope: 'Web',
    accent: '#7fd1c4',
    problem: 'A live multi-tenant care platform had to leave Vue without losing a behaviour.',
    result: 'Each route moves to React only after its parity tests pass against both apps.',
    media: { kind: 'shot', src: '/signal-posters/healthcare.avif', alt: 'Vitals trend card for Patient 4821 at Northwind Clinic, two readings marked as alerts', note: recreation },
  },
  'care-api': {
    name: 'Care-management API',
    did: 'One billing report from 16 queries to 2',
    scope: 'API',
    accent: '#8cc4e6',
    problem: 'One billing report ran 16 queries and timed out.',
    result: 'It runs 2 queries now. Security fixes keep each tenant out of the others.',
    media: { kind: 'readout', value: '16', to: '2', label: 'queries in one billing report' },
  },
  'design-system-react': {
    name: 'Design System v2',
    did: '36 components, 805 tokens, 20 releases',
    scope: 'System',
    accent: '#a3b0ff',
    problem: 'A new React dashboard needed one accessible base, from tokens to controls.',
    result: '36 components, 20 releases in about six weeks. A Button-only consumer loads 96.6% less JavaScript.',
    media: { kind: 'shot', src: '/showcase/design-system/specimen-dark.webp', alt: 'Component specimen of an invented project-tracker kit: token tiers, alerts, inputs, steps and a toast', note: recreation },
  },
  'design-system-vue': {
    name: 'Design system, Vue',
    did: 'Figma tokens, codemods, visual tests',
    scope: 'System',
    accent: '#b9a8ff',
    problem: 'The Vue app had to stay in step with the design files.',
    result: 'Tokens flow from Figma. Codemods move screens over, and a dashboard shows adoption.',
    media: { kind: 'readout', value: 'Figma', to: 'CSS', label: 'tokens through Style Dictionary' },
  },
  'design-dashboard': {
    name: 'Design dashboard',
    did: 'Call-activity screen as a design reference',
    scope: 'Web',
    accent: '#9fd6b0',
    problem: 'Designers and engineers had to review a screen without a backend.',
    result: 'The call-activity screen, rebuilt on the design system with demo data.',
    media: { kind: 'readout', value: 'Demo data', label: 'no backend and no patient data' },
  },
  'bayyinah-tv': {
    name: 'Bayyinah TV',
    did: 'Nuxt 3 rebuild with live streams and paywall',
    scope: 'Web',
    accent: '#e2c27c',
    problem: 'A video-learning platform needed a second version with live streams.',
    result: 'A full Nuxt 3 rebuild: 34 routes, 270+ components, English and Arabic.',
    media: { kind: 'shot', src: '/showcase/bayyinah/web-01.webp', alt: 'Bayyinah TV landing page with the app on a laptop, a monitor and phones' },
  },
  'bayyinah-institute': {
    name: 'Bayyinah institute site',
    did: 'One-page Next.js site, mission to FAQ',
    scope: 'Site',
    accent: '#d8b48e',
    problem: 'The institute needed one public page for its mission and funding.',
    result: 'A one-page Next.js site, live at bayyinah.org, on phones and desktops.',
    media: { kind: 'shot', src: '/showcase/bayyinah/org-01.webp', alt: 'Bayyinah institute website, first section' },
  },
  'read-to-feed': {
    name: 'Read to Feed',
    did: 'About 14 store releases, RN 0.63 to 0.81',
    scope: 'Mobile',
    accent: '#f2a862',
    problem: 'A children’s reading app had to keep shipping while React Native moved on.',
    result: 'About 14 releases to both stores, through three major upgrades.',
    media: { kind: 'phones', srcs: ['/mobile/reading-1.webp', '/mobile/reading-2.webp', '/mobile/reading-3.webp'], alt: 'Three Read to Feed store screenshots' },
  },
  'viva-fresh': {
    name: 'Viva Fresh',
    did: 'Delivery slots, loyalty and map address search',
    scope: 'Mobile',
    accent: '#a2d46f',
    problem: 'Shoppers needed grocery orders with a delivery slot on both phones.',
    result: 'One React Native codebase, live in both stores, with loyalty and a wishlist.',
    media: { kind: 'phones', srcs: ['/mobile/grocery-1.webp', '/mobile/grocery-2.webp', '/mobile/grocery-3.webp'], alt: 'Three Viva Fresh store screenshots' },
  },
  'dukagjini-bookstore': {
    name: 'Dukagjini Bookstore',
    did: 'Shop, push deep links and promo checkout',
    scope: 'Mobile',
    accent: '#ef8f80',
    problem: 'A publisher needed a book shop on iOS and Android.',
    result: 'Live in both stores. A push notification opens the right book.',
    media: { kind: 'phones', srcs: ['/mobile/bookstore-1.webp', '/mobile/bookstore-2.webp', '/mobile/bookstore-3.webp'], alt: 'Three Dukagjini Bookstore store screenshots' },
  },
  'chatbot-runtime': {
    name: 'Chatbot runtime',
    did: 'Scripted chats with stall and duplicate guards',
    scope: 'Library',
    accent: '#efb6cf',
    problem: 'Scripted conversations must not hang, repeat or arrive out of order.',
    result: 'A message queue, stall and duplicate guards, and natural typing delays.',
    media: { kind: 'readout', value: 'One script', label: 'text, media, choices, ratings and timers' },
  },
  'chatbot-runtime-web': {
    name: 'Chatbot runtime, web',
    did: 'The chat runtime, ported to TypeScript',
    scope: 'Library',
    accent: '#e6a6c6',
    problem: 'The same scripted chats had to run in the browser.',
    result: 'A TypeScript port with the queue, guards and delays, and an example app.',
    media: { kind: 'readout', value: 'Redux', to: 'Zustand', label: 'same conversations, now on the web' },
  },
  'epub-reader-prototype': {
    name: 'EPUB reader prototype',
    did: 'Download, render and reflow an EPUB',
    scope: 'Mobile',
    accent: '#f3c58e',
    problem: 'The reading app’s reader started as three open questions.',
    result: 'A prototype that downloads, renders and reflows a book. The reader grew from it.',
    media: { kind: 'readout', value: 'EPUB', label: 'downloaded, rendered and resized' },
  },
  'donation-app': {
    name: 'Sadaqah, Islamic Relief USA',
    did: 'Stripe donations, subscriptions and cancelling',
    scope: 'Mobile',
    accent: '#93d4aa',
    problem: 'Donors needed to give, subscribe and cancel inside the app.',
    result: 'Payment and subscription screens on Stripe, badges and the Android builds.',
    media: { kind: 'readout', value: 'Stripe', label: 'donations, subscriptions, cancelling' },
  },
  'coaching-app': {
    name: 'Coaching app',
    did: 'Org sign-in, calendar strip, staged builds',
    scope: 'Mobile',
    accent: '#9ec4ff',
    problem: 'People sign in through their own organization, in one shared app.',
    result: 'Organization sign-in, a daily calendar strip, and three separate builds.',
    media: { kind: 'readout', value: '3 builds', label: 'development, staging and release' },
  },
  'fuel-loyalty-app': {
    name: 'Fuel-station loyalty app',
    did: 'arm64 simulator support and shadow fixes',
    scope: 'Mobile',
    accent: '#f5cf78',
    problem: 'A React Native 0.78 app had to build on arm64 simulators.',
    result: 'arm64 simulator support, the legacy architecture kept, shadows fixed.',
    media: { kind: 'readout', value: 'RN 0.78', label: 'kept building and rendering correctly' },
  },
  'member-portal': {
    name: 'Member portal',
    did: 'Protected routes, external sign-in, app shell',
    scope: 'Web',
    accent: '#aab9ff',
    problem: 'Later screens needed a foundation to build on.',
    result: 'Protected routes, external sign-in, an app shell and layout on Next.js 15.',
    media: { kind: 'readout', value: 'Next.js 15', label: 'protected routes and external sign-in' },
  },
  incentiv: {
    name: 'Incentiv portal',
    did: 'Passkey sign-in, wallet dashboard, EN and FR',
    scope: 'Web',
    accent: '#b7a2ff',
    problem: 'An on-chain wallet had to open with a passkey or an external wallet.',
    result: 'The UI layer, live at portal.incentiv.io, in English and French.',
    media: { kind: 'shot', src: '/showcase/incentiv/web-03.webp', alt: 'Incentiv Portal sign-in with passkey, MetaMask and WalletConnect options' },
  },
  'ai-dashboard': {
    name: 'AI business dashboard',
    did: 'AI headshots and chat over PDFs',
    scope: 'Web',
    accent: '#82cfe6',
    problem: 'Staff needed help with profile photos and long PDF documents.',
    result: 'Headshots from uploaded photos, and a chat that answers from the PDF.',
    media: { kind: 'shot', src: '/signal-posters/ai.avif', alt: 'Document chat: a page with a highlighted paragraph beside a chat that cites page 3', note: recreation },
  },
  offbeat: {
    name: 'OFFBEAT',
    did: '3D speaker and a working drum machine',
    scope: '3D',
    accent: '#ff9a5c',
    problem: 'A fictional speaker brand that has to sound, not only look.',
    result: 'A 3D speaker with an exploded view, and an eight-step Web Audio drum machine.',
    media: { kind: 'shot', src: '/personal/shots/offbeat-home-desktop.webp', alt: 'OFFBEAT home with an orange portable speaker in 3D' },
  },
  form: {
    name: 'FORM',
    did: 'Three WebGL sculptures with live materials',
    scope: '3D',
    accent: '#dba582',
    problem: 'An exhibition of sculptures that exist only in code.',
    result: 'Three forms in copper, chrome and porcelain. A typed word casts its own sculpture.',
    media: { kind: 'shot', src: '/personal/shots/form-home-desktop.webp', alt: 'FORM home with a copper trefoil sculpture' },
  },
  'snaxx-tech': {
    name: 'Snaxx Tech',
    did: 'Images from 972 KB to 337 KB',
    scope: 'Site',
    accent: '#e9c66f',
    problem: 'A studio site with a 3D hero still had to load fast and stay locked down.',
    result: 'Images 972 KB to 337 KB, deploy 28 MB to 9.5 MB, strict CSP.',
    media: { kind: 'shot', src: '/personal/shots/snaxx-desktop.webp', alt: 'Snaxx Tech hero with the Almanac illustrated landscape' },
  },
  offday: {
    name: 'Offday',
    did: 'Multi-tenant time off, 16 security tests',
    scope: 'Web',
    accent: '#92b8ff',
    problem: 'Many teams share one time-off app, and no data may cross teams.',
    result: 'Approvals and a team calendar. 16 Playwright tests cover security and isolation.',
    media: { kind: 'shot', src: '/personal/shots/offday-dark-desktop.webp', alt: 'Offday team calendar in the dark theme with leave bars' },
  },
  'geo-guesser': {
    name: 'Geo Guesser World 3D',
    did: 'Street-view guessing game on Google Play',
    scope: 'Mobile',
    accent: '#7fd6a3',
    problem: 'Guess a place from the street, on a phone, on a real map.',
    result: 'Expo and React Native with MapLibre and Mapillary, on Google Play.',
    media: { kind: 'shot', src: '/mobile/thumbs/geoguesser.webp', alt: 'Geo Guesser map with the guess and the answer joined by a dashed line' },
  },
  fjale: {
    name: 'FJALË',
    did: 'Daily Albanian word game, plays offline',
    scope: 'Game',
    accent: '#f2b357',
    problem: 'A daily Albanian word game that works without a connection.',
    result: 'A web app with a 21,000-word dictionary, an archive and offline play.',
    media: { kind: 'shot', src: '/personal/shots/fjale-desktop.webp', alt: 'FJALË board with the Albanian keyboard' },
  },
  za: {
    name: 'Za!',
    did: 'Server-authoritative card game for 2 to 8',
    scope: 'Game',
    accent: '#ff9f73',
    problem: 'Multiplayer cards for up to eight players, with one source of truth.',
    result: 'A Node server decides every move over WebSockets. Bots fill empty seats.',
    media: { kind: 'shot', src: '/personal/shots/za-desktop.webp', alt: 'Za! lobby with the pixel logo' },
  },
  'morse-trainer': {
    name: 'Morse Trainer',
    did: 'Spaced repetition with Farnsworth timing',
    scope: 'Game',
    accent: '#ffbd55',
    problem: 'Missed letters have to come back sooner than known ones.',
    result: 'Spaced repetition and Farnsworth timing in an amber terminal, live.',
    media: { kind: 'shot', src: '/personal/shots/morse-desktop.webp', alt: 'Morse Trainer amber terminal in Learn mode' },
  },
  futurisma: {
    name: 'Futurisma',
    did: 'Seven circuits with weather, tide, day-night',
    scope: 'Game',
    accent: '#7fdcf5',
    problem: 'Real-time 3D whose light and weather change during a race.',
    result: 'Seven circuits with weather, tide and day-night systems in Three.js.',
    media: { kind: 'readout', value: '7 circuits', label: 'weather, tide and day-night systems' },
  },
  'secret-dictator': {
    name: 'Secret Dictator',
    did: 'Hidden roles against AI opponents in 3D',
    scope: 'Game',
    accent: '#e58585',
    problem: 'A social-deduction game needs opponents worth reading.',
    result: 'AI opponents with hidden roles in a 3D town, in Three.js.',
    media: { kind: 'readout', value: 'Hidden roles', label: 'AI opponents in a 3D town' },
  },
  'open-source-forks': {
    name: 'Open-source forks',
    did: 'Reader libraries kept working on new RN',
    scope: 'Library',
    accent: '#bcd68e',
    problem: 'A production reader depended on two libraries that React Native outgrew.',
    result: 'Maintained forks of epubjs-react-native and react-native-pdf, public.',
    media: { kind: 'readout', value: '2 forks', label: 'epubjs-react-native, react-native-pdf' },
  },
}

export interface Row extends Entry {
  slug: string
  span: [number, number] | null
  project: Project
  featured: boolean
  years: string
  haystack: string
}

export interface Group {
  name: ProjectGroupName
  period: string
  rows: Row[]
}

export const firstYear = 2021
export const lastYear = 2026

const spanOf = (years: string | null): [number, number] | null => {
  const found = years ? /^(\d{4})(?:–(\d{2}))?$/.exec(years) : null
  if (!found) return null
  const start = Number(found[1])
  return [start, found[2] ? 2000 + Number(found[2]) : start]
}

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

/** Years are shown with a hyphen: the page sets no en dash. */
const plainYears = (years: string | null) => (years ? years.replace('–', '-') : '-')

export const rows: Row[] = projects.map((project) => {
  const entry = entries[project.slug]
  if (!entry) throw new Error(`orbit-index: no entry for ${project.slug}`)
  return {
    ...entry,
    slug: project.slug,
    project,
    featured: Boolean(project.featured),
    years: plainYears(project.years),
    span: spanOf(project.years),
    haystack: fold([entry.name, entry.did, entry.scope, project.kind, project.group, project.years ?? '', ...project.stack].join(' ')),
  }
})

const order: ProjectGroupName[] = ['Vianova', 'Agency work', 'Incentiv', 'AvahiTech', 'Personal']

export const groups: Group[] = order.map((name) => ({
  name,
  period: plainYears(groupPeriods[name] ?? '2022–26'),
  rows: rows.filter((row) => row.project.group === name),
}))

export const match = (row: Row, query: string) => {
  const words = fold(query).split(/\s+/).filter(Boolean)
  return words.every((word) => row.haystack.includes(word))
}
