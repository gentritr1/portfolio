import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent as KeyEvent, type PointerEvent } from "react";
import { links } from "../../content/links";
import { CropShot } from "../../components/CropShot";
import { Frame } from "./glyphs";
import { lines, others, type Line } from "./lines";
import { contactFrame, identityFrame, keyFrame, layouts, lineFrame, type Page } from "./signs";
import { createBoard, type Board } from "./board";
import { createBoardAudio, type BoardAudio } from "./audio";
import "./departures.css";

const FONT = "/fonts/creative/ArchivoNarrow-Latin.woff2";
if (!document.head.querySelector(`link[rel="preload"][href="${FONT}"]`)) {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "font";
  link.type = "font/woff2";
  link.crossOrigin = "anonymous";
  link.href = FONT;
  document.head.append(link);
}

const NARROW = "(max-width: 700px)";
const REDUCED = "(prefers-reduced-motion: reduce)";
/** Each line shows its text page, then its result page: one line every 6 s. */
const PAGE_MS = 3000;
/** A press shorter than this is a dot. */
const DASH_MS = 200;
/** The meter is full at this hold time. */
const METER_MS = 600;
const LETTER_GAP_MS = 700;
const WORD_GAP_MS = 1400;
const KEY_IDLE_MS = 9000;

const morse: Record<string, string> = {
  ".-": "A", "-...": "B", "-.-.": "C", "-..": "D", ".": "E", "..-.": "F", "--.": "G", "....": "H", "..": "I",
  ".---": "J", "-.-": "K", ".-..": "L", "--": "M", "-.": "N", "---": "O", ".--.": "P", "--.-": "Q", ".-.": "R",
  "...": "S", "-": "T", "..-": "U", "...-": "V", ".--": "W", "-..-": "X", "-.--": "Y", "--..": "Z",
  "-----": "0", ".----": "1", "..---": "2", "...--": "3", "....-": "4", ".....": "5", "-....": "6", "--...": "7",
  "---..": "8", "----.": "9",
};

type Mode = "lines" | "key" | "contact";
const two = (n: number) => String(n).padStart(2, "0");
const yearsText = (years: Line["years"]) => (years[1] ? `${years[0]}–${String(years[1]).slice(2)}` : String(years[0]));
const spoken = (pattern: string) => pattern.replace(/\./g, "·").replace(/-/g, "−");
let sessionBooted = false;
const iosWithoutSession = () =>
  !("audioSession" in navigator) && (/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

function useMedia(query: string) {
  const [match, setMatch] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const list = matchMedia(query),
      change = () => setMatch(list.matches);
    list.addEventListener("change", change);
    return () => list.removeEventListener("change", change);
  }, [query]);
  return match;
}

