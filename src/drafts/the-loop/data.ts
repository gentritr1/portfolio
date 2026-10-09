/**
 * Copy and measured boxes for THE LOOP. Facts and their sources: SPEC.md.
 * Boxes are in the file pixels of a 2880 x 1800 capture.
 */

export const WEEK = "/showcase/care-dashboard/appointments-week.webp";
export const WEEK_SMALL = "/showcase/care-dashboard/appointments-week-1080.webp";
export const W = 2880;
export const H = 1800;

export type Wipe = "right" | "down" | "drop" | "fade";

export interface Piece {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Where the pixels come from, when they are not under the piece itself. */
  sx?: number;
  sy?: number;
  wipe: Wipe;
  /** Start and length, in ms. */
  at: number;
  len: number;
}

const SUNDAY = 622;
const GRID_TOP = 554;
const GRID_H = H - GRID_TOP;

/** Day columns from separator to separator. Monday to Friday carry events, so their empty grid is Sunday's pixels. */
const columns: Array<[number, number]> = [
  [622, 320],
  [942, 318],
  [1260, 320],
  [1580, 320],
  [1900, 320],
  [2220, 318],
  [2538, 342],
];

/** Event cards measured from the capture, Monday to Friday, top to bottom. */
const events: Array<[number, number, number, number]> = [
  [945, 680, 311, 77],
  [944, 1240, 315, 78],
  [944, 1400, 312, 78],
  [946, 1640, 310, 115],
  [1264, 761, 312, 115],
  [1264, 1080, 312, 116],
  [1264, 1320, 312, 77],
  [1264, 1480, 312, 76],
  [1263, 1641, 313, 78],
  [1584, 760, 312, 116],
  [1583, 1001, 313, 77],
  [1583, 1161, 313, 78],
  [1584, 1320, 312, 156],
  [1583, 1561, 313, 79],
  [1584, 1720, 312, 80],
  [1904, 760, 312, 76],
  [1903, 921, 313, 79],
  [1903, 1401, 313, 79],
  [2224, 760, 310, 116],
  [2224, 1080, 310, 76],
  [2223, 1321, 312, 77],
  [2224, 1480, 310, 76],
  [2223, 1720, 314, 80],
];

const EVENTS_AT = 1250;
/** Each piece runs this far under the piece that paints after it, so no seam of the dark ground shows between them. */
const OVER = 6;
const EVENT_STEP = 26;
const PAD = 3;

export const pieces: Piece[] = [
  { x: 0, y: 0, w: 472 + OVER, h: H, wipe: "right", at: 150, len: 520 },
  { x: 472, y: 0, w: W - 472, h: 112 + OVER, wipe: "right", at: 260, len: 480 },
  { x: 472, y: 112, w: W - 472, h: 304 + OVER, wipe: "down", at: 380, len: 460 },
  { x: 472, y: 416, w: W - 472, h: 138 + OVER, wipe: "down", at: 560, len: 360 },
  { x: 472, y: GRID_TOP, w: SUNDAY - 472 + OVER, h: GRID_H, wipe: "down", at: 720, len: 520 },
  ...columns.map(([x, w], i): Piece => ({
    x,
    y: GRID_TOP,
    w: i < columns.length - 1 ? w + OVER : w,
    h: GRID_H,
    ...(i > 0 && i < 6 ? { sx: SUNDAY } : {}),
    wipe: "down",
    at: 760 + i * 40,
    len: 520,
  })),
  ...events.map(([x, y, w, h], i): Piece => ({
    x: x - PAD,
    y: y - PAD,
    w: w + PAD * 2,
    h: Math.min(h + PAD * 2, H - y + PAD),
    wipe: "drop",
    at: EVENTS_AT + i * EVENT_STEP,
    len: 340,
  })),
  { x: 1244, y: 1226, w: 338, h: 32, wipe: "right", at: 2120, len: 320 },
];

export const CHECKS_AT = 2380;
export const APPROVED_AT = 2800;
export const BUILD_DONE = 3250;

