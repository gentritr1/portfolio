import { Fragment, useEffect, useId, useRef, useState, useSyncExternalStore, type PointerEvent, type ReactNode } from "react";
import { animate, frame, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { EYE, FACE_B_DEG, FLIP_DEG, LensPrint, type FacePaint } from "./lens";

/* ---------- Data ---------- */

export interface TileSpec {
  src: string;
  /** The file's pixels. */
  nat: readonly [number, number];
  alt: string;
  /** Source rectangle in file pixels. */
  s: readonly [number, number, number, number];
  /** Destination as fractions of the card. Defaults to the whole card. */
  d?: readonly [number, number, number, number];
  /** A smaller copy of the same screen, for 1× screens: `[src, width]`. `s` stays in the full file's pixels. */
  small?: readonly [string, number];
  /** The img's rendered width (it is wider than the card when the crop is narrow). */
  sizes?: string;
}

export interface FaceSpec {
  ground: string;
  tiles: TileSpec[];
}

export interface PrintSpec {
  id: string;
  work: string;
  wide: { aspect: number; faces: [FaceSpec, FaceSpec] };
  narrow: { aspect: number; faces: [FaceSpec, FaceSpec] };
}

/* ---------- The tilt: one motion value per print ---------- */

export interface Tilt {
  theta: MotionValue<number>;
  getFace: () => 0 | 1;
  subscribe: (fn: () => void) => () => void;
  /** Turn to a face. Pointer: the story spring. Keyboard or reduced motion: no travel. */
  show: (face: 0 | 1, how: "spring" | "instant") => void;
  /** End a drag: hand the hand's velocity (deg/s) to the snap spring and land on the nearer face. */
  settle: (now: number, velocity: number) => void;
  reduced: boolean;
}

/** The story moment: a card turned by hand. It looks arrived at 500 ms and settles by about 800 ms. */
const STORY = { type: "spring", visualDuration: 0.5, bounce: 0.12 } as const;
/** spring.snap, for a drag release with the hand's velocity. */
const SNAP = { type: "spring", stiffness: 600, damping: 40 } as const;

export function useTilt(reduced: boolean): Tilt {
  const theta = useMotionValue(0);
  // The face lives outside React state: only the small parts that show it re-render when it flips
  // (labels, the live line), never the whole page, so a drag across the switch point stays smooth.
  const store = useRef<{ face: 0 | 1; listeners: Set<() => void> }>({ face: 0, listeners: new Set() });
  const setFace = (f: 0 | 1) => {
    if (store.current.face === f) return;
    store.current.face = f;
    store.current.listeners.forEach((fn) => fn());
  };
  useMotionValueEvent(theta, "change", (v) => setFace(v > FLIP_DEG ? 1 : 0));
  const api = useRef<Tilt | null>(null);
  const rm = useRef(reduced);
  rm.current = reduced;
  api.current ??= {
    theta,
    getFace: () => store.current.face,
    subscribe: (fn) => {
      store.current.listeners.add(fn);
      return () => store.current.listeners.delete(fn);
    },
    get reduced() {
      return rm.current;
    },
    show(to, how) {
      const target = to === 0 ? 0 : FACE_B_DEG;
      if (rm.current || how === "instant") {
        theta.stop();
        theta.jump(target);
        setFace(to);
      } else animate(theta, target, STORY);
    },
    settle(now, velocity) {
      const target = now + velocity * 0.2 > FACE_B_DEG / 2 ? FACE_B_DEG : 0;
      if (rm.current) {
        theta.jump(target);
        return;
      }
      theta.set(now);
      animate(theta, target, { ...SNAP, velocity });
    },
  };
  return api.current;
}

/** The current face, for the parts that show it. */
export function useFace(tilt: Tilt) {
  return useSyncExternalStore(tilt.subscribe, tilt.getFace, () => 0 as const);
}

/* ---------- The face labels ---------- */

/** A radio group (one Tab stop, arrow keys, the right announcement). Pointer changes turn the card; keyboard changes jump. */
export function FaceSwitch({ tilt, labels, name }: { tilt: Tilt; labels: [string, string]; name: string }) {
  const face = useFace(tilt);
  const id = useId();
  const byPointer = useRef(false);
  return (
    <fieldset className="lx-switch">
      <legend className="lx-sr">{name}: which screen the print shows</legend>
      {labels.map((label, i) => (
        <Fragment key={label}>
          {i === 1 && (
            <span className="lx-switch-sep" aria-hidden="true">
              ⇄
            </span>
          )}
          <label className="lx-face" data-on={face === i || undefined}>
            <input
              type="radio"
              name={id}
              checked={face === i}
              onPointerDown={() => (byPointer.current = true)}
              onChange={() => {
                tilt.show(i as 0 | 1, byPointer.current ? "spring" : "instant");
                byPointer.current = false;
              }}
            />
            <span>{label}</span>
          </label>
        </Fragment>
      ))}
    </fieldset>
  );
}

/* ---------- A horizontal drag that never fights the page's scroll ---------- */

type Gesture = { id: number; x0: number; y0: number; mode: "wait" | "drag" | "scroll"; x: number; from: number; trail: [number, number][] };

/**
 * Drag the page lens sideways, on a page that scrolls vertically (snippets/mechanism.md):
 * - nothing happens until the pointer has moved `slop` px; then the gesture is a lens drag only if it is
 *   mostly horizontal (|dx| > 1.5·|dy|), and a page scroll (ignored to its end) if it moved vertically first.
 *   The pointer is captured only once it is a drag; `touch-action: pan-y` leaves vertical pans to the browser;
 * - release: the nearest face from the current angle plus the projected velocity (angle + v·0.2);
 * - pointercancel (the browser took the gesture): back to the face the drag started from;
 * - a press that never moved is a tap: `onTap`, if the control has one.
 */
function useLensGesture(tilt: Tilt, degPerPx: number, slop: number, bound: (v: number) => number, onTap?: () => void) {
  const g = useRef<Gesture | null>(null);
  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (e.button !== 0) return;
      g.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, mode: "wait", x: e.clientX, from: 0, trail: [] };
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const d = g.current;
      if (!d || d.id !== e.pointerId || d.mode === "scroll") return;
      if (d.mode === "wait") {
        const dx = Math.abs(e.clientX - d.x0);
        const dy = Math.abs(e.clientY - d.y0);
        if (dx >= slop && dx > 1.5 * dy) {
          // A lens drag from here: the card follows the hand from this point, from its current angle.
          d.mode = "drag";
          tilt.theta.stop();
          d.from = tilt.theta.get();
          d.x = e.clientX;
          e.currentTarget.setPointerCapture(e.pointerId);
        } else if (dy >= slop) d.mode = "scroll";
        return;
      }
      d.trail.push([e.timeStamp, e.clientX]);
      if (d.trail.length > 8) d.trail.shift();
      tilt.theta.set(bound(d.from + (e.clientX - d.x) * degPerPx));
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const d = g.current;
      if (!d || d.id !== e.pointerId) return;
      g.current = null;
      if (d.mode === "wait") onTap?.();
      if (d.mode !== "drag") return;
      // The hand's velocity over its last ~100 ms, up to the release itself (a hand that stopped and let go
      // hands over nothing), given to the spring.
      d.trail.push([e.timeStamp, e.clientX]);
      const end = d.trail[d.trail.length - 1];
      const start = end && (d.trail.find(([t]) => end[0] - t <= 100) ?? d.trail[0]);
      const velocity = end && start ? ((end[1] - start[1]) / Math.max(16, end[0] - start[0])) * 1000 * degPerPx : 0;
      tilt.settle(tilt.theta.get(), velocity);
    },
    onPointerCancel(e: PointerEvent<HTMLElement>) {
      const d = g.current;
      if (!d || d.id !== e.pointerId) return;
      g.current = null;
      if (d.mode === "drag") tilt.settle(d.from, 0);
    },
  };
}

