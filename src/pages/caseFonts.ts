import { preload } from "react-dom";

const FACES = ["/fonts/creative/PublicSans-Latin.woff2", "/fonts/creative/BigShouldersDisplay-Latin.woff2"];

/** Starts the three case faces before the route's code arrives. Call it while the route renders. */
export function preloadCaseFonts() {
  for (const href of FACES) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  // Archivo's face rule is already in the page, and Chrome fetches a preloaded font a second time when its rule came first.
  if (typeof document !== "undefined") void document.fonts?.load('700 40px "Archivo"').catch(() => undefined);
}

/**
 * Waits at most 300 ms for the faces. A slower face swaps in later over a fallback
 * with matched metrics (case.css), so the page never stays blank for it.
 */
export function fontsReady(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  const faces = Promise.all([
    document.fonts.load('700 40px "Archivo"'),
    document.fonts.load('800 96px "Big Shoulders Display"'),
    document.fonts.load('400 17px "Public Sans"'),
    document.fonts.load('700 17px "Public Sans"'),
  ]).then(() => undefined);
  const limit = new Promise<void>((resolve) => window.setTimeout(resolve, 300));
  return Promise.race([faces, limit]).catch(() => undefined);
}
