import {
  createContext,
  use,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { flushSync, preload } from "react-dom";
import { Link as RouterLink, useLocation, useNavigate, useNavigationType } from "react-router";
import { PhonePicture } from "../../components/PhonePicture";
import { links } from "../../content/links";
import { canWalk, inView, wait } from "../../lib/plateWalk";
import { preloadCase } from "../../lib/routes";
import { Clock, cubic, openingHour, type Frame } from "./clock";
import {
  CARD_COLOURS,
  client,
  concepts,
  games,
  leadPhone,
  leadWeb,
  offday,
  screenColours,
  type Card,
  type Concept,
  type Count,
  type Crop,
  type Link,
  type Row,
  type Shot,
} from "./data";
import { luminance } from "./light";
import {
  cameraFor,
  cellsFrom,
  createGround,
  GLOW_LIMIT,
  lowerAverage,
  MAX_PANELS,
  project,
  quarters,
  shadowPoints,
  type Camera,
  type GroundRenderer,
  type Panel,
} from "./scene";
import { clockText, kosovoMinutes, RISE } from "./sun";
import "./kosovo-time-2.css";

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

type Vec = [number, number, number];
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const hex = (rgb: number[]) =>
  "#" +
  rgb
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/** The ground colour in front of a glowing screen, never more than the glow limit above the ground. */
function glowColour(frame: Frame, screen: Vec) {
  const base = frame.light.litLinear;
  const add = screen.map((c) => c * 0.5 * frame.light.glow);
  const lum = 0.2126 * add[0] + 0.7152 * add[1] + 0.0722 * add[2];
  const k = lum > GLOW_LIMIT ? GLOW_LIMIT / lum : 1;
  return hex(base.map((c, i) => c + add[i] * k));
}

const colourOf = (src: string) => screenColours[src] ?? null;

/* ---------- Ground: a lit floor under one or more upright panels. No text stands on it. ---------- */

interface GroundProps {
  /** Unique on the page: a ground that arrived once does not arrive again in the visit. */
  name: string;
  className: string;
  /** Each panel's colours as a 4 x 4 grid of sRGB hex, in panel order. */
  screens: (string | null)[];
  /** Render the floor per pixel when WebGL is there. */
  gl?: boolean;
  /** Fade at the bottom edge, px. */
  fade?: number;
  /** Fade at the left and right edges, px. */
  sides?: number;
  /** "enter": the screens arrive when the ground scrolls into view. "lead": they arrive when the intro ends. */
  arrive?: "enter" | "lead";
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

/** Grounds whose screens arrived in this visit. A return to the page never plays an arrival again. */
const arrived = new Set<string>();
const STAND_MS = 620;
const SWITCH_MS = 420;
const ARRIVE_STAGGER_MS = 90;
/** A screen on view never keeps its "before" state longer than this. */
const ARRIVE_SAFETY_MS = 2000;
const LEAD_BEAT_MS = 160;
/** At the start of a stand-up the shadow has this part of its full reach. */
const STUB = 0.2;
/** The same curve as --k2-out, so the floor keeps step with the screen. */
const out = cubic(0.215, 0.61, 0.355, 1);

interface Arrival {
  kind: "day" | "night";
  amounts: number[];
}

/** The panel's box without its arrival transform, so the floor camera never reads a leaning screen. */
function restingRect(panel: HTMLElement, ground: HTMLElement, box: DOMRect) {
  if (!panel.dataset.arrive) return panel.getBoundingClientRect();
  let x = 0,
    y = 0;
  let node: Element | null = panel;
  while (node instanceof HTMLElement && node !== ground) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent;
  }
  return node === ground ? new DOMRect(box.left + x, box.top + y, panel.offsetWidth, panel.offsetHeight) : panel.getBoundingClientRect();
}

interface SvgNodes {
  shadow: SVGPolygonElement | null;
  glow: SVGEllipseElement | null;
  stop: SVGStopElement | null;
  /** The last glow colour, so an unchanged colour is not written again. */
  last: string;
}

function Ground({ name, className, screens, gl = false, fade = 56, sides = 0, arrive, children }: GroundProps) {
  const clock = useClock();
  const id = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const renderer = useRef<GroundRenderer | null>(null);
  const [mode, setMode] = useState<"svg" | "gl">("svg");
  const [slow, setSlow] = useState(false);
  const view = useRef<{ camera: Camera; panels: Panel[] } | null>(null);
  const key = screens.join("|");
  const lights = useMemo(
    () =>
      screens.map((s) => {
        const cells = s ? cellsFrom(s) : null;
        return {
          quarters: cells ? quarters(cells) : new Array<number>(12).fill(0.8),
          lower: cells ? lowerAverage(cells) : ([0.8, 0.8, 0.8] as Vec),
        };
      }),
    // The key holds every screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );
  const visible = useRef(true);
  const pace = useRef({ last: 0, run: 0 });
  const arrival = useRef<Arrival | null>(null);
  const measureRef = useRef<() => void>(() => undefined);
  /** Reused every frame, so a draw allocates nothing. */
  const drawn = useRef<Panel[]>([]);
  const cellBuffer = useRef(new Float32Array(MAX_PANELS * 12));
  const nodes = useRef<SvgNodes[]>([]);

  const draw = (frame: Frame) => {
    const v = view.current;
    if (!v || !visible.current) return;
    const { sun, light } = frame;
    const a = arrival.current;
    const panels = drawn.current;
    panels.length = v.panels.length;
    for (let i = 0; i < v.panels.length; i++) {
      const p = v.panels[i];
      const d = (panels[i] ??= { x: 0, half: 0, h: 0 });
      d.x = p.x;
      d.half = p.half;
      d.h = a?.kind === "day" ? p.h * (STUB + (1 - STUB) * (a.amounts[i] ?? 1)) : p.h;
    }
    const on = (i: number) => (a?.kind === "night" ? (a.amounts[i] ?? 1) : 1);
    if (renderer.current) {
      const now = performance.now();
      const gap = now - pace.current.last;
      pace.current.last = now;
      pace.current.run = gap > SLOW_FRAME_MS && gap < 400 ? pace.current.run + 1 : 0;
      if (pace.current.run >= SLOW_RUN) {
        setSlow(true);
        return;
      }
      const cells = cellBuffer.current;
      for (let i = 0; i < panels.length && i < MAX_PANELS; i++) {
        const q = lights[i]?.quarters;
        const k = on(i);
        for (let j = 0; j < 12; j++) cells[i * 12 + j] = (q ? q[j] : 0.8) * k;
      }
      renderer.current.draw({
        camera: v.camera,
        panels,
        ray: sun.ray,
        direct: light.direct,
        glow: light.glow * GL_GLOW,
        lit: light.litLinear,
        shade: light.shadeLinear,
        cells,
        fade,
      });
      return;
    }
    const direct = light.direct.toFixed(3);
    const lit = light.glow > 0.004;
    panels.forEach((panel, i) => {
      const n = nodes.current[i];
      if (!n) return;
      if (n.shadow) {
        n.shadow.setAttribute("points", shadowPoints(v.camera, panel, sun.ray));
        n.shadow.style.opacity = direct;
      }
      if (n.glow && n.stop) {
        if (lit) {
          const colour = glowColour(frame, lights[i]?.lower ?? [0.8, 0.8, 0.8]);
          if (colour !== n.last) {
            n.stop.setAttribute("stop-color", colour);
            n.last = colour;
          }
        }
        n.glow.style.opacity = lit ? on(i).toFixed(3) : "0";
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
    canvas.className = "k2-floor";
    canvas.setAttribute("aria-hidden", "true");
    let made: GroundRenderer | null = null;
    const begin = async () => {
      made = await createGround(canvas, () => {
        renderer.current = null;
        canvas.remove();
        setMode("svg");
      });
      if (!made) return;
      if (cancelled) {
        made.dispose();
        return;
      }
      host.prepend(canvas);
      renderer.current = made;
      pace.current = { last: 0, run: 0 };
      // A new canvas is black until its first draw, so it draws before the next paint.
      measureRef.current();
      setMode("gl");
    };
    const idle = "requestIdleCallback" in window;
    let handle = 0;
    let cancelled = false;
    // The shader compiles after the intro and the arrival, so a slow GPU holds back neither.
    void clock.ready
      .then(afterFirstPaint)
      .then(() => wait(STAND_MS + 200))
      .then(() => {
        if (cancelled) return;
        const start = () => void begin();
        handle = idle ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 400);
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
      const panels = [...element.querySelectorAll<HTMLElement>("[data-k2-panel]")].map((p) => restingRect(p, element, rect));
      if (!panels.length || rect.width < 2 || panels.some((p) => p.height < 2)) return;
      const made = cameraFor(rect, panels);
      view.current = made;
      renderer.current?.resize(rect.width, rect.height);
      const root = svg.current;
      if (root) {
        nodes.current = made.panels.map((_, i) => ({
          shadow: root.querySelector<SVGPolygonElement>(`[data-shadow="${i}"]`),
          glow: root.querySelector<SVGEllipseElement>(`[data-glow="${i}"]`),
          stop: root.querySelector<SVGStopElement>(`[data-glow-stop="${i}"]`),
          last: "",
        }));
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
    measureRef.current = measure;
    const resize = new ResizeObserver(measure);
    resize.observe(element);
    element.querySelectorAll("[data-k2-panel]").forEach((p) => resize.observe(p));
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

  useEffect(() => {
    const element = box.current;
    if (!arrive || !element || arrived.has(name)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const panels = [...element.querySelectorAll<HTMLElement>("[data-k2-panel]")];
    if (!panels.length) return;
    let state: "idle" | "before" | "run" | "done" = "idle";
    let safety = 0;
    let beat = 0;
    let frame = 0;
    const settle = () => {
      for (const p of panels) {
        delete p.dataset.arrive;
        delete p.dataset.arriveKind;
      }
      arrival.current = null;
      measureRef.current();
    };
    const run = () => {
      if (state !== "before" || !arrival.current) return;
      state = "run";
      window.clearTimeout(safety);
      const a = arrival.current;
      const ms = a.kind === "day" ? STAND_MS : SWITCH_MS;
      let start = 0;
      const step = (time: number) => {
        start ||= time;
        let busy = false;
        panels.forEach((p, i) => {
          const t = time - start - i * ARRIVE_STAGGER_MS;
          if (t >= 0 && p.dataset.arrive !== "run") p.dataset.arrive = "run";
          a.amounts[i] = out(Math.min(1, Math.max(0, t / ms)));
          // The CSS transition starts on the frame the attribute changes, so it ends up to a frame after this tween.
          if (t < ms + 80) busy = true;
        });
        drawRef.current(clock.current);
        if (busy) frame = requestAnimationFrame(step);
        else {
          state = "done";
          arrived.add(name);
          settle();
        }
      };
      frame = requestAnimationFrame(step);
    };
    const check = () => {
      if (state !== "before") return;
      const r = element.getBoundingClientRect();
      if (arrive === "lead" || (r.top < window.innerHeight && r.bottom > 0)) run();
      else safety = window.setTimeout(check, ARRIVE_SAFETY_MS);
    };
    const prep = () => {
      // The pictures decode while the ground is still under the screen, so the stand-up never waits for one.
      if (arrive === "enter")
        for (const image of element.querySelectorAll("img")) {
          image.loading = "eager";
          void image.decode().catch(() => undefined);
        }
      const light = arrive === "lead" ? clock.settledLight() : clock.current.light;
      const kind = light.direct > 0.05 ? "day" : "night";
      arrival.current = { kind, amounts: panels.map(() => 0) };
      for (const p of panels) {
        p.dataset.arrive = "before";
        p.dataset.arriveKind = kind;
      }
      state = "before";
      drawRef.current(clock.current);
      safety = window.setTimeout(check, ARRIVE_SAFETY_MS);
    };
    const watchers: IntersectionObserver[] = [];
    if (arrive === "lead") {
      // The page is still hidden behind the font wait here, so the "before" state is never seen to switch on.
      prep();
      void clock.ready.then(() => {
        if (state === "before") beat = window.setTimeout(run, LEAD_BEAT_MS);
      });
    } else {
      // Only a ground still below the screen takes the "before" state; one already on view stays complete.
      const near = new IntersectionObserver(
        ([e]) => {
          if (state === "idle" && e.isIntersecting && e.boundingClientRect.top >= window.innerHeight) prep();
        },
        { rootMargin: "0px 0px 25% 0px" },
      );
      const inSight = new IntersectionObserver(
        ([e]) => {
          if (state === "before" && e.isIntersecting && e.intersectionRatio >= 0.29) run();
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.3 },
      );
      near.observe(element);
      inSight.observe(element);
      watchers.push(near, inSight);
    }
    return () => {
      for (const w of watchers) w.disconnect();
      window.clearTimeout(safety);
      window.clearTimeout(beat);
      cancelAnimationFrame(frame);
      if (state === "before" || state === "run") settle();
    };
  }, [arrive, clock, name]);

  return (
    <div className={`k2-ground ${className}`} ref={box} data-floor={mode}>
      {mode === "svg" && (
        <svg ref={svg} className="k2-floor" aria-hidden="true" preserveAspectRatio="none">
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
            {screens.map((_, i) => (
              <radialGradient key={i} id={`${id}-glow-${i}`}>
                <stop offset="0" data-glow-stop={i} stopColor="var(--k2-lit)" />
                <stop offset="1" stopColor="var(--k2-lit)" stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          <g mask={`url(#${id}-mask)`}>
            <g mask={sides ? `url(#${id}-across)` : undefined}>
              {screens.map((_, i) => (
                <g key={i}>
                  <ellipse data-glow={i} fill={`url(#${id}-glow-${i})`} style={{ opacity: 0 }} />
                  <ellipse data-ao={i} className="k2-ao" filter={`url(#${id}-ao)`} />
                  <polygon data-shadow={i} className="k2-shadow" filter={`url(#${id}-soft)`} clipPath={sides ? `url(#${id}-front)` : undefined} />
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

/* ---------- The sun line: today's sun over Kosovo, and the one control that moves the hour ---------- */

const PATH_W = 1000;
const PATH_H = 100;
/** The horizon sits this far down the line's box. */
const HORIZON = 74;
/** A touch must move this far, mostly sideways, before it moves the sun. A vertical move scrolls the page. */
const INTENT_PX = 8;
/** A tap moves the sun only when it lands this close to the path or the disc. */
const TAP_REACH = 24;
/** The time stands left of the disc when the disc is this close to the right edge, in label widths. */
const EDGE_ROOM = 1.15;

function SunLine() {
  const clock = useClock();
  const track = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);
  const spot = useRef({ x: 0.5, y: 0.5 });
  /** Layout reads, made only on a resize or a font load. A sun move changes transforms and words of a fixed width. */
  const geometry = useRef({ width: 1, label: 120 });
  const side = useRef<"right" | "left">("right");
  const said = useRef({ minute: -1, altitude: 999 });
  const drag = useRef<{ id: number; x: number; t: number; v: number } | null>(null);
  const press = useRef<{ id: number; x: number; y: number } | null>(null);
  const day = clock.day;
  const top = Math.max(...day.path);
  const bottom = Math.min(...day.path);
  const up = (HORIZON - 14) / Math.max(10, top);
  const down = (PATH_H - HORIZON - 8) / Math.max(10, -bottom);
  const yOf = (a: number) => HORIZON - (a > 0 ? a * up : a * down);

  const placeLabel = () => {
    const node = dot.current;
    if (!node) return;
    const { width, label } = geometry.current;
    const want = spot.current.x * width + label * EDGE_ROOM > width ? "left" : "right";
    if (want !== side.current) {
      side.current = want;
      node.dataset.side = want;
    }
  };

  useLayoutEffect(() => {
    const measure = () => {
      const el = track.current;
      const label = dot.current?.querySelector<HTMLElement>(".k2-sun-time");
      if (!el || !label) return;
      geometry.current = {
        width: el.clientWidth,
        label: label.offsetWidth + 20,
      };
      placeLabel();
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (track.current) observer.observe(track.current);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
    // placeLabel reads only refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(
    () =>
      clock.subscribe((f) => {
        const m = Math.max(0, Math.min(1440, (f.ms - day.midnight) / 60000));
        const node = dot.current;
        if (node) {
          const x = m / 1440;
          const y = yOf(f.sun.altitude) / PATH_H;
          node.style.setProperty("--x", `${(x * 100).toFixed(3)}%`);
          node.style.setProperty("--y", `${(y * 100).toFixed(3)}%`);
          spot.current = { x, y };
          const below = String(f.sun.altitude < RISE);
          if (node.dataset.below !== below) node.dataset.below = below;
          placeLabel();
        }
        // The words change once a minute at most, outside React, so a drag never renders a component.
        const whole = Math.floor(kosovoMinutes(f.ms));
        const a = Math.round(f.sun.altitude);
        if (whole !== said.current.minute || a !== said.current.altitude) {
          said.current = { minute: whole, altitude: a };
          const text = clockText(f.ms);
          if (time.current) time.current.textContent = text;
          const el = track.current;
          if (el) {
            el.setAttribute("aria-valuenow", String(whole));
            el.setAttribute("aria-valuetext", `${text} in Kosovo, sun ${Math.abs(a)}° ${a < RISE ? "below" : "above"} the horizon`);
          }
        }
      }),
    // yOf only reads the day, which is in the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [clock, day],
  );

  const curve = useMemo(
    () => day.path.map((a, i) => `${i ? "L" : "M"}${((i / 144) * PATH_W).toFixed(1)} ${yOf(a).toFixed(1)}`).join(" "),
    // yOf only reads the day.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [day],
  );
  /** The track's left edge, read once when a drag begins; a drag moves no layout. */
  const left = useRef(0);
  const toMs = (clientX: number) => {
    const f = Math.min(1, Math.max(0, (clientX - left.current) / geometry.current.width));
    return day.midnight + f * 1439 * 60000;
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
    left.current = track.current!.getBoundingClientRect().left;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus({ preventScroll: true });
    drag.current = {
      id: event.pointerId,
      x: event.clientX,
      t: performance.now(),
      v: 0,
    };
    event.currentTarget.dataset.drag = "";
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
    const v = (((event.clientX - d.x) / geometry.current.width) * 1439 * 60000 * 1000) / dt;
    d.v = d.v * 0.6 + v * 0.4;
    d.x = event.clientX;
    d.t = now;
    clock.set(toMs(event.clientX));
  };
  const onUp = (event: PointerEvent<HTMLDivElement>) => {
    const p = press.current;
    if (p && p.id === event.pointerId) {
      press.current = null;
      if (event.type === "pointerup" && onPath(event.clientX, event.clientY)) clock.set(toMs(event.clientX));
      return;
    }
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    delete event.currentTarget.dataset.drag;
    // A flick coasts at most one hour past the release point, so the hour a visitor aims at stays near.
    const fresh = performance.now() - d.t < 50;
    if (fresh && d.v !== 0) {
      const coast = Math.max(-3600000, Math.min(3600000, d.v * 0.06));
      clock.set(clock.target + coast, {
        velocity: Math.sign(d.v) * Math.min(Math.abs(d.v), 3600000 * 8),
      });
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
    clock.set(moves[event.key], { instant: true });
  };

  return (
    <div
      ref={track}
      className="k2-sun"
      role="slider"
      tabIndex={0}
      aria-label="Time in Kosovo today. The page shows the light of this hour."
      aria-valuemin={0}
      aria-valuemax={1439}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onKeyDown={onKey}
      onBlur={(event) => delete event.currentTarget.dataset.pointer}
    >
      <svg viewBox={`0 0 ${PATH_W} ${PATH_H}`} preserveAspectRatio="none" aria-hidden="true">
        <path className="k2-sun-path" d={curve} vectorEffect="non-scaling-stroke" />
      </svg>
      <span ref={dot} className="k2-sun-dot" data-side="right" aria-hidden="true">
        <span className="k2-sun-disc" />
        <span className="k2-sun-time">
          <span ref={time} className="k2-sun-hm">
            {clockText(clock.current.ms)}
          </span>{" "}
          in Kosovo
        </span>
      </span>
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
    <PhonePicture src={shot.src}>
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
    </PhonePicture>
  );
}

const cropOf = (shot: Shot, narrow: boolean) => (narrow && shot.narrowCrop) || shot.crop;
/** The plate's shape, from the crop it shows on a wide screen. */
const shapeOf = (shot: Shot) => {
  const c = shot.crop ?? { w: shot.width, h: shot.height };
  return c.h > c.w ? "phone" : "wide";
};

const pictureOf = (element: Element | null) => {
  const src = element?.querySelector("img")?.getAttribute("src");
  return src ? new URL(src, location.href).pathname : null;
};

/** The case page's screen that shows the pressed picture, if one is on view after the route change.
 * It waits a short time for that picture only, so a fade never waits for a picture it does not show. */
async function sameScreen(picture: string | null) {
  if (!picture) return null;
  for (const screen of document.querySelectorAll<HTMLElement>(".cs [data-cs-screen]")) {
    if (pictureOf(screen) !== picture || !inView(screen)) continue;
    const image = screen.querySelector("img");
    if (image && !image.complete) {
      image.loading = "eager";
      await Promise.race([image.decode().catch(() => undefined), wait(250)]);
    }
    return screen;
  }
  return null;
}

/** The slug's plate that was pressed last, so a return from the case walks back into that plate. */
const pressed = new Map<string, "lead" | "row">();

let moving = false;
/**
 * A plain click opens the case with a view transition. When the case's first view shows the same picture,
 * the pressed plate walks into it. Otherwise the page fades, so a picture never turns into another one.
 */
function handoff(event: MouseEvent<HTMLAnchorElement>, slug: string, from: Element | null, go: () => void) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !canWalk()) return;
  if (!inView(from)) return;
  event.preventDefault();
  pressed.set(slug, from.classList.contains("k2-lead") ? "lead" : "row");
  const late = wait(1000).then(() => Promise.reject(new Error("late")));
  void Promise.race([preloadCase(slug), late]).then(
    () => move(slug, from, go),
    () => go(),
  );
}

function move(slug: string, from: HTMLElement, go: () => void) {
  if (moving) return;
  moving = true;
  const name = `plate-${slug}`;
  const html = document.documentElement;
  const picture = pictureOf(from);
  let to: HTMLElement | null = null;
  if (picture) {
    from.style.viewTransitionName = name;
    html.dataset.walk = "";
  } else html.dataset.k2Fade = "";
  const transition = document.startViewTransition(async () => {
    from.style.viewTransitionName = "";
    flushSync(go);
    to = await sameScreen(picture);
    if (to) to.style.viewTransitionName = name;
    else if (picture) {
      delete html.dataset.walk;
      html.dataset.k2Fade = "";
    }
  });
  transition.ready.catch(() => undefined);
  void transition.finished
    .catch(() => undefined)
    .then(() => {
      moving = false;
      delete html.dataset.walk;
      delete html.dataset.k2Fade;
      if (to) to.style.viewTransitionName = "";
    });
}

/** The case page's code starts to load when a pointer or the focus reaches its link, so the walk can start at the click. */
const warmed = new Set<string>();
function warm(slug: string | undefined) {
  if (!slug || warmed.has(slug)) return;
  warmed.add(slug);
  void preloadCase(slug).catch(() => warmed.delete(slug));
}
const warmProps = (slug: string | undefined) => ({
  onPointerEnter: () => warm(slug),
  onPointerDown: () => warm(slug),
  onFocus: () => warm(slug),
});

function useOpen(slug: string | undefined) {
  const navigate = useNavigate();
  return (event: MouseEvent<HTMLAnchorElement>, from: Element | null) => {
    if (slug) handoff(event, slug, from, () => navigate(`/work/${slug}`));
  };
}

/** The plate is a link. It is out of the tab order, because the row's "Read the case" link goes to the same page. */
function Plate({ shot, slug, href }: { shot: Shot; slug?: string; href?: string }) {
  const narrow = use(NarrowContext);
  const shape = shapeOf(shot);
  // A phone screen keeps its own shape on a phone too: it stands beside the words as a whole screen.
  const crop = cropOf(shot, narrow && shape === "wide");
  const open = useOpen(slug);
  const style = crop ? { aspectRatio: `${crop.w} / ${crop.h}` } : undefined;
  const first = colourOf(shot.src);
  const inner = (
    <span className="k2-press" style={first ? { background: `#${first.slice(0, 6)}` } : undefined}>
      <ShotImage shot={shot} crop={crop} />
    </span>
  );
  if (slug)
    return (
      <RouterLink
        className="k2-plate"
        data-k2-panel
        data-shape={shape}
        data-plate={pressed.get(slug) === "lead" ? undefined : slug}
        style={style}
        to={`/work/${slug}`}
        {...warmProps(slug)}
        tabIndex={-1}
        onClick={(event) => open(event, event.currentTarget)}
      >
        {inner}
      </RouterLink>
    );
  if (href)
    return (
      <a className="k2-plate" data-k2-panel data-shape={shape} style={style} href={href} target="_blank" rel="noreferrer" tabIndex={-1}>
        {inner}
      </a>
    );
  return (
    <figure className="k2-plate" data-k2-panel data-shape={shape} data-still style={style}>
      {inner}
    </figure>
  );
}

/**
 * Plays an explaining figure once, when it comes into view. The default markup is the complete figure:
 * under reduced motion, without IntersectionObserver, or for a figure already in view at load, nothing moves.
 */
/** Longer than the longest figure play (0.87 s). */
const PLAY_MS = 1200;

function usePlayOnce<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    node.dataset.play = "before";
    let done = 0;
    const watch = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          watch.disconnect();
          node.dataset.play = "run";
          // The figure drops its layers when the play is over.
          done = window.setTimeout(() => delete node.dataset.play, PLAY_MS);
        } else if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          // Scrolled past before it played: it stays complete for the way back up.
          watch.disconnect();
          delete node.dataset.play;
        }
      },
      { threshold: [0, 0.45] },
    );
    watch.observe(node);
    return () => {
      watch.disconnect();
      window.clearTimeout(done);
      delete node.dataset.play;
    };
  }, []);
  return ref;
}

/** The work loop on a white card that stands on the ground like a screen. It opens the case that draws the loop. */
/** `brief`: the title and the link only, for a second card on a phone, where the first card already drew a loop. */
function WorkCard({ card, brief = false }: { card: Card; brief?: boolean }) {
  const open = useOpen(card.slug);
  const play = usePlayOnce<HTMLOListElement>();
  const { back } = card;
  return (
    <RouterLink className="k2-card" data-k2-panel to={`/work/${card.slug}`} {...warmProps(card.slug)} onClick={(event) => open(event, event.currentTarget)}>
      <span className="k2-press">
        <span className="k2-card-kicker">How it is built</span>
        <span className="k2-card-title">{card.title}</span>
        {!brief && (
          <>
            <ol
              ref={play}
              className="k2-loop"
              style={
                {
                  "--n": card.steps.length,
                  "--from": back.from,
                  "--to": back.to,
                } as CSSProperties
              }
            >
              {card.steps.map((step, i) => (
                <li
                  key={step.name}
                  data-person={step.person || undefined}
                  data-last={i === card.steps.length - 1 || undefined}
                  style={{ "--i": i } as CSSProperties}
                >
                  <span className="k2-loop-name">{step.name}</span>
                  <span className="k2-loop-note">{step.note}</span>
                </li>
              ))}
              <li className="k2-loop-back" aria-hidden="true" />
            </ol>
            <span className="k2-loop-label">
              <span className="k2-sr">
                From step {back.from + 1} back to step {back.to + 1}:{" "}
              </span>
              {back.label}
            </span>
          </>
        )}
        <span className="k2-card-end">
          {!brief && card.proof && <span className="k2-card-proof">{card.proof}</span>}
          <span className="k2-card-go">
            Read how<span className="k2-sr">: {card.label}</span>
            {"\u00a0→"}
          </span>
        </span>
      </span>
    </RouterLink>
  );
}

/** A count before and after: one mark for each, and the marks that went away stay as faint stubs. */
function Marks({ count }: { count: Count }) {
  const play = usePlayOnce<HTMLElement>();
  return (
    <figure className="k2-marks" ref={play}>
      <span className="k2-marks-row" aria-hidden="true">
        {Array.from({ length: count.from }, (_, i) => (
          <span key={i} data-gone={i >= count.to || undefined} style={{ "--i": count.from - 1 - i } as CSSProperties} />
        ))}
      </span>
      <figcaption>
        <strong>
          {count.from}
          {"\u2009→\u2009"}
          {count.to}
        </strong>{" "}
        {count.label}
      </figcaption>
    </figure>
  );
}

function CaseLink({ row }: { row: Row }) {
  const open = useOpen(row.slug);
  if (!row.slug) return null;
  return (
    <RouterLink
      className="k2-case"
      to={`/work/${row.slug}`}
      {...warmProps(row.slug)}
      onClick={(event) => open(event, event.currentTarget.closest(".k2-row, .k2-trio")?.querySelector(`.k2-plate[href="/work/${row.slug}"]`) ?? null)}
    >
      Read the case<span className="k2-sr">: {row.name}</span>
      {" →"}
    </RouterLink>
  );
}

function Links({ items }: { items: Link[] }) {
  if (!items.length) return null;
  return (
    <>
      {items.map((l) => (
        <li key={l.href}>
          <a href={l.href} target="_blank" rel="noreferrer">
            {l.label}
            <span className="k2-out" aria-hidden="true">
              <svg viewBox="0 0 12 12" width="12" height="12">
                <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </span>
            <span className="k2-sr"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </>
  );
}

/** The case link and the outside links share one line, so a row ends in one or two lines of links. */
function GoLinks({ row, items }: { row?: Row; items: Link[] }) {
  if (!row?.slug && !items.length) return null;
  return (
    <ul className="k2-links">
      {row?.slug && (
        <li>
          <CaseLink row={row} />
        </li>
      )}
      <Links items={items} />
    </ul>
  );
}

function RowText({ row }: { row: Row }) {
  return (
    <div className="k2-row-text">
      <div className="k2-row-head">
        <h3>{row.name}</h3>
        <p className="k2-row-line">{row.line}</p>
        <p className="k2-row-result">{row.result}</p>
      </div>
      <div className="k2-row-meta">
        {row.count && <Marks count={row.count} />}
        <p className="k2-row-role">
          {row.role} · {row.years}
          {row.note && (
            <>
              <br />
              <span className="k2-row-note">{row.note}</span>
            </>
          )}
        </p>
        <GoLinks row={row} items={row.links} />
      </div>
    </div>
  );
}

/** A row with a work card: the words first, then the screen and the card on one ground. On a phone the card gets its own ground. */
function CardRow({ row, card }: { row: Row; card: Card }) {
  const narrow = use(NarrowContext);
  return (
    <li className="k2-row" data-card>
      <RowText row={row} />
      {narrow ? (
        <>
          <Ground name={`${row.id}-plate`} className="k2-row-stage" screens={[colourOf(row.plate.src)]} sides={32} arrive="enter">
            <Plate shot={row.plate} slug={row.slug} />
          </Ground>
          <Ground name={`${row.id}-card`} className="k2-row-stage k2-card-stage" screens={[CARD_COLOURS]} sides={32} arrive="enter">
            <WorkCard card={card} brief={row !== firstCardRow} />
          </Ground>
        </>
      ) : (
        <Ground name={row.id} className="k2-row-stage" screens={[colourOf(row.plate.src), CARD_COLOURS]} sides={48} arrive="enter">
          <div className="k2-pair-slots" data-card>
            <Plate shot={row.plate} slug={row.slug} />
            <WorkCard card={card} />
          </div>
        </Ground>
      )}
    </li>
  );
}

function WorkRow({ row }: { row: Row }) {
  if (row.card) return <CardRow row={row} card={row.card} />;
  return (
    <li className="k2-row" data-shape={shapeOf(row.plate)} data-small={row.small || undefined}>
      <Ground name={row.id} className="k2-row-stage" screens={[colourOf(row.plate.src)]} sides={40} arrive="enter">
        <Plate shot={row.plate} slug={row.slug} />
      </Ground>
      <RowText row={row} />
    </li>
  );
}

/** Phone apps side by side on one ground, each with its words under it. Wide screens only. */
function PhoneTrio({ rows }: { rows: Row[] }) {
  return (
    <li className="k2-trio" style={{ "--n": rows.length } as CSSProperties}>
      <Ground name="phones" className="k2-trio-ground" screens={rows.map((r) => colourOf(r.plate.src))} sides={48} arrive="enter">
        <div className="k2-trio-slots">
          {rows.map((r) => (
            <div key={r.id} className="k2-trio-slot">
              <Plate shot={r.plate} slug={r.slug} />
            </div>
          ))}
        </div>
      </Ground>
      <div className="k2-trio-text">
        {rows.map((r) => (
          <RowText key={r.id} row={r} />
        ))}
      </div>
    </li>
  );
}

function ConceptText({ concept: c }: { concept: Concept }) {
  return (
    <div className="k2-concept-text">
      <h3>
        {c.name} <span className="k2-tag">Concept</span>
      </h3>
      <p className="k2-row-line">{c.line}</p>
      <p className="k2-row-result">{c.result}</p>
      <GoLinks items={c.links} />
    </div>
  );
}

/** The first screen's plates carry their own title bar, so their labels never stand on the floor. */
function LeadPlate({ shot, name, note, short, slug, kind }: { shot: Shot; name: string; note: string; short?: string; slug: string; kind: string }) {
  const narrow = use(NarrowContext);
  const crop = cropOf(shot, narrow);
  const open = useOpen(slug);
  return (
    <RouterLink
      className="k2-lead"
      data-k2-panel
      data-kind={kind}
      data-plate={pressed.get(slug) === "lead" ? slug : undefined}
      to={`/work/${slug}`}
      {...warmProps(slug)}
      onClick={(event) => open(event, event.currentTarget)}
    >
      <span className="k2-press">
        <span className="k2-bar">
          <strong>{name}</strong>
          <span>{narrow && short ? short : note}</span>
          <span className="k2-bar-go" aria-hidden="true">
            →
          </span>
          <span className="k2-sr">: read the case</span>
        </span>
        <span className="k2-lead-shot" style={crop ? { aspectRatio: `${crop.w} / ${crop.h}` } : undefined}>
          <ShotImage shot={shot} crop={crop} eager />
        </span>
      </span>
    </RouterLink>
  );
}

/* ---------- Page ---------- */

/** False after the first visit in this tab, so a return to the page never replays the intro. */
let openedBefore = false;
const RETURN_Y = "k2-y";
/** The parts that take the light on every frame while they are on or near the screen. */
/** The page-wide light waits this long after the last moving frame. The stand-up starts later (LEAD_BEAT_MS). */
const REST_MS = 60;
const LIT_PARTS = ".k2-top, .k2-first, .k2-band, .k2-rows > li, .k2-games, .k2-foot";
const phoneRows = client.filter((row) => shapeOf(row.plate) === "phone");
const firstCardRow = client.find((row) => row.card);
/** A load or a reload of the page itself takes too long for the intro on this device: the page opens at the hour. */
const SLOW_LOAD_MS = 2000;

/** True when the visitor comes back from another page of this visit, not on a new load or a reload of this page. */
function returning() {
  if (openedBefore || window.location.hash === "#work") return true;
  try {
    const entry = performance.getEntriesByType("navigation")[0];
    return entry ? new URL(entry.name).pathname !== window.location.pathname : false;
  } catch {
    return false;
  }
}

export default function Draft() {
  const location = useLocation();
  const navigation = useNavigationType();
  preload(FRAUNCES, {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  preload(PUBLIC_SANS, {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const narrow = useMedia("(max-width: 639px)");
  const stacked = useMedia("(max-width: 1023px)");
  const [{ clock, lead }] = useState(() => {
    const back = returning();
    const { minutes, chosen } = openingHour(back);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fresh = !back && !window.location.hash && !still;
    return { clock: new Clock(minutes, fresh && !chosen), lead: fresh };
  });
  const [fonts, setFonts] = useState<"wait" | "real" | "fallback">("wait");
  const settled = fonts !== "wait";
  const rootRef = useRef<HTMLDivElement>(null);

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
    let moved = false;
    const onScroll = () => {
      moved = true;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      // A StrictMode re-run unmounts before any scroll. It must not replace the saved landing point with 0.
      if (!moved) return;
      try {
        sessionStorage.setItem(key, String(Math.round(window.scrollY)));
      } catch {
        // Without storage, Back opens the page at the top.
      }
    };
  }, [location.key]);

  useLayoutEffect(() => {
    const html = document.documentElement;
    html.classList.add("k2-page");
    const names = ["--k2-sun", "--k2-sky", "--k2-mid", "--k2-haze", "--k2-lit", "--k2-shade", "--k2-ink", "--k2-soft", "--k2-accent"];
    const chrome = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const chromeBefore = chrome?.content;
    const root = rootRef.current;
    const global: Record<string, string> = {};
    /** Parts on or near the screen, and the light each part was last given. */
    const shown = new Map<HTMLElement, Record<string, string>>();
    const parts = root ? [...root.querySelectorAll<HTMLElement>(LIT_PARTS)] : [];
    const watch = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const part = e.target as HTMLElement;
          if (e.isIntersecting) {
            if (!shown.has(part)) shown.set(part, {});
          } else if (shown.has(part)) {
            shown.delete(part);
            for (const name of names) part.style.removeProperty(name);
          }
        }
      },
      { rootMargin: "25% 0px" },
    );
    for (const part of parts) watch.observe(part);
    let started = false;
    let rest = 0;
    let lastLit = "";
    const put = (target: HTMLElement, seen: Record<string, string>, name: string, value: string) => {
      if (seen[name] === value) return;
      seen[name] = value;
      target.style.setProperty(name, value);
    };
    const write = (target: HTMLElement, seen: Record<string, string>, light: Frame["light"]) => {
      put(target, seen, "--k2-sky", light.sky);
      put(target, seen, "--k2-mid", light.mid);
      put(target, seen, "--k2-haze", light.haze);
      put(target, seen, "--k2-lit", light.lit);
      put(target, seen, "--k2-shade", light.shade);
      put(target, seen, "--k2-ink", light.ink);
      put(target, seen, "--k2-soft", light.soft);
      put(target, seen, "--k2-accent", light.accent);
      put(target, seen, "--k2-sun", light.sun);
    };
    // While the sun moves, only the parts on or near the screen take the light, and the page ground takes it
    // as a plain background (not inherited, so it restyles one element). The whole page takes it when the hour rests.
    const off = clock.subscribe(({ light, ms }) => {
      if (lastLit !== light.lit) {
        lastLit = light.lit;
        html.style.backgroundColor = light.lit;
        if (root) root.style.backgroundColor = light.lit;
      }
      window.clearTimeout(rest);
      if (started && ms !== clock.target) {
        for (const [part, seen] of shown) write(part, seen, light);
        return;
      }
      if (started) {
        // The whole page restyles once, in a frame of its own after the last moving frame.
        for (const [part, seen] of shown) write(part, seen, light);
        rest = window.setTimeout(() => settle(light), REST_MS);
        return;
      }
      started = true;
      settle(light);
    });
    function settle(light: Frame["light"]) {
      write(html, global, light);
      for (const [part, seen] of shown) {
        for (const name of names) part.style.removeProperty(name);
        for (const name of Object.keys(seen)) delete seen[name];
      }
      const dark = luminance(light.lit) < 0.2 ? "true" : "false";
      if (html.dataset.k2Dark !== dark) html.dataset.k2Dark = dark;
      if (chrome && chrome.content !== light.sky) chrome.content = light.sky;
    }
    return () => {
      off();
      window.clearTimeout(rest);
      watch.disconnect();
      html.classList.remove("k2-page");
      html.style.removeProperty("background-color");
      for (const name of names) {
        html.style.removeProperty(name);
        for (const part of parts) part.style.removeProperty(name);
      }
      delete html.dataset.k2Dark;
      if (chrome && chromeBefore) chrome.content = chromeBefore;
    };
  }, [clock]);

  const leadArrive = lead ? "lead" : undefined;

  return (
    <ClockContext value={clock}>
      <NarrowContext value={narrow}>
        <div className="k2" ref={rootRef} data-fonts={fonts} data-reduced={reduced || undefined}>
          <title>{location.pathname === "/" ? "Gentrit Rashiti — web, mobile & full stack" : "Gentrit Rashiti — web and mobile apps, from Kosovo"}</title>
          <header className="k2-top">
            <a className="k2-name" href="#top">
              Gentrit Rashiti
            </a>
            <nav aria-label="Contact">
              <a href="#work">Work</a>
              <a href={links.github} target="_blank" rel="noreferrer">
                GitHub<span className="k2-sr"> (opens in a new tab)</span>
              </a>
              <a href={`mailto:${links.email}`}>Email</a>
              <a href={links.cv}>CV</a>
            </nav>
          </header>

          <main>
            <div className="k2-first">
              <div className="k2-sky">
                <section className="k2-hero" id="top" aria-labelledby="k2-id">
                  <h1 id="k2-id">Gentrit Rashiti builds web and mobile apps, from Kosovo.</h1>
                  <p>5+ years. Part of two platform rewrites. Working remotely.</p>
                </section>
                <SunLine />
              </div>
              {narrow ? (
                <>
                  <Ground name="lead-web" className="k2-stage" screens={[colourOf(leadWeb.shot.src)]} gl fade={48} arrive={leadArrive}>
                    <div className="k2-leads">
                      <LeadPlate {...leadWeb} kind="web" />
                    </div>
                  </Ground>
                  <Ground name="lead-phone" className="k2-stage k2-stage-phone" screens={[colourOf(leadPhone.shot.src)]} fade={48} arrive="enter">
                    <div className="k2-leads">
                      <LeadPlate {...leadPhone} kind="phone" />
                    </div>
                  </Ground>
                </>
              ) : (
                <Ground name="lead" className="k2-stage" screens={[colourOf(leadWeb.shot.src), colourOf(leadPhone.shot.src)]} gl fade={64} arrive={leadArrive}>
                  <div className="k2-leads">
                    <LeadPlate {...leadWeb} kind="web" />
                    <LeadPlate {...leadPhone} kind="phone" />
                  </div>
                </Ground>
              )}
            </div>

            <section className="k2-section" id="work" aria-labelledby="k2-client">
              <div className="k2-band">
                <h2 id="k2-client">Client work</h2>
              </div>
              <ol className="k2-rows">
                {client.map((row) => {
                  if (stacked || shapeOf(row.plate) !== "phone") return <WorkRow key={row.id} row={row} />;
                  if (row !== phoneRows[0]) return null;
                  return <PhoneTrio key="phones" rows={phoneRows} />;
                })}
              </ol>
            </section>

            <section className="k2-section" aria-labelledby="k2-own">
              <div className="k2-band">
                <h2 id="k2-own">Own projects</h2>
              </div>
              <ol className="k2-rows">
                <WorkRow row={offday} />
                {stacked ? (
                  concepts.map((c) => (
                    <li key={c.id} className="k2-row" data-shape={narrow && c.plate.narrowCrop ? "phone" : "wide"}>
                      <Ground name={c.id} className="k2-row-stage" screens={[colourOf(c.plate.src)]} sides={40} arrive="enter">
                        <Plate shot={c.plate} href={c.links[0]?.href} />
                      </Ground>
                      <ConceptText concept={c} />
                    </li>
                  ))
                ) : (
                  <li className="k2-pair">
                    <div className="k2-pair-text">
                      {concepts.map((c) => (
                        <ConceptText key={c.id} concept={c} />
                      ))}
                    </div>
                    <Ground name="concepts" className="k2-pair-ground" screens={concepts.map((c) => colourOf(c.plate.src))} sides={48} arrive="enter">
                      <div className="k2-pair-slots">
                        {concepts.map((c) => (
                          <Plate key={c.id} shot={c.plate} href={c.links[0]?.href} />
                        ))}
                      </div>
                    </Ground>
                  </li>
                )}
              </ol>
              <div className="k2-games">
                <h3>Three small games, live on the web</h3>
                <ul>
                  {games.map((g) => (
                    <li key={g.id}>
                      <a href={g.link.href} target="_blank" rel="noreferrer">
                        <strong>{g.name}</strong>
                        <span className="k2-out" aria-hidden="true">
                          <svg viewBox="0 0 12 12" width="12" height="12">
                            <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                          </svg>
                        </span>
                        <span className="k2-sr"> (opens in a new tab)</span>
                      </a>{" "}
                      <span>{g.line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </main>

          <footer className="k2-foot">
            <div className="k2-foot-contact">
              <a href={`mailto:${links.email}`}>{links.email}</a>
              <a href={links.github} target="_blank" rel="noreferrer">
                GitHub<span className="k2-sr"> (opens in a new tab)</span>
              </a>
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn<span className="k2-sr"> (opens in a new tab)</span>
              </a>
              <a href={links.cv}>CV (PDF)</a>
            </div>
            <p className="k2-foot-line">Lit by the sun over Kosovo, at your clock.</p>
          </footer>
        </div>
      </NarrowContext>
    </ClockContext>
  );
}
