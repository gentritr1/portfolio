import { projects } from "../../content/projects";

export type CellKind =
  | "vitals"
  | "queries"
  | "components"
  | "tokens"
  | "calls"
  | "stream"
  | "support"
  | "reader"
  | "basket"
  | "books"
  | "chat"
  | "queue"
  | "epub"
  | "donate"
  | "calendar"
  | "loyalty"
  | "wallet"
  | "signin"
  | "document"
  | "images"
  | "leave"
  | "map"
  | "letters"
  | "cards"
  | "morse"
  | "race"
  | "town"
  | "forks";
const material: Record<string, [CellKind, string, string]> = {
  "care-platform": ["vitals", "31 ADRs · parity tested", "#75BAE7"],
  "care-api": ["queries", "Report queries: 16 → 2", "#A3C7EC"],
  "design-system-react": ["components", "34 accessible components", "#A5B7FB"],
  "design-system-vue": ["tokens", "Figma → code tokens", "#91CFB2"],
  "design-dashboard": ["calls", "Call activity · demo data", "#AAC5EB"],
  "bayyinah-tv": ["stream", "34 routes · EN / AR", "#EEAD78"],
  "bayyinah-institute": ["support", "Mission & support", "#E3BB93"],
  "read-to-feed": ["reader", "RN 0.63 → 0.81", "#B9CE90"],
  "viva-fresh": ["basket", "Delivery slots & loyalty", "#E7BD67"],
  "dukagjini-bookstore": ["books", "Books · iOS & Android", "#D8AB90"],
  "chatbot-runtime": ["chat", "Scripted conversations", "#C0BCD9"],
  "chatbot-runtime-web": ["queue", "Typed web runtime", "#AEBFD5"],
  "epub-reader-prototype": ["epub", "Download, read, resize", "#C4CD9F"],
  "donation-app": ["donate", "Stripe subscriptions", "#D7BBE3"],
  "coaching-app": ["calendar", "Daily calendar & reactions", "#E9BAAC"],
  "fuel-loyalty-app": ["loyalty", "ARM64 simulator support", "#D2C389"],
  incentiv: ["wallet", "Passkeys · balance · QR", "#C8BAEB"],
  "member-portal": ["signin", "Protected routes", "#ACC2CE"],
  "ai-dashboard": ["document", "PDF → document chat", "#B8BFEE"],
  "snaxx-tech": ["images", "Image KB: 972 → 337", "#BECAA1"],
  offday: ["leave", "16 security & tenant tests", "#B7CFDF"],
  "geo-guesser": ["map", "Published on Google Play", "#B5CEB2"],
  fjale: ["letters", "21k Albanian words", "#99BEDD"],
  za: ["cards", "2–8 players · WebSocket", "#ECAF9D"],
  "morse-trainer": ["morse", "Farnsworth timing", "#DFC473"],
  futurisma: ["race", "7 circuits · weather · tides", "#EBA983"],
  "secret-dictator": ["town", "AI opponents · 3D town", "#C5B5D0"],
  "open-source-forks": ["forks", "Production EPUB / PDF forks", "#ACBFD2"],
};
export const rows = projects.map((project, index) => {
  const [kind, fact, colour] = material[project.slug];
  return {
    project,
    kind,
    fact,
    colour,
    index: String(index + 1).padStart(2, "0"),
    platform:
      project.role.includes("Mobile") || project.role === "Maintainer"
        ? "Mobile"
        : project.slug === "care-api"
          ? "API"
          : "Web",
  };
});
export type LedgerRow = (typeof rows)[number];
