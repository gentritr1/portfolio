import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
import {
  projectColour,
  projectFacts,
  projectYears,
  projectsAtYear,
  qualities,
  reelFrames,
  yearChapters,
  years,
  type Quality,
} from "./data";
import Reel from "./Reel";
import CareFile from "./CareFile";
import { dur, ease, spring } from "./motion";
import "./bitrate.css";

function Icon({
  name,
}: {
  name:
    | "play"
    | "pause"
    | "next"
    | "previous"
    | "arrow"
    | "lock"
    | "close"
    | "list";
}) {
  const paths = {
    play: "m7 4 13 8-13 8Z",
    pause: "M7 4v16M17 4v16",
    next: "m5 5 10 7-10 7ZM19 5v14",
    previous: "m19 5-10 7 10 7ZM5 5v14",
    arrow: "M4 12h15M13 6l6 6-6 6",
    lock: "M6 10h12v11H6ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3",
    close: "m6 6 12 12M18 6 6 18",
    list: "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function ProjectNotes({
  project,
  onClose,
  reduced,
}: {
  project: Project;
  onClose: () => void;
  reduced: boolean;
}) {
  const story = caseNarratives[project.slug];
  return (
    <section
      className="bit-project-notes"
      id="bit-project-notes"
      tabIndex={-1}
      aria-label={`${project.name} project notes`}
    >
      <header>
        <div>
          <span>Programme notes</span>
          <motion.h2
            layoutId={`bit-title-${project.slug}`}
            transition={reduced ? { duration: 0.01 } : spring.ui}
          >
            {project.name}
          </motion.h2>
        </div>
        <button onClick={onClose} aria-label="Close project notes">
          <Icon name="close" />
        </button>
      </header>
      <div className="bit-notes-body">
        <div>
          <p>{story?.story.product ?? project.summary}</p>
          {project.slug === "care-platform" && <CareFile reduced={reduced} />}
          {story && (
            <>
              <p>{story.story.built}</p>
              <p>{story.story.result}</p>
            </>
          )}
          {project.channel === "healthcare" && (
            <p className="bit-note-label">
              The player shows an authored recreation with invented data. No
              private care-platform screens or patient information.
            </p>
          )}
        </div>
        <aside>
          <dl>
            <div>
              <dt>Years</dt>
              <dd>{project.years ?? "Not specified"}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{project.role}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{project.stack.join(" / ")}</dd>
            </div>
          </dl>
          <nav>
            {project.links.map((link) => (
              <a
                href={link.href}
                key={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.label}
                <Icon name="arrow" />
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </section>
  );
}

export default function Draft() {
  const [project, setProject] = useState<Project>(() =>
    projects.find((item) => item.slug === "bayyinah-tv")!,
  );
  const [year, setYear] = useState<number | null>(2026);
  const [quality, setQuality] = useState<Quality>("Auto");
  const [requestedQuality, setRequestedQuality] = useState<Quality>("Auto");
  const [buffering, setBuffering] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [tick, setTick] = useState(0);
  const [caption, setCaption] = useState("Public website");
  const [locked, setLocked] = useState(false);
  const [notes, setNotes] = useState(false);
  const [allChapters, setAllChapters] = useState(false);
  const [chaptersOpen, setChaptersOpen] = useState(true);
  const [cvRequested, setCvRequested] = useState(false);
  const scrub = useMotionValue(2026);
  const [scrubPosition, setScrubPosition] = useState(2026);
  const scrubDrag = useRef({ active: false, x: 0, time: 0, velocity: 0 });
  const player = useRef<HTMLElement>(null);
  const notesButton = useRef<HTMLButtonElement>(null);
  const paywallButton = useRef<HTMLButtonElement>(null);
  const qualityTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const facts = projectFacts(project);
  const shownFacts = reduced
    ? facts
    : facts.slice(0, Math.min(facts.length, tick + 1));
  const chapters = allChapters ? projects : projectsAtYear(year);
  const assets = reelFrames(project);
  const frameCount = assets.length || facts.length;
  const active =
    playing && !reduced && visible && tabVisible && !locked && !buffering;
  const frame = reduced ? 0 : tick % frameCount;
  const setFrameCaption = useCallback((value: string) => setCaption(value), []);
  const panelMotion = {
    initial: {
      opacity: 0,
      y: reduced ? 0 : 8,
      filter: reduced ? "blur(0px)" : "blur(4px)",
    },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    exit: {
      opacity: 0,
      y: reduced ? 0 : 8,
      filter: reduced ? "blur(0px)" : "blur(4px)",
    },
    transition: { duration: reduced ? 0.01 : dur.panel, ease: ease.sheet },
  };

  useEffect(() => {
    const unsubscribe = scrub.on("change", setScrubPosition);
    return () => {
      unsubscribe();
      scrub.stop();
    };
  }, [scrub]);

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => {
      setReduced(preference.matches);
      if (preference.matches) setPlaying(false);
    };
    const updateVisibility = () => setTabVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    preference.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.12 },
    );
    if (player.current) observer.observe(player.current);
    return () => {
      preference.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
      observer.disconnect();
      clearTimeout(qualityTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setTick((value) => value + 1), 2000);
    return () => clearInterval(timer);
  }, [active, project.slug]);

  function chooseProject(next: Project, scroll = false) {
    setProject(next);
    setTick(0);
    setLocked(false);
    setNotes(false);
    const dates = projectYears(next);
    if (!dates.length) setYear(null);
    else if (year === null || !dates.includes(year)) {
      setYear(dates[dates.length - 1]);
      animate(
        scrub,
        dates[dates.length - 1],
        reduced ? { duration: 0.01 } : spring.ui,
      );
    }
    if (scroll) {
      player.current?.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "start",
      });
      requestAnimationFrame(() =>
        player.current
          ?.querySelector<HTMLElement>(".bit-screen")
          ?.focus({ preventScroll: true }),
      );
    }
  }

  function chooseYear(value: number | null, moveThumb = true) {
    const next =
      value === null
        ? projects.find((item) => !item.years)!
        : projects.find((item) => item.slug === yearChapters[value].slug)!;
    chooseProject(next);
    setYear(value);
    setAllChapters(false);
    if (value !== null && moveThumb)
      animate(scrub, value, reduced ? { duration: 0.01 } : spring.ui);
  }

  function stepProject(direction: number) {
    const available = allChapters ? projects : projectsAtYear(year);
    const index = available.findIndex((item) => item.slug === project.slug);
    chooseProject(
      available[(index + direction + available.length) % available.length],
    );
  }

  function changeQuality(next: Quality) {
    clearTimeout(qualityTimer.current);
    setRequestedQuality(next);
    setBuffering(true);
    qualityTimer.current = setTimeout(() => {
      setQuality(next);
      setBuffering(false);
    }, 300);
  }

  function openNotes() {
    setNotes(true);
    requestAnimationFrame(() => {
      const section = document.getElementById("bit-project-notes");
      section?.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "start",
      });
      section?.focus({ preventScroll: true });
    });
  }

  function closeNotes() {
    setNotes(false);
    notesButton.current?.focus({ preventScroll: true });
    player.current?.scrollIntoView({
      behavior: reduced ? "instant" : "smooth",
      block: "start",
    });
  }

  function closePaywall() {
    setLocked(false);
    requestAnimationFrame(() =>
      paywallButton.current?.focus({ preventScroll: true }),
    );
  }

  return (
    <div
      className="draft-bitrate"
      data-quality={quality}
      style={{ "--bit-colour": projectColour(project) } as CSSProperties}
    >
      <title>BITRATE — Gentrit Rashiti</title>
      <svg className="bit-filter-definitions" aria-hidden="true">
        <defs>
          <filter id="bitrate-4bit" colorInterpolationFilters="sRGB">
            <feComponentTransfer>
              {["R", "G", "B"].map((channel) => {
                const values =
                  "0 .0667 .1333 .2 .2667 .3333 .4 .4667 .5333 .6 .6667 .7333 .8 .8667 .9333 1";
                return channel === "R" ? (
                  <feFuncR key={channel} type="discrete" tableValues={values} />
                ) : channel === "G" ? (
                  <feFuncG key={channel} type="discrete" tableValues={values} />
                ) : (
                  <feFuncB key={channel} type="discrete" tableValues={values} />
                );
              })}
            </feComponentTransfer>
          </filter>
        </defs>
      </svg>
      <LayoutGroup id="bitrate">
        <div className="bit-surface">
          <header className="bit-header">
            <a
              className="bit-wordmark"
              href="/drafts"
              aria-label="BITRATE, all art directions"
            >
              BITRATE<span>by Gentrit Rashiti</span>
            </a>
            <p>
              Web, mobile & full stack
              <br />
              <span>Kosovo · 2021–2026</span>
            </p>
            <nav>
              <a
                href={links.cv}
                download
                onClick={() => setCvRequested(true)}
                aria-label={
                  cvRequested ? "CV download requested" : "Download CV"
                }
              >
                {cvRequested ? "Requested" : "CV"}
              </a>
              <a href={`mailto:${links.email}`}>
                Email
                <Icon name="arrow" />
              </a>
            </nav>
          </header>
          <main>
            <div className="bit-watch-layout">
              <section
                className="bit-player"
                ref={player}
                aria-label="Portfolio player"
              >
                <div className="bit-programme-line">
                  <span className="bit-live">
                    <i />
                    LOCAL REEL
                  </span>
                  <span>
                    {year ?? "Undated"} / {project.kind}
                  </span>
                  <span className="bit-frame-label">
                    {String(frame + 1).padStart(2, "0")} /{" "}
                    {String(frameCount).padStart(2, "0")}
                  </span>
                </div>
                <div
                  className="bit-screen"
                  tabIndex={0}
                  aria-label={`${project.name} reel. Space pauses; arrow keys change project.`}
                  onKeyDown={(event) => {
                    if (event.target !== event.currentTarget) return;
                    if (event.key === " ") {
                      event.preventDefault();
                      setPlaying((value) => !value);
                    }
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      stepProject(1);
                    }
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      stepProject(-1);
                    }
                  }}
                >
                  <Reel
                    project={project}
                    frame={tick}
                    quality={quality}
                    reduced={reduced || !visible || !tabVisible || !playing}
                    onFrameReady={setFrameCaption}
                  />
                  <div className="bit-screen-top">
                    <span>{project.years ?? "Undated project"}</span>
                    <span>
                      {quality === "Auto" ? "AUTO" : quality.toUpperCase()}
                    </span>
                  </div>
                  <div className="bit-screen-caption">
                    <span>{caption}</span>
                    <span>Silent</span>
                  </div>
                  <AnimatePresence initial={false}>
                    {buffering && (
                      <motion.div
                        key="buffer"
                        className="bit-buffer"
                        role="status"
                        {...panelMotion}
                        transition={{
                          duration: reduced ? 0.01 : dur.tap,
                          ease: ease.out,
                        }}
                      >
                        <span />
                        Switching to {requestedQuality}…
                      </motion.div>
                    )}
                    {locked && (
                      <motion.div
                        key="paywall"
                        className="bit-paywall"
                        {...panelMotion}
                        transition={{
                          duration: reduced ? 0.01 : 0.2,
                          ease: ease.sheet,
                        }}
                      >
                        <span className="bit-paywall-label">
                          <Icon name="lock" /> Playback-state recreation
                        </span>
                        <h2>
                          Premium
                          <br />
                          playback.
                        </h2>
                        <p>
                          Bayyinah TV includes subscriptions, gifts and premium
                          video. This local demo shows the access state.
                        </p>
                        <button onClick={closePaywall}>
                          Continue preview
                          <Icon name="play" />
                        </button>
                        <small>No checkout or payment is involved.</small>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div
                    className="bit-frame-progress"
                    key={`${project.slug}-${tick}`}
                    data-playing={active}
                    aria-hidden="true"
                  />
                </div>
                <div className="bit-transport">
                  <button
                    className="bit-play"
                    disabled={reduced}
                    onClick={() => setPlaying((value) => !value)}
                    aria-label={
                      reduced
                        ? "Automatic playback disabled by reduced-motion preference"
                        : playing
                          ? "Pause reel"
                          : "Play reel"
                    }
                    aria-pressed={playing && !reduced}
                  >
                    <Icon name={playing && !reduced ? "pause" : "play"} />
                  </button>
                  <button
                    onClick={() => stepProject(-1)}
                    aria-label="Previous project"
                  >
                    <Icon name="previous" />
                  </button>
                  <button
                    onClick={() => stepProject(1)}
                    aria-label="Next project"
                  >
                    <Icon name="next" />
                  </button>
                  <span className="bit-playback-state">
                    {reduced
                      ? "STILL FRAME"
                      : playing
                        ? "2s / frame"
                        : "PAUSED"}
                  </span>
                  <button
                    className="bit-lock"
                    ref={paywallButton}
                    onClick={() => setLocked((value) => !value)}
                    aria-pressed={locked}
                    aria-label="Toggle Bayyinah TV paywall recreation"
                  >
                    <Icon name="lock" />
                    <span>Paywall demo</span>
                  </button>
                  <motion.label
                    className="bit-quality"
                    whileHover={{ y: reduced ? 0 : -1 }}
                    whileTap={{
                      rotateX: reduced ? 0 : -8,
                      scale: reduced ? 1 : 0.98,
                    }}
                    transition={reduced ? { duration: 0.01 } : spring.ui}
                  >
                    <span>Quality</span>
                    <select
                      value={requestedQuality}
                      onChange={(event) =>
                        changeQuality(event.target.value as Quality)
                      }
                      aria-label="Rendering quality"
                    >
                      {qualities.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </motion.label>
                </div>
                <div className="bit-now-playing">
                  <div>
                    {!notes ? (
                      <motion.h1
                        layoutId={`bit-title-${project.slug}`}
                        transition={reduced ? { duration: 0.01 } : spring.ui}
                      >
                        {project.name}
                      </motion.h1>
                    ) : (
                      <h1 style={{ visibility: "hidden" }} aria-hidden="true">
                        {project.name}
                      </h1>
                    )}
                    <p>
                      {project.role} · {project.years ?? "Date not specified"}
                    </p>
                  </div>
                  <button ref={notesButton} onClick={openNotes}>
                    Open project
                    <Icon name="arrow" />
                  </button>
                </div>
              </section>

              <aside className="bit-chat" aria-label="Project fact feed">
                <header>
                  <h2>In the build</h2>
                  <span>{String(facts.length).padStart(2, "0")} facts</span>
                </header>
                <div className="bit-pinned">
                  <span>PINNED / {project.name}</span>
                  <p>{project.line}</p>
                </div>
                <div className="bit-messages" aria-live="off">
                  <AnimatePresence initial={false} mode="popLayout">
                    {shownFacts.map((fact, index) => (
                      <motion.article
                        key={`${project.slug}-${index}`}
                        className={
                          index === shownFacts.length - 1
                            ? "bit-latest-fact"
                            : ""
                        }
                        initial={{
                          opacity: reduced ? 1 : 0,
                          y: reduced ? 0 : 8,
                          filter: reduced ? "blur(0px)" : "blur(4px)",
                        }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{
                          opacity: 0,
                          y: reduced ? 0 : -8,
                          filter: reduced ? "blur(0px)" : "blur(4px)",
                        }}
                        transition={{
                          duration: reduced ? 0.01 : dur.ui,
                          ease: ease.arrive,
                        }}
                      >
                        <div>
                          <b>{index % 2 ? "implementation" : "product"}</b>
                          <time>{String(index * 2).padStart(2, "0")}s</time>
                        </div>
                        <p>{fact}</p>
                      </motion.article>
                    ))}
                  </AnimatePresence>
                </div>
                <footer>
                  <p>
                    Local recreation. Messages contain project facts, not a live
                    conversation.
                  </p>
                  <button onClick={() => setTick(facts.length)}>
                    {shownFacts.length < facts.length
                      ? "Show all facts"
                      : "All facts visible"}
                    <Icon name="arrow" />
                  </button>
                </footer>
              </aside>
            </div>

            <section className="bit-timeline" aria-label="Career timeline">
              <div className="bit-timeline-top">
                <h2>Scrub the years.</h2>
                <p>
                  {year ?? "Undated"}
                  <span> / career chapters</span>
                </p>
                <button
                  onClick={() => {
                    setChaptersOpen((value) => !value);
                    setAllChapters(true);
                  }}
                  aria-expanded={chaptersOpen}
                  aria-controls="bit-chapters"
                >
                  <Icon name="list" />
                  {projects.length} projects
                </button>
              </div>
              <label className="bit-scrubber">
                <span className="bit-sr">Career year</span>
                <input
                  type="range"
                  min="2021"
                  max="2026"
                  step="0.01"
                  value={scrubPosition}
                  onChange={(event) => {
                    scrub.stop();
                    const value = Number(event.target.value);
                    scrub.set(value);
                    const next = Math.round(value);
                    if (next !== year) chooseYear(next, false);
                  }}
                  onPointerDown={(event) => {
                    scrub.stop();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    scrubDrag.current = {
                      active: true,
                      x: event.clientX,
                      time: event.timeStamp,
                      velocity: 0,
                    };
                  }}
                  onPointerMove={(event) => {
                    const drag = scrubDrag.current;
                    if (!drag.active) return;
                    const dt = event.timeStamp - drag.time;
                    if (dt > 0)
                      drag.velocity =
                        (0.7 * (event.clientX - drag.x)) / dt +
                        0.3 * drag.velocity;
                    drag.x = event.clientX;
                    drag.time = event.timeStamp;
                  }}
                  onPointerUp={(event) => {
                    const drag = scrubDrag.current;
                    if (!drag.active) return;
                    drag.active = false;
                    const width =
                      event.currentTarget.getBoundingClientRect().width;
                    const velocity =
                      event.timeStamp - drag.time > 100
                        ? 0
                        : ((drag.velocity * 1000) / width) * 5;
                    const target = Math.max(
                      2021,
                      Math.min(2026, Math.round(scrub.get() + velocity * 0.2)),
                    );
                    chooseYear(target, false);
                    animate(
                      scrub,
                      target,
                      reduced ? { duration: 0.01 } : { ...spring.ui, velocity },
                    );
                  }}
                  onPointerCancel={() => {
                    scrubDrag.current.active = false;
                    animate(
                      scrub,
                      year ?? 2026,
                      reduced ? { duration: 0.01 } : spring.ui,
                    );
                  }}
                  onKeyDown={(event) => {
                    const step =
                      event.key === "ArrowLeft" || event.key === "ArrowDown"
                        ? -1
                        : event.key === "ArrowRight" || event.key === "ArrowUp"
                          ? 1
                          : 0;
                    if (step || event.key === "Home" || event.key === "End") {
                      event.preventDefault();
                      chooseYear(
                        event.key === "Home"
                          ? 2021
                          : event.key === "End"
                            ? 2026
                            : Math.max(
                                2021,
                                Math.min(2026, (year ?? 2026) + step),
                              ),
                      );
                    }
                  }}
                  aria-valuetext={
                    year
                      ? `${year}, ${yearChapters[year].label}`
                      : "Undated project. Move to choose a year."
                  }
                />
              </label>
              <div className="bit-year-markers">
                {years.map((value) => (
                  <button
                    key={value}
                    onClick={() => chooseYear(value)}
                    aria-pressed={year === value}
                  >
                    <strong>{value}</strong>
                    <span>{yearChapters[value].label}</span>
                  </button>
                ))}
              </div>
            </section>

            <AnimatePresence initial={false} mode="popLayout">
              {chaptersOpen && (
                <motion.section
                  key="chapters"
                  layout
                  {...panelMotion}
                  className="bit-chapters"
                  id="bit-chapters"
                  aria-label="Project chapters"
                >
                  <div className="bit-chapter-heading">
                    <h2>
                      {allChapters
                        ? "All projects"
                        : year
                          ? `In ${year}`
                          : "Undated work"}
                      <span>{chapters.length} chapters</span>
                    </h2>
                    <div>
                      <button
                        aria-pressed={allChapters}
                        onClick={() => setAllChapters(true)}
                      >
                        All {projects.length}
                      </button>
                      <button
                        aria-pressed={!allChapters && year === null}
                        onClick={() => chooseYear(null)}
                      >
                        Undated
                      </button>
                      <label>
                        <span className="bit-sr">Choose any project</span>
                        <select
                          value={project.slug}
                          onChange={(event) =>
                            chooseProject(
                              projects.find(
                                (item) => item.slug === event.target.value,
                              )!,
                              true,
                            )
                          }
                        >
                          {projects.map((item) => (
                            <option key={item.slug} value={item.slug}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="bit-chapter-rail">
                    {chapters.map((item) => (
                      <motion.button
                        key={item.slug}
                        className="bit-chapter"
                        whileHover={{
                          y: reduced ? 0 : -3,
                          rotateX: reduced ? 0 : -3,
                        }}
                        whileTap={{
                          scale: reduced ? 1 : 0.98,
                          rotateX: reduced ? 0 : -7.5,
                        }}
                        transition={reduced ? { duration: 0.01 } : spring.ui}
                        aria-pressed={project.slug === item.slug}
                        onClick={() => chooseProject(item, true)}
                        style={
                          {
                            "--chapter-colour": projectColour(item),
                          } as CSSProperties
                        }
                      >
                        <span className="bit-chapter-year">
                          {item.years ?? "Undated"}
                        </span>
                        <strong>{item.name}</strong>
                        <span className="bit-chapter-kind">{item.kind}</span>
                        <span className="bit-chapter-play">
                          <Icon
                            name={project.slug === item.slug ? "pause" : "play"}
                          />
                          <span>
                            {project.slug === item.slug
                              ? "Now playing"
                              : "Play chapter"}
                          </span>
                        </span>
                      </motion.button>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false} mode="popLayout">
              {notes && (
                <motion.div
                  key={`notes-${project.slug}`}
                  className="bit-notes-presence"
                  layout
                  {...panelMotion}
                >
                  <ProjectNotes
                    project={project}
                    onClose={closeNotes}
                    reduced={reduced}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
          <footer className="bit-credits">
            <div>
              <strong>Gentrit Rashiti</strong>
              <p>
                Frontend and mobile. Full stack since 2026.
                <br />
                Bachelor’s degree · UBT · Based in Kosovo.
              </p>
            </div>
            <nav>
              <a href={links.linkedin}>LinkedIn</a>
              <a href={links.github}>GitHub</a>
              <a href={`mailto:${links.email}`}>{links.email}</a>
              <a
                href={links.cv}
                download
                onClick={() => setCvRequested(true)}
                aria-live="polite"
              >
                {cvRequested ? "CV download requested" : "Download CV"}
              </a>
            </nav>
            <p>
              Quality changes this rendering, not your connection.
              <br />
              Public images and labelled recreations. No live viewers.
            </p>
          </footer>
        </div>
      </LayoutGroup>
    </div>
  );
}
