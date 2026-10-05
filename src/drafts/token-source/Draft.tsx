import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type RefObject,
} from "react";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import "./token-source.css";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const DRAW_MS = 180;
const RING_MS = 120;

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
    text: "Core, semantic, component. The band above reads a core value and stays when the theme flips. The cards below read roles and follow.",
    target: {
      wide: ".dsr-lane-head",
      narrow: ".dsr-area-tokens .dsr-card-head h3",
    },
    path: "core → semantic → component",
  },
  {
    id: "roles",
    figure: "36 components",
    text: "No component holds a raw colour. Each one reads a role, and the role reads a core value.",
    target: {
      wide: ".dsr-lane-list > li:nth-child(1)",
      narrow: ".dsr-lane-list > li:nth-child(1)",
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
    id: "source",
    figure: "20 releases",
    text: "In about six weeks. One source writes CSS variables, TypeScript modules and a Figma bundle.",
    target: { wide: ".dsr-pipeline", narrow: ".dsr-pipeline" },
    path: "tokens.css · tokens.ts · figma.json",
  },
];

interface Crop {
  src: string;
  alt: string;
  width: number;
  height: number;
  /** Crop box on the source image: x, y, w, h. A narrow box is used under 640 px. */
  box: [number, number, number, number];
  narrowBox?: [number, number, number, number];
}

interface CardData {
  id: string;
  years: string;
  role: string;
  name: string;
  result: string;
  facts?: string;
  more?: { name: string; years: string }[];
  plate: { kind: "crop"; crop: Crop } | { kind: "care" };
  href: string;
  kind: "phone" | "web";
}

const cards: CardData[] = [
  {
    id: "read-to-feed",
    years: "2022–25",
    role: "Mobile",
    name: "Read to Feed",
    result: "About 14 releases to both stores, and React Native 0.63 → 0.81.",
    more: [
      { name: "Dukagjini Bookstore", years: "2021–22" },
      { name: "Viva Fresh", years: "2023" },
    ],
    plate: {
      kind: "crop",
      crop: {
        src: "/mobile/reading-1.webp",
        alt: "Read to Feed store screenshot: My Books with reading progress for The Tale of Peter Rabbit and Anne of Green Gables",
        width: 780,
        height: 1689,
        box: [98, 516, 588, 1016],
        narrowBox: [98, 516, 588, 600],
      },
    },
    href: "/work/read-to-feed",
    kind: "phone",
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
        box: [0, 0, 1440, 900],
      },
    },
    href: "/work/bayyinah-tv",
    kind: "web",
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
    plate: { kind: "care" },
    href: "/work/care-platform",
    kind: "web",
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
    result: "16 security tests",
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

function Spec({
  bandRef,
  lanes,
  narrow,
  reduce,
  onTokens,
}: {
  bandRef: RefObject<HTMLDivElement | null>;
  lanes: Lane[];
  narrow: boolean;
  reduce: boolean;
  onTokens: (dsr: HTMLElement) => void;
}) {
  const specimen = recreations["design-system"];
  const Specimen = specimen.Component;
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<SVGLinearGradientElement>(null);
  const noteRefs = useRef<(HTMLLIElement | null)[]>([]);
  const markerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pathARefs = useRef<(SVGPathElement | null)[]>([]);
  const pathBRefs = useRef<(SVGPathElement | null)[]>([]);
  const ringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(0);
  const [ready, setReady] = useState(false);
  const currentRef = useRef(0);
  const drawn = useRef(false);
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
      const band = bandRef.current?.getBoundingClientRect();
      if (band && gradientRef.current) {
        const y = Math.round(band.bottom - s.top);
        gradientRef.current.setAttribute("y1", String(y));
        gradientRef.current.setAttribute("y2", String(y + 1));
      }
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
      const scroller = plate.querySelector<HTMLElement>(".dsr-scroll");
      const end = narrow
        ? plate.querySelector<HTMLElement>(".dsr-lane-list > li:nth-child(1)")
        : plate.querySelector<HTMLElement>(".dsr-area-tokens");
      if (scroller && end) {
        const box = scroller.getBoundingClientRect();
        const height = Math.ceil(
          end.getBoundingClientRect().bottom -
            box.top +
            scroller.scrollTop +
            (narrow ? 4 : 16),
        );
        if (Math.abs(plate.offsetHeight - height) > 1) {
          plate.style.height = `${height}px`;
          section.style.setProperty("--ts-plate-px", `${height}px`);
        }
      }
      const list = listRef.current;
      const last = noteRefs.current[notes.length - 1];
      if (list && last) {
        const pinTop =
          parseFloat(
            getComputedStyle(section).getPropertyValue("--ts-pin-top"),
          ) || 0;
        const listGap = narrow ? 14 : 18;
        const length = Math.max(
          0,
          Math.round(
            plate.offsetHeight +
              listGap +
              last.offsetTop -
              (pinY - pinTop) +
              12,
          ),
        );
        const was =
          parseFloat(section.style.getPropertyValue("--ts-pin-length")) || 0;
        if (Math.abs(was - length) > 1)
          section.style.setProperty("--ts-pin-length", `${length}px`);
      }
      const toggle = plate.querySelector<HTMLElement>(".dsr-segment");
      if (toggle && hintRef.current) {
        const g = toggle.getBoundingClientRect();
        hintRef.current.style.transform = `translateX(${Math.round(g.left + g.width / 2 - p.left)}px)`;
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
        const t = target.getBoundingClientRect();
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
  }, [ready, narrow, bandRef]);

  /* A note that becomes current draws its wire: the outside run, then the run inside the plate, then the ring. */
  useLayoutEffect(() => {
    if (!ready) return;
    const a = pathARefs.current[current];
    const b = pathBRefs.current[current];
    const ring = ringRefs.current[current];
    const plate = plateRef.current;
    const first = !drawn.current;
    drawn.current = true;
    if (narrow && plate && !first) {
      const scroller = plate.querySelector<HTMLElement>(".dsr-scroll");
      const target = scroller?.querySelector<HTMLElement>(
        notes[current].target.narrow,
      );
      if (scroller && target) {
        const t = target.getBoundingClientRect();
        const box = scroller.getBoundingClientRect();
        if (t.top < box.top + 8 || t.bottom > box.bottom - 8) {
          scroller.scrollTo({
            top: current === 0 ? 0 : scroller.scrollTop + t.top - box.top - 52,
            behavior: reduce ? "auto" : "smooth",
          });
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
        easing: "linear",
        fill: "backwards",
      }),
      b.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
        duration: DRAW_MS * (1 - share),
        delay: DRAW_MS * share,
        easing: EASE_OUT,
        fill: "backwards",
      }),
      ring.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: RING_MS,
        delay: DRAW_MS,
        easing: EASE_OUT,
        fill: "backwards",
      }),
    ];
    return () => animations.forEach((animation) => animation.cancel());
  }, [current, ready, reduce, narrow]);

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
          <p className="ts-hint" ref={hintRef} aria-hidden>
            Light or Dark: this page follows <span>↓</span>
          </p>
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
                  : note.path}
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
        <defs>
          <linearGradient
            id="ts-wire-ink"
            ref={gradientRef}
            gradientUnits="userSpaceOnUse"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop offset="0" className="ts-stop-band" />
            <stop offset="1" className="ts-stop-ground" />
          </linearGradient>
        </defs>
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

