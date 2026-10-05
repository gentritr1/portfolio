/** A box in fractions of its reference (an image, or the plate). */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The part of the image the frame shows. It ends on a whole row of the screen. */
  crop: Box;
  /** The 4:3 part the frame shows under 1024 px. */
  narrow: Box;
}

/**
 * Where the hairline ends. A selector names a part of a live plate. An image
 * box names a part of the plate's shot, in fractions of the whole image.
 */
export type Target =
  | { kind: "selector"; css: string }
  | { kind: "shot"; box: Box }
  | { kind: "figure"; css: string };

/**
 * "side": the line enters the plate at the part's own height.
 * "lane": the line enters along a clear row (a fraction of the plate height),
 * then turns down or up onto the part. "along": the clear row is the top edge
 * of a rule inside a live plate.
 */
export type Route = { kind: "side" } | { kind: "lane"; y: number } | { kind: "along"; css: string };

export type Plate =
  | { kind: "live"; key: "design-system" | "care" | "reader" }
  | { kind: "web"; shot: Shot; ground: string; dark?: boolean }
  | { kind: "phone"; shot: Shot; ground: string }
  | { kind: "number"; from?: string; to: string; unit: string; note: string };

export interface Row {
  id: string;
  project: string;
  /** The problem, or what shipped when there was no problem. */
  line: string;
  /** The result. It carries the hairline. */
  result: string;
  role: string;
  year: string;
  plate: Plate;
  caption: string;
  target: Target;
  route: Route;
  link: { label: string; href: string; external?: boolean };
}

