import { useContext, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { useArrive, arrive } from "./arrive";
import { boards } from "./data";
import { Settled, useReducedMotion } from "./hooks";
import { Forward, Pause, Play, Prev } from "./icons";
import "./boards.css";

const COUNT = boards.length;
const pad = (n: number) => String(n + 1).padStart(2, "0");
const wrap = (n: number) => (n + COUNT) % COUNT;
/** A board stays this long before the next one, in ms. The timer is the CSS animation of the progress line. */
const DWELL = 6000;
/**
 * The rack settles this long after a move. Then a board that left is unmounted, so at rest only three boards hold decoded pixels,
 * and the front board gets its large file; while it moves, it shows the 1080 copy.
 */
const UNMOUNT = 720;

const SIZES = {
  home: "(min-width: 1024px) 58vw, calc(100vw - 52px)",
  case: "(min-width: 1320px) 1170px, calc(100vw - 52px)",
};

const srcSetOf = (i: number) => `${boards[i].small} 1080w, ${boards[i].file} 3200w`;

/** Loads and decodes a board with the same choice of file the page makes; without `sizes`, the 1080 copy only. */
function preload(i: number, sizes?: string) {
  const image = new Image();
  if (sizes) {
    image.sizes = sizes;
    image.srcset = srcSetOf(i);
  }
  image.src = boards[i].small;
  image.decode().catch(() => undefined);
}

/**
 * The place of a board in the rack, from the current board: 0 in front, 1 and 2 wait behind it,
 * -1 has just left to the left, 3 is out of sight behind the rack.
 */
function slotOf(i: number, index: number) {
  const rel = wrap(i - index);
  if (rel <= 2) return rel;
  return rel === COUNT - 1 ? -1 : 3;
}

const rackOf = (index: number) => [index, wrap(index + 1), wrap(index + 2)];

/** The seven Design System v2 boards in a rack in the room: the current board in front, the next two behind it in depth. */
export function Boards({ size = "home" }: { size?: "home" | "case" }) {
  const reduce = useReducedMotion();
  const settled = useContext(Settled);
  const view = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<0 | 1 | -1>(0);
  const [mounted, setMounted] = useState(() => rackOf(0));
  const [sharp, setSharp] = useState(0);
  const [stopped, setStopped] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [inView, setInView] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const sizes = SIZES[size];
  const auto = !reduce && !stopped;
  const ticking = auto && inView && !hover && !focus;

  const state = useArrive(view, (mode) => {
    if (screen.current) arrive(screen.current, mode);
  });

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setMounted(rackOf(index));
      setSharp(index);
      preload(wrap(index + 1), sizes);
      preload(wrap(index + 3));
      preload(wrap(index - 1));
    }, UNMOUNT);
    return () => window.clearTimeout(id);
  }, [index, sizes]);

  const go = (next: number, way: 1 | -1) => {
    const to = wrap(next);
    if (to === index) return;
    setDir(way);
    setIndex(to);
    setMounted((list) => [...new Set([...list, ...rackOf(to)])]);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") go(index + 1, 1);
    else if (event.key === "ArrowLeft") go(index - 1, -1);
    else return;
    event.preventDefault();
  };

  const onDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") touch.current = { x: event.clientX, y: event.clientY };
  };
  const onUp = (event: PointerEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(event.clientY - start.y)) go(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  };

  const board = boards[index];
  return (
    <section
      ref={root}
      className="bd"
      data-size={size}
      data-dir={dir}
      aria-roledescription="carousel"
      aria-label="Design System v2 boards"
      tabIndex={0}
      onKeyDown={onKey}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocus(false);
      }}
    >
      <div ref={view} className="room-view room-floor lp-slab bd-view" data-arrive={state}>
        <div ref={screen} className="room-slab bd-screen">
          <div className="bd-stage" onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => (touch.current = null)}>
            {[...mounted]
              .sort((a, b) => a - b)
              .map((i) => {
                const slot = slotOf(i, index);
                const front = slot === 0;
                return (
                  <div key={i} className="bd-card" data-slot={slot} aria-hidden={front ? undefined : true}>
                    <span className="bd-glass">
                      <img
                        className="bd-board"
                        src={boards[i].small}
                        width={1600}
                        height={1000}
                        alt={front && i !== sharp ? boards[i].alt : ""}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                      />
                      {front && i === sharp && (
                        <img
                          className="bd-board"
                          src={boards[i].small}
                          srcSet={srcSetOf(i)}
                          sizes={sizes}
                          width={1600}
                          height={1000}
                          alt={boards[i].alt}
                          loading={i === 0 && !settled ? "lazy" : "eager"}
                          decoding="async"
                          draggable={false}
                        />
                      )}
                    </span>
                    <span className="bd-mirror" style={{ "--m-src": `url("${boards[i].small}")` } as CSSProperties} />
                  </div>
                );
              })}
            <span className="bd-shine" aria-hidden="true">
              <span className="room-sheen" />
            </span>
          </div>
        </div>
      </div>
      <div className="bd-bar">
        <p className="bd-index" aria-live={ticking ? "off" : "polite"} aria-atomic="true">
          <span className="bd-n">
            {pad(index)} <span className="bd-of">/ {pad(COUNT - 1)}</span>
          </span>
          <span className="bd-title" key={index}>
            {board.title}
          </span>
        </p>
        <div className="bd-controls">
          {!reduce && (
            <button
              type="button"
              className="bd-button bd-play"
              onClick={() => setStopped((s) => !s)}
              aria-label={stopped ? "Play the boards" : "Pause the boards"}
            >
              {stopped ? <Play /> : <Pause />}
              <span>{stopped ? "Play" : "Pause"}</span>
            </button>
          )}
          <button type="button" className="bd-button" onClick={() => go(index - 1, -1)} aria-label="Previous board">
            <Prev />
          </button>
          <button type="button" className="bd-button" onClick={() => go(index + 1, 1)} aria-label="Next board">
            <Forward />
          </button>
        </div>
        {auto && (
          <span className="bd-time" aria-hidden="true">
            <i
              key={index}
              style={{
                animationDuration: `${DWELL}ms`,
                animationPlayState: ticking ? "running" : "paused",
              }}
              onAnimationEnd={() => go(index + 1, 1)}
            />
          </span>
        )}
      </div>
    </section>
  );
}
