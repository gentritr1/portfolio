import { findProject } from "../../content/projects";

/** A box in fractions of its reference (an image, or the plate). */
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
  /** The part of the image the frame shows. It ends on a whole row of the screen. */
  crop: Box;
  /** The 4:3 part the frame shows under 1024 px. It grows to the frame's width, inside bounds, so it is never upscaled. */
  narrow: Box;
  /** A wider narrow crop for a wide phone frame. It keeps the text at 11 px or more when it is chosen. */
  narrowWide?: Box;
  /** The part of the image a narrow crop may grow into. The whole image when absent. */
  bounds?: Box;
}

/**
 * Where the hairline ends. A selector names a part of a plate. An image
 * box names a part of the plate's shot, in fractions of the whole image.
 */
export type Target =
  | { kind: "selector"; css: string }
  | { kind: "shot"; box: Box }
  | { kind: "figure"; css: string };

/**
 * "side": the line enters the plate at the part's own height.
 * "lane": the line enters along a clear row (a fraction of the plate height),
 * then turns down or up onto the part.
 */
export type Route = { kind: "side" } | { kind: "lane"; y: number };

export interface StoreLink {
  label: string;
  href: string;
}

/** One of two store screenshots of the same screen. Both crops share one ratio and line up row for row. */
export interface Platform {
  label: string;
  store: StoreLink;
  caption: string;
  shot: Shot;
}

export type Plate =
  /** The shot stands at no more than its own CSS size, in the middle of its ground, so it is never upscaled. */
  | { kind: "canvas"; shot: Shot; ground: string }
  | { kind: "duo"; ground: string; web: Shot; store: Shot; kicker: string; stores: StoreLink[] }
  | { kind: "pair"; kicker: string; platforms: Platform[]; mark: Box; narrowMark: Box }
  | { kind: "web"; shot: Shot; ground: string; dark?: boolean }
  | { kind: "phone"; shot: Shot; kicker: string; stores: StoreLink[] }
  | { kind: "report"; before: number; after: number };

export interface Row {
  id: string;
  project: string;
  /** The problem, or what shipped when there was no problem. */
  line: string;
  /** The result. It carries the hairline. */
  result: string;
  role: string;
  year: string;
  plate: Plate;
  caption: string;
  /** The plate is a real screen of a private product with invented data. The caption then says so. */
  realScreen?: boolean;
  target: Target;
  /** The part the ring marks under 1024 px, when the wide target is not in the phone crop. */
  narrowTarget?: Target;
  route: Route;
  link?: { label: string; href: string; external?: boolean };
  /** The public product, when it is live. */
  live?: StoreLink;
}

const storeLinks = (slug: string): StoreLink[] =>
  (findProject(slug)?.links ?? []).map((link) => ({ label: link.label, href: link.href }));

const viva = storeLinks("viva-fresh");
const px = (x: number, y: number, w: number, h: number, W: number, H: number): Box => ({ x: x / W, y: y / H, w: w / W, h: h / H });

