import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { CropShot } from "../../components/CropShot";
import { REAL_SCREENS, careShots, dsShots, type Px } from "../../content/careShots";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import {
  component,
  coreName,
  semantic,
  tokenStyle,
} from "../../worlds/design-system/tokens";
import "./token-source.css";

const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
const DRAW_MS = 180;
const RING_MS = 120;
/* Room under the pinned plate for its label; token-source.css uses the same 30 px. */
const LABEL_SPACE = 30;
const RECREATION = "Recreation · invented data";
const SHOT = dsShots.top;
const PAGE_TOKENS = tokenStyle("light");
const SURFACE = `card.surface → ${coreName(semantic[component["card.surface"]].light)}`;

interface Note {
  id: string;
  figure: string;
  text: string;
  /** The part of the shot the note names, in the shot's CSS pixels. */
  part: Px;
  path?: string;
}

const notes: Note[] = [
  {
    id: "tiers",
    figure: "805 tokens",
    text: "Three tiers in one source: core values, semantic roles and component parts.",
    part: { x: 16, y: 144, w: 688, h: 155 },
    path: "One source → CSS · TypeScript · Figma bundle",
  },
  {
    id: "roles",
    figure: "36 components",
    text: "No component holds a raw colour. Each one reads a role, and the role reads a core value.",
    part: { x: 16, y: 24, w: 652, h: 92 },
  },
  {
    id: "focus",
    figure: "WCAG 2.1 AA",
    text: "Each component is built to these floors, with axe tests and in-browser contrast checks.",
    part: { x: 16, y: 232, w: 688, h: 67 },
  },
  {
    id: "releases",
    figure: "20 releases",
    text: "In about six weeks. A consumer that imports only the Button loads 96.6% less JavaScript.",
    part: { x: 16, y: 24, w: 127, h: 34 },
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

type LiveKey = "reader";

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
    plate: {
      kind: "crop",
      crop: {
        src: careShots.claims.src,
        alt: careShots.claims.alt,
        width: careShots.claims.width,
        height: careShots.claims.height,
        box: [246, 160, 1194, 597],
        narrowBox: [246, 160, 1194, 714],
        source: REAL_SCREENS,
      },
    },
    phoneCrop: {
      src: careShots.patients.src,
      alt: careShots.patients.alt,
      width: careShots.patients.width,
      height: careShots.patients.height,
      box: [240, 198, 590, 314],
      narrowBox: [240, 198, 590, 314],
      source: REAL_SCREENS,
    },
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

/* ---------- Specimen and passing notes ---------- */

function Spec({ narrow, reduce }: { narrow: boolean; reduce: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
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

  /* Geometry: which note is current, and where each wire runs. Written to the DOM, not to state. */
  useEffect(() => {
    const section = sectionRef.current;
    const plate = plateRef.current;
    const shot = shotRef.current;
    if (!section || !plate || !shot) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const s = section.getBoundingClientRect();
      const p = plate.getBoundingClientRect();
      const r = shot.getBoundingClientRect();
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
      section.style.setProperty("--ts-plate-px", `${plate.offsetHeight}px`);
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
      const scale = r.width / SHOT.crop.w;
      notes.forEach((note, index) => {
        const marker = markerRefs.current[index];
        const a = pathARefs.current[index];
        const b = pathBRefs.current[index];
        const ring = ringRefs.current[index];
        if (!marker || !a || !b || !ring) return;
        const m = marker.getBoundingClientRect();
        const left = r.left - s.left + (note.part.x - SHOT.crop.x) * scale;
        const top = r.top - s.top + (note.part.y - SHOT.crop.y) * scale;
        const width = note.part.w * scale;
        const height = note.part.h * scale;
        const mx = Math.round(m.left + m.width / 2 - s.left);
        const my = Math.round(m.top + m.height / 2 - s.top);
        const ty = Math.round(top + height / 2);
        const tx = Math.round(left - 5);
        const radius = Math.max(0, Math.min(10, (my - ty) / 2, mx - gutter));
        a.setAttribute(
          "d",
          `M${mx} ${my}H${gutter + radius}Q${gutter} ${my} ${gutter} ${my - radius}V${ty + radius}Q${gutter} ${ty} ${gutter + radius} ${ty}H${plateLeft}`,
        );
        b.setAttribute("d", `M${plateLeft} ${ty}H${Math.max(plateLeft, tx)}`);
        ring.style.transform = `translate(${Math.round(left - 5)}px, ${Math.round(top - 5)}px)`;
        ring.style.width = `${Math.round(width + 10)}px`;
        ring.style.height = `${Math.round(height + 10)}px`;
      });
      setReady(true);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(section);
    resize.observe(plate);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      resize.disconnect();
    };
  }, [narrow]);

  /* A note that becomes current draws its wire: the outside run, the run inside the plate, the ring. */
  useLayoutEffect(() => {
    if (!ready) return;
    const a = pathARefs.current[current];
    const b = pathBRefs.current[current];
    const ring = ringRefs.current[current];
    const first = !drawn.current;
    drawn.current = true;
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
  }, [current, ready, reduce]);

  return (
    <section
      className="ts-spec"
      ref={sectionRef}
      aria-label="Design System v2 in its Storybook"
    >
      <div className="ts-zone">
        <div className="ts-pin">
          <div className="ts-plate" ref={plateRef}>
            <div className="ts-shot" ref={shotRef}>
              <CropShot shot={SHOT} eager />
            </div>
          </div>
          <p className="ts-plate-label">{REAL_SCREENS}</p>
        </div>
        <div className="ts-pin-run" aria-hidden />
      </div>
      <ol className="ts-notes" ref={listRef}>
        {notes.map((note, index) => (
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
            {note.path && <code className="ts-path">{note.path}</code>}
          </li>
        ))}
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

function Card({ card, narrow }: { card: CardData; narrow: boolean }) {
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
          {SURFACE}
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
  const narrow = useMedia("(max-width: 639px)", false);
  const reduce = useMedia("(prefers-reduced-motion: reduce)", false);

  return (
    <div className="ts" style={PAGE_TOKENS}>
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
        <Spec narrow={narrow} reduce={reduce} />

        <section className="ts-stack" id="work" aria-label="Work">
          {cards.map((card) => (
            <Card key={card.id} card={card} narrow={narrow} />
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
          The reader is a recreation with invented data. The Design System
          v2 and care screens are real product screens with invented data.
          The page's colours come from its own token file, not from Design
          System v2. The Bayyinah TV image, and the Read to Feed image on a
          phone, come from their public web and store pages.
        </p>
      </footer>
    </div>
  );
}
