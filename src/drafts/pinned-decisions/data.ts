import { careShots, dsShots, type ScreenShot } from "../../content/careShots";

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** A crop of a store frame in image pixels, so that only the app screen shows. */
export interface CroppedShot extends Shot {
  label: string;
  crop: { x: number; y: number; w: number; h: number };
}

export interface Measure {
  from: number;
  to: number;
  print: (n: number) => string;
  unit: string;
}

export type Plate =
  /**
   * A real product screen. `narrow` is the shot for a phone. `center` keeps the crop at its own size in the
   * middle of the plate, on the screen's own colour, because the file has too few pixels to cover the plate.
   */
  | { kind: "screen"; shot: ScreenShot; narrow: ScreenShot; center?: boolean }
  | { kind: "shot"; shot: Shot }
  | { kind: "pair"; shots: [CroppedShot, CroppedShot] }
  | { kind: "record"; context: string; decision: string; consequence: string; measure?: Measure };

/** A pointing pin ends at a part of the plate. `rect` is in image pixels, or in the CSS pixels of a screen plate's shot. */
export interface Point {
  rect: [number, number, number, number];
  route: "left" | "right" | "over";
}

export interface Decision {
  id: string;
  title: string;
  /** Short label for the log row. */
  label: string;
  /** Result in mono for the log row. */
  result: string;
  project: string;
  role: string;
  years: string;
  plate: Plate;
  /** One line under the plate. `{n}` marks where a riding number sits. */
  line?: string;
  point?: Point;
  /** The number that rides inside the line under the plate. */
  lineMeasure?: Measure;
  supersededBy?: string;
  link?: { label: string; href: string; external?: boolean };
}

const integer = (n: number) => String(n);
const kilobytes = (n: number) => `${n} KB`;

