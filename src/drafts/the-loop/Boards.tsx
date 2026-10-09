import { useContext, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useArrive, arrive } from "./arrive";
import { boards } from "./data";
import { Settled, useReducedMotion } from "./hooks";
import { Forward, Pause, Play, Prev } from "./icons";
import "./boards.css";

const COUNT = boards.length;
const pad = (n: number) => String(n + 1).padStart(2, "0");
/** A board stays this long before the next one, in ms. The timer is the CSS animation of the progress line. */
const DWELL = 6000;
/** A board that left is unmounted after its exit, so only the current board and the one after it hold decoded pixels. */
const UNMOUNT = 700;

const SIZES = {
  home: "(min-width: 1024px) 62vw, calc(100vw - 32px)",
  case: "(min-width: 1320px) 1240px, calc(100vw - 32px)",
};

const srcSetOf = (i: number) => `${boards[i].small} 1080w, ${boards[i].file} 3200w`;

/** Loads and decodes a board with the same choice of file the page makes. */
function preload(i: number, sizes: string) {
  const image = new Image();
  image.sizes = sizes;
  image.srcset = srcSetOf(i);
  image.src = boards[i].small;
  image.decode().catch(() => undefined);
}

/** The seven Design System v2 boards on one large screen in the room. */
export function Boards({ size = "home" }: { size?: "home" | "case" }) {
  const reduce = useReducedMotion();
  const settled = useContext(Settled);
  const view = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<0 | 1 | -1>(0);
  const [mounted, setMounted] = useState([0]);
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
    preload((index + 1) % COUNT, sizes);
    const id = window.setTimeout(() => setMounted([index]), UNMOUNT);
    return () => window.clearTimeout(id);
  }, [index, sizes]);

  const go = (next: number, way: 1 | -1) => {
    const to = (next + COUNT) % COUNT;
    if (to === index) return;
    setDir(way);
    setIndex(to);
    setMounted((list) => [...list.filter((i) => i !== to), to]);
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
            {mounted.map((i) => (
              <img
                key={i}
                className="bd-board"
                data-now={i === index ? "" : undefined}
                src={boards[i].small}
                srcSet={srcSetOf(i)}
                sizes={sizes}
                width={1600}
                height={1000}
                alt={i === index ? boards[i].alt : ""}
                aria-hidden={i === index ? undefined : true}
                loading={i === 0 && !settled ? "lazy" : "eager"}
                decoding="async"
                draggable={false}
              />
            ))}
            <span className="room-sheen" aria-hidden="true" />
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
