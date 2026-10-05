import { findProject } from "../../content/projects";

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A pin ends on a part of a live plate (a selector) or on a box in the plate's image, in fractions of the whole image. */
export type PinTarget = { kind: "selector"; css: string } | { kind: "image"; box: Box };

/**
 * The line enters the plate from its left edge. "side" enters at the part's height.
 * "lane" enters along a rule of the plate (an element's top edge) or at a clear row
 * (a fraction of the image height), then turns onto the part, so it never crosses
 * the plate's top edge.
 */
export type PinRoute = { kind: "side" } | { kind: "lane"; along: string } | { kind: "lane"; y: number };

export interface Pin {
  target: PinTarget;
  route: PinRoute;
  pill?: boolean;
}

export interface Shot {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/** A crop keeps the box of the image, in fractions; it always ends on a whole row of the screen. */
export type Plate =
  | { kind: "care"; caption: string }
  | { kind: "web"; shot: Shot; crop: Box; caption: string; dark?: boolean }
  | { kind: "phone"; shot: Shot; crop: Box; caption: string };

export interface Row {
  project?: string;
  decision: string;
  result: string;
}

export interface CardLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface Year {
  year: string;
  /** The three clauses of "Gentrit Rashiti builds A, from B to C." for this year. */
  says: [string, string, string];
  /** The first row carries the pin. */
  rows: Row[];
  plate: Plate;
  pin: Pin;
  link: CardLink;
}

const shot = (slug: string, index: number): Shot => {
  const item = findProject(slug)?.media.galleries?.[0]?.items[index];
  return { src: item?.src ?? "", alt: item?.alt ?? "", width: item?.width ?? 1440, height: item?.height ?? 900 };
};

export const years: Year[] = [
  {
    year: "2026",
    says: ["a multi-tenant platform,", "from the design system", "to the API behind it."],
    rows: [
      {
        project: "Care-management platform",
        decision: "Keep each organization's data apart on one multi-tenant system.",
        result: "Each organization sees only its own patients.",
      },
      {
        decision: "Move the frontend from Vue to React, one route at a time.",
        result: "A route moves only after its parity test passes on both apps.",
      },
      {
        project: "Design System v2",
        decision: "Generate every design token from one source, in three tiers.",
        result: "36 components, 805 tokens, 20 releases",
      },
    ],
    plate: { kind: "care", caption: "Recreation with invented data" },
    pin: {
      target: { kind: "selector", css: 'button[aria-label^="Organization"]' },
      route: { kind: "lane", along: ".border-t" },
      pill: true,
    },
    link: { label: "Open the case", href: "/work/care-platform" },
  },
  {
    year: "2025",
    says: ["Next.js web apps,", "from an institute's website", "to a member portal."],
    rows: [
      {
        project: "Bayyinah institute website",
        decision: "Build the institute's one-page site on Next.js.",
        result: "Live, with links to both app stores",
      },
      {
        project: "Member portal",
        decision: "Lay the foundation of a member portal on Next.js 15.",
        result: "Protected routes, external sign-in, the app shell",
      },
      {
        project: "Chatbot runtime, web port",
        decision: "Port the chatbot runtime from React Native to the web.",
        result: "The same scripted conversations, in TypeScript",
      },
    ],
    plate: {
      kind: "web",
      shot: shot("bayyinah-institute", 0),
      crop: { x: 0, y: 0, w: 1, h: 0.878 },
      caption: "bayyinah.org, public page",
    },
    pin: { target: { kind: "image", box: { x: 0.362, y: 0.746, w: 0.267, h: 0.07 } }, route: { kind: "side" } },
    link: { label: "bayyinah.org", href: "https://bayyinah.org/", external: true },
  },
  {
    year: "2024",
    says: ["a smart-wallet dashboard,", "from passkey sign-in", "to the asset list."],
    rows: [
      {
        project: "Incentiv",
        decision: "Sign people in with a passkey or an external wallet.",
        result: "Passkey, MetaMask and WalletConnect",
      },
      {
        decision: "Build the UI layer of the wallet dashboard on Next.js 14. Teammates built the wallet layer.",
        result: "Live, in English and French",
      },
    ],
    plate: {
      kind: "web",
      shot: shot("incentiv", 2),
      crop: { x: 0.095, y: 0.17, w: 0.81, h: 0.655 },
      dark: true,
      caption: "Portal sign-in, public screen",
    },
    pin: { target: { kind: "image", box: { x: 0.153, y: 0.553, w: 0.077, h: 0.05 } }, route: { kind: "side" } },
    link: { label: "Open the case", href: "/work/incentiv" },
  },
  {
    year: "2023",
    says: ["a video-learning platform,", "from an empty template", "to live streams."],
    rows: [
      {
        project: "Bayyinah TV",
        decision: "Sell subscriptions on the web and in both app stores.",
        result: "Stripe, Apple and Google subscriptions",
      },
      {
        decision: "Rebuild the video platform on Nuxt 3, from an empty template.",
        result: "34 routes, 270+ components, English and Arabic",
      },
      {
        project: "Viva Fresh",
        decision: "Ship a grocery app to iPhone and Android from one codebase.",
        result: "Live in both stores",
      },
      {
        project: "Care-management platform",
        decision: "Build the care platform's features on Vue (Nuxt 2).",
        result: "Four languages: EN, DE, ES, TR",
      },
    ],
    plate: {
      kind: "web",
      shot: shot("bayyinah-tv", 5),
      crop: { x: 0, y: 0, w: 1, h: 0.844 },
      dark: true,
      caption: "Bayyinah TV pricing, public page",
    },
    pin: { target: { kind: "image", box: { x: 0.363, y: 0.128, w: 0.192, h: 0.08 } }, route: { kind: "lane", y: 0.106 } },
    link: { label: "Open the case", href: "/work/bayyinah-tv" },
  },
  {
    year: "2022",
    says: ["a children's reading app,", "from an EPUB prototype", "to both app stores."],
    rows: [
      {
        project: "Read to Feed",
        decision: "Build a children's reading app around a PDF and EPUB reader.",
        result: "Reading progress on every book",
      },
      {
        decision: "Keep releasing while React Native moves from 0.63 to 0.81.",
        result: "About 14 releases to both stores",
      },
      {
        project: "Chatbot runtime library",
        decision: "Play scripted chat conversations from one React Native package.",
        result: "Message queue, typing delays, duplicate guards",
      },
    ],
    plate: {
      kind: "phone",
      shot: shot("read-to-feed", 0),
      crop: { x: 0.103, y: 0.379, w: 0.795, h: 0.388 },
      caption: "Store listing, archived",
    },
    pin: { target: { kind: "image", box: { x: 0.15, y: 0.42, w: 0.7, h: 0.135 } }, route: { kind: "side" } },
    link: { label: "Open the case", href: "/work/read-to-feed" },
  },
  {
    year: "2021",
    says: ["mobile apps,", "from the first screen", "to the store release."],
    rows: [
      {
        project: "Dukagjini Bookstore",
        decision: "Build a publisher's book shop in React Native, for iPhone and Android.",
        result: "Search, sales and checkout, live in both stores",
      },
      {
        decision: "Bring readers back with push notifications that deep-link to a book.",
        result: "A notification opens the right book",
      },
      {
        project: "Sadaqah app for Islamic Relief USA",
        decision: "Build the payment and subscription screens with Stripe, in a small team.",
        result: "Donations, subscriptions and cancelling",
      },
    ],
    plate: {
      kind: "phone",
      shot: shot("dukagjini-bookstore", 0),
      crop: { x: 0.141, y: 0.438, w: 0.718, h: 0.308 },
      caption: "Store listing",
    },
    pin: { target: { kind: "image", box: { x: 0.195, y: 0.675, w: 0.61, h: 0.042 } }, route: { kind: "side" } },
    link: { label: "Open the case", href: "/work/dukagjini-bookstore" },
  },
];

export const present = years[0].says;

export const sentenceOf = (says: readonly string[]) => `Gentrit Rashiti builds ${says.join(" ")}`;
