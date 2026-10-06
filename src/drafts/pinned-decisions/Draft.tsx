import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from "react";
import { Link } from "react-router";
import { useMotionValueEvent, useScroll } from "motion/react";
import { links } from "../../content/links";
import { CropShot } from "../../components/CropShot";
import { decisions, type CroppedShot, type Decision, type Measure, type Plate, type Point } from "./data";
import "./pinned-decisions.css";

type Pin = "idle" | "anim" | "still";

const STACK_TOP = 40;
const easeInOut = "cubic-bezier(0.77, 0, 0.175, 1)";

function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Geometry {
  width: number;
  plate: Box;
  target: Box;
  marker: { x: number; y: number } | null;
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

/** The route keeps to the card gutters and enters the plate only for the last stub. */
function routeOf(geometry: Geometry, route: Point["route"]) {
  const { plate, target, marker, width } = geometry;
  if (!marker) return "";
  const band = plate.y + plate.h + 7;
  const ty = Math.round(target.y + target.h / 2);
  const start: [number, number] = [marker.x, marker.y];
  if (route === "right") {
    const gx = width - 8;
    return rounded([start, [marker.x, band], [gx, band], [gx, ty], [target.x + target.w + 4, ty]]);
  }
  if (route === "left") {
    return rounded([start, [marker.x, band], [8, band], [8, ty], [target.x - 4, ty]]);
  }
  const over = plate.y - 7;
  const tx = Math.round(target.x + target.w / 2);
  return rounded([start, [marker.x, band], [8, band], [8, over], [tx, over], [tx, target.y - 4]]);
}

/** Moves a copy of the number from its source to its slot. The count starts only after the copy leaves the source. */
function useRide(
  run: boolean,
  measure: Measure | undefined,
  boxRef: RefObject<HTMLElement | null>,
  fromRef: RefObject<HTMLElement | null>,
  toRef: RefObject<HTMLElement | null>,
  onDone: () => void,
) {
  const doneRef = useRef(onDone);
  useLayoutEffect(() => {
    doneRef.current = onDone;
  });
  useLayoutEffect(() => {
    const box = boxRef.current;
    const from = fromRef.current;
    const to = toRef.current;
    if (!run || !measure || !box || !from || !to) return;
    const b = box.getBoundingClientRect();
    const f = from.getBoundingClientRect();
    const t = to.getBoundingClientRect();
    const dx = t.left - f.left;
    const dy = t.top - f.top;
    const ghost = from.cloneNode(true) as HTMLElement;
    ghost.classList.remove("pd-from", "pd-to");
    ghost.classList.add("pd-ghost");
    ghost.setAttribute("aria-hidden", "true");
    ghost.style.left = `${f.left - b.left}px`;
    ghost.style.top = `${f.top - b.top}px`;
    box.append(ghost);
    const leave = Math.min(
      0.85,
      Math.abs(dy) > Math.abs(dx) ? f.height / Math.max(1, Math.abs(dy)) : f.width / Math.max(1, Math.abs(dx)),
    );
    const animation = ghost.animate(
      Math.abs(dx) > Math.abs(dy)
        ? [
            { transform: "translate(0px, 0px)" },
            { transform: `translate(${dx / 2}px, ${dy / 2 - f.height * 1.6}px)` },
            { transform: `translate(${dx}px, ${dy}px)` },
          ]
        : [{ transform: "translate(0px, 0px)" }, { transform: `translate(${dx}px, ${dy}px)` }],
      { duration: 460, easing: easeInOut, fill: "forwards" },
    );
    let frame = 0;
    const count = () => {
      const p = animation.effect?.getComputedTiming().progress ?? 0;
      const share = p <= leave ? 0 : (p - leave) / (1 - leave);
      ghost.textContent = measure.print(Math.round(measure.from + (measure.to - measure.from) * share));
      if (animation.playState !== "finished") frame = requestAnimationFrame(count);
    };
    count();
    let live = true;
    animation.finished
      .then(() => {
        if (!live) return;
        ghost.remove();
        doneRef.current();
      })
      .catch(() => {});
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      animation.cancel();
      ghost.remove();
    };
  }, [run, measure, boxRef, fromRef, toRef]);
}

