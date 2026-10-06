import { projects, groupPeriods, type Project, type ProjectGroupName, type PublicLink, type RecreationKey } from '../../content/projects'

export type TenantId = 'vianova' | 'agency-work' | 'incentiv' | 'avahitech' | 'personal'

export type Scope = 'Web' | 'API' | 'System' | 'Mobile' | 'Site' | 'Library' | 'Game' | '3D'

export type Proof =
  | { kind: 'recreation'; key: RecreationKey; hint: string }
  | { kind: 'web'; src: string; alt: string }
  | { kind: 'small'; src: string; alt: string }
  | { kind: 'phones'; srcs: string[]; alt: string }
  | { kind: 'readout'; from: string; to: string; label: string }
  | { kind: 'none' }

interface Entry {
  name: string
  outcome: string
  scope: Scope
  problem: string
  result: string
  proof: Proof
}

const entries: Record<string, Entry> = {
  'care-platform': {
    name: 'Care-management platform',
    outcome: 'Vue to React, one route at a time, parity-tested',
    scope: 'Web',
    problem: 'A live multi-tenant care platform had to leave Vue without losing a behaviour.',
    result: 'A route moves to React only after its parity test passes against both apps. Most screens are rebuilt.',
    proof: { kind: 'recreation', key: 'care', hint: 'Switch the organization in the card. The patient, the data and the timezone change; the controls stay.' },
  },
  'care-api': {
    name: 'Care-management API',
    outcome: 'One billing report from 16 queries to 2',
    scope: 'API',
    problem: 'One billing report ran 16 queries and timed out.',
    result: 'It runs 2 queries and no longer times out. Security fixes keep each organization out of the others’ responses.',
    proof: { kind: 'readout', from: '16', to: '2', label: 'queries in one billing report' },
  },
  'design-system-react': {
    name: 'Design System v2',
    outcome: '36 components, 805 tokens, 20 releases',
    scope: 'System',
    problem: 'A new React dashboard needed one accessible base, from tokens to controls.',
    result: '36 components in 20 releases in about six weeks, to WCAG 2.1 AA floors. A Button-only consumer loads 96.6% less JavaScript.',
    proof: { kind: 'recreation', key: 'design-system', hint: 'An invented kit built the same way: three token tiers under every control.' },
  },
  'design-system-vue': {
    name: 'Design system, Vue',
    outcome: 'Figma tokens, codemods and visual tests',
    scope: 'System',
    problem: 'The Vue app had to stay in step with the design files.',
    result: 'Tokens come from Figma through Style Dictionary. Codemods move screens over, and a dashboard shows adoption.',
    proof: { kind: 'none' },
  },
  'design-dashboard': {
    name: 'Design dashboard',
    outcome: 'A product screen as a design reference',
    scope: 'Web',
    problem: 'Designers and engineers had to review a screen without a backend or patient data.',
    result: 'The call-activity screen, rebuilt on the design system with demo data.',
    proof: { kind: 'none' },
  },
  'bayyinah-tv': {
    name: 'Bayyinah TV',
    outcome: 'Full Nuxt 3 rebuild with live streams and a paywall',
    scope: 'Web',
    problem: 'A video-learning platform needed a second version with live streams and subscriptions.',
    result: 'A rebuild from an empty template: 34 routes, 270+ components, English and Arabic. Live on the web and in both stores.',
    proof: { kind: 'web', src: '/showcase/bayyinah/web-01.webp', alt: 'Bayyinah TV landing page: "Quran Studies Made Simple" with the app on a laptop, a monitor and phones' },
  },
  'bayyinah-institute': {
    name: 'Bayyinah institute site',
    outcome: 'One-page Next.js site, from mission to FAQ',
    scope: 'Site',
    problem: 'The institute needed one public page for its mission, research funding and donations.',
    result: 'A one-page Next.js site, live at bayyinah.org, on phones and desktops.',
    proof: { kind: 'web', src: '/showcase/bayyinah/org-01.webp', alt: 'Bayyinah Foundation home: "Help Us Spread Quranic Knowledge" with a Join the Mission button' },
  },
  'read-to-feed': {
    name: 'Read to Feed',
    outcome: 'About 14 store releases, React Native 0.63 to 0.81',
    scope: 'Mobile',
    problem: 'A children’s reading app had to keep shipping while React Native moved on.',
    result: 'About 14 releases to both stores through three major upgrades, with a PDF and EPUB reader and a barcode scanner.',
    proof: { kind: 'phones', srcs: ['/mobile/reading-1.webp', '/mobile/reading-2.webp', '/mobile/reading-3.webp'], alt: 'Read to Feed store screenshots: My Books, achievements and the reader' },
  },
  'viva-fresh': {
    name: 'Viva Fresh',
    outcome: 'Grocery orders with delivery slots and loyalty',
    scope: 'Mobile',
    problem: 'Shoppers needed grocery orders with a delivery slot, on both phones.',
    result: 'One React Native app, live in both stores, with loyalty, a wishlist and address search on a map.',
    proof: { kind: 'phones', srcs: ['/mobile/grocery-1.webp', '/mobile/grocery-2.webp', '/mobile/grocery-3.webp'], alt: 'Viva Fresh store screenshots: home, the Fresh category and the cart' },
  },
  'dukagjini-bookstore': {
    name: 'Dukagjini Bookstore',
    outcome: 'Book shop where a push opens the right book',
    scope: 'Mobile',
    problem: 'A publisher needed a book shop on iOS and Android.',
    result: 'Live in both stores, with promo checkout. A push notification opens the right screen through a deep link.',
    proof: { kind: 'phones', srcs: ['/mobile/bookstore-1.webp', '/mobile/bookstore-2.webp', '/mobile/bookstore-3.webp'], alt: 'Dukagjini Bookstore store screenshots: home, foreign books and favourites' },
  },
  'chatbot-runtime': {
    name: 'Chatbot runtime',
    outcome: 'Scripted chats that never hang or repeat',
    scope: 'Library',
    problem: 'Scripted conversations must not hang, repeat or arrive out of order.',
    result: 'A message queue, stall and duplicate guards, and natural typing delays. An app supplies a script and gets a full chat.',
    proof: { kind: 'none' },
  },
  'chatbot-runtime-web': {
    name: 'Chatbot runtime, web',
    outcome: 'The same chat runtime, ported to the browser',
    scope: 'Library',
    problem: 'The same scripted conversations had to run on the web.',
    result: 'A TypeScript port with the queue, the guards and the delays, Zustand in place of Redux, and an example app.',
    proof: { kind: 'none' },
  },
  'epub-reader-prototype': {
    name: 'EPUB reader prototype',
    outcome: 'Download, render and reflow a book',
    scope: 'Mobile',
    problem: 'The reading app’s reader started as three open questions.',
    result: 'A prototype that downloads, renders and reflows an EPUB. The full reader grew from it.',
    proof: { kind: 'none' },
  },
  'donation-app': {
    name: 'Sadaqah, Islamic Relief USA',
    outcome: 'Stripe donations, subscriptions and cancelling',
    scope: 'Mobile',
    problem: 'Donors needed to give, subscribe and cancel inside the app.',
    result: 'Payment and subscription screens on Stripe, badges, in-app web views and the Android builds.',
    proof: { kind: 'none' },
  },
  'coaching-app': {
    name: 'Coaching app',
    outcome: 'Organization sign-in and three separate builds',
    scope: 'Mobile',
    problem: 'People sign in through their own organization, in one shared app.',
    result: 'Organization sign-in, a daily calendar strip, reactions, and development, staging and release builds.',
    proof: { kind: 'none' },
  },
  'fuel-loyalty-app': {
    name: 'Fuel-station loyalty app',
    outcome: 'arm64 simulator support and shadow fixes',
    scope: 'Mobile',
    problem: 'A React Native 0.78 app had to build on arm64 simulators.',
    result: 'arm64 simulator support, the legacy architecture kept, and shadows that render correctly.',
    proof: { kind: 'none' },
  },
  'member-portal': {
    name: 'Member portal',
    outcome: 'Protected routes, external sign-in, app shell',
    scope: 'Web',
    problem: 'Later screens needed a foundation to build on.',
    result: 'Protected routes, sign-in through an external identity provider, and an app shell on Next.js 15.',
    proof: { kind: 'none' },
  },
  incentiv: {
    name: 'Incentiv portal',
    outcome: 'Passkey sign-in and a wallet dashboard, EN and FR',
    scope: 'Web',
    problem: 'An on-chain wallet had to open with a passkey or an external wallet.',
    result: 'The UI layer of the portal: sign-in, onboarding, dashboard cards and a QR balance, live in English and French.',
    proof: { kind: 'web', src: '/showcase/incentiv/web-03.webp', alt: 'Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview' },
  },
  'ai-dashboard': {
    name: 'AI business dashboard',
    outcome: 'AI headshots and a chat that answers from PDFs',
    scope: 'Web',
    problem: 'Staff needed help with profile photos and long PDF documents.',
    result: 'Headshots from uploaded photos, and a chat that answers from the uploaded PDF. Some backend in FastAPI.',
    proof: { kind: 'recreation', key: 'doc-chat', hint: 'Ask about the page. The answer cites where it found it.' },
  },
  offbeat: {
    name: 'OFFBEAT',
    outcome: 'A 3D speaker with a working drum machine',
    scope: '3D',
    problem: 'A fictional speaker brand that has to sound, not only look.',
    result: 'A 3D speaker with an exploded view, and an eight-step Web Audio drum machine.',
    proof: { kind: 'web', src: '/personal/shots/offbeat-home-desktop.webp', alt: 'OFFBEAT home: a hot-orange portable speaker in 3D' },
  },
  form: {
    name: 'FORM',
    outcome: 'Three WebGL sculptures with live materials',
    scope: '3D',
    problem: 'An exhibition of sculptures that exist only in code.',
    result: 'Three forms in copper, chrome and porcelain. A typed word casts its own sculpture.',
    proof: { kind: 'web', src: '/personal/shots/form-home-desktop.webp', alt: 'FORM home: a copper trefoil sculpture beside the title Objects of imagination' },
  },
  'snaxx-tech': {
    name: 'Snaxx Tech',
    outcome: 'Images from 972 KB to 337 KB, strict CSP',
    scope: 'Site',
    problem: 'A studio site with a 3D hero still had to load fast and stay locked down.',
    result: 'Images 972 KB to 337 KB, the deploy 28 MB to 9.5 MB, under a strict content security policy.',
    proof: { kind: 'web', src: '/personal/shots/snaxx-desktop.webp', alt: 'Snaxx Tech hero with the Almanac illustrated landscape' },
  },
  offday: {
    name: 'Offday',
    outcome: 'Multi-tenant time off, about 200 tests',
    scope: 'Web',
    problem: 'Many teams share one time-off app, and no data may cross teams.',
    result: 'Approvals and a team calendar. About 200 Playwright tests cover security and tenant isolation.',
    proof: { kind: 'web', src: '/personal/shots/offday-app-desktop.webp', alt: 'Offday team calendar with October leave bars and the approval queue' },
  },
  'geo-guesser': {
    name: 'Geo Guesser World 3D',
    outcome: 'Street-view guessing game on Google Play',
    scope: 'Mobile',
    problem: 'Guess a place from the street, on a phone, on a real map.',
    result: 'Expo and React Native with MapLibre and Mapillary, co-built and published on Google Play.',
    proof: { kind: 'small', src: '/mobile/thumbs/geoguesser.webp', alt: 'Geo Guesser store screenshot: dark map with the guess and the answer joined by a dashed line' },
  },
  fjale: {
    name: 'FJALË',
    outcome: 'Daily Albanian word game that plays offline',
    scope: 'Game',
    problem: 'A daily Albanian word game that works without a connection.',
    result: 'A 21,000-word dictionary, an archive and offline play. Live on the web.',
    proof: { kind: 'web', src: '/personal/shots/fjale-desktop.webp', alt: 'FJALË board with the Albanian keyboard' },
  },
  za: {
    name: 'Za!',
    outcome: 'Server-authoritative card game for 2 to 8',
    scope: 'Game',
    problem: 'Multiplayer cards for up to eight players, with one source of truth.',
    result: 'A Node server decides every move over WebSockets. Bots fill empty seats. Live.',
    proof: { kind: 'web', src: '/personal/shots/za-desktop.webp', alt: 'Za! card game lobby with the pixel logo' },
  },
  'morse-trainer': {
    name: 'Morse Trainer',
    outcome: 'Spaced repetition with Farnsworth timing',
    scope: 'Game',
    problem: 'Missed letters have to come back sooner than known ones.',
    result: 'Spaced repetition and Farnsworth timing in an amber terminal. Live.',
    proof: { kind: 'web', src: '/personal/shots/morse-desktop.webp', alt: 'Morse Trainer amber terminal in Learn mode' },
  },
  futurisma: {
    name: 'Futurisma',
    outcome: 'Seven circuits with weather, tide and day-night',
    scope: 'Game',
    problem: 'Real-time 3D whose light and weather change during a race.',
    result: 'Seven circuits in Three.js, with weather, tide and day-night systems.',
    proof: { kind: 'none' },
  },
  'secret-dictator': {
    name: 'Secret Dictator',
    outcome: 'Hidden roles against AI opponents in 3D',
    scope: 'Game',
    problem: 'A social-deduction game needs opponents worth reading.',
    result: 'AI opponents with hidden roles in a 3D town, in Three.js.',
    proof: { kind: 'none' },
  },
  'open-source-forks': {
    name: 'Open-source forks',
    outcome: 'Two reader libraries kept working on new React Native',
    scope: 'Library',
    problem: 'A production reader depended on two libraries that React Native outgrew.',
    result: 'Maintained forks of epubjs-react-native and react-native-pdf, public on GitHub.',
    proof: { kind: 'none' },
  },
}

