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
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { Clock, type Frame } from "./clock";
import { client, concepts, lead, own, results, type Concept, type Link, type Row, type Shot } from "./data";
import { anchors, contrast, lightAt, linear, luminance } from "./light";
import {
  cameraFor,
  createGround,
  GLOW_LIMIT,
  lowerAverage,
  project,
  sampleScreen,
  shadowPoints,
  type Camera,
  type Cells,
  type GroundRenderer,
  type Panel,
} from "./scene";
import { clockText, direction, kosovoMinutes, RISE } from "./sun";
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

type Vec = [number, number, number];
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const hex = (rgb: number[]) =>
  "#" + rgb.map((c) => Math.round(Math.min(1, Math.max(0, toGamma(c))) * 255).toString(16).padStart(2, "0")).join("");

/** The ground colour in front of a glowing screen, never more than the text limit above the ground. */
function glowColour(frame: Frame, screen: Vec) {
  const base = frame.light.litLinear;
  const add = screen.map((c) => c * 0.5 * frame.light.glow);
  const lum = 0.2126 * add[0] + 0.7152 * add[1] + 0.0722 * add[2];
  const k = lum > GLOW_LIMIT ? GLOW_LIMIT / lum : 1;
  return hex(base.map((c, i) => c + add[i] * k));
}

/* ---------- Ground: a lit floor under one or more upright panels ---------- */

interface GroundProps {
  className: string;
  sources: (string | null)[];
  /** Render the floor per pixel when WebGL is there. */
  gl?: boolean;
  fade?: number;
  children: ReactNode;
}

function Ground({ className, sources, gl = false, fade = 56, children }: GroundProps) {
  const clock = useClock();
  const id = useId().replace(/:/g, "");
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const renderer = useRef<GroundRenderer | null>(null);
  const [mode, setMode] = useState<"svg" | "gl">("svg");
  const view = useRef<{ camera: Camera; panels: Panel[]; height: number } | null>(null);
  const cells = useRef<(Cells | null)[]>(sources.map(() => null));
  const visible = useRef(true);
  const key = sources.join("|");

  const draw = (frame: Frame) => {
    const v = view.current;
    if (!v || !visible.current) return;
    const { sun, light } = frame;
    if (renderer.current) {
      renderer.current.draw({
        camera: v.camera,
        panel: v.panels[0],
        ray: sun.ray,
        direct: light.direct,
        glow: light.glow,
        lit: light.litLinear,
        shade: light.shadeLinear,
        cells: cells.current[0] ?? new Float32Array(48).fill(0.8),
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
    if (!gl || !host || new URLSearchParams(location.search).get("gl") === "0") return;
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
    setMode("gl");
    return () => {
      made.dispose();
      canvas.remove();
      renderer.current = null;
      setMode("svg");
    };
  }, [gl]);

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
        const fadeStop = root.querySelector(`#${id}-fade`);
        fadeStop?.setAttribute("y1", String(rect.height - fade));
        fadeStop?.setAttribute("y2", String(rect.height));
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
  }, [clock, fade, id, mode]);

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
            <mask id={`${id}-mask`} maskUnits="userSpaceOnUse" x="-10000" y="-10000" width="20000" height="20000">
              <rect x="-10000" y="-10000" width="20000" height="20000" fill={`url(#${id}-fade)`} />
            </mask>
            {sources.map((_, i) => (
              <radialGradient key={i} id={`${id}-glow-${i}`}>
                <stop offset="0" data-glow-stop={i} stopColor="var(--kt-lit)" />
                <stop offset="1" stopColor="var(--kt-lit)" stopOpacity="0" />
              </radialGradient>
            ))}
          </defs>
          <g mask={`url(#${id}-mask)`}>
            {sources.map((_, i) => (
              <g key={i}>
                <ellipse data-glow={i} fill={`url(#${id}-glow-${i})`} style={{ opacity: 0 }} />
                <ellipse data-ao={i} className="kt-ao" filter={`url(#${id}-ao)`} />
                <polygon data-shadow={i} className="kt-shadow" filter={`url(#${id}-soft)`} />
              </g>
            ))}
          </g>
        </svg>
      )}
      {children}
    </div>
  );
}

/* ---------- The sun path: today's altitude over Kosovo, and the control that moves the hour ---------- */

