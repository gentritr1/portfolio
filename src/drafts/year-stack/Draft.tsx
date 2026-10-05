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
import { present, sentenceOf, years, type Box, type Plate, type Year } from "./data";
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

interface ClauseState {
  struck: boolean;
  now: string | null;
}

const clip = {
  hidden: "inset(-0.3em 100% -0.3em -0.1em)",
  shown: "inset(-0.3em -0.2em -0.3em -0.1em)",
};

/**
 * One clause of the statement. The present (2026) words stay in place; on a
 * wide screen they are struck when an earlier year is shown and that year's
 * words write in after them, so every edit ends the line and nothing else moves.
 */
function Clause({ was, target, index, mode, narrow }: { was: string; target: string; index: number; mode: Mode; narrow: boolean }) {
  const wasRef = useRef<HTMLSpanElement>(null);
  const strikeRef = useRef<HTMLSpanElement>(null);
  const nowRef = useRef<HTMLSpanElement>(null);
  const shown = useRef<{ state: ClauseState; narrow: boolean } | null>(null);
  const version = useRef(0);

  useLayoutEffect(() => {
    const wasEl = wasRef.current;
    const strike = strikeRef.current;
    const now = nowRef.current;
    if (!wasEl || !strike || !now) return;
    const next: ClauseState = narrow
      ? { struck: false, now: target }
      : target === was
        ? { struck: false, now: null }
        : { struck: true, now: target };
    const v = ++version.current;
    for (const element of [wasEl, strike, now]) element.getAnimations().forEach((animation) => animation.cancel());

    const paint = (state: ClauseState) => {
      wasEl.hidden = narrow;
      wasEl.dataset.struck = String(state.struck);
      now.textContent = state.now ?? "";
      now.hidden = state.now === null;
    };

    const previous = shown.current;
    shown.current = { state: next, narrow };
    if (!previous || previous.narrow !== narrow || mode === "instant") {
      paint(next);
      return;
    }
    const from = previous.state;
    paint(from);
    const delay = index * 30;

    if (!from.struck && next.struck) {
      wasEl.dataset.struck = "true";
      strike.animate([{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }], {
        duration: 260,
        delay,
        easing: easeOut,
        fill: "backwards",
      });
    }
    if (from.struck && !next.struck) {
      const retract = strike.animate(
        [
          { transform: "scaleX(1)", transformOrigin: "right center" },
          { transform: "scaleX(0)", transformOrigin: "right center" },
        ],
        { duration: 200, delay: delay + 60, easing: easeOut, fill: "forwards" },
      );
      retract.onfinish = () => {
        if (version.current !== v) return;
        wasEl.dataset.struck = "false";
        retract.cancel();
      };
    }
    if (from.now !== next.now) {
      const writeIn = (wait: number) => {
        now.textContent = next.now ?? "";
        now.hidden = next.now === null;
        if (next.now === null) return;
        now.animate([{ clipPath: clip.hidden }, { clipPath: clip.shown }], {
          duration: 320,
          delay: wait,
          easing: easeOut,
          fill: "backwards",
        });
      };
      if (from.now === null) {
        writeIn(delay + 200);
      } else {
        // The leaving words are invisible before they give up their width.
        const fade = now.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: 120,
          delay,
          easing: "ease",
          fill: "forwards",
        });
        fade.onfinish = () => {
          if (version.current !== v) return;
          fade.cancel();
          writeIn(20);
        };
      }
    }
  }, [was, target, index, mode, narrow]);

  return (
    <span className="ys-line">
      <span ref={wasRef} className="ys-was">
        {was}
        <span ref={strikeRef} className="ys-strike" />
      </span>
      <span ref={nowRef} className="ys-now" />
    </span>
  );
}

/* ---------- Plate and pin ---------- */

