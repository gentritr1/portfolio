import { projects, type Project } from "../../content/projects";

export type Quality = "Auto" | "1080p" | "720p" | "480p" | "240p";
export const qualities: Quality[] = ["Auto", "1080p", "720p", "480p", "240p"];
export const years = [2021, 2022, 2023, 2024, 2025, 2026];

export const yearChapters: Record<number, { slug: string; label: string }> = {
  2021: { slug: "dukagjini-bookstore", label: "Book shopping" },
  2022: { slug: "read-to-feed", label: "Reading" },
  2023: { slug: "viva-fresh", label: "Grocery" },
  2024: { slug: "incentiv", label: "Web3" },
  2025: { slug: "chatbot-runtime-web", label: "Chat runtime" },
  2026: { slug: "bayyinah-tv", label: "Streaming" },
};

export function projectYears(project: Project): number[] {
  if (!project.years) return [];
  const [start, end] = project.years.split("–");
  const first = Number(start);
  const last = end ? Number(end.length === 2 ? `20${end}` : end) : first;
  return years.filter((year) => year >= first && year <= last);
}

export function projectsAtYear(year: number | null): Project[] {
  return projects.filter((project) =>
    year === null ? !project.years : projectYears(project).includes(year),
  );
}

const colours: Record<string, string> = {
  healthcare: "#17bca0",
  streaming: "#eb592f",
  reading: "#3575df",
  web3: "#7854dc",
  ai: "#db6834",
  personal: "#c5dd39",
};

export function projectColour(project: Project): string {
  if (project.slug === "fjale") return "#efc145";
  if (project.slug === "morse-trainer") return "#edaf32";
  if (project.slug === "za") return "#dca1e1";
  return colours[project.channel] ?? "#3575df";
}

export interface ReelFrame {
  src: string;
  caption: string;
}
export function reelFrames(project: Project): ReelFrame[] {
  // Care material is the repository's labelled, invented-data recreation only.
  if (project.channel === "healthcare")
    return [
      {
        src: "/signal-posters/healthcare.avif",
        caption: "Care interface recreation · invented data",
      },
    ];
  if (project.slug === "ai-dashboard")
    return [
      {
        src: "/signal-posters/ai.avif",
        caption: "Document-chat recreation · invented data",
      },
    ];
  const gallery = project.media.galleries?.[0];
  if (gallery)
    return gallery.items.slice(0, 4).map((image) => ({
      src: image.src,
      caption: `${image.caption} · public ${gallery.aspect === "phone" ? "store image" : "website"}`,
    }));
  if (project.media.shot)
    return [{ src: project.media.shot.src, caption: "Public project capture" }];
  return [];
}

export function projectFacts(project: Project): string[] {
  if (project.slug === "bayyinah-tv")
    return [
      "34 routes, 270+ components and 25 Pinia stores in the Nuxt 3 rebuild.",
      "Live streaming on AWS IVS, with realtime chat and moderation.",
      "HLS playback with a quality selector and a premium paywall.",
      "English and Arabic, including the right-to-left layout.",
      "Stripe, Apple and Google subscriptions, gifting and promo codes.",
    ];
  if (project.slug === "care-platform")
    return [
      "Vue (Nuxt 2) to React, one route at a time, with parity tests.",
      "Architecture decision records and CI quality gates.",
      "Care plans, lab results, vitals, billing claims, calls and chat.",
      "English, German, Spanish and Turkish; separate data for each organization.",
    ];
  if (project.slug === "care-api")
    return [
      "One billing report went from 16 queries to 2 and no longer times out.",
      "Enrollment drafts and a lab catalog, backed by Laravel 13.",
      "Multi-tenant security fixes keep each organization’s records separate.",
      "Pest tests against MySQL and Redis.",
    ];
  if (project.slug === "read-to-feed")
    return [
      "PDF and EPUB reading, with progress tracking and type resizing.",
      "About 14 releases to both stores; React Native 0.63 to 0.81.",
      "ISBN barcode scanning, badges, streaks and conversational quizzes.",
      "Three languages. The removed store listings are linked through archives.",
    ];
  if (project.slug === "viva-fresh")
    return [
      "Online grocery orders, delivery slots and loyalty for iOS and Android.",
      "A wishlist and address search on a map for delivery.",
      "Built in React Native with Redux Toolkit and Firebase.",
      "The published store images show the Albanian interface.",
    ];
  return [
    project.line,
    `Built with ${project.stack.join(", ")}.`,
    `Role: ${project.role}.`,
    project.summary.split(/(?<=\.)\s+/)[0],
  ];
}
