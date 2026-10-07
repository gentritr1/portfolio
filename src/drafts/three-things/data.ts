import type { ScreenShot } from "../../content/careShots";

export interface Tile {
  slug: string;
  name: string;
  /** What it is and what it does, in plain words. */
  line: string;
  /** Kind of work and years. */
  meta: string;
  note?: string;
  shot: ScreenShot;
  /** The part a phone shows, so the screen's own text stays readable. */
  narrow?: ScreenShot["crop"];
}

const web = (src: string, alt: string, crop: ScreenShot["crop"], ground: string): ScreenShot => ({
  src,
  alt,
  width: 1440,
  height: 900,
  crop,
  ground,
});

const phone = (src: string, alt: string, crop: ScreenShot["crop"], ground: string): ScreenShot => ({
  src,
  alt,
  width: 780,
  height: 1689,
  crop,
  ground,
});

/** Every crop is 4 : 3 and is never shown above the source's own pixels. */
export const tiles: Tile[] = [
  {
    slug: "bayyinah-tv",
    name: "Bayyinah TV",
    line: "A video-learning platform, rebuilt from an empty page. Members subscribe on the web, iPhone or Android.",
    meta: "Web · Frontend, core team · 2023–26",
    shot: web(
      "/showcase/bayyinah/web-02.webp",
      "Bayyinah TV library: search, filters and a row of courses, one marked LIVE",
      { x: 84, y: 236, w: 880, h: 660 },
      "#251e21",
    ),
    narrow: { x: 95, y: 505, w: 520, h: 390 },
  },
  {
    slug: "design-system-react",
    name: "Design System v2",
    line: "36 building blocks for a care platform, released 20 times in about six weeks.",
    meta: "Design system · 2026",
    note: "Real product screens, invented data.",
    shot: web(
      "/showcase/design-system/date-range.webp",
      "Design System v2 date range picker, open: the presets and June 2026, with the range that starts on June 22. Invented data.",
      { x: 8, y: 40, w: 476, h: 357 },
      "#ffffff",
    ),
  },
  {
    slug: "viva-fresh",
    name: "Viva Fresh",
    line: "A grocery app, built once for iPhone and Android. Live in both app stores.",
    meta: "Mobile · 2023",
    shot: phone(
      "/mobile/grocery-3.webp",
      "Viva Fresh cart in Albanian: two jars with quantity buttons, the total discount, and the button to pay 25.11 euro",
      { x: 100, y: 1060, w: 580, h: 435 },
      "#f2f2f2",
    ),
  },
  {
    slug: "read-to-feed",
    name: "Read to Feed",
    line: "A reading app for children, with a built-in book reader. It remembers the page in every book.",
    meta: "Mobile, iOS and Android · 2022–25",
    shot: phone(
      "/mobile/reading-3.webp",
      "Read to Feed reader: Chapter 1 of The Tale of Peter Rabbit, open in the app",
      { x: 80, y: 420, w: 620, h: 465 },
      "#6b7479",
    ),
  },
  {
    slug: "dukagjini-bookstore",
    name: "Dukagjini Bookstore",
    line: "A bookstore app for a publisher. A notification opens the right book.",
    meta: "Mobile · 2021–22",
    shot: phone(
      "/mobile/bookstore-2.webp",
      "Dukagjini Bookstore: book search and the Foreign Books list, with ratings, prices and a favourite",
      { x: 108, y: 830, w: 560, h: 420 },
      "#ffffff",
    ),
  },
  {
    slug: "incentiv",
    name: "Incentiv",
    line: "Gentrit built the sign-in and dashboard screens of a crypto wallet portal. People sign in with a passkey or a wallet, no password.",
    meta: "Frontend · 2024",
    note: "Teammates built the wallet.",
    shot: web(
      "/showcase/incentiv/web-03.webp",
      "Incentiv portal sign-in: Welcome to Incentiv, then Passkey, MetaMask and WalletConnect options",
      { x: 176, y: 230, w: 600, h: 450 },
      "#262624",
    ),
    narrow: { x: 190, y: 262, w: 490, h: 368 },
  },
];

export const offdayNarrow: ScreenShot["crop"] = { x: 266, y: 236, w: 440, h: 330 };

export const offday: ScreenShot = {
  src: "/personal/shots/offday-light-shifts-desktop.webp",
  alt: "Offday Shifts week grid with morning and evening shifts, two of them flagged Needs cover because the person is on leave",
  width: 1440,
  height: 900,
  crop: { x: 266, y: 236, w: 880, h: 660 },
  ground: "#ffffff",
};
