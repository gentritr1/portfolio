import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { preload } from "react-dom";
import { links } from "../../content/links";
import { breakIndex, brokenTitle, check, rows, type Crop, type Row } from "./rows";
import { Seam } from "./seam";
import "./seam.css";

type Skin = "new" | "old";

const count = rows.length;
const restLine = 39.2857;
const ownStart = rows.findIndex((row) => row.plate);
const two = (value: number) => String(value).padStart(2, "0");
const display = "/fonts/creative/GentritDisplay-Latin.woff2";
const text = "/fonts/creative/GentritText-Latin.woff2";
const phoneQuery = "(max-width: 700px)";
const motionQuery = "(prefers-reduced-motion: reduce)";

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

function Tick({ failed = false }: { failed?: boolean }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d={failed ? "M4 4l8 8M12 4l-8 8" : "M3 8.5l3 3 7-7"} />
    </svg>
  );
}

function Faces({
  className,
  row = -1,
  children,
}: {
  className: string;
  row?: number;
  children: (skin: Skin) => ReactNode;
}) {
  return (
    <div className={`seam-band ${className}`}>
      <div className="seam-new">{children("new")}</div>
      <div className="seam-old" data-skin="old" data-row={row} aria-hidden="true">
        {children("old")}
      </div>
    </div>
  );
}

const cropStyle = (wide: Crop, phone: Crop) =>
  ({
    "--w-ar": `${wide.w} / ${wide.h}`,
    "--w-iw": `${(wide.width / wide.w) * 100}%`,
    "--w-ix": `${(-wide.x / wide.w) * 100}%`,
    "--w-iy": `${(-wide.y / wide.h) * 100}%`,
    "--w-max": `${wide.w / 2}px`,
    "--p-ar": `${phone.w} / ${phone.h}`,
    "--p-iw": `${(phone.width / phone.w) * 100}%`,
    "--p-ix": `${(-phone.x / phone.w) * 100}%`,
    "--p-iy": `${(-phone.y / phone.h) * 100}%`,
    "--p-max": `${phone.w / 2}px`,
  }) as CSSProperties;

function Plate({ row, skin }: { row: Row; skin: Skin }) {
  const plate = row.plate;
  if (!plate) return null;
  return (
    <figure className="seam-plate">
      <div className="seam-plate-frame" style={cropStyle(plate.wide, plate.phone)}>
        <picture>
          <source media={phoneQuery} srcSet={plate.phone.src} />
          <img
            src={plate.wide.src}
            alt={skin === "new" ? plate.wide.alt : ""}
            width={plate.wide.width}
            height={plate.wide.height}
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
      <figcaption>
        {skin === "old" ? `Figure: ${row.title}. ` : ""}
        {plate.caption}
      </figcaption>
    </figure>
  );
}

function RowLinks({ row, skin }: { row: Row; skin: Skin }) {
  if (row.links.length === 0) return null;
  if (skin === "old")
    return (
      <p className="seam-old-links">
        {row.links.map((link) => (
          <a key={link.href} href={link.href} tabIndex={-1}>
            {link.label}
          </a>
        ))}
      </p>
    );
  return (
    <nav className="seam-links" aria-label={`${row.title} links`}>
      {row.links.map((link) => {
        const outside = link.href.startsWith("http");
        return (
          <a
            key={link.href}
            href={link.href}
            {...(outside ? { target: "_blank", rel: "noreferrer" } : {})}
          >
            {link.label}
            <Arrow />
          </a>
        );
      })}
    </nav>
  );
}