function PlateView({ plate, wide, eager }: { plate: Plate; wide: boolean; eager: boolean }) {
  if (plate.kind === "care") {
    const entry = recreations.care;
    const Care = entry.Component;
    return (
      <div className="ys-live" data-world={entry.world}>
        <Suspense fallback={<div className="ys-wait" />}>
          <Care />
        </Suspense>
      </div>
    );
  }
  if (plate.kind === "web") {
    return (
      <img
        className="ys-shot"
        src={plate.shot.src}
        alt={plate.shot.alt}
        width={1440}
        height={900}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return (
    <div className="ys-phones">
      {plate.shots.slice(0, wide ? 3 : 2).map((image) => (
        <img
          key={image.src}
          src={image.src}
          alt={image.alt}
          width={780}
          height={1689}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      ))}
    </div>
  );
}

function rounded(points: Array<[number, number]>, radius = 8) {
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

/** Position inside `root`, from the offset chain, so a covered card's scale does not change it. */
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
  d: string;
  start: [number, number];
  ring: Box & { r: number };
  width: number;
  height: number;
}

function measurePin(card: HTMLElement, data: Year, wide: boolean): PinGeometry | null {
  const plate = card.querySelector<HTMLElement>(".ys-plate");
  const source = card.querySelector<HTMLElement>(".ys-row:first-child .ys-result span");
  if (!plate || !source) return null;
  const plateBox = offsetIn(plate, card);
  const src = offsetIn(source, card);
  if (!plateBox || !src) return null;
  let target: Box | null = null;
  const { pin } = data;
  if (pin.target.kind === "selector") {
    const element = plate.querySelector<HTMLElement>(pin.target.css);
    target = element ? offsetIn(element, card) : null;
  } else {
    const image = plate.querySelector<HTMLImageElement>("img");
    const base = image ? offsetIn(image, card) : null;
    if (base && base.w > 0) {
      const { box } = pin.target;
      target = { x: base.x + box.x * base.w, y: base.y + box.y * base.h, w: box.w * base.w, h: box.h * base.h };
    }
  }
  if (!target || target.w === 0) return null;
  const sy = Math.round(src.y + src.h / 2);
  const gutter = Math.round(plateBox.x - (wide ? 24 : 8));
  const start: [number, number] = wide ? [Math.round(src.x + src.w + 12), sy] : [gutter, sy];
  const points: Array<[number, number]> = wide ? [start, [gutter, sy]] : [start];
  if (pin.route === "over") {
    const lane = Math.round(plateBox.y - (wide ? 14 : 7));
    const cx = Math.round(target.x + target.w / 2);
    points.push([gutter, lane], [cx, lane], [cx, Math.round(target.y - 6)]);
  } else {
    const ty = Math.round(target.y + target.h / 2);
    points.push([gutter, ty], [Math.round(target.x - 6), ty]);
  }
  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 0 };
  ring.r = pin.pill ? ring.h / 2 : 6;
  return { d: rounded(points), start, ring, width: card.offsetWidth, height: card.offsetHeight };
}

function YearCard({
  data,
  index,
  current,
  wide,
  reduced,
}: {
  data: Year;
  index: number;
  current: boolean;
  wide: boolean;
  reduced: boolean;
}) {
  const cardRef = useRef<HTMLLIElement>(null);
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
  return (
    <li
      ref={cardRef}
      id={`y${data.year}`}
      className="ys-card"
      data-current={current || undefined}
      aria-labelledby={`ys-year-${data.year}`}
    >
      <h2 className="ys-year" id={`ys-year-${data.year}`}>
        {data.year}
      </h2>
      <p className="ys-sr">
        In {data.year}, {sentenceOf(data.says)}
      </p>
      <figure className="ys-figure">
        <div className={`ys-plate ys-plate-${plate.kind}`}>
          <PlateView plate={plate} wide={wide} eager={index === 0} />
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
          width={geometry.width}
          height={geometry.height}
          aria-hidden="true"
        >
          <path className="ys-pin-halo" d={geometry.d} pathLength={1} />
          <path className="ys-pin-line" d={geometry.d} pathLength={1} />
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
    </li>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const stackRef = useRef<HTMLOListElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const tops = useRef<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [said, setSaid] = useState<{ index: number; mode: Mode }>({ index: 0, mode: "instant" });
  const instantNext = useRef(false);
  const { scrollY } = useScroll();

  const locate = useCallback((y: number) => {
    const line = window.innerHeight * 0.5;
    let index = 0;
    tops.current.forEach((top, i) => {
      if (top - y <= line) index = i;
    });
    setCurrent((previous) => (previous === index ? previous : index));
  }, []);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const measure = () => {
      const cards = Array.from(stack.children) as HTMLElement[];
      const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
      let top = stack.getBoundingClientRect().top + window.scrollY + (parseFloat(getComputedStyle(stack).paddingTop) || 0);
      tops.current = cards.map((card) => {
        const at = top;
        top += card.offsetHeight + gap;
        return at;
      });
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
    const stackTop = (document.querySelector<HTMLElement>(".ys-bar")?.offsetHeight ?? 0) + 8;
    instantNext.current = instant;
    const root = rootRef.current;
    if (instant && root) {
      root.dataset.instant = "";
      requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.instant));
    }
    window.scrollTo({ top: Math.max(0, tops.current[index] - stackTop), behavior: "instant" });
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

  const says = years[said.index].says;
  const mode: Mode = reduced ? "instant" : said.mode;

  return (
    <div className="ys" ref={rootRef}>
      <title>Year stack — Gentrit Rashiti</title>
      <header className="ys-bar">
        <div className="ys-bar-in">
          <h1 className="ys-say">
            <span className="ys-sr">{sentenceOf(present)}</span>
            <span className="ys-lines" aria-hidden="true">
              <span className="ys-line">Gentrit Rashiti builds</span>
              {present.map((was, index) => (
                <Clause key={index} was={was} target={says[index]} index={index} mode={mode} narrow={!wide} />
              ))}
            </span>
          </h1>
          {wide && (
            <div className="ys-side">
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
              <p className="ys-contact">
                <a href={`mailto:${links.email}`}>Email</a>
                <a href={links.cv}>CV</a>
              </p>
            </div>
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
            />
          ))}
        </ol>
      </main>

      <footer className="ys-foot-page">
        <p className="ys-foot-who">
          Gentrit Rashiti. Web and mobile since 2021, full stack since 2026. Bachelor's degree, UBT. Based in Kosovo,
          working remotely.
        </p>
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
