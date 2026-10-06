import {
  Suspense,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon, UserIcon } from "@phosphor-icons/react";
import { findProject, type Project } from "../content/projects";
import { recreations } from "../lib/recreations";
import { caseCopy, nextSlug, type CaseCopy, type LiveKey, type Part, type Plate, type Px, type Shot } from "./caseCopy";
import { luminance, shadowOf, usePageLight, type PageLight } from "./caseLight";
import { useDraw, useWalks } from "./caseMotion";
import { CaseEnd, CaseTop, LitLine } from "./caseShell";
import NotFoundPage from "./NotFoundPage";
import "./case.css";

/** A live plate draws on this stage and scales to its box. */
const STAGE_W = 880;
/** A screen never stands taller than this, so a phone crop leaves room for its text. */
const SCREEN_MAX_H = 640;

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

/** True once the element comes within one screen of the viewport. */
function useNear<T extends Element>(start: boolean) {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(start);
  useEffect(() => {
    const element = ref.current;
    if (near || !element) return;
    const watch = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    watch.observe(element);
    return () => watch.disconnect();
  }, [near]);
  return [ref, near] as const;
}

/* ---------- Ground: a screen stands on the page and casts the sun's shadow ---------- */

const toLinear = (hex: string) =>
  [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
const toHex = (rgb: number[]) =>
  "#" +
  rgb
    .map((c) => Math.round(Math.min(1, c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055) * 255).toString(16).padStart(2, "0"))
    .join("");

/** The floor colour in front of a lit screen in the dark, as on the home page; null while the ground is light. */
function glowOf(lit: string, screen: string) {
  const t = Math.min(1, Math.max(0, (luminance(lit) - 0.02) / 0.18));
  const glow = (1 - t * t * (3 - 2 * t)) * 0.2;
  if (glow < 0.004) return null;
  const add = toLinear(screen).map((c) => c * 0.5 * glow);
  const lum = 0.2126 * add[0] + 0.7152 * add[1] + 0.0722 * add[2];
  const k = lum > 0.14 ? 0.14 / lum : 1;
  return toHex(toLinear(lit).map((c, i) => c + add[i] * k));
}

interface GroundProps {
  page: PageLight;
  /** The screen's main colour, which lights the floor in front of it in the dark. */
  screen: string;
  small?: boolean;
  children: ReactNode;
}

function Ground({ page, screen: screenColour, small, children }: GroundProps) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const shadow = useRef<SVGPolygonElement>(null);
  const pool = useRef<SVGEllipseElement>(null);
  const glow = glowOf(page.light.lit, screenColour);

  useEffect(() => {
    const element = box.current;
    const root = svg.current;
    const polygon = shadow.current;
    if (!element || !root || !polygon) return;
    const draw = () => {
      const screen = element.querySelector<HTMLElement>("[data-cs-screen]");
      if (!screen) return;
      const rect = element.getBoundingClientRect();
      const screenRect = screen.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2 || screenRect.height < 2) return;
      root.setAttribute("viewBox", `0 0 ${rect.width.toFixed(1)} ${rect.height.toFixed(1)}`);
      polygon.setAttribute("points", shadowOf(rect, screenRect, page.sun.ray));
      polygon.style.opacity = page.light.direct.toFixed(3);
      const ellipse = pool.current;
      if (ellipse) {
        const base = screenRect.bottom - rect.top;
        ellipse.setAttribute("cx", (screenRect.left - rect.left + screenRect.width / 2).toFixed(1));
        ellipse.setAttribute("cy", (base + 4).toFixed(1));
        ellipse.setAttribute("rx", (screenRect.width * 0.68).toFixed(1));
        ellipse.setAttribute("ry", Math.min(64, rect.bottom - screenRect.bottom + 8).toFixed(1));
      }
    };
    const resize = new ResizeObserver(draw);
    resize.observe(element);
    draw();
    return () => resize.disconnect();
  }, [page, glow]);

  return (
    <div className={small ? "cs-ground cs-ground-small" : "cs-ground"} ref={box} data-glow={glow ? "" : undefined}>
      <svg ref={svg} className="cs-floor" aria-hidden="true" preserveAspectRatio="none">
        {glow && (
          <>
            <defs>
              <radialGradient id={`${id}-glow`}>
                <stop offset="0" stopColor={glow} />
                <stop offset="1" stopColor={glow} stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse ref={pool} fill={`url(#${id}-glow)`} />
          </>
        )}
        <polygon ref={shadow} />
      </svg>
      {children}
    </div>
  );
}

