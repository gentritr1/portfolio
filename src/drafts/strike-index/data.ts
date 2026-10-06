import { findProject, projects, type Project } from "../../content/projects";
import { careShots, dsShots, type ScreenShot } from "../../content/careShots";

export type Proof =
  | { kind: "shot"; src: string; alt: string; note?: string }
  | { kind: "screen"; shot: ScreenShot; note: string }
  | { kind: "phones"; srcs: string[]; alt: string }
  | { kind: "readout"; from?: string; to: string; label: string };

export interface Row {
  project: Project;
  name: string;
  years: string;
  scope: string;
  /** Words after the name. The sentence ends with the edit, so an insertion never moves another word. */
  text: string;
  /** The constraint. Only rows with a real constraint carry an edit. */
  edit?: { was: string; now: string };
  note: string;
  proof: Proof;
}

const need = (slug: string) => {
  const project = findProject(slug);
  if (!project) throw new Error(`strike-index: unknown project ${slug}`);
  return project;
};

const realScreen = "Real product screen with invented data. The product is private.";

export const rows: Row[] = [
  {
    project: need("care-platform"),
    name: "Care platform",
    years: "2026",
    scope: "Web app",
    text: "Vue to React:",
    edit: { was: "no behaviour may change", now: "parity tests on both apps" },
    note: "A live multi-tenant product moves one route at a time. Each screen keeps every organization’s data, roles and timezones apart, in four languages.",
    proof: { kind: "screen", shot: careShots.week, note: realScreen },
  },
  {
    project: need("care-api"),
    name: "Care API",
    years: "2026",
    scope: "API",
    text: "a billing report runs",
    edit: { was: "16 queries and times out", now: "2 queries, no timeout" },
    note: "Laravel API work on the same platform: enrollment drafts, a lab catalog and multi-tenant security fixes.",
    proof: {
      kind: "readout",
      from: "16",
      to: "2",
      label: "queries in one billing report",
    },
  },
  {
    project: need("design-system-react"),
    name: "Design System v2",
    years: "2026",
    scope: "System",
    text: "36 components and 805 tokens, 20 releases in about six weeks",
    note: "One token source in three tiers feeds CSS, TypeScript and Figma. A Button-only consumer loads 96.6% less JavaScript.",
    proof: { kind: "screen", shot: dsShots.buttonAlert, note: realScreen },
  },
  {
    project: need("bayyinah-tv"),
    name: "Bayyinah TV",
    years: "2023–26",
    scope: "Web, stores",
    text: "a Nuxt 3 rebuild with live streams, in English and Arabic",
    note: "34 routes and 270+ components. Stripe, Apple and Google subscriptions. The same web app runs inside the iOS and Android apps.",
    proof: {
      kind: "shot",
      src: "/showcase/bayyinah/web-05.webp",
      alt: "Bayyinah TV series page: episode list in a side column, series summary and video cards",
      note: "bayyinahtv.com, public series page",
    },
  },
  {
    project: need("offday"),
    name: "Offday",
    years: "2026",
    scope: "Web app",
    text: "many teams share one app,",
    edit: { was: "and no data may cross", now: "about 200 tests check isolation" },
    note: "A multi-tenant time-off app: requests, approvals and a team calendar. Playwright covers security and tenant isolation.",
    proof: {
      kind: "shot",
      src: "/personal/shots/offday-light-calendar-desktop.webp",
      alt: "Offday team calendar with leave bars and the approval queue",
      note: "Personal project, own capture",
    },
  },
  {
    project: need("snaxx-tech"),
    name: "Snaxx Tech",
    years: "2026",
    scope: "Site",
    text: "a studio site with a 3D hero, images at",
    edit: { was: "972 KB", now: "337 KB" },
    note: "The deploy went from 28 MB to 9.5 MB, behind a strict content security policy.",
    proof: {
      kind: "shot",
      src: "/personal/shots/snaxx-desktop.webp",
      alt: "Snaxx Tech hero with the Almanac illustrated landscape",
      note: "snaxxtech.com, own site",
    },
  },
  {
    project: need("read-to-feed"),
    name: "Read to Feed",
    years: "2022–25",
    scope: "iOS, Android",
    text: "about 14 releases to both stores, React Native",
    edit: { was: "0.63", now: "0.81" },
    note: "Three major upgrades. A PDF and EPUB reader, an ISBN barcode scanner, badges and streaks.",
    proof: {
      kind: "phones",
      srcs: [
        "/mobile/reading-1.webp",
        "/mobile/reading-2.webp",
        "/mobile/reading-3.webp",
      ],
      alt: "Three Read to Feed store screenshots: book list, achievements and the reader",
    },
  },
  {
    project: need("chatbot-runtime"),
    name: "Chatbot runtime",
    years: "2022–25",
    scope: "Library",
    text: "a scripted chat",
    edit: { was: "may stall or repeat", now: "has stall and duplicate guards" },
    note: "A React Native package with a message queue and natural typing delays. A TypeScript web port followed in 2025.",
    proof: {
      kind: "readout",
      to: "2 guards",
      label: "stall and duplicate, on one message queue",
    },
  },
  {
    project: need("incentiv"),
    name: "Incentiv",
    years: "2024",
    scope: "Web",
    text: "passkey and wallet sign-in, live in English and French",
    note: "The UI layer on Next.js 14 and RTK Query. Teammates built the wallet and blockchain layer.",
    proof: {
      kind: "shot",
      src: "/showcase/incentiv/web-03.webp",
      alt: "Incentiv Portal sign-in with passkey, MetaMask and WalletConnect options",
      note: "portal.incentiv.io, public sign-in screen",
    },
  },
  {
    project: need("viva-fresh"),
    name: "Viva Fresh",
    years: "2023",
    scope: "iOS, Android",
    text: "grocery orders with a delivery slot, on iPhone and Android",
    note: "One React Native codebase. Loyalty, a wishlist and address search on a map.",
    proof: {
      kind: "phones",
      srcs: [
        "/mobile/grocery-1.webp",
        "/mobile/grocery-2.webp",
        "/mobile/grocery-3.webp",
      ],
      alt: "Three Viva Fresh store screenshots: home, a product grid and the cart",
    },
  },
  {
    project: need("open-source-forks"),
    name: "Reader forks",
    years: "2022",
    scope: "Library",
    text: "two libraries",
    edit: { was: "lag behind React Native", now: "work on current versions" },
    note: "Maintained forks of epubjs-react-native and react-native-pdf, used in a production reading app.",
    proof: {
      kind: "readout",
      to: "2 forks",
      label: "epubjs-react-native, react-native-pdf",
    },
  },
  {
    project: need("dukagjini-bookstore"),
    name: "Dukagjini Bookstore",
    years: "2021–22",
    scope: "iOS, Android",
    text: "a book shop where a push notification opens the book",
    note: "Search, categories, favourites and promo-code checkout. The book-detail header animates as the page scrolls.",
    proof: {
      kind: "phones",
      srcs: [
        "/mobile/bookstore-1.webp",
        "/mobile/bookstore-2.webp",
        "/mobile/bookstore-3.webp",
      ],
      alt: "Three Dukagjini Bookstore store screenshots: home, a book list and favourite lists",
    },
  },
];

export const moreCount = projects.length - rows.length;

export const caseSlugs = new Set(
  projects.filter((project) => project.featured).map((project) => project.slug),
);

export const caseFor = (row: Row) =>
  caseSlugs.has(row.project.slug)
    ? row.project.slug
    : row.project.slug === "care-api"
      ? "care-platform"
      : null;

export const roleOf = (row: Row) =>
  row.project.role === "Owner" ? "Personal project" : row.project.role;

export const spoken = (row: Row) =>
  row.edit
    ? `${row.name}, ${row.years}: ${row.text} ${row.edit.was}. Now: ${row.text} ${row.edit.now}.`
    : `${row.name}, ${row.years}: ${row.text}.`;
