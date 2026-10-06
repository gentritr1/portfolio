import {
  createContext,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { Link as RouterLink, useLocation, useNavigationType } from "react-router";
import { links } from "../../content/links";
import { Clock, openingHour, type Frame } from "./clock";
import {
  client,
  concepts,
  games,
  leadPhone,
  leadWeb,
  offday,
  results,
  screenColours,
  type Concept,
  type Crop,
  type Link,
  type Row,
  type Shot,
} from "./data";
import { anchors, contrast, lightAt, luminance } from "./light";
import {
  cameraFor,
  cellsFrom,
  createGround,
  GLOW_LIMIT,
  lowerAverage,
  project,
  quarters,
  shadowPoints,
  type Camera,
  type GroundRenderer,
  type Panel,
} from "./scene";
import { clockText, direction, kosovoMinutes, RISE, ZONE, type SunDay } from "./sun";
import "./kosovo-time.css";

const FRAUNCES = "/fonts/creative/Fraunces-Latin.woff2";
const PUBLIC_SANS = "/fonts/creative/PublicSans-Latin.woff2";
const FONT_WAIT_MS = 220;

const ClockContext = createContext<Clock | null>(null);
const useClock = () => use(ClockContext)!;

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const visitorZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const visitorFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const kosovoFormat = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: ZONE });
/** The same instant on the visitor's clock, or null when the visitor's clock shows Kosovo time. */
function visitorText(ms: number) {
  if (visitorZone === ZONE) return null;
  const theirs = visitorFormat.format(ms);
  return theirs === kosovoFormat.format(ms) ? null : `${theirs} where you are`;
}

type Vec = [number, number, number];
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const hex = (rgb: number[]) =>
  "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, "0")).join("");

/** The ground colour in front of a glowing screen, never more than the glow limit above the ground. */
function glowColour(frame: Frame, screen: Vec) {
  const base = frame.light.litLinear;
  const add = screen.map((c) => c * 0.5 * frame.light.glow);
  const lum = 0.2126 * add[0] + 0.7152 * add[1] + 0.0722 * add[2];
  const k = lum > GLOW_LIMIT ? GLOW_LIMIT / lum : 1;
  return hex(base.map((c, i) => c + add[i] * k));
}

/* ---------- Ground: a lit floor under one or more upright panels. No text stands on it. ---------- */

interface GroundProps {
  className: string;
  sources: (string | null)[];
  /** Render the floor per pixel when WebGL is there. */
  gl?: boolean;
  /** Fade at the bottom edge, px. */
  fade?: number;
  /** Fade at the left and right edges, px. */
  sides?: number;
  children: ReactNode;
}

function afterFirstPaint() {
  return new Promise<void>((resolve) => {
    if (performance.getEntriesByName("first-contentful-paint").length) return resolve();
    try {
      const watch = new PerformanceObserver((list) => {
        if (!list.getEntriesByName("first-contentful-paint").length) return;
        watch.disconnect();
        resolve();
      });
      watch.observe({ type: "paint", buffered: true });
    } catch {
      resolve();
    }
  });
}

/** A floor that cannot keep this many slow frames in a row falls back to the flat shadow. */
const SLOW_FRAME_MS = 50;
const SLOW_RUN = 18;
/** The per-pixel floor spreads the screen light thinner than the SVG pool, so it carries more of it. */
const GL_GLOW = 4;

