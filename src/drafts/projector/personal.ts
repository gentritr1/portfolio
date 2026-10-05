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

const link = (slug: string) => findProject(slug)?.links.find((item) => item.label === "GitHub")?.href;

export const ownRows: OwnRow[] = [
  {
    id: "09",
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
        wide: { ...bestDates, crop: box(634, 89, 1613, WIDE), ring: box(1025, 1031, 829, 1, 193), entry: 1073 },
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
    id: "10",
    project: "OFFBEAT",
    line: "A concept site for a made-up portable speaker.",
    role: "Concept",
    year: "2026",
    tone: "dark",
    github: link("offbeat"),
    views: [
      {
        key: "home",
        tab: "Home",
        result: "Turn the 3D speaker and pick a finish",
        caption: "OFFBEAT home page. The brand is fictional.",
        wide: {
          src: "/personal/shots/offbeat-home-desktop.webp",
          alt: "OFFBEAT home: a hot-orange portable speaker in 3D, the line Plays your songs. Makes its own. and four finish swatches",
          width: 1440,
          height: 900,
          crop: box(0, 0, 1440, 1, 840),
          ring: box(1068, 672, 198, 1, 52),
          entry: 650,
        },
        narrow: {
          src: "/personal/shots/offbeat-phone.webp",
          alt: "OFFBEAT home on a phone: the hot-orange 3D speaker",
          width: 750,
          height: 1624,
          crop: box(0, 905, 750, 1, 640),
          ring: box(126, 1086, 598, 1, 394),
        },
      },
    ],
  },
  {
    id: "11",
    project: "FORM",
    line: "A concept exhibition of sculptures made from maths.",
    role: "Concept",
    year: "2026",
    tone: "dark",
    github: link("form"),
    views: [
      {
        key: "home",
        tab: "Home",
        result: "Three sculptures that turn live, in three materials",
        caption: "FORM home page. The exhibition is fictional.",
        wide: {
          src: "/personal/shots/form-home-desktop.webp",
          alt: "FORM home: a copper trefoil knot, the title Objects of imagination. and the three sculptures Trefoil, Orbit and Bloom",
          width: 1440,
          height: 900,
          crop: box(0, 0, 1440, 1, 840),
          ring: box(46, 620, 162, 1, 44),
          entry: 642,
        },
        narrow: {
          src: "/personal/shots/form-phone.webp",
          alt: "FORM home on a phone: the three sculptures Trefoil, Orbit and Bloom above the copper knot",
          width: 750,
          height: 1624,
          crop: box(0, 840, 750, 1, 784),
          ring: box(34, 860, 310, 1, 72),
        },
      },
    ],
  },
];
