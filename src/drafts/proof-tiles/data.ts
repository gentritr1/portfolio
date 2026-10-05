/** A rectangle in source pixels of an image. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A crop can carry its own mark when it shows only part of the proof. */
export interface Crop extends Box {
  mark?: Box;
  /** Used only on a phone layout, where the tile has one column. Its ratio can differ from 16:10. */
  phone?: boolean;
  /** A crop from another capture of the same screen. */
  image?: { src: string; width: number; height: number; density: number; alt?: string };
  /** The part of the crop that shows the image. Outside it, the tile ground shows. */
  clip?: Box;
  /** The caption words that this crop proves, when they differ from the tile's. */
  proof?: string;
}

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * The parts of the image a tile can show, cut on whole rows. Crops that are
   * not phone crops are 16:10. The tile uses the narrowest crop that is close
   * to its width, so text in a crop keeps its size.
   */
  crops: Crop[];
  /** The part that proves the caption. */
  mark: Box;
  /** Source pixels for each CSS pixel. A 2x capture shows at half its source size. */
  density?: number;
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
  dark?: boolean;
  recreation?: boolean;
  link?: { href: string; label: string; external?: boolean };
}

export const work: Tile[] = [
  {
    id: "billing",
    project: "Care platform, server side",
    caption: "A billing report that timed out now finishes.",
    proof: "now finishes",
    role: "Full stack",
    year: "2026",
    media: { kind: "figure" },
    hue: 33,
    ground: "#ff5a36",
    link: { href: "/work/care-platform", label: "Open the case" },
  },
  {
    id: "care",
    project: "Care platform",
    caption: "Each client organization sees only its own patients.",
    proof: "Each client organization",
    role: "Frontend",
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
          { x: 186, y: 236, w: 512, h: 320 },
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
    id: "dukagjini",
    project: "Dukagjini Bookstore",
    caption: "Search, sales and checkout, live in both app stores.",
    proof: "Search",
    role: "Mobile",
    year: "2021–22",
    media: {
      kind: "shot",
      shot: {
        src: "/mobile/bookstore-1.webp",
        alt: "Dukagjini Bookstore store screenshot: Search Millions of Books, with the search field under an open-book picture",
        width: 780,
        height: 1689,
        crops: [{ x: 106, y: 920, w: 568, h: 355 }],
        mark: { x: 152, y: 1141, w: 476, h: 70 },
      },
    },
    hue: 18,
    ground: "#f3f2f1",
    link: { href: "/work/dukagjini-bookstore", label: "Open the case" },
  },
];

const offdayAlt = "Offday, light theme, a screenshot of the app with demo data";

/** Own projects. OFFBEAT and FORM are concepts: no real brand or client. */
export const own: Tile[] = [
  {
    id: "offday-shifts",
    project: "Offday",
    caption: "A shift is flagged when its person is on leave.",
    proof: "flagged",
    role: "Owner",
    year: "2026",
    media: {
      kind: "shot",
      shot: {
        src: "/personal/shots/offday-light-shifts-desktop.webp",
        alt: `${offdayAlt}: the Shifts week grid, where Olivia Chen's Monday evening shift is marked Needs cover because she is on vacation`,
        width: 2880,
        height: 1800,
        density: 2,
        crops: [
          { x: 520, y: 622, w: 818, h: 444, phone: true, mark: { x: 990, y: 874, w: 310, h: 94 } },
          { x: 960, y: 622, w: 1408, h: 880 },
        ],
        mark: { x: 990, y: 874, w: 318, h: 94 },
      },
    },
    hue: 247,
    ground: "#ffffff",
  },
  {
    id: "offday-best-dates",
    project: "Offday",
    caption: "It finds the longest breaks around public holidays.",
    proof: "longest breaks",
    role: "Owner",
    year: "2026",
    media: {
      kind: "shot",
      shot: {
        src: "/personal/shots/offday-light-best-dates-desktop.webp",
        alt: `${offdayAlt}: Find the best dates, which turns 3 days of leave into 6 days off around Veterans Day, Thanksgiving and Christmas`,
        width: 2880,
        height: 1800,
        density: 2,
        crops: [
          {
            x: 47,
            y: 1096,
            w: 686,
            h: 492,
            phone: true,
            image: {
              src: "/personal/shots/offday-light-best-dates-phone.webp",
              width: 780,
              height: 1688,
              density: 2,
            },
            mark: { x: 98, y: 1284, w: 584, h: 84 },
          },
          {
            x: 780,
            y: 890,
            w: 1320,
            h: 824,
            clip: { x: 960, y: 890, w: 960, h: 792 },
          },
        ],
        mark: { x: 1032, y: 1030, w: 818, h: 86 },
      },
    },
    hue: 161,
    ground: "#ffffff",
  },
  {
    id: "offbeat",
    project: "OFFBEAT, a speaker brand concept",
    caption: "Its drum machine plays in the browser.",
    proof: "drum machine plays",
    role: "Owner",
    year: "2026",
    media: {
      kind: "shot",
      shot: {
        src: "/personal/shots/offbeat-studio-desktop.webp",
        alt: "OFFBEAT sound studio, a concept, while it plays: an eight-step drum machine with kick, snare, hi-hat and bass rows, the playing step in red, and three groove presets",
        width: 2880,
        height: 1800,
        density: 2,
        crops: [
          { x: 1384, y: 446, w: 1312, h: 446, phone: true, mark: { x: 2040, y: 470, w: 160, h: 386 } },
          { x: 1224, y: 96, w: 1474, h: 922 },
        ],
        mark: { x: 2040, y: 456, w: 160, h: 414 },
      },
    },
    hue: 113,
    ground: "#121210",
    dark: true,
    link: { href: "https://github.com/gentritr1/offbeat", label: "GitHub", external: true },
  },
  {
    id: "form",
    project: "FORM, a sculpture show concept",
    caption: "Three sculptures, each drawn live from its formula.",
    proof: "drawn live from its formula",
    role: "Owner",
    year: "2026",
    media: {
      kind: "shot",
      shot: {
        src: "/personal/shots/form-studio-desktop.webp",
        alt: "FORM collection, a concept: the copper Trefoil sculpture with its formula, p(t) = ((2 + cos 3t) cos 2t, (2 + cos 3t) sin 2t, sin 3t)",
        width: 2880,
        height: 1800,
        density: 2,
        crops: [
          {
            x: 20,
            y: 830,
            w: 740,
            h: 816,
            phone: true,
            image: {
              src: "/personal/shots/form-phone.webp",
              width: 780,
              height: 1688,
              density: 2,
              alt: "FORM home on a phone, a concept: the copper Trefoil sculpture under the Trefoil, Orbit and Bloom tabs",
            },
            mark: { x: 40, y: 856, w: 298, h: 76 },
            proof: "Three sculptures",
          },
          { x: 0, y: 524, w: 1648, h: 1030, clip: { x: 0, y: 524, w: 1580, h: 1030 } },
        ],
        mark: { x: 96, y: 1476, w: 1060, h: 60 },
      },
    },
    hue: 50,
    ground: "#1c1a18",
    dark: true,
    link: { href: "https://github.com/gentritr1/form", label: "GitHub", external: true },
  },
];

