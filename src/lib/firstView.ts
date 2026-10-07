import type { ComponentType } from "react";

/**
 * A draft that is opened directly loads before the first render and mounts outside the Suspense
 * boundaries: React holds a revealed boundary for 300 ms after its fallback shows.
 */
export const firstView: { loop: ComponentType | null } = { loop: null };

export function isLoopPath(path: string) {
  return path === "/drafts/the-loop" || path.startsWith("/drafts/the-loop/");
}

export function preloadFirstView(): Promise<unknown> {
  const path = import.meta.env.VITE_ROUTER === "hash" ? window.location.hash.slice(1) : window.location.pathname;
  if (!isLoopPath(path.replace(/[?#].*$/, ""))) return Promise.resolve();
  return import("../drafts/the-loop/Draft").then((module) => {
    firstView.loop = module.default;
  });
}
