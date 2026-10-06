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
  | {
      kind: "live";
      key: RecreationKey;
      design: [number, number];
      /** The phone renders the recreation at its own narrow layout and shows one band of it, in design pixels. */
      narrow: { width: number; height: number; top: number; band: number };
    }
  | {
      kind: "shot";
      shot: Shot;
      narrow: Shot;
      /** The image is narrower than the slot, so the slot takes the crop's size in source pixels. */
      native?: boolean;
    };

/** The pin ends on a part: an element of a live plate, or a box in one image of the plate. */
export type PinTarget = { kind: "selector"; css: string } | { kind: "image"; index: number; box: Box };

export interface Card {
  id: string;
  project: string;
  /** For the bar on a phone. */
  short: string;
  role: string;
  /** Decision → result, 18 words or fewer together. */
  decision: string;
  result: string;
  plate: Plate;
  caption: string;
  /** The same part on both devices. */
  pin: PinTarget;
  /** How the phone line reaches the part: up the plate's left or right edge, or straight up from below. */
  narrowRoute: "left" | "right" | "below";
  /** Dominant hue of the plate, measured from the rendered plate (OKLCH degrees). */
  hue: number;
  link: { label: string; href: string; external?: boolean };
}

const box = (x: number, y: number, w: number, h: number): Box => ({ x, y, w, h });

const vivaIphone = {
  src: "/mobile/grocery-3.webp",
  alt: "Viva Fresh cart on iPhone, from the App Store listing: a jar of ajvar, the total discount and the checkout bar at 25.11 euro",
  width: 780,
  height: 1689,
};

export const cards: Card[] = [
  {
    id: "viva-fresh",
    project: "Viva Fresh",
    short: "Viva Fresh",
    role: "Mobile · 2023",
    decision: "Ship one React Native codebase to iPhone and Android.",
    result: "One checkout, in\u00a0Albanian, in both\u00a0stores.",
    plate: {
      kind: "shot",
      shot: { ...vivaIphone, crop: box(88 / 780, 1098 / 1689, 604 / 780, 370 / 1689) },
      narrow: { ...vivaIphone, crop: box(88 / 780, 1098 / 1689, 604 / 780, 370 / 1689) },
      native: true,
    },
    caption: "Store listing, iPhone; the same screen is on Google Play",
    pin: { kind: "image", index: 0, box: box(103 / 780, 1387 / 1689, 575 / 780, 73 / 1689) },
    narrowRoute: "below",
    hue: 23,
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "bayyinah-tv",
    project: "Bayyinah TV",
    short: "Bayyinah TV",
    role: "Frontend · 2023–26",
    decision: "Rebuild the video platform on Nuxt 3.",
    result: "Moderated live chat. 34 routes, 270+\u00a0components.",
    plate: { kind: "live", key: "live-room", design: [1100, 550], narrow: { width: 360, height: 640, top: 158, band: 334 } },
    caption: "Recreation with invented data",
    pin: { kind: "selector", css: "section[aria-label='Live chat'] .bg-accent-soft" },
    narrowRoute: "left",
    hue: 34,
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "incentiv",
    project: "Incentiv",
    short: "Incentiv",
    role: "Frontend, UI layer · 2024",
    decision: "Build the UI layer of a smart-wallet dashboard.",
    result: "Passkey or wallet sign-in, in English and French.",
    plate: { kind: "live", key: "wallet", design: [800, 400], narrow: { width: 360, height: 640, top: 386, band: 154 } },
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
    decision: "Build the institute's site as one Next.js page.",
    result: "Live, with links to both app stores.",
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
        alt: "bayyinah.org home: the Join the Mission button and the two store badges",
        width: 1440,
        height: 900,
        crop: box(463 / 1440, 540 / 900, 500 / 1440, 210 / 900),
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
    decision: "Keep 805 tokens in three tiers in one source.",
    result: "It generates CSS, TypeScript and a Figma bundle.",
    plate: { kind: "live", key: "design-system", design: [860, 430], narrow: { width: 360, height: 900, top: 580, band: 198 } },
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
    decision: "Serve many client organizations from one care platform.",
    result: "Each sees only its own patients.",
    plate: { kind: "live", key: "care", design: [1100, 550], narrow: { width: 360, height: 520, top: 0, band: 520 } },
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
    decision: "Move the care platform from Vue to React, one route at a time.",
    project: "Care-management platform",
    years: "2026",
    result: "parity test per route",
    slug: "care-platform",
  },
  {
    decision: "Ship 36 components as one typed, versioned package.",
    project: "Design System v2",
    years: "2026",
    result: "20 releases",
    slug: "design-system-react",
  },
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
    result: "about 200 tests",
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
    decision: "Ship a publisher's book shop to iPhone and Android.",
    project: "Dukagjini Bookstore",
    years: "2021–22",
    result: "Live in both stores",
    slug: "dukagjini-bookstore",
  },
];

export const projectCount = projects.length;