function useRideState(pin: Pin) {
  const [ran, setRan] = useState(false);
  const state = pin === "still" || ran ? "done" : pin === "anim" ? "run" : "wait";
  return { state, done: useCallback(() => setRan(true), []) };
}

function ScreenPlate({ plate, wide }: { plate: Extract<Plate, { kind: "screen" }>; wide: boolean }) {
  if (!wide) return <CropShot shot={plate.narrow} />;
  if (!plate.center) return <CropShot shot={plate.shot} fill />;
  return (
    <div className="pd-screen-center" style={{ background: plate.shot.ground }}>
      <CropShot shot={plate.shot} style={{ width: plate.shot.crop.w, maxWidth: "100%" }} />
    </div>
  );
}

function PairPlate({ shots }: { shots: [CroppedShot, CroppedShot] }) {
  return (
    <div className="pd-pair">
      {shots.map((shot) => (
        <figure key={shot.src}>
          <div className="pd-crop" style={{ aspectRatio: `${shot.crop.w} / ${shot.crop.h}` }}>
            <img
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              loading="lazy"
              decoding="async"
              style={{
                width: `${(shot.width / shot.crop.w) * 100}%`,
                translate: `${(-shot.crop.x / shot.width) * 100}% ${(-shot.crop.y / shot.height) * 100}%`,
              }}
            />
          </div>
          <figcaption>{shot.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function RecordPlate({ decision, pin }: { decision: Decision; pin: Pin }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const plate = decision.plate.kind === "record" ? decision.plate : null;
  const { state, done } = useRideState(pin);
  useRide(state === "run", plate?.measure, boxRef, fromRef, toRef, done);
  if (!plate) return null;
  const { measure } = plate;
  return (
    <div className="pd-record" ref={boxRef} data-ride={measure ? state : undefined} data-measured={measure ? "" : undefined}>
      <dl>
        <div className="pd-rrow">
          <dt>Context</dt>
          <dd>{plate.context}</dd>
          {measure && (
            <span className="pd-lane" aria-hidden="true">
              <span className="pd-lane-n pd-from" ref={fromRef}>
                {measure.print(measure.from)}
              </span>
              <span className="pd-lane-unit">{measure.unit}</span>
            </span>
          )}
        </div>
        <div className="pd-rrow">
          <dt>Decision</dt>
          <dd>{plate.decision}</dd>
        </div>
        <div className="pd-rrow">
          <dt>Consequence</dt>
          <dd>
            {plate.consequence}
            {measure && (
              <span className="pd-sr">
                {` ${measure.print(measure.from)} ${measure.unit} before, ${measure.print(measure.to)} after.`}
              </span>
            )}
          </dd>
          {measure && (
            <span className="pd-lane" aria-hidden="true">
              <span className="pd-lane-n pd-to" ref={toRef}>
                {measure.print(measure.to)}
              </span>
              <span className="pd-lane-unit">{measure.unit}</span>
            </span>
          )}
        </div>
      </dl>
    </div>
  );
}

function RideLine({ text, measure, pin }: { text: string; measure: Measure; pin: Pin }) {
  const boxRef = useRef<HTMLParagraphElement>(null);
  const fromRef = useRef<HTMLSpanElement>(null);
  const toRef = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const box = boxRef.current;
    if (!box || seen) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { threshold: 1 });
    observer.observe(box);
    return () => observer.disconnect();
  }, [seen]);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const { state, done } = useRideState(reduced || pin === "still" ? "still" : seen ? "anim" : "idle");
  useRide(state === "run", measure, boxRef, fromRef, toRef, done);
  const [before, rest] = text.split("{n}");
  const [middle, after] = rest.split("{m}");
  return (
    <p className="pd-line" ref={boxRef} data-ride={state}>
      <span className="pd-dot" aria-hidden="true" />
      {before}
      <span className="pd-num pd-from" ref={fromRef}>
        {measure.print(measure.from)}
      </span>
      {middle}
      <span className="pd-num pd-to" ref={toRef}>
        {measure.print(measure.to)}
      </span>
      {after}
    </p>
  );
}

function Card({
  decision,
  index,
  pin,
  current,
  wide,
  onJump,
}: {
  decision: Decision;
  index: number;
  pin: Pin;
  current: boolean;
  wide: boolean;
  onJump: (id: string, instant: boolean) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const signature = useRef("");
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const { plate, point } = decision;

  const measure = useCallback(() => {
    const card = cardRef.current;
    const plateBox = plateRef.current;
    if (!card || !plateBox || !point) return;
    const origin = card.getBoundingClientRect();
    const rel = (r: DOMRect): Box => ({
      x: Math.round(r.left - origin.left),
      y: Math.round(r.top - origin.top),
      w: Math.round(r.width),
      h: Math.round(r.height),
    });
    const p = rel(plateBox.getBoundingClientRect());
    let target: Box | null = null;
    const [x, y, w, h] = point.rect;
    const image = plate.kind === "screen" ? plateBox.querySelector("img") : null;
    const frame = image ? rel(image.getBoundingClientRect()) : plate.kind === "shot" ? p : null;
    const width = plate.kind === "screen" ? (wide ? plate.shot : plate.narrow).width : plate.kind === "shot" ? plate.shot.width : 0;
    if (frame && width) {
      const scale = frame.w / width;
      target = {
        x: Math.round(frame.x + x * scale),
        y: Math.round(frame.y + y * scale),
        w: Math.round(w * scale),
        h: Math.round(h * scale),
      };
    }
    if (!target || target.w === 0) return;
    const dot = dotRef.current?.getBoundingClientRect();
    const next: Geometry = {
      width: Math.round(origin.width),
      plate: p,
      target,
      marker: dot ? { x: Math.round(dot.left - origin.left + dot.width / 2), y: Math.round(dot.top - origin.top + dot.height / 2) } : null,
    };
    const key = JSON.stringify(next);
    if (key !== signature.current) {
      signature.current = key;
      setGeometry(next);
    }
  }, [point, plate, wide]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    const plateBox = plateRef.current;
    if (!point || !card || !plateBox) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const resize = new ResizeObserver(schedule);
    resize.observe(card);
    resize.observe(plateBox);
    const mutation = new MutationObserver(schedule);
    mutation.observe(plateBox, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["aria-label", "aria-pressed"],
    });
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [measure, point]);

  const ready = pin !== "idle" && geometry;
  const path = ready && wide && point ? routeOf(geometry, point.route) : "";
  const end =
    ready && wide && point
      ? point.route === "over"
        ? { x: geometry.target.x + geometry.target.w / 2, y: geometry.target.y - 4 }
        : {
            x: point.route === "right" ? geometry.target.x + geometry.target.w + 4 : geometry.target.x - 4,
            y: geometry.target.y + geometry.target.h / 2,
          }
      : null;
  const markAt =
    ready && !wide
      ? {
          left: Math.max(14, geometry.target.x - geometry.plate.x),
          top: Math.max(14, geometry.target.y - geometry.plate.y),
        }
      : null;

  const meta = `${decision.project} · ${decision.role} · ${decision.years}`;
  const headingId = `pd-title-${decision.id}`;

  return (
    <article
      ref={cardRef}
      className="pd-card"
      id={`d-${decision.id}`}
      aria-labelledby={headingId}
      data-current={current || undefined}
      data-pin={pin}
      style={{ "--n": index + 1 } as CSSProperties}
    >
      <header className="pd-head">
        <span className="pd-id">{decision.id}</span>
        <h2 id={headingId} className="pd-title">
          {decision.title}
        </h2>
      </header>

      <div className="pd-plate" ref={plateRef} data-kind={plate.kind}>
        {plate.kind === "screen" && <ScreenPlate plate={plate} wide={wide} />}
        {plate.kind === "shot" && (
          <img
            src={plate.shot.src}
            alt={plate.shot.alt}
            width={plate.shot.width}
            height={plate.shot.height}
            loading="lazy"
            decoding="async"
          />
        )}
        {plate.kind === "pair" && <PairPlate shots={plate.shots} />}
        {plate.kind === "record" && <RecordPlate decision={decision} pin={pin} />}
        {markAt && (
          <span className="pd-mark" aria-hidden="true" style={{ left: markAt.left, top: markAt.top }}>
            1
          </span>
        )}
      </div>

      <footer className="pd-foot">
        {decision.lineMeasure && decision.line ? (
          <RideLine text={decision.line} measure={decision.lineMeasure} pin={pin} />
        ) : decision.line ? (
          <p className="pd-line" data-pinned={point ? "" : undefined}>
            {point && (
              <span className="pd-dot" ref={dotRef} aria-hidden="true">
                <span className="pd-dot-n">1</span>
              </span>
            )}
            {decision.line}
          </p>
        ) : decision.supersededBy ? (
          <p className="pd-line pd-line-plain">
            Superseded by{" "}
            <button
              type="button"
              className="pd-inline"
              onClick={(event) => onJump(decision.supersededBy!, event.detail === 0)}
            >
              <span className="pd-mono">{decision.supersededBy}</span>, the move to React
            </button>
            .
          </p>
        ) : null}
        <p className="pd-meta">{meta}</p>
        {decision.link &&
          (decision.link.external ? (
            <a className="pd-link" href={decision.link.href} target="_blank" rel="noreferrer">
              {decision.link.label} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <Link className="pd-link" to={decision.link.href}>
              {decision.link.label} <span aria-hidden="true">→</span>
            </Link>
          ))}
      </footer>

      {ready && (wide ? path : true) && (
        <svg className="pd-wire" aria-hidden="true" data-draw={pin === "anim" || undefined}>
          {path && <path className="pd-hair" d={path} pathLength={1} />}
          {end && <circle className="pd-end" cx={end.x} cy={end.y} r={2.5} />}
          <rect
            className="pd-outline"
            x={geometry.target.x - 4}
            y={geometry.target.y - 4}
            width={geometry.target.w + 8}
            height={geometry.target.h + 8}
            rx={Math.min(10, (geometry.target.h + 8) / 2)}
          />
        </svg>
      )}
    </article>
  );
}

function Log({
  current,
  onJump,
  rowsRef,
}: {
  current: number;
  onJump: (id: string, instant: boolean) => void;
  rowsRef: RefObject<HTMLOListElement | null>;
}) {
  const onKey = (event: KeyboardEvent<HTMLOListElement>) => {
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const next =
      event.key === "ArrowDown"
        ? Math.min(index + 1, buttons.length - 1)
        : event.key === "ArrowUp"
          ? Math.max(index - 1, 0)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? buttons.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    buttons[next].focus();
    onJump(decisions[next].id, true);
  };
  return (
    <ol className="pd-rows" ref={rowsRef} onKeyDown={onKey}>
      {decisions.map((decision, index) => (
        <li key={decision.id}>
          <button
            type="button"
            className="pd-row"
            aria-current={index === current ? "true" : undefined}
            onClick={(event: MouseEvent<HTMLButtonElement>) => onJump(decision.id, event.detail === 0)}
          >
            <span className="pd-row-id">{decision.id}</span>
            <span className="pd-row-label">{decision.label}</span>
            <span className="pd-row-result" data-exception={decision.supersededBy ? "" : undefined}>
              {decision.supersededBy ? "Superseded" : decision.result}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}

export default function Draft() {
  const wide = useMedia("(min-width: 1024px)", true);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [current, setCurrent] = useState(0);
  const [pins, setPins] = useState<Record<string, Pin>>({});
  const stackRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLOListElement>(null);
  const tops = useRef<number[]>([]);
  const cardHeight = useRef(0);
  const instant = useRef<number | null>(null);
  const currentRef = useRef(0);
  const { scrollY } = useScroll();

  const fire = useCallback(
    (index: number) => {
      const id = decisions[index].id;
      const still = reduced || instant.current === index;
      instant.current = null;
      setPins((previous) => {
        const skipped = decisions.slice(0, index).filter((decision) => !previous[decision.id]);
        if (previous[id] && !skipped.length) return previous;
        const next = { ...previous };
        for (const decision of skipped) next[decision.id] = "still";
        if (!next[id]) next[id] = still ? "still" : "anim";
        return next;
      });
    },
    [reduced],
  );

  const read = useCallback(
    (y: number) => {
      const line = wide ? STACK_TOP + cardHeight.current * 0.5 : window.innerHeight * 0.45;
      let index = 0;
      tops.current.forEach((top, i) => {
        if (top - y <= line) index = i;
      });
      if (index !== currentRef.current) {
        currentRef.current = index;
        setCurrent(index);
      }
      fire(index);
    },
    [wide, fire],
  );

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) return;
    const measure = () => {
      const cards = Array.from(stack.querySelectorAll<HTMLElement>(".pd-card"));
      if (!cards.length) return;
      const height = cards[0].offsetHeight;
      const gap = parseFloat(getComputedStyle(stack).rowGap) || 0;
      cardHeight.current = height;
      const stackTop = stack.getBoundingClientRect().top + window.scrollY;
      if (wide) {
        tops.current = cards.map((_, i) => stackTop + i * (height + gap));
        stack.style.setProperty("--card-h", `${height}px`);
        stack.style.setProperty("--pitch", `${height + gap}px`);
      } else {
        tops.current = cards.map((card) => card.getBoundingClientRect().top + window.scrollY);
      }
      read(window.scrollY);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stack);
    return () => observer.disconnect();
  }, [wide, read]);

  useMotionValueEvent(scrollY, "change", read);

  const jump = useCallback(
    (id: string, keyboard: boolean) => {
      const index = decisions.findIndex((decision) => decision.id === id);
      if (index < 0) return;
      if (keyboard) instant.current = index;
      const top = wide ? tops.current[index] - STACK_TOP : tops.current[index] - 16;
      window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
      read(window.scrollY);
    },
    [wide, read],
  );

  const log = <Log current={current} onJump={jump} rowsRef={rowsRef} />;

  return (
    <div className="pd" style={{ "--top": `${STACK_TOP}px` } as CSSProperties}>
      <title>Pinned decisions — Gentrit Rashiti</title>
      <header className="pd-top">
        <p className="pd-identity">
          <strong>Gentrit Rashiti</strong> builds web and mobile products.{" "}
          <span className="pd-identity-count">Ten decisions, 2022–2026.</span>
        </p>
        <nav className="pd-contact" aria-label="Contact">
          <a href={links.cv}>CV</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
        {!wide && (
          <a className="pd-jump" href="#pd-log">
            10 decisions <span aria-hidden="true">↓</span>
          </a>
        )}
      </header>

      <main className="pd-grid">
        {wide && (
          <nav className="pd-log" aria-label="Decision log">
            {log}
          </nav>
        )}
        <div className="pd-stack" ref={stackRef}>
          {decisions.map((decision, index) => (
            <Card
              key={decision.id}
              decision={decision}
              index={index}
              pin={pins[decision.id] ?? "idle"}
              current={index === current}
              wide={wide}
              onJump={jump}
            />
          ))}
        </div>
        {!wide && (
          <nav className="pd-log" id="pd-log" aria-labelledby="pd-log-title">
            <h2 id="pd-log-title">Ten decisions</h2>
            {log}
          </nav>
        )}
      </main>

      <footer className="pd-end-note">
        <p>
          The Vianova care and design-system screens are real product screens with invented data. The other screens
          come from public pages and store listings. Bachelor's degree, UBT. Based in Kosovo, working remotely.
        </p>
        <p className="pd-end-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>Download CV</a>
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
