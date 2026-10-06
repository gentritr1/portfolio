export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
  /** The part of the source that the plate shows, in source pixels. */
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
  plate: Shot | "care";
}

const desktop = (src: string, alt: string, narrowCrop?: Crop): Shot => ({ src, width: 2880, height: 1800, alt, narrowCrop });
const web = (src: string, alt: string): Shot => ({ src, width: 1440, height: 900, alt });
const iphone = (src: string, alt: string): Shot => ({ src, width: 780, height: 1689, alt });

/** The two client screens on the first screen: one web app and one phone app, both public. */
export const leadWeb = {
  shot: {
    ...web(
      "/showcase/bayyinah/web-02.webp",
      "Bayyinah TV library, Subject row: course cards From Jerusalem to Makkah, Ramadan LIVE 2026 and The Quran and the Global Economy",
    ),
    crop: { x: 95, y: 505, w: 910, h: 390 },
    narrowCrop: { x: 100, y: 515, w: 310, h: 375 },
  } satisfies Shot,
  name: "Bayyinah TV",
  note: "Web app",
};

export const leadPhone = {
  shot: {
    ...iphone(
      "/mobile/grocery-1.webp",
      "Viva Fresh home screen in Albanian: product categories, the latest products with prices and quantity buttons",
    ),
    crop: { x: 92, y: 378, w: 596, h: 788 },
  } satisfies Shot,
  name: "Viva Fresh",
  note: "Phone app",
};

export const results = [
  "Rebuilding a live care platform while care teams use it.",
  "One report asked the database 16 times. Now it asks 2.",
];

export const client: Row[] = [
  {
    id: "care",
    name: "Care-management platform",
    line: "Care teams follow patients' readings, care plans, lab results and bills.",
    result: "Moves to the new app one tested screen at a time.",
    role: "Frontend and mobile, full stack since 2026",
    years: "2023–26",
    note: "Recreation · invented data",
    links: [],
    plate: "care",
  },
  {
    id: "bayyinah",
    name: "Bayyinah TV",
    line: "A video-learning platform, rebuilt from an empty page: 34 pages.",
    result: "Members subscribe on the web or in the iPhone and Android apps.",
    role: "Frontend, core team",
    years: "2023–26",
    links: [
      { label: "Website", href: "https://bayyinahtv.com/" },
      { label: "App Store", href: "https://apps.apple.com/us/app/bayyinah-tv/id1530635769" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zombiesoup.bayyinah" },
    ],
    plate: {
      ...web(
        "/showcase/bayyinah/web-05.webp",
        "Bayyinah TV series page: episode list in a side column, series summary and video cards",
      ),
      narrowCrop: { x: 90, y: 180, w: 520, h: 360 },
    },
  },
  {
    id: "read-to-feed",
    name: "Read to Feed",
    line: "A reading app for children. Books open inside the app.",
    result: "About 14 updates in both app stores.",
    role: "Mobile, iOS and Android",
    years: "2022–25",
    links: [
      {
        label: "App Store (archived)",
        href: "https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765",
      },
      {
        label: "Google Play (archived)",
        href: "https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf",
      },
    ],
    plate: {
      ...iphone(
        "/mobile/reading-1.webp",
        "Read to Feed My Books screen: reading progress for The Tale of Peter Rabbit and Anne of Green Gables",
      ),
      crop: { x: 100, y: 530, w: 580, h: 708 },
    },
  },
  {
    id: "viva-fresh",
    name: "Viva Fresh",
    line: "A grocery and loyalty app, with an Albanian interface.",
    result: "One grocery app, built once for iPhone and Android.",
    role: "Mobile",
    years: "2023",
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/viva-fresh/id1580739480" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.vivafresh" },
    ],
    plate: {
      ...iphone(
        "/mobile/grocery-2.webp",
        "Viva Fresh Fresh category in Albanian: a grid of products with prices and cart buttons",
      ),
      crop: { x: 92, y: 560, w: 596, h: 728 },
    },
  },
  {
    id: "dukagjini",
    name: "Dukagjini Bookstore",
    line: "A bookstore app for a publisher, on iPhone and Android.",
    result: "A notification opens the right book.",
    role: "Mobile",
    years: "2021–22",
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks" },
    ],
    plate: {
      ...iphone(
        "/mobile/bookstore-1.webp",
        "Dukagjini Bookstore home screen: book search, top categories and books on sale",
      ),
      crop: { x: 106, y: 740, w: 568, h: 694 },
    },
  },
  {
    id: "design-system",
    name: "Design System v2",
    line: "Colours, sizes and type are set once, for code and for Figma.",
    result: "36 ready-made building blocks, released 20 times in about six weeks.",
    role: "Design system",
    years: "2026",
    note: "Recreation · invented data",
    links: [],
    plate: {
      src: "/showcase/design-system/specimen-light.webp",
      width: 1920,
      height: 1200,
      alt: "Component specimen for an invented project-tracker kit: tokens, alerts, select, inputs, steps, buttons, tabs and switches",
      narrowCrop: { x: 29, y: 845, w: 470, h: 345 },
    },
  },
  {
    id: "incentiv",
    name: "Incentiv",
    line: "Sign-in and dashboard screens for a crypto wallet.",
    result: "Sign in with a passkey (no password) or an existing wallet.",
    role: "Frontend",
    years: "2024",
    note: "Built the screens; teammates built the wallet.",
    links: [
      { label: "Website", href: "https://incentiv.io/" },
      { label: "Portal", href: "https://portal.incentiv.io/" },
    ],
    plate: {
      ...web(
        "/showcase/incentiv/web-03.webp",
        "Incentiv portal sign-in: Passkey, MetaMask and WalletConnect, beside the dashboard's Welcome Back screen",
      ),
      crop: { x: 160, y: 100, w: 1120, h: 700 },
      narrowCrop: { x: 180, y: 260, w: 510, h: 390 },
    },
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
      "/personal/shots/offbeat-home-desktop.webp",
      "OFFBEAT home: a hot-orange portable speaker in 3D with finish swatches and the line Plays your songs. Makes its own.",
      { x: 1440, y: 335, w: 1300, h: 880 },
    ),
  },
  {
    id: "form",
    name: "FORM",
    line: "A concept site for a made-up sculpture show.",
    result: "Three sculptures render live in copper, chrome and porcelain.",
    links: [{ label: "GitHub", href: "https://github.com/gentritr1/form" }],
    plate: desktop(
      "/personal/shots/form-home-desktop.webp",
      "FORM home: a copper trefoil knot sculpture, the title Objects of imagination. and material swatches",
      { x: 1180, y: 317, w: 1700, h: 1210 },
    ),
  },
];

