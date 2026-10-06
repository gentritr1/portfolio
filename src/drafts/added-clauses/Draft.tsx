import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { Link } from "react-router";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { cards, opening, record, sentence, yearOf, type Box, type Card, type Plate } from "./data";
import "./added-clauses.css";

const SETTLE_MS = 160;
const LOAD_MS = 420;
const WORD_MS = 50;
const WRITE_MAX_MS = 360;

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

/* ---------- The sentence ---------- */

interface Said {
  earned: number;
  /** Delay before each newly earned slot starts, in ms. */
  delays: number[];
  /** Time between two words. Shorter when several clauses are earned at once. */
  stagger: number;
  mode: Mode;
}

/** Slots that start a new line in the wide sentence, so each line holds whole clauses. */
const breakBefore = new Set([0, 2, 3]);

function Words({ card, delay, stagger, breaks }: { card: Card; delay: number; stagger: number; breaks: boolean }) {
  const first = card.clause.findIndex((word) => word !== ",");
  return card.clause.map((word, index) => {
    const comma = word === ",";
    return (
      <span key={index}>
        {comma ? null : " "}
        {breaks && index === first && <br className="ac-br" />}
        <span
          className="ac-w"
          data-comma={comma || undefined}
          data-end={index === card.clause.length - 1 || undefined}
          style={{ "--d": `${delay + index * stagger}ms` } as CSSProperties}
        >
          <span className="ac-ink">{word}</span>
          {index === first && (
            <span className="ac-tag" aria-hidden="true">
              {yearOf(card)}
            </span>
          )}
        </span>
      </span>
    );
  });
}

function Slots({ said, onJump }: { said: Said; onJump?: (index: number) => (event: MouseEvent<HTMLAnchorElement>) => void }) {
  const breaks = !onJump;
  return cards.map((card, index) => {
    const earned = index < said.earned;
    const last = index === said.earned - 1;
    const props = {
      className: "ac-slot",
      "data-earned": earned || undefined,
      "data-last": last || undefined,
    };
    const words = <Words card={card} delay={said.delays[index] ?? 0} stagger={said.stagger} breaks={breaks && breakBefore.has(index)} />;
    return onJump ? (
      <a
        key={card.id}
        {...props}
        href={`#c${card.id}`}
        aria-label={`${yearOf(card)}: ${card.clause.filter((word) => word !== ",").join(" ")}`}
        onClick={onJump(index)}
      >
        {words}
      </a>
    ) : (
      <span key={card.id} {...props}>
        {words}
      </span>
    );
  });
}

/* ---------- Plates ---------- */

function cropOf(plate: Plate, wide: boolean) {
  return wide ? plate.wide : plate.narrow;
}

