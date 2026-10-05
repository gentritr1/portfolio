import { findProject } from "../../content/projects";

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
  /** The 4:3 part the frame shows under 1024 px. It grows to the frame's width, inside bounds, so it is never upscaled. */
  narrow: Box;
  /** A wider narrow crop for a wide phone frame. It keeps the text at 11 px or more when it is chosen. */
  narrowWide?: Box;
  /** The part of the image a narrow crop may grow into. The whole image when absent. */
  bounds?: Box;
}

/**
 * Where the hairline ends. A selector names a part of a live plate. An image
 * box names a part of the plate's shot, in fractions of the whole image.
 */
export type Target =
  | { kind: "selector"; css: string; round?: boolean }
  | { kind: "shot"; box: Box }
  | { kind: "figure"; css: string };

/**
 * "side": the line enters the plate at the part's own height.
 * "lane": the line enters along a clear row (a fraction of the plate height),
 * then turns down or up onto the part. "along": the clear row is the top edge
 * of a rule inside a live plate.
 */
export type Route = { kind: "side" } | { kind: "lane"; y: number } | { kind: "along"; css: string };

export interface StoreLink {
  label: string;
  href: string;
}

export type Plate =
  | { kind: "live"; key: "design-system" | "care" | "reader" }
  | { kind: "web"; shot: Shot; ground: string; dark?: boolean }
  | { kind: "phone"; shot: Shot; stores: StoreLink[] }
  | { kind: "report"; before: number; after: number };

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
  /** The part the ring marks under 1024 px, when the wide target is not in the phone crop. */
  narrowTarget?: Target;
  route: Route;
  link?: { label: string; href: string; external?: boolean };
  /** The public product, when it is live. */
  live?: StoreLink;
}

const storeLinks = (slug: string): StoreLink[] =>
  (findProject(slug)?.links ?? []).map((link) => ({ label: link.label, href: link.href }));

export const rows: Row[] = [
  {
    id: "01",
    project: "Bayyinah TV",
    line: "The video-learning platform, rebuilt from an empty page: 34 pages.",
    result: "Members pay monthly or yearly",
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
        crop: { x: 470 / 1440, y: 0, w: 970 / 1440, h: 745 / 900 },
        narrow: { x: 515 / 1440, y: 108 / 900, w: 387 / 1440, h: 290 / 900 },
      },
    },
    caption: "Bayyinah TV pricing page, public.",
    target: { kind: "shot", box: { x: 0.367, y: 0.1334, w: 0.184, h: 0.0683 } },
    route: { kind: "lane", y: 0.04 },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
    live: { label: "Live at bayyinahtv.com", href: "https://bayyinahtv.com/" },
  },
  {
    id: "02",
    project: "Care platform, server side",
    line: "One billing report asked the database 16 times and gave up.",
    result: "Now it asks 2 times and finishes",
    role: "Full stack",
    year: "2026",
    plate: { kind: "report", before: 16, after: 2 },
    caption: "Database requests for one billing report. A diagram.",
    target: { kind: "selector", css: '[data-lane="now"]' },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "03",
    project: "Care-management platform",
    line: "Many client organizations use the same system.",
    result: "Each one sees only its own patients",
    role: "Frontend, rebuilt screen by screen",
    year: "2023–26",
    plate: { kind: "live", key: "care" },
    caption: "Vitals card for one organization. Recreation with invented data.",
    target: { kind: "selector", css: 'button[aria-haspopup="listbox"]', round: true },
    route: { kind: "along", css: ".border-t" },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "04",
    project: "Viva Fresh",
    line: "One grocery app, built once for iPhone and Android.",
    result: "Shopping in Albanian, live in both app stores",
    role: "Mobile",
    year: "2023",
    plate: {
      kind: "phone",
      stores: storeLinks("viva-fresh"),
      shot: {
        src: "/mobile/grocery-1.webp",
        alt: "Viva Fresh home on iPhone: product categories in Albanian and the latest products",
        width: 780,
        height: 1689,
        crop: { x: 92 / 780, y: 356 / 1689, w: 596 / 780, h: 676 / 1689 },
        narrow: { x: 92 / 780, y: 372 / 1689, w: 596 / 780, h: 447 / 1689 },
        bounds: { x: 92 / 780, y: 352 / 1689, w: 596 / 780, h: 1240 / 1689 },
      },
    },
    caption: "Viva Fresh home, from its App Store listing.",
    target: { kind: "selector", css: ".pj-stores" },
    narrowTarget: { kind: "shot", box: { x: 128 / 780, y: 500 / 1689, w: 522 / 780, h: 148 / 1689 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "05",
    project: "Design System v2",
    line: "The team built 36 building blocks for the new care dashboard.",
    result: "Colours and sizes are set once, for code and Figma",
    role: "Design system, with the team",
    year: "2026",
    plate: { kind: "live", key: "design-system" },
    caption: "Shared style values. Recreation with invented data.",
    target: { kind: "selector", css: ".dsr-pipeline" },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "06",
    project: "Incentiv",
    line: "Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet.",
    result: "Passkey (no password) or wallet sign-in, in English and French",
    role: "Frontend, the screens",
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
        crop: { x: 160 / 1440, y: 19 / 900, w: 1121 / 1440, h: 861 / 900 },
        narrow: { x: 192 / 1440, y: 474 / 900, w: 344 / 1440, h: 258 / 900 },
        narrowWide: { x: 170 / 1440, y: 345 / 900, w: 520 / 1440, h: 390 / 900 },
      },
    },
    caption: "Incentiv sign-in, public page.",
    target: { kind: "shot", box: { x: 0.158, y: 0.5588, w: 0.064, h: 0.0383 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/incentiv" },
  },
  {
    id: "07",
    project: "Read to Feed",
    line: "A reading app for children. About 14 updates shipped to both stores.",
    result: "It remembers the page in every book",
    role: "Mobile",
    year: "2022–25",
    plate: { kind: "live", key: "reader" },
    caption: "Reader page. Recreation with public-domain text.",
    target: { kind: "selector", css: "div:has(> .h-\\[3px\\])" },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    id: "08",
    project: "Dukagjini Bookstore",
    line: "A publisher's bookshop app for iPhone and Android.",
    result: "Search, sales and checkout, live in both app stores",
    role: "Mobile",
    year: "2021–22",
    plate: {
      kind: "phone",
      stores: storeLinks("dukagjini-bookstore"),
      shot: {
        src: "/mobile/bookstore-1.webp",
        alt: "Dukagjini Bookstore home on iPhone: book search and top categories",
        width: 780,
        height: 1689,
        crop: { x: 106 / 780, y: 740 / 1689, w: 568 / 780, h: 676 / 1689 },
        narrow: { x: 115 / 780, y: 840 / 1689, w: 547 / 780, h: 410 / 1689 },
        bounds: { x: 106 / 780, y: 730 / 1689, w: 568 / 780, h: 959 / 1689 },
      },
    },
    caption: "Dukagjini Bookstore home, from its App Store listing.",
    target: { kind: "shot", box: { x: 155 / 780, y: 1145 / 1689, w: 470 / 780, h: 60 / 1689 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/dukagjini-bookstore" },
  },
];
