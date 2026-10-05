import {
  Fragment,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type RefObject,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import { Link } from "react-router";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import {
  clauses,
  constraintCount,
  entries,
  moreCount,
  rows,
  spoken,
  type Entry,
  type Plate,
} from "./data";
import "./statement-of-record.css";

const FIRST_DELAY = 650;
const DWELL = 140;
const STRIKE = 260;
const WRITE = 340;

/** Time fraction at which cubic-bezier(0.23, 1, 0.32, 1) reaches `progress`. */
function easeOutTime(progress: number) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  const point = (t: number, a: number, b: number) =>
    3 * (1 - t) * (1 - t) * t * a + 3 * (1 - t) * t * t * b + t * t * t;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (low + high) / 2;
    if (point(mid, 1, 1) < progress) low = mid;
    else high = mid;
  }
  return point((low + high) / 2, 0.23, 0.32);
}

/**
 * One span per word, timed so that a pen moving on the ease-out curve passes
 * every word in reading order. Words keep their final place from the first
 * paint, so a wrapped line never reflows.
 */
function Words({ text, total }: { text: string; total: number }) {
  const words = text.split(" ");
  const length = text.length;
  const starts = words.map((_, index) =>
    words.slice(0, index).reduce((sum, word) => sum + word.length + 1, 0),
  );
  return (
    <>
      {words.map((word, index) => {
        const from = starts[index] / length;
        const to = Math.min(1, (starts[index] + word.length + 1) / length);
        const begin = easeOutTime(from) * total;
        const end = easeOutTime(to) * total;
        const style = {
          "--d": `${Math.round(begin)}ms`,
          "--t": `${Math.max(16, Math.round(end - begin))}ms`,
        } as CSSProperties;
        return (
          <Fragment key={index}>
            {index > 0 && " "}
            <span
              className="sr-w"
             
              style={style}
            >
              {word}
            </span>
          </Fragment>
        );
      })}
    </>
  );
}

function Head({ entry }: { entry: Entry }) {
  if (!entry.mark) return <>{entry.head}</>;
  const at = entry.head.indexOf(entry.mark);
  return (
    <>
      {entry.head.slice(0, at)}
      <span className="sr-mark">{entry.mark}</span>
      {entry.head.slice(at + entry.mark.length)}
    </>
  );
}

/**
 * Marks the struck word that ends each line, so its stroke stops at the last
 * glyph and does not run on past the line end.
 */
function useLineEnds(was: RefObject<HTMLSpanElement | null>) {
  useLayoutEffect(() => {
    const node = was.current;
    if (!node) return;
    const mark = () => {
      const words = [...node.querySelectorAll<HTMLElement>(".sr-w")];
      const tops = words.map((word) => word.getBoundingClientRect().top);
      words.forEach((word, index) => {
        const end = index === words.length - 1 || tops[index + 1] - tops[index] > 4;
        word.toggleAttribute("data-eol", end);
      });
    };
    let live = true;
    mark();
    void document.fonts.ready.then(() => {
      if (live) mark();
    });
    const watch = new ResizeObserver(mark);
    watch.observe(node.parentElement ?? node);
    return () => {
      live = false;
      watch.disconnect();
    };
  }, [was]);
}

function Sentence({ entry }: { entry: Entry }) {
  const was = useRef<HTMLSpanElement>(null);
  useLineEnds(was);
  return (
    <p className="sr-sentence">
      <span className="sr-only">{spoken(entry)}</span>
      <span aria-hidden="true">
        <Head entry={entry} />
        {entry.edit && (
          <>
            {" "}
            <span className="sr-was" ref={was}>
              <Words text={entry.edit.was} total={STRIKE} />
            </span>{" "}
            <span className="sr-now">
              <Words text={entry.edit.now} total={WRITE} />
            </span>
          </>
        )}
      </span>
    </p>
  );
}

