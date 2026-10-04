import type { RecreationKey } from "../../content/projects";
import { links } from "../../content/links";

export type MarkerSide = "left" | "right" | "below" | "top";

export interface Target {
  css: string;
  /** Exact trimmed text of the element, when the selector alone is not unique. */
  text?: string;
}

export interface Note {
  id: string;
  text: string;
  /** A pinned note points at the part of the screen that shows its fact. */
  target?: Target;
  marker?: MarkerSide;
  /** "over" and "under" route the hairline outside the screen, for a part with other controls to its right. */
  route?: "side" | "over" | "under";
  live?: "care-org";
}

export interface Shot {
  id: string;
  src: string;
  alt: string;
  label: string;
  width: number;
  height: number;
}

export type Stage =
  | {
      kind: "recreation";
      key: RecreationKey;
      pauseDemo?: boolean;
      fit?: "square";
    }
  | { kind: "shots"; shots: Shot[] };

export interface PlateLink {
  label: string;
  href: string;
  internal?: boolean;
}

export interface Plate {
  id: string;
  title: string;
  meta: string;
  source: string;
  stage: Stage;
  notes: Note[];
  links: PlateLink[];
}

export const identity = {
  name: "Gentrit Rashiti",
  line: "builds web and mobile products, from the first screen to the store release.",
  level: [
    "Frontend and mobile developer, full stack since 2026",
    "5+ years",
    "two platform rewrites",
    "Kosovo, remote",
  ],
};

export const contact = [
  { label: "Email", href: `mailto:${links.email}` },
  { label: "CV", href: links.cv },
  { label: "GitHub", href: links.github },
  { label: "LinkedIn", href: links.linkedin },
];

