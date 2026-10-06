import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { preload } from "react-dom";
import { Link } from "react-router";
import { CropShot } from "../../components/CropShot";
import { careShots, REAL_SCREENS } from "../../content/careShots";
import { links } from "../../content/links";
import { offday, offdayNarrow, tiles } from "./data";
import { FlowStepper, Requests } from "./explain";
import { Drums, TEMPO, preset, tracks } from "./drums";
import { KOCH_ORDER, MAX_MARKS, MORSE, Tone, letterFor, spoken, symbolFor } from "./morse";
import { createKnot, flatKnot, materials, type Knot } from "./trefoil";
import "./three-things.css";

const fontFiles = ["/fonts/creative/GentritDisplay-Latin.woff2", "/fonts/creative/PublicSans-Latin.woff2"];

const reducedQuery = "(prefers-reduced-motion: reduce)";
const isReduced = () => window.matchMedia(reducedQuery).matches;

/** Text waits at most 300 ms for the page faces, counted from the moment this chunk runs. */
const fontsSettled =
  typeof document === "undefined"
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        window.setTimeout(resolve, 300);
        Promise.all([
          document.fonts.load('700 72px "TT Display"'),
          document.fonts.load('400 17px "TT Text"'),
        ]).then(
          () => resolve(),
          () => resolve(),
        );
      });

function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let live = true;
    void fontsSettled.then(() => {
      if (live) setReady(true);
    });
    return () => {
      live = false;
    };
  }, []);
  return ready;
}

/* ---------- 1. OFFBEAT: the drum row ---------- */

const STEPS = 8;