function PlateView({ plate }: { plate: Plate }) {
  if (plate.kind === "care") {
    const entry = recreations.care;
    const Recreation = entry.Component;
    const style = {
      "--a-base": entry.aspect.base,
      "--a-sm": entry.aspect.sm,
      "--a-lg": entry.aspect.lg,
    } as CSSProperties;
    return (
      <div className="sr-stage" data-world={entry.world} style={style}>
        <Suspense fallback={<div className="sr-stage-wait" />}>
          <Recreation />
        </Suspense>
      </div>
    );
  }
  if (plate.kind === "web") {
    return (
      <img
        className="sr-shot"
        src={plate.src}
        alt={plate.alt}
        width={plate.src.includes("specimen") ? 1920 : 1440}
        height={plate.src.includes("specimen") ? 1200 : 900}
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (plate.kind === "screen") {
    const [width, height] = plate.image;
    const [x, y, w, h] = plate.crop;
    const style = {
      aspectRatio: `${w} / ${h}`,
      "--img-w": `${(width / w) * 100}%`,
      "--img-x": `${(-x / w) * 100}%`,
      "--img-y": `${(-y / h) * 100}%`,
    } as CSSProperties;
    return (
      <div className="sr-screen" style={style}>
        <img
          src={plate.src}
          alt={plate.alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
        />
      </div>
    );
  }
  return (
    <div className="sr-number">
      <p className="sr-number-figure">
        <span className="sr-number-was">{plate.was}</span>
        <span className="sr-number-arrow" aria-hidden="true">
          →
        </span>
        <span className="sr-only"> to </span>
        <span className="sr-number-now">{plate.now}</span>
      </p>
      <p className="sr-number-unit">{plate.unit}</p>
    </div>
  );
}

interface JumpProps {
  onJump: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
}

function EntryLinkView({ entry, onJump }: { entry: Entry } & JumpProps) {
  const link = entry.link;
  if (!link) return null;
  if (link.kind === "case") {
    return (
      <Link className="sr-link" to={`/work/${link.slug}`}>
        Open the case <span aria-hidden="true">→</span>
      </Link>
    );
  }
  if (link.kind === "site") {
    return (
      <a className="sr-link" href={link.href} target="_blank" rel="noreferrer">
        {link.label} <span aria-hidden="true">↗</span>
      </a>
    );
  }
  return (
    <a
      className="sr-link"
      href={`#d-${link.id}`}
      onClick={(event) => onJump(link.id, event)}
    >
      {link.label}
    </a>
  );
}

interface EntryProps extends JumpProps {
  entry: Entry;
  current: boolean;
  solved: boolean;
  instant: boolean;
  register: (id: string, node: HTMLElement | null) => void;
}

function EntryView({
  entry,
  current,
  solved,
  instant,
  register,
  onJump,
}: EntryProps) {
  return (
    <article
      id={`d-${entry.id}`}
      ref={(node) => register(entry.id, node)}
      className="sr-entry"
      data-current={current || undefined}
      data-edit={entry.edit ? (solved ? "now" : "was") : undefined}
      data-instant={instant || undefined}
      data-plate={entry.plate ? entry.plate.kind : undefined}
      tabIndex={-1}
      aria-labelledby={`d-${entry.id}-name`}
    >
      <div className="sr-margin">
        <span className="sr-id">{entry.id}</span>
        <h2 className="sr-project" id={`d-${entry.id}-name`}>
          {entry.project}
        </h2>
        <p className="sr-role">
          {entry.role} · {entry.years}
        </p>
        <div className="sr-margin-link">
          <EntryLinkView entry={entry} onJump={onJump} />
        </div>
      </div>
      <div className="sr-main">
        <Sentence entry={entry} />
        {entry.plate && (
          <figure className="sr-card">
            <PlateView plate={entry.plate} />
            <figcaption>{entry.plate.caption}</figcaption>
          </figure>
        )}
        <div className="sr-foot-link">
          <p className="sr-role">
            {entry.role} · {entry.years}
          </p>
          <EntryLinkView entry={entry} onJump={onJump} />
        </div>
      </div>
    </article>
  );
}

function Cite({
  id,
  current,
  onJump,
}: { id: string; current: boolean } & JumpProps) {
  return (
    <a
      className="sr-cite"
      href={`#d-${id}`}
      data-current={current || undefined}
      aria-label={`Decision ${id}`}
      onClick={(event) => onJump(id, event)}
    >
      {id}
    </a>
  );
}

export default function StatementOfRecord() {
  const [current, setCurrent] = useState(entries[0].id);
  const [solved, setSolved] = useState<ReadonlySet<string>>(() => new Set());
  const [instant, setInstant] = useState<ReadonlySet<string>>(() => new Set());
  const [settled, setSettled] = useState(false);
  const [past, setPast] = useState(false);
  const nodes = useRef(new Map<string, HTMLElement>());
  const sentinel = useRef<HTMLSpanElement>(null);
  const inside = useRef(new Set<string>());

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      root: root.style.background,
      body: body.style.background,
      scheme: root.style.colorScheme,
      behavior: root.style.scrollBehavior,
      padding: root.style.scrollPaddingTop,
    };
    root.style.background = body.style.background = "#e9f2ec";
    root.style.colorScheme = "light";
    root.style.scrollBehavior = "auto";
    root.style.scrollPaddingTop = "0px";
    void recreations.care.load();
    return () => {
      root.style.background = previous.root;
      body.style.background = previous.body;
      root.style.colorScheme = previous.scheme;
      root.style.scrollBehavior = previous.behavior;
      root.style.scrollPaddingTop = previous.padding;
    };
  }, []);

  useEffect(() => {
    let timer = 0;
    let live = true;
    void document.fonts.ready.then(() => {
      if (live) timer = window.setTimeout(() => setSettled(true), FIRST_DELAY);
    });
    return () => {
      live = false;
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const seen = inside.current;
    const watch = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          const id = (record.target as HTMLElement).id.slice(2);
          if (record.isIntersecting) seen.add(id);
          else seen.delete(id);
        }
        const last = [...entries].reverse().find((item) => seen.has(item.id));
        if (last) setCurrent(last.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    nodes.current.forEach((node) => watch.observe(node));
    return () => watch.disconnect();
  }, []);

  const register = useCallback((id: string, node: HTMLElement | null) => {
    if (node) nodes.current.set(id, node);
    else nodes.current.delete(id);
  }, []);

  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;
    const watch = new IntersectionObserver(([record]) =>
      setPast(!record.isIntersecting && record.boundingClientRect.top < 0),
    );
    watch.observe(node);
    return () => watch.disconnect();
  }, []);

  const entry = entries.find((item) => item.id === current);
  useEffect(() => {
    if (!settled || !entry?.edit || solved.has(entry.id)) return;
    const timer = window.setTimeout(
      () => setSolved((done) => new Set(done).add(entry.id)),
      DWELL,
    );
    return () => window.clearTimeout(timer);
  }, [settled, entry, solved]);

  const jump = (id: string, event: MouseEvent<HTMLAnchorElement>) => {
    const node = nodes.current.get(id);
    if (!node) return;
    event.preventDefault();
    if (event.detail === 0) {
      setInstant((set) => new Set(set).add(id));
      setSolved((set) => new Set(set).add(id));
    }
    node.scrollIntoView({ block: "start", behavior: "instant" });
    node.focus({ preventScroll: true });
  };

  return (
    <div className="sr" data-past={past || undefined}>
      <title>Gentrit Rashiti · Statement of record</title>

      <header className="sr-bar" aria-label="Statement">
        <div className="sr-bar-in">
          <p className="sr-bar-line">
            <span className="sr-bar-name">Gentrit Rashiti</span>
            <span className="sr-bar-words"> builds</span>
            {clauses.map((clause) => (
              <Fragment key={clause.cites}>
                <span className="sr-bar-words">
                  {" "}
                  {clause.text}
                  {clause.stop}
                </span>{" "}
                <Cite
                  id={clause.cites}
                  current={current === clause.cites}
                  onJump={jump}
                />
              </Fragment>
            ))}
          </p>
          <p className="sr-tally" aria-live="polite">
            <span className="sr-tally-long">
              {solved.size} of {constraintCount} corrected
            </span>
            <span className="sr-tally-short" aria-hidden="true">
              {solved.size}/{constraintCount}
            </span>
          </p>
        </div>
      </header>

      <main>
        <section className="sr-top">
          <div className="sr-top-in">
            <span className="sr-sentinel" ref={sentinel} aria-hidden="true" />
            <h1 className="sr-statement">
              {rows.map((row, index) => (
                <span className="sr-row" key={row[0].cites}>
                  <span className="sr-clause">
                    {index === 0 && (
                      <>
                        <span className="sr-name">Gentrit Rashiti</span>{" "}
                        builds{" "}
                      </>
                    )}
                    {row.map((clause, at) => (
                      <Fragment key={clause.cites}>
                        {at > 0 && " "}
                        {clause.text}
                        {clause.stop}
                      </Fragment>
                    ))}
                  </span>
                  <span className="sr-row-cite">
                    {row.map((clause) => (
                      <Cite
                        key={clause.cites}
                        id={clause.cites}
                        current={current === clause.cites}
                        onJump={jump}
                      />
                    ))}
                  </span>
                </span>
              ))}
            </h1>
            <ul className="sr-top-links">
              <li>
                <a href={links.cv}>CV</a>
              </li>
              <li>
                <a href={`mailto:${links.email}`}>Email</a>
              </li>
            </ul>
          </div>
        </section>

        <div className="sr-page">
          <div className="sr-entries">
            {entries.map((item) => (
              <EntryView
                key={item.id}
                entry={item}
                current={item.id === current}
                solved={solved.has(item.id)}
                instant={instant.has(item.id)}
                register={register}
                onJump={jump}
              />
            ))}
          </div>

          <section className="sr-record" aria-labelledby="sr-record-title">
            <h2 id="sr-record-title">The record</h2>
            <ol>
              {entries.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#d-${item.id}`}
                    onClick={(event) => jump(item.id, event)}
                  >
                    <span className="sr-record-id">{item.id}</span>
                    <span className="sr-record-name">{item.project}</span>
                    <span className="sr-record-result">
                      {item.link?.kind === "entry"
                        ? `${item.result} · superseded`
                        : item.result}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
            <p className="sr-more">
              {moreCount} more projects, from games to a donations app, are on
              the <Link to="/">full portfolio</Link>.
            </p>
          </section>
        </div>
      </main>

      <footer className="sr-foot">
        <ul className="sr-contact">
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
        <p>
          Care-platform screens are recreations with invented data. Every other
          image comes from a public page, a store listing or an own project.
        </p>
      </footer>
    </div>
  );
}