export default function Draft() {
  const narrow = useMedia(NARROW),
    reduced = useMedia(REDUCED);
  const layout = narrow ? layouts.phone : layouts.wide;
  const [current, setCurrent] = useState(-1),
    [page, setPage] = useState<Page>("text"),
    [mode, setMode] = useState<Mode>("lines"),
    [sent, setSent] = useState(""),
    [pattern, setPattern] = useState(""),
    [open, setOpen] = useState<string | null>(null),
    [seen, setSeen] = useState<Set<string>>(() => new Set()),
    [paused, setPaused] = useState(false),
    [sound, setSound] = useState(false),
    [legend, setLegend] = useState(false),
    [held, setHeld] = useState(false),
    [status, setStatus] = useState(""),
    [ready, setReady] = useState(false),
    [resting, setResting] = useState(false),
    [soundNote, setSoundNote] = useState(false),
    [renderer, setRenderer] = useState<"instanced" | "canvas" | "">("");
  const host = useRef<HTMLDivElement>(null),
    board = useRef<Board | null>(null),
    audio = useRef<BoardAudio | null>(null),
    listRef = useRef<HTMLOListElement>(null),
    stripe = useRef<HTMLSpanElement>(null),
    meter = useRef<HTMLSpanElement>(null),
    inView = useRef(1),
    booting = useRef(false);
  const live = useRef({ current, page, mode, sent, layout, reduced });
  live.current = { current, page, mode, sent, layout, reduced };
  const trace = useRef<{ marks: [number, number][]; cursor: number }>({ marks: [], cursor: 0 }),
    hold = useRef({ downAt: 0, painted: 0, frame: 0, x: 0 }),
    symbols = useRef(""),
    letterTimer = useRef(0),
    wordTimer = useRef(0),
    idleTimer = useRef(0);

  function compose(): Frame {
    const { current, page, mode, sent, layout } = live.current;
    if (mode === "contact") return contactFrame(layout);
    if (mode === "key") {
      const f = keyFrame(layout, sent),
        { x, y } = layout.trace;
      for (const [start, length] of trace.current.marks)
        for (let row = y; row < y + 2; row++)
          for (let col = start; col < start + length; col++) f.cell(x + col, row, true, 0);
      return f;
    }
    if (current < 0) return identityFrame(layout, page);
    const line = lines[current],
      after = current + 1 < lines.length ? current + 1 : -1;
    return lineFrame(line, current + 1, layout, page, {
      name: after < 0 ? "GENTRIT RASHITI" : lines[after].board,
      number: after + 1,
    });
  }
  function show(instant = false) {
    if (booting.current) return;
    const f = compose();
    board.current?.set(f.bits, f.delay, instant);
  }

  /* The board: made again when its disc grid changes. */
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    const allowWebGL = !new URLSearchParams(location.search).has("nowebgl");
    if (!host.current) return;
    /* The lamp test: every disc starts lit, as the CSS board before it was, then the board clears. */
    const boot = !reduced && !sessionBooted;
    const created = createBoard(
      host.current,
      layout.cols,
      layout.rows,
      (count, pan) => audio.current?.flips(count, pan),
      reduced,
      allowWebGL,
      boot,
    );
    board.current = created;
    setRenderer(created.renderer);
    trace.current = { marks: [], cursor: 0 };
    if (!boot) {
      show(true);
      setReady(true);
    } else {
      booting.current = true;
      timers.push(
        window.setTimeout(() => {
          if (cancelled) return;
          const none = new Frame(layout.cols, layout.rows);
          none.sweep(0, 4);
          created.set(none.bits, none.delay);
        }, 650),
        window.setTimeout(() => {
          if (cancelled) return;
          sessionBooted = true;
          booting.current = false;
          show();
          setReady(true);
        }, 1350),
      );
    }
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      booting.current = false;
      board.current?.dispose();
      board.current = null;
    };
    // The disc grid depends only on the layout and the motion preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout, reduced]);

  useEffect(() => {
    show();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, page, mode, sent, layout]);

  /*
   * Every 3 s the board turns a page: text, then result, then the next line. An open row holds its line.
   * After one full round the board rests on the name. Nothing loops.
   */
  useEffect(() => {
    if (!ready || paused || reduced || mode !== "lines") return;
    const timer = window.setInterval(() => {
      if (document.hidden || inView.current < 0.25 || booting.current) return;
      const { current, page } = live.current;
      if (page === "text") setPage("result");
      else if (open && current >= 0) setPage("text");
      else if (current + 1 >= lines.length) {
        setPage("text");
        setCurrent(-1);
        setPaused(true);
        setResting(true);
      } else {
        setPage("text");
        setCurrent(current + 1);
      }
    }, PAGE_MS);
    return () => clearInterval(timer);
  }, [ready, paused, reduced, mode, open, current, page]);

  useEffect(() => {
    const node = host.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        inView.current = entries[0].intersectionRatio;
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) {
      audio.current?.key(false);
      audio.current?.enable(false);
    } else audio.current?.enable(sound);
  }, [sound, reduced]);

  useEffect(
    () => () => {
      clearTimeout(letterTimer.current);
      clearTimeout(wordTimer.current);
      clearTimeout(idleTimer.current);
      cancelAnimationFrame(hold.current.frame);
      audio.current?.dispose();
    },
    [],
  );

  /* The red route stripe slides to the row the board shows. */
  useLayoutEffect(() => {
    const list = listRef.current,
      bar = stripe.current;
    if (!list || !bar) return;
    const place = () => {
      const row = current >= 0 && mode === "lines" ? (list.children[current] as HTMLElement | undefined) : undefined;
      if (!row) {
        bar.style.opacity = "0";
        return;
      }
      const head = row.querySelector("button");
      bar.style.opacity = "1";
      bar.style.transform = `translateY(${row.offsetTop}px)`;
      bar.style.height = `${head?.offsetHeight ?? row.offsetHeight}px`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(list);
    return () => observer.disconnect();
  }, [current, mode, open, narrow]);

  /* ---------- The Morse key ---------- */
  function traceCells(start: number, length: number) {
    const { x, y } = live.current.layout.trace,
      cols = live.current.layout.cols,
      cells: number[] = [];
    for (let row = y; row < y + 2; row++) for (let col = start; col < start + length; col++) cells.push(row * cols + x + col);
    return cells;
  }
  function clearTrace() {
    for (const [start, length] of trace.current.marks) board.current?.paint(traceCells(start, length), false);
    trace.current = { marks: [], cursor: 0 };
  }
  function idle() {
    clearTimeout(idleTimer.current);
    idleTimer.current = window.setTimeout(() => {
      if (hold.current.downAt) return;
      clearTrace();
      symbols.current = "";
      setPattern("");
      setSent("");
      setMode("lines");
    }, KEY_IDLE_MS);
  }
  function keyDown() {
    if (hold.current.downAt || booting.current) return;
    clearTimeout(letterTimer.current);
    clearTimeout(wordTimer.current);
    if (live.current.mode !== "key") {
      trace.current = { marks: [], cursor: 0 };
      live.current = { ...live.current, mode: "key" };
      setMode("key");
      show();
    }
    const width = live.current.layout.trace.w;
    if (trace.current.cursor + 16 > width) clearTrace();
    hold.current = { downAt: performance.now(), painted: 0, frame: 0, x: trace.current.cursor };
    setHeld(true);
    audio.current?.wake();
    audio.current?.key(true);
    const write = () => {
      const now = hold.current;
      if (!now.downAt) return;
      const elapsed = performance.now() - now.downAt;
      if (meter.current) {
        meter.current.style.setProperty("--fill", String(Math.min(elapsed / METER_MS, 1)));
        meter.current.dataset.dash = String(elapsed >= DASH_MS);
      }
      const length = Math.min(Math.max(1, Math.round((performance.now() - now.downAt) / 20)), width - now.x);
      if (length > now.painted) {
        board.current?.paint(traceCells(now.x + now.painted, length - now.painted), true);
        now.painted = length;
      }
      now.frame = requestAnimationFrame(write);
    };
    write();
    idle();
  }
  function keyUp(cancel = false) {
    const now = hold.current;
    if (!now.downAt) return;
    cancelAnimationFrame(now.frame);
    const duration = performance.now() - now.downAt;
    now.downAt = 0;
    setHeld(false);
    audio.current?.key(false);
    if (cancel) {
      board.current?.paint(traceCells(now.x, now.painted), false);
      return;
    }
    const length = Math.min(Math.max(now.painted, 1), live.current.layout.trace.w - now.x);
    trace.current.marks.push([now.x, length]);
    trace.current.cursor = now.x + length + 2;
    symbol(duration < DASH_MS ? "." : "-");
  }
  function symbol(mark: string, draw = false) {
    if (draw) {
      if (live.current.mode !== "key") {
        live.current = { ...live.current, mode: "key" };
        setMode("key");
      }
      if (meter.current) {
        meter.current.style.setProperty("--fill", mark === "." ? "0.2" : "0.8");
        meter.current.dataset.dash = String(mark === "-");
      }
      const length = mark === "." ? 4 : 12;
      if (trace.current.cursor + length > live.current.layout.trace.w) clearTrace();
      const x = trace.current.cursor;
      board.current?.paint(traceCells(x, length), true);
      trace.current.marks.push([x, length]);
      trace.current.cursor = x + length + 2;
    }
    clearTimeout(letterTimer.current);
    clearTimeout(wordTimer.current);
    symbols.current = (symbols.current + mark).slice(-6);
    setPattern(symbols.current);
    idle();
    letterTimer.current = window.setTimeout(() => {
      const letter = morse[symbols.current] ?? "?";
      setStatus(`Received ${spoken(symbols.current)}: ${letter === "?" ? "no letter" : letter}.`);
      symbols.current = "";
      setPattern("");
      trace.current = { marks: [], cursor: 0 };
      const next = (live.current.sent + letter).slice(-12);
      live.current = { ...live.current, sent: next };
      setSent(next);
      wordTimer.current = window.setTimeout(() => {
        if (next === "W") {
          setStatus("W: the timetable.");
          document.getElementById("dep-timetable")?.scrollIntoView({ behavior: live.current.reduced ? "auto" : "smooth" });
          setSent("");
          setMode("lines");
        } else if (next === "C") {
          setStatus(`C: contact. Email ${links.email}.`);
          setSent("");
          setMode("contact");
        }
      }, WORD_GAP_MS);
    }, LETTER_GAP_MS);
  }

  useEffect(() => {
    const interactive = (target: EventTarget | null) =>
      target instanceof HTMLElement && !!target.closest("a,button:not(.dep-board),input,textarea,select,summary,[contenteditable]");
    /* Space scrolls the page unless the board itself has focus. */
    const boardOwnsSpace = () => !!host.current && document.activeElement === host.current;
    const down = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || interactive(event.target)) return;
      if (event.code === "Space" && boardOwnsSpace()) {
        event.preventDefault();
        if (!event.repeat) keyDown();
      } else if (document.activeElement === host.current && (event.key === "." || event.key === "-")) {
        event.preventDefault();
        symbol(event.key, true);
      } else if (event.key === "Escape" && live.current.mode !== "lines") {
        clearTrace();
        setSent("");
        setMode("lines");
      }
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space" && hold.current.downAt) {
        event.preventDefault();
        keyUp();
      }
    };
    const blur = () => keyUp(true);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* A synthetic pointer has no capture. */
    }
    keyDown();
  }
  function pointerUp() {
    audio.current?.wake();
    keyUp();
  }
  function boardKey(event: KeyEvent<HTMLDivElement>, down: boolean) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (down && !event.repeat) keyDown();
    if (!down) keyUp();
  }

  /* ---------- Controls ---------- */
  function toggleSound() {
    const value = !sound;
    if (value && !audio.current) audio.current = createBoardAudio();
    audio.current?.enable(value && !reduced);
    setSound(value);
    setSoundNote(value && iosWithoutSession());
    setStatus(value ? "Sound on." : "Sound off.");
  }
  function togglePause() {
    if (paused && resting) {
      setResting(false);
      setPage("text");
      setCurrent(-1);
    }
    setPaused(!paused);
    setStatus(paused ? "The board runs." : "The board is paused.");
  }
  function choose(index: number) {
    const line = lines[index],
      closing = open === line.slug;
    setOpen(closing ? null : line.slug);
    setSeen((value) => (value.has(line.slug) ? value : new Set(value).add(line.slug)));
    if (!closing) {
      clearTrace();
      setSent("");
      setMode("lines");
      setPage("text");
      setCurrent(index);
    }
  }

  const shownLine = mode === "lines" && current >= 0 ? lines[current] : null;
  const caption =
    mode === "key"
      ? { plate: "·−", title: "Morse key", text: pattern ? `Now: ${spoken(pattern)}` : sent ? `Sent: ${sent}` : "A short press is a dot. A long press is a dash.", note: "W (·−−) opens the work. C (−·−·) shows the email." }
      : mode === "contact"
        ? { plate: "@", title: "Contact", text: links.email, note: "LinkedIn and the CV are at the top right." }
        : shownLine
          ? { plate: two(current + 1), title: shownLine.name, text: shownLine.via, note: shownLine.note }
          : {
              plate: "→",
              title: "Departures.",
              text: "Each line is a product: what was built, then what changed.",
              note: resting ? "One full round is done. Press Play to run it again." : "Press and hold the board. It reads Morse, and W (·−−) opens the work.",
            };
  const teach = mode === "key" || (legend && mode === "lines");

  return (
    <main className="dep" data-reduced={reduced} data-mode={mode}>
      <title>Departures · Gentrit Rashiti</title>
      <section className="dep-housing" aria-label="Departure board">
        <header className="dep-bezel">
          <div className="dep-id">
            <h1>
              <b>Gentrit Rashiti</b> builds web and mobile apps, from the screens people use to the server behind them.
            </h1>
            <p>5+ years. Part of two platform rewrites. Mobile apps shipped to both app stores. Based in Kosovo, working remotely.</p>
          </div>
          <nav aria-label="Contact">
            <a href={`mailto:${links.email}`}>Email</a>
            <a href={links.cv} download>
              CV <span aria-hidden="true">↓</span>
            </a>
          </nav>
        </header>
        <div
          className="dep-board"
          ref={host}
          role="button"
          tabIndex={0}
          data-renderer={renderer}
          data-held={held}
          aria-roledescription="Morse key"
          aria-label={`Departure board, now: ${shownLine ? `line ${two(current + 1)}, ${shownLine.name}` : caption.title}. It is also a Morse key: a short press is a dot, a long press is a dash. With the keyboard, hold Space or Enter.`}
          onPointerDown={pointerDown}
          onPointerUp={pointerUp}
          onPointerCancel={() => keyUp(true)}
          onKeyDown={(event) => boardKey(event, true)}
          onKeyUp={(event) => boardKey(event, false)}
          onFocus={() => setLegend(true)}
          onBlur={() => {
            setLegend(false);
            keyUp(true);
          }}
          onPointerEnter={(event) => event.pointerType === "mouse" && setLegend(true)}
          onPointerLeave={(event) => event.pointerType === "mouse" && document.activeElement !== host.current && setLegend(false)}
          style={{ "--cols": layout.cols, "--rows": layout.rows } as CSSProperties}
        />
        <div className="dep-strip">
          <p className="dep-now" aria-live="off">
            <span className="dep-plate" data-current={!!shownLine} aria-hidden="true">
              {caption.plate}
            </span>
            <span className="dep-now-text">
              <span className="dep-now-line" key={`${caption.plate}${caption.title}${caption.text}`}>
                <strong>{caption.title}</strong> {caption.text}
              </span>
              {teach ? (
                <small className="dep-teach">
                  <span className="dep-meter" ref={meter} aria-hidden="true">
                    <b>Dot</b>
                    <span className="dep-meter-track">
                      <span className="dep-meter-fill" />
                    </span>
                    <b>Dash</b>
                  </span>
                  <span>W (·−−) opens the work. C (−·−·) the email.</span>
                </small>
              ) : (
                <small>{caption.note}</small>
              )}
            </span>
          </p>
          <div className="dep-controls">
            <button type="button" onClick={toggleSound} aria-pressed={sound && !reduced} disabled={reduced}>
              <i aria-hidden="true" />
              {reduced ? "Sound off" : sound ? "Sound on" : "Sound off"}
            </button>
            <button type="button" onClick={togglePause} data-on={!paused && !reduced} disabled={reduced}>
              <i aria-hidden="true" />
              {reduced ? "Stopped" : paused ? "Play" : "Pause"}
            </button>
            {soundNote && <p className="dep-sound-note">No sound? Turn off the silent switch.</p>}
          </div>
        </div>
      </section>

      <section className="dep-paper" id="dep-timetable" aria-labelledby="dep-title">
        <header className="dep-head">
          <h2 id="dep-title">Departures</h2>
          <p>
            Every line is a product. Open one to see its real screen.
            <span>
              {lines.length} lines · 2021–2026
            </span>
          </p>
        </header>
        <div className="dep-cols" aria-hidden="true">
          <span>Line</span>
          <span>Destination</span>
          <span>Via</span>
          <span>Platform</span>
          <span>Years</span>
        </div>
        <div className="dep-track">
        <span className="dep-stripe" ref={stripe} aria-hidden="true" />
        <ol className="dep-lines" ref={listRef}>
          {lines.map((line, i) => {
            const isOpen = open === line.slug;
            return (
              <li key={line.slug} data-current={mode === "lines" && current === i} data-open={isOpen}>
                <button type="button" aria-expanded={isOpen} aria-controls={`dep-${line.slug}`} onClick={() => choose(i)}>
                  <span className="dep-no">{two(i + 1)}</span>
                  <span className="dep-dest">
                    {line.name}
                    {line.remark === "Concept" && <span className="dep-tag">Concept</span>}
                  </span>
                  <span className="dep-via">{line.via}</span>
                  <span className="dep-platform">{line.platform}</span>
                  <span className="dep-years">{yearsText(line.years)}</span>
                </button>
                <div className="dep-detail" id={`dep-${line.slug}`} inert={!isOpen}>
                  <div>
                    <div className="dep-detail-text">
                      <p className="dep-label">
                        {line.remark} · {line.platform} · {yearsText(line.years)}
                      </p>
                      <p>{line.detail}</p>
                      <p className="dep-role">{line.role}</p>
                      <p className="dep-links">
                        {line.caseHref && <a href={line.caseHref}>Read the case</a>}
                        {line.links.map((link) => (
                          <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                            {link.label} <span aria-hidden="true">↗</span>
                          </a>
                        ))}
                      </p>
                    </div>
                    {line.shot && (
                      <figure className="dep-shot" data-phone={line.shot.height > line.shot.width} style={{ "--w": `${(line.shot.crop?.w ?? line.shot.width) / 2}px`, "--ratio": `${line.shot.width} / ${line.shot.height}` } as CSSProperties}>
                        {seen.has(line.slug) &&
                          (line.shot.crop ? (
                            <CropShot className="dep-crop" shot={{ ...line.shot, crop: line.shot.crop, ground: "#f5f7fb" }} />
                          ) : (
                            <img src={line.shot.src} width={line.shot.width} height={line.shot.height} alt={line.shot.alt} decoding="async" />
                          ))}
                        <figcaption>{line.shot.caption}</figcaption>
                      </figure>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        </div>
        <section className="dep-others" aria-labelledby="dep-others">
          <h3 id="dep-others">Other lines</h3>
          <ul>
            {others.map((item) => (
              <li key={item.name}>
                <b>{item.name}</b>
                <span>{item.line}</span>
                <span className="dep-years">{item.years}</span>
              </li>
            ))}
          </ul>
        </section>
        <footer className="dep-footer">
          <p>Gentrit Rashiti · Kosovo · working remotely</p>
          <nav aria-label="Elsewhere">
            <a href={`mailto:${links.email}`}>Email</a>
            <a href={links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
            <a href={links.github} target="_blank" rel="noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a href={links.cv} download>
              CV <span aria-hidden="true">↓</span>
            </a>
            <a href="/drafts">All drafts</a>
          </nav>
        </footer>
      </section>
      <p className="dep-sr" role="status">
        {status}
      </p>
    </main>
  );
}