/* ---------- The page lens: one control for every print ---------- */

const TRAVEL = 22;

/**
 * Web ⇄ Phone. A radio pair for keys and screen readers (instant), and a track whose thumb follows the
 * page angle: drag it (pointer or touch), flick it, or tap it to flip. The same value turns every print.
 */
export function LensSwitch({ tilt }: { tilt: Tilt }) {
  const face = useFace(tilt);
  const id = useId();
  const byPointer = useRef(false);
  const x = useTransform(tilt.theta, (v) => (Math.max(-0.2, Math.min(1.2, v / FACE_B_DEG)) * TRAVEL));
  // The thumb travels 22px for the whole turn, so the switch claims a drag after 3px.
  const gesture = useLensGesture(
    tilt,
    FACE_B_DEG / TRAVEL,
    3,
    (v) => (v > FACE_B_DEG ? FACE_B_DEG + (v - FACE_B_DEG) * 0.2 : v < 0 ? v * 0.2 : v),
    () => tilt.show(tilt.getFace() === 0 ? 1 : 0, "spring"),
  );
  return (
    <fieldset className="lx-lensctl">
      <legend className="lx-sr">Page lens: every picture on the web face or the phone face</legend>
      {(["Web", "Phone"] as const).map((label, i) => (
        <Fragment key={label}>
          {i === 1 && (
            <span className="lx-track" aria-hidden="true" {...gesture}>
              <motion.span className="lx-thumb" style={{ x }} />
            </span>
          )}
          <label className="lx-lensopt" data-on={face === i || undefined}>
            <input
              type="radio"
              name={id}
              checked={face === i}
              onPointerDown={() => (byPointer.current = true)}
              onChange={() => {
                tilt.show(i as 0 | 1, byPointer.current ? "spring" : "instant");
                byPointer.current = false;
              }}
            />
            <span>{label}</span>
          </label>
        </Fragment>
      ))}
    </fieldset>
  );
}

