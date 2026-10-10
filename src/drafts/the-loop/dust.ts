import { useEffect, type RefObject } from "react";
import { ROOM_QUERY } from "./room";
import "./dust.css";

/** Dust drifts in the room's light pool on a wide landscape screen with motion allowed. */
const QUERY = `(prefers-reduced-motion: no-preference) and ${ROOM_QUERY}`;
const COUNT = 38;
/** The top speed of a speck, in CSS pixels a second. */
const SPEED = 6;
/** The dust draws at most this often, in ms: 15 times a second. At these speeds a speck moves less than 0.4 px between two draws. */
const STEP = 66;
/** The dust hides while the page scrolls and shows again this long after the scroll stops, so a scroll frame never draws dust. */
const SCROLL_REST = 600;
/** The dust fades in over this time after the lights come on. */
const FADE_IN = 1600;
/**
 * The dust starts after the hero build ends (`.lp-build[data-phase="done"]`) and when the home root has `data-lights="on"`.
 * Without that attribute it starts this long after the page opens.
 */
const WAIT = 2000;

interface Speck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rate: number;
  phase: number;
}

/** A pseudo-random number from a seed, so the dust has the same shape on every visit. */
function random(seed: number) {
  const s = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
}

function specks(): Speck[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const angle = random(i + 1) * Math.PI * 2;
    const speed = 1.5 + random(i + 51) * (SPEED - 2.5);
    return {
      x: random(i + 101),
      y: random(i + 151),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.6,
      size: 2.4 + random(i + 201) * 3.2,
      alpha: 0.5 + random(i + 251) * 0.5,
      rate: 0.6 + random(i + 301) * 1.6,
      phase: random(i + 351) * Math.PI * 2,
    };
  });
}

/** One soft amber dot. Each speck draws this image, which is cheaper than a path for each speck. */
function sprite() {
  const size = 16;
  const dot = document.createElement("canvas");
  dot.width = dot.height = size;
  const g = dot.getContext("2d")!;
  const gradient = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgb(255 222 168 / 1)");
  gradient.addColorStop(0.4, "rgb(255 200 120 / 0.55)");
  gradient.addColorStop(1, "rgb(255 181 71 / 0)");
  g.fillStyle = gradient;
  g.fillRect(0, 0, size, size);
  return dot;
}

/**
 * A few specks of dust drift slowly in the room's light pool (`.lp-room-light > i`), brighter in its middle and gone at its edge.
 * One canvas covers the bright middle of the pool and sits inside it, so it moves with the pool. Soft dots need one canvas
 * pixel for each CSS pixel. The frame loop stops while the tab is hidden and while the pool is dark. While the page scrolls,
 * the dust fades out and the canvas is not drawn; it comes back when the reader stops.
 */
export function useDust(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const home = root.current;
    const pool = home?.querySelector<HTMLElement>(".lp-room-light > i");
    const light = pool?.parentElement;
    if (!home || !pool || !light) return;
    const media = window.matchMedia(QUERY);
    let stop: (() => void) | undefined;

    const start = () => {
      const canvas = document.createElement("canvas");
      canvas.className = "lp-dust";
      canvas.setAttribute("aria-hidden", "true");
      pool.append(canvas);
      const g = canvas.getContext("2d")!;
      const dot = sprite();
      const list = specks();
      /** The boxes drawn in the last frame: only these are cleared. */
      const dirty: Array<[number, number, number]> = [];
      let w = 0;
      let h = 0;
      let raf = 0;
      let last = 0;
      let drawn = 0;
      let born = 0;
      let scrolled = -Infinity;
      let hidden = false;

      const size = () => {
        w = canvas.clientWidth;
        h = canvas.clientHeight;
        canvas.width = w;
        canvas.height = h;
        dirty.length = 0;
      };

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (now - scrolled < SCROLL_REST) return;
        if (hidden) {
          hidden = false;
          delete canvas.dataset.hide;
        }
        if (now - drawn < STEP) return;
        const dt = Math.min(0.1, (now - (last || now)) / 1000);
        last = now;
        drawn = now;
        born ||= now;
        const fade = Math.min(1, (now - born) / FADE_IN);
        for (const [x, y, d] of dirty) g.clearRect(x, y, d, d);
        dirty.length = 0;
        const t = now / 1000;
        for (const s of list) {
          s.x += (s.vx * dt) / w;
          s.y += (s.vy * dt) / h;
          if (s.x < -0.02) s.x += 1.04;
          else if (s.x > 1.02) s.x -= 1.04;
          if (s.y < -0.02) s.y += 1.04;
          else if (s.y > 1.02) s.y -= 1.04;
          const dx = (s.x - 0.5) * 2;
          const dy = (s.y - 0.5) * 2;
          const reach = 1 - Math.sqrt(dx * dx + dy * dy);
          if (reach <= 0) continue;
          const twinkle = 0.55 + 0.45 * Math.sin(t * s.rate + s.phase);
          g.globalAlpha = Math.min(1, reach * 1.8) ** 1.2 * s.alpha * twinkle * fade;
          const x = s.x * w - s.size / 2;
          const y = s.y * h - s.size / 2;
          g.drawImage(dot, x, y, s.size, s.size);
          dirty.push([Math.floor(x) - 1, Math.floor(y) - 1, Math.ceil(s.size) + 3]);
        }
      };

      const sync = () => {
        const run = !document.hidden && !light.hasAttribute("data-dark");
        if (run && !raf) {
          last = 0;
          raf = requestAnimationFrame(frame);
        } else if (!run && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };
      const scroll = () => {
        scrolled = performance.now();
        last = 0;
        if (!hidden) {
          hidden = true;
          canvas.dataset.hide = "";
        }
      };

      size();
      const resize = new ResizeObserver(size);
      resize.observe(canvas);
      const dark = new MutationObserver(sync);
      dark.observe(light, { attributes: true, attributeFilter: ["data-dark"] });
      document.addEventListener("visibilitychange", sync);
      window.addEventListener("scroll", scroll, { passive: true });
      sync();
      return () => {
        cancelAnimationFrame(raf);
        resize.disconnect();
        dark.disconnect();
        document.removeEventListener("visibilitychange", sync);
        window.removeEventListener("scroll", scroll);
        canvas.remove();
      };
    };

    /** Waits for the end of the hero build and for the lights (another part of the home sets `data-lights`), or WAIT ms for the lights. */
    const begin = () => {
      let run: (() => void) | undefined;
      let late = false;
      const go = () => {
        const build = home.querySelector<HTMLElement>(".lp-build");
        const built = !build || build.dataset.phase === "done";
        if (run || !built || !(late || home.dataset.lights === "on")) return;
        watch.disconnect();
        window.clearTimeout(timer);
        run = start();
      };
      const watch = new MutationObserver(go);
      watch.observe(home, { attributes: true, subtree: true, attributeFilter: ["data-lights", "data-phase"] });
      const timer = window.setTimeout(() => {
        late = true;
        go();
      }, WAIT);
      go();
      return () => {
        watch.disconnect();
        window.clearTimeout(timer);
        run?.();
      };
    };

    const sync = () => {
      stop?.();
      stop = media.matches ? begin() : undefined;
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      stop?.();
    };
  }, [root]);
}
