import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { caseNarratives } from "../../content/caseNarratives";
import { links } from "../../content/links";
import { createScheduler } from "./cells";
import { rows, type LedgerRow } from "./data";
import { dur, ease, spring } from "./motion";
import CareFile from "./CareFile";
import "./ledger.css";

function Case({
  row,
  onClose,
  reduced,
}: {
  row: LedgerRow;
  onClose: () => void;
  reduced: boolean;
}) {
  const { project } = row;
  const story = caseNarratives[project.slug];
  return (
    <motion.article
      className="ld-case"
      tabIndex={-1}
      aria-label={`${project.name} case`}
      initial={{
        opacity: 0,
        y: reduced ? 0 : 8,
        filter: reduced ? "blur(0px)" : "blur(4px)",
      }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{
        opacity: 0,
        y: reduced ? 0 : 8,
        filter: reduced ? "blur(0px)" : "blur(4px)",
      }}
      transition={{ duration: reduced ? 0.01 : dur.panel, ease: ease.sheet }}
    >
      <header>
        <motion.h2
          layoutId={`ld-title-${project.slug}`}
          transition={reduced ? { duration: 0.01 } : spring.ui}
        >
          {project.name}
        </motion.h2>
        <button onClick={onClose}>Close case</button>
      </header>
      <div className="ld-case-copy">
        <div>
          <p>{story?.story.product ?? project.summary}</p>
          {story && <p>{story.story.built}</p>}
          {project.slug === "care-platform" && <CareFile reduced={reduced} />}
        </div>
        <dl>
          <div>
            <dt>Role</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Years</dt>
            <dd>{project.years ?? "Not specified"}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.stack.join(" / ")}</dd>
          </div>
        </dl>
      </div>
      <nav>
        {project.links.map((link) => (
          <a href={link.href} key={link.href} target="_blank" rel="noreferrer">
            {link.label}
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3 13 13 3M4 3h9v9" />
            </svg>
          </a>
        ))}
      </nav>
    </motion.article>
  );
}

