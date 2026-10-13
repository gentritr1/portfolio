import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { encodeCached } from "./qr";

/** Version 6, level M: the same 41 by 41 grid for every code, so a change rewrites only the squares that differ. */
const VERSION = 6;
const QUIET = 4;
const CELL = 4;

const easeOutExpo = (p: number) => (p >= 1 ? 1 : 1 - Math.pow(2, -10 * p));

interface Props {
  text: string;
  /** The first build of the page: squares appear from the centre outwards. */
  story?: boolean;
  /** Start the first build once the page is ready. */
  ready: boolean;
}

/**
 * A QR code drawn square by square on a canvas. Encoded in the browser by ./qr.ts.
 * When the text changes only the squares that differ turn on or off (320 ms). On first load
 * the whole code writes itself outwards from the centre (700 ms). Reduced motion draws the end state.
 */
export default function Code({ text, story = false, ready }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const scales = useRef<Float32Array | null>(null);
  const raf = useRef(0);
  const reduce = useReducedMotion();
  const storyDone = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !ready) return;
    const code = encodeCached(text, "M", VERSION);
    const n = code.size;
    const px = (n + QUIET * 2) * CELL;
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    if (canvas.width !== Math.round(px * dpr)) {
      canvas.width = Math.round(px * dpr);
      canvas.height = Math.round(px * dpr);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) target[y * n + x] = code.modules[y][x] ? 1 : 0;
    const from = scales.current && scales.current.length === n * n ? Float32Array.from(scales.current) : new Float32Array(n * n);
    const cur = Float32Array.from(from);
    scales.current = cur;

    const draw = () => {
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, px, px);
      ctx.fillStyle = "#1c1210";
      for (let y = 0; y < n; y++) {
        for (let x = 0; x < n; x++) {
          const s = cur[y * n + x];
          if (s <= 0.001) continue;
          const m = CELL * s;
          const o = (CELL - m) / 2;
          ctx.fillRect((x + QUIET) * CELL + o, (y + QUIET) * CELL + o, m, m);
        }
      }
    };

    cancelAnimationFrame(raf.current);
    const isStory = story && !storyDone.current;
    if (reduce) {
      cur.set(target);
      draw();
      storyDone.current = true;
      return;
    }

    const maxDelay = isStory ? 460 : 110;
    const dur = isStory ? 240 : 210;
    const c = (n - 1) / 2;
    const maxD = Math.hypot(c, c);
    const delay = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) delay[y * n + x] = (Math.hypot(x - c, y - c) / maxD) * maxDelay;

    const t0 = performance.now();
    const step = (now: number) => {
      const t = now - t0;
      let done = true;
      for (let i = 0; i < n * n; i++) {
        if (from[i] === target[i]) continue;
        const p = Math.min(1, Math.max(0, (t - delay[i]) / dur));
        cur[i] = from[i] + (target[i] - from[i]) * easeOutExpo(p);
        if (p < 1) done = false;
      }
      draw();
      if (!done) raf.current = requestAnimationFrame(step);
      else if (isStory) storyDone.current = true;
    };
    draw();
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [text, ready, reduce, story]);

  return (
    <canvas
      ref={ref}
      className="pb-code-canvas"
      width={(41 + QUIET * 2) * CELL}
      height={(41 + QUIET * 2) * CELL}
      aria-hidden="true"
      data-motion={story ? "story" : undefined}
    />
  );
}