/* ---------- Plates ---------- */

/** Renders inside Suspense, so the face check runs only after the recreation's code has arrived. */
function LiveBody({ Live }: { Live: ComponentType<object> }) {
  // A recreation draws hidden until its own faces load, so a late face never moves the plate.
  const [faces, setFaces] = useState(false);
  useEffect(() => {
    let live = true;
    const settle = () => {
      if (!document.fonts) return setFaces(true);
      void document.fonts.ready.then(() => {
        if (!live) return;
        if (document.fonts.status === "loaded") setFaces(true);
        else settle();
      });
    };
    // Two frames let the hidden layout request its faces before the check.
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(settle);
    });
    const limit = window.setTimeout(() => live && setFaces(true), 3000);
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(limit);
    };
  }, []);

  return (
    <div className="cs-live-body" style={faces ? undefined : { visibility: "hidden" }}>
      <Live />
    </div>
  );
}

function LivePlate({ which }: { which: LiveKey }) {
  const entry = recreations[which];
  const Live = entry.Component;
  return (
    <div className={`cs-live cs-live-${which}`} data-world={entry.world} inert aria-hidden="true">
      <Suspense fallback={<div className="cs-wait" />}>
        <LiveBody Live={Live} />
      </Suspense>
    </div>
  );
}

interface ShotProps {
  shot: Shot;
  crop: Px;
  alt: string;
  eager: boolean;
  ring: Px | null;
}

function ShotView({ shot, crop, alt, eager, ring }: ShotProps) {
  return (
    <div className="cs-shot" style={{ aspectRatio: `${crop.w} / ${crop.h}`, background: shot.ground }}>
      <img
        src={shot.src}
        alt={alt}
        width={shot.width}
        height={shot.height}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        decoding="async"
        style={{
          width: `${(shot.width / crop.w) * 100}%`,
          left: `${(-crop.x / crop.w) * 100}%`,
          top: `${(-crop.y / crop.h) * 100}%`,
        }}
      />
      {ring && (
        <svg
          className="cs-shot-ring"
          aria-hidden="true"
          style={{
            left: `calc(${((ring.x - crop.x) / crop.w) * 100}% - 4px)`,
            top: `calc(${((ring.y - crop.y) / crop.h) * 100}% - 4px)`,
            width: `calc(${(ring.w / crop.w) * 100}% + 8px)`,
            height: `calc(${(ring.h / crop.h) * 100}% + 8px)`,
          }}
        >
          <rect className="cs-ring-edge" width="100%" height="100%" rx="7" pathLength={1} />
          <rect width="100%" height="100%" rx="7" pathLength={1} />
        </svg>
      )}
    </div>
  );
}

/** A screen with its own title bar, so its label never stands on the ground. */
function Screen({ caption, width, plate, children }: { caption: string; width: string; plate?: string; children: ReactNode }) {
  return (
    <figure className="cs-screen" data-cs-screen data-plate={plate} style={{ width }}>
      <figcaption>{caption}</figcaption>
      <div className="cs-screen-body">{children}</div>
    </figure>
  );
}

function LiveStage({ which }: { which: LiveKey }) {
  const stage = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = stage.current;
    if (!element) return;
    const fit = () => element.style.setProperty("--k", String(element.clientWidth / STAGE_W));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`cs-stage-box cs-stage-box-${which}`} ref={stage}>
      <div className="cs-stage">
        <LivePlate which={which} />
      </div>
    </div>
  );
}

