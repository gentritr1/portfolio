import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
} from "react";
import { Link } from "react-router";
import { recreations } from "../../lib/recreations";
import type { MarkerSide, Note, Plate, Target } from "./plates";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Geometry {
  stage: Box;
  gutter: number;
  column: Box;
  targets: Record<string, Box>;
  tops: Record<string, number>;
  floor: number;
}

const MARKER = 9;
const NOTE_GAP = 20;

function find(root: HTMLElement, target: Target) {
  const list = root.querySelectorAll<HTMLElement>(target.css);
  for (const element of list) {
    if (
      target.text === undefined ||
      element.textContent?.trim() === target.text
    )
      return element;
  }
  return null;
}

function readCareOrg(root: HTMLElement) {
  const org = root
    .querySelector('button[aria-label^="Organization"]')
    ?.getAttribute("aria-label");
  const live = root.querySelector('[aria-live="polite"]')?.textContent ?? "";
  const zone = [...root.querySelectorAll("p")].find((p) =>
    p.textContent?.includes("Timezone"),
  );
  const offset = zone?.textContent?.match(/\(([^)]+)\)/)?.[1];
  const patient = live.split(", ")[1];
  if (!org || !patient) return "";
  return `${org.replace("Organization: ", "")} → ${patient}${offset ? `, ${offset}` : ""}`;
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

function markerPoint(box: Box, stage: Box, side: MarkerSide = "left") {
  const clampX = (x: number) =>
    Math.min(stage.x + stage.w - MARKER - 2, Math.max(stage.x + MARKER + 2, x));
  const clampY = (y: number) =>
    Math.min(stage.y + stage.h - MARKER - 2, Math.max(stage.y + MARKER + 2, y));
  if (side === "right")
    return {
      x: clampX(box.x + box.w + MARKER + 4),
      y: clampY(box.y + Math.min(box.h / 2, 22)),
    };
  if (side === "top") return { x: clampX(box.x + box.w / 2), y: clampY(box.y) };
  if (side === "below")
    return { x: clampX(box.x + MARKER), y: clampY(box.y + box.h + MARKER + 4) };
  return {
    x: clampX(box.x - MARKER - 4),
    y: clampY(box.y + Math.min(box.h / 2, 22)),
  };
}

function Stage({ plate }: { plate: Plate }) {
  if (plate.stage.kind === "recreation") {
    const entry = recreations[plate.stage.key];
    const Recreation = entry.Component;
    const style = {
      "--a-base": entry.aspect.base,
      "--a-sm": entry.aspect.sm,
      "--a-lg": entry.aspect.lg,
    } as CSSProperties;
    return (
      <div
        className="mn-screen"
        data-world={entry.world}
        data-fit={plate.stage.fit}
        style={style}
      >
        <div className="mn-fit">
          <Suspense fallback={null}>
            <Recreation />
          </Suspense>
        </div>
      </div>
    );
  }
  return (
    <div className="mn-shots">
      {plate.stage.shots.map((shot) => (
        <figure
          key={shot.id}
          data-shot={shot.id}
          data-shape={shot.width > shot.height ? "web" : "phone"}
        >
          <img
            src={shot.src}
            alt={shot.alt}
            width={shot.width}
            height={shot.height}
            loading="lazy"
            decoding="async"
          />
          <figcaption>{shot.label}</figcaption>
        </figure>
      ))}
    </div>
  );
}

