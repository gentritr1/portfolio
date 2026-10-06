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
  /** The part a wide screen shows. It is never shown above its source pixels. */
  crop: Px;
  /** The page's own colour, behind the shot while it loads. */
  ground: string;
}

export type LiveKey = "wallet";

/**
 * A shot plate may carry the product's public links beside the shot. The value is the panel title.
 * A plate that no part names stands after the parts, with no ring; `narrow` is its phone crop.
 */
export type Plate =
  | ({ kind: "web" | "phone"; stores?: string; narrow?: Px; narrowAlt?: string } & Shot)
  | { kind: "live"; key: LiveKey }
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
export type Target = { kind: "shot"; box: Px } | { kind: "selector"; css: string; round?: boolean } | { kind: "figure" };

export interface Part {
  heading: "The product" | "What was built" | "How it is built" | "The result";
  text: string;
  /** The result line under the part's text. */
  proof: string;
  /** Index into `plates`. */
  plate: number;
  target: Target;
  /**
   * The crop the phone layout shows under this part. "stores": only the plate's link panel.
   * Omitted: the part shows no plate on a phone. The first part's plate is the phone hero, under the title.
   */
  narrow?: Px | "live" | "number" | "flow" | "stores";
  /** What the phone crop shows, when it is a different part of the shot. */
  narrowAlt?: string;
  /** Lines of one test that passed on the old app and on the new app, shown under the result line. */
  twin?: string[];
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
  /** Shown in the facts row when the product has no public page. */
  privateNote?: string;
  plates: Plate[];
  captions: string[];
  parts: [Part, Part, Part, ...Part[]];
  figures?: Figure[];
  builtWith: string;
  /** Detail for engineers, one fact for each item. */
  engineering?: string[];
}

const RECREATION = "Recreation · invented data.";
const BOTH_STORES = "Live in both app stores";

/* Wide crops stay at 1:1 or close, so the screen's own text stays readable. */

const bayyinahPricing: Shot = {
  src: "/showcase/bayyinah/web-06.webp",
  alt: "Bayyinah TV pricing: the Premium plan with its monthly price, a monthly or annual switch, a tick for each feature, and its Start 7-Day Free Trial button",
  width: 1440,
  height: 900,
  crop: { x: 508, y: 104, w: 904, h: 624 },
  ground: "#1f1518",
};

const bayyinahLibrary: Shot = {
  src: "/showcase/bayyinah/web-02.webp",
  alt: "Bayyinah TV library: filters and a row of courses, one marked LIVE",
  width: 1440,
  height: 900,
  crop: { x: 84, y: 356, w: 922, h: 540 },
  ground: "#251e21",
};

const bayyinahPlans: Px = { x: 24, y: 104, w: 400, h: 496 };
const bayyinahPlansAlt =
  "Bayyinah TV pricing page: Choose Your Plan, and a promise to watch anytime, anywhere, on mobile, tablet or desktop";

const bayyinahSeries: Shot = {
  src: "/showcase/bayyinah/web-05.webp",
  alt: "Bayyinah TV series page: Moses 2, Adventures of Young Moses (Part 2), its summary and three episode cards",
  width: 1440,
  height: 900,
  crop: { x: 344, y: 168, w: 1000, h: 670 },
  ground: "#251e21",
};

const incentivSignIn: Shot = {
  src: "/showcase/incentiv/web-03.webp",
  alt: "Incentiv portal sign-in: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect options",
  width: 1440,
  height: 900,
  crop: { x: 176, y: 262, w: 560, h: 400 },
  ground: "#262624",
};


const phone = (src: string, alt: string, crop: Px): { kind: "phone" } & Shot => ({
  kind: "phone",
  src,
  alt,
  width: 780,
  height: 1689,
  crop,
  ground: "#ffffff",
});


