import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Link } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { record, rows, type Box, type FigurePlate, type LivePlate, type Row, type ShotPlate } from "./data";
import "./sampled-frame.css";

const SETTLE_MS = 160;
const FADE_MS = 200;
const SPREAD_MS = 280;
const DRAW_MS = 180;
const RING_MS = 120;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const RECORD = rows.length;

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

const hues = Array.from(new Set(rows.flatMap((row) => (row.hue === null ? [] : [row.hue]))));

/* ---------- Plates ---------- */

function LiveView({ plate, frame, narrow }: { plate: LivePlate; frame: Size; narrow: boolean }) {
  const entry = recreations[plate.key];
  const Recreation = entry.Component;
  const width = narrow ? plate.narrowWidth : plate.width;
  const shift = (narrow ? plate.narrowShift : plate.shift) ?? 0;
  const k = frame.w / width;

  const props = plate.key === "live-room" ? { demoPlaying: false } : {};
  return (
    <div className={`sf-live sf-live-${plate.key}`} data-world={entry.world}>
      <div
        className="sf-live-in"
        style={{
          width,
          height: frame.h / k + shift,
          transform: `scale(${k}) translateY(${-shift}px)`,
        }}
      >
        <Suspense fallback={<div className="sf-wait" />}>
          <Recreation {...props} />
        </Suspense>
      </div>
    </div>
  );
}

