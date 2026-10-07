import { projects } from '../../content/projects'

export type Lane = 'phone' | 'web' | 'server'

export interface Crop {
  x: number
  y: number
  w: number
  h: number
}

export interface Shot {
  src: string
  width: number
  height: number
  alt: string
  /** The part shown in the wide lanes, in file pixels. */
  crop: Crop
  /** The part shown on a phone, in file pixels. Defaults to `crop`. */
  phoneCrop?: Crop
  /** 8 words or fewer. */
  caption: string
  /** Owner rule: real product screens on invented data carry this exact line. */
  invented?: boolean
}

export interface EntryLink {
  label: string
  href: string
}

export interface Entry {
  id: string
  name: string
  /** What it is, for a stranger. */
  kind?: string
  /** Short paragraphs, 55 words or fewer each. */
  text?: string[]
  /** Append the owner's AI line, verbatim. */
  ai?: boolean
  /** Facts as nouns: group, role, years. One per cell, no separators in the text. */
  meta: string[]
  links?: EntryLink[]
  shot?: Shot
  /** First and last year. Draws the bar. */
  years: [number, number]
  /** A note that stands alone in an empty lane. */
  lineNote?: boolean
  /** Draw a year bar for a note without a screen. */
  bar?: boolean
}

export interface Row {
  year: number
  cells: Partial<Record<Lane, Entry[]>>
}

export const REAL = 'Real product screens, invented data.'
export const AI_LINE = 'Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change.'

const bySlug = (slug: string) => projects.find((p) => p.slug === slug)!
const store = (slug: string) => bySlug(slug).links.map((l) => ({ label: l.label, href: l.href }))

export const lanes: { key: Lane; label: string; since: string }[] = [
  { key: 'phone', label: 'Phone', since: 'since 2021' },
  { key: 'web', label: 'Web', since: 'since 2023' },
  { key: 'server', label: 'Server', since: 'since 2026' },
]

