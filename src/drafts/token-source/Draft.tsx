import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { coreName, semantic } from "../../worlds/design-system/tokens";
import "./token-source.css";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const EASE_MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";
const ARRIVE_MS = 280;
const DRAW_MS = 180;
const RING_MS = 120;
/* The specimen board's padding inside the plate, set in token-source.css. */
const PLATE_PAD = 12;
/* Room under the pinned plate for its recreation label; token-source.css uses the same 30 px. */
const LABEL_SPACE = 30;
const RECREATION = "Recreation · invented data";

type Theme = "light" | "dark";

interface Lane {
  component: string;
  role: string;
  core: string;
}

/* Light values of the specimen's lanes, shown until the live plate reports its own. */
const FALLBACK_LANES: Lane[] = [
  { component: "button.solid.bg", role: "action.primary", core: "cobalt.600" },
  { component: "card.surface", role: "surface.raised", core: "stone.0" },
  { component: "field.text", role: "text.primary", core: "stone.900" },
  { component: "alert.success.icon", role: "status.success", core: "fern.600" },
  { component: "field.focus.ring", role: "border.focus", core: "cobalt.500" },
];

/* Page variable ← specimen variable. The page paints with the values the plate computes. */
const TOKEN_VARS: [string, string][] = [
  ["--ts-card", "--card-surface"],
  ["--ts-card-line", "--card-border"],
  ["--ts-card-ink", "--text-primary"],
  ["--ts-card-muted", "--text-secondary"],
  ["--ts-link", "--action-primary"],
  ["--ts-soft", "--action-soft"],
  ["--ts-soft-ink", "--action-soft-text"],
  ["--ts-focus", "--border-focus"],
  ["--ts-band", "--core-cobalt-600"],
  ["--ts-ground", "--core-stone-0"],
  ["--ts-plate-ground", "--core-stone-50"],
  ["--ts-ink", "--core-stone-950"],
  ["--ts-muted", "--core-stone-600"],
  ["--ts-line", "--core-stone-200"],
];

interface Note {
  id: string;
  figure: string;
  text: string;
  /** Selector inside the specimen for wide and narrow plates. */
  target: { wide: string; narrow: string };
  /** Index into the specimen's lanes when the note names a lane. */
  lane?: number;
  path?: string;
}

const notes: Note[] = [
  {
    id: "tiers",
    figure: "805 tokens",
    text: "Light or Dark: this page follows. The band reads a core value and stays; the cards read roles and follow.",
    target: {
      wide: ".dsr-pipeline",
      narrow: ".dsr-lane-list > li:nth-child(1) .dsr-core",
    },
    path: "One source → tokens.css · tokens.ts · figma.json",
  },
  {
    id: "roles",
    figure: "36 components",
    text: "No component holds a raw colour. Each one reads a role, and the role reads a core value.",
    target: {
      wide: ".dsr-lane-list > li:nth-child(1)",
      narrow: ".dsr-lane-list > li:nth-child(1) .dsr-chip-component",
    },
    lane: 0,
  },
  {
    id: "focus",
    figure: "WCAG 2.1 AA",
    text: "Each component is built to these floors, with axe tests and in-browser contrast checks.",
    target: {
      wide: ".dsr-lane-list > li:nth-child(5)",
      narrow: ".dsr-lane-list > li:nth-child(5)",
    },
    lane: 4,
  },
  {
    id: "releases",
    figure: "20 releases",
    text: "In about six weeks. A consumer that imports only the Button loads 96.6% less JavaScript.",
    target: {
      wide: '.dsr-alert[data-tone="info"]',
      narrow: '.dsr-alert[data-tone="info"]',
    },
  },
];

interface Crop {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Crop box on the source image: x, y, w, h. The wide box is 2:1; the narrow box (under 1024 px) is 4:3. */
  box: [number, number, number, number];
  narrowBox: [number, number, number, number];
  /** Where the image comes from, shown under the plate. */
  source: string;
}

type LiveKey = "care" | "reader";

interface CardData {
  id: string;
  years: string;
  role: string;
  name: string;
  result: string;
  facts: string;
  plate: { kind: "crop"; crop: Crop } | { kind: "live"; key: LiveKey };
  /** A store screenshot that replaces a live plate under 640 px. */
  phoneCrop?: Crop;
  href: string;
}

