import type { WorldId } from '../lib/worlds'

export type ProjectGroupName = 'Vianova' | 'Incentiv' | 'AvahiTech' | 'Personal'

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
    line: 'Route-by-route migration from Nuxt 2 with parity tests, 31 ADRs, CI gates',
    world: 'healthcare',
  },
  {
    group: 'Vianova',
    name: 'Care-management platform, Vue app',
    years: '2023 – 2026',
    role: 'Frontend',
    stack: ['Nuxt 2', 'Vue 2', 'Vuex', 'ECharts', 'Twilio', 'Chime'],
    line: 'Patient profile, care plans, claims, vitals and labs, calls, timezone fixes, 4 locales',
    world: 'healthcare',
  },
  {
    group: 'Vianova',
    name: 'Care-management API',
    years: '2026',
    role: 'Full stack',
    stack: ['Laravel 13', 'PHP 8.3', 'MySQL', 'Redis', 'Pest'],
    line: 'Enrollment drafts, lab catalog, multi-tenant fixes, report performance, 70 test files',
    world: 'healthcare',
  },
  {
    group: 'Vianova',
    name: 'Design system, React',
    years: '2026',
    role: 'Design system',
    stack: ['React 19', 'CSS Modules', 'Storybook', 'Changesets'],
    line: '34 components, WCAG 2.1 AA contrast matrix, typed package, GitHub Packages releases',
  },
  {
    group: 'Vianova',
    name: 'Design system, Vue',
    years: '2026',
    role: 'Design system',
    stack: ['Vue 2', 'Style Dictionary', 'Histoire', 'Playwright'],
    line: 'Tokens from Figma, codemods, visual regression, health dashboard',
  },
  {
    group: 'Vianova',
    name: 'Design dashboard (prototype)',
    years: '2026',
    role: 'Frontend',
    stack: ['React 19', 'Vite', 'Tailwind 4'],
    line: 'Call-activity screen on the design system with demo data; the design oracle for the rewrite',
  },
  {
    group: 'Vianova',
    name: 'Video-learning platform, web',
    years: '2023 – 2026',
    role: 'Frontend',
    stack: ['Nuxt 3', 'Vue 3', 'Pinia', 'video.js', 'AWS IVS', 'Pusher', 'Stripe'],
    line: 'Full rebuild on Nuxt 3; live streams, player, subscriptions, gifting, EN/AR',
    world: 'streaming',
  },
  {
    group: 'Vianova',
    name: "Children's reading app",
    years: '2022 – 2025',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'Firebase', 'Vision Camera', 'epub.js'],
    line: 'PDF/EPUB reader, barcode scanning, gamification, ~14 releases, RN 0.63 → 0.81',
    world: 'reading',
  },
  {
    group: 'Vianova',
    name: 'Bookstore app',
    years: '2021 – 2022',
    role: 'Mobile',
    stack: ['React Native', 'Redux', 'Firebase Messaging'],
    line: 'Push notifications with deep links, animated details, checkout; iOS + Android',
    world: 'reading',
  },
  {
    group: 'Vianova',
    name: 'Chatbot runtime library',
    years: '2022 – 2025',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit'],
    line: 'Message queue, stall and duplicate guards, typing delays, media items',
    world: 'reading',
  },
  {
    group: 'Vianova',
    name: 'Chatbot runtime, web port',
    years: '2025',
    role: 'Frontend',
    stack: ['React 19', 'TypeScript', 'Vite', 'Zustand'],
    line: 'Library plus example app, moved to TypeScript',
  },
  {
    group: 'Vianova',
    name: 'EPUB reader prototype',
    years: '2022',
    role: 'Mobile',
    stack: ['React Native', 'epub.js'],
    line: "Download, render and resize an EPUB; the seed of the reading app's reader",
  },
  {
    group: 'Vianova',
    name: 'Donation and good-deeds app',
    years: '2021 – 2022',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'Stripe', 'Firebase'],
    line: 'Sign-up and account flows, Stripe donations and subscriptions, badges, video tasks; iOS + Android',
  },
  {
    group: 'Vianova',
    name: 'Coaching app',
    years: '2022 – 2023',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'React Navigation'],
    line: 'Project setup, login flow with an organization step, daily calendar strip, reactions, dev/staging/release builds',
  },
  {
    group: 'Vianova',
    name: 'Member portal, web',
    years: '2025',
    role: 'Frontend',
    stack: ['Next.js 15', 'TypeScript', 'RTK Query', 'next-intl', 'Pusher'],
    line: 'Project foundation, route-protection middleware, external auth flow, app shell and layout',
  },
  {
    group: 'Vianova',
    name: 'Fuel-station loyalty app',
    years: '2026',
    role: 'Mobile',
    stack: ['React Native 0.78'],
    line: 'arm64 simulator support, legacy architecture, shadow fixes',
  },
  {
    group: 'Incentiv',
    name: 'Smart-wallet dashboard',
    years: '2024',
    role: 'Frontend',
    stack: ['Next.js 14', 'RTK Query', 'next-intl', 'Framer Motion'],
    line: 'Dashboard cards, balance popup with QR, onboarding, routing middleware, EN/FR',
    world: 'web3',
  },
  {
    group: 'AvahiTech',
    name: 'Smart business dashboard with AI',
    years: null,
    role: 'Frontend · FastAPI',
    stack: ['React', 'Python/FastAPI'],
    line: 'Headshot generation, PDF-to-chat assistant',
    world: 'ai',
  },
  {
    group: 'Personal',
    name: 'Studio website',
    years: '2026',
    role: 'Owner',
    stack: ['React 19', 'Vite', 'three.js', 'Tailwind'],
    line: '3D hero, cinemagraph loop, strict CSP; images 972 KB → 337 KB',
    world: 'personal',
  },
  {
    group: 'Personal',
    name: 'Time-off app',
    years: '2026',
    role: 'Owner',
    stack: ['Next.js 16', 'SQLite', 'Zod', 'Playwright'],
    line: 'Multi-tenant PTO with approvals, calendar, streaming assistant, 16 security tests',
    world: 'personal',
  },
  {
    group: 'Personal',
    name: 'Geo Guesser World 3D',
    years: '2026',
    role: 'Mobile · co-built',
    stack: ['Expo', 'React Native', 'MapLibre', 'Mapillary', 'Zustand'],
    line: 'Street-view guessing game, published on Google Play',
  },
  {
    group: 'Personal',
    name: 'FJALË',
    years: '2026',
    role: 'Owner',
    stack: ['Vanilla JS', 'PWA'],
    line: 'Daily Albanian word game with a 21k-word dictionary, archive and offline play; live on the web',
  },
  {
    group: 'Personal',
    name: 'Za!',
    years: '2026',
    role: 'Owner',
    stack: ['Node', 'WebSocket'],
    line: 'Multiplayer pizza card game for 2–8 players, server-authoritative with bots; live',
  },
  {
    group: 'Personal',
    name: 'Morse Trainer',
    years: '2026',
    role: 'Owner',
    stack: ['JavaScript'],
    line: 'Morse-code learning game with spaced repetition and Farnsworth timing; live',
  },
  {
    group: 'Personal',
    name: 'Futurisma',
    years: '2026',
    role: 'Owner',
    stack: ['Three.js', 'TypeScript', 'Vite', 'Blender'],
    line: 'Hover racer with seven circuits and weather, tide and day-night systems',
  },
  {
    group: 'Personal',
    name: 'Secret Dictator',
    years: '2026',
    role: 'Owner',
    stack: ['Three.js', 'TypeScript'],
    line: 'Single-player social-deduction game against AI opponents in a 3D town',
  },
  {
    group: 'Personal',
    name: 'Open-source forks',
    years: '2022',
    role: 'Maintainer',
    stack: ['React Native'],
    line: 'epubjs-react-native, react-native-pdf, used in production',
    world: 'personal',
  },
]

const periods: Record<ProjectGroupName, string | undefined> = {
  Vianova: '(2021 – present)',
  Incentiv: '(2024)',
  AvahiTech: '(freelance)',
  Personal: undefined,
}

const order: ProjectGroupName[] = ['Vianova', 'Incentiv', 'AvahiTech', 'Personal']

export const projectGroups: ProjectGroup[] = order.map((name) => ({
  name,
  period: periods[name],
  projects: projects.filter((project) => project.group === name),
}))

export const firstYear = 2021
export const currentYear = 2026
