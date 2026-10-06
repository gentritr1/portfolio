/** A box in source pixels of one image file. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One image file and the part of it that a pane shows. */
export interface Pane {
  src: string;
  width: number;
  height: number;
  crop: Box;
}

/** One state of the stage: one web screen, or two phone screens side by side. */
export interface Screen {
  /** Short name for the switch under the stage. */
  tab: string;
  /** Caption line 1: what the screen shows. */
  title: string;
  alt: string;
  /** The page's own colour, behind the image while it decodes. */
  ground: string;
  /** Desktop stage, 3:2. One web pane, or two phone panes at 3:5 each. */
  panes: Pane[];
  /** Phone panel, 4:3. One pane, cropped to the part whose text stays readable. */
  narrow: Pane;
  narrowTitle?: string;
  narrowAlt?: string;
}

export interface Line {
  id: string;
  name: string;
  /** What it is, 4 to 9 plain words. */
  line: string;
  /** Caption line 2: name, years, platforms. */
  meta: string;
  /** A label that must stay beside the screen. */
  note?: string;
  href?: string;
  external?: boolean;
  linkLabel?: string;
  screens: Screen[];
}

const WEB = { width: 2880, height: 1800 };
const PHONE = { width: 780, height: 1689 };
const STORYBOOK = { width: 1440, height: 1192 };

const web = (src: string, crop: Box): Pane => ({ src, ...WEB, crop });
const phone = (src: string, crop: Box): Pane => ({ src, ...PHONE, crop });

const WEEK = "/showcase/care-dashboard/appointments-week.webp";
const CLAIMS = "/showcase/care-dashboard/claims.webp";
const OVERVIEW = "/showcase/care-dashboard/overview.webp";
const DS = "/showcase/design-system/button-alert.webp";
const INVENTED = "Real product screens, invented data.";

