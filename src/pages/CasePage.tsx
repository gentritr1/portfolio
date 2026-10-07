import { useCallback, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type Ref } from "react";
import { Link, useParams } from "react-router";
import { ArrowRightIcon, ArrowUpRightIcon, UserIcon, XIcon } from "@phosphor-icons/react";
import { findProject, type Project } from "../content/projects";
import { caseCopy, nextSlug, type CaseCopy, type Part, type Plate, type Px, type Shot } from "./caseCopy";
import { BrowserFrame, spotIn } from "../components/BrowserFrame";
import { PhoneFrame, phoneSpot } from "../components/PhoneFrame";
import { ScreenCarousel } from "../components/ScreenCarousel";
import { Stage } from "../components/Stage";
import { phoneScreens } from "../content/phoneScreens";
import { usePageLight } from "./caseLight";
import { useDraw, useWalks } from "./caseMotion";
import { CaseEnd, CaseTop } from "./caseShell";
import NotFoundPage from "./NotFoundPage";
import "./case.css";

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

/* ---------- Plates: whole screens in device frames, on the project's own stage ---------- */

interface Spot {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The proof ring, 4 px outside the box it marks. */
function Ring({ spot }: { spot: Spot }) {
  return (
    <svg
      className="cs-shot-ring"
      aria-hidden="true"
      style={{
        left: `calc(${spot.x}% - 4px)`,
        top: `calc(${spot.y}% - 4px)`,
        width: `calc(${spot.w}% + 8px)`,
        height: `calc(${spot.h}% + 8px)`,
      }}
    >
      <rect className="cs-ring-edge" width="100%" height="100%" rx="7" pathLength={1} />
      <rect width="100%" height="100%" rx="7" pathLength={1} />
    </svg>
  );
}

type ScreenPlate = Extract<Plate, { kind: "web" | "phone" }>;

interface FrameProps {
  plate: ScreenPlate;
  shot?: Shot;
  ring: Px | null;
  eager: boolean;
  /** The next-project link names the case this screen opens. */
  slug?: string;
}

/** One screen in its device frame. The frame is the screen a plate walk moves between the pages. */
function Frame({ plate, shot = plate, ring, eager, slug }: FrameProps) {
  if (plate.kind === "phone") {
    const view = phoneScreens[shot.src].box;
    const shown = ring && ring.x >= view.x && ring.y >= view.y && ring.x + ring.w <= view.x + view.w && ring.y + ring.h <= view.y + view.h;
    return (
      <PhoneFrame src={shot.src} alt={shot.alt} eager={eager} data-cs-screen data-plate={slug}>
        {shown && <Ring spot={phoneSpot(shot.src, ring)} />}
      </PhoneFrame>
    );
  }
  return (
    <BrowserFrame
      src={shot.src}
      alt={shot.alt}
      width={shot.width}
      height={shot.height}
      label={plate.bar.label}
      site={plate.bar.site}
      tone={plate.bar.tone}
      eager={eager}
      data-cs-screen
      data-plate={slug}
    >
      {ring && <Ring spot={spotIn(ring, shot.width, shot.height)} />}
    </BrowserFrame>
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
      image.src = (next.full ?? next).src;
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
  const view = shot && (shot.full ?? shot);

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
      {shot && view && (
        <figure
          className="cs-lightbox-figure"
          style={{ width: `min(100%, ${view.width}px, calc((100dvh - 184px) * ${view.width} / ${view.height}))` }}
        >
          <button type="button" className="cs-lightbox-close" onClick={close}>
            <XIcon aria-hidden="true" size={18} weight="bold" />
            Close
          </button>
          <img src={view.src} alt="" width={view.width} height={view.height} decoding="async" />
          <figcaption>{shot.alt}</figcaption>
        </figure>
      )}
    </dialog>
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

interface PlateProps {
  part: Pick<Part, "target">;
  plate: Plate;
  caption: string;
  stage: string;
  first: boolean;
  enlarge: Enlarge;
}

/** A button that opens the whole capture in the lightbox. */
function Enlargeable({ plate, shot = plate, ring, eager, enlarge }: FrameProps & { enlarge: Enlarge }) {
  return (
    <button type="button" className="cs-enlarge" aria-label={`Enlarge: ${shot.alt}`} onClick={(event) => enlarge(shot, event.currentTarget)}>
      <Frame plate={plate} shot={shot} ring={ring} eager={eager} />
    </button>
  );
}

/** The plate a part shows: the whole screen in its frame, on the project's stage. */
function PartPlate({ part, plate, caption, stage, first, enlarge }: PlateProps) {
  if (plate.kind === "number") return <NumberFigure plate={plate} />;
  if (plate.kind === "flow") return <FlowFigure plate={plate} caption={caption} />;
  const ring = part.target.kind === "shot" ? part.target.box : null;
  const more = plate.kind === "web" ? plate.more : undefined;
  return (
    <Stage ground={stage} caption={caption} className="cs-stage" data-kind={plate.kind}>
      {plate.kind === "web" && more?.length ? (
        <ScreenCarousel
          name={caption}
          slides={[{ ...plate, name: plate.name ?? caption }, ...more].map((shot, i) => ({
            label: shot.name,
            render: () => <Enlargeable plate={plate} shot={shot} ring={i === 0 ? ring : null} eager={first && i === 0} enlarge={enlarge} />,
          }))}
        />
      ) : (
        <Enlargeable plate={plate} ring={ring} eager={first} enlarge={enlarge} />
      )}
    </Stage>
  );
}

/** The next case's first screen, small, on its own stage. */
function NextPlate({ slug, copy }: { slug: string; copy: CaseCopy }) {
  const plate = copy.plates.find((p): p is ScreenPlate => p.kind === "web" || p.kind === "phone");
  if (!plate) return null;
  return (
    <span className="cs-next-plate" aria-hidden="true">
      <Stage ground={copy.stage} className="cs-stage cs-stage-small" data-kind={plate.kind}>
        <Frame plate={plate} ring={null} eager={false} slug={slug} />
      </Stage>
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
                          stage={copy.stage}
                          first={index === 0}
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
                        stage={copy.stage}
                        first={group[0].index === 0}
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
                  part={{ target: { kind: "figure" } }}
                  plate={plate}
                  caption={captions[at]}
                  stage={copy.stage}
                  first={false}
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
            {nextCopy && <NextPlate slug={next.slug} copy={nextCopy} />}
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
