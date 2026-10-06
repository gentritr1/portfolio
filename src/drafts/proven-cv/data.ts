import { careShots, dsShots, type ScreenShot } from "../../content/careShots";
import { links } from "../../content/links";

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export type Plate =
  | { kind: "screen"; shot: ScreenShot }
  | { kind: "web"; shot: Shot }
  | { kind: "phones"; shots: Shot[] }
  | { kind: "count"; before: number; after: number; subject: string };

export interface Proof {
  id: string;
  kind: string;
  result: string;
  meta: string;
  href: string;
  label: string;
  plate: Plate;
}

export interface Claim {
  text: string;
  proof?: Proof;
}

export interface Entry {
  name: string;
  years: string;
  role: string;
  claims: Claim[];
}

const store = (src: string, alt: string): Shot => ({
  src,
  alt,
  width: 780,
  height: 1689,
});

const web = (src: string, alt: string, width = 1440, height = 900): Shot => ({
  src,
  alt,
  width,
  height,
});

export const identity = {
  name: "Gentrit Rashiti",
  line: "Web and mobile products, from the first screen to the store release. 5+ years. Kosovo, remote.",
};

export const contact = [
  { label: "Email", href: `mailto:${links.email}` },
  { label: "GitHub", href: links.github },
  { label: "LinkedIn", href: links.linkedin },
  { label: "Download CV", href: links.cv },
];

export const experience: Entry[] = [
  {
    name: "Vianova",
    years: "2021–now",
    role: "Frontend and mobile → full stack",
    claims: [
      {
        text: "Care-management platform: Vue to React, one route at a time, each route parity-tested.",
        proof: {
          id: "01",
          kind: "Real product screens · invented data",
          result: "Each organization sees only its own patients.",
          meta: "Care platform · 2023–26",
          href: "/work/care-platform",
          label: "Open the case",
          plate: {
            kind: "screen",
            shot: { ...careShots.overview, crop: { x: 236, y: 80, w: 1204, h: 752 } },
          },
        },
      },
      {
        text: "One billing report on the Laravel API: 16 queries → 2.",
        proof: {
          id: "02",
          kind: "Count · Laravel API",
          result: "The report no longer times out.",
          meta: "Care-management API · 2026",
          href: "/work/care-platform",
          label: "Open the case",
          plate: {
            kind: "count",
            before: 16,
            after: 2,
            subject: "Billing report, queries for one request",
          },
        },
      },
      {
        text: "Design System v2: 36 components and 805 tokens, 20 releases in about six weeks.",
        proof: {
          id: "03",
          kind: "Real product screens · invented data",
          result:
            "One token source builds the CSS, the TypeScript and the Figma bundle.",
          meta: "Design system · 2026",
          href: "/work/design-system-react",
          label: "Open the case",
          plate: {
            kind: "screen",
            shot: {
              ...dsShots.top,
              alt: "Design System v2 in its Storybook: buttons in four styles, buttons with icons, and alerts for a note, information and success. Invented data.",
              crop: { x: 8, y: -40, w: 704, h: 440 },
            },
          },
        },
      },
      {
        text: "Patient profile, care plans, labs and vitals, claims and calls, in four languages.",
      },
    ],
  },
  {
    name: "Bayyinah TV",
    years: "2023–26",
    role: "Frontend, core team",
    claims: [
      {
        text: "A full rebuild on Nuxt 3 from an empty template: 34 routes, 270+ components.",
        proof: {
          id: "04",
          kind: "Public page · bayyinahtv.com",
          result:
            "Live in English and Arabic, with a full right-to-left layout.",
          meta: "Frontend, core team · 2023–26",
          href: "/work/bayyinah-tv",
          label: "Open the case",
          plate: {
            kind: "web",
            shot: web(
              "/showcase/bayyinah/web-01.webp",
              'Bayyinah TV landing page: "Quran Studies Made Simple" hero with the app on a laptop, a monitor and phones',
            ),
          },
        },
      },
      {
        text: "The same web app runs inside the iOS and Android apps.",
        proof: {
          id: "05",
          kind: "App Store listing",
          result: "One codebase serves the browser and both stores.",
          meta: "Frontend, core team · 2023–26",
          href: "/work/bayyinah-tv",
          label: "Open the case",
          plate: {
            kind: "phones",
            shots: [
              store(
                "/showcase/bayyinah/store-01.webp",
                'App Store frame: "Quran Studies Made Simple" with the Bayyinah TV home screen',
              ),
              store(
                "/showcase/bayyinah/store-02.webp",
                'App Store frame: "Study the Quran Surah by Surah" with the surah list and the video player',
              ),
              store(
                "/showcase/bayyinah/store-05.webp",
                'App Store frame: "Pick Up Anytime" with the My Learning progress dashboard',
              ),
            ],
          },
        },
      },
      { text: "Stripe, Apple and Google subscriptions, gifts and promo codes." },
      { text: "Live streams on AWS IVS with realtime chat and moderation." },
    ],
  },
  {
    name: "Mobile apps, iOS and Android",
    years: "2021–25",
    role: "Mobile",
    claims: [
      {
        text: "Read to Feed: about 14 releases to both stores, React Native 0.63 → 0.81.",
        proof: {
          id: "06",
          kind: "App Store listing, archived",
          result:
            "A PDF and EPUB reader, a barcode scanner, badges and streaks, in three languages.",
          meta: "Mobile · 2022–25",
          href: "/work/read-to-feed",
          label: "Open the case",
          plate: {
            kind: "phones",
            shots: [
              store(
                "/mobile/reading-1.webp",
                "Read to Feed store screenshot: My Books list with reading progress",
              ),
              store(
                "/mobile/reading-3.webp",
                "Read to Feed store screenshot: chapter reader with a Keep Reading sheet",
              ),
              store(
                "/mobile/reading-2.webp",
                "Read to Feed store screenshot: achievements screen with quiz badges",
              ),
            ],
          },
        },
      },
      {
        text: "Dukagjini Bookstore: a push notification opens the right book through a deep link.",
        proof: {
          id: "07",
          kind: "App Store listing",
          result:
            "Search, categories, favourite lists and checkout with promo codes, on iPhone and Android.",
          meta: "Mobile · 2021–22",
          href: "/work/dukagjini-bookstore",
          label: "Open the case",
          plate: {
            kind: "phones",
            shots: [
              store(
                "/mobile/bookstore-1.webp",
                "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale",
              ),
              store(
                "/mobile/bookstore-2.webp",
                "Dukagjini Bookstore store screenshot: foreign books list with ratings and prices",
              ),
              store(
                "/mobile/bookstore-3.webp",
                "Dukagjini Bookstore store screenshot: sheet with favourite lists and book categories",
              ),
            ],
          },
        },
      },
      {
        text: "Viva Fresh: grocery orders with delivery slots, loyalty and a map search for the address.",
        proof: {
          id: "08",
          kind: "App Store listing",
          result:
            "One React Native codebase ships to the App Store and Google Play.",
          meta: "Mobile · 2023",
          href: "/work/viva-fresh",
          label: "Open the case",
          plate: {
            kind: "phones",
            shots: [
              store(
                "/mobile/grocery-1.webp",
                "Viva Fresh store screenshot: home with product categories, Albanian interface",
              ),
              store(
                "/mobile/grocery-2.webp",
                "Viva Fresh store screenshot: Fresh category with a product grid and the cart total",
              ),
              store(
                "/mobile/grocery-3.webp",
                "Viva Fresh store screenshot: cart with quantities, discount and checkout button",
              ),
            ],
          },
        },
      },
      {
        text: "Maintained forks of epubjs-react-native and react-native-pdf keep the reader on current React Native.",
      },
    ],
  },
  {
    name: "Incentiv",
    years: "2024",
    role: "Frontend, UI layer",
    claims: [
      {
        text: "A smart-wallet dashboard: passkey and wallet sign-in UI, onboarding, English and French.",
        proof: {
          id: "09",
          kind: "Public page · portal.incentiv.io",
          result: "Teammates built the wallet and blockchain layer.",
          meta: "Frontend, UI layer · 2024",
          href: "/work/incentiv",
          label: "Open the case",
          plate: {
            kind: "web",
            shot: web(
              "/showcase/incentiv/web-03.webp",
              "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
            ),
          },
        },
      },
    ],
  },
  {
    name: "AvahiTech",
    years: "Freelance",
    role: "Frontend",
    claims: [
      {
        text: "A business dashboard with AI headshots and a PDF-to-chat assistant; backend features in FastAPI.",
      },
    ],
  },
];

