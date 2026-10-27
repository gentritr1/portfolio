/**
 * Case-study pages in the brief's order: context, question, constraints, what didn't work, the decision,
 * the result, what I'd do differently, then expandable engineering details. Facts come from CONTENT.md,
 * caseNarratives.ts, THE LOOP's sourced data (SPEC.md cites the commits and tests) and the owner's own
 * answers (2026-10-11). A section the sources cannot answer is left out (`undefined`), never written for him.
 */
import { stations, testLines, checkRows } from '../the-loop/data'
import { cases, type LayerId } from './data'

export interface DiagramLayer {
  title: string
  stack: string
  note: string
  layer: LayerId
}

export interface CaseDetail {
  slug: string
  context: { product: string; users: string; role: string; time: string }
  constraints: string[]
  /** What was tried or found first, and why it didn't work. */
  didntWork?: { label: string; text: string }
  decision: string[]
  result: string
  differently?: string
  diagram: DiagramLayer[]
  engineering: { title: string; items: string[] }[]
  /** A real record from the work, shown as plain lines. */
  record?: { title: string; rows: { when: string; what: string; lines: string[] }[] }
  links: { label: string; href: string }[]
}

export const caseDetails: Record<string, CaseDetail> = {
  'care-platform': {
    slug: 'care-platform',
    context: {
      product: 'A care-management platform for remote patient monitoring (RPM) and chronic care management (CCM).',
      users: 'Care teams in many client organizations, who use it every day for vitals, care plans, labs, billing claims and calls.',
      role: 'Frontend on the Vue app since 2023, then the move to React and the rules and merge gates it runs inside; the Laravel API since 2026.',
      time: '2023 to now; the React migration since 2026',
    },
    constraints: [
      'Live product: care teams depend on it every day, so nothing can break while it moves.',
      'One multi-tenant system shared by many organizations, each with its own data, roles and timezones.',
      'Four languages: English, German, Spanish and Turkish.',
      'A large Nuxt 2 (Vue 2) codebase with behaviour that was never written down.',
      'The platform went through a SOC 2 audit.',
    ],
    didntWork: {
      label: 'One check that failed, and why that was right',
      text: 'On the patient compliance screen, the route-rules check failed before merge: the plan still listed the route as not started, but React code already owned it. The work went back, the plan was fixed, and the same check passed.',
    },
    decision: [
      'Move one route at a time, never the whole app.',
      'Write down every behaviour of the old screen first. Old bugs are written down, not copied.',
      'Write the test on the old app before any new code. The same test file then runs against both apps.',
      'AI agents build inside written rules. Automatic checks decide. A person approves each change.',
    ],
    result: 'One screen went from first note to merged in one working day, and the same test passed on both apps.',
    diagram: [
      { title: 'The interface', stack: 'React 19 · TypeScript', note: 'One route at a time, from Vue to React', layer: 'interface' },
      { title: 'The boundaries', stack: 'TanStack Query · Zustand · Zod', note: 'Tenant data, roles and timezones, parity-tested', layer: 'data' },
      { title: 'The backend', stack: 'Laravel · MySQL · Redis', note: 'Enrollment, labs, multi-tenant security', layer: 'api' },
      { title: 'The checks', stack: 'Vitest · Playwright · CI gates', note: 'A route moves only when its checks pass', layer: 'quality' },
    ],
    engineering: [
      { title: 'Checks on every change', items: checkRows.map((c) => `${c.name} (${c.cmd})${c.once ? ': failed once, then passed' : ''}`) },
      { title: 'From the calendar screen\'s test file', items: testLines },
    ],
    record: {
      title: 'One screen, one working day',
      rows: stations.map((s) => ({ when: s.time, what: s.name, lines: s.artefact })),
    },
    links: [],
  },

  'design-system-react': {
    slug: 'design-system-react',
    context: {
      product: 'Design System v2: the shared controls and layout parts for the new React dashboard of the care platform.',
      users: 'The developers and AI agents who build the new dashboard.',
      role: 'Frontend developer on the team that builds it.',
      time: '2026, 22 releases in 60 days',
    },
    constraints: [
      'Built to the WCAG 2.1 AA accessibility floor, with proof on a rendered screen.',
      'One source of design values for CSS, TypeScript and the Figma bundle.',
      'The dashboard that uses it is not in production yet, so claims stay at what the checks prove.',
    ],
    decision: [
      'Research first: five leading systems (Material, Carbon, Polaris, Atlassian, Primer), turned into written guides for the AI agents.',
      'The guides advise, but automatic checks decide. No guide can overrule a failed check.',
      'A check is trusted only after it is shown to fail.',
    ],
    result: '41 components, 868 design values and 22 releases in 60 days, with 96.6% less JavaScript for a page that uses only the Button.',
    diagram: [
      { title: 'Research and agents', stack: 'Research · agent guides · reviewers', note: 'Five systems studied; guides advise', layer: 'quality' },
      { title: 'Tokens and components', stack: 'DTCG tokens · React 19 · CSS Modules', note: '868 design values generate CSS, TypeScript and Figma', layer: 'interface' },
      { title: 'Evidence and adoption', stack: 'Playwright · axe · gates', note: 'Rendered contrast checks; one adapter layer', layer: 'quality' },
    ],
    engineering: [
      {
        title: 'A check shown to fail',
        items: [
          'Three pictures of the same card: expected, changed, and the difference. Only one button is one step darker.',
          "At Playwright's default tolerance of 0.2, 0 pixels differ. At tolerance 0, 13,442 pixels differ, so the check fails as it must.",
        ],
      },
      {
        title: 'From one edit to a release',
        items: ['Edit the token source', 'Build', 'Static gates', 'Rendered evidence', 'Consumer smoke test', 'Release, only after the three check jobs pass'],
      },
    ],
    links: [],
  },

  'multi-tenant': {
    slug: 'multi-tenant',
    context: {
      product: 'The same care-management platform: one system shared by many client organizations.',
      users: 'Care teams who must only ever see their own organization, and patients whose times must follow their own clock.',
      role: 'Multi-tenant work on the Vue app since 2023 and on the Laravel API since 2026.',
      time: '2023 to now',
    },
    constraints: [
      "Each organization's data stays separate on every screen and every endpoint.",
      "Each user's role decides what they can see and change.",
      "Patient times follow the patient's own timezone, even when the clocks change.",
    ],
    didntWork: {
      label: 'What was there, and why it timed out',
      text: 'A billing report read four sheets (30, 60, 90 and 180 days), and each sheet ran one patient query for every calendar month it covered: 2, 3, 4 and 7 months, so 16 queries in all. On large organizations the report timed out.',
    },
    decision: [
      'Replace the per-month patient queries with one patient query and one grouped aggregate.',
      'Fix multi-tenant security on the API: data isolation, roles and timezones.',
    ],
    result: 'The billing report went from 16 database queries to 2 and no longer times out.',
    diagram: [
      { title: 'The interface', stack: 'Vue · React', note: 'Each screen scoped to one organization', layer: 'interface' },
      { title: 'The API', stack: 'Laravel 13 · PHP 8.3', note: 'Tenant checks and roles on every request', layer: 'api' },
      { title: 'The data', stack: 'MySQL · Redis', note: 'Separated per organization', layer: 'data' },
    ],
    engineering: [
      { title: 'The report, before and after', items: ['Before: 4 sheets × their calendar months = 2 + 3 + 4 + 7 = 16 patient queries', 'After: 1 patient query + 1 grouped aggregate = 2 queries'] },
    ],
    links: [],
  },

  'read-to-feed': {
    slug: 'read-to-feed',
    context: {
      product: "Read to Feed, a children's reading app for iOS and Android.",
      users: 'Children who read, scan their own books and earn badges, and the parents who verify their accounts.',
      role: 'Mobile developer, iOS and Android.',
      time: '2022 to 2025',
    },
    constraints: [
      'Two stores and years of iOS and Android updates.',
      'Books in two formats, PDF and EPUB, rendered inside the app.',
      'Three languages.',
    ],
    didntWork: {
      label: 'What broke',
      text: 'Custom fonts in EPUB books did not render on Android through epubjs-react-native.',
    },
    decision: [
      'Fork the library and add a native WebView prop, so custom fonts render on Android.',
      'Keep maintained forks of epubjs-react-native and react-native-pdf in production, instead of waiting for upstream fixes.',
    ],
    result: 'About 14 releases to both stores, and React Native 0.63 to 0.81 through three major upgrades.',
    diagram: [
      { title: 'The app', stack: 'React Native · Redux Toolkit', note: 'Reading, quizzes, badges, three languages', layer: 'mobile' },
      { title: 'The reader', stack: 'epub.js · react-native-pdf (forks)', note: 'PDF and EPUB, fonts fixed on Android', layer: 'interface' },
      { title: 'The device', stack: 'Vision Camera · Firebase Messaging', note: 'ISBN scanning and push notifications', layer: 'api' },
    ],
    engineering: [
      { title: 'Upgrades', items: ['React Native 0.63 to 0.81, through three major upgrades', 'About 14 releases to both stores'] },
    ],
    links: [
      { label: 'epubjs-react-native and react-native-pdf forks on GitHub', href: 'https://github.com/gentritr1' },
    ],
  },
  'bayyinah-tv': {
    slug: 'bayyinah-tv',
    context: {
      product: 'Bayyinah TV, a video-learning platform: courses, a scripture reader, on-demand video and live streams.',
      users: 'Members of an online learning community, on the web and in the iOS and Android apps.',
      role: 'Frontend, on the core team of the rebuild.',
      time: '2023 to 2026',
    },
    constraints: [
      'One web app serves the browser and runs inside both native store apps.',
      'English and Arabic, with a complete right-to-left layout.',
      'Paid content: web and in-app subscriptions, gifts and promo codes.',
    ],
    decision: [
      'Rebuild the second version on Nuxt 3 from an empty template, rather than carry the first one forward.',
      'Live streams on AWS IVS with realtime chat and moderation, and an HLS player with a paywall for premium content.',
      'Stripe, Apple and Google subscriptions, gifting and promo codes in the same flow.',
    ],
    result: 'The rebuild ships 34 routes, 270+ components and 25 stores, live on the web and in both app stores, in English and Arabic.',
    diagram: [
      { title: 'The experience', stack: 'Nuxt 3 · Vue 3 · Pinia', note: 'English and Arabic, inside the store apps too', layer: 'interface' },
      { title: 'The live layer', stack: 'AWS IVS · HLS · Pusher', note: 'Player, realtime chat, moderation', layer: 'api' },
      { title: 'The membership', stack: 'Stripe · Apple · Google', note: 'Subscriptions, gifts, promo codes', layer: 'data' },
    ],
    engineering: [{ title: 'Scale of the rebuild', items: ['34 routes', '270+ components', '25 Pinia stores', 'Full right-to-left layout for Arabic'] }],
    links: [{ label: 'bayyinahtv.com', href: 'https://bayyinahtv.com/' }],
  },

  'viva-fresh': {
    slug: 'viva-fresh',
    context: {
      product: 'Viva Fresh, a grocery shopping and loyalty app for iOS and Android, in Albanian.',
      users: 'Shoppers who order groceries for delivery and collect loyalty rewards.',
      role: 'Mobile developer.',
      time: '2023',
    },
    constraints: ['One codebase for the App Store and Google Play.', 'Orders need a delivery slot and a delivery address.', 'An Albanian interface.'],
    decision: [
      'React Native with Redux Toolkit and Firebase, shipped to both stores from one codebase.',
      'Address search on a map for delivery, and delivery slots chosen at checkout.',
      'A loyalty programme and a wishlist in the same app.',
    ],
    result: 'Live in the App Store and on Google Play, taking grocery orders with a delivery slot.',
    diagram: [
      { title: 'The shop', stack: 'React Native', note: 'Categories, cart, loyalty, wishlist', layer: 'mobile' },
      { title: 'The order', stack: 'Redux Toolkit', note: 'Delivery slots through to checkout', layer: 'interface' },
      { title: 'The delivery', stack: 'Maps · Firebase', note: 'Address search on a map', layer: 'api' },
    ],
    engineering: [{ title: 'In the released app', items: ['Online orders with delivery slots', 'Loyalty programme and wishlist', 'Address search on a map'] }],
    links: [],
  },

  incentiv: {
    slug: 'incentiv',
    context: {
      product: 'The portal of a Web3 smart wallet, where people and businesses see balances, assets and transactions.',
      users: 'Wallet owners, signing in with a passkey or an external wallet.',
      role: 'Frontend developer, freelance: the portal UI. Teammates built the wallet and blockchain layer.',
      time: '2024',
    },
    constraints: ['Sign-in without a password: a passkey, MetaMask or WalletConnect.', 'Dashboard pages stay private, behind sign-in.', 'English and French.'],
    decision: [
      'Next.js 14 with the App Router and RTK Query for the portal.',
      'Route middleware keeps private pages behind sign-in.',
      'A first-run tour, dashboard cards and a balance pop-up with a QR address.',
    ],
    result: 'The portal frontend is live at portal.incentiv.io, with passkey and wallet sign-in in English and French.',
    diagram: [
      { title: 'The interface', stack: 'Next.js 14 · TypeScript', note: 'Dashboard cards, assets, QR balance', layer: 'interface' },
      { title: 'The data', stack: 'RTK Query · next-intl', note: 'Typed data, English and French', layer: 'data' },
      { title: 'The access', stack: 'Passkeys · route middleware', note: 'Sign-in and protected routes', layer: 'api' },
    ],
    engineering: [{ title: 'Scope', items: ['Portal frontend only: sign-in, first-run tour, dashboard cards, asset list, QR balance pop-up', 'Wallet and blockchain layer built by teammates'] }],
    links: [{ label: 'portal.incentiv.io', href: 'https://portal.incentiv.io/' }],
  },

  'dukagjini-bookstore': {
    slug: 'dukagjini-bookstore',
    context: {
      product: "Dukagjini Bookstore, a publisher's shopping app for iOS and Android.",
      users: 'Readers who search the catalogue, keep favourites and buy books.',
      role: 'Mobile developer.',
      time: '2021 to 2022',
    },
    constraints: ['One codebase for both stores.', 'Readers leave the app and need a reason, and a path, to come back to a book.'],
    decision: [
      'React Native with Redux for app state and Firebase Messaging for push.',
      'Each notification opens the right screen through a deep link.',
      'An animated book-detail header, swipe-to-close modals and checkout with promo codes.',
    ],
    result: 'Live in the App Store and on Google Play; push notifications with deep links bring readers back to a book.',
    diagram: [
      { title: 'The shop', stack: 'React Native · Redux', note: 'Search, categories, favourites', layer: 'mobile' },
      { title: 'The order', stack: 'Checkout · promo codes', note: 'The same flow on both platforms', layer: 'interface' },
      { title: 'The return', stack: 'Firebase Messaging · deep links', note: 'Notifications open the right screen', layer: 'api' },
    ],
    engineering: [{ title: 'Details', items: ['Push deep links to the right screen', 'Animated book-detail header', 'Swipe-to-close modals'] }],
    links: [],
  },

  futurisma: {
    slug: 'futurisma',
    context: {
      product: 'Futurisma, a hover racer for the browser with 9 circuits that change while you race, and a garage.',
      users: 'Players in the browser; it is my own project.',
      role: 'Owner. I direct a crew of AI agents and make every call on taste, commits and fun.',
      time: '2026',
    },
    constraints: [
      'A steady frame rate in the browser, inside hard budgets: Dream Island uses at most 94 of its 110 draw calls and 157,650 of 180,000 triangles.',
      'Every effect has to matter for racing, not only look good.',
      'One person decides; the agents never commit.',
    ],
    didntWork: {
      label: 'What went wrong',
      text: 'A watchtower was planned 16 m wide with a 14 m tunnel through it, which left one metre of wall each side and looked like a table on two legs. The plan was fixed, the tower rebuilt, and a rule written down: when you describe a hole, say how much wall is left. On Frostline, 1,397 props floated above the snow until one terrain mesh replaced the flat ground.',
    },
    decision: [
      'A crew with strict jobs: a planning Claude writes briefs a stranger could build from, a building Claude codes, Codex models in Blender, Higgsfield makes pictures and sound.',
      'Every result is checked by running it again, never by reading the report.',
      'No number is typed by hand if it can be measured: the clock strike sits at 2.05 laps of a lap timed by the autopilot.',
    ],
    result: 'Dream Island, map 7, was built in one week, and a terrain fix took Frostline from 1,397 floating props to 0, measured by the same audit before and after.',
    differently: 'Measure before writing a target. One polish target, a beacon visible from 624 m through fog, was written without measuring first and had to be withdrawn.',
    diagram: [
      { title: 'The game', stack: 'Three.js · TypeScript · Vite', note: '9 circuits, rivals, ghosts, a garage', layer: 'interface' },
      { title: 'The art', stack: 'Blender · Python · Higgsfield', note: 'Build scripts and painted atlases', layer: 'data' },
      { title: 'The crew', stack: 'Claude · Codex · validators', note: 'Every phase checked by re-running its tests', layer: 'quality' },
    ],
    engineering: [
      { title: 'Dream Island, by the numbers', items: ['A 2,400 m lap of 800 points, 8 gates', 'The lap that sets the clock: 32.579 s', 'Draw calls at worst: 94 of 110', 'Triangles: 157,650 of 180,000', 'Lowest a goldfish gets to the road: 8.44 m'] },
    ],
    links: [{ label: 'GitHub', href: 'https://github.com/gentritr1/futurisma' }],
  },
}