/** The client rows before the own projects. */
export const leadRows: Row[] = [
  {
    id: "01",
    project: "Bayyinah TV",
    line: "A video-learning platform, built again as a new app: 34 pages.",
    result: "Members subscribe on the web, iPhone or Android",
    role: "Frontend, core team",
    year: "2023–26",
    plate: {
      kind: "duo",
      ground: "#1f1518",
      kicker: "Subscribe on",
      stores: [
        { label: "bayyinahtv.com", href: "https://bayyinahtv.com/" },
        { label: "App Store", href: "https://apps.apple.com/us/app/bayyinah-tv/id1530635769" },
        { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" },
      ],
      web: {
        src: "/showcase/bayyinah/web-01.webp",
        alt: "Bayyinah TV home page: Quran Studies Made Simple, with Start Your 7-Day Free Trial and Watch Now buttons",
        width: 1440,
        height: 900,
        crop: px(20, 10, 500, 580, 1440, 900),
        narrow: px(20, 10, 500, 580, 1440, 900),
      },
      store: {
        src: "/showcase/bayyinah/store-01.webp",
        alt: "Bayyinah TV App Store frame: Quran Studies Made Simple, with the app home screen on an iPhone",
        width: 778,
        height: 1690,
        crop: px(0, 206, 778, 1384, 778, 1690),
        narrow: px(0, 206, 778, 1384, 778, 1690),
      },
    },
    caption: "Bayyinah TV home page and its App Store frame, public.",
    target: { kind: "selector", css: ".pj-duo-stores" },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "02",
    project: "Care platform, server side",
    line: "One billing report asked the database 16 times and gave up.",
    result: "Now it asks 2 times and finishes",
    role: "Full stack",
    year: "2026",
    plate: { kind: "report", before: 16, after: 2 },
    caption: "Database requests for one billing report. A diagram.",
    target: { kind: "selector", css: '[data-lane="now"]' },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "03",
    project: "Care-management platform",
    line: "Many client organizations use the same system. Most screens are already rebuilt in React.",
    result: "Each one sees only its own patients",
    role: "Frontend, core team",
    year: "2023–26",
    plate: {
      kind: "web",
      ground: "#f5f7fb",
      shot: {
        src: "/showcase/care-dashboard/overview.webp",
        alt: "Care team dashboard for one organization, Larkspur Valley Health: 24 patients by program, and patient engagement by calls and text messages. Invented data.",
        width: 1440,
        height: 900,
        crop: px(246, 0, 1172, 900, 1440, 900),
        narrow: px(243, 140, 579, 434.25, 1440, 900),
        bounds: px(243, 140, 579, 434.25, 1440, 900),
      },
    },
    caption: "Care team dashboard for one organization.",
    realScreen: true,
    target: { kind: "shot", box: px(1184, 14, 156, 28, 1440, 900) },
    narrowTarget: { kind: "shot", box: px(330, 362, 66, 56, 1440, 900) },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "04",
    project: "Viva Fresh",
    line: "One grocery app, built once for iPhone and Android.",
    result: "Shopping in Albanian, live in both app stores",
    role: "Mobile",
    year: "2023",
    plate: {
      kind: "phone",
      kicker: "Live in both app stores",
      stores: viva,
      shot: {
        src: "/mobile/grocery-1.webp",
        alt: "Viva Fresh home on iPhone, from the App Store listing: product categories in Albanian and the latest products",
        width: 780,
        height: 1689,
        crop: px(100, 476, 580, 766, 780, 1689),
        narrow: px(100, 476, 580, 435, 780, 1689),
        bounds: px(100, 360, 580, 1100, 780, 1689),
      },
    },
    caption: "Viva Fresh home, from its store listing.",
    target: { kind: "selector", css: ".pj-stores" },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
];

/** The client rows after the own projects. */
export const moreRows: Row[] = [
  {
    id: "08",
    project: "Design System v2",
    line: "The new care dashboard needed one set of buttons, menus and forms.",
    result: "36 building blocks, released 20 times in about six weeks",
    role: "Design system, with the team",
    year: "2026",
    plate: {
      kind: "canvas",
      ground: "#ffffff",
      shot: {
        src: "/showcase/design-system/button-alert.webp",
        alt: "Design System v2 in its Storybook: buttons in four styles, buttons with icons, and alerts for a note, information, success, a warning and an error. Invented data.",
        width: 720,
        height: 596,
        crop: px(0, 0, 720, 596, 720, 596),
        narrow: px(8, 12, 704, 295, 720, 596),
      },
    },
    caption: "Buttons and alerts of the set, in its Storybook.",
    realScreen: true,
    target: { kind: "shot", box: px(8, 12, 670, 116, 720, 596) },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "09",
    project: "Incentiv",
    line: "Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet.",
    result: "Passkey (no password) or wallet sign-in, in English and French",
    role: "Frontend, the screens",
    year: "2024",
    plate: {
      kind: "web",
      ground: "#121212",
      dark: true,
      shot: {
        src: "/showcase/incentiv/web-03.webp",
        alt: "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
        width: 1440,
        height: 900,
        crop: { x: 160 / 1440, y: 19 / 900, w: 1121 / 1440, h: 861 / 900 },
        narrow: { x: 192 / 1440, y: 474 / 900, w: 344 / 1440, h: 258 / 900 },
        narrowWide: { x: 170 / 1440, y: 345 / 900, w: 520 / 1440, h: 390 / 900 },
      },
    },
    caption: "Incentiv sign-in, public page.",
    target: { kind: "shot", box: { x: 0.158, y: 0.5588, w: 0.064, h: 0.0383 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/incentiv" },
  },
  {
    id: "10",
    project: "Read to Feed",
    line: "A reading app for children. About 14 updates shipped to both stores.",
    result: "It kept each child's place in every book",
    role: "Mobile",
    year: "2022–25",
    plate: {
      kind: "phone",
      kicker: "Shipped to both app stores",
      stores: storeLinks("read-to-feed"),
      shot: {
        src: "/mobile/reading-1.webp",
        alt: "Read to Feed My Books on iPhone: The Tale of Peter the Rabbit, read 36%, and two more books",
        width: 780,
        height: 1689,
        crop: { x: 92 / 780, y: 619 / 1689, w: 596 / 780, h: 676 / 1689 },
        narrow: { x: 92 / 780, y: 660 / 1689, w: 596 / 780, h: 447 / 1689 },
        bounds: { x: 92 / 780, y: 619 / 1689, w: 596 / 780, h: 676 / 1689 },
      },
    },
    caption: "Read to Feed My Books, from its store listing.",
    target: { kind: "shot", box: { x: 119 / 780, y: 712 / 1689, w: 543 / 780, h: 211 / 1689 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    id: "11",
    project: "Dukagjini Bookstore",
    line: "A publisher's bookshop app for iPhone and Android.",
    result: "Search, sales and checkout, live in both app stores",
    role: "Mobile",
    year: "2021–22",
    plate: {
      kind: "phone",
      kicker: "Live in both app stores",
      stores: storeLinks("dukagjini-bookstore"),
      shot: {
        src: "/mobile/bookstore-1.webp",
        alt: "Dukagjini Bookstore home on iPhone: book search and top categories",
        width: 780,
        height: 1689,
        crop: { x: 106 / 780, y: 740 / 1689, w: 568 / 780, h: 676 / 1689 },
        narrow: { x: 115 / 780, y: 840 / 1689, w: 547 / 780, h: 410 / 1689 },
        bounds: { x: 106 / 780, y: 730 / 1689, w: 568 / 780, h: 959 / 1689 },
      },
    },
    caption: "Dukagjini Bookstore home, from its App Store listing.",
    target: { kind: "shot", box: { x: 155 / 780, y: 1145 / 1689, w: 470 / 780, h: 60 / 1689 } },
    route: { kind: "side" },
    link: { label: "Open the case", href: "/work/dukagjini-bookstore" },
  },
];
