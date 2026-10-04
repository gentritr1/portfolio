import { findProject, type RecreationKey } from "../../content/projects";

export type ChangeKind =
  | "Rebuilt"
  | "Added"
  | "Shipped"
  | "Improved"
  | "Upgraded"
  | "Ported"
  | "Maintained";

export interface PlateImage {
  src: string;
  alt: string;
}

export type Plate = { title: string; thumb: string; thumbDark?: string } & (
  | { kind: "recreation"; recreation: RecreationKey; hint: string }
  | { kind: "web" | "phone"; images: PlateImage[] }
);

export interface PlateLink {
  label: string;
  href: string;
}

export interface Change {
  kind: ChangeKind;
  text: string;
  /** Years, area and platform, in one quiet line. */
  meta: string;
  plate?: Plate;
  /** Case page slug under /work. */
  caseSlug?: string;
  links?: PlateLink[];
  /** A later release that continues this change. */
  continues?: number;
}

export interface Release {
  major: number;
  years: string;
  /** Position on the time rail, in fractional years. */
  at: number;
  title: string;
  /** Ends the page statement while this release is selected. */
  clause: string;
  scope: string[];
  role: string;
  changes: Change[];
}

const shots = (slug: string, count: number): PlateImage[] =>
  (findProject(slug)?.media.galleries?.[0]?.items ?? [])
    .slice(0, count)
    .map(({ src, alt }) => ({ src, alt }));

const linksOf = (slug: string, labels?: string[]): PlateLink[] =>
  (findProject(slug)?.links ?? []).filter(
    (link) => !labels || labels.includes(link.label),
  );

const named = (slug: string, label: string): PlateLink[] =>
  linksOf(slug).map((link) => ({ label, href: link.href }));

const thumbOf = (slug: string) => findProject(slug)?.media.shot?.src ?? "";

const personal = ["fjale", "za", "morse-trainer"].map((slug) => {
  const item = findProject(slug)?.media.galleries?.[0]?.items[0];
  return { src: item?.src ?? "", alt: item?.alt ?? "" };
});

