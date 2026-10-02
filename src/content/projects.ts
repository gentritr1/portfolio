import type { ThumbKind } from '../components/Thumb'
import type { WorldId } from '../lib/worlds'

export type ProjectGroupName = 'Vianova' | 'Agency work' | 'Incentiv' | 'AvahiTech' | 'Personal'

export interface PublicLink {
  label: 'Website' | 'App Store' | 'Google Play' | 'Portal' | 'Docs' | 'App Store (archived)' | 'Google Play (archived)'
  href: string
}

/** The section id a row links to: a world, or the personal projects section. */
export type WorldKey = WorldId | 'personal'

export interface Project {
  group: ProjectGroupName
  name: string
  /** Null when CONTENT.md gives no years. */
  years: string | null
  role: string
  stack: string[]
  line: string
  world?: WorldKey
  /** Stylized mini-screen at the row start. Its accent follows `world`; other rows use the neutral accent. */
  thumb?: ThumbKind
  /** Real capture from the owner's own site or a public store page, shown in place of `thumb`. */
  shot?: { src: string; alt: string }
  /** Public pages of the product: its website, store listings, or archived store listings. */
  links?: PublicLink[]
}

export interface ProjectGroup {
  name: ProjectGroupName
  period?: string
  projects: Project[]
}

export const projects: Project[] = [
  {
    group: 'Vianova',
    name: 'Care-management platform, React rewrite',
    years: '2026',
    role: 'Frontend',
    stack: ['React 19', 'TypeScript', 'TanStack', 'Zod', 'Vitest', 'Playwright'],
    line: 'Route-by-route move from Nuxt 2 to React with parity tests, 31 ADRs, CI gates',
    world: 'healthcare',
    thumb: 'dashboard-vitals',
  },
  {
    group: 'Vianova',
    name: 'Care-management platform, Vue app',
    years: '2023 – 2026',
    role: 'Frontend',
    stack: ['Nuxt 2', 'Vue 2', 'Vuex', 'ECharts', 'Twilio', 'Chime'],
    line: 'Remote patient care: profiles, care plans, claims, vitals and labs, calls, 4 locales',
    world: 'healthcare',
    thumb: 'care-plan',
  },
  {
    group: 'Vianova',
    name: 'Care-management API',
    years: '2026',
    role: 'Full stack',
    stack: ['Laravel 13', 'PHP 8.3', 'MySQL', 'Redis', 'Pest'],
    line: 'Laravel API for enrollment drafts, a lab catalog, multi-tenant security and fast reports',
    world: 'healthcare',
    thumb: 'api-terminal',
  },
  {
    group: 'Vianova',
    name: 'Design system, React',
    years: '2026',
    role: 'Design system',
    stack: ['React 19', 'CSS Modules', 'Storybook', 'Changesets'],
    line: '34 accessible components (WCAG 2.1 AA) in a typed package on GitHub Packages',
    thumb: 'component-sheet',
  },
  {
    group: 'Vianova',
    name: 'Design system, Vue',
    years: '2026',
    role: 'Design system',
    stack: ['Vue 2', 'Style Dictionary', 'Histoire', 'Playwright'],
    line: 'Design tokens from Figma, codemods, visual regression tests and a health dashboard',
    thumb: 'tokens',
  },
  {
    group: 'Vianova',
    name: 'Design dashboard (prototype)',
    years: '2026',
    role: 'Frontend',
    stack: ['React 19', 'Vite', 'Tailwind 4'],
    line: 'Call-activity screen on the design system with demo data, as a design reference',
  },
  {
    group: 'Agency work',
    name: 'Bayyinah TV · video-learning platform',
    years: '2023 – 2026',
    role: 'Frontend',
    stack: ['Nuxt 3', 'Vue 3', 'Pinia', 'video.js', 'AWS IVS', 'Pusher', 'Stripe'],
    line: 'Full Nuxt 3 rebuild: live streams, HLS player, subscriptions, gifting, English/Arabic',
    world: 'streaming',
    thumb: 'player-chat',
    links: [
      { label: 'Website', href: 'https://bayyinahtv.com/' },
      {
        label: 'App Store',
        href: 'https://apps.apple.com/us/app/bayyinah-tv/id1530635769',
      },
      {
        label: 'Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah',
      },
    ],
  },
  {
    group: 'Agency work',
    name: 'Bayyinah · institute website',
    years: '2024 – 2025',
    role: 'Frontend',
    stack: ['React'],
    line: 'Public website of the institute: programs, courses and content pages',
    thumb: 'portal-shell',
    links: [{ label: 'Website', href: 'https://www.bayyinah.org/' }],
  },
  {
    group: 'Agency work',
    name: "Read to Feed · children's reading app",
    years: '2022 – 2025',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'Firebase', 'Vision Camera', 'epub.js'],
    line: 'PDF/EPUB reader, barcode scanning, gamification, about 14 releases, RN 0.63 → 0.81',
    world: 'reading',
    shot: {
      src: '/mobile/thumbs/reading.webp',
      alt: 'Read to Feed store screenshot: My Books list with reading progress',
    },
    links: [
      {
        label: 'App Store (archived)',
        href: 'http://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765',
      },
      {
        label: 'Google Play (archived)',
        href: 'http://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf',
      },
    ],
  },
  {
    group: 'Agency work',
    name: 'Dukagjini Bookstore · bookstore app',
    years: '2021 – 2022',
    role: 'Mobile',
    stack: ['React Native', 'Redux', 'Firebase Messaging'],
    line: 'Book shopping with push deep links, animated details and checkout; iOS and Android',
    world: 'reading',
    shot: {
      src: '/mobile/thumbs/bookstore.webp',
      alt: 'Dukagjini Bookstore store screenshot: foreign books list with ratings and prices',
    },
    links: [
      {
        label: 'App Store',
        href: 'https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342',
      },
      {
        label: 'Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks',
      },
    ],
  },
  {
    group: 'Agency work',
    name: 'Chatbot runtime library',
    years: '2022 – 2025',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit'],
    line: 'Plays scripted chat conversations: message queue, typing delays, media, duplicate guards',
    world: 'reading',
    thumb: 'chat-choices',
  },
  {
    group: 'Agency work',
    name: 'Chatbot runtime, web port',
    years: '2025',
    role: 'Frontend',
    stack: ['React 19', 'TypeScript', 'Vite', 'Zustand'],
    line: 'TypeScript web version of the chatbot runtime, with an example app',
  },
  {
    group: 'Agency work',
    name: 'EPUB reader prototype',
    years: '2022',
    role: 'Mobile',
    stack: ['React Native', 'epub.js'],
    line: "Downloads, renders and resizes an EPUB; the start of the reading app's reader",
  },
  {
    group: 'Agency work',
    name: 'Donation and good-deeds app',
    years: '2021 – 2022',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'Stripe', 'Firebase'],
    line: 'Donations and subscriptions with Stripe, badges, guided tasks and video',
    thumb: 'donation-ring',
  },
  {
    group: 'Agency work',
    name: 'Coaching app',
    years: '2022 – 2023',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'React Navigation'],
    line: 'Organization sign-in, a daily calendar strip, reactions, and dev, staging and release builds',
    thumb: 'calendar-strip',
  },
  {
    group: 'Agency work',
    name: 'Member portal, web',
    years: '2025',
    role: 'Frontend',
    stack: ['Next.js 15', 'TypeScript', 'RTK Query', 'next-intl', 'Pusher'],
    line: 'Member portal foundation: protected routes, external sign-in, app shell and layout',
    thumb: 'portal-shell',
  },
  {
    group: 'Agency work',
    name: 'Viva Fresh · grocery and loyalty app',
    years: '2023',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'Maps', 'Firebase'],
    line: 'Online grocery orders with delivery slots, loyalty, wishlist and address search on a map',
    world: 'reading',
    shot: {
      src: '/mobile/thumbs/grocery.webp',
      alt: 'Viva Fresh store screenshot: home with product categories, Albanian interface',
    },
    links: [
      {
        label: 'App Store',
        href: 'https://apps.apple.com/us/app/viva-fresh/id1580739480',
      },
      {
        label: 'Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.zs.vivafresh',
      },
    ],
  },
  {
    group: 'Agency work',
    name: 'Fuel-station loyalty app',
    years: '2026',
    role: 'Mobile',
    stack: ['React Native 0.78'],
    line: 'Loyalty app upkeep: arm64 simulator support, legacy architecture, shadow fixes',
  },
  {
    group: 'Incentiv',
    name: 'Incentiv · smart-wallet dashboard',
    years: '2024',
    role: 'Frontend',
    stack: ['Next.js 14', 'RTK Query', 'next-intl', 'Framer Motion'],
    line: 'Wallet dashboard with passkey sign-in, balance and QR, onboarding, EN/FR',
    world: 'web3',
    thumb: 'wallet-card',
    links: [
      { label: 'Website', href: 'https://incentiv.io/' },
      { label: 'Portal', href: 'https://portal.incentiv.io/' },
    ],
  },
  {
    group: 'AvahiTech',
    name: 'Smart business dashboard with AI',
    years: null,
    role: 'Frontend · FastAPI',
    stack: ['React', 'Python/FastAPI'],
    line: 'Business dashboard with AI headshot generation and a PDF-to-chat assistant',
    world: 'ai',
    thumb: 'doc-chat',
  },
  {
    group: 'Personal',
    name: 'Studio website',
    years: '2026',
    role: 'Owner',
    stack: ['React 19', 'Vite', 'three.js', 'Tailwind'],
    line: '3D hero, cinemagraph loop and strict CSP; images 972 KB → 337 KB',
    world: 'personal',
    shot: {
      src: '/personal/shots/thumbs/snaxx.webp',
      alt: 'Snaxx Tech studio site hero, The Snaxx Almanac illustrated landscape',
    },
    links: [{ label: 'Website', href: 'https://www.snaxxtech.com/' }],
  },
  {
    group: 'Personal',
    name: 'Time-off app',
    years: '2026',
    role: 'Owner',
    stack: ['Next.js 16', 'SQLite', 'Zod', 'Playwright'],
    line: 'Multi-tenant time off with approvals, team calendar, AI assistant, 16 security tests',
    world: 'personal',
    shot: {
      src: '/personal/shots/thumbs/offday-app.webp',
      alt: 'Offday team calendar with October leave bars and approval queue',
    },
  },
  {
    group: 'Personal',
    name: 'Geo Guesser World 3D',
    years: '2026',
    role: 'Mobile · co-built',
    stack: ['Expo', 'React Native', 'MapLibre', 'Mapillary', 'Zustand'],
    line: 'Street-view guessing game, published on Google Play',
    shot: {
      src: '/mobile/thumbs/geoguesser.webp',
      alt: 'Geo Guesser store screenshot: dark map with the guess and the answer joined by a dashed line',
    },
    links: [
      {
        label: 'Google Play',
        href: 'https://play.google.com/store/apps/details?id=com.snaxxtech.geoguesser',
      },
    ],
  },
  {
    group: 'Personal',
    name: 'FJALË',
    years: '2026',
    role: 'Owner',
    stack: ['Vanilla JS', 'PWA'],
    line: 'Daily Albanian word game, 21k-word dictionary, archive, offline play; live on the web',
    shot: {
      src: '/personal/shots/thumbs/fjale.webp',
      alt: 'FJALË word game board with Albanian keyboard',
    },
    links: [{ label: 'Website', href: 'https://xn--fjal-opa.com/' }],
  },
  {
    group: 'Personal',
    name: 'Za!',
    years: '2026',
    role: 'Owner',
    stack: ['Node', 'WebSocket'],
    line: 'Multiplayer pizza card game for 2–8 players, server-authoritative with bots; live',
    shot: {
      src: '/personal/shots/thumbs/za.webp',
      alt: 'Za! card game lobby with pixel logo',
    },
    links: [{ label: 'Website', href: 'https://za-game.onrender.com/' }],
  },
  {
    group: 'Personal',
    name: 'Morse Trainer',
    years: '2026',
    role: 'Owner',
    stack: ['JavaScript'],
    line: 'Morse-code learning game with spaced repetition and Farnsworth timing; live',
    shot: {
      src: '/personal/shots/thumbs/morse.webp',
      alt: 'Morse Trainer amber terminal in Learn mode',
    },
    links: [{ label: 'Website', href: 'https://morse-code-amber.vercel.app/' }],
  },
  {
    group: 'Personal',
    name: 'Futurisma',
    years: '2026',
    role: 'Owner',
    stack: ['Three.js', 'TypeScript', 'Vite', 'Blender'],
    line: 'Hover racer with seven circuits and weather, tide and day-night systems',
    thumb: 'track',
  },
  {
    group: 'Personal',
    name: 'Secret Dictator',
    years: '2026',
    role: 'Owner',
    stack: ['Three.js', 'TypeScript'],
    line: 'Single-player social-deduction game against AI opponents in a 3D town',
    thumb: 'town',
  },
  {
    group: 'Personal',
    name: 'Open-source forks',
    years: '2022',
    role: 'Maintainer',
    stack: ['React Native'],
    line: 'Forks of epubjs-react-native and react-native-pdf, used in a production reading app',
    world: 'personal',
    thumb: 'fork',
    links: [{ label: 'Website', href: 'https://github.com/gentritr1' }],
  },
]

const periods: Record<ProjectGroupName, string | undefined> = {
  Vianova: '(2021 – present)',
  'Agency work': '(2021 – 2026)',
  Incentiv: '(2024)',
  AvahiTech: '(freelance)',
  Personal: undefined,
}

const order: ProjectGroupName[] = ['Vianova', 'Agency work', 'Incentiv', 'AvahiTech', 'Personal']

export const projectGroups: ProjectGroup[] = order.map((name) => ({
  name,
  period: periods[name],
  projects: projects.filter((project) => project.group === name),
}))

export const firstYear = 2021
export const currentYear = 2026
