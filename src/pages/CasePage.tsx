import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useParams } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon } from "@phosphor-icons/react";
import { findProject, type Project } from "../content/projects";
import { recreations } from "../lib/recreations";
import { caseCopy, nextSlug, type CaseCopy, type LiveKey, type Part, type Plate, type Px, type Shot } from "./caseCopy";
import { shadowOf, usePageLight, type PageLight } from "./caseLight";
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

function Ground({ page, children }: { page: PageLight; children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const shadow = useRef<SVGPolygonElement>(null);

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
    };
    const resize = new ResizeObserver(draw);
    resize.observe(element);
    draw();
    return () => resize.disconnect();
  }, [page]);

  return (
    <div className="cs-ground" ref={box}>
      <svg ref={svg} className="cs-floor" aria-hidden="true" preserveAspectRatio="none">
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
  const ref = useRef<HTMLDivElement>(null);

  // The specimen runs a demo loop until it is paused. The page shows it still, as a picture of the work.
  useEffect(() => {
    if (which !== "design-system") return;
    const element = ref.current;
    if (!element) return;
    const pause = () => {
      const button = element.querySelector<HTMLButtonElement>('.dsr-demo[aria-pressed="true"]');
      if (!button) return false;
      button.click();
      return true;
    };
    if (pause()) return;
    const observer = new MutationObserver(() => {
      if (pause()) observer.disconnect();
    });
    observer.observe(element, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [which]);

  return (
    <div ref={ref} className={`cs-live cs-live-${which}`} data-world={entry.world} inert aria-hidden="true">
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
        <span
          className="cs-shot-ring"
          aria-hidden="true"
          style={{
            left: `calc(${((ring.x - crop.x) / crop.w) * 100}% - 5px)`,
            top: `calc(${((ring.y - crop.y) / crop.h) * 100}% - 5px)`,
            width: `calc(${(ring.w / crop.w) * 100}% + 10px)`,
            height: `calc(${(ring.h / crop.h) * 100}% + 10px)`,
          }}
        />
      )}
    </div>
  );
}

/** A screen with its own title bar, so its label never stands on the ground. */
function Screen({ caption, width, children }: { caption: string; width: string; children: ReactNode }) {
  return (
    <figure className="cs-screen" data-cs-screen style={{ width }}>
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
    <div className="cs-stage-box" ref={stage}>
      <div className="cs-stage">
        <LivePlate which={which} />
      </div>
    </div>
  );
}

function NumberFigure({ plate }: { plate: Extract<Plate, { kind: "number" }> }) {
  return (
    <figure className="cs-number">
      <p className="cs-number-figure" aria-hidden="true">
        {plate.from && (
          <>
            <span>{plate.from}</span>
            <ArrowRightIcon className="cs-number-arrow" weight="bold" />
          </>
        )}
        <span>{plate.to}</span>
      </p>
      <figcaption>
        <span className="cs-sr">{plate.from ? `${plate.from} to ${plate.to} ` : `${plate.to} `}</span>
        <span className="cs-number-unit">{plate.unit}</span>
        <span className="cs-number-note">{plate.note}</span>
      </figcaption>
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
        {near ? <LiveStage which={plate.key} /> : <div className="cs-stage-box" />}
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
      <Ground page={page}>
        {screen}
      </Ground>
    </div>
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

  return (
    <div className="cs" data-fonts={page.fallback ? "fallback" : undefined}>
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
              {copy.figures.map((figure) => (
                <li key={figure.label}>
                  <p className="cs-figure">
                    {figure.value}
                    {figure.to && (
                      <>
                        <ArrowRightIcon className="cs-figure-arrow" weight="bold" aria-hidden="true" />
                        <span className="cs-sr"> to </span>
                        {figure.to}
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
        </section>

        <nav className="cs-next" aria-label="Next project">
          <p className="cs-label">Next project</p>
          <Link to={`/work/${next.slug}`} className="cs-next-link">
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
