import { findProject } from "../../content/projects";
import type { Box } from "./data";

export interface OwnShot {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The part of the image the plate shows, in source pixels. */
  crop: Box;
  /** The part the ring marks, in source pixels. */
  ring: Box;
  /**
   * The source row where the hairline enters the plate. Inside the ring's
   * height, the line runs straight to the ring. Outside it, the line runs
   * along this clear row, then turns onto the ring.
   */
  entry?: number;
  /**
   * The plate box in source pixels, when it is wider than the crop. The crop
   * sits in its middle at full height, on the ground colour.
   */
  stage?: { w: number; h: number; ground: string };
}

export interface OwnView {
  key: string;
  tab: string;
  result: string;
  caption: string;
  wide: OwnShot;
  narrow: OwnShot;
}

export interface OwnRow {
  id: string;
  project: string;
  line: string;
  role: string;
  year: string;
  tone: "light" | "dark";
  views: OwnView[];
  github?: string;
}

/** Offday captures are 2880 x 1800 (a 1440 px window at 2x). */
const offday = (name: string, alt: string) => ({
  src: `/personal/shots/offday-light-${name}.webp`,
  alt,
  width: name.endsWith("phone") ? 780 : 2880,
  height: name.endsWith("phone") ? 1688 : 1800,
});

/** One plate ratio for every Offday view, so a tab change never moves the page. */
const WIDE = 880 / 676;
const NARROW = 4 / 3;
const box = (x: number, y: number, w: number, ratio?: number, h?: number): Box => ({
  x,
  y,
  w,
  h: h ?? Math.round(w / (ratio ?? 1)),
});

const shifts = offday(
  "shifts-desktop",
  "Offday Shifts week: Olivia's Monday evening shift says Needs cover because she is off on vacation",
);
const bestDates = offday(
  "best-dates-desktop",
  "Offday request form with Find the best dates open: 6 days off for 3 around Veterans Day and Thanksgiving",
);
const bestDatesPhone = offday(
  "best-dates-phone",
  "Offday Find the best dates on a phone: 6 days off for 3 around Veterans Day and Thanksgiving",
);
const rest = offday(
  "drag-select-desktop",
  "Offday November calendar with four days selected and the Time to rest card: 25 days to use by 31 Dec",
);
const assistant = offday(
  "assistant-desktop",
  "Offday assistant answering who is off today and who is off next week, beside the team calendar",
);

/** OFFBEAT and FORM captures are 2880 x 1800 (a 1440 px window at 2x). */
const studio = {
  src: "/personal/shots/offbeat-studio-desktop.webp",
  alt: "OFFBEAT sound studio: an eight-step drum machine with kick, snare, hi-hat and bass rows, the playing step in red",
  width: 2880,
  height: 1800,
};
const collection = {
  src: "/personal/shots/form-studio-desktop.webp",
  alt: "FORM collection: the Trefoil in copper with its formula, p(t) = ((2 + cos 3t) cos 2t, (2 + cos 3t) sin 2t, sin 3t)",
  width: 2880,
  height: 1800,
};

const link = (slug: string) => findProject(slug)?.links.find((item) => item.label === "GitHub")?.href;

export const ownRows: OwnRow[] = [
  {
    id: "05",
    project: "Offday",
    line: "A time-off app for teams: requests, approvals and one shared calendar.",
    role: "Own project",
    year: "2026",
    tone: "light",
    views: [
      {
        key: "shifts",
        tab: "Shifts",
        result: "It flags a shift that has no cover",
        caption: "Shifts week, demo workspace.",
        wide: { ...shifts, crop: box(533, 418, 1598, WIDE), ring: box(988, 870, 323, 1, 152), entry: 1004 },
        narrow: { ...shifts, crop: box(978, 624, 566, NARROW), ring: box(988, 870, 323, 1, 152) },
      },
      {
        key: "best-dates",
        tab: "Best dates",
        result: "It finds the longest breaks around holidays",
        caption: "Find the best dates, demo workspace.",
        wide: {
          ...bestDates,
          crop: box(966, 89, 948, 1, 1345),
          stage: { w: Math.round(1345 * WIDE), h: 1345, ground: "#a2a0a1" },
          ring: box(1025, 1031, 829, 1, 193),
          entry: 1073,
        },
        narrow: { ...bestDatesPhone, crop: box(40, 1078, 700, NARROW), ring: box(100, 1286, 580, 1, 186) },
      },
      {
        key: "rest",
        tab: "Time to rest",
        result: "It shows who has had no real break",
        caption: "Time to rest, demo workspace.",
        wide: { ...rest, crop: box(1788, 961, 1092, WIDE), ring: box(2278, 1365, 533, 1, 383), entry: 1526 },
        narrow: { ...rest, crop: box(2272, 1354, 539, NARROW), ring: box(2284, 1368, 519, 1, 230) },
      },
      {
        key: "assistant",
        tab: "Assistant",
        result: "An AI assistant answers questions about the team",
        caption: "Workspace assistant, demo workspace.",
        wide: { ...assistant, crop: box(1267, 360, 1613, WIDE), ring: box(2095, 579, 710, 1, 383), entry: 713 },
        narrow: { ...assistant, crop: box(2081, 432, 742, NARROW), ring: box(2100, 583, 701, 1, 374) },
      },
    ],
  },
  {
    id: "06",
    project: "OFFBEAT",
    line: "A concept site for a made-up portable speaker.",
    role: "Concept",
    year: "2026",
    tone: "dark",
    github: link("offbeat"),
    views: [
      {
        key: "studio",
        tab: "Sound studio",
        result: "Its 8-step drum machine plays in the browser",
        caption: "OFFBEAT sound studio. The brand is fictional.",
        wide: { ...studio, crop: box(1190, 70, 1540, 1, 940), ring: box(1236, 405, 1452, 1, 474) },
        narrow: { ...studio, crop: box(1390, 446, 1296, 1, 432), ring: box(2040, 452, 162, 1, 418) },
      },
    ],
  },
  {
    id: "07",
    project: "FORM",
    line: "A concept exhibition of sculptures made from maths.",
    role: "Concept",
    year: "2026",
    tone: "dark",
    github: link("form"),
    views: [
      {
        key: "collection",
        tab: "Collection",
        result: "Three sculptures, each drawn live from a formula",
        caption: "FORM collection. The exhibition is fictional.",
        wide: { ...collection, crop: box(80, 500, 1466, 1, 1040), ring: box(98, 1472, 1030, 1, 52) },
        narrow: {
          src: "/personal/shots/form-phone.webp",
          alt: "FORM on a phone: the three sculptures Trefoil, Orbit and Bloom above the copper trefoil",
          width: 780,
          height: 1688,
          crop: box(0, 840, 780, 1, 800),
          ring: box(30, 856, 320, 1, 80),
        },
      },
    ],
  },
];
