/** A box in fractions of its reference image. */
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
  /** The part the wide frame shows. It ends on a whole row of the screen. */
  crop: Box;
  /** The 4:3 part the phone frame shows. */
  narrow: Box;
}

export type Target = { kind: "selector"; css: string; round?: boolean } | { kind: "shot"; box: Box };

/**
 * "lane": the line enters the plate along a clear row (a fraction of the plate height), then turns onto the part.
 * "level": the line enters at that height and meets the side of the ring.
 */
export type Route = { kind: "side" } | { kind: "lane"; y: number } | { kind: "level"; y: number };

/**
 * "fixed": the before is a problem that is gone, so its measured part is struck.
 * "earlier": the before is an earlier state, not a problem. It is not struck.
 * "shipped": a new product. There is no before.
 * "own": made outside client work. The first line says what it is, the second one striking detail.
 */
export type Kind = "fixed" | "earlier" | "shipped" | "own";

/** One measured weight. The bar is drawn at "ratio" of its old length. */
export interface Weight {
  tag: string;
  from: string;
  to: string;
  ratio: number;
  /** The hairline rings this weight's new number. */
  ring?: boolean;
}

export type Plate =
  | { kind: "figure"; which: "bundle" }
  /** A care app screen over the measured billing report. On a phone the screen sits on its own ground and the report is left out. */
  | { kind: "report"; shot: Shot; head: string; weights: Weight[] }
  | { kind: "proof"; shot: Shot; weights: Weight[] }
  /** "center": the crop keeps its own ratio and sits on the ground colour, which matches the screen's own background. */
  | { kind: "web"; shot: Shot; ground: string; dark?: boolean; fit?: "center" }
  | { kind: "phone"; shot: Shot };

export interface Row {
  id: string;
  project: string;
  role: string;
  year: string;
  kind: Kind;
  /** The label of the first line when it is not "Then" or "Shipped". */
  label?: string;
  /** The problem, the earlier state, or what shipped. */
  then: string;
  /** The parts of `then` that are gone. Only a fixed row has them. */
  strike?: string[];
  /** The result. It carries the hairline when a pixel proves it. */
  now: string;
  /** One plain fact that keeps the result honest. */
  note?: string;
  plate: Plate;
  caption: string;
  /** The caption on a phone, when the phone plate leaves a part out. */
  captionNarrow?: string;
  target?: Target;
  /** The part the 4:3 phone crop rings, when the wide target is outside it. */
  narrowTarget?: Target;
  route?: Route;
  link?: { label: string; href: string; external?: boolean };
}

const box = (x: number, y: number, w: number, h: number, width: number, height: number): Box => ({
  x: x / width,
  y: y / height,
  w: w / width,
  h: h / height,
});