const PATH_W = 480;
const PATH_H = 104;
const HORIZON = 66;
const UP = 0.8;
const DOWN = 0.62;
const yOf = (altitude: number) => HORIZON - (altitude > 0 ? altitude * UP : altitude * DOWN);

function SunPath() {
  const clock = useClock();
  const track = useRef<HTMLDivElement>(null);
  const marker = useRef<SVGGElement>(null);
  const dot = useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = useState(clock.current);
  const [minute, setMinute] = useState(() => Math.floor(kosovoMinutes(clock.current.ms)));
  const drag = useRef<{ id: number; x: number; t: number; v: number } | null>(null);
  const day = clock.day;

  useEffect(
    () =>
      clock.subscribe((f) => {
        const m = Math.max(0, Math.min(1440, (f.ms - day.midnight) / 60000));
        marker.current?.setAttribute(
          "transform",
          `translate(${((m / 1440) * PATH_W).toFixed(2)} ${yOf(f.sun.altitude).toFixed(2)})`,
        );
        dot.current?.style.setProperty("--x", `${((m / 1440) * 100).toFixed(3)}%`);
        dot.current?.style.setProperty("--y", `${((yOf(f.sun.altitude) / PATH_H) * 100).toFixed(3)}%`);
        if (dot.current) dot.current.dataset.below = String(f.sun.altitude < RISE);
        const whole = Math.floor(kosovoMinutes(f.ms));
        setMinute((was) => (was === whole ? was : whole));
        setFrame((was) => (was.live === f.live && was.light.name === f.light.name ? was : f));
      }),
    [clock, day],
  );

  const curve = day.path
    .map((a, i) => `${i ? "L" : "M"}${((i / 144) * PATH_W).toFixed(1)} ${yOf(a).toFixed(1)}`)
    .join(" ");
  const toMs = (clientX: number) => {
    const rect = track.current!.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return day.midnight + f * 1439 * 60000;
  };
  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    drag.current = { id: event.pointerId, x: event.clientX, t: performance.now(), v: 0 };
    clock.set(toMs(event.clientX));
  };
  const move = (event: PointerEvent<HTMLDivElement>) => {
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
  const up = (event: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== event.pointerId) return;
    drag.current = null;
    // A flick coasts a little past the release point, at most one hour, so the hour a visitor aims at stays near.
    const fresh = performance.now() - d.t < 50;
    if (fresh && d.v !== 0) {
      const coast = Math.max(-3600000, Math.min(3600000, d.v * 0.06));
      clock.set(clock.target + coast, { velocity: Math.sign(d.v) * Math.min(Math.abs(d.v), 3600000 * 8) });
    }
  };
  const key = (event: KeyboardEvent<HTMLDivElement>) => {
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

  const at = (ms: number | null) => (ms === null ? null : ((ms - day.midnight) / 60000 / 1440) * 100);
  const marks = [
    { label: "Sunrise", ms: day.rise },
    { label: "Noon", ms: day.noon },
    { label: "Sunset", ms: day.set },
  ];
  const altitude = Math.round(frame.sun.altitude);
  const valueText = `${clockText(clock.current.ms)}, sun ${Math.abs(altitude)}° ${altitude >= 0 ? "above" : "below"} the horizon`;
  const jumps = [
    { label: "Dawn", ms: day.rise === null ? null : day.rise + 18 * 60000 },
    { label: "Noon", ms: day.noon },
    { label: "Dusk", ms: day.set === null ? null : day.set - 22 * 60000 },
    { label: "Night", ms: day.midnight + 23 * 60 * 60000 },
  ];

  return (
    <div className="kt-path">
      <div
        ref={track}
        className="kt-path-track"
        role="slider"
        tabIndex={0}
        aria-label="Time in Kosovo today"
        aria-valuemin={0}
        aria-valuemax={1439}
        aria-valuenow={minute}
        aria-valuetext={valueText}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onKeyDown={key}
      >
        <svg viewBox={`0 0 ${PATH_W} ${PATH_H}`} preserveAspectRatio="none" aria-hidden="true">
          <clipPath id="kt-above">
            <rect x="0" y="0" width={PATH_W} height={HORIZON} />
          </clipPath>
          <path className="kt-path-day" d={`${curve} L${PATH_W} ${HORIZON} L0 ${HORIZON} Z`} clipPath="url(#kt-above)" />
          <line className="kt-path-horizon" x1="0" x2={PATH_W} y1={HORIZON} y2={HORIZON} />
          <path className="kt-path-curve" d={curve} vectorEffect="non-scaling-stroke" />
        </svg>
        <svg className="kt-path-marker" viewBox={`0 0 ${PATH_W} ${PATH_H}`} preserveAspectRatio="none" aria-hidden="true">
          <g ref={marker}>
            <line className="kt-path-now" x1="0" x2="0" y1={-200} y2={400} vectorEffect="non-scaling-stroke" />
          </g>
        </svg>
        <span ref={dot} className="kt-path-sun" aria-hidden="true" />
      </div>
      <div className="kt-path-marks" aria-hidden="true">
        {marks.map(
          (m) =>
            m.ms !== null && (
              <span key={m.label} style={{ left: `${at(m.ms)}%` }}>
                {m.label} {clockText(m.ms)}
              </span>
            ),
        )}
      </div>
      <div className="kt-path-jumps" role="group" aria-label="Light the page for">
        <button type="button" aria-pressed={frame.live} onClick={() => clock.follow()}>
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
    </div>
  );
}

