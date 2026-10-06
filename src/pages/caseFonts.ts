import { preload } from "react-dom";

const FACES = ["/fonts/creative/Fraunces-Latin.woff2", "/fonts/creative/PublicSans-Latin.woff2"];
const LOADS = ['500 40px "Case Fraunces"', '400 17px "Case Public Sans"', '600 17px "Case Public Sans"'];

/** Starts the two case faces before the route's code arrives. Call it while the route renders. */
export function preloadCaseFonts() {
  for (const href of FACES) preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
}

/** Waits at most 300 ms for the faces. A page that opens without them keeps its fallback faces for the visit. */
export function fontsReady(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return Promise.resolve();
  const faces = Promise.all(LOADS.map((face) => document.fonts.load(face))).then(() => undefined);
  const limit = new Promise<void>((resolve) => window.setTimeout(resolve, 300));
  return Promise.race([faces, limit]).catch(() => undefined);
}

export function facesLoaded() {
  if (typeof document === "undefined" || !document.fonts) return true;
  return LOADS.every((face) => document.fonts.check(face));
}
