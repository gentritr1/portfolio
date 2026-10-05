import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Link, useParams } from "react-router";
import { ArrowLeftIcon, ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { findProject, nextFeatured, type Project } from "../content/projects";
import { links } from "../content/links";
import { recreations } from "../lib/recreations";
import { caseCopy, type CaseCopy, type LiveKey, type Part, type Plate, type Px, type Shot } from "./caseCopy";
import NotFoundPage from "./NotFoundPage";
import "./case.css";

const SETTLE_MS = 160;
const FADE_MS = 200;
const DRAW_MS = 180;
const RING_MS = 120;
const LEAVE_MS = 120;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
/** The frame draws every plate on an 880 x 676 stage and scales the stage to the frame's width. */
const STAGE_W = 880;
const STAGE_H = 676;

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

/** Renders inside Suspense, so the face check runs only after the recreation's code has arrived. */
function LiveBody({ Live }: { Live: ComponentType<object> }) {
  // A recreation draws hidden until its own faces load, so a late face never moves the plate.
  const [faces, setFaces] = useState(false);
  useEffect(() => {
    let live = true;
    const settle = () => {
      if (!document.fonts) return setFaces(true);
      void document.fonts.ready.then(() => {
        if (!live) return;
        if (document.fonts.status === "loaded") setFaces(true);
        else settle();
      });
    };
    // Two frames let the hidden layout request its faces before the check.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(settle);
    });
    const limit = window.setTimeout(() => live && setFaces(true), 3000);
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(limit);
    };
  }, []);

  return (
    <div className="cs-live-body" style={faces ? undefined : { visibility: "hidden" }}>
      <Live />
    </div>
  );
}

function LivePlate({ which }: { which: LiveKey }) {
  const entry = recreations[which];
  const Live = entry.Component;
  const ref = useRef<HTMLDivElement>(null);

  // The specimen runs a demo loop until it is paused. The page shows it still.
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
    <div ref={ref} className={`cs-live cs-live-${which}`} data-world={entry.world}>
      <Suspense fallback={<div className="cs-wait" />}>
        <LiveBody Live={Live} />
      </Suspense>
    </div>
  );
}

