import type { RecreationKey } from "../../content/projects";

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
}

export type Plate = LivePlate | ShotPlate;

/** Where the hairline ends: one element (or the union of all matches) of a live plate, or a box of a screenshot. */
export type Target = { kind: "selector"; css: string; all?: boolean } | { kind: "shot"; box: Box };

export interface Row {
  id: string;
  project: string;
  role: string;
  year: string;
  /** The decision. */
  line: string;
  /** What the screen proves. It carries the hairline. */
  result: string;
  plate: Plate;
  caption: string;
  target: Target;
  /** The line enters the plate along a clear row this many pixels under the plate's top, then turns onto the part. */
  lane?: number;
  /** Dominant hue of the rendered plate, in OKLCH degrees. Only this number comes from the screen. */
  hue: number;
  link: { label: string; href: string; external?: boolean };
}

const viva = {
  src: "/mobile/grocery-3.webp",
  alt: "Viva Fresh cart on iPhone, from the App Store listing: two jars of ajvar, the total discount and the checkout bar at 25.11 euro",
  width: 780,
  height: 1689,
};

const org = {
  src: "/showcase/bayyinah/org-phone.webp",
  alt: "bayyinah.org on a phone: the Help Us Spread Quranic Knowledge hero, the Join the Mission button and the App Store and Google Play badges",
  width: 780,
  height: 1688,
};

export const rows: Row[] = [
  {
    id: "01",
    project: "Design System v2",
    role: "Design system",
    year: "2026",
    line: "Generate every design token from one source, in three tiers.",
    result: "805 tokens reach CSS, TypeScript and Figma",
    plate: { kind: "live", key: "design-system", width: 584, narrowWidth: 480, narrowShift: 150 },
    caption: "Component specimen. Recreation with invented data.",
    target: { kind: "selector", css: ".dsr-pipeline > *", all: true },
    hue: 253,
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "02",
    project: "Care-management platform",
    role: "Frontend, multi-tenant",
    year: "2023–26",
    line: "Many client organizations share one system.",
    result: "Each organization sees only its own patients",
    plate: { kind: "live", key: "care", width: 576, narrowWidth: 460 },
    caption: "Vitals trend card. Recreation with invented data.",
    target: { kind: "selector", css: 'button[aria-label^="Organization"]' },
    lane: 12,
    hue: 185,
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "03",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    year: "2023–26",
    line: "Rebuild the video platform on Nuxt 3, from an empty template.",
    result: "Moderated live chat, in 34 routes and 270+ components",
    plate: { kind: "live", key: "live-room", width: 440, narrowWidth: 460, narrowShift: 250 },
    caption: "Live room. Recreation with invented data.",
    target: { kind: "selector", css: "section[aria-label='Live chat'] .bg-accent-soft" },
    hue: 34,
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "04",
    project: "bayyinah.org",
    role: "Frontend",
    year: "2024–25",
    line: "Build the institute's site as one Next.js page.",
    result: "Live, with links to both app stores",
    plate: {
      kind: "shot",
      ...org,
      crop: { x: 0, y: 236, w: 780, h: 975 },
      narrow: { x: 0, y: 735, w: 780, h: 585 },
    },
    caption: "bayyinah.org on a phone, public page.",
    target: { kind: "shot", box: { x: 44, y: 1096, w: 668, h: 104 } },
    hue: 61,
    link: { label: "bayyinah.org", href: "https://bayyinah.org/", external: true },
  },
  {
    id: "05",
    project: "Incentiv",
    role: "Frontend, UI layer",
    year: "2024",
    line: "Build the sign-in of a smart-wallet dashboard. Teammates built the wallet layer.",
    result: "Passkey or wallet sign-in, in English and French",
    plate: { kind: "live", key: "wallet", width: 576, narrowWidth: 460, narrowShift: 150 },
    caption: "Wallet card. Recreation with invented data.",
    target: { kind: "selector", css: "button.w-full" },
    hue: 282,
    link: { label: "Open the case", href: "/work/incentiv" },
  },
  {
    id: "06",
    project: "Read to Feed",
    role: "Mobile",
    year: "2022–25",
    line: "Build a children's reading app around a PDF and EPUB reader.",
    result: "Progress is kept on every book",
    plate: { kind: "live", key: "reader", width: 480, narrowWidth: 420 },
    caption: "Reader page. Recreation with public-domain text.",
    target: { kind: "selector", css: "div:has(> .h-\\[3px\\])" },
    hue: 78,
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    id: "07",
    project: "Viva Fresh",
    role: "Mobile",
    year: "2023",
    line: "Ship one React Native codebase to iPhone and Android.",
    result: "Checkout in Albanian, live in both stores",
    plate: {
      kind: "shot",
      ...viva,
      crop: { x: 102, y: 862, w: 576, h: 720 },
      narrow: { x: 102, y: 1130, w: 576, h: 432 },
    },
    caption: "App Store listing, iPhone. Also on Google Play.",
    target: { kind: "shot", box: { x: 116, y: 1400, w: 300, h: 46 } },
    hue: 24,
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
];

export interface RecordRow {
  decision: string;
  project: string;
  years: string;
  result: string;
  slug?: string;
}

export const record: RecordRow[] = [
  {
    decision: "Rework one billing report until it stops timing out.",
    project: "Care-management API",
    years: "2026",
    result: "16 → 2 queries",
    slug: "care-platform",
  },
  {
    decision: "Move the care platform from Vue to React, one route at a time.",
    project: "Care-management platform",
    years: "2026",
    result: "Parity-tested on both apps",
    slug: "care-platform",
  },
  {
    decision: "Test tenant isolation in a time-off app.",
    project: "Offday",
    years: "2026",
    result: "16 security tests",
  },
  {
    decision: "Cut the image weight of a studio site.",
    project: "Snaxx Tech",
    years: "2026",
    result: "972 → 337 KB",
  },
  {
    decision: "Keep a children's reading app releasing from React Native 0.63 to 0.81.",
    project: "Read to Feed",
    years: "2022–25",
    result: "About 14 releases",
    slug: "read-to-feed",
  },
  {
    decision: "Play scripted chat conversations from one React Native package.",
    project: "Chatbot runtime",
    years: "2022–25",
    result: "1 package",
  },
  {
    decision: "Ship a publisher's book shop to iPhone and Android.",
    project: "Dukagjini Bookstore",
    years: "2021–22",
    result: "Live in both stores",
    slug: "dukagjini-bookstore",
  },
];
