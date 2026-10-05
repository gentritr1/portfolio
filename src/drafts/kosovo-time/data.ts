export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
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

const desktop = (src: string, alt: string): Shot => ({ src, width: 2880, height: 1800, alt });
const web = (src: string, alt: string): Shot => ({ src, width: 1440, height: 900, alt });
const iphone = (src: string, alt: string): Shot => ({ src, width: 780, height: 1689, alt });

export const lead = {
  wide: desktop(
    "/personal/shots/offday-light-calendar-desktop.webp",
    "Offday team calendar for October 2026 in the demo workspace, with leave bars, a public holiday and the approval queue",
  ),
  narrow: {
    src: "/personal/shots/offday-light-calendar-phone.webp",
    width: 780,
    height: 1688,
    alt: "Offday team calendar on a phone, with the request button, team counts and October leave bars",
  } satisfies Shot,
  caption: "Offday, a time-off app for teams. Own project, 2026.",
};

export const results = [
  "Part of two platform rewrites.",
  "Three apps shipped to both app stores.",
  "One report asked the database 16 times. Now it asks 2.",
];

export const client: Row[] = [
  {
    id: "care",
    name: "Care-management platform",
    line: "Care teams follow patients' readings, care plans, lab results and bills.",
    result: "Most screens are already rebuilt in React. A screen moves over only after it passes the same tests in both apps.",
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
    plate: web(
      "/showcase/bayyinah/web-02.webp",
      "Bayyinah TV library, Subject tab: library tabs, search, filters and a row of course cards",
    ),
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
    plate: iphone(
      "/mobile/reading-1.webp",
      "Read to Feed store screenshot: My Books list with reading progress for The Tale of Peter Rabbit and Anne of Green Gables",
    ),
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
    plate: iphone(
      "/mobile/grocery-1.webp",
      "Viva Fresh store screenshot on iPhone: home with product categories and latest products, Albanian interface",
    ),
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
    plate: iphone(
      "/mobile/bookstore-1.webp",
      "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale",
    ),
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
    plate: web("/showcase/incentiv/web-01.webp", "Incentiv home page"),
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
    ),
  },
];

export const own: Row[] = [
  {
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
    ),
  },
  {
    id: "fjale",
    name: "FJALË",
    line: "A daily Albanian word game, checked against 21,000 words.",
    result: "Live on the web. It also works offline.",
    role: "Own project",
    years: "2026",
    links: [{ label: "Website", href: "https://xn--fjal-opa.com/" }],
    plate: web(
      "/personal/shots/fjale-desktop.webp",
      "FJALË word game board, five-letter grid with Albanian keyboard and hint panel",
    ),
  },
  {
    id: "za",
    name: "Za!",
    line: "A pizza card game for 2 to 8 players, live on the web.",
    result: "The server keeps every game fair. Computer players can join.",
    role: "Own project",
    years: "2026",
    links: [{ label: "Website", href: "https://za-game.onrender.com/" }],
    plate: web(
      "/personal/shots/za-desktop.webp",
      "Za! multiplayer card game lobby, pixel logo with new-table and join-table controls",
    ),
  },
  {
    id: "morse",
    name: "Morse Trainer",
    line: "A game that teaches Morse code, live on the web.",
    result: "Letters a player misses come back sooner.",
    role: "Own project",
    years: "2026",
    links: [{ label: "Website", href: "https://morse-code-amber.vercel.app/" }],
    plate: web(
      "/personal/shots/morse-desktop.webp",
      "Morse Trainer amber terminal, letter list and incoming signal in Learn mode",
    ),
  },
];