/** The "2" marks start after the arrow, at the same pace as the "16" marks, so the short row reads as fast. */
const MARK_MS = 30;
const MARKS_TO_MS = 640;
/** Longer than the bar's shrink: 240 ms wait and 640 ms move. */
const SHARE_MS = 1000;

function Marks({ count, at }: { count: number; at: number }) {
  return (
    <span className="cs-marks">
      {Array.from({ length: count }, (_, k) => (
        <i key={k} style={{ "--d": `${at + k * MARK_MS}ms` } as CSSProperties} />
      ))}
    </span>
  );
}

function NumberFigure({ plate }: { plate: Extract<Plate, { kind: "number" }> }) {
  const marks = plate.marks && plate.from !== undefined;
  const to = <span className={plate.from ? "cs-number-to" : undefined}>{plate.to}</span>;
  return (
    <figure className="cs-number">
      <p className="cs-number-figure" aria-hidden="true" data-marks={marks ? "" : undefined}>
        {plate.from && (
          <>
            {marks ? (
              <span className="cs-number-col">
                {plate.from}
                <Marks count={Number(plate.from)} at={0} />
              </span>
            ) : (
              <span>{plate.from}</span>
            )}
            <ArrowRightIcon className="cs-number-arrow" weight="bold" />
          </>
        )}
        {marks ? (
          <span className="cs-number-col">
            {to}
            <Marks count={Number(plate.to)} at={MARKS_TO_MS} />
          </span>
        ) : (
          to
        )}
      </p>
      {plate.share && (
        <div className="cs-share" data-draw-ms={SHARE_MS} aria-hidden="true">
          <p>{plate.share.before}</p>
          <span className="cs-share-bar" />
          <p>{plate.share.now}</p>
          <span className="cs-share-bar cs-share-track">
            <span className="cs-share-now" style={{ "--part": plate.share.part } as CSSProperties} />
          </span>
        </div>
      )}
      <figcaption>
        <span className="cs-sr">{plate.from ? `${plate.from} to ${plate.to} ` : `${plate.to} `}</span>
        <span className="cs-number-unit">{plate.unit}</span>
        <span className="cs-number-note">{plate.note}</span>
      </figcaption>
    </figure>
  );
}

/** Longer than the flow's play in caseMotion.ts: one pass, the way back, the second pass. */
const FLOW_MS = 2900;

/** A work loop: the steps in order, and the way back when a step fails. */
function FlowFigure({ plate, caption }: { plate: Extract<Plate, { kind: "flow" }>; caption: string }) {
  const { steps, back } = plate;
  const style = { "--n": steps.length, "--from": back.from, "--to": back.to } as CSSProperties;
  return (
    <figure className="cs-flow" style={style} data-from={back.from} data-to={back.to} data-draw-ms={FLOW_MS}>
      <figcaption className="cs-flow-title">{caption}</figcaption>
      <div className="cs-flow-body">
        <ol className="cs-flow-steps">
          {steps.map((step) => (
            <li key={step.name} className="cs-flow-step" data-person={step.person ? "" : undefined}>
              <span className="cs-flow-lit" aria-hidden="true" />
              <span className="cs-flow-name">
                {step.person && <UserIcon className="cs-flow-icon" weight="bold" aria-hidden="true" />}
                {step.name}
              </span>
              <span className="cs-flow-note">{step.note}</span>
            </li>
          ))}
        </ol>
        <p className="cs-flow-back">
          <span className="cs-sr">
            From step {back.from + 1} back to step {back.to + 1}:{" "}
          </span>
          <span className="cs-flow-back-label">{back.label}</span>
        </p>
        <span className="cs-flow-dot" aria-hidden="true" />
      </div>
    </figure>
  );
}

const inside = (box: Px, crop: Px) =>
  box.x >= crop.x && box.y >= crop.y && box.x + box.w <= crop.x + crop.w && box.y + box.h <= crop.y + crop.h;

const fitWidth = (crop: Px) => `min(100%, ${crop.w}px, ${Math.round((SCREEN_MAX_H * crop.w) / crop.h)}px)`;

