import type { RecreationKey } from "../../content/projects";
import { careShots, dsShots } from "../../content/careShots";

/** A box in source pixels of an image, or in design pixels of a live plate. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A live plate renders at its design size and scales to the frame's width.
 * The design height is the design width × the frame's ratio, so the plate fills the frame.
 */
export interface LivePlate {
  kind: "live";
  key: RecreationKey;
  /** Design width on a wide screen (4:5 frame). */
  width: number;
  /** Design pixels above the part the wide frame shows. */
  shift?: number;
  /** Design width under 1024 px (4:3 frame). */
  narrowWidth: number;
  narrowShift?: number;
}

/** A screenshot is cropped to the frame's ratio and never shown larger than its source pixels. */
export interface ShotPlate {
  kind: "shot";
  src: string;
  alt: string;
  width: number;
  height: number;
  /** 4:5 crop for a wide screen. */
  crop: Box;
  /** 4:3 crop under 1024 px. */
  narrow: Box;
  /** Paints the part of a crop that lies outside the image. */
  ground?: string;
}

/** A result with no screen: the figure is the plate, and the page stays grey. */
export interface FigurePlate {
  kind: "figure";
  before: { value: string; label: string; note: string };
  after: { value: string; label: string; note: string };
}

export type Plate = LivePlate | ShotPlate | FigurePlate;

/** Where the hairline ends: one element (or the union of all matches) of a live plate, or a box of a screenshot. */
export type Target = { kind: "selector"; css: string; all?: boolean } | { kind: "shot"; box: Box };

export interface Row {
  id: string;
  project: string;
  role: string;
  year: string;
  /** The problem, or what had to exist. */
  line: string;
  /** What the screen proves. It carries the hairline. */
  result: string;
  plate: Plate;
  caption: string;
  target: Target;
  /** A rule inside the plate: the line enters along it, then turns onto the part. */
  lane?: string;
  /** Dominant hue of the rendered plate, in OKLCH degrees. A row with no screen has no hue. */
  hue: number | null;
  link: { label: string; href: string; external?: boolean };
}

const pricing = {
  src: "/showcase/bayyinah/web-06.webp",
  alt: "Bayyinah TV pricing page: the Premium plan at 11 dollars a month, its included courses and the Start 7-Day Free Trial button",
  width: 1440,
  height: 900,
};

const viva = {
  src: "/mobile/grocery-3.webp",
  alt: "Viva Fresh cart on iPhone, from the App Store listing: two jars of ajvar, the total discount and the checkout bar at 25.11 euro",
  width: 780,
  height: 1689,
};