function Ground({ className, sources, gl = false, fade = 56, sides = 0, children }: GroundProps) {
  const clock = useClock();
  const id = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const renderer = useRef<GroundRenderer | null>(null);
  const [mode, setMode] = useState<"svg" | "gl">("svg");
  const [slow, setSlow] = useState(false);
  const view = useRef<{ camera: Camera; panels: Panel[]; height: number } | null>(null);
  const cells = sources.map((src) => (src && screenColours[src] ? cellsFrom(screenColours[src]) : null));
  const visible = useRef(true);
  const pace = useRef({ last: 0, run: 0 });

  const draw = (frame: Frame) => {
    const v = view.current;
    if (!v || !visible.current) return;
    const { sun, light } = frame;
    if (renderer.current) {
      const now = performance.now();
      const gap = now - pace.current.last;
      pace.current.last = now;
      pace.current.run = gap > SLOW_FRAME_MS && gap < 400 ? pace.current.run + 1 : 0;
      if (pace.current.run >= SLOW_RUN) {
        setSlow(true);
        return;
      }
      renderer.current.draw({
        camera: v.camera,
        panels: v.panels,
        ray: sun.ray,
        direct: light.direct,
        glow: light.glow * GL_GLOW,
        lit: light.litLinear,
        shade: light.shadeLinear,
        cells: v.panels.map((_, i) => (cells[i] ? quarters(cells[i]) : new Array(12).fill(0.8))),
        fade,
      });
      return;
    }
    const root = svg.current;
    if (!root) return;
    v.panels.forEach((panel, i) => {
      const shadow = root.querySelector<SVGPolygonElement>(`[data-shadow="${i}"]`);
      if (shadow) {
        shadow.setAttribute("points", shadowPoints(v.camera, panel, sun.ray));
        shadow.style.opacity = light.direct.toFixed(3);
      }
      const glow = root.querySelector<SVGEllipseElement>(`[data-glow="${i}"]`);
      const stop = root.querySelector<SVGStopElement>(`[data-glow-stop="${i}"]`);
      if (glow && stop) {
        const screen = cells[i] ? lowerAverage(cells[i]) : ([0.8, 0.8, 0.8] as Vec);
        stop.setAttribute("stop-color", glowColour(frame, screen));
        glow.style.opacity = light.glow > 0.004 ? "1" : "0";
      }
    });
  };
  const drawRef = useRef(draw);
  useLayoutEffect(() => {
    drawRef.current = draw;
  });

  useEffect(() => {
    const host = box.current;
    if (!gl || slow || !host || new URLSearchParams(location.search).get("gl") === "0") return;
    const canvas = document.createElement("canvas");
    canvas.className = "kt-floor";
    canvas.setAttribute("aria-hidden", "true");
    let made: GroundRenderer | null = null;
    const begin = () => {
      made = createGround(canvas, () => {
        renderer.current = null;
        canvas.remove();
        setMode("svg");
      });
      if (!made) return;
      host.prepend(canvas);
      renderer.current = made;
      pace.current = { last: 0, run: 0 };
      setMode("gl");
    };
    const idle = "requestIdleCallback" in window;
    let handle = 0;
    let cancelled = false;
    // The shader compiles after the intro and after the first paint, so a slow GPU holds back neither.
    void clock.ready.then(afterFirstPaint).then(() => {
      if (cancelled) return;
      handle = idle ? window.requestIdleCallback(begin, { timeout: 1500 }) : window.setTimeout(begin, 400);
    });
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
      made?.dispose();
      canvas.remove();
      renderer.current = null;
      setMode("svg");
    };
  }, [clock, gl, slow]);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const measure = () => {
      const rect = element.getBoundingClientRect();
      const panels = [...element.querySelectorAll<HTMLElement>("[data-kt-panel]")].map((p) => p.getBoundingClientRect());
      if (!panels.length || rect.width < 2 || panels.some((p) => p.height < 2)) return;
      const made = cameraFor(rect, panels);
      view.current = { ...made, height: rect.height };
      renderer.current?.resize(rect.width, rect.height);
      const root = svg.current;
      if (root) {
        root.setAttribute("viewBox", `0 0 ${rect.width.toFixed(1)} ${rect.height.toFixed(1)}`);
        const down = root.querySelector(`#${id}-fade`);
        down?.setAttribute("y1", String(rect.height - fade));
        down?.setAttribute("y2", String(rect.height));
        const across = root.querySelector(`#${id}-sides`);
        const edge = Math.min(0.49, sides / Math.max(1, rect.width));
        across?.setAttribute("x2", rect.width.toFixed(1));
        const stops = root.querySelectorAll(`#${id}-sides stop`);
        stops[1]?.setAttribute("offset", edge.toFixed(4));
        stops[2]?.setAttribute("offset", (1 - edge).toFixed(4));
        root.querySelector(`#${id}-across rect`)?.setAttribute("width", rect.width.toFixed(1));
        // A row's floor shows only in front of its screens; a shadow cast behind them would stand beside them as a block.
        const base = Math.min(...made.panels.map((panel) => project(made.camera, [panel.x, 0, 0])[1]));
        root.querySelector(`#${id}-front rect`)?.setAttribute("y", (base - 1).toFixed(1));
        made.panels.forEach((panel, i) => {
          const c = made.camera;
          const [bx, by] = project(c, [panel.x, 0, 0]);
          const ao = root.querySelector(`[data-ao="${i}"]`);
          ao?.setAttribute("cx", bx.toFixed(1));
          ao?.setAttribute("cy", by.toFixed(1));
          ao?.setAttribute("rx", (panel.half + 4).toFixed(1));
          ao?.setAttribute("ry", Math.max(4, panel.h * 0.025).toFixed(1));
          const near = project(c, [panel.x, 0, panel.h * 0.9]);
          const glow = root.querySelector(`[data-glow="${i}"]`);
          glow?.setAttribute("cx", bx.toFixed(1));
          glow?.setAttribute("cy", ((by + near[1]) / 2).toFixed(1));
          glow?.setAttribute("rx", (panel.half * 1.35).toFixed(1));
          glow?.setAttribute("ry", ((near[1] - by) / 2 + 6).toFixed(1));
        });
      }
      drawRef.current(clock.current);
    };
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    element.querySelectorAll("[data-kt-panel]").forEach((p) => resize.observe(p));
    const seen = new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (visible.current) drawRef.current(clock.current);
    });
    seen.observe(element);
    measure();
    const off = clock.subscribe((frame) => drawRef.current(frame));
    return () => {
      resize.disconnect();
      seen.disconnect();
      off();
    };
  }, [clock, fade, sides, id, mode]);

  return (
    <div className={`kt-ground ${className}`} ref={box} data-floor={mode}>
      {mode === "svg" && (
        <svg ref={svg} className="kt-floor" aria-hidden="true" preserveAspectRatio="none">
          <defs>
            <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.1" />
            </filter>
            <filter id={`${id}-ao`} x="-20%" y="-200%" width="140%" height="500%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
            <linearGradient id={`${id}-fade`} gradientUnits="userSpaceOnUse" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </linearGradient>
            <linearGradient id={`${id}-sides`} gradientUnits="userSpaceOnUse" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#000" />
              <stop offset="0" stopColor="#fff" />
              <stop offset="1" stopColor="#fff" />
              <stop offset="1" stopColor="#000" />
            </linearGradient>
            <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
              <rect x="-10000" y="-10000" width="20000" height="20000" fill={`url(#${id}-fade)`} />
            </mask>
            <clipPath id={`${id}-front`}>
              <rect x="-10000" y="0" width="20000" height="20000" />
            </clipPath>
            <mask id={`${id}-across`} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
              <rect x="0" y="-10000" width="1" height="20000" fill={`url(#${id}-sides)`} />
            </mask>
            {sources.map((_, i) => (
              <radialGradient key={i} id={`${id}-glow-${i}`}>
                <stop offset="0" data-glow-stop={i} stopColor="var(--kt-lit)" />
                <stop offset="1" stopColor="var(--kt-lit)" stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          <g mask={`url(#${id}-mask)`}>
            <g mask={sides ? `url(#${id}-across)` : undefined}>
              {sources.map((_, i) => (
                <g key={i}>
                  <ellipse data-glow={i} fill={`url(#${id}-glow-${i})`} style={{ opacity: 0 }} />
                  <ellipse data-ao={i} className="kt-ao" filter={`url(#${id}-ao)`} />
                  <polygon
                    data-shadow={i}
                    className="kt-shadow"
                    filter={`url(#${id}-soft)`}
                    clipPath={sides ? `url(#${id}-front)` : undefined}
                  />
                </g>
              ))}
            </g>
          </g>
        </svg>
      )}
      {children}
    </div>
  );
}

/* ---------- The sun path: today's altitude over Kosovo, and the control that moves the hour ---------- */

const PATH_W = 1000;
const PATH_H = 100;
/** The horizon line sits this far down the track. Below it, the track overlaps the top of the ground. */
const HORIZON = 84;

type Edge = "rise" | "noon" | "set";
interface Box {
  l: number;
  r: number;
  t: number;
  b: number;
}
const overlaps = (a: Box, b: Box) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
/** A touch must move this far, mostly sideways, before it moves the sun. A vertical move scrolls the page. */
const INTENT_PX = 8;
/** A tap moves the sun only when it lands this close to the path or the disc. */
const TAP_REACH = 24;

/** The four hours the jump buttons and the footer lights go to. */
function namedHours(day: SunDay) {
  return [
    { label: "Dawn", ms: day.rise === null ? null : day.rise + 18 * 60000 },
    { label: "Noon", ms: day.noon },
    { label: "Dusk", ms: day.set === null ? null : day.set - 22 * 60000 },
    { label: "Night", ms: day.midnight + 23 * 60 * 60000 },
  ];
}

function SunPath() {
  const clock = useClock();
  const track = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLSpanElement>(null);
  const marks = useRef<Partial<Record<Edge, HTMLSpanElement | null>>>({});
  const spot = useRef({ x: 0.5, y: 0.5, below: false });
  const [minute, setMinute] = useState(() => Math.floor(kosovoMinutes(clock.current.ms)));
  const [altitude, setAltitude] = useState(() => Math.round(clock.current.sun.altitude));
  const [below, setBelow] = useState(() => clock.current.sun.altitude < RISE);
  const [touched, setTouched] = useState(false);
  const touchedNow = useRef(false);
  const drag = useRef<{ id: number; x: number; t: number; v: number } | null>(null);
  const press = useRef<{ id: number; x: number; y: number } | null>(null);
  const day = clock.day;
  const top = Math.max(...day.path);
  const bottom = Math.min(...day.path);
  const up = (HORIZON - 10) / Math.max(10, top);
  const down = (PATH_H - HORIZON - 4) / Math.max(10, -bottom);
  const yOf = (a: number) => HORIZON - (a > 0 ? a * up : a * down);

  /** True when the drawn sun curve passes through the box (track px), with room for the stroke. */
  const crossed = (b: Box, width: number, height: number) => {
    const pad = 3;
    for (let i = 0; i < day.path.length - 1; i++) {
      const x0 = (i / 144) * width;
      const x1 = ((i + 1) / 144) * width;
      if (x1 < b.l - pad || x0 > b.r + pad) continue;
      const y0 = (yOf(day.path[i]) / PATH_H) * height;
      const y1 = (yOf(day.path[i + 1]) / PATH_H) * height;
      const ya = y0 + ((y1 - y0) * (Math.max(x0, b.l - pad) - x0)) / (x1 - x0);
      const yb = y0 + ((y1 - y0) * (Math.min(x1, b.r + pad) - x0)) / (x1 - x0);
      if (Math.max(ya, yb) >= b.t - pad && Math.min(ya, yb) <= b.b + pad) return true;
    }
    return false;
  };

  /** Keeps the path marks off the disc, the hint and the curve, at every hour and width.
   * Sunrise stands only left of its point and Sunset only right of it, where the curve is below the horizon. */
  const place = () => {
    const el = track.current;
    const sun = dot.current;
    const label = hint.current;
    if (!el || !sun || !label) return;
    const width = el.clientWidth;
    const height = el.clientHeight;
    const left = el.getBoundingClientRect().left;
    const viewport = document.documentElement.clientWidth;
    const inView = (b: Box) => left + b.l >= 4 && left + b.r <= viewport - 4;
    const sx = spot.current.x * width;
    const sy = spot.current.y * height;
    const radius = (sun.firstElementChild as HTMLElement).offsetWidth / 2 + 6;
    const disc: Box = { l: sx - radius, r: sx + radius, t: sy - radius, b: sy + radius };

    const shown: { mark: HTMLSpanElement; box: Box }[] = [];
    for (const edge of ["rise", "noon", "set"] as const) {
      const mark = marks.current[edge];
      if (!mark) continue;
      const w = mark.offsetWidth;
      if (!w) continue;
      const anchor = mark.offsetLeft;
      const t = mark.offsetTop;
      const toView = { l: 4 - left - anchor, r: viewport - 4 - left - anchor - w };
      const shifts =
        edge === "rise"
          ? [-w - 12, Math.max(-w - 12, toView.l), Math.min(-w - 12, disc.l - 6 - w - anchor)].filter((dx) => dx <= -w - 6)
          : edge === "set"
            ? [12, Math.min(12, toView.r), Math.max(12, disc.r + 6 - anchor)].filter((dx) => dx >= 6)
            : [-w / 2, -w - 28, 28, Math.min(-w - 12, disc.l - 6 - w - anchor), Math.max(12, disc.r + 6 - anchor)];
      let pick: { dx: number; box: Box } | null = null;
      for (const dx of shifts) {
        const box = { l: anchor + dx, r: anchor + dx + w, t, b: t + mark.offsetHeight };
        if (inView(box) && !overlaps(box, disc) && !crossed(box, width, height)) {
          pick = { dx, box };
          break;
        }
      }
      if (pick) {
        mark.style.transform = `translateX(${Math.round(pick.dx)}px)`;
        shown.push({ mark, box: pick.box });
      }
      mark.dataset.hidden = String(!pick);
    }

    if (touchedNow.current) return;
    const w = label.offsetWidth;
    const h = label.offsetHeight;
    const side = radius + 5;
    const spots: [number, number][] = spot.current.below
      ? [
          [sx - w / 2, sy - 74],
          [sx - w - 8, sy - 74],
          [sx + 8, sy - 74],
        ]
      : [
          [sx + side, sy - h / 2],
          [sx - side - w, sy - h / 2],
          [sx - w / 2, sy - radius - h - 2],
          [sx - w / 2, sy + radius + 2],
        ];
    const boxes = spots
      .map(([l, t]) => ({ l, r: l + w, t, b: t + h }))
      .filter((b) => b.l >= 0 && b.r <= width && b.t >= -6 && b.b <= height + 6);
    let box = boxes.find((b) => shown.every((s) => !overlaps(b, s.box))) ?? boxes[0];
    if (!box) {
      const l = Math.max(0, Math.min(width - w, sx + side));
      box = { l, r: l + w, t: sy - h / 2, b: sy + h / 2 };
    }
    for (const s of shown) if (overlaps(box, s.box)) s.mark.dataset.hidden = "true";
    label.style.setProperty("--hx", `${Math.round(box.l - sx)}px`);
    label.style.setProperty("--hy", `${Math.round(box.t - sy)}px`);
  };

  useLayoutEffect(place);
  useEffect(() => {
    const observer = new ResizeObserver(() => place());
    if (track.current) observer.observe(track.current);
    void document.fonts?.ready.then(() => place());
    return () => observer.disconnect();
    // place reads only refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(
    () =>
      clock.subscribe((f) => {
        const m = Math.max(0, Math.min(1440, (f.ms - day.midnight) / 60000));
        const node = dot.current;
        if (node) {
          const x = m / 1440;
          const y = yOf(f.sun.altitude) / PATH_H;
          node.style.setProperty("--x", `${(x * 100).toFixed(3)}%`);
          node.style.setProperty("--y", `${(y * 100).toFixed(3)}%`);
          spot.current = { x, y, below: f.sun.altitude < RISE };
          node.dataset.below = String(spot.current.below);
          place();
        }
        const whole = Math.floor(kosovoMinutes(f.ms));
        setMinute((was) => (was === whole ? was : whole));
        const a = Math.round(f.sun.altitude);
        setAltitude((was) => (was === a ? was : a));
        setBelow(f.sun.altitude < RISE);
      }),
    // yOf only reads the day, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clock, day],
  );

  const point = (i: number) => `${((i / 144) * PATH_W).toFixed(1)} ${yOf(day.path[i]).toFixed(1)}`;
  const curve = day.path.map((_, i) => `${i ? "L" : "M"}${point(i)}`).join(" ");
  const toMs = (clientX: number) => {
    const rect = track.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return day.midnight + f * 1439 * 60000;
  };
  const touch = () => {
    touchedNow.current = true;
    setTouched(true);
  };
  /** True when a tap lands on the drawn path or on the disc, not on the empty sky around them. */
  const onPath = (clientX: number, clientY: number) => {
    const rect = track.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const i = f * 144;
    const lo = Math.floor(i);
    const a = day.path[lo] + (day.path[Math.min(144, lo + 1)] - day.path[lo]) * (i - lo);
    const pathY = rect.top + (yOf(a) / PATH_H) * rect.height;
    const sunX = rect.left + spot.current.x * rect.width;
    const sunY = rect.top + spot.current.y * rect.height;
    return Math.abs(clientY - pathY) <= TAP_REACH || Math.hypot(clientX - sunX, clientY - sunY) <= TAP_REACH + 8;
  };
  const begin = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    touch();
    drag.current = { id: event.pointerId, x: event.clientX, t: performance.now(), v: 0 };
    clock.set(toMs(event.clientX));
  };
  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.dataset.pointer = "";
    if (event.pointerType === "mouse") return begin(event);
    press.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (p && p.id === event.pointerId) {
      const dx = Math.abs(event.clientX - p.x);
      const dy = Math.abs(event.clientY - p.y);
      if (dy > INTENT_PX && dy >= dx) press.current = null;
      else if (dx > INTENT_PX && dx > dy) {
        press.current = null;
        begin(event);
      }
      return;
    }
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    const now = performance.now();
    const dt = Math.max(1, now - d.t);
    const rect = track.current!.getBoundingClientRect();
    const v = (((event.clientX - d.x) / rect.width) * 1439 * 60000 * 1000) / dt;
    d.v = d.v * 0.6 + v * 0.4;
    d.x = event.clientX;
    d.t = now;
    clock.set(toMs(event.clientX));
  };
  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (p && p.id === event.pointerId) {
      press.current = null;
      if (event.type === "pointerup" && onPath(event.clientX, event.clientY)) {
        touch();
        clock.set(toMs(event.clientX));
      }
      return;
    }
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    // A flick coasts at most one hour past the release point, so the hour a visitor aims at stays near.
    const fresh = performance.now() - d.t < 50;
    if (fresh && d.v !== 0) {
      const coast = Math.max(-3600000, Math.min(3600000, d.v * 0.06));
      clock.set(clock.target + coast, { velocity: Math.sign(d.v) * Math.min(Math.abs(d.v), 3600000 * 8) });
    }
  };
  const onKey = (event: KeyboardEvent<HTMLDivElement>) => {
    delete event.currentTarget.dataset.pointer;
    const step = event.shiftKey || event.key.startsWith("Page") ? 60 : 10;
    const now = clock.target;
    const moves: Record<string, number> = {
      ArrowLeft: now - step * 60000,
      ArrowDown: now - step * 60000,
      PageDown: now - step * 60000,
      ArrowRight: now + step * 60000,
      ArrowUp: now + step * 60000,
      PageUp: now + step * 60000,
      Home: day.midnight,
      End: day.midnight + 1439 * 60000,
    };
    if (!(event.key in moves)) return;
    event.preventDefault();
    touch();
    clock.set(moves[event.key], { instant: true });
  };

  const at = (ms: number) => ((ms - day.midnight) / 60000 / 1440) * 100;
  const valueText = `${clockText(clock.current.ms)} in Kosovo, sun ${Math.abs(altitude)}° ${below ? "below" : "above"} the horizon`;

  return (
    <div
      ref={track}
      className="kt-path"
      role="slider"
      tabIndex={0}
      aria-label="Time in Kosovo today. Drag the sun or use the arrow keys."
      aria-valuemin={0}
      aria-valuemax={1439}
      aria-valuenow={minute}
      aria-valuetext={valueText}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
      onBlur={(event) => delete event.currentTarget.dataset.pointer}
    >
      <svg viewBox={`0 0 ${PATH_W} ${PATH_H}`} preserveAspectRatio="none" aria-hidden="true">
        <clipPath id="kt-above">
          <rect x="0" y="0" width={PATH_W} height={HORIZON} />
        </clipPath>
        <clipPath id="kt-below">
          <rect x="0" y={HORIZON} width={PATH_W} height={PATH_H - HORIZON} />
        </clipPath>
        <path className="kt-path-day" d={`${curve} L${PATH_W} ${HORIZON} L0 ${HORIZON} Z`} clipPath="url(#kt-above)" />
        <line className="kt-path-horizon" x1="0" x2={PATH_W} y1={HORIZON} y2={HORIZON} vectorEffect="non-scaling-stroke" />
        <path className="kt-path-curve" d={curve} clipPath="url(#kt-above)" vectorEffect="non-scaling-stroke" />
        <path className="kt-path-night" d={curve} clipPath="url(#kt-below)" vectorEffect="non-scaling-stroke" />
      </svg>
      {day.rise !== null && (
        <span
          ref={(node) => {
            marks.current.rise = node;
          }}
          className="kt-path-mark"
          data-edge="rise"
          style={{ left: `${at(day.rise)}%` }}
          aria-hidden="true"
        >
          Sunrise {clockText(day.rise)}
        </span>
      )}
      <span
        ref={(node) => {
          marks.current.noon = node;
        }}
        className="kt-path-mark"
        data-edge="noon"
        style={{ left: `${at(day.noon)}%`, top: `${(yOf(top) / PATH_H) * 100}%` }}
        aria-hidden="true"
      >
        Noon {clockText(day.noon)}
      </span>
      {day.set !== null && (
        <span
          ref={(node) => {
            marks.current.set = node;
          }}
          className="kt-path-mark"
          data-edge="set"
          style={{ left: `${at(day.set)}%` }}
          aria-hidden="true"
        >
          Sunset {clockText(day.set)}
        </span>
      )}
      <span ref={dot} className="kt-path-sun" aria-hidden="true">
        <span className="kt-path-disc" />
        <span ref={hint} className="kt-path-hint" data-gone={touched || undefined}>
          {below ? "Drag the sun up" : "Drag the sun"}
        </span>
      </span>
    </div>
  );
}