/** The same pieces as layers of the exploded view, from back to front. */
export const layers: Piece[][] = [pieces.slice(4, 12), pieces.slice(1, 4), pieces.slice(0, 1), pieces.slice(12)];

/** The same four layers as single images: each one is its pieces of the capture at half size, cut to the box they fill. `box` is x, y, w, h in capture pixels. */
export const layerShots = [
  { src: "/showcase/care-dashboard/appointments-week-layer-0.webp", box: [472, 554, 2408, 1246] },
  { src: "/showcase/care-dashboard/appointments-week-layer-1.webp", box: [472, 0, 2408, 560] },
  { src: "/showcase/care-dashboard/appointments-week-layer-2.webp", box: [0, 0, 478, 1800] },
  { src: "/showcase/care-dashboard/appointments-week-layer-3.webp", box: [941, 677, 1599, 1123] },
] as const;

/** The old app's captures, on invented data, made apart from this draft. While a file is missing, its place shows an empty slot, never a drawing of the old app. */
export const OLD_WEEK = {
  src: "/showcase/care/old-new/old-appointments.webp",
  small: "/showcase/care/old-new/old-appointments-1080.webp",
  width: 1440,
  height: 900,
  alt: "The care team calendar for one week in the old app. Invented data.",
};
export const OLD_COMPLIANCE = {
  src: "/showcase/care/old-new/old-compliance.webp",
  small: "/showcase/care/old-new/old-compliance-1080.webp",
  width: 1440,
  height: 900,
  alt: "The patient compliance list in the old app. Invented data.",
};
export type Shot = typeof OLD_WEEK;

/** One run of the compliance screen's test on both apps: frame N of each app is the same step (manifest.json in the same folder). */
export const twinBase = "/showcase/care/old-new/";
export const twinSteps = [
  "Open the list.",
  "Search for a name.",
  "Show one billing code.",
  "Sort by priority, last first.",
  "Change to the CCM program.",
  "Open the patient.",
];

/** The four steps of the loop. `caption` names what the stage shows; `note` says where an example comes from. */
export const steps: Array<{ name: string; caption: string; text: string; note?: string }> = [
  {
    name: "Test first",
    caption: "The old app. The test is written here first.",
    text: "First, a test is written on the old app. It says what the screen must do. The new screen must pass the same test.",
  },
  {
    name: "Agents build",
    caption: "The new app. Agents build it part by part.",
    text: "AI agents write the new screen, part by part. They follow written rules, step guides and decision records.",
  },
  {
    name: "Checks",
    caption: "Checks run. A failed check sends the work back.",
    text: "Automatic checks run on every change. A failed check sends the work back to the agents.",
    note: "One real failure from 8 September, shown here as an example.",
  },
  {
    name: "Person approves",
    caption: "A person approves. Then the change joins the app.",
    text: "A person reads the change and approves it. Only then does it join the app.",
  },
];

/** Scenario names from the calendar screen's test file, without their requirement IDs. */
export const testFile = "appointments-calendar.spec.ts";
export const testLines = [
  "/appointments opens on the current week in Week view",
  "the arrows step one week and the header follows",
  "Today returns the calendar to the current week",
  "cancelled items are hidden until Show cancelled is on",
];

/** Leaves of the two check profiles, by their names in the repo. On the compliance screen, `registry:check` failed once, then passed. */
export const checkRows = [
  { name: "Types", cmd: "typecheck" },
  { name: "Lint and format", cmd: "lint" },
  { name: "Unit tests", cmd: "test:unit" },
  { name: "Production build", cmd: "build" },
  { name: "Route rules", cmd: "registry:check", once: true },
];

