import { useEffect, useLayoutEffect, type RefObject } from "react";
import { useNavigate } from "react-router";
import { canWalk, caseScreen, inView, wait, walk } from "../lib/plateWalk";
import { preloadCase, takeBack } from "../lib/routes";
import { HOME_WORK } from "./caseLight";

const MARKS = ".cs-shot-ring, .cs-proof, .cs-number-figure, .cs-figures ul, .cs-flow, .cs-twin, .cs-share";
/** A mark that is set back and on screen but has not drawn by then draws now. */
const SAFETY_MS = 2000;
/** An off-screen mark waits for its observer; the safety looks again after this time. */
const RECHECK_MS = 500;
/** Longer than the slowest mark with its delays. A longer mark gives its own time in `data-draw-ms`. */
const DONE_MS = 1000;

const OUT = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const IN_OUT = "cubic-bezier(0.77, 0, 0.175, 1)";
/** The light passes one step in this time. */
const FLOW_STEP_MS = 240;
const LIT_MS = 480;
const DOT_MS = 640;

/** Points along a polyline whose inner corners are rounded with radius r. */
function rounded(points: number[][], r: number) {
  const out = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const a = Math.hypot(px - cx, py - cy);
    const b = Math.hypot(nx - cx, ny - cy);
    const k = Math.min(r, a / 2, b / 2);
    const inX = cx + ((px - cx) / a) * k;
    const inY = cy + ((py - cy) / a) * k;
    const outX = cx + ((nx - cx) / b) * k;
    const outY = cy + ((ny - cy) / b) * k;
    for (let s = 0; s <= 4; s++) {
      const t = s / 4;
      const u = 1 - t;
      out.push([u * u * inX + 2 * u * t * cx + t * t * outX, u * u * inY + 2 * u * t * cy + t * t * outY]);
    }
  }
  out.push(points.at(-1)!);
  return out;
}

/**
 * The flow plate plays one change: a light passes through the steps, a dot runs the way back, and the light passes
 * the steps again from there. Geometry is read once, before the first frame. Nothing is filled, so the end is the static plate.
 */
function playFlow(figure: HTMLElement): Animation[] {
  const body = figure.querySelector<HTMLElement>(".cs-flow-body");
  const back = figure.querySelector<HTMLElement>(".cs-flow-back");
  const dot = figure.querySelector<HTMLElement>(".cs-flow-dot");
  const lit = [...figure.querySelectorAll<HTMLElement>(".cs-flow-lit")];
  const from = Number(figure.dataset.from);
  const to = Number(figure.dataset.to);
  if (!body || !back || !dot || lit.length < 2 || !(from > to)) return [];
  const o = body.getBoundingClientRect();
  const b = back.getBoundingClientRect();
  const x = b.left - o.left;
  const y = b.top - o.top;
  const column = lit[1].getBoundingClientRect().top > lit[0].getBoundingClientRect().top;
  // The dot runs on the centre line of the way back that case.css draws: 1.5 px wide, corner radius 14 px.
  const path = column
    ? [[x, y + b.height - 0.75], [x + 27.25, y + b.height - 0.75], [x + 27.25, y + 0.75], [x, y + 0.75]]
    : [[x + b.width - 0.75, y], [x + b.width - 0.75, y + b.height - 30.75], [x + 0.75, y + b.height - 30.75], [x + 0.75, y]];
  const points = rounded(path, 13.25);
  const lengths = points.slice(1).map(([px, py], i) => Math.hypot(px - points[i][0], py - points[i][1]));
  const total = lengths.reduce((sum, length) => sum + length, 0);
  let run = 0;
  const frames = points.map(([px, py], i) => {
    if (i) run += lengths[i - 1];
    return { transform: `translate(${(px - 5).toFixed(2)}px, ${(py - 5).toFixed(2)}px)`, offset: run / total };
  });
  const light = (k: number, at: number, hold = 0) =>
    lit[k].animate(
      [
        { opacity: 0, easing: OUT },
        { opacity: 1, offset: (0.25 * LIT_MS) / (LIT_MS + hold) },
        { opacity: 1, offset: (0.5 * LIT_MS + hold) / (LIT_MS + hold), easing: "ease" },
        { opacity: 0 },
      ],
      { duration: LIT_MS + hold, delay: at },
    );
  const list = lit.map((_, k) => light(k, k * FLOW_STEP_MS, k === from ? FLOW_STEP_MS : 0));
  const leave = (from + 1) * FLOW_STEP_MS;
  list.push(dot.animate(frames, { duration: DOT_MS, delay: leave, easing: IN_OUT }));
  list.push(
    dot.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.84 }, { opacity: 0 }], {
      duration: DOT_MS,
      delay: leave,
    }),
  );
  for (let k = to; k <= from; k++) list.push(light(k, leave + DOT_MS + (k - to) * FLOW_STEP_MS));
  return list;
}

/**
 * Each proof mark draws once, when it comes on screen. A mark is complete by default. It is set back only
 * when it is on screen at load, or a quarter screen before it enters; a mark that a fast scroll shows at once stays complete.
 */
export function useDraw(root: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const scope = root.current;
    if (!scope || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timers: number[] = [];
    const played: Animation[] = [];
    const run = (mark: HTMLElement) => {
      if (mark.dataset.draw !== "before") return;
      mark.dataset.draw = "run";
      if (mark.matches(".cs-flow")) played.push(...playFlow(mark));
      timers.push(window.setTimeout(() => delete mark.dataset.draw, Number(mark.dataset.drawMs) || DONE_MS));
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
      played.forEach((animation) => animation.cancel());
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
