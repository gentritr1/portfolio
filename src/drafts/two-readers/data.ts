import { careShots, dsShots } from "../../content/careShots";

export type Reader = "plain" | "engineer";

/** A box in source pixels of an image. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * A screenshot is cropped to the frame's ratio and never shown larger than its source pixels.
 * With `fill`, only the crop is shown, centred on that colour; the colour is sampled from the screen around the crop.
 */
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
  fill?: string;
}

/** A result with no screen: the figure is the plate. */
export interface FigurePlate {
  kind: "figure";
}

export type Plate = ShotPlate | FigurePlate;

export type Target = { kind: "selector"; css: string } | { kind: "shot"; box: Box };

export interface Words {
  /** Role and years for the plain reader; the stack for the engineer. */
  meta: string;
  /** The problem, or what had to exist. */
  line: string;
  /** The result. It carries the hairline. */
  result: string;
  target: Target;
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

export const identity: Record<Reader, { title: string; line: string }> = {
  plain: {
    title: "Gentrit Rashiti has built web and mobile apps for 5+ years: apps people read in, shop in and learn from.",
    line: "Part of two platform rewrites. Also works on the server side since 2026. Based in Kosovo, working remotely.",
  },
  engineer: {
    title: "Gentrit Rashiti has shipped TypeScript for 5+ years: Vue and React on the web, React Native to both app stores.",
    line: "Part of two rewrites: Bayyinah TV on Nuxt 3, the care platform from Vue to React. Laravel since 2026. Kosovo, remote.",
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
    project: "Read to Feed",
    plate: {
      kind: "shot",
      src: "/mobile/reading-1.webp",
      alt: "Read to Feed store screenshot: My Books, with 36% read of The Tale of Peter Rabbit and 90% of Anne of Green Gables",
      width: 780,
      height: 1689,
      crop: { x: 82, y: 514, w: 618, h: 773 },
      narrow: { x: 82, y: 652, w: 618, h: 464 },
    },
    caption: "Store screenshot, iPhone. Shipped; the listings are now archived.",
    plain: {
      meta: "Mobile · 2022–25",
      line: "A reading app for children. About 14 updates shipped to both stores.",
      result: "It kept each child's place in every book.",
      target: { kind: "shot", box: { x: 330, y: 852, w: 312, h: 54 } },
    },
    engineer: {
      meta: "React Native · Redux Toolkit · epub.js",
      line: "PDF and EPUB reader on maintained forks. About 14 releases.",
      result: "Progress per book, React Native 0.63 to 0.81.",
      target: { kind: "shot", box: { x: 330, y: 852, w: 312, h: 54 } },
    },
    link: { href: "/work/read-to-feed", name: "Read to Feed" },
  },
  {
    id: "02",
    project: "Care platform, server side",
    plate: { kind: "figure" },
    caption: "Database trips for one billing report, before and after.",
    plain: {
      meta: "Full stack · 2026",
      line: "One billing report asked the database 16 times and gave up.",
      result: "Now it asks 2 times and finishes.",
      target: { kind: "selector", css: "[data-proof='done']" },
    },
    engineer: {
      meta: "Laravel 13 · PHP 8.3 · MySQL · Redis",
      line: "Laravel billing report: 16 queries, then a timeout.",
      result: "2 queries, no timeout.",
      target: { kind: "selector", css: "[data-proof='count']" },
    },
    link: { href: "/work/care-platform", name: "the care platform" },
  },
  {
    id: "03",
    project: "Care-management platform",
    plate: {
      kind: "shot",
      src: careShots.patients.src,
      alt: careShots.overview.alt,
      width: 1440,
      height: 900,
      crop: { x: 236, y: 74, w: 608, h: 760 },
      narrow: careShots.patients.crop,
      fill: careShots.patients.ground,
    },
    caption: "Patients of one organization. Real product screens · invented data.",
    plain: {
      meta: "Frontend · 2023–26",
      line: "Many client organizations use the same system.",
      result: "Each one sees only its own patients.",
      target: { kind: "shot", box: { x: 287, y: 313, w: 152, h: 154 } },
    },
    engineer: {
      meta: "Nuxt 2 → React 19 · TanStack · Zod",
      line: "Multi-tenant Nuxt 2 app. Most screens rebuilt in React in 2026.",
      result: "Data and roles scoped per organization.",
      target: { kind: "shot", box: { x: 287, y: 313, w: 152, h: 154 } },
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
      crop: { x: 94, y: 480, w: 594, h: 760 },
      narrow: { x: 94, y: 480, w: 594, h: 350 },
      fill: "#f1f3f3",
    },
    caption: "App Store listing, iPhone. Also on Google Play.",
    plain: {
      meta: "Mobile · 2023",
      line: "One grocery app, built once for iPhone and Android.",
      result: "Shopping in Albanian, live in both app stores.",
      target: { kind: "shot", box: { x: 128, y: 500, w: 522, h: 148 } },
    },
    engineer: {
      meta: "React Native · Redux Toolkit · Firebase",
      line: "One React Native codebase, shipped to iOS and Android.",
      result: "Category grid, cart and delivery slots, in Albanian.",
      target: { kind: "shot", box: { x: 128, y: 500, w: 522, h: 148 } },
    },
    link: { href: "/work/viva-fresh", name: "Viva Fresh" },
  },
  {
    id: "05",
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
      line: "Version 2 of a video-learning platform, built from nothing: 34 pages.",
      result: "Members subscribe on the web, iPhone or Android.",
      target: { kind: "shot", box: { x: 40, y: 522, w: 272, h: 44 } },
    },
    engineer: {
      meta: "Nuxt 3 · Vue 3 · Pinia · AWS IVS · Stripe",
      line: "Nuxt 3 rebuild from an empty template: 34 pages, 270+ components.",
      result: "Stripe, Apple and Google subscriptions, with a premium paywall.",
      target: { kind: "shot", box: { x: 40, y: 522, w: 272, h: 44 } },
    },
    link: { href: "/work/bayyinah-tv", name: "Bayyinah TV" },
  },
  {
    id: "06",
    project: "Incentiv",
    plate: {
      kind: "shot",
      src: "/showcase/incentiv/web-03.webp",
      alt: "Incentiv portal sign-in: Passkey, MetaMask and WalletConnect buttons",
      width: 1440,
      height: 900,
      crop: { x: 186, y: 252, w: 576, h: 404 },
      narrow: { x: 186, y: 252, w: 576, h: 404 },
      dark: true,
      fill: "#252623",
    },
    caption: "Incentiv portal sign-in, public screen.",
    plain: {
      meta: "Frontend, the screens · 2024",
      line: "Screens for a crypto wallet. Teammates built the wallet itself.",
      result: "Sign in with a passkey (no password) or a wallet.",
      target: { kind: "shot", box: { x: 224, y: 500, w: 102, h: 40 } },
    },
    engineer: {
      meta: "Next.js 14 · RTK Query · next-intl",
      line: "Next.js 14 UI. Teammates built the wallet and chain.",
      result: "Passkey, MetaMask or WalletConnect, EN and FR.",
      target: { kind: "shot", box: { x: 224, y: 500, w: 470, h: 40 } },
    },
    link: { href: "/work/incentiv", name: "Incentiv" },
  },
  {
    id: "07",
    project: "Design System v2",
    plate: {
      kind: "shot",
      src: dsShots.dateRange.src,
      alt: dsShots.dateRange.alt,
      width: dsShots.dateRange.width,
      height: dsShots.dateRange.height,
      crop: dsShots.dateRange.crop,
      narrow: dsShots.dateRangeJune.crop,
      fill: dsShots.dateRange.ground,
    },
    caption: "Shared parts in Storybook. Real product screens · invented data.",
    plain: {
      meta: "Design system, with the team · 2026",
      line: "The team built shared screen parts for the new care dashboard.",
      result: "36 ready-made parts, released 20 times in about six weeks.",
      target: { kind: "shot", box: { x: 14, y: 22, w: 522, h: 38 } },
    },
    engineer: {
      meta: "React 19 · CSS Modules · Storybook 10",
      line: "36 components, 805 tokens in three tiers, 20 releases in about six weeks.",
      result: "One source builds CSS, TypeScript and a Figma bundle.",
      target: { kind: "shot", box: { x: 16, y: 144, w: 690, h: 156 } },
    },
    link: { href: "/work/design-system-react", name: "Design System v2" },
  },
];