/** The files the agents changed in the commit that added the compliance screen, with their added lines. */
export const builtFiles: Array<[string, number]> = [
  ["ComplianceTrackerHeader.tsx", 42],
  ["ComplianceTrackerLegend.tsx", 40],
  ["ComplianceTrackerPage.test.tsx", 315],
  ["ComplianceTrackerPage.tsx", 189],
  ["ComplianceTrackerTable.test.tsx", 219],
  ["ComplianceTrackerTable.tsx", 227],
  ["ComplianceTrackerToolbar.tsx", 133],
  ["use-compliance-export.ts", 48],
  ["index.ts", 7],
  ["labels.ts", 145],
  ["page.tsx", 33],
  ["compliance-tracker-route.tsx", 52],
  ["router.tsx", 2],
];

export interface Station {
  name: string;
  time: string;
  line: string;
  /** Real text from the day, one line per row. */
  artefact: string[];
  source: string;
}

/** One screen of the care platform on 2026-09-08. Times are commit times. */
export const stations: Station[] = [
  {
    name: "Old app",
    time: "11:37",
    line: "Every behaviour of the old screen is written down first. In the old app, a failed export showed the user nothing.",
    artefact: [
      "D-2   An export failure is reported to the user.",
      "old   console.error only",
      "new   An error toast; the button re-enables",
    ],
    source: "Row D-2 of the screen's notes on the old app",
  },
  {
    name: "Test first",
    time: "12:01",
    line: "The test is written on the old app, before any new code. The same file then runs on both apps.",
    artefact: [
      "/**",
      " * One spec, both applications. `E2E_BASE_URL`",
      " * selects the origin; nothing here branches on",
      " * which one answered.",
      " */",
    ],
    source: "Header of the screen's test file",
  },
  {
    name: "Agents build",
    time: "12:55",
    line: "AI agents build the new screen inside the rules.",
    artefact: [
      "Build the compliance-tracker feature module",
      "and its route",
      "",
      "13 files changed, 1452 insertions(+)",
      "Co-Authored-By: Claude Opus 5",
    ],
    source: "The commit that added the screen",
  },
  {
    name: "Checks",
    time: "Before merge",
    line: "Automatic checks run. One failed, so the work went back. After the fix, the same check passed.",
    artefact: [
      "npm run migration:check      exit 1  failed",
      "FEATURE_SOURCE_BEFORE_BUILDING: /compliance-tracker",
      "is planned but React source already owns it.",
      "npm run migration:check      exit 0  passed",
    ],
    source: "The merge review of the screen",
  },
  {
    name: "Person approves",
    time: "15:40",
    line: "The same test passed on both apps. Then a person approved the change and merged it.",
    artefact: ["15:25  same test, old app     passed", "15:25  same test, new app     passed", "15:40  approved and merged by a person"],
    source: "The merge review and the merge",
  },
];

export const ringProof = [
  "One screen went from first note to merged in one working day, tested on the old app first.",
  "The same test passed on both apps.",
  "Old bugs written down, not copied.",
];

export interface App {
  name: string;
  years: string;
  line: string;
  built: string;
  result: string;
  shots: Array<{ src: string; alt: string }>;
  links: Array<{ label: string; href: string }>;
  engineers: string[];
}

