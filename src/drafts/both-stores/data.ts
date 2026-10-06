export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Listing {
  src: string;
  alt: string;
  /** Size of the store frame in image pixels. */
  width: number;
  height: number;
  /** The app screen inside the store frame, ending on a whole row. */
  crop: Box;
  /** A shorter crop for the phone layout, also ending on a whole row. */
  phoneCrop: Box;
  /** The part the pinned row points at, in image pixels. Both crops contain it. */
  target: Box;
}

export interface Row {
  decision: string;
  result: string;
  pinned?: boolean;
}

export interface StoreLink {
  label: string;
  href: string;
}

export interface App {
  id: string;
  name: string;
  year: string;
  years: string;
  role: string;
  claim: string;
  rows: Row[];
  listing: Listing;
  caption: string;
  stores: StoreLink[];
  slug: string;
}

export const apps: App[] = [
  {
    id: "dukagjini",
    name: "Dukagjini Bookstore",
    year: "2021",
    years: "2021–22",
    role: "Mobile",
    claim: "A publisher's book shop, on iPhone and Android.",
    rows: [
      {
        decision: "Build the shop in React Native: search, books on sale, favourite lists, checkout with promo codes.",
        result: "Live in both stores",
      },
      {
        decision: "Bring readers back with push notifications that deep-link to a book.",
        result: "A notification opens the right book",
        pinned: true,
      },
    ],
    listing: {
      src: "/mobile/bookstore-2.webp",
      alt: "Dukagjini Bookstore store screenshot: foreign books list with ratings, prices and favourites",
      width: 780,
      height: 1689,
      crop: { x: 117, y: 740, w: 546, h: 735 },
      phoneCrop: { x: 117, y: 740, w: 546, h: 735 },
      target: { x: 129, y: 997, w: 523, h: 223 },
    },
    caption: "Store listing",
    stores: [
      { label: "App Store", href: "https://apps.apple.com/us/app/dukagjini-bookstore/id1587352342" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.dukagjinibooks" },
    ],
    slug: "dukagjini-bookstore",
  },
  {
    id: "read-to-feed",
    name: "Read to Feed",
    year: "2022",
    years: "2022–25",
    role: "Mobile, iOS and Android",
    claim: "A children's reading app, about 14 releases.",
    rows: [
      {
        decision: "Build a PDF and EPUB reader that tracks each child's reading.",
        result: "Reading progress on every book",
        pinned: true,
      },
      {
        decision: "Keep releasing while React Native moves from 0.63 to 0.81.",
        result: "Three major upgrades, both stores",
      },
    ],
    listing: {
      src: "/mobile/reading-1.webp",
      alt: "Read to Feed store screenshot: My Books list with reading progress for The Tale of Peter Rabbit and Anne of Green Gables",
      width: 780,
      height: 1689,
      crop: { x: 91, y: 640, w: 598, h: 890 },
      phoneCrop: { x: 91, y: 640, w: 598, h: 655 },
      target: { x: 336, y: 855, w: 300, h: 47 },
    },
    caption: "Store listing, archived",
    stores: [
      {
        label: "App Store (archived)",
        href: "https://web.archive.org/web/20251124202817/https://apps.apple.com/us/app/read-to-feed/id1623561765",
      },
      {
        label: "Google Play (archived)",
        href: "https://web.archive.org/web/20260316164104/https://play.google.com/store/apps/details?id=com.heifer.rtf",
      },
    ],
    slug: "read-to-feed",
  },
  {
    id: "viva-fresh",
    name: "Viva Fresh",
    year: "2023",
    years: "2023",
    role: "Mobile",
    claim: "A grocery app: one codebase, both stores.",
    rows: [
      {
        decision: "Ship one React Native codebase to iPhone and Android.",
        result: "Live in both stores",
      },
      {
        decision: "Keep the cart in view on every product grid: quantities, discounts, the running total.",
        result: "The total stays on screen",
        pinned: true,
      },
    ],
    listing: {
      src: "/mobile/grocery-2.webp",
      alt: "Viva Fresh store screenshot on iPhone: Fresh category with a product grid and the cart total",
      width: 780,
      height: 1689,
      crop: { x: 100, y: 652, w: 580, h: 923 },
      phoneCrop: { x: 100, y: 785, w: 580, h: 790 },
      target: { x: 540, y: 1407, w: 136, h: 62 },
    },
    caption: "Store listing",
    stores: [
      { label: "App Store", href: "https://apps.apple.com/us/app/viva-fresh/id1580739480" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.zs.vivafresh" },
    ],
    slug: "viva-fresh",
  },
];

export interface RecordRow {
  name: string;
  result: string;
  years: string;
  href: string;
  /** The opening words that prove the section's claim. */
  mark?: string;
}

/** The rest of the record. The care platform is one row here, not a plate. */
export const record: RecordRow[] = [
  {
    name: "Care-management platform",
    result: "Vue to React, one route at a time, parity-tested",
    mark: "Vue to React",
    years: "2023–26",
    href: "/work/care-platform",
  },
  {
    name: "Bayyinah TV",
    result: "Rebuilt on Nuxt 3 from an empty template: 34 routes",
    mark: "Rebuilt on Nuxt 3",
    years: "2023–26",
    href: "/work/bayyinah-tv",
  },
  {
    name: "Design System v2",
    result: "36 components, 805 tokens from one source",
    years: "2026",
    href: "/work/design-system-react",
  },
  {
    name: "Care-management API",
    result: "One billing report: 16 → 2 queries",
    years: "2026",
    href: "/work/care-platform",
  },
  {
    name: "Incentiv",
    result: "Passkey and wallet sign-in UI on Next.js 14",
    years: "2024",
    href: "/work/incentiv",
  },
];
