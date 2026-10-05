import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { Link } from "react-router";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { moreCount, record, rewrites, type Rewrite } from "./data";
import "./rebuilt-twice.css";

const FIRST_DELAY = 650;
const DWELL = 140;
const STRIKE = 260;
const WRITE = 340;

/** Time fraction at which cubic-bezier(0.23, 1, 0.32, 1) reaches `progress`. */
function easeOutTime(progress: number) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  const point = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (point(mid, 1, 1) < progress) low = mid;
    else high = mid;
  }
  return point((low + high) / 2, 0.23, 0.32);
}

/** One span per word. A pen on the ease-out curve passes the words in reading order; words never reflow. */
function Words({ text, total }: { text: string; total: number }) {
  const words = text.split(" ");
  const length = text.length;
  const starts = words.map((_, index) => words.slice(0, index).reduce((sum, word) => sum + word.length + 1, 0));
  return (
    <>
      {words.map((word, index) => {
        const from = starts[index] / length;
        const to = Math.min(1, (starts[index] + word.length + 1) / length);
        const begin = easeOutTime(from) * total;
        const end = easeOutTime(to) * total;
        const style = {
          "--d": `${Math.round(begin)}ms`,
          "--t": `${Math.max(16, Math.round(end - begin))}ms`,
        } as CSSProperties;
        return (
          <Fragment key={index}>
            {index > 0 && " "}
            <span className="rt-w" style={style}>
              {word}
            </span>
          </Fragment>
        );
      })}
    </>
  );
}

/** Marks struck words that end a line, so the strike never runs past the last glyph of a line. */
function useLineEnds(node: HTMLElement | null) {
  useLayoutEffect(() => {
    if (!node) return;
    const mark = () => {
      const words = Array.from(node.querySelectorAll<HTMLElement>(".rt-w"));
      words.forEach((word, index) => {
        const next = words[index + 1];
        const end = !word.closest(".rt-was") || !next || !next.closest(".rt-was") || next.offsetTop !== word.offsetTop;
        word.toggleAttribute("data-eol", end);
      });
    };
    mark();
    const resize = new ResizeObserver(mark);
    resize.observe(node);
    return () => resize.disconnect();
  }, [node]);
}

