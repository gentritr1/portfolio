/**
 * The lamp: a sphere of 25 × 25 dots, shaded as if one light falls on it, with a tilted ring cut through it (the loop).
 * Adapted from the orbit-index mark. It draws only when its light moves, and not while it is off screen.
 */
type Rgb = [number, number, number];

const DOTS = 25;
const DIM: Rgb = [112, 112, 106];
const AMBER: Rgb = [255, 181, 71];
const TILT = 0.42;
const RING = 0.085;
const SLOPE = (33 * Math.PI) / 180;
const SHADES = 24;
/** The ease toward a new light direction, in ms. */
const EASE = 70;
/** Lights on (LampMark.tsx): the dots go from dim to lit in this time. */
export const GLOW_MS = 400;

export interface Lamp {
  /** Turns the lit side toward a point `x`, `y` px from the sphere's centre. `instant` skips the ease. */
  aim(x: number, y: number, instant?: boolean): void;
  /** Turns a dark lamp on: the dots go from dim to lit in `GLOW_MS`. */
  glow(): void;
  destroy(): void;
}

/** `dark`: the lamp starts with every dot dim and small, until `glow`. */
export function createLamp(canvas: HTMLCanvasElement, dark = false): Lamp {
  const ctx = canvas.getContext("2d");
  const cur = { x: -1, y: -1 };
  const tgt = { x: -1, y: -1 };
  let frame = 0;
  let last = 0;
  let shown = true;
  let stale = false;
  let level = dark ? 0 : 1;
  let glowing = 0;

  const fit = () => {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const side = Math.round(canvas.clientWidth * dpr);
    if (side && canvas.width !== side) canvas.width = canvas.height = side;
  };

  const draw = () => {
    if (!ctx) return;
    if (!shown) {
      stale = true;
      return;
    }
    stale = false;
    const S = canvas.width;
    const step = S / DOTS;
    const R = S / 2 - step * 0.35;
    ctx.clearRect(0, 0, S, S);
    const len = Math.hypot(cur.x, cur.y) || 1;
    const dx = cur.x / len;
    const dy = cur.y / len;
    const lx = dx * 0.74;
    const ly = dy * 0.74;
    const lz = 0.67;
    const a = [-Math.sin(SLOPE), Math.cos(SLOPE), 0];
    const kx = -dy;
    const ky = dx;
    const cos = Math.cos(TILT);
    const sin = Math.sin(TILT);
    const kv = kx * a[0] + ky * a[1];
    const ax = a[0] * cos + ky * a[2] * sin + kx * kv * (1 - cos);
    const ay = a[1] * cos - kx * a[2] * sin + ky * kv * (1 - cos);
    const az = a[2] * cos + (kx * a[1] - ky * a[0]) * sin;
    // The dots are grouped into SHADES steps of colour, one path and one fill for each step.
    const paths = Array.from({ length: SHADES }, () => new Path2D());
    for (let j = 0; j < DOTS; j++) {
      for (let i = 0; i < DOTS; i++) {
        const px = (i + 0.5) * step;
        const py = (j + 0.5) * step;
        const nx = (px - S / 2) / R;
        const ny = (py - S / 2) / R;
        const rr = nx * nx + ny * ny;
        if (rr > 1) continue;
        const nz = Math.sqrt(1 - rr);
        if (Math.abs(nx * ax + ny * ay + nz * az) < RING) continue;
        const shade = Math.max(0, nx * lx + ny * ly + nz * lz) * level;
        const radius = step * 0.48 * (0.3 + 0.7 * shade);
        const path = paths[Math.min(SHADES - 1, Math.round(Math.pow(shade, 1.6) * (SHADES - 1)))];
        path.moveTo(px + radius, py);
        path.arc(px, py, radius, 0, Math.PI * 2);
      }
    }
    paths.forEach((path, n) => {
      const t = n / (SHADES - 1);
      ctx.fillStyle = `rgb(${(DIM[0] + (AMBER[0] - DIM[0]) * t) | 0},${(DIM[1] + (AMBER[1] - DIM[1]) * t) | 0},${(DIM[2] + (AMBER[2] - DIM[2]) * t) | 0})`;
      ctx.fill(path);
    });
  };

  const tick = (now: number) => {
    const dt = Math.min(64, now - (last || now));
    last = now;
    const k = 1 - Math.exp(-dt / EASE);
    cur.x += (tgt.x - cur.x) * k;
    cur.y += (tgt.y - cur.y) * k;
    const moving = Math.abs(tgt.x - cur.x) + Math.abs(tgt.y - cur.y) > 0.002;
    if (!moving) {
      cur.x = tgt.x;
      cur.y = tgt.y;
    }
    draw();
    frame = moving && shown ? requestAnimationFrame(tick) : 0;
  };

  const seen = new IntersectionObserver(([entry]) => {
    shown = entry.isIntersecting;
    if (!shown) return;
    if (cur.x !== tgt.x || cur.y !== tgt.y) {
      if (!frame) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    } else if (stale) draw();
  });
  seen.observe(canvas);

  const onResize = () => {
    fit();
    draw();
  };
  window.addEventListener("resize", onResize);
  fit();
  draw();

  return {
    aim(x, y, instant = false) {
      // Only the direction matters; a vector shorter than 1 px keeps the last direction.
      const len = Math.hypot(x, y);
      if (len < 1) return;
      tgt.x = x / len;
      tgt.y = y / len;
      if (instant) {
        cancelAnimationFrame(frame);
        frame = 0;
        if (cur.x === tgt.x && cur.y === tgt.y) return;
        cur.x = tgt.x;
        cur.y = tgt.y;
        draw();
        return;
      }
      if (!frame && shown) {
        last = 0;
        frame = requestAnimationFrame(tick);
      }
    },
    glow() {
      if (level === 1 || glowing) return;
      const from = level;
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, Math.max(0, (now - start) / GLOW_MS));
        level = from + (1 - from) * (1 - (1 - t) ** 3);
        draw();
        glowing = t < 1 ? requestAnimationFrame(step) : 0;
      };
      glowing = requestAnimationFrame(step);
    },
    destroy() {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(glowing);
      seen.disconnect();
      window.removeEventListener("resize", onResize);
    },
  };
}