/* ---------- Plates ---------- */

function ShotImage({ shot, eager = false }: { shot: Shot; eager?: boolean }) {
  return (
    <img
      src={shot.src}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
    />
  );
}

function CarePlate() {
  const entry = recreations.care;
  const Live = entry.Component;
  useEffect(() => {
    void entry.load();
  }, [entry]);
  return (
    <div className="kt-care" data-world={entry.world} inert aria-hidden="true">
      <div className="kt-care-inner">
        <Suspense fallback={null}>
          <Live />
        </Suspense>
      </div>
    </div>
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

function WorkRow({ row }: { row: Row }) {
  const phone = row.plate !== "care" && row.plate.height > row.plate.width;
  return (
    <li className="kt-row">
      <Ground className="kt-row-ground" sources={[row.plate === "care" ? null : row.plate.src]}>
        <div className="kt-row-stage">
          <figure className="kt-plate" data-kt-panel data-shape={row.plate === "care" ? "care" : phone ? "phone" : "wide"}>
            {row.plate === "care" ? <CarePlate /> : <ShotImage shot={row.plate} />}
          </figure>
        </div>
        <div className="kt-row-text">
          <h3>{row.name}</h3>
          <p className="kt-row-line">{row.line}</p>
          <p className="kt-row-result">{row.result}</p>
          <p className="kt-row-role">
            {row.role} · {row.years}
          </p>
          {row.note && <p className="kt-row-note">{row.note}</p>}
          <Links items={row.links} />
        </div>
      </Ground>
    </li>
  );
}

/** Both concepts share one camera on a wide screen, so their shadows fall on one ground. */
function ConceptView({ concept: c }: { concept: Concept }) {
  return (
    <article className="kt-concept">
      <figure className="kt-plate" data-kt-panel data-shape="wide">
        <ShotImage shot={c.plate} />
      </figure>
      <div className="kt-concept-text">
        <h3>
          {c.name} <span className="kt-tag">Concept</span>
        </h3>
        <p className="kt-row-line">{c.line}</p>
        <p className="kt-row-result">{c.result}</p>
        <Links items={c.links} />
      </div>
    </article>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  preload(FRAUNCES, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(PUBLIC_SANS, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const narrow = useMedia("(max-width: 639px)");
  const stacked = useMedia("(max-width: 1023px)");
  const [clock] = useState(() => new Clock(startMinutes()));
  const [fonts, setFonts] = useState<"wait" | "real" | "fallback">("wait");
  const root = useRef<HTMLDivElement>(null);
  const time = useRef<HTMLTimeElement>(null);
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
    const off = clock.subscribe(({ ms, sun, light }) => {
      html.style.setProperty("--kt-lit", light.lit);
      html.style.setProperty("--kt-shade", light.shade);
      html.style.setProperty("--kt-ink", light.ink);
      html.style.setProperty("--kt-soft", light.soft);
      html.style.setProperty("--kt-accent", light.accent);
      html.dataset.ktDark = luminance(light.lit) < 0.2 ? "true" : "false";
      if (time.current) time.current.textContent = clockText(ms);
      if (sentence.current) {
        const abs = Math.abs(sun.altitude);
        const a = abs < 9.95 ? abs.toFixed(1) : Math.round(abs);
        sentence.current.textContent =
          sun.altitude >= RISE
            ? `The sun is ${a}° above the horizon, in the ${direction(sun.bearing)}. It lights this page.`
            : `The sun is ${a}° below the horizon. The screens light this page.`;
      }
      setLightName((was) => (was === light.name ? was : light.name));
    });
    return () => {
      off();
      html.classList.remove("kt-page");
      for (const name of ["--kt-lit", "--kt-shade", "--kt-ink", "--kt-soft", "--kt-accent"]) html.style.removeProperty(name);
      delete html.dataset.ktDark;
    };
  }, [clock]);

  const leadShot = narrow ? lead.narrow : lead.wide;

  return (
    <ClockContext value={clock}>
      <div className="kt" ref={root} data-fonts={fonts} data-reduced={reduced || undefined}>
        <title>Gentrit Rashiti · lit by the sun over Kosovo</title>
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

        <main id="top">
          <section className="kt-hero" aria-labelledby="kt-id">
            <div className="kt-id">
              <h1 id="kt-id">Gentrit Rashiti builds web and mobile apps, from Kosovo.</h1>
              <p>5+ years. Part of two platform rewrites. Working remotely.</p>
            </div>
            <div className="kt-clock">
              <p className="kt-now">
                <time ref={time} className="kt-hm">
                  {clockText(clock.current.ms)}
                </time>
                <span>in Kosovo</span>
              </p>
              <p ref={sentence} className="kt-sentence" />
            </div>
            <SunPath />
            <Ground className="kt-stage" sources={[leadShot.src]} gl fade={72}>
              <figure className="kt-lead" data-kt-panel data-shape={narrow ? "phone" : "wide"}>
                <ShotImage shot={leadShot} eager />
              </figure>
              <div className="kt-under">
                <p className="kt-caption">{lead.caption}</p>
                <ul className="kt-results">
                  {results.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
            </Ground>
          </section>

          <section className="kt-section" id="work" aria-labelledby="kt-client">
            <h2 id="kt-client">Client work</h2>
            <ol className="kt-rows">
              {client.map((row) => (
                <WorkRow key={row.id} row={row} />
              ))}
            </ol>
          </section>

          <section className="kt-section" aria-labelledby="kt-own">
            <h2 id="kt-own">Own projects</h2>
            {stacked ? (
              <div className="kt-pair">
                {concepts.map((c) => (
                  <Ground key={c.id} className="kt-concept-ground" sources={[c.plate.src]}>
                    <ConceptView concept={c} />
                  </Ground>
                ))}
              </div>
            ) : (
              <Ground className="kt-pair" sources={concepts.map((c) => c.plate.src)}>
                {concepts.map((c) => (
                  <ConceptView key={c.id} concept={c} />
                ))}
              </Ground>
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
            Every shadow is projected from them. Below are the four lights, with the contrast of the text in each.
          </p>
          <ul className="kt-lights">
            {anchors.map((a) => {
              const l = lightAt(a.altitude, a.evening);
              const dark = luminance(l.lit) < 0.2;
              return (
                <li key={a.label} data-current={a.label === lightName || undefined}>
                  <div className="kt-swatch" style={{ background: l.lit, color: l.ink }}>
                    <span className="kt-swatch-shade" style={{ background: l.shade }} />
                    <strong>{a.label}</strong>
                    <span style={{ color: l.accent }}>Result line</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Ground</dt>
                      <dd>{l.lit.toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt>Text</dt>
                      <dd>
                        {l.ink.toUpperCase()} · {contrast(l.ink, l.lit).toFixed(1)}:1
                      </dd>
                    </div>
                    <div>
                      <dt>{dark ? "Screen light" : "Text in shadow"}</dt>
                      <dd>
                        {dark
                          ? `${contrast(l.soft, hex(linear(l.lit).map((c) => c + GLOW_LIMIT))).toFixed(1)}:1 at most light`
                          : `${contrast(l.soft, l.shade).toFixed(1)}:1 or more`}
                      </dd>
                    </div>
                    <div>
                      <dt>Result lines</dt>
                      <dd>
                        {l.accent.toUpperCase()} · {contrast(l.accent, dark ? l.lit : l.shade).toFixed(1)}:1
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
