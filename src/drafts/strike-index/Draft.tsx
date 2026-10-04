import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { Link } from "react-router";
import { links } from "../../content/links";
import { caseFor, moreCount, roleOf, rows, spoken, type Row } from "./data";
import "./strike-index.css";

const WIDE = "(min-width: 1024px)";
const DWELL = 140;
const FIRST_DELAY = 900;

function useMedia(query: string) {
  const [on, setOn] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const list = window.matchMedia(query);
    const update = () => setOn(list.matches);
    update();
    list.addEventListener("change", update);
    return () => list.removeEventListener("change", update);
  }, [query]);
  return on;
}

function Out() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" className="si-icon">
      <path d="M4.5 11.5 11.5 4.5M6 4.5h5.5V10" />
    </svg>
  );
}

function Caret() {
  return (
    <svg viewBox="0 0 12 12" aria-hidden="true" className="si-caret">
      <path d="M2 9.5 6 3.5l4 6" />
    </svg>
  );
}

function Sentence({ row }: { row: Row }) {
  return (
    <span className="si-line" aria-hidden="true">
      <span className="si-name">{row.name}</span>{" "}
      <span className="si-text">{row.text}</span>
      {row.edit && (
        <>
          {" "}
          <span className="si-was">{row.edit.was}</span>
          <span className="si-now">{row.edit.now}</span>
        </>
      )}
    </span>
  );
}

function Media({ row }: { row: Row }) {
  const { proof } = row;
  return (
    <figure className="si-media" data-kind={proof.kind}>
      <div className="si-frame">
        {proof.kind === "shot" && (
          <img src={proof.src} alt={proof.alt} decoding="async" />
        )}
        {proof.kind === "phones" &&
          proof.srcs.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={index === 0 ? proof.alt : ""}
              decoding="async"
            />
          ))}
        {proof.kind === "readout" && (
          <div className="si-readout">
            <strong>
              {proof.from && (
                <>
                  <s>{proof.from}</s>{" "}
                </>
              )}
              <span>{proof.to}</span>
            </strong>
            <span>{proof.label}</span>
          </div>
        )}
      </div>
      {proof.kind === "shot" && proof.note && (
        <figcaption>{proof.note}</figcaption>
      )}
    </figure>
  );
}

function ProofPanel({ row, id }: { row: Row; id: string }) {
  const slug = caseFor(row);
  return (
    <div className="si-proof" id={id}>
      <Media row={row} />
      <div className="si-proof-text">
        <p className="si-proof-head">
          <strong>{row.project.name}</strong>
          <span>
            {row.years} · {roleOf(row)}
          </span>
        </p>
        <p className="si-note">{row.note}</p>
        {(slug || row.project.links.length > 0) && (
          <p className="si-links">
            {slug && (
              <Link to={`/work/${slug}`} className="si-case">
                Case study
              </Link>
            )}
            {row.project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
                <Out />
              </a>
            ))}
          </p>
        )}
      </div>
    </div>
  );
}

