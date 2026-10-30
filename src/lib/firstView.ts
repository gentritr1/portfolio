import type { ComponentType } from "react";
import { featuredProjects } from "../content/projects";
import { OWN_SLUGS } from "../drafts/refractive-engine/home";

/**
 * A draft that is opened directly loads before the first render and mounts outside the Suspense
 * boundaries: React holds a revealed boundary for 300 ms after its fallback shows.
 */
export const firstView: { loop: ComponentType | null; home: ComponentType | null } = { loop: null, home: null };

/** The home's paths: the refractive engine at `/` and each of its cases at `/<slug>` (owner, 2026-10-30). */
const HOME_SLUGS = new Set([...featuredProjects.map((project) => project.slug), ...OWN_SLUGS]);
export function isHomePath(path: string) {
  const slug = path.replace(/^\/|\/$/g, "");
  return slug === "" || HOME_SLUGS.has(slug);
}

/** The Loop, the home before 2026-10-30, now lives with the drafts. */
export function isLoopPath(path: string) {
  return path === "/drafts/the-loop" || path.startsWith("/drafts/the-loop/");
}

export function preloadFirstView(): Promise<unknown> {
  const path = import.meta.env.VITE_ROUTER === "hash" ? window.location.hash.slice(1) : window.location.pathname;
  const clean = path.replace(/[?#].*$/, "");
  if (isHomePath(clean))
    return import("../drafts/refractive-engine/Draft").then((module) => {
      firstView.home = module.default;
    });
  if (!isLoopPath(clean)) return Promise.resolve();
  return import("../drafts/the-loop/Draft").then((module) => {
    firstView.loop = module.default;
  });
}