interface PlateProps {
  part: Pick<Part, "narrow" | "narrowAlt" | "target">;
  plate: Plate;
  caption: string;
  narrow: boolean;
  first: boolean;
  page: PageLight;
}

/** The plate a part shows: the whole crop on a wide screen, the proving part on a phone. */
function PartPlate({ part, plate, caption, narrow, first, page }: PlateProps) {
  const [ref, near] = useNear<HTMLDivElement>(first);
  if (plate.kind === "number") return <NumberFigure plate={plate} />;
  if (plate.kind === "flow") return <FlowFigure plate={plate} caption={caption} />;
  let screen: ReactNode;
  if (plate.kind === "live") {
    const { aspect } = recreations[plate.key];
    screen = narrow ? (
      <Screen caption={caption} width="100%">
        <div className="cs-inline-live" style={{ "--cs-aspect-base": aspect.base, "--cs-aspect-sm": aspect.sm } as CSSProperties}>
          {near && <LivePlate which={plate.key} />}
        </div>
      </Screen>
    ) : (
      <Screen caption={caption} width={`min(100%, ${STAGE_W}px)`}>
        {near ? <LiveStage which={plate.key} /> : <div className={`cs-stage-box cs-stage-box-${plate.key}`} />}
      </Screen>
    );
  } else {
    const own = narrow && typeof part.narrow === "object";
    const crop = own && typeof part.narrow === "object" ? part.narrow : plate.crop;
    const box = part.target.kind === "shot" ? part.target.box : null;
    const ring = box && inside(box, crop) ? box : null;
    screen = (
      <Screen caption={caption} width={fitWidth(crop)}>
        <ShotView shot={plate} crop={crop} alt={(own && part.narrowAlt) || plate.alt} eager={first} ring={ring} />
      </Screen>
    );
  }
  return (
    <div ref={ref}>
      <Ground page={page} screen={plate.kind === "live" ? LIVE_SCREEN : plate.ground}>
        {screen}
      </Ground>
    </div>
  );
}

const LIVE_SCREEN = "#f4f4f4";

/** The next case's first screen, small, on its own floor. */
function NextPlate({ slug, copy, page }: { slug: string; copy: CaseCopy; page: PageLight }) {
  const at = copy.plates.findIndex((plate) => plate.kind === "web" || plate.kind === "phone");
  const plate = copy.plates[at];
  if (!plate || (plate.kind !== "web" && plate.kind !== "phone")) return null;
  const { crop } = plate;
  return (
    <span className="cs-next-plate" aria-hidden="true">
      <Ground page={page} screen={plate.ground} small>
        <Screen caption={copy.captions[at]} width={`min(100%, 320px, ${Math.round((220 * crop.w) / crop.h)}px)`} plate={slug}>
          <ShotView shot={plate} crop={crop} alt="" eager={false} ring={null} />
        </Screen>
      </Ground>
    </span>
  );
}

/* ---------- Page ---------- */

/** A hyphenated word such as "sign-in" never breaks at its hyphen. */
function keepWords(text: string) {
  return text.split(/(\S*\w-\w\S*)/).map((piece, index) =>
    index % 2 ? (
      <span key={index} className="cs-nowrap">
        {piece}
      </span>
    ) : (
      piece
    ),
  );
}

function OutLinks({ links }: { links: Project["links"] }) {
  return links.map((link) => (
    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
      {link.label}
      <ArrowUpRightIcon aria-hidden="true" size={14} weight="bold" />
      <span className="cs-sr"> (opens in a new tab)</span>
    </a>
  ));
}

function Facts({ project, copy }: { project: Project; copy: CaseCopy }) {
  return (
    <dl className="cs-facts">
      <div>
        <dt>Role</dt>
        <dd>{copy.role ?? project.role}</dd>
      </div>
      <div>
        <dt>Years</dt>
        <dd>{project.years}</dd>
      </div>
      <div>
        <dt>Platforms</dt>
        <dd>{copy.platforms}</dd>
      </div>
      <div>
        <dt>Live</dt>
        <dd>
          {project.links.length > 0 ? (
            <span className="cs-links">
              <OutLinks links={project.links} />
            </span>
          ) : (
            copy.privateNote
          )}
        </dd>
      </div>
    </dl>
  );
}

