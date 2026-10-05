import { projects } from "../../content/projects";
import type { Crop } from "./glyphs";

export interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption: string;
}

export interface Line {
  slug: string;
  name: string;
  /** The destination as the board writes it. */
  board: string;
  /** Three "via" stops on the board; the phone board writes the first two. */
  stops: [string, string, string];
  /** Result first, about 10 words. */
  via: string;
  platform: string;
  remark: "Live" | "Concept" | "Recreation" | "Archived" | "Own project" | "Internal";
  years: [number] | [number, number];
  role: string;
  detail: string;
  /** What the discs show under the strip, in 8 words or fewer. */
  inDiscs: string;
  /** One screen, or several phone screens side by side. `phone` is the crop for the tall phone board. */
  picture?: { src: string | string[]; crop: Crop; phone?: Crop };
  shot?: Shot;
  links: { label: string; href: string }[];
  caseHref?: string;
}

const linksOf = (slug: string) => projects.find((project) => project.slug === slug)?.links ?? [];
const featured = (slug: string) =>
  projects.find((project) => project.slug === slug)?.featured ? `/work/${slug}` : undefined;

export const lines: Line[] = [
  {
    slug: "care-platform",
    name: "Care-management platform",
    board: "CARE PLATFORM",
    stops: ["CARE TEAMS", "VITALS", "4 LANGUAGES"],
    via: "Most screens are already rebuilt in React.",
    platform: "Web",
    remark: "Recreation",
    years: [2023, 2026],
    role: "Frontend and mobile, React and Vue. Also the server side since 2026.",
    detail:
      "Care teams follow patients’ vitals, labs, claims, calls and chat. Many client organizations share the system, and each one sees only its own records. Most screens are already rebuilt in React. A screen moves over only after it passes the same tests in both apps. One billing report asked the database 16 times and gave up. Now it asks 2 times and finishes.",
    inDiscs: "A recreation with invented data.",
    picture: { src: "/signal-posters/healthcare.avif", crop: { x: 0.5, y: 0.6, w: 1, floor: 0.55, gamma: 0.8 }, phone: { x: 0.62, y: 0.55, w: 0.55, floor: 0.55, gamma: 0.8 } },
    shot: {
      src: "/signal-posters/healthcare.avif",
      width: 512,
      height: 320,
      alt: "Recreation with invented data: a 14-day blood-pressure chart for a made-up patient, with two alerts",
      caption: "Recreation · invented data",
    },
    links: [],
    caseHref: featured("care-platform"),
  },
  {
    slug: "bayyinah-tv",
    name: "Bayyinah TV",
    board: "BAYYINAH TV",
    stops: ["LIVE VIDEO", "MEMBERS", "ARABIC"],
    via: "The video-learning platform, rebuilt from an empty page.",
    platform: "Web, in the apps",
    remark: "Live",
    years: [2023, 2026],
    role: "Frontend, core team.",
    detail:
      "A video-learning platform for an online community: courses, a scripture reader, videos and live classes. Its second version was rebuilt from an empty page. Members subscribe on the web or in the iPhone and Android apps. Live classes have a live chat that moderators control. The whole site also works in Arabic, read from right to left.",
    inDiscs: "The public home page.",
    picture: { src: "/showcase/bayyinah/web-01.webp", crop: { x: 0.36, y: 0.42, w: 0.72, floor: 0.45, tone: "value" }, phone: { x: 0.7, y: 0.48, w: 0.42, floor: 0.45, tone: "value" } },
    shot: {
      src: "/showcase/bayyinah/web-01.webp",
      width: 1440,
      height: 900,
      alt: "Bayyinah TV home page: Quran Studies Made Simple, with the app on a laptop, a monitor and phones",
      caption: "Public page",
    },
    links: linksOf("bayyinah-tv"),
    caseHref: featured("bayyinah-tv"),
  },
  {
    slug: "offbeat",
    name: "OFFBEAT",
    board: "OFFBEAT",
    stops: ["3D SPEAKER", "4 FINISHES", "DRUM MACHINE"],
    via: "A made-up speaker brand with a drum machine that plays.",
    platform: "Web",
    remark: "Concept",
    years: [2026],
    role: "Own project. A concept: not a real product, not hosted.",
    detail:
      "A made-up brand for a portable speaker, built to show 3D and sound in the browser. The speaker turns by drag or arrow keys, with four finishes and a view of its parts. The studio is a working eight-step drum machine with tempo and swing. A beat can be shared as a link or saved as a sound file.",
    inDiscs: "The concept’s home page.",
    picture: { src: "/personal/shots/offbeat-home-desktop.webp", crop: { x: 0.72, y: 0.5, w: 0.5, floor: 0.2, gamma: 0.85 }, phone: { x: 0.71, y: 0.52, w: 0.36, floor: 0.5, gamma: 0.85 } },
    shot: {
      src: "/personal/shots/offbeat-home-desktop.webp",
      width: 2880,
      height: 1800,
      alt: "OFFBEAT home: a hot-orange portable speaker in 3D beside the line Plays your songs. Makes its own.",
      caption: "Concept · own project",
    },
    links: linksOf("offbeat"),
  },
  {
    slug: "form",
    name: "FORM",
    board: "FORM",
    stops: ["3 SHAPES", "LIVE 3D", "TYPE A WORD"],
    via: "A made-up sculpture show. Three shapes, drawn live.",
    platform: "Web",
    remark: "Concept",
    years: [2026],
    role: "Own project. A concept: not a real exhibition, not hosted.",
    detail:
      "A made-up sculpture exhibition with no outside code libraries. Three shapes made from mathematics, a knot, a ring and a folded surface, are drawn live in copper, chrome and porcelain. Visitors turn them and they keep turning, then slow down. A typed word casts its own sculpture, and a poster of it downloads as an image.",
    inDiscs: "The concept’s home page.",
    picture: { src: "/personal/shots/form-home-desktop.webp", crop: { x: 0.71, y: 0.42, w: 0.54, floor: 0.45, gamma: 0.8 }, phone: { x: 0.69, y: 0.42, w: 0.38, floor: 0.5, gamma: 0.8 } },
    shot: {
      src: "/personal/shots/form-home-desktop.webp",
      width: 2880,
      height: 1800,
      alt: "FORM home: a copper trefoil sculpture beside the title Objects of imagination.",
      caption: "Concept · own project",
    },
    links: linksOf("form"),
  },
  {
    slug: "read-to-feed",
    name: "Read to Feed",
    board: "READ TO FEED",
    stops: ["BOOKS", "QUIZZES", "BADGES"],
    via: "A reading app for children, updated about 14 times.",
    platform: "iPhone + Android",
    remark: "Archived",
    years: [2022, 2025],
    role: "Mobile, iOS and Android.",
    detail:
      "Children read books in the app, scan their own books by barcode, take quizzes that run like a chat, and earn badges and streaks. It remembers the page in every book. About 14 updates went to both app stores, kept current through three major upgrades. The store listings are now removed. The links go to archived copies.",
    inDiscs: "A public store screenshot.",
    picture: { src: ["/mobile/reading-1.webp", "/mobile/reading-2.webp", "/mobile/reading-3.webp", "/mobile/reading-4.webp"], crop: { x: 0.5, y: 0.5, w: 1, floor: 0.35 } },
    shot: {
      src: "/mobile/reading-1.webp",
      width: 780,
      height: 1689,
      alt: "Read to Feed store screenshot: My Books list with reading progress",
      caption: "Store screenshot",
    },
    links: linksOf("read-to-feed"),
    caseHref: featured("read-to-feed"),
  },
  {
    slug: "viva-fresh",
    name: "Viva Fresh",
    board: "VIVA FRESH",
    stops: ["GROCERIES", "DELIVERY", "LOYALTY"],
    via: "One grocery app, built once for iPhone and Android.",
    platform: "iPhone + Android",
    remark: "Live",
    years: [2023],
    role: "Mobile.",
    detail:
      "A grocery shopping and loyalty app, in Albanian. Shoppers browse categories, fill a cart and pick a delivery time. A loyalty programme and a wishlist bring them back. A search on a map finds the delivery address. Both store listings are public.",
    inDiscs: "A public store screenshot.",
    picture: { src: ["/mobile/grocery-1.webp", "/mobile/grocery-2.webp", "/mobile/grocery-3.webp", "/mobile/grocery-4.webp"], crop: { x: 0.5, y: 0.5, w: 1, floor: 0.3 } },
    shot: {
      src: "/mobile/grocery-1.webp",
      width: 780,
      height: 1689,
      alt: "Viva Fresh store screenshot: home with product categories, Albanian interface",
      caption: "Store screenshot",
    },
    links: linksOf("viva-fresh"),
    caseHref: featured("viva-fresh"),
  },
  {
    slug: "offday",
    name: "Offday",
    board: "OFFDAY",
    stops: ["TIME OFF", "CALENDAR", "SHIFTS"],
    via: "Time off for teams: requests, approvals and one shared calendar.",
    platform: "Web",
    remark: "Own project",
    years: [2026],
    role: "Own project.",
    detail:
      "Employees ask for time off, managers approve it, and the team calendar shows who is away. Shifts warn when nobody covers them. Find the best dates suggests the longest breaks. An assistant answers questions about the team. About 200 automated tests cover it, including that one team never sees another team’s data.",
    inDiscs: "The team calendar, light theme.",
    picture: { src: "/personal/shots/offday-light-calendar-desktop.webp", crop: { x: 0.58, y: 0.5, w: 0.84, invert: true, floor: 0.55 }, phone: { x: 0.58, y: 0.6, w: 0.42, invert: true, floor: 0.55 } },
    shot: {
      src: "/personal/shots/offday-light-calendar-desktop.webp",
      width: 2880,
      height: 1800,
      alt: "Offday team calendar for October with leave bars, light theme",
      caption: "Own project · real screen",
    },
    links: linksOf("offday"),
  },
  {
    slug: "morse-trainer",
    name: "Morse Trainer",
    board: "MORSE TRAINER",
    stops: ["DOTS", "DASHES", "LETTERS"],
    via: "A game that teaches Morse code. Live on the web.",
    platform: "Web",
    remark: "Live",
    years: [2026],
    role: "Own project.",
    detail:
      "A game for learning Morse code. Letters a player misses come back sooner. Each letter plays at full speed, with extra space between letters. The key on this board reads Morse the same way: hold Space, or press the board.",
    inDiscs: "The live game.",
    picture: { src: "/personal/shots/morse-desktop.webp", crop: { x: 0.5, y: 0.5, w: 0.74, floor: 0.6, gamma: 0.7, tone: "value" }, phone: { x: 0.56, y: 0.5, w: 0.5, floor: 0.6, gamma: 0.7, tone: "value" } },
    shot: {
      src: "/personal/shots/morse-desktop.webp",
      width: 1440,
      height: 900,
      alt: "Morse Trainer: an amber terminal in Learn mode with an incoming-signal display",
      caption: "Own project · real screen",
    },
    links: linksOf("morse-trainer"),
  },
  {
    slug: "dukagjini-bookstore",
    name: "Dukagjini Bookstore",
    board: "DUKAGJINI",
    stops: ["BOOKS", "PROMO CODE", "FAVOURITES"],
    via: "A bookstore app for a publisher, on iPhone and Android.",
    platform: "iPhone + Android",
    remark: "Live",
    years: [2021, 2022],
    role: "Mobile.",
    detail:
      "A shopping app for a publisher. Readers search books, browse top categories and sales, keep favourite lists and pay with promo codes. A notification opens the right screen. The book page has an animated header, and windows close with a swipe.",
    inDiscs: "A public store screenshot.",
    picture: { src: ["/mobile/bookstore-1.webp", "/mobile/bookstore-2.webp", "/mobile/bookstore-3.webp"], crop: { x: 0.5, y: 0.5, w: 1, floor: 0.3 } },
    shot: {
      src: "/mobile/bookstore-1.webp",
      width: 780,
      height: 1689,
      alt: "Dukagjini Bookstore store screenshot: Discover new books you will love, above the app’s home screen",
      caption: "Store screenshot",
    },
    links: linksOf("dukagjini-bookstore"),
    caseHref: featured("dukagjini-bookstore"),
  },
  {
    slug: "incentiv",
    name: "Incentiv",
    board: "INCENTIV",
    stops: ["PASSKEY", "DASHBOARD", "EN + FR"],
    via: "Sign-in and dashboard screens for a crypto wallet.",
    platform: "Web",
    remark: "Live",
    years: [2024],
    role: "Frontend. Teammates built the wallet.",
    detail:
      "A wallet dashboard where people and businesses manage a crypto wallet and reward programs. People sign in with a passkey (no password) or an existing wallet, then see balances, assets and past transactions. The screens include onboarding, dashboard cards, an asset list and a QR address, in English and French.",
    inDiscs: "The public home page.",
    picture: { src: "/showcase/incentiv/web-01.webp", crop: { x: 0.6, y: 0.52, w: 0.78, floor: 0.4, gamma: 0.85 }, phone: { x: 0.74, y: 0.6, w: 0.44, floor: 0.4, gamma: 0.85 } },
    shot: {
      src: "/showcase/incentiv/web-01.webp",
      width: 1440,
      height: 900,
      alt: "Incentiv home page: Build. Incentivize. Settle. beside a 3D dog in glowing goggles",
      caption: "Public page",
    },
    links: linksOf("incentiv"),
    caseHref: featured("incentiv"),
  },
  {
    slug: "design-system-react",
    name: "Design System v2",
    board: "DESIGN SYSTEM",
    stops: ["36 BLOCKS", "6 WEEKS", "20 RELEASES"],
    via: "36 building blocks, released 20 times in about six weeks.",
    platform: "Web",
    remark: "Internal",
    years: [2026],
    role: "Design system, with the team.",
    detail:
      "Colours, sizes and type are set once, for code and for Figma. An app that uses only the button downloads 96.6% less code. Built to the WCAG 2.1 AA accessibility level, with automatic checks on screen. The new care dashboard, not yet live, uses it. No public screen exists. The case page has a working recreation.",
    inDiscs: "A drawn sheet of parts.",
    links: [],
    caseHref: featured("design-system-react"),
  },
  {
    slug: "fjale",
    name: "FJALË",
    board: "FJALË",
    stops: ["ALBANIAN", "DAILY WORD", "OFFLINE"],
    via: "A daily Albanian word game. It also works offline.",
    platform: "Web",
    remark: "Live",
    years: [2026],
    role: "Own project.",
    detail:
      "A new five-letter Albanian word each day, checked against a dictionary of 21,000 words. It has an Albanian keyboard, hints and an archive of past days. It installs like an app and works offline.",
    inDiscs: "The live game.",
    picture: { src: "/personal/shots/fjale-desktop.webp", crop: { x: 0.45, y: 0.5, w: 0.8, floor: 0.5, gamma: 0.8 }, phone: { x: 0.38, y: 0.55, w: 0.45, floor: 0.5, gamma: 0.8 } },
    shot: {
      src: "/personal/shots/fjale-desktop.webp",
      width: 1440,
      height: 900,
      alt: "FJALË word game board with an Albanian keyboard",
      caption: "Own project · real screen",
    },
    links: linksOf("fjale"),
  },
  {
    slug: "za",
    name: "Za!",
    board: "ZA!",
    stops: ["PIZZA CARDS", "2-8 PLAYERS", "BOTS"],
    via: "A pizza card game for 2 to 8 players, online.",
    platform: "Web",
    remark: "Live",
    years: [2026],
    role: "Own project.",
    detail:
      "A card game about pizza, for two to eight players, live on the web. The server keeps every game fair and decides each move. Players make or join a table, and computer players fill the empty seats.",
    inDiscs: "The live game’s lobby.",
    picture: { src: "/personal/shots/za-desktop.webp", crop: { x: 0.5, y: 0.32, w: 0.6, floor: 0.55, gamma: 0.8, tone: "value" }, phone: { x: 0.5, y: 0.4, w: 0.42, floor: 0.55, gamma: 0.8, tone: "value" } },
    shot: {
      src: "/personal/shots/za-desktop.webp",
      width: 1440,
      height: 900,
      alt: "Za! card game lobby with its pixel logo",
      caption: "Own project · real screen",
    },
    links: linksOf("za"),
  },
  {
    slug: "snaxx-tech",
    name: "Snaxx Tech",
    board: "SNAXX TECH",
    stops: ["STUDIO SITE", "3D HEADER", "SMALL IMAGES"],
    via: "A studio website. Images cut from 972 KB to 337 KB.",
    platform: "Web",
    remark: "Live",
    years: [2026],
    role: "Own project.",
    detail:
      "The website of a small app studio, with a 3D header, a looping film and an illustrated theme. Strict rules control what the site may load. Images went from 972 KB to 337 KB, and the whole site from 28 MB to 9.5 MB.",
    inDiscs: "The live home page.",
    picture: { src: "/personal/shots/snaxx-desktop.webp", crop: { x: 0.5, y: 0.6, w: 1, invert: true, floor: 0.6, gamma: 1.2 }, phone: { x: 0.5, y: 0.66, w: 0.55, invert: true, floor: 0.6, gamma: 1.2 } },
    shot: {
      src: "/personal/shots/snaxx-desktop.webp",
      width: 1440,
      height: 900,
      alt: "Snaxx Tech studio site: The Snaxx Almanac, an illustrated landscape of small buildings",
      caption: "Own project · real screen",
    },
    links: linksOf("snaxx-tech"),
  },
];

