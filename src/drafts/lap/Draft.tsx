import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
  useIsPresent,
} from "motion/react";
import { caseNarratives } from "../../content/caseNarratives";
import { links } from "../../content/links";
import { sectors, type Sector } from "./data";
import { createLapScene, type LapScene } from "./scene";
import { createNameMorph, type NameMorph } from "./msdf";
import { getKosovoSun, kosovoClock } from "./solar";
import { dur, ease, spring } from "./motion";
import CareFile from "./CareFile";
import "./lap.css";

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      style={back ? { rotate: "180deg" } : undefined}
    >
      <path d="M4 12h16m-7-7 7 7-7 7" />
    </svg>
  );
}
function ProjectCase({
  sector,
  close,
  reduced,
}: {
  sector: Sector;
  close: () => void;
  reduced: boolean;
}) {
  const present = useIsPresent();
  const project = sector.project,
    story = caseNarratives[project.slug];
  return (
    <motion.article
      className="lp-case"
      inert={!present}
      id={`lap-case-${project.slug}`}
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
        <motion.h3
          layoutId={`lap-title-${project.slug}`}
          transition={reduced ? { duration: 0.01 } : spring.ui}
        >
          {project.name}
        </motion.h3>
        <button onClick={close}>
          Close case <span aria-hidden="true">×</span>
        </button>
      </header>
      <div className="lp-case-grid">
        <div>
          <p>{story?.story.product ?? project.summary}</p>
          {story && <p>{story.story.built}</p>}
          {project.slug === "care-platform" && <CareFile reduced={reduced} />}
        </div>
        <dl>
          <div>
            <dt>Work</dt>
            <dd>{project.role}</dd>
          </div>
          <div>
            <dt>Years</dt>
            <dd>{project.years ?? "Independent work"}</dd>
          </div>
          <div>
            <dt>Made with</dt>
            <dd>{project.stack.join(" / ")}</dd>
          </div>
        </dl>
      </div>
      <nav aria-label={`${project.name} public links`}>
        {project.links.map((link) => (
          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
            {link.label}
            <Arrow />
          </a>
        ))}
      </nav>
    </motion.article>
  );
}

