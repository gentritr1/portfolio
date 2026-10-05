import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type MouseEvent,
  type RefObject,
} from "react";
import { Link } from "react-router";
import { useMotionValueEvent, useScroll } from "motion/react";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { apps, record, type App, type Box } from "./data";
import "./both-stores.css";

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

/* ---------- Pin geometry ---------- */

/** Position inside `root` from the offset chain, so a covered card's scale does not change it. */
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

interface PinGeometry {
  d: string;
  start: [number, number];
  ring: Box & { r: number };
  width: number;
  height: number;
}

/**
 * "side": the text column sits beside the plate; the line runs through the gap.
 * "up": the text sits under the plate; the line climbs to the target's lower edge.
 * "edge": the text sits under the plate; the line runs up beside the plate and enters it level with the target.
 */
type Route = "side" | "up" | "edge";

const PAD = 5;

function geometry(card: HTMLElement, target: Box, route: Route): PinGeometry | null {
  const plate = card.querySelector<HTMLElement>("[data-plate]");
  const source = card.querySelector<HTMLElement>("[data-pinned]");
  if (!plate || !source) return null;
  const p = offsetIn(plate, card);
  const f = offsetIn(plate.closest<HTMLElement>("figure") ?? plate, card);
  const s = offsetIn(source, card);
  if (!p || !f || !s || target.w === 0) return null;
  const ring = { x: target.x - PAD, y: target.y - PAD, w: target.w + PAD * 2, h: target.h + PAD * 2, r: 6 };
  const sy = Math.round(s.y + Math.min(s.h, 24) / 2);
  const sx = Math.round(s.x - 12);
  const ty = Math.round(target.y + target.h / 2);
  const lane = Math.round(f.y + f.h + 10);
  let points: Array<[number, number]>;
  if (route === "side") {
    const gutter = Math.round((p.x + p.w + s.x) / 2);
    points = [[sx, sy], [gutter, sy], [gutter, ty], [Math.round(ring.x + ring.w), ty]];
  } else if (route === "up") {
    const cx = Math.round(target.x + target.w / 2);
    points = [[sx, sy], [sx, lane], [cx, lane], [cx, Math.round(ring.y + ring.h)]];
  } else if (target.x + target.w / 2 > p.x + p.w * 0.6) {
    const gutter = Math.round(p.x + p.w + 6);
    points = [[sx, sy], [sx, lane], [gutter, lane], [gutter, ty], [Math.round(ring.x + ring.w), ty]];
  } else {
    const gutter = Math.round(p.x - 6);
    points = [[sx, sy], [gutter, sy], [gutter, ty], [Math.round(ring.x), ty]];
  }
  return { d: rounded(points), start: [sx, sy], ring, width: card.offsetWidth, height: card.offsetHeight };
}

type Draw = "none" | "animate" | "static";

/** Measures the pin on every layout change and draws it once, the first time `active` is true. */
function usePin(
  cardRef: RefObject<HTMLElement | null>,
  findTarget: (card: HTMLElement) => Box | null,
  route: Route,
  active: boolean,
  reduced: boolean,
) {
  const [pin, setPin] = useState<PinGeometry | null>(null);
  const [draw, setDraw] = useState<Draw>("none");
  const signature = useRef("");

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const target = findTarget(card);
        const next = target ? geometry(card, target, route) : null;
        const key = JSON.stringify(next);
        if (key === signature.current) return;
        signature.current = key;
        setPin(next);
      });
    };
    measure();
    const resize = new ResizeObserver(measure);
    resize.observe(card);
    const mutation = new MutationObserver(measure);
    const plate = card.querySelector("[data-plate]");
    if (plate) mutation.observe(plate, { subtree: true, childList: true });
    const images = Array.from(card.querySelectorAll("img"));
    images.forEach((image) => image.addEventListener("load", measure));
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      images.forEach((image) => image.removeEventListener("load", measure));
    };
  }, [cardRef, findTarget, route]);

  if (active && pin !== null && draw === "none") {
    setDraw(reduced ? "static" : "animate");
  }

  return pin && draw !== "none" ? (
    <svg className="bs-pin" data-draw={draw} width={pin.width} height={pin.height} aria-hidden="true">
      <path className="bs-pin-halo" d={pin.d} pathLength={1} />
      <path className="bs-pin-line" d={pin.d} pathLength={1} />
      <rect
        className="bs-pin-ring"
        x={pin.ring.x}
        y={pin.ring.y}
        width={pin.ring.w}
        height={pin.ring.h}
        rx={pin.ring.r}
      />
      <circle className="bs-pin-start" cx={pin.start[0]} cy={pin.start[1]} r={3} />
    </svg>
  ) : null;
}

/* ---------- The first card: the reader, live ---------- */

const reader = recreations.reader;
const Reader = reader.Component;