export const releases: Release[] = [
  {
    major: 5,
    years: "2026",
    at: 2026,
    title: "Full stack, and a design system",
    clause: "adds the API behind them",
    scope: ["Web", "iOS", "Android", "API", "Design system"],
    role: "Frontend and mobile, full stack since 2026",
    changes: [
      {
        kind: "Rebuilt",
        text: "A care-management platform, moved from Vue to React one route at a time. A route moves over only after its parity tests show the same behaviour in both apps.",
        meta: "2026 · Healthcare · Multi-tenant, four languages",
        plate: {
          kind: "recreation",
          recreation: "care",
          title: "Vitals trend card",
          thumb: "/signal-posters/healthcare.avif",
          hint: "Switch the organization: the patient data and the colour change with it.",
        },
        caseSlug: "care-platform",
      },
      {
        kind: "Added",
        text: "Design System v2: 36 components and 805 design tokens in three tiers, from one source to CSS, TypeScript and Figma. 20 releases in about six weeks.",
        meta: "2026 · React, TypeScript, Storybook",
        plate: {
          kind: "recreation",
          recreation: "design-system",
          title: "Component specimen",
          thumb: "/showcase/design-system/specimen-light.webp",
          thumbDark: "/showcase/design-system/specimen-dark.webp",
          hint: "Switch Light and Dark: the semantic tokens re-point live.",
        },
        caseSlug: "design-system-react",
      },
      {
        kind: "Improved",
        text: "A billing report in the Laravel API went from 16 queries to 2. It no longer times out.",
        meta: "2026 · Laravel API",
      },
      {
        kind: "Added",
        text: "More API work on the same platform: enrollment drafts, a lab catalog and multi-tenant security fixes.",
        meta: "2026 · Laravel 13, PHP 8.3, MySQL, Redis",
      },
      {
        kind: "Shipped",
        text: "Three games of his own, live on the web: FJALË, a daily Albanian word game with a 21k-word dictionary; Za!, a multiplayer card game for 2–8 players; and Morse Trainer.",
        meta: "2026 · Personal · Web",
        plate: { kind: "web", title: "FJALË, Za! and Morse Trainer", thumb: thumbOf("fjale"), images: personal },
        links: [...named("fjale", "FJALË"), ...named("za", "Za!"), ...named("morse-trainer", "Morse Trainer")],
      },
    ],
  },
  {
    major: 4,
    years: "2024–25",
    at: 2024.5,
    title: "Web3, and portals on Next.js",
    clause: "adds a Web3 wallet and portals on Next.js",
    scope: ["Web", "iOS", "Android"],
    role: "Frontend",
    changes: [
      {
        kind: "Added",
        text: "The frontend of Incentiv, a smart-wallet dashboard: passkey and wallet sign-in, dashboard cards, a balance popup with a QR address, English and French.",
        meta: "2024 · Web3 · Next.js 14, RTK Query",
        plate: { kind: "web", title: "Incentiv", thumb: "/showcase/incentiv/web-01.webp", images: shots("incentiv", 3) },
        caseSlug: "incentiv",
        links: linksOf("incentiv", ["Website", "Portal"]),
      },
      {
        kind: "Shipped",
        text: "bayyinah.org, a one-page Next.js site: mission, support, research funding, impact and FAQ.",
        meta: "2024–25 · Web · Next.js",
        plate: { kind: "web", title: "bayyinah.org", thumb: "/showcase/bayyinah/org-01.webp", images: shots("bayyinah-institute", 3) },
        links: linksOf("bayyinah-institute"),
      },
      {
        kind: "Added",
        text: "The foundation of a member portal: protected routes, external sign-in, the app shell and its layout.",
        meta: "2025 · Next.js 15, next-intl, Pusher",
      },
      {
        kind: "Ported",
        text: "The chatbot runtime from React Native to the web, in TypeScript, with an example app.",
        meta: "2025 · React 19, Vite, Zustand",
      },
    ],
  },
  {
    major: 3,
    years: "2023",
    at: 2023,
    title: "Platforms on the web",
    clause: "takes them to the web, with two platforms",
    scope: ["Web", "iOS", "Android"],
    role: "Frontend, core team",
    changes: [
      {
        kind: "Rebuilt",
        text: "Bayyinah TV, a video-learning platform, rebuilt on Nuxt 3 from an empty template: live streams with realtime chat and moderation, an HLS player with a paywall, Stripe, Apple and Google subscriptions.",
        meta: "2023–26 · Streaming · 34 routes, 270+ components, English and Arabic",
        plate: { kind: "web", title: "Bayyinah TV", thumb: "/showcase/bayyinah/web-01.webp", images: shots("bayyinah-tv", 3) },
        caseSlug: "bayyinah-tv",
        links: linksOf("bayyinah-tv"),
      },
      {
        kind: "Added",
        text: "Features of a care-management platform on Vue: patient profile, care plans, labs and vitals, claims and calls, for many client organizations on one multi-tenant system.",
        meta: "2023–26 · Healthcare · Nuxt 2, four languages",
        continues: 5,
      },
      {
        kind: "Shipped",
        text: "Viva Fresh, a grocery app for iOS and Android: delivery slots, a loyalty programme, a wishlist and address search on a map.",
        meta: "2023 · Mobile · React Native, Redux Toolkit",
        plate: { kind: "phone", title: "Viva Fresh", thumb: thumbOf("viva-fresh"), images: shots("viva-fresh", 3) },
        caseSlug: "viva-fresh",
        links: linksOf("viva-fresh"),
      },
    ],
  },
  {
    major: 2,
    years: "2022",
    at: 2022,
    title: "Reading, release after release",
    clause: "ships one reading app, release after release",
    scope: ["iOS", "Android"],
    role: "Mobile, iOS and Android",
    changes: [
      {
        kind: "Shipped",
        text: "Read to Feed, a children's reading app: a PDF and EPUB reader, ISBN barcode scanning, badges and streaks. About 14 releases to both stores.",
        meta: "2022–25 · Mobile · React Native, three languages",
        plate: { kind: "phone", title: "Read to Feed", thumb: thumbOf("read-to-feed"), images: shots("read-to-feed", 4) },
        caseSlug: "read-to-feed",
        links: linksOf("read-to-feed"),
      },
      {
        kind: "Upgraded",
        text: "The same app, from React Native 0.63 to 0.81 through three major upgrades.",
        meta: "2022–25 · Mobile",
      },
      {
        kind: "Added",
        text: "A chatbot runtime library that plays scripted conversations, with a message queue, natural typing delays and duplicate guards.",
        meta: "2022–25 · React Native, Redux Toolkit",
        continues: 4,
      },
      {
        kind: "Maintained",
        text: "Forks of epubjs-react-native and react-native-pdf, used in the production reading app.",
        meta: "2022 · Open source",
        links: [{ label: "GitHub", href: "https://github.com/gentritr1" }],
      },
    ],
  },
  {
    major: 1,
    years: "2021",
    at: 2021,
    title: "First mobile apps",
    clause: "ships the first apps, on iOS and Android",
    scope: ["iOS", "Android"],
    role: "Mobile",
    changes: [
      {
        kind: "Shipped",
        text: "Dukagjini Bookstore, a shopping app for a publisher: push notifications with deep links, an animated book-detail header, checkout with promo codes.",
        meta: "2021–22 · Mobile · React Native, Redux",
        plate: { kind: "phone", title: "Dukagjini Bookstore", thumb: thumbOf("dukagjini-bookstore"), images: shots("dukagjini-bookstore", 3) },
        caseSlug: "dukagjini-bookstore",
        links: linksOf("dukagjini-bookstore"),
      },
      {
        kind: "Added",
        text: "Payment and subscription screens with Stripe, badges and Android builds for the Sadaqah app for Islamic Relief USA, as a team member.",
        meta: "2021–22 · Mobile · React Native, Stripe",
      },
    ],
  },
];

export const newest = releases[0].major;
export const oldest = releases[releases.length - 1].major;
export const releaseOf = (major: number) =>
  releases.find((release) => release.major === major) ?? releases[0];

/** Scope items that a release adds to the release before it. */
export function addedScope(major: number): Set<string> {
  const index = releases.findIndex((release) => release.major === major);
  const previous = releases[index + 1];
  const current = releases[index];
  if (!current || !previous) return new Set();
  return new Set(current.scope.filter((item) => !previous.scope.includes(item)));
}
