/** Plain case-page copy. Facts come from CONTENT.md, projects.ts and caseNarratives.ts. */
import { careShots, dsShots, REAL_SCREENS } from "../content/careShots";

/** A box in source pixels of a screenshot. */
export interface Px {
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
  /** A cleaner image for the enlarged view, when the source carries tool chrome. */
  full?: { src: string; width: number; height: number };
}

/** The address bar of a web plate: a public address (`site`), or a neutral label for a private app. */
export interface Bar {
  label: string;
  site?: boolean;
  tone: "light" | "dark";
}

/** One more screen of a web plate, shown in its carousel after the plate's own screen. */
export interface More extends Shot {
  name: string;
}

/**
 * A web plate is a whole desktop capture in a browser frame; a phone plate is the app's whole screen in a phone frame.
 * `stores`: the product's public links stand beside the plate. A plate that no part names stands after the parts, with no ring.
 * `name` and `more`: the plate is a carousel of screens; the ring stays on the first one.
 */
export type Plate =
  | ({ kind: "web"; bar: Bar; stores?: string; name?: string; more?: More[] } & Shot)
  | ({ kind: "phone"; stores?: string } & Shot)
  | {
      kind: "number";
      from?: string;
      to: string;
      unit: string;
      note: string;
      /** One mark under each numeral for each unit it counts. `from` and `to` are then whole numbers. */
      marks?: boolean;
      /** Two bars to scale: the whole before, and the part that is left now. */
      share?: Share;
    }
  | { kind: "flow"; steps: Step[]; back: Back };

export interface Share {
  before: string;
  now: string;
  /** The part of the before bar that is left, from 0 to 1. */
  part: number;
}

/** One step of a work loop. `person`: the step a person takes, not an agent. */
export interface Step {
  name: string;
  note: string;
  person?: boolean;
}

/** The way back in a work loop: a failed step returns the work to an earlier step. Both are indexes into `steps`. */
export interface Back {
  from: number;
  to: number;
  label: string;
}

/** The proving part of the plate. A box in a shot gets a ring. */
export type Target = { kind: "shot"; box: Px } | { kind: "figure" };

export interface Part {
  heading: "The product" | "What was built" | "How it is built" | "The result";
  text: string;
  /** The result line under the part's text. */
  proof: string;
  /** Index into `plates`. */
  plate: number;
  target: Target;
  /**
   * The phone layout: "plate" shows the part's plate under it; "stores" shows only the plate's links.
   * Omitted: the part shows no plate on a phone. The first part's plate is the phone hero, under the title.
   */
  narrow?: "plate" | "stores";
  /** Lines of one test that passed on the old app and on the new app, shown under the result line. */
  twin?: string[];
  /** The caption under `twin`: the screen and the date of the run. */
  twinNote?: string;
}

export interface Figure {
  value: string;
  to?: string;
  label: string;
}

export interface CaseCopy {
  title: string;
  sentence: string;
  /** Omitted: the role from projects.ts, the same words as the home page row. */
  role?: string;
  platforms: string;
  /** The project's own colour: the ground of the panel that the screens stand on. */
  stage: string;
  /** Shown in the facts row when the product has no public page. */
  privateNote?: string;
  plates: Plate[];
  captions: string[];
  parts: [Part, Part, Part, ...Part[]];
  /** Index of a number plate that stands at the head of "The numbers". */
  numbers?: number;
  figures?: Figure[];
  /** The "In short" list beside "The result": one fact on each line, for a reader who skims. */
  short: string[];
  builtWith: string;
  /** Detail for engineers, one fact for each item. */
  engineering?: string[];
}

const BOTH_STORES = "Live in both app stores";

const desktop = (src: string, alt: string): Shot => ({ src, alt, width: 1440, height: 900 });

const CARE_BAR: Bar = { label: "Care platform · invented data", tone: "light" };
const BAYYINAH_BAR: Bar = { label: "bayyinahtv.com", site: true, tone: "dark" };

/** A care dashboard screen. Its full alt and enlarged view come from careShots; the frame shows the whole capture. */
const shotOf = ({ src, alt, width, height, full }: Shot): Shot => ({ src, alt, width, height, full });
const care = (shot: Shot) => ({ kind: "web" as const, bar: CARE_BAR, ...shotOf(shot) });

