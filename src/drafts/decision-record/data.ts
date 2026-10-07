import { careShots, dsShots, REAL_SCREENS, type ScreenShot } from "../../content/careShots";
import { findProject, type PublicLink } from "../../content/projects";

export interface EvidenceImage {
  src: string;
  alt: string;
}

export type Evidence =
  | { kind: "shot"; shot: ScreenShot; caption: string }
  | { kind: "web" | "phone"; images: EvidenceImage[]; caption: string };

/** A number that the Context states and the Consequence changes. */
export interface Measure {
  from: number;
  to: number;
  /** Turns the counted integer into the printed value. */
  print: (n: number) => string;
  unit: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  project: string;
  years: string;
  role: string;
  /** One short outcome for the log row. */
  result: string;
  /** `{n}` marks where the measure is printed. */
  context: string;
  decision: string;
  consequence: string;
  measure?: Measure;
  status: "Accepted" | "Superseded";
  supersedes?: string;
  supersededBy?: string;
  evidence?: Evidence;
  caseSlug?: string;
  links?: PublicLink[];
}

const images = (slug: string, count: number): EvidenceImage[] =>
  (findProject(slug)?.media.galleries?.[0]?.items ?? [])
    .slice(0, count)
    .map(({ src, alt }) => ({ src, alt }));

const linksOf = (slug: string): PublicLink[] => findProject(slug)?.links ?? [];

const integer = (n: number) => String(n);
const reactNative = (n: number) => `0.${n}`;

