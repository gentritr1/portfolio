import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from "react";
import type { LabMoveProps } from "./types";
import "./lab.css";

const moves = [
  [
    "01-light",
    "Screen light",
    "A public screenshot lights the surrounding surfaces through an 8 × 8 colour sample.",
  ],
  [
    "02-css3d",
    "Live HTML in 3D",
    "The camera projects real, clickable HTML into the same space as its environment.",
  ],
  [
    "03-board",
    "Flip discs",
    "6,912 two-sided discs carry the type and image in one instanced draw.",
  ],
  [
    "04-sound",
    "Mechanical sound",
    "Opt in to capped 20 ms noise grains, shaped by a band-pass filter.",
  ],
  [
    "05-morse",
    "Morse clock",
    "A 60 ms dit, 180 ms dah and 420 ms letter gap set the rhythm.",
  ],
  [
    "06-letters",
    "Falling letters",
    "Two Verlet substeps settle letters against their crossword cells.",
  ],
  [
    "07-msdf",
    "Distance-field names",
    "A real MSDF atlas lets one project name become the next.",
  ],
  [
    "08-curl",
    "Page curl",
    "A 64-segment leaf bends around a cylinder, with different front and back textures.",
  ],
  [
    "09-quality",
    "Quality ladder",
    "Lower quality changes real image samples, colour steps and type size.",
  ],
  [
    "10-transition",
    "Tile to case",
    "A native view transition carries the same project between two layouts.",
  ],
  [
    "11-seam",
    "CSS scroll seam",
    "A local scroll timeline moves the seam without a JavaScript scroll listener.",
  ],
  [
    "12-width",
    "Variable width",
    "Pointer velocity drives a real font width axis through a settling spring.",
  ],
  [
    "13-fluid",
    "Colour between rows",
    "A 128² fluid simulation carries project colour inside the row masks.",
  ],
  [
    "14-solar",
    "Kosovo daylight",
    "The visitor’s clock sets the sun at 42.6° N, 20.9° E.",
  ],
  [
    "15-reel",
    "Hard-cut reel",
    "A new frame every 2 seconds, with a brief additive colour bleed.",
  ],
  [
    "16-receipt",
    "Print the receipt",
    "Semantic project rows become a real 80 mm paper receipt.",
  ],
  [
    "17-cursors",
    "Simulated collaborators",
    "Local bots send targets at 10 Hz; the displayed cursors interpolate between them.",
  ],
] as const;
const modules = import.meta.glob<{ default: ComponentType<LabMoveProps> }>(
  "./moves/[0-9][0-9]-*.tsx",
);
const views = Object.fromEntries(
  Object.entries(modules).map(([path, load]) => [
    path.split("/").at(-1)!.replace(".tsx", ""),
    lazy(load),
  ]),
);
interface MoveSize {
  id: string;
  js: number;
  css: number;
  total: number;
}

function Tile({
  move,
  paused,
  reduced,
  size,
}: {
  move: (typeof moves)[number];
  paused: boolean;
  reduced: boolean;
  size?: MoveSize;
}) {
  const host = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const active = visible && !paused;
  const View = views[move[0]];
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  return (
    <article
      ref={host}
      className="ml-tile"
      id={`move-${move[0].slice(0, 2)}`}
      data-move={move[0]}
      data-active={active}
    >
      <header>
        <span>{move[0].slice(0, 2)}</span>
        <h2>{move[1]}</h2>
        <span className="ml-size">
          {size ? `${size.total.toFixed(2)} kB gzip` : "Measuring…"}
        </span>
      </header>
      <p>{move[2]}</p>
      <div className="ml-stage">
        {active && View ? (
          <Suspense
            fallback={
              <span className="ml-idle" role="status">
                Opening the demo…
              </span>
            }
          >
            <View active={active} reduced={reduced} />
          </Suspense>
        ) : (
          <div className="ml-idle">
            <span>{paused ? "Paused" : "Scroll into view to run"}</span>
            <span>Resources are released while this tile is inactive.</span>
          </div>
        )}
      </div>
      <footer>
        {active
          ? reduced
            ? "Reduced motion · controls remain available"
            : "Live"
          : "Suspended"}
        <a
          href={`#move-${move[0].slice(0, 2)}`}
          aria-label={`Link to ${move[1]}`}
        >
          ↗
        </a>
      </footer>
    </article>
  );
}

export default function Draft() {
  const [hidden, setHidden] = useState(document.hidden);
  const [paused, setPaused] = useState(false);
  const [deviceReduced, setDeviceReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [reduce, setReduce] = useState(false);
  const [sizes, setSizes] = useState<MoveSize[]>([]);
  const [sizeError, setSizeError] = useState(false);
  useEffect(() => {
    const change = () => setHidden(document.hidden);
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const motionChange = () => setDeviceReduced(preference.matches);
    document.addEventListener("visibilitychange", change);
    preference.addEventListener("change", motionChange);
    const abort = new AbortController();
    fetch("/drafts-lab-sizes.json", { signal: abort.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Sizes unavailable");
        return response.json() as Promise<{ moves: MoveSize[] }>;
      })
      .then((result) => setSizes(result.moves))
      .catch((error) => {
        if (error.name !== "AbortError") setSizeError(true);
      });
    return () => {
      abort.abort();
      document.removeEventListener("visibilitychange", change);
      preference.removeEventListener("change", motionChange);
    };
  }, []);
  return (
    <main className="draft-motion-lab">
      <title>Motion lab — Gentrit Rashiti</title>
      <header className="ml-header">
        <a href="/drafts">← All art directions</a>
        <span>Gentrit Rashiti</span>
        <a href="mailto:gentrit.rashiti2@gmail.com">Email ↗</a>
      </header>
      <section className="ml-intro">
        <div>
          <span>17 working studies</span>
          <h1>Make it move.</h1>
          <p>
            The materials behind the drafts. Try each one, then choose what
            belongs together.
          </p>
        </div>
        <div className="ml-controls">
          <button
            aria-pressed={paused}
            onClick={() => setPaused((value) => !value)}
          >
            {paused ? "Resume demos" : "Pause demos"}
          </button>
          <button
            aria-pressed={reduce || deviceReduced}
            onClick={() => setReduce((value) => !value)}
            disabled={deviceReduced}
          >
            {reduce || deviceReduced
              ? "Reduced motion on"
              : "Try reduced motion"}
          </button>
          <span>
            Sound starts off. Each tile runs only while it is visible.
          </span>
        </div>
      </section>
      <nav className="ml-jump" aria-label="Choose a motion study">
        {moves.map((move) => (
          <a key={move[0]} href={`#move-${move[0].slice(0, 2)}`}>
            {move[0].slice(0, 2)}
            <span>{move[1]}</span>
          </a>
        ))}
      </nav>
      {sizeError && (
        <p className="ml-size-error" role="status">
          The size report is unavailable. The demos still work.
        </p>
      )}
      <div className="ml-grid">
        {moves.map((move) => (
          <Tile
            key={move[0]}
            move={move}
            paused={paused || hidden}
            reduced={reduce || deviceReduced}
            size={sizes.find((size) => size.id === move[0])}
          />
        ))}
      </div>
      <footer className="ml-bottom">
        Sizes count each demo’s production JavaScript and CSS after the lab has
        loaded. Shared files are counted once per demo. Fonts, public images and
        the distance-field atlas are separate downloads. Collaborators are
        explicitly simulated.
      </footer>
    </main>
  );
}
