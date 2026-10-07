import { careShots, dsShots } from "../../content/careShots";

const REAL_SCREENS_CAPTION = "Real product screens, invented data";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A part of the image, in image pixels. */
export interface Crop extends Box {}

export interface Plate {
  src: string;
  alt: string;
  /** Natural size of the file. */
  width: number;
  height: number;
  /** What the plate shows on a wide screen and on a phone. Each crop ends on a whole row. */
  wide: Crop;
  narrow: Crop;
  /** The pixel the pin ends on, in image pixels. */
  target: Box;
  /** On a wide screen the pin runs in at this image y, clear of text, then turns to the target. */
  laneWide?: number;
  caption: string;
}

export interface Row {
  decision: string;
  result: string;
  pin?: boolean;
}

export interface Card {
  id: string;
  /** Years in mono, then the project and the role. */
  years: string;
  project: string;
  role: string;
  /** The words this card adds to the sentence. */
  clause: string[];
  rows: Row[];
  plate: Plate;
  link: { label: string; href: string };
}

/**
 * "Gentrit Rashiti builds" + the clauses, in card order.
 * Each clause is a list of words; a word that starts with "," attaches to the word before it.
 */
export const opening = "Gentrit Rashiti builds";

export const cards: Card[] = [
  {
    id: "2021",
    years: "2021–22",
    project: "Dukagjini Bookstore",
    role: "Mobile",
    clause: ["mobile", "apps"],
    rows: [
      {
        decision: "Build a publisher's book shop in React Native, for iPhone and Android.",
        result: "Search, sales and checkout, in both stores",
        pin: true,
      },
      {
        decision: "Bring readers back with push notifications that deep-link to a book.",
        result: "A notification opens the right book",
      },
    ],
    plate: {
      src: "/mobile/bookstore-2.webp",
      alt: "Dukagjini Bookstore store listing, cropped to the app screen: book search and the foreign books list with ratings and prices",
      width: 780,
      height: 1689,
      wide: { x: 116, y: 735, w: 552, h: 750 },
      narrow: { x: 116, y: 830, w: 552, h: 414 },
      target: { x: 152, y: 851, w: 466, h: 54 },
      caption: "App Store listing",
    },
    link: { label: "Open the case", href: "/work/dukagjini-bookstore" },
  },
  {
    id: "2023",
    years: "2023–26",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    clause: ["and", "web", "platforms"],
    rows: [
      {
        decision: "Rebuild the video-learning platform on Nuxt 3, from an empty template.",
        result: "34 routes, 270+ components",
      },
      {
        decision: "Sell subscriptions on the web and in both app stores.",
        result: "Stripe, Apple and Google, one paywall",
        pin: true,
      },
    ],
    plate: {
      src: "/showcase/bayyinah/web-06.webp",
      alt: "Bayyinah TV pricing: Choose Your Plan with a monthly and annual switch and the Premium plan",
      width: 1440,
      height: 900,
      wide: { x: 0, y: 0, w: 1440, h: 760 },
      narrow: { x: 500, y: 96, w: 920, h: 690 },
      target: { x: 528, y: 121, w: 264, h: 61 },
      laneWide: 97,
      caption: "bayyinahtv.com, public page",
    },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "2026",
    years: "2026",
    project: "Design System v2",
    role: "Design system",
    clause: [",", "from", "the", "design", "system"],
    rows: [
      {
        decision: "Generate every design token from one source, in three tiers.",
        result: "805 tokens to CSS, TypeScript and Figma",
      },
      {
        decision: "Ship the components in small releases.",
        result: "36 components, 20 releases in about six weeks",
        pin: true,
      },
    ],
    plate: {
      src: dsShots.dateRange.src,
      alt: dsShots.dateRange.alt,
      width: 2880,
      height: 1800,
      wide: { x: 8, y: 72, w: 1560, h: 864 },
      narrow: { x: 16, y: 72, w: 952, h: 728 },
      target: { x: 388, y: 594, w: 528, h: 144 },
      caption: REAL_SCREENS_CAPTION,
    },
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "2026-api",
    years: "2026",
    project: "Care-management platform and API",
    role: "Full stack",
    clause: ["to", "the", "API", "behind", "them"],
    rows: [
      {
        decision: "Rework a billing report in the Laravel API that timed out.",
        result: "16 → 2 queries",
      },
      {
        decision: "Keep each organization's data apart on one multi-tenant system.",
        result: "Each organization sees only its own patients",
        pin: true,
      },
      {
        decision: "Move the frontend from Vue to React, one route at a time.",
        result: "A route moves after its parity test passes",
      },
    ],
    plate: {
      src: careShots.overview.src,
      alt: "Care team dashboard for one organization: its name at the top, patients by program, patient engagement by calls and text messages, and patients for each provider. Invented data.",
      width: 2880,
      height: 1800,
      wide: { x: 488, y: 0, w: 2392, h: 1684 },
      narrow: { x: 1680, y: 0, w: 1200, h: 1024 },
      target: { x: 2368, y: 30, w: 312, h: 52 },
      caption: REAL_SCREENS_CAPTION,
    },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
];

export const yearOf = (card: Card) => card.id.slice(0, 4);

export const sentence = `${opening} ${cards
  .map((card) => card.clause.join(" "))
  .join(" ")
  .replace(/ ,/g, ",")}.`;

export interface RecordRow {
  year: string;
  project: string;
  decision: string;
  result: string;
  href?: string;
  external?: boolean;
}

export const record: RecordRow[] = [
  {
    year: "2022",
    project: "Read to Feed",
    decision: "Keep releasing while React Native moves from 0.63 to 0.81.",
    result: "About 14 releases",
    href: "/work/read-to-feed",
  },
  {
    year: "2022",
    project: "Chatbot runtime library",
    decision: "Play scripted chat conversations from one React Native package.",
    result: "1 package",
  },
  {
    year: "2023",
    project: "Viva Fresh",
    decision: "Ship a grocery app to iPhone and Android from one codebase.",
    result: "Both stores",
    href: "/work/viva-fresh",
  },
  {
    year: "2023",
    project: "Care-management platform",
    decision: "Build the care platform's features on Vue (Nuxt 2).",
    result: "4 languages",
    href: "/work/care-platform",
  },
  {
    year: "2023",
    project: "Bayyinah TV",
    decision: "Lay the video platform out right to left for Arabic.",
    result: "English and Arabic",
    href: "/work/bayyinah-tv",
  },
  {
    year: "2024",
    project: "Incentiv",
    decision: "Build the UI layer of a smart-wallet dashboard. Teammates built the wallet layer.",
    result: "Passkey sign-in, EN and FR",
    href: "/work/incentiv",
  },
  {
    year: "2025",
    project: "Bayyinah institute website",
    decision: "Build the institute's one-page site on Next.js.",
    result: "Live, links to both stores",
    href: "https://bayyinah.org/",
    external: true,
  },
  {
    year: "2025",
    project: "Member portal",
    decision: "Lay the foundation of a member portal on Next.js 15.",
    result: "Protected routes, app shell",
  },
  {
    year: "2026",
    project: "Offday",
    decision: "Test that each workspace in the time-off app sees only its own data.",
    result: "about 200 tests",
  },
  {
    year: "2026",
    project: "Snaxx Tech studio site",
    decision: "Cut the studio site's image weight, under a strict CSP.",
    result: "972 → 337 KB",
    href: "https://www.snaxxtech.com/",
    external: true,
  },
];
