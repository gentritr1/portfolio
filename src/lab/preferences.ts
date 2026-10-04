import { installSlowMotion } from "./slowMotion";
/** Development-only frame controls. This module is eliminated from production builds. */
export function applyReviewPreferences() {
  const params = new URLSearchParams(location.search);
  if (!params.has("review")) return;
  if (params.get("speed") === "0.1") installSlowMotion();
  if (params.get("graphics") === "off") {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value(this: HTMLCanvasElement, type: string, options?: unknown) {
        if (["webgl", "webgl2", "experimental-webgl"].includes(type))
          return null;
        return Reflect.apply(original, this, [type, options]);
      },
    });
  }
  document.documentElement.dataset.reviewCls = "0";
  let cls = 0;
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const shift = entry as PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
        sources?: {
          node?: Element;
          previousRect: DOMRectReadOnly;
          currentRect: DOMRectReadOnly;
        }[];
      };
      if (!shift.hadRecentInput) {
        cls += shift.value;
        document.documentElement.dataset.reviewShift = JSON.stringify(
          shift.sources?.map((source) => ({
            element: source.node?.tagName,
            class: source.node?.className,
            before: source.previousRect,
            after: source.currentRect,
          })),
        );
      }
    }
    document.documentElement.dataset.reviewCls = String(cls);
  });
  observer.observe({ type: "layout-shift", buffered: true });
  const paintObserver = new PerformanceObserver((list) => {
    const last = list.getEntries().at(-1);
    if (last)
      document.documentElement.dataset.reviewLcp = String(
        Math.round(last.startTime),
      );
  });
  paintObserver.observe({ type: "largest-contentful-paint", buffered: true });
  document.documentElement.dataset.theme =
    params.get("theme") === "light" ? "light" : "dark";
  const reduced = params.get("motion") === "reduce";
  document.documentElement.dataset.reviewMotion = reduced ? "reduce" : "normal";
  const nativeMatchMedia = window.matchMedia.bind(window);
  window.matchMedia = (query) => {
    const forcedQuery = query.replace(
      /\(prefers-reduced-motion(?:\s*:\s*(reduce|no-preference))?\)/g,
      (_, preference: string) =>
        ((preference ?? "reduce") === "reduce") === reduced
          ? "(min-width: 0px)"
          : "(min-width: 999999px)",
    );
    return nativeMatchMedia(forcedQuery);
  };
  if (reduced) {
    const style = document.createElement("style");
    style.textContent =
      "*,*::before,*::after{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}";
    document.head.append(style);
  }
}