export const rows: Row[] = [
  {
    id: "01",
    project: "Care-management platform",
    role: "Frontend and full stack",
    year: "2023–26",
    kind: "fixed",
    then: "Many client organizations use this care app. One billing report asked the database 16 times and timed out.",
    strike: ["16 times and timed out"],
    now: "It asks 2 times and finishes.",
    note: "Most screens are already rebuilt in React; a screen moves over only after it passes the same tests in both apps.",
    plate: {
      kind: "report",
      shot: {
        src: "/showcase/care-dashboard/claims.webp",
        alt: "Claims page of the care app: claim counts by status, filters, and four claims with their program, CPT codes, date of service and status. Invented data.",
        width: 1440,
        height: 900,
        crop: box(266, 266, 1144, 612, 1440, 900),
        narrow: box(262, 576, 534, 298, 1440, 900),
      },
      head: "One billing report · requests to the database",
      weights: [{ tag: "Requests", from: "16", to: "2", ratio: 2 / 16, ring: true }],
    },
    caption: "Claims page: real product screens · invented data.",
    captionNarrow: "The care app's claims page: real product screens · invented data.",
    target: { kind: "selector", css: "[data-to]" },
    route: { kind: "lane", y: 0.735 },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "02",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    year: "2023–26",
    kind: "earlier",
    then: "Version 1 of a video-learning platform for members.",
    now: "Built again: members subscribe on the web, iPhone or Android.",
    note: "A new app of 34 pages, live at bayyinahtv.com.",
    plate: {
      kind: "web",
      ground: "#1b1315",
      dark: true,
      fit: "center",
      shot: {
        src: "/showcase/bayyinah/web-01.webp",
        alt: "Bayyinah TV landing page: the app on a laptop, a desktop screen, a phone and a tablet",
        width: 1440,
        height: 900,
        crop: box(492, 150, 838, 540, 1440, 900),
        narrow: box(750, 205, 580, 435, 1440, 900),
      },
    },
    caption: "Bayyinah TV landing page, live and public.",
    target: { kind: "shot", box: box(1082, 390, 244, 256, 1440, 900) },
    route: { kind: "lane", y: 0.9 },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "03",
    project: "Read to Feed",
    role: "Mobile",
    year: "2022–25",
    kind: "shipped",
    then: "A reading app for children, updated about 14 times in both stores.",
    now: "It kept each child's place in every book.",
    plate: {
      kind: "phone",
      shot: {
        src: "/mobile/reading-1.webp",
        alt: "Read to Feed store screenshot on iPhone: My Books, with reading progress on each book",
        width: 780,
        height: 1689,
        crop: box(84, 520, 612, 592, 780, 1689),
        narrow: box(84, 650, 612, 459, 780, 1689),
      },
    },
    caption: "Read to Feed on iPhone, archived store listing.",
    target: { kind: "shot", box: box(330, 855, 312, 52, 780, 1689) },
    route: { kind: "lane", y: 0.702 },
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    id: "04",
    project: "Viva Fresh",
    role: "Mobile",
    year: "2023",
    kind: "shipped",
    then: "One grocery app, built once for iPhone and Android.",
    now: "Shopping in Albanian, live in both app stores.",
    plate: {
      kind: "phone",
      shot: {
        src: "/mobile/grocery-1.webp",
        alt: "Viva Fresh store screenshot on iPhone: latest products in Albanian, with prices and cart buttons",
        width: 780,
        height: 1689,
        crop: box(94, 650, 592, 590, 780, 1689),
        narrow: box(94, 670, 592, 444, 780, 1689),
      },
    },
    caption: "Viva Fresh on iPhone. Also on Google Play.",
    target: { kind: "shot", box: box(104, 686, 260, 46, 780, 1689) },
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "05",
    project: "Design System v2",
    role: "Design system, with the team",
    year: "2026",
    kind: "shipped",
    label: "Built",
    then: "36 building blocks for a new care dashboard, released 20 times in about six weeks.",
    now: "96.6% less JavaScript for a page that uses only a button.",
    plate: { kind: "figure", which: "bundle" },
    caption: "One measurement, drawn to scale. A diagram.",
    target: { kind: "selector", css: "[data-short]" },
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "06",
    project: "Offday",
    role: "Owner",
    year: "2026",
    kind: "own",
    label: "Made",
    then: "A time-off app for teams: requests, approvals and one shared calendar.",
    now: "It warns when time off leaves a shift without cover.",
    note: "It also finds the dates that give the longest break. About 200 automated tests.",
    plate: {
      kind: "web",
      ground: "#ffffff",
      shot: {
        src: "/personal/shots/offday-light-shifts-desktop.webp",
        alt: "Offday Shifts week grid in the light theme: morning and evening shifts, two of them flagged Needs cover because the person is on leave",
        width: 2880,
        height: 1800,
        crop: box(504, 510, 1280, 1120, 2880, 1800),
        narrow: box(534, 612, 791, 593.3, 2880, 1800),
      },
    },
    caption: "Offday shifts, light theme, demo workspace. The code is private.",
    target: { kind: "shot", box: box(990, 874, 318, 150, 2880, 1800) },
    route: { kind: "level", y: 0.418 },
  },
  {
    id: "07",
    project: "OFFBEAT",
    role: "Owner, concept",
    year: "2026",
    kind: "own",
    label: "Concept",
    then: "A speaker brand that does not exist, with a drum machine that plays in the browser.",
    now: "Each beat becomes a record sleeve: the dots are its drum pattern.",
    note: "The beat also downloads as a sound file.",
    plate: {
      kind: "web",
      ground: "#0e0e0e",
      dark: true,
      shot: {
        src: "/personal/shots/offbeat-record-desktop.webp",
        alt: "OFFBEAT record sleeve: the drum pattern of Kitchen disco printed as dots on a yellow sleeve, in front of a black record",
        width: 1440,
        height: 900,
        crop: box(29, 101, 640, 560, 1440, 900),
        narrow: box(18, 122, 690, 517.5, 1440, 900),
      },
    },
    caption: "OFFBEAT record sleeve. A concept, not a real brand.",
    target: { kind: "shot", box: box(86, 258, 422, 228, 1440, 900) },
    link: { label: "Source on GitHub", href: "https://github.com/gentritr1/offbeat", external: true },
  },
  {
    id: "08",
    project: "FORM",
    role: "Owner, concept",
    year: "2026",
    kind: "own",
    label: "Concept",
    then: "A sculpture show that does not exist: three forms made from mathematics.",
    now: "Each sculpture is drawn live from its formula.",
    note: "In copper, chrome or porcelain. Type a word and it casts a sculpture.",
    plate: {
      kind: "web",
      ground: "#1b1918",
      dark: true,
      shot: {
        src: "/personal/shots/form-studio-desktop.webp",
        alt: "FORM collection: the Trefoil knot in copper, with its formula p(t) = ((2 + cos 3t) cos 2t, (2 + cos 3t) sin 2t, sin 3t)",
        width: 1440,
        height: 900,
        crop: box(44, 192, 722, 631.75, 1440, 900),
        narrow: box(44, 240, 722, 541.5, 1440, 900),
      },
    },
    caption: "FORM collection. A concept, not a real exhibition.",
    target: { kind: "shot", box: box(48, 734, 518, 30, 1440, 900) },
    link: { label: "Source on GitHub", href: "https://github.com/gentritr1/form", external: true },
  },
  {
    id: "09",
    project: "Snaxx Tech",
    role: "Owner, studio website",
    year: "2026",
    kind: "own",
    label: "Made",
    then: "The website of his own app studio: an illustrated home page with a 3D scene.",
    now: "All the site's files: 28 MB → 9.5 MB.",
    note: "Its pictures: 972 KB → 337 KB.",
    plate: {
      kind: "proof",
      shot: {
        src: "/personal/shots/snaxx-desktop.webp",
        alt: "Snaxx Tech home page: The Snaxx Almanac, an illustrated landscape of apps and games",
        width: 1440,
        height: 900,
        crop: box(390, 78, 640, 344, 1440, 900),
        narrow: box(320, 90, 860, 361.3, 1440, 900),
      },
      weights: [
        { tag: "All files", from: "28 MB", to: "9.5 MB", ratio: 9.5 / 28, ring: true },
        { tag: "Pictures", from: "972 KB", to: "337 KB", ratio: 337 / 972 },
      ],
    },
    caption: "Snaxx Tech home page, live. The weights are measured.",
    target: { kind: "selector", css: "[data-to]" },
    route: { kind: "lane", y: 0.65 },
    link: { label: "snaxxtech.com", href: "https://www.snaxxtech.com/", external: true },
  },
];
