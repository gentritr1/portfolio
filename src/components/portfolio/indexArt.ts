/** Art direction uses public store frames, public pages and real care screens on invented data. */
export const selectedSlugs = [
  "bayyinah-tv",
  "care-platform",
  "read-to-feed",
  "viva-fresh",
  "incentiv",
  "snaxx-tech",
  "offday",
  "fjale",
];
export type IndexArt = {
  background: string;
  images: string[];
  type: "portrait" | "web";
  proof: string;
  detail: string;
  caption: string;
};
/** Page colours sampled and deepened from the work so cream text stays readable. */
export const indexGrounds: Record<string, string> = {
  "bayyinah-tv": "#ab2e19",
  "care-platform": "#08705a",
  "read-to-feed": "#096c96",
  "viva-fresh": "#bb1730",
  incentiv: "#593da1",
  "snaxx-tech": "#945023",
  offday: "#216841",
  fjale: "#72520b",
};
export const indexArt: Record<string, IndexArt> = {
  "bayyinah-tv": {
    background: "#721a0d",
    images: [
      "/showcase/bayyinah/store-02.webp",
      "/showcase/bayyinah/store-04.webp",
    ],
    type: "portrait",
    proof: "An entire platform. Rebuilt.",
    detail: "34 routes · 270+ components · Nuxt 3",
    caption: "Public App Store frames",
  },
  "care-platform": {
    background: "#163f38",
    images: ["/showcase/care-dashboard/overview.webp"],
    type: "web",
    proof: "A live platform. A careful rewrite.",
    detail: "Vue → React · parity-tested · Decision records",
    caption: "Real product screens, invented data",
  },
  "read-to-feed": {
    background: "#16769a",
    images: ["/mobile/reading-1.webp", "/mobile/reading-3.webp"],
    type: "portrait",
    proof: "Four years of reading.",
    detail: "About 14 releases · React Native 0.63 → 0.81",
    caption: "Public store frames",
  },
  "viva-fresh": {
    background: "#e6272b",
    images: ["/mobile/grocery-1.webp", "/mobile/grocery-2.webp"],
    type: "portrait",
    proof: "From the aisle to the doorstep.",
    detail: "iOS + Android · delivery · loyalty",
    caption: "Public store frames",
  },
  incentiv: {
    background: "#373047",
    images: ["/showcase/incentiv/web-03.webp"],
    type: "web",
    proof: "A simpler way into Web3.",
    detail: "Passkeys · wallet UI · Next.js",
    caption: "Public sign-in page",
  },
  "snaxx-tech": {
    background: "#746047",
    images: ["/personal/shots/snaxx-desktop.webp"],
    type: "web",
    proof: "A small studio. A whole world.",
    detail: "3D · React · images 972 → 337 kB",
    caption: "Personal project",
  },
  offday: {
    background: "#f4efee",
    images: ["/personal/shots/offday-light-calendar-desktop.webp"],
    type: "web",
    proof: "Time off, together.",
    detail: "Multi-tenant · Next.js · about 200 tests",
    caption: "Personal project",
  },
  fjale: {
    background: "#24211a",
    images: ["/personal/shots/fjale-desktop.webp"],
    type: "web",
    proof: "A daily word in Albanian.",
    detail: "21k-word dictionary · offline play",
    caption: "Personal project",
  },
};