function ShotView({ shot, crop, eager, ring }: { shot: Shot; crop: Px; eager: boolean; ring?: Px | null }) {
  return (
    <div className="cs-shot" style={{ aspectRatio: `${crop.w} / ${crop.h}` }}>
      <img
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{
          width: `${(shot.width / crop.w) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
      {ring && (
        <span
          className="cs-shot-ring"
          aria-hidden="true"
          style={{
            left: `calc(${((ring.x - crop.x) / crop.w) * 100}% - 5px)`,
            top: `calc(${((ring.y - crop.y) / crop.h) * 100}% - 5px)`,
            width: `calc(${(ring.w / crop.w) * 100}% + 10px)`,
            height: `calc(${(ring.h / crop.h) * 100}% + 10px)`,
          }}
        />
      )}
    </div>
  );
}

function NumberPlate({ plate }: { plate: Extract<Plate, { kind: "number" }> }) {
  // A long figure gets smaller, so it keeps the plate's side margins.
  const glyphs = plate.to.length + (plate.from ? plate.from.length + 1.4 : 0);
  const fit = Math.floor(84 / (glyphs * 0.5));
  return (
    <figure className="cs-number">
      <p className="cs-number-figure" aria-hidden="true" style={{ fontSize: `min(40.9cqw, ${fit}cqw)` }}>
        {plate.from && (
          <>
            <span>{plate.from}</span>
            <ArrowRightIcon className="cs-number-arrow" weight="bold" />
          </>
        )}
        <span data-to="">{plate.to}</span>
      </p>
      <figcaption>
        <span className="cs-number-unit">{plate.unit}</span>
        <span className="cs-number-note">{plate.note}</span>
      </figcaption>
    </figure>
  );
}

type Links = Project["links"];

/** The product's public links. On the stage they sit left of the shot, so the hairline reaches them without crossing it. */
function Stores({ title, links, dark }: { title: string; links: Links; dark?: boolean }) {
  return (
    <div className="cs-stores" data-dark={dark || undefined}>
      <p className="cs-stores-title">{title}</p>
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowUpRightIcon aria-hidden="true" weight="bold" />
              <span className="cs-sr"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const isDark = (shot: Shot) => shot.ground !== "#ffffff";

/** The stage width a link panel and its gaps take beside a shot. */
const STORES_W = 264 + 40 + 32;

/** A screenshot on the stage: whole crop, centred on the page's own colour, never above its source pixels. */
function StageShot({ shot, eager, stores, links }: { shot: Shot; eager: boolean; stores?: string; links: Links }) {
  const { crop } = shot;
  const room = stores ? STAGE_W - STORES_W : STAGE_W;
  const scale = Math.min(room / crop.w, STAGE_H / crop.h, 1);
  return (
    <div className="cs-stage-shot" style={{ background: shot.ground }}>
      {stores && <Stores title={stores} links={links} dark={isDark(shot)} />}
      <div style={{ width: Math.round(crop.w * scale), height: Math.round(crop.h * scale) }}>
        <ShotView shot={shot} crop={crop} eager={eager} />
      </div>
    </div>
  );
}

function StagePlate({ plate, load, eager, links }: { plate: Plate; load: boolean; eager: boolean; links: Links }) {
  if (plate.kind === "number") return <NumberPlate plate={plate} />;
  if (!load) return <div className="cs-wait" />;
  if (plate.kind === "live") return <LivePlate which={plate.key} />;
  return <StageShot shot={plate} eager={eager} stores={plate.stores} links={links} />;
}

/** The plate a part shows on a phone: under the title for the first part, under its text for the others. */
function InlinePlate({ part, plate, caption, links, hero }: { part: Part; plate: Plate; caption: string; links: Links; hero?: boolean }) {
  if (!part.narrow) return null;
  const stores = plate.kind === "web" || plate.kind === "phone" ? plate.stores : undefined;
  if (part.narrow === "stores")
    return stores ? (
      <div className="cs-inline">
        <Stores title={stores} links={links} />
      </div>
    ) : null;
  let body = null;
  if (plate.kind === "number") body = <div className="cs-inline-number"><NumberPlate plate={plate} /></div>;
  else if (plate.kind === "live") {
    const { aspect } = recreations[plate.key];
    body = (
      <div
        className="cs-inline-live"
        style={{ "--cs-aspect-base": aspect.base, "--cs-aspect-sm": aspect.sm } as CSSProperties}
      >
        <LivePlate which={plate.key} />
      </div>
    );
  } else if (typeof part.narrow === "object") {
    const crop = part.narrow;
    const ring = part.target.kind === "shot" ? part.target.box : null;
    body = (
      <div
        className="cs-inline-shot"
        data-kind={plate.kind}
        style={{ background: plate.ground, maxWidth: crop.w } as CSSProperties}
      >
        <ShotView shot={plate} crop={crop} eager={hero ?? false} ring={ring} />
      </div>
    );
  }
  return (
    <figure className={hero ? "cs-inline cs-hero" : "cs-inline"}>
      {body}
      <figcaption>{caption}</figcaption>
      {stores && <Stores title={stores} links={links} />}
    </figure>
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

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Wire {
  outside: string;
  inside: string;
  split: number;
  start: Point;
  ring: Box & { r: number };
  tone: "light" | "dark" | "field";
}

function targetBox(part: Part, plate: Plate, element: HTMLElement): Box | null {
  const { target } = part;
  let found: Element | null;
  if (target.kind === "shot") {
    if (plate.kind !== "web" && plate.kind !== "phone") return null;
    const image = element.querySelector<HTMLImageElement>(".cs-shot img");
    if (!image) return null;
    const box = image.getBoundingClientRect();
    if (box.width === 0) return null;
    return {
      x: box.left + (target.box.x / plate.width) * box.width,
      y: box.top + (target.box.y / plate.height) * box.height,
      w: (target.box.w / plate.width) * box.width,
      h: (target.box.h / plate.height) * box.height,
    };
  }
  found = element.querySelector(target.kind === "figure" ? "[data-to]" : target.css);
  if (!found) return null;
  const box = found.getBoundingClientRect();
  if (box.width === 0) return null;
  return { x: box.left, y: box.top, w: box.width, h: box.height };
}

function measureWire(part: Part, plate: Plate, partElement: HTMLElement, plateElement: HTMLElement): Wire | null {
  const mark = partElement.querySelector<HTMLElement>(".cs-proof-ink mark");
  const target = targetBox(part, plate, plateElement);
  if (!mark || !target) return null;
  const fragments = mark.getClientRects();
  if (fragments.length === 0) return null;
  const last = fragments[fragments.length - 1];
  if (last.top < 0 || last.bottom > window.innerHeight) return null;
  const p = plateElement.getBoundingClientRect();
  const edge = Math.round(p.left);
  const start: Point = [Math.round(last.right + 10), Math.round(last.top + last.height / 2)];
  const gutter = Math.round(edge - 20);
  const outside: Point[] = [start, [gutter, start[1]]];
  const inside: Point[] = [];
  const route = part.route ?? (part.target.kind === "figure" ? { kind: "lane" as const, y: 0.06 } : null);
  if (!route) {
    const ty = Math.round(target.y + target.h / 2);
    outside.push([gutter, ty], [edge, ty]);
    inside.push([edge, ty], [Math.round(target.x - 6), ty]);
  } else {
    let lane: number | null;
    if (route.kind === "lane") lane = Math.round(p.top + route.y * p.height);
    else {
      const rule = plateElement.querySelector<HTMLElement>(route.css);
      lane = rule ? Math.round(rule.getBoundingClientRect().top) : null;
    }
    if (lane === null) return null;
    const cx = Math.round(target.x + target.w / 2);
    const end = target.y > lane ? Math.round(target.y - 6) : Math.round(target.y + target.h + 6);
    outside.push([gutter, lane], [edge, lane]);
    inside.push([edge, lane], [cx, lane], [cx, end]);
  }
  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 8 };
  if (part.target.kind === "selector" && part.target.round) ring.r = ring.h / 2;
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  const dark = (plate.kind === "web" || plate.kind === "phone") && isDark(plate);
  return {
    outside: rounded(outside),
    inside: rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start,
    ring,
    tone: plate.kind === "number" ? "field" : dark ? "dark" : "light",
  };
}

/* ---------- Page ---------- */

const pad = (n: number) => String(n).padStart(2, "0");

/** A hyphenated word such as "sign-in" never breaks at its hyphen. */
function keepWords(text: string) {
  return text.split(/(\S*\w-\w\S*)/).map((piece, index) =>
    index % 2 ? (
      <span key={index} className="cs-nowrap">
        {piece}
      </span>
    ) : (
      piece
    ),
  );
}

function Facts({ project, copy }: { project: Project; copy: CaseCopy }) {
  return (
    <dl className="cs-facts">
      <div>
        <dt>Role</dt>
        <dd>{copy.role}</dd>
      </div>
      <div>
        <dt>Years</dt>
        <dd>{project.years}</dd>
      </div>
      <div>
        <dt>Platforms</dt>
        <dd>{copy.platforms}</dd>
      </div>
      <div>
        <dt>Live</dt>
        <dd>
          {project.links.length > 0 ? (
            <span className="cs-facts-links">
              {project.links.map((link) => (
                <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                  <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
                  <span className="cs-sr"> (opens in a new tab)</span>
                </a>
              ))}
            </span>
          ) : (
            copy.privateNote
          )}
        </dd>
      </div>
    </dl>
  );
}

function Case({ project, copy }: { project: Project; copy: CaseCopy }) {
  const narrow = useMedia("(max-width: 1023px)", false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const partRefs = useRef<(HTMLElement | null)[]>([]);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const { parts, plates, captions } = copy;
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [shown, setShown] = useState<{ index: number; mode: Mode }>({ index: 0, mode: "instant" });
  const nextMode = useRef<Mode | null>(null);
  const next = nextFeatured(project);
  const nextCopy = caseCopy[next.slug];

  const pinLine = useCallback(() => window.innerHeight * (narrow ? 0.5 : 0.42), [narrow]);

  const locate = useCallback(() => {
    const pin = pinLine();
    let index = 0;
    partRefs.current.forEach((part, i) => {
      if (part && part.getBoundingClientRect().top <= pin) index = i;
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

  /* A part is shown only after it settles at the pin line, so a part passed in a fast scroll never fires. */
  useEffect(() => {
    if (shown.index === active) return;
    if (nextMode.current) {
      const mode = reduced ? "instant" : nextMode.current;
      nextMode.current = null;
      setShown({ index: active, mode });
      return;
    }
    const timer = window.setTimeout(() => setShown({ index: active, mode: reduced ? "instant" : "animate" }), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [active, shown.index, reduced]);

  const plateIndex = parts[shown.index].plate;

  /* The plate that leaves stays under the new one until the new one is opaque. */
  const [track, setTrack] = useState<{ plate: number; prev: number | null }>({ plate: plateIndex, prev: null });
  if (track.plate !== plateIndex) {
    setTrack({ plate: plateIndex, prev: shown.mode === "instant" ? null : track.plate });
  }
  const prev = track.prev;
  useEffect(() => {
    if (prev === null) return;
    const timer = window.setTimeout(() => setTrack((was) => ({ ...was, prev: null })), FADE_MS + 40);
    return () => window.clearTimeout(timer);
  }, [prev, track.plate]);

  /* A plate loads when its part is near; the first plate loads at once. */
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([parts[0].plate]));
  const near = [active - 1, active, active + 1, shown.index]
    .filter((i) => i >= 0 && i < parts.length)
    .map((i) => parts[i].plate);
  if (!near.every((i) => loaded.has(i))) {
    const nextLoaded = new Set(loaded);
    near.forEach((i) => nextLoaded.add(i));
    setLoaded(nextLoaded);
  }

  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const fit = () => screen.style.setProperty("--k", String(screen.clientWidth / STAGE_W));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(screen);
    return () => observer.disconnect();
  }, [narrow]);

  /* ---------- The hairline, written to the DOM, not to state ---------- */
  const wireRef = useRef<SVGGElement>(null);
  const outRefs = useRef<SVGPathElement[]>([]);
  const inRefs = useRef<SVGPathElement[]>([]);
  const ringRef = useRef<SVGRectElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const wireIndex = useRef(0);
  const pendingDraw = useRef<Mode | null>(null);

  const draw = useCallback((split: number) => {
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;
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

  /* A part whose line was off screen when it became current draws its line when the line comes into view. */
  const wasReady = useRef(false);
  const updateWire = useCallback(() => {
    const group = wireRef.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!group || !ring || !dot) return;
    const index = wireIndex.current;
    const part = parts[index];
    const partElement = partRefs.current[index];
    const plateElement = plateRefs.current[part.plate];
    const wire = !narrow && partElement && plateElement ? measureWire(part, plates[part.plate], partElement, plateElement) : null;
    if (!wire) {
      group.dataset.ready = "false";
      if (wasReady.current && !pendingDraw.current) pendingDraw.current = "animate";
      wasReady.current = false;
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
    if (!wasReady.current && pendingDraw.current === null) pendingDraw.current = "animate";
    wasReady.current = true;
    if (pendingDraw.current) {
      const mode = pendingDraw.current;
      pendingDraw.current = null;
      if (mode === "animate" && !reduced) draw(wire.split);
    }
  }, [narrow, reduced, draw, parts, plates]);

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
    const images = Array.from(document.querySelectorAll(".cs-frame img"));
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

  /* A new part: the old line fades, the plate cross-fades, then the new line draws. */
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
    const samePlate = parts[wireIndex.current].plate === parts[shown.index].plate;
    const fade = group.animate([{ opacity: 1 }, { opacity: 0 }], { duration: LEAVE_MS, easing: EASE_OUT, fill: "forwards" });
    const timer = window.setTimeout(
      () => {
        fade.cancel();
        wireIndex.current = shown.index;
        pendingDraw.current = "animate";
        updateWire();
      },
      samePlate ? LEAVE_MS : FADE_MS,
    );
    return () => {
      window.clearTimeout(timer);
      fade.cancel();
    };
  }, [shown, reduced, updateWire, parts]);

  /* ---------- Tray: the page jumps, nothing travels ---------- */
  const trayRef = useRef<HTMLDivElement>(null);
  const jump = useCallback(
    (index: number, mode: Mode) => {
      const part = partRefs.current[index];
      if (!part) return;
      nextMode.current = mode;
      const root = rootRef.current;
      if (root && mode === "instant") {
        root.dataset.instant = "";
        requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.instant));
      }
      const top = part.getBoundingClientRect().top + window.scrollY - pinLine() + 2;
      window.scrollTo({ top, behavior: "instant" });
      locate();
      if (activeRef.current === index) {
        nextMode.current = null;
        setShown((was) => (was.index === index ? was : { index, mode: reduced ? "instant" : mode }));
      }
    },
    [locate, pinLine, reduced],
  );

  const onSlot = (index: number) => (event: MouseEvent<HTMLButtonElement>) => {
    jump(index, event.detail === 0 ? "instant" : "animate");
  };
  const onTrayKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "Home" ? -9 : event.key === "End" ? 9 : 0;
    if (!step) return;
    event.preventDefault();
    const index = Math.min(parts.length - 1, Math.max(0, shown.index + step));
    jump(index, "instant");
    trayRef.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus({ preventScroll: true });
  };

  const shownPlates = new Set<number>();

  return (
    <div className="cs" ref={rootRef}>
      <title>{`${project.name} — Gentrit Rashiti`}</title>
      <main className="cs-main">
        <header className="cs-head">
          <nav className="cs-nav" aria-label="Site">
            <Link to="/" className="cs-back">
              <ArrowLeftIcon aria-hidden="true" size={16} weight="bold" />
              All work
            </Link>
            <span className="cs-nav-end">
              <a href={links.cv} download>
                CV (PDF)
              </a>
              <a href={`mailto:${links.email}`}>Email</a>
            </span>
          </nav>
          <p className="cs-name">
            <span>{project.name}</span>
            <span aria-hidden="true">·</span>
            <span>{project.years}</span>
          </p>
          <h1>{keepWords(copy.title)}</h1>
          {narrow && (
            <InlinePlate part={parts[0]} plate={plates[parts[0].plate]} caption={captions[parts[0].plate]} links={project.links} hero />
          )}
          <p className="cs-sentence">{keepWords(copy.sentence)}</p>
          <Facts project={project} copy={copy} />
        </header>

        <div className="cs-parts">
          {parts.map((part, index) => {
            const plate = plates[part.plate];
            const first = !shownPlates.has(part.plate);
            shownPlates.add(part.plate);
            return (
              <section
                key={part.heading}
                ref={(element) => {
                  partRefs.current[index] = element;
                }}
                className="cs-part"
                data-current={index === shown.index || undefined}
                aria-labelledby={`cs-part-${index}`}
              >
                <div className="cs-part-head">
                  <span className="cs-num" aria-hidden="true">
                    {pad(index + 1)}
                  </span>
                  <h2 id={`cs-part-${index}`}>{part.heading}</h2>
                </div>
                <p className="cs-text">{keepWords(part.text)}</p>
                <p className="cs-proof">
                  <span className="cs-proof-base">
                    <mark>
                      <ArrowRightIcon className="cs-proof-arrow" weight="bold" aria-hidden="true" />
                      {part.proof}
                    </mark>
                  </span>
                  <span className="cs-proof-ink" aria-hidden="true">
                    <mark>
                      <ArrowRightIcon className="cs-proof-arrow" weight="bold" />
                      {part.proof}
                    </mark>
                  </span>
                </p>
                {narrow && index > 0 && (first || plate.kind !== "live") && (
                  <InlinePlate part={part} plate={plate} caption={captions[part.plate]} links={project.links} />
                )}
              </section>
            );
          })}
        </div>

        {!narrow && (
          <aside className="cs-frame-wrap" aria-label="The work">
            <div className="cs-frame" ref={frameRef}>
              <div className="cs-screen" ref={screenRef}>
                <div className="cs-stage">
                  {plates.map((plate, index) => {
                    const state = index === plateIndex ? "on" : index === prev ? "prev" : "off";
                    return (
                      <div
                        key={index}
                        ref={(element) => {
                          plateRefs.current[index] = element;
                        }}
                        className={`cs-plate cs-plate-${plate.kind}`}
                        data-state={state}
                        data-mode={shown.mode}
                        inert={state !== "on"}
                        aria-hidden={state !== "on"}
                      >
                        <StagePlate plate={plate} load={loaded.has(index)} eager={index === parts[0].plate} links={project.links} />
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="cs-caption">
                <p className="cs-caption-text" aria-live="polite">
                  {captions[plateIndex]}
                </p>
                <div className="cs-tray" role="toolbar" aria-label="Parts of the case" ref={trayRef} onKeyDown={onTrayKey}>
                  {parts.map((part, index) => (
                    <button
                      type="button"
                      key={part.heading}
                      aria-label={`${pad(index + 1)}, ${part.heading}`}
                      aria-pressed={index === shown.index}
                      tabIndex={index === shown.index ? 0 : -1}
                      onClick={onSlot(index)}
                    >
                      <span>{pad(index + 1)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>

      <div className="cs-after">
        {copy.figures && (
          <section className="cs-figures" aria-labelledby="cs-figures-title">
            <h2 id="cs-figures-title" className="cs-label">
              The numbers
            </h2>
            <ul>
              {copy.figures.map((figure) => (
                <li key={figure.label}>
                  <p className="cs-figure">
                    {figure.value}
                    {figure.to && (
                      <>
                        <ArrowRightIcon className="cs-figure-arrow" weight="bold" aria-hidden="true" />
                        <span className="cs-sr"> to </span>
                        {figure.to}
                      </>
                    )}
                  </p>
                  <p className="cs-figure-label">{figure.label}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="cs-engineers" aria-labelledby="cs-engineers-title">
          <h2 id="cs-engineers-title" className="cs-label">
            For engineers
          </h2>
          <p>
            <strong>Built with:</strong> {copy.builtWith}
          </p>
        </section>

        <nav className="cs-next" aria-label="Next project">
          <p className="cs-label">Next project</p>
          <Link to={`/work/${next.slug}`} className="cs-next-link">
            <span className="cs-next-name">{next.name}</span>
            <span className="cs-next-line">{nextCopy?.title ?? next.kind}</span>
            <ArrowRightIcon className="cs-next-arrow" aria-hidden="true" weight="bold" />
          </Link>
        </nav>

        <footer className="cs-end">
          <p>Gentrit Rashiti. Based in Kosovo, working remotely.</p>
          <p className="cs-end-links">
            <a href={`mailto:${links.email}`}>{links.email}</a>
            <a href={links.cv} download>
              Download CV (PDF)
            </a>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </p>
        </footer>
      </div>

      <svg className="cs-wire" aria-hidden="true">
        <g ref={wireRef} data-ready="false">
          {[0, 1].map((layer) => (
            <path
              key={`out-${layer}`}
              ref={(element) => {
                if (element) outRefs.current[layer] = element;
              }}
              className={layer === 0 ? "cs-wire-halo cs-wire-out" : "cs-wire-line cs-wire-out"}
              pathLength={1}
            />
          ))}
          {[0, 1].map((layer) => (
            <path
              key={`in-${layer}`}
              ref={(element) => {
                if (element) inRefs.current[layer] = element;
              }}
              className={layer === 0 ? "cs-wire-halo cs-wire-in" : "cs-wire-line cs-wire-in"}
              pathLength={1}
            />
          ))}
          <rect ref={ringRef} className="cs-wire-ring" />
          <circle ref={dotRef} className="cs-wire-dot" r={3.5} />
        </g>
      </svg>
    </div>
  );
}

export function CaseStudyPage() {
  const { slug } = useParams();
  const project = findProject(slug);
  const copy = project ? caseCopy[project.slug] : undefined;
  if (!project?.featured || !copy) return <NotFoundPage />;
  return <Case key={project.slug} project={project} copy={copy} />;
}