export const personal: Claim[] = [
  {
    text: "Offday: a multi-tenant time-off app with about 200 tests, including security and tenant isolation.",
    proof: {
      id: "10",
      kind: "Own project · screenshot",
      result:
        "Requests, approvals, a team calendar with drag-select and a streaming AI assistant.",
      meta: "Owner · 2026",
      href: "/work/offday",
      label: "Open the project",
      plate: {
        kind: "web",
        shot: web(
          "/personal/shots/offday-light-calendar-desktop.webp",
          "Offday team calendar in the demo workspace, October leave bars and approval queue",
        ),
      },
    },
  },
  {
    text: "Studio site: images 972 KB → 337 KB, deploy 28 MB → 9.5 MB.",
    proof: {
      id: "11",
      kind: "Own project · snaxxtech.com",
      result: "A three.js hero, a cinemagraph loop and a strict CSP on Vercel.",
      meta: "Owner · 2026",
      href: "/work/snaxx-tech",
      label: "Open the project",
      plate: {
        kind: "web",
        shot: web(
          "/personal/shots/snaxx-desktop.webp",
          "Snaxx Tech studio site hero, The Snaxx Almanac illustrated landscape of apps and games",
        ),
      },
    },
  },
  {
    text: "FJALË: a daily Albanian word game with a 21k-word dictionary.",
    proof: {
      id: "12",
      kind: "Own project · live on the web",
      result: "An archive of past words, and offline play.",
      meta: "Owner · 2026",
      href: "/work/fjale",
      label: "Open the project",
      plate: {
        kind: "web",
        shot: web(
          "/personal/shots/fjale-desktop.webp",
          "FJALË word game board, five-letter grid with Albanian keyboard and hint panel",
        ),
      },
    },
  },
];

export const skills: Array<[string, string]> = [
  ["Frontend", "React, Next.js, Vue, Nuxt, TypeScript, Tailwind"],
  ["Mobile", "React Native, iOS, Android"],
  ["Backend", "Laravel, PHP, Python, FastAPI, MySQL, Redis"],
  ["Quality", "Playwright, Vitest, Pest, CI/CD"],
  ["Services", "Stripe, Firebase, AWS IVS, Twilio, Pusher"],
  ["Languages", "Multi-language interfaces, Arabic right-to-left"],
];

export const education = "Bachelor's degree, UBT";

export const proofs: Proof[] = [
  ...experience.flatMap((entry) => entry.claims),
  ...personal,
].flatMap((claim) => (claim.proof ? [claim.proof] : []));
