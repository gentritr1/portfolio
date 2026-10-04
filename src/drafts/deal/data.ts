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

const opening = ["care-platform", "bayyinah-tv", "za", "read-to-feed", "fjale"];
export const deck = [
  ...opening.map((slug) => projects.find((project) => project.slug === slug)!),
  ...projects.filter((project) => !opening.includes(project.slug)),
];
export const projectBySlug = new Map(
  deck.map((project) => [project.slug, project]),
);

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
  "dukagjini-bookstore": ["iOS + Android", "books on the go"],
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
  "snaxx-tech": ["972 → 337 KB", "image assets"],
  offday: ["16 tests", "security and tenant isolation"],
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
