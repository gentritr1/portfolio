import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  animate,
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import { caseNarratives } from "../../content/caseNarratives";
import { links } from "../../content/links";
import { CropShot } from "../../components/CropShot";
import { registerCell } from "./cells";
import { rows, type LedgerRow } from "./data";
import { dur, ease, spring } from "./motion";
import "./ledger.css";

/** These timings must match the posting keyframes in ledger.css. */
const STEP = 22;
const LEAD = 160;
const CELL_LAG = 200;
const pad = (value: number) => String(value).padStart(2, "0");

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 13 13 3M5 3h8v8" />
    </svg>
  );
}

function LiveCell({
  row,
  open,
  pinned,
  delay,
  reduced,
  onPreview,
  onPin,
}: {
  row: LedgerRow;
  open: boolean;
  pinned: boolean;
  delay: number;
  reduced: boolean;
  onPreview: (on: boolean) => void;
  onPin: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const firstDelay = useRef(delay);
  useEffect(
    () =>
      row.screen
        ? undefined
        : registerCell(
            canvas.current!,
            row.project.slug,
            row.colour,
            row.order,
            firstDelay.current,
          ),
    [row],
  );
  const shot = row.project.media.shot;
  return (
    <motion.button
      layout
      type="button"
      className="ld-cell"
      data-open={open}
      aria-pressed={pinned}
      aria-label={`${pinned ? "Shrink" : "Enlarge"} the ${row.project.name} ${row.screen ? "screen" : "live recreation"}`}
      onPointerEnter={(event) => event.pointerType === "mouse" && onPreview(true)}
      onFocus={() => onPreview(true)}
      onBlur={() => onPreview(false)}
      onClick={onPin}
      whileTap={reduced ? undefined : { scale: 0.97 }}
      transition={reduced ? { duration: 0.01 } : spring.ui}
    >
      {row.screen ? (
        <CropShot
          shot={row.screen}
          alt=""
          style={{ width: "auto", height: "100%", margin: "0 auto" }}
        />
      ) : (
        <canvas ref={canvas} aria-hidden="true" />
      )}
      {shot && !row.screen && (
        <img
          className="ld-shot"
          src={shot.src}
          alt=""
          decoding="async"
          style={{ animationDelay: `${-((row.order * 2.3) % 12)}s` }}
        />
      )}
    </motion.button>
  );
}

function Case({
  row,
  reduced,
  onClose,
}: {
  row: LedgerRow;
  reduced: boolean;
  onClose: () => void;
}) {
  const { project } = row;
  const narrative = caseNarratives[project.slug];
  const paragraphs = narrative
    ? [narrative.story.product, narrative.story.built, narrative.story.result]
    : [project.summary];
  const facts = narrative?.facts ?? [
    { label: "Role", value: project.role },
    { label: "Years", value: project.years ?? "Not dated" },
    { label: "Stack", value: project.stack.join(", ") },
  ];
  const shots = (project.media.galleries ?? [])
    .flatMap((gallery) => gallery.items)
    .slice(0, 6);
  const readouts = project.featured?.readouts;
  const quiet = reduced ? { duration: 0.01 } : undefined;
  return (
    <motion.div
      className="ld-case"
      id={`ld-case-${project.slug}`}
      role="region"
      aria-labelledby={`ld-name-${project.slug}`}
      initial={{ height: 0 }}
      animate={{ height: "auto" }}
      exit={{ height: 0 }}
      transition={quiet ?? { duration: dur.panel, ease: ease.sheet }}
    >
      <motion.div
        className="ld-case-inner ld-grid"
        initial={{ opacity: 0, y: reduced ? 0 : 8, filter: reduced ? "none" : "blur(4px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: reduced ? 0 : 8, filter: reduced ? "none" : "blur(4px)" }}
        transition={quiet ?? { duration: dur.panel, ease: ease.arrive, delay: 0.05 }}
      >
        <div className="ld-case-story">
          {paragraphs.map((text) => (
            <p key={text.slice(0, 24)}>{text}</p>
          ))}
        </div>
        <div className="ld-case-side">
          {readouts && (
            <dl className="ld-readouts">
              {readouts.map((readout) => (
                <div key={readout.label}>
                  <dt>{readout.label}</dt>
                  <dd>
                    {readout.value}
                    {readout.to && ` → ${readout.to}`}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <dl className="ld-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
          <div className="ld-case-actions">
            {project.links.map((link) => (
              <a href={link.href} key={link.href} target="_blank" rel="noreferrer">
                {link.label}
                <Arrow />
              </a>
            ))}
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
          {shots.length > 0 && (
            <ul className="ld-shots" aria-label={`${project.name} screenshots`}>
              {shots.map((shot) => (
                <li key={shot.src} data-tall={shot.height > shot.width}>
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    width={shot.width}
                    height={shot.height}
                    loading="lazy"
                    decoding="async"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Draft() {
  const reduced = Boolean(useReducedMotion());
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [barOn, setBarOn] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [posting, setPosting] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const find = useRef<HTMLInputElement>(null);
  const tally = useRef<HTMLElement>(null);
  const barColour = useRef(rows[0].colour);

  const needle = query.trim().toLocaleLowerCase();
  const matching = useMemo(
    () => rows.filter((row) => row.search.includes(needle)),
    [needle],
  );
  const cursorRow = rows.find((row) => row.project.slug === cursor);

  useLayoutEffect(() => {
    if (cursorRow) barColour.current = cursorRow.colour;
  });

  useEffect(() => {
    if (reduced) {
      setPosting(false);
      return;
    }
    const total = LEAD + rows.length * STEP + CELL_LAG + 320;
    const clock = animate(0, total, {
      duration: total / 1000,
      ease: "linear",
      onUpdate: (time) => {
        if (tally.current)
          tally.current.textContent = pad(
            Math.max(0, Math.min(rows.length, Math.floor((time - LEAD) / STEP) + 1)),
          );
      },
      onComplete: () => setPosting(false),
    });
    return () => clock.stop();
  }, [reduced]);

  const nameButton = (slug: string) =>
    root.current?.querySelector<HTMLButtonElement>(`#ld-name-${slug}`);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        find.current?.focus();
        find.current?.select();
      } else if (
        event.key === "/" &&
        !(document.activeElement instanceof HTMLInputElement)
      ) {
        event.preventDefault();
        find.current?.focus();
      } else if (event.key === "Escape") {
        setPinned(null);
        setHovered(null);
        setOpenSlug((slug) => {
          if (slug && root.current?.contains(document.activeElement))
            requestAnimationFrame(() => nameButton(slug)?.focus());
          return null;
        });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function point(slug: string) {
    setCursor(slug);
    setBarOn(true);
  }
  function step(direction: 1 | -1) {
    if (!matching.length) return;
    const at = matching.findIndex((row) => row.project.slug === cursor);
    const next =
      at < 0
        ? direction === 1
          ? 0
          : matching.length - 1
        : Math.max(0, Math.min(matching.length - 1, at + direction));
    const slug = matching[next].project.slug;
    point(slug);
    root.current
      ?.querySelector(`[data-slug="${slug}"]`)
      ?.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
  }
  function toggleCase(slug: string) {
    setOpenSlug((value) => (value === slug ? null : slug));
  }
  function leaveList(next: EventTarget | null) {
    if (
      !(next instanceof Node) ||
      !(list.current?.contains(next) || find.current === next)
    )
      setBarOn(false);
  }

  function onFindKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      step(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target =
        matching.find((row) => row.project.slug === cursor) ?? matching[0];
      if (target) {
        point(target.project.slug);
        toggleCase(target.project.slug);
      }
    } else if (event.key === "Escape") {
      event.stopPropagation();
      if (query) setQuery("");
      else find.current?.blur();
    }
  }

  function onNameKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const next = matching[index + (event.key === "ArrowDown" ? 1 : -1)];
    if (next) nameButton(next.project.slug)?.focus();
    else if (event.key === "ArrowUp") find.current?.focus();
  }

  return (
    <div
      className="draft-ledger"
      ref={root}
      data-posting={posting && !reduced ? "" : undefined}
    >
      <title>LEDGER — Gentrit Rashiti</title>
      <header className="ld-head ld-grid">
        <span className="ld-no">00</span>
        <div className="ld-who">
          <h1>Gentrit Rashiti</h1>
          <span className="ld-sub">Frontend & mobile developer → full stack</span>
        </div>
        <span className="ld-years">2021–26</span>
        <span className="ld-platform">Kosovo</span>
        <p className="ld-fact">Frontend & mobile developer → full stack</p>
        <nav className="ld-actions" aria-label="Contact">
          <a href={links.cv} download>
            CV ↓
          </a>
          <a href={`mailto:${links.email}`}>Email</a>
        </nav>
      </header>

      <div className="ld-band ld-grid" role="search">
        <span className="ld-no" aria-hidden="true">
          No.
        </span>
        <label className="ld-find">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" />
            <path d="m10.5 10.5 3.5 3.5" />
          </svg>
          <span className="ld-hidden">Find a project</span>
          <input
            ref={find}
            value={query}
            placeholder="Project"
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => {
              setQuery(event.target.value);
              const first = rows.find((row) =>
                row.search.includes(event.target.value.trim().toLocaleLowerCase()),
              );
              if (first) point(first.project.slug);
            }}
            onFocus={() => {
              setBarOn(true);
              if (!cursor && matching[0]) setCursor(matching[0].project.slug);
            }}
            onBlur={(event) => leaveList(event.relatedTarget)}
            onKeyDown={onFindKey}
            aria-controls="ld-rows"
          />
          <kbd aria-hidden="true">⌘K</kbd>
        </label>
        <span className="ld-years" aria-hidden="true">
          Years
        </span>
        <span className="ld-platform" aria-hidden="true">
          Platform
        </span>
        <span className="ld-fact" aria-hidden="true">
          Product fact
        </span>
        <span className="ld-live" aria-hidden="true">
          <span className="ld-long">Live recreation</span>
          <span className="ld-short">Live</span>*
        </span>
      </div>
      <p className="ld-hidden" role="status">
        {matching.length} of {rows.length} projects
      </p>

      <main className="ld-sheet">
        {posting && !reduced && (
          <div className="ld-ruler" aria-hidden="true" />
        )}
        <LayoutGroup id="ledger">
          <ol
            className="ld-rows"
            id="ld-rows"
            ref={list}
            onPointerLeave={(event) => {
              if (event.pointerType !== "mouse") return;
              setHovered(null);
              if (!list.current?.contains(document.activeElement)) setBarOn(false);
            }}
            onBlur={(event) => leaveList(event.relatedTarget)}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {matching.map((row, index) => {
                const slug = row.project.slug;
                const isOpen = openSlug === slug;
                const cellOpen = hovered === slug || pinned === slug;
                return (
                  <motion.li
                    layout="position"
                    key={slug}
                    className="ld-item"
                    data-slug={slug}
                    data-case={isOpen}
                    data-cell-open={cellOpen}
                    style={{ "--c": row.colour, "--i": row.order } as CSSProperties}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={
                      reduced
                        ? { duration: 0.01 }
                        : { layout: spring.ui, opacity: { duration: dur.ui, ease: ease.out } }
                    }
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") point(slug);
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType === "mouse")
                        setHovered((value) => (value === slug ? null : value));
                    }}
                    onFocus={() => point(slug)}
                  >
                    <div className="ld-row ld-grid">
                      {cursor === slug && (
                        <motion.span
                          layoutId="ld-bar"
                          className="ld-bar"
                          aria-hidden="true"
                          initial={{ backgroundColor: barColour.current, opacity: 0 }}
                          animate={{ backgroundColor: row.colour, opacity: barOn ? 1 : 0 }}
                          transition={
                            reduced
                              ? { duration: 0.01 }
                              : {
                                  layout: spring.ui,
                                  backgroundColor: { duration: dur.ui, ease: ease.out },
                                  opacity: { duration: dur.tap, ease: ease.out },
                                }
                          }
                        />
                      )}
                      <span className="ld-no">{row.index}</span>
                      <button
                        type="button"
                        className="ld-name"
                        id={`ld-name-${slug}`}
                        aria-expanded={isOpen}
                        aria-controls={`ld-case-${slug}`}
                        onClick={() => toggleCase(slug)}
                        onKeyDown={(event) => onNameKey(event, index)}
                      >
                        <span className="ld-title">{row.project.name}</span>
                        <span className="ld-sub">
                          {row.project.years ?? "—"} · {row.platform}
                        </span>
                        <span className="ld-sub">{row.fact}</span>
                      </button>
                      <span className="ld-years">{row.project.years ?? "—"}</span>
                      <span className="ld-platform">{row.platform}</span>
                      <span className="ld-fact">{row.fact}</span>
                      <LiveCell
                        row={row}
                        open={cellOpen}
                        pinned={pinned === slug}
                        delay={posting && !reduced ? LEAD + row.order * STEP + CELL_LAG : 0}
                        reduced={reduced}
                        onPreview={(on) =>
                          setHovered((value) => (on ? slug : value === slug ? null : value))
                        }
                        onPin={() => setPinned((value) => (value === slug ? null : slug))}
                      />
                    </div>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <Case
                          row={row}
                          reduced={reduced}
                          onClose={() => {
                            setOpenSlug(null);
                            nameButton(slug)?.focus();
                          }}
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
          <p className="ld-empty ld-grid">
            <span className="ld-no">—</span>
            <span>
              No entry matches “{query.trim()}”.{" "}
              <button type="button" onClick={() => setQuery("")}>
                Show all {rows.length}
              </button>
            </span>
          </p>
        )}
        <p className="ld-note ld-grid">
          <span className="ld-no">*</span>
          <span>
            Live recreations use invented data. Screenshots come from public
            store and web pages. The care platform and Design System v2 rows
            show real product screens with invented data.
          </span>
          <a href="/drafts">All art directions</a>
        </p>
      </main>

      <footer className="ld-total ld-grid">
        <span className="ld-no">Σ</span>
        <span className="ld-count">
          <strong>
            {posting && !reduced ? <span ref={tally}>00</span> : pad(matching.length)}
          </strong>{" "}
          of {rows.length} entries
        </span>
        <span className="ld-years">2021–26</span>
        <span className="ld-platform">Remote</span>
        <span className="ld-fact">5+ years · two platform rewrites</span>
        <nav className="ld-actions" aria-label="Profiles">
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </nav>
      </footer>
    </div>
  );
}