export interface Platform {
  id: "iphone" | "android";
  label: string;
  store: string;
  href: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  /** The screen inside the store frame, cut on whole rows. Both crops share one ratio, so the rows line up. */
  crop: Box;
}

/** The lead: one Viva Fresh screen, from each store listing. */
export const lead = {
  project: "Viva Fresh",
  role: "Mobile",
  year: "2023",
  scope: "Shoppers fill a cart, pick a delivery slot and pay, in Albanian.",
  case: "/work/viva-fresh",
  platforms: [
    {
      id: "iphone",
      label: "iPhone",
      store: "App Store",
      href: "https://apps.apple.com/us/app/viva-fresh/id1580739480",
      src: "/mobile/grocery-1.webp",
      alt: "Viva Fresh home on iPhone, from the App Store listing: product categories and the latest products, in Albanian",
      width: 780,
      height: 1689,
      crop: { x: 92, y: 374, w: 596, h: 866 },
    },
    {
      id: "android",
      label: "Android",
      store: "Google Play",
      href: "https://play.google.com/store/apps/details?id=com.zs.vivafresh",
      src: "/mobile/grocery-4.webp",
      alt: "Viva Fresh home on Android, from the Google Play listing: the same categories and products, in Albanian",
      width: 780,
      height: 1387,
      crop: { x: 138, y: 370, w: 498, h: 724 },
    },
  ] satisfies Platform[],
};

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
      { name: "Design dashboard (prototype)", line: "One screen of the care app, made with demo data as a design reference.", role: "Frontend", year: "2026" },
      { name: "Bayyinah TV", line: "Video-learning platform. The second version is a new app: 34 pages, live classes.", role: "Frontend, core team", year: "2023–26", link: caseLink("bayyinah-tv") },
      { name: "Bayyinah institute website", line: "The institute's public website, on one page.", role: "Frontend", year: "2024–25", link: live("https://bayyinah.org/") },
      { name: "Read to Feed", line: "Children's reading app. About 14 updates shipped to both app stores.", role: "Mobile", year: "2022–25", link: caseLink("read-to-feed") },
      { name: "Viva Fresh", line: "Grocery orders with delivery slots, loyalty and a wishlist.", role: "Mobile", year: "2023", link: caseLink("viva-fresh") },
      { name: "Dukagjini Bookstore", line: "A publisher's bookshop app: search, sales and checkout.", role: "Mobile", year: "2021–22", link: caseLink("dukagjini-bookstore") },
      { name: "Scripted chat engine", line: "Plays scripted chats: messages, pictures, choices and timers.", role: "Mobile", year: "2022–25" },
      { name: "Scripted chat engine, web version", line: "The same chat engine for the web, with an example app.", role: "Frontend", year: "2025" },
      { name: "Book reader prototype", line: "Opens a downloaded book and resizes its text. The reading app's first reader.", role: "Mobile", year: "2022" },
      { name: "Sadaqah app for Islamic Relief USA", line: "Donation app. Payment screens, badges and Android builds, in a small team.", role: "Mobile", year: "2021–22" },
      { name: "Coaching app", line: "Sign-in through an organization, a daily calendar strip and reactions.", role: "Mobile", year: "2022–23" },
      { name: "Fuel-station loyalty app", line: "Maintenance: the app builds again on newer Macs, and its shadows show correctly.", role: "Mobile", year: "2026" },
      { name: "Incentiv", line: "Sign-in and dashboard screens for a crypto wallet. Teammates built the wallet.", role: "Frontend", year: "2024", link: caseLink("incentiv") },
      { name: "Member portal", line: "The base of a member portal: sign-in, private pages and the app frame.", role: "Frontend", year: "2025" },
      { name: "Business dashboard with AI", line: "Headshots made from photos, and a chat that answers questions about a PDF.", role: "Frontend, some server work", year: "—" },
    ],
  },
  {
    title: "Own projects",
    rows: [
      { name: "Snaxx Tech", line: "A studio website. Images cut from 972 KB to 337 KB.", role: "Owner", year: "2026", link: live("https://www.snaxxtech.com/") },
      { name: "Offday", line: "Time-off app for teams, covered by about 200 automated tests. The code is private.", role: "Owner", year: "2026" },
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
