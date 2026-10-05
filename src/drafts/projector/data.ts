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
}

/**
 * Where the hairline ends. A selector names a part of a live plate. An image
 * box names a part of one shot of the plate, in fractions of that shot's crop.
 */
export type Target =
  | { kind: "selector"; css: string; narrow?: string }
  | { kind: "shot"; shot: number; box: Box }
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
  | { kind: "pair"; shots: [Shot, Shot]; ground: string }
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
    line: "Many clinics share one system. Its frontend moves from Vue to React, route by route.",
    result: "Each organization sees only its own patients",
    role: "Frontend",
    year: "2023–26",
    plate: { kind: "live", key: "care" },
    caption: "Vitals trend card. Recreation with invented data.",
    target: { kind: "selector", css: 'button[aria-label^="Organization"]' },
    route: { kind: "along", css: ".border-t" },
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
      },
    },
    caption: "bayyinah.org, public page.",
    target: { kind: "shot", shot: 0, box: { x: 0.345, y: 0.844, w: 0.3, h: 0.069 } },
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
      },
    },
    caption: "Incentiv portal sign-in, public screen.",
    target: { kind: "shot", shot: 0, box: { x: 0.076, y: 0.577, w: 0.08, h: 0.047 } },
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
      },
    },
    caption: "Bayyinah TV pricing, public page.",
    target: { kind: "shot", shot: 0, box: { x: 0.0603, y: 0.1945, w: 0.2732, h: 0.0996 } },
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
      kind: "pair",
      ground: "#ee2d31",
      shots: [
        {
          src: "/mobile/grocery-1.webp",
          alt: "Viva Fresh store screenshot on iPhone: home with product categories and the latest products",
          width: 780,
          height: 1689,
          crop: { x: 0.1179, y: 0.2143, w: 0.7641, h: 0.5187 },
        },
        {
          src: "/mobile/grocery-4.webp",
          alt: "Viva Fresh store screenshot on Android: the same home with product categories and the latest products",
          width: 780,
          height: 1387,
          crop: { x: 0.1795, y: 0.2538, w: 0.641, h: 0.5299 },
        },
      ],
    },
    caption: "Viva Fresh home on iPhone and on Android, store listings.",
    target: { kind: "shot", shot: 0, box: { x: 0.06, y: 0.16, w: 0.88, h: 0.165 } },
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
      kind: "pair",
      ground: "#f4a3a3",
      shots: [
        {
          src: "/mobile/bookstore-1.webp",
          alt: "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale",
          width: 780,
          height: 1689,
          crop: { x: 0.1385, y: 0.4381, w: 0.7231, h: 0.4174 },
        },
        {
          src: "/mobile/bookstore-2.webp",
          alt: "Dukagjini Bookstore store screenshot: foreign books with ratings and prices",
          width: 780,
          height: 1689,
          crop: { x: 0.1385, y: 0.4263, w: 0.7231, h: 0.447 },
        },
      ],
    },
    caption: "Dukagjini Bookstore, two screens from the store listing.",
    target: { kind: "shot", shot: 0, box: { x: 0.08, y: 0.575, w: 0.84, h: 0.085 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/dukagjini-bookstore" },
  },
];