const bayyinahLibrary = desktop(
  "/showcase/bayyinah/web-02.webp",
  "Bayyinah TV library: filters and a row of courses, one marked LIVE",
);

const bayyinahSeries = desktop(
  "/showcase/bayyinah/web-05.webp",
  "Bayyinah TV series page: the list of series at the side, and three episode cards of Moses 2, each with its title, length and date",
);

const bayyinahMore: More[] = [
  {
    name: "Home page",
    ...desktop(
      "/showcase/bayyinah/web-01.webp",
      "Bayyinah TV home page: Quran Studies Made Simple, the free trial and Watch Now buttons, and the app on a laptop, a tablet and a phone",
    ),
  },
  {
    name: "Arabic",
    ...desktop(
      "/showcase/bayyinah/web-03.webp",
      "Bayyinah TV library, Arabic tab: courses to learn to read the Quran, and the Dream Arabic programme",
    ),
  },
  {
    name: "Stories",
    ...desktop("/showcase/bayyinah/web-04.webp", "Bayyinah TV library, Stories tab: a row of story series"),
  },
  {
    name: "Pricing",
    ...desktop(
      "/showcase/bayyinah/web-06.webp",
      "Bayyinah TV pricing page: a monthly or an annual plan, and what the Premium plan includes",
    ),
  },
];

const incentivSignIn = desktop(
  "/showcase/incentiv/web-03.webp",
  "Incentiv portal sign-in: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect options",
);

const phone = (src: string, alt: string): { kind: "phone" } & Shot => ({ kind: "phone", src, alt, width: 780, height: 1689 });