function Sentence({ rewrite }: { rewrite: Rewrite }) {
  const [node, setNode] = useState<HTMLParagraphElement | null>(null);
  useLineEnds(node);
  return (
    <p className="rt-sentence" ref={setNode}>
      <span className="rt-sr">
        {rewrite.head} {rewrite.now} Before: {rewrite.head} {rewrite.was}
      </span>
      <span aria-hidden="true">
        {rewrite.head}{" "}
        <span className="rt-was">
          <Words text={rewrite.was} total={STRIKE} />
        </span>{" "}
        <span className="rt-now">
          <Words text={rewrite.now} total={WRITE} />
        </span>
      </span>
    </p>
  );
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Geometry {
  w: number;
  h: number;
  plate: Box;
  target: Box;
  dot: { x: number; y: number };
}

function rounded(points: Array<[number, number]>, radius = 10) {
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

/** The route keeps to the gap under the plate and the card gutter; it enters the plate only for the last stub. */
function routeOf({ plate, target, dot }: Geometry, side: "left" | "right") {
  const band = plate.y + plate.h + 9;
  const ty = Math.round(target.y + target.h / 2);
  if (side === "left") {
    const gx = plate.x - 18;
    return rounded([[dot.x, dot.y], [dot.x, band], [gx, band], [gx, ty], [target.x - 5, ty]]);
  }
  const gx = plate.x + plate.w + 18;
  return rounded([[dot.x, dot.y], [dot.x, band], [gx, band], [gx, ty], [target.x + target.w + 5, ty]]);
}

function Plate({ rewrite, mounted }: { rewrite: Rewrite; mounted: boolean }) {
  const entry = recreations[rewrite.plate];
  const Recreation = entry.Component;
  const style = {
    "--a-base": entry.aspect.base,
    "--a-sm": entry.aspect.sm,
    "--a-lg": rewrite.plate === "care" ? "2 / 1" : entry.aspect.lg,
  } as CSSProperties;
  return (
    <div className="rt-stage" data-world={entry.world} data-plate={rewrite.plate} style={style}>
      {mounted ? (
        <Suspense fallback={<div className="rt-stage-wait" />}>
          <Recreation />
        </Suspense>
      ) : (
        <div className="rt-stage-wait" />
      )}
    </div>
  );
}

interface CardProps {
  rewrite: Rewrite;
  current: boolean;
  solved: boolean;
  instant: boolean;
  mounted: boolean;
  wide: boolean;
  register: (id: string, node: HTMLElement | null) => void;
}

function Card({ rewrite, current, solved, instant, mounted, wide, register }: CardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const signature = useRef("");
  const [geometry, setGeometry] = useState<Geometry | null>(null);

  const measure = useCallback(() => {
    const card = cardRef.current;
    const plate = plateRef.current;
    const dot = dotRef.current;
    if (!card || !plate || !dot) return;
    const element = plate.querySelector<HTMLElement>(rewrite.pin.target);
    if (!element) return;
    const origin = card.getBoundingClientRect();
    const scale = origin.width / card.offsetWidth || 1;
    const rel = (r: DOMRect): Box => ({
      x: Math.round((r.left - origin.left) / scale),
      y: Math.round((r.top - origin.top) / scale),
      w: Math.round(r.width / scale),
      h: Math.round(r.height / scale),
    });
    const target = rel(element.getBoundingClientRect());
    if (target.w === 0) return;
    const d = rel(dot.getBoundingClientRect());
    const next: Geometry = {
      w: card.offsetWidth,
      h: card.offsetHeight,
      plate: rel(plate.getBoundingClientRect()),
      target,
      dot: { x: d.x + d.w / 2, y: d.y + d.h / 2 },
    };
    const key = JSON.stringify(next);
    if (key !== signature.current) {
      signature.current = key;
      setGeometry(next);
    }
  }, [rewrite.pin.target]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const plate = plateRef.current;
    if (!card || !plate || !mounted) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    schedule();
    const resize = new ResizeObserver(schedule);
    resize.observe(card);
    resize.observe(plate);
    const mutation = new MutationObserver(schedule);
    mutation.observe(plate, { subtree: true, childList: true });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [measure, mounted]);

  const path = geometry && wide ? routeOf(geometry, rewrite.pin.side) : "";
  const plateBox = geometry?.plate;
  const ring = geometry?.target;

  return (
    <article
      id={`c-${rewrite.id}`}
      ref={(node) => {
        cardRef.current = node;
        register(rewrite.id, node);
      }}
      className="rt-card"
      data-current={current || undefined}
      data-edit={solved ? "now" : "was"}
      data-instant={instant || undefined}
      tabIndex={-1}
      aria-labelledby={`c-${rewrite.id}-name`}
    >
      <header className="rt-card-head">
        <p className="rt-card-id">
          <span className="rt-id">{rewrite.id}</span>
          <span className="rt-card-name" id={`c-${rewrite.id}-name`}>
            {rewrite.project}
          </span>
          <span className="rt-card-year">{rewrite.year}</span>
        </p>
        <Sentence rewrite={rewrite} />
      </header>
      <div className="rt-plate" ref={plateRef}>
        <Plate rewrite={rewrite} mounted={mounted} />
      </div>
      <footer className="rt-card-foot">
        <p className="rt-note">
          <span className="rt-dot" ref={dotRef} aria-hidden="true" />
          {rewrite.pin.note}
        </p>
        <p className="rt-role">
          {rewrite.role} · {rewrite.years}
        </p>
        <Link className="rt-link" to={`/work/${rewrite.slug}`}>
          Open the case <span aria-hidden="true">→</span>
        </Link>
      </footer>
      {geometry && plateBox && ring && (
        <svg
          className="rt-hair"
          data-inside={rewrite.pin.inside}
          width={geometry.w}
          height={geometry.h}
          viewBox={`0 0 ${geometry.w} ${geometry.h}`}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`rt-out-${rewrite.id}`}>
              <path
                clipRule="evenodd"
                d={`M0,0H${geometry.w}V${geometry.h}H0Z M${plateBox.x},${plateBox.y}h${plateBox.w}v${plateBox.h}h${-plateBox.w}Z`}
              />
            </clipPath>
            <clipPath id={`rt-in-${rewrite.id}`}>
              <rect x={plateBox.x} y={plateBox.y} width={plateBox.w} height={plateBox.h} />
            </clipPath>
          </defs>
          {path && (
            <>
              <path className="rt-hair-out" d={path} pathLength={1} clipPath={`url(#rt-out-${rewrite.id})`} />
              <g clipPath={`url(#rt-in-${rewrite.id})`}>
                <path className="rt-hair-halo" d={path} pathLength={1} />
                <path className="rt-hair-in" d={path} pathLength={1} />
              </g>
            </>
          )}
          <rect
            className="rt-hair-halo rt-ring"
            x={ring.x - 4}
            y={ring.y - 4}
            width={ring.w + 8}
            height={ring.h + 8}
            rx={Math.min(10, (ring.h + 8) / 2)}
          />
          <rect
            className="rt-hair-in rt-ring"
            x={ring.x - 4}
            y={ring.y - 4}
            width={ring.w + 8}
            height={ring.h + 8}
            rx={Math.min(10, (ring.h + 8) / 2)}
          />
        </svg>
      )}
    </article>
  );
}

function Cite({
  rewrite,
  current,
  onJump,
  long,
}: {
  rewrite: Rewrite;
  current: boolean;
  onJump: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  long?: boolean;
}) {
  return (
    <a
      className="rt-cite"
      href={`#c-${rewrite.id}`}
      data-current={current || undefined}
      aria-current={current ? "true" : undefined}
      onClick={(event) => onJump(rewrite.id, event)}
    >
      <span className="rt-cite-id">{rewrite.id}</span>
      <span className={long ? "rt-cite-name" : "rt-cite-name rt-cite-name-wide"}>{rewrite.project}</span>
      <span className="rt-cite-year">{rewrite.year}</span>
    </a>
  );
}

export default function RebuiltTwice() {
  const [current, setCurrent] = useState(rewrites[0].id);
  const [solved, setSolved] = useState<ReadonlySet<string>>(() => new Set());
  const [instant, setInstant] = useState<ReadonlySet<string>>(() => new Set());
  const [mounted, setMounted] = useState<ReadonlySet<string>>(() => new Set([rewrites[0].id]));
  const [settled, setSettled] = useState(false);
  const [past, setPast] = useState(false);
  const [wide, setWide] = useState(() => window.matchMedia("(min-width: 1024px)").matches);
  const nodes = useRef(new Map<string, HTMLElement>());
  const anchors = useRef(new Map<string, HTMLElement>());
  const stackRef = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      root: root.style.background,
      body: body.style.background,
      scheme: root.style.colorScheme,
      behavior: root.style.scrollBehavior,
      padding: root.style.scrollPaddingTop,
    };
    root.style.background = body.style.background = "#fbf3e6";
    root.style.colorScheme = "light";
    root.style.scrollBehavior = "auto";
    root.style.scrollPaddingTop = "0px";
    void recreations["live-room"].load();
    const idle = window.setTimeout(() => void recreations.care.load(), 1200);
    return () => {
      window.clearTimeout(idle);
      root.style.background = previous.root;
      body.style.background = previous.body;
      root.style.colorScheme = previous.scheme;
      root.style.scrollBehavior = previous.behavior;
      root.style.scrollPaddingTop = previous.padding;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 1024px)");
    const change = () => setWide(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    let timer = 0;
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) timer = window.setTimeout(() => setSettled(true), FIRST_DELAY);
    });
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, []);

  const register = useCallback((id: string, node: HTMLElement | null) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  }, []);

  useEffect(() => {
    const inside = new Set<string>();
    const reading = new IntersectionObserver(
      (records) => {
        for (const item of records) {
          const id = (item.target as HTMLElement).id.slice(2);
          if (item.isIntersecting) inside.add(id);
          else inside.delete(id);
        }
        const last = [...rewrites].reverse().find((item) => inside.has(item.id));
        if (last) setCurrent(last.id);
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    const near = new IntersectionObserver(
      (records) => {
        const ids = records.filter((item) => item.isIntersecting).map((item) => (item.target as HTMLElement).id.slice(2));
        if (ids.length) setMounted((set) => new Set([...set, ...ids]));
      },
      { rootMargin: "0px 0px 100% 0px" },
    );
    nodes.current.forEach((node) => {
      reading.observe(node);
      near.observe(node);
    });
    return () => {
      reading.disconnect();
      near.disconnect();
    };
  }, []);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const watch = new IntersectionObserver(([item]) =>
      setPast(!item.isIntersecting && item.boundingClientRect.top < 0),
    );
    watch.observe(node);
    return () => watch.disconnect();
  }, []);

  useLayoutEffect(() => {
    const stack = stackRef.current;
    const first = nodes.current.get(rewrites[0].id);
    if (!stack || !first) return;
    const write = () => stack.style.setProperty("--rt-h1", `${first.offsetHeight}px`);
    write();
    const resize = new ResizeObserver(write);
    resize.observe(first);
    return () => resize.disconnect();
  }, []);

  useEffect(() => {
    if (!settled || solved.has(current)) return;
    const timer = window.setTimeout(() => setSolved((set) => new Set(set).add(current)), DWELL);
    return () => window.clearTimeout(timer);
  }, [settled, current, solved]);

  const jump = (id: string, event: MouseEvent<HTMLAnchorElement>) => {
    const anchor = anchors.current.get(id);
    const node = nodes.current.get(id);
    if (!anchor || !node) return;
    event.preventDefault();
    if (event.detail === 0) {
      setInstant((set) => new Set(set).add(id));
      setSolved((set) => new Set(set).add(id));
    }
    setMounted((set) => new Set(set).add(id));
    anchor.scrollIntoView({ block: "start", behavior: "instant" });
    node.focus({ preventScroll: true });
  };

  return (
    <div className="rt" data-past={past || undefined}>
      <title>Gentrit Rashiti · Two platform rewrites</title>

      <header className="rt-bar" aria-label="Claim">
        <div className="rt-bar-in">
          <p className="rt-bar-claim">Two platform rewrites.</p>
          <nav className="rt-bar-cites" aria-label="The two rewrites">
            {rewrites.map((item) => (
              <Cite key={item.id} rewrite={item} current={current === item.id} onJump={jump} />
            ))}
          </nav>
          <p className="rt-bar-links">
            <a href={links.cv}>CV</a>
            <a href={`mailto:${links.email}`}>Email</a>
          </p>
        </div>
      </header>

      <main className="rt-page">
        <section className="rt-top" aria-labelledby="rt-claim">
          <span className="rt-sentinel" ref={sentinel} aria-hidden="true" />
          <div className="rt-top-main">
            <h1 className="rt-claim" id="rt-claim">
              Two platform rewrites.<sup aria-hidden="true">1</sup>
            </h1>
            <p className="rt-foot-note">
              <span className="rt-foot-mark" aria-hidden="true">
                1
              </span>
              <span>
                Gentrit Rashiti was part of both: frontend and mobile, full stack since 2026. 5+ years, based in
                Kosovo.
              </span>
              <span className="rt-top-links">
                <a href={links.cv}>CV</a>
                <a href={`mailto:${links.email}`}>Email</a>
              </span>
            </p>
          </div>
          <nav className="rt-index" aria-label="The two rewrites, in order">
            {rewrites.map((item) => (
              <Cite key={item.id} rewrite={item} current={current === item.id} onJump={jump} long />
            ))}
          </nav>
        </section>

        <div className="rt-stack" ref={stackRef}>
          {rewrites.map((item) => (
            <Fragment key={item.id}>
              <span
                className="rt-anchor"
                ref={(node) => {
                  if (node) anchors.current.set(item.id, node);
                  else anchors.current.delete(item.id);
                }}
                aria-hidden="true"
              />
              <Card
                rewrite={item}
                current={current === item.id}
                solved={solved.has(item.id)}
                instant={instant.has(item.id)}
                mounted={mounted.has(item.id)}
                wide={wide}
                register={register}
              />
            </Fragment>
          ))}
        </div>

        <section className="rt-record" aria-labelledby="rt-record-title">
          <h2 id="rt-record-title">The record</h2>
          <p className="rt-record-lede">Ten decisions, 2022 to 2026. The two rewrites are 0003 and 0010.</p>
          <ol>
            {record.map((row) => {
              const inner = (
                <>
                  <span className="rt-record-id">{row.id}</span>
                  <span className="rt-record-decision">{row.decision}</span>
                  <span className="rt-record-project">
                    {row.project} · {row.years}
                  </span>
                  <span className="rt-record-result">{row.result}</span>
                </>
              );
              return (
                <li key={row.id} data-card={row.card || undefined}>
                  {row.card ? (
                    <a href={`#c-${row.id}`} onClick={(event) => jump(row.id, event)}>
                      {inner}
                    </a>
                  ) : row.slug ? (
                    <Link to={`/work/${row.slug}`}>{inner}</Link>
                  ) : (
                    <div className="rt-record-row">{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="rt-more">
            {moreCount} more projects, from games to a donations app, are on the <Link to="/">full portfolio</Link>.
          </p>
        </section>
      </main>

      <footer className="rt-foot">
        <ul className="rt-contact">
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
        <p>Kosovo, working remotely. Bachelor’s degree, UBT.</p>
        <p>The two live plates are recreations with invented data. No screen of client work is shown.</p>
      </footer>
    </div>
  );
}