const cards: CardData[] = [
  {
    id: "read-to-feed",
    years: "2022–25",
    role: "Mobile",
    name: "Read to Feed",
    result: "About 14 releases to both stores, and React Native 0.63 → 0.81.",
    facts: "PDF and EPUB reader · ISBN barcode scanner · three languages",
    plate: { kind: "live", key: "reader" },
    phoneCrop: {
      src: "/mobile/reading-1.webp",
      alt: "Read to Feed store screenshot: My Books with reading progress for The Tale of Peter Rabbit",
      width: 780,
      height: 1689,
      box: [98, 516, 588, 600],
      narrowBox: [98, 516, 588, 600],
      source: "Public store screenshot",
    },
    href: "/work/read-to-feed",
  },
  {
    id: "bayyinah-tv",
    years: "2023–26",
    role: "Frontend",
    name: "Bayyinah TV",
    result:
      "A full rebuild on Nuxt 3 from an empty template: 34 routes, 270+ components.",
    facts:
      "Live streams with chat · HLS paywall · English and Arabic, right to left",
    plate: {
      kind: "crop",
      crop: {
        src: "/showcase/bayyinah/web-04.webp",
        alt: "Bayyinah TV library, Stories tab: filters by prophet and a row of story courses",
        width: 1440,
        height: 900,
        box: [0, 146, 1440, 720],
        narrowBox: [50, 146, 960, 720],
        source: "Public web page",
      },
    },
    href: "/work/bayyinah-tv",
  },
  {
    id: "care-platform",
    years: "2026",
    role: "Full stack",
    name: "Care-management platform",
    result:
      "Moves from Vue to React one route at a time, each after a parity test on both apps.",
    facts:
      "On Design System v2 · four languages · one report from 16 queries to 2",
    plate: { kind: "live", key: "care" },
    href: "/work/care-platform",
  },
];

const record: { decision: string; result: string; href: string }[] = [
  {
    decision: "Build a design system from one token source",
    result: "36 components · 805 tokens",
    href: "/work/design-system-react",
  },
  {
    decision: "Move the care platform to React, route by route",
    result: "parity tests on both apps",
    href: "/work/care-platform",
  },
  {
    decision: "Cut the queries of one billing report",
    result: "16 → 2",
    href: "/work/care-api",
  },
  {
    decision: "Rebuild a video platform on Nuxt 3",
    result: "34 routes · 270+ components",
    href: "/work/bayyinah-tv",
  },
  {
    decision: "Ship one React Native codebase to both stores",
    result: "about 14 releases",
    href: "/work/read-to-feed",
  },
  {
    decision: "Upgrade React Native through three major versions",
    result: "0.63 → 0.81",
    href: "/work/read-to-feed",
  },
  {
    decision: "Lay out English and Arabic, right to left",
    result: "EN · AR",
    href: "/work/bayyinah-tv",
  },
  {
    decision: "Run one care interface in four languages",
    result: "EN · DE · ES · TR",
    href: "/work/care-platform",
  },
  {
    decision: "Cut the image weight of a studio site",
    result: "972 KB → 337 KB",
    href: "/work/snaxx-tech",
  },
  {
    decision: "Test tenant isolation in a time-off app",
    result: "about 200 tests",
    href: "/work/offday",
  },
];

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

function readLanes(dsr: Element): Lane[] {
  const lanes: Lane[] = [];
  for (const element of dsr.querySelectorAll(".dsr-lane-list > li > .dsr-sr")) {
    const match = /^(\S+) uses (\S+), which is (\S+)\.$/.exec(
      element.textContent ?? "",
    );
    if (match)
      lanes.push({ component: match[1], role: match[2], core: match[3] });
  }
  return lanes.length === FALLBACK_LANES.length ? lanes : FALLBACK_LANES;
}

const laneKey = (lanes: Lane[]) => lanes.map((lane) => lane.core).join(" ");

/* ---------- Specimen and passing notes ---------- */

const ROWS = ".dsr-card-head, .dsr-lane-list > li, .dsr-pipeline, .dsr-alert";