function DrumRow() {
  const [pattern, setPattern] = useState(() => preset.map((row) => [...row]));
  const [playing, setPlaying] = useState(false);
  const [problem, setProblem] = useState("");
  const [focus, setFocus] = useState<[number, number]>([0, 0]);
  const drums = useRef<Drums | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const band = useRef<HTMLElement>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (drums.current) drums.current.pattern = pattern;
  }, [pattern]);

  const stop = useCallback(() => {
    void drums.current?.stop();
    if (grid.current) delete grid.current.dataset.step;
    setPlaying(false);
  }, []);

  async function play() {
    if (playing) {
      stop();
      return;
    }
    try {
      if (!drums.current) drums.current = new Drums();
    } catch {
      setProblem("This browser cannot play sound here. The steps still switch on and off.");
      return;
    }
    const machine = drums.current;
    machine.pattern = pattern;
    machine.onStep = (step) => {
      if (grid.current && !isReduced()) grid.current.dataset.step = String(step);
    };
    await machine.start();
    setPlaying(true);
  }

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stop();
    };
    const onHidden = () => {
      if (document.hidden) stop();
    };
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    });
    if (band.current) io.observe(band.current);
    window.addEventListener("keydown", onKey);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      io.disconnect();
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [playing, stop]);

  useEffect(
    () => () => {
      void drums.current?.dispose();
      drums.current = null;
    },
    [],
  );

  const toggle = (t: number, s: number) =>
    setPattern((p) => p.map((row, i) => (i === t ? row.map((on, j) => (j === s ? !on : on)) : row)));

  const move = (e: ReactKeyboardEvent, t: number, s: number) => {
    const next = (
      {
        ArrowLeft: [t, (s + STEPS - 1) % STEPS],
        ArrowRight: [t, (s + 1) % STEPS],
        ArrowUp: [(t + tracks.length - 1) % tracks.length, s],
        ArrowDown: [(t + 1) % tracks.length, s],
        Home: [t, 0],
        End: [t, STEPS - 1],
      } as Record<string, [number, number]>
    )[e.key];
    if (!next) return;
    e.preventDefault();
    setFocus(next);
    cells.current[next[0] * STEPS + next[1]]?.focus();
  };

  return (
    <section className="tt-object" id="offbeat" ref={band} aria-labelledby="offbeat-name">
      <div className="tt-object-text">
        <p className="tt-count" aria-hidden="true">1 of 3</p>
        <h3 id="offbeat-name" className="tt-object-name">OFFBEAT</h3>
        <p>A concept site for a made-up portable speaker. Its drum machine is real. This is its drum row.</p>
        <p className="tt-how">Tap a step to switch it on. Press Play to hear it. Sound starts only when you press Play.</p>
        <p className="tt-meta">
          Eight steps, four sounds, {TEMPO} beats a minute, as in OFFBEAT. Arrow keys move between steps. Escape stops it.
        </p>
        <p className="tt-meta">
          Own project · 2026 · <a href="https://github.com/gentritr1/offbeat">Code on GitHub</a>
        </p>
      </div>
      <div className="tt-drums">
        <div className="tt-grid" ref={grid} role="group" aria-label="Drum steps">
          {Array.from({ length: STEPS }, (_, s) => (
            <span
              key={`n${s}`}
              className="tt-step-no"
              data-s={s}
              aria-hidden="true"
              style={{ "--r": 1, "--c": s + 2, "--pr": s + 2, "--pc": 1 } as CSSProperties}
            >
              {s + 1}
            </span>
          ))}
          {tracks.map((name, t) => (
            <span
              key={name}
              className="tt-track"
              aria-hidden="true"
              style={{ "--r": t + 2, "--c": 1, "--pr": 1, "--pc": t + 2 } as CSSProperties}
            >
              {name}
            </span>
          ))}
          {tracks.map((name, t) =>
            pattern[t].map((on, s) => (
              <button
                key={`${name}${s}`}
                type="button"
                ref={(el) => {
                  cells.current[t * STEPS + s] = el;
                }}
                className="tt-cell"
                data-s={s}
                aria-pressed={on}
                aria-label={`${name}, step ${s + 1}`}
                tabIndex={focus[0] === t && focus[1] === s ? 0 : -1}
                onFocus={() => setFocus([t, s])}
                onClick={() => toggle(t, s)}
                onKeyDown={(e) => move(e, t, s)}
                style={{ "--r": t + 2, "--c": s + 2, "--pr": s + 2, "--pc": t + 2 } as CSSProperties}
              />
            )),
          )}
        </div>
        <div className="tt-drum-foot">
          <button type="button" className="tt-play" aria-pressed={playing} onClick={() => void play()}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16">
              {playing ? <path d="M4 3h3v10H4zM9 3h3v10H9z" fill="currentColor" /> : <path d="M4 2.5v11l9.5-5.5z" fill="currentColor" />}
            </svg>
            {playing ? "Stop" : "Play"}
          </button>
          <p className="tt-status" role="status">
            {problem || (playing ? "Playing. Change any step while it plays." : "Stopped.")}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- 2. FORM: the trefoil ---------- */

function Trefoil() {
  const [material, setMaterial] = useState(0);
  const [flat, setFlat] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const knot = useRef<Knot | null>(null);
  const drawing = useMemo(() => (flat ? flatKnot(400) : null), [flat]);

  useEffect(() => {
    if (!canvas.current || new URLSearchParams(location.search).has("nogl")) {
      setFlat(true);
      return;
    }
    const k = createKnot(canvas.current, { reduced: isReduced, onLost: () => setFlat(true) });
    if (!k) setFlat(true);
    knot.current = k;
    return () => {
      k?.destroy();
      knot.current = null;
    };
  }, []);

  const pick = (i: number) => {
    setMaterial(i);
    knot.current?.setMaterial(i);
  };

  return (
    <section className="tt-object" id="form" data-material={materials[material].id} aria-labelledby="form-name">
      <div className="tt-object-text">
        <p className="tt-count" aria-hidden="true">2 of 3</p>
        <h3 id="form-name" className="tt-object-name">FORM</h3>
        <p>A concept site for a made-up sculpture show. Its sculptures render live, with no 3D library. This is its trefoil knot.</p>
        <p className="tt-how">Drag the knot to turn it. Arrow keys turn it too. Pick a metal, and the knot and the name change colour.</p>
        <fieldset className="tt-swatches">
          <legend className="tt-meta">Material</legend>
          {materials.map((m, i) => (
            <label key={m.id} data-id={m.id}>
              <input type="radio" name="tt-material" checked={material === i} onChange={() => pick(i)} />
              <span>{m.name}</span>
            </label>
          ))}
        </fieldset>
        <p className="tt-meta">
          Own project · 2026 · <a href="https://github.com/gentritr1/form">Code on GitHub</a>
        </p>
      </div>
      <div className="tt-knot">
        {flat && drawing ? (
          <svg className="tt-flat" viewBox="0 0 400 400" role="img" aria-label="The trefoil knot, drawn flat because this browser has no WebGL">
            <path d={drawing.whole} />
            {drawing.front.map((d, i) => (
              <g key={i}>
                <path d={d} className="tt-flat-gap" />
                <path d={d} />
              </g>
            ))}
          </svg>
        ) : (
          <canvas
            ref={canvas}
            tabIndex={0}
            role="img"
            aria-label={`The trefoil knot in ${materials[material].name.toLowerCase()}. Drag it, or use the arrow keys, to turn it. Home puts it back.`}
          />
        )}
      </div>
    </section>
  );
}

/* ---------- 3. Morse Trainer: the key ---------- */

function MorseKey() {
  const [index, setIndex] = useState(0);
  const [marks, setMarks] = useState("");
  const [checked, setChecked] = useState(false);
  const [down, setDown] = useState(false);
  const [sound, setSound] = useState(false);
  const [problem, setProblem] = useState("");
  const started = useRef(0);
  const tone = useRef<Tone | null>(null);
  const target = KOCH_ORDER[index];
  const pattern = MORSE[target];
  const right = checked && marks === pattern;

  const release = useCallback(
    (cancel = false) => {
      if (!started.current) return;
      const held = performance.now() - started.current;
      started.current = 0;
      setDown(false);
      tone.current?.stop();
      if (!cancel) setMarks((m) => (m + symbolFor(held)).slice(0, MAX_MARKS));
    },
    [],
  );

  const press = () => {
    if (checked || marks.length >= MAX_MARKS || started.current) return;
    started.current = performance.now();
    setDown(true);
    if (sound) tone.current?.start();
  };

  useEffect(() => {
    const onHidden = () => {
      if (document.hidden) release(true);
    };
    document.addEventListener("visibilitychange", onHidden);
    return () => document.removeEventListener("visibilitychange", onHidden);
  }, [release]);

  useEffect(
    () => () => {
      void tone.current?.dispose();
      tone.current = null;
    },
    [],
  );

  const toggleSound = () => {
    if (!sound && !tone.current) {
      try {
        tone.current = new Tone();
      } catch {
        setProblem("This browser cannot play sound here. The key still works.");
        return;
      }
    }
    setSound(!sound);
  };

  const check = () => {
    if (checked) {
      setIndex((i) => (i + 1) % KOCH_ORDER.length);
      setMarks("");
      setChecked(false);
      return;
    }
    if (marks) setChecked(true);
  };

  let status = `Send ${target}. Tap for a dot, hold for a dash, then press Check.`;
  if (checked) {
    const sent = letterFor(marks);
    status = right
      ? `Right. ${target} is ${spoken(pattern)}.`
      : `Not yet. ${target} is ${spoken(pattern)}. You sent ${sent ? `${sent}, ` : ""}${spoken(marks)}.`;
  } else if (marks) status = `${spoken(marks)}. Press Check when the letter is done.`;
  if (problem) status = problem;

  const slots = Math.max(pattern.length, marks.length);

  return (
    <section className="tt-object" id="morse" aria-labelledby="morse-name">
      <div className="tt-object-text">
        <p className="tt-count" aria-hidden="true">3 of 3</p>
        <h3 id="morse-name" className="tt-object-name">Morse Trainer</h3>
        <p>A game that teaches Morse code. Letters a player misses come back sooner. This is its Send mode.</p>
        <p className="tt-how">
          Tap the key for a dot. Hold it for a dash. Space works too. A press longer than 133 ms is a dash, as in the game’s Gentle speed.
        </p>
        <p className="tt-meta">
          Own project · 2026 · <a href="https://morse-code-amber.vercel.app/">Play it on the web</a>
        </p>
      </div>
      <div className="tt-morse" data-down={down || undefined}>
        <div className="tt-target">
          <span className="tt-letter" aria-hidden="true">{target}</span>
          <span className="tt-pattern" aria-label={`${target} is ${spoken(pattern)}`}>
            {pattern.split("").map((m, i) => (
              <i key={i} className={m === "." ? "dot" : "dash"} />
            ))}
          </span>
        </div>
        <div className="tt-sent" aria-hidden="true">
          {Array.from({ length: slots }, (_, i) => (
            <i
              key={i}
              className={marks[i] === "." ? "dot" : marks[i] === "-" ? "dash" : "empty"}
              data-match={checked ? String(marks[i] === pattern[i]) : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="tt-key"
          aria-label="Morse key. Tap for a dot, hold for a dash."
          aria-disabled={checked || undefined}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            press();
          }}
          onPointerUp={() => release()}
          onPointerCancel={() => release(true)}
          onBlur={() => release(true)}
          onContextMenu={(e) => e.preventDefault()}
          onKeyDown={(e) => {
            if (e.key !== " " && e.key !== "Enter") return;
            e.preventDefault();
            if (!e.repeat) press();
          }}
          onKeyUp={(e) => {
            if (e.key !== " " && e.key !== "Enter") return;
            e.preventDefault();
            release();
          }}
        >
          <span className="tt-lamp" aria-hidden="true" />
          Tap or hold
        </button>
        <div className="tt-morse-actions">
          <button type="button" onClick={check} disabled={!checked && !marks}>
            {checked ? "Next letter" : "Check"}
          </button>
          <button type="button" onClick={() => setMarks("")} disabled={!marks || checked}>
            Clear
          </button>
          <button type="button" aria-pressed={sound} onClick={toggleSound}>
            {sound ? "Sound on" : "Sound off"}
          </button>
        </div>
        <p className="tt-status" role="status" data-result={checked ? String(right) : undefined}>
          {status}
        </p>
      </div>
    </section>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  fontFiles.forEach((href) => preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" }));
  const ready = useFontsReady();

  useEffect(() => {
    const root = document.documentElement;
    const before = { scroll: root.style.scrollBehavior, bg: root.style.background };
    root.style.scrollBehavior = "auto";
    root.style.background = "#0e0e0e";
    return () => {
      root.style.scrollBehavior = before.scroll;
      root.style.background = before.bg;
    };
  }, []);

  return (
    <div className="tt" data-ready={ready || undefined}>
      <title>Gentrit Rashiti — web and mobile apps</title>
      <meta name="theme-color" content="#0e0e0e" />
      <header className="tt-top">
        <nav aria-label="Contact">
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.github}>GitHub</a>
          <a href={links.cv}>CV (PDF)</a>
        </nav>
      </header>
      <main>
        <div className="tt-intro">
          <h1>Gentrit Rashiti builds web and mobile apps.</h1>
          <p className="tt-lede">
            Three things on this page run: <a href="#offbeat">a drum machine</a>, <a href="#form">a sculpture</a> and{" "}
            <a href="#morse">a Morse key</a>. Try them.
          </p>
          <p className="tt-facts">5+ years · part of two platform rewrites · Kosovo, works remotely</p>
        </div>

        <figure className="tt-hero">
          <Link to="/work/care-platform" className="tt-hero-shot" aria-label="Care-management platform: read the case">
            <span className="tt-wide">
              <CropShot shot={careShots.week} eager />
            </span>
            <span className="tt-narrow">
              <CropShot shot={careShots.weekTwoDays} eager />
            </span>
          </Link>
          <figcaption>
            <div>
              <p className="tt-name">
                <Link to="/work/care-platform">Care-management platform</Link>
              </p>
              <p>Rebuilt screen by screen while care teams use it. Old bugs are written down, not copied.</p>
            </div>
            <p className="tt-meta">Care team calendar, one week · Frontend and mobile · 2023–26 · {REAL_SCREENS}</p>
          </figcaption>
        </figure>

        <div className="tt-explain">
          <FlowStepper />
          <Requests />
        </div>

        <section className="tt-section" aria-labelledby="client-work">
          <h2 id="client-work">Client work</h2>
          <ul className="tt-tiles">
            {tiles.map((t) => (
              <li key={t.slug}>
                <Link to={`/work/${t.slug}`} className="tt-tile" aria-label={`${t.name}. ${t.line} Read the case.`}>
                  {t.narrow ? (
                    <>
                      <span className="tt-wide">
                        <CropShot shot={t.shot} />
                      </span>
                      <span className="tt-narrow">
                        <CropShot shot={t.shot} crop={t.narrow} />
                      </span>
                    </>
                  ) : (
                    <CropShot shot={t.shot} />
                  )}
                  <span className="tt-name">{t.name}</span>
                  <span className="tt-line">{t.line}</span>
                  <span className="tt-meta">
                    {t.meta}
                    {t.note ? ` · ${t.note}` : ""}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="tt-section" aria-labelledby="own-work">
          <h2 id="own-work">Own projects. These three run.</h2>
          <DrumRow />
          <Trefoil />
          <MorseKey />
          <div className="tt-also">
            <figure>
              <span className="tt-wide">
                <CropShot shot={offday} />
              </span>
              <span className="tt-narrow">
                <CropShot shot={offday} crop={offdayNarrow} />
              </span>
              <figcaption>
                <span className="tt-name">Offday</span>
                <span className="tt-line">Time off for teams: requests, approvals and one shared calendar. About 200 tests keep it working.</span>
                <span className="tt-meta">Own project · 2026 · Private code, no public link.</span>
              </figcaption>
            </figure>
            <ul className="tt-games">
              <li>
                <a className="tt-name" href="https://xn--fjal-opa.com/">FJALË</a>
                <span className="tt-line">A daily Albanian word game, checked against 21,000 words. It also works offline.</span>
              </li>
              <li>
                <a className="tt-name" href="https://za-game.onrender.com/">Za!</a>
                <span className="tt-line">A pizza card game for 2 to 8 players. Computer players can join.</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
      <footer className="tt-foot">
        <p>OFFBEAT and FORM are concepts: made-up brands, built to show the work. Bachelor’s degree, UBT, Kosovo.</p>
        <nav aria-label="Contact again">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.github}>GitHub</a>
          <a href={links.linkedin}>LinkedIn</a>
          <a href={links.cv}>CV (PDF)</a>
        </nav>
      </footer>
    </div>
  );
}