/** The rest of the work, one plain line each. */
export const others: { name: string; years: string; line: string }[] = [
  { name: "Care-management API", years: "2026", line: "The server behind the care app." },
  { name: "Bayyinah institute website", years: "2024–25", line: "The institute’s public website, on one page." },
  { name: "Chatbot runtime", years: "2022–25", line: "Quizzes that run like a chat, on phones." },
  { name: "Chatbot runtime, web", years: "2025", line: "The same chat quizzes, rebuilt for the web." },
  { name: "Sadaqah app", years: "2021–22", line: "Donations and subscriptions in a phone app." },
  { name: "Coaching app", years: "2022–23", line: "Sign-in, a daily calendar and reactions." },
  { name: "Member portal", years: "2025", line: "The start of a members’ website." },
  { name: "Business dashboard with AI", years: "—", line: "Makes headshots and answers questions about PDFs." },
  { name: "Design system, Vue", years: "2026", line: "Colours and type from Figma, for the older app." },
  { name: "Design dashboard", years: "2026", line: "One screen built from the design system, as a reference." },
  { name: "Fuel-station loyalty app", years: "2026", line: "Upkeep of a loyalty app for fuel stations." },
  { name: "EPUB reader prototype", years: "2022", line: "The first version of the reading app’s reader." },
  { name: "Open-source forks", years: "2022", line: "Two reader libraries, kept working for a reading app." },
  { name: "Geo Guesser World 3D", years: "2026", line: "A street-view guessing game on Google Play." },
  { name: "Futurisma", years: "2026", line: "A hover racer with seven tracks and weather." },
  { name: "Secret Dictator", years: "2026", line: "A game of hidden roles against computer players." },
];
