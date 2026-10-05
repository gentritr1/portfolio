import {
  Fragment,
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
import { Link, useLocation } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon, CheckIcon, XIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { leadRows, moreRows, type Box, type Plate, type Row, type Shot, type Target } from "./data";
import { Own } from "./Own";
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

/* The two faces are asked for before the first render. Text never waits for them. */
for (const face of ["PublicSans-Latin", "BigShouldersDisplay-Latin"]) {
  const href = `/fonts/creative/${face}.woff2`;
  if (!document.head.querySelector(`link[rel="preload"][href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    link.href = href;
    document.head.append(link);
  }
}

/* The first hairline starts at a word, so it waits for the faces, but never longer than this. */
const FONT_WAIT_MS = 300;

function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    const show = () => {
      if (live) setReady(true);
    };
    const timer = window.setTimeout(show, FONT_WAIT_MS);
    void document.fonts.ready.then(show, show);
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, []);
  return ready;
}

/* ---------- Plates ---------- */

const liveKeys = { "design-system": recreations["design-system"], care: recreations.care };

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
    <div ref={ref} className={`pj-live pj-live-${which}`} data-world={entry.world}>
      <Suspense fallback={<div className="pj-wait" />}>
        <Live />
      </Suspense>
    </div>
  );
}

const markLoaded = (image: HTMLImageElement | null) => {
  if (image?.complete && image.naturalWidth > 0) image.dataset.loaded = "";
};

function ShotView({ shot, crop, eager }: { shot: Shot; crop: Box; eager: boolean }) {
  return (
    <div
      className="pj-shot"
      style={{ aspectRatio: `${Math.round(crop.w * shot.width)} / ${Math.round(crop.h * shot.height)}` }}
    >
      <img
        ref={markLoaded}
        onLoad={(event) => markLoaded(event.currentTarget)}
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
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

function ReportPlate({ before, after }: { before: number; after: number }) {
  const lanes = [
    { key: "before", label: "Before", count: before, end: "Gave up", Icon: XIcon },
    { key: "now", label: "Now", count: after, end: "Finished", Icon: CheckIcon },
  ] as const;
  return (
    <figure className="pj-report">
      <figcaption className="pj-report-head">One billing report · requests to the database</figcaption>
      {lanes.map(({ key, label, count, end, Icon }) => (
        <div key={key} className="pj-report-lane" data-lane={key}>
          <p className="pj-report-label">{label}</p>
          <p className="pj-report-n">{count}</p>
          <p className="pj-report-cells" aria-hidden="true">
            {Array.from({ length: before }, (_, i) => (
              <span key={i} data-gone={i >= count || undefined} />
            ))}
            {key === "now" && (
              <span className="pj-report-fill">
                {Array.from({ length: before }, (_, i) => (
                  <span key={i} />
                ))}
              </span>
            )}
          </p>
          <p className="pj-report-end">
            <Icon aria-hidden="true" weight="bold" />
            {end}
          </p>
        </div>
      ))}
    </figure>
  );
}

/** Grows a narrow crop from its top edge and around its centre line until it is as wide as the frame, so the frame never shows it above its source pixels. */
function fitCrop(shot: Shot, frameWidth: number): Box {
  const { width: W, height: H } = shot;
  const wide = shot.narrowWide;
  const box = wide && frameWidth >= 0.85 * wide.w * W ? wide : shot.narrow;
  const bounds = shot.bounds ?? { x: 0, y: 0, w: 1, h: 1 };
  const ratio = (box.w * W) / (box.h * H);
  const most = Math.min(bounds.w * W, bounds.h * H * ratio);
  const w = Math.min(most, Math.max(box.w * W, frameWidth));
  const h = w / ratio;
  const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);
  const x = clamp((box.x + box.w / 2) * W - w / 2, bounds.x * W, (bounds.x + bounds.w) * W - w);
  const y = clamp(box.y * H, bounds.y * H, (bounds.y + bounds.h) * H - h);
  return { x: x / W, y: y / H, w: w / W, h: h / H };
}

function StoreList({ className, stores }: { className: string; stores: { label: string; href: string }[] }) {
  return (
    <ul className={className}>
      {stores.map((store) => (
        <li key={store.href}>
          <a href={store.href} target="_blank" rel="noreferrer">
            {store.label}
            <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/** The web page and a store frame side by side, with the three places a member subscribes. */
function DuoPlate({ plate, load, narrow }: { plate: Extract<Plate, { kind: "duo" }>; load: boolean; narrow: boolean }) {
  const store = narrow ? plate.store.narrow : plate.store.crop;
  return (
    <div className="pj-duo" style={{ background: plate.ground }}>
      {!narrow && <div className="pj-duo-web">{load && <ShotView shot={plate.web} crop={plate.web.crop} eager />}</div>}
      <div className="pj-duo-side">
        <p className="pj-duo-kicker">{plate.kicker}</p>
        <StoreList className="pj-duo-stores" stores={plate.stores} />
      </div>
      <div
        className="pj-duo-store"
        style={{ aspectRatio: `${Math.round(store.w * plate.store.width)} / ${Math.round(store.h * plate.store.height)}` }}
      >
        {load && <ShotView shot={plate.store} crop={store} eager />}
      </div>
    </div>
  );
}

const WIPE: KeyframeAnimationOptions = { duration: 300, easing: "cubic-bezier(0.77, 0, 0.175, 1)", fill: "both" };

/** One screen from each store listing. A new platform wipes in over the old one, from the side its pill sits on. */
function PairPlate({
  plate,
  platform,
  load,
  narrow,
  reduced,
}: {
  plate: Extract<Plate, { kind: "pair" }>;
  platform: number;
  load: boolean;
  narrow: boolean;
  reduced: boolean;
}) {
  const [layers, setLayers] = useState<{ top: number; under: number | null }>({ top: platform, under: null });
  const shown = useRef(platform);
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const edgeRef = useRef<HTMLSpanElement>(null);
  const running = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    const from = shown.current;
    if (from === platform) return;
    shown.current = platform;
    const settle = () => {
      const done = running.current;
      running.current = [];
      setLayers({ top: platform, under: null });
      requestAnimationFrame(() => done.forEach((animation) => animation.cancel()));
    };
    const [reveal, edge] = running.current;
    // A second press during a wipe plays the same wipe back from where it is.
    if (reveal && reveal.playState === "running") {
      reveal.reverse();
      edge?.reverse();
      reveal.onfinish = settle;
      return;
    }
    const layer = layerRefs.current[platform];
    const box = boxRef.current;
    const line = edgeRef.current;
    if (reduced || !layer || !box || !line) {
      setLayers({ top: platform, under: null });
      return;
    }
    setLayers({ top: platform, under: from });
    const width = box.offsetWidth;
    const fromRight = platform > from;
    const wipeIn = layer.animate(
      { clipPath: fromRight ? ["inset(0 0 0 100%)", "inset(0 0 0 0)"] : ["inset(0 100% 0 0)", "inset(0 0 0 0)"] },
      WIPE,
    );
    const lineMove = line.animate(
      {
        transform: fromRight ? [`translateX(${width}px)`, "translateX(0px)"] : ["translateX(0px)", `translateX(${width}px)`],
        opacity: [1, 1],
      },
      { ...WIPE, fill: "none" },
    );
    running.current = [wipeIn, lineMove];
    wipeIn.onfinish = settle;
  }, [platform, reduced]);

  const first = plate.platforms[0].shot;
  const crop = narrow ? first.narrow : first.crop;
  const mark = narrow ? plate.narrowMark : plate.mark;
  return (
    <div className="pj-phone">
      <div className="pj-phone-side">
        <p className="pj-phone-kicker">{plate.kicker}</p>
        <StoreList className="pj-stores" stores={plate.platforms.map((item) => item.store)} />
      </div>
      <div
        ref={boxRef}
        className="pj-pair-box"
        style={{ aspectRatio: `${Math.round(crop.w * first.width)} / ${Math.round(crop.h * first.height)}` }}
      >
        {plate.platforms.map((item, index) => (
          <div
            key={item.label}
            ref={(element) => {
              layerRefs.current[index] = element;
            }}
            className="pj-pair-layer"
            data-on={index === layers.top || undefined}
            data-leaving={index === layers.under || undefined}
            aria-hidden={index === platform ? undefined : true}
          >
            {load && <ShotView shot={item.shot} crop={narrow ? item.shot.narrow : item.shot.crop} eager={false} />}
          </div>
        ))}
        <span ref={edgeRef} className="pj-pair-edge" aria-hidden="true" />
        <span
          className="pj-pair-mark"
          aria-hidden="true"
          style={{ left: `${mark.x * 100}%`, top: `${mark.y * 100}%`, width: `${mark.w * 100}%`, height: `${mark.h * 100}%` }}
        />
      </div>
    </div>
  );
}

function PlateView({
  plate,
  load,
  narrow,
  eager,
  frameWidth,
  platform,
  reduced,
}: {
  plate: Plate;
  load: boolean;
  narrow: boolean;
  eager: boolean;
  frameWidth: number;
  platform: number;
  reduced: boolean;
}) {
  if (plate.kind === "duo") return <DuoPlate plate={plate} load={load} narrow={narrow} />;
  if (plate.kind === "pair")
    return <PairPlate plate={plate} platform={platform} load={load} narrow={narrow} reduced={reduced} />;
  if (plate.kind === "live") return load ? <LivePlate which={plate.key} /> : <div className="pj-wait" />;
  if (plate.kind === "report") return <ReportPlate before={plate.before} after={plate.after} />;
  const crop = narrow ? fitCrop(plate.shot, frameWidth) : plate.shot.crop;
  const shot = load && <ShotView shot={plate.shot} crop={crop} eager={eager} />;
  if (plate.kind === "phone") {
    return (
      <div className="pj-phone">
        <div className="pj-phone-side">
          <p className="pj-phone-kicker">{plate.kicker}</p>
          <StoreList className="pj-stores" stores={plate.stores} />
        </div>
        {shot}
      </div>
    );
  }
  return (
    <div className="pj-web" style={{ background: plate.ground }}>
      {shot}
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

function targetBox(target: Target, plate: HTMLElement): Box | null {
  if (target.kind === "shot") {
    const image = plate.querySelector<HTMLImageElement>(".pj-shot img");
    if (!image?.complete || image.naturalWidth === 0) return null;
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
  const target = targetBox(narrow ? (row.narrowTarget ?? row.target) : row.target, plate);
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
  if (row.target.kind === "selector" && row.target.round) ring.r = ring.h / 2;
  if (narrow) ring.r = Math.min(ring.r, 8);
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  return {
    outside: rounded(outside),
    inside: rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start,
    ring,
    tone:
      row.plate.kind === "report"
        ? "field"
        : row.plate.kind === "duo" || (row.plate.kind === "web" && row.plate.dark)
          ? "dark"
          : "light",
  };
}

/* ---------- A log: rows at the left, one pinned frame at the right ---------- */

function lineOf(row: Row, platform: number, choose: (index: number) => void, frameId: string): ReactNode {
  if (row.plate.kind !== "pair") return row.line;
  const labels = row.plate.platforms.map((item) => item.label);
  const start = row.line.indexOf(labels[0]);
  const last = labels[labels.length - 1];
  const end = row.line.indexOf(last) + last.length;
  if (start < 0 || end < start) return row.line;
  return (
    <>
      {row.line.slice(0, start)}
      <span className="pj-pills">
        {row.plate.platforms.map((item, index) => (
          <Fragment key={item.label}>
            {index > 0 && " and "}
            <button
              type="button"
              className="pj-pill"
              aria-pressed={index === platform}
              aria-controls={frameId}
              onClick={() => choose(index)}
            >
              {item.label}
            </button>
          </Fragment>
        ))}
        {row.line.slice(end)}
      </span>
    </>
  );
}

function Log({
  id,
  rows,
  head,
  last,
  lazy,
  narrow,
  reduced,
  fontsReady,
}: {
  id: string;
  rows: Row[];
  head: ReactNode;
  /** The last log: at the end of the page its last row is current. */
  last: boolean;
  /** The log loads and draws only when it comes near the screen. */
  lazy: boolean;
  narrow: boolean;
  reduced: boolean;
  fontsReady: boolean;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [shown, setShown] = useState<{ index: number; mode: Mode }>({ index: 0, mode: "instant" });
  const [loaded, setLoaded] = useState<Set<number>>(() => (lazy ? new Set() : new Set([0])));
  const [near, setNear] = useState(!lazy);
  const [inView, setInView] = useState(!lazy);
  const [platform, setPlatform] = useState(0);
  const nextMode = useRef<Mode | null>(null);
  const frameId = `${id}-frame`;

  /* A later log loads when it is one screen away, and draws its first line when its frame is in view. */
  useEffect(() => {
    if (!lazy) return;
    const root = rootRef.current;
    const frame = frameRef.current;
    if (!root || !frame) return;
    const nearby = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          nearby.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          seen.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    nearby.observe(root);
    seen.observe(frame);
    return () => {
      nearby.disconnect();
      seen.disconnect();
    };
  }, [lazy]);

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
    const end = document.documentElement.scrollHeight - window.innerHeight;
    if (last && end > 0 && window.scrollY >= end - 2) index = rows.length - 1;
    activeRef.current = index;
    setActive((was) => (was === index ? was : index));
  }, [pinLine, last, rows.length]);

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
  const nearRows = near
    ? [active - 1, active, active + 1, shown.index].filter(
        (i) => i >= 0 && i < rows.length && (rows[i].plate.kind !== "live" || i === shown.index),
      )
    : [];
  if (!nearRows.every((i) => loaded.has(i))) {
    const next = new Set(loaded);
    nearRows.forEach((i) => next.add(i));
    setLoaded(next);
  }

  /* The frame draws the plate at one size and scales it to its width. */
  const [frameWidth, setFrameWidth] = useState(0);
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const fit = () => {
      screen.style.setProperty("--k", String(screen.clientWidth / STAGE_W));
      setFrameWidth(Math.ceil(screen.clientWidth));
    };
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

  const draw = useCallback((split: number, ringOnly: boolean) => {
    const out = outRefs.current;
    const inner = inRefs.current;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;
    if (ringOnly) {
      ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RING_MS, easing: EASE_OUT, fill: "backwards" });
      return;
    }
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
    if (!wire) {
      group.dataset.ready = "false";
      return;
    }
    group.dataset.ready = "true";
    group.dataset.tone = wire.tone;
    group.dataset.narrow = String(narrow);
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
      if (mode === "animate" && !reduced) draw(wire.split, narrow);
    }
  }, [rows, narrow, reduced, draw]);

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
    const images = Array.from(frameElement?.querySelectorAll("img") ?? []);
    images.forEach((image) => image.addEventListener("load", schedule));
    document.fonts.addEventListener("loadingdone", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      mutation.disconnect();
      images.forEach((image) => image.removeEventListener("load", schedule));
      document.fonts.removeEventListener("loadingdone", schedule);
    };
  }, [updateWire, loaded]);

  /* The first line draws after the first plate has faded in. */
  useEffect(() => {
    if (armed.current || !fontsReady || !inView) return;
    let timer = 0;
    let frame = 0;
    const arm = () => {
      armed.current = true;
      pendingDraw.current = "animate";
      updateWire();
    };
    const wait = () => {
      const plate = plateRefs.current[0];
      if (!plate || !targetBox(narrow ? (rows[0].narrowTarget ?? rows[0].target) : rows[0].target, plate)) {
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
  }, [rows, reduced, narrow, fontsReady, inView, updateWire]);

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
      window.scrollTo({ top: index === 0 && !lazy ? 0 : top, behavior: "instant" });
      locate();
      if (activeRef.current === index) {
        nextMode.current = null;
        setShown((was) => (was.index === index ? was : { index, mode: reduced ? "instant" : mode }));
      }
    },
    [locate, pinLine, reduced, lazy],
  );

  const onLogKey = (event: KeyboardEvent<HTMLOListElement>) => {
    const step =
      event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : event.key === "Home" ? -99 : event.key === "End" ? 99 : 0;
    if (!step) return;
    event.preventDefault();
    const index = Math.min(rows.length - 1, Math.max(0, shown.index + step));
    jump(index, "instant");
    const row = rowRefs.current[index];
    (row?.querySelector<HTMLElement>(".pj-link") ?? row?.querySelector<HTMLElement>("h2, h3"))?.focus({ preventScroll: true });
  };

  const onRowFocus = (index: number) => (event: FocusEvent<HTMLLIElement>) => {
    if (index !== activeRef.current && event.target.matches(":focus-visible")) jump(index, "instant");
  };

  const onRowClick = (index: number) => (event: MouseEvent<HTMLLIElement>) => {
    if ((event.target as HTMLElement).closest("a")) return;
    if (index !== shown.index) jump(index, "animate");
  };

  const Heading = lazy ? "h3" : "h2";
  const current = rows[shown.index];
  const caption = current.plate.kind === "pair" ? current.plate.platforms[platform].caption : current.caption;

  return (
    <section className={`pj-main pj-${id}`} ref={rootRef} aria-labelledby={`${id}-title`}>
      <header className="pj-id">{head}</header>

      <ol className="pj-log" aria-label={`${rows.length} projects`} start={Number(rows[0].id)} onKeyDown={onLogKey}>
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
                <Heading tabIndex={row.link ? undefined : -1}>
                  <span className="pj-sr">{row.id}. </span>
                  {row.project}
                </Heading>
                <p className="pj-role">
                  {row.role}
                  <span className="pj-year">
                    <span className="pj-dot"> · </span>
                    {row.year}
                  </span>
                </p>
              </div>
            </div>
            <p className="pj-line">{lineOf(row, platform, setPlatform, frameId)}</p>
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
            {row.link && (
              <p className="pj-foot">
                {row.live && (
                  <a className="pj-link" href={row.live.href} target="_blank" rel="noreferrer">
                    {row.live.label}
                    <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
                  </a>
                )}
                {row.link.external ? (
                  <a className="pj-link" href={row.link.href} target="_blank" rel="noreferrer">
                    {row.link.label}
                    <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
                  </a>
                ) : (
                  <Link className="pj-link" to={row.link.href}>
                    {row.link.label}
                    <span className="pj-sr">: {row.project}</span>
                    <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
                  </Link>
                )}
              </p>
            )}
          </li>
        ))}
      </ol>

      <aside className="pj-frame-wrap" aria-label="Frame">
        <div className="pj-frame" ref={frameRef} id={frameId}>
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
                    inert={state !== "on" || narrow || (row.plate.kind === "live" && row.plate.key === "design-system")}
                    aria-hidden={state !== "on"}
                  >
                    <PlateView
                      plate={row.plate}
                      load={loaded.has(index)}
                      narrow={narrow}
                      eager={index === 0 && !lazy}
                      frameWidth={frameWidth}
                      platform={platform}
                      reduced={reduced}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pj-caption">
            <p className="pj-caption-text" aria-live="polite">
              {caption}
              {current.recreation && <span className="pj-rec"> Recreation · invented data.</span>}
            </p>
          </div>
        </div>
      </aside>

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
    </section>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const narrow = useMedia("(max-width: 1023px)", false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const fontsReady = useFontsReady();
  const home = useLocation().pathname === "/";

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 600));
    idle(() => {
      void recreations.care.load();
      void recreations["design-system"].load();
    });
  }, []);

  return (
    <div className="pj">
      <title>{home ? "Gentrit Rashiti — web, mobile & full stack" : "Projector — Gentrit Rashiti"}</title>
      <main>
        <Log
          id="lead"
          rows={leadRows}
          last={false}
          lazy={false}
          narrow={narrow}
          reduced={reduced}
          fontsReady={fontsReady}
          head={
            <>
              <h1 id="lead-title">Gentrit Rashiti builds web and mobile apps that people subscribe to, shop in and read in.</h1>
              <p className="pj-id-line">
                <span>5+ years. Part of two platform rewrites. Based in Kosovo, working remotely.</span>
                <span className="pj-id-links">
                  <a href={links.cv}>CV (PDF)</a>
                  <a href={`mailto:${links.email}`}>Email</a>
                </span>
              </p>
            </>
          }
        />

        <Own narrow={narrow} reduced={reduced} />

        <Log
          id="more"
          rows={moreRows}
          last
          lazy
          narrow={narrow}
          reduced={reduced}
          fontsReady={fontsReady}
          head={
            <>
              <h2 id="more-title" className="pj-band-title">
                More client work
              </h2>
              <p className="pj-line">Four more client projects, 2021–26.</p>
            </>
          }
        />
      </main>

      <footer className="pj-end">
        <p>
          Gentrit Rashiti. Bachelor's degree, UBT, Kosovo. The care and
          design-system screens are recreations with invented data. The other screens are public pages, store listings
          and own projects.
        </p>
        <p className="pj-end-links">
          <a href={`mailto:${links.email}`}>
            <span className="pj-end-wide">{links.email}</span>
            <span className="pj-end-short">Email</span>
          </a>
          <a href={links.cv}>Download CV (PDF)</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
      </footer>
    </div>
  );
}