function NewRow({
  row,
  index,
  result,
  checking,
}: {
  row: Row;
  index: number;
  result?: boolean;
  checking: boolean;
}) {
  const state =
    result === undefined ? (checking ? "checking" : "idle") : result ? "match" : "differs";
  return (
    <article
      className="seam-grid seam-row"
      data-plate={Boolean(row.plate)}
      aria-labelledby={`seam-row-${row.slug}`}
    >
      <p className="seam-side seam-num" aria-hidden="true">
        {two(index + 1)}
      </p>
      <div className="seam-row-main">
        <header>
          <h3 id={`seam-row-${row.slug}`}>{row.title}</h3>
          <span className="seam-role">
            {row.role} · {row.year}
          </span>
          {row.concept && <span className="seam-concept">Concept, made up</span>}
          <span className="seam-state" data-state={state}>
            {state === "match" && <Tick />}
            {state === "differs" && <Tick failed />}
            {state === "match"
              ? "Same in both skins"
              : state === "differs"
                ? "Differs"
                : state === "checking"
                  ? "Checking"
                  : "Not checked"}
          </span>
        </header>
        <p className="seam-result">{row.result}</p>
        <p className="seam-line">{row.line}</p>
        <RowLinks row={row} skin="new" />
        <Plate row={row} skin="new" />
      </div>
    </article>
  );
}

function OldRow({
  row,
  index,
  result,
  broken,
}: {
  row: Row;
  index: number;
  result?: boolean;
  broken: boolean;
}) {
  const title = broken && index === breakIndex ? brokenTitle(row.title) : row.title;
  if (row.plate)
    return (
      <div className="seam-old-wrap seam-old-project">
        <h3>{title}</h3>
        <p className="seam-old-meta">
          {row.role}, {row.year}
          {row.concept ? " (concept)" : ""}
        </p>
        <p>{row.line}</p>
        <p>
          <b>Result:</b> {row.result}
        </p>
        <RowLinks row={row} skin="old" />
        <Plate row={row} skin="old" />
      </div>
    );
  return (
    <div className="seam-old-wrap">
      <div className="seam-old-row" data-failed={result === false}>
        <span>{index + 1}</span>
        <span>
          <a href={row.links[0]?.href ?? "#"} tabIndex={-1}>
            {title}
          </a>
          <small>{row.line}</small>
        </span>
        <span>{row.result}</span>
        <span>
          <em data-state={result === undefined ? "idle" : result ? "ok" : "fail"}>
            {result === undefined ? row.year : result ? "OK" : "FAIL"}
          </em>
        </span>
      </div>
    </div>
  );
}

