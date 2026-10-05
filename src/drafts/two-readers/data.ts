import type { RecreationKey } from "../../content/projects";

export type Reader = "plain" | "engineer";

/** A box in source pixels of an image, or in design pixels of a live plate. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A live plate renders at its design width and scales to the frame's width. */
export interface LivePlate {
  kind: "live";
  key: Extract<RecreationKey, "care" | "design-system" | "reader">;
  /** Design width in the 4:5 frame. */
  width: number;
  /** Design width in the 4:3 phone plate. */
  narrowWidth: number;
}

/** A screenshot is cropped to the frame's ratio and never shown larger than its source pixels. */
export interface ShotPlate {
  kind: "shot";
  src: string;
  alt: string;
  width: number;
  height: number;
  /** 4:5 crop for the wide frame. */
  crop: Box;
  /** 4:3 crop for the phone plate. */
  narrow: Box;
  dark?: boolean;
}

/** A result with no screen: the figure is the plate. */
export interface FigurePlate {
  kind: "figure";
}

export type Plate = LivePlate | ShotPlate | FigurePlate;

export type Target = { kind: "selector"; css: string; round?: boolean } | { kind: "shot"; box: Box };

/** "side": the line enters at the part's height. "along": it runs on a rule inside the plate, then turns onto the part. */
export type Route = { kind: "side" } | { kind: "along"; css: string };

export interface Words {
  /** Role and years for the plain reader; the stack for the engineer. */
  meta: string;
  /** The problem, or what had to exist. */
  line: string;
  /** The result. It carries the hairline. */
  result: string;
  target: Target;
  route: Route;
}

export interface Row {
  id: string;
  project: string;
  plate: Plate;
  caption: string;
  plain: Words;
  engineer: Words;
  link: { href: string; name: string };
}

const side: Route = { kind: "side" };

export const identity: Record<Reader, { title: string; line: string }> = {
  plain: {
    title: "Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them.",
    line: "Part of two platform rewrites. Based in Kosovo, working remotely.",
  },
  engineer: {
    title: "Gentrit Rashiti builds React, React Native and Vue apps in TypeScript, and the Laravel APIs behind them.",
    line: "Rewrites: Bayyinah TV on Nuxt 3, the care platform from Vue to React. Kosovo, remote.",
  },
};

export const figure: Record<Reader, { title: string; before: string; after: string; stop: string; done: string }> = {
  plain: {
    title: "One billing report",
    before: "trips to the database",
    after: "trips to the database",
    stop: "Gave up",
    done: "Finished",
  },
  engineer: {
    title: "Billing report, Laravel API",
    before: "queries",
    after: "queries",
    stop: "Timeout",
    done: "No timeout",
  },
};

