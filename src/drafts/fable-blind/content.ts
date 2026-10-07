/** Copy for the draft, taken from CONTENT.md. Nothing here is invented. */

export interface Shot {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface LinkPill {
  label: string;
  href: string;
}

export interface Readout {
  value: string;
  to?: string;
  label: string;
}

export interface Exhibits {
  title: string;
  note?: string;
  aspect: "web" | "phone";
  links: LinkPill[];
  items: Shot[];
}

export interface Chapter {
  id: string;
  n: string;
  eyebrow: string;
  title: string;
  role: string;
  years: string;
  /** Replaces the "When" label when the years are not known. */
  whenLabel?: string;
  story: [string, string];
  facts: string[];
  stack: string;
  readouts?: Readout[];
  exhibits: Exhibits[];
  resultLine?: string;
}

const web = (src: string, alt: string, caption: string): Shot => ({
  src,
  alt,
  caption,
  width: 1440,
  height: 900,
});
const phone = (src: string, alt: string, caption: string): Shot => ({
  src,
  alt,
  caption,
  width: 780,
  height: 1688,
});

export const hero = {
  name: "Gentrit Rashiti",
  roleLine: "Frontend & Mobile Developer → Full Stack",
  title: "Web and mobile products, from the first screen to release.",
  fields: "Healthcare, video streaming, e-reading and Web3.",
  secondary:
    "5+ years. Part of two platform rewrites. React, React Native, Vue, TypeScript, Laravel. Based in Kosovo, working remotely.",
  cv: "/Gentrit-Rashiti-CV.pdf",
};

/** Screens that play inside the two hero devices. Public pages, store listings, or real product screens with invented data. */
export const monitorReel: Shot[] = [
  web(
    "/showcase/care-dashboard/overview.webp",
    "Care team dashboard: patients by program and patient engagement by calls and text messages. Invented data.",
    "Care-management platform · 2026",
  ),
  web(
    "/showcase/bayyinah/web-01.webp",
    'Bayyinah TV landing page: "Quran Studies Made Simple" hero with the app on a laptop, a monitor and phones',
    "Bayyinah TV · 2023–26",
  ),
  web(
    "/personal/shots/offday-light-calendar-desktop.webp",
    "Offday team calendar for October 2026 in the demo workspace, with leave bars, a public holiday and the approval queue",
    "Offday · 2026",
  ),
  web(
    "/showcase/incentiv/web-03.webp",
    "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
    "Incentiv · 2024",
  ),
];

export const phoneReel: Shot[] = [
  phone(
    "/mobile/reading-1.webp",
    "Read to Feed store screenshot: My Books list with reading progress for The Tale of Peter Rabbit and Anne of Green Gables",
    "Read to Feed · 2022–25",
  ),
  phone(
    "/showcase/bayyinah/store-01.webp",
    'App Store frame: "Quran Studies Made Simple" with the Bayyinah TV home screen on an iPhone',
    "Bayyinah TV app · 2023–26",
  ),
  phone(
    "/mobile/bookstore-1.webp",
    "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale",
    "Dukagjini Bookstore · 2021–22",
  ),
  phone(
    "/mobile/grocery-1.webp",
    "Viva Fresh store screenshot on iPhone: home with product categories and latest products, Albanian interface",
    "Viva Fresh · 2023",
  ),
];

export const capabilities: Array<[string, string]> = [
  [
    "Rewrites & migrations",
    "Move a live app to a new framework step by step, with parity checks.",
  ],
  [
    "Mobile apps",
    "iOS and Android, from build to store release and major upgrades.",
  ],
  [
    "Multi-tenant platforms",
    "Separate data, roles and permissions for each client.",
  ],
  [
    "Streaming & media",
    "Live streams, realtime chat, video on demand, PDF and EPUB reading.",
  ],
  ["Payments", "Web and in-app subscriptions, gifts, promo codes."],
  [
    "AI features",
    "Document chat, AI image generation, AI-assisted QA automation.",
  ],
  ["Full stack", "APIs, databases, background jobs, performance."],
];

export const aiLine =
  "Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change.";

export const howItIsBuilt = {
  text: "Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change. Old bugs are written down, not copied.",
  proof: "A check is trusted only after it is shown to fail.",
  steps: ["Old app", "Test first", "Agents build", "Checks", "Person approves"],
  back: "A check fails? Back to the agents.",
  caption:
    "The same test passed on both apps. Patient compliance list, September 2026.",
};

const bayyinah = {
  website: { label: "Website", href: "https://bayyinahtv.com/" },
  appStore: {
    label: "App Store",
    href: "https://apps.apple.com/us/app/bayyinah-tv/id1530635769",
  },
  googlePlay: {
    label: "Google Play",
    href: "https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah",
  },
  institute: { label: "Institute website", href: "https://bayyinah.org/" },
};

export const chapters: Chapter[] = [
  {
    id: "healthcare",
    n: "01",
    eyebrow: "Healthcare · Care management · Web + backend",
    title: "A care-management platform, being rebuilt one screen at a time",
    role: "Web and mobile; since 2026 also the server",
    years: "2021 – present",
    story: [
      "A care-management platform for remote patient monitoring. Care teams use it to follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations share one multi-tenant system, so each screen keeps each organization's data separate and respects each user's role.",
      "The frontend is moving from Vue (Nuxt 2) to React route by route, with parity tests that run each scenario against both apps, decision records and automated quality gates, on Design System v2. The Laravel backend gained enrollment drafts, a lab catalog and multi-tenant security fixes; one billing report went from 16 queries to 2.",
    ],
    facts: [
      "Vue → React rewrite, route by route, parity-tested",
      "Decision records, automated quality gates, AI agents with independent review",
      "Built on Design System v2 (36 components)",
      "Patient profile, care plans, labs and vitals, claims, calls",
      "Multi-tenant: data separation, roles, timezones",
      "Laravel API: enrollment drafts, lab catalog, security fixes",
      "Report query 16 → 2, no more timeouts",
      "4 languages: EN, DE, ES, TR",
    ],
    stack:
      "React 19, TypeScript, TanStack Query/Router, Zustand, Zod, Tailwind, Vitest, Playwright · Laravel 13, PHP 8.3, MySQL, Redis, Pest · Twilio, Chime, Pusher, ECharts",
    readouts: [
      { value: "16", to: "2", label: "Queries in one billing report" },
      { value: "4", label: "Languages: EN, DE, ES, TR" },
      { value: "36", label: "Design-system components underneath" },
    ],
    exhibits: [
      {
        title: "Real product screens",
        note: "Invented data",
        aspect: "web",
        links: [],
        items: [
          web(
            "/showcase/care-dashboard/overview.webp",
            "Care team dashboard: patients by program and patient engagement by calls and text messages. Invented data.",
            "Care team dashboard",
          ),
          web(
            "/showcase/care-dashboard/rpm-overview-cgm.webp",
            "Glucose overview for one patient: time in range, average, highest and lowest values, device usage, and one day's glucose curve. Invented data.",
            "Glucose overview",
          ),
          web(
            "/showcase/care-dashboard/claims.webp",
            "Claims for one month: counts by status, filters for updated claims and claims that need attention, and each claim with its program, CPT codes and status. Invented data.",
            "Claims",
          ),
          web(
            "/showcase/care-dashboard/appointments-week.webp",
            "Care team calendar for one week: calls, video calls and office visits for each patient. Invented data.",
            "Care team calendar",
          ),
        ],
      },
    ],
  },
  {
    id: "design-system",
    n: "02",
    eyebrow: "Design system · Tokens · React",
    title: "Design System v2: 36 components from 805 tokens",
    role: "Design system",
    years: "2026",
    story: [
      "A token-driven React component library for the new dashboard of the care-management platform. 805 design tokens in three tiers, core, semantic and component, come from one source that generates CSS, TypeScript and a Figma bundle. 36 components shipped in 20 releases in about six weeks, built to WCAG 2.1 AA floors with automated, rendered evidence.",
      "Research into five leading design systems came first. Gentrit turned it into written guides for AI agents. The guides advise, but automatic checks decide. A person approves each change. The new React dashboard uses the system across its screens through one adapter layer; a gate keeps raw colours and native controls out.",
    ],
    facts: [
      "36 components",
      "805 design tokens in three tiers: core, semantic, component",
      "One token source → CSS, TypeScript and a Figma bundle",
      "20 releases in about six weeks",
      "96.6% less JavaScript for a Button-only consumer",
      "WCAG 2.1 AA floors with automated, rendered evidence",
      "No guide can overrule a failed check",
    ],
    stack:
      "React 19, TypeScript, CSS Modules, Storybook 10, DTCG tokens, Playwright, axe",
    readouts: [
      { value: "36", label: "Components" },
      { value: "805", label: "Design tokens in three tiers" },
      { value: "20", label: "Releases in about six weeks" },
      { value: "96.6%", label: "Less JavaScript for a Button-only consumer" },
    ],
    exhibits: [
      {
        title: "From the Storybook",
        note: "Invented data",
        aspect: "web",
        links: [],
        items: [
          {
            src: "/showcase/design-system/date-range-picker.webp",
            alt: "Design System v2 date range picker in its Storybook, open: presets from Today to All time, June and July 2026 side by side, a range from June 22 to July 9, the start and end dates as text, and Cancel and Apply buttons. Invented data.",
            caption: "Date range picker",
            width: 780,
            height: 488,
          },
          {
            src: "/showcase/design-system/button-alert.webp",
            alt: "Design System v2 buttons and alerts: filled, outlined and text buttons with placeholder labels, then five alert tones from neutral to error, each with a title and one line of placeholder text.",
            caption: "Buttons and five alert tones",
            width: 1440,
            height: 1192,
          },
        ],
      },
    ],
  },
  {
    id: "streaming",
    n: "03",
    eyebrow: "Streaming · Subscriptions · Web",
    title: "A video-learning platform, rebuilt from scratch with live streams",
    role: "Frontend, core team",
    years: "2023 – 2026",
    story: [
      "A video-learning platform for an online community: courses, playlists, learning progress, a scripture reader, on-demand video and live streams. Members pay through web and in-app subscriptions, gifts and promo codes. The same web app also runs inside the native mobile app.",
      "Its second version was a full rebuild on Nuxt 3, from an empty template. It added live streaming with realtime chat and moderation, an HLS player with a paywall for premium content, Stripe, Apple and Google subscriptions, gifting, and an English/Arabic interface with right-to-left layout. The rebuild covers 34 routes and 270+ components.",
    ],
    facts: [
      "Full rebuild on Nuxt 3",
      "Live streaming with realtime chat and moderation",
      "HLS player with quality selector and premium paywall",
      "Stripe, Apple and Google subscriptions, gifting, promo codes",
      "34 routes, 270+ components, 25 stores",
      "English and Arabic, right-to-left layout",
      "Same web app runs inside the native mobile app",
    ],
    stack:
      "Nuxt 3, Vue 3, TypeScript, Pinia, video.js + HLS, AWS IVS, Pusher, Stripe, Firebase, Tailwind",
    readouts: [
      { value: "34", label: "Routes in the Nuxt 3 rebuild" },
      { value: "270+", label: "Components, 25 stores" },
      { value: "EN / AR", label: "Right-to-left layout" },
    ],
    exhibits: [
      {
        title: "Bayyinah TV, website",
        aspect: "web",
        links: [bayyinah.website],
        items: [
          web(
            "/showcase/bayyinah/web-01.webp",
            'Bayyinah TV landing page: "Quran Studies Made Simple" hero with the app on a laptop, a monitor and phones',
            "Landing page",
          ),
          web(
            "/showcase/bayyinah/web-02.webp",
            "Bayyinah TV library, Subject tab: library tabs, search, filters and a row of course cards",
            "Library",
          ),
          web(
            "/showcase/bayyinah/web-05.webp",
            "Bayyinah TV series page: episode list in a side column, series summary and video cards",
            "Series page",
          ),
          web(
            "/showcase/bayyinah/web-06.webp",
            'Bayyinah TV pricing: "Choose Your Plan" with a monthly and annual switch and the Premium plan',
            "Pricing",
          ),
        ],
      },
      {
        title: "Bayyinah TV, mobile app",
        aspect: "phone",
        links: [bayyinah.appStore, bayyinah.googlePlay],
        items: [
          phone(
            "/showcase/bayyinah/store-01.webp",
            'App Store frame: "Quran Studies Made Simple" with the Bayyinah TV home screen on an iPhone',
            "Home",
          ),
          phone(
            "/showcase/bayyinah/store-02.webp",
            'App Store frame: "Study the Quran Surah by Surah" with the surah list and the video player',
            "Surah by surah",
          ),
          phone(
            "/showcase/bayyinah/store-05.webp",
            'App Store frame: "Pick Up Anytime" with the My Learning progress dashboard',
            "My Learning",
          ),
          phone(
            "/showcase/bayyinah/store-06.webp",
            'App Store frame: "Learn Your Way" with the audio and video player on two iPhones',
            "Audio and video",
          ),
        ],
      },
      {
        title: "Institute website",
        note: "One-page Next.js site, 2024–25",
        aspect: "web",
        links: [bayyinah.institute],
        items: [
          web(
            "/showcase/bayyinah/org-01.webp",
            'Bayyinah Foundation home: "Help Us Spread Quranic Knowledge" hero with a Join the Mission button and store badges',
            "Home",
          ),
          web(
            "/showcase/bayyinah/org-03.webp",
            'Bayyinah Foundation "Research Funding Opportunities" section with three photos',
            "Research funding",
          ),
          web(
            "/showcase/bayyinah/org-04.webp",
            'Bayyinah Foundation impact banner: "Together, we can empower individuals" over a city photo',
            "Your impact",
          ),
        ],
      },
    ],
  },
  {
    id: "reading",
    n: "04",
    eyebrow: "Mobile · iOS + Android · Reading",
    title: "A children's reading app, four years of releases",
    role: "Mobile, iOS and Android",
    years: "2021 – 2025",
    story: [
      "A children's reading app for iOS and Android. Children read books, scan their own books by barcode, take quizzes as chat conversations, and earn badges and streaks. Parents verify accounts by email.",
      "The app has a PDF and EPUB reader with progress tracking, an ISBN barcode scanner, gamification with badges, streaks and coach marks, push notifications with a notification center, and three languages. About 14 releases went to both stores, and the app moved from React Native 0.63 to 0.81 through three major upgrades.",
    ],
    facts: [
      "PDF and EPUB reader with progress tracking",
      "ISBN barcode scanning with the camera",
      "Badges, streaks, quizzes, coach marks",
      "Push notifications, deep links, notification center",
      "About 14 store releases, RN 0.63 → 0.81",
      "3 languages",
    ],
    stack:
      "React Native, React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next",
    readouts: [
      { value: "≈14", label: "Releases to both stores" },
      {
        value: "0.63",
        to: "0.81",
        label: "React Native, three major upgrades",
      },
      { value: "3", label: "Languages" },
    ],
    exhibits: [
      {
        title: "Read to Feed",
        note: "Store listings are removed; the links open archived captures",
        aspect: "phone",
        links: [
          {
            label: "App Store (archived)",
            href: "https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765",
          },
          {
            label: "Google Play (archived)",
            href: "https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf",
          },
        ],
        items: [
          phone(
            "/mobile/reading-1.webp",
            "Read to Feed store screenshot: My Books list with reading progress for The Tale of Peter Rabbit and Anne of Green Gables",
            "My Books",
          ),
          phone(
            "/mobile/reading-2.webp",
            "Read to Feed store screenshot: achievements screen with eggs collected and quiz badges",
            "Achievements",
          ),
          phone(
            "/mobile/reading-3.webp",
            "Read to Feed store screenshot: chapter reader with a Keep Reading sheet and the mascot",
            "Reader",
          ),
          phone(
            "/mobile/reading-4.webp",
            "Read to Feed store screenshot: New Badge pop-up for 50,000 eggs",
            "New badge",
          ),
        ],
      },
      {
        title: "Dukagjini Bookstore",
        note: "React Native shopping app for a publisher, 2021–22",
        aspect: "phone",
        links: [
          {
            label: "App Store",
            href: "https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342",
          },
          {
            label: "Google Play",
            href: "https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks",
          },
        ],
        items: [
          phone(
            "/mobile/bookstore-1.webp",
            "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale",
            "Home",
          ),
          phone(
            "/mobile/bookstore-2.webp",
            "Dukagjini Bookstore store screenshot: foreign books list with ratings, prices and favourites",
            "Foreign books",
          ),
          phone(
            "/mobile/bookstore-3.webp",
            "Dukagjini Bookstore store screenshot: sheet with favourite lists and book categories",
            "Favourites",
          ),
        ],
      },
      {
        title: "Viva Fresh",
        note: "Grocery shopping and loyalty app, 2023",
        aspect: "phone",
        links: [
          {
            label: "App Store",
            href: "https://apps.apple.com/us/app/viva-fresh/id1580739480",
          },
          {
            label: "Google Play",
            href: "https://play.google.com/store/apps/details?id=com.zs.vivafresh",
          },
        ],
        items: [
          phone(
            "/mobile/grocery-1.webp",
            "Viva Fresh store screenshot on iPhone: home with product categories and latest products, Albanian interface",
            "Home",
          ),
          phone(
            "/mobile/grocery-2.webp",
            "Viva Fresh store screenshot on iPhone: Fresh category with a product grid and the cart total",
            "Fresh",
          ),
          phone(
            "/mobile/grocery-3.webp",
            "Viva Fresh store screenshot on iPhone: cart with quantities, discount and checkout button",
            "Cart",
          ),
        ],
      },
    ],
  },
  {
    id: "web3",
    n: "05",
    eyebrow: "Web3 · Smart wallet · Web",
    title: "The frontend of a smart-wallet dashboard",
    role: "Frontend, UI layer",
    years: "2024",
    story: [
      "A smart-wallet dashboard where people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet, then see balances, assets, gas saved and transactions.",
      "Gentrit built the portal frontend: the sign-in, a first-run tour, the dashboard cards, a list of assets and a balance pop-up with a QR code. Teammates built the wallet itself and its link to the blockchain. The frontend runs on Next.js 14 with the App Router and RTK Query, with route middleware and English/French translations.",
    ],
    facts: [
      "Next.js 14 App Router, TypeScript, RTK Query",
      "Passkey and wallet sign-in UI",
      "Dashboard cards, asset list, balance popup with QR",
      "Animated onboarding",
      "Public and private route middleware",
      "English and French",
    ],
    stack:
      "Next.js 14, React 18, TypeScript, Redux Toolkit + RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts",
    resultLine:
      "The portal frontend was built in 2024, in English and French. The dashboard pages stay private, behind sign-in.",
    exhibits: [
      {
        title: "Incentiv portal",
        note: "Public sign-in screen; no wallet connected",
        aspect: "web",
        links: [
          { label: "Portal", href: "https://portal.incentiv.io/" },
          { label: "Website", href: "https://incentiv.io/" },
          { label: "Docs", href: "https://docs.incentiv.io/" },
        ],
        items: [
          web(
            "/showcase/incentiv/web-03.webp",
            "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
            "Portal sign-in",
          ),
        ],
      },
    ],
  },
  {
    id: "ai",
    n: "06",
    eyebrow: "AI · Dashboards · Freelance",
    title: "A smart business dashboard with AI features",
    role: "Frontend, freelance",
    years: "AvahiTech",
    whenLabel: "For",
    story: [
      "A smart business dashboard for a digital-transformation client. Its AI features help staff with daily work: a headshot generator for professional profile photos, and a workplace assistant that answers questions about uploaded PDF documents.",
      "The React frontend covers the dashboard and both AI flows: photo upload to generated headshots, and PDF upload to a chat about the document. Some backend features were added in Python with FastAPI.",
    ],
    facts: [
      "Headshot generation from uploaded photos",
      "PDF upload to document chat",
      "AI workplace assistant",
      "React dashboard frontend",
      "Python (FastAPI) backend features",
    ],
    stack: "React, Python, FastAPI",
    exhibits: [],
  },
];

export interface PersonalTile {
  name: string;
  line: string;
  shot: Shot;
  links: LinkPill[];
}

export const personal: PersonalTile[] = [
  {
    name: "OFFBEAT",
    line: "Fictional speaker concept: 3D model, exploded view, working drum-machine studio. Next.js 16, Three.js, Web Audio.",
    shot: web(
      "/personal/shots/offbeat-home-desktop.webp",
      "OFFBEAT home: a hot-orange portable speaker in 3D with finish swatches and the line Plays your songs. Makes its own.",
      "OFFBEAT",
    ),
    links: [{ label: "GitHub", href: "https://github.com/gentritr1/offbeat" }],
  },
  {
    name: "Offday",
    line: "Multi-tenant time off: approvals, team calendar, shift cover, best-dates planner, AI assistant. About 200 Playwright tests.",
    shot: web(
      "/personal/shots/offday-light-calendar-desktop.webp",
      "Offday team calendar for October 2026 in the demo workspace, with leave bars, a public holiday and the approval queue",
      "Offday",
    ),
    links: [],
  },
  {
    name: "FORM",
    line: "Fictional sculpture exhibition: three mathematical forms, live materials, word-cast sculptures. WebGL, no dependencies.",
    shot: web(
      "/personal/shots/form-home-desktop.webp",
      "FORM home: a copper trefoil knot sculpture, the title Objects of imagination. and material swatches",
      "FORM",
    ),
    links: [{ label: "GitHub", href: "https://github.com/gentritr1/form" }],
  },
  {
    name: "Snaxx Tech",
    line: "Studio site with a three.js hero, a cinemagraph loop and strict CSP. Images 972 KB → 337 KB, deploy 28 MB → 9.5 MB.",
    shot: web(
      "/personal/shots/snaxx-desktop.webp",
      "Snaxx Tech studio site hero, The Snaxx Almanac illustrated landscape of apps and games",
      "Snaxx Tech",
    ),
    links: [{ label: "Website", href: "https://www.snaxxtech.com/" }],
  },
  {
    name: "FJALË",
    line: "Daily Albanian word game, 21k-word dictionary, archive, offline play. Vanilla JS, PWA.",
    shot: web(
      "/personal/shots/fjale-desktop.webp",
      "FJALË word game board, five-letter grid with Albanian keyboard and hint panel",
      "FJALË",
    ),
    links: [{ label: "Website", href: "https://xn--fjal-opa.com/" }],
  },
  {
    name: "Za!",
    line: "Multiplayer pizza card game for 2–8 players, server-authoritative with bots. Node, WebSocket.",
    shot: web(
      "/personal/shots/za-desktop.webp",
      "Za! multiplayer card game lobby, pixel logo with new-table and join-table controls",
      "Za!",
    ),
    links: [{ label: "Website", href: "https://za-game.onrender.com/" }],
  },
  {
    name: "Morse Trainer",
    line: "Morse-code learning game with spaced repetition and Farnsworth timing. JavaScript.",
    shot: web(
      "/personal/shots/morse-desktop.webp",
      "Morse Trainer amber terminal, letter list and incoming signal in Learn mode",
      "Morse Trainer",
    ),
    links: [{ label: "Website", href: "https://morse-code-amber.vercel.app/" }],
  },
];

export const personalMore: Array<{
  name: string;
  line: string;
  link?: LinkPill;
}> = [
  {
    name: "Geo Guesser World 3D",
    line: "Street-view guessing game, co-built, published on Google Play. Expo, MapLibre, Mapillary.",
    link: {
      label: "Google Play",
      href: "https://play.google.com/store/apps/details?id=com.snaxxtech.geoguesser",
    },
  },
  {
    name: "Open-source forks",
    line: "Maintained forks of epubjs-react-native and react-native-pdf, used in a production reading app.",
    link: { label: "GitHub", href: "https://github.com/gentritr1" },
  },
  {
    name: "Futurisma",
    line: "Hover racer with seven circuits and weather, tide and day-night systems. Three.js, Blender.",
  },
  {
    name: "Secret Dictator",
    line: "Single-player social-deduction game against AI opponents in a 3D town. Three.js.",
  },
];

export const skills: Array<[string, string]> = [
  ["Frontend", "React, Next.js, Vue, Nuxt, TypeScript, Tailwind"],
  ["Mobile", "React Native, iOS, Android"],
  ["Backend", "Laravel / PHP, Python / FastAPI, MySQL, Redis"],
  ["Quality", "Playwright, Vitest, Pest, CI/CD"],
  ["Services", "Stripe, Firebase, AWS IVS, Twilio, Pusher"],
  ["Localization", "Multi-language, Arabic RTL"],
];

export const contact = {
  email: "gentrit.rashiti2@gmail.com",
  github: "https://github.com/gentritr1",
  linkedin: "https://www.linkedin.com/in/gentrit-rashiti-885662199",
  education: "Bachelor's degree, UBT",
};

/** One invented exchange for the document-chat recreation. */
export const docChat = {
  question: "When does the maintenance window start?",
  answer:
    'The maintenance window starts at 02:00 on the first Sunday of each month and lasts two hours. Source: page 3, "Service availability".',
};
