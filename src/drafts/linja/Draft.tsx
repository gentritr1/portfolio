import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as KeyEvent,
  type PointerEvent,
} from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { spring, dur } from "./motion";
import { projects, type Project } from "../../content/projects";
import type { ChannelKey } from "../../content/channels";
import { links } from "../../content/links";
import { wallAssets } from "../../components/portfolio/wallAssets";
import {
  DISC_COUNT,
  fillRect,
  putIcon,
  putPattern,
  putText,
  textWidth,
} from "./bitmap";
import type { Board } from "./board";
import { createBoardAudio, type BoardAudio } from "./audio";
import "./linja.css";

const routeOrder = [
  "bayyinah-tv",
  "care-platform",
  "read-to-feed",
  "viva-fresh",
  "incentiv",
  "dukagjini-bookstore",
  "fjale",
  "morse-trainer",
  "za",
  "snaxx-tech",
];
const routes = [...projects].sort(
  (a, b) =>
    (routeOrder.indexOf(a.slug) < 0 ? 99 : routeOrder.indexOf(a.slug)) -
    (routeOrder.indexOf(b.slug) < 0 ? 99 : routeOrder.indexOf(b.slug)),
);

/** What each line says on the discs: a short name, one big figure and its unit. */
const signs: Record<string, [string, string, string]> = {
  "bayyinah-tv": ["BAYYINAH TV", "34", "ROUTES"],
  "care-platform": ["CARE PLATFORM", "31", "ADRS"],
  "read-to-feed": ["READ TO FEED", "~14", "RELEASES"],
  "viva-fresh": ["VIVA FRESH", "IOS", "+ ANDROID"],
  incentiv: ["INCENTIV", "EN/FR", "PASSKEY UI"],
  "dukagjini-bookstore": ["DUKAGJINI", "PUSH", "DEEP LINKS"],
  fjale: ["FJALË", "21K", "WORDS"],
  "morse-trainer": ["MORSE TRAINER", "·-", "FARNSWORTH"],
  za: ["ZA!", "2-8", "PLAYERS"],
  "snaxx-tech": ["SNAXX TECH", "337KB", "IMAGES"],
  offbeat: ["OFFBEAT", "8", "STEP DRUMS"],
  form: ["FORM", "3", "SCULPTURES"],
  "care-api": ["CARE API", "16→2", "QUERIES"],
  "design-system-react": ["DESIGN SYS REACT", "34", "COMPONENTS"],
  "design-system-vue": ["DESIGN SYS VUE", "FIGMA", "TO TOKENS"],
  "design-dashboard": ["DESIGN DASHBOARD", "DEMO", "DATA"],
  "bayyinah-institute": ["BAYYINAH.ORG", "1", "PAGE SITE"],
  "chatbot-runtime": ["CHATBOT RUNTIME", "RN", "PACKAGE"],
  "chatbot-runtime-web": ["CHATBOT WEB", "TS", "WEB PORT"],
  "epub-reader-prototype": ["EPUB READER", "EPUB", "PROTOTYPE"],
  "donation-app": ["SADAQAH APP", "RN", "DONATIONS"],
  "coaching-app": ["COACHING APP", "3", "BUILD TYPES"],
  "fuel-loyalty-app": ["FUEL LOYALTY", "0.78", "RN UPKEEP"],
  "member-portal": ["MEMBER PORTAL", "WEB", "APP SHELL"],
  "ai-dashboard": ["AI DASHBOARD", "PDF", "TO CHAT"],
  offday: ["OFFDAY", "16", "TESTS"],
  "geo-guesser": ["GEO GUESSER", "3D", "STREET VIEW"],
  futurisma: ["FUTURISMA", "7", "CIRCUITS"],
  "secret-dictator": ["SECRET DICTATOR", "AI", "OPPONENTS"],
  "open-source-forks": ["OPEN SOURCE", "2", "RN FORKS"],
};
const channelSign: Record<ChannelKey, string> = {
  healthcare: "HEALTHCARE",
  streaming: "STREAMING",
  reading: "MOBILE APPS",
  web3: "WEB3",
  ai: "WEB + AI",
  personal: "PERSONAL",
};
type Mode = "route" | "work" | "contact" | "help";
const codes = [
  ["W", ".--", "Work"],
  ["C", "-.-.", "Contact"],
  ["?", "..--..", "This key"],
] as const;
const morse: Record<string, string> = Object.fromEntries(
  codes.map(([letter, pattern]) => [pattern, letter]),
);
const cards: Record<
  Exclude<Mode, "route">,
  [string, string, string, string, string]