/** In the order of the home page rows, so "Next project" walks the same list. */
export const caseCopy: Record<string, CaseCopy> = {
  "care-platform": {
    title: "Rebuilding a live care platform, one tested screen at a time.",
    sentence:
      "Care teams in many client organizations use this platform to follow patients at home. Each organization sees only its own patients.",
    platforms: "Web and mobile, and the server behind them",
    stage: "#e2e7f0",
    privateNote: `Private app. ${REAL_SCREENS}`,
    plates: [
      { kind: "number", from: "16", to: "2", unit: "Database requests", note: "One billing report, before and after", marks: true },
      care(careShots.glucose),
      care(careShots.claims),
      care(careShots.week),
      {
        kind: "flow",
        steps: [
          { name: "Old app", note: "Shows how it works" },
          { name: "Test first", note: "Written on the old app" },
          { name: "Agents build", note: "Inside fixed rules" },
          { name: "Checks", note: "Automatic, must pass" },
          { name: "Person approves", note: "Then it is added", person: true },
        ],
        back: { from: 3, to: 2, label: "A check fails? Back to the agents." },
      },
    ],
    captions: [
      "Database requests for one billing report, before and after.",
      `Glucose overview for one patient. ${REAL_SCREENS}`,
      `Claims for one month. ${REAL_SCREENS}`,
      `Care team calendar for one week. ${REAL_SCREENS}`,
      "How a change gets into the new app.",
    ],
    parts: [
      {
        heading: "The result",
        text: "The web app is being rebuilt one screen at a time. Care teams keep using the old app until the new one is ready. The new app is not live yet.",
        proof: "A screen moves over only after it passes the same tests in both apps.",
        plate: 3,
        target: { kind: "figure" },
        narrow: "plate",
        twin: ["A patient's name opens that patient", "The search stays when the tab changes", "A search with no match says so"],
        twinNote: "The same test passed on both apps. Patient compliance list, September 2026.",
      },
      {
        heading: "The product",
        text: "Care teams follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. The whole app works in English, German, Spanish and Turkish.",
        proof: "Vitals from connected devices, for each patient.",
        plate: 1,
        target: { kind: "shot", box: { x: 716, y: 156, w: 110, h: 68 } },
        narrow: "plate",
      },
      {
        heading: "What was built",
        text: "From 2023 the team built the frontend of the patient profile, care plans, labs and vitals, claims, calls and chat. Since 2026 it is rebuilding the web app one screen at a time. On the server, a patient sign-up can now be saved half done, a list of lab tests was added, and the billing report was fixed.",
        proof: "Claims that need another look are flagged.",
        plate: 2,
        target: { kind: "shot", box: { x: 676, y: 500, w: 308, h: 40 } },
        narrow: "plate",
      },
      {
        heading: "How it is built",
        text: "The team wrote the rules and the checks. AI agents build inside them, and a person on the team approves each change. Old bugs are written down, not copied.",
        proof: "A check is trusted only after it is shown to fail.",
        plate: 4,
        target: { kind: "figure" },
        narrow: "plate",
      },
    ],
    numbers: 0,
    figures: [
      { value: "4", label: "Languages: English, German, Spanish, Turkish" },
      { value: "36", label: "Shared building blocks underneath" },
    ],
    short: [
      "Care teams follow patients at home",
      "Each organization sees only its own patients",
      "Vitals, care plans, labs, claims, calls and chat",
      "English, German, Spanish and Turkish",
      "New screens use 36 shared building blocks",
      "Each screen must pass the same tests in both apps",
      "AI agents build; a person approves each change",
      "One billing report: 16 database requests, now 2",
    ],
    builtWith:
      "React 19, TypeScript, TanStack Query and Router, Zustand, Zod, Tailwind, Vitest, Playwright. Before the rewrite: Vue and Nuxt 2. Server: Laravel 13, PHP 8.3, MySQL, Redis, Pest. Services: Twilio, Chime, Pusher, ECharts.",
    engineering: [
      "One Playwright spec for each route is written against the pinned legacy app. The same spec must then pass on both apps.",
      "Each route keeps a deviations register: every departure from legacy, with its evidence and an approval.",
      "Two stable CI jobs. Each gate has a negative control that proves it can fail.",
      "Server state in TanStack Query, client state in Zustand, filters and tabs in the URL. Zod schemas from captured responses parse every API response.",
      "Features never import sibling features. A dependency-graph check enforces it.",
      "Agents work through repository skills, one for each stage, with a fresh reviewer for each round. A rule changes only through a decision record.",
    ],
  },

  "bayyinah-tv": {
    title: "Members subscribe on the web, iPhone or Android.",
    sentence:
      "Bayyinah TV is a video-learning platform for an online community: courses, a scripture reader, videos and live classes.",
    platforms: "Web, and inside the iPhone and Android apps",
    stage: "#47262d",
    plates: [
      { kind: "web", bar: BAYYINAH_BAR, ...bayyinahLibrary, name: "Library", more: bayyinahMore },
      { kind: "web", bar: BAYYINAH_BAR, ...bayyinahSeries, stores: "Live on the web and in both app stores" },
    ],
    captions: ["Bayyinah TV, public pages.", "Bayyinah TV series page, public page, and the product's public links."],
    parts: [
      {
        heading: "The product",
        text: "Members follow courses and playlists, keep their learning progress, read scripture and watch videos. The iPhone and Android apps run the same web app. The whole site also works in Arabic, read from right to left.",
        proof: "Courses, video series and live classes in one library.",
        plate: 0,
        target: { kind: "shot", box: { x: 714, y: 592, w: 54, h: 36 } },
        narrow: "plate",
      },
      {
        heading: "What was built",
        text: "The second version is a new app, built from nothing: 34 pages. Each series page lists its episodes, with the length and the date of each one. The new app also added live classes, with a live chat that moderators control.",
        proof: "Each series page lists its episodes.",
        plate: 1,
        target: { kind: "shot", box: { x: 356, y: 560, w: 314, h: 262 } },
        narrow: "plate",
      },
      {
        heading: "The result",
        text: "Bayyinah TV is live at bayyinahtv.com. Members pay by subscription, gift or promo code, on the web or in the apps.",
        proof: "Live on the web, in the App Store and on Google Play.",
        plate: 1,
        target: { kind: "figure" },
        narrow: "stores",
      },
    ],
    figures: [
      { value: "34", label: "Pages in the new app, built from nothing" },
      { value: "270+", label: "Reusable screen parts" },
      { value: "2", label: "Languages, with Arabic read right to left" },
    ],
    short: [
      "Courses, videos and live classes in one library",
      "A scripture reader inside the site",
      "The second version was built from nothing",
      "Live classes with a chat that moderators control",
      "English, and Arabic read from right to left",
      "Members pay by subscription, gift or promo code",
      "The iPhone and Android apps run the same web app",
    ],
    builtWith:
      "Nuxt 3, Vue 3, TypeScript, Pinia, video.js with HLS, AWS IVS, Pusher, Stripe, Firebase, Tailwind. 34 pages, 270+ components, 25 Pinia stores.",
  },

  "read-to-feed": {
    title: "The app remembers the page in every book.",
    sentence: "Read to Feed is a reading app for children on iPhone and Android, where books open inside the app.",
    platforms: "iPhone, Android",
    stage: "#d9eaf6",
    plates: [
      phone(
        "/mobile/reading-1.webp",
        "Read to Feed's My Books screen from its store listing: The Tale of Peter Rabbit read to 36%, Anne of Green Gables read to 90%, and the next books in each series",
      ),
      phone(
        "/mobile/reading-2.webp",
        "Read to Feed's achievements from its store listing: eggs collected, eggs provided and quiz badges",
      ),
    ],
    captions: ["My Books, from the store listing.", "Achievements, from the store listing."],
    parts: [
      {
        heading: "The product",
        text: "Children read books inside the app, scan their own books by the barcode, take quizzes that run like a chat, and earn badges and streaks. Parents confirm each account by email.",
        proof: "Each book keeps the page the child reached.",
        plate: 0,
        target: { kind: "shot", box: { x: 118, y: 710, w: 544, h: 214 } },
        narrow: "plate",
      },
      {
        heading: "What was built",
        text: "Books open inside the app, in two e-book formats. The camera reads a book's barcode. Badges, streaks, quizzes and short tips reward reading. A notification opens the right book, and the app works in three languages.",
        proof: "Reading earns badges and streaks.",
        plate: 1,
        target: { kind: "shot", box: { x: 108, y: 734, w: 568, h: 264 } },
        narrow: "plate",
      },
      {
        heading: "The result",
        text: "The app was kept current through three major upgrades. The store listings are now removed, so the links open archived copies of both pages.",
        proof: "About 14 updates, shipped to both app stores.",
        plate: 1,
        target: { kind: "figure" },
      },
    ],
    figures: [
      { value: "≈14", label: "Updates shipped to both app stores" },
      { value: "3", label: "Major upgrades, kept current" },
      { value: "3", label: "Languages" },
    ],
    short: [
      "Children read books inside the app",
      "Each book keeps the page the child reached",
      "The camera reads a book's barcode",
      "Badges, streaks and quizzes reward reading",
      "Parents confirm each account by email",
      "Three languages",
      "About 14 updates to both app stores",
      "Kept current through three major upgrades",
    ],
    builtWith:
      "React Native (0.63 to 0.81), React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next. Maintained forks of epubjs-react-native and react-native-pdf.",
  },

  "viva-fresh": {
    title: "Grocery orders with a delivery time, on iPhone and Android.",
    sentence: "Viva Fresh is a grocery shopping and loyalty app for iPhone and Android, built once for both.",
    platforms: "iPhone, Android",
    stage: "#f4e1de",
    plates: [
      {
        ...phone(
          "/mobile/grocery-3.webp",
          "Viva Fresh cart from the App Store listing: quantities, the discount and the total",
        ),
        stores: BOTH_STORES,
      },
      phone(
        "/mobile/grocery-2.webp",
        "Viva Fresh Fresh category from the App Store listing: a grid of products with prices and cart buttons",
      ),
    ],
    captions: ["The cart, from the App Store listing.", "A product category, from the App Store listing."],
    parts: [
      {
        heading: "The product",
        text: "Shoppers browse product categories, fill a cart, choose a delivery time and check out. A loyalty programme and a wishlist keep the products they want for later.",
        proof: "The cart shows the quantities, the discount and the total.",
        plate: 0,
        target: { kind: "figure" },
        narrow: "plate",
      },
      {
        heading: "What was built",
        text: "One app, built once for iPhone and Android: the category pages, the cart and the checkout, and an address search on a map.",
        proof: "Category pages show product grids.",
        plate: 1,
        target: { kind: "shot", box: { x: 106, y: 930, w: 276, h: 392 } },
        narrow: "plate",
      },
      {
        heading: "The result",
        text: "The app is in both app stores today, in Albanian.",
        proof: "Live in the App Store and on Google Play.",
        plate: 0,
        target: { kind: "figure" },
        narrow: "stores",
      },
    ],
    short: [
      "Grocery orders with a delivery time",
      "Product categories, a cart and a checkout",
      "Address search on a map",
      "A loyalty programme and a wishlist",
      "One app, built once for iPhone and Android",
      "In Albanian, live in both app stores",
    ],
    builtWith: "React Native, Redux Toolkit, Maps, Firebase.",
  },

  "dukagjini-bookstore": {
    title: "Readers find a book, keep a list and check out with a promo code.",
    sentence: "Dukagjini Bookstore is a publisher's bookshop app for readers on iPhone and Android.",
    platforms: "iPhone, Android",
    stage: "#dcedea",
    plates: [
      {
        ...phone(
          "/mobile/bookstore-2.webp",
          "Dukagjini Bookstore foreign books from the App Store listing: ratings, prices and favourites",
        ),
        stores: BOTH_STORES,
      },
      phone(
        "/mobile/bookstore-1.webp",
        "Dukagjini Bookstore home from the App Store listing: the store header and book search",
      ),
    ],
    captions: ["Foreign books, from the App Store listing.", "Home, from the App Store listing."],
    parts: [
      {
        heading: "The product",
        text: "Readers search the catalogue, browse top categories and books on sale, keep favourite lists and pay with promo codes at checkout.",
        proof: "Book lists show ratings, prices and favourites.",
        plate: 0,
        target: { kind: "shot", box: { x: 128, y: 996, w: 528, h: 226 } },
        narrow: "plate",
      },
      {
        heading: "What was built",
        text: "One app, built once for iPhone and Android. A notification opens the right book. The book page header moves as the page scrolls, and pop-up panels close with a swipe.",
        proof: "Readers search the whole catalogue.",
        plate: 1,
        target: { kind: "shot", box: { x: 155, y: 1145, w: 470, h: 60 } },
        narrow: "plate",
      },
      {
        heading: "The result",
        text: "The app is in both app stores today.",
        proof: "Live in the App Store and on Google Play.",
        plate: 0,
        target: { kind: "figure" },
        narrow: "stores",
      },
    ],
    short: [
      "A publisher's bookshop for iPhone and Android",
      "Search the whole catalogue",
      "Top categories and books on sale",
      "Favourite lists, and promo codes at checkout",
      "A notification opens the right book",
      "Pop-up panels close with a swipe",
      "Live in both app stores",
    ],
    builtWith: "React Native, Redux, Firebase Messaging.",
  },

  "design-system-react": {
    title: "36 building blocks, released 20 times in about six weeks.",
    sentence:
      "Design System v2 is the shared set of buttons, menus and forms that the team built for the new dashboard of a care platform. A colour changes in one place, and the code and the Figma file follow.",
    platforms: "A library of screen parts, for code and for Figma",
    stage: "#e7e5f3",
    privateNote: `Not public. ${REAL_SCREENS}`,
    plates: [
      { kind: "web", bar: { label: "Storybook · Design System v2", tone: "light" }, ...shotOf(dsShots.storybook) },
      {
        kind: "number",
        to: "96.6%",
        unit: "Less JavaScript",
        note: "For a page that uses only a button",
        share: { before: "Before: one bundle for the whole library", now: "Now: only the button, 3.4% of the old size", part: 0.034 },
      },
      care(careShots.overview),
      {
        kind: "flow",
        steps: [
          { name: "Research", note: "Five leading systems" },
          { name: "Guides", note: "Written for agents" },
          { name: "Agents build", note: "Inside the guides" },
          { name: "Checks", note: "Automatic, must pass" },
          { name: "Person approves", note: "Then it is added", person: true },
        ],
        back: { from: 3, to: 2, label: "A check fails? Back to the agents." },
      },
    ],
    captions: [
      `Date pickers, from the Storybook. ${REAL_SCREENS}`,
      "Less JavaScript for a page that uses only a button.",
      `The care dashboard that uses it. ${REAL_SCREENS}`,
      "How a change gets into the library.",
    ],
    parts: [
      {
        heading: "The product",
        text: "Colours, sizes and type are set once, for code and for Figma. 805 shared style values sit in three levels. They set the look of every building block, from buttons and alerts to date pickers and pop-up messages.",
        proof: "From buttons to date range pickers, ready for every screen.",
        plate: 0,
        target: { kind: "shot", box: { x: 298, y: 54, w: 564, h: 362 } },
        narrow: "plate",
      },
      {
        heading: "What was built",
        text: "Each building block loads on its own. A page loads only the blocks it uses.",
        proof: "The rest of the library stays out of the page.",
        plate: 1,
        target: { kind: "figure" },
        narrow: "plate",
      },
      {
        heading: "How it is built",
        text: "Research into five leading design systems became written guides for AI agents. The agents build to the guides, automatic checks decide, and a person on the team approves each change.",
        proof: "No guide can overrule a failed check.",
        plate: 3,
        target: { kind: "figure" },
        narrow: "plate",
      },
      {
        heading: "The result",
        text: "Each building block meets the WCAG 2.1 AA accessibility floor. An automatic check proves it on a rendered screen. The care dashboard that uses it is not live yet.",
        proof: "The new care dashboard uses it on its screens.",
        plate: 2,
        target: { kind: "figure" },
        narrow: "plate",
      },
    ],
    figures: [
      { value: "36", label: "Building blocks" },
      { value: "805", label: "Shared style values, in three levels" },
      { value: "20", label: "Releases in about six weeks" },
    ],
    short: [
      "36 building blocks, from buttons to date pickers",
      "Colours and type set once, for code and Figma",
      "805 shared style values, in three levels",
      "A page loads only the blocks it uses",
      "Built to the WCAG 2.1 AA accessibility floor",
      "Checks decide; a person approves each change",
      "20 releases in about six weeks",
      "Used by the new care dashboard, not live yet",
    ],
    builtWith:
      "React 19, TypeScript, CSS Modules, Storybook 10, DTCG tokens, Style Dictionary, Playwright, axe, Changesets. 805 tokens in three tiers: core, semantic, component.",
    engineering: [
      "Order of authority: the best-practices guide and accepted decision records are the spec. Research is the evidence. Skills only advise. Executable gates decide.",
      "One machine-read contract binds every agent skill to its role and its rules.",
      "Research: a benchmark of Material, Carbon, Polaris, Atlassian and Primer, a token taxonomy, a testing strategy, governance, health metrics, a maturity scorecard and an audit of the old frontend.",
      "New evidence changes the spec only through a decision record.",
    ],
  },

  incentiv: {
    title: "Sign in with a passkey (no\u00a0password) or an existing wallet.",
    sentence:
      "Incentiv's portal is a dashboard. People and businesses see their wallet balance and their rewards there.",
    role: "Frontend",
    platforms: "Web",
    stage: "#17181c",
    plates: [{ kind: "web", bar: { label: "portal.incentiv.io", site: true, tone: "dark" }, ...incentivSignIn }],
    captions: ["Incentiv portal sign-in, public screen."],
    parts: [
      {
        heading: "The product",
        text: "People and businesses sign in, then see balances, assets, fees saved and transactions in dashboard cards. In the portal, only the sign-in screen is public.",
        proof: "Three ways in: a passkey, MetaMask or WalletConnect.",
        plate: 0,
        target: { kind: "shot", box: { x: 201, y: 495, w: 149, h: 50 } },
        narrow: "plate",
      },
      {
        heading: "What was built",
        text: "The portal frontend: the sign-in, a first-run tour, the dashboard cards, a list of assets and a balance pop-up with a QR code. Teammates built the wallet itself and its link to the blockchain.",
        proof: "Built the screens; teammates built the wallet.",
        plate: 0,
        target: { kind: "figure" },
      },
      {
        heading: "The result",
        text: "The portal frontend was built in 2024, in English and French. The dashboard pages stay private, behind sign-in.",
        proof: "The sign-in screen is public at portal.incentiv.io.",
        plate: 0,
        target: { kind: "figure" },
      },
    ],
    short: [
      "A wallet dashboard for people and businesses",
      "Sign in with a passkey, MetaMask or WalletConnect",
      "A first-run tour and dashboard cards",
      "Assets, and a balance pop-up with a QR code",
      "English and French",
      "Portal screens only; teammates built the wallet",
      "Built in 2024; the sign-in screen is public",
    ],
    builtWith:
      "Next.js 14 with the App Router, React 18, TypeScript, Redux Toolkit and RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts.",
  },
};

/** The case after this one, in the home page order. */
export function nextSlug(slug: string) {
  const order = Object.keys(caseCopy);
  return order[(order.indexOf(slug) + 1) % order.length];
}
