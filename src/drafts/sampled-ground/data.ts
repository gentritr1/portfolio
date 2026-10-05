import { projects, type RecreationKey } from "../../content/projects";

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
  /** The kept part of the image, in fractions. It always ends on a whole row of the screen. */
  crop: Box;
}

/** A live plate renders at its design size and scales to the plate. */
export type Plate =
  | { kind: "live"; key: RecreationKey; design: [number, number]; narrow: [number, number] }
  | { kind: "shots"; shots: Shot[]; narrow: Shot }
  | { kind: "shot"; shot: Shot; narrow: Shot };

/** The pin ends on a part: an element of a live plate, or a box in one image of the plate. */
export type PinTarget = { kind: "selector"; css: string } | { kind: "image"; index: number; box: Box };

export interface Card {
  id: string;
  project: string;
  /** For the bar on a phone. */
  short: string;
  role: string;
  /** Problem → result, or what shipped. 18 words or fewer. */
  line: string;
  plate: Plate;
  caption: string;
  pin: PinTarget;
  narrowPin?: PinTarget;
  /** How the phone line reaches the part: up the plate's left or right edge, or straight up from below. */
  narrowRoute: "left" | "right" | "below";
  /** Dominant hue of the plate, measured from the rendered plate (OKLCH degrees). */
  hue: number;
  link: { label: string; href: string; external?: boolean };
}

const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h });

const vivaIphone = {
  src: "/mobile/grocery-3.webp",
  alt: "Viva Fresh cart on iPhone, from the App Store listing: two jars of ajvar, the total discount and the checkout bar",
  width: 780,
  height: 1689,
};
const vivaAndroid = {
  src: "/mobile/grocery-5.webp",
  alt: "Viva Fresh cart on Android, from the Google Play listing: the same cart screen, the total discount and the checkout bar",
  width: 780,
  height: 1387,
};

export const cards: Card[] = [
  {
    id: "viva-fresh",
    project: "Viva Fresh",
    short: "Viva Fresh",
    role: "Mobile · 2023",
    line: "One grocery app for iPhone and Android, from one React Native codebase. Live in both stores.",
    plate: {
      kind: "shots",
      shots: [
        { ...vivaIphone, crop: box(92 / 780, 862 / 1689, 596 / 780, 604 / 1689) },
        { ...vivaAndroid, crop: box(136 / 780, 808 / 1387, 508 / 780, 515 / 1387) },
      ],
      narrow: { ...vivaIphone, crop: box(88 / 780, 1080 / 1689, 604 / 780, 403 / 1689) },
    },
    caption: "Store listings, iPhone and Android",
    pin: { kind: "image", index: 1, box: box(536 / 780, 1268 / 1387, 90 / 780, 40 / 1387) },
    narrowPin: { kind: "image", index: 0, box: box(570 / 780, 1404 / 1689, 92 / 780, 40 / 1689) },
    narrowRoute: "below",
    hue: 23,
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "bayyinah-tv",
    project: "Bayyinah TV",
    short: "Bayyinah TV",
    role: "Frontend · 2023–26",
    line: "Rebuild the video platform on Nuxt 3: 34 routes, 270+ components, live streams with moderated chat.",
    plate: { kind: "live", key: "live-room", design: [1100, 550], narrow: [686, 457] },
    caption: "Recreation with invented data",
    pin: { kind: "selector", css: "section[aria-label='Live chat'] .bg-accent-soft" },
    narrowPin: { kind: "selector", css: ".lr-player .rounded-md.bg-accent" },
    narrowRoute: "left",
    hue: 34,
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "incentiv",
    project: "Incentiv",
    short: "Incentiv",
    role: "Frontend, UI layer · 2024",
    line: "Sign people in with a passkey or an external wallet, in English and French.",
    plate: { kind: "live", key: "wallet", design: [800, 400], narrow: [686, 457] },
    caption: "Recreation with invented data",
    pin: { kind: "selector", css: "button.w-full" },
    narrowRoute: "left",
    hue: 282,
    link: { label: "Open the case", href: "/work/incentiv" },
  },
  {
    id: "bayyinah-org",
    project: "bayyinah.org",
    short: "bayyinah.org",
    role: "Frontend · 2024–25",
    line: "A one-page Next.js site for the institute, live, with links to both app stores.",
    plate: {
      kind: "shot",
      shot: {
        src: "/showcase/bayyinah/org-01.webp",
        alt: "bayyinah.org home: the Help Us Spread Quranic Knowledge hero, the Join the Mission button and the two store badges",
        width: 1440,
        height: 900,
        crop: box(0, 86 / 900, 1, 720 / 900),
      },
      narrow: {
        src: "/showcase/bayyinah/org-01.webp",
        alt: "bayyinah.org home: the hero, the Join the Mission button and the two store badges",
        width: 1440,
        height: 900,
        crop: box(230 / 1440, 88 / 900, 980 / 1440, 653 / 900),
      },
    },
    caption: "bayyinah.org, public page",
    pin: { kind: "image", index: 0, box: box(525 / 1440, 676 / 900, 377 / 1440, 55 / 900) },
    narrowRoute: "below",
    hue: 62,
    link: { label: "bayyinah.org", href: "https://bayyinah.org/", external: true },
  },
  {
    id: "design-system",
    project: "Design System v2",
    short: "Design System v2",
    role: "Design system · 2026",
    line: "805 tokens in three tiers from one source, under 36 components in 20 releases.",
    plate: { kind: "live", key: "design-system", design: [860, 430], narrow: [686, 457] },
    caption: "Recreation with invented data",
    pin: { kind: "selector", css: ".dsr-pipeline" },
    narrowRoute: "left",
    hue: 253,
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "care-platform",
    project: "Care-management platform",
    short: "Care platform",
    role: "Frontend · 2026",
    line: "Move a multi-tenant care platform from Vue to React, one parity-tested route at a time.",
    plate: { kind: "live", key: "care", design: [1100, 550], narrow: [686, 457] },
    caption: "Recreation with invented data",
    pin: { kind: "selector", css: 'button[aria-label^="Organization"]' },
    narrowRoute: "right",
    hue: 186,
    link: { label: "Open the case", href: "/work/care-platform" },
  },
];

/** Two neighbours whose hues are closer than this share one ground. */
export const SHARE_DEGREES = 15;

/** The hue each card paints the page with. A card close to the previous ground keeps that ground. */
export const grounds: number[] = cards.reduce<number[]>((list, card, index) => {
  const previous = list[index - 1];
  const near = previous !== undefined && Math.abs(((card.hue - previous + 540) % 360) - 180) < SHARE_DEGREES;
  list.push(near ? previous : card.hue);
  return list;
}, []);

export interface Row {
  decision: string;
  project: string;
  years: string;
  result: string;
  slug?: string;
}

export const record: Row[] = [
  {
    decision: "Rework one billing report until it stops timing out.",
    project: "Care-management API",
    years: "2026",
    result: "16 → 2 queries",
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
    decision: "Build the care platform's features on Vue (Nuxt 2).",
    project: "Care-management platform",
    years: "2023–26",
    result: "4 languages",
    slug: "care-platform",
  },
  {
    decision: "Keep a children's reading app releasing from React Native 0.63 to 0.81.",
    project: "Read to Feed",
    years: "2022–25",
    result: "≈14 releases",
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

export const projectCount = projects.length;