export interface Row extends Entry {
  slug: string
  years: string
  kind: string
  role: string
  links: PublicLink[]
  hasCase: boolean
  haystack: string
}

interface TenantCopy {
  id: TenantId
  group: ProjectGroupName
  mark: string
  accent: string
  role: string
  summary: string
}

export interface Tenant extends TenantCopy {
  period: string
  rows: Row[]
}

const tenantCopy: TenantCopy[] = [
  {
    id: 'vianova',
    group: 'Vianova',
    mark: 'VN',
    accent: '#0b7a70',
    role: 'Frontend and mobile, full stack since 2026',
    summary: 'A multi-tenant care platform for remote patient monitoring: its React rebuild, its API and its design systems.',
  },
  {
    id: 'agency-work',
    group: 'Agency work',
    mark: 'AG',
    accent: '#a35200',
    role: 'Mobile and frontend, core team',
    summary: 'Client products on the web and in both app stores: video learning, reading, grocery, books and donations.',
  },
  {
    id: 'incentiv',
    group: 'Incentiv',
    mark: 'IN',
    accent: '#5b45e0',
    role: 'Frontend, UI layer',
    summary: 'The interface of a smart-wallet portal. Teammates built the wallet and blockchain layer.',
  },
  {
    id: 'avahitech',
    group: 'AvahiTech',
    mark: 'AV',
    accent: '#1f5fd1',
    role: 'Frontend, some FastAPI',
    summary: 'Freelance: a business dashboard with two AI features for a digital-transformation client.',
  },
  {
    id: 'personal',
    group: 'Personal',
    mark: 'GR',
    accent: '#c43d16',
    role: 'Owner: design, code and release',
    summary: 'Own products, live on the web and on Google Play: games, tools and concept sites.',
  },
]

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()