function Jumps() {
  const clock = useClock();
  const [live, setLive] = useState(clock.current.live);
  useEffect(() => clock.subscribe((f) => setLive((was) => (was === f.live ? was : f.live))), [clock]);
  return (
    <div className="kt-jumps" role="group" aria-label="Light the page for">
      <button type="button" aria-pressed={live} onClick={() => clock.follow()}>
        Now
      </button>
      {namedHours(clock.day).map(
        (j) =>
          j.ms !== null && (
            <button key={j.label} type="button" onClick={() => clock.set(j.ms!)}>
              {j.label}
            </button>
          ),
      )}
    </div>
  );
}

/* ---------- Plates ---------- */

const NarrowContext = createContext(false);

function ShotImage({ shot, crop, eager = false }: { shot: Shot; crop?: Crop; eager?: boolean }) {
  const style: CSSProperties | undefined = crop
    ? {
        position: "absolute",
        width: `${(shot.width / crop.w) * 100}%`,
        height: `${(shot.height / crop.h) * 100}%`,
        left: `${(-crop.x / crop.w) * 100}%`,
        top: `${(-crop.y / crop.h) * 100}%`,
        maxWidth: "none",
      }
    : undefined;
  return (
    <img
      src={shot.src}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      style={style}
    />
  );
}

