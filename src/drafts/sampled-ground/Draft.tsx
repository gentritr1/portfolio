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
import { cards, grounds, projectCount, record, type Box, type Card, type PinTarget, type Plate, type Shot } from "./data";
import "./sampled-ground.css";

const SETTLE_MS = 160;
const SPREAD_MS = 280;
const RECORD = cards.length;

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

const pad = (hue: number) => String(Math.round(hue)).padStart(3, "0");

/** One ground for each distinct hue, in page order. */
const stops = cards.reduce<{ hue: number; first: number; members: number[] }[]>((list, _, index) => {
  const hue = grounds[index];
  const stop = list.find((item) => item.hue === hue);
  if (stop) stop.members.push(index);
  else list.push({ hue, first: index, members: [index] });
  return list;
}, []);

/* ---------- Plates ---------- */

function Crop({ shot, eager }: { shot: Shot; eager: boolean }) {
  const { crop } = shot;
  return (
    <div
      className="sg-crop"
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

/** Pauses the specimen's own demo once, so the plate does not run a loop. */
function usePauseDemo(root: HTMLElement | null) {
  useEffect(() => {
    if (!root) return;
    const pause = () => {
      const button = root.querySelector<HTMLButtonElement>('.dsr-demo[aria-pressed="true"]');
      if (!button) return false;
      button.click();
      return true;
    };
    if (pause() || root.querySelector(".dsr-demo")) return;
    const observer = new MutationObserver(() => {
      if (root.querySelector(".dsr-demo")) {
        pause();
        observer.disconnect();
      }
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [root]);
}

function Live({ plate, wide }: { plate: Extract<Plate, { kind: "live" }>; wide: boolean }) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(0);
  const [near, setNear] = useState(false);
  const [design, setDesign] = useState<[number, number]>(plate.design);
  const entry = recreations[plate.key];
  const Recreation = entry.Component;
  const size = wide ? plate.design : plate.narrow;

  useLayoutEffect(() => {
    if (!node) return;
    const measure = () => {
      setDesign(size);
      setScale(node.clientWidth / size[0]);
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(node);
    return () => resize.disconnect();
  }, [node, size]);

  useEffect(() => {
    if (!node || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((item) => item.isIntersecting)) setNear(true);
      },
      { rootMargin: "60% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, near]);

  usePauseDemo(plate.key === "design-system" ? node : null);

  const props = plate.key === "live-room" ? { demoPlaying: false } : {};
  return (
    <div className="sg-live" ref={setNode} data-world={entry.world}>
      {near && scale > 0 ? (
        <div
          className="sg-live-in"
          style={{ width: design[0], height: design[1], transform: `scale(${scale})` } as CSSProperties}
        >
          <Suspense fallback={<div className="sg-wait" />}>
            <Recreation {...props} />
          </Suspense>
        </div>
      ) : (
        <div className="sg-wait" />
      )}
    </div>
  );
}

function PlateView({ plate, wide, eager }: { plate: Plate; wide: boolean; eager: boolean }) {
  if (plate.kind === "live") return <Live plate={plate} wide={wide} />;
  if (!wide) return <Crop shot={plate.narrow} eager={eager} />;
  if (plate.kind === "shot") return <Crop shot={plate.shot} eager={eager} />;
  return (
    <div className="sg-pair">
      {plate.shots.map((shot) => (
        <Crop key={shot.src} shot={shot} eager={eager} />
      ))}
    </div>
  );
}

/* ---------- Pin ---------- */

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

interface Geometry {
  outside: string;
  inside: string;
  split: number;
  start: Point;
  ring: Box & { r: number };
  width: number;
  height: number;
}

function within(rect: DOMRect, origin: DOMRect): Box {
  return { x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height };
}

function targetBox(card: HTMLElement, plateNode: HTMLElement, pin: PinTarget, origin: DOMRect): Box | null {
  if (pin.kind === "selector") {
    const element = plateNode.querySelector<HTMLElement>(pin.css);
    return element ? within(element.getBoundingClientRect(), origin) : null;
  }
  const image = card.querySelectorAll<HTMLImageElement>(".sg-plate img")[pin.index];
  if (!image || !image.complete || image.naturalWidth === 0) return null;
  const frame = within(image.getBoundingClientRect(), origin);
  return {
    x: frame.x + pin.box.x * frame.w,
    y: frame.y + pin.box.y * frame.h,
    w: pin.box.w * frame.w,
    h: pin.box.h * frame.h,
  };
}

function measurePin(card: HTMLElement, data: Card, wide: boolean): Geometry | null {
  const plateNode = card.querySelector<HTMLElement>(".sg-plate");
  const dot = card.querySelector<HTMLElement>(".sg-dot");
  if (!plateNode || !dot) return null;
  const origin = card.getBoundingClientRect();
  const plate = within(plateNode.getBoundingClientRect(), origin);
  const source = within(dot.getBoundingClientRect(), origin);
  const pin = !wide && data.narrowPin ? data.narrowPin : data.pin;
  const target = targetBox(card, plateNode, pin, origin);
  if (!target || target.w === 0) return null;
  const sx = Math.round(source.x + source.w / 2);
  const sy = Math.round(source.y + source.h / 2);
  const ty = Math.round(target.y + target.h / 2);
  let outside: Point[];
  let inside: Point[];
  if (wide) {
    const edge = Math.round(plate.x + plate.w);
    const gutter = edge + 14;
    outside = [[sx - 6, sy], [gutter, sy], [gutter, ty], [edge, ty]];
    inside = [[edge, ty], [Math.round(target.x + target.w + 6), ty]];
  } else {
    const bottom = Math.round(plate.y + plate.h);
    const margin = 5;
    const below = bottom + 8;
    const left = Math.round(plate.x + 5);
    const right = Math.round(plate.x + plate.w - 5);
    const cx = Math.round(target.x + target.w / 2);
    const lane = data.narrowRoute === "left" ? left : data.narrowRoute === "right" ? right : cx;
    outside = [[sx - 6, sy], [margin, sy], [margin, below], [lane, below], [lane, bottom]];
    if (data.narrowRoute === "below") inside = [[lane, bottom], [lane, Math.round(target.y + target.h + 6)]];
    else if (data.narrowRoute === "left") inside = [[lane, bottom], [lane, ty], [Math.round(target.x - 6), ty]];
    else inside = [[lane, bottom], [lane, ty], [Math.round(target.x + target.w + 6), ty]];
  }
  const pad = 5;
  const ring = { x: target.x - pad, y: target.y - pad, w: target.w + pad * 2, h: target.h + pad * 2, r: 6 };
  const outLength = lengthOf(outside);
  const inLength = lengthOf(inside);
  return {
    outside: rounded(outside),
    inside: rounded(inside),
    split: outLength / Math.max(1, outLength + inLength),
    start: [sx, sy],
    ring,
    width: Math.round(origin.width),
    height: Math.round(origin.height),
  };
}

const PIN_MS = 180;

/** A hyphenated word never breaks across two lines. */
function Unbroken({ text }: { text: string }) {
  return text.split(" ").map((word, index) => (
    <span key={index}>
      {index > 0 && " "}
      {word.includes("-") ? <span className="sg-nowrap">{word}</span> : word}
    </span>
  ));
}

/* ---------- Card ---------- */

function CardView({
  data,
  index,
  current,
  drawn,
  wide,
  reduced,
  instant,
  register,
}: {
  data: Card;
  index: number;
  current: boolean;
  drawn: boolean;
  wide: boolean;
  reduced: boolean;
  instant: boolean;
  register: (index: number, node: HTMLElement | null) => void;
}) {
  const cardRef = useRef<HTMLElement | null>(null);
  const [geometry, setGeometry] = useState<Geometry | null>(null);
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
    const plate = card.querySelector(".sg-plate");
    const mutation = new MutationObserver(measure);
    if (plate) mutation.observe(plate, { subtree: true, childList: true, attributes: true, attributeFilter: ["style", "class"] });
    const images = Array.from(card.querySelectorAll("img"));
    images.forEach((image) => image.addEventListener("load", measure));
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      images.forEach((image) => image.removeEventListener("load", measure));
    };
  }, [data, wide]);

  // The pin draws once, the first time its card paints the page.
  if (drawn && geometry !== null && draw === "none") {
    setDraw(reduced || instant ? "static" : "animate");
  }

  const timing = geometry
    ? ({
        "--sg-pin-out": `${Math.round(PIN_MS * geometry.split)}ms`,
        "--sg-pin-in": `${Math.round(PIN_MS * (1 - geometry.split))}ms`,
      } as CSSProperties)
    : undefined;
  const ground = grounds[index];
  const shared = ground !== data.hue;

  return (
    <li className="sg-slot">
      <article
        ref={(node) => {
          cardRef.current = node;
          register(index, node);
        }}
        id={data.id}
        className="sg-card"
        data-current={current || undefined}
        style={{ "--sg-h": data.hue } as CSSProperties}
        aria-labelledby={`${data.id}-name`}
        tabIndex={-1}
      >
        <div className={`sg-plate sg-plate-${data.plate.kind}`} role="group" aria-label={`${data.project}: ${data.caption}`}>
          <PlateView plate={data.plate} wide={wide} eager={index === 0} />
        </div>
        <div className="sg-column">
          <h2 className="sg-name" id={`${data.id}-name`}>
            {data.project}
          </h2>
          <p className="sg-line">
            <span className="sg-dot" aria-hidden="true" />
            <Unbroken text={data.line} />
          </p>
          <p className="sg-role">{data.role}</p>
          <p className="sg-hue">
            <span className="sg-chip" aria-hidden="true" />
            h {pad(data.hue)}
            {shared && <> · shares {pad(ground)}</>}
          </p>
          <p className="sg-caption">{data.caption}</p>
          <p className="sg-more">
            {data.link.external ? (
              <a className="sg-link" href={data.link.href} target="_blank" rel="noreferrer">
                {data.link.label}
                <ArrowUpRightIcon aria-hidden="true" size={15} weight="regular" />
              </a>
            ) : (
              <Link className="sg-link" to={data.link.href}>
                {data.link.label} <span aria-hidden="true">→</span>
              </Link>
            )}
          </p>
        </div>
        {geometry && draw !== "none" && (
          <svg
            className="sg-pin"
            data-draw={draw}
            width={geometry.width}
            height={geometry.height}
            style={timing}
            aria-hidden="true"
          >
            <path className="sg-pin-line sg-pin-out" d={geometry.outside} pathLength={1} />
            <path className="sg-pin-halo sg-pin-in" d={geometry.inside} pathLength={1} />
            <path className="sg-pin-line sg-pin-in" d={geometry.inside} pathLength={1} />
            <rect
              className="sg-pin-ring"
              x={geometry.ring.x}
              y={geometry.ring.y}
              width={geometry.ring.w}
              height={geometry.ring.h}
              rx={geometry.ring.r}
            />
          </svg>
        )}
      </article>
    </li>
  );
}

/* ---------- Hue scale ---------- */

function Scale({ shown, onJump }: { shown: number; onJump: (index: number, instant: boolean) => void }) {
  const active = shown === RECORD ? -1 : stops.findIndex((stop) => stop.members.includes(shown));
  const focusIndex = Math.max(0, active);
  const card = cards[shown];
  const label =
    shown === RECORD
      ? "The record: no screen, no hue"
      : `${card.project} · h ${pad(card.hue)}${grounds[shown] !== card.hue ? ` → ${pad(grounds[shown])}` : ""}`;
  const at = active >= 0 ? stops[active].hue : 0;

  const onKey = (event: KeyboardEvent<HTMLElement>) => {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "Home" ? -99 : event.key === "End" ? 99 : 0;
    if (!step) return;
    event.preventDefault();
    const order = [...stops].sort((a, b) => a.hue - b.hue);
    const position = order.findIndex((stop) => stop === stops[focusIndex]);
    const next = order[Math.min(order.length - 1, Math.max(0, position + step))];
    onJump(next.first, true);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-hue="${next.hue}"]`)?.focus({ preventScroll: true });
  };

  return (
    <nav className="sg-scale" aria-label="Screens by hue" onKeyDown={onKey}>
      <span className="sg-scale-end" aria-hidden="true">
        h 0
      </span>
      <div
        className="sg-scale-track"
        data-none={active < 0 || undefined}
        data-far={at > 180 || undefined}
        style={{ "--sg-at": at } as CSSProperties}>
        <span className="sg-scale-line" aria-hidden="true" />
        {stops.map((stop, index) => (
          <button
            key={stop.hue}
            type="button"
            className="sg-scale-stop"
            data-hue={stop.hue}
            aria-current={index === active ? "true" : undefined}
            tabIndex={index === focusIndex ? 0 : -1}
            style={{ "--sg-h": stop.hue } as CSSProperties}
            aria-label={`${stop.members.map((member) => cards[member].project).join(" and ")}, hue ${stop.hue}`}
            onClick={(event: MouseEvent<HTMLButtonElement>) => onJump(stop.first, event.detail === 0)}
          >
            <span className="sg-scale-dot" />
          </button>
        ))}
        <span className="sg-scale-mark" aria-hidden="true" />
        <span className="sg-scale-label">
          {label}
        </span>
      </div>
      <span className="sg-scale-end" aria-hidden="true">
        360
      </span>
    </nav>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const rootRef = useRef<HTMLDivElement>(null);
  const nodes = useRef<(HTMLElement | null)[]>([]);
  const recordRef = useRef<HTMLElement>(null);
  const tops = useRef<number[]>([]);
  const [current, setCurrent] = useState(0);
  const [shown, setShown] = useState({ index: 0, instant: false });
  const [drawn, setDrawn] = useState<ReadonlySet<number>>(() => new Set());
  const instantNext = useRef(false);
  const layers = useRef(new Map<string, HTMLElement>());
  const { scrollY } = useScroll();

  const register = useCallback((index: number, node: HTMLElement | null) => {
    nodes.current[index] = node;
  }, []);

  const locate = useCallback((y: number) => {
    const line = y + window.innerHeight * 0.5;
    let index = 0;
    tops.current.forEach((top, i) => {
      if (line >= top) index = i;
    });
    setCurrent(index);
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const list = nodes.current.map((node) => (node ? node.getBoundingClientRect().top + window.scrollY : Infinity));
      const recordNode = recordRef.current;
      list[RECORD] = recordNode ? recordNode.getBoundingClientRect().top + window.scrollY : Infinity;
      list[0] = -Infinity;
      tops.current = list;
      locate(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (rootRef.current) observer.observe(rootRef.current);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [locate, wide]);

  useMotionValueEvent(scrollY, "change", locate);

  useEffect(() => {
    if (shown.index === current) return;
    if (instantNext.current || reduced) {
      instantNext.current = false;
      setShown({ index: current, instant: true });
      return;
    }
    const timer = window.setTimeout(() => setShown({ index: current, instant: false }), SETTLE_MS);
    return () => window.clearTimeout(timer);
  }, [current, shown.index, reduced]);

  useEffect(() => {
    if (shown.index === RECORD || drawn.has(shown.index)) return;
    const wait = shown.instant || reduced ? 0 : 200;
    const timer = window.setTimeout(() => setDrawn((set) => new Set(set).add(shown.index)), wait);
    return () => window.clearTimeout(timer);
  }, [shown, drawn, reduced]);

  const jump = (index: number, instant: boolean) => {
    const node = index === RECORD ? recordRef.current : nodes.current[index];
    if (!node) return;
    instantNext.current = instant;
    const bar = wide ? 72 : 56;
    const top = index === 0 ? 0 : node.getBoundingClientRect().top + window.scrollY - bar - 24;
    window.scrollTo({ top, behavior: "instant" });
    locate(window.scrollY);
    if (index !== RECORD) node.focus({ preventScroll: true });
  };

  const neutral = shown.index === RECORD;
  const hue = neutral ? grounds[RECORD - 1] : grounds[shown.index];
  const groundKey = neutral ? "none" : String(hue);
  const lastKey = useRef(groundKey);

  useLayoutEffect(() => {
    const previous = lastKey.current;
    lastKey.current = groundKey;
    if (previous === groundKey || shown.instant || reduced) return;
    const layer = layers.current.get(groundKey);
    const origin =
      shown.index === RECORD ? recordRef.current : nodes.current[shown.index]?.querySelector<HTMLElement>(".sg-plate");
    if (!layer || !origin) return;
    const box = origin.getBoundingClientRect();
    const x = Math.round(box.left + box.width / 2);
    const y = Math.round(shown.index === RECORD ? box.top : box.top + box.height / 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const r = Math.ceil(Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)));
    layer.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }], {
      duration: SPREAD_MS,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    });
  }, [groundKey, shown, reduced]);

  return (
    <div
      className="sg"
      ref={rootRef}
      data-neutral={neutral || undefined}
      data-instant={shown.instant ? "" : undefined}
      style={{ "--sg-h": hue } as CSSProperties}
    >
      <title>Sampled ground — Gentrit Rashiti</title>
      <div className="sg-grounds" aria-hidden="true">
        {stops.map((stop) => (
          <span
            key={stop.hue}
            ref={(node) => {
              if (node) layers.current.set(String(stop.hue), node);
            }}
            className="sg-ground"
            data-on={(!neutral && grounds[shown.index] === stop.hue) || undefined}
            style={{ "--sg-h": stop.hue } as CSSProperties}
          />
        ))}
        <span
          ref={(node) => {
            if (node) layers.current.set("none", node);
          }}
          className="sg-ground sg-ground-none"
          data-on={neutral || undefined}
        />
      </div>

      <header className="sg-bar">
        <div className="sg-bar-in">
          <a className="sg-bar-name" href="#top" onClick={(event) => (event.preventDefault(), jump(0, event.detail === 0))}>
            Gentrit Rashiti
          </a>
          {wide ? (
            <Scale shown={shown.index} onJump={jump} />
          ) : (
            <p className="sg-bar-now">
              <span className="sg-chip" aria-hidden="true" />
              {neutral ? "The record: no screen, no hue" : `${cards[shown.index].short} · h ${pad(cards[shown.index].hue)}`}
            </p>
          )}
          <p className="sg-bar-links">
            <a href={links.cv}>CV</a>
            <a href={`mailto:${links.email}`}>Email</a>
          </p>
        </div>
      </header>

      <main id="top">
        <section className="sg-top" aria-labelledby="sg-claim">
          <h1 className="sg-claim" id="sg-claim">
            Two platform rewrites,
            <br className="sg-br" /> three apps in both stores.<sup aria-hidden="true">1</sup>
          </h1>
          <p className="sg-note">
            <span className="sg-note-mark" aria-hidden="true">
              1
            </span>
            <span>
              Gentrit Rashiti builds web and mobile apps, from Kosovo. The colour of this page is sampled from the
              screen under it.
            </span>
          </p>
        </section>

        <ol className="sg-cards">
          {cards.map((card, index) => (
            <CardView
              key={card.id}
              data={card}
              index={index}
              current={shown.index === index}
              drawn={drawn.has(index)}
              wide={wide}
              reduced={reduced}
              instant={shown.instant}
              register={register}
            />
          ))}
        </ol>

        <section className="sg-record" ref={recordRef} aria-labelledby="sg-record-title">
          <h2 id="sg-record-title">Also on the record</h2>
          <ol>
            {record.map((row) => {
              const inner = (
                <>
                  <span className="sg-record-decision">{row.decision}</span>
                  <span className="sg-record-project">
                    {row.project} · {row.years}
                  </span>
                  <span className="sg-record-result">{row.result}</span>
                </>
              );
              return (
                <li key={row.decision}>
                  {row.slug ? (
                    <Link className="sg-record-row" to={`/work/${row.slug}`}>
                      {inner}
                    </Link>
                  ) : (
                    <div className="sg-record-row">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="sg-record-more">
            <Link to="/">All {projectCount} projects →</Link>
          </p>
        </section>
      </main>

      <footer className="sg-foot">
        <ul className="sg-contact">
          <li>
            <a href={`mailto:${links.email}`}>{links.email}</a>
          </li>
          <li>
            <a href={links.cv}>CV (PDF)</a>
          </li>
          <li>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
          <li>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          </li>
        </ul>
        <p>Gentrit Rashiti. Bachelor’s degree, UBT. Based in Kosovo, working remotely.</p>
        <p>
          The live plates are recreations with invented data. The other screens come from public web pages and store
          listings.
        </p>
      </footer>
    </div>
  );
}
