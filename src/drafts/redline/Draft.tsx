import { ArrowRightIcon } from "@phosphor-icons/react";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { Link } from "react-router";
import { links } from "../../content/links";
import { careShots, dsShots, type Px, type ScreenShot } from "../../content/careShots";
import { projects } from "../../content/projects";
import { CropShot } from "../../components/CropShot";
import { recreations } from "../../lib/recreations";
import "./redline.css";

type Side = "left" | "right";
/** How the line reaches its part: straight in at the part's height, or along a clear band (the plate's top padding, or the gap under the player) and then up or down to the part. */
type Route = { kind: "direct" } | { kind: "top" } | { kind: "under"; band: string };
type Find = (root: HTMLElement) => Element | null;

interface Note {
  n: number;
  side: Side;
  title: string;
  body: string;
  target: Find;
  route: Route;
  /** On a phone the pin moves to another corner of the ring when the top-right corner covers another pin or a label. */
  pin?: "left" | "below";
  /** On a screenshot plate: the part, in the shot's CSS px. */
  at?: Px;
  /** The part in the phone crop, when it differs. */
  atNarrow?: Px;
}

/** A real screenshot, with its desktop and phone crops. */
interface Screen {
  shot: ScreenShot;
  wide: Px;
  narrow: Px;
}

interface Sheet {
  key: string;
  id: string;
  project: string;
  role: string;
  years: string;
  title: string;
  plate: "live-room" | Screen;
  caption: string;
  slug: string;
  notes: Note[];
}

const css = (selector: string): Find => (root) => root.querySelector(selector);
const spot = (n: number): Find => css(`[data-spot="${n}"]`);

const sheets: Sheet[] = [
  {
    key: "bayyinah",
    id: "0004",
    project: "Bayyinah TV",
    role: "Frontend, core team",
    years: "2023–26",
    title: "Rebuild on Nuxt 3: 34 routes, 270+ components.",
    plate: "live-room",
    caption: "recreation, invented data",
    slug: "bayyinah-tv",
    notes: [
      {
        n: 1,
        side: "left",
        title: "Live streams",
        body: "On AWS IVS, next to on-demand video and courses.",
        target: css(".lr-player .rounded-md.bg-accent"),
        route: { kind: "direct" },
      },
      {
        n: 2,
        side: "left",
        title: "HLS player",
        body: "A quality selector. The same web app runs inside the mobile app.",
        target: css('.lr-player button[aria-label^="Quality"]'),
        route: { kind: "under", band: ".lr-player" },
      },
      {
        n: 3,
        side: "right",
        title: "Paywall",
        body: "Premium sessions open with Stripe, Apple or Google subscriptions.",
        target: css('.lr-player button[role="switch"]'),
        route: { kind: "top" },
      },
      {
        n: 4,
        side: "right",
        title: "Realtime chat",
        body: "Messages over Pusher, with moderation in the same column.",
        target: css('section[aria-label="Live chat"] > div:first-of-type'),
        route: { kind: "direct" },
      },
    ],
  },
  {
    key: "tokens",
    id: "0006",
    project: "Design System v2",
    role: "Design system",
    years: "2026",
    title: "One token source: 36 components in 20 releases.",
    plate: { shot: dsShots.buttonAlert, wide: dsShots.buttonAlert.crop, narrow: dsShots.buttonAlert.crop },
    caption: "real product screens, invented data",
    slug: "design-system-react",
    notes: [
      {
        n: 1,
        side: "left",
        title: "One Button",
        body: "A Button-only app loads 96.6% less JavaScript.",
        target: spot(1),
        route: { kind: "direct" },
        at: { x: 15, y: 23, w: 129, h: 36 },
      },
      {
        n: 2,
        side: "left",
        title: "Three tiers",
        body: "805 tokens: core value, semantic role, component part.",
        target: spot(2),
        route: { kind: "direct" },
        at: { x: 16, y: 232, w: 688, h: 68 },
      },
      {
        n: 3,
        side: "right",
        title: "WCAG 2.1 AA",
        body: "Built to AA floors, with rendered evidence.",
        target: spot(3),
        route: { kind: "direct" },
        at: { x: 16, y: 408, w: 688, h: 68 },
      },
      {
        n: 4,
        side: "right",
        title: "Two of 36",
        body: "Button and Alert are two of the 36 components.",
        target: spot(4),
        route: { kind: "direct" },
        at: { x: 16, y: 496, w: 688, h: 88 },
      },
    ],
  },
  {
    key: "care",
    id: "0007",
    project: "Care platform",
    role: "Frontend",
    years: "2026",
    title: "From Vue to React, one route at a time, parity-tested on both apps.",
    plate: { shot: careShots.glucoseChart, wide: { x: 0, y: 0, w: 1440, h: 760 }, narrow: { x: 860, y: 0, w: 580, h: 676 } },
    caption: "real product screens, invented data",
    slug: "care-platform",
    notes: [
      {
        n: 1,
        side: "left",
        title: "Organizations",
        body: "Many share one system. Each sees only its own data.",
        target: spot(1),
        route: { kind: "direct" },
        at: { x: 14, y: 12, w: 184, h: 32 },
        atNarrow: { x: 1182, y: 14, w: 160, h: 28 },
        pin: "left",
      },
      {
        n: 2,
        side: "left",
        title: "Roles",
        body: "Each screen respects the role of the user who opens it.",
        target: spot(2),
        route: { kind: "direct" },
        at: { x: 12, y: 78, w: 212, h: 664 },
        atNarrow: { x: 1354, y: 14, w: 68, h: 28 },
        pin: "below",
      },
      {
        n: 3,
        side: "right",
        title: "Timezones",
        body: "Multi-tenant covers timezones too, not only data and roles.",
        target: spot(3),
        route: { kind: "direct" },
        at: { x: 1236, y: 248, w: 176, h: 36 },
      },
      {
        n: 4,
        side: "right",
        title: "Vitals",
        body: "Care teams follow readings from connected devices.",
        target: spot(4),
        route: { kind: "direct" },
        at: { x: 314, y: 302, w: 1078, h: 346 },
        atNarrow: { x: 866, y: 302, w: 526, h: 346 },
        pin: "left",
      },
    ],
  },
];

