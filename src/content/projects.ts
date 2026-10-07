import type { ShowcaseItem } from '../components/Showcase'
import type { ThumbKind } from '../components/Thumb'
import type { PageWorld } from '../lib/worlds'
import type { ChannelKey } from './channels'

/** Employer that heads a group in the schedule. Agency work for clients carries no employer name. */
export type ProjectGroupName = 'Vianova' | 'Agency work' | 'Incentiv' | 'AvahiTech' | 'Personal'

export interface PublicLink {
  label: 'Website' | 'App Store' | 'Google Play' | 'Portal' | 'Docs' | 'GitHub' | 'App Store (archived)' | 'Google Play (archived)'
  href: string
}

/** Live recreations with invented data. Each key maps to one lazy component in `src/lib/recreations.tsx`. */
export type RecreationKey = 'live-room' | 'reader' | 'doc-chat'

/** What the case-page monitor shows: a live recreation, or the first gallery. */
export type MonitorKind = Exclude<RecreationKey, 'doc-chat'> | 'gallery'

export interface Fact {
  label: string
  value: string
}

export interface Story {
  /** What the product is and who uses it. */
  product: string
  /** What the team built. */
  built: string
  /** What the product shows today. */
  result: string
}

/** A hard number from CONTENT.md, shown large on the case page. `to` draws an arrow from `value`. */
export interface Readout {
  value: string
  to?: string
  label: string
}

export interface Featured {
  /** Position in the channel switcher and the "Next channel" order, from 1. */
  order: number
  monitor: MonitorKind
  story: Story
  /** Facts as label and value rows. The case header reads the `Platforms` row. */
  facts: Fact[]
  readouts?: Readout[]
  /** Slugs of schedule rows on the same channel, listed on the case page and opened in the drawer. */
  related?: string[]
}

export interface Gallery {
  title: string
  aspect: 'web' | 'phone'
  links: PublicLink[]
  items: ShowcaseItem[]
}

export interface ProjectMedia {
  /** Stylized mini-screen with invented content, for the schedule row. */
  thumb?: ThumbKind
  /** Real 256 × 160 crop from a public page or store listing, shown in place of `thumb`. */
  shot?: { src: string; alt: string }
  /** A live recreation that is not a featured monitor, for example in the drawer. */
  recreation?: RecreationKey
  galleries?: Gallery[]
}

export interface Project {
  slug: string
  name: string
  /** Short product kind, for example "Video-learning platform". */
  kind: string
  channel: ChannelKey
  group: ProjectGroupName
  /** Small metadata used by the home wall; narrative and specs load with the case route. */
  featured?: Omit<Featured, 'story' | 'facts'>
  /** Time code, for example "2023–26". Null when CONTENT.md gives no years. */
  years: string | null
  role: string
  stack: string[]
  /** One line for the schedule, 14 words or fewer. */
  line: string
  /** 60 to 120 words for the drawer. */
  summary: string
  /** Public pages of the product: its website, store listings, or archived store listings. */
  links: PublicLink[]
  media: ProjectMedia
}

/* ---------- Gallery items ---------- */

const web = (src: string, alt: string, caption: string): ShowcaseItem => ({ src, alt, caption, width: 1440, height: 900 })
const phone = (src: string, alt: string, caption: string): ShowcaseItem => ({ src, alt, caption, width: 780, height: 1688 })
const iphoneFrame = (src: string, alt: string, caption: string): ShowcaseItem => ({ src, alt, caption, width: 780, height: 1689 })

const careScreensGallery: Gallery = {
  title: 'Real product screens, invented data',
  aspect: 'web',
  links: [],
  items: [
    web('/showcase/care-dashboard/overview.webp', 'Care team dashboard: patients by program and patient engagement by calls and text messages. Invented data.', 'Care team dashboard'),
    web('/showcase/care-dashboard/rpm-overview-cgm.webp', "Glucose overview for one patient: time in range, average, highest and lowest values, device usage, and one day's glucose curve. Invented data.", 'Glucose overview'),
    web('/showcase/care-dashboard/claims.webp', 'Claims for one month: counts by status, filters for updated claims and claims that need attention, and each claim with its program, CPT codes and status. Invented data.', 'Claims'),
    web('/showcase/care-dashboard/appointments-week.webp', 'Care team calendar for one week: calls, video calls and office visits for each patient. Invented data.', 'Care team calendar'),
  ],
}

const designSystemGallery: Gallery = {
  title: 'Real product screens, invented data',
  aspect: 'web',
  links: [],
  items: [
    {
      src: '/showcase/design-system/date-range-picker.webp',
      alt: 'Design System v2 date range picker in its Storybook, open: presets from Today to All time, June and July 2026 side by side, a range from June 22 to July 9, the start and end dates as text, and Cancel and Apply buttons. Invented data.',
      caption: 'Date range picker, from the Storybook',
      width: 780,
      height: 488,
    },
  ],
}

