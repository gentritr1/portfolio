import {
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { preload } from "react-dom";
import { Link } from "react-router";
import { links } from "../../content/links";
import { recreations } from "../../lib/recreations";
import { Drums, TEMPO, preset, tracks } from "./drums";
import { createKnot, flatKnot, materials, type Knot } from "./trefoil";
import "./live-objects.css";

const fontFiles = [
  "/fonts/creative/GentritDisplay-Latin.woff2",
  "/fonts/creative/GentritText-Latin.woff2",
];

function useMedia(query: string) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const reducedQuery = "(prefers-reduced-motion: reduce)";
const isReduced = () => window.matchMedia(reducedQuery).matches;

/** Text waits at most 300 ms for the page faces, counted from the moment this chunk runs. */
const fontsSettled =
  typeof document === "undefined"
    ? Promise.resolve()
    : new Promise<void>((resolve) => {
        window.setTimeout(resolve, 300);
        Promise.all([
          document.fonts.load('300 52px "LO Display"'),
          document.fonts.load('400 17px "LO Text"'),
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

function Arrow() {
  return (
    <svg
      className="lo-arrow"
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
    >
      <path
        d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/* ---------- FORM: the trefoil ---------- */

const flat = flatKnot(480);

function Trefoil({
  material,
  onMaterial,
  start,
}: {
  material: number;
  onMaterial: (i: number) => void;
  start: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const knotRef = useRef<Knot | null>(null);
  const [failed, setFailed] = useState(() =>
    new URLSearchParams(location.search).has("nogl"),
  );
  const materialRef = useRef(material);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || failed || !start) return;
    let knot: Knot | null = null;
    // Shader compilation blocks the main thread, so it starts one frame after the text is painted.
    const frame = requestAnimationFrame(() => {
      knot = createKnot(canvas, {
        reduced: isReduced,
        onLost: () => setFailed(true),
      });
      if (!knot) {
        setFailed(true);
        return;
      }
      knot.setMaterial(materialRef.current);
      knotRef.current = knot;
      knot.spinOnce();
    });
    return () => {
      cancelAnimationFrame(frame);
      knot?.destroy();
      knotRef.current = null;
    };
  }, [failed, start]);

  useEffect(() => {
    materialRef.current = material;
    knotRef.current?.setMaterial(material);
  }, [material]);

  const name = materials[material].name.toLowerCase();
  return (
    <section className="lo-object lo-form" aria-labelledby="lo-form-title">
      <div className="lo-caption">
        <h2 id="lo-form-title" className="lo-name">
          FORM <span>Concept</span>
        </h2>
        <p>
          His own 3D work, a made-up sculpture show. He wrote the 3D code
          himself, with no library. Drag the knot, then pick a metal.
        </p>
      </div>
      <div className="lo-stage">
        <canvas
          ref={canvasRef}
          hidden={failed}
          tabIndex={0}
          role="img"
          aria-label={`The FORM trefoil knot in ${name}. Drag it, or use the arrow keys, to turn it.`}
        />
        {failed && (
          <figure className="lo-flat">
            <svg viewBox="0 0 480 480" aria-hidden="true">
              <path d={flat.whole} className="lo-flat-tube" />
              {flat.front.map((d) => (
                <g key={d}>
                  <path d={d} className="lo-flat-edge" />
                  <path d={d} className="lo-flat-tube" />
                </g>
              ))}
            </svg>
            <figcaption>
              This browser has 3D drawing turned off, so the knot is drawn flat.
            </figcaption>
          </figure>
        )}
      </div>
      <div className="lo-form-foot">
        <div className="lo-swatches" role="radiogroup" aria-label="Metal">
          {materials.map((m, i) => (
            <label key={m.id} className="lo-swatch" data-material={m.id}>
              <input
                type="radio"
                name="lo-material"
                value={m.id}
                checked={material === i}
                onChange={() => onMaterial(i)}
              />
              <span className="lo-dot" aria-hidden="true" />
              {m.name}
            </label>
          ))}
        </div>
        <a className="lo-link" href="https://github.com/gentritr1/form">
          FORM on GitHub
          <Arrow />
        </a>
      </div>
    </section>
  );
}

/* ---------- OFFBEAT: the drum grid ---------- */

function DrumGrid() {
  const [pattern, setPattern] = useState(() => preset.map((row) => [...row]));
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(-1);
  const [focus, setFocus] = useState(0);
  const [error, setError] = useState("");
  const engine = useRef<Drums | null>(null);
  const cells = useRef<(HTMLButtonElement | null)[]>([]);
  const phone = useMedia("(max-width: 720px)");

  useEffect(() => {
    const hide = () => {
      if (document.hidden && engine.current) {
        void engine.current.stop();
        setPlaying(false);
        setStep(-1);
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      void engine.current?.dispose();
    };
  }, []);

  const toggle = async () => {
    setError("");
    if (playing) {
      await engine.current?.stop();
      setPlaying(false);
      setStep(-1);
      return;
    }
    try {
      engine.current ??= new Drums();
      engine.current.pattern = pattern;
      engine.current.onStep = setStep;
      await engine.current.start();
      setPlaying(true);
    } catch {
      setError("Sound could not start in this browser.");
    }
  };

  const flip = (t: number, s: number) => {
    setPattern((p) => {
      const next = p.map((row) => [...row]);
      next[t][s] = !next[t][s];
      if (engine.current) engine.current.pattern = next;
      return next;
    });
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const t = Math.floor(focus / 8);
    const s = focus % 8;
    const along = phone
      ? {
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
        }
      : {
          ArrowLeft: [0, -1],
          ArrowRight: [0, 1],
          ArrowUp: [-1, 0],
          ArrowDown: [1, 0],
        };
    const d = along[e.key as keyof typeof along];
    if (!d) return;
    e.preventDefault();
    const next = ((t + d[0] + 4) % 4) * 8 + ((s + d[1] + 8) % 8);
    setFocus(next);
    cells.current[next]?.focus();
  };

  return (
    <section className="lo-drums" aria-labelledby="lo-drums-title">
      <div className="lo-caption">
        <h3 id="lo-drums-title" className="lo-name">
          OFFBEAT <span>Concept</span>
        </h3>
        <p className="lo-lede">
          A drum machine that really plays, here on the page.
        </p>
        <p>
          From OFFBEAT, a made-up speaker brand. Tap a square to change the
          beat.
        </p>
        <a className="lo-link" href="https://github.com/gentritr1/offbeat">
          OFFBEAT on GitHub
          <Arrow />
        </a>
      </div>
      <div className="lo-drum-body">
        <div
          className="lo-grid"
          role="grid"
          aria-label="Drum pattern, eight steps"
          onKeyDown={onKey}
          data-playing={playing || undefined}
        >
          {tracks.map((track, t) => (
            <div role="row" key={track} className="lo-row">
              <span
                role="rowheader"
                className="lo-track"
                style={{ "--t": t } as CSSProperties}
              >
                {track}
              </span>
              {pattern[t].map((on, s) => {
                const i = t * 8 + s;
                return (
                  <span
                    role="gridcell"
                    key={s}
                    className="lo-cell-wrap"
                    style={{ "--t": t, "--s": s } as CSSProperties}
                  >
                    <button
                      ref={(el) => {
                        cells.current[i] = el;
                      }}
                      type="button"
                      className="lo-cell"
                      tabIndex={focus === i ? 0 : -1}
                      aria-pressed={on}
                      aria-label={`${track}, step ${s + 1}`}
                      data-now={step === s || undefined}
                      data-down={s % 4 === 0 || undefined}
                      onFocus={() => setFocus(i)}
                      onClick={() => flip(t, s)}
                    />
                  </span>
                );
              })}
            </div>
          ))}
          <div className="lo-steps" aria-hidden="true">
            {Array.from({ length: 8 }, (_, s) => (
              <span
                key={s}
                style={{ "--s": s } as CSSProperties}
                data-now={step === s || undefined}
              >
                {s + 1}
              </span>
            ))}
          </div>
        </div>
        <div className="lo-drum-foot">
          <button
            type="button"
            className="lo-play"
            aria-pressed={playing}
            onClick={toggle}
          >
            <svg aria-hidden="true" width="14" height="14" viewBox="0 0 14 14">
              {playing ? (
                <path d="M3 2h3v10H3zM8 2h3v10H8z" fill="currentColor" />
              ) : (
                <path d="M3 1.5v11l9.5-5.5z" fill="currentColor" />
              )}
            </svg>
            {playing ? "Stop" : "Play"}
          </button>
          <p>
            {TEMPO} beats a minute. Sound starts only when you press Play.
            <span role="status">{error}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ---------- The care recreation ---------- */

function Care() {
  const Live = recreations.care.Component;
  return (
    <section className="lo-object lo-care" aria-labelledby="lo-care-title">
      <h2 id="lo-care-title" className="lo-name">
        Care-management platform <span>Recreation · invented data</span>
      </h2>
      <p className="lo-result">
        Care teams follow each patient’s vitals, care plans and lab results.
      </p>
      <div className="lo-care-frame lo-world" data-world="healthcare">
        <Suspense fallback={null}>
          <Live />
        </Suspense>
      </div>
      <p className="lo-care-note">
        Client work, 2023–26. Frontend and mobile. Many client organizations use
        it, and each sees only its own patients. Switch the clinic to try it.
      </p>
      <Link className="lo-link" to="/work/care-platform">
        Open the case
        <Arrow />
      </Link>
    </section>
  );
}

/* ---------- Client work ---------- */

interface Shot {
  src: string;
  width: number;
  height: number;
  alt: string;
}

interface ClientRow {
  years: string;
  name: string;
  result: string;
  role: string;
  href: string;
  shots?: Shot[];
}

const web = (src: string, alt: string): Shot => ({
  src,
  alt,
  width: 1440,
  height: 900,
});
const phone = (src: string, alt: string, height = 1689): Shot => ({
  src,
  alt,
  width: 780,
  height,
});

const client: ClientRow[] = [
  {
    years: "2023–26",
    name: "Bayyinah TV",
    result: "Members subscribe on the web or in the iPhone and Android apps.",
    role: "Frontend, core team. Rebuilt from an empty page: 34 pages.",
    href: "/work/bayyinah-tv",
    shots: [
      web(
        "/showcase/bayyinah/web-02.webp",
        "Bayyinah TV library, Subject tab: library tabs, search, filters and a row of course cards",
      ),
      {
        ...phone(
          "/showcase/bayyinah/store-01.webp",
          "App Store frame: Quran Studies Made Simple, with the Bayyinah TV home screen on an iPhone",
        ),
        width: 778,
        height: 1690,
      },
    ],
  },
  {
    years: "2022–25",
    name: "Read to Feed",
    result: "A reading app for children. It remembers the page in every book.",
    role: "Mobile. About 14 updates in both app stores.",
    href: "/work/read-to-feed",
    shots: [
      phone(
        "/mobile/reading-1.webp",
        "Read to Feed store screenshot: My Books list with reading progress",
      ),
      phone(
        "/mobile/reading-3.webp",
        "Read to Feed store screenshot: chapter reader with a Keep Reading sheet and the mascot",
      ),
      phone(
        "/mobile/reading-2.webp",
        "Read to Feed store screenshot: achievements screen with eggs collected and quiz badges",
      ),
    ],
  },
  {
    years: "2023",
    name: "Viva Fresh",
    result: "One grocery app, built once for iPhone and Android.",
    role: "Mobile. Live in both app stores.",
    href: "/work/viva-fresh",
    shots: [
      phone(
        "/mobile/grocery-1.webp",
        "Viva Fresh on iPhone: home with product categories and latest products, Albanian interface",
      ),
      phone(
        "/mobile/grocery-2.webp",
        "Viva Fresh on iPhone: Fresh category with a product grid and the cart total",
      ),
      phone(
        "/mobile/grocery-3.webp",
        "Viva Fresh on iPhone: cart with quantities, discount and checkout button",
      ),
    ],
  },
  {
    years: "2021–22",
    name: "Dukagjini Bookstore",
    result: "Book shopping on the phone. A notification opens the right book.",
    role: "Mobile. Live in both app stores.",
    href: "/work/dukagjini-bookstore",
    shots: [
      phone(
        "/mobile/bookstore-1.webp",
        "Dukagjini Bookstore: home with book search, top categories and books on sale",
      ),
      phone(
        "/mobile/bookstore-2.webp",
        "Dukagjini Bookstore: foreign books list with ratings, prices and favourites",
      ),
      phone(
        "/mobile/bookstore-3.webp",
        "Dukagjini Bookstore: sheet with favourite lists and book categories",
      ),
    ],
  },
  {
    years: "2024",
    name: "Incentiv",
    result: "Sign-in and dashboard screens for a crypto wallet.",
    role: "Frontend. Teammates built the wallet.",
    href: "/work/incentiv",
    shots: [
      web(
        "/showcase/incentiv/web-03.webp",
        "Incentiv Portal sign-in: Passkey, MetaMask and WalletConnect options beside a dashboard preview",
      ),
    ],
  },
  {
    years: "2026",
    name: "Design System v2",
    result:
      "36 ready-made building blocks, released 20 times in about six weeks.",
    role: "Design system. The care platform’s new React screens use it.",
    href: "/work/design-system-react",
  },
];

function ClientWork() {
  return (
    <section
      className="lo-client"
      id="client-work"
      aria-labelledby="client-work-title"
    >
      <h2 id="client-work-title" className="lo-band-title">
        Client work <span>2021–26</span>
      </h2>
      <ol>
        {client.map((r) => (
          <li key={r.name} className="lo-client-row">
            <div className="lo-client-text">
              <span className="lo-years">{r.years}</span>
              <h3 className="lo-row-name">
                <Link to={r.href}>{r.name}</Link>
              </h3>
              <p className="lo-row-result">{r.result}</p>
              <p className="lo-row-role">{r.role}</p>
            </div>
            {r.shots && (
              <div className="lo-shots">
                {r.shots.map((shot) => (
                  <img
                    key={shot.src}
                    className="lo-shot"
                    data-kind={shot.width > shot.height ? "web" : "phone"}
                    src={shot.src}
                    width={shot.width}
                    height={shot.height}
                    alt={shot.alt}
                    loading="lazy"
                    decoding="async"
                  />
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Own work ---------- */

interface OwnRow {
  name: string;
  result: string;
  href: string;
}

const own: OwnRow[] = [
  {
    name: "FJALË",
    result: "A daily Albanian word game with a 21,000-word dictionary.",
    href: "https://xn--fjal-opa.com/",
  },
  {
    name: "Za!",
    result:
      "A pizza card game for 2 to 8 players. The server keeps every game fair.",
    href: "https://za-game.onrender.com/",
  },
  {
    name: "Morse Trainer",
    result: "A Morse code game. The letters you miss come back sooner.",
    href: "https://morse-code-amber.vercel.app/",
  },
  {
    name: "Snaxx Tech",
    result: "An app studio’s website. Images cut from 972 KB to 337 KB.",
    href: "https://www.snaxxtech.com/",
  },
];

function OwnWork() {
  return (
    <section className="lo-own" id="own-work" aria-labelledby="own-work-title">
      <h2 id="own-work-title" className="lo-band-title">
        Also built, on his own time <span>2026</span>
      </h2>
      <article className="lo-offday" aria-labelledby="lo-offday-title">
        <div className="lo-offday-text">
          <h3 id="lo-offday-title" className="lo-row-name">
            Offday
          </h3>
          <p className="lo-row-result">
            Time off for teams: requests, approvals and one shared calendar.
          </p>
          <p className="lo-row-role">
            About 200 tests. They prove one team never sees another team’s data.
          </p>
        </div>
        <img
          className="lo-offday-shot"
          src="/personal/shots/offday-light-calendar-desktop.webp"
          width={2880}
          height={1800}
          alt="Offday team calendar for October 2026 in the demo workspace, with leave bars, a public holiday and the approval queue"
          loading="lazy"
          decoding="async"
        />
      </article>
      <DrumGrid />
      <ol className="lo-own-list">
        {own.map((r) => (
          <li key={r.name}>
            <a className="lo-row-name" href={r.href}>
              {r.name}
              <Arrow />
            </a>
            <span className="lo-row-result">{r.result}</span>
            <span className="lo-row-role">Live on the web.</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ---------- Page ---------- */

export default function Draft() {
  fontFiles.forEach((href) =>
    preload(href, { as: "font", type: "font/woff2", crossOrigin: "anonymous" }),
  );
  const ready = useFontsReady();
  const [material, setMaterial] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    const before = {
      scroll: root.style.scrollBehavior,
      bg: root.style.background,
    };
    root.style.scrollBehavior = "auto";
    root.style.background = "#0e0e0e";
    return () => {
      root.style.scrollBehavior = before.scroll;
      root.style.background = before.bg;
    };
  }, []);

  return (
    <div
      className="lo"
      data-material={materials[material].id}
      data-ready={ready || undefined}
    >
      <title>Live objects — Gentrit Rashiti</title>
      <meta name="theme-color" content="#0e0e0e" />
      <header className="lo-head">
        <nav aria-label="Main">
          <a href="#client-work">Client work</a>
          <a href={links.cv}>CV (PDF)</a>
          <a href={`mailto:${links.email}`}>Email</a>
          <a href={links.github}>GitHub</a>
        </nav>
      </header>
      <main>
        <div className="lo-intro">
          <h1>
            <span>Gentrit Rashiti builds web and mobile apps.</span>{" "}
            <em>Some of them run on this page.</em>
          </h1>
          <p className="lo-sub">
            <span>
              5+ years. Part of two platform rewrites. Mobile apps shipped to
              both app stores.
            </span>{" "}
            Based in Kosovo, working remotely.
          </p>
        </div>
        <div className="lo-objects">
          <Trefoil material={material} onMaterial={setMaterial} start={ready} />
          <Care />
        </div>
        <ClientWork />
        <OwnWork />
      </main>
      <footer className="lo-foot">
        <p>
          FORM and OFFBEAT are concepts: made-up brands, built to show the work.
          The care card is a recreation with invented data.
        </p>
        <p>Bachelor’s degree, UBT, Kosovo.</p>
        <nav aria-label="Contact">
          <a href={`mailto:${links.email}`}>{links.email}</a>
          <a href={links.github}>GitHub</a>
          <a href={links.linkedin}>LinkedIn</a>
          <a href={links.cv}>CV (PDF)</a>
        </nav>
      </footer>
    </div>
  );
}
