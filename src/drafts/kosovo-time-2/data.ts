const DATE_RANGE = "/showcase/design-system/date-range.webp";

export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** The part of the source that the plate shows, in the shot's units. */
  crop?: Crop;
  /** The part a phone screen shows, so the screen's own text stays readable. */
  narrowCrop?: Crop;
}
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}
export interface Link {
  label: string;
  href: string;
}

/** One step of a work loop. `person`: the step a person takes, not an agent. */
export interface Step {
  name: string;
  note: string;
  person?: boolean;
}

/** A white card that stands on the ground like a screen: the work loop, in plain words.
 * `back`: a failed change goes from step `from` back to step `to` (indexes into `steps`). */
export interface Card {
  title: string;
  steps: Step[];
  back: { from: number; to: number; label: string };
  /** The last line of the card: the rule the loop keeps. */
  proof?: string;
  slug: string;
  label: string;
}

/** A count before and after, drawn as marks. */
export interface Count {
  from: number;
  to: number;
  label: string;
}

export interface Row {
  id: string;
  name: string;
  /** What it is, in the user's words. */
  line: string;
  /** The result: 10 words or fewer. */
  result: string;
  role: string;
  years: string;
  /** Scope or label that must stay visible. */
  note?: string;
  links: Link[];
  plate: Shot;
  /** The case page the plate opens. */
  slug?: string;
  card?: Card;
  count?: Count;
  /** A small screen, such as one sign-in card: the plate stays near its own pixels. */
  small?: boolean;
}

/** Desktop captures are 2880 x 1800 files. Crops are in CSS pixels of a 1440 x 900 screen. */
const desktop = (src: string, alt: string, crop: Crop, narrowCrop?: Crop): Shot => ({ src, width: 1440, height: 900, alt, crop, narrowCrop });
const iphone = (src: string, alt: string, crop: Crop): Shot => ({ src, width: 780, height: 1689, alt, crop });

export const REAL_SCREENS = "Real product screens, invented data.";

/** The two client screens on the first screen: the care team calendar (web) and the Viva Fresh cart (phone). */
export const leadWeb = {
  shot: desktop(
    "/showcase/care-dashboard/appointments-week.webp",
    "Care team calendar for one week, from 8 AM to noon: calls, video calls and office visits for each patient. Invented data.",
    { x: 256, y: 84, w: 1184, h: 530 },
    { x: 472, y: 212, w: 478, h: 402 },
  ),
  name: "Care platform",
  note: "Web app · real screen, invented data",
  /** The note on a phone, where the bar is narrow. */
  short: "Real screen, invented data",
  slug: "care-platform",
};

export const leadPhone = {
  shot: iphone(
    "/mobile/grocery-3.webp",
    "Viva Fresh cart in Albanian: four products with quantities, the discount, and the total of 25.11 euro",
    { x: 100, y: 440, w: 580, h: 1030 },
  ),
  name: "Viva Fresh",
  note: "Phone app",
  slug: "viva-fresh",
};