export const apps: App[] = [
  {
    name: "Read to Feed",
    years: "2022 to 2025",
    line: "This app lets children read books, scan their own books and earn badges.",
    built: "The team built a reader for two e-book formats that keeps the page, a barcode scanner with the camera, and badges and streaks.",
    result: "About 14 updates went to both stores in four years.",
    shots: [
      { src: "/mobile/reading-1.webp", alt: "Read to Feed store screen: My Books, with each book and how much of it is read." },
      { src: "/mobile/reading-2.webp", alt: "Read to Feed store screen: badges and eggs earned by reading and answering quiz questions." },
    ],
    links: [
      { label: "App Store (archived)", href: "https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765" },
      { label: "Google Play (archived)", href: "https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf" },
    ],
    engineers: ["React Native 0.63 to 0.81, three major upgrades", "Redux Toolkit, Firebase, Vision Camera", "epub.js and react-native-pdf, kept as maintained forks"],
  },
  {
    name: "Viva Fresh",
    years: "2023",
    line: "This app lets people order groceries for a set delivery time, in Albanian.",
    built: "The team built it once for iPhone and Android: categories, cart, checkout with a delivery time, address search on a map, and loyalty.",
    result: "Live in both stores.",
    shots: [
      { src: "/mobile/grocery-1.webp", alt: "Viva Fresh store screen: the home page with categories and products." },
      { src: "/mobile/grocery-3.webp", alt: "Viva Fresh store screen: the cart with products, the total and the checkout button." },
    ],
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/viva-fresh/id1580739480" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.vivafresh" },
    ],
    engineers: ["React Native, Redux Toolkit", "Maps with address search", "Firebase"],
  },
  {
    name: "Dukagjini Bookstore",
    years: "2021 to 2022",
    line: "This app is a publisher's bookshop: search, lists and promo codes.",
    built: "The team built it once for both phones. A notification opens the right book, and panels close with a swipe.",
    result: "Live in both stores.",
    shots: [
      { src: "/mobile/bookstore-1.webp", alt: "Dukagjini Bookstore store screen: search for books and the top categories." },
      { src: "/mobile/bookstore-2.webp", alt: "Dukagjini Bookstore store screen: a list of foreign books with prices." },
    ],
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks" },
    ],
    engineers: ["React Native, Redux", "Firebase Messaging with deep links", "Swipe-to-close panels"],
  },
  {
    name: "Bayyinah TV",
    years: "2023 to 2026",
    line: "This platform has video lessons, live classes and subscriptions.",
    built: "The core team rebuilt the web app from an empty template, in English and in Arabic, read from right to left. The iPhone and Android apps run the same web app.",
    result: "Live on the web and in both stores.",
    shots: [
      { src: "/showcase/bayyinah/store-01.webp", alt: "Bayyinah TV store screen: Quran studies made simple, with a phone that shows a lesson." },
      { src: "/showcase/bayyinah/store-05.webp", alt: "Bayyinah TV store screen: My Learning, with hours watched and lessons in progress." },
    ],
    links: [
      { label: "Website", href: "https://bayyinahtv.com/" },
      { label: "App Store", href: "https://apps.apple.com/us/app/bayyinah-tv/id1530635769" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" },
    ],
    engineers: ["Nuxt 3, Vue 3, Pinia", "video.js with HLS, AWS IVS live video, Pusher", "Stripe, Apple and Google subscriptions"],
  },
];

export interface Own {
  id: string;
  name: string;
  line: string;
  role?: string;
  shot: { src: string; small: string; alt: string };
  link?: { label: string; href: string };
  engineers: string[];
}

