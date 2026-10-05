import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Link } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { rows, type Box, type Plate, type Row, type Shot } from "./data";
import "./projector.css";

const SETTLE_MS = 160;
const FADE_MS = 200;
const DRAW_MS = 180;
const RING_MS = 120;
const LEAVE_MS = 120;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
/** On a wide screen the plate is drawn 880 px wide and scaled to the frame's width. */
const STAGE_W = 880;

type Mode = "animate" | "instant";

function useMedia(query: string, fallback: boolean) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => fallback,
  );
}

/* ---------- Plates ---------- */

const liveKeys = { "design-system": recreations["design-system"], care: recreations.care, reader: recreations.reader };

function LivePlate({ which }: { which: keyof typeof liveKeys }) {
  const entry = liveKeys[which];
  const Live = entry.Component;
  const ref = useRef<HTMLDivElement>(null);

  // The specimen runs a demo loop until it is paused. The frame shows it still.
  useEffect(() => {
    if (which !== "design-system") return;
    const element = ref.current;
    if (!element) return;
    const pause = () => {
      const button = element.querySelector<HTMLButtonElement>('.dsr-demo[aria-pressed="true"]');
      if (!button) return false;
      button.click();
      return true;
    };
    if (pause()) return;
    const observer = new MutationObserver(() => {
      if (pause()) observer.disconnect();
    });
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [which]);

  // The reader is drawn square. Its own ground fills the rest of the frame.
  useEffect(() => {
    if (which !== "reader") return;
    const element = ref.current;
    if (!element) return;
    const copy = () => {
      const root = element.querySelector<HTMLElement>(".pj-square > div");
      if (!root) return false;
      element.style.background = getComputedStyle(root).backgroundColor;
      return true;
    };
    if (copy()) return;
    const observer = new MutationObserver(() => {
      if (copy()) observer.disconnect();
    });
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [which]);

  // The phone crop of the care plate starts under its patient header, whose height follows the width.
  useEffect(() => {
    if (which !== "care") return;
    const element = ref.current;
    if (!element) return;
    const measure = () => {
      const row = element.querySelector<HTMLElement>(".border-t");
      if (!row) return;
      const top = row.offsetTop + 1;
      element.style.setProperty("--pj-care-head", `${top}px`);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    const mutation = new MutationObserver(measure);
    mutation.observe(element, { childList: true, subtree: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [which]);

  const live = (
    <Suspense fallback={<div className="pj-wait" />}>
      <Live />
    </Suspense>
  );
  return (
    <div ref={ref} className={`pj-live pj-live-${which}`} data-world={entry.world}>
      {which === "reader" ? <div className="pj-square">{live}</div> : live}
    </div>
  );
}

function ShotView({ shot, crop, eager }: { shot: Shot; crop: Box; eager: boolean }) {
  return (
    <div
      className="pj-shot"
      style={{ aspectRatio: `${Math.round(crop.w * shot.width)} / ${Math.round(crop.h * shot.height)}` }}
    >
      <img
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{
          width: `${100 / crop.w}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
    </div>
  );
}

function PlateView({ plate, load, narrow }: { plate: Plate; load: boolean; narrow: boolean }) {
  if (plate.kind === "live") return load ? <LivePlate which={plate.key} /> : <div className="pj-wait" />;
  if (plate.kind === "number") {
    return (
      <figure className="pj-number">
        <p className="pj-number-figure" aria-hidden="true">
          {plate.from && (
            <>
              <span>{plate.from}</span>
              <ArrowRightIcon className="pj-number-arrow" weight="bold" />
            </>
          )}
          <span data-to="">{plate.to}</span>
        </p>
        <figcaption>
          <span className="pj-number-unit">{plate.unit}</span>
          <span className="pj-number-note">{plate.note}</span>
        </figcaption>
      </figure>
    );
  }
  return (
    <div className={`pj-${plate.kind}`} style={{ background: plate.ground }}>
      {load && <ShotView shot={plate.shot} crop={narrow ? plate.shot.narrow : plate.shot.crop} eager={false} />}
    </div>
  );
}

/* ---------- Hairline ---------- */

type Point = [number, number];

function rounded(points: Point[], radius = 8) {
  let d = `M${points[0][0]},${points[0][1]}`;
  for (let i = 1; i < points.length - 1; i++) {
    const [px, py] = points[i - 1];
    const [cx, cy] = points[i];
    const [nx, ny] = points[i + 1];
    const inLength = Math.hypot(cx - px, cy - py);
    const outLength = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(radius, inLength / 2, outLength / 2);
    if (r < 1) {
      d += ` L${cx},${cy}`;
      continue;
    }
    const ax = cx - ((cx - px) / inLength) * r;
    const ay = cy - ((cy - py) / inLength) * r;
    const bx = cx + ((nx - cx) / outLength) * r;
    const by = cy + ((ny - cy) / outLength) * r;
    d += ` L${ax},${ay} Q${cx},${cy} ${bx},${by}`;
  }
  const last = points[points.length - 1];
  return `${d} L${last[0]},${last[1]}`;
}

const lengthOf = (points: Point[]) =>
  points.reduce((sum, point, i) => (i === 0 ? 0 : sum + Math.hypot(point[0] - points[i - 1][0], point[1] - points[i - 1][1])), 0);

interface Wire {
  outside: string;
  inside: string;
  split: number;
  start: Point;
  ring: Box & { r: number };
  tone: "light" | "dark" | "field";
}

function targetBox(row: Row, plate: HTMLElement): Box | null {
  const { target } = row;
  if (target.kind === "shot") {
    const image = plate.querySelector<HTMLImageElement>(".pj-shot img");
    if (!image) return null;
    const box = image.getBoundingClientRect();
    if (box.width === 0) return null;
    return {
      x: box.left + target.box.x * box.width,
      y: box.top + target.box.y * box.height,
      w: target.box.w * box.width,
      h: target.box.h * box.height,
    };
  }
  const element = plate.querySelector<HTMLElement>(target.css);
  if (!element) return null;
  const box = element.getBoundingClientRect();
  if (box.width === 0) return null;
  return { x: box.left, y: box.top, w: box.width, h: box.height };
}

function measureWire(row: Row, rowElement: HTMLElement, plate: HTMLElement, narrow: boolean): Wire | null {
  const mark = rowElement.querySelector<HTMLElement>(".pj-result-ink mark");
  const target = targetBox(row, plate);
  if (!mark || !target) return null;
  const fragments = mark.getClientRects();
  if (fragments.length === 0) return null;
  const p = plate.getBoundingClientRect();
  const edge = Math.round(p.left);
  let start: Point;
  let gutter: number;
  if (narrow) {
    const first = fragments[0];
    start = [Math.round(first.left - 6), Math.round(first.top + first.height / 2)];
    gutter = Math.round(edge - 8);
  } else {
    const last = fragments[fragments.length - 1];
    start = [Math.round(last.right + 10), Math.round(last.top + last.height / 2)];
    gutter = Math.round(edge - 20);
  }
  const outside: Point[] = narrow ? [start, [gutter, start[1]]] : [start, [gutter, start[1]]];
  const inside: Point[] = [];
  const cx = Math.round(target.x + target.w / 2);
  const { route } = row;
  if (route.kind === "side") {
    const ty = Math.round(target.y + target.h / 2);
    outside.push([gutter, ty], [edge, ty]);
    inside.push([edge, ty], [Math.round(target.x - 6), ty]);
  } else {
    let lane: number | null = null;
    if (route.kind === "lane") lane = Math.round(p.top + route.y * p.height);
    else {
      const rule = plate.querySelector<HTMLElement>(route.css);
      lane = rule ? Math.round(rule.getBoundingClientRect().top) : null;
    }
    if (lane === null) return null;
    const end = target.y > lane ? Math.round(target.y - 6) : Math.round(target.y + target.h + 6);
    outside.push([gutter, lane], [edge, lane]);
    inside.push([edge, lane], [cx, lane], [cx, end]);
  }
  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 8 };
  if (row.target.kind === "selector" && row.target.css.includes("radiogroup")) ring.r = ring.h / 2;
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  return {
    outside: rounded(outside),
    inside: rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start,
    ring,
    tone: row.plate.kind === "number" ? "field" : row.plate.kind === "web" && row.plate.dark ? "dark" : "light",
  };
}

/* ---------- Page ---------- */

export default function Draft() {
  const narrow = useMedia("(max-width: 1023px)", false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [shown, setShown] = useState<{ index: number; mode: Mode }>({ index: 0, mode: "instant" });
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const nextMode = useRef<Mode | null>(null);

  /* Which row is at the pin line. */
  const pinLine = useCallback(() => {
    if (!narrow) return window.innerHeight * 0.42;
    const frame = frameRef.current?.getBoundingClientRect();
    return (frame?.bottom ?? 300) + 24;
  }, [narrow]);

  const locate = useCallback(() => {
    const pin = pinLine();
    let index = 0;
    rowRefs.current.forEach((row, i) => {
      if (row && row.getBoundingClientRect().top <= pin) index = i;
    });
    activeRef.current = index;
    setActive((was) => (was === index ? was : index));
  }, [pinLine]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          locate();
        });
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [locate]);

  /* A row is shown only after it settles at the pin line, so a passed row never fires. */
  useEffect(() => {
    if (shown.index === active) return;
    if (nextMode.current) {
      const mode = reduced ? "instant" : nextMode.current;
      nextMode.current = null;
      setShown({ index: active, mode });
      return;
    }
    const timer = window.setTimeout(
      () => setShown({ index: active, mode: reduced ? "instant" : "animate" }),
      SETTLE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, shown.index, reduced]);

  /* The plate that leaves stays under the new one until the new one is opaque. */
  const [track, setTrack] = useState<{ index: number; prev: number | null }>({ index: 0, prev: null });
  if (track.index !== shown.index) {
    setTrack({ index: shown.index, prev: shown.mode === "instant" ? null : track.index });
  }
  const prev = track.prev;
  useEffect(() => {
    if (prev === null) return;
    const timer = window.setTimeout(() => setTrack((was) => ({ ...was, prev: null })), FADE_MS + 40);
    return () => window.clearTimeout(timer);
  }, [prev, track.index]);

  /* A screenshot loads when its row is near. A live plate mounts when its row is first shown, so it draws in view. */
  const near = [active - 1, active, active + 1, shown.index].filter(
    (i) => i >= 0 && i < rows.length && (rows[i].plate.kind !== "live" || i === shown.index),
  );
  if (!near.every((i) => loaded.has(i))) {
    const next = new Set(loaded);
    near.forEach((i) => next.add(i));
    setLoaded(next);
  }

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 600));
    idle(() => {
      void recreations.care.load();
      void recreations.reader.load();
    });
  }, []);

  /* The frame draws the plate at one size and scales it to its width. */
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const fit = () => screen.style.setProperty("--k", String(screen.clientWidth / STAGE_W));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(screen);
    return () => observer.disconnect();
  }, []);

  /* ---------- The hairline, written to the DOM, not to state ---------- */
  const wireRef = useRef<SVGGElement>(null);
  const outRefs = useRef<SVGPathElement[]>([]);
  const inRefs = useRef<SVGPathElement[]>([]);
  const ringRef = useRef<SVGRectElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const wireIndex = useRef(0);
  const pendingDraw = useRef<Mode | null>(null);
  const armed = useRef(false);

  const draw = useCallback((split: number) => {
    const out = outRefs.current;
    const inner = inRefs.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;
    const outMs = Math.round(DRAW_MS * split);
    const inMs = DRAW_MS - outMs;
    out.forEach((path) =>
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: outMs, easing: "linear", fill: "backwards" }),
    );
    inner.forEach((path) =>
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: inMs,
        delay: outMs,
        easing: EASE_OUT,
        fill: "backwards",
      }),
    );
    dot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 80, easing: EASE_OUT, fill: "backwards" });
    ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RING_MS, delay: DRAW_MS, easing: EASE_OUT, fill: "backwards" });
  }, []);

  const updateWire = useCallback(() => {
    const group = wireRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!group || !ring || !dot) return;
    const index = wireIndex.current;
    const row = rows[index];
    const rowElement = rowRefs.current[index];
    const plate = plateRefs.current[index];
    const wire = armed.current && rowElement && plate ? measureWire(row, rowElement, plate, narrow) : null;
    const covered = narrow && wire && wire.start[1] < (frameRef.current?.getBoundingClientRect().bottom ?? 0) + 6;
    if (!wire || covered) {
      group.dataset.ready = "false";
      return;
    }
    group.dataset.ready = "true";
    group.dataset.tone = wire.tone;
    outRefs.current.forEach((path) => path.setAttribute("d", wire.outside));
    inRefs.current.forEach((path) => path.setAttribute("d", wire.inside));
    dot.setAttribute("cx", String(wire.start[0]));
    dot.setAttribute("cy", String(wire.start[1]));
    ring.setAttribute("x", String(Math.round(wire.ring.x)));
    ring.setAttribute("y", String(Math.round(wire.ring.y)));
    ring.setAttribute("width", String(Math.round(wire.ring.w)));
    ring.setAttribute("height", String(Math.round(wire.ring.h)));
    ring.setAttribute("rx", String(Math.round(wire.ring.r)));
    if (pendingDraw.current) {
      const mode = pendingDraw.current;
      pendingDraw.current = null;
      if (mode === "animate" && !reduced) draw(wire.split);
    }
  }, [narrow, reduced, draw]);

  useEffect(() => {
    let frame = 0;
    const schedule = () => {
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          updateWire();
        });
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    const mutation = new MutationObserver(schedule);
    const frameElement = frameRef.current;
    if (frameElement) {
      resize.observe(frameElement);
      mutation.observe(frameElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "data-state"] });
    }
    const log = rowRefs.current[0]?.parentElement;
    if (log) resize.observe(log);
    const images = Array.from(document.querySelectorAll(".pj-frame img"));
    images.forEach((image) => image.addEventListener("load", schedule));
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      mutation.disconnect();
      images.forEach((image) => image.removeEventListener("load", schedule));
    };
  }, [updateWire, loaded]);

  /* The first line draws after the first plate has faded in. */
  useEffect(() => {
    if (armed.current) return;
    let timer = 0;
    let frame = 0;
    const arm = () => {
      armed.current = true;
      pendingDraw.current = "animate";
      updateWire();
    };
    const wait = () => {
      const plate = plateRefs.current[0];
      if (!plate || !targetBox(rows[0], plate)) {
        frame = requestAnimationFrame(wait);
        return;
      }
      if (reduced) arm();
      else timer = window.setTimeout(arm, FADE_MS);
    };
    wait();
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [reduced, updateWire]);

  /* A new row: the old line fades, the plate cross-fades, then the new line draws. */
  useLayoutEffect(() => {
    const group = wireRef.current;
    if (!group || wireIndex.current === shown.index) return;
    if (shown.mode === "instant" || reduced) {
      group.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      wireIndex.current = shown.index;
      pendingDraw.current = "instant";
      updateWire();
      return;
    }
    const fade = group.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LEAVE_MS, easing: EASE_OUT, fill: "forwards" });
    const timer = window.setTimeout(() => {
      fade.cancel();
      wireIndex.current = shown.index;
      pendingDraw.current = "animate";
      updateWire();
    }, FADE_MS);
    return () => {
      window.clearTimeout(timer);
      fade.cancel();
    };
  }, [shown, reduced, updateWire]);

  /* ---------- Keyboard and pointer: the page jumps, nothing travels ---------- */
  const jump = useCallback(
    (index: number, mode: Mode) => {
      const row = rowRefs.current[index];
      if (!row) return;
      nextMode.current = mode;
      const root = rootRef.current;
      if (root && mode === "instant") {
        root.dataset.instant = "";
        requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.instant));
      }
      const top = row.getBoundingClientRect().top + window.scrollY - pinLine() + 2;
      window.scrollTo({ top: index === 0 ? 0 : top, behavior: "instant" });
      locate();
      if (activeRef.current === index) {
        nextMode.current = null;
        setShown((was) => (was.index === index ? was : { index, mode: reduced ? "instant" : mode }));
      }
    },
    [locate, pinLine, reduced],
  );

  const onLogKey = (event: KeyboardEvent<HTMLOListElement>) => {
    const step =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : event.key === "Home" ? -99 : event.key === "End" ? 99 : 0;
    if (!step) return;
    event.preventDefault();
    const index = Math.min(rows.length - 1, Math.max(0, shown.index + step));
    jump(index, "instant");
    rowRefs.current[index]?.querySelector<HTMLElement>(".pj-link")?.focus({ preventScroll: true });
  };

  const onRowFocus = (index: number) => (event: FocusEvent<HTMLLIElement>) => {
    if (index !== activeRef.current && event.target.matches(":focus-visible")) jump(index, "instant");
  };

  const onRowClick = (index: number) => (event: MouseEvent<HTMLLIElement>) => {
    if ((event.target as HTMLElement).closest("a")) return;
    if (index !== shown.index) jump(index, "animate");
  };

  const trayRef = useRef<HTMLDivElement>(null);
  const onSlot = (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
    jump(index, event.detail === 0 ? "instant" : "animate");
  };
  const onTrayKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "Home" ? -99 : event.key === "End" ? 99 : 0;
    if (!step) return;
    event.preventDefault();
    const index = Math.min(rows.length - 1, Math.max(0, shown.index + step));
    jump(index, "instant");
    trayRef.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus({ preventScroll: true });
  };

  const current = rows[shown.index];

  return (
    <div className="pj" ref={rootRef}>
      <title>Projector — Gentrit Rashiti</title>
      <main className="pj-main">
        <header className="pj-id">
          <h1>Gentrit Rashiti builds web and mobile products, from the design system to the API behind them.</h1>
          <p className="pj-id-line">
            <span>Part of two platform rewrites. Based in Kosovo, working remotely.</span>
            <span className="pj-id-links">
              <a href={links.cv}>CV</a>
              <a href={`mailto:${links.email}`}>Email</a>
            </span>
          </p>
        </header>

        <ol className="pj-log" aria-label="Ten screens, newest first" onKeyDown={onLogKey}>
          {rows.map((row, index) => (
            <li
              key={row.id}
              ref={(element) => {
                rowRefs.current[index] = element;
              }}
              className="pj-row"
              data-current={index === shown.index || undefined}
              onFocus={onRowFocus(index)}
              onClick={onRowClick(index)}
            >
              <div className="pj-row-head">
                <span className="pj-num" aria-hidden="true">
                  {row.id}
                </span>
                <div className="pj-row-name">
                  <h2>
                    <span className="pj-sr">{row.id}. </span>
                    {row.project}
                  </h2>
                  <p className="pj-role">
                    {row.role} · {row.year}
                  </p>
                </div>
              </div>
              <p className="pj-line">{row.line}</p>
              <p className="pj-result">
                <span className="pj-result-base">
                  <mark>
                    <ArrowRightIcon className="pj-result-arrow" weight="bold" aria-hidden="true" />
                    {row.result}
                  </mark>
                </span>
                <span className="pj-result-ink" aria-hidden="true">
                  <mark>
                    <ArrowRightIcon className="pj-result-arrow" weight="bold" />
                    {row.result}
                  </mark>
                </span>
              </p>
              <p className="pj-foot">
                {row.link.external ? (
                  <a className="pj-link" href={row.link.href} target="_blank" rel="noreferrer">
                    {row.link.label}
                    <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
                  </a>
                ) : (
                  <Link className="pj-link" to={row.link.href}>
                    {row.link.label}
                    <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
                  </Link>
                )}
              </p>
            </li>
          ))}
        </ol>

        <aside className="pj-frame-wrap" aria-label="Frame">
          <div className="pj-frame" ref={frameRef}>
            <div className="pj-screen" ref={screenRef}>
              <div className="pj-stage">
                {rows.map((row, index) => {
                  const state = index === shown.index ? "on" : index === prev ? "prev" : "off";
                  return (
                    <div
                      key={row.id}
                      ref={(element) => {
                        plateRefs.current[index] = element;
                      }}
                      className={`pj-plate pj-plate-${row.plate.kind}`}
                      data-state={state}
                      data-mode={shown.mode}
                      inert={state !== "on" || narrow}
                      aria-hidden={state !== "on"}
                    >
                      <PlateView plate={row.plate} load={loaded.has(index)} narrow={narrow} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="pj-caption">
              <p className="pj-count" aria-hidden="true">
                <span>{current.id}</span>
                <span className="pj-count-of">/ 10</span>
              </p>
              <p className="pj-caption-text" aria-live="polite">
                {current.caption}
              </p>
              <div className="pj-tray" role="toolbar" aria-label="Screens" ref={trayRef} onKeyDown={onTrayKey}>
                {rows.map((row, index) => (
                  <button
                    type="button"
                    key={row.id}
                    aria-label={`${row.id}, ${row.project}`}
                    aria-pressed={index === shown.index}
                    tabIndex={index === shown.index ? 0 : -1}
                    onClick={onSlot(index)}
                  >
                    <span>{row.id}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="pj-end">
        <p>
          Gentrit Rashiti. Bachelor's degree, UBT. The specimen, care and reader screens are recreations with invented
          data; the other screens come from public pages and store listings.
        </p>
        <p className="pj-end-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
      </footer>

      <svg className="pj-wire" aria-hidden="true">
        <g ref={wireRef} data-ready="false">
          {[0, 1].map((layer) => (
            <path
              key={`out-${layer}`}
              ref={(element) => {
                if (element) outRefs.current[layer] = element;
              }}
              className={layer === 0 ? "pj-wire-halo pj-wire-out" : "pj-wire-line pj-wire-out"}
              pathLength={1}
            />
          ))}
          {[0, 1].map((layer) => (
            <path
              key={`in-${layer}`}
              ref={(element) => {
                if (element) inRefs.current[layer] = element;
              }}
              className={layer === 0 ? "pj-wire-halo pj-wire-in" : "pj-wire-line pj-wire-in"}
              pathLength={1}
            />
          ))}
          <rect ref={ringRef} className="pj-wire-ring" />
          <circle ref={dotRef} className="pj-wire-dot" r={3.5} />
        </g>
      </svg>
    </div>
  );
}