export const client: Row[] = [
  {
    id: "care",
    slug: "care-platform",
    name: "Care-management platform",
    line: "Care teams follow patients' readings, care plans, lab results and bills.",
    result: "Being rebuilt screen by screen. Old bugs written down, not copied.",
    role: "Web and mobile; since 2026 also the server",
    years: "2023–26",
    note: REAL_SCREENS,
    links: [],
    plate: desktop(
      "/showcase/care-dashboard/claims.webp",
      "Claims for one month: counts by status, filters, and each claim with its program, CPT codes and status. Invented data.",
      { x: 246, y: 160, w: 1194, h: 714 },
      { x: 256, y: 270, w: 560, h: 300 },
    ),
    count: { from: 16, to: 2, label: "database requests for one billing report, before and after" },
    card: {
      title: "Gentrit wrote most of the rules and the checks. AI agents build inside them. A person approves each change.",
      steps: [
        { name: "Old app", note: "Shows how it works" },
        { name: "Test first", note: "Written on the old app" },
        { name: "Agents build", note: "Inside fixed rules" },
        { name: "Checks", note: "Automatic, must pass" },
        { name: "Person approves", note: "Then it is added", person: true },
      ],
      back: { from: 3, to: 2, label: "A check fails? Back to the agents." },
      proof: "A check is trusted only after it is shown to fail.",
      slug: "care-platform",
      label: "How the care platform is rebuilt",
    },
  },
  {
    id: "bayyinah",
    slug: "bayyinah-tv",
    name: "Bayyinah TV",
    line: "A video-learning platform, rebuilt from an empty page: 34 pages.",
    result: "Members subscribe on the web, iPhone or Android.",
    role: "Frontend, core team",
    years: "2023–26",
    links: [
      { label: "Website", href: "https://bayyinahtv.com/" },
      { label: "App Store", href: "https://apps.apple.com/us/app/bayyinah-tv/id1530635769" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" },
    ],
    plate: desktop(
      "/showcase/bayyinah/web-02.webp",
      "Bayyinah TV library: search, filters and a row of courses, one marked LIVE",
      { x: 84, y: 236, w: 922, h: 664 },
      { x: 95, y: 505, w: 620, h: 340 },
    ),
  },
  {
    id: "design-system",
    slug: "design-system-react",
    name: "Design System v2",
    line: "Colours, sizes and type are set once, for code and for Figma.",
    result: "36 building blocks, released 20 times in about six weeks.",
    role: "Design system",
    years: "2026",
    note: REAL_SCREENS,
    links: [],
    plate: desktop(
      DATE_RANGE,
      "Design System v2 date range picker, open: the presets, June and July 2026, and the range June 22 to July 9. Invented data.",
      { x: 4, y: 36, w: 780, h: 432 },
      { x: 8, y: 36, w: 476, h: 364 },
    ),
    card: {
      title:
        "Research into five leading design systems came first. Gentrit turned it into written guides for AI agents. The guides advise, but automatic checks decide. A person approves each change.",
      steps: [
        { name: "Research", note: "Five leading design systems" },
        { name: "Guides", note: "Written for the agents" },
        { name: "Agents build", note: "The guides advise" },
        { name: "Checks", note: "Checks decide" },
        { name: "Person approves", note: "Then it is added", person: true },
      ],
      back: { from: 3, to: 2, label: "A check fails? Back to the agents." },
      slug: "design-system-react",
      label: "How Design System v2 is built",
    },
  },
  {
    id: "viva-fresh",
    slug: "viva-fresh",
    name: "Viva Fresh",
    line: "A grocery and loyalty app, built once for iPhone and Android.",
    result: "Shopping in Albanian, live in both app stores.",
    role: "Mobile",
    years: "2023",
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/viva-fresh/id1580739480" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.vivafresh" },
    ],
    plate: iphone(
      "/mobile/grocery-2.webp",
      "Viva Fresh Fresh category in Albanian: a grid of products with prices and cart buttons",
      { x: 92, y: 560, w: 596, h: 728 },
    ),
  },
  {
    id: "read-to-feed",
    slug: "read-to-feed",
    name: "Read to Feed",
    line: "A reading app for children, with a built-in book reader.",
    result: "The app remembers the page in every book.",
    role: "Mobile, iOS and Android",
    years: "2022–25",
    note: "The store pages are archived.",
    links: [
      {
        label: "App Store",
        href: "https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765",
      },
      {
        label: "Google Play",
        href: "https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf",
      },
    ],
    plate: iphone(
      "/mobile/reading-1.webp",
      "Read to Feed's My Books screen: The Tale of Peter Rabbit read to 36%, Anne of Green Gables read to 90%, and the next books in each series",
      { x: 91, y: 500, w: 598, h: 790 },
    ),
  },
  {
    id: "dukagjini",
    slug: "dukagjini-bookstore",
    name: "Dukagjini Bookstore",
    line: "A bookstore app for a publisher, on iPhone and Android.",
    result: "A notification opens the right book.",
    role: "Mobile",
    years: "2021–22",
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks" },
    ],
    plate: iphone(
      "/mobile/bookstore-2.webp",
      "Dukagjini Bookstore foreign books: ratings, prices and favourites",
      { x: 117, y: 740, w: 546, h: 700 },
    ),
  },
  {
    id: "incentiv",
    slug: "incentiv",
    name: "Incentiv",
    line: "Sign-in and dashboard screens for a crypto wallet.",
    result: "Sign in with a passkey or a wallet, no password.",
    role: "Frontend",
    years: "2024",
    note: "Built the screens; teammates built the wallet.",
    small: true,
    links: [
      { label: "Website", href: "https://incentiv.io/" },
      { label: "Portal", href: "https://portal.incentiv.io/" },
    ],
    plate: desktop(
      "/showcase/incentiv/web-03.webp",
      "Incentiv portal sign-in: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect options",
      { x: 176, y: 262, w: 560, h: 400 },
    ),
  },
];

export interface Concept {
  id: string;
  name: string;
  line: string;
  result: string;
  links: Link[];
  plate: Shot;
}

export const concepts: Concept[] = [
  {
    id: "offbeat",
    name: "OFFBEAT",
    line: "A concept site for a made-up portable speaker.",
    result: "A working eight-step drum machine plays in the browser.",
    links: [{ label: "GitHub", href: "https://github.com/gentritr1/offbeat" }],
    plate: desktop(
      "/personal/shots/offbeat-studio-desktop.webp",
      "OFFBEAT studio: the speaker in 3D beside an eight-step grid for kick, snare, hi-hat and bass, while the beat plays",
      { x: 65, y: 30, w: 1310, h: 730 },
      { x: 67, y: 30, w: 520, h: 728 },
    ),
  },
  {
    id: "form",
    name: "FORM",
    line: "A concept site for a made-up sculpture show.",
    result: "Three sculptures are drawn live in copper, chrome and porcelain.",
    links: [{ label: "GitHub", href: "https://github.com/gentritr1/form" }],
    plate: desktop(
      "/personal/shots/form-studio-desktop.webp",
      "FORM collection: a copper trefoil knot and a chrome ring, each with its formula",
      { x: 52, y: 196, w: 1340, h: 700 },
      { x: 160, y: 208, w: 500, h: 690 },
    ),
  },
];