const findBarcode = (card: HTMLElement) => {
  const scan = card.querySelector<HTMLElement>('section[aria-label="Scan a book"]');
  return scan ? offsetIn(scan, card) : null;
};

function ReaderCard({ wide, reduced }: { wide: boolean; reduced: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const pin = usePin(cardRef, findBarcode, "up", true, reduced);
  return (
    <article className="bs-card bs-reader" ref={cardRef} aria-label="Read to Feed, reader recreation">
      <div className="bs-live" data-world={reader.world} data-plate="" data-wide={wide || undefined}>
        <Suspense fallback={<div className="bs-wait" />}>
          <Reader />
        </Suspense>
      </div>
      <div className="bs-reader-text">
        <p className="bs-result">
          <span data-pinned="">A PDF and EPUB reader, and books found by their ISBN barcode.</span>
        </p>
        <p className="bs-meta">
          <span>Read to Feed</span>
          <span>Mobile · 2022–25</span>
          <span>Recreation, invented data</span>
        </p>
      </div>
      {pin}
    </article>
  );
}

/* ---------- A store card ---------- */

function cropStyle(crop: Box, width: number): CSSProperties {
  return {
    aspectRatio: `${crop.w} / ${crop.h}`,
    "--img-w": `${(width / crop.w) * 100}%`,
    "--img-x": `${(-crop.x / crop.w) * 100}%`,
    "--img-y": `${(-crop.y / crop.h) * 100}%`,
  } as CSSProperties;
}

function AppCard({
  app,
  index,
  current,
  wide,
  reduced,
}: {
  app: App;
  index: number;
  current: boolean;
  wide: boolean;
  reduced: boolean;
}) {
  const cardRef = useRef<HTMLLIElement>(null);
  const { listing } = app;
  const crop = wide ? listing.crop : listing.phoneCrop;

  const findTarget = useCallback(
    (card: HTMLElement) => {
      const box = card.querySelector<HTMLElement>(".bs-crop");
      const base = box ? offsetIn(box, card) : null;
      if (!base || base.w === 0) return null;
      const { target } = listing;
      return {
        x: base.x + ((target.x - crop.x) / crop.w) * base.w,
        y: base.y + ((target.y - crop.y) / crop.h) * base.h,
        w: (target.w / crop.w) * base.w,
        h: (target.h / crop.h) * base.h,
      };
    },
    [listing, crop],
  );

  const pin = usePin(cardRef, findTarget, wide ? "side" : "edge", current, reduced);

  return (
    <li
      ref={cardRef}
      id={app.id}
      className="bs-card bs-app"
      tabIndex={-1}
      data-current={current || undefined}
      aria-labelledby={`${app.id}-claim`}
    >
      <figure className="bs-figure">
        <div className="bs-crop" data-plate="" style={cropStyle(crop, listing.width)}>
          <img
            src={listing.src}
            alt={listing.alt}
            width={listing.width}
            height={listing.height}
            loading={index === 0 ? "eager" : "lazy"}
            decoding="async"
          />
        </div>
        <figcaption className="bs-caption">{app.caption}</figcaption>
      </figure>
      <div className="bs-app-text">
        <p className="bs-app-head">
          <span className="bs-year">{app.year}</span>
          <span>{app.name}</span>
        </p>
        <h2 className="bs-app-claim" id={`${app.id}-claim`}>
          {app.claim}
        </h2>
        <ol className="bs-rows">
          {app.rows.map((row) => (
            <li className="bs-row" key={row.result}>
              <span className="bs-decision">{row.decision}</span>
              <span className="bs-row-result">
                <span data-pinned={row.pinned ? "" : undefined}>{row.result}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="bs-app-foot">
          <p className="bs-meta">
            <span>{app.role}</span>
            <span>{app.years}</span>
          </p>
          <p className="bs-links">
            {app.stores.map((store) => (
              <a key={store.label} href={store.href} target="_blank" rel="noreferrer">
                {store.label}
                <ArrowUpRightIcon aria-hidden="true" size={14} weight="regular" />
              </a>
            ))}
            <Link to={`/work/${app.slug}`}>
              Open the case <span aria-hidden="true">→</span>
            </Link>
          </p>
        </div>
      </div>
      {pin}
    </li>
  );
}

/* ---------- Page ---------- */

const counted = ["One app", "Two apps", "Three apps"];

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)", false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLOListElement>(null);
  const tops = useRef<number[]>([]);
  const [current, setCurrent] = useState(-1);
  const [compact, setCompact] = useState(false);
  const [still, setStill] = useState(false);
  const { scrollY } = useScroll();

  const locate = useCallback((y: number) => {
    const line = window.innerHeight * 0.5;
    let index = -1;
    tops.current.forEach((top, i) => {
      if (top - y <= line) index = i;
    });
    setCurrent((previous) => (previous === index ? previous : index));
    const next = y > 200;
    setCompact((previous) => (previous === next ? previous : next));
  }, []);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const measure = () => {
      const cards = Array.from(stack.children) as HTMLElement[];
      const style = getComputedStyle(stack);
      const gap = parseFloat(style.rowGap) || 0;
      let top = stack.getBoundingClientRect().top + window.scrollY + (parseFloat(style.paddingTop) || 0);
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

  const count = Math.max(1, current + 1);
  const wordRef = useRef<HTMLSpanElement>(null);
  const shownCount = useRef(count);

  useLayoutEffect(() => {
    if (shownCount.current === count) return;
    shownCount.current = count;
    if (reduced || still) return;
    wordRef.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 120, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
  }, [count, reduced, still]);

  // A keyboard jump changes state with no motion until the pointer moves the page again.
  useEffect(() => {
    if (!still) return;
    const release = () => setStill(false);
    const events = ["wheel", "touchmove", "pointerdown"] as const;
    events.forEach((name) => window.addEventListener(name, release, { passive: true }));
    return () => events.forEach((name) => window.removeEventListener(name, release));
  }, [still]);

  const jump = (index: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (event.detail === 0) setStill(true);
    const bar = rootRef.current?.querySelector<HTMLElement>(".bs-count")?.offsetHeight ?? 0;
    const stackTop = bar + (wide ? 24 : 12);
    window.scrollTo({ top: Math.max(0, tops.current[index] - stackTop), behavior: "instant" });
    locate(window.scrollY);
    document.getElementById(apps[index].id)?.focus({ preventScroll: true });
  };

  return (
    <div className="bs" ref={rootRef} data-compact={compact || undefined}>
      <title>Both stores — Gentrit Rashiti</title>

      <header className="bs-count" inert={!compact}>
        <p className="bs-count-say">
          <span className="bs-n" ref={wordRef}>
            {counted[count - 1]}
          </span>{" "}
          shipped to both stores.
        </p>
        <span className="bs-count-ticks" aria-hidden="true">
          {apps.map((app, index) => (
            <span key={app.id} className="bs-tick" data-counted={index < count || undefined} />
          ))}
        </span>
        <nav className="bs-count-apps" aria-label="The three apps">
          {apps.map((app, index) => (
            <a
              key={app.id}
              href={`#${app.id}`}
              data-counted={index < count || undefined}
              aria-current={index === current ? "true" : undefined}
              onClick={jump(index)}
            >
              <span className="bs-tick" aria-hidden="true" />
              <span className="bs-count-name">{app.name}</span>
              <span className="bs-count-year">{app.year}</span>
            </a>
          ))}
        </nav>
      </header>

      <div className="bs-top">
        <a className="bs-name" href="/">
          Gentrit Rashiti
        </a>
        <p className="bs-top-links">
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.cv}>CV</a>
        </p>
      </div>

      <section className="bs-hero" aria-labelledby="bs-claim">
        <div className="bs-hero-say">
          <h1 className="bs-claim" id="bs-claim">
            Three apps shipped to both stores.
          </h1>
          <p className="bs-who">Web and mobile for 5+ years, full stack since 2026. Based in Kosovo, working remotely.</p>
        </div>
        <ReaderCard wide={wide} reduced={reduced} />
      </section>

      <main>
        <ol className="bs-stack" ref={stackRef} aria-label="The three apps, in year order">
          {apps.map((app, index) => (
            <AppCard
              key={app.id}
              app={app}
              index={index}
              current={index === current}
              wide={wide}
              reduced={reduced || still}
            />
          ))}
        </ol>

        <section className="bs-record" aria-labelledby="bs-record-claim">
          <h2 className="bs-record-claim" id="bs-record-claim">
            Two platform rewrites, on the web.
          </h2>
          <ul className="bs-record-rows">
            {record.map((row) => (
              <li key={row.name + row.result}>
                <Link className="bs-record-row" to={row.href}>
                  <span className="bs-record-name">{row.name}</span>
                  <span className="bs-record-result">
                    {row.mark ? (
                      <>
                        <mark>{row.mark}</mark>
                        {row.result.slice(row.mark.length)}
                      </>
                    ) : (
                      row.result
                    )}
                  </span>
                  <span className="bs-record-years">{row.years}</span>
                  <span className="bs-record-go" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="bs-all">
            <Link to="/">
              All 30 projects <span aria-hidden="true">→</span>
            </Link>
          </p>
        </section>
      </main>

      <footer className="bs-foot">
        <p>Gentrit Rashiti. Bachelor's degree, UBT. Based in Kosovo, working remotely.</p>
        <p className="bs-foot-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
        <p className="bs-foot-note">
          The reading screen is a recreation with invented data. The other screens come from public store listings.
        </p>
      </footer>
    </div>
  );
}