export const offday: Row = {
  id: "offday",
  name: "Offday",
  line: "Time off for teams: requests, approvals and one shared calendar.",
  result: "About 200 tests, including tests that keep each team's data apart.",
  role: "Own project",
  years: "2026",
  note: "Private code. No public link.",
  links: [],
  plate: desktop(
    "/personal/shots/offday-light-shifts-desktop.webp",
    "Offday Shifts week grid with morning and evening shifts, two of them flagged Needs cover because the person is on leave",
    { x: 535, y: 480, w: 900, h: 620 },
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
    line: "A daily Albanian word game, checked against 21,000 words. It also works offline.",
    link: { label: "Website", href: "https://xn--fjal-opa.com/" },
  },
  {
    id: "za",
    name: "Za!",
    line: "A pizza card game for 2 to 8 players. Computer players can join.",
    link: { label: "Website", href: "https://za-game.onrender.com/" },
  },
  {
    id: "morse",
    name: "Morse Trainer",
    line: "A game that teaches Morse code. Letters a player misses come back sooner.",
    link: { label: "Website", href: "https://morse-code-amber.vercel.app/" },
  },
];

/** Each screen's colours as a 4 x 4 grid of sRGB hex, top row first, sampled from the part the plate shows.
 * They light the floor at night, so the page never fetches a screenshot only to sample it. */
export const screenColours: Record<string, string> = {
  "/showcase/bayyinah/web-02.webp":
    "21282e2f22233228284739330635455d49456a554b997759161a1d5f4c4c725a547061511d191b262023272122262020",
  "/mobile/grocery-1.webp":
    "d8beb9d2bdb3cac3c4d4b6b2dededde5e3e2e8e7e8e4dddcf0ebe4ebe4d8efe3def2eae8ebe3dfede7e1ede4e2f2eeec",
  "/showcase/bayyinah/web-05.webp":
    "2b20222c2225251d20311c1d322c2f373033322b2e2821242925292e31372a323a2a2c312821252c26282b272b2a2426",
  "/mobile/reading-1.webp":
    "e0ebedd3e2e7cbdee7d8e7ee9bb6af76a2a72e84ac4591b475bbdd5fb1d85db0d973badcabd5e79fcfe59fd0e5aed7e8",
  "/mobile/grocery-2.webp":
    "67825f8ea8889eb69786a180d6ded6dde5dddce8ded4e2dcf3f1f1f7f7f7dfe6e9ebeeefeee6e6efeeeeebebecf2f2f2",
  "/mobile/bookstore-1.webp":
    "f8efe9eddfdaede0daf8eee8f7e6dcdcc6b7dcc6b7f7e6dcf5f5f4ebebebecebebf3e8e8f1f1f1efefefedededf4f4f4",
  "/showcase/design-system/specimen-light.webp":
    "e5eaf0f1f3f6f0f2f3f1f4f5e5e9ebf3f4f5f2f0f0f4f4f2f2f3f6f2f3f6f7f4f7f4f4f7d8e2f2f2f3f6faf9fbf3f3f5",
  "/showcase/incentiv/web-03.webp":
    "2424231c1d1b1b1b191d1d1b3c3d3a2728251d1d1a1b1c1a2c2a262829271919191c1c1b1d1c1b1c1b1a1312111c1815",
  "/personal/shots/offbeat-home-desktop.webp":
    "14141210100e17140f23201e454643323230412d263a26202e2e2c0f0f0d1f16111d16121d1d142f2a1412110c10100d",
  "/personal/shots/form-home-desktop.webp":
    "2927261e1c1b29211c201d1a3f332b25201c77563c3e2d22413e3d1b19186549313f2f221c1a191b191830292324201c",
  "/personal/shots/offday-light-shifts-desktop.webp":
    "f1eeeff8f6f7fbf9faf7eff1f5eff1f5f6f5f4f7f6f7f6f6f6f4f5ecf0efe9f2f0f5f3f1f1efefe4edece1eeeeececed",
};
