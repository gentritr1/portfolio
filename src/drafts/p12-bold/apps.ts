import { findProject, type PublicLink } from "../../content/projects";

/**
 * The four apps on the wheel. Names, years, roles, store links, frames and alt text come from
 * src/content/projects.ts (read only). The short lines are written here from CONTENT.md.
 */

export interface Frame {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Store {
  /** Label from the project file, for example "App Store" or "Google Play (archived)". */
  label: string;
  /** Short label for a button. */
  name: "App Store" | "Google Play";
  href: string;
  /** What is printed under the code. */
  printed: string;
  archived: boolean;
}

export interface AppView {
  id: string;
  slug: string;
  name: string;
  years: string;
  kind: string;
  what: string;
  role: string;
  where: string;
  builtWith: string;
  hook: string;
  stores: Store[];
  site?: PublicLink;
  frames: Frame[];
  /** The colour of the app's own store frame. Marks the selected row and nothing else. */
  accent: string;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function printed(href: string): string {
  const archive = href.match(/^https:\/\/web\.archive\.org\/web\/(\d{4})(\d{2})(\d{2})\d*\//);
  if (archive) return `web.archive.org, saved ${Number(archive[3])} ${MONTHS[Number(archive[2]) - 1]} ${archive[1]}`;
  return href.replace(/^https?:\/\//, "");
}

function storesOf(links: PublicLink[]): Store[] {
  const out: Store[] = [];
  for (const l of links) {
    const name = l.label.startsWith("App Store") ? "App Store" : l.label.startsWith("Google Play") ? "Google Play" : null;
    if (name) out.push({ label: l.label, name, href: l.href, printed: printed(l.href), archived: l.label.includes("archived") });
  }
  return out;
}

function projectOrThrow(slug: string) {
  const p = findProject(slug);
  if (!p) throw new Error(`Missing project ${slug}`);
  return p;
}

function framesOf(slug: string, galleryTitle: string, picks: number[]): Frame[] {
  const p = projectOrThrow(slug);
  const gallery = p.media.galleries?.find((g) => g.title === galleryTitle);
  if (!gallery) throw new Error(`Missing gallery ${galleryTitle} for ${slug}`);
  return picks.map((i) => {
    const item = gallery.items[i];
    return { src: item.src, alt: item.alt, width: item.width, height: item.height };
  });
}

function build(
  slug: string,
  extra: Pick<AppView, "kind" | "what" | "role" | "where" | "builtWith" | "hook" | "accent"> & { gallery: string; picks: number[] },
): AppView {
  const p = projectOrThrow(slug);
  const { gallery, picks, ...rest } = extra;
  return {
    id: slug,
    slug,
    name: p.name,
    years: p.years ?? "",
    stores: storesOf(p.links),
    site: p.links.find((l) => l.label === "Website"),
    frames: framesOf(slug, gallery, picks),
    ...rest,
  };
}

export const apps: AppView[] = [
  build("viva-fresh", {
    kind: "Grocery and loyalty app",
    what: "Shoppers fill a cart, pick a delivery slot and find their address on a map. The interface is in Albanian.",
    role: "Mobile",
    where: "iOS and Android",
    builtWith: "React Native",
    hook: "Live in both stores",
    accent: "#ed1d26",
    gallery: "Store screenshots",
    picks: [0, 2],
  }),
  build("dukagjini-bookstore", {
    kind: "Bookstore app for a publisher",
    what: "Readers search books, keep favourite lists and check out with promo codes. A push notification opens the right screen.",
    role: "Mobile",
    where: "iOS and Android",
    builtWith: "React Native",
    hook: "Live in both stores",
    accent: "#de0016",
    gallery: "Store screenshots",
    picks: [0, 1],
  }),
  build("bayyinah-tv", {
    kind: "Video-learning platform",
    what: "Courses, live streams and subscriptions, in English and Arabic. The same web app runs inside the iOS and Android apps.",
    role: "Frontend, core team",
    where: "Web, iOS and Android",
    builtWith: "Vue",
    hook: "Live in both stores",
    accent: "#801402",
    gallery: "Mobile app",
    picks: [0, 1],
  }),
  build("read-to-feed", {
    kind: "Children's reading app",
    what: "Children read books, scan their own books by barcode and earn badges. About 14 releases went to both stores.",
    role: "Mobile",
    where: "iOS and Android",
    builtWith: "React Native, upgraded three times",
    hook: "Removed from both stores",
    accent: "#0f72a2",
    gallery: "Store screenshots",
    picks: [0, 1],
  }),
];