const caseSlugs: Record<string, string> = {
  care: "care-platform",
  bayyinah: "bayyinah-tv",
  "read-to-feed": "read-to-feed",
  "viva-fresh": "viva-fresh",
  dukagjini: "dukagjini-bookstore",
  "design-system": "design-system-react",
  incentiv: "incentiv",
};

function CaseLink({ id, name }: { id: string; name: string }) {
  const slug = caseSlugs[id];
  if (!slug) return null;
  return (
    <RouterLink className="kt-case" to={`/work/${slug}`}>
      Read the case<span className="kt-sr">: {name}</span>
      {" →"}
    </RouterLink>
  );
}

function Links({ items }: { items: Link[] }) {
  if (!items.length) return null;
  return (
    <ul className="kt-links">
      {items.map((l) => (
        <li key={l.href}>
          <a href={l.href} target="_blank" rel="noreferrer">
            {l.label}
            <span className="kt-out" aria-hidden="true">
              <svg viewBox="0 0 12 12" width="12" height="12">
                <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="kt-sr"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

const cropOf = (shot: Shot, narrow: boolean) => (narrow && shot.narrowCrop) || shot.crop;
/** The plate's shape. With `narrow`, a phone screen may show a wide crop of its proving row, so its text stays readable. */
const shapeOf = (plate: Row["plate"], narrow = false) => {
  const c = cropOf(plate, narrow) ?? { w: plate.width, h: plate.height };
  return c.h > c.w ? "phone" : "wide";
};

function RowText({ row }: { row: Row }) {
  return (
    <div className="kt-row-text">
      <h3>{row.name}</h3>
      <p className="kt-row-line">{row.line}</p>
      <p className="kt-row-result">{row.result}</p>
      <p className="kt-row-role">
        {row.role} · {row.years}
        {row.note && (
          <>
            <br />
            <span className="kt-row-note">{row.note}</span>
          </>
        )}
      </p>
      <CaseLink id={row.id} name={row.name} />
      <Links items={row.links} />
    </div>
  );
}

function ShotPlate({ shot, shape }: { shot: Shot; shape: string }) {
  const narrow = use(NarrowContext);
  const crop = cropOf(shot, narrow);
  return (
    <figure
      className="kt-plate"
      data-kt-panel
      data-shape={shape}
      style={crop ? { aspectRatio: `${crop.w} / ${crop.h}` } : undefined}
    >
      <ShotImage shot={shot} crop={crop} />
    </figure>
  );
}

function Plate({ row }: { row: Row }) {
  const narrow = use(NarrowContext);
  return <ShotPlate shot={row.plate} shape={shapeOf(row.plate, narrow)} />;
}

const sourceOf = (row: Row) => row.plate.src;

function WorkRow({ row }: { row: Row }) {
  const narrow = use(NarrowContext);
  return (
    <li className="kt-row" data-shape={shapeOf(row.plate, narrow)}>
      <Ground className="kt-row-stage" sources={[sourceOf(row)]} sides={40}>
        <Plate row={row} />
      </Ground>
      <RowText row={row} />
    </li>
  );
}

/** Phone apps stand side by side on one ground on a wide screen, so one sun swings all their shadows. */
function Shelf({ rows, stacked }: { rows: Row[]; stacked: boolean }) {
  if (stacked) return rows.map((row) => <WorkRow key={row.id} row={row} />);
  return (
    <li className="kt-shelf">
      <div className="kt-shelf-text">
        {rows.map((row) => (
          <RowText key={row.id} row={row} />
        ))}
      </div>
      <Ground className="kt-shelf-ground" sources={rows.map(sourceOf)} sides={48}>
        <div className="kt-shelf-slots">
          {rows.map((row) => (
            <div key={row.id} className="kt-shelf-slot">
              <Plate row={row} />
            </div>
          ))}
        </div>
      </Ground>
    </li>
  );
}

function ConceptText({ concept: c }: { concept: Concept }) {
  return (
    <div className="kt-concept-text">
      <h3>
        {c.name} <span className="kt-tag">Concept</span>
      </h3>
      <p className="kt-row-line">{c.line}</p>
      <p className="kt-row-result">{c.result}</p>
      <Links items={c.links} />
    </div>
  );
}

/** The lead plates carry their own title bar, so their labels never stand on the floor. */
function LeadPlate({ shot, name, note, kind }: { shot: Shot; name: string; note: string; kind: string }) {
  const narrow = use(NarrowContext);
  const crop = cropOf(shot, narrow);
  return (
    <figure className="kt-lead" data-kt-panel data-kind={kind}>
      <figcaption>
        <strong>{name}</strong> {note}
      </figcaption>
      <div className="kt-lead-shot" style={crop ? { aspectRatio: `${crop.w} / ${crop.h}` } : undefined}>
        <ShotImage shot={shot} crop={crop} eager />
      </div>
    </figure>
  );
}

/** The footer lights: each one lights the page for its hour, as the jump buttons do. */
function Lights({ current }: { current: string }) {
  const clock = useClock();
  const hours = namedHours(clock.day);
  const hourOf: Record<string, number | null> = {
    Dawn: hours[0].ms,
    Day: hours[1].ms,
    Dusk: hours[2].ms,
    Night: hours[3].ms,
  };
  return (
    <ul className="kt-lights">
      {anchors.map((a) => {
        const l = lightAt(a.altitude, a.evening);
        const onSky = Math.min(contrast(l.ink, l.sky), contrast(l.ink, l.haze));
        const result = Math.min(contrast(l.accent, l.sky), contrast(l.accent, l.haze), contrast(l.accent, l.lit));
        const ms = hourOf[a.label];
        return (
          <li key={a.label} data-current={a.label === current || undefined}>
            <button
              type="button"
              className="kt-swatch"
              disabled={ms === null}
              aria-label={`${a.label}: light the page`}
              onClick={() => ms !== null && clock.set(ms)}
              style={{ "--s-sky": l.sky, "--s-haze": l.haze, "--s-lit": l.lit, "--s-shade": l.shade, color: l.ink } as CSSProperties}
            >
              <strong>{a.label}</strong>
              <span style={{ color: l.accent }}>Result line</span>
            </button>
            <dl>
              <div>
                <dt>Sky</dt>
                <dd>
                  {l.sky.toUpperCase()} → {l.haze.toUpperCase()}
                </dd>
              </div>
              <div>
                <dt>Ground · shade</dt>
                <dd>
                  {l.lit.toUpperCase()} · {l.shade.toUpperCase()}
                </dd>
              </div>
              <div>
                <dt>Text</dt>
                <dd>
                  {l.ink.toUpperCase()} · {Math.min(onSky, contrast(l.ink, l.lit)).toFixed(1)}:1 or more
                </dd>
              </div>
              <div>
                <dt>Result lines</dt>
                <dd>
                  {l.accent.toUpperCase()} · {result.toFixed(1)}:1 or more
                </dd>
              </div>
            </dl>
          </li>
        );
      })}
    </ul>
  );
}

/* ---------- Page ---------- */

/** False after the first visit in this tab, so a return to the home page never replays the intro. */
let openedBefore = false;
const RETURN_Y = "kt-y";
/** A load or a reload of the page itself takes too long for the intro on this device: the page opens at the hour. */
const SLOW_LOAD_MS = 2000;

/** True when the visitor comes back from another page of this visit, not on a new load or a reload of the home page. */
function returning() {
  if (openedBefore || window.location.hash === "#work") return true;
  try {
    const entry = performance.getEntriesByType("navigation")[0];
    return entry ? new URL(entry.name).pathname !== "/" : false;
  } catch {
    return false;
  }
}

export default function Draft() {
  const location = useLocation();
  const home = location.pathname === "/";
  const navigation = useNavigationType();
  preload(FRAUNCES, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(PUBLIC_SANS, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const narrow = useMedia("(max-width: 639px)");
  const stacked = useMedia("(max-width: 1023px)");
  const [clock] = useState(() => {
    const back = returning();
    const { minutes, chosen } = openingHour(back);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return new Clock(minutes, !back && !chosen && !window.location.hash && !still);
  });
  const [fonts, setFonts] = useState<"wait" | "real" | "fallback">("wait");
  const time = useRef<HTMLTimeElement>(null);
  const yours = useRef<HTMLSpanElement>(null);
  const sentence = useRef<HTMLParagraphElement>(null);
  const [lightName, setLightName] = useState(clock.current.light.name);
  const [live, setLive] = useState(clock.current.live);
  const settled = fonts !== "wait";

  useEffect(() => {
    openedBefore = true;
  }, []);

  useEffect(() => {
    let done = false;
    const timer = window.setTimeout(() => {
      if (done) return;
      done = true;
      setFonts("fallback");
    }, FONT_WAIT_MS);
    void Promise.all([
      document.fonts.load('500 64px "KT Fraunces"'),
      document.fonts.load('400 17px "KT Public Sans"'),
      document.fonts.load('600 17px "KT Public Sans"'),
    ]).then(
      () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        setFonts("real");
      },
      () => undefined,
    );
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    clock.run(reduced);
  }, [clock, reduced]);

  useLayoutEffect(() => {
    if (settled) clock.start(performance.now() > SLOW_LOAD_MS);
  }, [clock, settled]);

  useEffect(() => () => clock.stop(), [clock]);

  // A return lands where the visitor left: the hash target, or the scroll position of this history entry.
  useLayoutEffect(() => {
    if (!settled) return;
    const target = location.hash ? document.getElementById(decodeURIComponent(location.hash.slice(1))) : null;
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "instant" });
      return;
    }
    if (navigation !== "POP") return;
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(`${RETURN_Y}:${location.key}`);
    } catch {
      saved = null;
    }
    if (saved) window.scrollTo({ top: Number(saved), behavior: "instant" });
    // Only the first settled frame of this visit decides the landing point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled]);

  useLayoutEffect(() => {
    const key = `${RETURN_Y}:${location.key}`;
    return () => {
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {
        // Without storage, Back opens the page at the top.
      }
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add("kt-page");
    const names = ["--kt-sun", "--kt-sky", "--kt-mid", "--kt-haze", "--kt-lit", "--kt-shade", "--kt-ink", "--kt-soft", "--kt-accent"];
    const chrome = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const chromeBefore = chrome?.content;
    const off = clock.subscribe((frame) => {
      const { ms, sun, light } = frame;
      html.style.setProperty("--kt-sky", light.sky);
      html.style.setProperty("--kt-mid", light.mid);
      html.style.setProperty("--kt-haze", light.haze);
      html.style.setProperty("--kt-lit", light.lit);
      html.style.setProperty("--kt-shade", light.shade);
      html.style.setProperty("--kt-ink", light.ink);
      html.style.setProperty("--kt-soft", light.soft);
      html.style.setProperty("--kt-accent", light.accent);
      html.style.setProperty("--kt-sun", light.sun);
      html.dataset.ktDark = luminance(light.lit) < 0.2 ? "true" : "false";
      if (chrome && chrome.content !== light.sky) chrome.content = light.sky;
      if (time.current) time.current.textContent = clockText(ms);
      if (yours.current) yours.current.textContent = visitorText(ms) ?? "";
      setLive((was) => (was === frame.live ? was : frame.live));
      if (sentence.current) {
        const abs = Math.abs(sun.altitude);
        const a = abs < 9.95 ? abs.toFixed(1) : Math.round(abs);
        sentence.current.textContent =
          sun.altitude >= RISE
            ? `The sun is ${a}° above the horizon, in the ${direction(sun.bearing)}. It lights this page.`
            : `The sun is ${a}° below the horizon. Only the screens light this page.`;
      }
      setLightName((was) => (was === light.name ? was : light.name));
    });
    return () => {
      off();
      html.classList.remove("kt-page");
      for (const name of names) html.style.removeProperty(name);
      delete html.dataset.ktDark;
      if (chrome && chromeBefore) chrome.content = chromeBefore;
    };
  }, [clock]);

  useLayoutEffect(() => {
    if (live && yours.current) yours.current.textContent = visitorText(clock.current.ms) ?? "";
  }, [clock, live]);

  const phones = client.filter((r) => shapeOf(r.plate) === "phone");
  const firstPhone = client.findIndex((r) => shapeOf(r.plate) === "phone");

  return (
    <ClockContext value={clock}>
      <NarrowContext value={narrow}>
        <div className="kt" data-fonts={fonts} data-reduced={reduced || undefined}>
          <title>{home ? "Gentrit Rashiti — web, mobile & full stack" : "Gentrit Rashiti · lit by the sun over Kosovo"}</title>
          <header className="kt-top">
            <a className="kt-name" href="#top">
              Gentrit Rashiti
            </a>
            <nav aria-label="Contact">
              <a href="#work">Work</a>
              <a href={links.github} target="_blank" rel="noreferrer">
                GitHub<span className="kt-sr"> (opens in a new tab)</span>
              </a>
              <a href={`mailto:${links.email}`}>Email</a>
              <a href={links.cv}>CV (PDF)</a>
            </nav>
          </header>

          <main>
            <div className="kt-first">
              <div className="kt-sky">
                <section className="kt-hero" id="top" aria-labelledby="kt-id">
                  <div className="kt-id">
                    <h1 id="kt-id">Gentrit Rashiti builds web and mobile apps, from Kosovo.</h1>
                    <p>5+ years. Part of two platform rewrites. Working remotely.</p>
                    <ul className="kt-results">
                      {results.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="kt-clock">
                    <p className="kt-now">
                      <time ref={time} className="kt-hm">
                        {clockText(clock.current.ms)}
                      </time>
                      <span className="kt-where">
                        in Kosovo
                        {live ? (
                          <span ref={yours} className="kt-yours" />
                        ) : (
                          <button type="button" className="kt-back" onClick={() => clock.follow()}>
                            <span>Chosen hour ·</span> <span className="kt-back-now">Back to now</span>
                          </button>
                        )}
                      </span>
                    </p>
                    <p ref={sentence} className="kt-sentence" />
                    <Jumps />
                  </div>
                </section>
                <SunPath />
              </div>
              <Ground className="kt-stage" sources={[leadWeb.shot.src, leadPhone.shot.src]} gl fade={64}>
                <div className="kt-leads">
                  <LeadPlate shot={leadWeb.shot} name={leadWeb.name} note={leadWeb.note} kind="web" />
                  <LeadPlate shot={leadPhone.shot} name={leadPhone.name} note={leadPhone.note} kind="phone" />
                </div>
              </Ground>
            </div>

            <section className="kt-section" id="work" aria-labelledby="kt-client">
              <h2 id="kt-client">Client work</h2>
              <ol className="kt-rows">
                {client.map((row, i) =>
                  shapeOf(row.plate) !== "phone" ? (
                    <WorkRow key={row.id} row={row} />
                  ) : i === firstPhone ? (
                    <Shelf key="shelf" rows={phones} stacked={stacked} />
                  ) : null,
                )}
              </ol>
            </section>

            <section className="kt-section" aria-labelledby="kt-own">
              <h2 id="kt-own">Own projects</h2>
              <ol className="kt-rows">
                <WorkRow row={offday} />
              </ol>
              {stacked ? (
                <ol className="kt-rows">
                  {concepts.map((c) => (
                    <li key={c.id} className="kt-row" data-shape="wide">
                      <Ground className="kt-row-stage" sources={[c.plate.src]} sides={40}>
                        <ShotPlate shot={c.plate} shape="wide" />
                      </Ground>
                      <ConceptText concept={c} />
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="kt-pair">
                  <div className="kt-pair-text">
                    {concepts.map((c) => (
                      <ConceptText key={c.id} concept={c} />
                    ))}
                  </div>
                  <Ground className="kt-pair-ground" sources={concepts.map((c) => c.plate.src)} sides={48}>
                    <div className="kt-pair-slots">
                      {concepts.map((c) => (
                        <ShotPlate key={c.id} shot={c.plate} shape="wide" />
                      ))}
                    </div>
                  </Ground>
                </div>
              )}
              <h3 className="kt-games-title">Three small games, live on the web</h3>
              <ul className="kt-games">
                {games.map((g) => (
                  <li key={g.id}>
                    <h4>{g.name}</h4>
                    <p>{g.line}</p>
                    <Links items={[g.link]} />
                  </li>
                ))}
              </ul>
            </section>
          </main>

          <footer className="kt-foot">
            <div className="kt-foot-contact">
              <a href={`mailto:${links.email}`}>{links.email}</a>
              <a href={links.github} target="_blank" rel="noreferrer">
                GitHub<span className="kt-sr"> (opens in a new tab)</span>
              </a>
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn<span className="kt-sr"> (opens in a new tab)</span>
              </a>
              <a href={links.cv}>CV (PDF)</a>
            </div>
            <h2>The light on this page</h2>
            <p className="kt-foot-lede">
              The sun's height and direction come from the SunCalc formulas for Kosovo (42.6° N, 20.9° E), at your clock.
              Every shadow is projected from them. Press a light to see the page in it.
            </p>
            <Lights current={lightName} />
          </footer>
        </div>
      </NarrowContext>
    </ClockContext>
  );
}