export const own: Own[] = [
  {
    id: "offday",
    name: "Offday",
    line: "Time off for teams: requests, approvals, one shared calendar and shift cover.",
    role: "Built with one other developer.",
    shot: {
      src: "/personal/shots/offday-light-shifts-desktop.webp",
      small: "/personal/shots/offday-light-shifts-desktop-1080.webp",
      alt: "Offday Shifts week grid with morning and evening shifts, two of them flagged Needs cover because the person is on leave.",
    },
    engineers: ["Next.js 16, React 19, SQLite, Zod 4", "Each company's data stays apart; every write checks membership and role on the server", "About 200 Playwright tests, with security tests"],
  },
  {
    id: "offbeat",
    name: "OFFBEAT",
    line: "A made-up speaker brand, with a 3D speaker and a drum machine that plays.",
    shot: {
      src: "/personal/shots/offbeat-studio-desktop.webp",
      small: "/personal/shots/offbeat-studio-desktop-1080.webp",
      alt: "OFFBEAT sound studio: an eight-step drum machine beside the speaker, with tempo, volume and swing.",
    },
    link: { label: "GitHub", href: "https://github.com/gentritr1/offbeat" },
    engineers: ["three.js draws in a Web Worker", "Sounds are set 100 ms ahead for steady time", "A groove fits in a link or downloads as a WAV file"],
  },
  {
    id: "form",
    name: "FORM",
    line: "A made-up sculpture show: three math shapes, drawn live in the browser.",
    shot: {
      src: "/personal/shots/form-studio-desktop.webp",
      small: "/personal/shots/form-studio-desktop-1080.webp",
      alt: "FORM collection: the Trefoil in copper and the Orbit in chrome, each with its formula.",
    },
    link: { label: "GitHub", href: "https://github.com/gentritr1/form" },
    engineers: ["Hand-written WebGL2, with a WebGL1 fall-back", "Recovers a lost GPU context", "No dependencies"],
  },
  {
    id: "fjale",
    name: "FJALË",
    line: "A daily Albanian word game. It works offline after the first visit.",
    shot: {
      src: "/personal/shots/fjale-desktop.webp",
      small: "/personal/shots/fjale-desktop-1080.webp",
      alt: "FJALË word game board: a five-letter grid above an Albanian keyboard.",
    },
    link: { label: "Website", href: "https://xn--fjal-opa.com/" },
    engineers: ["21,481 accepted words with inflected forms", "Old links always give the same word", "Vanilla JS, installable web app"],
  },
  {
    id: "za",
    name: "Za!",
    line: "A pizza card game for 2 to 8 players, with bots.",
    shot: {
      src: "/personal/shots/za-desktop.webp",
      small: "/personal/shots/za-desktop-1080.webp",
      alt: "Za! card game lobby: the pixel logo, a name field and buttons to start or join a table.",
    },
    link: { label: "Website", href: "https://za-game.vercel.app/" },
    engineers: ["The server decides every move", "Node with one runtime dependency, ws", "Table codes and a health endpoint"],
  },
  {
    id: "morse",
    name: "Morse Trainer",
    line: "Learn Morse code in short sessions.",
    shot: {
      src: "/personal/shots/morse-desktop.webp",
      small: "/personal/shots/morse-desktop-1080.webp",
      alt: "Morse Trainer lesson screen: the letters learned so far and the next signals to read.",
    },
    link: { label: "Website", href: "https://morse-code-amber.vercel.app/" },
    engineers: ["A letter comes back until it is read clean after a real gap", "Farnsworth spacing that follows the player"],
  },
  {
    id: "snaxx",
    name: "Snaxx Tech",
    line: "The site of a small app studio, with an animated illustration.",
    shot: {
      src: "/personal/shots/snaxx-desktop.webp",
      small: "/personal/shots/snaxx-desktop-1080.webp",
      alt: "Snaxx Tech studio site: The Snaxx Almanac, an illustrated landscape of apps and games.",
    },
    link: { label: "Website", href: "https://www.snaxxtech.com/" },
    engineers: ["Strict content security policy", "A video loop with no visible seam", "Images 972 KB to 337 KB, deploy 28 MB to 9.5 MB"],
  },
];

export const breadth = {
  columns: ["Web", "Mobile", "Server"],
  rows: [
    { domain: "Healthcare", cells: ["Care platform, Vue then React", "Care platform", "Care platform API, Laravel"] },
    { domain: "E-books and reading", cells: [null, "Read to Feed, Dukagjini Bookstore", null] },
    { domain: "Streaming and learning", cells: ["Bayyinah TV", "Bayyinah TV, the web app inside the store apps", null] },
    { domain: "Web3", cells: ["Incentiv portal", null, null] },
    { domain: "Web games", cells: ["FJALË, Za!, Morse Trainer", "Geo Guesser, co-built", "Za!, Node and WebSocket"] },
  ] as Array<{ domain: string; cells: Array<string | null> }>,
};

export const learned = [
  { when: "2024", what: "A Web3 wallet portal, with passkey sign-in (Incentiv)." },
  { when: "2026", what: "Server work in Laravel and PHP for the care platform." },
  { when: "2026", what: "WebGL, three.js and Web Audio (FORM, OFFBEAT)." },
  { when: "July 2026", what: "An agent workflow with rules, tests, checks and a person who approves." },
];