function CropPlate({ crop, eager }: { crop: Crop; eager?: boolean }) {
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
          ...style(crop.narrowBox ?? crop.box, "narrow"),
        } as CSSProperties
      }
    >
      <img
        src={crop.src}
        alt={crop.alt}
        width={crop.width}
        height={crop.height}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
}

function CarePlate() {
  const ref = useRef<HTMLDivElement>(null);
  const [mount, setMount] = useState(false);
  const care = recreations.care;
  const Care = care.Component;
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          care.load();
          setMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "900px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [care]);
  return (
    <div className="ts-live" ref={ref} data-world={care.world}>
      {mount ? (
        <Suspense fallback={<div className="ts-wait" />}>
          <Care />
        </Suspense>
      ) : (
        <div className="ts-wait" />
      )}
    </div>
  );
}

function Card({ card, surface }: { card: CardData; surface: Lane }) {
  return (
    <article
      className="ts-card"
      id={card.id}
      data-kind={card.kind}
      aria-labelledby={`${card.id}-name`}
    >
      <div className="ts-card-plate">
        {card.plate.kind === "care" ? (
          <CarePlate />
        ) : (
          <CropPlate crop={card.plate.crop} />
        )}
      </div>
      <div className="ts-card-text">
        <p className="ts-card-meta">
          <span>
            {card.role} · {card.years}
          </span>
          <code
            className="ts-card-token"
            title="The token this card's surface reads"
          >
            {surface.component} → {surface.core}
          </code>
        </p>
        <h3 className="ts-card-name" id={`${card.id}-name`}>
          {card.name}
        </h3>
        <p className="ts-card-result">{card.result}</p>
        {card.facts && <p className="ts-card-facts">{card.facts}</p>}
        {card.more && (
          <dl className="ts-more">
            <dt>Also in both stores</dt>
            {card.more.map((item) => (
              <dd key={item.name}>
                <span>{item.name}</span>
                <span>{item.years}</span>
              </dd>
            ))}
          </dl>
        )}
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
  const bandRef = useRef<HTMLDivElement>(null);
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
        Gentrit Rashiti — web and mobile, from the token to the release
      </title>
      <div className="ts-band" ref={bandRef} aria-hidden />
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
          <h1>Web and mobile products, from the token to the release.</h1>
          <p>
            5+ years. Part of two platform rewrites. Based in Kosovo, working
            remotely.
          </p>
        </div>
      </header>

      <main>
        <Spec
          bandRef={bandRef}
          lanes={lanes}
          narrow={narrow}
          reduce={reduce}
          onTokens={onTokens}
        />

        <section className="ts-stack" id="work" aria-label="Work">
          {cards.map((card) => (
            <Card key={card.id} card={card} surface={surface} />
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
          The specimen and the care screen are recreations with invented data.
          The Read to Feed and Bayyinah TV images come from their public store
          and web pages.
        </p>
      </footer>
    </div>
  );
}