export function PlateView({
  plate,
  index,
  wide,
}: {
  plate: Plate;
  index: number;
  wide: boolean;
}) {
  const plateRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef<Record<string, HTMLElement | null>>({});
  const elements = useRef<Record<string, HTMLElement>>({});
  const touched = useRef(false);
  const paused = useRef(false);
  const signature = useRef("");
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const [live, setLive] = useState("");

  const pinned = useMemo(
    () => plate.notes.filter((note) => note.target),
    [plate],
  );
  const plain = plate.notes.filter((note) => !note.target);
  const number = (note: Note) => pinned.indexOf(note) + 1;

  const measure = useCallback(() => {
    const root = plateRef.current;
    const stage = stageRef.current;
    const column = columnRef.current;
    if (!root || !stage || !column) return;
    const origin = root.getBoundingClientRect();
    const relative = (rect: DOMRect): Box => ({
      x: Math.round(rect.left - origin.left),
      y: Math.round(rect.top - origin.top),
      w: Math.round(rect.width),
      h: Math.round(rect.height),
    });
    const wrapBox = relative(stage.getBoundingClientRect());
    const screen = stage.firstElementChild;
    const stageBox = screen
      ? relative(screen.getBoundingClientRect())
      : wrapBox;
    const columnBox = relative(column.getBoundingClientRect());
    const gutter = Math.round(
      wrapBox.x + wrapBox.w + (columnBox.x - wrapBox.x - wrapBox.w) / 2,
    );
    const targets: Record<string, Box> = {};
    for (const note of pinned) {
      const element = find(stage, note.target!);
      if (!element) continue;
      elements.current[note.id] = element;
      targets[note.id] = relative(element.getBoundingClientRect());
    }
    const tops: Record<string, number> = {};
    let floor = 0;
    if (wide) {
      for (const note of pinned) {
        const box = targets[note.id];
        const height = noteRefs.current[note.id]?.offsetHeight ?? 60;
        const anchor = box
          ? Math.min(
              box.y + Math.min(box.h / 2, 22),
              stageBox.y + stageBox.h - height,
            )
          : 0;
        const wanted = box ? anchor - columnBox.y - 11 : floor;
        const top = Math.max(floor, Math.round(wanted));
        tops[note.id] = top;
        floor = top + height + NOTE_GAP;
      }
    }
    const next = {
      stage: stageBox,
      gutter,
      column: columnBox,
      targets,
      tops,
      floor,
    };
    const key = JSON.stringify(next);
    if (key !== signature.current) {
      signature.current = key;
      setGeometry(next);
    }
    if (plate.notes.some((note) => note.live === "care-org"))
      setLive(readCareOrg(stage));
    if (
      plate.stage.kind === "recreation" &&
      plate.stage.pauseDemo &&
      !paused.current
    ) {
      const demo = stage.querySelector<HTMLButtonElement>(
        '.dsr-demo[aria-pressed="true"]',
      );
      if (demo) {
        paused.current = true;
        demo.click();
      }
    }
  }, [pinned, plate, wide]);

  useLayoutEffect(() => {
    const root = plateRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const resize = new ResizeObserver(schedule);
    resize.observe(root);
    resize.observe(stage);
    const mutation = new MutationObserver(schedule);
    mutation.observe(stage, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "aria-label",
        "aria-checked",
        "aria-expanded",
        "class",
        "data-mode",
      ],
    });
    stage.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
      mutation.disconnect();
      stage.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
    };
  }, [measure]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      {
        threshold: 0.55,
      },
    );
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const first = pinned[0]?.id;
  const firstReady = Boolean(first && geometry?.targets[first]);
  useEffect(() => {
    if (!inView || touched.current || !firstReady || !first) return;
    const timer = window.setTimeout(() => {
      if (!touched.current) setActive(first);
    }, 520);
    return () => window.clearTimeout(timer);
  }, [inView, firstReady, first]);

  const choose = (id: string) => {
    touched.current = true;
    setActive(id);
  };

  const onStagePointer = (event: PointerEvent<HTMLDivElement>) => {
    if (
      event.pointerType !== "mouse" ||
      !wide ||
      !(event.movementX || event.movementY)
    )
      return;
    const hit = pinned.find((note) =>
      elements.current[note.id]?.contains(event.target as Node),
    );
    if (hit && hit.id !== active) choose(hit.id);
  };

  const activeNote = pinned.find((note) => note.id === active);
  const activeBox = active ? geometry?.targets[active] : undefined;
  let path = "";
  let end: { x: number; y: number } | null = null;
  if (wide && geometry && activeNote && activeBox) {
    const { stage, column, tops } = geometry;
    const nx = column.x - 6;
    const ny = column.y + (tops[activeNote.id] ?? 0) + 11;
    const mx = geometry.gutter;
    if (activeNote.route === "over" || activeNote.route === "under") {
      const over = activeNote.route === "over";
      const lane = over ? stage.y - 9 : stage.y + stage.h + 9;
      const cx = Math.round(activeBox.x + Math.min(activeBox.w / 2, 32));
      const ty = over ? activeBox.y - 4 : activeBox.y + activeBox.h + 4;
      path = rounded([
        [nx, ny],
        [mx, ny],
        [mx, lane],
        [cx, lane],
        [cx, ty],
      ]);
      end = { x: cx, y: ty };
    } else {
      const rawY = activeBox.y + Math.min(activeBox.h / 2, 22);
      const ty = Math.min(stage.y + stage.h - 4, Math.max(stage.y + 4, rawY));
      const tx = Math.min(stage.x + stage.w - 2, activeBox.x + activeBox.w + 5);
      path = rounded([
        [nx, ny],
        [mx, ny],
        [mx, ty],
        [tx, ty],
      ]);
      end = { x: tx, y: ty };
    }
  }

  const clipId = `mn-clip-${plate.id}`;
  const no = String(index + 1).padStart(2, "0");

  return (
    <section
      ref={plateRef}
      className="mn-plate"
      aria-labelledby={`mn-title-${plate.id}`}
      data-measured={wide && geometry ? "" : undefined}
      data-ready={
        geometry && pinned.every((note) => geometry.targets[note.id])
          ? ""
          : undefined
      }
    >
      <header className="mn-plate-head">
        <span className="mn-no">{no}</span>
        <div>
          <h2 id={`mn-title-${plate.id}`}>{plate.title}</h2>
          <p className="mn-meta">
            {plate.meta}
            <span> · {plate.source}</span>
          </p>
        </div>
      </header>

      <div ref={stageRef} className="mn-stage" onPointerMove={onStagePointer}>
        <Stage plate={plate} />
      </div>

      <div
        ref={columnRef}
        className="mn-notes"
        style={
          wide && geometry
            ? ({ "--mn-floor": `${geometry.floor}px` } as CSSProperties)
            : undefined
        }
      >
        <ol className="mn-pinned" aria-label="Notes on this screen">
          {pinned.map((note) => (
            <li
              key={note.id}
              ref={(element) => {
                noteRefs.current[note.id] = element;
              }}
              style={
                wide && geometry
                  ? { top: geometry.tops[note.id] ?? 0 }
                  : undefined
              }
            >
              <button
                type="button"
                className="mn-note"
                aria-pressed={active === note.id}
                onPointerMove={(event) => {
                  if (event.pointerType !== "mouse" || active === note.id)
                    return;
                  if (event.movementX || event.movementY) choose(note.id);
                }}
                onFocus={() => choose(note.id)}
                onClick={() => {
                  choose(note.id);
                  if (wide) return;
                  const element = elements.current[note.id];
                  const rect = element?.getBoundingClientRect();
                  if (
                    !element ||
                    !rect ||
                    (rect.bottom > 0 && rect.top < window.innerHeight)
                  )
                    return;
                  const still = window.matchMedia(
                    "(prefers-reduced-motion: reduce)",
                  ).matches;
                  element.scrollIntoView({
                    block: "center",
                    behavior: still ? "auto" : "smooth",
                  });
                }}
              >
                <span className="mn-num" aria-hidden="true">
                  {number(note)}
                </span>
                <span className="mn-text">
                  {note.text}
                  {note.live && live && (
                    <span className="mn-live" key={live}>
                      Now: {live}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {plain.length > 0 && (
          <div className="mn-plain">
            <p className="mn-plain-label">Not on this screen</p>
            <ul>
              {plain.map((note) => (
                <li key={note.id}>{note.text}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mn-links">
          {plate.links.map((link) =>
            link.internal ? (
              <Link key={link.href} to={link.href}>
                {link.label} <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            ),
          )}
        </p>
      </div>

      {geometry && (
        <svg className="mn-overlay" aria-hidden="true">
          <defs>
            <clipPath id={clipId}>
              <rect
                x={geometry.stage.x}
                y={geometry.stage.y}
                width={geometry.stage.w}
                height={geometry.stage.h}
              />
            </clipPath>
          </defs>
          {activeBox && (
            <rect
              key={`outline-${active}`}
              className="mn-outline"
              clipPath={`url(#${clipId})`}
              x={activeBox.x - 4}
              y={activeBox.y - 4}
              width={activeBox.w + 8}
              height={activeBox.h + 8}
              rx={6}
            />
          )}
          {path && (
            <path
              key={`line-${active}`}
              className="mn-line"
              d={path}
              pathLength={1}
            />
          )}
          {end && (
            <circle
              key={`end-${active}`}
              className="mn-end"
              cx={end.x}
              cy={end.y}
              r={2.5}
            />
          )}
          <g clipPath={`url(#${clipId})`}>
            {pinned.map((note) => {
              const box = geometry.targets[note.id];
              if (!box) return null;
              const point = markerPoint(box, geometry.stage, note.marker);
              return (
                <g
                  key={note.id}
                  className="mn-marker"
                  data-on={active === note.id || undefined}
                >
                  <circle cx={point.x} cy={point.y} r={MARKER} />
                  <text
                    x={point.x}
                    y={point.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                  >
                    {number(note)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      )}
    </section>
  );
}