function PlateView({ plate, wide, eager }: { plate: Plate; wide: boolean; eager: boolean }) {
  const crop = cropOf(plate, wide);
  const style = {
    aspectRatio: `${crop.w} / ${crop.h}`,
    "--plate-ratio": crop.w / crop.h,
  } as CSSProperties;
  return (
    <div className="ac-plate ac-plate-image" style={style}>
      <img
        src={plate.src}
        alt={plate.alt}
        width={plate.width}
        height={plate.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        style={{
          width: `${(plate.width / crop.w) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
    </div>
  );
}

/* ---------- Pin ---------- */

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

/** Position inside `root` from the offset chain, so a sticky or moving card does not change it. */
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

function measurePin(card: HTMLElement, data: Card, wide: boolean): PinGeometry | null {
  const plateEl = card.querySelector<HTMLElement>(".ac-plate");
  const source = card.querySelector<HTMLElement>(".ac-row[data-pin] .ac-result > span");
  if (!plateEl || !source) return null;
  const plate = offsetIn(plateEl, card);
  const src = offsetIn(source, card);
  if (!plate || !src || plate.w === 0) return null;

  const crop = cropOf(data.plate, wide);
  const scale = plate.w / crop.w;
  const t = data.plate.target;
  const target: Box = { x: plate.x + (t.x - crop.x) * scale, y: plate.y + (t.y - crop.y) * scale, w: t.w * scale, h: t.h * scale };
  const lane = wide && data.plate.laneWide !== undefined ? Math.round(plate.y + (data.plate.laneWide - crop.y) * scale) : null;

  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 8 };
  const sy = Math.round(src.y + src.h / 2);
  const ty = Math.round(target.y + target.h / 2);
  const gutter = wide ? Math.round(plate.x - 24) : Math.round(plate.x / 2);
  const start: [number, number] = wide ? [Math.round(src.x + src.w + 12), sy] : [gutter, sy];
  const points: Array<[number, number]> = wide ? [start, [gutter, sy]] : [start];

  if (lane !== null) {
    const cx = Math.round(target.x + target.w / 2);
    const edge = lane > ring.y ? ring.y + ring.h : ring.y;
    points.push([gutter, lane], [cx, lane], [cx, Math.round(edge)]);
  } else {
    const end = Math.round(ring.x);
    points.push([gutter, ty]);
    if (end > gutter + 4) points.push([end, ty]);
  }
  return { d: rounded(points), start, ring, width: card.offsetWidth, height: card.offsetHeight };
}

/* ---------- Card ---------- */

function CardView({
  data,
  index,
  current,
  pinned,
  pinMode,
  wide,
}: {
  data: Card;
  index: number;
  current: boolean;
  pinned: boolean;
  pinMode: Mode;
  wide: boolean;
}) {
  const cardRef = useRef<HTMLLIElement>(null);
  const [geometry, setGeometry] = useState<PinGeometry | null>(null);
  const [draw, setDraw] = useState<"none" | Mode>("none");
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
    void document.fonts.ready.then(measure);
    const resize = new ResizeObserver(measure);
    resize.observe(card);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, [data, wide]);

  // The pin draws once, after its clause is earned.
  if (pinned && geometry !== null && draw === "none") {
    setDraw(pinMode);
  }

  const { plate, link } = data;
  return (
    <li
      ref={cardRef}
      id={`c${data.id}`}
      className="ac-card"
      data-current={current || undefined}
      style={{ "--n": index } as CSSProperties}
      aria-labelledby={`ac-h-${data.id}`}
    >
      <div className="ac-text">
        <h2 className="ac-name" id={`ac-h-${data.id}`}>
          {data.project}
        </h2>
        <p className="ac-meta">
          <span>{data.role}</span>
          <span aria-hidden="true"> · </span>
          <span>{data.years}</span>
        </p>
        <ol className="ac-rows">
          {data.rows.map((row) => (
            <li className="ac-row" key={row.decision} data-pin={row.pin || undefined}>
              <span className="ac-decision">{row.decision}</span>
              <span className="ac-result">
                <span>{row.result}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="ac-foot">
          <Link className="ac-link" to={link.href}>
            {link.label} <span aria-hidden="true">→</span>
          </Link>
        </p>
      </div>
      <figure className="ac-figure">
        <PlateView plate={plate} wide={wide} eager={index === 0} />
        <figcaption className="ac-caption">{plate.caption}</figcaption>
      </figure>
      {geometry && draw !== "none" && (
        <svg className="ac-pin" data-draw={draw} width={geometry.width} height={geometry.height} aria-hidden="true">
          <path className="ac-pin-halo" d={geometry.d} pathLength={1} />
          <path className="ac-pin-line" d={geometry.d} pathLength={1} />
          <rect
            className="ac-pin-ring"
            x={geometry.ring.x}
            y={geometry.ring.y}
            width={geometry.ring.w}
            height={geometry.ring.h}
            rx={geometry.ring.r}
          />
          <circle className="ac-pin-start" cx={geometry.start[0]} cy={geometry.start[1]} r={3} />
        </svg>
      )}
    </li>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLOListElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const tops = useRef<number[]>([]);
  const instantNext = useRef(false);
  const loaded = useRef(false);
  const [current, setCurrent] = useState(0);
  const [away, setAway] = useState(false);
  const [said, setSaid] = useState<Said>({ earned: 0, delays: [], stagger: WORD_MS, mode: "instant" });
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
      const items = Array.from(stack.children) as HTMLElement[];
      const style = getComputedStyle(stack);
      const gap = parseFloat(style.rowGap) || 0;
      let top = stack.getBoundingClientRect().top + window.scrollY + (parseFloat(style.paddingTop) || 0);
      tops.current = items.map((item) => {
        const at = top;
        top += item.offsetHeight + gap;
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
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      setAway(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // A clause is earned once its card has settled as the current card, and it stays.
  useEffect(() => {
    const target = current + 1;
    if (target <= said.earned) return;
    const commit = (mode: Mode) => {
      let words = 0;
      for (let index = said.earned; index < target; index++) words += cards[index].clause.length;
      const stagger = Math.min(WORD_MS, Math.floor(WRITE_MAX_MS / words));
      const delays: number[] = [];
      let at = 0;
      for (let index = said.earned; index < target; index++) {
        delays[index] = at;
        at += cards[index].clause.length * stagger;
      }
      setSaid({ earned: target, delays, stagger, mode });
    };
    if (instantNext.current || reduced) {
      instantNext.current = false;
      commit("instant");
      return;
    }
    const wait = loaded.current ? SETTLE_MS : LOAD_MS;
    loaded.current = true;
    const timer = window.setTimeout(() => commit("animate"), wait);
    return () => window.clearTimeout(timer);
  }, [current, said.earned, reduced]);

  const jump = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const instant = event.detail === 0;
    instantNext.current = instant;
    const root = rootRef.current;
    if (instant && root) {
      root.dataset.instant = "";
      requestAnimationFrame(() => requestAnimationFrame(() => delete root.dataset.instant));
    }
    const bar = document.querySelector<HTMLElement>(".ac-bar")?.offsetHeight ?? 0;
    const offset = wide ? bar + 16 + index * 12 : bar + 12;
    window.scrollTo({ top: Math.max(0, tops.current[index] - offset), behavior: "instant" });
    locate(window.scrollY);
    document.getElementById(`c${cards[index].id}`)?.querySelector<HTMLElement>(".ac-link")?.focus({ preventScroll: true });
  };

  const mode: Mode = reduced ? "instant" : said.mode;

  return (
    <div className="ac" ref={rootRef} data-mode={mode}>
      <title>Added clauses — Gentrit Rashiti</title>
      <header className="ac-bar" data-away={away || undefined} inert={!away}>
        <nav className="ac-bar-in" aria-label="The sentence, one clause for each card">
          <span className="ac-open" aria-hidden="true">
            {opening}
          </span>
          <Slots said={said} onJump={jump} />
        </nav>
      </header>

      <main>
        <section className="ac-hero">
          <h1 className="ac-say">
            <span className="ac-sr">{sentence}</span>
            <span className="ac-say-in" aria-hidden="true">
              <span className="ac-open">{opening}</span>
              <Slots said={said} />
            </span>
          </h1>
          <div className="ac-sentinel" ref={sentinelRef} />
        </section>

        <ol className="ac-stack" ref={stackRef}>
          {cards.map((card, index) => (
            <CardView
              key={card.id}
              data={card}
              index={index}
              current={index === current}
              pinned={index < said.earned}
              pinMode={mode}
              wide={wide}
            />
          ))}
        </ol>

        <section className="ac-record" aria-labelledby="ac-record-h">
          <h2 className="ac-record-h" id="ac-record-h">
            Ten more decisions, 2022 to 2026
          </h2>
          <ol className="ac-record-rows">
            {record.map((row) => (
              <li className="ac-record-row" key={row.decision}>
                <span className="ac-record-year">{row.year}</span>
                <span className="ac-record-main">
                  <span className="ac-record-project">{row.project}</span>
                  <span className="ac-record-decision">
                    {row.href ? (
                      row.external ? (
                        <a href={row.href} target="_blank" rel="noreferrer">
                          {row.decision.slice(0, row.decision.lastIndexOf(" ") + 1)}
                          <span className="ac-nowrap">
                            {row.decision.slice(row.decision.lastIndexOf(" ") + 1)}
                            <ArrowUpRightIcon aria-hidden="true" size={14} weight="regular" />
                          </span>
                        </a>
                      ) : (
                        <Link to={row.href}>{row.decision}</Link>
                      )
                    ) : (
                      row.decision
                    )}
                  </span>
                </span>
                <span className="ac-record-result">{row.result}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="ac-footer">
        <p className="ac-footer-who">Gentrit Rashiti · Kosovo, working remotely · Bachelor's degree, UBT</p>
        <p className="ac-footer-links">
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
        <p className="ac-footer-note">
          The Vianova care and design-system screens are real product screens with invented data. The other screens come
          from public web pages and store listings.
        </p>
      </footer>
    </div>
  );
}
