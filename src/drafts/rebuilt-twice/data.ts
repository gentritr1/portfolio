import { careShots, type Px, type ScreenShot } from "../../content/careShots";
import { projects } from "../../content/projects";

export interface Pin {
  /** The note under the plate. Its dot starts the hairline. */
  note: string;
  /** The element inside the plate that the note is about. */
  target: string;
  /** The gutter the hairline takes from the note to the target. */
  side: "left" | "right";
  /** Stroke inside the plate: a light core with a dark halo reads on a video frame. */
  inside: "light" | "dark";
}

/** Real screenshots for the desktop and the phone, and the part the note is about in each, in the shot's CSS px. */
export interface Screen {
  shot: ScreenShot;
  shotNarrow: ScreenShot;
  spot: Px;
  spotNarrow: Px;
}

export interface Rewrite {
  id: string;
  project: string;
  year: string;
  role: string;
  years: string;
  plate: "live-room" | Screen;
  caption?: string;
  /** Sentence start. The struck constraint and its result follow and end the sentence. */
  head: string;
  was: string;
  now: string;
  pin: Pin;
  slug: string;
}

export const rewrites: Rewrite[] = [
  {
    id: "0003",
    project: "Bayyinah TV",
    year: "2023",
    role: "Frontend, core team",
    years: "2023–26",
    plate: "live-room",
    head: "Bayyinah TV is rebuilt on Nuxt 3",
    was: "from an empty template.",
    now: "to 34 routes and 270+ components.",
    pin: {
      note: "Live streams with realtime chat and moderation.",
      target: ".lr-player .rounded-md.bg-accent",
      side: "left",
      inside: "light",
    },
    slug: "bayyinah-tv",
  },
  {
    id: "0010",
    project: "Care platform",
    year: "2026",
    role: "Frontend",
    years: "2026",
    plate: {
      shot: { ...careShots.claims, crop: { x: 0, y: 0, w: 1440, h: 704 } },
      shotNarrow: { ...careShots.engagement, crop: { x: 843, y: 0, w: 597, h: 520 } },
      spot: { x: 14, y: 12, w: 184, h: 32 },
      spotNarrow: { x: 1182, y: 14, w: 160, h: 28 },
    },
    caption: "real product screens, invented data",
    head: "The care platform moves from Vue to React",
    was: "and no screen may change its behaviour.",
    now: "one route at a time, parity-tested on both apps.",
    pin: {
      note: "Many organizations share one system. Each sees only its own data.",
      target: "[data-spot]",
      side: "left",
      inside: "dark",
    },
    slug: "care-platform",
  },
];

export interface Row {
  id: string;
  decision: string;
  project: string;
  years: string;
  result: string;
  /** A row that is one of the two rewrites jumps to its card. */
  card?: boolean;
  slug?: string;
}

export const record: Row[] = [
  {
    id: "0001",
    decision: "Build the chatbot runtime as one reusable package.",
    project: "Chatbot runtime",
    years: "2022–25",
    result: "1 package",
  },
  {
    id: "0002",
    decision: "Ship one React Native codebase to both stores.",
    project: "Viva Fresh",
    years: "2023",
    result: "iOS and Android",
    slug: "viva-fresh",
  },
  {
    id: "0003",
    decision: "Rebuild Bayyinah TV on Nuxt 3 from an empty template.",
    project: "Bayyinah TV",
    years: "2023–26",
    result: "34 routes",
    card: true,
  },
  {
    id: "0004",
    decision: "Build the care platform’s features on Vue.",
    project: "Care platform",
    years: "2023",
    result: "superseded by 0010",
  },
  {
    id: "0005",
    decision: "Lay out the video platform right to left for Arabic.",
    project: "Bayyinah TV",
    years: "2023–26",
    result: "English and Arabic",
    slug: "bayyinah-tv",
  },
  {
    id: "0006",
    decision: "Generate every design token from one source.",
    project: "Design System v2",
    years: "2026",
    result: "805 tokens",
    slug: "design-system-react",
  },
  {
    id: "0007",
    decision: "Test tenant isolation in the time-off app.",
    project: "Offday",
    years: "2026",
    result: "about 200 tests",
  },
  {
    id: "0008",
    decision: "Cut the studio site’s image and deploy weight.",
    project: "Snaxx Tech",
    years: "2026",
    result: "972 → 337 KB",
  },
  {
    id: "0009",
    decision: "Rework one billing report until it stops timing out.",
    project: "Care API",
    years: "2026",
    result: "16 → 2 queries",
  },
  {
    id: "0010",
    decision: "Move the care platform to React, one route at a time.",
    project: "Care platform",
    years: "2026",
    result: "parity-tested",
    card: true,
  },
];

const named = new Set([
  "chatbot-runtime",
  "viva-fresh",
  "bayyinah-tv",
  "care-platform",
  "care-api",
  "design-system-react",
  "offday",
  "snaxx-tech",
]);

export const moreCount = projects.filter((project) => !named.has(project.slug)).length;
