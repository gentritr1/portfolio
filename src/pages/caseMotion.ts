import { useEffect, useLayoutEffect, type RefObject } from "react";
import { useNavigate } from "react-router";
import { canWalk, caseScreen, inView, wait, walk } from "../lib/plateWalk";
import { preloadCase, takeBack } from "../lib/routes";
import { HOME_WORK } from "./caseLight";

const MARKS = ".cs-shot-ring, .cs-proof, .cs-number-figure, .cs-figures ul";
/** A mark that is set back and on screen but has not drawn by then draws now. */
const SAFETY_MS = 2000;
/** An off-screen mark waits for its observer; the safety looks again after this time. */
const RECHECK_MS = 500;
/** Longer than the slowest mark with its delays. */
const DONE_MS = 1000;

/**
 * Each proof mark draws once, when it comes on screen. A mark is complete by default. It is set back only
 * when it is on screen at load, or a quarter screen before it enters; a mark that a fast scroll shows at once stays complete.
 */
export function useDraw(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const run = (mark: HTMLElement) => {
      if (mark.dataset.draw !== "before") return;
      mark.dataset.draw = "run";
      timers.push(window.setTimeout(() => delete mark.dataset.draw, DONE_MS));
    };
    const enter = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          enter.unobserve(entry.target);
          run(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.6 },
    );
    const arm = (mark: HTMLElement) => {
      mark.dataset.draw = "before";
      enter.observe(mark);
      const safety = (ms: number) =>
        timers.push(
          window.setTimeout(() => {
            if (mark.dataset.draw !== "before") return;
            const box = mark.getBoundingClientRect();
            if (box.bottom > 0 && box.top < window.innerHeight) run(mark);
            else safety(RECHECK_MS);
          }, ms),
        );
      safety(SAFETY_MS);
    };
    const near = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          near.unobserve(entry.target);
          if (entry.boundingClientRect.top >= window.innerHeight) arm(entry.target as HTMLElement);
        }
      },
      { rootMargin: "0px 0px 25% 0px" },
    );
    for (const mark of scope.querySelectorAll<HTMLElement>(MARKS)) {
      const box = mark.getBoundingClientRect();
      if (box.top >= window.innerHeight) near.observe(mark);
      else if (box.bottom > 0) arm(mark);
    }
    return () => {
      enter.disconnect();
      near.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      scope.querySelectorAll<HTMLElement>("[data-draw]").forEach((mark) => delete mark.dataset.draw);
    };
  }, [root]);
}

/** The home page restores its scroll after its faces settle; its plate is placed only then. */
async function homePlate(slug: string) {
  for (let i = 0; i < 40 && !document.querySelector('.kt[data-fonts]:not([data-fonts="wait"])'); i++) await wait(16);
  return document.querySelector(`[data-plate="${slug}"]`);
}

const plain = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;

/** Back, Work and Next project carry a plate between the pages when the browser can show it. */
export function useWalks(slug: string) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!canWalk()) return;
    const first = () => document.querySelector(".cs [data-cs-screen]");
    let replaying = false;
    const back = (event: PopStateEvent) => {
      const from = first();
      if (replaying || window.location.pathname !== "/" || !inView(from)) return false;
      // The browser restores the home page's scroll on this page before the snapshot; undo it, and give it to the home page.
      const y = window.scrollY;
      let restored = 0;
      requestAnimationFrame(() => {
        restored = window.scrollY;
        window.scrollTo(0, y);
      });
      walk(
        slug,
        from,
        () => {
          replaying = true;
          window.dispatchEvent(new PopStateEvent("popstate", { state: event.state }));
        },
        async () => {
          const plate = await homePlate(slug);
          if (restored && window.scrollY === 0) window.scrollTo(0, restored);
          return plate;
        },
      );
      return true;
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link || !plain(event)) return;
      const plate = link.querySelector<HTMLElement>("[data-plate]");
      if (link.getAttribute("href") === HOME_WORK) {
        const from = first();
        if (!inView(from)) return;
        event.preventDefault();
        walk(slug, from, () => navigate(HOME_WORK), () => homePlate(slug));
      } else if (plate?.dataset.plate && inView(plate)) {
        const next = plate.dataset.plate;
        event.preventDefault();
        const go = () => navigate(`/work/${next}`);
        const late = wait(1000).then(() => Promise.reject(new Error("late")));
        void Promise.race([preloadCase(next), late]).then(() => walk(next, plate, go, caseScreen), go);
      }
    };
    const release = takeBack(back);
    document.addEventListener("click", click, true);
    return () => {
      release();
      document.removeEventListener("click", click, true);
    };
  }, [slug, navigate]);
}
