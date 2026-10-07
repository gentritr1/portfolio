const DATE_RANGE = "/showcase/design-system/storybook-from-to.webp";

/** The address bar of a browser frame: a public address (`site`), or a neutral label for a private app. */
export interface Bar {
  label: string;
  site?: boolean;
  tone: "light" | "dark";
}

/** A whole screen: a desktop capture in a browser frame (`bar`), or a store-listing capture in a phone frame. */
export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
  bar?: Bar;
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

/** Desktop captures are 2880 x 1800 files of a 1440 x 900 screen. */
const desktop = (src: string, alt: string, bar: Bar): Shot => ({ src, width: 1440, height: 900, alt, bar });
const iphone = (src: string, alt: string): Shot => ({ src, width: 780, height: 1689, alt });

const CARE_BAR: Bar = { label: "Care platform · invented data", tone: "light" };

export const REAL_SCREENS = "Real product screens, invented data.";

/** The two client screens on the first screen: the care team calendar (web) and the Viva Fresh cart (phone). */
export const leadWeb = {
  shot: desktop(
    "/showcase/care-dashboard/appointments-week.webp",
    "Care team calendar for one week: calls, video calls and office visits for each patient, and a line at the current time. Invented data.",
    { label: "Care platform · real product screen, invented data", tone: "light" },
  ),
  name: "Care platform",
  /** The address bar on a phone, where the bar is narrow. */
  short: "Real product screen, invented data",
  slug: "care-platform",
};

export const leadPhone = {
  shot: iphone(
    "/mobile/grocery-3.webp",
    "Viva Fresh cart in Albanian: four products with quantities, the discount, and the total of 25.11 euro",
  ),
  name: "Viva Fresh",
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
      CARE_BAR,
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
      { label: "bayyinahtv.com", site: true, tone: "dark" },
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
      "Design System v2 in its Storybook: the list of components, and the From and To date pickers with June 2026 open.",
      { label: "Storybook · Design System v2", tone: "light" },
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
      { label: "portal.incentiv.io", site: true, tone: "dark" },
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
      { label: "OFFBEAT · concept site", tone: "dark" },
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
      { label: "FORM · concept site", tone: "dark" },
    ),
  },
];

export const offday: Row = {
  id: "offday",
  name: "Offday",
  line: "Time off for teams: requests, approvals and one shared calendar.",
  result: "About 200 tests, including ones that keep teams' data apart.",
  role: "Built with one other developer",
  years: "2026",
  note: "Private code. No public link.",
  links: [],
  plate: desktop(
    "/personal/shots/offday-light-shifts-desktop.webp",
    "Offday Shifts week grid with morning and evening shifts, two of them flagged Needs cover because the person is on leave",
    { label: "Offday · private app", tone: "light" },
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
    link: { label: "Website", href: "https://za-game.vercel.app/" },
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

/** Each screen's colours as a 4 x 4 grid of sRGB hex, top row first, sampled from the whole screen the frame shows.
 * They light the floor at night, so the page never fetches a screenshot only to sample it. */
export const screenColours: Record<string, string> = {
  "/showcase/care-dashboard/appointments-week.webp":
    "f7f8f9fafafaf4f7f8f4f6f8fdfdfdfbfafdfbfafdfcfcfdfefefefafbfcf5f8f7fbfbfcfefefef7f8faf5f7f9f9fafb",
  "/mobile/grocery-3.webp":
    "eeededeae6e6e7e7e7ebececd0c0b4e3dddce2e3e3ebecece9d9d1ece5e5e5e6e6edeeeef2c1c1f2b8b8d7a89dd9b6ac",
  "/showcase/care-dashboard/claims.webp":
    "f6f7f6f9f7f2fcfbf7fcfbf8fbfbfafcfbf8fcfcf9fefdfafbfbfcf6f7f8f9f8f9fafafbfdfdfef5f8f7fbfafaeff4f5",
  "/showcase/bayyinah/web-02.webp":
    "281e202b2125291f22311e1e261f222c25282a2326251e213c33331a272f4d3a364c3d3548393c1f1f215d4d4c413631",
  "/showcase/design-system/storybook-from-to.webp":
    "f8f8f8fafbfcfefefefffffff3f5f6f0f3f5fbfcfdfffffffefefefefefeffffffffffffffffffffffffffffffffffff",
  "/mobile/grocery-2.webp":
    "766c6096786aab867b968d7ec9dccdd0e3d4cee3d4cbddcff0ebebf0efefe8e8eaedeff0f5eeedf1ececeae0ddf1c9c6",
  "/mobile/reading-1.webp":
    "dae6e6b6d3d9a3c7d8bcd7e38ec0d25ca6c64a9fc872b4d3c0cdc7bdc8b9cdd3badbdec8e4c295e6b671fcc472fcd191",
  "/mobile/bookstore-2.webp":
    "f9f9f9f1f1f1f3f3f3faf2f2ddcab9eeebe6f8f8f8fefcfca5d3d9dbe2e2f1f0effbfbfba7a7a7d9d6d4f6f5f5fdfdfd",
  "/showcase/incentiv/web-03.webp":
    "1313131415141414141313132a2a282d2e2b20201e1a1a191e1f1d2b29252321201c1a191313121414141212121c1c1a",
  "/personal/shots/offbeat-studio-desktop.webp":
    "26201c2e281e1919140e0e0c191916242118575827393a1d25251b1a1b161415101818161313101d1d131c1c110e0e0c",
  "/personal/shots/form-studio-desktop.webp":
    "2624231c1a191b19181b19183b2f26423227222325212325392f27403125383c3f31373c211f1d1c1a192121211d1d1e",
  "/personal/shots/offday-light-shifts-desktop.webp":
    "f2f0f1f7f5f5fcfafbf7eff1f6f1f2f3f5f4f2f7f6f6f5f6f6f5f5f0f3f4edf4f7f4f4f4f5f2f3ecf2f2eaf4f4eeeff0",
};