/* Neighbouring rows differ in hue, so each scroll changes the page colour clearly. */
export const rows: Row[] = [
  {
    id: "01",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    year: "2023–26",
    line: "The video-learning platform, rebuilt from an empty page: 34 pages.",
    result: "Members subscribe on the web, iPhone or Android",
    plate: {
      kind: "shot",
      ...pricing,
      crop: { x: 864, y: 88, w: 576, h: 720 },
      narrow: { x: 864, y: 96, w: 576, h: 432 },
    },
    caption: "Bayyinah TV pricing page, public.",
    target: { kind: "shot", box: { x: 1108, y: 192, w: 148, h: 88 } },
    hue: 31,
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "02",
    project: "Care platform, server side",
    role: "Full stack",
    year: "2026",
    line: "One billing report asked the database 16 times and gave up.",
    result: "Now it asks 2 times and finishes",
    plate: {
      kind: "figure",
      before: { value: "16", label: "Requests before", note: "The report gave up." },
      after: { value: "2", label: "Requests now", note: "The report finishes." },
    },
    caption: "One report, before and after. No screen.",
    target: { kind: "selector", css: ".sf-fig-after .sf-fig-value" },
    hue: null,
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "03",
    project: "Care-management platform",
    role: "Frontend, rebuilt screen by screen",
    year: "2023–26",
    line: "Many client organizations use the same system.",
    result: "Each one sees only its own patients",
    plate: {
      kind: "shot",
      ...careShots.overview,
      alt: "Care team dashboard: 24 patients by program, and the patients of each provider. Invented data.",
      crop: { x: 240, y: 120, w: 594, h: 742 },
      narrow: { x: 240, y: 80, w: 594, h: 446 },
    },
    caption: "Patient count. Real product screens · invented data.",
    target: { kind: "shot", box: { x: 286, y: 313, w: 154, h: 154 } },
    hue: 297,
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "04",
    project: "Viva Fresh",
    role: "Mobile",
    year: "2023",
    line: "One grocery app, built once for iPhone and Android.",
    result: "Shopping in Albanian, live in both app stores",
    plate: {
      kind: "shot",
      ...viva,
      crop: { x: 102, y: 862, w: 576, h: 720 },
      narrow: { x: 88, y: 1102, w: 604, h: 453 },
    },
    caption: "App Store listing, iPhone. Also on Google Play.",
    target: { kind: "shot", box: { x: 116, y: 1400, w: 300, h: 46 } },
    hue: 23,
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "05",
    project: "Design System v2",
    role: "Design system, with the team",
    year: "2026",
    line: "The new care dashboard needed one set of buttons, menus and forms.",
    result: "36 building blocks, 20 releases in about six weeks",
    plate: {
      kind: "shot",
      ...dsShots.buttonAlert,
      crop: { x: 0, y: -152, w: 720, h: 900 },
      narrow: { x: 8, y: -40, w: 704, h: 528 },
    },
    caption: "Buttons and alerts. Real product screens · invented data.",
    target: { kind: "shot", box: { x: 16, y: 24, w: 652, h: 92 } },
    hue: 230,
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "06",
    project: "Read to Feed",
    role: "Mobile",
    year: "2022–25",
    line: "A reading app for children. Books open inside the app.",
    result: "It remembers the page in every book",
    plate: { kind: "live", key: "reader", width: 480, narrowWidth: 420 },
    caption: "Reader page. Recreation · public-domain text.",
    target: { kind: "selector", css: "div:has(> .h-\\[3px\\])" },
    hue: 78,
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    id: "07",
    project: "Incentiv",
    role: "Frontend, the screens",
    year: "2024",
    line: "Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet.",
    result: "Passkey (no password) or wallet sign-in, in English and French",
    plate: { kind: "live", key: "wallet", width: 576, narrowWidth: 330 },
    caption: "Wallet sign-in. Recreation · invented data.",
    target: { kind: "selector", css: "button.w-full" },
    hue: 282,
    link: { label: "Open the case", href: "/work/incentiv" },
  },
];

export interface RecordRow {
  decision: string;
  project: string;
  years: string;
  result: string;
  href?: string;
  external?: boolean;
}

export const record: RecordRow[] = [
  {
    decision: "Move the care platform to a new framework, one screen at a time.",
    project: "Care-management platform",
    years: "2026",
    result: "Each screen passes the same tests first",
    href: "/work/care-platform",
  },
  {
    decision: "The institute's public website, on one page.",
    project: "bayyinah.org",
    years: "2024–25",
    result: "Live at bayyinah.org",
    href: "https://bayyinah.org/",
    external: true,
  },
  {
    decision: "Keep a children's reading app current through three major upgrades.",
    project: "Read to Feed",
    years: "2022–25",
    result: "About 14 updates in both stores",
    href: "/work/read-to-feed",
  },
  {
    decision: "Quizzes that run like a chat: messages, pictures, buttons and timers.",
    project: "Scripted chat engine",
    years: "2022–25",
    result: "Built once, used on phones and the web",
  },
  {
    decision: "Prove that each team in a time-off app sees only its own data.",
    project: "Offday",
    years: "2026",
    result: "about 200 tests",
  },
  {
    decision: "Make a studio's website lighter to load.",
    project: "Snaxx Tech",
    years: "2026",
    result: "Images 972 KB → 337 KB",
  },
  {
    decision: "A publisher's bookshop app for iPhone and Android.",
    project: "Dukagjini Bookstore",
    years: "2021–22",
    result: "Live in both app stores",
    href: "/work/dukagjini-bookstore",
  },
];
