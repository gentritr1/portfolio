import { projects } from "../../content/projects";

const material: Record<string, [string, string]> = {
  "care-platform": ["31 ADRs · parity tested", "#7cc7ff"],
  "care-api": ["Report queries: 16 → 2", "#ffe45c"],
  "design-system-react": ["34 accessible components", "#b8b1ff"],
  "design-system-vue": ["Figma → code tokens", "#6fe3a8"],
  "design-dashboard": ["Call activity · demo data", "#ffc2df"],
  "bayyinah-tv": ["34 routes · EN / AR", "#ffd166"],
  "bayyinah-institute": ["One-page Next.js site", "#9ff0e6"],
  "read-to-feed": ["RN 0.63 → 0.81", "#c6f27a"],
  "viva-fresh": ["Delivery slots & loyalty", "#f5c6ff"],
  "dukagjini-bookstore": ["Deep links · checkout", "#a7e0ff"],
  "chatbot-runtime": ["Scripted conversations", "#fff27a"],
  "chatbot-runtime-web": ["Typed web runtime", "#c4b8ff"],
  "epub-reader-prototype": ["Download, read, resize", "#b8f2c0"],
  "donation-app": ["Stripe subscriptions · badges", "#ffd0b0"],
  "coaching-app": ["Daily calendar & reactions", "#8ee8ff"],
  "fuel-loyalty-app": ["ARM64 simulator support", "#e6f56b"],
  incentiv: ["Passkeys · balance · QR", "#d0b3ff"],
  "member-portal": ["Protected routes", "#b3f0d9"],
  "ai-dashboard": ["PDF → document chat", "#ffc8e8"],
  "snaxx-tech": ["Images: 972 → 337 KB", "#ffe08a"],
  offday: ["16 security & tenant tests", "#9fd8ff"],
  "geo-guesser": ["Published on Google Play", "#a8f0a0"],
  fjale: ["21k Albanian words", "#f9f07a"],
  za: ["2–8 players · WebSocket", "#ffb3c7"],
  "morse-trainer": ["Farnsworth timing", "#ffe066"],
  futurisma: ["7 circuits · weather · tides", "#9ce6ff"],
  "secret-dictator": ["AI opponents · 3D town", "#dcc2ff"],
  "open-source-forks": ["Production EPUB / PDF forks", "#c3f5a8"],
};

export const rows = projects.map((project, index) => {
  const [fact, colour] = material[project.slug];
  return {
    project,
    fact,
    colour,
    order: index,
    index: String(index + 1).padStart(2, "0"),
    platform:
      project.role.includes("Mobile") || project.role === "Maintainer"
        ? "Mobile"
        : project.slug === "care-api"
          ? "API"
          : "Web",
    search: [
      project.name,
      project.kind,
      project.years ?? "",
      project.line,
      project.stack.join(" "),
      fact,
    ]
      .join(" ")
      .toLocaleLowerCase(),
  };
});
export type LedgerRow = (typeof rows)[number];
