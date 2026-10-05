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
  type ReactNode,
} from "react";
import { Link, useSearchParams } from "react-router";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import {
  figure,
  hook,
  identity,
  own,
  ownIntro,
  rows,
  type Box,
  type LivePlate,
  type OwnShot,
  type Plate,
  type Reader,
  type Row,
  type ShotPlate,
} from "./data";
import "./two-readers.css";

const SETTLE_MS = 160;
const FADE_MS = 200;
const DRAW_MS = 180;
const RING_MS = 120;
const WRITE_MS = 240;
const WRITE_AT_MS = 120;
const STAGGER_MS = 30;
const SCROLL_IDLE_MS = 140;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

/* The CSS hold on the text (tr-font-hold) lasts 250 ms. A face that arrives later is not used on this visit. */
const FONT_WAIT_MS = 230;

const fontFaces =
  typeof FontFace === "undefined"
    ? []
    : [
        new FontFace("TR Newsreader", 'url("/fonts/creative/Newsreader-Latin.woff2") format("woff2")', { weight: "300 650" }),
        new FontFace("TR JetBrains Mono", 'url("/fonts/creative/JetBrainsMono-Latin.woff2") format("woff2")', { weight: "100 800" }),
      ];
const fontsLoaded = Promise.all(fontFaces.map((face) => face.load()));
fontsLoaded.catch(() => undefined);

function useFonts() {
  const [ready, setReady] = useState(() => fontFaces.every((face) => document.fonts.has(face)));
  useLayoutEffect(() => {
    if (ready) return;
    let done = false;
    const start = performance.now();
    const show = (use: boolean) => {
      if (done) return;
      done = true;
      if (use && performance.now() - start <= FONT_WAIT_MS) fontFaces.forEach((face) => document.fonts.add(face));
      setReady(true);
    };
    if (fontFaces.every((face) => face.status === "loaded")) {
      show(true);
      return;
    }
    const timer = window.setTimeout(() => show(false), FONT_WAIT_MS);
    fontsLoaded.then(
      () => show(true),
      () => show(false),
    );
    return () => {
      done = true;
      window.clearTimeout(timer);
    };
  }, [ready]);
  return ready;
}

type Mode = "animate" | "instant";
interface Size {
  w: number;
  h: number;
}

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

/* ---------- One fact, said two ways ---------- */

function Pair({ plain, engineer, reader }: { plain: ReactNode; engineer: ReactNode; reader: Reader }) {
  return (
    <span className="tr-pair">
      <span className="tr-v" data-v="plain" aria-hidden={reader !== "plain" || undefined}>
        <span className="tr-ink">{plain}</span>
      </span>
      <span className="tr-v" data-v="engineer" aria-hidden={reader !== "engineer" || undefined}>
        <span className="tr-ink">{engineer}</span>
      </span>
    </span>
  );
}

/* ---------- Plates ---------- */

function LiveView({ plate, size, narrow }: { plate: LivePlate; size: Size; narrow: boolean }) {
  const entry = recreations[plate.key];
  const Recreation = entry.Component;
  const ref = useRef<HTMLDivElement>(null);
  const width = narrow ? plate.narrowWidth : plate.width;
  const k = size.w > 0 ? size.w / width : 1;

  // The specimen runs a demo loop until it is paused. The frame shows it still.
  useEffect(() => {
    if (plate.key !== "design-system") return;
    const element = ref.current;
    if (!element) return;
    const pause = () => {
      const button = element.querySelector<HTMLButtonElement>('.dsr-demo[aria-pressed="true"]');
      if (button) button.click();
      return Boolean(element.querySelector(".dsr-demo"));
    };
    if (pause()) return;
    const observer = new MutationObserver(() => {
      if (pause()) observer.disconnect();
    });
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [plate.key]);

  return (
    <div ref={ref} className={`tr-live tr-live-${plate.key}`} data-world={entry.world}>
      <div className="tr-live-in" style={{ width, height: size.h / k, transform: `scale(${k})` }}>
        <Suspense fallback={null}>
          <Recreation />
        </Suspense>
      </div>
    </div>
  );
}

function ShotView({ plate, size, narrow, eager }: { plate: ShotPlate; size: Size; narrow: boolean; eager: boolean }) {
  const crop = narrow ? plate.narrow : plate.crop;
  const image = (k: number, left: number, top: number) => (
    <img
      src={plate.src}
      alt={plate.alt}
      width={plate.width}
      height={plate.height}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{ width: plate.width * k, left, top }}
    />
  );
  if (plate.fill) {
    const k = Math.min(1, size.w / crop.w, size.h / crop.h);
    const w = Math.round(crop.w * k);
    const h = Math.round(crop.h * k);
    return (
      <div className="tr-shot" style={{ background: plate.fill }}>
        <div className="tr-shot-crop" style={{ width: w, height: h, left: Math.round((size.w - w) / 2), top: Math.round((size.h - h) / 2) }}>
          {image(k, -crop.x * k, -crop.y * k)}
        </div>
      </div>
    );
  }
  // Never larger than the source pixels: a narrower plate stands centred on the frame's paper.
  const k = Math.min(1, size.w / crop.w);
  const left = (size.w - crop.w * k) / 2;
  return <div className={`tr-shot${plate.dark ? " tr-shot-dark" : ""}`}>{image(k, left - crop.x * k, -crop.y * k)}</div>;
}

