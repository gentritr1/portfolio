import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue } from "motion/react";
import { projects, type Project } from "../../content/projects";
import { caseNarratives } from "../../content/caseNarratives";
import { links } from "../../content/links";
import {
  checkParity,
  driftedTitle,
  legacyProjects,
  type ParityResult,
} from "./parity";
import { dur, ease, spring } from "./motion";
import CareFile from "./CareFile";
import { CropShot } from "../../components/CropShot";
import { careShots, dsShots, REAL_SCREENS, type ScreenShot } from "../../content/careShots";
import "./diff.css";

type Version = "v1" | "v2";

const count = projects.length;
const mismatchIndex = 1;
const restLine = 39.2857;
const number = (value: number) => String(value).padStart(2, "0");
const restOf = (phone: boolean) => (phone ? 0 : restLine);
const stepPos = (step: number, rest: number) =>
  100 - (step / count) * (100 - rest);
const stepOf = (seam: number, rest: number) =>
  Math.max(
    0,
    Math.min(count, Math.floor(((100 - seam) / (100 - rest)) * count + 1e-4)),
  );
const stops = (rest: number) => {
  const list = Array.from({ length: count + 1 }, (_, step) =>
    stepPos(step, rest),
  );
  return rest > 0 ? [...list, 0] : list;
};
const nearestStop = (seam: number, rest: number) => {
  const list = stops(rest);
  let best = 0;
  list.forEach((value, index) => {
    if (Math.abs(value - seam) < Math.abs(list[best] - seam)) best = index;
  });
  return { index: best, list };
};
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const legacyFields = {
  title: "project_title",
  description: "description",
  role: "project_role",
  technologies: "technologies",
  links: "public_links",
};
const evidence = [
  {
    slug: "care-platform",
    from: 0,
    to: 31,
    label: "architecture decision records",
    project: "Care-platform rewrite",
  },
  {
    slug: "care-api",
    from: 16,
    to: 2,
    label: "queries in one billing report",
    project: "Care-management API",
  },
  {
    slug: "bayyinah-tv",
    from: 0,
    to: 34,
    label: "routes rebuilt in Nuxt 3",
    project: "Bayyinah TV",
  },
] as const;

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

function Layers({
  className,
  children,
}: {
  className: string;
  children: (version: Version) => ReactNode;
}) {
  return (
    <div className={`diff-band ${className}`}>
      <div className="diff-face diff-face-v2">{children("v2")}</div>
      <div className="diff-face diff-face-v1" aria-hidden="true">
        {children("v1")}
      </div>
    </div>
  );
}

function Count({
  from,
  to,
  delay,
  runKey,
  reduced,
}: {
  from: number;
  to: number;
  delay: number;
  runKey: number;
  reduced: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (reduced) {
      element.textContent = String(to);
      return;
    }
    element.textContent = String(from);
    const controls = animate(from, to, {
      duration: 0.6,
      delay,
      ease: "linear",
      onUpdate: (value) => {
        element.textContent = String(Math.round(value));
      },
    });
    return () => controls.stop();
  }, [from, to, delay, runKey, reduced]);
  return <span ref={ref}>{reduced ? to : from}</span>;
}

/** Real product screens of the private work, captured on invented data. */
const realScreens: Record<string, ScreenShot> = {
  "care-platform": careShots.claimsRows,
  "design-system-react": dsShots.buttonAlert,
};