export default function Draft() {
  const reduced = Boolean(useReducedMotion());
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [caseSlug, setCaseSlug] = useState<string | null>(null);
  const [cvRequested, setCvRequested] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const skewFrame = useRef(0);
  const scrollState = useRef({ y: 0, time: 0, skew: 0 });
  const matching = rows.filter((row) =>
    `${row.project.name} ${row.project.years} ${row.platform} ${row.fact} ${row.project.stack.join(" ")}`
      .toLocaleLowerCase()
      .includes(query.toLocaleLowerCase()),
  );
  const expanded = hovered ?? pinned;

  useEffect(() => {
    const scheduler = createScheduler();
    const stops: Array<() => void> = [];
    root.current
      ?.querySelectorAll<HTMLCanvasElement>("[data-cell]")
      .forEach((canvas) => {
        const row = rows.find(
          (item) => item.project.slug === canvas.dataset.cell,
        )!;
        stops.push(scheduler.register(canvas, row.kind, row.colour));
      });
    return () => {
      stops.forEach((stop) => stop());
      scheduler.destroy();
    };
  }, [query]);

  useEffect(() => {
    if (searchOpen) search.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setCaseSlug(null);
        setSearchOpen(false);
        setPinned(null);
        setHovered(null);
      }
    };
    const decay = () => {
      scrollState.current.skew *= 0.95;
      if (Math.abs(scrollState.current.skew) < 0.01)
        scrollState.current.skew = 0;
      root.current?.style.setProperty(
        "--ld-skew",
        `${scrollState.current.skew}deg`,
      );
      skewFrame.current = scrollState.current.skew
        ? requestAnimationFrame(decay)
        : 0;
    };
    const scroll = () => {
      if (reduced) return;
      const now = performance.now(),
        y = window.scrollY;
      const velocity =
        (y - scrollState.current.y) /
        Math.max(16, now - scrollState.current.time);
      scrollState.current = {
        y,
        time: now,
        skew: Math.max(-3, Math.min(3, velocity * 0.65)),
      };
      if (!skewFrame.current) skewFrame.current = requestAnimationFrame(decay);
    };
    document.addEventListener("keydown", key);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", key);
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(skewFrame.current);
    };
  }, [reduced]);

  function openCase(row: LedgerRow) {
    setCaseSlug((value) =>
      value === row.project.slug ? null : row.project.slug,
    );
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>(
          `.ld-item[data-slug="${row.project.slug}"] .ld-case`,
        )
        ?.focus({ preventScroll: true }),
    );
  }
  function closeCase(row: LedgerRow) {
    setCaseSlug(null);
    root.current
      ?.querySelector<HTMLButtonElement>(
        `.ld-item[data-slug="${row.project.slug}"] .ld-name`,
      )
      ?.focus({ preventScroll: true });
  }
  function moveRow(index: number) {
    const next = Math.max(0, Math.min(matching.length - 1, index));
    setActiveIndex(next);
    root.current
      ?.querySelector<HTMLButtonElement>(
        `.ld-item[data-slug="${matching[next]?.project.slug}"] .ld-name`,
      )
      ?.focus();
  }

  return (
    <div className="draft-ledger" ref={root} data-reduced={reduced}>
      <title>LEDGER — Gentrit Rashiti</title>
      <header className="ld-header">
        <a href="/drafts">LEDGER / Gentrit Rashiti</a>
        <span>Web · mobile · full stack / Kosovo</span>
        <nav>
          <button
            onClick={() => setSearchOpen((value) => !value)}
            aria-expanded={searchOpen}
          >
            Search <kbd>⌘K</kbd>
          </button>
          <a href={links.cv} download onClick={() => setCvRequested(true)}>
            {cvRequested ? "CV requested" : "Download CV"}
          </a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>
      <main>
        <div className="ld-intro">
          <h1>Every project, in working order.</h1>
          <p>28 projects. Open a row to read; focus a live cell to enlarge.</p>
          <span>Miniatures are recreations with invented data.</span>
        </div>
        <AnimatePresence initial={false}>
          {searchOpen && (
            <motion.form
              className="ld-search"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              transition={{
                duration: reduced ? 0.01 : dur.ui,
                ease: ease.arrive,
              }}
              onSubmit={(event) => {
                event.preventDefault();
                if (matching[activeIndex]) openCase(matching[activeIndex]);
              }}
            >
              <label htmlFor="ld-query">Find in the ledger</label>
              <input
                id="ld-query"
                ref={search}
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    setActiveIndex((index) =>
                      Math.max(
                        0,
                        Math.min(
                          matching.length - 1,
                          index + (event.key === "ArrowDown" ? 1 : -1),
                        ),
                      ),
                    );
                  }
                }}
                placeholder="Project, year, platform or stack"
              />
              <button type="submit" disabled={!matching.length}>
                Open selected
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSearchOpen(false);
                }}
              >
                Clear & close
              </button>
              <span role="status">{matching.length} / 28 rows</span>
            </motion.form>
          )}
        </AnimatePresence>
        <div className="ld-columns" aria-hidden="true">
          <span>No.</span>
          <span>Project</span>
          <span>Years</span>
          <span>Platform</span>
          <span>Product fact</span>
          <span>
            <span className="ld-wide-label">Live recreation</span>
            <span className="ld-narrow-label">Live</span>
          </span>
        </div>
        <LayoutGroup id="ledger">
          <ol className="ld-rows">
            <AnimatePresence mode="popLayout" initial={false}>
              {matching.map((row, index) => {
                const selected = caseSlug === row.project.slug;
                return (
                  <motion.li
                    layout
                    key={row.project.slug}
                    className="ld-item"
                    data-slug={row.project.slug}
                    data-expanded={expanded === row.project.slug}
                    data-selected={searchOpen && activeIndex === index}
                    style={{ "--ld-colour": row.colour } as CSSProperties}
                    initial={{
                      opacity: 0,
                      y: reduced ? 0 : 8,
                      filter: reduced ? "blur(0px)" : "blur(4px)",
                    }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{
                      opacity: 0,
                      y: reduced ? 0 : 8,
                      filter: reduced ? "blur(0px)" : "blur(4px)",
                    }}
                    transition={reduced ? { duration: 0.01 } : spring.ui}
                  >
                    <div className="ld-row">
                      <span className="ld-index">{row.index}</span>
                      <button
                        className="ld-name"
                        aria-expanded={selected}
                        onClick={() => openCase(row)}
                        onKeyDown={(event) => {
                          if (
                            event.key === "ArrowDown" ||
                            event.key === "ArrowUp"
                          ) {
                            event.preventDefault();
                            moveRow(
                              index + (event.key === "ArrowDown" ? 1 : -1),
                            );
                          }
                        }}
                      >
                        {selected ? (
                          <span>{row.project.name}</span>
                        ) : (
                          <motion.span
                            layoutId={`ld-title-${row.project.slug}`}
                            transition={
                              reduced ? { duration: 0.01 } : spring.ui
                            }
                          >
                            {row.project.name}
                          </motion.span>
                        )}
                        <span className="ld-mobile-facts">
                          {row.project.years ?? "Undated"} · {row.platform}
                          <br />
                          {row.fact}
                        </span>
                      </button>
                      <span className="ld-year">
                        {row.project.years ?? "—"}
                      </span>
                      <span className="ld-platform">{row.platform}</span>
                      <span className="ld-fact">{row.fact}</span>
                      <motion.button
                        layout
                        className="ld-cell"
                        aria-label={`${pinned === row.project.slug ? "Unpin" : "Enlarge"} ${row.project.name} live recreation`}
                        aria-pressed={pinned === row.project.slug}
                        onMouseEnter={() => setHovered(row.project.slug)}
                        onMouseLeave={() => setHovered(null)}
                        onFocus={() => setHovered(row.project.slug)}
                        onBlur={() => setHovered(null)}
                        onClick={() =>
                          setPinned((value) =>
                            value === row.project.slug
                              ? null
                              : row.project.slug,
                          )
                        }
                        whileTap={{ scale: reduced ? 1 : 0.98 }}
                        transition={reduced ? { duration: 0.01 } : spring.ui}
                      >
                        <canvas
                          width={160}
                          height={64}
                          data-cell={row.project.slug}
                          aria-hidden="true"
                        />
                        <span className="ld-cell-instruction">
                          {pinned === row.project.slug
                            ? "Pinned · click to release"
                            : "Click to pin"}
                        </span>
                      </motion.button>
                    </div>
                    <AnimatePresence initial={false}>
                      {selected && (
                        <Case
                          row={row}
                          onClose={() => closeCase(row)}
                          reduced={reduced}
                        />
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ol>
        </LayoutGroup>
        {!matching.length && (
          <p className="ld-empty">
            No matching project.{" "}
            <button onClick={() => setQuery("")}>Show all 28</button>
          </p>
        )}
      </main>
      <footer className="ld-footer">
        <span>End of ledger / {matching.length} rows</span>
        <a href={links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
        <a href={links.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        <a href="/drafts">All art directions</a>
      </footer>
    </div>
  );
}