/** The switch, shown working on one real pair of lines before anyone presses it. */
export const hook = {
  lead: "Every line here is written twice. Pick the reader in the bar at the top.",
  plain: "built once for iPhone and Android",
  engineer: "one React Native codebase",
};

/** Own-project captures are 2x: two source pixels make one CSS pixel. A crop is never shown larger than its CSS size. */
export interface OwnShot {
  src: string;
  alt: string;
  width: number;
  height: number;
  crop: Box;
}

export interface Own {
  name: string;
  /** "Concept" marks a made-up brand. */
  kind: string;
  wide: OwnShot;
  narrow: OwnShot;
  plain: string;
  engineer: string;
  link?: { href: string; label: string };
}

export const ownIntro: Record<Reader, string> = {
  plain: "Made outside client work: one app and two concepts. The OFFBEAT and FORM brands are made up.",
  engineer: "Outside client work: one app and two concepts. OFFBEAT and FORM are fictional brands.",
};

export const own: Own[] = [
  {
    name: "Offday",
    kind: "Own project · 2026",
    wide: {
      src: "/personal/shots/offday-light-best-dates-desktop.webp",
      alt: "Offday best dates: spend 3 days in the next 3 months, with five suggestions such as Fri 6 to Wed 11 Nov, 6 days off for 3 around Veterans Day",
      width: 2880,
      height: 1800,
      crop: { x: 992, y: 892, w: 896, h: 792 },
    },
    narrow: {
      src: "/personal/shots/offday-light-best-dates-phone.webp",
      alt: "Offday best dates on a phone: spend 3 days in the next 3 months, with three suggestions of 6 days off for 3",
      width: 780,
      height: 1688,
      crop: { x: 76, y: 1100, w: 628, h: 492 },
    },
    plain: "A time-off app for teams. It finds the dates that give the longest break.",
    engineer: "Next.js 16, SQLite and Zod. About 200 Playwright tests, tenant isolation included.",
  },
  {
    name: "OFFBEAT",
    kind: "Concept · 2026",
    wide: {
      src: "/personal/shots/offbeat-studio-desktop.webp",
      alt: "OFFBEAT sound studio: an eight-step drum machine with kick, snare, hi-hat and bass rows, the playing step in red, and the presets Kitchen disco, Sunday slow and Night drive",
      width: 2880,
      height: 1800,
      crop: { x: 1200, y: 100, w: 1520, h: 830 },
    },
    narrow: {
      src: "/personal/shots/offbeat-phone.webp",
      alt: "OFFBEAT on a phone: the hot-orange speaker in 3D, with eight step lights on its grille",
      width: 780,
      height: 1688,
      crop: { x: 66, y: 930, w: 676, h: 620 },
    },
    plain: "A made-up speaker brand. Its sound studio is a working drum machine.",
    engineer: "Next.js 16, Three.js and Web Audio: a 3D speaker and an eight-step drum machine.",
    link: { href: "https://github.com/gentritr1/offbeat", label: "OFFBEAT on GitHub" },
  },
  {
    name: "FORM",
    kind: "Concept · 2026",
    wide: {
      src: "/personal/shots/form-studio-desktop.webp",
      alt: "FORM collection: the Trefoil in copper, with its formula p(t) = ((2 + cos 3t) cos 2t, (2 + cos 3t) sin 2t, sin 3t)",
      width: 2880,
      height: 1800,
      crop: { x: 80, y: 400, w: 1464, h: 1332 },
    },
    narrow: {
      src: "/personal/shots/form-phone.webp",
      alt: "FORM on a phone: the copper trefoil sculpture",
      width: 780,
      height: 1688,
      crop: { x: 60, y: 996, w: 680, h: 654 },
    },
    plain: "A made-up sculpture show. Each sculpture is drawn live from a math formula.",
    engineer: "WebGL with no dependencies: three mathematical sculptures, rendered live.",
    link: { href: "https://github.com/gentritr1/form", label: "FORM on GitHub" },
  },
];
