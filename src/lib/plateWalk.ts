import type { MouseEvent } from "react";
import { flushSync } from "react-dom";
import { preloadCase } from "./routes";

export const wait = (ms: number) => new Promise<void>((done) => window.setTimeout(done, ms));

/** A plate walks only when half of it, or 240 px of it, is on screen at both ends. */
export function inView(element: Element | null): element is HTMLElement {
  if (!(element instanceof HTMLElement)) return false;
  const box = element.getBoundingClientRect();
  const seen = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0);
  return box.width > 0 && seen >= Math.min(240, box.height / 2);
}

export function canWalk() {
  return "startViewTransition" in document && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Waits a short time for the plate's picture, so the snapshot does not show an empty plate. */
async function ready(plate: Element | null) {
  const image = plate?.querySelector("img");
  if (!image || image.complete || !inView(plate)) return;
  image.loading = "eager";
  await Promise.race([image.decode().catch(() => undefined), wait(600)]);
}

/** The first screen of the case page that is now open. */
export async function caseScreen() {
  const screen = document.querySelector(".cs [data-cs-screen]");
  await ready(screen);
  return screen;
}

let walking = false;

/**
 * Moves one plate from this page into its counterpart on the next page. Everything else changes at once.
 * `go` must commit the next route inside the call; `find` returns the counterpart after that commit.
 */
export function walk(slug: string, from: HTMLElement, go: () => void, find: () => Promise<Element | null>) {
  if (walking) return;
  walking = true;
  const name = `plate-${slug}`;
  const html = document.documentElement;
  let to: HTMLElement | null = null;
  from.style.viewTransitionName = name;
  html.dataset.walk = "";
  const transition = document.startViewTransition(async () => {
    from.style.viewTransitionName = "";
    flushSync(go);
    const found = await find();
    if (inView(found)) {
      to = found;
      to.style.viewTransitionName = name;
    }
  });
  transition.ready.catch(() => undefined);
  void transition.finished
    .catch(() => undefined)
    .then(() => {
      walking = false;
      delete html.dataset.walk;
      if (to) to.style.viewTransitionName = "";
    });
}

/** A plain click on a home row's case link walks the row's plate into the case page. */
export function walkInto(event: MouseEvent<HTMLAnchorElement>, slug: string, go: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !canWalk()) return;
  const from = document.querySelector(`[data-plate="${slug}"]`);
  if (!inView(from)) return;
  event.preventDefault();
  if (walking) return;
  const late = wait(1000).then(() => Promise.reject(new Error("late")));
  void Promise.race([preloadCase(slug), late]).then(
    () => walk(slug, from, go, caseScreen),
    () => go(),
  );
}