> = {
  work: ["W", "WORK", ".--", String(projects.length), "LINES BELOW"],
  contact: ["C", "CONTACT", "-.-.", "@", "EMAIL + CV"],
  help: ["?", "THE KEY", "..--..", "", ""],
};
const conceptArt: Record<string, { src: string; recreation?: boolean }> = {
  offbeat: { src: "/personal/shots/offbeat-home-desktop.webp" },
  form: { src: "/personal/shots/form-home-desktop.webp" },
};
const NARROW = "(max-width: 650px)";
const REDUCED = "(prefers-reduced-motion: reduce)";

interface Geometry {
  cols: number;
  rows: number;
  /** First of the two disc rows that the Morse key writes on. */
  traceY: number;
  margin: number;
}
const geometry = (narrow: boolean): Geometry =>
  narrow
    ? { cols: 72, rows: 96, traceY: 92, margin: 4 }
    : { cols: 144, rows: 48, traceY: 45, margin: 3 };

function dotted(bits: Uint8Array, cols: number, from: number, to: number, y: number) {
  for (let x = from; x <= to; x += 2) bits[y * cols + x] = 1;
}
function wrap(text: string, width: number) {
  const lines: string[] = [];
  for (const word of text.split(" ")) {
    const last = lines.length - 1;
    if (last >= 0 && lines[last].length + word.length + 1 <= width)
      lines[last] += " " + word;
    else lines.push(word.slice(0, width));
  }
  return lines.slice(0, 2);
}
function legend(bits: Uint8Array, cols: number, x: number, y: number, narrow: boolean) {
  codes.forEach(([letter, pattern], i) => {
    const left = narrow ? x : x + i * 40,
      top = narrow ? y + i * 9 : y;
    putText(bits, cols, letter, left, top);
    putPattern(bits, cols, pattern, left + 9, top + 2, 2, 3);
  });
}
interface Sign {
  head: string;
  title: string;
  sub?: string;
  pattern?: string;
  big?: string;
  unit?: string;
  icon?: ChannelKey;
  legend?: boolean;
}
function signBits({ head, title, sub, pattern, big, unit, icon, legend: key }: Sign, narrow: boolean) {
  const { cols } = geometry(narrow),
    bits = new Uint8Array(DISC_COUNT);
  if (narrow) {
    putText(bits, cols, head, 4, 4, 3);
    if (icon) putIcon(bits, cols, icon, 54, 4);
    dotted(bits, cols, 4, 67, 29);
    const lines = wrap(title, 11);
    lines.forEach((line, i) => putText(bits, cols, line, 4, 33 + i * 9));
    const y = 33 + lines.length * 9;
    if (sub) putText(bits, cols, sub.slice(0, 11), 4, y);
    if (pattern) putPattern(bits, cols, pattern, 4, y + 2, 2, 3);
    dotted(bits, cols, 4, 67, 62);
    if (key) legend(bits, cols, 4, 66, true);
    if (big) putText(bits, cols, big, 4, 66, 2);
    if (unit) putText(bits, cols, unit.slice(0, 11), 4, 83);
    return bits;
  }
  putText(bits, cols, head, 3, 3, 3);
  putText(bits, cols, title, 41, 3);
  if (sub) putText(bits, cols, sub, 41, 17);
  if (pattern) putPattern(bits, cols, pattern, 41, 19, 2, 3);
  dotted(bits, cols, 3, 140, 27);
  if (key) legend(bits, cols, 3, 33, false);
  if (big) putText(bits, cols, big, 3, 30, 2);
  if (unit) putText(bits, cols, unit, 3 + textWidth(big ?? "", 2) + (big ? 6 : 0), 37);
  if (icon) putIcon(bits, cols, icon, 127, 30);
  return bits;
}
function routeSign(project: Project, line: number): Sign {
  const [title, big, unit] = signs[project.slug] ?? [
    project.name.toUpperCase().slice(0, 17),
    project.years?.slice(0, 4) ?? "",
    project.kind.toUpperCase().slice(0, 11),
  ];
  return {
    head: String(line + 1).padStart(2, "0"),
    title,
    sub: channelSign[project.channel],
    big,
    unit,
    icon: project.channel,
  };
}
function bootBits(narrow: boolean) {
  const { cols } = geometry(narrow),
    bits = new Uint8Array(DISC_COUNT);
  if (narrow) {
    putText(bits, cols, "GENTRIT", 4, 4);
    putText(bits, cols, "RASHITI", 4, 13);
    dotted(bits, cols, 4, 67, 29);
    ["WEB", "MOBILE", "FULL STACK"].forEach((text, i) =>
      putText(bits, cols, text, 4, 33 + i * 9),
    );
    dotted(bits, cols, 4, 67, 62);
    putText(bits, cols, "KOSOVO", 4, 66);
    return bits;
  }
  putText(bits, cols, "GENTRIT", 3, 3, 2);
  putText(bits, cols, "RASHITI", 3, 19, 2);
  putText(bits, cols, "KOSOVO", 141 - textWidth("KOSOVO"), 26);
  dotted(bits, cols, 3, 140, 36);
  putText(bits, cols, "WEB  MOBILE  FULL STACK", 3, 39);
  return bits;
}
function initialSound() {
  try {
    return localStorage.getItem("gentrit-linja-sound") === "on";
  } catch {
    return false;
  }
}
const spoken = (pattern: string) =>
  pattern.replace(/\./g, "·").replace(/-/g, "—").split("").join(" ");