export const rows: Row[] = [
  {
    id: "01",
    project: "Design System v2",
    line: "One source of design tokens, in three tiers, for CSS, TypeScript and Figma.",
    result: "36 components, 805 tokens, 20 releases in about six weeks",
    role: "Design system",
    year: "2026",
    plate: { kind: "live", key: "design-system" },
    caption: "Component specimen. Recreation with invented data.",
    target: { kind: "selector", css: ".dsr-pipeline" },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "02",
    project: "Care-management platform",
    line: "The frontend moves from Vue to React, route by route.",
    result: "A route moves after its parity test passes on both apps",
    role: "Frontend, multi-tenant",
    year: "2023–26",
    plate: { kind: "live", key: "care" },
    caption: "Vitals trend card. Recreation with invented data.",
    target: { kind: "selector", css: 'footer [role="radiogroup"]' },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "03",
    project: "Care-management API",
    line: "One billing report ran 16 queries and timed out.",
    result: "2 queries, no timeout",
    role: "Full stack",
    year: "2026",
    plate: { kind: "number", from: "16", to: "2", unit: "queries", note: "One billing report, Laravel API" },
    caption: "Queries for one billing report, before and after.",
    target: { kind: "figure", css: "[data-to]" },
    route: { kind: "lane", y: 0.06 },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "04",
    project: "Bayyinah institute website",
    line: "The institute's one-page site, built on Next.js.",
    result: "Live, with links to both app stores",
    role: "Frontend",
    year: "2024–25",
    plate: {
      kind: "web",
      ground: "#fde9dc",
      shot: {
        src: "/showcase/bayyinah/org-01.webp",
        alt: "Bayyinah Foundation home: the hero, the Join the Mission button and the two store badges",
        width: 1440,
        height: 900,
        crop: { x: 0.0632, y: 0, w: 0.8729, h: 0.8889 },
        narrow: { x: 513 / 1440, y: 525 / 900, w: 413 / 1440, h: 310 / 900 },
      },
    },
    caption: "bayyinah.org, public page.",
    target: { kind: "shot", box: { x: 0.3644, y: 0.7502, w: 0.2619, h: 0.0613 } },
    route: { kind: "side" },
    link: { label: "bayyinah.org", href: "https://bayyinah.org/", external: true },
  },
  {
    id: "05",
    project: "Incentiv",
    line: "Sign people in to an on-chain wallet. Teammates built the wallet layer.",
    result: "Passkey, MetaMask or WalletConnect, in English and French",
    role: "Frontend, UI layer",
    year: "2024",
    plate: {
      kind: "web",
      ground: "#121212",
      dark: true,
      shot: {
        src: "/showcase/incentiv/web-03.webp",
        alt: "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
        width: 1440,
        height: 900,
        crop: { x: 0.0972, y: 0.0889, w: 0.8, h: 0.8144 },
        narrow: { x: 190 / 1440, y: 280 / 900, w: 512 / 1440, h: 384 / 900 },
      },
    },
    caption: "Incentiv portal sign-in, public screen.",
    target: { kind: "shot", box: { x: 0.158, y: 0.5588, w: 0.064, h: 0.0383 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/incentiv" },
  },
  {
    id: "06",
    project: "Bayyinah TV",
    line: "Rebuild the video platform on Nuxt 3: 34 routes, 270+ components.",
    result: "Stripe, Apple and Google subscriptions",
    role: "Frontend, core team",
    year: "2023–26",
    plate: {
      kind: "web",
      ground: "#1c1214",
      dark: true,
      shot: {
        src: "/showcase/bayyinah/web-06.webp",
        alt: "Bayyinah TV pricing: a monthly and annual switch, the course list and the Premium plan at $11 a month",
        width: 1440,
        height: 900,
        crop: { x: 0.3264, y: 0, w: 0.6736, h: 0.6856 },
        narrow: { x: 515 / 1440, y: 108 / 900, w: 387 / 1440, h: 290 / 900 },
      },
    },
    caption: "Bayyinah TV pricing, public page.",
    target: { kind: "shot", box: { x: 0.367, y: 0.1334, w: 0.184, h: 0.0683 } },
    route: { kind: "lane", y: 0.04 },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "07",
    project: "Viva Fresh",
    line: "A grocery app for iPhone and Android, from one React Native codebase.",
    result: "The same app, live in both stores",
    role: "Mobile",
    year: "2023",
    plate: {
      kind: "phone",
      ground: "#ee2d31",
      shot: {
        src: "/mobile/grocery-1.webp",
        alt: "Viva Fresh store screenshot on iPhone: home with product categories and the latest products",
        width: 780,
        height: 1689,
        crop: { x: 92 / 780, y: 372 / 1689, w: 596 / 780, h: 868 / 1689 },
        narrow: { x: 92 / 780, y: 372 / 1689, w: 596 / 780, h: 447 / 1689 },
      },
    },
    caption: "Viva Fresh home on iPhone. Also on Google Play.",
    target: { kind: "shot", box: { x: 128 / 780, y: 500 / 1689, w: 522 / 780, h: 148 / 1689 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "08",
    project: "Read to Feed",
    line: "A children's reading app around a PDF and EPUB reader.",
    result: "Progress on every book, about 14 releases to both stores",
    role: "Mobile",
    year: "2022–25",
    plate: { kind: "live", key: "reader" },
    caption: "Reader page. Recreation with public-domain text.",
    target: { kind: "selector", css: "div:has(> .h-\\[3px\\])" },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    id: "09",
    project: "Chatbot runtime library",
    line: "Quizzes as chat conversations, with text, media, choices and timers.",
    result: "One reusable React Native package, ported to the web",
    role: "Mobile",
    year: "2022–25",
    plate: { kind: "number", to: "1", unit: "package", note: "Text, media, choices and timers, in React Native and on the web" },
    caption: "One package plays every scripted conversation.",
    target: { kind: "figure", css: "[data-to]" },
    route: { kind: "lane", y: 0.06 },
    link: { label: "All 30 projects", href: "/" },
  },
  {
    id: "10",
    project: "Dukagjini Bookstore",
    line: "A publisher's book shop for iPhone and Android, in React Native.",
    result: "Search, sales and checkout, live in both stores",
    role: "Mobile",
    year: "2021–22",
    plate: {
      kind: "phone",
      ground: "#f4a3a3",
      shot: {
        src: "/mobile/bookstore-1.webp",
        alt: "Dukagjini Bookstore store screenshot on iPhone: home with book search and top categories",
        width: 780,
        height: 1689,
        crop: { x: 106 / 780, y: 740 / 1689, w: 568 / 780, h: 660 / 1689 },
        narrow: { x: 115 / 780, y: 840 / 1689, w: 547 / 780, h: 410 / 1689 },
      },
    },
    caption: "Dukagjini Bookstore home on iPhone. Also on Google Play.",
    target: { kind: "shot", box: { x: 155 / 780, y: 1145 / 1689, w: 470 / 780, h: 60 / 1689 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/dukagjini-bookstore" },
  },
];