function Detail({
  project,
  result,
  version,
  onClose,
  reduced,
}: {
  project: Project;
  result?: ParityResult;
  version: Version;
  onClose: () => void;
  reduced: boolean;
}) {
  const story = caseNarratives[project.slug];
  const screen = realScreens[project.slug];
  const legacy = version === "v1";
  const focus = legacy ? -1 : undefined;
  const gallery =
    project.channel === "healthcare" ? undefined : project.media.galleries?.[0];
  const shot =
    project.channel === "healthcare" || gallery
      ? undefined
      : project.media.shot;
  const fields = (
    ["title", "description", "role", "technologies", "links"] as const
  ).map((name) => ({
    name,
    check: result?.fields.find((field) => field.name === name),
  }));

  if (legacy)
    return (
      <article className="diff-detail">
        <p className="diff-detail-meta">
          {project.group} | {project.years ?? "Freelance"} | {project.role}
        </p>
        <h3>{project.name}</h3>
        <p>{story?.story.product ?? project.summary}</p>
        {story && <p>{story.story.built}</p>}
        {story && <p>{story.story.result}</p>}
        <table>
          <tbody>
            {fields.map(({ name, check }) => (
              <tr key={name}>
                <td>{legacyFields[name]}</td>
                <td>{check ? (check.passed ? "OK" : "FAIL") : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Technologies: {project.stack.join(", ")}</p>
        <p>
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              tabIndex={focus}
            >
              {link.label}
            </a>
          ))}
          <button type="button" onClick={onClose} tabIndex={focus}>
            Close
          </button>
        </p>
      </article>
    );

  return (
    <article
      className="diff-detail"
      aria-label={`${project.name} project details`}
    >
      <div className="diff-detail-top diff-grid">
        <span className="diff-meta">
          {project.group} · {project.years ?? "Freelance"}
        </span>
        <span>{project.role}</span>
        <button type="button" onClick={onClose}>
          <Arrow back /> Close
        </button>
      </div>
      <div className="diff-detail-body diff-grid">
        <div className="diff-story">
          <h3>{project.kind}</h3>
          <p>{story?.story.product ?? project.summary}</p>
          {project.slug === "care-platform" && <CareFile reduced={reduced} />}
          {story && <p>{story.story.built}</p>}
          {story && <p>{story.story.result}</p>}
          {gallery && (
            <div
              className="diff-shots"
              data-aspect={gallery.aspect}
              aria-label={`${project.name} ${gallery.title.toLowerCase()}`}
            >
              {gallery.items.slice(0, 3).map((item) => (
                <img
                  key={item.src}
                  src={item.src}
                  alt={item.alt}
                  width={item.width}
                  height={item.height}
                  loading="lazy"
                />
              ))}
            </div>
          )}
          {shot && (
            <img
              className="diff-shot"
              src={shot.src}
              alt={shot.alt}
              width={256}
              height={160}
              loading="lazy"
            />
          )}
          {screen ? (
            <figure className="diff-screen">
              <CropShot shot={screen} />
              <figcaption className="diff-disclosure">{REAL_SCREENS}</figcaption>
            </figure>
          ) : (
            project.channel === "healthcare" && (
              <p className="diff-disclosure">
                No patient information or care-platform screens are shown.
              </p>
            )
          )}
          {project.links.length > 0 && (
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
          )}
        </div>
        <aside className="diff-detail-data diff-meta">
          <div className="diff-field-heading">
            <span>Field · v1 → v2</span>
            <span>Parity</span>
          </div>
          {fields.map(({ name, check }) => (
            <div
              className="diff-field"
              key={name}
              data-failed={check?.passed === false}
            >
              <code>
                <s>{legacyFields[name]}</s> {name}
              </code>
              <span>
                {check ? (
                  <>
                    <Check failed={!check.passed} />
                    {check.passed ? "equal" : "differs"}
                  </>
                ) : (
                  "not run"
                )}
              </span>
            </div>
          ))}
          <p className="diff-stack">{project.stack.join(" / ")}</p>
        </aside>
      </div>
    </article>
  );
}

function RowFace({
  project,
  index,
  version,
  result,
  status,
  failedTitle,
  frontier,
  mismatch,
}: {
  project: Project;
  index: number;
  version: Version;
  result?: ParityResult;
  status: string;
  failedTitle: boolean;
  frontier: boolean;
  mismatch: boolean;
}) {
  const drifted = mismatch && index === mismatchIndex && version === "v1";
  const title = drifted ? driftedTitle(project.name) : project.name;
  if (version === "v1")
    return (
      <span className="diff-v1-row" data-failed={failedTitle}>
        <span>{index + 1}</span>
        <span>
          <u>{title}</u>
        </span>
        <span>{project.line}</span>
        <span>
          {frontier ? "−" : result ? (result.passed ? "OK" : "FAIL") : status}
        </span>
      </span>
    );
  return (
    <span className="diff-v2-row diff-grid">
      <span className="diff-meta diff-row-meta">
        <span>{number(index + 1)}</span>
        <span>{project.kind}</span>
        <span>{project.years ?? "—"}</span>
      </span>
      <span className="diff-row-copy">
        <strong>{title}</strong>
        <span>{project.line}</span>
      </span>
      <span className="diff-row-status" data-failed={result?.passed === false}>
        {frontier ? (
          <b>+</b>
        ) : result ? (
          <>
            <Check failed={!result.passed} />
            {result.passed ? "equal" : "differs"}
          </>
        ) : (
          <span className="diff-muted">
            {status === "checking" ? "checking" : "not run"}
          </span>
        )}
        <Arrow />
      </span>
    </span>
  );
}

export default function Draft() {
  const root = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [phone, setPhone] = useState(
    () => matchMedia("(max-width: 700px)").matches,
  );
  const seamMotion = useMotionValue(100);
  const lean = useMotionValue(0);
  const shakeX = useMotionValue(0);
  const tally = useMotionValue(1);
  const flash = useMotionValue(0);
  const [step, setStep] = useState(0);
  const [flip, setFlip] = useState({ step: 0, from: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [results, setResults] = useState<ParityResult[]>([]);
  const [running, setRunning] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [near, setNear] = useState(false);
  const [countKey, setCountKey] = useState(0);
  const drag = useRef({ on: false, offset: 0, value: 0, time: 0, velocity: 0 });
  const nearRef = useRef(false);
  const selectedRef = useRef<string | null>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const runId = useRef(0);
  const target = useRef(0);
  const passed = results.filter((result) => result.passed).length;
  const failedAt = results.findIndex((result) => !result.passed);
  const rest = restOf(phone);
  const restRef = useRef(rest);
  restRef.current = rest;

  if (flip.step !== step) setFlip({ step, from: flip.step });
  const flipGap = Math.min(24, 260 / Math.max(1, Math.abs(step - flip.from)));

  useLayoutEffect(() => {
    const apply = (value: number) => {
      root.current?.style.setProperty("--diff-position", `${value}%`);
      setStep(stepOf(value, restRef.current));
    };
    const unsubscribe = seamMotion.on("change", apply);
    const target = restRef.current;
    let controls: ReturnType<typeof animate> | undefined;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      seamMotion.jump(target);
      apply(target);
    } else {
      apply(100);
      controls = animate(seamMotion, target, {
        duration: dur.story,
        delay: 0.15,
        ease: ease.story,
      });
    }
    return () => {
      unsubscribe();
      controls?.stop();
      seamMotion.stop();
    };
  }, [seamMotion]);

  useEffect(() => {
    const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
    const phoneQuery = matchMedia("(max-width: 700px)");
    const update = () => {
      setReduced(motionQuery.matches);
      setPhone(phoneQuery.matches);
    };
    motionQuery.addEventListener("change", update);
    phoneQuery.addEventListener("change", update);
    return () => {
      motionQuery.removeEventListener("change", update);
      phoneQuery.removeEventListener("change", update);
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

  const settle = useCallback(
    (value: number, velocity = 0) => {
      target.current = clamp(value, 0, 100);
      return animate(
        seamMotion,
        target.current,
        reduced ? { duration: 0.01 } : { ...spring.ui, velocity },
      );
    },
    [reduced, seamMotion],
  );

  const select = useCallback(
    (slug: string | null) => {
      const previous = selectedRef.current;
      selectedRef.current = slug;
      if (slug && document.activeElement instanceof HTMLButtonElement)
        returnFocus.current = document.activeElement;
      flushSync(() => setSelected(slug));
      requestAnimationFrame(() => {
        if (slug) {
          document.getElementById(`diff-row-${slug}`)?.scrollIntoView({
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
    },
    [reduced],
  );

  const run = useCallback(
    (withMismatch: boolean) => {
      stop();
      const id = runId.current;
      setResults([]);
      setRunning(true);
      const check = (index: number) => {
        if (id !== runId.current) return;
        const result = checkParity(
          legacyProjects[index],
          projects[index],
          withMismatch && index === mismatchIndex,
        );
        setResults((previous) => [...previous, result]);
        if (!result.passed) {
          setRunning(false);
          if (!reduced)
            animate(shakeX, [0, -3, 3, -3, 3, -3, 3, 0], {
              duration: 0.42,
              ease: ease.out,
            });
          return;
        }
        const next = stepPos(index + 1, restRef.current);
        if (reduced) seamMotion.jump(next);
        else animate(seamMotion, next, { duration: 0.09, ease: ease.out });
        if (index + 1 === count) {
          timer.current = setTimeout(
            () => {
              if (id !== runId.current) return;
              setRunning(false);
              setCountKey((key) => key + 1);
              if (reduced) return;
              animate(flash, [0, 1, 0], {
                duration: 0.18,
                ease: "linear",
                times: [0, 0.2, 1],
              });
              tally.jump(1.22);
              animate(tally, 1, spring.play);
            },
            reduced ? 0 : 160,
          );
          return;
        }
        timer.current = setTimeout(() => check(index + 1), reduced ? 30 : 140);
      };
      if (reduced) {
        seamMotion.jump(100);
        timer.current = setTimeout(() => check(0), 30);
      } else {
        animate(seamMotion, 100, { duration: dur.panel, ease: ease.sheet });
        timer.current = setTimeout(() => check(0), 420);
      }
    },
    [flash, reduced, seamMotion, shakeX, stop, tally],
  );

  const runParity = useCallback(() => {
    if (running) stop();
    else run(mismatch);
  }, [mismatch, run, running, stop]);

  const toggleMismatch = () => {
    if (mismatch) {
      stop();
      setMismatch(false);
      setResults([]);
      settle(rest);
    } else {
      setMismatch(true);
      run(true);
    }
  };

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

  const pointerPercent = (clientX: number) => {
    const box = root.current?.getBoundingClientRect();
    return box ? ((clientX - box.left) / box.width) * 100 : 0;
  };

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    stop();
    event.currentTarget.setPointerCapture(event.pointerId);
    const value = seamMotion.get();
    drag.current = {
      on: true,
      offset: pointerPercent(event.clientX) - value,
      value,
      time: event.timeStamp,
      velocity: 0,
    };
    setDragging(true);
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const state = drag.current;
    if (!state.on) return;
    const value = clamp(pointerPercent(event.clientX) - state.offset, 0, 100);
    const dt = event.timeStamp - state.time;
    state.velocity =
      dt > 0 && dt < 100
        ? ((0.7 * (value - state.value)) / dt) * 1000 + 0.3 * state.velocity
        : 0;
    state.time = event.timeStamp;
    state.value = value;
    seamMotion.set(value);
    if (!reduced) lean.set(clamp(state.velocity * 0.05, -9, 9));
  }

  function endDrag(event: PointerEvent<HTMLElement>) {
    const state = drag.current;
    if (!state.on) return;
    state.on = false;
    setDragging(false);
    const velocity = event.timeStamp - state.time > 100 ? 0 : state.velocity;
    const predicted = seamMotion.get() + velocity * 0.2;
    const { index, list } = nearestStop(predicted, rest);
    settle(list[index], velocity);
    animate(lean, 0, reduced ? { duration: 0.01 } : spring.ui);
  }

  function cancelDrag() {
    if (!drag.current.on) return;
    drag.current.on = false;
    setDragging(false);
    const { index, list } = nearestStop(seamMotion.get(), rest);
    settle(list[index]);
    animate(lean, 0, reduced ? { duration: 0.01 } : spring.ui);
  }

  function seamKey(event: KeyboardEvent<HTMLDivElement>) {
    const { index: current, list } = nearestStop(
      seamMotion.isAnimating() ? target.current : seamMotion.get(),
      rest,
    );
    const jump = event.shiftKey ? 4 : 1;
    let next: number;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown")
      next = current + jump;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp")
      next = current - jump;
    else if (event.key === "Home") next = list.length - 1;
    else if (event.key === "End") next = 0;
    else return;
    event.preventDefault();
    stop();
    settle(list[clamp(next, 0, list.length - 1)]);
  }

  function trackNear(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || phone) return;
    const box = root.current?.getBoundingClientRect();
    if (!box) return;
    const x = box.left + (box.width * seamMotion.get()) / 100;
    const next = Math.abs(event.clientX - x) < 24;
    if (next !== nearRef.current) {
      nearRef.current = next;
      setNear(next);
    }
  }

  const side: Version = step >= count / 2 ? "v2" : "v1";
  const statusText = running
    ? `Checking pair ${number(Math.min(results.length + 1, count))} of ${count}.`
    : failedAt >= 0
      ? `Parity blocked at pair ${number(failedAt + 1)}: the title differs.`
      : results.length === count
        ? `${count} of ${count} pairs equal.`
        : "";

  return (
    <div
      className="draft-diff"
      ref={root}
      data-near={near || dragging}
      data-dragging={dragging}
      data-running={running}
      onPointerMove={trackNear}
      onPointerLeave={() => {
        nearRef.current = false;
        setNear(false);
      }}
    >
      <title>DIFF — Gentrit Rashiti</title>
      <a className="diff-skip" href="#diff-project-list">
        Skip to projects
      </a>

      <Layers className="diff-head">
        {(version) =>
          version === "v2" ? (
            <header className="diff-commit diff-grid">
              <span className="diff-meta" />
              <div>
                <a
                  href="/drafts"
                  aria-label="Gentrit Rashiti, all art directions"
                >
                  <i aria-hidden="true" />
                  gentrit-rashiti
                </a>
                <span>· {count} pairs</span>
                <span className="diff-commit-sep">·</span>
                <b>v2</b>
              </div>
              <nav aria-label="Contact">
                <a href={links.cv} download>
                  cv.pdf ↓
                </a>
                <a href={`mailto:${links.email}`}>email ↗</a>
              </nav>
            </header>
          ) : (
            <header className="diff-v1-head">
              <strong>Gentrit Rashiti</strong>
              <span>Portfolio</span>
              <nav>
                <a href="#diff-project-list" tabIndex={-1}>
                  Projects
                </a>
                <a href={links.cv} download tabIndex={-1}>
                  CV
                </a>
                <a href={`mailto:${links.email}`} tabIndex={-1}>
                  Contact
                </a>
              </nav>
            </header>
          )
        }
      </Layers>

      <Layers className="diff-statement">
        {(version) =>
          version === "v2" ? (
            <section className="diff-grid" aria-labelledby="diff-title">
              <p className="diff-meta">
                Web and mobile products, rebuilt while people keep using them.
              </p>
              <h1 id="diff-title">
                <span>Change the code.</span>
                <span>
                  <mark>Keep the behaviour.</mark>
                </span>
              </h1>
            </section>
          ) : (
            <section>
              <h1>Change the code. Keep the behaviour.</h1>
              <p>
                Web and mobile products, rebuilt while people keep using them.
              </p>
            </section>
          )
        }
      </Layers>

      <Layers className="diff-numbers">
        {(version) =>
          version === "v2" ? (
            <div className="diff-evidence diff-grid">
              <span className="diff-meta" />
              <div>
                {evidence.map((item, index) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => select(item.slug)}
                  >
                    <strong>
                      {item.slug === "care-api" ? (
                        <>
                          16<em>→</em>
                          <Count
                            from={16}
                            to={2}
                            delay={countKey ? 0 : 0.5 + index * 0.08}
                            runKey={countKey}
                            reduced={reduced}
                          />
                        </>
                      ) : (
                        <Count
                          from={item.from}
                          to={item.to}
                          delay={countKey ? 0 : 0.5 + index * 0.08}
                          runKey={countKey}
                          reduced={reduced}
                        />
                      )}
                    </strong>
                    <span>
                      {item.label}
                      <small>
                        {item.project}
                        <Arrow />
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <table className="diff-v1-table">
              <tbody>
                {evidence.map((item) => (
                  <tr key={item.slug}>
                    <td>{item.slug === "care-api" ? "16 → 2" : item.to}</td>
                    <td>{item.label}</td>
                    <td>
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => select(item.slug)}
                      >
                        {item.project}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </Layers>

      <main id="diff-project-list" className="diff-projects">
        <Layers className="diff-table-head">
          {(version) =>
            version === "v2" ? (
              <>
                <h2 className="diff-sr">{count} project pairs</h2>
                <div className="diff-v2-head-row diff-grid" aria-hidden="true">
                  <span className="diff-meta">Pair · kind · year</span>
                  <span>Project / what changed</span>
                  <span>Parity</span>
                </div>
              </>
            ) : (
              <span className="diff-v1-row diff-v1-th">
                <span>#</span>
                <span>Project</span>
                <span>Description</span>
                <span>Status</span>
              </span>
            )
          }
        </Layers>
        {projects.map((project, index) => {
          const result = results[index];
          const failed = result?.passed === false;
          const migrated = index < step && !failed;
          const opened = selected === project.slug;
          const frontier = dragging && index === step - 1;
          const status =
            running && results.length === index
              ? "checking"
              : migrated
                ? "v2"
                : "v1";
          const face = (version: Version) => (
            <RowFace
              project={project}
              index={index}
              version={version}
              result={result}
              status={status}
              failedTitle={failed}
              frontier={frontier}
              mismatch={mismatch}
            />
          );
          return (
            <div
              className="diff-project"
              data-open={opened}
              data-failed={failed}
              data-frontier={frontier}
              key={project.slug}
              id={`diff-row-${project.slug}`}
            >
              <button
                className="diff-project-trigger"
                type="button"
                aria-expanded={opened}
                aria-controls={`diff-case-${project.slug}`}
                aria-label={`${project.name}. ${project.line}. ${result ? (result.passed ? "Parity equal." : "Parity differs: the title changed.") : migrated ? "On v2." : "On v1."}`}
                onClick={() => select(opened ? null : project.slug)}
              >
                <span
                  className="diff-row-turn"
                  data-migrated={migrated}
                  style={{
                    transitionDelay: `${Math.round(Math.abs(index - flip.from) * flipGap)}ms`,
                  }}
                >
                  <span
                    className="diff-row-face diff-row-front"
                    aria-hidden="true"
                  >
                    {face("v1")}
                  </span>
                  <span
                    className="diff-row-face diff-row-back"
                    aria-hidden="true"
                  >
                    <span className="diff-band">
                      <span className="diff-face diff-face-v2">
                        {face("v2")}
                      </span>
                      <span className="diff-face diff-face-v1">
                        {face("v1")}
                      </span>
                    </span>
                  </span>
                </span>
              </button>
              <AnimatePresence initial={false}>
                {opened && (
                  <motion.div
                    key="case"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{
                      duration: reduced ? 0.01 : dur.panel,
                      ease: ease.sheet,
                    }}
                    style={{ overflow: "hidden" }}
                    id={`diff-case-${project.slug}`}
                    className="diff-case"
                    role="region"
                    aria-label={`${project.name} details`}
                    tabIndex={-1}
                  >
                    <Layers className="diff-case-band">
                      {(version) => (
                        <Detail
                          project={project}
                          result={result}
                          version={version}
                          onClose={() => select(null)}
                          reduced={reduced}
                        />
                      )}
                    </Layers>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </main>

      <Layers className="diff-about">
        {(version) =>
          version === "v2" ? (
            <section className="diff-grid" aria-labelledby="diff-about-title">
              <div className="diff-meta">
                <h2 id="diff-about-title">Gentrit Rashiti</h2>
                <p>
                  Frontend and mobile developer.
                  <br />
                  Full stack since 2026.
                </p>
              </div>
              <div className="diff-about-body">
                <div>
                  <p>
                    5+ years, from first screen to release. Healthcare, video
                    streaming, reading, Web3 and personal projects.
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
                  <a href={links.cv} download>
                    Download CV
                    <Arrow />
                  </a>
                </nav>
              </div>
            </section>
          ) : (
            <section>
              <h2>About me</h2>
              <p>
                Gentrit Rashiti. Frontend and mobile developer, full stack since
                2026. 5+ years, from first screen to release. Bachelor’s degree,
                UBT. Based in Kosovo, working remotely.
              </p>
              <p>
                <a href={`mailto:${links.email}`} tabIndex={-1}>
                  {links.email}
                </a>{" "}
                |{" "}
                <a href={links.linkedin} tabIndex={-1}>
                  LinkedIn
                </a>{" "}
                |{" "}
                <a href={links.github} tabIndex={-1}>
                  GitHub
                </a>{" "}
                |{" "}
                <a href={links.cv} download tabIndex={-1}>
                  Download CV
                </a>
              </p>
            </section>
          )
        }
      </Layers>

      <Layers className="diff-foot">
        {(version) =>
          version === "v2" ? (
            <footer className="diff-grid">
              <a href="/drafts" className="diff-meta">
                <Arrow back />
                All art directions
              </a>
              <span>
                Recreation · {count} portfolio projects compared as a local data
                model · not care-platform routes
              </span>
            </footer>
          ) : (
            <footer>
              <a href="/drafts" tabIndex={-1}>
                Back
              </a>
            </footer>
          )
        }
      </Layers>

      <div className="diff-seam" aria-hidden="true" />
      <div
        className="diff-seam-zone"
        aria-hidden="true"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
      />
      <motion.div
        className="diff-handle"
        role="slider"
        tabIndex={0}
        aria-label="Migration seam"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(stepPos(step, rest))}
        aria-valuetext={`${step} of ${count} pairs on v2`}
        aria-orientation="horizontal"
        onKeyDown={seamKey}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={cancelDrag}
        style={{ x: shakeX }}
      >
        <motion.span
          className="diff-grip"
          aria-hidden="true"
          style={{ rotate: lean }}
          animate={{
            scale: reduced ? 1 : dragging ? 0.96 : near ? 1.07 : 1,
          }}
          transition={reduced ? { duration: 0.01 } : spring.ui}
        >
          <b data-side="v1">v1</b>
          <i />
          <b data-side="v2">v2</b>
        </motion.span>
      </motion.div>

      <div className="diff-switch" role="group" aria-label="Portfolio version">
        {(["v1", "v2"] as const).map((version) => (
          <button
            key={version}
            type="button"
            aria-pressed={side === version}
            onClick={() => {
              stop();
              animate(
                seamMotion,
                version === "v1" ? 100 : 0,
                reduced
                  ? { duration: 0.01 }
                  : { duration: dur.panel, ease: ease.sheet },
              );
            }}
          >
            {version}
          </button>
        ))}
        <i data-side={side} aria-hidden="true" />
      </div>

      <motion.div
        className="diff-flash"
        aria-hidden="true"
        style={{ opacity: flash }}
      />

      <motion.aside
        className="diff-runner"
        aria-label="Parity runner"
        initial={reduced ? false : { y: "100%" }}
        animate={{ y: 0 }}
        transition={{ delay: 0.9, duration: dur.panel, ease: ease.sheet }}
      >
        <button type="button" className="diff-run" onClick={runParity}>
          <svg viewBox="0 0 12 14" aria-hidden="true">
            <path d={running ? "M2 1h3v12H2ZM8 1h3v12H8Z" : "M2 1l9 6-9 6Z"} />
          </svg>
          <span>
            {running
              ? "Pause"
              : results.length === count
                ? "Run again"
                : "Run parity"}
          </span>
          <kbd aria-hidden="true">P</kbd>
        </button>
        <p className="diff-tally" data-failed={failedAt >= 0}>
          <motion.strong style={{ scale: tally }}>
            {number(passed)}/{count}
          </motion.strong>
          <span>
            {failedAt >= 0
              ? `blocked at ${number(failedAt + 1)}`
              : "pairs equal"}
          </span>
        </p>
        <div
          className="diff-bar"
          role="img"
          aria-label={`${passed} of ${count} pairs equal`}
        >
          {projects.map((project, index) => {
            const result = results[index];
            return (
              <span
                key={project.slug}
                data-state={
                  result
                    ? result.passed
                      ? "pass"
                      : "fail"
                    : running && results.length === index
                      ? "active"
                      : "pending"
                }
                data-name={`${number(index + 1)} ${project.name}`}
                data-edge={
                  index < 4 ? "start" : index > count - 5 ? "end" : undefined
                }
                onClick={() => select(project.slug)}
              />
            );
          })}
        </div>
        <button
          type="button"
          className="diff-mismatch"
          aria-pressed={mismatch}
          onClick={toggleMismatch}
        >
          <span aria-hidden="true">≠</span>
          <span>{mismatch ? "Restore title" : "Test a mismatch"}</span>
        </button>
        <p className="diff-sr" role="status">
          {statusText}
        </p>
      </motion.aside>
    </div>
  );
}