export default function Draft() {
  const reduced = Boolean(useReducedMotion());
  const [active, setActive] = useState(0),
    [ready, setReady] = useState(false),
    [morphReady, setMorphReady] = useState(false),
    [driveRequested, setDriving] = useState(false),
    [paused, setPaused] = useState(false),
    [caseSlug, setCaseSlug] = useState<string | null>(null),
    [cvDone, setCvDone] = useState(false),
    [clock, setClock] = useState(() => new Date()),
    [message, setMessage] = useState(
      `All ${sectors.length} projects can be opened from the sector board.`,
    );
  const host = useRef<HTMLDivElement>(null),
    nameHost = useRef<HTMLDivElement>(null),
    scene = useRef<LapScene | null>(null),
    morph = useRef<NameMorph | null>(null),
    activeRef = useRef(0),
    driveRef = useRef(false),
    hold = useRef<ReturnType<typeof setInterval> | null>(null),
    touch = useRef({ x: 0, y: 0, time: 0 }),
    lastWheel = useRef(0);
  const driving = driveRequested && !reduced;
  useEffect(() => {
    activeRef.current = active;
    driveRef.current = driving;
  }, [active, driving]);
  const sector = sectors[active],
    sun = getKosovoSun(clock, reduced);
  useEffect(() => {
    if (!host.current || !nameHost.current) return;
    let cancelled = false;
    setReady(false);
    setMorphReady(false);
    const noGL = new URLSearchParams(location.search).has("nogl");
    if (!noGL) {
      void createLapScene(
        host.current,
        sectors,
        reduced,
        (index) => {
          // A button selection is the destination while the camera travels.
          // Only driving turns physical sector crossings into a new selection.
          if (!cancelled && driveRef.current) setActive(index);
        },
        activeRef.current,
      ).then((value) => {
        if (cancelled) {
          value?.dispose();
          return;
        }
        scene.current = value;
        setReady(Boolean(value));
        value?.select(activeRef.current);
      });
      void createNameMorph(
        nameHost.current,
        sectors.map((item) => item.name),
        reduced,
      ).then((value) => {
        if (cancelled) {
          value?.dispose();
          return;
        }
        morph.current = value;
        setMorphReady(Boolean(value));
        value?.set(activeRef.current, true);
      });
    }
    return () => {
      cancelled = true;
      scene.current?.dispose();
      morph.current?.dispose();
      scene.current = null;
      morph.current = null;
    };
  }, [reduced]);
  useEffect(() => {
    morph.current?.set(active, reduced);
  }, [active, reduced]);
  useEffect(() => {
    scene.current?.pause(paused);
  }, [paused, ready]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) setClock(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (reduced) scene.current?.brake();
  }, [reduced]);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      if (!driveRef.current || reduced) return;
      event.preventDefault();
      const now = performance.now();
      scene.current?.throttle(event.deltaY * 0.065, now - lastWheel.current);
      lastWheel.current = now;
    };
    node.addEventListener("wheel", wheel, { passive: false });
    return () => node.removeEventListener("wheel", wheel);
  }, [reduced]);
  useEffect(
    () => () => {
      if (hold.current) clearInterval(hold.current);
    },
    [],
  );
  useEffect(() => {
    if (!caseSlug) return;
    const frame = requestAnimationFrame(() => {
      const node = document.getElementById(`lap-case-${caseSlug}`);
      node?.scrollIntoView({
        block: "nearest",
        behavior: reduced ? "instant" : "smooth",
      });
      node?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [caseSlug, reduced]);
  function choose(index: number) {
    const next = (index + sectors.length) % sectors.length;
    setActive(next);
    scene.current?.select(next);
    setMessage(`Sector ${next + 1}: ${sectors[next].project.name}.`);
  }
  function openCase(index: number) {
    choose(index);
    setDriving(false);
    scene.current?.brake();
    setCaseSlug(sectors[index].slug);
  }
  function closeCase(item: Sector) {
    setCaseSlug(null);
    requestAnimationFrame(() =>
      document.getElementById(`lap-link-${item.slug}`)?.focus(),
    );
  }
  function stopDrive() {
    setDriving(false);
    scene.current?.brake();
    scene.current?.steer(0);
    if (hold.current) {
      clearInterval(hold.current);
      hold.current = null;
    }
    setMessage("Stopped. Scroll the page or choose a sector.");
  }
  function startHold() {
    if (reduced || paused) return;
    scene.current?.throttle(4);
    if (hold.current) clearInterval(hold.current);
    hold.current = setInterval(() => scene.current?.throttle(3, 65), 65);
  }
  function endHold() {
    if (hold.current) clearInterval(hold.current);
    hold.current = null;
    scene.current?.brake();
  }
  return (
    <div
      className="draft-lap"
      data-reduced={reduced}
      style={{ "--lp-project": sector.colour } as CSSProperties}
    >
      <title>LAP — Gentrit Rashiti</title>
      <header className="lp-header">
        <a href="/drafts" className="lp-mark">
          LAP<span> / Gentrit Rashiti</span>
        </a>
        <span className="lp-role">Web · mobile · full stack</span>
        <nav>
          <a href="#lap-sectors">All {sectors.length} sectors</a>
          <a
            href={links.cv}
            download
            onClick={() => {
              setCvDone(true);
              setMessage("CV download requested.");
            }}
          >
            {cvDone ? "CV requested" : "CV"}
          </a>
          <a href={`mailto:${links.email}`}>
            Email <Arrow />
          </a>
        </nav>
      </header>
      <main>
        <section
          className="lp-stage"
          aria-label="The project-name circuit"
          data-driving={driving}
          data-ready={ready}
          data-daylight={sun.altitude >= 0}
        >
          <div className="lp-static-track" aria-hidden="true">
            <div className="lp-static-sun" />
            <div className="lp-static-road" />
            <span className="lp-static-barrier">{sector.name}</span>
          </div>
          <div
            className="lp-scene"
            ref={host}
            tabIndex={0}
            aria-label="Optional hover racer. Enter to drive; scroll or Arrow Up to accelerate, Left and Right to steer, Space to brake, Escape to leave driving mode."
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                stopDrive();
              } else if (event.key === "Enter" && !reduced && ready) {
                event.preventDefault();
                setDriving(true);
                setMessage(
                  "Driving. Scroll to accelerate. Escape returns page scrolling.",
                );
              } else if (driving) {
                if (
                  [
                    "ArrowUp",
                    "ArrowDown",
                    "ArrowLeft",
                    "ArrowRight",
                    " ",
                  ].includes(event.key)
                )
                  event.preventDefault();
                if (event.key === "ArrowUp") scene.current?.throttle(5);
                if (event.key === "ArrowDown" || event.key === " ")
                  scene.current?.brake();
                if (event.key === "ArrowLeft") scene.current?.steer(-1);
                if (event.key === "ArrowRight") scene.current?.steer(1);
              }
            }}
            onKeyUp={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight")
                scene.current?.steer(0);
              if (event.key === "ArrowUp") scene.current?.brake();
            }}
            onBlur={() => {
              scene.current?.steer(0);
              endHold();
            }}
            onPointerDown={(event) => {
              if (!driving) return;
              event.currentTarget.setPointerCapture(event.pointerId);
              touch.current = {
                x: event.clientX,
                y: event.clientY,
                time: performance.now(),
              };
            }}
            onPointerMove={(event) => {
              if (
                !driving ||
                !event.currentTarget.hasPointerCapture(event.pointerId)
              )
                return;
              const now = performance.now();
              scene.current?.steer((event.clientX - touch.current.x) / 110);
              scene.current?.throttle(
                (touch.current.y - event.clientY) * 0.1,
                now - touch.current.time,
              );
              touch.current.y = event.clientY;
              touch.current.time = now;
            }}
            onPointerUp={(event) => {
              if (event.currentTarget.hasPointerCapture(event.pointerId))
                event.currentTarget.releasePointerCapture(event.pointerId);
              scene.current?.steer(0);
              scene.current?.brake();
            }}
            onPointerCancel={() => {
              scene.current?.steer(0);
              scene.current?.brake();
            }}
          />
          <div className="lp-sector-status">
            <span>SECTOR {sector.number} / {sectors.length}</span>
            <span>
              {sector.project.kind} · {sector.project.years ?? "Independent"}
            </span>
          </div>
          <div className="lp-solar">
            <span>Kosovo {kosovoClock(sun.date)}</span>
            <span>
              {reduced
                ? "Static solar noon"
                : sun.altitude < 0
                  ? "Sun below the horizon"
                  : "Sun above the horizon"}
            </span>
          </div>
          <div className="lp-caption">
            <h1 className="lp-sr">{sector.project.name}</h1>
            <div className="lp-name" aria-hidden="true">
              <div className="lp-msdf" ref={nameHost} />
              <AnimatePresence initial={false}>
                <motion.span
                  key={sector.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: morphReady ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: reduced ? 0.01 : dur.ui,
                    ease: ease.out,
                  }}
                >
                  {sector.name}
                </motion.span>
              </AnimatePresence>
            </div>
            <p>{sector.fact}</p>
            <a
              className="lp-open"
              href={`#lap-case-${sector.slug}`}
              onClick={(event) => {
                event.preventDefault();
                openCase(active);
              }}
            >
              Open {sector.project.name}
              <Arrow />
            </a>
          </div>
          <div className="lp-drive-controls">
            <div className="lp-driving-row">
              <button
                aria-label="Previous sector"
                onClick={() => choose(active - 1)}
              >
                <Arrow back />
              </button>
              <button
                className="lp-drive-toggle"
                disabled={reduced || !ready}
                aria-pressed={driving}
                onClick={() => {
                  if (driving) stopDrive();
                  else {
                    setDriving(true);
                    setPaused(false);
                    host.current?.focus();
                    setMessage(
                      "Driving. Scroll or Arrow Up accelerates; Escape restores page scrolling.",
                    );
                  }
                }}
              >
                {reduced
                  ? "Static lap"
                  : !ready
                    ? "Sector view"
                    : driving
                      ? "Stop driving"
                      : "Drive the lap"}
              </button>
              <button
                aria-label="Next sector"
                onClick={() => choose(active + 1)}
              >
                <Arrow />
              </button>
            </div>
            {driving && (
              <div className="lp-throttle-row">
                <button
                  aria-label="Steer left"
                  onPointerDown={() => scene.current?.steer(-1)}
                  onPointerUp={() => scene.current?.steer(0)}
                  onPointerLeave={() => scene.current?.steer(0)}
                  onPointerCancel={() => scene.current?.steer(0)}
                  onBlur={() => scene.current?.steer(0)}
                  onKeyDown={(event) => {
                    if (event.key === " " || event.key === "Enter") {
                      event.preventDefault();
                      scene.current?.steer(-1);
                    }
                  }}
                  onKeyUp={() => scene.current?.steer(0)}
                >
                  <Arrow back />
                </button>
                <button
                  onPointerDown={startHold}
                  onPointerUp={endHold}
                  onPointerLeave={endHold}
                  onPointerCancel={endHold}
                  onKeyDown={(event) => {
                    if (
                      (event.key === " " || event.key === "Enter") &&
                      !event.repeat
                    ) {
                      event.preventDefault();
                      startHold();
                    }
                  }}
                  onKeyUp={endHold}
                  onBlur={endHold}
                >
                  Hold to accelerate
                </button>
                <button
                  aria-label="Steer right"
                  onPointerDown={() => scene.current?.steer(1)}
                  onPointerUp={() => scene.current?.steer(0)}
                  onPointerLeave={() => scene.current?.steer(0)}
                  onPointerCancel={() => scene.current?.steer(0)}
                  onBlur={() => scene.current?.steer(0)}
                  onKeyDown={(event) => {
                    if (event.key === " " || event.key === "Enter") {
                      event.preventDefault();
                      scene.current?.steer(1);
                    }
                  }}
                  onKeyUp={() => scene.current?.steer(0)}
                >
                  <Arrow />
                </button>
              </div>
            )}
            <p>
              {driving
                ? "Scroll / swipe to accelerate · arrows steer · Esc stops"
                : "Choose a sector, or drive. Every case is below."}
            </p>
            <button
              className="lp-pause"
              disabled={reduced || !ready}
              aria-pressed={paused}
              onClick={() => {
                setPaused((value) => !value);
                setMessage(
                  paused ? "Track motion resumed." : "Track motion paused.",
                );
              }}
            >
              {paused ? "Resume motion" : "Pause motion"}
            </button>
          </div>
        </section>
        <section
          id="lap-sectors"
          className="lp-sector-board"
          aria-labelledby="lap-board-heading"
        >
          <header>
            <h2 id="lap-board-heading">The sector board.</h2>
            <p>A lap through the work. No driving required.</p>
            <span>{sectors.length} projects</span>
          </header>
          <LayoutGroup id="lap-cases">
            <ol>
              {sectors.map((item, index) => (
                <motion.li
                  layout
                  key={item.slug}
                  data-selected={index === active}
                  style={{ "--lp-row": item.colour } as CSSProperties}
                  transition={reduced ? { duration: 0.01 } : spring.ui}
                >
                  <a
                    className="lp-sector-link"
                    id={`lap-link-${item.slug}`}
                    href={`#lap-case-${item.slug}`}
                    aria-expanded={caseSlug === item.slug}
                    onClick={(event) => {
                      event.preventDefault();
                      if (caseSlug === item.slug) closeCase(item);
                      else openCase(index);
                    }}
                  >
                    <span>{item.number}</span>
                    {caseSlug === item.slug ? (
                      <span className="lp-row-title">{item.project.name}</span>
                    ) : (
                      <motion.span
                        className="lp-row-title"
                        layoutId={`lap-title-${item.slug}`}
                        transition={reduced ? { duration: 0.01 } : spring.ui}
                      >
                        {item.project.name}
                      </motion.span>
                    )}
                    <span className="lp-year">
                      {item.project.years ?? "Independent"}
                    </span>
                    <span className="lp-row-fact">{item.fact}</span>
                    <Arrow />
                  </a>
                  <AnimatePresence initial={false}>
                    {caseSlug === item.slug && (
                      <ProjectCase
                        key={item.slug}
                        sector={item}
                        close={() => closeCase(item)}
                        reduced={reduced}
                      />
                    )}
                  </AnimatePresence>
                </motion.li>
              ))}
            </ol>
          </LayoutGroup>
        </section>
        <footer className="lp-footer">
          <div>
            <h2>One lap. A different kind of work at every turn.</h2>
            <p>
              The circuit takes its cue from Futurisma, my hover racer with
              seven circuits, weather, tide and day–night systems. The names
              here are the projects.
            </p>
          </div>
          <nav>
            <a href={links.github}>
              GitHub <Arrow />
            </a>
            <a href={links.linkedin}>
              LinkedIn <Arrow />
            </a>
            <a href={`mailto:${links.email}`}>
              Email <Arrow />
            </a>
            <a href={links.cv} download onClick={() => setCvDone(true)}>
              {cvDone ? "CV requested" : "Download CV"}
              <Arrow />
            </a>
          </nav>
          <p>Gentrit Rashiti · Kosovo · Working remotely</p>
        </footer>
      </main>
      <p className="lp-sr" role="status">
        {message}
      </p>
    </div>
  );
}