export default function StrikeIndex() {
  const wide = useMedia(WIDE);
  const [active, setActive] = useState(0);
  const [solved, setSolved] = useState<ReadonlySet<number>>(() => new Set());
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const anchor = useRef<{ index: number; top: number } | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const previous = {
      root: root.style.background,
      body: body.style.background,
      scheme: root.style.colorScheme,
    };
    root.style.background = body.style.background = "#f3eee3";
    root.style.colorScheme = "light";
    return () => {
      root.style.background = previous.root;
      body.style.background = previous.body;
      root.style.colorScheme = previous.scheme;
    };
  }, []);

  const [settled, setSettled] = useState(false);

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
    if (!settled || !rows[active].edit || solved.has(active)) return;
    const timer = window.setTimeout(
      () => setSolved((done) => new Set(done).add(active)),
      DWELL,
    );
    return () => window.clearTimeout(timer);
  }, [settled, active, solved]);

  useEffect(() => {
    if (!wide) return;
    const idle =
      window.requestIdleCallback ??
      ((run: () => void) => window.setTimeout(run, 400));
    idle(() => {
      rows.forEach(({ proof }) => {
        const sources =
          proof.kind === "shot"
            ? [proof.src]
            : proof.kind === "phones"
              ? proof.srcs
              : [];
        sources.forEach((src) => {
          const image = new Image();
          image.decoding = "async";
          image.src = src;
        });
      });
    });
  }, [wide]);

  useLayoutEffect(() => {
    const held = anchor.current;
    anchor.current = null;
    if (!held || wide) return;
    const top = buttons.current[held.index]?.getBoundingClientRect().top;
    if (top !== undefined && Math.abs(top - held.top) > 1)
      window.scrollBy({ top: top - held.top, behavior: "instant" });
  }, [active, wide]);

  const choose = (index: number) => {
    if (index === active) return;
    const top = buttons.current[index]?.getBoundingClientRect().top;
    if (top !== undefined) anchor.current = { index, top };
    setActive(index);
  };

  const onKey = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    const last = rows.length - 1;
    const next =
      event.key === "ArrowDown"
        ? Math.min(last, index + 1)
        : event.key === "ArrowUp"
          ? Math.max(0, index - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    choose(next);
    buttons.current[next]?.focus({ preventScroll: wide });
    if (wide) buttons.current[next]?.scrollIntoView({ block: "nearest" });
  };

  const constraints = rows.filter((row) => row.edit).length;

  return (
    <div className="si">
      <title>Gentrit Rashiti · Strike index</title>
      <main className="si-body">
        <div className="si-left">
          <header className="si-top">
            <h1 className="si-statement">
              Gentrit Rashiti builds web and mobile products, from the first
              screen to the store release.
            </h1>
            <p className="si-sub">
              Frontend and mobile developer, full stack since 2026. More than
              five years, two platform rewrites, one design system. Kosovo,
              remote.
            </p>
            <ul className="si-contact">
              <li>
                <a href={`mailto:${links.email}`}>Email</a>
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
          </header>

          <section className="si-index" aria-labelledby="si-index-title">
            <div className="si-head">
              <h2 id="si-index-title">Work, newest first</h2>
              <p>
                <Caret />{" "}
                {solved.size === 0
                  ? `${constraints} rows had a constraint. Select one to see it corrected.`
                  : `${solved.size} of ${constraints} constraints corrected.`}
              </p>
            </div>
            <ol className="si-rows">
              {rows.map((row, index) => {
                const on = index === active;
                return (
                  <li
                    key={row.project.slug + row.name}
                    className="si-item"
                    data-on={on || undefined}
                  >
                    <button
                      ref={(node) => {
                        buttons.current[index] = node;
                      }}
                      type="button"
                      className="si-row"
                      tabIndex={on ? 0 : -1}
                      aria-expanded={on}
                      aria-controls={wide ? "si-proof" : `si-proof-${index}`}
                      data-edit={
                        row.edit
                          ? solved.has(index)
                            ? "now"
                            : "was"
                          : undefined
                      }
                      onClick={() => choose(index)}
                      onPointerEnter={(event) => {
                        if (wide && event.pointerType === "mouse")
                          choose(index);
                      }}
                      onKeyDown={(event) => onKey(event, index)}
                    >
                      <span className="si-year">{row.years}</span>
                      <span className="si-mark">{row.edit && <Caret />}</span>
                      <Sentence row={row} />
                      <span className="si-scope">{row.scope}</span>
                      <span className="si-sr">{spoken(row)}</span>
                    </button>
                    {!wide && on && (
                      <div className="si-drop">
                        <div>
                          <ProofPanel row={row} id={`si-proof-${index}`} />
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>
        {wide && (
          <aside className="si-aside" aria-label="Proof for the selected row">
            <ProofPanel row={rows[active]} id="si-proof" />
          </aside>
        )}
      </main>

      <footer className="si-foot">
        <p className="si-more">
          {moreCount} more projects, from games to a donations app, are on the{" "}
          <Link to="/">full portfolio</Link>.
        </p>
        <p>
          Write to <a href={`mailto:${links.email}`}>{links.email}</a>
        </p>
        <p>
          Vianova screens are recreations with invented data. Every other image
          comes from a public page, a store listing or an own project.
          Bachelor’s degree, UBT.
        </p>
      </footer>
    </div>
  );
}