const two = (value: number) => String(value + 1).padStart(2, "0");

export default function Draft() {
  const [index, setIndex] = useState(0),
    [preview, setPreview] = useState<number | null>(null),
    [mode, setMode] = useState<Mode>("route"),
    [opened, setOpened] = useState(false),
    [contact, setContact] = useState(false),
    [paused, setPaused] = useState(false),
    [cvSent, setCvSent] = useState(false),
    [careFacts, setCareFacts] = useState(false);
  const [narrow, setNarrow] = useState(() => matchMedia(NARROW).matches),
    [reduced, setReduced] = useState(() => matchMedia(REDUCED).matches),
    [boot, setBoot] = useState(() => !matchMedia(REDUCED).matches);
  const [sound, setSound] = useState(initialSound),
    [pattern, setPattern] = useState(""),
    [announcement, setAnnouncement] = useState(""),
    [holding, setHolding] = useState(false);
  const host = useRef<HTMLDivElement>(null),
    board = useRef<Board | null>(null),
    audio = useRef<BoardAudio | null>(null),
    bootTimers = useRef<number[]>([]),
    seed = useRef<[number, number] | null>(null),
    trace = useRef<{ marks: [number, number][]; cursor: number }>({
      marks: [],
      cursor: 3,
    }),
    hold = useRef({ downAt: 0, painted: 0, frame: 0, x: 0 }),
    sequence = useRef(""),
    letterTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    command = useRef<(value: string, from?: [number, number]) => void>(() => {}),
    down = useRef(() => {}),
    up = useRef(() => {}),
    sendSymbol = useRef<(symbol: string, drawn?: boolean) => void>(() => {});
  const shown = preview ?? index,
    selected = routes[shown],
    arriving = routes[index],
    art = wallAssets[arriving.slug]?.src ? wallAssets[arriving.slug] : conceptArt[arriving.slug];
  const live = useRef({ shown, mode, narrow, boot, preview });
  live.current = { shown, mode, narrow, boot, preview };

  /** The board reads only refs, so a stale closure still draws the current state. */
  function message() {
    const { shown, mode, narrow, boot, preview } = live.current,
      g = geometry(narrow);
    const bits = boot
      ? bootBits(narrow)
      : mode === "route" || preview !== null
        ? signBits(routeSign(routes[shown], shown), narrow)
        : signBits(
            (() => {
              const [head, title, pattern, big, unit] = cards[mode];
              return { head, title, pattern, big, unit, legend: mode === "help" };
            })(),
            narrow,
          );
    for (const [x, length] of trace.current.marks)
      fillRect(bits, g.cols, x, g.traceY, length, 2);
    return bits;
  }
  function render(from?: [number, number] | null) {
    const g = geometry(live.current.narrow);
    board.current?.set(message(), { seed: from ?? [0, g.rows / 2] });
  }
  function endBoot() {
    if (!live.current.boot) return;
    bootTimers.current.forEach(clearTimeout);
    setBoot(false);
  }
  function traceCells(x: number, length: number) {
    const g = geometry(live.current.narrow),
      cells: number[] = [];
    for (let y = g.traceY; y < g.traceY + 2; y++)
      for (let col = x; col < x + length; col++) cells.push(y * g.cols + col);
    return cells;
  }
  function clearTrace() {
    for (const [x, length] of trace.current.marks)
      board.current?.paint(traceCells(x, length), false);
    trace.current = { marks: [], cursor: geometry(live.current.narrow).margin };
  }

  useEffect(() => {
    const small = matchMedia(NARROW),
      motionQuery = matchMedia(REDUCED);
    const size = () => setNarrow(small.matches),
      preference = () => setReduced(motionQuery.matches);
    small.addEventListener("change", size);
    motionQuery.addEventListener("change", preference);
    return () => {
      small.removeEventListener("change", size);
      motionQuery.removeEventListener("change", preference);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];
    bootTimers.current = timers;
    trace.current = { marks: [], cursor: geometry(narrow).margin };
    void import("./board").then(({ createBoard }) => {
      if (cancelled || !host.current) return;
      const g = geometry(narrow);
      const created = createBoard(
        host.current,
        g.cols,
        g.rows,
        (count) => {
          if (!reduced) audio.current?.flips(count);
        },
        reduced,
      );
      board.current = created;
      if (!live.current.boot || reduced) {
        created.set(message(), { instant: true });
        if (reduced) setBoot(false);
        return;
      }
      // Lamp test: every disc shows yellow, then black, as a real board does at power-on.
      created.set(new Uint8Array(DISC_COUNT).fill(1), {
        seed: [0, g.rows / 2],
        step: 2.4,
      });
      timers.push(
        window.setTimeout(
          () =>
            created.set(new Uint8Array(DISC_COUNT), {
              seed: [0, g.rows / 2],
              step: 1.8,
            }),
          520,
        ),
        window.setTimeout(
          () => created.set(message(), { seed: [0, 0], step: 3 }),
          880,
        ),
        window.setTimeout(() => setBoot(false), 2000),
      );
    });
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      board.current?.dispose();
      board.current = null;
    };
    // The board's geometry changes only with its responsive layout or motion preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrow, reduced]);
  useEffect(() => {
    if (boot) return;
    const from = seed.current;
    seed.current = null;
    render(from);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, mode, boot, preview]);
  useEffect(() => {
    if (paused || reduced || opened || boot || preview !== null) return;
    const timer = setInterval(() => {
      const box = host.current?.getBoundingClientRect();
      if (document.hidden || !box || box.bottom < 0 || box.top > innerHeight)
        return;
      if (live.current.mode !== "route") setMode("route");
      else setIndex((value) => (value + 1) % routes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, reduced, opened, boot, preview, mode]);
  useEffect(() => {
    if (reduced) {
      audio.current?.key(false);
      audio.current?.enable(false);
    } else audio.current?.enable(sound);
  }, [sound, reduced]);
  useEffect(() => {
    if (!sound || reduced) return;
    const unlock = () => {
      if (!audio.current) audio.current = createBoardAudio();
      audio.current.enable(true);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, [sound, reduced]);
  useEffect(
    () => () => {
      if (letterTimer.current) clearTimeout(letterTimer.current);
      if (previewTimer.current) clearTimeout(previewTimer.current);
      cancelAnimationFrame(hold.current.frame);
      audio.current?.dispose();
    },
    [],
  );

  command.current = (value, from) => {
    endBoot();
    setOpened(false);
    setPreview(null);
    const next: Mode = value === "W" ? "work" : value === "C" ? "contact" : "help";
    if (next === "contact") setContact(true);
    if (next === live.current.mode) render(from);
    else {
      seed.current = from ?? null;
      setMode(next);
    }
    setAnnouncement(
      next === "work"
        ? `Work: the timetable below lists ${projects.length} lines.`
        : next === "contact"
          ? "Contact details are open below the board."
          : "Key: W is dot dash dash, C is dash dot dash dot.",
    );
  };
  down.current = () => {
    if (hold.current.downAt) return;
    endBoot();
    if (letterTimer.current) clearTimeout(letterTimer.current);
    const g = geometry(live.current.narrow);
    if (trace.current.cursor + 14 > g.cols - g.margin) clearTrace();
    hold.current = { downAt: performance.now(), painted: 0, frame: 0, x: trace.current.cursor };
    setHolding(true);
    audio.current?.key(true);
    const write = () => {
      const current = hold.current;
      if (!current.downAt) return;
      const length = Math.min(
        Math.max(1, Math.round((performance.now() - current.downAt) / 20)),
        g.cols - g.margin - current.x,
      );
      if (length > current.painted) {
        board.current?.paint(
          traceCells(current.x + current.painted, length - current.painted),
          true,
        );
        current.painted = length;
      }
      current.frame = requestAnimationFrame(write);
    };
    write();
  };
  up.current = () => {
    const current = hold.current;
    if (!current.downAt) return;
    cancelAnimationFrame(current.frame);
    const g = geometry(live.current.narrow),
      duration = performance.now() - current.downAt,
      length = Math.min(
        Math.max(current.painted, Math.round(duration / 20), 1),
        g.cols - g.margin - current.x,
      );
    if (length > current.painted)
      board.current?.paint(traceCells(current.x + current.painted, length - current.painted), true);
    current.downAt = 0;
    setHolding(false);
    audio.current?.key(false);
    trace.current.marks.push([current.x, length]);
    trace.current.cursor = current.x + length + 2;
    sendSymbol.current(duration < 120 ? "." : "-");
  };
  sendSymbol.current = (symbol, drawn = true) => {
    endBoot();
    if (letterTimer.current) clearTimeout(letterTimer.current);
    if (!drawn) {
      const g = geometry(live.current.narrow),
        length = symbol === "." ? 3 : 9;
      if (trace.current.cursor + length > g.cols - g.margin) clearTrace();
      const x = trace.current.cursor;
      board.current?.paint(traceCells(x, length), true);
      trace.current.marks.push([x, length]);
      trace.current.cursor = x + length + 2;
    }
    sequence.current = (sequence.current + symbol).slice(-6);
    setPattern(sequence.current);
    letterTimer.current = setTimeout(() => {
      const g = geometry(live.current.narrow),
        received = sequence.current,
        last = trace.current.marks.at(-1),
        from: [number, number] = [last ? last[0] + last[1] : 0, g.traceY];
      trace.current = { marks: [], cursor: g.margin };
      sequence.current = "";
      setPattern("");
      const decoded = morse[received];
      if (decoded) command.current(decoded, from);
      else {
        setAnnouncement(`Received ${spoken(received)}. Send W, C or a question mark.`);
        if (live.current.mode === "help" && live.current.preview === null) render(from);
        else {
          seed.current = from;
          setPreview(null);
          setMode("help");
        }
      }
    }, 420);
  };
  useEffect(() => {
    const editable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest("input,textarea,select,a,button");
    const keydown = (event: KeyboardEvent) => {
      if (editable(event.target) || event.metaKey || event.ctrlKey || event.altKey)
        return;
      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) down.current();
      } else if (event.key === "." || event.key === "-") {
        event.preventDefault();
        sendSymbol.current(event.key, false);
      } else if (["w", "c", "?"].includes(event.key.toLowerCase()))
        command.current(event.key.toUpperCase());
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.code === "Space" && hold.current.downAt) {
        event.preventDefault();
        up.current();
      }
    };
    const cancel = () => {
      if (hold.current.downAt) up.current();
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("keyup", keyup);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
      window.removeEventListener("blur", cancel);
    };
  }, []);

  function toggleSound() {
    const value = !sound;
    if (!audio.current && value) audio.current = createBoardAudio();
    audio.current?.enable(value && !reduced);
    setSound(value);
    try {
      localStorage.setItem("gentrit-linja-sound", value ? "on" : "off");
    } catch {
      /* Sound still works without storage. */
    }
  }
  function downloadCV() {
    setCvSent(true);
    setAnnouncement("CV download requested.");
  }
  function openRoute(next: number) {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    endBoot();
    setCareFacts(false);
    setPreview(null);
    setIndex(next);
    setMode("route");
    setOpened(true);
    setAnnouncement(`${routes[next].name}. ${routes[next].line}`);
    document
      .getElementById("linja-board")
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "nearest" });
  }
  function startPreview(next: number, clientX?: number) {
    if (opened) return;
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      endBoot();
      const g = geometry(live.current.narrow),
        box = host.current?.getBoundingClientRect();
      const col =
        clientX !== undefined && box
          ? Math.round(((clientX - box.left) / box.width) * g.cols)
          : 0;
      seed.current = [Math.min(Math.max(col, 0), g.cols - 1), g.rows - 1];
      setPreview(next);
    }, 140);
  }
  function endPreview() {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      const g = geometry(live.current.narrow);
      seed.current = [0, g.rows - 1];
      setPreview(null);
    }, 180);
  }
  function returnToBoard() {
    setOpened(false);
    host.current?.focus({ preventScroll: true });
  }
  function pointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      /* A synthetic pointer has no capture; the key still works. */
    }
    down.current();
  }
  const keyHandlers = {
    onPointerDown: pointerDown,
    onPointerUp: () => up.current(),
    onPointerCancel: () => up.current(),
    onKeyDown: (event: KeyEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        if (!event.repeat) down.current();
      }
    },
    onKeyUp: (event: KeyEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        up.current();
      }
    },
  };
  const instant = { duration: 0.01 };
  const switches = (
    <>
      <button
        className="linja-pause"
        onClick={() => setPaused((value) => !value)}
        aria-pressed={paused || reduced}
        disabled={reduced}
      >
        {paused || reduced ? "Paused" : "Pause"}
      </button>
      <button
        className="linja-sound"
        onClick={toggleSound}
        aria-pressed={sound && !reduced}
        disabled={reduced}
      >
        Sound {sound && !reduced ? "on" : "off"}
      </button>
    </>
  );

  return (
    <LayoutGroup id="linja">
      <main className="linja" data-reduced={reduced}>
        <title>LINJA — Gentrit Rashiti</title>
        <h1 className="linja-sr">Gentrit Rashiti — project departures</h1>
        <div className="linja-housing">
          <header className="linja-bezel">
            <p>
              <b>Gentrit Rashiti</b>
              <span>Web, mobile &amp; full stack · Kosovo</span>
            </p>
            <a href={links.cv} download onClick={downloadCV}>
              {cvSent ? "CV sent" : "CV"} <span aria-hidden="true">↓</span>
            </a>
          </header>
          <section
            className="linja-display"
            id="linja-board"
            aria-label={`Destination: ${selected.name}`}
          >
            <div
              className="linja-board"
              ref={host}
              role="group"
              tabIndex={0}
              aria-label="Morse board: hold Space, or type dots and dashes"
              onPointerDown={pointerDown}
              onPointerUp={() => up.current()}
              onPointerCancel={() => up.current()}
            />
            <span className="linja-sr" aria-live="off">
              Line {two(shown)}. {selected.name}. {selected.line}
            </span>
            <AnimatePresence initial={false}>
              {opened && (
                <motion.div
                  className="linja-arrival"
                  key={arriving.slug}
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  transition={
                    reduced
                      ? instant
                      : {
                          ...spring.ui,
                          opacity: { duration: dur.ui },
                          filter: { duration: dur.ui },
                        }
                  }
                >
                  <div className="linja-arrival-picture" data-art={!!art}>
                    {art ? (
                      <img
                        src={art.src}
                        alt={
                          art.recreation
                            ? "Recreation with invented data"
                            : `${arriving.name} public screen`
                        }
                      />
                    ) : (
                      <p aria-hidden="true">
                        <span>{two(index)}</span>
                        {arriving.name}
                      </p>
                    )}
                    <span>
                      {art?.recreation
                        ? "Recreation · invented data"
                        : art
                          ? "Public project imagery"
                          : arriving.kind}
                    </span>
                  </div>
                  <article
                    onKeyDown={(event) => {
                      if (event.key === "Escape") returnToBoard();
                    }}
                  >
                    <button autoFocus className="linja-close" onClick={returnToBoard}>
                      Back to the board
                    </button>
                    <p className="linja-label">
                      Line {two(index)} · {arriving.years ?? "Freelance"} ·{" "}
                      {arriving.kind}
                    </p>
                    <motion.h2
                      layoutId={`destination-${arriving.slug}`}
                      transition={reduced ? instant : spring.ui}
                    >
                      {arriving.name}
                    </motion.h2>
                    {arriving.slug === "care-platform" && (
                      <button
                        className="linja-file"
                        aria-expanded={careFacts}
                        onClick={() => setCareFacts((value) => !value)}
                      >
                        <motion.span
                          className="linja-file-flip"
                          animate={{
                            rotateY: careFacts ? 180 : 0,
                            z: careFacts ? 36 : 0,
                            scale: careFacts ? 1.02 : 1,
                          }}
                          transition={reduced ? instant : spring.ui}
                        >
                          <span className="linja-file-paper" aria-hidden={careFacts}>
                            Confidential case file
                          </span>
                          <span className="linja-file-back" aria-hidden={!careFacts}>
                            Decision records · Parity tests · 16 → 2 queries
                          </span>
                        </motion.span>
                        <span>{careFacts ? "Close the file" : "Open the file"}</span>
                      </button>
                    )}
                    <p>{arriving.summary}</p>
                    <p className="linja-label">{arriving.stack.join(" · ")}</p>
                    <div className="linja-links">
                      {arriving.featured && (
                        <a href={`/work/${arriving.slug}`}>Complete case →</a>
                      )}
                      {arriving.links.map((link) => (
                        <a key={link.href} href={link.href} target="_blank" rel="noreferrer">
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  </article>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
        <div className="linja-paper">
          <div className="linja-controls">
            <p className="linja-now">
              <span className="linja-plate">{two(shown)}</span>
              <span>
                <strong>{selected.name}</strong>
                <small>
                  {selected.kind} · {selected.years ?? "Freelance"}
                </small>
              </span>
            </p>
            <div className="linja-strip">
              <motion.button
                className="linja-quick-key"
                animate={{ rotateX: holding ? -8.8 : 0, y: holding ? 2 : 0 }}
                transition={reduced ? instant : spring.ui}
                data-held={holding}
                aria-label="Morse key: hold for a dash, tap for a dot"
                {...keyHandlers}
              >
                <i aria-hidden="true" />
                <output aria-live="off">{pattern ? spoken(pattern) : "Key"}</output>
              </motion.button>
              {switches}
              <button className="linja-help" onClick={() => command.current("?")} aria-label="Show the Morse key on the board">
                ?
              </button>
            </div>
            <button className="linja-open" onClick={() => openRoute(shown)}>
              <span>Open {selected.name}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <AnimatePresence initial={false}>
            {contact && (
              <motion.section
                className="linja-contact"
                aria-label="Contact"
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                transition={reduced ? instant : { duration: dur.panel }}
              >
                <p className="linja-label">C · — · — · Contact</p>
                <a className="linja-email" href={`mailto:${links.email}`}>
                  {links.email}
                </a>
                <div>
                  <a href={links.linkedin} target="_blank" rel="noreferrer">
                    LinkedIn ↗
                  </a>
                  <a href={links.github} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                  <a href={links.cv} download onClick={downloadCV}>
                    {cvSent ? "CV sent" : "Download CV"} ↓
                  </a>
                  <button onClick={() => setContact(false)}>Close</button>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
          <section className="linja-timetable" id="linja-routes" aria-labelledby="linja-departures">
            <div className="linja-table-head">
              <h2 id="linja-departures">Departures</h2>
              <p className="linja-label">
                {routes.length} lines · 2021–2026
              </p>
            </div>
            <div className="linja-colheads" aria-hidden="true">
              {[0, 1].map((column) => (
                <p key={column}>
                  <span>Line</span>
                  <span>Destination</span>
                  <span>Via</span>
                  <span>Years</span>
                </p>
              ))}
            </div>
            <ol className="linja-lines">
              {routes.map((project, i) => (
                <li
                  key={project.slug}
                  data-current={index === i}
                  data-preview={preview === i && index !== i}
                  style={{ "--i": Math.min(i % 14, 11) } as CSSProperties}
                >
                  <button
                    onClick={() => openRoute(i)}
                    onPointerEnter={(event) => {
                      if (event.pointerType === "mouse") startPreview(i, event.clientX);
                    }}
                    onPointerLeave={(event) => {
                      if (event.pointerType === "mouse") endPreview();
                    }}
                    onFocus={() => startPreview(i)}
                    onBlur={endPreview}
                    aria-current={index === i ? "true" : undefined}
                  >
                    <span className="linja-no">{two(i)}</span>
                    {opened && index === i ? (
                      <span className="linja-dest">{project.name}</span>
                    ) : (
                      <motion.span
                        className="linja-dest"
                        layoutId={`destination-${project.slug}`}
                        transition={reduced ? instant : spring.ui}
                      >
                        {project.name}
                      </motion.span>
                    )}
                    <span className="linja-via">{project.kind}</span>
                    <span className="linja-years">{project.years ?? "—"}</span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="linja-legend">
              <h3 className="linja-label">Key</h3>
              {codes.map(([letter, code, label]) => (
                <button
                  key={letter}
                  onClick={() =>
                    command.current(letter, [0, geometry(narrow).rows - 1])
                  }
                >
                  <b>{letter}</b>
                  <span className="linja-marks" aria-label={spoken(code)}>
                    {code.split("").map((mark, i) => (
                      <i key={i} data-mark={mark === "." ? "dit" : "dah"} />
                    ))}
                  </span>
                  <span>{label}</span>
                </button>
              ))}
              <span className="linja-phone-switches">{switches}</span>
              <a
                href={
                  projects.find((p) => p.slug === "morse-trainer")?.links[0]?.href ??
                  links.github
                }
                target="_blank"
                rel="noreferrer"
              >
                Morse Trainer ↗
              </a>
            </div>
          </section>
          <p className="linja-sr" role="status">
            {announcement}
          </p>
          <footer className="linja-footer">
            <span>Gentrit Rashiti · Kosovo · Web, mobile &amp; full stack</span>
            <nav aria-label="Elsewhere">
              <a href={`mailto:${links.email}`}>Email</a>
              <a href={links.linkedin} target="_blank" rel="noreferrer">
                LinkedIn ↗
              </a>
              <a href={links.github} target="_blank" rel="noreferrer">
                GitHub ↗
              </a>
              <a href={links.cv} download onClick={downloadCV}>
                CV ↓
              </a>
              <a href="/drafts">All directions</a>
            </nav>
          </footer>
        </div>
      </main>
    </LayoutGroup>
  );
}
