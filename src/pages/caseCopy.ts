/** Plain case-page copy. Facts come from CONTENT.md, projects.ts and caseNarratives.ts. */

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
  /** The part the desktop frame shows. Its scale in the frame is never above 1. */
  crop: Px;
  /** The page's own colour, for the frame area outside the crop. */
  ground: string;
}

export type LiveKey = "care" | "design-system" | "wallet";

/** A shot plate may carry the product's public links beside the shot. The value is the panel title. */
export type Plate =
  | ({ kind: "web" | "phone"; stores?: string } & Shot)
  | { kind: "live"; key: LiveKey }
  | { kind: "number"; from?: string; to: string; unit: string; note: string };

/** Where the hairline ends: a box in the plate's shot, a part of a live plate, or the figure of a number plate. */
export type Target = { kind: "shot"; box: Px } | { kind: "selector"; css: string; round?: boolean } | { kind: "figure" };

export interface Part {
  heading: "The product" | "What was built" | "The result";
  text: string;
  /** The line that carries the hairline into the frame. */
  proof: string;
  /** Index into `plates`. */
  plate: number;
  target: Target;
  /**
   * How the hairline enters the plate. Default: at the target's own height.
   * "lane": along a clear row (a fraction of the plate height), then down or up onto the target.
   * "along": along the top edge of a rule inside a live plate.
   */
  route?: { kind: "lane"; y: number } | { kind: "along"; css: string };
  /**
   * The crop the phone layout shows under this part. "stores": only the plate's link panel.
   * Omitted: the part shows no plate on a phone. The first part's plate is the phone hero, under the title.
   */
  narrow?: Px | "live" | "number" | "stores";
}

export interface Figure {
  value: string;
  to?: string;
  label: string;
}

export interface CaseCopy {
  title: string;
  sentence: string;
  role: string;
  platforms: string;
  /** Shown in the facts row when the product has no public page. */
  privateNote?: string;
  plates: Plate[];
  captions: string[];
  parts: [Part, Part, Part];
  figures?: Figure[];
  builtWith: string;
}

const RECREATION = "Recreation · invented data.";
const BOTH_STORES = "Live in both app stores";

/* Desktop crops stay at 1:1 or close, so the screen's own text stays readable in the frame. */

const bayyinahPricing: Shot = {
  src: "/showcase/bayyinah/web-06.webp",
  alt: "Bayyinah TV pricing: a monthly and annual switch, the course list and the Premium plan at $11 a month with a Start 7-Day Free Trial button",
  width: 1440,
  height: 900,
  crop: { x: 508, y: 92, w: 904, h: 694 },
  ground: "#1f1518",
};

const bayyinahLibrary: Shot = {
  src: "/showcase/bayyinah/web-02.webp",
  alt: "Bayyinah TV library: search, filters and a row of courses, one marked LIVE",
  width: 1440,
  height: 900,
  crop: { x: 84, y: 236, w: 922, h: 664 },
  ground: "#251e21",
};

const bayyinahPlans: Shot = {
  ...bayyinahPricing,
  alt: "Bayyinah TV pricing page: Choose Your Plan, and a promise to watch anytime, anywhere, on mobile, tablet or desktop",
  crop: { x: 24, y: 104, w: 400, h: 496 },
};

