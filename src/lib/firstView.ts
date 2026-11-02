import type { ComponentType } from "react";
import { featuredProjects } from "../content/projects";
import { OWN_SLUGS } from "../portfolio/home";

/**
 * A draft that is opened directly loads before the first render and mounts outside the Suspense
 * boundaries: React holds a revealed boundary for 300 ms after its fallback shows.
 */
export const firstView: { home: ComponentType | null } = { home: null };

/** The home's paths: the refractive engine at `/` and each of its cases at `/<slug>` (owner, 2026-10-30). */
const HOME_SLUGS = new Set([...featuredProjects.map((project) => project.slug), ...OWN_SLUGS]);
export function isHomePath(path: string) {
  const slug = path.replace(/^\/|\/$/g, "");
  return slug === "" || HOME_SLUGS.has(slug);
}

export function preloadFirstView(): Promise<unknown> {
  const path = import.meta.env.VITE_ROUTER === "hash" ? window.location.hash.slice(1) : window.location.pathname;
  const clean = path.replace(/[?#].*$/, "");
  if (isHomePath(clean))
    return import("../portfolio/Draft").then((module) => {
      firstView.home = module.default;
    });
  return Promise.resolve();
}