const bayyinahLinks = {
  website: { label: 'Website', href: 'https://bayyinahtv.com/' },
  appStore: { label: 'App Store', href: 'https://apps.apple.com/us/app/bayyinah-tv/id1530635769' },
  googlePlay: { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah' },
  institute: { label: 'Website', href: 'https://bayyinah.org/' },
} satisfies Record<string, PublicLink>

const bayyinahWebsiteGallery: Gallery = {
  title: 'Website',
  aspect: 'web',
  links: [bayyinahLinks.website],
  items: [
    web('/showcase/bayyinah/web-01.webp', 'Bayyinah TV landing page: "Quran Studies Made Simple" hero with the app on a laptop, a monitor and phones', 'Landing page'),
    web('/showcase/bayyinah/web-02.webp', 'Bayyinah TV library, Subject tab: library tabs, search, filters and a row of course cards', 'Library: Subject'),
    web('/showcase/bayyinah/web-03.webp', 'Bayyinah TV library, Arabic tab: beginner courses and the flagship Arabic program', 'Library: Arabic'),
    web('/showcase/bayyinah/web-04.webp', 'Bayyinah TV library, Stories tab: filters by prophet and a row of story courses', 'Library: Stories'),
    web('/showcase/bayyinah/web-05.webp', 'Bayyinah TV series page: episode list in a side column, series summary and video cards', 'Series page'),
    web('/showcase/bayyinah/web-06.webp', 'Bayyinah TV pricing: "Choose Your Plan" with a monthly and annual switch and the Premium plan', 'Pricing'),
  ],
}

const storeFrame = (n: number, alt: string, caption: string): ShowcaseItem => ({
  src: `/showcase/bayyinah/store-0${n}.webp`,
  width: 778,
  height: 1690,
  alt,
  caption,
})

const bayyinahAppGallery: Gallery = {
  title: 'Mobile app',
  aspect: 'phone',
  links: [bayyinahLinks.appStore, bayyinahLinks.googlePlay],
  items: [
    storeFrame(1, 'App Store frame: "Quran Studies Made Simple" with the Bayyinah TV home screen on an iPhone', 'Home'),
    storeFrame(2, 'App Store frame: "Study the Quran Surah by Surah" with the surah list and the video player', 'Surah by surah'),
    storeFrame(3, 'App Store frame: "Study the Quran Subject by Subject" with subject course cards', 'Subject by subject'),
    storeFrame(4, 'App Store frame: "Study Quranic Arabic Step by Step" with the Arabic courses', 'Arabic'),
    storeFrame(5, 'App Store frame: "Pick Up Anytime" with the My Learning progress dashboard', 'My Learning'),
    storeFrame(6, 'App Store frame: "Learn Your Way" with the audio and video player on two iPhones', 'Audio and video'),
  ],
}

const bayyinahInstituteGallery: Gallery = {
  title: 'Institute website',
  aspect: 'web',
  links: [bayyinahLinks.institute],
  items: [
    web('/showcase/bayyinah/org-01.webp', 'Bayyinah Foundation home: "Help Us Spread Quranic Knowledge" hero with a Join the Mission button and store badges', 'Home'),
    web('/showcase/bayyinah/org-02.webp', 'Bayyinah Foundation "Why Support" section: three reasons with line icons', 'Why support'),
    web('/showcase/bayyinah/org-03.webp', 'Bayyinah Foundation "Research Funding Opportunities" section with three photos', 'Research funding'),
    web('/showcase/bayyinah/org-04.webp', 'Bayyinah Foundation impact banner: "Together, we can empower individuals" over a city photo', 'Your impact'),
    web('/showcase/bayyinah/org-05.webp', 'Bayyinah Foundation frequently asked questions: six collapsed questions about donations', 'FAQ'),
    {
      src: '/showcase/bayyinah/org-phone.webp',
      width: 780,
      height: 1688,
      alt: 'Bayyinah Foundation home on a phone: the hero, the Join the Mission button and the store badges',
      caption: 'Home on a phone',
    },
  ],
}

const readToFeedLinks: PublicLink[] = [
  {
    label: 'App Store (archived)',
    href: 'https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765',
  },
  {
    label: 'Google Play (archived)',
    href: 'https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf',
  },
]

const readToFeedGallery: Gallery = {
  title: 'Store screenshots',
  aspect: 'phone',
  links: readToFeedLinks,
  items: [
    iphoneFrame('/mobile/reading-1.webp', 'Read to Feed store screenshot: My Books list with reading progress for The Tale of Peter Rabbit and Anne of Green Gables', 'My Books'),
    iphoneFrame('/mobile/reading-2.webp', 'Read to Feed store screenshot: achievements screen with eggs collected and quiz badges', 'Achievements'),
    iphoneFrame('/mobile/reading-3.webp', 'Read to Feed store screenshot: chapter reader with a Keep Reading sheet and the mascot', 'Reader'),
    iphoneFrame('/mobile/reading-4.webp', 'Read to Feed store screenshot: New Badge pop-up for 50,000 eggs', 'New badge'),
  ],
}

const vivaFreshLinks: PublicLink[] = [
  { label: 'App Store', href: 'https://apps.apple.com/us/app/viva-fresh/id1580739480' },
  { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zs.vivafresh' },
]

const vivaFreshGallery: Gallery = {
  title: 'Store screenshots',
  aspect: 'phone',
  links: vivaFreshLinks,
  items: [
    iphoneFrame('/mobile/grocery-1.webp', 'Viva Fresh store screenshot on iPhone: home with product categories and latest products, Albanian interface', 'Home, iPhone'),
    iphoneFrame('/mobile/grocery-2.webp', 'Viva Fresh store screenshot on iPhone: Fresh category with a product grid and the cart total', 'Fresh, iPhone'),
    iphoneFrame('/mobile/grocery-3.webp', 'Viva Fresh store screenshot on iPhone: cart with quantities, discount and checkout button', 'Cart, iPhone'),
  ],
}

const dukagjiniLinks: PublicLink[] = [
  { label: 'App Store', href: 'https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342' },
  { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks' },
]

const dukagjiniGallery: Gallery = {
  title: 'Store screenshots',
  aspect: 'phone',
  links: dukagjiniLinks,
  items: [
    iphoneFrame('/mobile/bookstore-1.webp', 'Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale', 'Home'),
    iphoneFrame('/mobile/bookstore-2.webp', 'Dukagjini Bookstore store screenshot: foreign books list with ratings, prices and favourites', 'Foreign books'),
    iphoneFrame('/mobile/bookstore-3.webp', 'Dukagjini Bookstore store screenshot: sheet with favourite lists and book categories', 'Favourites'),
  ],
}

const incentivLinks: PublicLink[] = [
  { label: 'Website', href: 'https://incentiv.io/' },
  { label: 'Portal', href: 'https://portal.incentiv.io/' },
  { label: 'Docs', href: 'https://docs.incentiv.io/' },
]

const incentivGallery: Gallery = {
  title: 'Incentiv',
  aspect: 'web',
  links: incentivLinks,
  items: [
    web('/showcase/incentiv/web-03.webp', 'Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview', 'Portal sign-in (public screen)'),
  ],
}

const snaxxLink: PublicLink = { label: 'Website', href: 'https://www.snaxxtech.com/' }
const fjaleLink: PublicLink = { label: 'Website', href: 'https://xn--fjal-opa.com/' }
const zaLink: PublicLink = { label: 'Website', href: 'https://za-game.vercel.app/' }
const morseLink: PublicLink = { label: 'Website', href: 'https://morse-code-amber.vercel.app/' }
const githubLink: PublicLink = { label: 'GitHub', href: 'https://github.com/gentritr1' }
const offbeatLink: PublicLink = { label: 'GitHub', href: 'https://github.com/gentritr1/offbeat' }
const formLink: PublicLink = { label: 'GitHub', href: 'https://github.com/gentritr1/form' }

/* ---------- Projects ---------- */

export const projects: Project[] = [
  {
    slug: 'care-platform',
    name: 'Care-management platform',
    kind: 'Remote patient monitoring',
    channel: 'healthcare',
    group: 'Vianova',
    years: '2023–26',
    role: 'Web and mobile; since 2026 also the server',
    stack: ['React 19', 'TypeScript', 'TanStack', 'Zod', 'Nuxt 2', 'Laravel 13', 'Playwright'],
    line: 'Remote patient care: a Vue app since 2023, now being rebuilt in React with parity tests',
    summary:
      'A care-management platform for remote patient monitoring. Care teams follow vitals from connected devices, care plans, lab results, billing claims, calls and chat, and many client organizations share one multi-tenant system. Its features were built on Vue (Nuxt 2) from 2023. In 2026 the frontend moves to React route by route, with parity tests that compare each screen with the old app, decision records and automated quality gates, on Design System v2. AI agents work inside fixed rules and automatic checks, old bugs are written down rather than copied, and a person approves each change. The Laravel API gained enrollment drafts, a lab catalog and multi-tenant security fixes.',
    links: [],
    media: { galleries: [careScreensGallery] },
    featured: {
      order: 1,
      monitor: 'gallery',
      readouts: [
        { value: '16', to: '2', label: 'Queries in one billing report' },
        { value: '4', label: 'Languages: EN, DE, ES, TR' },
        { value: '36', label: 'Design-system components underneath' },
      ],
      related: ['design-system-react', 'design-system-vue', 'design-dashboard'],
    },
  },
  {
    slug: 'care-api',
    name: 'Care-management API',
    kind: 'Laravel API',
    channel: 'healthcare',
    group: 'Vianova',
    years: '2026',
    role: 'Server',
    stack: ['Laravel 13', 'PHP 8.3', 'MySQL', 'Redis', 'Pest'],
    line: 'Laravel API for enrollment drafts, a lab catalog, multi-tenant security and fast reports',
    summary:
      "The Laravel API behind the care-management platform. The work added enrollment drafts, so a care team can save a patient's enrollment and finish it later, and a lab catalog for the lab screens. Multi-tenant security fixes keep each organization's records out of every other organization's responses. One billing report went from 16 queries to 2 and no longer times out. Tests run on Pest, against MySQL and Redis.",
    links: [],
    media: { thumb: 'api-terminal' },
  },
  {
    slug: 'design-system-react',
    name: 'Design System v2',
    kind: 'Token-driven React design system',
    channel: 'healthcare',
    group: 'Vianova',
    years: '2026',
    role: 'Design system',
    stack: ['React 19', 'TypeScript', 'CSS Modules', 'Storybook 10', 'DTCG tokens', 'Playwright', 'axe'],
    line: '36 components, 805 design tokens and 20 releases in about six weeks',
    summary:
      "Design System v2 is a token-driven React component library for the new dashboard of a care-management platform. The team defined 805 design tokens in three tiers (core, semantic and component) in one source that generates CSS, TypeScript and a Figma bundle, and shipped 36 components in 20 releases in about six weeks. Each component is built to WCAG 2.1 AA floors with automated, rendered evidence, and per-component builds cut a Button-only consumer's JavaScript by 96.6%. Research into five leading design systems came first and became written guides for AI agents. The guides advise, automatic checks decide, and a person approves each change. The new React dashboard, not yet in production, uses the system across its screens through one adapter layer.",
    links: [],
    media: { galleries: [designSystemGallery] },
    featured: {
      order: 7,
      monitor: 'gallery',
      readouts: [
        { value: '36', label: 'Components' },
        { value: '805', label: 'Design tokens in three tiers' },
        { value: '20', label: 'Releases in about six weeks' },
        { value: '96.6%', label: 'Less JavaScript for a Button-only consumer' },
      ],
    },
  },
  {
    slug: 'design-system-vue',
    name: 'Design system, Vue',
    kind: 'Tokens and components',
    channel: 'healthcare',
    group: 'Vianova',
    years: '2026',
    role: 'Design system',
    stack: ['Vue 2', 'Style Dictionary', 'Histoire', 'Playwright'],
    line: 'Design tokens from Figma, codemods, visual regression tests and a health dashboard',
    summary:
      "The design system for the platform's Vue app. Design tokens come from Figma through Style Dictionary, so colour, spacing and type stay in step with the design files. Components are documented in Histoire, codemods move existing screens onto the new tokens, Playwright visual regression tests catch unintended changes, and a health dashboard shows how far each part of the app has adopted the system.",
    links: [],
    media: { thumb: 'tokens' },
  },
  {
    slug: 'design-dashboard',
    name: 'Design dashboard (prototype)',
    kind: 'Design reference',
    channel: 'healthcare',
    group: 'Vianova',
    years: '2026',
    role: 'Frontend',
    stack: ['React 19', 'Vite', 'Tailwind 4'],
    line: 'Call-activity screen on the design system with demo data, as a design reference',
    summary:
      "A prototype design dashboard in React 19, Vite and Tailwind 4. It rebuilds the platform's call-activity screen on the design system with demo data, so designers and engineers can review the screen, its states and its layout without a backend or real patient data. It serves as a design reference for how product screens look when they are built from the shared components.",
    links: [],
    media: {},
  },
  {
    slug: 'bayyinah-tv',
    name: 'Bayyinah TV',
    kind: 'Video-learning platform',
    channel: 'streaming',
    group: 'Agency work',
    years: '2023–26',
    role: 'Frontend, core team',
    stack: ['Nuxt 3', 'Vue 3', 'Pinia', 'video.js', 'AWS IVS', 'Pusher', 'Stripe'],
    line: 'Full Nuxt 3 rebuild: live streams, HLS player, subscriptions, gifting, English/Arabic',
    summary:
      'Bayyinah TV is a video-learning platform for an online community: courses, playlists, learning progress, a scripture reader, on-demand video and live streams. Its second version is a full rebuild on Nuxt 3, with live streaming, realtime chat and moderation, an HLS player with a premium paywall, Stripe, Apple and Google subscriptions, gifting, and an English and Arabic interface with a right-to-left layout. The same web app runs inside the native mobile apps.',
    links: [bayyinahLinks.website, bayyinahLinks.appStore, bayyinahLinks.googlePlay],
    media: { thumb: 'player-chat', galleries: [bayyinahWebsiteGallery, bayyinahAppGallery, bayyinahInstituteGallery] },
    featured: {
      order: 2,
      monitor: 'live-room',
      readouts: [
        { value: '34', label: 'Routes in the Nuxt 3 rebuild' },
        { value: '270+', label: 'Components, 25 stores' },
        { value: 'EN / AR', label: 'Right-to-left layout' },
      ],
    },
  },
  {
    slug: 'bayyinah-institute',
    name: 'Bayyinah institute website',
    kind: 'Public website',
    channel: 'streaming',
    group: 'Agency work',
    years: '2024–25',
    role: 'Frontend',
    stack: ['Next.js', 'React'],
    line: 'One-page Next.js site: mission, support, research funding, impact and FAQ',
    summary:
      'The public website of the Bayyinah institute: a one-page Next.js site that presents the mission, the reasons to support it, research funding opportunities, the impact of donations and frequently asked questions. It has a Join the Mission call to action and links to the mobile apps in both stores, and its layout works on phones as well as on desktop screens.',
    links: [bayyinahLinks.institute],
    media: { thumb: 'portal-shell', galleries: [bayyinahInstituteGallery] },
  },
  {
    slug: 'read-to-feed',
    name: 'Read to Feed',
    kind: "Children's reading app",
    channel: 'reading',
    group: 'Agency work',
    years: '2022–25',
    role: 'Mobile, iOS and Android',
    stack: ['React Native', 'Redux Toolkit', 'Firebase', 'Vision Camera', 'epub.js'],
    line: 'PDF/EPUB reader, barcode scanning, gamification, about 14 releases, RN 0.63 to 0.81',
    summary:
      "Read to Feed is a children's reading app for iOS and Android. Children read books, scan their own books by barcode, take quizzes as chat conversations, and earn badges and streaks. The app has a PDF and EPUB reader with progress tracking, an ISBN barcode scanner, push notifications with a notification center, and three languages. About 14 releases went to both stores, and the app moved from React Native 0.63 to 0.81.",
    links: readToFeedLinks,
    media: {
      shot: { src: '/mobile/thumbs/reading.webp', alt: 'Read to Feed store screenshot: My Books list with reading progress' },
      galleries: [readToFeedGallery],
    },
    featured: {
      order: 3,
      monitor: 'reader',
      readouts: [
        { value: '≈14', label: 'Releases to both stores' },
        { value: '0.63', to: '0.81', label: 'React Native, three major upgrades' },
        { value: '3', label: 'Languages' },
      ],
    },
  },
  {
    slug: 'viva-fresh',
    name: 'Viva Fresh',
    kind: 'Grocery and loyalty app',
    channel: 'reading',
    group: 'Agency work',
    years: '2023',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'Maps', 'Firebase'],
    line: 'Online grocery orders with delivery slots, loyalty, wishlist and address search on a map',
    summary:
      'Viva Fresh is a grocery shopping and loyalty app for iOS and Android, with an Albanian interface. Shoppers browse product categories, fill a cart and choose a delivery slot, and the app has a loyalty programme and a wishlist. A search on a map finds the delivery address. The app is built in React Native with Redux Toolkit and Firebase, and its listings are public in both stores.',
    links: vivaFreshLinks,
    media: {
      shot: { src: '/mobile/thumbs/grocery.webp', alt: 'Viva Fresh store screenshot: home with product categories, Albanian interface' },
      galleries: [vivaFreshGallery],
    },
    featured: {
      order: 4,
      monitor: 'gallery',
    },
  },
  {
    slug: 'dukagjini-bookstore',
    name: 'Dukagjini Bookstore',
    kind: 'Bookstore app',
    channel: 'reading',
    group: 'Agency work',
    years: '2021–22',
    role: 'Mobile',
    stack: ['React Native', 'Redux', 'Firebase Messaging'],
    line: 'Book shopping with push deep links, animated details and checkout; iOS and Android',
    summary:
      'Dukagjini Bookstore is a React Native shopping app for a publisher, on iOS and Android. Readers search books, browse top categories and books on sale, keep favourite lists, and check out with promo codes. Push notifications open the right screen through deep links, the book-detail header is animated, and modals close with a swipe. Redux holds the app state and Firebase Messaging delivers the notifications.',
    links: dukagjiniLinks,
    media: {
      shot: { src: '/mobile/thumbs/bookstore.webp', alt: 'Dukagjini Bookstore store screenshot: foreign books list with ratings and prices' },
      galleries: [dukagjiniGallery],
    },
    featured: {
      order: 6,
      monitor: 'gallery',
    },
  },
  {
    slug: 'chatbot-runtime',
    name: 'Chatbot runtime library',
    kind: 'React Native package',
    channel: 'reading',
    group: 'Agency work',
    years: '2022–25',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit'],
    line: 'Plays scripted chat conversations: message queue, typing delays, media, duplicate guards',
    summary:
      'A reusable React Native package that plays scripted conversations with text, media, choices, ratings and timers. A message queue keeps messages in order, stall and duplicate guards stop a conversation from hanging or repeating, and natural typing delays make each reply arrive at a believable pace. An app supplies a script and gets a complete chat flow, with Redux Toolkit holding the conversation state.',
    links: [],
    media: { thumb: 'chat-choices' },
  },
  {
    slug: 'chatbot-runtime-web',
    name: 'Chatbot runtime, web port',
    kind: 'TypeScript library',
    channel: 'reading',
    group: 'Agency work',
    years: '2025',
    role: 'Frontend',
    stack: ['React 19', 'TypeScript', 'Vite', 'Zustand'],
    line: 'TypeScript web version of the chatbot runtime, with an example app',
    summary:
      'A TypeScript web version of the chatbot runtime, built with React 19 and Vite. It plays the same scripted conversations as the React Native package, with the message queue, the stall and duplicate guards and the typing delays ported to the browser. Zustand holds the conversation state in place of Redux, and an example app shows a full conversation running on the web.',
    links: [],
    media: {},
  },
  {
    slug: 'epub-reader-prototype',
    name: 'EPUB reader prototype',
    kind: 'Reader prototype',
    channel: 'reading',
    group: 'Agency work',
    years: '2022',
    role: 'Mobile',
    stack: ['React Native', 'epub.js'],
    line: "Downloads, renders and resizes an EPUB; the start of the reading app's reader",
    summary:
      "A React Native prototype that downloads an EPUB, renders it with epub.js and resizes the text. It answered the first questions for the reading app's reader: how a book reaches the device, how pages render inside a React Native view, and how text reflows when the reader changes the font size. The full reader of the reading app grew from it.",
    links: [],
    media: {},
  },
  {
    slug: 'donation-app',
    name: 'Sadaqah app for Islamic Relief USA',
    kind: 'Donation app',
    channel: 'reading',
    group: 'Agency work',
    years: '2021–22',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'Stripe', 'Firebase'],
    line: 'Donations and subscriptions with Stripe, badges, guided tasks and video',
    summary:
      'Sadaqah is a donation and good-deeds app for Islamic Relief USA, built in React Native for iOS and Android by a small team. People donate or subscribe through Stripe, follow guided tasks, earn badges with their progress, and watch video inside the app. Work on the team covered the payment and subscription screens, including cancelling a subscription, the badges, in-app web views and the Android builds. The app is no longer in the stores.',
    links: [],
    media: { thumb: 'donation-ring' },
  },
  {
    slug: 'coaching-app',
    name: 'Coaching app',
    kind: 'Mobile app',
    channel: 'reading',
    group: 'Agency work',
    years: '2022–23',
    role: 'Mobile',
    stack: ['React Native', 'Redux Toolkit', 'React Navigation'],
    line: 'Organization sign-in, a daily calendar strip, reactions, and dev, staging and release builds',
    summary:
      'A React Native coaching app. People sign in through their organization, see the day on a calendar strip, and leave reactions. The project has separate development, staging and release builds. Navigation uses React Navigation, and Redux Toolkit holds the app state.',
    links: [],
    media: { thumb: 'calendar-strip' },
  },
  {
    slug: 'fuel-loyalty-app',
    name: 'Fuel-station loyalty app',
    kind: 'Mobile app upkeep',
    channel: 'reading',
    group: 'Agency work',
    years: '2026',
    role: 'Mobile',
    stack: ['React Native 0.78'],
    line: 'Loyalty app upkeep: arm64 simulator support, legacy architecture, shadow fixes',
    summary:
      'Upkeep of a React Native 0.78 loyalty app for fuel stations. The work added support for arm64 simulators, kept the app on the legacy React Native architecture, and fixed shadows that rendered incorrectly.',
    links: [],
    media: {},
  },
  {
    slug: 'incentiv',
    name: 'Incentiv',
    kind: 'Smart-wallet dashboard',
    channel: 'web3',
    group: 'Incentiv',
    years: '2024',
    role: 'Frontend, UI layer',
    stack: ['Next.js 14', 'RTK Query', 'next-intl', 'Framer Motion'],
    line: 'Wallet dashboard with passkey sign-in, balance and QR, onboarding, EN/FR',
    summary:
      "Incentiv's portal is a smart-wallet dashboard where people and businesses manage an on-chain wallet and incentive programs. The frontend is built on Next.js 14 with the App Router and RTK Query: passkey and wallet sign-in UI, animated onboarding, dashboard cards, an asset list, a balance popup with a QR address, route middleware, and English and French translations. Teammates built the wallet and blockchain layer.",
    links: incentivLinks,
    media: {
      shot: { src: '/showcase/incentiv/thumb.webp', alt: 'Incentiv portal sign-in, public screen: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect' },
      galleries: [incentivGallery],
    },
    featured: {
      order: 5,
      monitor: 'gallery',
    },
  },
  {
    slug: 'member-portal',
    name: 'Member portal, web',
    kind: 'Web app foundation',
    channel: 'ai',
    group: 'Agency work',
    years: '2025',
    role: 'Frontend',
    stack: ['Next.js 15', 'TypeScript', 'RTK Query', 'next-intl', 'Pusher'],
    line: 'Member portal foundation: protected routes, external sign-in, app shell and layout',
    summary:
      'The foundation of a member portal on Next.js 15 and TypeScript: protected routes, sign-in through an external identity provider, an app shell and a layout that later screens build on. RTK Query handles data fetching, next-intl handles translations, and Pusher brings realtime updates.',
    links: [],
    media: { thumb: 'portal-shell' },
  },
  {
    slug: 'ai-dashboard',
    name: 'Smart business dashboard with AI',
    kind: 'AI dashboard',
    channel: 'ai',
    group: 'AvahiTech',
    years: null,
    role: 'Frontend, FastAPI',
    stack: ['React', 'Python/FastAPI'],
    line: 'Business dashboard with AI headshot generation and a PDF-to-chat assistant',
    summary:
      'A smart business dashboard for a digital-transformation client. Its AI features help staff with daily work: a headshot generator that turns uploaded photos into professional profile photos, and a workplace assistant that answers questions about uploaded PDF documents. The React frontend covers the dashboard and both AI flows, from photo upload to generated headshots and from PDF upload to a chat about the document. Some backend features were added in Python with FastAPI.',
    links: [],
    media: { thumb: 'doc-chat', recreation: 'doc-chat' },
  },
  {
    slug: 'offbeat',
    name: 'OFFBEAT',
    kind: 'Speaker brand concept',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Three.js', 'Web Audio'],
    line: 'Fictional speaker concept: 3D model, exploded view, working drum-machine studio',
    summary:
      'OFFBEAT is a fictional portable-speaker brand, made as a portfolio concept with Next.js 16, React 19, TypeScript and Three.js. A custom 3D speaker turns by drag or arrow keys, with four finishes and an exploded view of its parts. The sound studio is a working eight-step Web Audio drum machine with presets, tempo and swing; a groove shares as a link or downloads as a WAV loop.',
    links: [offbeatLink],
    media: {
      shot: { src: '/personal/shots/thumbs/offbeat.webp', alt: 'OFFBEAT home: a hot-orange portable speaker in 3D beside the line Plays your songs. Makes its own.' },
      galleries: [
        {
          title: 'OFFBEAT',
          aspect: 'web',
          links: [offbeatLink],
          items: [
            web('/personal/shots/offbeat-home-desktop.webp', 'OFFBEAT home: a hot-orange portable speaker in 3D with finish swatches and the line Plays your songs. Makes its own.', 'The speaker'),
            web('/personal/shots/offbeat-studio-desktop.webp', 'OFFBEAT sound studio while it plays: an eight-step drum machine with kick, snare, hi-hat and bass rows, the playing step in red, tempo, volume and a swing dial', 'Sound studio'),
            web('/personal/shots/offbeat-design-desktop.webp', 'OFFBEAT By design: the speaker pulled apart into its grille, two drivers and the body', 'By design'),
            web('/personal/shots/offbeat-finish-desktop.webp', 'OFFBEAT finish picker: the speaker in acid yellow, with four finish choices and a Save this finish button', 'Pick a finish'),
            web('/personal/shots/offbeat-record-desktop.webp', 'OFFBEAT record sleeve: the drum pattern printed as dots on a yellow sleeve, with Download loop, Save sleeve and Share groove buttons', 'Your record'),
            phone('/personal/shots/offbeat-phone.webp', 'OFFBEAT home on a phone with the 3D speaker', 'On a phone'),
          ],
        },
      ],
    },
  },
  {
    slug: 'form',
    name: 'FORM',
    kind: 'Sculpture exhibition concept',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['WebGL', 'Vanilla JS'],
    line: 'Fictional sculpture exhibition: three mathematical forms, live materials, word-cast sculptures',
    summary:
      'FORM is a fictional digital sculpture exhibition with no runtime dependencies. Three original mathematical sculptures, a trefoil knot, a ring and a folded surface, render live in WebGL in copper, chrome and porcelain. Visitors turn them with inertia, twist the surface with a handle, and type a word to cast a sculpture; a link restores the exact study, and a poster downloads as a PNG.',
    links: [formLink],
    media: {
      shot: { src: '/personal/shots/thumbs/form.webp', alt: 'FORM home: a copper trefoil sculpture beside the title Objects of imagination.' },
      galleries: [
        {
          title: 'FORM',
          aspect: 'web',
          links: [formLink],
          items: [
            web('/personal/shots/form-home-desktop.webp', 'FORM home: a copper trefoil knot sculpture, the title Objects of imagination. and material swatches', 'The exhibition'),
            web('/personal/shots/form-studio-desktop.webp', 'FORM collection: the Trefoil in copper and the Orbit in chrome, each with its formula and notes', 'The collection'),
            web('/personal/shots/form-chrome-desktop.webp', 'FORM home in chrome: the Orbit ring in chrome, and the page accent turns blue to match the material', 'Chrome'),
            web('/personal/shots/form-cast-desktop.webp', 'FORM word cast: the word velvet cast as a chrome Bloom sculpture in the studio, with its code number and controls', 'Cast a word'),
            phone('/personal/shots/form-phone.webp', 'FORM home on a phone with the copper trefoil', 'On a phone'),
          ],
        },
      ],
    },
  },
  {
    slug: 'snaxx-tech',
    name: 'Snaxx Tech',
    kind: 'Studio website',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['React 19', 'Vite', 'Tailwind'],
    line: 'Animated illustration, cinemagraph loop and strict CSP; images 972 KB to 337 KB',
    summary:
      'Snaxx Tech is the marketing site of an indie app studio, built with React 19, Vite and Tailwind. It has an animated Almanac illustration, a seamless cinemagraph video loop, and it runs on Vercel under a strict content security policy. Images went from 972 KB to 337 KB, and the deploy went from 28 MB to 9.5 MB.',
    links: [snaxxLink],
    media: {
      shot: { src: '/personal/shots/thumbs/snaxx.webp', alt: 'Snaxx Tech studio site hero, The Snaxx Almanac illustrated landscape' },
      galleries: [
        {
          title: 'Snaxx Tech',
          aspect: 'web',
          links: [snaxxLink],
          items: [
            web('/personal/shots/snaxx-desktop.webp', 'Snaxx Tech studio site hero, The Snaxx Almanac illustrated landscape of apps and games', 'Hero'),
            phone('/personal/shots/snaxx-phone.webp', 'Snaxx Tech studio site hero on a phone, The Snaxx Almanac with the Useful Apps Workshop', 'Hero on a phone'),
          ],
        },
      ],
    },
  },
  {
    slug: 'offday',
    name: 'Offday',
    kind: 'Time-off app',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Built with one other developer',
    stack: ['Next.js 16', 'SQLite', 'Zod', 'Playwright'],
    line: 'Time off for teams: approvals, shared calendar, shift cover, best-dates planner, AI assistant',
    summary:
      'Offday is a multi-tenant time-off app built with Next.js 16, SQLite and Zod. Employees request leave, managers approve it, and the team calendar shows who is away, with drag-select to pick dates. Shifts warn when a person on leave leaves a shift without cover, "Find the best dates" suggests the longest breaks, and "Time to rest" shows who has had no real break. Public holidays load in one click, new people get emailed sign-in details, and a streaming AI assistant answers questions about the team. About 200 Playwright tests cover the flows, including security and tenant isolation.',
    links: [],
    media: {
      shot: { src: '/personal/shots/thumbs/offday-app.webp', alt: 'Offday team calendar for October with leave bars' },
      galleries: [
        {
          title: 'Offday',
          aspect: 'web',
          links: [],
          items: [
            web('/personal/shots/offday-light-landing-desktop.webp', 'Offday landing page hero, Time off without the back-and-forth, with buttons to create a workspace or try the live demo', 'Landing page'),
            web('/personal/shots/offday-light-calendar-desktop.webp', 'Offday team calendar for October 2026 in the demo workspace, with leave bars, a public holiday and the approval queue', 'Team calendar'),
            web('/personal/shots/offday-light-drag-select-desktop.webp', 'Offday calendar for November 2026 with four days selected by a drag, public holidays marked and the Time to rest card', 'Drag to pick dates'),
            web('/personal/shots/offday-light-best-dates-desktop.webp', 'Offday request form with Find the best dates open, suggesting breaks around Veterans Day, Thanksgiving and Christmas', 'Find the best dates'),
            web('/personal/shots/offday-light-approvals-desktop.webp', 'Offday Requests page with three pending requests, Approve and Decline buttons, Needs cover labels and Export to Excel', 'Approvals'),
            web('/personal/shots/offday-light-shifts-desktop.webp', 'Offday Shifts week grid with morning and evening shifts, two of them flagged Needs cover because the person is on leave', 'Shifts'),
            web('/personal/shots/offday-light-assistant-desktop.webp', 'Offday workspace assistant answering who is off today and who is off next week, beside the team calendar', 'Workspace assistant'),
            web('/personal/shots/offday-light-holidays-desktop.webp', 'Offday Holidays page with the 2026 United States public holidays added in one click', 'Public holidays'),
            phone('/personal/shots/offday-light-calendar-phone.webp', 'Offday team calendar on a phone, with the request button, team counts and October leave bars', 'Calendar on a phone'),
            phone('/personal/shots/offday-light-best-dates-phone.webp', 'Offday Find the best dates suggestions on a phone, with breaks around public holidays', 'Best dates on a phone'),
            web('/personal/shots/offday-dark-calendar-desktop.webp', 'Offday team calendar in the dark theme, October leave bars and the approval queue', 'Team calendar, dark'),
          ],
        },
      ],
    },
  },
  {
    slug: 'geo-guesser',
    name: 'Geo Guesser World 3D',
    kind: 'Mobile game',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Mobile, co-built',
    stack: ['Expo', 'React Native', 'MapLibre', 'Mapillary'],
    line: 'Street-view guessing game, published on Google Play',
    summary:
      'Geo Guesser World 3D is a street-view guessing game, co-built and published on Google Play. Players look at a street-level scene, guess where it is on a map, and see the guess and the answer joined by a line. It is built with Expo and React Native, with MapLibre for the map and Mapillary for the street imagery.',
    links: [{ label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.snaxxtech.geoguesser' }],
    media: {
      shot: {
        src: '/mobile/thumbs/geoguesser.webp',
        alt: 'Geo Guesser store screenshot: dark map with the guess and the answer joined by a dashed line',
      },
    },
  },
  {
    slug: 'fjale',
    name: 'FJALË',
    kind: 'Word game',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['Vanilla JS', 'PWA'],
    line: 'Daily Albanian word game, 21k-word dictionary, archive, offline play; live on the web',
    summary:
      'FJALË is a daily Albanian word game that runs in the browser and installs as a progressive web app. Each day brings a new five-letter word, checked against a 21,000-word dictionary, with an Albanian keyboard and a hint panel. An archive lets players replay earlier days, and the game works offline. It is written in vanilla JavaScript and is live on the web.',
    links: [fjaleLink],
    media: {
      shot: { src: '/personal/shots/thumbs/fjale.webp', alt: 'FJALË word game board with Albanian keyboard' },
      galleries: [
        {
          title: 'FJALË',
          aspect: 'web',
          links: [fjaleLink],
          items: [
            web('/personal/shots/fjale-desktop.webp', 'FJALË word game board, five-letter grid with Albanian keyboard and hint panel', 'Board'),
            phone('/personal/shots/fjale-phone.webp', 'FJALË word game board on a phone, five-letter grid above the Albanian keyboard', 'Board on a phone'),
          ],
        },
      ],
    },
  },
  {
    slug: 'za',
    name: 'Za!',
    kind: 'Multiplayer card game',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['Node', 'WebSocket'],
    line: 'Multiplayer pizza card game for 2–8 players, server-authoritative with bots; live',
    summary:
      'Za! is a multiplayer pizza card game for two to eight players, live on the web. A Node server runs every game and decides each move, so the clients send what a player wants to do and render the state they receive. Players create or join a table from the lobby, and bots fill empty seats. Play runs in realtime over WebSockets.',
    links: [zaLink],
    media: {
      shot: { src: '/personal/shots/thumbs/za.webp', alt: 'Za! card game lobby with pixel logo' },
      galleries: [
        {
          title: 'Za!',
          aspect: 'web',
          links: [zaLink],
          items: [
            web('/personal/shots/za-desktop.webp', 'Za! multiplayer card game lobby, pixel logo with new-table and join-table controls', 'Lobby'),
            phone('/personal/shots/za-phone.webp', 'Za! multiplayer card game lobby on a phone, pixel logo and table controls', 'Lobby on a phone'),
          ],
        },
      ],
    },
  },
  {
    slug: 'morse-trainer',
    name: 'Morse Trainer',
    kind: 'Learning game',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['JavaScript'],
    line: 'Morse-code learning game with spaced repetition and Farnsworth timing; live',
    summary:
      'Morse Trainer is a Morse-code learning game, live on the web. It teaches letters with spaced repetition, so the letters a player misses come back sooner, and it uses Farnsworth timing, which plays each character at full speed and adds space between characters. The interface is an amber terminal with a Learn mode and an incoming-signal display. It is written in JavaScript.',
    links: [morseLink],
    media: {
      shot: { src: '/personal/shots/thumbs/morse.webp', alt: 'Morse Trainer amber terminal in Learn mode' },
      galleries: [
        {
          title: 'Morse Trainer',
          aspect: 'web',
          links: [morseLink],
          items: [
            web('/personal/shots/morse-desktop.webp', 'Morse Trainer amber terminal, letter list and incoming signal in Learn mode', 'Learn mode'),
            phone('/personal/shots/morse-phone.webp', 'Morse Trainer amber terminal on a phone, incoming signal in Learn mode', 'Learn mode on a phone'),
          ],
        },
      ],
    },
  },
  {
    slug: 'futurisma',
    name: 'Futurisma',
    kind: '3D racing game',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['Three.js', 'TypeScript', 'Blender'],
    line: 'Hover racer with seven circuits and weather, tide and day-night systems',
    summary:
      'Futurisma is a hover racer built with Three.js and TypeScript, with models made in Blender. It has seven circuits, and weather, tide and day-night systems change the look and light of each circuit. It is a personal project that explores real-time 3D in the browser: scene loading, lighting and a steady frame rate while the environment changes.',
    links: [],
    media: { thumb: 'track' },
  },
  {
    slug: 'secret-dictator',
    name: 'Secret Dictator',
    kind: '3D social-deduction game',
    channel: 'personal',
    group: 'Personal',
    years: '2026',
    role: 'Owner',
    stack: ['Three.js', 'TypeScript'],
    line: 'Single-player social-deduction game against AI opponents in a 3D town',
    summary:
      'Secret Dictator is a single-player social-deduction game set in a 3D town, built with Three.js and TypeScript. The player faces AI opponents in a game of hidden roles, so each round is about reading their choices to decide whom to trust. It is a personal project about game AI and real-time 3D in the browser, from the town scene to the opponents that play against the player.',
    links: [],
    media: { thumb: 'town' },
  },
  {
    slug: 'open-source-forks',
    name: 'Open-source forks',
    kind: 'React Native libraries',
    channel: 'personal',
    group: 'Personal',
    years: '2022',
    role: 'Maintainer',
    stack: ['React Native'],
    line: 'Forks of epubjs-react-native and react-native-pdf, used in a production reading app',
    summary:
      'Maintained forks of two React Native libraries, epubjs-react-native and react-native-pdf. A production reading app depends on both for its EPUB and PDF reader, so the forks carry the fixes that the app needs and keep the libraries working as React Native moves forward. Both forks are public on GitHub, under the same account as the rest of this work.',
    links: [githubLink],
    media: { thumb: 'fork' },
  },
]

/* ---------- Derived views ---------- */

/** The five tuned-in channels, in switcher order. */
export const featuredProjects: Project[] = projects
  .filter((project) => project.featured)
  .sort((a, b) => (a.featured?.order ?? 0) - (b.featured?.order ?? 0))

export function findProject(slug: string | undefined): Project | undefined {
  return slug ? projects.find((project) => project.slug === slug) : undefined
}

/** The featured project after this one, wrapping to the first. */
export function nextFeatured(project: Project): Project {
  const index = featuredProjects.findIndex((item) => item.slug === project.slug)
  return featuredProjects[(index + 1) % featuredProjects.length]
}

/** The recreation palette for a channel. Personal work has none. */
export function worldOf(project: Project): PageWorld {
  return project.channel === 'personal' ? 'base' : project.channel
}

export function caseHref(project: Project): string {
  return `/work/${project.slug}`
}

export const groupPeriods: Record<ProjectGroupName, string | undefined> = {
  Vianova: '2021–now',
  'Agency work': '2021–26',
  Incentiv: '2024',
  AvahiTech: 'Freelance',
  Personal: undefined,
}

export const firstYear = 2021
export const currentYear = 2026
