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
  plate: Shot;
}

const desktop = (src: string, alt: string, narrowCrop?: Crop): Shot => ({ src, width: 2880, height: 1800, alt, narrowCrop });
const web = (src: string, alt: string): Shot => ({ src, width: 1440, height: 900, alt });
const iphone = (src: string, alt: string): Shot => ({ src, width: 780, height: 1689, alt });

/** The two client screens on the first screen: one web app and one phone app, both public. */
export const leadWeb = {
  shot: {
    ...web(
      "/showcase/care-dashboard/appointments-week.webp",
      "Care team calendar, Monday to Saturday, 8 AM to noon: wound checks, lung function tests, a medication review and check-in calls, and a line at the current time. Invented data.",
    ),
    crop: { x: 471, y: 208, w: 959, h: 417 },
    narrowCrop: { x: 631, y: 214, w: 320, h: 410 },
  } satisfies Shot,
  name: "Care platform",
  note: "Web app",
};

export const leadPhone = {
  shot: {
    ...iphone(
      "/mobile/grocery-3.webp",
      "Viva Fresh cart in Albanian: three products with prices and quantity buttons, the total discount, a button that empties the cart, and the checkout button with the total of 25.11 euros",
    ),
    crop: { x: 90, y: 664, w: 600, h: 804 },
  } satisfies Shot,
  name: "Viva Fresh",
  note: "Phone app",
};

export const results = [
  "Rebuilding a live care platform while care teams use it.",
  "One report made 16 database requests. Now it makes 2.",
];