/** Every other project, for the homepage's "More work" list: a short problem line there, the question on its case page. */
export const moreCases = [
  { slug: 'bayyinah-tv', line: 'One web app for the browser and both app stores, in English and Arabic.', question: 'How do you serve the browser and both app stores from one web app, in English and Arabic?', layers: ['interface', 'api'] as LayerId[] },
  { slug: 'futurisma', line: 'A 3D racing game built with an AI crew, quality kept in hand.', question: 'How do you build a 3D racing game with an AI crew, without losing control of quality?', layers: ['interface', 'quality'] as LayerId[] },
  { slug: 'incentiv', line: 'Signing in to a Web3 wallet as simply as to a normal app.', question: 'How do you make signing in to a Web3 wallet as simple as a normal app?', layers: ['interface', 'api'] as LayerId[] },
  { slug: 'viva-fresh', line: 'A grocery shop, delivery slots and loyalty in one mobile app.', question: 'How do you fit a grocery shop, delivery slots and loyalty into one mobile app?', layers: ['mobile', 'api'] as LayerId[] },
  { slug: 'dukagjini-bookstore', line: 'Bringing readers back to a book they were looking at.', question: 'How do you bring readers back to a book they were looking at?', layers: ['mobile', 'api'] as LayerId[] },
]

/** The question that titles any case page, from the homepage cases or the "More work" list. */
export const questionOf = (slug: string) => cases.find((c) => c.slug === slug)?.question ?? moreCases.find((c) => c.slug === slug)?.question

export const caseOrder = [...cases.map((c) => c.slug), ...moreCases.map((c) => c.slug)]
