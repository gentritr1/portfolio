import type { MouseEvent } from "react";
import { flushSync } from "react-dom";

/**
 * Tile to case, without scaling a pixel.
 *
 * Both pages show the same screen at actual size inside a window. The view transition moves and
 * resizes the window (the group), while the snapshot inside it is drawn at its own size and slides
 * so every app pixel stays on the same app pixel. The window opens; the screen never zooms.
 *
 * Keyboard activation, reduced motion and browsers without view transitions navigate at once.
 */

export const SHOT_NAME = "p12p-shot";
// In-out, not expo-out: the window visibly travels and opens instead of arriving in the first 100 ms.
const EASE = "cubic-bezier(0.77, 0, 0.175, 1)";
const MS = 520;

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void | Promise<void>) => { finished: Promise<void> };
};

interface Measured {
  win: DOMRect;
  img: DOMRect;
}

function measure(el: Element | null): Measured | null {
  const img = el?.querySelector("img");
  if (!el || !img) return null;
  return { win: el.getBoundingClientRect(), img: img.getBoundingClientRect() };
}

function onScreen(r: DOMRect) {
  return r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
}

export function openWindow(
  event: MouseEvent<HTMLAnchorElement>,
  to: string,
  navigate: (to: string) => void,
  from: string,
  target: string,
) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  // The next view moves focus to its heading, so keyboard and screen-reader users land on it.
  document.documentElement.dataset.p12pFocus = "1";

  const doc = document as ViewTransitionDocument;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const keyboard = event.detail === 0;
  if (!doc.startViewTransition || reduce || keyboard) {
    navigate(to);
    return;
  }

  const source = document.querySelector<HTMLElement>(from);
  const a = measure(source);
  const unname = (el: Element | null | undefined) => {
    const named = el?.closest(".p12p-hero, .p12p-case-fig");
    named?.querySelectorAll<HTMLElement>(".p12p-win, .p12p-dim-rule").forEach((n) => n.style.setProperty("view-transition-name", "none"));
  };
  if (!source || !a || !onScreen(a.win)) {
    // The screen is out of view: the page only cross-fades.
    unname(source);
    doc.startViewTransition(() => flushSync(() => navigate(to)));
    return;
  }

  const style = document.createElement("style");
  const transition = doc.startViewTransition(async () => {
    flushSync(() => navigate(to));
    const next = document.querySelector<HTMLElement>(target);
    const img = next?.querySelector("img");
    if (img) await img.decode().catch(() => undefined);
    const b = measure(next ?? null);
    if (!b) return;
    if (!onScreen(b.win)) {
      // Coming back to a row further down the page: the screen it came from is not in view.
      unname(next);
      return;
    }
    // App pixel at the window's corner, before and after.
    const ax = a.win.left - a.img.left;
    const ay = a.win.top - a.img.top;
    const bx = b.win.left - b.img.left;
    const by = b.win.top - b.img.top;
    style.textContent = `
::view-transition-group(${SHOT_NAME}), ::view-transition-group(p12p-dim) { animation-duration: ${MS}ms; animation-timing-function: ${EASE}; }
::view-transition-image-pair(${SHOT_NAME}) { overflow: hidden; }
::view-transition-old(${SHOT_NAME}) {
  animation: p12p-hold ${MS}ms ${EASE} both;
  inline-size: ${a.win.width}px;
  block-size: ${a.win.height}px;
}
::view-transition-new(${SHOT_NAME}) {
  animation: p12p-open ${MS}ms ${EASE} both;
  inline-size: ${b.win.width}px;
  block-size: ${b.win.height}px;
}
::view-transition-old(root), ::view-transition-new(root) { animation-duration: 200ms; }
@keyframes p12p-open {
  from { transform: translate(${(bx - ax).toFixed(2)}px, ${(by - ay).toFixed(2)}px); }
  to { transform: none; }
}
@keyframes p12p-hold {
  from { transform: none; }
  to { transform: translate(${(ax - bx).toFixed(2)}px, ${(ay - by).toFixed(2)}px); }
}`;
    document.head.append(style);
  });
  transition.finished.finally(() => {
    style.remove();
    source.style.removeProperty("view-transition-name");
  });
}

/** Called by each view on mount: after an in-page navigation, focus goes to the view's heading. */
export function takeFocus(heading: HTMLElement | null) {
  const root = document.documentElement;
  if (!heading || root.dataset.p12pFocus !== "1") return;
  delete root.dataset.p12pFocus;
  heading.focus({ preventScroll: true });
}
