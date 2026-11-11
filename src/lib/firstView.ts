import type { ComponentType } from "react";
import { featuredProjects } from "../content/projects";
import Draft from "../portfolio/Draft";
import { OWN_SLUGS } from "../portfolio/home";

/**
 * The home ships in the entry, not behind a dynamic import: the import was a second round trip after the entry ran, and
 * the dark page waited for it (first paint to first content 600 ms on the live site at 1440, 500 ms on a 4x phone,
 * measured 2026-11-11). Every path but the 404 is the home or one of its cases, so nothing else pays for it. A draft
 * opened directly mounts outside the Suspense boundaries: React holds a revealed boundary for 300 ms after its fallback shows.
 */
export const firstView: { home: ComponentType | null } = { home: null };

/** The home's paths: the refractive engine at `/` and each of its cases at `/<slug>` (owner, 2026-10-30). */
const HOME_SLUGS = new Set([...featuredProjects.map((project) => project.slug), ...OWN_SLUGS]);
export function isHomePath(path: string) {
  const slug = path.replace(/^\/|\/$/g, "");
  return slug === "" || HOME_SLUGS.has(slug);
}

export function preloadFirstView() {
  const path = import.meta.env.VITE_ROUTER === "hash" ? window.location.hash.slice(1) : window.location.pathname;
  if (isHomePath(path.replace(/[?#].*$/, ""))) firstView.home = Draft;
}
