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

/** "lane": the line enters the plate along a clear row (a fraction of the plate height), then turns onto the part. */
export type Route = { kind: "side" } | { kind: "lane"; y: number };

/**
 * "fixed": the before is a problem that is gone, so it is struck.
 * "earlier": the before is an earlier state, not a problem. It is not struck.
 * "shipped": a new product. There is no before.
 */
export type Kind = "fixed" | "earlier" | "shipped";

export type Plate =
  | { kind: "figure" }
  | { kind: "live"; key: "care" | "design-system" }
  | { kind: "web"; shot: Shot; ground: string; dark?: boolean }
  | { kind: "phone"; shot: Shot };

export interface Row {
  id: string;
  project: string;
  role: string;
  year: string;
  kind: Kind;
  /** The problem, the earlier state, or what shipped. */
  then: string;
  /** The result. It carries the hairline when a pixel proves it. */
  now: string;
  plate: Plate;
  caption: string;
  target?: Target;
  route?: Route;
  link: { label: string; href: string; external?: boolean };
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
    project: "Care platform, server side",
    role: "Full stack",
    year: "2026",
    kind: "fixed",
    then: "One billing report asked the database 16 times and gave up.",
    now: "It asks 2 times and finishes.",
    plate: { kind: "figure" },
    caption: "One billing report, before and after.",
    target: { kind: "selector", css: "[data-to]" },
    route: { kind: "lane", y: 0.09 },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "02",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    year: "2023–26",
    kind: "earlier",
    then: "Version 1 of a video-learning platform for members.",
    now: "Rebuilt from an empty page: 34 pages and paid plans.",
    plate: {
      kind: "web",
      ground: "#1c1214",
      dark: true,
      shot: {
        src: "/showcase/bayyinah/web-06.webp",
        alt: "Bayyinah TV pricing page: a monthly and annual switch, the course list and the Premium plan at $11 a month",
        width: 1440,
        height: 900,
        crop: box(518, 76, 786, 806, 1440, 900),
        narrow: box(520, 104, 480, 360, 1440, 900),
      },
    },
    caption: "Bayyinah TV pricing, public page.",
    target: { kind: "shot", box: box(528, 121, 264, 61, 1440, 900) },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    id: "03",
    project: "Care-management platform",
    role: "Frontend, team project",
    year: "2023–26",
    kind: "earlier",
    then: "One care app for many client organizations, on its 2023 code.",
    now: "Most screens rebuilt, each checked against the old app.",
    plate: { kind: "live", key: "care" },
    caption: "Vitals card. Recreation · invented data.",
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    id: "04",
    project: "Design System v2",
    role: "Design system, team project",
    year: "2026",
    kind: "fixed",
    then: "An app that used one button downloaded far more code than needed.",
    now: "It downloads 96.6% less.",
    plate: { kind: "live", key: "design-system" },
    caption: "Button card. Recreation · invented data.",
    target: { kind: "selector", css: ".dsr-area-buttons .dsr-row:first-child .dsr-button-solid", round: false },
    link: { label: "Open the case", href: "/work/design-system-react" },
  },
  {
    id: "05",
    project: "Snaxx Tech",
    role: "Owner, studio website",
    year: "2026",
    kind: "fixed",
    then: "The studio site's pictures weighed 972 KB.",
    now: "They weigh 337 KB.",
    plate: {
      kind: "web",
      ground: "#efe4cf",
      shot: {
        src: "/personal/shots/snaxx-desktop.webp",
        alt: "Snaxx Tech home page: The Snaxx Almanac, an illustrated landscape of apps and games",
        width: 1440,
        height: 900,
        crop: box(281, 0, 878, 900, 1440, 900),
        narrow: box(380, 80, 680, 510, 1440, 900),
      },
    },
    caption: "Snaxx Tech home page, live site.",
    link: { label: "snaxxtech.com", href: "https://www.snaxxtech.com/", external: true },
  },
  {
    id: "06",
    project: "Read to Feed",
    role: "Mobile",
    year: "2022–25",
    kind: "shipped",
    then: "A reading app for children, updated about 14 times in both stores.",
    now: "It keeps each child's place in every book.",
    plate: {
      kind: "phone",
      shot: {
        src: "/mobile/reading-1.webp",
        alt: "Read to Feed store screenshot on iPhone: My Books, with reading progress on each book",
        width: 780,
        height: 1689,
        crop: box(84, 630, 612, 656, 780, 1689),
        narrow: box(84, 650, 612, 459, 780, 1689),
      },
    },
    caption: "Read to Feed on iPhone, archived store listing.",
    target: { kind: "shot", box: box(330, 855, 312, 52, 780, 1689) },
    route: { kind: "lane", y: 0.468 },
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    id: "07",
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
        crop: box(94, 652, 592, 656, 780, 1689),
        narrow: box(94, 670, 592, 444, 780, 1689),
      },
    },
    caption: "Viva Fresh on iPhone. Also on Google Play.",
    target: { kind: "shot", box: box(104, 686, 260, 46, 780, 1689) },
    link: { label: "Open the case", href: "/work/viva-fresh" },
  },
  {
    id: "08",
    project: "Incentiv",
    role: "Frontend, the screens",
    year: "2024",
    kind: "shipped",
    then: "Screens for a crypto wallet. Teammates built the wallet itself.",
    now: "Sign in with a passkey (no password) or a wallet.",
    plate: {
      kind: "web",
      ground: "#121212",
      dark: true,
      shot: {
        src: "/showcase/incentiv/web-03.webp",
        alt: "Incentiv portal sign-in: Passkey, MetaMask and WalletConnect buttons",
        width: 1440,
        height: 900,
        crop: box(140, 122, 640, 656, 1440, 900),
        narrow: box(180, 280, 512, 384, 1440, 900),
      },
    },
    caption: "Incentiv sign-in, public page.",
    target: { kind: "shot", box: box(226, 501, 98, 38, 1440, 900) },
    link: { label: "Open the case", href: "/work/incentiv" },
  },
];
