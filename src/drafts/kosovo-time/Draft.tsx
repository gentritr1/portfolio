import {
  createContext,
  Suspense,
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
import { Link as RouterLink, useLocation } from "react-router";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { Clock, type Frame } from "./clock";
import { client, concepts, lead, leadClient, own, results, type Concept, type Link, type Row, type Shot } from "./data";
import { anchors, contrast, lightAt, luminance } from "./light";
import {
  cameraFor,
  createGround,
  GLOW_LIMIT,
  lowerAverage,
  project,
  quarters,
  sampleScreen,
  shadowPoints,
  type Camera,
  type Cells,
  type GroundRenderer,
  type Panel,
} from "./scene";
import { clockText, direction, kosovoMinutes, RISE, ZONE } from "./sun";
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

/** `?at=18:40` lights the page for that Kosovo time today. */
function startMinutes() {
  const match = /^(\d{1,2}):(\d{2})$/.exec(new URLSearchParams(location.search).get("at") ?? "");
  if (!match) return null;
  return Math.min(1439, Number(match[1]) * 60 + Number(match[2]));
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
  const cells = useRef<(Cells | null)[]>(sources.map(() => null));
  const visible = useRef(true);
  const pace = useRef({ last: 0, run: 0 });
  const key = sources.join("|");

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
        cells: v.panels.map((_, i) => (cells.current[i] ? quarters(cells.current[i]!) : new Array(12).fill(0.8))),
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
        const screen = cells.current[i] ? lowerAverage(cells.current[i]!) : ([0.8, 0.8, 0.8] as Vec);
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
    let live = true;
    sources.forEach((src, i) => {
      if (!src) return;
      void sampleScreen(src)
        .then((c) => {
          if (!live) return;
          cells.current[i] = c;
          drawRef.current(clock.current);
        })
        .catch(() => undefined);
    });
    return () => {
      live = false;
    };
    // The key holds every source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, clock]);

  useEffect(() => {
    const host = box.current;
    if (!gl || slow || !host || new URLSearchParams(location.search).get("gl") === "0") return;
    const canvas = document.createElement("canvas");
    canvas.className = "kt-floor";
    canvas.setAttribute("aria-hidden", "true");
    const made = createGround(canvas, () => {
      renderer.current = null;
      canvas.remove();
      setMode("svg");
    });
    if (!made) return;
    host.prepend(canvas);
    renderer.current = made;
    pace.current = { last: 0, run: 0 };
    setMode("gl");
    return () => {
      made.dispose();
      canvas.remove();
      renderer.current = null;
      setMode("svg");
    };
  }, [gl, slow]);

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
                  <polygon data-shadow={i} className="kt-shadow" filter={`url(#${id}-soft)`} />
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

function SunPath() {
  const clock = useClock();
  const track = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const hint = useRef<HTMLSpanElement>(null);
  const spot = useRef({ x: 0.5, below: false });
  const [minute, setMinute] = useState(() => Math.floor(kosovoMinutes(clock.current.ms)));
  const [altitude, setAltitude] = useState(() => Math.round(clock.current.sun.altitude));
  const [touched, setTouched] = useState(false);
  const drag = useRef<{ id: number; x: number; t: number; v: number } | null>(null);
  const day = clock.day;
  const top = Math.max(...day.path);
  const bottom = Math.min(...day.path);
  const up = (HORIZON - 10) / Math.max(10, top);
  const down = (PATH_H - HORIZON - 4) / Math.max(10, -bottom);
  const yOf = (a: number) => HORIZON - (a > 0 ? a * up : a * down);

  const placeHint = () => {
    const label = hint.current;
    const box = track.current?.getBoundingClientRect();
    if (!label || !box) return;
    const { x, below } = spot.current;
    const sunX = box.left + x * box.width;
    const w = label.offsetWidth;
    const gap = (dot.current?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 38;
    const fits = (at: number) => at >= box.left && at + w <= box.right;
    const after = sunX + gap / 2 + 11;
    const before = sunX - gap / 2 - 11 - w;
    let left: number;
    if (below) left = Math.max(box.left, Math.min(box.right - w, sunX - w / 2));
    else if (fits(after)) left = after;
    else if (fits(before)) left = before;
    else left = box.right - (after + w) < before - box.left ? before : after;
    left = Math.max(8, Math.min(document.documentElement.clientWidth - 8 - w, left));
    label.style.setProperty("--hx", `${Math.round(left - sunX)}px`);
  };

  useLayoutEffect(placeHint);
  useEffect(() => {
    const observer = new ResizeObserver(() => placeHint());
    if (track.current) observer.observe(track.current);
    return () => observer.disconnect();
    // placeHint reads only refs.
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
          spot.current = { x, below: f.sun.altitude < RISE };
          node.dataset.below = String(spot.current.below);
          placeHint();
        }
        const whole = Math.floor(kosovoMinutes(f.ms));
        setMinute((was) => (was === whole ? was : whole));
        const a = Math.round(f.sun.altitude);
        setAltitude((was) => (was === a ? was : a));
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
  const onDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    setTouched(true);
    drag.current = { id: event.pointerId, x: event.clientX, t: performance.now(), v: 0 };
    clock.set(toMs(event.clientX));
  };
  const onMove = (event: PointerEvent<HTMLDivElement>) => {
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
    setTouched(true);
    clock.set(moves[event.key], { instant: true });
  };

  const at = (ms: number) => ((ms - day.midnight) / 60000 / 1440) * 100;
  const valueText = `${clockText(clock.current.ms)} in Kosovo, sun ${Math.abs(altitude)}° ${altitude >= 0 ? "above" : "below"} the horizon`;
  const below = altitude < RISE;

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
        <span className="kt-path-mark" data-edge="rise" style={{ left: `${at(day.rise)}%` }} aria-hidden="true">
          Sunrise {clockText(day.rise)}
        </span>
      )}
      <span className="kt-path-mark" data-edge="noon" style={{ left: `${at(day.noon)}%`, top: `${(yOf(top) / PATH_H) * 100}%` }} aria-hidden="true">
        Noon {clockText(day.noon)}
      </span>
      {day.set !== null && (
        <span className="kt-path-mark" data-edge="set" style={{ left: `${at(day.set)}%` }} aria-hidden="true">
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
  const day = clock.day;
  const jumps = [
    { label: "Dawn", ms: day.rise === null ? null : day.rise + 18 * 60000 },
    { label: "Noon", ms: day.noon },
    { label: "Dusk", ms: day.set === null ? null : day.set - 22 * 60000 },
    { label: "Night", ms: day.midnight + 23 * 60 * 60000 },
  ];
  return (
    <div className="kt-jumps" role="group" aria-label="Light the page for">
      <button type="button" aria-pressed={live} onClick={() => clock.follow()}>
        Now
      </button>
      {jumps.map(
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

function ShotImage({ shot, eager = false }: { shot: Shot; eager?: boolean }) {
  const c = shot.crop;
  const style: CSSProperties | undefined = c
    ? {
        position: "absolute",
        width: `${(shot.width / c.w) * 100}%`,
        height: `${(shot.height / c.h) * 100}%`,
        left: `${(-c.x / c.w) * 100}%`,
        top: `${(-c.y / c.h) * 100}%`,
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

const CARE_WIDTH = 720;

function CarePlate() {
  const entry = recreations.care;
  const Live = entry.Component;
  const outer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    void entry.load();
  }, [entry]);
  useLayoutEffect(() => {
    const element = outer.current;
    if (!element) return;
    const fit = () => element.style.setProperty("--kt-care-scale", String(element.clientWidth / CARE_WIDTH));
    const watch = new ResizeObserver(fit);
    watch.observe(element);
    fit();
    return () => watch.disconnect();
  }, []);
  return (
    <div className="kt-care" ref={outer} data-world={entry.world} inert aria-hidden="true">
      <div className="kt-care-inner">
        <Suspense fallback={null}>
          <Live />
        </Suspense>
      </div>
    </div>
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
      Read the case<span className="kt-sr">: {name}</span> →
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

const shapeOf = (plate: Row["plate"]) => (plate === "care" ? "care" : plate.height > plate.width ? "phone" : "wide");

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

function Plate({ row }: { row: Row }) {
  return (
    <figure className="kt-plate" data-kt-panel data-shape={shapeOf(row.plate)}>
      {row.plate === "care" ? <CarePlate /> : <ShotImage shot={row.plate} />}
    </figure>
  );
}

function WorkRow({ row }: { row: Row }) {
  return (
    <li className="kt-row" data-shape={shapeOf(row.plate)}>
      <Ground className="kt-row-stage" sources={[row.plate === "care" ? null : row.plate.src]} sides={40}>
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
      <Ground className="kt-shelf-ground" sources={rows.map((r) => (r.plate === "care" ? null : r.plate.src))} sides={48}>
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

function ConceptPlate({ concept: c }: { concept: Concept }) {
  return (
    <figure className="kt-plate" data-kt-panel data-shape="wide">
      <ShotImage shot={c.plate} />
    </figure>
  );
}

/** The lead plates carry their own title bar, so their labels never stand on the floor. */
function LeadPlate({ shot, name, note, kind }: { shot: Shot; name: string; note: string; kind: string }) {
  return (
    <figure className="kt-lead" data-kt-panel data-kind={kind}>
      <figcaption>
        <strong>{name}</strong> {note}
      </figcaption>
      <div className="kt-lead-shot" style={shot.crop ? { aspectRatio: `${shot.crop.w} / ${shot.crop.h}` } : undefined}>
        <ShotImage shot={shot} eager />
      </div>
    </figure>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const home = useLocation().pathname === "/";
  preload(FRAUNCES, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(PUBLIC_SANS, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const narrow = useMedia("(max-width: 639px)");
  const stacked = useMedia("(max-width: 1023px)");
  const [clock] = useState(() => new Clock(startMinutes()));
  const [fonts, setFonts] = useState<"wait" | "real" | "fallback">("wait");
  const time = useRef<HTMLTimeElement>(null);
  const yours = useRef<HTMLSpanElement>(null);
  const sentence = useRef<HTMLParagraphElement>(null);
  const [lightName, setLightName] = useState(clock.current.light.name);

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

  useEffect(() => {
    if (fonts !== "wait") clock.start();
  }, [clock, fonts]);

  useEffect(() => () => clock.stop(), [clock]);

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add("kt-page");
    const names = ["--kt-sun", "--kt-sky", "--kt-haze", "--kt-lit", "--kt-shade", "--kt-ink", "--kt-soft", "--kt-accent"];
    const off = clock.subscribe(({ ms, sun, light }) => {
      html.style.setProperty("--kt-sky", light.sky);
      html.style.setProperty("--kt-haze", light.haze);
      html.style.setProperty("--kt-lit", light.lit);
      html.style.setProperty("--kt-shade", light.shade);
      html.style.setProperty("--kt-ink", light.ink);
      html.style.setProperty("--kt-soft", light.soft);
      html.style.setProperty("--kt-accent", light.accent);
      html.style.setProperty("--kt-sun", light.sun);
      html.dataset.ktDark = luminance(light.lit) < 0.2 ? "true" : "false";
      if (time.current) time.current.textContent = clockText(ms);
      if (yours.current) yours.current.textContent = visitorText(ms) ?? "";
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
    };
  }, [clock]);

  const clientShot = narrow ? { ...leadClient.shot, crop: leadClient.narrowCrop } : leadClient.shot;
  const phones = client.filter((r) => shapeOf(r.plate) === "phone");
  const firstPhone = client.findIndex((r) => shapeOf(r.plate) === "phone");

  return (
    <ClockContext value={clock}>
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
                  {!narrow && (
                    <ul className="kt-results">
                      {results.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="kt-clock">
                  <p className="kt-now">
                    <time ref={time} className="kt-hm">
                      {clockText(clock.current.ms)}
                    </time>
                    <span className="kt-where">
                      in Kosovo
                      <span ref={yours} className="kt-yours" />
                    </span>
                  </p>
                  <p ref={sentence} className="kt-sentence" />
                  <Jumps />
                </div>
              </section>
              <SunPath />
            </div>
            <Ground className="kt-stage" sources={narrow ? [clientShot.src] : [clientShot.src, lead.wide.src]} gl fade={64}>
              <div className="kt-leads">
                <LeadPlate shot={clientShot} name={leadClient.name} note={leadClient.note} kind="client" />
                {!narrow && <LeadPlate shot={lead.wide} name={lead.name} note={lead.note} kind="own" />}
              </div>
            </Ground>
          </div>
          {narrow && (
            <ul className="kt-results">
              {results.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          )}

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
            {stacked ? (
              <ol className="kt-rows">
                {concepts.map((c) => (
                  <li key={c.id} className="kt-row" data-shape="wide">
                    <Ground className="kt-row-stage" sources={[c.plate.src]} sides={40}>
                      <ConceptPlate concept={c} />
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
                      <ConceptPlate key={c.id} concept={c} />
                    ))}
                  </div>
                </Ground>
              </div>
            )}
            <ol className="kt-rows">
              {own.map((row) => (
                <WorkRow key={row.id} row={row} />
              ))}
            </ol>
          </section>
        </main>

        <footer className="kt-foot">
          <h2>The light on this page</h2>
          <p className="kt-foot-lede">
            The sun's height and direction come from the SunCalc formulas for Kosovo (42.6° N, 20.9° E), at your clock.
            Every shadow is projected from them, and no text stands where a shadow can fall. Below are the four lights,
            with the contrast of the text in each.
          </p>
          <ul className="kt-lights">
            {anchors.map((a) => {
              const l = lightAt(a.altitude, a.evening);
              const onSky = Math.min(contrast(l.ink, l.sky), contrast(l.ink, l.haze));
              const result = Math.min(contrast(l.accent, l.sky), contrast(l.accent, l.haze), contrast(l.accent, l.lit));
              return (
                <li key={a.label} data-current={a.label === lightName || undefined}>
                  <div
                    className="kt-swatch"
                    style={{ "--s-sky": l.sky, "--s-haze": l.haze, "--s-lit": l.lit, "--s-shade": l.shade, color: l.ink } as CSSProperties}
                  >
                    <strong>{a.label}</strong>
                    <span style={{ color: l.accent }}>Result line</span>
                  </div>
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
        </footer>
      </div>
    </ClockContext>
  );
}
