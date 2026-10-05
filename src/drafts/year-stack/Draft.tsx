import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";
import { Link } from "react-router";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { present, record, sentenceOf, years, type Box, type Plate, type Year } from "./data";
import "./year-stack.css";

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
const SETTLE_MS = 160;

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

/* ---------- Statement ---------- */

const WRITE_MS = 320;
const WORD_MS = 140;

function wordNodes(value: string) {
  const nodes: Node[] = [];
  value
    .split(" ")
    .filter(Boolean)
    .forEach((word, index) => {
      if (index > 0) nodes.push(document.createTextNode(" "));
      const span = document.createElement("span");
      span.textContent = word;
      nodes.push(span);
    });
  return nodes;
}

/** The 2026 words. A line strikes through them when an earlier year is shown. */
function Struck({ text, struck, mode, delay }: { text: string; struck: boolean; mode: Mode; delay: number }) {
  const wasRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const shown = useRef<boolean | null>(null);

  useLayoutEffect(() => {
    const was = wasRef.current;
    const line = lineRef.current;
    if (!was || !line) return;
    line.getAnimations().forEach((animation) => animation.cancel());
    const from = shown.current;
    shown.current = struck;
    if (from === null || from === struck || mode === "instant") {
      was.dataset.struck = String(struck);
      return;
    }
    if (struck) {
      was.dataset.struck = "true";
      line.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: 260,
        delay,
        easing: easeOut,
        fill: "backwards",
      });
      return;
    }
    const retract = line.animate(
      [
        { transform: "scaleX(1)", transformOrigin: "right center" },
        { transform: "scaleX(0)", transformOrigin: "right center" },
      ],
      { duration: 200, delay: delay + 60, easing: easeOut, fill: "forwards" },
    );
    retract.onfinish = () => {
      was.dataset.struck = "false";
      retract.cancel();
    };
  }, [struck, mode, delay]);

  return (
    <span ref={wasRef} className="ys-was">
      {text}
      <span ref={lineRef} className="ys-strike" />
    </span>
  );
}

/**
 * The year's words. Leaving words fade out before they give up their width.
 * New words write in one whole word at a time, so no frame shows a cut glyph.
 */
function Written({ text, mode, delay, className }: { text: string; mode: Mode; delay: number; className: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const painted = useRef<string | null>(null);
  const version = useRef(0);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const v = ++version.current;
    element.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    const from = painted.current;
    const paint = (value: string) => {
      painted.current = value;
      element.replaceChildren(...wordNodes(value));
      element.hidden = value === "";
    };
    if (from === null || mode === "instant") {
      paint(text);
      return;
    }
    if (from === text) return;
    const write = (wait: number) => {
      paint(text);
      const words = Array.from(element.children);
      const stagger = words.length > 1 ? Math.min(60, (WRITE_MS - WORD_MS) / (words.length - 1)) : 0;
      words.forEach((word, index) =>
        word.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: WORD_MS,
          delay: wait + index * stagger,
          easing: easeOut,
          fill: "backwards",
        }),
      );
    };
    if (from === "") {
      write(delay + 200);
      return;
    }
    const fade = element.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 120,
      delay,
      easing: easeOut,
      fill: "forwards",
    });
    fade.onfinish = () => {
      if (version.current !== v) return;
      fade.cancel();
      write(20);
    };
  }, [text, mode, delay]);

  return <span ref={ref} className={className} />;
}

/**
 * Wide: three lines, one clause each; a clause's 2026 words are struck and the
 * year's words end the same line. Narrow: only the first clause is struck, and
 * the year's whole sentence follows under it.
 */
function Statement({ says, mode, narrow }: { says: readonly [string, string, string]; mode: Mode; narrow: boolean }) {
  const isPresent = says.every((clause, index) => clause === present[index]);
  if (narrow) {
    return (
      <span className="ys-lines" aria-hidden="true">
        <span className="ys-line">
          Gentrit Rashiti builds <Struck text={present[0]} struck={!isPresent} mode={mode} delay={0} />
        </span>
        <Written
          className="ys-tail"
          text={isPresent ? present.slice(1).join(" ") : says.join(" ")}
          mode={mode}
          delay={0}
        />
      </span>
    );
  }
  return (
    <span className="ys-lines" aria-hidden="true">
      {present.map((was, index) => (
        <span className="ys-line" key={index}>
          {index === 0 && "Gentrit Rashiti builds "}
          <Struck text={was} struck={says[index] !== was} mode={mode} delay={index * 30} />
          <Written
            className="ys-now"
            text={says[index] === was ? "" : says[index]}
            mode={mode}
            delay={index * 30}
          />
        </span>
      ))}
    </span>
  );
}