interface Row {
  id: string;
  decision: string;
  project: string;
  years: string;
  result: string;
  sheet?: string;
  slug?: string;
}

const record: Row[] = [
  {
    id: "0001",
    decision: "Ship one React Native bookstore app to both stores.",
    project: "Dukagjini Bookstore",
    years: "2021–22",
    result: "iOS and Android",
    slug: "dukagjini-bookstore",
  },
  {
    id: "0002",
    decision: "Build the chatbot runtime as one reusable package.",
    project: "Chatbot runtime",
    years: "2022–25",
    result: "1 package",
    slug: "chatbot-runtime",
  },
  {
    id: "0003",
    decision: "Carry the reading app through three major React Native upgrades.",
    project: "Read to Feed",
    years: "2022–25",
    result: "RN 0.63 → 0.81",
    slug: "read-to-feed",
  },
  {
    id: "0004",
    decision: "Rebuild Bayyinah TV on Nuxt 3, with live streams.",
    project: "Bayyinah TV",
    years: "2023–26",
    result: "34 routes",
    sheet: "bayyinah",
  },
  {
    id: "0005",
    decision: "Lay out the video platform right to left for Arabic.",
    project: "Bayyinah TV",
    years: "2023–26",
    result: "English and Arabic",
    slug: "bayyinah-tv",
  },
  {
    id: "0006",
    decision: "Generate every design token from one source.",
    project: "Design System v2",
    years: "2026",
    result: "805 tokens",
    sheet: "tokens",
  },
  {
    id: "0007",
    decision: "Move the care platform to React, one route at a time.",
    project: "Care platform",
    years: "2026",
    result: "parity-tested",
    sheet: "care",
  },
  {
    id: "0008",
    decision: "Rework one billing report until it stops timing out.",
    project: "Care API",
    years: "2026",
    result: "16 → 2 queries",
    slug: "care-api",
  },
  {
    id: "0009",
    decision: "Test tenant isolation in the time-off app.",
    project: "Offday",
    years: "2026",
    result: "about 200 tests",
    slug: "offday",
  },
  {
    id: "0010",
    decision: "Cut the studio site’s image weight.",
    project: "Snaxx Tech",
    years: "2026",
    result: "972 → 337 KB",
    slug: "snaxx-tech",
  },
];

