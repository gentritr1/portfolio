import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { flushSync } from "react-dom";
import {
  AnimatePresence,
  LayoutGroup,
  animate,
  motion,
  useMotionValue,
} from "motion/react";
import { projects, type Project } from "../../content/projects";
import { caseNarratives } from "../../content/caseNarratives";
import { links } from "../../content/links";
import { checkParity, legacyProjects, type ParityResult } from "./parity";
import { dur, ease, spring } from "./motion";
import CareFile from "./CareFile";
import "./diff.css";

const count = projects.length;
const mismatchIndex = 1;
const number = (value: number) => String(value).padStart(2, "0");
const legacyFields = {
  title: "project_title",
  description: "description",
  role: "project_role",
  technologies: "technologies",
  links: "public_links",
};

function Check({ failed = false }: { failed?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={failed ? "M4 4l8 8M12 4l-8 8" : "M3 8l3 3 7-7"} />
    </svg>
  );
}

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      style={back ? { transform: "rotate(180deg)" } : undefined}
    >
      <path d="M3 10h13M11 5l5 5-5 5" />
    </svg>
  );
}

interface SheetProps {
  legacy?: boolean;
  seam: number;
  selected: string | null;
  results: ParityResult[];
  running: boolean;
  mismatch: boolean;
  reduced: boolean;
  onSelect: (slug: string | null) => void;
}

function Detail({
  project,
  result,
  legacy,
  onClose,
  reduced,
}: {
  project: Project;
  result?: ParityResult;
  legacy: boolean;
  onClose: () => void;
  reduced: boolean;
}) {
  const story = caseNarratives[project.slug];
  return (
    <article
      className="diff-detail"
      aria-label={`${project.name} project details`}
    >
      <div className="diff-detail-top">
        <span>
          {project.group} · {project.years ?? "Freelance"} · {project.role}
        </span>
        <button type="button" onClick={onClose}>
          <Arrow back /> Back to comparison
        </button>
      </div>
      <div className="diff-detail-body">
        <div className="diff-story">
          <h3>{project.kind}</h3>
          <p>{story?.story.product ?? project.summary}</p>
          {project.slug === "care-platform" && <CareFile reduced={reduced} />}
          {story && <p>{story.story.built}</p>}
          {story && <p>{story.story.result}</p>}
          {project.channel === "healthcare" && (
            <p className="diff-disclosure">
              This portfolio comparison is a recreation. No patient information
              or care-platform screens are shown.
            </p>
          )}
          <nav aria-label={`${project.name} links`}>
            {project.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
                <Arrow />
              </a>
            ))}
          </nav>
        </div>
        <aside className="diff-detail-data">
          <h4>Same content. Different structure.</h4>
          <p>Five fields compared between this portfolio’s two data models.</p>
          <div className="diff-field-heading">
            <span>Field</span>
            <span>{legacy ? "Legacy" : "Current"}</span>
          </div>
          {(
            ["title", "description", "role", "technologies", "links"] as const
          ).map((name) => {
            const check = result?.fields.find((field) => field.name === name);
            return (
              <div
                className="diff-field"
                key={name}
                data-failed={check?.passed === false}
              >
                <code>{legacy ? legacyFields[name] : name}</code>
                <span>
                  {check ? (
                    <>
                      <Check failed={!check.passed} />
                      {check.passed ? "equal" : "differs"}
                    </>
                  ) : (
                    "not checked"
                  )}
                </span>
              </div>
            );
          })}
          <h4>Built with</h4>
          <p className="diff-stack">{project.stack.join(" / ")}</p>
        </aside>
      </div>
    </article>
  );
}