const incentivSignIn: Shot = {
  src: "/showcase/incentiv/web-03.webp",
  alt: "Incentiv portal sign-in: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect options",
  width: 1440,
  height: 900,
  crop: { x: 150, y: 167, w: 630, h: 566 },
  ground: "#111111",
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

export const caseCopy: Record<string, CaseCopy> = {
  "care-platform": {
    title: "One billing report now finishes: 2 database requests, not 16.",
    sentence:
      "Care teams in many client organizations use this platform to follow patients at home. Each organization sees only its own patients.",
    role: "Frontend. Full stack since 2026: the web app and its server.",
    platforms: "Web app and the server behind it",
    privateNote: "Private app. Shown as a recreation.",
    plates: [
      { kind: "number", from: "16", to: "2", unit: "Database requests", note: "One billing report, before and after" },
      { kind: "live", key: "care" },
    ],
    captions: ["Database requests for one billing report, before and after.", `Vitals card for one organization. ${RECREATION}`],
    parts: [
      {
        heading: "The result",
        text: "On the server side, one billing report asked the database 16 times and gave up. Now it asks 2 times and finishes. In the web app, most screens are already rebuilt in React; a screen moves over only after it passes the same tests in both apps.",
        proof: "One billing report: 16 database requests became 2.",
        plate: 0,
        target: { kind: "figure" },
        narrow: "number",
      },
      {
        heading: "The product",
        text: "Care teams follow vitals from connected devices, care plans, lab results, billing claims, calls and chat. The whole app works in English, German, Spanish and Turkish.",
        proof: "Vitals from connected devices, for each patient.",
        plate: 1,
        target: { kind: "selector", css: '[role="group"][aria-label^="Blood pressure"]' },
        narrow: "live",
      },
      {
        heading: "What was built",
        text: "From 2023 the team built the features: patient profile, care plans, labs and vitals, claims, calls and chat. Many client organizations share one system, so every screen keeps each organization's data apart and respects each user's role and timezone. In 2026 the web app moves to React, one screen at a time.",
        proof: "Each organization sees only its own patients.",
        plate: 1,
        target: { kind: "selector", css: 'button[aria-haspopup="listbox"]', round: true },
        route: { kind: "lane", y: 0.022 },
      },
    ],
    figures: [
      { value: "16", to: "2", label: "Database requests for one billing report" },
      { value: "4", label: "Languages: English, German, Spanish, Turkish" },
      { value: "36", label: "Shared building blocks underneath" },
    ],
    builtWith:
      "React 19, TypeScript, TanStack Query and Router, Zustand, Zod, Tailwind, Vitest, Playwright. Before the rewrite: Vue and Nuxt 2. Server: Laravel 13, PHP 8.3, MySQL, Redis, Pest. Services: Twilio, Chime, Pusher, ECharts.",
  },

  "bayyinah-tv": {
    title: "Members subscribe on the web, iPhone or Android.",
    sentence:
      "Bayyinah TV is a video-learning platform for an online community: courses, a scripture reader, videos and live classes.",
    role: "Frontend, core team",
    platforms: "Web, and inside the iPhone and Android apps",
    plates: [
      { kind: "web", ...bayyinahPricing },
      { kind: "web", ...bayyinahLibrary },
      { kind: "web", ...bayyinahPlans, stores: "Live on the web and in both app stores" },
    ],
    captions: [
      "Bayyinah TV pricing, public page.",
      "Bayyinah TV library, public page.",
      "Bayyinah TV pricing, public page, and the product's public links.",
    ],
    parts: [
      {
        heading: "The product",
        text: "Members follow courses and playlists, keep their learning progress, read scripture and watch videos. They subscribe on the web or in the iPhone and Android apps, which run the same web app. The whole site also works in Arabic, read from right to left.",
        proof: "Members subscribe here, on the web or in the apps.",
        plate: 0,
        target: { kind: "shot", box: { x: 1068, y: 651, w: 228, h: 40 } },
        narrow: { x: 964, y: 104, w: 436, h: 612 },
      },
      {
        heading: "What was built",
        text: "The second version is a new app, built from nothing: 34 pages. It added live classes with a live chat that moderators control, and a video player with a quality menu. Members pay by subscription, gift or promo code.",
        proof: "Courses, video series and live classes in one library.",
        plate: 1,
        target: { kind: "shot", box: { x: 414, y: 592, w: 54, h: 36 } },
        route: { kind: "lane", y: 0.497 },
        narrow: { x: 404, y: 566, w: 300, h: 320 },
      },
      {
        heading: "The result",
        text: "Bayyinah TV is live at bayyinahtv.com, in the App Store and on Google Play. Members choose a monthly or a yearly plan, on the web or in the apps.",
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
    sentence:
      "Read to Feed is a reading app for children on iPhone and Android, where books open inside the app. About 14 updates shipped to both app stores.",
    role: "Mobile, iPhone and Android",
    platforms: "iPhone, Android",
    plates: [
      phone(
        "/mobile/reading-1.webp",
        "Read to Feed's My Books screen from its store listing: two books with their reading progress",
        { x: 100, y: 616, w: 580, h: 680 },
      ),
      phone(
        "/mobile/reading-2.webp",
        "Read to Feed's achievements from its store listing: eggs collected, eggs provided and quiz badges",
        { x: 96, y: 600, w: 588, h: 740 },
      ),
      { kind: "number", to: "≈14", unit: "Updates", note: "To the App Store and Google Play, 2022 to 2025" },
    ],
    captions: ["My Books, from the store listing.", "Achievements, from the store listing.", "Updates to both app stores."],
    parts: [
      {
        heading: "The product",
        text: "Children read books inside the app, scan their own books by the barcode, take quizzes that run like a chat, and earn badges and streaks. Parents confirm each account by email.",
        proof: "Each book shows how far the child has read.",
        plate: 0,
        target: { kind: "shot", box: { x: 330, y: 850, w: 312, h: 52 } },
        route: { kind: "lane", y: 0.47 },
        narrow: { x: 100, y: 616, w: 580, h: 680 },
      },
      {
        heading: "What was built",
        text: "Books open inside the app, in two e-book formats. The camera reads a book's barcode. Badges, streaks, quizzes and short tips reward reading. A notification opens the right book, and the app works in three languages.",
        proof: "Reading earns badges and streaks.",
        plate: 1,
        target: { kind: "shot", box: { x: 108, y: 734, w: 568, h: 264 } },
        narrow: { x: 96, y: 600, w: 588, h: 740 },
      },
      {
        heading: "The result",
        text: "About 14 updates went to the App Store and Google Play. The app was kept current through three major upgrades. The store listings are now removed, so the links open archived copies of both pages.",
        proof: "About 14 updates, shipped to both app stores.",
        plate: 2,
        target: { kind: "figure" },
        narrow: "number",
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
    role: "Mobile",
    platforms: "iPhone, Android",
    plates: [
      phone(
        "/mobile/grocery-1.webp",
        "Viva Fresh home from the App Store listing: product categories and the latest products, in Albanian",
        { x: 92, y: 476, w: 596, h: 756 },
      ),
      phone(
        "/mobile/grocery-2.webp",
        "Viva Fresh Fresh category from the App Store listing: a grid of products with prices and cart buttons",
        { x: 92, y: 560, w: 596, h: 760 },
      ),
      {
        ...phone(
          "/mobile/grocery-3.webp",
          "Viva Fresh cart from the App Store listing: quantities, the discount and the total",
          { x: 92, y: 656, w: 596, h: 818 },
        ),
        stores: BOTH_STORES,
      },
    ],
    captions: ["Home, from the App Store listing.", "A product category, from the App Store listing.", "The cart, from the App Store listing."],
    parts: [
      {
        heading: "The product",
        text: "Shoppers browse product categories, fill a cart, choose a delivery time and check out. A loyalty programme and a wishlist keep the products they want for later.",
        proof: "Shoppers start from the product categories, in Albanian.",
        plate: 0,
        target: { kind: "shot", box: { x: 128, y: 500, w: 522, h: 148 } },
        narrow: { x: 92, y: 476, w: 596, h: 756 },
      },
      {
        heading: "What was built",
        text: "One grocery app, built once for iPhone and Android. Category pages show product grids, with the price and the cart buttons on each item. A search on a map finds the delivery address.",
        proof: "Category pages show product grids.",
        plate: 1,
        target: { kind: "shot", box: { x: 100, y: 924, w: 580, h: 390 } },
        narrow: { x: 92, y: 560, w: 596, h: 760 },
      },
      {
        heading: "The result",
        text: "Viva Fresh is live in the App Store and on Google Play. Shoppers order groceries with a delivery time, use the loyalty programme and keep a wishlist.",
        proof: "Live in the App Store and on Google Play.",
        plate: 2,
        target: { kind: "selector", css: ".cs-stores ul" },
        narrow: { x: 92, y: 656, w: 596, h: 818 },
      },
    ],
    builtWith: "React Native, Redux Toolkit, Maps, Firebase.",
  },

  incentiv: {
    title: "Passkey (no password) or wallet sign-in, in English and French.",
    sentence:
      "Incentiv's portal is a dashboard where people and businesses manage an on-chain smart wallet and incentive programs.",
    role: "Frontend. Built the screens; teammates built the wallet.",
    platforms: "Web",
    plates: [
      { kind: "web", ...incentivSignIn },
      { kind: "live", key: "wallet" },
    ],
    captions: ["Incentiv portal sign-in, public screen.", `Wallet card. ${RECREATION}`],
    parts: [
      {
        heading: "The product",
        text: "People and businesses sign in, then see balances, assets, fees saved and transactions in dashboard cards. The website, the docs and the portal's sign-in screen are public.",
        proof: "Sign in with a passkey (no password) or an existing wallet.",
        plate: 0,
        target: { kind: "shot", box: { x: 224, y: 500, w: 100, h: 40 } },
        narrow: { x: 186, y: 488, w: 350, h: 144 },
      },
      {
        heading: "What was built",
        text: "Built the sign-in and dashboard screens. Teammates built the wallet. The screens cover sign-in, an animated first-run tour, dashboard cards, a list of assets and a balance pop-up with a QR code to receive.",
        proof: "Balances and assets in dashboard cards.",
        plate: 1,
        target: { kind: "selector", css: '[class*="rounded-[22px]"]' },
        narrow: "live",
      },
      {
        heading: "The result",
        text: "The portal is live at portal.incentiv.io, the website at incentiv.io and the docs at docs.incentiv.io. The screens run in English and French, and private pages stay behind sign-in.",
        proof: "Live at portal.incentiv.io, in English and French.",
        plate: 0,
        target: { kind: "shot", box: { x: 196, y: 286, w: 330, h: 128 } },
      },
    ],
    builtWith:
      "Next.js 14 with the App Router, React 18, TypeScript, Redux Toolkit and RTK Query, next-intl, Framer Motion, Tailwind, ApexCharts.",
  },

  "dukagjini-bookstore": {
    title: "Search, sales and checkout, live in both app stores.",
    sentence: "Dukagjini Bookstore is a publisher's bookshop app for readers on iPhone and Android.",
    role: "Mobile",
    platforms: "iPhone, Android",
    plates: [
      phone(
        "/mobile/bookstore-1.webp",
        "Dukagjini Bookstore home from the App Store listing: the store header and book search",
        { x: 106, y: 740, w: 568, h: 522 },
      ),
      phone(
        "/mobile/bookstore-2.webp",
        "Dukagjini Bookstore foreign books from the App Store listing: ratings, prices and favourites",
        { x: 106, y: 740, w: 568, h: 730 },
      ),
      {
        ...phone(
          "/mobile/bookstore-3.webp",
          "Dukagjini Bookstore panel from the App Store listing: favourite lists and book categories",
          { x: 106, y: 1078, w: 568, h: 611 },
        ),
        stores: BOTH_STORES,
      },
    ],
    captions: ["Home, from the App Store listing.", "Foreign books, from the App Store listing.", "Favourites, from the App Store listing."],
    parts: [
      {
        heading: "The product",
        text: "Readers search the catalogue, browse top categories and books on sale, keep favourite lists and pay with promo codes at checkout.",
        proof: "Readers search the whole catalogue.",
        plate: 0,
        target: { kind: "shot", box: { x: 155, y: 1145, w: 470, h: 60 } },
        narrow: { x: 106, y: 740, w: 568, h: 522 },
      },
      {
        heading: "What was built",
        text: "Built once for iPhone and Android. A notification opens the right book. The book page header moves as the page scrolls, and pop-up panels close with a swipe.",
        proof: "Book lists show ratings, prices and favourites.",
        plate: 1,
        target: { kind: "shot", box: { x: 128, y: 996, w: 528, h: 226 } },
        narrow: { x: 106, y: 740, w: 568, h: 730 },
      },
      {
        heading: "The result",
        text: "Dukagjini Bookstore is live in the App Store and on Google Play. Readers keep favourite lists, browse categories and check out with promo codes.",
        proof: "Live in the App Store and on Google Play.",
        plate: 2,
        target: { kind: "selector", css: ".cs-stores ul" },
        narrow: { x: 106, y: 1078, w: 568, h: 611 },
      },
    ],
    builtWith: "React Native, Redux, Firebase Messaging.",
  },

  "design-system-react": {
    title: "36 building blocks, released 20 times in about six weeks.",
    sentence:
      "Design System v2 is the shared set of buttons, menus and forms that the team built for the new dashboard of a care platform. A colour changes in one place, and the code and the Figma file follow.",
    role: "Design system, with the team",
    platforms: "A library of screen parts, for code and for Figma",
    privateNote: "Not public. Shown as a recreation.",
    plates: [
      { kind: "live", key: "design-system" },
      { kind: "number", to: "96.6%", unit: "Less JavaScript", note: "For a page that uses only a button" },
      { kind: "number", to: "20", unit: "Releases", note: "In about six weeks" },
    ],
    captions: [
      `A few of the 36 building blocks. ${RECREATION}`,
      "JavaScript a page downloads when it uses only a button.",
      "Releases in about six weeks.",
    ],
    parts: [
      {
        heading: "The product",
        text: "Colours, sizes and type are set once, for code and for Figma. 805 shared style values, in three levels, feed 36 ready-made building blocks, from buttons and alerts to date pickers and pop-up messages.",
        proof: "Buttons, fields, switches and alerts, ready for every screen.",
        plate: 0,
        target: { kind: "selector", css: ".dsr-area-buttons" },
        narrow: "live",
      },
      {
        heading: "What was built",
        text: "The work started with research: a study of leading design systems and an audit of the old app. Each decision is written down. Automatic checks stop a change that breaks a rule, and independent reviewers check each change. Each building block also loads on its own, so a page loads only the blocks it uses.",
        proof: "96.6% less JavaScript for a page that uses only a button.",
        plate: 1,
        target: { kind: "figure" },
        narrow: "number",
      },
      {
        heading: "The result",
        text: "The team shipped 20 releases in about six weeks. Each building block is built to the WCAG 2.1 AA accessibility level, with automatic checks on screen. The new care dashboard uses the system on its screens. That dashboard is not live yet.",
        proof: "20 releases in about six weeks.",
        plate: 2,
        target: { kind: "figure" },
        narrow: "number",
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
  },
};
