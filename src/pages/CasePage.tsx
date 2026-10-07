import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode, type Ref } from "react";
import { Link, useParams } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon, UserIcon, XIcon } from "@phosphor-icons/react";
import { findProject, type Project } from "../content/projects";
import { caseCopy, nextSlug, type CaseCopy, type Part, type Plate, type Px, type Shot } from "./caseCopy";
import { luminance, shadowOf, usePageLight, type PageLight } from "./caseLight";
import { useDraw, useWalks } from "./caseMotion";
import { CaseEnd, CaseTop } from "./caseShell";
import NotFoundPage from "./NotFoundPage";
import "./case.css";

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

interface ShotProps {
  shot: Shot;
  crop: Px;
  alt: string;
  eager: boolean;
  ring: Px | null;
}

function ShotView({ shot, crop, alt, eager, ring }: ShotProps) {
  return (
    <span className="cs-shot" style={{ aspectRatio: `${crop.w} / ${crop.h}`, background: shot.ground }}>
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
    </span>
  );
}

type Enlarge = (shot: Shot, from: HTMLElement) => void;

/** The whole capture in a modal dialog. Only this component renders when it opens or closes. */
function Lightbox({ ref }: { ref: Ref<{ open: Enlarge }> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const from = useRef<HTMLElement | null>(null);
  const [shot, setShot] = useState<Shot | null>(null);

  useImperativeHandle(ref, () => ({
    open(next, trigger) {
      from.current = trigger;
      const image = new Image();
      image.src = next.src;
      void image
        .decode()
        .catch(() => undefined)
        .then(() => setShot(next));
    },
  }), []);

  useLayoutEffect(() => {
    const element = dialog.current;
    if (shot && element && !element.open) element.showModal();
  }, [shot]);

  const close = () => dialog.current?.close();

  return (
    <dialog
      ref={dialog}
      className="cs-lightbox"
      aria-label={shot?.alt}
      onClose={() => {
        setShot(null);
        from.current?.focus({ preventScroll: true });
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      {shot && (
        <figure
          className="cs-lightbox-figure"
          style={{ width: `min(100%, ${shot.width}px, calc((100dvh - 184px) * ${shot.width} / ${shot.height}))` }}
        >
          <button type="button" className="cs-lightbox-close" onClick={close}>
            <XIcon aria-hidden="true" size={18} weight="bold" />
            Close
          </button>
          <img src={shot.src} alt="" width={shot.width} height={shot.height} decoding="async" />
          <figcaption>{shot.alt}</figcaption>
        </figure>
      )}
    </dialog>
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

/** Longer than the flow's play in caseMotion.ts: one pass, then the way back. */
const FLOW_MS = 1800;

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
  enlarge: Enlarge;
}

/** The plate a part shows: the whole crop on a wide screen, the proving part on a phone. */
function PartPlate({ part, plate, caption, narrow, first, page, enlarge }: PlateProps) {
  if (plate.kind === "number") return <NumberFigure plate={plate} />;
  if (plate.kind === "flow") return <FlowFigure plate={plate} caption={caption} />;
  const own = narrow && typeof part.narrow === "object";
  const crop = own && typeof part.narrow === "object" ? part.narrow : plate.crop;
  const box = part.target.kind === "shot" ? part.target.box : null;
  const ring = box && inside(box, crop) ? box : null;
  return (
    <Ground page={page} screen={plate.ground}>
      <Screen caption={caption} width={fitWidth(crop)}>
        <button
          type="button"
          className="cs-enlarge"
          aria-label={`Enlarge: ${plate.alt}`}
          onClick={(event) => enlarge(plate, event.currentTarget)}
        >
          <ShotView shot={plate} crop={crop} alt={(own && part.narrowAlt) || plate.alt} eager={first} ring={ring} />
        </button>
      </Screen>
    </Ground>
  );
}

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
function showsPlate(part: Part) {
  return part.narrow !== undefined && part.narrow !== "stores";
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
function TwinCheck({ lines, note }: { lines: string[]; note: string }) {
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
      <figcaption className="cs-twin-same">{note}</figcaption>
    </figure>
  );
}

interface PartTextProps {
  part: Part;
  index: number;
  plate: Plate;
  project: Project;
  short: string[];
  /** The heading stands in the section's band, not in the text. */
  banded?: boolean;
}

function InShort({ facts, index }: { facts: string[]; index: number }) {
  return (
    <aside className="cs-short" aria-labelledby={`cs-short-${index}`}>
      <h3 id={`cs-short-${index}`}>In short</h3>
      <ul>
        {facts.map((fact) => (
          <li key={fact}>{fact}</li>
        ))}
      </ul>
    </aside>
  );
}

/** The section head on the second surface. */
function Band({ part, index }: { part: Part; index: number }) {
  return (
    <div className="cs-band">
      <h2 id={`cs-part-${index}`}>{part.heading}</h2>
    </div>
  );
}

function PartText({ part, index, plate, project, short, banded }: PartTextProps) {
  const stores = (plate.kind === "web" || plate.kind === "phone") && plate.stores !== undefined && project.links.length > 0;
  return (
    <>
      {!banded && <h2 id={`cs-part-${index}`}>{part.heading}</h2>}
      <p className="cs-text">{keepWords(part.text)}</p>
      <p className="cs-proof">{keepWords(part.proof)}</p>
      {part.twin && <TwinCheck lines={part.twin} note={part.twinNote ?? "The same test passed on both apps."} />}
      {stores && (
        <p className="cs-links">
          <OutLinks links={project.links} />
        </p>
      )}
      {part.heading === "The result" && <InShort facts={short} index={index} />}
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
  const numbers = copy.numbers === undefined ? undefined : plates[copy.numbers];
  const root = useRef<HTMLDivElement>(null);
  const lightbox = useRef<{ open: Enlarge }>(null);
  const enlarge = useCallback<Enlarge>((shot, from) => lightbox.current?.open(shot, from), []);
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
            {!narrow && (
              <div className="cs-side">
                <Facts project={project} copy={copy} />
              </div>
            )}
          </header>
        </div>

        <div className="cs-parts">
          {narrow
            ? parts.map((part, index) => {
                const plate = plates[part.plate];
                const shown = showsPlate(part);
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
                          enlarge={enlarge}
                        />
                      </div>
                    )}
                    {index === 0 && <Facts project={project} copy={copy} />}
                    <Band part={part} index={index} />
                    <div className="cs-part-text">
                      <PartText part={part} index={index} plate={plate} project={project} short={copy.short} banded />
                    </div>
                  </section>
                );
              })
            : groupsOf(parts).map(({ plate: at, parts: group }) => (
                <div key={at} className="cs-section">
                  <Band part={group[0].part} index={group[0].index} />
                  <div className="cs-group" data-plate={plates[at].kind}>
                    <div className="cs-part-plate">
                      <PartPlate
                        part={group[0].part}
                        plate={plates[at]}
                        caption={captions[at]}
                        narrow={false}
                        first={group[0].index === 0}
                        page={page}
                        enlarge={enlarge}
                      />
                    </div>
                    <div className="cs-group-text">
                      {group.map(({ part, index }, k) => (
                        <section key={part.heading} className="cs-part-text" aria-labelledby={`cs-part-${index}`}>
                          <PartText part={part} index={index} plate={plates[part.plate]} project={project} short={copy.short} banded={k === 0} />
                        </section>
                      ))}
                    </div>
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
                  enlarge={enlarge}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="cs-after">
        {copy.figures && (
          <section className="cs-figures" aria-labelledby="cs-figures-title">
            <div className="cs-band">
              <h2 id="cs-figures-title">The numbers</h2>
            </div>
            {numbers?.kind === "number" && <NumberFigure plate={numbers} />}
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
          <div className="cs-band">
            <h2 id="cs-engineers-title">For engineers</h2>
          </div>
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
      <Lightbox ref={lightbox} />
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
