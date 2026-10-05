/** A rectangle in source pixels of an image. */
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
  /**
   * The parts of the image a tile can show, all 16:10 and cut on whole rows.
   * The tile uses the narrowest crop that is at least as wide as the tile, so
   * an image is never drawn larger than its source pixels.
   */
  crops: Box[];
  /** The part that proves the caption. */
  mark: Box;
}

export type Media =
  | { kind: "shot"; shot: Shot }
  | { kind: "live"; key: "care" | "design-system"; mark: string; alt: string }
  | { kind: "figure" };

export interface Tile {
  id: string;
  project: string;
  /** The result, 10 words or fewer. The ring in the crop proves it. */
  caption: string;
  /** The words of the caption that the ring proves. They carry the same mark. */
  proof: string;
  /** Role and scope, in plain words. */
  role: string;
  year: string;
  media: Media;
  /** Measured OKLCH hue of the crop. The page ground takes it when the tile is current. */
  hue: number;
  /** Mean colour of the crop. The tile shows it until the picture arrives. */
  ground: string;
  /** A dark screen is washed with paper, not dimmed with ink, around its proof. */
  dark?: boolean;
  recreation?: boolean;
  link: { href: string; label: string; external?: boolean };
}

export const tiles: Tile[] = [
  {
    id: "billing",
    project: "Care platform, server side",
    caption: "One billing report: 2 database requests, not 16.",
    proof: "2 database requests",
    role: "Full stack",
    year: "2026",
    media: { kind: "figure" },
    hue: 33,
    ground: "#ff5a36",
    link: { href: "/work/care-platform", label: "Open the case" },
  },
  {
    id: "bayyinah-tv",
    project: "Bayyinah TV",
    caption: "Members subscribe on the web, iPhone or Android.",
    proof: "subscribe",
    role: "Frontend, core team",
    year: "2023–26",
    media: {
      kind: "shot",
      shot: {
        src: "/showcase/bayyinah/web-06.webp",
        alt: "Bayyinah TV pricing page: the Premium plan at $11.00 a month, with course access ticked",
        width: 1440,
        height: 900,
        crops: [{ x: 960, y: 102, w: 440, h: 275 }],
        mark: { x: 1112, y: 196, w: 140, h: 78 },
      },
    },
    hue: 32,
    ground: "#150f11",
    dark: true,
    link: { href: "/work/bayyinah-tv", label: "Open the case" },
  },
  {
    id: "viva-fresh",
    project: "Viva Fresh",
    caption: "Shoppers fill a cart and pay, in Albanian.",
    proof: "pay, in Albanian",
    role: "Mobile",
    year: "2023",
    media: {
      kind: "shot",
      shot: {
        src: "/mobile/grocery-3.webp",
        alt: "Viva Fresh cart on iPhone: a product row, the total discount and the Albanian checkout button, VAZHDO ME PAGESEN, 25.11 €",
        width: 780,
        height: 1689,
        crops: [{ x: 94, y: 1095, w: 592, h: 370 }],
        mark: { x: 103, y: 1387, w: 575, h: 73 },
      },
    },
    hue: 23,
    ground: "#e3b9b4",
    link: { href: "/work/viva-fresh", label: "Open the case" },
  },
  {
    id: "care",
    project: "Care platform",
    caption: "Each client organization sees only its own patients.",
    proof: "Each client organization",
    role: "Frontend, rebuilt screen by screen",
    year: "2023–26",
    media: {
      kind: "live",
      key: "care",
      mark: 'button[aria-haspopup="listbox"]',
      alt: "Vitals card for one patient, with a switch between two client organizations. Recreation with invented data.",
    },
    hue: 185,
    ground: "#eef4f2",
    recreation: true,
    link: { href: "/work/care-platform", label: "Open the case" },
  },
  {
    id: "incentiv",
    project: "Incentiv crypto wallet",
    caption: "Sign in with a passkey (no password) or a wallet.",
    proof: "a passkey (no password)",
    role: "Frontend, the screens",
    year: "2024",
    media: {
      kind: "shot",
      shot: {
        src: "/showcase/incentiv/web-03.webp",
        alt: "Incentiv portal sign-in, public screen: Welcome to Incentiv, with Passkey, MetaMask and WalletConnect buttons",
        width: 1440,
        height: 900,
        crops: [
          { x: 190, y: 486, w: 344, h: 215 },
          { x: 190, y: 262, w: 480, h: 300 },
        ],
        mark: { x: 222, y: 500, w: 106, h: 40 },
      },
    },
    hue: 40,
    ground: "#343532",
    dark: true,
    link: { href: "/work/incentiv", label: "Open the case" },
  },
  {
    id: "design-system",
    project: "Design System v2",
    caption: "36 building blocks, released 20 times in about six weeks.",
    proof: "building blocks",
    role: "Design system, with the team",
    year: "2026",
    media: {
      kind: "live",
      key: "design-system",
      mark: ".dsr-area-buttons .dsr-row",
      alt: "Button card of a component specimen: primary, secondary and ghost buttons in three sizes. Recreation with invented data.",
    },
    hue: 253,
    ground: "#f2f4f8",
    recreation: true,
    link: { href: "/work/design-system-react", label: "Open the case" },
  },
  {
    id: "read-to-feed",
    project: "Read to Feed",
    caption: "Children pick up every book where they stopped.",
    proof: "where they stopped",
    role: "Mobile, about 14 updates shipped",
    year: "2022–25",
    media: {
      kind: "shot",
      shot: {
        src: "/mobile/reading-1.webp",
        alt: "Read to Feed store screenshot: My Books, with The Tale of Peter Rabbit read to 36%",
        width: 780,
        height: 1689,
        crops: [{ x: 90, y: 640, w: 600, h: 375 }],
        mark: { x: 330, y: 852, w: 312, h: 52 },
      },
    },
    hue: 235,
    ground: "#7fb4ca",
    link: { href: "/work/read-to-feed", label: "Open the case" },
  },
  {
    id: "dukagjini",
    project: "Dukagjini Bookstore",
    caption: "Readers search the catalogue and buy books on sale.",
    proof: "search the catalogue",
    role: "Mobile",
    year: "2021–22",
    media: {
      kind: "shot",
      shot: {
        src: "/mobile/bookstore-1.webp",
        alt: "Dukagjini Bookstore store screenshot: Search Millions of Books, the search field, and the Bestsellers and On sale 35% off categories",
        width: 780,
        height: 1689,
        crops: [{ x: 106, y: 1058, w: 568, h: 355 }],
        mark: { x: 152, y: 1141, w: 476, h: 70 },
      },
    },
    hue: 18,
    ground: "#f3f2f1",
    link: { href: "/work/dukagjini-bookstore", label: "Open the case" },
  },
  {
    id: "bayyinah-org",
    project: "Bayyinah institute website",
    caption: "Visitors join the mission or get the apps.",
    proof: "join the mission",
    role: "Frontend",
    year: "2024–25",
    media: {
      kind: "shot",
      shot: {
        src: "/showcase/bayyinah/org-01.webp",
        alt: "bayyinah.org home, public page: the Join the Mission button over the App Store and Google Play badges",
        width: 1440,
        height: 900,
        crops: [{ x: 504, y: 545, w: 432, h: 270 }],
        mark: { x: 600, y: 561, w: 240, h: 67 },
      },
    },
    hue: 59,
    ground: "#d0b6a9",
    link: { href: "https://bayyinah.org/", label: "bayyinah.org", external: true },
  },
];