export const records: DecisionRecord[] = [
  {
    id: "0010",
    title: "Move the care platform to React one route at a time, with a parity test on both apps.",
    project: "Care-management platform",
    years: "2026",
    role: "Frontend and mobile, full stack since 2026",
    result: "Supersedes 0004",
    context:
      "A care-management platform for remote patient monitoring runs on Vue (Nuxt 2). Many client organizations share it, and every screen must keep their data apart and respect each user's role and timezone.",
    decision:
      "Rebuild the frontend in React, one route at a time, in strict TypeScript. Each route gets a parity test that runs the same scenario against both apps. New screens use Design System v2.",
    consequence:
      "Most screens are already rebuilt in React. A route moves over only after its parity tests show the same behaviour in both apps.",
    status: "Accepted",
    supersedes: "0004",
    evidence: { kind: "shot", shot: careShots.claims, caption: `Claims page. ${REAL_SCREENS}` },
    caseSlug: "care-platform",
  },
  {
    id: "0009",
    title: "Rework one billing report in the API until it stops timing out.",
    project: "Care-management API",
    years: "2026",
    role: "Full stack",
    result: "16 → 2 queries",
    context: "One billing report in the Laravel API runs {n} queries and times out.",
    decision: "Rework the report's queries in the Laravel API.",
    consequence: "The same report runs {n} queries and no longer times out.",
    measure: { from: 16, to: 2, print: integer, unit: "queries" },
    status: "Accepted",
    caseSlug: "care-platform",
  },
  {
    id: "0008",
    title: "Generate every design token from one source, in three tiers.",
    project: "Design System v2",
    years: "2026",
    role: "Design system",
    result: "36 components",
    context:
      "The new React dashboard of a care-management platform needs one shared base of controls and layout parts, built to WCAG 2.1 AA floors.",
    decision:
      "Build Design System v2 from scratch. One token source in three tiers (core, semantic and component) generates CSS variables, TypeScript modules and a Figma bundle. The components ship as a typed, versioned package.",
    consequence:
      "36 components and 805 design tokens, in 20 releases over about six weeks. A Button-only consumer loads 96.6% less JavaScript. The dashboard uses the system through one adapter layer.",
    status: "Accepted",
    evidence: { kind: "shot", shot: dsShots.dateRange, caption: `Date range picker in Storybook. ${REAL_SCREENS}` },
    caseSlug: "design-system-react",
  },
  {
    id: "0007",
    title: "Keep private routes behind sign-in with route middleware.",
    project: "Incentiv",
    years: "2024",
    role: "Frontend, UI layer",
    result: "Live, EN + FR",
    context:
      "A smart-wallet dashboard lets people and businesses manage an on-chain wallet and incentive programs. Users sign in with a passkey or an external wallet.",
    decision:
      "Build the UI layer on Next.js 14 with the App Router and RTK Query, and keep public and private routes apart in middleware. Teammates own the wallet and blockchain layer.",
    consequence:
      "The portal is live in English and French. It signs people in with a passkey or an external wallet, and private routes stay behind sign-in.",
    status: "Accepted",
    evidence: {
      kind: "web",
      images: [
        {
          src: "/showcase/incentiv/web-03.webp",
          alt: "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
        },
      ],
      caption: "Portal sign-in. Screen from the public page.",
    },
    caseSlug: "incentiv",
    links: linksOf("incentiv"),
  },
  {
    id: "0006",
    title: "Rebuild the video platform on Nuxt 3, from an empty template.",
    project: "Bayyinah TV",
    years: "2023–26",
    role: "Frontend, core team",
    result: "34 routes",
    context:
      "Bayyinah TV is a video-learning platform with courses, on-demand video and live streams, paid through web and in-app subscriptions. The same web app runs inside the native iOS and Android apps.",
    decision:
      "Build the second version as a full rebuild on Nuxt 3: live streams with realtime chat and moderation, an HLS player with a premium paywall, Stripe, Apple and Google subscriptions, and a full right-to-left layout for Arabic.",
    consequence:
      "Live at bayyinahtv.com and in both stores. The rebuild ships 34 routes and 270+ components, in English and Arabic.",
    status: "Accepted",
    evidence: {
      kind: "web",
      images: images("bayyinah-tv", 1),
      caption: "Landing page. Screen from the public website.",
    },
    caseSlug: "bayyinah-tv",
    links: linksOf("bayyinah-tv"),
  },
  {
    id: "0005",
    title: "Ship one React Native codebase to both stores.",
    project: "Viva Fresh",
    years: "2023",
    role: "Mobile",
    result: "Both stores",
    context:
      "Shoppers order groceries for a delivery slot, use a loyalty programme and keep a wishlist, on iPhone and on Android.",
    decision:
      "Build the app once in React Native with Redux Toolkit and Firebase, with address search on a map for the delivery.",
    consequence: "Viva Fresh is live in the App Store and on Google Play, from one codebase.",
    status: "Accepted",
    evidence: {
      kind: "phone",
      images: images("viva-fresh", 3),
      caption: "Screens from the public store listing.",
    },
    caseSlug: "viva-fresh",
    links: linksOf("viva-fresh"),
  },
  {
    id: "0004",
    title: "Build the care platform's features on Vue (Nuxt 2).",
    project: "Care-management platform",
    years: "2023",
    role: "Frontend",
    result: "4 languages",
    context:
      "Care teams follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. Many client organizations share one multi-tenant system.",
    decision:
      "Build the features on Vue (Nuxt 2): patient profile, care plans, labs and vitals, claims, calls and chat. Every screen keeps each organization's data apart and respects each user's role and timezone.",
    consequence:
      "The platform runs in English, German, Spanish and Turkish. In 2026 its frontend starts to move to React, route by route.",
    status: "Superseded",
    supersededBy: "0010",
    caseSlug: "care-platform",
  },
  {
    id: "0003",
    title: "Keep upgrading React Native while the releases continue.",
    project: "Read to Feed",
    years: "2022–25",
    role: "Mobile, iOS and Android",
    result: "0.63 → 0.81",
    context:
      "Read to Feed is a children's reading app for iOS and Android, with a PDF and EPUB reader, a barcode scanner and badges. It starts on React Native {n}.",
    decision: "Take the app through three major React Native upgrades over its store releases.",
    consequence: "About 14 releases went to both stores, and the app now runs on React Native {n}.",
    measure: { from: 63, to: 81, print: reactNative, unit: "React Native" },
    status: "Accepted",
    evidence: {
      kind: "phone",
      images: images("read-to-feed", 3),
      caption: "Screens from the archived store listing.",
    },
    caseSlug: "read-to-feed",
    links: linksOf("read-to-feed"),
  },
  {
    id: "0002",
    title: "Maintain forks of the two reader libraries.",
    project: "Open-source forks",
    years: "2022",
    role: "Maintainer",
    result: "Public forks",
    context:
      "The reading app's PDF and EPUB reader depends on two open-source React Native libraries: epubjs-react-native and react-native-pdf.",
    decision: "Maintain a fork of each library.",
    consequence: "The reader keeps working on current React Native, and both forks are public on GitHub.",
    status: "Accepted",
    links: [{ label: "GitHub", href: "https://github.com/gentritr1" }],
  },
  {
    id: "0001",
    title: "Bring readers back to a book with push deep links.",
    project: "Dukagjini Bookstore",
    years: "2021–22",
    role: "Mobile",
    result: "Both stores",
    context:
      "A book publisher needs a shopping app on iPhone and Android: search, categories, sales, favourite lists and checkout with promo codes.",
    decision:
      "Build it in React Native with Redux, and send push notifications through Firebase Messaging that open the right screen through a deep link.",
    consequence:
      "Dukagjini Bookstore is live in the App Store and on Google Play. A notification brings the reader back to a book.",
    status: "Accepted",
    evidence: {
      kind: "phone",
      images: images("dukagjini-bookstore", 3),
      caption: "Screens from the public store listing.",
    },
    caseSlug: "dukagjini-bookstore",
    links: linksOf("dukagjini-bookstore"),
  },
];

export const recordById = (id: string) => records.find((record) => record.id === id);