function ShotView({ plate, frame, narrow, eager }: { plate: ShotPlate; frame: Size; narrow: boolean; eager: boolean }) {
  const crop = narrow ? plate.narrow : plate.crop;
  const k = frame.w / crop.w;
  return (
    <div className="sf-shot" style={{ background: plate.ground }}>
      <img
        src={plate.src}
        alt={plate.alt}
        width={plate.width}
        height={plate.height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        style={{ width: plate.width * k, left: -crop.x * k, top: -crop.y * k }}
      />
    </div>
  );
}

function FigureView({ plate }: { plate: FigurePlate }) {
  return (
    <div className="sf-fig">
      <div className="sf-fig-in">
        <p className="sf-fig-before">
          <span className="sf-fig-value">{plate.before.value}</span>
          <span className="sf-fig-label">
            <strong>{plate.before.label}</strong>
            {plate.before.note}
          </span>
        </p>
        <p className="sf-fig-after">
          <span className="sf-fig-value">{plate.after.value}</span>
          <span className="sf-fig-label">
            <strong>{plate.after.label}</strong>
            {plate.after.note}
          </span>
        </p>
      </div>
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
}

function targetBox(row: Row, plate: HTMLElement, frame: Size, narrow: boolean): Box | null {
  const { target } = row;
  if (target.kind === "shot") {
    if (row.plate.kind !== "shot") return null;
    const image = plate.querySelector<HTMLImageElement>(".sf-shot img");
    if (!image || !image.complete || image.naturalWidth === 0) return null;
    const crop = narrow ? row.plate.narrow : row.plate.crop;
    const k = frame.w / crop.w;
    const p = plate.getBoundingClientRect();
    return {
      x: p.left + (target.box.x - crop.x) * k,
      y: p.top + (target.box.y - crop.y) * k,
      w: target.box.w * k,
      h: target.box.h * k,
    };
  }
  const elements = target.all
    ? Array.from(plate.querySelectorAll<HTMLElement>(target.css))
    : [plate.querySelector<HTMLElement>(target.css)].filter((element): element is HTMLElement => element !== null);
  const boxes = elements.map((element) => element.getBoundingClientRect()).filter((box) => box.width > 0);
  if (boxes.length === 0) return null;
  const left = Math.min(...boxes.map((box) => box.left));
  const top = Math.min(...boxes.map((box) => box.top));
  const right = Math.max(...boxes.map((box) => box.right));
  const bottom = Math.max(...boxes.map((box) => box.bottom));
  return { x: left, y: top, w: right - left, h: bottom - top };
}

function measureWire(row: Row, rowElement: HTMLElement, plate: HTMLElement, frame: Size, narrow: boolean): Wire | null {
  const mark = rowElement.querySelector<HTMLElement>(".sf-result-ink mark");
  const target = targetBox(row, plate, frame, narrow);
  if (!mark || !target) return null;
  const fragments = mark.getClientRects();
  if (fragments.length === 0) return null;
  const p = plate.getBoundingClientRect();
  const edge = Math.round(p.left);
  const ty = Math.round(target.y + target.h / 2);
  let start: Point;
  let gutter: number;
  if (narrow) {
    const first = fragments[0];
    gutter = 16;
    start = [gutter, Math.round(first.top + first.height / 2)];
  } else {
    const last = fragments[fragments.length - 1];
    start = [Math.round(last.right + 10), Math.round(last.top + last.height / 2)];
    gutter = Math.round(edge - 36);
  }
  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 8 };
  if (target.h < 56) ring.r = Math.min(ring.h / 2, 12);
  let outside: Point[];
  let inside: Point[];
  if (row.lane === undefined) {
    outside = [start, [gutter, start[1]], [gutter, ty], [edge, ty]];
    inside = [[edge, ty], [Math.round(ring.x - 1), ty]];
  } else {
    const rule = plate.querySelector<HTMLElement>(row.lane);
    if (!rule) return null;
    const lane = Math.round(rule.getBoundingClientRect().top);
    const cx = Math.round(target.x + target.w / 2);
    const end = target.y > lane ? Math.round(ring.y - 1) : Math.round(ring.y + ring.h + 1);
    outside = [start, [gutter, start[1]], [gutter, lane], [edge, lane]];
    inside = [[edge, lane], [cx, lane], [cx, end]];
  }
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  return {
    outside: rounded(outside),
    inside: rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start,
    ring,
  };
}

/* ---------- Grounds: one layer for each hue, plus grey ---------- */

function Layers({
  className,
  keyOn,
  register,
}: {
  className: string;
  keyOn: string;
  register: (key: string, node: HTMLElement | null) => void;
}) {
  return (
    <div className={className} aria-hidden="true">
      {hues.map((hue) => (
        <span
          key={hue}
          ref={(node) => register(String(hue), node)}
          className="sf-layer"
          data-on={keyOn === String(hue) || undefined}
          style={{ "--lh": hue } as CSSProperties}
        />
      ))}
      <span ref={(node) => register("none", node)} className="sf-layer sf-layer-none" data-on={keyOn === "none" || undefined} />
    </div>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const narrow = useMedia("(max-width: 1023px)", false);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const rootRef = useRef<HTMLDivElement>(null);
  const wallRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const recordRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLLIElement | null)[]>([]);
  const plateRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [frame, setFrame] = useState<Size>({ w: 0, h: 0 });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [shown, setShown] = useState<{ index: number; mode: Mode }>({ index: 0, mode: "instant" });
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const nextMode = useRef<Mode | null>(null);

  /* The frame's size decides each plate's scale. */
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
  }, []);

  /* Which row is at the reading line. */
  const pinLine = useCallback(() => {
    if (!narrow) return window.innerHeight * 0.42;
    return (wallRef.current?.getBoundingClientRect().bottom ?? 300) + 24;
  }, [narrow]);

  const locate = useCallback(() => {
    const pin = pinLine();
    let index = 0;
    rowRefs.current.forEach((row, i) => {
      if (row && row.getBoundingClientRect().top <= pin) index = i;
    });
    const recordTop = recordRef.current?.getBoundingClientRect().top ?? Infinity;
    if (recordTop <= window.innerHeight * 0.5) index = RECORD;
    activeRef.current = index;
    setActive((was) => (was === index ? was : index));
  }, [pinLine]);

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

  const plateIndex = Math.min(shown.index, RECORD - 1);
  const inRecord = shown.index === RECORD;
  const hue = rows[plateIndex].hue;
  const neutral = inRecord || hue === null;

  /* The plate that leaves stays under the new one until the circle has covered it. */
  const [track, setTrack] = useState<{ index: number; prev: number | null }>({ index: 0, prev: null });
  if (track.index !== plateIndex) {
    setTrack({ index: plateIndex, prev: shown.mode === "instant" ? null : track.index });
  }
  const prev = track.prev;
  useEffect(() => {
    if (prev === null) return;
    const timer = window.setTimeout(() => setTrack((was) => ({ ...was, prev: null })), SPREAD_MS + 40);
    return () => window.clearTimeout(timer);
  }, [prev, track.index]);

  /* A screenshot loads when its row is near. A live plate mounts when its row is first shown, so it draws in view. */
  const nearRows = [active - 1, active, active + 1, plateIndex].filter((i) => i >= 0 && i < RECORD);
  if (!nearRows.every((i) => loaded.has(i))) {
    const next = new Set(loaded);
    nearRows.forEach((i) => next.add(i));
    setLoaded(next);
  }

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 600));
    /* Live plates mount hidden once the page is idle, so their first draw is over before their row is shown. */
    idle(() => {
      const live = rows.flatMap((row, i) => (row.plate.kind === "live" ? [i] : []));
      void Promise.all(
        live.map((i) => {
          const plate = rows[i].plate;
          return plate.kind === "live" ? recreations[plate.key].load() : undefined;
        }),
      ).then(() => setLoaded((was) => new Set([...was, ...live])));
    });
  }, []);

  /* ---------- The colour: one circle spreads from the frame over the field and the wall ---------- */
  const layerNodes = useRef(new Map<string, Set<HTMLElement>>());
  const registerLayer = useCallback((key: string, node: HTMLElement | null) => {
    if (!node) return;
    const set = layerNodes.current.get(key) ?? new Set<HTMLElement>();
    set.forEach((item) => {
      if (!item.isConnected) set.delete(item);
    });
    set.add(node);
    layerNodes.current.set(key, set);
  }, []);
  const layerKey = neutral ? "none" : String(hue);
  const spreadKey = `${layerKey}:${plateIndex}`;
  const lastKey = useRef(spreadKey);

  /* The new screen and its colour arrive together, inside one circle that grows from the frame's centre. */
  useLayoutEffect(() => {
    const previous = lastKey.current;
    lastKey.current = spreadKey;
    if (previous === spreadKey || shown.mode === "instant" || reduced) return;
    const [previousLayer, previousPlate] = previous.split(":");
    const targets: HTMLElement[] = [];
    if (previousLayer !== layerKey) targets.push(...(layerNodes.current.get(layerKey) ?? []));
    const plate = plateRefs.current[plateIndex];
    if (previousPlate !== String(plateIndex) && plate) targets.push(plate);
    const origin = inRecord ? recordRef.current : frameRef.current;
    if (targets.length === 0 || !origin) return;
    const box = origin.getBoundingClientRect();
    const x = Math.round(box.left + box.width / 2);
    const y = Math.round(inRecord ? Math.max(0, box.top) : box.top + box.height / 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)));
    targets.forEach((target) => {
      if (!target.isConnected) return;
      const own = target.getBoundingClientRect();
      const cx = x - Math.round(own.left);
      const cy = y - Math.round(own.top);
      target.animate([{ clipPath: `circle(0px at ${cx}px ${cy}px)` }, { clipPath: `circle(${r}px at ${cx}px ${cy}px)` }], {
        duration: SPREAD_MS,
        easing: EASE_OUT,
      });
    });
  }, [spreadKey, layerKey, plateIndex, inRecord, shown.mode, reduced]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.backgroundColor = neutral ? "oklch(0.95 0 0)" : `oklch(0.95 0.035 ${hue ?? 0})`;
    return () => {
      root.style.backgroundColor = "";
    };
  }, [hue, neutral]);

  /* ---------- The hairline, written to the DOM, not to state ---------- */
  const wireRef = useRef<SVGGElement>(null);
  const outRefs = useRef<SVGPathElement[]>([]);
  const inRefs = useRef<SVGPathElement[]>([]);
  const ringRefs = useRef<SVGRectElement[]>([]);
  const dotRef = useRef<SVGCircleElement>(null);
  const wireIndex = useRef(0);
  const pendingDraw = useRef<Mode | null>(null);
  const armed = useRef(false);

  const draw = useCallback((split: number) => {
    const dot = dotRef.current;
    if (!dot) return;
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
    ringRefs.current.forEach((ring) =>
      ring.animate([{ opacity: 0 }, { opacity: 1 }], { duration: RING_MS, delay: DRAW_MS, easing: EASE_OUT, fill: "backwards" }),
    );
  }, []);

  const updateWire = useCallback(() => {
    const group = wireRef.current;
    const dot = dotRef.current;
    if (!group || !dot) return;
    const index = wireIndex.current;
    const row = rows[index];
    const rowElement = row ? rowRefs.current[index] : null;
    const plate = row ? plateRefs.current[index] : null;
    const wire =
      armed.current && row && rowElement && plate && frame.w > 0 ? measureWire(row, rowElement, plate, frame, narrow) : null;
    const wallBottom = wallRef.current?.getBoundingClientRect().bottom ?? 0;
    const covered = narrow && wire && wire.start[1] < wallBottom + 6;
    if (!wire || covered) {
      group.dataset.ready = "false";
      return;
    }
    group.dataset.ready = "true";
    outRefs.current.forEach((path) => path.setAttribute("d", wire.outside));
    inRefs.current.forEach((path) => path.setAttribute("d", wire.inside));
    dot.setAttribute("cx", String(wire.start[0]));
    dot.setAttribute("cy", String(wire.start[1]));
    ringRefs.current.forEach((ring) => {
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
  }, [frame, narrow, reduced, draw]);

  useEffect(() => {
    let raf = 0;
    const schedule = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
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
    const images = Array.from(document.querySelectorAll(".sf-frame img"));
    images.forEach((image) => image.addEventListener("load", schedule));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
      mutation.disconnect();
      images.forEach((image) => image.removeEventListener("load", schedule));
    };
  }, [updateWire, loaded]);

  /* The first line draws after the first plate has painted. */
  useEffect(() => {
    if (armed.current) return;
    let timer = 0;
    let raf = 0;
    const arm = () => {
      armed.current = true;
      pendingDraw.current = "animate";
      updateWire();
    };
    const wait = () => {
      const plate = plateRefs.current[0];
      if (!plate || frame.w === 0 || !targetBox(rows[0], plate, frame, narrow)) {
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
  }, [reduced, updateWire, frame, narrow]);

  /* A new row: the old line fades, the new screen spreads in, then the new line draws. */
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
    /* The old line leaves before the circle starts, so it never points into the new screen. */
    group.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    group.dataset.ready = "false";
    wireIndex.current = -1;
    const timer = window.setTimeout(() => {
      wireIndex.current = shown.index;
      pendingDraw.current = "animate";
      updateWire();
    }, FADE_MS);
    return () => window.clearTimeout(timer);
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

  const stepOf = (key: string, back: string[], forward: string[]) =>
    back.includes(key) ? -1 : forward.includes(key) ? 1 : key === "Home" ? -99 : key === "End" ? 99 : 0;

  const onLogKey = (event: KeyboardEvent<HTMLOListElement>) => {
    const move = stepOf(event.key, ["ArrowUp"], ["ArrowDown"]);
    if (!move) return;
    event.preventDefault();
    const index = Math.min(RECORD - 1, Math.max(0, plateIndex + move));
    jump(index, "instant");
    rowRefs.current[index]?.querySelector<HTMLElement>(".sf-link")?.focus({ preventScroll: true });
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
    const move = stepOf(event.key, ["ArrowUp", "ArrowLeft"], ["ArrowDown", "ArrowRight"]);
    if (!move) return;
    event.preventDefault();
    const index = Math.min(RECORD - 1, Math.max(0, plateIndex + move));
    jump(index, "instant");
    trayRef.current?.querySelectorAll<HTMLButtonElement>("button")[index]?.focus({ preventScroll: true });
  };

  const current = rows[plateIndex];

  return (
    <div className="sf" ref={rootRef} data-neutral={neutral || undefined} style={{ "--sf-h": hue ?? 0 } as CSSProperties}>
      <title>Gentrit Rashiti, web and mobile developer</title>
      <Layers className="sf-grounds" keyOn={layerKey} register={registerLayer} />

      <main className="sf-main">
        <header className="sf-id">
          <h1>Gentrit Rashiti builds web and mobile apps, from the screens people use to the server behind them.</h1>
          <p className="sf-id-line">
            <span>Part of two platform rewrites. Based in Kosovo, working remotely.</span>
            <span className="sf-id-links">
              <a href={links.cv}>CV</a>
              <a href={`mailto:${links.email}`}>Email</a>
            </span>
          </p>
        </header>

        <ol className="sf-log" aria-label="Seven projects" onKeyDown={onLogKey}>
          {rows.map((row, index) => (
            <li
              key={row.id}
              ref={(element) => {
                rowRefs.current[index] = element;
              }}
              className="sf-row"
              data-current={index === shown.index || undefined}
              onFocus={onRowFocus(index)}
              onClick={onRowClick(index)}
            >
              <div className="sf-row-head">
                <span className="sf-num" aria-hidden="true">
                  {row.id}
                </span>
                <div className="sf-row-name">
                  <h2>
                    <span className="sf-sr">{row.id}. </span>
                    {row.project}
                  </h2>
                  <p className="sf-role">
                    {row.role} · {row.year}
                  </p>
                </div>
              </div>
              <p className="sf-line">{row.line}</p>
              <p className="sf-result">
                <span className="sf-result-base">
                  <mark>
                    <ArrowRightIcon className="sf-result-arrow" weight="bold" aria-hidden="true" />
                    {row.result}
                  </mark>
                </span>
                <span className="sf-result-ink" aria-hidden="true">
                  <mark>
                    <ArrowRightIcon className="sf-result-arrow" weight="bold" />
                    {row.result}
                  </mark>
                </span>
              </p>
              <p className="sf-foot">
                {row.link.external ? (
                  <a className="sf-link" href={row.link.href} target="_blank" rel="noreferrer">
                    {row.link.label}
                    <ArrowUpRightIcon aria-hidden="true" size={16} weight="bold" />
                  </a>
                ) : (
                  <Link className="sf-link" to={row.link.href}>
                    {row.link.label}
                    <ArrowRightIcon aria-hidden="true" size={16} weight="bold" />
                  </Link>
                )}
              </p>
            </li>
          ))}
        </ol>

        <aside className="sf-wall" aria-label="Frame" ref={wallRef}>
          <Layers className="sf-wall-grounds" keyOn={layerKey} register={registerLayer} />
          <div className="sf-wall-in">
            <div className="sf-frame" ref={frameRef}>
              {rows.map((row, index) => {
                const state = index === plateIndex ? "on" : index === prev ? "prev" : "off";
                return (
                  <div
                    key={row.id}
                    ref={(element) => {
                      plateRefs.current[index] = element;
                    }}
                    className="sf-plate"
                    data-state={state}
                    inert={state !== "on" || narrow}
                    aria-hidden={state !== "on"}
                  >
                    {frame.w > 0 && loaded.has(index) ? (
                      row.plate.kind === "live" ? (
                        <LiveView plate={row.plate} frame={frame} narrow={narrow} />
                      ) : row.plate.kind === "shot" ? (
                        <ShotView plate={row.plate} frame={frame} narrow={narrow} eager={index === 0} />
                      ) : (
                        <FigureView plate={row.plate} />
                      )
                    ) : (
                      <div className="sf-wait" />
                    )}
                  </div>
                );
              })}
            </div>
            <div
              className="sf-tray"
              role="toolbar"
              aria-orientation="vertical"
              aria-label="Screens"
              ref={trayRef}
              onKeyDown={onTrayKey}
            >
              {rows.map((row, index) => (
                <button
                  type="button"
                  key={row.id}
                  aria-label={`${row.id}, ${row.project}`}
                  aria-pressed={index === shown.index}
                  tabIndex={index === plateIndex ? 0 : -1}
                  onClick={onSlot(index)}
                >
                  <span>{row.id}</span>
                </button>
              ))}
            </div>
            <div className="sf-caption">
              <p className="sf-count" aria-hidden="true">
                <span>{current.id}</span>
                <span className="sf-count-of">/ 0{rows.length}</span>
              </p>
              <p className="sf-caption-text" aria-live="polite">
                {current.caption}
              </p>
            </div>
          </div>
        </aside>
      </main>

      <section className="sf-record" ref={recordRef} aria-labelledby="sf-record-title">
        <h2 id="sf-record-title">Also on the record</h2>
        <ol>
          {record.map((item) => {
            const inner = (
              <>
                <span className="sf-record-decision">{item.decision}</span>
                <span className="sf-record-project">
                  {item.project} · {item.years}
                </span>
                <span className="sf-record-result">{item.result}</span>
              </>
            );
            return (
              <li key={item.decision}>
                {item.external ? (
                  <a className="sf-record-row" href={item.href} target="_blank" rel="noreferrer">
                    {inner}
                  </a>
                ) : item.href ? (
                  <Link className="sf-record-row" to={item.href}>
                    {inner}
                  </Link>
                ) : (
                  <div className="sf-record-row">{inner}</div>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      <footer className="sf-end">
        <p className="sf-end-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
        <p>
          Gentrit Rashiti. Bachelor's degree, UBT. The care dashboard and the design-system screens are real
          product screens with invented data. The reader screen is a recreation with invented data. The other
          screens come from public pages and store listings. The page takes its colour from the
          screen in the frame. A result with no screen stays grey.
        </p>
      </footer>

      <svg className="sf-wire" aria-hidden="true">
        <g ref={wireRef} data-ready="false">
          {[0, 1].map((layer) => (
            <path
              key={`out-${layer}`}
              ref={(element) => {
                if (element) outRefs.current[layer] = element;
              }}
              className={layer === 0 ? "sf-wire-halo" : "sf-wire-line"}
              pathLength={1}
            />
          ))}
          {[0, 1].map((layer) => (
            <path
              key={`in-${layer}`}
              ref={(element) => {
                if (element) inRefs.current[layer] = element;
              }}
              className={layer === 0 ? "sf-wire-halo" : "sf-wire-line"}
              pathLength={1}
            />
          ))}
          {[0, 1].map((layer) => (
            <rect
              key={`ring-${layer}`}
              ref={(element) => {
                if (element) ringRefs.current[layer] = element;
              }}
              className={layer === 0 ? "sf-wire-ring-halo" : "sf-wire-ring"}
            />
          ))}
          <circle ref={dotRef} className="sf-wire-dot" r={3.5} />
        </g>
      </svg>
    </div>
  );
}
