import { Fragment, useEffect, useRef, useState, type MouseEvent, type PointerEvent, type ReactNode } from "react";
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
  reduced: boolean;
}

/** The story moment: a card turned by hand. It looks arrived at 500 ms and settles by about 800 ms. */
const STORY = { type: "spring", visualDuration: 0.5, bounce: 0.12 } as const;
/** spring.snap, for a drag release with the hand's velocity. */
const SNAP = { type: "spring", stiffness: 600, damping: 40 } as const;

export function useTilt(reduced: boolean): Tilt {
  const theta = useMotionValue(0);
  const [face, setFace] = useState<0 | 1>(0);
  useMotionValueEvent(theta, "change", (v) => setFace(Math.abs(v) > FLIP_DEG ? 1 : 0));
  const show = (to: 0 | 1, how: "spring" | "instant") => {
    const now = theta.get();
    const target = to === 0 ? 0 : now < -0.5 ? -FACE_B_DEG : FACE_B_DEG;
    if (reduced || how === "instant") {
      theta.stop();
      theta.jump(target);
      setFace(to);
    } else animate(theta, target, STORY);
  };
  return { theta, face, show, reduced };
}

/* ---------- The face labels ---------- */

export function FaceSwitch({ tilt, labels, name }: { tilt: Tilt; labels: [string, string]; name: string }) {
  const press = (to: 0 | 1) => (e: MouseEvent<HTMLButtonElement>) =>
    // A click from the keyboard has detail 0: keyboard actions do not animate.
    tilt.show(to, e.detail === 0 ? "instant" : "spring");
  return (
    <div className="lx-switch" role="group" aria-label={`${name}: which screen the print shows`}>
      {labels.map((label, i) => (
        <Fragment key={label}>
          {i === 1 && (
            <span className="lx-switch-sep" aria-hidden="true">
              ⇄
            </span>
          )}
          <button type="button" className="lx-face" aria-pressed={tilt.face === i} onClick={press(i as 0 | 1)}>
            {label}
          </button>
        </Fragment>
      ))}
    </div>
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

const DEG_PER_PX = FACE_B_DEG / 150;
const LIMIT = 22;

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
  caption,
}: {
  spec: PrintSpec;
  tilt: Tilt;
  priority?: boolean;
  story?: boolean;
  caption?: ReactNode;
}) {
  const narrow = useNarrow();
  const layout = narrow ? spec.narrow : spec.wide;
  const card = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const lens = useRef<LensPrint | null>(null);
  const imgs = useRef<(HTMLImageElement | null)[][]>([[], []]);
  const [ready, setReady] = useState(false);
  const drag = useRef<{ id: number; x: number; from: number; moved: boolean } | null>(null);

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

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    tilt.theta.stop();
    drag.current = { id: e.pointerId, x: e.clientX, from: tilt.theta.get(), moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 6) return;
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    let v = d.from + dx * DEG_PER_PX;
    // Past the limit the card resists, like a print held at one edge.
    if (Math.abs(v) > LIMIT) v = Math.sign(v) * (LIMIT + (Math.abs(v) - LIMIT) * 0.25);
    tilt.theta.set(v);
  };
  const release = (e: PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const now = tilt.theta.get();
    if (!d.moved && !cancelled) {
      tilt.show(tilt.face === 0 ? 1 : 0, "spring");
      return;
    }
    const velocity = tilt.theta.getVelocity();
    const aim = now + velocity * 0.2;
    const rests = [-FACE_B_DEG, 0, FACE_B_DEG];
    const target = rests.reduce((best, r) => (Math.abs(r - aim) < Math.abs(best - aim) ? r : best), 0);
    if (tilt.reduced) tilt.theta.jump(target);
    else animate(tilt.theta, target, { ...SNAP, velocity });
  };

  return (
    <figure className="lx-print" data-work={spec.work} data-ready={ready || undefined}>
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
            <div key={f} className="lx-layer" data-layer={f} style={{ background: face.ground }}>
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
                      loading={priority && f === 0 ? "eager" : "lazy"}
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