function Sheet({
  legacy = false,
  seam,
  selected,
  results,
  running,
  mismatch,
  reduced,
  onSelect,
}: SheetProps) {
  const [cvRequested, setCvRequested] = useState(false);
  const checked = results.filter((result) => result.passed).length;
  return (
    <div
      className={`diff-sheet ${legacy ? "diff-legacy" : "diff-current"}`}
      aria-hidden={legacy || undefined}
      inert={legacy || undefined}
    >
      <header className="diff-identity">
        <a href="/drafts" aria-label="Gentrit Rashiti, all art directions">
          <span className="diff-identity-mark" aria-hidden="true">
            g/r
          </span>
          Gentrit Rashiti
        </a>
        <span className="diff-location">Kosovo · Remote</span>
        <nav aria-label="Contact">
          <a
            href={links.cv}
            download
            onClick={() => setCvRequested(true)}
            aria-label={cvRequested ? "CV download requested" : "Download CV"}
          >
            {cvRequested ? "Requested" : "CV"}
          </a>
          <a href={`mailto:${links.email}`}>
            Email
            <Arrow />
          </a>
        </nav>
      </header>

      <div className="diff-version-line">
        <span>{legacy ? "v1 / legacy" : "28 project pairs"}</span>
        <span>Same work · two implementations</span>
        <span>{legacy ? "source model" : "v2 / current"}</span>
      </div>
      <section
        className="diff-intro"
        aria-label="Portfolio migration comparison"
      >
        <div className="diff-statement">
          <h1>
            Change the code.
            <br />
            <span>Keep the behaviour.</span>
          </h1>
          <p>Web and mobile products, rebuilt while people keep using them.</p>
        </div>
        <div className="diff-evidence">
          <button onClick={() => onSelect("care-platform")}>
            <strong>31</strong>
            <span>
              architecture decisions
              <br />
              <b>Care-platform rewrite</b>
            </span>
            <Arrow />
          </button>
          <button onClick={() => onSelect("care-api")}>
            <strong>
              16<span>→</span>2
            </strong>
            <span>
              queries in one billing report
              <br />
              <b>Care-management API</b>
            </span>
            <Arrow />
          </button>
          <button onClick={() => onSelect("bayyinah-tv")}>
            <strong>34</strong>
            <span>
              routes rebuilt in Nuxt 3<br />
              <b>Bayyinah TV</b>
            </span>
            <Arrow />
          </button>
        </div>
      </section>

      <div className="diff-explanation">
        <p>
          <strong>A migration, in miniature.</strong> Drag the seam to compare.
          Open a project to see the work.
        </p>
        <p>
          28 portfolio projects · local parity model
          <br />
          <span>These are not 28 care-platform routes.</span>
        </p>
      </div>

      <section className="diff-projects" aria-label="Compare all 28 projects">
        <div className="diff-table-heading">
          <span>Pair</span>
          <span>Project / what changed</span>
          <span>Year</span>
          <span>Parity</span>
        </div>
        {projects.map((project, index) => {
          const result = results.find((item) => item.slug === project.slug);
          const migrated = result
            ? result.passed
            : 100 - seam >= ((index + 1) / count) * 100;
          const opened = selected === project.slug;
          const title =
            legacy && mismatch && index === mismatchIndex
              ? "Missing title — test fixture"
              : project.name;
          return (
            <motion.div
              className="diff-project"
              layout
              layoutId={`${legacy ? "legacy" : "current"}-diff-project-${project.slug}`}
              transition={reduced ? { duration: 0.01 } : spring.ui}
              data-open={opened}
              data-checked={!!result}
              data-failed={result?.passed === false}
              key={project.slug}
              id={legacy ? undefined : `diff-row-${project.slug}`}
            >
              <button
                className="diff-project-trigger"
                type="button"
                aria-expanded={opened}
                aria-controls={legacy ? undefined : `diff-case-${project.slug}`}
                aria-label={`${opened ? "Close" : "Open"} ${project.name}. ${result ? (result.passed ? "Parity passed." : "Parity differs.") : "Parity not yet checked."}`}
                onClick={() => onSelect(opened ? null : project.slug)}
              >
                <span className="diff-row-turn" data-migrated={migrated}>
                  {[false, true].map((back) => (
                    <span
                      className={`diff-row-face ${back ? "diff-row-back" : "diff-row-front"}`}
                      key={String(back)}
                      aria-hidden="true"
                    >
                      <span className="diff-row-number">
                        {number(index + 1)}
                      </span>
                      <span className="diff-row-copy">
                        <strong>{title}</strong>
                        <span>{project.line}</span>
                      </span>
                      <span className="diff-row-year">
                        {project.years ?? "—"}
                      </span>
                      <span
                        className="diff-row-status"
                        data-failed={result?.passed === false}
                      >
                        {result ? (
                          <>
                            <Check failed={!result.passed} />
                            <span>{result.passed ? "equal" : "differs"}</span>
                          </>
                        ) : (
                          <>
                            <span className="diff-pending-dot" />
                            <span>
                              {running && results.length === index
                                ? "checking"
                                : back
                                  ? "v2"
                                  : "v1"}
                            </span>
                          </>
                        )}
                        <svg className="diff-open-mark" viewBox="0 0 20 20">
                          <path d={opened ? "M4 10h12" : "M4 10h12M10 4v12"} />
                        </svg>
                      </span>
                    </span>
                  ))}
                </span>
              </button>
              <AnimatePresence initial={false}>
                {opened && (
                  <motion.div
                    key="case"
                    initial={{
                      height: 0,
                      opacity: 0,
                      y: reduced ? 0 : 8,
                      filter: reduced ? "blur(0px)" : "blur(4px)",
                    }}
                    animate={{
                      height: "auto",
                      opacity: 1,
                      y: 0,
                      filter: "blur(0px)",
                    }}
                    exit={{
                      height: 0,
                      opacity: 0,
                      y: reduced ? 0 : 8,
                      filter: reduced ? "blur(0px)" : "blur(4px)",
                    }}
                    transition={{
                      duration: reduced ? 0.01 : dur.panel,
                      ease: ease.sheet,
                    }}
                    style={{ overflow: "hidden" }}
                    id={legacy ? undefined : `diff-case-${project.slug}`}
                    className="diff-case"
                    role="region"
                    aria-label={`${project.name} details`}
                    tabIndex={legacy ? undefined : -1}
                  >
                    <Detail
                      project={project}
                      result={result}
                      legacy={legacy}
                      onClose={() => onSelect(null)}
                      reduced={reduced}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </section>

      <section className="diff-about" aria-label="About and contact">
        <div>
          <h2>Gentrit Rashiti</h2>
          <p>
            Frontend and mobile developer.
            <br />
            Full stack since 2026.
          </p>
        </div>
        <div>
          <p>
            5+ years, from first screen to release. Healthcare, video streaming,
            reading, Web3 and personal projects.
          </p>
          <p>
            Bachelor’s degree · UBT
            <br />
            Based in Kosovo, working remotely.
          </p>
        </div>
        <nav aria-label="Profile links">
          <a href={`mailto:${links.email}`}>
            {links.email}
            <Arrow />
          </a>
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <Arrow />
          </a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
            <Arrow />
          </a>
          <a
            href={links.cv}
            download
            onClick={() => setCvRequested(true)}
            aria-live="polite"
          >
            {cvRequested ? "CV download requested" : "Download CV"}
            <Arrow />
          </a>
        </nav>
      </section>
      <footer className="diff-footer">
        <a href="/drafts">
          All art directions
          <Arrow back />
        </a>
        <span>
          {checked}/{count} project pairs checked · {count * 5} field
          comparisons
        </span>
      </footer>
    </div>
  );
}

export default function Draft() {
  const root = useRef<HTMLDivElement>(null);
  const [seam, setSeam] = useState(38);
  const seamMotion = useMotionValue(38);
  const [manual, setManual] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<ParityResult[]>([]);
  const [running, setRunning] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [discover, setDiscover] = useState(true);
  const drag = useRef(false);
  const dragSample = useRef({ value: 38, time: 0, velocity: 0 });
  const selectedRef = useRef<string | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const runId = useRef(0);
  const passed = results.filter((result) => result.passed).length;
  const failed = results.some((result) => !result.passed);

  useEffect(() => {
    const unsubscribe = seamMotion.on("change", setSeam);
    return () => {
      unsubscribe();
      seamMotion.stop();
    };
  }, [seamMotion]);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update();
    preference.addEventListener("change", update);
    const discoveryTimer = setTimeout(() => setDiscover(false), 1300);
    return () => {
      preference.removeEventListener("change", update);
      clearTimeout(discoveryTimer);
      // The current timer is deliberately read at unmount, not the one from mount.
      clearTimeout(timer.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      runId.current++;
    };
  }, []);

  const stop = useCallback(() => {
    runId.current++;
    clearTimeout(timer.current);
    setRunning(false);
    seamMotion.stop();
  }, [seamMotion]);

  const select = useCallback(
    (slug: string | null) => {
      const previous = selectedRef.current;
      selectedRef.current = slug;
      if (slug && document.activeElement instanceof HTMLButtonElement)
        returnFocus.current = document.activeElement;
      const change = () => flushSync(() => setSelected(slug));
      const focusSelection = () =>
        requestAnimationFrame(() => {
          if (slug) {
            const row = document.getElementById(`diff-row-${slug}`);
            row?.scrollIntoView({
              block: "start",
              behavior: reduced ? "instant" : "smooth",
            });
            document
              .getElementById(`diff-case-${slug}`)
              ?.focus({ preventScroll: true });
          } else if (previous) {
            const trigger = document.querySelector<HTMLButtonElement>(
              `#diff-row-${previous} .diff-project-trigger`,
            );
            (trigger ?? returnFocus.current)?.focus({ preventScroll: true });
          }
        });
      change();
      focusSelection();
    },
    [reduced],
  );

  const runParity = useCallback(() => {
    if (running) {
      stop();
      return;
    }
    stop();
    const id = runId.current;
    setManual(true);
    setResults([]);
    seamMotion.jump(100);
    setRunning(true);
    let index = 0;
    const next = () => {
      if (id !== runId.current) return;
      const result = checkParity(
        legacyProjects[index],
        projects[index],
        mismatch && index === mismatchIndex,
      );
      setResults((previous) => [...previous, result]);
      index++;
      seamMotion.jump(100 - (index / count) * 100);
      if (index === count) {
        setRunning(false);
        return;
      }
      timer.current = setTimeout(next, reduced ? 24 : 155);
    };
    timer.current = setTimeout(next, reduced ? 0 : 220);
  }, [mismatch, reduced, running, stop, seamMotion]);

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        (event.target instanceof HTMLElement &&
          (event.target.matches("input, textarea, select") ||
            event.target.isContentEditable))
      )
        return;
      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        runParity();
      }
      if (event.key === "Escape" && selectedRef.current) {
        event.preventDefault();
        select(null);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [runParity, select]);

  function changeSeam(value: number, settle = false) {
    stop();
    setManual(true);
    const next = Math.max(0, Math.min(100, value));
    if (settle)
      animate(seamMotion, next, reduced ? { duration: 0.01 } : spring.ui);
    else seamMotion.set(next);
  }

  function movePointer(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !root.current) return;
    const box = root.current.getBoundingClientRect();
    const value = ((event.clientX - box.left) / box.width) * 100;
    const sample = dragSample.current;
    const dt = event.timeStamp - sample.time;
    if (dt > 0 && dt < 100)
      sample.velocity =
        ((0.7 * (value - sample.value)) / dt) * 1000 + 0.3 * sample.velocity;
    else sample.velocity = 0;
    sample.time = event.timeStamp;
    sample.value = value;
    changeSeam(value);
  }

  function releaseSeam(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    drag.current = false;
    const sample = dragSample.current;
    const velocity = event.timeStamp - sample.time > 100 ? 0 : sample.velocity;
    const target = Math.max(
      0,
      Math.min(100, Math.round((seamMotion.get() + velocity * 0.2) / 5) * 5),
    );
    animate(
      seamMotion,
      target,
      reduced ? { duration: 0.01 } : { ...spring.ui, velocity },
    );
  }

  function seamKey(event: KeyboardEvent<HTMLDivElement>) {
    let value = seam;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown")
      value -= event.shiftKey ? 10 : 2;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp")
      value += event.shiftKey ? 10 : 2;
    else if (event.key === "Home") value = 0;
    else if (event.key === "End") value = 100;
    else return;
    event.preventDefault();
    changeSeam(value, true);
  }

  const sheetProps = {
    seam,
    selected,
    results,
    running,
    mismatch,
    reduced,
    onSelect: select,
  };
  return (
    <div
      className="draft-diff"
      ref={root}
      data-manual={manual}
      data-discover={discover && !reduced}
      data-running={running}
      style={{ "--diff-position": `${seam}%` } as CSSProperties}
    >
      <title>DIFF — Gentrit Rashiti</title>
      <LayoutGroup id="diff">
        <a className="diff-skip" href="#diff-project-list">
          Skip to projects
        </a>
        <main id="diff-project-list" className="diff-documents">
          <Sheet {...sheetProps} />
          <Sheet {...sheetProps} legacy />
        </main>
        <div className="diff-seam" aria-hidden="true" />
        <div
          className="diff-seam-control"
          role="slider"
          tabIndex={0}
          aria-label="Migration seam. Move between the legacy and current portfolio."
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(seam)}
          aria-valuetext={`${Math.round(seam)} percent legacy, ${Math.round(100 - seam)} percent current`}
          aria-orientation="horizontal"
          aria-describedby="diff-seam-help"
          onFocus={() => setManual(true)}
          onKeyDown={seamKey}
          onPointerDown={(event) => {
            drag.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            movePointer(event);
          }}
          onPointerMove={movePointer}
          onPointerUp={releaseSeam}
          onPointerCancel={() => {
            drag.current = false;
          }}
          onLostPointerCapture={() => {
            drag.current = false;
          }}
        >
          <motion.span
            aria-hidden="true"
            whileHover={{ scale: reduced ? 1 : 1.07 }}
            whileTap={{
              scale: reduced ? 1 : 0.96,
              rotateX: reduced ? 0 : -7.5,
            }}
            transition={reduced ? { duration: 0.01 } : spring.ui}
          >
            <svg viewBox="0 0 30 18">
              <path d="m8 4-5 5 5 5M22 4l5 5-5 5M12 3v12M18 3v12" />
            </svg>
          </motion.span>
          <b aria-hidden="true">drag</b>
        </div>

        <aside className="diff-runner" aria-label="Portfolio parity controls">
          <div className="diff-runner-top">
            <button type="button" className="diff-run" onClick={runParity}>
              <span className="diff-run-symbol" aria-hidden="true">
                <svg viewBox="0 0 12 14">
                  <path
                    d={running ? "M2 1h3v12H2ZM8 1h3v12H8Z" : "M2 1l9 6-9 6Z"}
                  />
                </svg>
              </span>
              {running
                ? "Pause parity"
                : results.length === count
                  ? "Run again"
                  : "Run parity"}
              <kbd>P</kbd>
            </button>
            <p className="diff-result" aria-live="polite" aria-atomic="true">
              {running
                ? `Checking ${number(Math.min(results.length + 1, count))}/${count}`
                : results.length === count
                  ? failed
                    ? `${passed}/${count} equal · 1 blocked`
                    : `${count}/${count} equal`
                  : results.length
                    ? `${passed}/${count} equal · paused`
                    : `${count} project pairs`}
              <span>
                {running
                  ? "Comparing five fields per project"
                  : results.length === count
                    ? failed
                      ? "The missing title prevents parity."
                      : "140 field comparisons passed."
                    : "Recreation · local data comparison"}
              </span>
            </p>
            <button
              type="button"
              className="diff-mismatch"
              aria-pressed={mismatch}
              onClick={() => {
                stop();
                setMismatch(!mismatch);
                setResults([]);
              }}
            >
              {mismatch ? "Restore title" : "Test a mismatch"}
              <span>
                {mismatch
                  ? "Demo mismatch is active"
                  : "See a parity gate catch it"}
              </span>
            </button>
            <button
              type="button"
              className="diff-reset"
              onClick={() => changeSeam(38)}
            >
              Compare<span>v1 / v2</span>
            </button>
          </div>
          <div
            className="diff-parity-strip"
            aria-label="Jump to a project pair"
          >
            {projects.map((project, index) => {
              const result = results.find((item) => item.slug === project.slug);
              return (
                <button
                  key={project.slug}
                  type="button"
                  data-state={
                    result
                      ? result.passed
                        ? "pass"
                        : "fail"
                      : running && results.length === index
                        ? "active"
                        : "pending"
                  }
                  data-selected={selected === project.slug}
                  onClick={() => select(project.slug)}
                  aria-label={`Open project ${index + 1}: ${project.name}${result ? (result.passed ? ", parity equal" : ", parity differs") : ""}`}
                  title={project.name}
                >
                  <span>{number(index + 1)}</span>
                  {result ? (
                    <Check failed={!result.passed} />
                  ) : (
                    <span className="diff-strip-dash" />
                  )}
                </button>
              );
            })}
          </div>
          <p id="diff-seam-help" className="diff-runner-help">
            <span>
              Drag the seam · arrows adjust · P runs parity · Esc returns
            </span>
            <span>Swipe 28 pairs below · tap one to open it</span>
            <span>Legacy and current contain the same work.</span>
          </p>
        </aside>
      </LayoutGroup>
    </div>
  );
}