/* ---------- Work that can wait for an idle moment ---------- */

/**
 * Run `fn` when the page is next idle (within 300 ms). A face flip restyles what is on screen at once and
 * leaves parts out of view (the index tags, the plain pictures under a lens) to the next idle moment, so the
 * frame of the flip stays short while a hand is turning the page. Repeated requests for one fn run it once.
 */
const waiting = new Set<() => void>();
let idleId = 0;
export function whenIdle(fn: () => void) {
  waiting.add(fn);
  if (idleId) return;
  const run = () => {
    idleId = 0;
    const list = [...waiting];
    waiting.clear();
    for (const f of list) f();
  };
  idleId =
    "requestIdleCallback" in window ? window.requestIdleCallback(run, { timeout: 300 }) : setTimeout(run, 50);
}

/* ---------- Painting, one print at a time, when the page is idle ---------- */

const jobs: (() => Promise<void>)[] = [];
let pumping = false;
const idle = () =>
  new Promise<void>((done) =>
    "requestIdleCallback" in window ? window.requestIdleCallback(() => done(), { timeout: 400 }) : setTimeout(done, 32),
  );
async function pump() {
  pumping = true;
  while (jobs.length) {
    await idle();
    await jobs.shift()!();
  }
  pumping = false;
}
function enqueue(job: () => Promise<void>) {
  jobs.push(job);
  if (!pumping) void pump();
}

/* ---------- The print ---------- */

const DEG_PER_PX = FACE_B_DEG / 120;
const LIMIT = 16;
/** A print claims a drag after 6px of mostly sideways movement; anything else is the page's. */
const SLOP = 6;

function useNarrow() {
  const query = "(max-width: 719px)";
  const [narrow, setNarrow] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return narrow;
}