export const decisions: Decision[] = [
  {
    id: "0010",
    title: "Move the care platform to React, one route at a time.",
    label: "Vue → React, route by route",
    result: "parity-tested",
    project: "Care-management platform",
    role: "Frontend",
    years: "2026",
    plate: { kind: "screen", shot: careShots.overview, narrow: careShots.patients },
    line: "The React dashboard counts the patients in each program: RPM, CCM and RTM.",
    point: { rect: [282, 309, 532, 162], route: "left" },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "0009",
    title: "Rework one billing report until it stops timing out.",
    label: "One billing report",
    result: "16 → 2 queries",
    project: "Care-management API",
    role: "Full stack",
    years: "2026",
    plate: {
      kind: "record",
      context: "One billing report in the Laravel API runs too many queries and times out.",
      decision: "Rework the report's queries.",
      consequence: "The same report no longer times out.",
      measure: { from: 16, to: 2, print: integer, unit: "queries" },
    },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "0008",
    title: "Cut the studio site's image and deploy weight.",
    label: "Studio site",
    result: "972 → 337 KB",
    project: "Snaxx Tech",
    role: "Owner",
    years: "2026",
    plate: {
      kind: "shot",
      shot: {
        src: "/personal/shots/snaxx-desktop.webp",
        alt: "Snaxx Tech studio site hero, The Snaxx Almanac illustrated landscape of apps and games",
        width: 1440,
        height: 900,
      },
    },
    line: "Images {n} → {m}, the deploy 28 MB → 9.5 MB, under a strict CSP.",
    lineMeasure: { from: 972, to: 337, print: kilobytes, unit: "KB" },
    link: { label: "snaxxtech.com", href: "https://www.snaxxtech.com/", external: true },
  },
  {
    id: "0007",
    title: "Test tenant isolation in the time-off app.",
    label: "Time-off app",
    result: "about 200 tests",
    project: "Offday",
    role: "Owner",
    years: "2026",
    plate: {
      kind: "shot",
      shot: {
        src: "/personal/shots/offday-light-calendar-desktop.webp",
        alt: "Offday team calendar in the demo workspace, October leave bars and approval queue",
        width: 1440,
        height: 900,
      },
    },
    line: "About 200 Playwright tests check security, and that each workspace sees only its own data.",
    point: { rect: [18, 106, 191, 57], route: "left" },
  },
  {
    id: "0006",
    title: "Generate every design token from one source.",
    label: "Design System v2",
    result: "36 components",
    project: "Design System v2",
    role: "Design system",
    years: "2026",
    plate: {
      kind: "screen",
      shot: {
        ...dsShots.buttonAlert,
        alt: "Design System v2 in its Storybook: buttons in four styles, buttons with icons, and alerts for a note, information, success and a warning. Invented data.",
        crop: { x: 0, y: 0, w: 720, h: 486 },
      },
      narrow: dsShots.top,
      center: true,
    },
    line: "One source builds the CSS, the TypeScript and a Figma bundle: 805 tokens in three tiers.",
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "0005",
    title: "Lay out the video platform right to left for Arabic.",
    label: "English and Arabic",
    result: "right to left",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    years: "2023–26",
    plate: {
      kind: "shot",
      shot: {
        src: "/showcase/bayyinah/web-03.webp",
        alt: "Bayyinah TV library, Arabic tab: beginner courses and the flagship Arabic program",
        width: 1440,
        height: 900,
      },
    },
    line: "English and Arabic in one interface, with a complete right-to-left layout.",
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "0004",
    title: "Build the care platform's features on Vue.",
    label: "Care platform on Vue",
    result: "4 languages",
    project: "Care-management platform",
    role: "Frontend",
    years: "2023",
    plate: {
      kind: "record",
      context:
        "Care teams follow vitals, care plans, labs, claims, calls and chat. Many client organizations share one system.",
      decision:
        "Build the features on Vue (Nuxt 2). Every screen keeps each organization's data apart and respects each user's role and timezone.",
      consequence: "The platform runs in English, German, Spanish and Turkish.",
    },
    supersededBy: "0010",
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "0003",
    title: "Rebuild Bayyinah TV on Nuxt 3 from an empty template.",
    label: "Nuxt 3 rebuild",
    result: "34 routes",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    years: "2023–26",
    plate: {
      kind: "shot",
      shot: {
        src: "/showcase/bayyinah/web-06.webp",
        alt: "Bayyinah TV pricing: Choose Your Plan with a monthly and annual switch and the Premium plan",
        width: 1440,
        height: 900,
      },
    },
    line: "Stripe, Apple and Google subscriptions behind one paywall, in 34 routes and 270+ components.",
    point: { rect: [528, 121, 264, 61], route: "over" },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "0002",
    title: "Ship one React Native codebase to both stores.",
    label: "One React Native codebase",
    result: "both stores",
    project: "Viva Fresh",
    role: "Mobile",
    years: "2023",
    plate: {
      kind: "pair",
      shots: [
        {
          src: "/mobile/grocery-1.webp",
          alt: "Viva Fresh store screenshot on iPhone: home with product categories and latest products, Albanian interface",
          width: 780,
          height: 1689,
          label: "Home",
          crop: { x: 100, y: 476, w: 580, h: 766 },
        },
        {
          src: "/mobile/grocery-2.webp",
          alt: "Viva Fresh store screenshot on iPhone: Fresh category with a product grid and the cart total",
          width: 780,
          height: 1689,
          label: "Category",
          crop: { x: 100, y: 560, w: 580, h: 774 },
        },
      ],
    },
    line: "The same grocery app on iPhone and on Android, from one codebase.",
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "0001",
    title: "Build the chatbot runtime as one reusable package.",
    label: "Chatbot runtime",
    result: "1 package",
    project: "Chatbot runtime library",
    role: "Mobile",
    years: "2022–25",
    plate: {
      kind: "record",
      context: "An app supplies a script of text, media, choices, ratings and timers.",
      decision:
        "Build one React Native package that plays it: a message queue, natural typing delays, stall and duplicate guards.",
      consequence: "An app gets a complete chat flow from a script. In 2025 the runtime moves to the web in TypeScript.",
    },
  },
];
