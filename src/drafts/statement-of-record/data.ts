import { careShots, dsShots, REAL_SCREENS, type ScreenShot } from "../../content/careShots";
import { projects } from "../../content/projects";

export type Plate =
  | { kind: "real"; shot: ScreenShot; phone?: ScreenShot; caption: string }
  | { kind: "web"; src: string; alt: string; caption: string }
  | {
      kind: "screen";
      src: string;
      alt: string;
      caption: string;
      /** Image size, then the crop box of the app screen inside the store image, in image pixels. */
      image: [number, number];
      crop: [number, number, number, number];
      /** The result that fills the column beside the store image. */
      figure: string;
      unit: string;
    }
  | { kind: "number"; was: string; now: string; unit: string; caption: string };

export type EntryLink =
  | { kind: "case"; slug: string }
  | { kind: "site"; href: string; label: string };

export interface Entry {
  id: string;
  project: string;
  slug: string;
  role: string;
  years: string;
  /** Sentence start. With an edit, the struck constraint and its result follow and end the sentence. */
  head: string;
  edit?: { was: string; now: string };
  /** Words in `head` that prove the statement clause that cites this entry. */
  mark?: string;
  plate?: Plate;
  link?: EntryLink;
  /** Short outcome for the closing record. An entry with no plate lives only in the record. */
  result: string;
}

export const clauses = [
  { text: "a multi\u2011tenant care platform", stop: ",", cites: "0010", row: 0 },
  { text: "from the design system", stop: "", cites: "0008", row: 1 },
  { text: "to the API behind it", stop: ",", cites: "0009", row: 1 },
  { text: "and mobile apps in both stores", stop: ".", cites: "0002", row: 2 },
] as const;

export const rows = [0, 1, 2].map((row) =>
  clauses.filter((clause) => clause.row === row),
);

export const entries: Entry[] = [
  {
    id: "0010",
    project: "Care platform",
    slug: "care-platform",
    role: "Frontend",
    years: "2026",
    head: "The care platform moves to React",
    edit: {
      was: "and no screen may change its behaviour.",
      now: "one route at a time, each after a parity test on both apps.",
    },
    mark: "care platform",
    plate: { kind: "real", shot: careShots.claims, phone: careShots.patients, caption: REAL_SCREENS },
    link: { kind: "case", slug: "care-platform" },
    result: "Parity test on both apps",
  },
  {
    id: "0009",
    project: "Care API",
    slug: "care-api",
    role: "Full stack",
    years: "2026",
    head: "One billing report in the Laravel API",
    edit: {
      was: "runs 16 queries and times out.",
      now: "runs 2 queries and no longer times out.",
    },
    mark: "Laravel API",
    plate: {
      kind: "number",
      was: "16",
      now: "2",
      unit: "queries",
      caption: "Billing report, queries before and after",
    },
    link: { kind: "case", slug: "care-platform" },
    result: "16 → 2 queries",
  },
  {
    id: "0008",
    project: "Design System v2",
    slug: "design-system-react",
    role: "Design system",
    years: "2026",
    head: "Design System v2: 36 components and 805 tokens, 20 releases in about six weeks.",
    mark: "Design System v2",
    plate: { kind: "real", shot: dsShots.dateRange, caption: REAL_SCREENS },
    link: { kind: "case", slug: "design-system-react" },
    result: "36 components, 805 tokens",
  },
  {
    id: "0007",
    project: "Offday",
    slug: "offday",
    role: "Personal project",
    years: "2026",
    head: "Many teams share one time-off app,",
    edit: {
      was: "and no team may see another team’s data.",
      now: "and about 200 tests check security and tenant isolation.",
    },
    plate: {
      kind: "web",
      src: "/personal/shots/offday-light-calendar-desktop.webp",
      alt: "Offday team calendar in the demo workspace: October leave bars and the approval queue",
      caption: "Own project, own capture",
    },
    result: "about 200 tests",
  },
  {
    id: "0006",
    project: "Snaxx Tech",
    slug: "snaxx-tech",
    role: "Personal project",
    years: "2026",
    head: "The studio site, with a 3D hero, ships",
    edit: {
      was: "972 KB of images and a 28 MB deploy.",
      now: "337 KB of images and a 9.5 MB deploy.",
    },
    plate: {
      kind: "web",
      src: "/personal/shots/snaxx-desktop.webp",
      alt: "Snaxx Tech studio site hero: The Snaxx Almanac, an illustrated landscape of apps and games",
      caption: "snaxxtech.com, own site",
    },
    link: {
      kind: "site",
      href: "https://www.snaxxtech.com/",
      label: "Open the site",
    },
    result: "972 → 337 KB",
  },
  {
    id: "0005",
    project: "Bayyinah TV",
    slug: "bayyinah-tv",
    role: "Frontend, core team",
    years: "2023–26",
    head: "Bayyinah TV’s second version is a full Nuxt 3 rebuild: 34 routes, 270+ components, live streams and subscriptions.",
    plate: {
      kind: "web",
      src: "/showcase/bayyinah/web-05.webp",
      alt: "Bayyinah TV series page: episode list in a side column, series summary and video cards",
      caption: "bayyinahtv.com, public series page",
    },
    link: { kind: "case", slug: "bayyinah-tv" },
    result: "34 routes, 270+ components",
  },
  {
    id: "0004",
    project: "Care platform",
    slug: "care-platform",
    role: "Frontend",
    years: "2023–26",
    head: "The care platform’s features run on Vue (Nuxt 2), in English, German, Spanish and Turkish.",
    result: "4 languages, superseded by 0010",
  },
  {
    id: "0003",
    project: "Bayyinah TV",
    slug: "bayyinah-tv",
    role: "Frontend, core team",
    years: "2023–26",
    head: "Bayyinah TV runs in English and Arabic, with a full right-to-left layout.",
    result: "English and Arabic, full RTL",
  },
  {
    id: "0002",
    project: "Viva Fresh",
    slug: "viva-fresh",
    role: "Mobile",
    years: "2023",
    head: "One React Native codebase ships Viva Fresh to the App Store and Google Play.",
    mark: "App Store and Google Play",
    plate: {
      kind: "screen",
      src: "/mobile/grocery-1.webp",
      alt: "Viva Fresh home screen from the App Store listing: product categories, recent products and the first row of product cards",
      caption: "App Store listing, home screen",
      image: [780, 1689],
      crop: [88, 352, 605, 890],
      figure: "iOS and Android",
      unit: "One React Native codebase",
    },
    link: { kind: "case", slug: "viva-fresh" },
    result: "iOS and Android",
  },
  {
    id: "0001",
    project: "Chatbot runtime library",
    slug: "chatbot-runtime",
    role: "Mobile",
    years: "2022–25",
    head: "A scripted chat conversation has stall and duplicate guards on one message queue.",
    result: "Stall, duplicate guards",
  },
];

export const cards = entries.filter((entry) => entry.plate);

export const constraintCount = cards.filter((entry) => entry.edit).length;

export const moreCount =
  projects.length - new Set(entries.map((entry) => entry.slug)).size;

export const spoken = (entry: Entry) =>
  entry.edit
    ? `${entry.head} ${entry.edit.was} Now: ${entry.head} ${entry.edit.now}`
    : entry.head;