const toRow = (project: Project): Row => {
  const entry = entries[project.slug]
  if (!entry) throw new Error(`tenant-switch: no entry for ${project.slug}`)
  return {
    ...entry,
    slug: project.slug,
    years: project.years ?? '—',
    kind: project.kind,
    role: project.role,
    links: project.links,
    hasCase: Boolean(project.featured),
    haystack: fold([entry.name, entry.outcome, entry.scope, project.kind, project.group, ...project.stack].join(' ')),
  }
}

function periodOf(group: ProjectGroupName, rows: Project[]) {
  const known = groupPeriods[group]
  if (known) return known
  const years = rows.flatMap((p) => (p.years ? p.years.match(/\d{2,4}/g) ?? [] : [])).map((y) => (y.length === 2 ? 2000 + Number(y) : Number(y)))
  const first = Math.min(...years)
  const last = Math.max(...years)
  return first === last ? String(first) : `${first}–${String(last).slice(2)}`
}

export const tenants: Tenant[] = tenantCopy.map((copy) => {
  const members = projects.filter((p) => p.group === copy.group)
  return { ...copy, period: periodOf(copy.group, members), rows: members.map(toRow) }
})

export const totalProjects = tenants.reduce((sum, t) => sum + t.rows.length, 0)

export const tenantById = (id: string | null) => tenants.find((t) => t.id === id) ?? tenants[0]

export const matches = (haystack: string, query: string) => {
  const words = fold(query).split(/\s+/).filter(Boolean)
  return words.every((word) => haystack.includes(word))
}

export const tenantHaystack = (t: Tenant) => fold([t.group, t.role, t.summary].join(' '))