export interface IndexRow {
  name: string;
  line: string;
  role: string;
  year: string;
  link?: { href: string; label: string; external?: boolean };
}

export interface IndexGroup {
  title: string;
  rows: IndexRow[];
}

const caseLink = (slug: string) => ({ href: `/work/${slug}`, label: "Case" });
const live = (href: string) => ({ href, label: "Live", external: true });

export const index: IndexGroup[] = [
  {
    title: "Client and team work",
    rows: [
      { name: "Care-management platform", line: "Care teams follow vitals, care plans, labs and claims for their patients.", role: "Frontend", year: "2023–26", link: caseLink("care-platform") },
      { name: "Care platform, server side", line: "A billing report went from 16 database requests to 2.", role: "Full stack", year: "2026" },
      { name: "Design System v2", line: "36 building blocks with the team, 20 releases in about six weeks.", role: "Design system", year: "2026", link: caseLink("design-system-react") },
      { name: "Design system for the older app", line: "Colours and sizes come from Figma. Automatic checks catch visual changes.", role: "Design system", year: "2026" },
      { name: "Design dashboard (prototype)", line: "One call-activity screen with demo data, as a design reference.", role: "Frontend", year: "2026" },
      { name: "Bayyinah TV", line: "Video-learning platform rebuilt from an empty page: 34 pages, live classes.", role: "Frontend, core team", year: "2023–26", link: caseLink("bayyinah-tv") },
      { name: "Bayyinah institute website", line: "The institute's public website, on one page.", role: "Frontend", year: "2024–25", link: live("https://bayyinah.org/") },
      { name: "Read to Feed", line: "Children's reading app. About 14 updates shipped to both app stores.", role: "Mobile", year: "2022–25", link: caseLink("read-to-feed") },
      { name: "Viva Fresh", line: "Grocery orders with delivery slots, loyalty and a wishlist.", role: "Mobile", year: "2023", link: caseLink("viva-fresh") },
      { name: "Dukagjini Bookstore", line: "A publisher's bookshop app: search, sales and checkout.", role: "Mobile", year: "2021–22", link: caseLink("dukagjini-bookstore") },
      { name: "Scripted chat engine", line: "Plays scripted chats: messages, pictures, choices and timers.", role: "Mobile", year: "2022–25" },
      { name: "Scripted chat engine, web version", line: "The same chat engine for the web, with an example app.", role: "Frontend", year: "2025" },
      { name: "Book reader prototype", line: "Opens a downloaded book and resizes its text. The reading app's first reader.", role: "Mobile", year: "2022" },
      { name: "Sadaqah app for Islamic Relief USA", line: "Donation app. Payment screens, badges and Android builds, in a small team.", role: "Mobile", year: "2021–22" },
      { name: "Coaching app", line: "Sign-in through an organization, a daily calendar strip and reactions.", role: "Mobile", year: "2022–23" },
      { name: "Fuel-station loyalty app", line: "Upkeep: runs on newer Macs for testing, and shadows fixed.", role: "Mobile", year: "2026" },
      { name: "Incentiv", line: "Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet.", role: "Frontend", year: "2024", link: caseLink("incentiv") },
      { name: "Member portal", line: "The base of a member portal: sign-in, private pages and the app frame.", role: "Frontend", year: "2025" },
      { name: "Business dashboard with AI", line: "Headshots made from photos, and a chat that answers questions about a PDF.", role: "Frontend, some server work", year: "—" },
    ],
  },
  {
    title: "Own projects",
    rows: [
      { name: "Snaxx Tech", line: "A studio website. Images cut from 972 KB to 337 KB.", role: "Owner", year: "2026", link: live("https://www.snaxxtech.com/") },
      { name: "Offday", line: "Time-off app. 16 tests prove one team never sees another team's data.", role: "Owner", year: "2026" },
      { name: "FJALË", line: "A daily Albanian word game that also works offline.", role: "Owner", year: "2026", link: live("https://xn--fjal-opa.com/") },
      { name: "Za!", line: "Pizza card game for 2 to 8 players. The server keeps every game fair.", role: "Owner", year: "2026", link: live("https://za-game.onrender.com/") },
      { name: "Morse Trainer", line: "A game that teaches Morse code with spaced practice.", role: "Owner", year: "2026", link: live("https://morse-code-amber.vercel.app/") },
      { name: "Geo Guesser World 3D", line: "Street-view guessing game, published on Google Play.", role: "Mobile, co-built", year: "2026", link: { href: "https://play.google.com/store/apps/details?id=com.snaxxtech.geoguesser", label: "Google Play", external: true } },
      { name: "OFFBEAT", line: "A made-up speaker brand: a 3D speaker and a working drum machine.", role: "Owner", year: "2026", link: { href: "https://github.com/gentritr1/offbeat", label: "GitHub", external: true } },
      { name: "FORM", line: "A made-up sculpture show: three 3D sculptures to turn and twist.", role: "Owner", year: "2026", link: { href: "https://github.com/gentritr1/form", label: "GitHub", external: true } },
      { name: "Futurisma", line: "A hover racer with seven circuits, weather and day and night.", role: "Owner", year: "2026" },
      { name: "Secret Dictator", line: "A hidden-role game against computer players, in a 3D town.", role: "Owner", year: "2026" },
      { name: "Open-source reader libraries", line: "Two book-reader libraries, kept working for a reading app in production.", role: "Maintainer", year: "2022", link: { href: "https://github.com/gentritr1", label: "GitHub", external: true } },
    ],
  },
];