/* ---------- Plate and pin ---------- */

function PlateView({ plate, eager }: { plate: Plate; eager: boolean }) {
  if (plate.kind === "care") {
    const entry = recreations.care;
    const Care = entry.Component;
    return (
      <div className="ys-live ys-surface" data-world={entry.world}>
        <Suspense fallback={<div className="ys-wait" />}>
          <Care />
        </Suspense>
      </div>
    );
  }
  const { shot, crop } = plate;
  return (
    <div
      className={`ys-crop ys-crop-${plate.kind} ys-surface`}
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

/** Position inside `root`, from the offset chain. */
function offsetIn(element: HTMLElement, root: HTMLElement): Box | null {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return node === root ? { x, y, w: element.offsetWidth, h: element.offsetHeight } : null;
}

interface PinGeometry {
  outside: string;
  inside: string;
  /** Share of the line drawn outside the plate, for the draw timing. */
  split: number;
  start: Point;
  ring: Box & { r: number };
  width: number;
  height: number;
}

function measurePin(card: HTMLElement, data: Year, wide: boolean): PinGeometry | null {
  const surface = card.querySelector<HTMLElement>(".ys-surface");
  const source = card.querySelector<HTMLElement>(".ys-row:first-child .ys-result span");
  if (!surface || !source) return null;
  const plateBox = offsetIn(surface, card);
  const src = offsetIn(source, card);
  if (!plateBox || !src) return null;
  const image = surface.querySelector<HTMLImageElement>("img");
  const imageBox = image ? offsetIn(image, card) : null;
  let target: Box | null = null;
  const { pin } = data;
  if (pin.target.kind === "selector") {
    const element = surface.querySelector<HTMLElement>(pin.target.css);
    target = element ? offsetIn(element, card) : null;
  } else if (imageBox && imageBox.w > 0) {
    const { box } = pin.target;
    target = {
      x: imageBox.x + box.x * imageBox.w,
      y: imageBox.y + box.y * imageBox.h,
      w: box.w * imageBox.w,
      h: box.h * imageBox.h,
    };
  }
  if (!target || target.w === 0) return null;

  const sy = Math.round(src.y + src.h / 2);
  const gutter = Math.round(plateBox.x - (wide ? 24 : 8));
  const edge = Math.round(plateBox.x);
  const start: Point = wide ? [Math.round(src.x + src.w + 12), sy] : [gutter, sy];
  const outside: Point[] = wide ? [start, [gutter, sy]] : [start];
  const inside: Point[] = [];
  const cx = Math.round(target.x + target.w / 2);
  if (pin.route.kind === "side") {
    const ty = Math.round(target.y + target.h / 2);
    outside.push([gutter, ty], [edge, ty]);
    inside.push([edge, ty], [Math.round(target.x - 6), ty]);
  } else {
    let lane: number | null = null;
    if ("along" in pin.route) {
      const rule = surface.querySelector<HTMLElement>(pin.route.along);
      const box = rule ? offsetIn(rule, card) : null;
      lane = box ? Math.round(box.y) : null;
    } else if (imageBox) {
      lane = Math.round(imageBox.y + pin.route.y * imageBox.h);
    }
    if (lane === null) return null;
    const end = target.y > lane ? Math.round(target.y - 6) : Math.round(target.y + target.h + 6);
    outside.push([gutter, lane], [edge, lane]);
    inside.push([edge, lane], [cx, lane], [cx, end]);
  }
  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 0 };
  ring.r = pin.pill ? ring.h / 2 : 6;
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  return {
    outside: rounded(outside),
    inside: rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start,
    ring,
    width: card.offsetWidth,
    height: card.offsetHeight,
  };
}

const PIN_MS = 180;

function YearCard({
  data,
  index,
  current,
  wide,
  reduced,
  onFocusCard,
}: {
  data: Year;
  index: number;
  current: boolean;
  wide: boolean;
  reduced: boolean;
  onFocusCard: (index: number) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [geometry, setGeometry] = useState<PinGeometry | null>(null);
  const [draw, setDraw] = useState<"none" | "animate" | "static">("none");
  const signature = useRef("");

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measurePin(card, data, wide);
        const key = JSON.stringify(next);
        if (key === signature.current) return;
        signature.current = key;
        setGeometry(next);
      });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(card);
    const plate = card.querySelector(".ys-plate");
    const mutation = new MutationObserver(measure);
    if (plate) mutation.observe(plate, { subtree: true, childList: true, characterData: true });
    card.querySelectorAll("img").forEach((image) => image.addEventListener("load", measure));
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      card.querySelectorAll("img").forEach((image) => image.removeEventListener("load", measure));
    };
  }, [data, wide]);

  // The pin draws once, the first time its card is current.
  if (current && geometry !== null && draw === "none") {
    setDraw(reduced ? "static" : "animate");
  }

  const { plate, link } = data;
  const timing = geometry
    ? ({
        "--pin-out": `${Math.round(PIN_MS * geometry.split)}ms`,
        "--pin-in": `${Math.round(PIN_MS * (1 - geometry.split))}ms`,
      } as CSSProperties)
    : undefined;
  return (
    <li className="ys-slot" style={{ "--i": index } as CSSProperties}>
      <div
        ref={cardRef}
        id={`y${data.year}`}
        className="ys-card"
        data-plate={plate.kind}
        data-current={current || undefined}
        role="group"
        aria-labelledby={`ys-year-${data.year}`}
        onFocus={() => onFocusCard(index)}
      >
        <h2 className="ys-year" id={`ys-year-${data.year}`}>
          {data.year}
        </h2>
        <p className="ys-sr">
          In {data.year}, {sentenceOf(data.says)}
        </p>
        <figure className="ys-figure">
          <div className={`ys-plate ys-plate-${plate.kind}`}>
            <PlateView plate={plate} eager={index === 0} />
          </div>
          <figcaption className="ys-caption">{plate.caption}</figcaption>
        </figure>
        <ol className="ys-rows">
          {data.rows.map((row) => (
            <li className="ys-row" key={row.decision}>
              {row.project && <span className="ys-project">{row.project}</span>}
              <span className="ys-decision">{row.decision}</span>
              <span className="ys-result">
                <span>{row.result}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="ys-foot">
          {link.external ? (
            <a className="ys-link" href={link.href} target="_blank" rel="noreferrer">
              {link.label}
              <ArrowUpRightIcon aria-hidden="true" size={15} weight="regular" />
            </a>
          ) : (
            <Link className="ys-link" to={link.href}>
              {link.label} <span aria-hidden="true">→</span>
            </Link>
          )}
        </p>
        {geometry && draw !== "none" && (
          <svg
            className="ys-pin"
            data-draw={draw}
            data-tone={plate.kind === "web" && plate.dark ? "dark" : "light"}
            width={geometry.width}
            height={geometry.height}
            style={timing}
            aria-hidden="true"
          >
            <path className="ys-pin-halo ys-pin-out" d={geometry.outside} pathLength={1} />
            <path className="ys-pin-line ys-pin-out" d={geometry.outside} pathLength={1} />
            <path className="ys-pin-halo ys-pin-in" d={geometry.inside} pathLength={1} />
            <path className="ys-pin-line ys-pin-in" d={geometry.inside} pathLength={1} />
            <rect
              className="ys-pin-ring"
              x={geometry.ring.x}
              y={geometry.ring.y}
              width={geometry.ring.w}
              height={geometry.ring.h}
              rx={geometry.ring.r}
            />
            <circle className="ys-pin-start" cx={geometry.start[0]} cy={geometry.start[1]} r={3} />
          </svg>
        )}
      </div>
    </li>
  );
}

/* ---------- Page ---------- */

interface Track {
  /** The scroll offset from which each card is current. */
  marks: number[];
  /** The scroll offset that shows each card whole. */
  jumps: number[];
}

/**
 * Wide: every card sticks from the first frame, the newer one on top and each
 * older one a step lower, so the stack shows as a pile. A card stays until its
 * slot ends, then scrolls away and shows the older card under it. Each slot is
 * one dwell taller than the pile needs, so a card shows whole only after the
 * newer card has gone under the statement.
 */
function measureTrack(stack: HTMLElement, wide: boolean, barHeight: number): Track {
  const slots = Array.from(stack.children) as HTMLElement[];
  const cards = slots.map((slot) => slot.firstElementChild as HTMLElement);
  const tops = slots.map((slot) => slot.getBoundingClientRect().top + window.scrollY);
  if (!wide || cards.length === 0) {
    return {
      marks: tops.map((top, k) => (k === 0 ? -Infinity : top - window.innerHeight * 0.5)),
      jumps: tops.map((top) => Math.max(0, top - barHeight - 8)),
    };
  }
  const stuck = cards.map((card) => parseFloat(getComputedStyle(card).top) || 0);
  const releases = cards.map((card, k) => tops[0] - stuck[k] + slots[k].offsetHeight - card.offsetHeight);
  const footInset = parseFloat(getComputedStyle(cards[0]).paddingBottom) || 0;
  return {
    // A card is current once the newer card's link has gone under the statement.
    marks: cards.map((_, k) =>
      k === 0 ? -Infinity : releases[k - 1] + stuck[k - 1] + cards[k - 1].offsetHeight - barHeight - footInset,
    ),
    jumps: releases.map((release) => Math.max(0, release)),
  };
}

function Record() {
  return (
    <section className="ys-record" aria-labelledby="ys-record-title">
      <h2 className="ys-record-title" id="ys-record-title">
        Also on the record
      </h2>
      <ol className="ys-record-rows">
        {record.map((row) => (
          <li className="ys-record-row" key={row.project}>
            <span className="ys-record-year">{row.year}</span>
            <span className="ys-record-project">{row.project}</span>
            <span className="ys-record-decision">{row.decision}</span>
            <span className="ys-record-result">{row.result}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const stackRef = useRef<HTMLOListElement>(null);
  const barRef = useRef<HTMLElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const track = useRef<Track>({ marks: [], jumps: [] });
  const [current, setCurrent] = useState(0);
  const currentRef = useRef(0);
  const [said, setSaid] = useState<{ index: number; mode: Mode }>({ index: 0, mode: "instant" });
  const instantNext = useRef(false);
  const { scrollY } = useScroll();

  const locate = useCallback((y: number) => {
    let index = 0;
    track.current.marks.forEach((mark, i) => {
      if (y >= mark) index = i;
    });
    currentRef.current = index;
    setCurrent((previous) => (previous === index ? previous : index));
  }, []);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const measure = () => {
      track.current = measureTrack(stack, wide, barRef.current?.offsetHeight ?? 0);
      locate(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stack);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [locate, wide]);

  useMotionValueEvent(scrollY, "change", locate);

  useEffect(() => {
    if (said.index === current) return;
    if (instantNext.current || reduced) {
      instantNext.current = false;
      setSaid({ index: current, mode: "instant" });
      return;
    }
    const timer = window.setTimeout(() => setSaid({ index: current, mode: "animate" }), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [current, said.index, reduced]);

  const jump = (index: number, instant: boolean) => {
    instantNext.current = instant;
    const root = rootRef.current;
    if (instant && root) {
      root.dataset.instant = "";
      requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.instant));
    }
    window.scrollTo({ top: track.current.jumps[index] ?? 0, behavior: "instant" });
    locate(window.scrollY);
  };

  const onYear = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    jump(index, event.detail === 0);
  };

  const onYearKey = (event: KeyboardEvent<HTMLElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "Home" ? -99 : event.key === "End" ? 99 : 0;
    if (!step) return;
    event.preventDefault();
    const index = Math.min(years.length - 1, Math.max(0, current + step));
    jump(index, true);
    event.currentTarget.querySelectorAll<HTMLAnchorElement>("a")[index]?.focus({ preventScroll: true });
  };

  // A covered card that takes focus comes to the top of the pile, with no travel.
  const onFocusCard = (index: number) => {
    if (wide && index !== currentRef.current) jump(index, true);
  };

  const mode: Mode = reduced ? "instant" : said.mode;

  return (
    <div className="ys" ref={rootRef}>
      <title>Year stack — Gentrit Rashiti</title>
      <header className="ys-bar" ref={barRef}>
        <div className="ys-bar-in">
          <h1 className="ys-say">
            <span className="ys-sr">{sentenceOf(present)}</span>
            <Statement says={years[said.index].says} mode={mode} narrow={!wide} />
          </h1>
          {wide && (
            <nav className="ys-years" aria-label="Years" onKeyDown={onYearKey}>
              {years.map((year, index) => (
                <a
                  key={year.year}
                  href={`#y${year.year}`}
                  aria-current={index === current ? "true" : undefined}
                  tabIndex={index === current ? 0 : -1}
                  onClick={onYear(index)}
                >
                  {year.year}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main>
        <ol className="ys-stack" ref={stackRef} style={{ "--count": years.length } as CSSProperties}>
          {years.map((year, index) => (
            <YearCard
              key={year.year}
              data={year}
              index={index}
              current={index === current}
              wide={wide}
              reduced={reduced}
              onFocusCard={onFocusCard}
            />
          ))}
        </ol>
        <Record />
      </main>

      <footer className="ys-foot-page">
        <p className="ys-foot-who">Gentrit Rashiti. Bachelor's degree, UBT. Based in Kosovo, working remotely.</p>
        <p className="ys-foot-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <Link to="/">All 30 projects →</Link>
        </p>
        <p className="ys-foot-note">
          No screenshots of client work: the care screen is a recreation with invented data. The other screens come
          from public web pages and store listings.
        </p>
      </footer>
    </div>
  );
}
