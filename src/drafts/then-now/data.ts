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

export type Plate =
  | { kind: "figure"; which: "billing" | "bundle" }
  | { kind: "proof"; shot: Shot }
  | { kind: "live"; key: "care" }
  | { kind: "web"; shot: Shot; ground: string; dark?: boolean }
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
    project: "Snaxx Tech",
    role: "Owner, studio website",
    year: "2026",
    kind: "fixed",
    then: "The studio site's pictures weighed 972\u00a0KB, and the whole site 28\u00a0MB.",
    strike: ["972\u00a0KB", "28\u00a0MB"],
    now: "337\u00a0KB of pictures.\n9.5\u00a0MB for the whole site.",
    note: "About a third of the weight. Live at snaxxtech.com.",
    plate: {
      kind: "proof",
      shot: {
        src: "/personal/shots/snaxx-desktop.webp",
        alt: "Snaxx Tech home page: The Snaxx Almanac, an illustrated landscape of apps and games",
        width: 1440,
        height: 900,
        crop: box(330, 78, 840, 451.5, 1440, 900),
        narrow: box(320, 90, 860, 361.3, 1440, 900),
      },
    },
    caption: "Snaxx Tech home page, live. The weights are measured.",
    target: { kind: "selector", css: "[data-to]" },
    route: { kind: "lane", y: 0.65 },
    link: { label: "snaxxtech.com", href: "https://www.snaxxtech.com/", external: true },
  },
  {
    id: "02",
    project: "Care platform, server side",
    role: "Full stack",
    year: "2026",
    kind: "fixed",
    then: "One billing report asked the database 16 times and gave up.",
    strike: ["16 times and gave up"],
    now: "It asks 2 times and finishes.",
    plate: { kind: "figure", which: "billing" },
    caption: "One billing report, before and after. A diagram.",
    target: { kind: "selector", css: "[data-to]" },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "03",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    year: "2023–26",
    kind: "earlier",
    then: "Version 1 of a video-learning platform for members.",
    now: "Built again: members subscribe on the web, iPhone or Android.",
    note: "A new app of 34 pages, live at bayyinahtv.com.",
    plate: {
      kind: "web",
      ground: "#1c1214",
      dark: true,
      shot: {
        src: "/showcase/bayyinah/web-06.webp",
        alt: "Bayyinah TV pricing page: a monthly and annual switch, the Premium plan at $11 a month and a Start 7-Day Free Trial button",
        width: 1440,
        height: 900,
        crop: box(520, 24, 880, 770, 1440, 900),
        narrow: box(980, 0, 436, 327, 1440, 900),
      },
    },
    caption: "Pricing page of the new app, live and public.",
    target: { kind: "shot", box: box(1068, 651, 228, 40, 1440, 900) },
    narrowTarget: { kind: "shot", box: box(1114, 192, 136, 88, 1440, 900) },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "04",
    project: "Care-management platform",
    role: "Frontend, team project",
    year: "2026",
    kind: "earlier",
    then: "Many client organizations use one care app, first built in 2023.",
    now: "Most screens are already rebuilt in React.",
    note: "A screen moves over only after it passes the same tests in both apps.",
    plate: { kind: "live", key: "care" },
    caption: "Vitals card. Recreation · invented data.",
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "05",
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
    id: "06",
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
    id: "07",
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
    id: "08",
    project: "Offday",
    role: "Owner",
    year: "2026",
    kind: "own",
    label: "Made",
    then: "A time-off app for teams: requests, approvals and one shared calendar.",
    now: "It warns when time off leaves a shift without cover.",
    note: "It also finds the dates that give the longest break.",
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
    caption: "Offday shifts, light theme, demo workspace.",
    target: { kind: "shot", box: box(990, 874, 318, 150, 2880, 1800) },
    route: { kind: "level", y: 0.418 },
  },
  {
    id: "09",
    project: "OFFBEAT",
    role: "Owner, concept",
    year: "2026",
    kind: "own",
    label: "Concept",
    then: "A speaker brand that does not exist: a 3D speaker and its sound studio.",
    now: "Its eight-step drum machine plays in the browser.",
    note: "A groove shares as a link or saves as a sound file.",
    plate: {
      kind: "web",
      ground: "#111111",
      dark: true,
      shot: {
        src: "/personal/shots/offbeat-studio-desktop.webp",
        alt: "OFFBEAT sound studio: the speaker with its step lights, and an eight-step drum machine with kick, snare, hi-hat and bass rows, presets, tempo and a swing dial",
        width: 1440,
        height: 900,
        crop: box(606, 247, 746, 652.8, 1440, 900),
        narrow: box(66, 380, 522, 391.5, 1440, 900),
      },
    },
    caption: "OFFBEAT sound studio. A concept, not a real brand.",
    target: { kind: "shot", box: box(700, 492, 636, 206, 1440, 900) },
    link: { label: "Source on GitHub", href: "https://github.com/gentritr1/offbeat", external: true },
  },
  {
    id: "10",
    project: "FORM",
    role: "Owner, concept",
    year: "2026",
    kind: "own",
    label: "Concept",
    then: "A sculpture show that does not exist: three forms made from mathematics.",
    now: "Each sculpture renders live, in copper, chrome or porcelain.",
    note: "Type a word and it casts a sculpture. No outside libraries.",
    plate: {
      kind: "web",
      ground: "#1b1918",
      dark: true,
      shot: {
        src: "/personal/shots/form-home-desktop.webp",
        alt: "FORM home page: a copper trefoil knot sculpture with copper, chrome and porcelain material swatches",
        width: 1440,
        height: 900,
        crop: box(640, 140, 790, 691.2, 1440, 900),
        narrow: box(610, 152, 807, 605.3, 1440, 900),
      },
    },
    caption: "FORM home page. A concept, not a real exhibition.",
    target: { kind: "shot", box: box(1012, 774, 210, 52, 1440, 900) },
    link: { label: "Source on GitHub", href: "https://github.com/gentritr1/form", external: true },
  },
];