/** The inner scroll offset that keeps the target whole, cuts no row at either edge, and sits nearest to the target 12 px under the top. */
function wholeRowOffset(scroller: HTMLElement, target: HTMLElement) {
  const box = scroller.getBoundingClientRect();
  const base = scroller.scrollTop;
  const h = box.height;
  const offset = (rect: DOMRect) => rect.top - box.top + base;
  const t = target.getBoundingClientRect();
  const want = offset(t) - 12;
  const rows = [...scroller.querySelectorAll<HTMLElement>(ROWS)].map(
    (row) => {
      const rect = row.getBoundingClientRect();
      return [offset(rect), offset(rect) + rect.height];
    },
  );
  const lo = Math.max(0, Math.ceil(offset(t) + t.height - h + 4));
  const hi = Math.max(lo, Math.floor(offset(t) - 4));
  let best = want;
  let bestScore = Infinity;
  for (let s = lo; s <= hi; s++) {
    let cuts = 0;
    for (const [top, bottom] of rows) {
      if ((top < s && bottom > s) || (top < s + h && bottom > s + h)) cuts++;
    }
    const score = cuts * 10000 + Math.abs(s - want);
    if (score < bestScore) {
      bestScore = score;
      best = s;
    }
  }
  return best;
}

function Spec({
  lanes,
  theme,
  narrow,
  reduce,
  onTokens,
}: {
  lanes: Lane[];
  theme: Theme;
  narrow: boolean;
  reduce: boolean;
  onTokens: (dsr: HTMLElement) => void;
}) {
  const specimen = recreations["design-system"];
  const Specimen = specimen.Component;
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const noteRefs = useRef<(HTMLLIElement | null)[]>([]);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pathARefs = useRef<(SVGPathElement | null)[]>([]);
  const pathBRefs = useRef<(SVGPathElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const listRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const currentRef = useRef(0);
  const drawn = useRef(false);
  const arrival = useRef<Animation | null>(null);
  const mode = useRef<string | null>(null);

  /* Watch the specimen: pause its demo once, and report its tokens whenever its theme changes. */
  useEffect(() => {
    const plate = plateRef.current;
    if (!plate) return;
    const check = () => {
      const dsr = plate.querySelector<HTMLElement>(".dsr");
      if (!dsr) return;
      if (mode.current === null) {
        plate
          .querySelector<HTMLButtonElement>('.dsr-demo[aria-pressed="true"]')
          ?.click();
        setReady(true);
      }
      if (dsr.dataset.mode !== mode.current) {
        mode.current = dsr.dataset.mode ?? "light";
        onTokens(dsr);
      }
    };
    const observer = new MutationObserver(check);
    observer.observe(plate, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-mode"],
    });
    check();
    return () => observer.disconnect();
  }, [onTokens]);

  /* Geometry: which note is current, and where each wire runs. Written to the DOM, not to state. */
  useEffect(() => {
    const section = sectionRef.current;
    const plate = plateRef.current;
    if (!section || !plate || !ready) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const s = section.getBoundingClientRect();
      const p = plate.getBoundingClientRect();
      const pinY = window.innerHeight * (narrow ? 0.6 : 0.74);
      let next = 0;
      noteRefs.current.forEach((note, index) => {
        if (note && note.getBoundingClientRect().top <= pinY) next = index;
      });
      if (window.scrollY < 24) next = 0;
      if (next !== currentRef.current) {
        currentRef.current = next;
        setCurrent(next);
      }
      /* A row that is still arriving is measured at its end position. */
      const board = plate.querySelector<HTMLElement>(".dsr-board");
      const moving = board ? getComputedStyle(board).transform : "none";
      const lift = moving === "none" ? 0 : new DOMMatrixReadOnly(moving).m42;
      const scroller = plate.querySelector<HTMLElement>(".dsr-scroll");
      const end = narrow
        ? plate.querySelector<HTMLElement>(".dsr-lane-list > li:nth-child(1)")
        : plate.querySelector<HTMLElement>(".dsr-area-tokens");
      if (scroller && end) {
        const box = scroller.getBoundingClientRect();
        const height = Math.ceil(
          end.getBoundingClientRect().bottom -
            lift -
            box.top +
            scroller.scrollTop +
            (narrow ? 4 : PLATE_PAD),
        );
        if (Math.abs(plate.offsetHeight - height) > 1) {
          plate.style.height = `${height}px`;
          section.style.setProperty("--ts-plate-px", `${height}px`);
        }
      }
      const list = listRef.current;
      const last = noteRefs.current[notes.length - 1];
      const previous = noteRefs.current[notes.length - 2];
      if (list && last && previous) {
        const pinTop =
          parseFloat(
            getComputedStyle(section).getPropertyValue("--ts-pin-top"),
          ) || 0;
        const listGap = (narrow ? 14 : 18) + LABEL_SPACE;
        /* The pin holds until the last note is current and the note before it has faded out above the plate's bottom edge. */
        const release = Math.min(
          pinY - 12,
          pinTop +
            plate.offsetHeight +
            LABEL_SPACE +
            last.offsetTop -
            previous.offsetTop -
            2,
        );
        const length = Math.max(
          0,
          Math.round(
            pinTop + plate.offsetHeight + listGap + last.offsetTop - release,
          ),
        );
        const was =
          parseFloat(section.style.getPropertyValue("--ts-pin-length")) || 0;
        if (Math.abs(was - length) > 1)
          section.style.setProperty("--ts-pin-length", `${length}px`);
      }
      const gutter = p.left - s.left - (narrow ? 8 : 22);
      const plateLeft = p.left - s.left;
      const top = p.top - s.top + 10;
      const bottom = p.bottom - s.top - 10;
      notes.forEach((note, index) => {
        const marker = markerRefs.current[index];
        const a = pathARefs.current[index];
        const b = pathBRefs.current[index];
        const ring = ringRefs.current[index];
        const target = plate.querySelector<HTMLElement>(
          narrow ? note.target.narrow : note.target.wide,
        );
        if (!marker || !a || !b || !ring || !target) return;
        const m = marker.getBoundingClientRect();
        const raw = target.getBoundingClientRect();
        const t = {
          left: raw.left,
          width: raw.width,
          height: raw.height,
          top: raw.top - lift,
          bottom: raw.bottom - lift,
        };
        const mx = Math.round(m.left + m.width / 2 - s.left);
        const my = Math.round(m.top + m.height / 2 - s.top);
        const rawY = t.top + t.height / 2 - s.top;
        const ty = Math.round(Math.min(bottom, Math.max(top, rawY)));
        const tx = Math.round(t.left - s.left - 5);
        const r = Math.max(0, Math.min(10, (my - ty) / 2, mx - gutter));
        a.setAttribute(
          "d",
          `M${mx} ${my}H${gutter + r}Q${gutter} ${my} ${gutter} ${my - r}V${ty + r}Q${gutter} ${ty} ${gutter + r} ${ty}H${plateLeft}`,
        );
        b.setAttribute("d", `M${plateLeft} ${ty}H${Math.max(plateLeft, tx)}`);
        const visible = t.bottom > p.top + 4 && t.top < p.bottom - 4;
        ring.style.transform = `translate(${Math.round(t.left - s.left - 5)}px, ${Math.round(t.top - s.top - 5)}px)`;
        ring.style.width = `${Math.round(t.width + 10)}px`;
        ring.style.height = `${Math.round(t.height + 10)}px`;
        ring.dataset.visible = String(visible);
        ring.style.clipPath = `inset(${Math.max(0, p.top - t.top + 5)}px 0 ${Math.max(0, t.bottom - p.bottom + 5)}px 0)`;
      });
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    plate.addEventListener("scroll", schedule, {
      capture: true,
      passive: true,
    });
    const resize = new ResizeObserver(schedule);
    resize.observe(section);
    resize.observe(plate);
    const mutation = new MutationObserver(schedule);
    mutation.observe(plate, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-mode", "class"],
    });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      plate.removeEventListener("scroll", schedule, { capture: true });
      resize.disconnect();
      mutation.disconnect();
    };
  }, [ready, narrow]);

  /* A note that becomes current brings its row into the plate, then draws its wire: the outside run, the run inside the plate, the ring. */
  useLayoutEffect(() => {
    if (!ready) return;
    const a = pathARefs.current[current];
    const b = pathBRefs.current[current];
    const ring = ringRefs.current[current];
    const plate = plateRef.current;
    const first = !drawn.current;
    drawn.current = true;
    const scroller = plate?.querySelector<HTMLElement>(".dsr-scroll");
    const target = scroller?.querySelector<HTMLElement>(
      narrow ? notes[current].target.narrow : notes[current].target.wide,
    );
    let arrive = 0;
    if (scroller && target) {
      arrival.current?.cancel();
      const box = scroller.getBoundingClientRect();
      let top = 0;
      if (narrow) {
        top = current === 0 ? 0 : wholeRowOffset(scroller, target);
      } else {
        const panel = target.closest<HTMLElement>(".dsr-card");
        if (panel)
          top =
            scroller.scrollTop +
            panel.getBoundingClientRect().top -
            box.top -
            PLATE_PAD;
      }
      const shift = Math.round(top - scroller.scrollTop);
      if (Math.abs(shift) > 1) {
        scroller.scrollTop = top;
        const board = scroller.querySelector<HTMLElement>(".dsr-board");
        if (board && !first && !reduce) {
          arrival.current = board.animate(
            [{ transform: `translateY(${shift}px)` }, { transform: "none" }],
            { duration: ARRIVE_MS, easing: EASE_MOVE },
          );
          arrive = ARRIVE_MS;
        }
      }
    }
    if (first || reduce || !a || !b || !ring) return;
    const la = a.getTotalLength();
    const lb = b.getTotalLength();
    const share = la + lb > 0 ? la / (la + lb) : 1;
    const animations = [
      a.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: DRAW_MS * share,
        delay: arrive,
        easing: "linear",
        fill: "backwards",
      }),
      b.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: DRAW_MS * (1 - share),
        delay: arrive + DRAW_MS * share,
        easing: EASE_OUT,
        fill: "backwards",
      }),
      ring.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: RING_MS,
        delay: arrive + DRAW_MS,
        easing: EASE_OUT,
        fill: "backwards",
      }),
    ];
    return () => animations.forEach((animation) => animation.cancel());
  }, [current, ready, reduce, narrow]);

  const info = semantic["status.info"][theme];

  return (
    <section
      className="ts-spec"
      ref={sectionRef}
      aria-label="Design system specimen"
    >
      <div className="ts-zone">
        <div className="ts-pin">
          <div className="ts-plate" ref={plateRef} data-world={specimen.world}>
            <Suspense fallback={<div className="ts-wait" />}>
              <Specimen />
            </Suspense>
          </div>
          <p className="ts-plate-label">{RECREATION}</p>
        </div>
      </div>
      <ol className="ts-notes" ref={listRef}>
        {notes.map((note, index) => {
          const lane = note.lane === undefined ? undefined : lanes[note.lane];
          return (
            <li
              key={note.id}
              className="ts-note"
              data-current={index === current}
              ref={(element) => {
                noteRefs.current[index] = element;
              }}
            >
              <span
                className="ts-marker"
                aria-hidden
                ref={(element) => {
                  markerRefs.current[index] = element;
                }}
              />
              <strong className="ts-figure">{note.figure}</strong>
              <span className="ts-note-text">{note.text}</span>
              <code className="ts-path">
                {lane
                  ? `${lane.component} → ${lane.role} → ${lane.core}`
                  : (note.path ?? `status.info → ${coreName(info)}`)}
                {note.id === "focus" && (
                  <>
                    {" → "}
                    <span className="ts-outline-sample">
                      this page's focus outline
                    </span>
                  </>
                )}
              </code>
            </li>
          );
        })}
      </ol>
      <svg className="ts-wires" aria-hidden data-ready={ready}>
        {notes.map((note, index) => (
          <g key={note.id} className="ts-wire" data-on={index === current}>
            <path
              className="ts-wire-out"
              pathLength={1}
              ref={(element) => {
                pathARefs.current[index] = element;
              }}
            />
            <path
              className="ts-wire-in"
              pathLength={1}
              ref={(element) => {
                pathBRefs.current[index] = element;
              }}
            />
          </g>
        ))}
      </svg>
      {notes.map((note, index) => (
        <span
          key={note.id}
          className="ts-ring"
          aria-hidden
          data-on={ready && index === current}
          ref={(element) => {
            ringRefs.current[index] = element;
          }}
        />
      ))}
    </section>
  );
}