function FigureView({ reader }: { reader: Reader }) {
  const ticks = (n: number) => Array.from({ length: n }, (_, i) => <i key={i} />);
  return (
    <div className="tr-fig">
      <p className="tr-sr">
        {reader === "plain"
          ? "Before: 16 trips to the database, then it gave up. After: 2 trips, and it finishes."
          : "Before: 16 queries and a timeout. After: 2 queries, no timeout."}
      </p>
      <div className="tr-fig-in" aria-hidden="true">
        <p className="tr-fig-title">
          <Pair plain={figure.plain.title} engineer={figure.engineer.title} reader={reader} />
        </p>
        <div className="tr-fig-lane" data-lane="before">
          <p className="tr-fig-count">
            <span className="tr-fig-num">16</span>
            <span className="tr-fig-unit">
              <Pair plain={figure.plain.before} engineer={figure.engineer.before} reader={reader} />
            </span>
          </p>
          <p className="tr-fig-track">
            <span className="tr-fig-ticks">{ticks(16)}</span>
            <span className="tr-fig-end" data-end="stop">
              <span className="tr-fig-mark">×</span>
              <Pair plain={figure.plain.stop} engineer={figure.engineer.stop} reader={reader} />
            </span>
          </p>
        </div>
        <div className="tr-fig-lane" data-lane="after">
          <p className="tr-fig-count" data-proof="count">
            <span className="tr-fig-num">2</span>
            <span className="tr-fig-unit">
              <Pair plain={figure.plain.after} engineer={figure.engineer.after} reader={reader} />
            </span>
          </p>
          <p className="tr-fig-track" data-proof="done">
            <span className="tr-fig-ticks">{ticks(2)}</span>
            <span className="tr-fig-end" data-end="done">
              <span className="tr-fig-mark">✓</span>
              <Pair plain={figure.plain.done} engineer={figure.engineer.done} reader={reader} />
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function PlateView({
  plate,
  size,
  narrow,
  load,
  eager,
  reader,
}: {
  plate: Plate;
  size: Size;
  narrow: boolean;
  load: boolean;
  eager: boolean;
  reader: Reader;
}) {
  if (plate.kind === "figure") return <FigureView reader={reader} />;
  if (!load || size.w === 0) return <div className="tr-wait" />;
  if (plate.kind === "live") return <LiveView plate={plate} size={size} narrow={narrow} />;
  return <ShotView plate={plate} size={size} narrow={narrow} eager={eager} />;
}

/* A crop sized by percentages, so the box is known before the image arrives. */
function OwnView({ shot }: { shot: OwnShot }) {
  const { crop } = shot;
  return (
    <div className="tr-own-shot" style={{ aspectRatio: `${crop.w} / ${crop.h}`, width: crop.w / 2 }}>
      <img
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading="lazy"
        decoding="async"
        style={{
          width: `${(shot.width / crop.w) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
    </div>
  );
}

/* ---------- Where a result's proof sits ---------- */

function targetBox(row: Row, reader: Reader, plate: HTMLElement): Box | null {
  const { target } = row[reader];
  if (target.kind === "shot") {
    if (row.plate.kind !== "shot") return null;
    const image = plate.querySelector<HTMLImageElement>(".tr-shot img");
    if (!image || !image.complete) return null;
    const box = image.getBoundingClientRect();
    if (box.width === 0) return null;
    const k = box.width / row.plate.width;
    return { x: box.left + target.box.x * k, y: box.top + target.box.y * k, w: target.box.w * k, h: target.box.h * k };
  }
  const element = plate.querySelector<HTMLElement>(target.css);
  if (!element) return null;
  const box = element.getBoundingClientRect();
  if (box.width === 0) return null;
  return { x: box.left, y: box.top, w: box.width, h: box.height };
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
  tone: "light" | "dark" | "accent";
}

function ringOf(row: Row, reader: Reader, target: Box) {
  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 8 };
  const spec = row[reader].target;
  if (spec.kind === "selector" && spec.round) ring.r = ring.h / 2;
  return ring;
}

function measureWire(row: Row, reader: Reader, rowElement: HTMLElement, plate: HTMLElement): Wire | null {
  const ink = rowElement.querySelector<HTMLElement>(`.tr-result .tr-v[data-v="${reader}"] .tr-ink`);
  const target = targetBox(row, reader, plate);
  if (!ink || !target) return null;
  const fragments = ink.getClientRects();
  if (fragments.length === 0) return null;
  const p = plate.getBoundingClientRect();
  const edge = Math.round(p.left);
  const last = fragments[fragments.length - 1];
  const start: Point = [Math.round(last.right + 12), Math.round(last.top + last.height / 2)];
  const gutter = Math.round(edge - 24);
  const outside: Point[] = [start, [gutter, start[1]]];
  const inside: Point[] = [];
  const route = row[reader].route;
  if (route.kind === "side") {
    const ty = Math.round(target.y + target.h / 2);
    outside.push([gutter, ty], [edge, ty]);
    inside.push([edge, ty], [Math.round(target.x - 6), ty]);
  } else {
    const rule = plate.querySelector<HTMLElement>(route.css);
    if (!rule) return null;
    const lane = Math.round(rule.getBoundingClientRect().top);
    const cx = Math.round(target.x + target.w / 2);
    const end = target.y > lane ? Math.round(target.y - 6) : Math.round(target.y + target.h + 6);
    outside.push([gutter, lane], [edge, lane]);
    inside.push([edge, lane], [cx, lane], [cx, end]);
  }
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  return {
    outside: rounded(outside),
    inside: rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start,
    ring: ringOf(row, reader, target),
    tone: row.plate.kind === "figure" ? "accent" : row.plate.kind === "shot" && row.plate.dark ? "dark" : "light",
  };
}

/* ---------- Page ---------- */

export default function Draft() {
  const narrow = useMedia("(max-width: 1023px)", false);
  const ownNarrow = useMedia("(max-width: 767px)", false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const [params, setParams] = useSearchParams();
  const reader: Reader = params.get("read") === "engineer" ? "engineer" : "plain";

  const fonts = useFonts();

  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [frame, setFrame] = useState<Size>({ w: 0, h: 0 });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [shown, setShown] = useState<{ index: number; mode: Mode }>({ index: 0, mode: "instant" });
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0, 1]));
  const nextMode = useRef<Mode | null>(null);

  /* The frame's size decides each plate's scale. On a phone each row measures its own plate. */
  useLayoutEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const measure = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;
      setFrame((was) => (was.w === w && was.h === h ? was : { w, h }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [narrow]);

  /* Which row is at the reading line. */
  const pinLine = useCallback(() => window.innerHeight * 0.42, []);

  const locate = useCallback(() => {
    if (narrow) return;
    const pin = pinLine();
    let index = 0;
    rowRefs.current.forEach((row, i) => {
      if (row && row.getBoundingClientRect().top <= pin) index = i;
    });
    activeRef.current = index;
    setActive((was) => (was === index ? was : index));
  }, [pinLine, narrow]);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          locate();
        });
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(raf);
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
    const timer = window.setTimeout(() => setShown({ index: active, mode: reduced ? "instant" : "animate" }), SETTLE_MS);
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

  /* A screenshot loads when its row is near. */
  const near = narrow ? [] : [active - 1, active, active + 1, active + 2, shown.index];
  const missing = near.filter((i) => i >= 0 && i < rows.length && !loaded.has(i));
  if (missing.length > 0) setLoaded(new Set([...loaded, ...missing]));

  /* Live plates mount hidden once the page is idle, so their first draw is over before their row is shown. */
  useEffect(() => {
    if (!fonts) return;
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 600));
    const handle = idle(() => {
      const live = rows.flatMap((row, i) => (row.plate.kind === "live" ? [i] : []));
      void Promise.all(live.map((i) => (rows[i].plate.kind === "live" ? recreations[(rows[i].plate as LivePlate).key].load() : undefined))).then(
        () => setLoaded((was) => new Set([...was, ...live])),
      );
    });
    return () => {
      if (window.cancelIdleCallback && typeof handle === "number") window.cancelIdleCallback(handle);
    };
  }, [fonts]);

  /* ---------- Phone: each row's plate and ring ---------- */
  const [phonePlate, setPhonePlate] = useState<Size>({ w: 0, h: 0 });
  useLayoutEffect(() => {
    if (!narrow) return;
    const element = plateRefs.current[0];
    if (!element) return;
    const measure = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;
      setPhonePlate((was) => (was.w === w && was.h === h ? was : { w, h }));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [narrow]);

  useEffect(() => {
    if (!narrow) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const add = entries.flatMap((entry) => (entry.isIntersecting ? [Number((entry.target as HTMLElement).dataset.index)] : []));
        if (add.length) setLoaded((was) => (add.every((i) => was.has(i)) ? was : new Set([...was, ...add])));
      },
      { rootMargin: "600px 0px" },
    );
    plateRefs.current.forEach((plate) => plate && observer.observe(plate));
    return () => observer.disconnect();
  }, [narrow]);

  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const placeRings = useCallback(() => {
    if (!narrow) return;
    rows.forEach((row, i) => {
      const plate = plateRefs.current[i];
      const ring = ringRefs.current[i];
      if (!plate || !ring) return;
      const target = targetBox(row, reader, plate);
      if (!target) {
        ring.dataset.ready = "false";
        return;
      }
      const p = plate.getBoundingClientRect();
      const box = ringOf(row, reader, target);
      const x = Math.max(2, box.x - p.left);
      const y = Math.max(2, box.y - p.top);
      ring.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      ring.style.width = `${Math.round(Math.min(box.w, p.width - x - 2))}px`;
      ring.style.height = `${Math.round(Math.min(box.h, p.height - y - 2))}px`;
      ring.style.borderRadius = `${Math.round(box.r)}px`;
      ring.dataset.ready = "true";
    });
  }, [narrow, reader]);

  useEffect(() => {
    if (!narrow) return;
    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          placeRings();
        });
    };
    schedule();
    const log = rootRef.current?.querySelector(".tr-log");
    const mutation = new MutationObserver(schedule);
    if (log) mutation.observe(log, { subtree: true, childList: true });
    const resize = new ResizeObserver(schedule);
    if (log) resize.observe(log);
    document.addEventListener("load", schedule, true);
    return () => {
      cancelAnimationFrame(raf);
      mutation.disconnect();
      resize.disconnect();
      document.removeEventListener("load", schedule, true);
    };
  }, [narrow, placeRings, loaded]);

  /* ---------- Desktop: the hairline, written to the DOM, not to state ---------- */
  const wireRef = useRef<SVGGElement>(null);
  const outRefs = useRef<SVGPathElement[]>([]);
  const inRefs = useRef<SVGPathElement[]>([]);
  const wireRings = useRef<SVGRectElement[]>([]);
  const dotRef = useRef<SVGCircleElement>(null);
  const wireIndex = useRef(0);
  const wireReader = useRef<Reader>(reader);
  const pendingDraw = useRef<Mode | null>(null);
  const armed = useRef(false);
  const held = useRef(false);
  const jumping = useRef(false);

  const draw = useCallback((split: number) => {
    const dot = dotRef.current;
    if (!dot) return;
    const outMs = Math.round(DRAW_MS * split);
    const inMs = DRAW_MS - outMs;
    outRefs.current.forEach((path) =>
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: outMs, easing: "linear", fill: "backwards" }),
    );
    inRefs.current.forEach((path) =>
      path.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: inMs, delay: outMs, easing: EASE_OUT, fill: "backwards" }),
    );
    dot.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 80, easing: EASE_OUT, fill: "backwards" });
    wireRings.current.forEach((ring) =>
      ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RING_MS, delay: DRAW_MS, easing: EASE_OUT, fill: "backwards" }),
    );
  }, []);

  const updateWire = useCallback(() => {
    const group = wireRef.current;
    const dot = dotRef.current;
    if (!group || !dot) return;
    if (narrow) {
      group.dataset.ready = "false";
      return;
    }
    const index = wireIndex.current;
    const row = rows[index];
    const rowElement = rowRefs.current[index];
    const plate = plateRefs.current[index];
    const wire = armed.current && !held.current && rowElement && plate ? measureWire(row, wireReader.current, rowElement, plate) : null;
    const bar = rootRef.current?.querySelector(".tr-switch-bar")?.getBoundingClientRect();
    const top = (bar?.bottom ?? 0) + 8;
    const offRow =
      wire &&
      (wire.start[1] < top ||
        wire.start[1] > window.innerHeight - 8 ||
        wire.ring.y < 8 ||
        wire.ring.y + wire.ring.h > window.innerHeight - 8);
    if (!wire || offRow) {
      group.dataset.ready = "false";
      return;
    }
    group.dataset.ready = "true";
    group.dataset.tone = wire.tone;
    outRefs.current.forEach((path) => path.setAttribute("d", wire.outside));
    inRefs.current.forEach((path) => path.setAttribute("d", wire.inside));
    dot.setAttribute("cx", String(wire.start[0]));
    dot.setAttribute("cy", String(wire.start[1]));
    wireRings.current.forEach((ring) => {
      ring.setAttribute("x", String(Math.round(wire.ring.x)));
      ring.setAttribute("y", String(Math.round(wire.ring.y)));
      ring.setAttribute("width", String(Math.round(wire.ring.w)));
      ring.setAttribute("height", String(Math.round(wire.ring.h)));
      ring.setAttribute("rx", String(Math.round(wire.ring.r)));
    });
    if (pendingDraw.current) {
      const mode = pendingDraw.current;
      pendingDraw.current = null;
      if (mode === "animate" && !reduced) draw(wire.split);
    }
  }, [narrow, reduced, draw]);

  /* The line never follows the scroll: it hides while the page moves and comes back where the page stops. */
  useEffect(() => {
    let raf = 0;
    let idle = 0;
    const group = wireRef.current;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          updateWire();
        });
    };
    const onScroll = () => {
      if (jumping.current) {
        schedule();
        return;
      }
      if (group && !reduced) group.dataset.moving = "";
      window.clearTimeout(idle);
      idle = window.setTimeout(() => {
        updateWire();
        if (group) delete group.dataset.moving;
      }, reduced ? 0 : SCROLL_IDLE_MS);
      if (reduced) schedule();
    };
    schedule();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    const mutation = new MutationObserver(schedule);
    const frameElement = frameRef.current;
    if (frameElement) {
      resize.observe(frameElement);
      mutation.observe(frameElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "style", "data-state"] });
    }
    document.addEventListener("load", schedule, true);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(idle);
      if (group && !held.current) delete group.dataset.moving;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      mutation.disconnect();
      document.removeEventListener("load", schedule, true);
    };
  }, [updateWire, loaded, reduced]);

  /* The first line draws after the first plate has faded in. */
  useEffect(() => {
    if (armed.current || narrow || !fonts) return;
    let timer = 0;
    let raf = 0;
    const arm = () => {
      armed.current = true;
      pendingDraw.current = "animate";
      updateWire();
    };
    const wait = () => {
      const plate = plateRefs.current[0];
      if (!plate || !targetBox(rows[0], wireReader.current, plate)) {
        raf = requestAnimationFrame(wait);
        return;
      }
      if (reduced) arm();
      else timer = window.setTimeout(arm, FADE_MS);
    };
    wait();
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [reduced, updateWire, narrow, fonts]);

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
    const fade = group.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 120, easing: EASE_OUT, fill: "forwards" });
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

  /* ---------- The switch: every visible line fades, then the other reader's line writes in ---------- */
  const switchTimer = useRef(0);
  const switchToken = useRef(0);
  const choose = (next: Reader, keyboard = false) => {
    if (next === reader) return;
    const still = reduced || keyboard;
    const root = rootRef.current;
    let lineDelay = 0;
    if (root) {
      let order = 0;
      const currentRow = narrow ? null : rowRefs.current[shown.index];
      root.querySelectorAll<HTMLElement>(".tr-pair").forEach((pair) => {
        const box = pair.getBoundingClientRect();
        const seen = !still && box.width > 0 && box.bottom > 0 && box.top < window.innerHeight;
        if (seen) {
          const delay = order * STAGGER_MS;
          pair.style.setProperty("--d", `${delay}ms`);
          delete pair.dataset.snap;
          if (currentRow?.querySelector(".tr-result")?.contains(pair)) lineDelay = delay + WRITE_AT_MS + WRITE_MS;
          order += 1;
        } else {
          pair.style.setProperty("--d", "0ms");
          pair.dataset.snap = "";
        }
      });
    }
    const group = wireRef.current;
    window.clearTimeout(switchTimer.current);
    held.current = true;
    if (group && !still) group.dataset.moving = "";
    const release = () => {
      held.current = false;
      wireReader.current = next;
      if (group) delete group.dataset.moving;
      group?.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
      pendingDraw.current = still ? "instant" : "animate";
      updateWire();
    };
    const token = ++switchToken.current;
    const written = lineDelay > 0 ? rowRefs.current[shown.index]?.querySelector<HTMLElement>(`.tr-result .tr-v[data-v="${next}"]`) : null;
    const once = (event?: TransitionEvent) => {
      if (event && event.propertyName !== "clip-path") return;
      if (token !== switchToken.current) return;
      switchToken.current += 1;
      written?.removeEventListener("transitionend", once);
      window.clearTimeout(switchTimer.current);
      release();
    };
    if (written) {
      written.addEventListener("transitionend", once);
      switchTimer.current = window.setTimeout(once, lineDelay + 3000);
    } else {
      requestAnimationFrame(() => requestAnimationFrame(() => once()));
    }
    setParams(
      (was) => {
        const out = new URLSearchParams(was);
        if (next === "engineer") out.set("read", "engineer");
        else out.delete("read");
        return out;
      },
      { replace: true, preventScrollReset: true },
    );
  };
  useEffect(() => () => window.clearTimeout(switchTimer.current), []);
  useEffect(() => {
    wireReader.current = held.current ? wireReader.current : reader;
  }, [reader]);

  const onSwitchKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    const next: Reader = reader === "plain" ? "engineer" : "plain";
    choose(next, true);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-reader="${next}"]`)?.focus();
  };

  /* ---------- Keyboard and pointer: the page jumps, nothing travels ---------- */
  const jump = useCallback(
    (index: number, mode: Mode) => {
      const row = rowRefs.current[index];
      if (!row || narrow) return;
      nextMode.current = mode;
      const root = rootRef.current;
      if (root && mode === "instant") {
        root.dataset.instant = "";
        requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.instant));
      }
      jumping.current = true;
      requestAnimationFrame(() => requestAnimationFrame(() => (jumping.current = false)));
      const top = row.getBoundingClientRect().top + window.scrollY - pinLine() + 2;
      window.scrollTo({ top: index === 0 ? 0 : top, behavior: "instant" });
      locate();
      if (activeRef.current === index) {
        nextMode.current = null;
        setShown((was) => (was.index === index ? was : { index, mode: reduced ? "instant" : mode }));
      }
    },
    [locate, pinLine, reduced, narrow],
  );

  const onLogKey = (event: KeyboardEvent<HTMLOListElement>) => {
    if (narrow) return;
    const step =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : event.key === "Home" ? -99 : event.key === "End" ? 99 : 0;
    if (!step) return;
    event.preventDefault();
    const index = Math.min(rows.length - 1, Math.max(0, shown.index + step));
    jump(index, "instant");
    rowRefs.current[index]?.querySelector<HTMLElement>(".tr-link")?.focus({ preventScroll: true });
  };

  const onRowFocus = (index: number) => (event: FocusEvent<HTMLLIElement>) => {
    if (index !== activeRef.current && event.target.matches(":focus-visible")) jump(index, "instant");
  };

  const onRowClick = (index: number) => (event: MouseEvent<HTMLLIElement>) => {
    if ((event.target as HTMLElement).closest("a")) return;
    if (index !== shown.index) jump(index, "animate");
  };

  const current = rows[shown.index];

  return (
    <div className="tr" ref={rootRef} data-read={reader} data-fonts={fonts ? undefined : "wait"}>
      <title>Two readers — Gentrit Rashiti</title>
      <div className="tr-switch-bar">
        <div className="tr-switch-in">
          <p className="tr-switch-name" aria-hidden="true">
            Gentrit Rashiti
          </p>
          <div className="tr-switch" role="radiogroup" aria-label="Same facts for" onKeyDown={onSwitchKey}>
            <span className="tr-switch-label" aria-hidden="true">
              Same facts for
            </span>
            {(["plain", "engineer"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                data-reader={option}
                aria-checked={reader === option}
                tabIndex={reader === option ? 0 : -1}
                onClick={(event) => choose(option, event.detail === 0)}
              >
                {option === "plain" ? "Hiring manager" : "Engineer"}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="tr-main">
        <div className="tr-col">
          <header className="tr-id">
            <h1>
              <Pair plain={identity.plain.title} engineer={identity.engineer.title} reader={reader} />
            </h1>
            <p className="tr-id-line">
              <Pair plain={identity.plain.line} engineer={identity.engineer.line} reader={reader} />
            </p>
            <p className="tr-id-links">
              <a href={links.cv}>Download CV</a>
              <a href={`mailto:${links.email}`}>Email</a>
            </p>
          </header>

          <div className="tr-hook">
            <p className="tr-hook-lead">{hook.lead}</p>
            <dl className="tr-hook-eg">
              <div data-v="plain">
                <dt>Hiring manager reads</dt>
                <dd>“{hook.plain}”</dd>
              </div>
              <div data-v="engineer">
                <dt>Engineer reads</dt>
                <dd>{hook.engineer}</dd>
              </div>
            </dl>
          </div>

          <ol className="tr-log" aria-label="Seven pieces of work" onKeyDown={onLogKey}>
            {rows.map((row, index) => {
              const plate = (
                <div
                  className={`tr-plate tr-plate-${row.plate.kind}`}
                  ref={(element) => {
                    plateRefs.current[index] = element;
                  }}
                  data-index={index}
                  inert
                >
                  <PlateView
                    plate={row.plate}
                    size={phonePlate}
                    narrow
                    load={loaded.has(index)}
                    eager={index < 2}
                    reader={reader}
                  />
                  <span
                    className="tr-ring"
                    aria-hidden="true"
                    data-ready="false"
                    ref={(element) => {
                      ringRefs.current[index] = element;
                    }}
                  />
                </div>
              );
              return (
                <li
                  key={row.id}
                  ref={(element) => {
                    rowRefs.current[index] = element;
                  }}
                  className="tr-row"
                  data-current={(!narrow && index === shown.index) || undefined}
                  onFocus={onRowFocus(index)}
                  onClick={onRowClick(index)}
                >
                  <div className="tr-row-head">
                    <span className="tr-num" aria-hidden="true">
                      {row.id}
                    </span>
                    <div>
                      <h2>
                        <span className="tr-sr">{row.id}. </span>
                        {row.project}
                      </h2>
                      <p className="tr-meta">
                        <Pair plain={row.plain.meta} engineer={row.engineer.meta} reader={reader} />
                      </p>
                    </div>
                  </div>
                  {narrow && (
                    <figure className="tr-phone-plate">
                      {plate}
                      <figcaption>{row.caption}</figcaption>
                    </figure>
                  )}
                  <p className="tr-line">
                    <Pair plain={row.plain.line} engineer={row.engineer.line} reader={reader} />
                  </p>
                  <p className="tr-result">
                    <Pair plain={`→ ${row.plain.result}`} engineer={`→ ${row.engineer.result}`} reader={reader} />
                  </p>
                  <p className="tr-foot">
                    <Link className="tr-link" to={row.link.href}>
                      Read the case study<span className="tr-sr">: {row.link.name}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {!narrow && (
          <aside className="tr-frame-wrap" aria-label="The screen for the current row">
            <div className="tr-frame" ref={frameRef}>
              {rows.map((row, index) => {
                const state = index === shown.index ? "on" : index === prev ? "prev" : "off";
                return (
                  <div
                    key={row.id}
                    ref={(element) => {
                      if (!narrow) plateRefs.current[index] = element;
                    }}
                    className={`tr-plate tr-plate-${row.plate.kind}`}
                    data-state={state}
                    data-mode={shown.mode}
                    inert
                    aria-hidden={state !== "on"}
                  >
                    <PlateView
                      plate={row.plate}
                      size={frame}
                      narrow={false}
                      load={loaded.has(index)}
                      eager={index < 2}
                      reader={reader}
                    />
                  </div>
                );
              })}
            </div>
            <p className="tr-caption" aria-live="polite">
              <span className="tr-count" aria-hidden="true">
                {current.id} / 0{rows.length}
              </span>
              <span>{current.caption}</span>
            </p>
          </aside>
        )}
      </div>

      <section className="tr-own" aria-labelledby="tr-own-title">
        <div className="tr-own-in">
          <header className="tr-own-head">
            <h2 id="tr-own-title">Own projects</h2>
            <p>
              <Pair plain={ownIntro.plain} engineer={ownIntro.engineer} reader={reader} />
            </p>
          </header>
          <ul className="tr-own-list">
            {own.map((item) => (
              <li key={item.name} className="tr-own-item">
                <figure>
                  <OwnView shot={ownNarrow ? item.narrow : item.wide} />
                  <figcaption>
                    <h3>{item.name}</h3>
                    <p className="tr-own-kind">{item.kind}</p>
                    <p className="tr-own-line">
                      <Pair plain={item.plain} engineer={item.engineer} reader={reader} />
                    </p>
                    {item.link && (
                      <p className="tr-own-link">
                        <a href={item.link.href} target="_blank" rel="noreferrer">
                          <span className="tr-own-link-text">{item.link.label}</span>
                          <span aria-hidden="true">↗</span>
                        </a>
                      </p>
                    )}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="tr-end">
        <div className="tr-end-in">
          <p>
            Gentrit Rashiti. Bachelor's degree, UBT. The care and design-system screens are recreations with invented data.
            The other screens come from public pages, store listings and the own projects themselves.
          </p>
          <p className="tr-end-links">
            <a href={`mailto:${links.email}`}>{links.email}</a>
            <a href={links.cv}>Download CV</a>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </p>
        </div>
      </footer>

      {!narrow && (
        <svg className="tr-wire" aria-hidden="true">
          <g ref={wireRef} data-ready="false">
            {[0, 1].map((layer) => (
              <path
                key={`out-${layer}`}
                ref={(element) => {
                  if (element) outRefs.current[layer] = element;
                }}
                className={layer === 0 ? "tr-wire-halo tr-wire-out" : "tr-wire-line tr-wire-out"}
                pathLength={1}
              />
            ))}
            {[0, 1].map((layer) => (
              <path
                key={`in-${layer}`}
                ref={(element) => {
                  if (element) inRefs.current[layer] = element;
                }}
                className={layer === 0 ? "tr-wire-halo tr-wire-in" : "tr-wire-line tr-wire-in"}
                pathLength={1}
              />
            ))}
            {["tr-wire-ring-halo", "tr-wire-ring"].map((name, layer) => (
              <rect
                key={name}
                className={name}
                ref={(element) => {
                  if (element) wireRings.current[layer] = element;
                }}
              />
            ))}
            <circle ref={dotRef} className="tr-wire-dot" r={3.5} />
          </g>
        </svg>
      )}
    </div>
  );
}