export const plates: Plate[] = [
  {
    id: "care",
    title: "A care platform, rebuilt one route at a time",
    meta: "Vianova · 2023 to now · Frontend and mobile, full stack since 2026",
    source: "Recreation with invented data",
    stage: { kind: "recreation", key: "care" },
    notes: [
      {
        id: "org",
        text: "Many organizations share one system. Each sees only its own patients, roles and timezone.",
        target: { css: 'button[aria-label^="Organization"]' },
        live: "care-org",
      },
      {
        id: "role",
        text: "Every screen respects the role of the person who reads it.",
        target: { css: "span", text: "Care manager" },
      },
      {
        id: "vitals",
        text: "Care teams follow vitals from connected devices.",
        target: { css: '[role="group"][aria-label^="Blood pressure"]' },
      },
      {
        id: "rewrite",
        text: "The frontend moves from Vue to React one route at a time. A route moves only after the same parity test passes on both apps.",
      },
      {
        id: "report",
        text: "On the Laravel API, one billing report went from 16 queries to 2 and no longer times out.",
      },
    ],
    links: [
      { label: "Read the case", href: "/work/care-platform", internal: true },
    ],
  },
  {
    id: "design-system",
    title: "Design System v2, from one token source",
    meta: "Vianova · 2026 · Design system",
    source: "Recreation with invented data",
    stage: { kind: "recreation", key: "design-system", pauseDemo: true },
    notes: [
      {
        id: "tiers",
        text: "805 design tokens in three tiers: core, semantic and component.",
        target: { css: '[aria-label^="How tokens resolve"]' },
      },
      {
        id: "source",
        text: "One source builds the CSS, the TypeScript and the Figma bundle.",
        target: { css: ".dsr-pipeline" },
        marker: "right",
      },
      {
        id: "components",
        text: "36 components, each with a story, unit tests and axe tests.",
        target: { css: ".dsr-area-steps" },
        marker: "top",
      },
      {
        id: "a11y",
        text: "Built to WCAG 2.1 AA floors, with automated, rendered checks.",
      },
      {
        id: "releases",
        text: "20 releases in about six weeks. A consumer that uses only Button loads 96.6% less JavaScript.",
      },
    ],
    links: [
      {
        label: "Read the case",
        href: "/work/design-system-react",
        internal: true,
      },
    ],
  },
  {
    id: "bayyinah",
    title: "Bayyinah TV, rebuilt with live streams",
    meta: "2023 to 2026 · Frontend, core team",
    source: "Recreation with invented data",
    stage: { kind: "recreation", key: "live-room" },
    notes: [
      {
        id: "live",
        text: "Live streams on AWS IVS.",
        target: { css: "span", text: "LIVE" },
        marker: "below",
        route: "over",
      },
      {
        id: "premium",
        text: "A paywall for premium content: Stripe, Apple and Google subscriptions, gifts and promo codes.",
        target: { css: 'button[role="switch"]', text: "Premium" },
        route: "over",
      },
      {
        id: "chat",
        text: "Realtime chat with moderation.",
        target: { css: '[aria-label="Live chat"]' },
        marker: "top",
      },
      {
        id: "quality",
        text: "An HLS player with a quality selector.",
        target: { css: 'button[aria-label^="Quality"]' },
        route: "under",
      },
      {
        id: "rebuild",
        text: "A full rebuild on Nuxt 3 from an empty template: 34 routes, 270+ components, English and Arabic with a right-to-left layout.",
      },
    ],
    links: [
      { label: "Read the case", href: "/work/bayyinah-tv", internal: true },
      { label: "bayyinahtv.com", href: "https://bayyinahtv.com/" },
    ],
  },
  {
    id: "read-to-feed",
    title: "Read to Feed, four years of releases",
    meta: "2022 to 2025 · Mobile, iOS and Android",
    source: "Recreation with invented data",
    stage: { kind: "recreation", key: "reader", fit: "square" },
    notes: [
      {
        id: "reader",
        text: "A PDF and EPUB reader with progress tracking.",
        target: { css: '[aria-label^="Page "]' },
      },
      {
        id: "scan",
        text: "An ISBN barcode scanner on the camera.",
        target: { css: '[aria-label="Scan a book"]' },
      },
      {
        id: "releases",
        text: "About 14 releases to both stores. React Native 0.63 to 0.81 through three major upgrades.",
      },
    ],
    links: [
      { label: "Read the case", href: "/work/read-to-feed", internal: true },
      {
        label: "App Store (archived)",
        href: "https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765",
      },
    ],
  },
  {
    id: "shipped",
    title: "Also in the stores and on the web",
    meta: "2021 to 2024 · Mobile and frontend",
    source: "Screens from public store and web pages",
    stage: {
      kind: "shots",
      shots: [
        {
          id: "viva",
          src: "/mobile/grocery-1.webp",
          alt: "Viva Fresh store screenshot on iPhone: home with product categories and latest products, Albanian interface",
          label: "Viva Fresh",
          width: 780,
          height: 1689,
        },
        {
          id: "dukagjini",
          src: "/mobile/bookstore-1.webp",
          alt: "Dukagjini Bookstore store screenshot: home with book search, top categories and books on sale",
          label: "Dukagjini Bookstore",
          width: 780,
          height: 1689,
        },
        {
          id: "incentiv",
          src: "/showcase/incentiv/web-03.webp",
          alt: "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
          label: "Incentiv portal",
          width: 1440,
          height: 900,
        },
      ],
    },
    notes: [
      {
        id: "viva",
        text: "Viva Fresh: grocery orders with delivery slots, loyalty and a map search for the address. One React Native codebase for both stores.",
        target: { css: '[data-shot="viva"]' },
      },
      {
        id: "dukagjini",
        text: "Dukagjini Bookstore: a push notification opens the right book through a deep link.",
        target: { css: '[data-shot="dukagjini"]' },
      },
      {
        id: "incentiv",
        text: "Incentiv: the passkey and wallet sign-in UI. Teammates built the wallet layer.",
        target: { css: '[data-shot="incentiv"]' },
      },
    ],
    links: [
      {
        label: "Viva Fresh",
        href: "https://apps.apple.com/us/app/viva-fresh/id1580739480",
      },
      {
        label: "Dukagjini Bookstore",
        href: "https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342",
      },
      { label: "Incentiv portal", href: "https://portal.incentiv.io/" },
    ],
  },
];