/* ---------- Big cards ---------- */

function CropPlate({ crop }: { crop: Crop }) {
  const style = (box: [number, number, number, number], prefix: string) => ({
    [`--${prefix}-ratio`]: `${box[2]} / ${box[3]}`,
    [`--${prefix}-w`]: `${(crop.width / box[2]) * 100}%`,
    [`--${prefix}-x`]: `${(-box[0] / crop.width) * 100}%`,
    [`--${prefix}-y`]: `${(-box[1] / crop.height) * 100}%`,
  });
  return (
    <div
      className="ts-crop"
      style={
        {
          ...style(crop.box, "wide"),
          ...style(crop.narrowBox, "narrow"),
        } as CSSProperties
      }
    >
      <img
        src={crop.src}
        alt={crop.alt}
        width={crop.width}
        height={crop.height}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

function LivePlate({ name }: { name: LiveKey }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const live = recreations[name];
  const Live = live.Component;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          live.load();
          setMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [live]);
  return (
    <div className="ts-live" ref={ref} data-world={live.world}>
      <div className="ts-live-box">
        {mount ? (
          <Suspense fallback={<div className="ts-wait" />}>
            <Live />
          </Suspense>
        ) : (
          <div className="ts-wait" />
        )}
      </div>
    </div>
  );
}

function Card({
  card,
  surface,
  narrow,
}: {
  card: CardData;
  surface: Lane;
  narrow: boolean;
}) {
  const plate =
    narrow && card.phoneCrop
      ? ({ kind: "crop", crop: card.phoneCrop } as const)
      : card.plate;
  return (
    <article
      className="ts-card"
      id={card.id}
      data-plate={plate.kind === "crop" ? "crop" : plate.key}
      aria-labelledby={`${card.id}-name`}
    >
      <div className="ts-card-media">
        <div className="ts-card-plate">
          {plate.kind === "crop" ? (
            <CropPlate crop={plate.crop} />
          ) : (
            <LivePlate name={plate.key} />
          )}
        </div>
        <p className="ts-plate-label">
          {plate.kind === "crop" ? plate.crop.source : RECREATION}
        </p>
      </div>
      <div className="ts-card-text">
        <p className="ts-card-meta">
          {card.role} · {card.years}
        </p>
        <h3 className="ts-card-name" id={`${card.id}-name`}>
          {card.name}
        </h3>
        <p className="ts-card-result">{card.result}</p>
        <p className="ts-card-facts">{card.facts}</p>
        <code
          className="ts-card-token"
          title="The token this card's surface reads"
        >
          {surface.component} → {surface.core}
        </code>
        <a className="ts-link" href={card.href}>
          Open the case <span aria-hidden>→</span>
        </a>
      </div>
    </article>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [lanes, setLanes] = useState<Lane[]>(FALLBACK_LANES);
  const narrow = useMedia("(max-width: 639px)", false);
  const reduce = useMedia("(prefers-reduced-motion: reduce)", false);

  const onTokens = useCallback((dsr: HTMLElement) => {
    const root = rootRef.current;
    if (!root) return;
    const computed = getComputedStyle(dsr);
    for (const [to, from] of TOKEN_VARS) {
      const value = computed.getPropertyValue(from).trim();
      if (value) root.style.setProperty(to, value);
    }
    setTheme(dsr.dataset.mode === "dark" ? "dark" : "light");
    const next = readLanes(dsr);
    setLanes((previous) =>
      laneKey(previous) === laneKey(next) ? previous : next,
    );
  }, []);

  const surface =
    lanes.find((lane) => lane.component === "card.surface") ??
    FALLBACK_LANES[1];

  return (
    <div className="ts" ref={rootRef} data-theme={theme}>
      <title>
        Gentrit Rashiti — every colour from one token source
      </title>
      <header className="ts-head">
        <nav className="ts-top" aria-label="Site">
          <a className="ts-name" href="/">
            Gentrit Rashiti
          </a>
          <span className="ts-top-links">
            <a href="#work">Work</a>
            <a href={links.cv}>CV</a>
            <a href={`mailto:${links.email}`}>Email</a>
          </span>
        </nav>
        <div className="ts-claim">
          <h1>Every colour on this page comes from one token source.</h1>
          <p>
            Web and mobile products. 5+&nbsp;years. Part of two platform
            rewrites. Based in Kosovo.
          </p>
        </div>
      </header>

      <main>
        <Spec
          lanes={lanes}
          theme={theme}
          narrow={narrow}
          reduce={reduce}
          onTokens={onTokens}
        />

        <section className="ts-stack" id="work" aria-label="Work">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              surface={surface}
              narrow={narrow}
            />
          ))}
        </section>

        <section className="ts-record" aria-labelledby="ts-record-title">
          <h2 id="ts-record-title">Ten results, 2021–2026</h2>
          <ol>
            {record.map((row) => (
              <li key={row.decision}>
                <a href={row.href}>
                  <span className="ts-decision">{row.decision}</span>
                  <span className="ts-result">{row.result}</span>
                </a>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="ts-foot">
        <p className="ts-foot-links">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.cv}>CV</a>
          <a href={links.github}>GitHub</a>
          <a href={links.linkedin}>LinkedIn</a>
        </p>
        <p className="ts-foot-note">
          The specimen, the reader and the care screen are recreations with
          invented data. The Bayyinah TV image, and the Read to Feed image on
          a phone, come from their public web and store pages.
        </p>
      </footer>
    </div>
  );
}
