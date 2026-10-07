import { Fragment, useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
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
  face: 0 | 1;
  /** Turn to a face. Pointer: the story spring. Keyboard or reduced motion: no travel. */
  show: (face: 0 | 1, how: "spring" | "instant") => void;
  /** Turn to the second face and back, once: the print shown to the visitor like a postcard. */
  peek: () => void;
  reduced: boolean;
}

/** The story moment: a card turned by hand. It looks arrived at 500 ms and settles by about 800 ms. */
const STORY = { type: "spring", visualDuration: 0.5, bounce: 0.12 } as const;
/** spring.snap, for a drag release with the hand's velocity. */
const SNAP = { type: "spring", stiffness: 600, damping: 40 } as const;

export function useTilt(reduced: boolean): Tilt {
  const theta = useMotionValue(0);
  const [face, setFace] = useState<0 | 1>(0);
  useMotionValueEvent(theta, "change", (v) => setFace(v > FLIP_DEG ? 1 : 0));
  const show = (to: 0 | 1, how: "spring" | "instant") => {
    const target = to === 0 ? 0 : FACE_B_DEG;
    if (reduced || how === "instant") {
      theta.stop();
      theta.jump(target);
      setFace(to);
    } else animate(theta, target, STORY);
  };
  // 760 ms: out on an ease-out, back on the in-out curve; it ends where it started, on the website.
  const peek = () => {
    if (reduced) return;
    animate(theta, [0, FACE_B_DEG, 0], { duration: 0.76, times: [0, 0.45, 1], ease: [[0.23, 1, 0.32, 1], [0.77, 0, 0.175, 1]] });
  };
  return { theta, face, show, peek, reduced };
}

/* ---------- The face labels ---------- */

/** A radio group (one Tab stop, arrow keys, the right announcement). Pointer changes turn the card; keyboard changes jump. */
export function FaceSwitch({ tilt, labels, name }: { tilt: Tilt; labels: [string, string]; name: string }) {
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
          <label className="lx-face" data-on={tilt.face === i || undefined}>
            <input
              type="radio"
              name={id}
              checked={tilt.face === i}
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
/** A drag starts after this much movement, so a tap is still a tap. */
const SLOP = 5;

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
  intro = false,
  name,
  caption,
}: {
  spec: PrintSpec;
  tilt: Tilt;
  priority?: boolean;
  story?: boolean;
  /** Show the second face once after load, then return: the material read without input. */
  intro?: boolean;
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
  const born = useRef(performance.now());

  const touched = useRef(false);

  // The one authored moment at load: the hero print is turned to its App Store face and back, once,
  // as a hand shows a postcard. It starts and ends on the website. Skipped if the lens is late,
  // if the visitor already touched it, or with reduced motion.
  const { reduced, theta } = tilt;
  const peek = useRef(tilt.peek);
  peek.current = tilt.peek;
  useEffect(() => {
    if (!intro || !ready || reduced) return;
    if (performance.now() - born.current > 2200) return;
    const id = window.setTimeout(() => {
      if (!touched.current && !theta.isAnimating() && theta.get() === 0) peek.current();
    }, 350);
    return () => window.clearTimeout(id);
  }, [intro, ready, reduced, theta]);
  const drag = useRef<{ id: number; x: number; from: number; moved: boolean; trail: [number, number][] } | null>(null);

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
            tiles: face.tiles.map((t) => ({ src: t.src, s: t.s, d: t.d ?? [0, 0, 1, 1] })),
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
    io.observe(el);
    ro.observe(el);
    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      lens.current?.release();
    };
    // The layout object changes only when the breakpoint changes.
  }, [layout, tilt.theta]);

  useMotionValueEvent(tilt.theta, "change", (v) => lens.current?.render(v));
  // The shadow lies on the page: it narrows as the card turns and slides from under the far edge.
  const shadowScale = useTransform(tilt.theta, (v) => Math.cos((v * Math.PI) / 180));
  const shadowX = useTransform(tilt.theta, (v) => v * 0.6);

  // Past the ends the card resists, like a print held at one edge (rubber band, never a hard stop).
  const resist = (v: number) => {
    const lo = -LIMIT / 2;
    if (v > LIMIT) return LIMIT + (v - LIMIT) * 0.25;
    if (v < lo) return lo + (v - lo) * 0.25;
    return v;
  };
  const angleAt = (d: NonNullable<typeof drag.current>, x: number) => resist(d.from + (x - d.x) * DEG_PER_PX);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    touched.current = true;
    tilt.theta.stop();
    drag.current = { id: e.pointerId, x: e.clientX, from: tilt.theta.get(), moved: false, trail: [[e.timeStamp, e.clientX]] };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.trail.push([e.timeStamp, e.clientX]);
    if (d.trail.length > 8) d.trail.shift();
    if (!d.moved) {
      if (Math.abs(e.clientX - d.x) < SLOP) return;
      // Capture only after 5px, so a tap stays a tap and the page still scrolls on a vertical swipe.
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    tilt.theta.set(angleAt(d, e.clientX));
  };
  const release = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    d.trail.push([e.timeStamp, e.clientX]);
    const moved = d.moved || Math.abs(e.clientX - d.x) >= SLOP;
    if (!moved) {
      if (!cancelled) tilt.show(tilt.face === 0 ? 1 : 0, "spring");
      return;
    }
    // The hand's velocity over its last ~100 ms, handed to the spring: a flick turns the card.
    const end = d.trail[d.trail.length - 1];
    const start = d.trail.find(([t]) => end[0] - t <= 100) ?? d.trail[0];
    const dt = Math.max(16, end[0] - start[0]);
    const velocity = ((end[1] - start[1]) / dt) * 1000 * DEG_PER_PX;
    const now = angleAt(d, e.clientX);
    const aim = now + velocity * 0.2;
    const target = aim > FACE_B_DEG / 2 ? FACE_B_DEG : 0;
    if (tilt.reduced) {
      tilt.theta.jump(target);
      return;
    }
    tilt.theta.set(now);
    animate(tilt.theta, target, { ...SNAP, velocity });
  };

  return (
    <figure className="lx-print" data-work={spec.work} data-ready={ready || undefined} role="group" aria-label={name}>
      <div className="lx-stage" style={{ aspectRatio: String(layout.aspect) }}>
        <motion.div className="lx-shadow" aria-hidden="true" style={{ scaleX: shadowScale, x: shadowX }} />
        <motion.div
          ref={card}
          className="lx-card"
          data-face={tilt.face}
          data-motion={story ? "story" : undefined}
          style={{ rotateY: tilt.theta, transformPerspective: EYE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={(e) => release(e, false)}
          onPointerCancel={(e) => release(e, true)}
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
                      alt={t.alt}
                      width={t.nat[0]}
                      height={t.nat[1]}
                      style={st.img}
                      loading={priority ? "eager" : "lazy"}
                      fetchPriority={priority && f === 0 ? "high" : undefined}
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