function tileStyle(t: TileSpec) {
  const [sx, sy, sw, sh] = t.s;
  const [dx, dy, dw, dh] = t.d ?? [0, 0, 1, 1];
  return {
    box: { left: `${dx * 100}%`, top: `${dy * 100}%`, width: `${dw * 100}%`, height: `${dh * 100}%` },
    // Percent margins refer to the box's width, so one ratio places the crop exactly.
    img: { width: `${(t.nat[0] / sw) * 100}%`, marginLeft: `${(-sx / sw) * 100}%`, marginTop: `${(-sy / sw) * 100}%` },
    aspect: sw / sh,
  };
}

export function Print({
  spec,
  tilt,
  priority = false,
  story = false,
  name,
  caption,
}: {
  spec: PrintSpec;
  tilt: Tilt;
  priority?: boolean;
  story?: boolean;
  /** The print's accessible name, for example "Bayyinah TV, website and App Store faces". */
  name: string;
  caption?: ReactNode;
}) {
  const narrow = useNarrow();
  const layout = narrow ? spec.narrow : spec.wide;
  const card = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lens = useRef<LensPrint | null>(null);
  const imgs = useRef<(HTMLImageElement | null)[][]>([[], []]);
  const [ready, setReady] = useState(false);
  // Once the lens has faded in over the plain pictures, the card stops clipping: the canvases round their own
  // corners and the pictures under them are clipped away (still read by screen readers). A clipped, turning
  // card must be composited through an offscreen pass every frame; an unclipped one is two plain quads.
  const [flat, setFlat] = useState(false);
  useEffect(() => {
    if (!ready || flat) return;
    const id = window.setTimeout(() => setFlat(true), 240);
    return () => window.clearTimeout(id);
  }, [ready, flat]);

  const inView = useRef(false);
  const dirty = useRef(true);
  // The card's own turn follows the page angle only while it is in view; off screen nothing is restyled.
  const turn = useMotionValue(tilt.theta.get());

  // Paint the faces when the print comes near the viewport, and again when its size changes.
  useEffect(() => {
    const el = card.current;
    const cv = canvas.current;
    if (!el || !cv) return;
    let alive = true;
    let near = false;
    let size = { w: 0, h: 0 };
    let pending = 0;
    const build = () =>
      enqueue(async () => {
        if (!alive || !near || !size.w) return;
        const ticket = ++pending;
        const all = imgs.current.flat().filter(Boolean) as HTMLImageElement[];
        try {
          // Wait for the plain pictures first: the lens reads the same files from the cache.
          await Promise.all(all.map((img) => (img.loading === "lazy" && (img.loading = "eager"), img.decode())));
        } catch {
          return; // a picture failed: the plain picture stays
        }
        if (!alive || ticket !== pending) return;
        const paints = layout.faces.map(
          (face): FacePaint => ({
            ground: face.ground,
            tiles: face.tiles.map((t, i) => {
              // The lens reads the file the picture already loaded (the small copy on a 1× screen).
              const img = imgs.current[layout.faces.indexOf(face)][i];
              const src = img?.currentSrc || t.src;
              const k = img?.naturalWidth ? img.naturalWidth / t.nat[0] : 1;
              return { src, s: [t.s[0] * k, t.s[1] * k, t.s[2] * k, t.s[3] * k] as const, d: t.d ?? [0, 0, 1, 1] };
            }),
          }),
        ) as [FacePaint, FacePaint];
        const print = (lens.current ??= new LensPrint(cv));
        try {
          await print.setup(paints, size.w, size.h);
        } catch {
          return;
        }
        if (!alive || ticket !== pending) return;
        print.render(tilt.theta.get());
        dirty.current = false;
        setReady(true);
      });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !near) {
          near = true;
          build();
        }
      },
      { rootMargin: "60% 0px" },
    );
    const ro = new ResizeObserver(() => {
      // offsetWidth/Height ignore the tilt transform.
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      if (Math.abs(w - size.w) < 1 && Math.abs(h - size.h) < 1) return;
      size = { w, h };
      build();
    });
    // Only prints in view redraw while the page lens turns; the rest catch up when they enter.
    const catchUp = () => {
      turn.set(tilt.theta.get());
      if (dirty.current && lens.current?.ready) {
        lens.current.render(tilt.theta.get());
        dirty.current = false;
      }
    };
    const seen = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      if (entry.isIntersecting) catchUp();
    });
    // A print about to scroll in catches up a little before it shows, so its first frame is already current.
    const approach = new IntersectionObserver(([entry]) => entry.isIntersecting && catchUp(), { rootMargin: "25% 0px" });
    io.observe(el);
    seen.observe(el);
    approach.observe(el);
    ro.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      seen.disconnect();
      approach.disconnect();
      ro.disconnect();
      lens.current?.release();
    };
    // The layout object changes only when the breakpoint changes.
  }, [layout, tilt.theta, turn]);

  // Without the lens canvas, the shown face lies on top (CSS reads data-face); set outside React, when idle:
  // once the lens is up, the plain pictures are out of sight.
  useEffect(() => {
    const sync = () => card.current && (card.current.dataset.face = String(tilt.getFace()));
    sync();
    return tilt.subscribe(() => whenIdle(sync));
  }, [tilt]);

  // One draw per frame, in motion's render step, at the angle the frame ends on: a burst of pointer events
  // or a spring step never draws twice, and the canvas and the card's turn land in the same frame.
  const draw = useRef(() => {
    if (!inView.current || !lens.current?.ready) return;
    lens.current.render(tilt.theta.get());
    dirty.current = false;
  });
  useMotionValueEvent(tilt.theta, "change", (v) => {
    if (inView.current) {
      turn.set(v);
      frame.render(draw.current);
    } else dirty.current = true;
  });

  // Past the ends the card resists, like a print held at one edge (rubber band, never a hard stop).
  // A tap on a print does nothing: the switch and the labels are the controls; a print turns only by hand.
  const gesture = useLensGesture(tilt, DEG_PER_PX, SLOP, (v) => {
    const lo = -LIMIT / 2;
    if (v > LIMIT) return LIMIT + (v - LIMIT) * 0.25;
    if (v < lo) return lo + (v - lo) * 0.25;
    return v;
  });

  return (
    <figure className="lx-print" data-work={spec.work} data-ready={ready || undefined} data-flat={flat || undefined}>
      <div className="lx-stage" style={{ aspectRatio: String(layout.aspect) }}>
        {/* The shadow stays still: at 9° it would move 1%, and repainting a blurred shadow every frame is not worth it. */}
        <div className="lx-shadow" aria-hidden="true" />
        <motion.div
          ref={card}
          className="lx-card"
          role="group"
          aria-label={name}
          data-face="0"
          data-motion={story ? "story" : undefined}
          style={{ rotateY: turn, transformPerspective: EYE }}
          {...gesture}
        >
          {layout.faces.map((face, f) => (
            <div key={f} className="lx-layer" data-layer={f}>
              {face.tiles.map((t, i) => {
                const st = tileStyle(t);
                return (
                  <div key={t.src + i} className="lx-tile" style={st.box}>
                    <img
                      ref={(node) => {
                        imgs.current[f][i] = node;
                      }}
                      src={t.src}
                      srcSet={t.small ? `${t.small[0]} ${t.small[1]}w, ${t.src} ${t.nat[0]}w` : undefined}
                      sizes={t.small ? t.sizes : undefined}
                      alt={t.alt}
                      width={t.nat[0]}
                      height={t.nat[1]}
                      style={st.img}
                      loading={priority ? "eager" : "lazy"}
                      fetchPriority={priority ? (f === 0 ? "high" : "low") : undefined}
                      decoding="async"
                      draggable={false}
                    />
                  </div>
                );
              })}
            </div>
          ))}
          <canvas ref={canvas} className="lx-lens" aria-hidden="true" />
        </motion.div>
      </div>
      {caption && <figcaption className="lx-cap">{caption}</figcaption>}
    </figure>
  );
}