export const rows: Row[] = [
  {
    id: "01",
    project: "Care platform, server side",
    plate: { kind: "figure" },
    caption: "Database trips for one billing report, before and after.",
    plain: {
      meta: "Full stack · 2026",
      line: "One billing report asked the database 16 times and gave up.",
      result: "Now it asks 2 times and finishes.",
      target: { kind: "selector", css: "[data-proof='done']" },
      route: side,
    },
    engineer: {
      meta: "Laravel 13 · PHP 8.3 · MySQL · Redis",
      line: "Laravel billing report: 16 queries, then a timeout.",
      result: "2 queries, no timeout.",
      target: { kind: "selector", css: "[data-proof='count']" },
      route: side,
    },
    link: { href: "/work/care-platform", name: "the care platform" },
  },
  {
    id: "02",
    project: "Bayyinah TV",
    plate: {
      kind: "shot",
      src: "/showcase/bayyinah/web-01.webp",
      alt: "Bayyinah TV home page: Quran Studies Made Simple, the 7-day free trial button and the learner count",
      width: 1440,
      height: 900,
      crop: { x: 24, y: 140, w: 600, h: 750 },
      narrow: { x: 24, y: 196, w: 600, h: 450 },
      dark: true,
    },
    caption: "Bayyinah TV home page, public.",
    plain: {
      meta: "Frontend, core team · 2023–26",
      line: "The video-learning platform, rebuilt from an empty page: 34 pages.",
      result: "Members subscribe on the web, iPhone or Android.",
      target: { kind: "shot", box: { x: 40, y: 522, w: 272, h: 44 } },
      route: side,
    },
    engineer: {
      meta: "Nuxt 3 · Vue 3 · Pinia · AWS IVS · Stripe",
      line: "Nuxt 3 rebuild from an empty template: 34 routes, 270+ components.",
      result: "Stripe, Apple and Google subscriptions; premium paywall.",
      target: { kind: "shot", box: { x: 40, y: 522, w: 272, h: 44 } },
      route: side,
    },
    link: { href: "/work/bayyinah-tv", name: "Bayyinah TV" },
  },
  {
    id: "03",
    project: "Care-management platform",
    plate: { kind: "live", key: "care", width: 520, narrowWidth: 460 },
    caption: "Vitals card for one organization. Recreation · invented data.",
    plain: {
      meta: "Frontend · 2023–26",
      line: "Many client organizations use the same system.",
      result: "Each one sees only its own patients.",
      target: { kind: "selector", css: 'button[aria-label^="Organization"]', round: true },
      route: { kind: "along", css: ".border-t" },
    },
    engineer: {
      meta: "React 19 · TypeScript · TanStack · Zod",
      line: "Multi-tenant Nuxt 2 app, moving to React route by route.",
      result: "Data and roles scoped per organization.",
      target: { kind: "selector", css: 'button[aria-label^="Organization"]', round: true },
      route: { kind: "along", css: ".border-t" },
    },
    link: { href: "/work/care-platform", name: "the care platform" },
  },
  {
    id: "04",
    project: "Viva Fresh",
    plate: {
      kind: "shot",
      src: "/mobile/grocery-1.webp",
      alt: "Viva Fresh on iPhone: the home screen with product categories in Albanian and the latest products",
      width: 780,
      height: 1689,
      crop: { x: 102, y: 492, w: 576, h: 720 },
      narrow: { x: 102, y: 470, w: 576, h: 432 },
    },
    caption: "App Store listing, iPhone. Also on Google Play.",
    plain: {
      meta: "Mobile · 2023",
      line: "One grocery app, built once for iPhone and Android.",
      result: "Shopping in Albanian, live in both app stores.",
      target: { kind: "shot", box: { x: 128, y: 500, w: 522, h: 148 } },
      route: side,
    },
    engineer: {
      meta: "React Native · Redux Toolkit · Firebase",
      line: "One React Native codebase, shipped to iOS and Android.",
      result: "Category grid, cart and delivery slots, in Albanian.",
      target: { kind: "shot", box: { x: 128, y: 500, w: 522, h: 148 } },
      route: side,
    },
    link: { href: "/work/viva-fresh", name: "Viva Fresh" },
  },
  {
    id: "05",
    project: "Incentiv",
    plate: {
      kind: "shot",
      src: "/showcase/incentiv/web-03.webp",
      alt: "Incentiv portal sign-in: Passkey, MetaMask and WalletConnect buttons",
      width: 1440,
      height: 900,
      crop: { x: 190, y: 100, w: 576, h: 720 },
      narrow: { x: 190, y: 268, w: 576, h: 432 },
      dark: true,
    },
    caption: "Incentiv portal sign-in, public screen.",
    plain: {
      meta: "Frontend, the screens · 2024",
      line: "Screens for a crypto wallet. Teammates built the wallet itself.",
      result: "Sign in with a passkey (no password) or a wallet.",
      target: { kind: "shot", box: { x: 224, y: 500, w: 102, h: 40 } },
      route: side,
    },
    engineer: {
      meta: "Next.js 14 · RTK Query · next-intl",
      line: "Next.js 14 UI; teammates built the wallet and chain.",
      result: "Passkey, MetaMask or WalletConnect, EN and FR.",
      target: { kind: "shot", box: { x: 224, y: 500, w: 470, h: 40 } },
      route: side,
    },
    link: { href: "/work/incentiv", name: "Incentiv" },
  },
  {
    id: "06",
    project: "Read to Feed",
    plate: { kind: "live", key: "reader", width: 400, narrowWidth: 420 },
    caption: "Reader page. Recreation · public-domain text.",
    plain: {
      meta: "Mobile · 2022–25",
      line: "A reading app for children. Books open inside the app.",
      result: "It remembers the page. About 14 updates shipped.",
      target: { kind: "selector", css: "div:has(> .h-\\[3px\\])" },
      route: side,
    },
    engineer: {
      meta: "React Native · Redux Toolkit · epub.js",
      line: "PDF and EPUB reader on maintained library forks.",
      result: "Progress per book, React Native 0.63 to 0.81.",
      target: { kind: "selector", css: "div:has(> .h-\\[3px\\])" },
      route: side,
    },
    link: { href: "/work/read-to-feed", name: "Read to Feed" },
  },
  {
    id: "07",
    project: "Design System v2",
    plate: { kind: "live", key: "design-system", width: 460, narrowWidth: 440 },
    caption: "Token card. Recreation · invented data.",
    plain: {
      meta: "Design system, team work · 2026",
      line: "The team built 36 shared screen parts for the new care dashboard.",
      result: "Colours, sizes and type are set once, for code and Figma.",
      target: { kind: "selector", css: ".dsr-pipeline" },
      route: side,
    },
    engineer: {
      meta: "React 19 · CSS Modules · Storybook 10",
      line: "36 components, 805 tokens in three tiers, 20 releases in about six weeks.",
      result: "One source builds CSS, TypeScript and a Figma bundle.",
      target: { kind: "selector", css: ".dsr-pipeline" },
      route: side,
    },
    link: { href: "/work/design-system-react", name: "Design System v2" },
  },
  {
    id: "08",
    project: "Dukagjini Bookstore",
    plate: {
      kind: "shot",
      src: "/mobile/bookstore-1.webp",
      alt: "Dukagjini Bookstore on iPhone: the home screen with book search and top categories",
      width: 780,
      height: 1689,
      crop: { x: 110, y: 720, w: 560, h: 700 },
      narrow: { x: 110, y: 1030, w: 560, h: 420 },
    },
    caption: "App Store listing, iPhone. Also on Google Play.",
    plain: {
      meta: "Mobile · 2021–22",
      line: "A publisher's bookshop app for iPhone and Android.",
      result: "Search, sales and checkout, live in both app stores.",
      target: { kind: "shot", box: { x: 155, y: 1145, w: 470, h: 60 } },
      route: side,
    },
    engineer: {
      meta: "React Native · Redux · Firebase Messaging",
      line: "Push notifications deep-link to the right book.",
      result: "Search, categories and promo-code checkout on iOS and Android.",
      target: { kind: "shot", box: { x: 155, y: 1145, w: 470, h: 60 } },
      route: side,
    },
    link: { href: "/work/dukagjini-bookstore", name: "Dukagjini Bookstore" },
  },
];
