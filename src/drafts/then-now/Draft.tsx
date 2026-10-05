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
import { preload } from "react-dom";
import { Link } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { rows, type Box, type Plate, type Row, type Shot } from "./data";
import "./then-now.css";

const SETTLE_MS = 160;
const FONT_WAIT_MS = 1000;
const WRITE_WAIT_MS = 1200;
const LITERATA = "/fonts/creative/Literata-Latin.woff2";
const ANTON = "/fonts/creative/Anton-Latin.woff2";
const DRAW_MS = 180;
const RING_MS = 120;
const LEAVE_MS = 120;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
/** On a wide screen every plate is drawn 640 x 656 and scaled to the frame's width. */
const STAGE_W = 640;

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

const liveKeys = { care: recreations.care, "design-system": recreations["design-system"] };

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

  return (
    <div ref={ref} className={`tn-live tn-live-${which}`} data-world={entry.world}>
      <Suspense fallback={<div className="tn-wait" />}>
        <Live />
      </Suspense>
    </div>
  );
}

function ShotView({ shot, crop }: { shot: Shot; crop: Box }) {
  return (
    <div
      className="tn-shot"
      style={{ aspectRatio: `${Math.round(crop.w * shot.width)} / ${Math.round(crop.h * shot.height)}` }}
    >
      <img
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
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

const REQUESTS = Array.from({ length: 16 }, (_, i) => i);

/** The billing report as a count a reader can check: 16 requests, then 2. */
function Figure({ struck }: { struck: boolean }) {
  return (
    <figure className="tn-fig" data-struck={struck || undefined}>
      <p className="tn-fig-label">One billing report</p>
      <p className="tn-fig-nums" aria-hidden="true">
        <span className="tn-fig-from">
          16
          <span className="tn-fig-strike" />
        </span>
        <ArrowRightIcon className="tn-fig-arrow" weight="bold" />
        <span className="tn-fig-to" data-to="">
          2
        </span>
      </p>
      <ol className="tn-fig-dots" aria-hidden="true">
        {REQUESTS.map((i) => (
          <li key={i} data-keep={i < 2 || undefined} />
        ))}
      </ol>
      <figcaption className="tn-fig-unit">
        Requests to the database
        <span className="tn-sr">: 16 before, 2 now.</span>
      </figcaption>
    </figure>
  );
}

function PlateView({ plate, load, narrow, struck }: { plate: Plate; load: boolean; narrow: boolean; struck: boolean }) {
  if (plate.kind === "figure") return <Figure struck={struck} />;
  if (plate.kind === "live") return load ? <LivePlate which={plate.key} /> : <div className="tn-wait" />;
  return (
    <div className={`tn-${plate.kind}`} style={plate.kind === "web" ? { background: plate.ground } : undefined}>
      {load && <ShotView shot={plate.shot} crop={narrow ? plate.shot.narrow : plate.shot.crop} />}
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
  tone: "light" | "dark";
}

function targetBox(row: Row, plate: HTMLElement): Box | null {
  const { target } = row;
  if (!target) return null;
  if (target.kind === "shot") {
    const image = plate.querySelector<HTMLImageElement>(".tn-shot img");
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
  const mark = rowElement.querySelector<HTMLElement>(".tn-now-band mark");
  const target = targetBox(row, plate);
  if (!mark || !target) return null;
  const fragments = mark.getClientRects();
  if (fragments.length === 0) return null;
  const p = plate.getBoundingClientRect();
  const edge = Math.round(p.left);
  const last = fragments[fragments.length - 1];
  const start: Point = [Math.round(last.right + 12), Math.round(last.top + last.height / 2)];
  const gutter = Math.round(edge - 24);
  const outside: Point[] = [start, [gutter, start[1]]];
  const inside: Point[] = [];
  if (row.route?.kind === "lane") {
    const lane = Math.round(p.top + row.route.y * p.height);
    const cx = Math.round(target.x + target.w / 2);
    const end = target.y > lane ? Math.round(target.y - 8) : Math.round(target.y + target.h + 8);
    outside.push([gutter, lane], [edge, lane]);
    inside.push([edge, lane], [cx, lane], [cx, end]);
  } else {
    const ty = Math.round(target.y + target.h / 2);
    outside.push([gutter, ty], [edge, ty]);
    inside.push([edge, ty], [Math.round(target.x - 8), ty]);
  }
  const pad = 6;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 8 };
  if (row.target?.kind === "selector" && row.target.round) ring.r = ring.h / 2;
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  return {
    outside: narrow ? "" : rounded(outside),
    inside: narrow ? "" : rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start,
    ring,
    tone: row.plate.kind === "web" && row.plate.dark ? "dark" : "light",
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

  /*
   * A struck row stays struck. "fresh" is the row whose line is being drawn now;
   * every other row strikes without a transition.
   */
  const [struck, setStruck] = useState<Set<number>>(() => new Set());
  const [fresh, setFresh] = useState<number | null>(null);

  /* Which row is at the reading line. */
  const pinLine = useCallback(() => {
    if (!narrow) return window.innerHeight * 0.42;
    const frame = frameRef.current?.getBoundingClientRect();
    return (frame?.bottom ?? 300) + 24;
  }, [narrow]);

  const locate = useCallback(() => {
    if (!rowRefs.current[0]?.offsetHeight) return;
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

  /* A row is shown only after it settles at the reading line, so a passed row never fires. */
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

  /* The shown row and every row above it are struck. Only the shown row draws its line. */
  const [strikeFor, setStrikeFor] = useState<{ index: number; mode: Mode; reduced: boolean } | null>(null);
  if (strikeFor?.index !== shown.index || strikeFor.mode !== shown.mode || strikeFor.reduced !== reduced) {
    setStrikeFor({ index: shown.index, mode: shown.mode, reduced });
    const upTo = reduced ? rows.length - 1 : shown.index;
    const missing = rows.slice(0, upTo + 1).some((_, i) => !struck.has(i));
    if (missing) {
      const next = new Set(struck);
      for (let i = 0; i <= upTo; i++) next.add(i);
      setStruck(next);
    }
    const first = strikeFor === null;
    const draws =
      !reduced && (first || shown.mode === "animate") && !struck.has(shown.index) && rows[shown.index].kind === "fixed";
    setFresh(draws ? shown.index : null);
  }

  /* The page is laid out once its two faces are loaded. Then the first row strikes. */
  preload(LITERATA, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(ANTON, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const [laid, setLaid] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    let frame = 0;
    const show = () => {
      if (!live) return;
      live = false;
      setLaid(true);
      // The strike starts one painted frame after the layout, so its transition runs.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => setReady(true));
      });
    };
    const timer = window.setTimeout(show, FONT_WAIT_MS);
    void Promise.all([
      document.fonts.load('400 20px "Literata"'),
      document.fonts.load('650 20px "Literata"'),
      document.fonts.load('400 20px "Anton"'),
    ])
      .then(() => document.fonts.ready)
      .then(show, show);
    return () => {
      live = false;
      window.clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    if (laid) locate();
  }, [laid, locate]);
  const firstLoad = !ready && !reduced;

  /* The plate that leaves stays under the new one until the new one is opaque. */
  const [track, setTrack] = useState<{ index: number; prev: number | null }>({ index: 0, prev: null });
  if (track.index !== shown.index) {
    setTrack({ index: shown.index, prev: shown.mode === "instant" ? null : track.index });
  }
  const prev = track.prev;
  useEffect(() => {
    if (prev === null) return;
    const timer = window.setTimeout(() => setTrack((was) => ({ ...was, prev: null })), 240);
    return () => window.clearTimeout(timer);
  }, [prev, track.index]);

  /* A screenshot loads when its row is near. A live plate mounts when its row is first shown. */
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
      void recreations["design-system"].load();
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

  const draw = useCallback((split: number, wide: boolean) => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;
    if (!wide) {
      ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RING_MS, easing: EASE_OUT, fill: "backwards" });
      return;
    }
    const outMs = Math.round(DRAW_MS * split);
    const inMs = DRAW_MS - outMs;
    outRefs.current.forEach((path) =>
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: outMs, easing: "linear", fill: "backwards" }),
    );
    inRefs.current.forEach((path) =>
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
    const frameBottom = frameRef.current?.getBoundingClientRect().bottom ?? 0;
    const covered = !narrow && wire && wire.start[1] < 0;
    const hidden = narrow && wire && wire.ring.y + wire.ring.h > frameBottom - 40;
    if (!wire || covered || hidden) {
      group.dataset.ready = "false";
      return;
    }
    group.dataset.ready = "true";
    group.dataset.tone = wire.tone;
    group.dataset.wide = String(!narrow);
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
      if (mode === "animate" && !reduced) draw(wire.split, !narrow);
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
    const images = Array.from(document.querySelectorAll(".tn-frame img"));
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

  /** Calls back when the row's result has written in, so the line never draws ahead of its words. */
  const afterWrite = useCallback((index: number, done: () => void) => {
    const band = rowRefs.current[index]?.querySelector<HTMLElement>(".tn-now-band");
    let live = true;
    const finish = () => {
      if (!live) return;
      live = false;
      band?.removeEventListener("transitionend", onEnd);
      band?.removeEventListener("transitioncancel", onEnd);
      window.clearTimeout(timer);
      done();
    };
    const onEnd = (event: TransitionEvent) => {
      if (event.target === band && event.propertyName === "clip-path") finish();
    };
    band?.addEventListener("transitionend", onEnd);
    band?.addEventListener("transitioncancel", onEnd);
    // The band moves for at most 460 ms. The timer covers a band that does not move.
    const timer = window.setTimeout(finish, WRITE_WAIT_MS);
    return () => {
      live = false;
      band?.removeEventListener("transitionend", onEnd);
      band?.removeEventListener("transitioncancel", onEnd);
      window.clearTimeout(timer);
    };
  }, []);

  /* At load the first row strikes, its result writes in, then its line draws. */
  useEffect(() => {
    if (armed.current || !ready) return;
    let frame = 0;
    let stop: (() => void) | null = null;
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
      else stop = afterWrite(0, arm);
    };
    wait();
    return () => {
      cancelAnimationFrame(frame);
      stop?.();
    };
  }, [ready, reduced, updateWire, afterWrite]);

  /* A new row: the old line fades, the row strikes (once) and writes, then the new line draws. */
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
    const stop = afterWrite(shown.index, () => {
      fade.cancel();
      wireIndex.current = shown.index;
      pendingDraw.current = "animate";
      updateWire();
    });
    return () => {
      stop();
      fade.cancel();
    };
  }, [shown, reduced, updateWire, afterWrite]);

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
    rowRefs.current[index]?.querySelector<HTMLElement>(".tn-link")?.focus({ preventScroll: true });
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
  const isStruck = (index: number) => struck.has(index) && !(index === 0 && firstLoad);

  return (
    <div className="tn" ref={rootRef} data-laid={laid || undefined} data-ready={ready || undefined}>
      <title>Then and now — Gentrit Rashiti</title>
      <main className="tn-main">
        <header className="tn-id">
          <h1>Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them.</h1>
          <p className="tn-id-line">
            <span>Part of two platform rewrites. Based in Kosovo, working remotely.</span>
            <span className="tn-id-links">
              <a href={links.cv}>Download CV</a>
              <a href={`mailto:${links.email}`}>Email</a>
            </span>
          </p>
          <p className="tn-key">Each row is one change to a product. A struck line is a problem that is now gone.</p>
        </header>

        <ol className="tn-log" aria-label="Changes, strongest first" onKeyDown={onLogKey}>
          {rows.map((row, index) => {
            const strikeNow = row.kind === "fixed" && isStruck(index);
            return (
              <li
                key={row.id}
                ref={(element) => {
                  rowRefs.current[index] = element;
                }}
                className="tn-row"
                data-kind={row.kind}
                data-current={index === shown.index || undefined}
                data-struck={strikeNow || undefined}
                data-fresh={(fresh === index && strikeNow) || undefined}
                onFocus={onRowFocus(index)}
                onClick={onRowClick(index)}
              >
                <h2 className="tn-head">
                  <span className="tn-num" aria-hidden="true">
                    {row.id}
                  </span>
                  <span className="tn-project">{row.project}</span>
                  <span className="tn-role">
                    {row.role} · {row.year}
                  </span>
                </h2>
                <p className="tn-then">
                  <span className="tn-label">{row.kind === "shipped" ? "Shipped" : "Then"}</span>
                  <span className="tn-then-text">
                    {row.kind === "fixed" && <span className="tn-sr">Problem, now gone: </span>}
                    {row.then}
                    {row.kind === "fixed" && (
                      <span className="tn-strike" aria-hidden="true">
                        {row.then}
                      </span>
                    )}
                  </span>
                </p>
                <p className="tn-now">
                  <span className="tn-label">Now</span>
                  <span className="tn-now-body">
                    <span className="tn-now-base">
                      <mark>{row.now}</mark>
                    </span>
                    <span className="tn-now-band" aria-hidden="true">
                      <mark>{row.now}</mark>
                    </span>
                  </span>
                </p>
                <p className="tn-foot">
                  {row.link.external ? (
                    <a className="tn-link" href={row.link.href} target="_blank" rel="noreferrer">
                      {row.link.label}
                      <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
                    </a>
                  ) : (
                    <Link className="tn-link" to={row.link.href}>
                      {row.link.label}
                      <span className="tn-sr">: {row.project}</span>
                      <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
                    </Link>
                  )}
                </p>
              </li>
            );
          })}
        </ol>

        <aside className="tn-frame-wrap" aria-label="Screen for the current row">
          <div className="tn-frame" ref={frameRef}>
            <div className="tn-screen" ref={screenRef}>
              <div className="tn-stage">
                {rows.map((row, index) => {
                  const state = index === shown.index ? "on" : index === prev ? "prev" : "off";
                  return (
                    <div
                      key={row.id}
                      ref={(element) => {
                        plateRefs.current[index] = element;
                      }}
                      className={`tn-plate tn-plate-${row.plate.kind}`}
                      data-state={state}
                      data-mode={shown.mode}
                      inert={state !== "on" || narrow}
                      aria-hidden={state !== "on"}
                    >
                      <PlateView plate={row.plate} load={loaded.has(index)} narrow={narrow} struck={isStruck(index)} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="tn-caption">
              <p className="tn-count" aria-hidden="true">
                <span>{current.id}</span>
                <span className="tn-count-of">/ {String(rows.length).padStart(2, "0")}</span>
              </p>
              <p className="tn-caption-text" aria-live="polite">
                {current.caption}
              </p>
              <div className="tn-tray" role="toolbar" aria-label="Rows" ref={trayRef} onKeyDown={onTrayKey}>
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

      <footer className="tn-end">
        <p>
          Gentrit Rashiti. Bachelor's degree, UBT. The vitals card and the button card are recreations with invented
          data. The other screens come from public pages and store listings.
        </p>
        <p className="tn-end-links">
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

      <svg className="tn-wire" aria-hidden="true">
        <g ref={wireRef} data-ready="false">
          {[0, 1].map((layer) => (
            <path
              key={`out-${layer}`}
              ref={(element) => {
                if (element) outRefs.current[layer] = element;
              }}
              className={layer === 0 ? "tn-wire-halo tn-wire-out" : "tn-wire-line tn-wire-out"}
              pathLength={1}
            />
          ))}
          {[0, 1].map((layer) => (
            <path
              key={`in-${layer}`}
              ref={(element) => {
                if (element) inRefs.current[layer] = element;
              }}
              className={layer === 0 ? "tn-wire-halo tn-wire-in" : "tn-wire-line tn-wire-in"}
              pathLength={1}
            />
          ))}
          <rect ref={ringRef} className="tn-wire-ring" />
          <circle ref={dotRef} className="tn-wire-dot" r={3.5} />
        </g>
      </svg>
    </div>
  );
}