export default function Draft() {
  preload(display, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload(text, { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  const root = useRef<HTMLDivElement>(null);
  const engine = useRef<Seam | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const runId = useRef(0);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [running, setRunning] = useState(false);
  const [broken, setBroken] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(0);

  const passed = results.filter(Boolean).length;
  const failedAt = results.findIndex((result) => !result);

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const seam = new Seam(element, count);
    seam.reduced = matchMedia(motionQuery).matches;
    seam.timeScale = 1 / Math.max(1, Number(new URLSearchParams(location.search).get("slow")) || 1);
    seam.setRest(matchMedia(phoneQuery).matches ? 0 : restLine);
    seam.onStep = setStep;
    engine.current = seam;
    seam.refresh();
    return () => {
      seam.destroy();
      engine.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    engine.current?.refresh();
  });

  useEffect(() => {
    let alive = true;
    const wait = new Promise((resolve) => setTimeout(resolve, 300));
    const loaded = Promise.all([
      document.fonts.load("900 100px seam-display"),
      document.fonts.load("400 16px seam-text"),
    ]).catch(() => undefined);
    Promise.race([wait, loaded]).then(() => {
      if (!alive) return;
      setReady(true);
      const seam = engine.current;
      if (!seam) return;
      seam.measure();
      if (seam.reduced) seam.to(seam.rest, "intro");
      else setTimeout(() => alive && seam.to(seam.rest, "intro"), 180);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const phoneMedia = matchMedia(phoneQuery);
    const motionMedia = matchMedia(motionQuery);
    const onPhone = () => {
      const seam = engine.current;
      if (!seam) return;
      seam.measure();
      seam.setRest(phoneMedia.matches ? 0 : restLine);
      seam.to(seam.rest, "switch");
    };
    const onMotion = () => {
      if (engine.current) engine.current.reduced = motionMedia.matches;
    };
    const onResize = () => {
      engine.current?.measure();
      engine.current?.refresh();
    };
    phoneMedia.addEventListener("change", onPhone);
    motionMedia.addEventListener("change", onMotion);
    addEventListener("resize", onResize);
    return () => {
      phoneMedia.removeEventListener("change", onPhone);
      motionMedia.removeEventListener("change", onMotion);
      removeEventListener("resize", onResize);
      clearTimeout(timer.current);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      runId.current++;
    };
  }, []);

  const stop = useCallback(() => {
    runId.current++;
    clearTimeout(timer.current);
    setRunning(false);
  }, []);

  const run = useCallback(
    (withBreak: boolean) => {
      const seam = engine.current;
      if (!seam) return;
      stop();
      const id = runId.current;
      seam.blocked = -1;
      setResults([]);
      setRunning(true);
      const pace = seam.reduced ? 20 : 190;
      const next = (index: number) => {
        if (id !== runId.current) return;
        const ok = check(index, withBreak);
        setResults((previous) => [...previous, ok]);
        if (!ok) {
          seam.blocked = index;
          seam.to(seam.stepPos(index), "tick");
          seam.kick(26);
          setRunning(false);
          document
            .getElementById(`seam-row-${rows[index].slug}`)
            ?.closest(".seam-item")
            ?.scrollIntoView({ block: "center", behavior: seam.reduced ? "instant" : "smooth" });
          return;
        }
        seam.to(seam.stepPos(index + 1), "tick");
        if (index + 1 === count) {
          timer.current = setTimeout(() => {
            if (id !== runId.current) return;
            setRunning(false);
            setDone((value) => value + 1);
          }, pace);
          return;
        }
        timer.current = setTimeout(() => next(index + 1), pace);
      };
      seam.to(100, "switch");
      timer.current = setTimeout(() => next(0), seam.reduced ? 20 : 520);
    },
    [stop],
  );

  const runCheck = useCallback(() => {
    if (running) stop();
    else run(broken);
  }, [broken, run, running, stop]);

  const toggleBreak = () => {
    const seam = engine.current;
    if (broken) {
      stop();
      setBroken(false);
      setResults([]);
      if (seam) {
        seam.blocked = -1;
        seam.to(seam.rest, "key");
      }
    } else {
      setBroken(true);
      run(true);
    }
  };

  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.matches("input, textarea, select") || target.isContentEditable)
      )
        return;
      if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        runCheck();
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [runCheck]);

  function press(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    stop();
    event.currentTarget.setPointerCapture(event.pointerId);
    engine.current?.press(event.clientX, event.timeStamp);
    setDragging(true);
  }

  function move(event: PointerEvent<HTMLElement>) {
    engine.current?.move(event.clientX, event.timeStamp);
  }

  function release(event: PointerEvent<HTMLElement>) {
    engine.current?.release(event.timeStamp);
    setDragging(false);
  }

  function knobKey(event: KeyboardEvent<HTMLDivElement>) {
    const seam = engine.current;
    if (!seam) return;
    const list = seam.stops();
    const current = seam.current();
    const jump = event.shiftKey ? 4 : 1;
    let next: number;
    if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current + jump;
    else if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current - jump;
    else if (event.key === "PageDown") next = current + 4;
    else if (event.key === "PageUp") next = current - 4;
    else if (event.key === "Home") next = list.length - 1;
    else if (event.key === "End") next = 0;
    else return;
    event.preventDefault();
    stop();
    seam.to(list[Math.max(0, Math.min(list.length - 1, next))], "key");
  }

  const toSkin = (skin: Skin) => {
    stop();
    engine.current?.to(skin === "old" ? 100 : 0, "switch");
  };

  const side: Skin = step >= count / 2 ? "new" : "old";
  const status = running
    ? `Checking row ${two(Math.min(results.length + 1, count))} of ${count}.`
    : failedAt >= 0
      ? `Stopped at row ${two(failedAt + 1)}: its title differs between the two skins.`
      : results.length === count
        ? `${count} of ${count} rows on this page are the same in both skins.`
        : "";

  return (
    <div
      className="draft-seam"
      ref={root}
      data-ready={ready}
      data-dragging={dragging}
      data-running={running}
    >
      <title>The seam · Gentrit Rashiti</title>
      <a className="seam-skip" href="#seam-work">
        Skip to the work
      </a>

      <Faces className="seam-head">
        {(skin) =>
          skin === "new" ? (
            <header className="seam-grid seam-head-new">
              <p className="seam-side">This side: today</p>
              <div>
                <a href="/drafts" className="seam-name" aria-label="Gentrit Rashiti, all drafts">
                  Gentrit Rashiti
                </a>
                <span className="seam-tagline">Web and mobile developer</span>
                <nav aria-label="Contact">
                  <a href={links.cv} download>
                    CV (PDF)
                  </a>
                  <a href={`mailto:${links.email}`}>Email</a>
                </nav>
              </div>
            </header>
          ) : (
            <header className="seam-old-nav">
              <strong>Gentrit Rashiti</strong>
              <nav>
                <a href="#seam-work" tabIndex={-1}>
                  Projects
                </a>
                <a href={links.cv} tabIndex={-1}>
                  CV
                </a>
                <a href={`mailto:${links.email}`} tabIndex={-1}>
                  Contact
                </a>
              </nav>
            </header>
          )
        }
      </Faces>

      <Faces className="seam-statement">
        {(skin) =>
          skin === "new" ? (
            <section className="seam-grid" aria-labelledby="seam-title">
              <p className="seam-side seam-side-big" aria-hidden="true">
                2026
              </p>
              <div>
                <h1 id="seam-title">
                  <span>Change the code.</span>
                  <span>
                    Keep the <em>behaviour.</em>
                  </span>
                </h1>
                <p className="seam-lede">Web and mobile apps, rebuilt while people keep using them.</p>
                <p className="seam-facts">
                  5+ years. Part of two platform rewrites. Based in Kosovo, working remotely.
                </p>
                <p className="seam-how">
                  <span className="seam-how-wide">
                    Drag the line. Left of it, this page as a 2021 site would draw it. Right of it,
                    today.
                  </span>
                  <span className="seam-how-phone">
                    Press 2021 at the top to see this page as a 2021 site would draw it.
                  </span>
                </p>
              </div>
            </section>
          ) : (
            <section className="seam-old-wrap seam-old-jumbo">
              <h1>Change the code. Keep the behaviour.</h1>
              <p className="seam-old-lead">Web and mobile apps, rebuilt while people keep using them.</p>
              <hr />
              <p>5+ years. Part of two platform rewrites. Based in Kosovo, working remotely.</p>
              <a className="seam-old-btn" href="#seam-work" tabIndex={-1}>
                See my work
              </a>
            </section>
          )
        }
      </Faces>

      <main id="seam-work" className="seam-work">
        {rows.map((row, index) => (
          <div key={row.slug} className="seam-item">
            {(index === 0 || index === ownStart) && (
              <Faces className="seam-heading" row={index}>
                {(skin) =>
                  skin === "new" ? (
                    <div className="seam-grid seam-heading-new">
                      <p className="seam-side">
                        {index === 0 ? `01–${two(ownStart)}` : `${two(ownStart + 1)}–${two(count)}`}
                      </p>
                      <div>
                        <h2>{index === 0 ? "Client work" : "Own projects"}</h2>
                        <p>
                          {index === 0
                            ? "Apps that people subscribe to, shop in and read in."
                            : "Made on his own time. OFFBEAT and FORM are made-up brands. The software in them works."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="seam-old-wrap seam-old-heading">
                      <h2>{index === 0 ? "Work Experience" : "My Projects"}</h2>
                      {index === 0 && (
                        <div className="seam-old-row seam-old-th">
                          <span>#</span>
                          <span>Project</span>
                          <span>What changed</span>
                          <span>Year</span>
                        </div>
                      )}
                    </div>
                  )
                }
              </Faces>
            )}
            <Faces className="seam-row-band" row={index}>
              {(skin) =>
                skin === "new" ? (
                  <NewRow
                    row={row}
                    index={index}
                    result={results[index]}
                    checking={running && results.length === index}
                  />
                ) : (
                  <OldRow row={row} index={index} result={results[index]} broken={broken} />
                )
              }
            </Faces>
          </div>
        ))}
      </main>

      <Faces className="seam-about">
        {(skin) =>
          skin === "new" ? (
            <section className="seam-grid" aria-labelledby="seam-about-title">
              <p className="seam-side">Contact</p>
              <div>
                <h2 id="seam-about-title">Gentrit Rashiti</h2>
                <p>
                  Frontend and mobile developer. Also builds the server side since 2026. Bachelor’s
                  degree, UBT. Based in Kosovo, working remotely.
                </p>
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
                    Download the CV
                    <Arrow />
                  </a>
                </nav>
              </div>
            </section>
          ) : (
            <section className="seam-old-wrap seam-old-about">
              <h2>About me</h2>
              <p>
                Frontend and mobile developer, full stack since 2026. Bachelor’s degree, UBT. Based
                in Kosovo, working remotely.
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
                </a>
              </p>
            </section>
          )
        }
      </Faces>

      <Faces className="seam-foot">
        {(skin) =>
          skin === "new" ? (
            <footer className="seam-grid">
              <a href="/drafts" className="seam-side seam-back">
                All drafts
              </a>
              <p>
                The 2021 skin is made up for this page. It is not a client app. Both skins read the
                same data, and the check compares them row by row.
              </p>
            </footer>
          ) : (
            <footer className="seam-old-wrap seam-old-foot">
              <p>© 2021 Gentrit Rashiti. All rights reserved.</p>
            </footer>
          )
        }
      </Faces>

      <svg className="seam-cord" aria-hidden="true">
        <path className="seam-cord-path" />
        <path className="seam-cord-edge" />
      </svg>
      <div
        className="seam-zone"
        aria-hidden="true"
        onPointerDown={press}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
      />
      <div
        className="seam-knob"
        role="slider"
        tabIndex={0}
        aria-label="The line between the 2021 skin and today"
        aria-orientation="horizontal"
        aria-valuemin={0}
        aria-valuemax={count}
        aria-valuenow={step}
        aria-valuetext={`${step} of ${count} rows show today's skin`}
        onKeyDown={knobKey}
        onPointerDown={press}
        onPointerMove={move}
        onPointerUp={release}
        onPointerCancel={release}
      >
        <span className="seam-knob-body" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M10 7 5 12l5 5M14 7l5 5-5 5" />
          </svg>
        </span>
      </div>

      <div className="seam-switch" role="group" aria-label="Skin">
        {(["old", "new"] as const).map((skin) => (
          <button key={skin} type="button" aria-pressed={side === skin} onClick={() => toSkin(skin)}>
            {skin === "old" ? "2021" : "Today"}
          </button>
        ))}
      </div>

      <aside className="seam-runner" aria-label="Check every row">
        <button type="button" className="seam-run" onClick={runCheck}>
          <svg viewBox="0 0 12 14" aria-hidden="true">
            <path d={running ? "M2 1h3v12H2ZM8 1h3v12H8Z" : "M2 1l9 6-9 6Z"} />
          </svg>
          <span>{running ? "Stop" : results.length === count ? "Check again" : "Check every row"}</span>
          <kbd aria-hidden="true">P</kbd>
        </button>
        <p className="seam-tally" data-failed={failedAt >= 0}>
          <strong key={done} data-pop={done > 0}>
            {two(passed)}/{two(count)}
          </strong>
          <span>{failedAt >= 0 ? `stopped at row ${two(failedAt + 1)}` : "rows the same in both skins"}</span>
        </p>
        <ol className="seam-bar" aria-hidden="true">
          {rows.map((row, index) => (
            <li
              key={row.slug}
              data-state={
                results[index] === undefined
                  ? running && results.length === index
                    ? "active"
                    : "idle"
                  : results[index]
                    ? "pass"
                    : "fail"
              }
            />
          ))}
        </ol>
        <button
          type="button"
          className="seam-break"
          aria-pressed={broken}
          aria-label={broken ? "Mend the row" : "Break one row"}
          onClick={toggleBreak}
        >
          <span aria-hidden="true">≠</span>
          <span>{broken ? "Mend the row" : "Break one row"}</span>
        </button>
        <p className="seam-sr" role="status">
          {status}
        </p>
      </aside>
    </div>
  );
}