/** In the order of the home page rows, so "Next project" walks the same list. */
export const caseCopy: Record<string, CaseCopy> = {
  "care-platform": {
    title: "One billing report used to give up. Now it finishes.",
    sentence:
      "Care teams in many client organizations use this platform to follow patients at home. Each organization sees only its own patients.",
    platforms: "Web and mobile, and the server behind them",
    privateNote: `Private app. ${REAL_SCREENS}`,
    plates: [
      { kind: "number", from: "16", to: "2", unit: "Database requests", note: "One billing report, before and after", marks: true },
      { kind: "web", ...careShots.glucose },
      { kind: "web", ...careShots.claims },
      {
        kind: "web",
        ...careShots.week,
        narrow: careShots.weekTwoDays.crop,
        narrowAlt: careShots.weekTwoDays.alt,
      },
      {
        kind: "flow",
        steps: [
          { name: "Old app", note: "Shows how it works" },
          { name: "Test first", note: "Written on the old app" },
          { name: "Agents build", note: "Inside fixed rules" },
          { name: "Checks", note: "Automatic, must pass" },
          { name: "Person approves", note: "Then it is added", person: true },
        ],
        back: { from: 4, to: 2, label: "Fails? It goes back." },
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
        text: "On the server side, the report now finishes instead of giving up. In the web app, most screens are already rebuilt in React. The new app is not live yet.",
        proof: "A screen moves over only after it passes the same tests in both apps.",
        plate: 0,
        target: { kind: "figure" },
        narrow: "number",
        twin: ["A patient's name opens that patient", "The search stays when the tab changes", "A search with no match says so"],
      },
      {
        heading: "The product",
        text: "Care teams follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. The whole app works in English, German, Spanish and Turkish.",
        proof: "Vitals from connected devices, for each patient.",
        plate: 1,
        target: { kind: "shot", box: { x: 716, y: 156, w: 110, h: 68 } },
        narrow: { x: 700, y: 138, w: 724, h: 532 },
        narrowAlt: "Device usage, the spread of glucose values, and one afternoon and evening of the glucose curve for one patient. Invented data.",
      },
      {
        heading: "What was built",
        text: "Built the frontend of the patient profile, care plans, labs and vitals, claims, calls and chat, with the team, from 2023. Since 2026, rebuilds the web app in React, one screen at a time. On the server: drafts for half-done patient sign-ups, a list of lab tests and the billing report fix.",
        proof: "Claims that need another look are flagged.",
        plate: 2,
        target: { kind: "shot", box: { x: 676, y: 500, w: 308, h: 40 } },
        narrow: careShots.claimsCounts.crop,
        narrowAlt: careShots.claimsCounts.alt,
      },
      {
        heading: "How it is built",
        text: "AI agents work inside fixed rules and automatic checks. Old bugs are written down, not copied. A person approves each change before it is added.",
        proof: "A check is trusted only after it is shown to fail.",
        plate: 4,
        target: { kind: "figure" },
        narrow: "flow",
      },
    ],
    figures: [
      { value: "16", to: "2", label: "Database requests for one billing report" },
      { value: "4", label: "Languages: English, German, Spanish, Turkish" },
      { value: "36", label: "Shared building blocks underneath" },
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
    plates: [
      { kind: "web", ...bayyinahLibrary },
      { kind: "web", ...bayyinahPricing },
      { kind: "web", ...bayyinahSeries, stores: "Live on the web and in both app stores" },
    ],
    captions: [
      "Bayyinah TV library, public page.",
      "Bayyinah TV pricing, public page.",
      "Bayyinah TV series page, public page, and the product's public links.",
    ],
    parts: [
      {
        heading: "The product",
        text: "Members follow courses and playlists, keep their learning progress, read scripture and watch videos. The iPhone and Android apps run the same web app. The whole site also works in Arabic, read from right to left.",
        proof: "Courses, video series and live classes in one library.",
        plate: 0,
        target: { kind: "shot", box: { x: 714, y: 592, w: 54, h: 36 } },
        narrow: { x: 704, y: 566, w: 300, h: 320 },
      },
      {
        heading: "What was built",
        text: "The second version is a new app, built from nothing: 34 pages. It added live classes with a live chat that moderators control, and a video player with a quality menu. Members pay by subscription, gift or promo code.",
        proof: "Members subscribe here, on the web or in the apps.",
        plate: 1,
        target: { kind: "shot", box: { x: 1068, y: 651, w: 228, h: 40 } },
        narrow: bayyinahPlans,
        narrowAlt: bayyinahPlansAlt,
      },
      {
        heading: "The result",
        text: "Bayyinah TV is live at bayyinahtv.com. Members choose a monthly or a yearly plan, on the web or in the apps.",
        proof: "Live on the web, in the App Store and on Google Play.",
        plate: 2,
        target: { kind: "selector", css: ".cs-stores ul" },
        narrow: "stores",
      },
    ],
    figures: [
      { value: "34", label: "Pages in the new app, built from nothing" },
      { value: "270+", label: "Reusable screen parts" },
      { value: "2", label: "Languages, with Arabic read right to left" },
    ],
    builtWith:
      "Nuxt 3, Vue 3, TypeScript, Pinia, video.js with HLS, AWS IVS, Pusher, Stripe, Firebase, Tailwind. 34 pages, 270+ components, 25 Pinia stores.",
  },

  "read-to-feed": {
    title: "The app remembers the page in every book.",
    sentence: "Read to Feed is a reading app for children on iPhone and Android, where books open inside the app.",
    platforms: "iPhone, Android",
    plates: [
      phone(
        "/mobile/reading-3.webp",
        "Read to Feed's book reader from its store listing: Chapter 1 of a story, under a Keep Reading! message that says each book read helps someone in need, and a Continue Reading button",
        { x: 90, y: 470, w: 598, h: 1219 },
      ),
      phone(
        "/mobile/reading-1.webp",
        "Read to Feed's My Books screen from its store listing: two books with their reading progress",
        { x: 91, y: 646, w: 598, h: 648 },
      ),
      phone(
        "/mobile/reading-2.webp",
        "Read to Feed's achievements from its store listing: eggs collected, eggs provided and quiz badges",
        { x: 91, y: 600, w: 598, h: 740 },
      ),
    ],
    captions: ["The book reader, from the store listing.", "My Books, from the store listing.", "Achievements, from the store listing."],
    parts: [
      {
        heading: "The product",
        text: "Children read books inside the app, scan their own books by the barcode, take quizzes that run like a chat, and earn badges and streaks. Parents confirm each account by email.",
        proof: "Children read the books inside the app.",
        plate: 0,
        target: { kind: "shot", box: { x: 112, y: 596, w: 556, h: 448 } },
        narrow: { x: 90, y: 470, w: 598, h: 1219 },
      },
      {
        heading: "What was built",
        text: "Books open inside the app, in two e-book formats. The camera reads a book's barcode. Badges, streaks, quizzes and short tips reward reading. A notification opens the right book, and the app works in three languages.",
        proof: "Reading earns badges and streaks.",
        plate: 2,
        target: { kind: "shot", box: { x: 108, y: 734, w: 568, h: 264 } },
        narrow: { x: 91, y: 600, w: 598, h: 740 },
      },
      {
        heading: "The result",
        text: "The app was kept current through three major upgrades. The store listings are now removed, so the links open archived copies of both pages.",
        proof: "About 14 updates, shipped to both app stores.",
        plate: 2,
        target: { kind: "figure" },
      },
    ],
    figures: [
      { value: "≈14", label: "Updates shipped to both app stores" },
      { value: "3", label: "Major upgrades, kept current" },
      { value: "3", label: "Languages" },
    ],
    builtWith:
      "React Native (0.63 to 0.81), React Navigation, Redux Toolkit, Firebase Messaging, Vision Camera, react-native-pdf, epub.js, Lottie, i18next. Maintained forks of epubjs-react-native and react-native-pdf.",
  },

  "viva-fresh": {
    title: "Shopping in Albanian, live in both app stores.",
    sentence: "Viva Fresh is a grocery shopping and loyalty app for iPhone and Android, built once for both.",
    platforms: "iPhone, Android",
    plates: [
      {
        ...phone(
          "/mobile/grocery-3.webp",
          "Viva Fresh cart from the App Store listing: quantities, the discount and the total",
          { x: 100, y: 656, w: 580, h: 818 },
        ),
        stores: BOTH_STORES,
      },
      phone(
        "/mobile/grocery-1.webp",
        "Viva Fresh home from the App Store listing: product categories and the latest products, in Albanian",
        { x: 100, y: 476, w: 580, h: 766 },
      ),
      phone(
        "/mobile/grocery-2.webp",
        "Viva Fresh Fresh category from the App Store listing: a grid of products with prices and cart buttons",
        { x: 100, y: 560, w: 580, h: 774 },
      ),
    ],
    captions: ["The cart, from the App Store listing.", "Home, from the App Store listing.", "A product category, from the App Store listing."],
    parts: [
      {
        heading: "The result",
        text: "Shoppers check out with a delivery time. The cart shows the quantities, the discount and the total.",
        proof: "Live in the App Store and on Google Play.",
        plate: 0,
        target: { kind: "selector", css: ".cs-stores ul" },
        narrow: { x: 100, y: 656, w: 580, h: 818 },
      },
      {
        heading: "The product",
        text: "Shoppers browse product categories, fill a cart, choose a delivery time and check out. A loyalty programme and a wishlist keep the products they want for later.",
        proof: "Shoppers start from the product categories, in Albanian.",
        plate: 1,
        target: { kind: "shot", box: { x: 128, y: 500, w: 522, h: 148 } },
        narrow: { x: 100, y: 476, w: 580, h: 766 },
      },
      {
        heading: "What was built",
        text: "One grocery app, built once for iPhone and Android. Category pages show product grids, with the price and the cart buttons on each item. A search on a map finds the delivery address.",
        proof: "Category pages show product grids.",
        plate: 2,
        target: { kind: "shot", box: { x: 106, y: 930, w: 276, h: 392 } },
        narrow: { x: 100, y: 560, w: 580, h: 774 },
      },
    ],
    builtWith: "React Native, Redux Toolkit, Maps, Firebase.",
  },

  "dukagjini-bookstore": {
    title: "Search, sales and checkout, live in both app stores.",
    sentence: "Dukagjini Bookstore is a publisher's bookshop app for readers on iPhone and Android.",
    platforms: "iPhone, Android",
    plates: [
      phone(
        "/mobile/bookstore-2.webp",
        "Dukagjini Bookstore foreign books from the App Store listing: ratings, prices and favourites",
        { x: 117, y: 740, w: 546, h: 730 },
      ),
      phone(
        "/mobile/bookstore-1.webp",
        "Dukagjini Bookstore home from the App Store listing: the store header and book search",
        { x: 117, y: 740, w: 546, h: 522 },
      ),
      {
        ...phone(
          "/mobile/bookstore-3.webp",
          "Dukagjini Bookstore panel from the App Store listing: favourite lists and book categories",
          { x: 117, y: 1092, w: 546, h: 597 },
        ),
        stores: BOTH_STORES,
      },
    ],
    captions: ["Foreign books, from the App Store listing.", "Home, from the App Store listing.", "Favourites, from the App Store listing."],
    parts: [
      {
        heading: "The product",
        text: "Readers search the catalogue, browse top categories and books on sale, keep favourite lists and pay with promo codes at checkout.",
        proof: "Book lists show ratings, prices and favourites.",
        plate: 0,
        target: { kind: "shot", box: { x: 128, y: 996, w: 528, h: 226 } },
        narrow: { x: 117, y: 740, w: 546, h: 730 },
      },
      {
        heading: "What was built",
        text: "Built once for iPhone and Android. A notification opens the right book. The book page header moves as the page scrolls, and pop-up panels close with a swipe.",
        proof: "Readers search the whole catalogue.",
        plate: 1,
        target: { kind: "shot", box: { x: 155, y: 1145, w: 470, h: 60 } },
        narrow: { x: 117, y: 740, w: 546, h: 522 },
      },
      {
        heading: "The result",
        text: "Readers open their favourite lists and the book categories from one panel.",
        proof: "Live in the App Store and on Google Play.",
        plate: 2,
        target: { kind: "selector", css: ".cs-stores ul" },
        narrow: { x: 117, y: 1092, w: 546, h: 597 },
      },
    ],
    builtWith: "React Native, Redux, Firebase Messaging.",
  },

  "design-system-react": {
    title: "36 building blocks, released 20 times in about six weeks.",
    sentence:
      "Design System v2 is the shared set of buttons, menus and forms that the team built for the new dashboard of a care platform. A colour changes in one place, and the code and the Figma file follow.",
    platforms: "A library of screen parts, for code and for Figma",
    privateNote: `Not public. ${REAL_SCREENS}`,
    plates: [
      { kind: "web", ...dsShots.dateRange },
      {
        kind: "number",
        to: "96.6%",
        unit: "Less JavaScript",
        note: "For a page that uses only a button",
        share: { before: "Before: one bundle for the whole library", now: "Now: only the button", part: 0.034 },
      },
      { kind: "web", ...careShots.overview },
      {
        kind: "flow",
        steps: [
          { name: "Research", note: "Five leading systems" },
          { name: "Guides", note: "Written for agents" },
          { name: "Agents build", note: "Inside the guides" },
          { name: "Checks", note: "Automatic, must pass" },
          { name: "Person approves", note: "Then it is added", person: true },
        ],
        back: { from: 4, to: 2, label: "Fails? It goes back." },
      },
    ],
    captions: [
      `Date range picker, from the Storybook. ${REAL_SCREENS}`,
      "Less JavaScript for a page that uses only a button.",
      `The care dashboard that uses it. ${REAL_SCREENS}`,
      "How a change gets into the library.",
    ],
    parts: [
      {
        heading: "The product",
        text: "Colours, sizes and type are set once, for code and for Figma. 805 shared style values, in three levels, feed ready-made building blocks, from buttons and alerts to date pickers and pop-up messages.",
        proof: "From buttons to date range pickers, ready for every screen.",
        plate: 0,
        target: { kind: "shot", box: { x: 184, y: 96, w: 578, h: 280 } },
        narrow: dsShots.dateRangeJune.crop,
        narrowAlt: dsShots.dateRangeJune.alt,
      },
      {
        heading: "What was built",
        text: "Each building block loads on its own. A page loads only the blocks it uses.",
        proof: "96.6% less JavaScript for a page that uses only a button.",
        plate: 1,
        target: { kind: "figure" },
        narrow: "number",
      },
      {
        heading: "How it is built",
        text: "Research into five leading design systems came first. It became written guides for AI agents. The guides advise, but automatic checks decide.",
        proof: "No guide can overrule a failed check.",
        plate: 3,
        target: { kind: "figure" },
        narrow: "flow",
      },
      {
        heading: "The result",
        text: "Each building block is built to the WCAG 2.1 AA accessibility level, with automatic checks on screen. The care dashboard that uses it is not live yet.",
        proof: "The new care dashboard uses it on its screens.",
        plate: 2,
        target: { kind: "figure" },
        narrow: careShots.patients.crop,
        narrowAlt: careShots.patients.alt,
      },
    ],
    figures: [
      { value: "36", label: "Building blocks" },
      { value: "805", label: "Shared style values, in three levels" },
      { value: "20", label: "Releases in about six weeks" },
      { value: "96.6%", label: "Less JavaScript for a page that uses only a button" },
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
      "Incentiv's portal is a dashboard where people and businesses manage an on-chain smart wallet and incentive programs.",
    role: "Frontend",
    platforms: "Web",
    plates: [
      { kind: "web", ...incentivSignIn },
      { kind: "live", key: "wallet" },
    ],
    captions: ["Incentiv portal sign-in, public screen.", `Balance card. ${RECREATION}`],
    parts: [
      {
        heading: "The product",
        text: "People and businesses sign in, then see balances, assets, fees saved and transactions in dashboard cards. The website, the docs and the portal's sign-in screen are public.",
        proof: "Three ways in: a passkey, MetaMask or WalletConnect.",
        plate: 0,
        target: { kind: "shot", box: { x: 201, y: 495, w: 149, h: 50 } },
        narrow: { x: 186, y: 480, w: 516, h: 150 },
      },
      {
        heading: "What was built",
        text: "Built the sign-in and dashboard screens. Teammates built the wallet itself and its link to the blockchain. The screens cover sign-in, a first-run tour, dashboard cards, a list of assets and a balance pop-up with a QR code to receive.",
        proof: "Balance, fees saved, transactions and assets in one card.",
        plate: 1,
        target: { kind: "selector", css: '[class*="rounded-[22px]"]' },
        narrow: "live",
      },
      {
        heading: "The result",
        text: "The website is live at incentiv.io and the docs at docs.incentiv.io. Private pages of the portal stay behind sign-in.",
        proof: "Live at portal.incentiv.io, in English and French.",
        plate: 1,
        target: { kind: "figure" },
      },
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