export const client: Row[] = [
  {
    id: "care",
    name: "Care-management platform",
    line: "Care teams follow patients' readings, care plans, lab results and bills.",
    result: "Rebuilt screen by screen. Old bugs written down, not copied.",
    role: "Frontend and mobile, full stack since 2026",
    years: "2023–26",
    note: "Real product screens, invented data.",
    links: [],
    plate: {
      ...desktop(
        "/showcase/care-dashboard/overview.webp",
        "Care team dashboard: patients by program and patient engagement by calls and text messages. Invented data.",
        { x: 492, y: 410, w: 1160, h: 600 },
      ),
      crop: { x: 460, y: 112, w: 2412, h: 908 },
    },
  },
  {
    id: "bayyinah",
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
    plate: {
      ...web(
        "/showcase/bayyinah/web-05.webp",
        "Bayyinah TV series page: Moses 2, Adventures of Young Moses (Part 2), its summary and three episode cards with their length and date",
      ),
      crop: { x: 344, y: 180, w: 1000, h: 690 },
      narrowCrop: { x: 346, y: 552, w: 334, h: 282 },
    },
  },
  {
    id: "read-to-feed",
    name: "Read to Feed",
    line: "A reading app for children, with a built-in book reader.",
    result: "The app remembers the page in every book.",
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
      narrowCrop: { x: 100, y: 655, w: 580, h: 285 },
    },
  },
  {
    id: "viva-fresh",
    name: "Viva Fresh",
    line: "A grocery and loyalty app, built once for iPhone and Android.",
    result: "Shopping in Albanian, live in both app stores.",
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
      narrowCrop: { x: 95, y: 775, w: 595, h: 550 },
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
        "/mobile/bookstore-2.webp",
        "Dukagjini Bookstore Foreign Books list: book search, and two books with their star ratings, authors, prices and favourite hearts",
      ),
      crop: { x: 106, y: 852, w: 540, h: 654 },
      narrowCrop: { x: 106, y: 1000, w: 540, h: 496 },
    },
  },
  {
    id: "design-system",
    name: "Design System v2",
    line: "Colours, sizes and type are set once, for code and for Figma.",
    result: "36 building blocks, released 20 times in about six weeks.",
    role: "Design system",
    years: "2026",
    note: "Real product screens, invented data.",
    links: [],
    plate: {
      src: "/showcase/design-system/date-range.webp",
      width: 2880,
      height: 1800,
      alt: "Design System v2 date range picker in its Storybook, open: presets from Today to All time, June and July 2026 side by side, a range from June 22 to July 9, and Cancel and Apply buttons. Invented data.",
      crop: { x: 8, y: 72, w: 1560, h: 864 },
      narrowCrop: { x: 16, y: 72, w: 952, h: 728 },
    },
  },
  {
    id: "incentiv",
    name: "Incentiv",
    line: "Sign-in and dashboard screens for a crypto wallet.",
    result: "Sign in with a passkey or a wallet, no password.",
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
      "/personal/shots/offbeat-studio-desktop.webp",
      "OFFBEAT studio while Kitchen disco plays: the speaker in 3D, an eight-step drum grid for kick, snare, hi-hat and bass, and tempo, volume and swing controls",
      { x: 1220, y: 380, w: 1480, h: 620 },
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
  result: "About 200 tests, including ones that keep teams' data apart.",
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
  "/showcase/care-dashboard/overview.webp":
    "f0f2f6f5f7fbf5f7fbf5f7fbefeff1fafbfcf3f4f5fbfbfcecf0f0f9f9f9ececf1f6f6f7f0f1f7f8f8f8f3f2f2f9f9f9",
  "/showcase/care-dashboard/appointments-week.webp":
    "fdfdfdfdfdfdfdfdfdfdfdfdf8f6fdf9f7fdf8f5fdfdfcfefefefff8fafbf6faf8fefefefbf9fcf2f7f5fbfafdfdfcfe",
  "/mobile/grocery-3.webp":
    "c8b3a9e4dbdaeaeaeaedeeeee5dbcaeae5e5e4e5e5eeefefead6d0e9e5e4e4e4e4edededf4aaaaf5a1a1cb8b7bc99585",
  "/showcase/bayyinah/web-05.webp":
    "4640423a34372e272a2720232f292b2d26292d26292720232e3b45333d46373f463a3e442c27292c27292e28292d2729",
  "/mobile/reading-1.webp":
    "e0ebedd3e2e7cbdee7d8e7ee9bb6af76a2a72e84ac4591b475bbdd5fb1d85db0d973badcabd5e79fcfe59fd0e5aed7e8",
  "/mobile/grocery-2.webp":
    "67825f8ea8889eb69786a180d6ded6dde5dddce8ded4e2dcf3f1f1f7f7f7dfe6e9ebeeefeee6e6efeeeeebebecf2f2f2",
  "/mobile/bookstore-2.webp":
    "f2f2f2f0f0f0f7f7f7f9eceddec7b1ece6def4f3f3fdfbfbbed5d7dfe7e6f0f0eef9f9f9b5dbe0dae4e8f8f6f6fdfdfd",
  "/showcase/design-system/date-range.webp":
    "fafafafbfbfbfffffffbfbfbf6f6f6f9f9f9f4f7f8ebf1f4f5f6f6e4edf1f3f5f6f6f7f7fbfbfbf8f8f9f9f9f9e1ebef",
  "/showcase/incentiv/web-03.webp":
    "1c1c1a1c1c1b1b1b1a1d1d1b4444412d2c2a20201e20201e302c292b2a272121201c1d1c1b1b1a1b1b1a1b18151e1a17",
  "/personal/shots/offbeat-studio-desktop.webp":
    "27211d2e291f1919140f0f0d1a1a172421185b5c293c3d1f25261b1b1b161414101919161213101d1d131b1c110e0e0c",
  "/personal/shots/form-home-desktop.webp":
    "2927261e1c1b29211c201d1a3f332b25201c77563c3e2d22413e3d1b19186549313f2f221c1a191b191830292324201c",
  "/personal/shots/offday-light-shifts-desktop.webp":
    "f1eeeff8f6f7fbf9faf7eff1f5eff1f5f6f5f4f7f6f7f6f6f6f4f5ecf0efe9f2f0f5f3f1f1efefe4edece1eeeeececed",
};