export const site = {
  name: 'Gentrit Rashiti',
  claim: 'Gentrit Rashiti builds the phone and web apps that care teams, readers and shoppers use.',
  lead: 'Phone apps since 2021. Web apps since 2023. The servers behind them since 2026. Based in Kosovo, working remotely.',
  proof: [
    { label: 'bayyinahtv.com', href: 'https://bayyinahtv.com/' },
    { label: 'App Store', href: 'https://apps.apple.com/us/app/bayyinah-tv/id1530635769' },
    { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah' },
    { label: 'github.com/gentritr1', href: 'https://github.com/gentritr1' },
  ],
  nav: [
    { label: 'Work', href: '#work' },
    { label: 'Index', href: '#index' },
    { label: 'About', href: '#about' },
    { label: 'CV', href: '/Gentrit-Rashiti-CV.pdf' },
  ],
  email: 'gentrit.rashiti2@gmail.com',
  github: 'https://github.com/gentritr1',
  linkedin: 'https://www.linkedin.com/in/gentrit-rashiti-885662199',
  cv: '/Gentrit-Rashiti-CV.pdf',
}

/* ---------- Screens ---------- */

const offdayCalendar: Shot = {
  src: '/personal/shots/offday-light-calendar-desktop.webp',
  width: 2880,
  height: 1800,
  alt: 'Offday team calendar for October 2026: leave bars for Olivia C., James W., Sofia M. and Emma D., Columbus Day marked, and today circled in red.',
  crop: { x: 530, y: 775, w: 1700, h: 1025 },
  phoneCrop: { x: 530, y: 775, w: 735, h: 1025 },
  caption: 'Team calendar for October. Own product.',
}

const offdayPhone: Shot = {
  src: '/personal/shots/offday-light-calendar-phone.webp',
  width: 780,
  height: 1688,
  alt: 'Offday on a phone: the Request time off button, out today, pending requests and the team count, then the October calendar with leave bars.',
  crop: { x: 0, y: 0, w: 780, h: 1560 },
  caption: 'Team calendar, on a phone.',
}

const careWeek: Shot = {
  src: '/showcase/care-dashboard/appointments-week.webp',
  width: 2880,
  height: 1800,
  alt: 'Care team calendar, Monday to Wednesday, 8 AM to 1 PM: wound checks, lung function tests, a glucose log review and a red line at the current time. Invented data.',
  crop: { x: 496, y: 424, w: 1404, h: 1000 },
  phoneCrop: { x: 1260, y: 416, w: 642, h: 1060 },
  caption: 'Care team calendar, one week.',
  invented: true,
}

const dsPicker: Shot = {
  src: '/showcase/design-system/date-range-picker.webp',
  width: 1560,
  height: 976,
  alt: 'Design System v2 date range picker, open: presets from Today to All time, June and July 2026 side by side, a range from June 22 to July 9, and Cancel and Apply buttons. Invented data.',
  crop: { x: 0, y: 0, w: 1560, h: 976 },
  phoneCrop: { x: 302, y: 102, w: 640, h: 732 },
  caption: 'Date range picker, in its Storybook.',
  invented: true,
}

const bayyinahLibrary: Shot = {
  src: '/showcase/bayyinah/web-02.webp',
  width: 2880,
  height: 1800,
  alt: 'Bayyinah TV library, Subject tab: tabs for My Pathway, Subject, Surah, Arabic, Stories and Urdu, a search box, filters and a row of course cards.',
  crop: { x: 181, y: 290, w: 1700, h: 1483 },
  phoneCrop: { x: 181, y: 1013, w: 716, h: 760 },
  caption: 'Library, Subject tab. bayyinahtv.com, public.',
}

const bayyinahApp: Shot = {
  src: '/showcase/bayyinah/store-05.webp',
  width: 778,
  height: 1690,
  alt: 'Bayyinah TV app, My Learning: 32 hours watched, 24 series watched, 4 in progress, and a list of series with progress bars. From the App Store listing.',
  crop: { x: 110, y: 545, w: 560, h: 1145 },
  caption: 'My Learning, inside the iPhone app. App Store listing.',
}

const readToFeed: Shot = {
  src: '/mobile/reading-1.webp',
  width: 780,
  height: 1689,
  alt: 'Read to Feed, My Books: The Tale of Peter the Rabbit read 36%, Anne of Green Gables read 90%, and a locked book. From the archived App Store listing.',
  crop: { x: 80, y: 532, w: 620, h: 1157 },
  caption: 'My Books with reading progress. Archived store listing.',
}

const incentivSignIn: Shot = {
  src: '/showcase/incentiv/web-03.webp',
  width: 2880,
  height: 1800,
  alt: 'Incentiv portal sign-in, public screen: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect, beside a preview of the dashboard.',
  crop: { x: 341, y: 480, w: 1312, h: 853 },
  phoneCrop: { x: 341, y: 480, w: 729, h: 853 },
  caption: 'Portal sign-in, public screen.',
}

const vivaFresh: Shot = {
  src: '/mobile/grocery-2.webp',
  width: 780,
  height: 1689,
  alt: 'Viva Fresh, Fresh category: a product grid with prices in euros, quantity steppers and the cart total 49.74 euro. Albanian interface. From the App Store listing.',
  crop: { x: 88, y: 371, w: 604, h: 1227 },
  caption: 'Fresh category and the cart total. Store listing.',
}

const dukagjini: Shot = {
  src: '/mobile/bookstore-1.webp',
  width: 780,
  height: 1689,
  alt: 'Dukagjini Bookstore home: Search Millions of Books, top categories, bestsellers, on sale 35% off, and foreign books. From the App Store listing.',
  crop: { x: 108, y: 712, w: 564, h: 977 },
  caption: 'Home with search and categories. Store listing.',
}

/* ---------- The record, newest first ---------- */

export const rows: Row[] = [
  {
    year: 2026,
    cells: {
      web: [
        {
          id: 'offday',
          name: 'Offday',
          kind: 'Time off for teams',
          text: [
            'Employees ask for leave. Managers approve it. The team calendar shows who is away, and a drag picks the dates.',
            'Shifts warn when nobody covers them. Find the best dates picks the longest breaks around public holidays.',
          ],
          meta: ['Own product', 'Web and server', '2026'],
          shot: offdayCalendar,
          years: [2026, 2026],
        },
      ],
      phone: [
        {
          id: 'offday-phone',
          name: 'Offday on a phone',
          meta: ['Same web app', '2026'],
          shot: offdayPhone,
          years: [2026, 2026],
        },
      ],
      server: [
        {
          id: 'offday-server',
          name: 'The server behind Offday',
          text: [
            'Sign-in by email, holidays for about 200 countries, Excel export, a calendar feed and an AI assistant. About 200 tests.',
          ],
          meta: ['Own product', '2026'],
          years: [2026, 2026],
          bar: true,
        },
      ],
    },
  },
  {
    year: 2026,
    cells: {
      web: [
        {
          id: 'care',
          name: 'Care-management platform',
          kind: 'Remote patient monitoring, rebuilt one screen at a time',
          text: [
            'Care teams follow vitals from connected devices, care plans, lab results, claims, calls and chat. Many organizations share one system, and each sees only its own data.',
            'The app moves from Vue to React one screen at a time. A screen moves only after the same test passes on the old and the new app.',
          ],
          ai: true,
          meta: ['Vianova', 'Web and mobile, since 2026 also the server', '2023–26'],
          links: [{ label: 'Read the case', href: '/work/care-platform' }],
          shot: careWeek,
          years: [2023, 2026],
        },
      ],
      server: [
        {
          id: 'care-api',
          name: 'The server behind the care platform',
          text: [
            'Enrollment drafts, a lab catalog and security fixes that keep each organization’s data apart.',
            'One billing report now makes 2 database requests, not 16, and no longer times out.',
          ],
          meta: ['Vianova', 'Server', '2026'],
          years: [2026, 2026],
          bar: true,
        },
      ],
    },
  },
  {
    year: 2026,
    cells: {
      web: [
        {
          id: 'ds',
          name: 'Design System v2',
          kind: '36 building blocks for the new care dashboard, a team effort',
          text: [
            '805 colour, size and type rules, kept in one source, feed CSS, TypeScript and Figma. 20 releases in about six weeks. Built to WCAG 2.1 AA floors, with rendered evidence.',
            'A team effort on a foundation Gentrit laid: research into five leading design systems, turned into the written rules the team and its AI agents build on. Automatic checks decide. A person approves each change.',
          ],
          meta: ['Vianova', 'Design system', '2026'],
          links: [{ label: 'Read the case', href: '/work/design-system-react' }],
          shot: dsPicker,
          years: [2026, 2026],
        },
      ],
    },
  },
  {
    year: 2026,
    cells: {
      web: [
        {
          id: 'bayyinah',
          name: 'Bayyinah TV',
          kind: 'Video learning for an online community',
          text: [
            'Courses, playlists, progress, a scripture reader, live streams with chat, and video on demand. Rebuilt from an empty template.',
            'Members pay on the web and in both apps. English and Arabic, with the layout mirrored right to left.',
          ],
          meta: ['Frontend, core team', '2023–26'],
          links: [
            { label: 'bayyinahtv.com', href: 'https://bayyinahtv.com/' },
            { label: 'Read the case', href: '/work/bayyinah-tv' },
          ],
          shot: bayyinahLibrary,
          years: [2023, 2026],
        },
      ],
      phone: [
        {
          id: 'bayyinah-app',
          name: 'Bayyinah TV app',
          text: ['One web app. It runs on the web and inside the iPhone and Android apps.'],
          meta: ['2023–26'],
          links: store('bayyinah-tv').filter((l) => l.label !== 'Website'),
          shot: bayyinahApp,
          years: [2023, 2026],
        },
      ],
    },
  },
  {
    year: 2025,
    cells: {
      phone: [
        {
          id: 'rtf',
          name: 'Read to Feed',
          kind: 'Reading app for children',
          text: [
            'Children read books, scan their own books by barcode, take quizzes as chats and earn badges and streaks. Parents verify accounts by email.',
            'About 14 releases to both stores over four years, through three major upgrades of the app’s base. Three languages.',
          ],
          meta: ['Mobile, iOS and Android', '2022–25'],
          links: [...store('read-to-feed'), { label: 'Read the case', href: '/work/read-to-feed' }],
          shot: readToFeed,
          years: [2022, 2025],
        },
      ],
      web: [
        {
          id: 'institute',
          name: 'Bayyinah institute website',
          text: ['A one-page site: the mission, reasons to support it, research funding, impact and questions.'],
          meta: ['Frontend', '2024–25'],
          links: [{ label: 'bayyinah.org', href: 'https://bayyinah.org/' }],
          years: [2024, 2025],
        },
        {
          id: 'portal',
          name: 'Member portal',
          text: ['The base of a member portal: protected pages, sign-in through an outside provider, the app shell and layout.'],
          meta: ['Frontend', '2025'],
          years: [2025, 2025],
        },
      ],
      server: [
        {
          id: 'server-starts',
          name: 'The server lane starts in 2026.',
          meta: [],
          years: [2025, 2025],
          lineNote: true,
        },
      ],
    },
  },
  {
    year: 2024,
    cells: {
      web: [
        {
          id: 'incentiv',
          name: 'Incentiv portal',
          kind: 'Sign-in and dashboard of a smart wallet',
          text: [
            'People sign in with a passkey (no password) or an outside wallet, then see balances, assets and transactions. English and French.',
            'Gentrit built the portal frontend: the sign-in, a first-run tour, the dashboard cards, a list of assets and a balance pop-up with a QR code. Teammates built the wallet itself and its link to the blockchain.',
          ],
          meta: ['Incentiv', 'Frontend, UI layer', '2024'],
          links: [
            { label: 'portal.incentiv.io', href: 'https://portal.incentiv.io/' },
            { label: 'Read the case', href: '/work/incentiv' },
          ],
          shot: incentivSignIn,
          years: [2024, 2024],
        },
      ],
    },
  },
  {
    year: 2023,
    cells: {
      phone: [
        {
          id: 'viva',
          name: 'Viva Fresh',
          kind: 'Grocery shopping and loyalty',
          text: [
            'Shoppers fill a cart, choose a delivery slot and find their address on a map. Loyalty points and a wishlist. Albanian interface.',
            'Live in both stores. One app ships to iPhone and Android.',
          ],
          meta: ['Mobile', '2023'],
          links: [...store('viva-fresh'), { label: 'Read the case', href: '/work/viva-fresh' }],
          shot: vivaFresh,
          years: [2023, 2023],
        },
      ],
      web: [
        {
          id: 'care-vue',
          name: 'The care platform’s first era',
          text: [
            'Built on Vue from 2023: patient profile, care plans, labs and vitals, claims, calls. Four languages: English, German, Spanish and Turkish. The 2026 rewrite above moves it to React.',
          ],
          meta: ['Vianova', 'Frontend', '2023–26'],
          years: [2023, 2026],
        },
      ],
    },
  },
  {
    year: 2022,
    cells: {
      phone: [
        {
          id: 'dukagjini',
          name: 'Dukagjini Bookstore',
          kind: 'Shopping app for a book publisher',
          text: [
            'Readers search the catalogue, browse sales, keep favourite lists and check out with promo codes.',
            'Live in both stores. A push notification opens the right screen.',
          ],
          meta: ['Mobile', '2021–22'],
          links: [...store('dukagjini-bookstore'), { label: 'Read the case', href: '/work/dukagjini-bookstore' }],
          shot: dukagjini,
          years: [2021, 2022],
        },
        {
          id: 'chatbot',
          name: 'Chatbot library',
          text: ['A reusable package that plays scripted chats: text, media, choices, ratings and timers. A message queue keeps the order; guards stop stalls and repeats.'],
          meta: ['Mobile', '2022–25'],
          years: [2022, 2025],
        },
      ],
    },
  },
  {
    year: 2021,
    cells: {
      phone: [
        {
          id: 'sadaqah',
          name: 'Sadaqah app for Islamic Relief USA',
          text: [
            'Donations and subscriptions, badges, guided tasks and video, built with a small team. Work on the team covered the payment and subscription screens, the badges, in-app web views and the Android builds. No longer in the stores.',
          ],
          meta: ['Mobile, team member', '2021–22'],
          years: [2021, 2022],
        },
      ],
    },
  },
]

/* ---------- The index: every product, one line each ---------- */

export interface IndexRow {
  years: string
  name: string
  lane: string
  role: string
  line: string
  links?: EntryLink[]
  /** Jumps to the entry in the record. */
  entry?: string
}

export interface IndexGroup {
  title: string
  rows: IndexRow[]
}

export const index: IndexGroup[] = [
  {
    title: 'Vianova, 2021 to now',
    rows: [
      { years: '2026', name: 'Care-management platform, React rewrite', lane: 'Web', role: 'Frontend', line: 'Screen-by-screen move from Vue to React, with the same tests on both apps', entry: 'care', links: [{ label: 'Case', href: '/work/care-platform' }] },
      { years: '2026', name: 'Care-management server', lane: 'Server', role: 'Full stack', line: 'Enrollment drafts, a lab catalog, data kept apart for each organization, fast reports', entry: 'care-api' },
      { years: '2026', name: 'Design System v2', lane: 'Web', role: 'Design system', line: 'Team effort on Gentrit\'s foundation: 36 building blocks, 20 releases in about six weeks', entry: 'ds', links: [{ label: 'Case', href: '/work/design-system-react' }] },
      { years: '2026', name: 'Design system, Vue', lane: 'Web', role: 'Design system', line: 'Colour, size and type rules from Figma, visual tests and a health dashboard' },
      { years: '2026', name: 'Design dashboard, prototype', lane: 'Web', role: 'Frontend', line: 'Call-activity screen on the design system with demo data, as a design reference' },
      { years: '2023–26', name: 'Care-management platform, Vue app', lane: 'Web', role: 'Frontend', line: 'Remote patient care: profiles, care plans, claims, vitals and labs, calls, 4 languages', entry: 'care-vue' },
    ],
  },
  {
    title: 'Agency work',
    rows: [
      { years: '2023–26', name: 'Bayyinah TV', lane: 'Web, phone', role: 'Frontend, core team', line: 'Full rebuild: live streams, video player, subscriptions, gifting, English and Arabic', entry: 'bayyinah', links: [{ label: 'Case', href: '/work/bayyinah-tv' }] },
      { years: '2024–25', name: 'Bayyinah institute website', lane: 'Web', role: 'Frontend', line: 'One-page site: mission, support, research funding, impact and FAQ', entry: 'institute', links: [{ label: 'bayyinah.org', href: 'https://bayyinah.org/' }] },
      { years: '2022–25', name: 'Read to Feed', lane: 'Phone', role: 'Mobile', line: 'PDF and EPUB reader, barcode scanning, badges and streaks, about 14 releases', entry: 'rtf', links: [{ label: 'Case', href: '/work/read-to-feed' }] },
      { years: '2022–25', name: 'Chatbot library', lane: 'Phone', role: 'Mobile', line: 'Plays scripted chat conversations: message queue, typing delays, media, duplicate guards', entry: 'chatbot' },
      { years: '2025', name: 'Chatbot library, web port', lane: 'Web', role: 'Frontend', line: 'TypeScript web version of the chatbot library, with an example app' },
      { years: '2025', name: 'Member portal', lane: 'Web', role: 'Frontend', line: 'Member portal base: protected pages, outside sign-in, app shell and layout', entry: 'portal' },
      { years: '2023', name: 'Viva Fresh', lane: 'Phone', role: 'Mobile', line: 'Grocery orders with delivery slots, loyalty, wishlist and address search on a map', entry: 'viva', links: [{ label: 'Case', href: '/work/viva-fresh' }] },
      { years: '2022–23', name: 'Coaching app', lane: 'Phone', role: 'Mobile', line: 'Organization sign-in, a daily calendar strip, reactions, and dev, staging and release builds' },
      { years: '2022', name: 'EPUB reader prototype', lane: 'Phone', role: 'Mobile', line: 'Downloads, renders and resizes an EPUB; the start of the reading app’s reader' },
      { years: '2021–22', name: 'Dukagjini Bookstore', lane: 'Phone', role: 'Mobile', line: 'Book shopping; a push notification opens the right screen; checkout with promo codes', entry: 'dukagjini', links: [{ label: 'Case', href: '/work/dukagjini-bookstore' }] },
      { years: '2021–22', name: 'Sadaqah app for Islamic Relief USA', lane: 'Phone', role: 'Mobile, team member', line: 'Donations and subscriptions with Stripe, badges, guided tasks and video', entry: 'sadaqah' },
      { years: '2026', name: 'Fuel-station loyalty app', lane: 'Phone', role: 'Mobile', line: 'Loyalty app upkeep: arm64 simulator support, legacy architecture, shadow fixes' },
    ],
  },
  {
    title: 'Incentiv, 2024',
    rows: [
      { years: '2024', name: 'Smart-wallet dashboard', lane: 'Web', role: 'Frontend, UI layer', line: 'Wallet dashboard with passkey sign-in, balance and QR, onboarding, English and French', entry: 'incentiv', links: [{ label: 'Case', href: '/work/incentiv' }] },
    ],
  },
  {
    title: 'AvahiTech, freelance',
    rows: [
      { years: 'No date', name: 'Smart business dashboard with AI', lane: 'Web, server', role: 'Frontend, FastAPI', line: 'Business dashboard with AI headshot generation and a PDF-to-chat assistant' },
    ],
  },
  {
    title: 'Own projects',
    rows: [
      { years: '2026', name: 'Offday', lane: 'Web, phone, server', role: 'Owner', line: 'Time off for teams: approvals, shared calendar, shift cover, best-dates planner, AI assistant', entry: 'offday' },
      { years: '2026', name: 'OFFBEAT, speaker brand concept', lane: 'Web', role: 'Owner', line: 'Fictional speaker: 3D model, exploded view, a working drum-machine studio', links: [{ label: 'GitHub', href: 'https://github.com/gentritr1/offbeat' }] },
      { years: '2026', name: 'FORM, sculpture exhibition concept', lane: 'Web', role: 'Owner', line: 'Three mathematical forms in WebGL, live materials, word-cast sculptures', links: [{ label: 'GitHub', href: 'https://github.com/gentritr1/form' }] },
      { years: '2026', name: 'Snaxx Tech studio website', lane: 'Web', role: 'Owner', line: '3D hero, a cinemagraph loop and a strict security policy; images 972 KB to 337 KB', links: [{ label: 'snaxxtech.com', href: 'https://www.snaxxtech.com/' }] },
      { years: '2026', name: 'FJALË', lane: 'Web', role: 'Owner', line: 'Daily Albanian word game, 21k-word dictionary, archive, offline play', links: [{ label: 'Play', href: 'https://xn--fjal-opa.com/' }] },
      { years: '2026', name: 'Za!', lane: 'Web, server', role: 'Owner', line: 'Multiplayer pizza card game for 2 to 8 players; the server decides every move', links: [{ label: 'Play', href: 'https://za-game.onrender.com/' }] },
      { years: '2026', name: 'Morse Trainer', lane: 'Web', role: 'Owner', line: 'Morse-code learning game with spaced repetition and Farnsworth timing', links: [{ label: 'Play', href: 'https://morse-code-amber.vercel.app/' }] },
      { years: '2026', name: 'Geo Guesser World 3D', lane: 'Phone', role: 'Mobile, co-built', line: 'Street-view guessing game, published on Google Play', links: [{ label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.snaxxtech.geoguesser' }] },
      { years: '2026', name: 'Futurisma', lane: 'Web', role: 'Owner', line: 'Hover racer with seven circuits and weather, tide and day-night systems' },
      { years: '2026', name: 'Secret Dictator', lane: 'Web', role: 'Owner', line: 'Single-player social-deduction game against AI opponents in a 3D town' },
      { years: '2022', name: 'Open-source forks', lane: 'Phone', role: 'Maintainer', line: 'Forks of epubjs-react-native and react-native-pdf, used in a production reading app', links: [{ label: 'GitHub', href: 'https://github.com/gentritr1' }] },
    ],
  },
]

export const about = [
  'Gentrit Rashiti is a frontend and mobile developer who now works across the whole stack. Based in Kosovo, working remotely. Bachelor’s degree, UBT.',
  'Frontend: React, Next.js, Vue, Nuxt, TypeScript. Mobile: React Native, iOS and Android. Backend: Laravel and PHP, Python and FastAPI, MySQL, Redis. Quality: Playwright, Vitest, Pest. Services: Stripe, Firebase, Twilio, Pusher, and live video on AWS.',
  'Interfaces shipped in English, German, Spanish, Turkish, French, Albanian and Arabic, right to left. Spare time goes into games that are live on the web: FJALË, a daily Albanian word game, Za!, a card game for 2 to 8 players, and Morse Trainer.',
]