export const client: Line[] = [
  {
    id: "care",
    name: "Care platform",
    line: "Rebuilt screen by screen while care teams use it",
    meta: "Care platform · 2023–26",
    note: INVENTED,
    href: "/work/care-platform",
    screens: [
      {
        tab: "Calendar",
        title: "Care team calendar: one week of calls, video calls and visits.",
        alt: "Care team calendar for one week, Sunday to Thursday, 8 AM to 2 PM: calls, video calls and office visits with times, and a red line at the current time. Invented data.",
        ground: "#f5f7fb",
        panes: [web(WEEK, { x: 492, y: 420, w: 1728, h: 1152 })],
        narrow: web(WEEK, { x: 943, y: 444, w: 958, h: 718 }),
        narrowAlt:
          "Care team calendar, Monday to Wednesday from 8 AM: wound checks, lung function tests, a medication review and other calls and visits. Invented data.",
      },
      {
        tab: "Claims",
        title: "Claims for one month. Rebuilt with AI agents; a person approves each change.",
        alt: "Claims for one month: counts of draft and approved claims, filters for updated claims and claims that need attention, and each claim with its patient, program, CPT codes, date and status. Invented data.",
        ground: "#f5f7fb",
        panes: [web(CLAIMS, { x: 492, y: 564, w: 1584, h: 1056 })],
        narrow: web(CLAIMS, { x: 533, y: 1080, w: 960, h: 720 }),
        narrowAlt: "Four claims, each with its patient, program and CPT codes. Invented data.",
      },
    ],
  },
  {
    id: "bayyinah",
    name: "Bayyinah TV",
    line: "Video lessons, live classes and memberships",
    meta: "Bayyinah TV · 2023–26 · Web, iPhone and Android",
    href: "/work/bayyinah-tv",
    screens: [
      {
        tab: "Library",
        title: "The course library, with a class that is live now.",
        alt: "Bayyinah TV library: search, filters and a row of courses: Remarkable Stories, From Jerusalem to Makkah, and Ramadan LIVE 2026 with a LIVE badge",
        ground: "#251e21",
        panes: [web("/showcase/bayyinah/web-02.webp", { x: 180, y: 554, w: 1824, h: 1217 })],
        narrow: web("/showcase/bayyinah/web-02.webp", { x: 823, y: 912, w: 1171, h: 878 }),
      },
      {
        tab: "Series",
        title: "A series page: what it is about, then each episode.",
        alt: "Bayyinah TV series page: Moses 2, Adventures of Young Moses (Part 2), its summary and three episode cards with length and date",
        ground: "#251e21",
        panes: [web("/showcase/bayyinah/web-05.webp", { x: 684, y: 360, w: 1980, h: 1320 })],
        narrow: web("/showcase/bayyinah/web-05.webp", { x: 708, y: 360, w: 1296, h: 972 }),
      },
    ],
  },
  {
    id: "design-system",
    name: "Design System v2",
    line: "36 building blocks, 20 releases in about six weeks",
    meta: "Design System v2 · 2026",
    note: INVENTED,
    href: "/work/design-system-react",
    screens: [
      {
        tab: "Blocks",
        title: "Buttons and alerts, as the system shows them to the team.",
        alt: "Design System v2 in its Storybook: buttons in four styles, buttons with icons, and alerts for a note, information, success and a warning. Invented data.",
        ground: "#ffffff",
        panes: [{ src: DS, ...STORYBOOK, crop: { x: 18, y: 30, w: 1404, h: 936 } }],
        narrow: { src: DS, ...STORYBOOK, crop: { x: 24, y: 276, w: 840, h: 630 } },
        narrowAlt: "Design System v2 alerts: a note, information, success and a warning. Invented data.",
      },
      {
        tab: "In use",
        title: "The care dashboard, built from those blocks.",
        alt: "Care team dashboard: 24 patients by program, engagement by calls and text messages, and patients for each provider. Invented data.",
        ground: "#f5f7fb",
        panes: [web(OVERVIEW, { x: 480, y: 209, w: 2388, h: 1591 })],
        narrow: web(OVERVIEW, { x: 492, y: 408, w: 1164, h: 874 }),
        narrowAlt: "Total patients ring: 24 patients, split into RPM, CCM and RTM programs. Invented data.",
      },
    ],
  },
  {
    id: "viva-fresh",
    name: "Viva Fresh",
    line: "One grocery app, live in both app stores",
    meta: "Viva Fresh · 2023 · App Store and Google Play",
    href: "/work/viva-fresh",
    screens: [
      {
        tab: "Cart",
        title: "The cart with amounts and the total, then a shelf of fresh food.",
        narrowTitle: "The cart: each item, its price and its amount.",
        alt: "Viva Fresh in Albanian: the cart with four items, their prices and amounts, and the checkout button with a total of 25.11 euro; beside it the Fresh aisle with products, prices and cart buttons",
        narrowAlt: "Viva Fresh cart in Albanian: two items with prices and amount buttons",
        ground: "#f4f4f4",
        panes: [
          phone("/mobile/grocery-3.webp", { x: 90, y: 457, w: 600, h: 999 }),
          phone("/mobile/grocery-2.webp", { x: 90, y: 654, w: 600, h: 999 }),
        ],
        narrow: phone("/mobile/grocery-3.webp", { x: 90, y: 380, w: 600, h: 450 }),
      },
    ],
  },
  {
    id: "read-to-feed",
    name: "Read to Feed",
    line: "Children read books; the app keeps their page",
    meta: "Read to Feed · 2022–25 · iPhone and Android",
    href: "/work/read-to-feed",
    screens: [
      {
        tab: "Reader",
        title: "The book reader, then a child's shelf with how far each book is read.",
        narrowTitle: "The book reader, chapter 1.",
        alt: "Read to Feed: a chapter of The Tale of Peter Rabbit in the reader with a Keep Reading card; beside it My Books with reading progress of 36 and 90 percent",
        narrowAlt: "Read to Feed reader: chapter 1 of The Tale of Peter Rabbit",
        ground: "#ffffff",
        panes: [
          phone("/mobile/reading-3.webp", { x: 80, y: 464, w: 619, h: 1032 }),
          phone("/mobile/reading-1.webp", { x: 80, y: 640, w: 619, h: 1032 }),
        ],
        narrow: phone("/mobile/reading-3.webp", { x: 80, y: 464, w: 619, h: 464 }),
      },
    ],
  },
  {
    id: "dukagjini",
    name: "Dukagjini Bookstore",
    line: "A book shop; each alert opens the right book",
    meta: "Dukagjini Bookstore · 2021–22 · iPhone and Android",
    href: "/work/dukagjini-bookstore",
    screens: [
      {
        tab: "Books",
        title: "Foreign books with ratings and prices, then the shop's home.",
        narrowTitle: "Foreign books with ratings and prices.",
        alt: "Dukagjini Bookstore: a list of foreign books with star ratings, authors, prices and favourites; beside it the home screen with search, top categories and books on sale",
        narrowAlt: "Dukagjini Bookstore: search, then Educated by Tara Westover with three stars and its price",
        ground: "#ffffff",
        panes: [
          phone("/mobile/bookstore-2.webp", { x: 115, y: 732, w: 574, h: 957 }),
          phone("/mobile/bookstore-1.webp", { x: 115, y: 732, w: 574, h: 957 }),
        ],
        narrow: phone("/mobile/bookstore-2.webp", { x: 115, y: 830, w: 574, h: 431 }),
      },
    ],
  },
  {
    id: "incentiv",
    name: "Incentiv",
    line: "Sign in with a passkey, no password",
    meta: "Incentiv · 2024",
    note: "Built the screens; teammates built the wallet.",
    href: "/work/incentiv",
    screens: [
      {
        tab: "Sign-in",
        title: "The sign-in screen: a passkey or a wallet, no password.",
        alt: "Incentiv portal sign-in: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect, beside the dashboard's Welcome Back screen",
        ground: "#1b1b1a",
        panes: [web("/showcase/incentiv/web-03.webp", { x: 336, y: 168, w: 2208, h: 1472 })],
        narrow: web("/showcase/incentiv/web-03.webp", { x: 360, y: 540, w: 1152, h: 864 }),
        narrowAlt: "Incentiv sign-in: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect",
      },
    ],
  },
];