/** Phone: each part shows its own crop; the first part's plate is the hero under the title. */
function showsPlate(part: Part, plate: Plate, first: boolean) {
  return part.narrow !== undefined && part.narrow !== "stores" && (first || plate.kind !== "live");
}

interface Group {
  plate: number;
  parts: { part: Part; index: number }[];
}

/** Desktop: each plate stands once, and the parts after it that name no new plate read beside it. */
function groupsOf(parts: Part[]) {
  const groups: Group[] = [];
  const seen = new Set<number>();
  parts.forEach((part, index) => {
    const last = groups.at(-1);
    if (last && seen.has(part.plate)) last.parts.push({ part, index });
    else groups.push({ plate: part.plate, parts: [{ part, index }] });
    seen.add(part.plate);
  });
  return groups;
}

const TWIN_SIDES = ["Old app", "New app"];
/** Longer than the last tick on the new app: 400 + 360 + 2 × 80 + 240 ms. */
const TWIN_MS = 1300;

/** One test on two small screens: the old app ticks each line first, then the new app ticks the same lines. */
function TwinCheck({ lines }: { lines: string[] }) {
  return (
    <figure className="cs-twin" data-draw-ms={TWIN_MS}>
      <div className="cs-twin-pair">
        {TWIN_SIDES.map((name, side) => (
          <div key={name} className="cs-twin-screen" style={{ "--side": side } as CSSProperties}>
            <p className="cs-twin-bar">{name}</p>
            <ul>
              {lines.map((line, i) => (
                <li key={line} style={{ "--i": i } as CSSProperties}>
                  <svg className="cs-twin-tick" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2.25 6.5 5 9.25 9.75 3" pathLength={1} />
                  </svg>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <figcaption className="cs-twin-same">The same test passed on both apps.</figcaption>
    </figure>
  );
}

interface PartTextProps {
  part: Part;
  index: number;
  plate: Plate;
  project: Project;
  children?: ReactNode;
}

function PartText({ part, index, plate, project, children }: PartTextProps) {
  const stores = (plate.kind === "web" || plate.kind === "phone") && plate.stores !== undefined && project.links.length > 0;
  return (
    <>
      {children}
      <h2 id={`cs-part-${index}`}>{part.heading}</h2>
      <p className="cs-text">{keepWords(part.text)}</p>
      <p className="cs-proof">{keepWords(part.proof)}</p>
      {part.twin && <TwinCheck lines={part.twin} />}
      {stores && (
        <p className="cs-links">
          <OutLinks links={project.links} />
        </p>
      )}
    </>
  );
}

function Case({ project, copy }: { project: Project; copy: CaseCopy }) {
  const page = usePageLight();
  const narrow = useMedia("(max-width: 1023px)", false);
  const { parts, plates, captions } = copy;
  const loose = plates.flatMap((plate, at) =>
    (plate.kind === "web" || plate.kind === "phone") && !parts.some((part) => part.plate === at) ? [{ plate, at }] : [],
  );
  const next = findProject(nextSlug(project.slug)) ?? project;
  const nextCopy = caseCopy[next.slug];
  const seen = new Set<number>();
  const root = useRef<HTMLDivElement>(null);
  useDraw(root);
  useWalks(project.slug);

  return (
    <div className="cs" ref={root} data-fonts={page.fallback ? "fallback" : undefined}>
      <title>{`${project.name} — Gentrit Rashiti`}</title>
      <CaseTop />
      <main>
        <div className="cs-sky">
          <header className="cs-head">
            <div className="cs-id">
              <p className="cs-name">
                {project.name} · {project.years}
              </p>
              <h1>{keepWords(copy.title)}</h1>
              <p className="cs-sentence">{keepWords(copy.sentence)}</p>
            </div>
            <div className="cs-side">
              {!narrow && <Facts project={project} copy={copy} />}
              <LitLine page={page} />
            </div>
          </header>
        </div>

        <div className="cs-parts">
          {narrow
            ? parts.map((part, index) => {
                const plate = plates[part.plate];
                const shown = showsPlate(part, plate, !seen.has(part.plate));
                seen.add(part.plate);
                return (
                  <section
                    key={part.heading}
                    className="cs-part"
                    data-plate={shown ? plate.kind : "none"}
                    aria-labelledby={`cs-part-${index}`}
                  >
                    {shown && (
                      <div className="cs-part-plate">
                        <PartPlate
                          part={part}
                          plate={plate}
                          caption={captions[part.plate]}
                          narrow
                          first={index === 0}
                          page={page}
                        />
                      </div>
                    )}
                    <div className="cs-part-text">
                      <PartText part={part} index={index} plate={plate} project={project}>
                        {index === 0 && <Facts project={project} copy={copy} />}
                      </PartText>
                    </div>
                  </section>
                );
              })
            : groupsOf(parts).map(({ plate: at, parts: group }) => (
                <div key={at} className="cs-group" data-plate={plates[at].kind}>
                  <div className="cs-part-plate">
                    <PartPlate
                      part={group[0].part}
                      plate={plates[at]}
                      caption={captions[at]}
                      narrow={false}
                      first={group[0].index === 0}
                      page={page}
                    />
                  </div>
                  <div className="cs-group-text">
                    {group.map(({ part, index }) => (
                      <section key={part.heading} className="cs-part-text" aria-labelledby={`cs-part-${index}`}>
                        <PartText part={part} index={index} plate={plates[part.plate]} project={project} />
                      </section>
                    ))}
                  </div>
                </div>
              ))}
          {loose.map(({ plate, at }) => (
            <div key={at} className="cs-part cs-loose" data-plate={plate.kind}>
              <div className="cs-part-plate">
                <PartPlate
                  part={{ target: { kind: "figure" }, narrow: plate.narrow, narrowAlt: plate.narrowAlt }}
                  plate={plate}
                  caption={captions[at]}
                  narrow={narrow}
                  first={false}
                  page={page}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="cs-after">
        {copy.figures && (
          <section className="cs-figures" aria-labelledby="cs-figures-title">
            <h2 id="cs-figures-title">The numbers</h2>
            <ul>
              {copy.figures.map((figure, index) => (
                <li key={figure.label} style={{ "--i": index } as CSSProperties}>
                  <p className="cs-figure">
                    {figure.value}
                    {figure.to && (
                      <>
                        <ArrowRightIcon className="cs-figure-arrow" weight="bold" aria-hidden="true" />
                        <span className="cs-sr"> to </span>
                        <span className="cs-figure-to">{figure.to}</span>
                      </>
                    )}
                  </p>
                  <p className="cs-figure-label">{figure.label}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="cs-engineers" aria-labelledby="cs-engineers-title">
          <h2 id="cs-engineers-title">For engineers</h2>
          <p>
            <strong>Built with:</strong> {copy.builtWith}
          </p>
          {copy.engineering && (
            <ul className="cs-engineers-list">
              {copy.engineering.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </section>

        <nav className="cs-next" aria-label="Next project">
          <p className="cs-label">Next project</p>
          <Link to={`/work/${next.slug}`} className="cs-next-link" data-plated={nextCopy ? "" : undefined}>
            {nextCopy && <NextPlate slug={next.slug} copy={nextCopy} page={page} />}
            <span className="cs-next-name">{next.name}</span>
            <span className="cs-next-line">{nextCopy?.title ?? next.kind}</span>
            <ArrowRightIcon className="cs-next-arrow" aria-hidden="true" weight="bold" />
          </Link>
        </nav>

        <CaseEnd />
      </div>
    </div>
  );
}

export function CaseStudyPage() {
  const { slug } = useParams();
  const project = findProject(slug);
  const copy = project ? caseCopy[project.slug] : undefined;
  if (!project?.featured || !copy) return <NotFoundPage />;
  return <Case key={project.slug} project={project} copy={copy} />;
}