const named = new Set([
  "dukagjini-bookstore",
  "chatbot-runtime",
  "read-to-feed",
  "bayyinah-tv",
  "design-system-react",
  "care-platform",
  "care-api",
  "offday",
  "snaxx-tech",
]);
const moreCount = projects.filter((project) => !named.has(project.slug)).length;

/** Keeps a hyphenated word on one line. */
function Words({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((word, i) => (
        <span key={i}>
          {i > 0 && " "}
          {word.includes("-") ? <span className="rl-nw">{word}</span> : word}
        </span>
      ))}
    </>
  );
}

const sheetIndex = (key: string) => sheets.findIndex((sheet) => sheet.key === key) + 1;
const two = (value: number) => String(value).padStart(2, "0");

/* ---------- Geometry ---------- */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Mark {
  n: number;
  pin?: "left" | "below";
  ring: Box;
  path: string;
  start: { x: number; y: number };
}

interface Geometry {
  w: number;
  h: number;
  innerLeft: number;
  innerRight: number;
  plate: Box;
  marks: Mark[];
  tops: Record<number, number>;
}

/** The note's badge centre sits this far under the note's top edge. */
const BADGE = 12;
/** From the red margin's inner edge: the badge column ends at 18 px, the vertical run of the line is at 9 px. */
const BADGE_INSET = 18;
const GUTTER = 9;
const WIDE = "(min-width: 1180px)";