export const offday: Row = {
  id: "offday",
  name: "Offday",
  line: "Time off for teams: requests, approvals and one shared calendar.",
  result: "About 200 tests, including ones that keep teams' data apart.",
  role: "Own project",
  years: "2026",
  note: "Private code. No public link.",
  links: [],
  plate: desktop(
    "/personal/shots/offday-light-shifts-desktop.webp",
    "Offday Shifts week grid with morning and evening shifts, two of them flagged Needs cover because the person is on leave",
    { x: 0, y: 0, w: 1440, h: 900 },
    { x: 268, y: 240, w: 450, h: 262 },
  ),
};

/** Small games, one line each, with no plate, so client work leads the page. */
export interface Note {
  id: string;
  name: string;
  line: string;
  link: Link;
}

export const games: Note[] = [
  {
    id: "fjale",
    name: "FJALË",
    line: "A daily Albanian word game.",
    link: { label: "Website", href: "https://xn--fjal-opa.com/" },
  },
  {
    id: "za",
    name: "Za!",
    line: "A pizza card game for 2 to 8 players.",
    link: { label: "Website", href: "https://za-game.onrender.com/" },
  },
  {
    id: "morse",
    name: "Morse Trainer",
    line: "A game that teaches Morse.",
    link: { label: "Website", href: "https://morse-code-amber.vercel.app/" },
  },
];

/** The white work-loop card, as a screen colour for the floor at night. */
export const CARD_COLOURS = "f7f6f2".repeat(16);

/** Each screen's colours as a 4 x 4 grid of sRGB hex, top row first, sampled from the part the plate shows.
 * They light the floor at night, so the page never fetches a screenshot only to sample it. */
export const screenColours: Record<string, string> = {
  "/showcase/care-dashboard/appointments-week.webp":
    "f5f5f5f9f9f9f2f4f5e1eaeefcfcfcfcfcfcfbfbfbfcfcfcfbfbfcf8f6fbf4f2f9f5f4fafdfdfdfaf9fcf0f7f3f9f8fb",
  "/mobile/grocery-3.webp":
    "ebe9e8e9e5e5eaeaeae9e9e9cab6a9e2dddde1e1e1e9e9e9e3d2c5e3dfdee5e6e6ebececefacaaf3acacd29f92cea294",
  "/showcase/care-dashboard/claims.webp":
    "faf7eefaf8eefbf9f1fdfbf3f9f9fafbfaf9f9f9f9fcfcfcf3f3f4f7f8f7f6f6f7f8f9faf6f6f7f4f8f5f6f4f4e6eef1",
  "/showcase/bayyinah/web-02.webp":
    "261f22272023322a2d2c2427282124231b1e231b1e231b1e6d5752324048302e3282645a46393c1d1a1c2b272a4b3d3e",
  "/showcase/design-system/date-range.webp":
    "f7f7f8fafafafdfdfdfafafaf3f3f3f8f8f8f1f4f5e7eff2f4f4f4e2ebeff2f4f5f5f5f5f9f9f9f7f7f8f7f8f8e1eaee",
  "/mobile/grocery-2.webp":
    "557d5171986e87ab82709a70e2e1e1f0ebeceeefeeeae5e6f4f3f3f3f2f2e3ebf0e8edf0f0eaeaf0f0efece7e7f1f1f0",
  "/mobile/reading-1.webp":
    "e0ebedd3e2e7cbdee7d8e7ee9bb6af76a2a72e84ac4591b475bbdd5fb1d85db0d973badcabd5e79fcfe59fd0e5aed7e8",
  "/mobile/bookstore-2.webp":
    "f9f9f9edededeeeeeef7ecece6e4deeeede9f3f3f3fdfbfbe1c6b4f0eceafdfcfcfdfdfd79bdc7d3dadaedecebf9f9f9",
  "/showcase/incentiv/web-03.webp":
    "50514d4a4b483636322526233939362e2f2c2728252526232929272c2924262826282825292a27342c242c2822252623",
  "/personal/shots/offbeat-studio-desktop.webp":
    "322823322e201b1b150e0e0c1c1c18252017585a274b4a2221211c1a1a152324141b1b1226271a262717232414191a17",
  "/personal/shots/form-studio-desktop.webp":
    "372b23392e261d1b1b1b1b1b4333274833252d323730383e372e272f26203034392e363c1f1d1c1c1a18201f1e1c1b1a",
  "/personal/shots/offday-light-shifts-desktop.webp":
    "f1eeeff6f4f4fbf9faf6eef0f5f0f1f1f4f3f0f6f5f5f4f4f5f3f4eff1f3ecf2f6f3f3f2f4f1f2ebf1f0e8f2f3eceeee",
};