export const own: Line[] = [
  {
    id: "offday",
    name: "Offday",
    line: "Time off and shifts for a whole team",
    meta: "Own project · 2026 · Private code, no public link",
    screens: [
      {
        tab: "Shifts",
        title: "Shifts for one week. Two of them need cover.",
        alt: "Offday Shifts week grid with morning and evening shifts, two of them flagged Needs cover because the person is on leave",
        ground: "#f7f6f6",
        panes: [web("/personal/shots/offday-light-shifts-desktop.webp", { x: 533, y: 468, w: 1584, h: 1056 })],
        narrow: web("/personal/shots/offday-light-shifts-desktop.webp", { x: 533, y: 612, w: 1152, h: 864 }),
      },
    ],
  },
  {
    id: "offbeat",
    name: "OFFBEAT",
    line: "A drum machine that plays in the browser",
    meta: "Own project · 2026 · Code on GitHub",
    href: "https://github.com/gentritr1/offbeat",
    external: true,
    linkLabel: "OFFBEAT code on GitHub",
    screens: [
      {
        tab: "Studio",
        title: "The drum machine while it plays: eight steps, four sounds.",
        alt: "OFFBEAT step sequencer: Kick, Snare, Hi-hat and Bass over eight steps, step 5 playing, with tempo, volume and swing controls",
        ground: "#121210",
        panes: [web("/personal/shots/offbeat-studio-desktop.webp", { x: 1188, y: 96, w: 1560, h: 1040 })],
        narrow: web("/personal/shots/offbeat-studio-desktop.webp", { x: 1212, y: 96, w: 1488, h: 1116 }),
      },
    ],
  },
  {
    id: "form",
    name: "FORM",
    line: "Three sculptures, drawn live in the browser",
    meta: "Own project · 2026 · Code on GitHub",
    href: "https://github.com/gentritr1/form",
    external: true,
    linkLabel: "FORM code on GitHub",
    screens: [
      {
        tab: "Studio",
        title: "The collection: a copper knot and a chrome ring, drawn live.",
        alt: "FORM collection page: a copper trefoil knot and a chrome ring, each with its formula and an Open in viewer link",
        ground: "#1b1918",
        panes: [web("/personal/shots/form-studio-desktop.webp", { x: 96, y: 5, w: 2688, h: 1792 })],
        narrow: web("/personal/shots/form-studio-desktop.webp", { x: 103, y: 413, w: 1416, h: 1061 }),
        narrowAlt: "FORM: the copper trefoil knot",
      },
    ],
  },
];

export const lines = [...client, ...own];