function rounded(points: Array<[number, number]>, radius = 8) {
  const clean = points.filter(
    (point, index) => index === 0 || point[0] !== points[index - 1][0] || point[1] !== points[index - 1][1],
  );
  let d = `M${clean[0][0]},${clean[0][1]}`;
  for (let i = 1; i < clean.length - 1; i++) {
    const [px, py] = clean[i - 1];
    const [cx, cy] = clean[i];
    const [nx, ny] = clean[i + 1];
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
  const last = clean[clean.length - 1];
  return `${d} L${last[0]},${last[1]}`;
}

function measure(
  sheetNode: HTMLElement,
  plateNode: HTMLElement,
  notes: Note[],
  noteNodes: Map<number, HTMLElement>,
  wide: boolean,
): Geometry | null {
  const origin = sheetNode.getBoundingClientRect();
  const rel = (r: DOMRect): Box => ({
    x: Math.round(r.left - origin.left),
    y: Math.round(r.top - origin.top),
    w: Math.round(r.width),
    h: Math.round(r.height),
  });
  const plate = rel(plateNode.getBoundingClientRect());
  const leftMargin = sheetNode.querySelector(".rl-margin-left")?.getBoundingClientRect();
  const rightMargin = sheetNode.querySelector(".rl-margin-right")?.getBoundingClientRect();
  const innerLeft = leftMargin ? Math.round(leftMargin.right - origin.left) : plate.x;
  const innerRight = rightMargin ? Math.round(rightMargin.left - origin.left) : plate.x + plate.w;
  const found = notes.flatMap((note) => {
    const element = note.target(plateNode);
    if (!element) return [];
    const target = rel(element.getBoundingClientRect());
    if (target.w === 0 || target.h === 0) return [];
    const inside =
      target.x >= plate.x && target.y >= plate.y && target.x + target.w <= plate.x + plate.w && target.y + target.h <= plate.y + plate.h;
    if (!inside) return [];
    let entry = Math.round(target.y + target.h / 2);
    if (note.route.kind === "top") entry = plate.y + 6;
    if (note.route.kind === "under") {
      const band = plateNode.querySelector(note.route.band);
      if (!band) return [];
      const box = rel(band.getBoundingClientRect());
      entry = box.y + box.h + 6;
    }
    return [{ note, target, entry }];
  });

  const tops: Record<number, number> = {};
  if (wide) {
    const sheetHeight = sheetNode.offsetHeight;
    for (const side of ["left", "right"] as const) {
      const items = found.filter((f) => f.note.side === side).sort((a, b) => a.entry - b.entry);
      const height = (n: number) => noteNodes.get(n)?.offsetHeight ?? 120;
      let floor = 16;
      for (const item of items) {
        tops[item.note.n] = Math.max(item.entry - BADGE, floor);
        floor = tops[item.note.n] + height(item.note.n) + 20;
      }
      let ceiling = sheetHeight - 16;
      for (const item of [...items].reverse()) {
        tops[item.note.n] = Math.min(tops[item.note.n], ceiling - height(item.note.n));
        ceiling = tops[item.note.n] - 20;
      }
    }
  }

  const marks = found.map(({ note, target, entry }) => {
    const ring = { x: target.x - 3, y: target.y - 3, w: target.w + 6, h: target.h + 6 };
    if (!wide) return { n: note.n, pin: note.pin, ring, path: "", start: { x: 0, y: 0 } };
    const left = note.side === "left";
    const edge = left ? plate.x : plate.x + plate.w;
    const gutter = left ? innerLeft - GUTTER : innerRight + GUTTER;
    const start = left ? innerLeft - BADGE_INSET + 2 : innerRight + BADGE_INSET - 2;
    const startY = tops[note.n] + BADGE;
    const points: Array<[number, number]> = [
      [start, startY],
      [gutter, startY],
      [gutter, entry],
      [edge, entry],
    ];
    const cx = Math.round(target.x + target.w / 2);
    if (note.route.kind === "direct") points.push([left ? ring.x - 1 : ring.x + ring.w + 1, entry]);
    if (note.route.kind === "top") points.push([cx, entry], [cx, ring.y - 1]);
    if (note.route.kind === "under") points.push([cx, entry], [cx, ring.y > entry ? ring.y - 1 : ring.y + ring.h + 1]);
    return { n: note.n, ring, path: rounded(points), start: { x: start, y: startY } };
  });

  return { w: sheetNode.offsetWidth, h: sheetNode.offsetHeight, innerLeft, innerRight, plate, marks, tops };
}

/* ---------- Plate ---------- */

function Plate({ sheet, mounted, wide }: { sheet: Sheet; mounted: boolean; wide: boolean }) {
  return typeof sheet.plate === "string" ? (
    <LivePlate mounted={mounted} wide={wide} />
  ) : (
    <ShotPlate screen={sheet.plate} notes={sheet.notes} wide={wide} />
  );
}

const pct = (value: number, of: number) => `${(value / of) * 100}%`;

function ShotPlate({ screen, notes, wide }: { screen: Screen; notes: Note[]; wide: boolean }) {
  const crop = wide ? screen.wide : screen.narrow;
  return (
    <div className="rl-shot" style={{ background: screen.shot.ground }}>
      <div className="rl-shot-frame" style={{ maxWidth: crop.w }}>
        <CropShot shot={screen.shot} crop={crop} />
        {notes.map((note) => {
          const at = (!wide && note.atNarrow) || note.at;
          if (!at) return null;
          const inside = at.x >= crop.x && at.y >= crop.y && at.x + at.w <= crop.x + crop.w && at.y + at.h <= crop.y + crop.h;
          if (!inside) return null;
          return (
            <span
              key={note.n}
              className="rl-spot"
              data-spot={note.n}
              style={{
                left: pct(at.x - crop.x, crop.w),
                top: pct(at.y - crop.y, crop.h),
                width: pct(at.w, crop.w),
                height: pct(at.h, crop.h),
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function LivePlate({ mounted, wide }: { mounted: boolean; wide: boolean }) {
  const entry = recreations["live-room"];
  const Recreation = entry.Component as ComponentType<{ demoPlaying?: boolean }>;
  const holder = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const node = holder.current;
    if (!node || !mounted) return;
    const check = () => {
      if (node.querySelectorAll('ol[aria-label="Messages"] > li').length < 8) return false;
      setPlaying(false);
      return true;
    };
    if (check()) return;
    const observer = new MutationObserver(() => {
      if (check()) observer.disconnect();
    });
    observer.observe(node, { subtree: true, childList: true });
    return () => observer.disconnect();
  }, [mounted]);

  /* On a phone the live room stops under its pinned note. */
  const [height, setHeight] = useState<number | null>(null);
  const edge = wide ? null : 'section[aria-label="Live chat"] > div:first-of-type';
  useLayoutEffect(() => {
    const node = holder.current;
    if (!node || !mounted || !edge) {
      setHeight(null);
      return;
    }
    const fit = () => {
      const card = node.querySelector<HTMLElement>(edge);
      if (!card) return;
      let top = 0;
      for (let el: HTMLElement | null = card; el && el !== node; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
      setHeight(Math.ceil(top + card.offsetHeight + 10));
    };
    fit();
    const resize = new ResizeObserver(fit);
    resize.observe(node);
    const mutation = new MutationObserver(fit);
    mutation.observe(node, { childList: true, subtree: true });
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [mounted, edge]);

  return (
    <div
      className="rl-stage"
      data-world={entry.world}
      data-plate="live-room"
      ref={holder}
      style={height ? { aspectRatio: "auto", height } : undefined}
    >
      {mounted ? (
        <Suspense fallback={<div className="rl-stage-wait" />}>
          <Recreation demoPlaying={playing} />
        </Suspense>
      ) : (
        <div className="rl-stage-wait" />
      )}
    </div>
  );
}

/* ---------- Sheet ---------- */

interface SheetProps {
  sheet: Sheet;
  index: number;
  wide: boolean;
  mounted: boolean;
  drawn: boolean;
  instant: boolean;
  register: (key: string, node: HTMLElement | null) => void;
}

function SheetView({ sheet, index, wide, mounted, drawn, instant, register }: SheetProps) {
  const sheetRef = useRef<HTMLElement | null>(null);
  const plateRef = useRef<HTMLDivElement>(null);
  const noteNodes = useRef(new Map<number, HTMLElement>());
  const signature = useRef("");
  const [geometry, setGeometry] = useState<Geometry | null>(null);
  const [focus, setFocus] = useState<number | null>(null);
  const [flash, setFlash] = useState<number | null>(null);

  const update = useCallback(() => {
    const node = sheetRef.current;
    const plate = plateRef.current;
    if (!node || !plate) return;
    const next = measure(node, plate, sheet.notes, noteNodes.current, wide);
    const key = JSON.stringify(next);
    if (key !== signature.current) {
      signature.current = key;
      setGeometry(next);
    }
  }, [sheet.notes, wide]);

  useLayoutEffect(() => {
    const node = sheetRef.current;
    const plate = plateRef.current;
    if (!node || !plate || !mounted) return;
    let frame = 0;
    let settle = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
      window.clearTimeout(settle);
      settle = window.setTimeout(update, 450);
    };
    schedule();
    void document.fonts.ready.then(schedule);
    const resize = new ResizeObserver(schedule);
    resize.observe(node);
    resize.observe(plate);
    const mutation = new MutationObserver(schedule);
    mutation.observe(plate, { subtree: true, childList: true, attributes: true, attributeFilter: ["cx", "cy", "aria-checked"] });
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      resize.disconnect();
      mutation.disconnect();
    };
  }, [update, mounted]);

  useEffect(() => {
    if (flash === null) return;
    const timer = window.setTimeout(() => setFlash(null), 900);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const open = (note: Note) => {
    const plate = plateRef.current;
    if (!plate) return;
    const element = note.target(plate);
    const focusable = element?.closest<HTMLElement>("button, a, input, [tabindex]");
    plate.scrollIntoView({ block: "nearest", behavior: "instant" });
    if (focusable && plate.contains(focusable)) focusable.focus({ preventScroll: true });
    setFlash(note.n);
  };

  const placed = geometry !== null;
  const active = focus ?? flash;
  const plateBox = geometry?.plate;

  const note = (item: Note) => (
    <li key={item.n}>
      <button
        type="button"
        className="rl-note"
        data-side={item.side}
        data-active={active === item.n || undefined}
        data-pending={(wide && geometry && geometry.tops[item.n] === undefined) || undefined}
        ref={(node) => {
          if (node) noteNodes.current.set(item.n, node);
          else noteNodes.current.delete(item.n);
        }}
        style={wide && geometry ? ({ "--top": `${geometry.tops[item.n] ?? 0}px` } as CSSProperties) : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setFocus(item.n);
        }}
        onPointerLeave={() => setFocus(null)}
        onFocus={() => setFocus(item.n)}
        onBlur={() => setFocus(null)}
        onClick={() => open(item)}
      >
        <span className="rl-note-head">
          <span className="rl-badge" aria-hidden="true">
            {item.n}
          </span>
          <span className="rl-note-title">{item.title}</span>
        </span>
        <span className="rl-note-body">
          <Words text={item.body} />
        </span>
      </button>
    </li>
  );

  return (
    <section
      id={`s-${sheet.key}`}
      className="rl-sheet"
      ref={(node) => {
        sheetRef.current = node;
        register(sheet.key, node);
      }}
      data-placed={placed || undefined}
      data-drawn={(drawn && placed) || undefined}
      data-instant={instant || undefined}
      data-focus={active ?? undefined}
      aria-labelledby={`s-${sheet.key}-title`}
    >
      <header className="rl-head">
        <p className="rl-meta">
          <span className="rl-meta-id">{sheet.id}</span>
          <span>{sheet.project}</span>
          <span>{sheet.years}</span>
        </p>
        <h2 className="rl-title" id={`s-${sheet.key}-title`} tabIndex={-1}>
          <span className="rl-sr">
            Sheet {two(index)}, {sheet.project}:{" "}
          </span>
          <Words text={sheet.title} />
        </h2>
      </header>
      <div className="rl-margin rl-margin-left" aria-hidden={!wide || undefined}>
        {wide && <ol className="rl-notes">{sheet.notes.filter((n) => n.side === "left").map(note)}</ol>}
      </div>
      <div className="rl-margin rl-margin-right" aria-hidden={!wide || undefined}>
        {wide && <ol className="rl-notes">{sheet.notes.filter((n) => n.side === "right").map(note)}</ol>}
      </div>
      <div
        className="rl-plate"
        ref={plateRef}
        onPointerOver={(event) => {
          if (!wide || event.pointerType !== "mouse" || !plateRef.current) return;
          const plate = plateRef.current;
          const hit = sheet.notes.find((item) => item.target(plate)?.contains(event.target as Node));
          setFocus(hit ? hit.n : null);
        }}
        onPointerLeave={() => setFocus(null)}
      >
        <Plate sheet={sheet} mounted={mounted} wide={wide} />
      </div>
      {!wide && <ol className="rl-notes rl-notes-stack">{sheet.notes.map(note)}</ol>}
      <footer className="rl-foot">
        <p className="rl-foot-note">
          {sheet.role}
          <span className="rl-foot-sep"> · {sheet.caption}</span>
        </p>
        <Link className="rl-link" to={`/work/${sheet.slug}`}>
          Open the case
          <ArrowRightIcon aria-hidden="true" size={16} weight="regular" />
        </Link>
      </footer>

      {geometry && plateBox && (
        <svg
          className="rl-ink"
          width={geometry.w}
          height={geometry.h}
          viewBox={`0 0 ${geometry.w} ${geometry.h}`}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={`rl-out-${sheet.key}`}>
              <rect x={-9999} y={0} width={9999 + geometry.innerLeft} height={geometry.h} />
              <rect x={geometry.innerRight} y={0} width={9999} height={geometry.h} />
            </clipPath>
            <clipPath id={`rl-in-${sheet.key}`}>
              <rect x={geometry.innerLeft} y={0} width={geometry.innerRight - geometry.innerLeft} height={geometry.h} />
            </clipPath>
          </defs>
          {geometry.marks.map((mark) => {
            const order = sheet.notes.findIndex((item) => item.n === mark.n);
            const style = { "--i": order } as CSSProperties;
            const rx = Math.min(8, mark.ring.h / 2);
            const corner = {
              x: mark.pin === "left" ? mark.ring.x - 3 : mark.ring.x + mark.ring.w + 3,
              y: mark.pin === "below" ? mark.ring.y + mark.ring.h + 3 : mark.ring.y - 3,
            };
            const badge = {
              x: Math.max(plateBox.x + 11, Math.min(corner.x, plateBox.x + plateBox.w - 11)),
              y: Math.max(corner.y, plateBox.y + 11),
            };
            return (
              <g key={mark.n} className="rl-mark" data-n={mark.n} style={style}>
                {mark.path && (
                  <>
                    <path className="rl-line rl-line-out" d={mark.path} pathLength={1} clipPath={`url(#rl-out-${sheet.key})`} />
                    <g clipPath={`url(#rl-in-${sheet.key})`}>
                      <path className="rl-line rl-line-halo" d={mark.path} pathLength={1} />
                      <path className="rl-line rl-line-in" d={mark.path} pathLength={1} />
                    </g>
                    <circle className="rl-start" cx={mark.start.x} cy={mark.start.y} r={3} />
                  </>
                )}
                <g className="rl-ring">
                  <rect className="rl-ring-halo" x={mark.ring.x} y={mark.ring.y} width={mark.ring.w} height={mark.ring.h} rx={rx} />
                  <rect className="rl-ring-in" x={mark.ring.x} y={mark.ring.y} width={mark.ring.w} height={mark.ring.h} rx={rx} />
                  {!wide && (
                    <g className="rl-pin">
                      <circle cx={badge.x} cy={badge.y} r={10} />
                      <text x={badge.x} y={badge.y} dy="0.35em">
                        {mark.n}
                      </text>
                    </g>
                  )}
                </g>
              </g>
            );
          })}
        </svg>
      )}
    </section>
  );
}

/* ---------- Page ---------- */

export default function Redline() {
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  const [current, setCurrent] = useState(sheets[0].key);
  const [mounted, setMounted] = useState<ReadonlySet<string>>(() => new Set([sheets[0].key]));
  const [drawn, setDrawn] = useState<ReadonlySet<string>>(() => new Set());
  const [instant, setInstant] = useState<ReadonlySet<string>>(() => new Set());
  const [ready, setReady] = useState(false);
  const nodes = useRef(new Map<string, HTMLElement>());
  const recordRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      root: root.style.background,
      body: body.style.background,
      scheme: root.style.colorScheme,
      scrollbar: root.style.scrollbarColor,
      behavior: root.style.scrollBehavior,
      padding: root.style.scrollPaddingTop,
    };
    root.style.background = body.style.background = "#fff8f0";
    root.style.colorScheme = "light";
    root.style.scrollbarColor = "#c2270f #fff8f0";
    root.style.scrollBehavior = "auto";
    root.style.scrollPaddingTop = "0px";
    void recreations["live-room"].load();
    return () => {
      root.style.background = previous.root;
      body.style.background = previous.body;
      root.style.colorScheme = previous.scheme;
      root.style.scrollbarColor = previous.scrollbar;
      root.style.scrollBehavior = previous.behavior;
      root.style.scrollPaddingTop = previous.padding;
    };
  }, []);

  useEffect(() => {
    const query = window.matchMedia(WIDE);
    const change = () => setWide(query.matches);
    query.addEventListener("change", change);
    return () => query.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    let timer = 0;
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) timer = window.setTimeout(() => setReady(true), 260);
    });
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, []);

  const register = useCallback((key: string, node: HTMLElement | null) => {
    if (node) nodes.current.set(key, node);
    else nodes.current.delete(key);
  }, []);

  useEffect(() => {
    const inside = new Set<string>();
    const reading = new IntersectionObserver(
      (items) => {
        for (const item of items) {
          const key = (item.target as HTMLElement).dataset.key ?? "";
          if (item.isIntersecting) inside.add(key);
          else inside.delete(key);
        }
        const order = [...sheets.map((sheet) => sheet.key), "record"];
        const last = [...order].reverse().find((key) => inside.has(key));
        if (last) setCurrent(last);
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    const near = new IntersectionObserver(
      (items) => {
        const keys = items.filter((item) => item.isIntersecting).map((item) => (item.target as HTMLElement).dataset.key ?? "");
        if (keys.length) setMounted((set) => new Set([...set, ...keys]));
      },
      { rootMargin: "0px 0px 100% 0px" },
    );
    const seen = new IntersectionObserver(
      (items) => {
        const keys = items.filter((item) => item.isIntersecting).map((item) => (item.target as HTMLElement).dataset.key ?? "");
        if (keys.length) setDrawn((set) => new Set([...set, ...keys]));
      },
      { threshold: 0.5 },
    );
    nodes.current.forEach((node, key) => {
      node.dataset.key = key;
      reading.observe(node);
      near.observe(node);
      const plate = node.querySelector(".rl-plate");
      if (plate) {
        (plate as HTMLElement).dataset.key = key;
        seen.observe(plate);
      }
    });
    if (recordRef.current) {
      recordRef.current.dataset.key = "record";
      reading.observe(recordRef.current);
    }
    return () => {
      reading.disconnect();
      near.disconnect();
      seen.disconnect();
    };
  }, []);

  const jump = (key: string, event: MouseEvent<HTMLAnchorElement>) => {
    const node = key === "record" ? recordRef.current : nodes.current.get(key);
    if (!node) return;
    event.preventDefault();
    if (key !== "record") {
      if (event.detail === 0) setInstant((set) => new Set(set).add(key));
      setMounted((set) => new Set(set).add(key));
      setDrawn((set) => new Set(set).add(key));
    }
    node.scrollIntoView({ block: "start", behavior: "instant" });
    node.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
    setCurrent(key);
  };

  return (
    <div className="rl">
      <title>Gentrit Rashiti · Three screens, reviewed</title>

      <header className="rl-bar">
        <p className="rl-name">Gentrit Rashiti</p>
        <div className="rl-bar-mid">
          <h1 className="rl-id">
            <span className="rl-sr">Gentrit Rashiti </span>
            builds web and mobile products. Part of two platform rewrites.
          </h1>
          <nav className="rl-cites" aria-label="Reviewed screens">
            {sheets.map((sheet, index) => (
              <a
                key={sheet.key}
                className="rl-cite"
                href={`#s-${sheet.key}`}
                aria-current={current === sheet.key ? "true" : undefined}
                onClick={(event) => jump(sheet.key, event)}
              >
                <span className="rl-cite-n">{two(index + 1)}</span>
                <span className="rl-cite-name">{sheet.project}</span>
              </a>
            ))}
            <a
              className="rl-cite"
              href="#record"
              aria-current={current === "record" ? "true" : undefined}
              onClick={(event) => jump("record", event)}
            >
              <span className="rl-cite-n">10</span>
              <span className="rl-cite-name">decisions</span>
            </a>
          </nav>
        </div>
        <p className="rl-bar-links">
          <a href={links.cv}>CV</a>
          <a href={`mailto:${links.email}`}>Email</a>
        </p>
      </header>

      <main>
        {sheets.map((sheet, index) => (
          <SheetView
            key={sheet.key}
            sheet={sheet}
            index={index + 1}
            wide={wide}
            mounted={mounted.has(sheet.key)}
            drawn={(index > 0 || ready) && drawn.has(sheet.key)}
            instant={instant.has(sheet.key)}
            register={register}
          />
        ))}

        <section className="rl-record" id="record" ref={recordRef} aria-labelledby="rl-record-title">
          <h2 id="rl-record-title" tabIndex={-1}>
            The record
          </h2>
          <p className="rl-record-lede">Ten decisions, 2021 to 2026. Three of them are reviewed on a screen above.</p>
          <ol className="rl-rows">
            {record.map((row) => {
              const inner = (
                <>
                  <span className="rl-row-id">{row.id}</span>
                  <span className="rl-row-decision">
                    <Words text={row.decision} />
                  </span>
                  <span className="rl-row-project">
                    {row.project} · {row.years}
                  </span>
                  <span className="rl-row-result">{row.result}</span>
                  <span className="rl-row-proof">{row.sheet ? `Sheet ${two(sheetIndex(row.sheet))}` : ""}</span>
                </>
              );
              return (
                <li key={row.id} data-sheet={row.sheet ? true : undefined}>
                  {row.sheet ? (
                    <a href={`#s-${row.sheet}`} onClick={(event) => jump(row.sheet ?? "", event)}>
                      {inner}
                    </a>
                  ) : row.slug ? (
                    <Link to={`/work/${row.slug}`}>{inner}</Link>
                  ) : (
                    <div>{inner}</div>
                  )}
                </li>
              );
            })}
          </ol>
          <p className="rl-more">
            {moreCount} more projects, from games to a donations app, are on the <Link to="/">full portfolio</Link>.
          </p>
        </section>
      </main>

      <footer className="rl-end">
        <ul className="rl-contact">
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
        <p>The live room is a recreation with invented data. The Design System v2 and care screens are real product screens with invented data.</p>
      </footer>
    </div>
  );
}
