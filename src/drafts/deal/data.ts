import { projects, type Project } from "../../content/projects";
import type { ChannelKey } from "../../content/channels";

export const suits: Record<
  ChannelKey,
  { name: string; number: string; ink: string }
> = {
  healthcare: { name: "Care", number: "01", ink: "#155947" },
  streaming: { name: "Streaming", number: "02", ink: "#264bbd" },
  reading: { name: "Mobile", number: "03", ink: "#976100" },
  web3: { name: "Web3", number: "04", ink: "#6833a0" },
  ai: { name: "Web & AI", number: "05", ink: "#b34228" },
  personal: { name: "Independent", number: "06", ink: "#22231d" },
};

export const suitOrder = Object.keys(suits) as ChannelKey[];

const opening = [
  "care-platform",
  "bayyinah-tv",
  "za",
  "dukagjini-bookstore",
  "read-to-feed",
];
export const deck = [
  ...opening.map((slug) => projects.find((project) => project.slug === slug)!),
  ...projects.filter((project) => !opening.includes(project.slug)),
];
export const projectBySlug = new Map(
  deck.map((project) => [project.slug, project]),
);

/** The full spread groups the deck by suit, in suit order. */
export const spreadOrder = suitOrder.flatMap((channel) =>
  projects
    .filter((project) => project.channel === channel)
    .map((project) => project.slug),
);

const rankNames = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];
const ranks = new Map<string, string>();
for (const channel of suitOrder)
  projects
    .filter((project) => project.channel === channel)
    .forEach((project, index) => ranks.set(project.slug, rankNames[index]));
export const rankOf = (slug: string) => ranks.get(slug) ?? "A";

/** Public screenshots only. Each crop is the card's picture, framed like a court card. */
export const art: Record<
  string,
  { src: string; position: string; zoom?: number }
> = {
  "bayyinah-tv": {
    src: "/showcase/bayyinah/store-01.webp",
    position: "50% 6%",
  },
  "bayyinah-institute": {
    src: "/showcase/bayyinah/org-01.webp",
    position: "50% 38%",
    zoom: 1.6,
  },
  "read-to-feed": { src: "/mobile/reading-1.webp", position: "50% 6%" },
  "viva-fresh": { src: "/mobile/grocery-1.webp", position: "50% 6%" },
  "dukagjini-bookstore": {
    src: "/mobile/bookstore-1.webp",
    position: "50% 7%",
  },
  incentiv: {
    src: "/showcase/incentiv/web-01.webp",
    position: "70% 55%",
    zoom: 1.3,
  },
  offbeat: {
    src: "/personal/shots/offbeat-home-desktop.webp",
    position: "72% 43%",
    zoom: 1.6,
  },
  form: {
    src: "/personal/shots/form-home-desktop.webp",
    position: "71% 50%",
    zoom: 1.5,
  },
  "snaxx-tech": {
    src: "/personal/shots/snaxx-desktop.webp",
    position: "50% 42%",
    zoom: 1.2,
  },
  offday: {
    src: "/personal/shots/offday-app-desktop.webp",
    position: "40% 30%",
    zoom: 1.5,
  },
  fjale: {
    src: "/personal/shots/fjale-desktop.webp",
    position: "37% 52%",
    zoom: 1.5,
  },
  za: {
    src: "/personal/shots/za-desktop.webp",
    position: "50% 14%",
    zoom: 2.3,
  },
  "morse-trainer": {
    src: "/personal/shots/morse-desktop.webp",
    position: "62% 55%",
    zoom: 1.9,
  },
};

const facts: Record<string, [string, string]> = {
  "care-platform": ["31", "architecture decisions"],
  "care-api": ["16 → 2", "billing report queries"],
  "design-system-react": ["34", "accessible components"],
  "design-system-vue": ["Vue 2", "Figma tokens to components"],
  "design-dashboard": ["Prototype", "a working design reference"],
  "bayyinah-tv": ["34 routes", "English / Arabic · Nuxt 3"],
  "bayyinah-institute": ["One page", "mission and support"],
  "member-portal": ["Sign in", "protected member routes"],
  "read-to-feed": ["≈14 releases", "React Native 0.63 → 0.81"],
  "viva-fresh": ["Loyalty", "groceries and delivery"],
  "dukagjini-bookstore": [
    "iOS + Android",
    "search, favourites, promo checkout",
  ],
  "chatbot-runtime": ["Message queue", "scripted conversations"],
  "chatbot-runtime-web": ["Web port", "typed conversation runtime"],
  "epub-reader-prototype": ["EPUB", "download, read and resize"],
  "donation-app": ["Stripe", "donations and subscriptions"],
  "coaching-app": ["Daily", "calendar and coaching"],
  "fuel-loyalty-app": ["ARM64", "simulator support"],
  incentiv: ["QR + passkeys", "wallet interface"],
  "ai-dashboard": ["PDF → chat", "document assistant"],
  fjale: ["21k words", "Albanian dictionary"],
  za: ["2–8 players", "server-authoritative multiplayer"],
  "morse-trainer": ["Farnsworth", "Morse timing and practice"],
  offbeat: ["8 steps", "Web Audio drum machine"],
  form: ["3", "mathematical sculptures"],
  "snaxx-tech": ["972 → 337 KB", "image assets"],
  offday: ["about 200 tests", "security and tenant isolation"],
  "geo-guesser": ["Google Play", "a published geography game"],
  futurisma: ["7 circuits", "weather, tides and day / night"],
  "secret-dictator": ["AI opponents", "a social-deduction game"],
  "open-source-forks": ["EPUB / PDF", "maintained reader forks"],
};

export function projectFact(project: Project) {
  const [value, label] = facts[project.slug] ?? [
    project.stack[0],
    project.kind,
  ];
  return { value, label };
}

export function nextHand(offset: number) {
  return Array.from(
    { length: 5 },
    (_, index) => deck[(offset + index) % deck.length].slug,
  );
}
