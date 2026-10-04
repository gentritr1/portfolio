import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { spring, dur } from "./motion";
import { projects, type Project } from "../../content/projects";
import { links } from "../../content/links";
import { wallAssets } from "../../components/portfolio/wallAssets";
import { DISC_COUNT, fillRect, imageBits, putText } from "./bitmap";
import type { Board } from "./board";
import { createBoardAudio, type BoardAudio } from "./audio";
import "./linja.css";

const routeOrder = [
  "bayyinah-tv",
  "care-platform",
  "read-to-feed",
  "viva-fresh",
  "incentiv",
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
const labels: Record<string, [string, string, string]> = {
  "bayyinah-tv": ["BAYYINAH TV", "34 ROUTES", "EN / AR"],
  "care-platform": ["CARE PLATFORM", "31 ADRS", "16 -> 2 QUERIES"],
  "read-to-feed": ["READ TO FEED", "ABOUT 14", "RELEASES"],
  "viva-fresh": ["VIVA FRESH", "IOS + ANDROID", "LOYALTY / APPS"],
  incentiv: ["INCENTIV", "PASSKEYS", "WALLET UI"],
  fjale: ["FJALË", "21K WORDS", "ALBANIAN WORDS"],
  "morse-trainer": ["MORSE TRAINER", "DIT 60 MS", "FARNSWORTH"],
  za: ["ZA!", "2-8 PLAYERS", "SERVER AUTH"],
  "snaxx-tech": ["SNAXX TECH", "972 -> 337 KB", "PUBLIC IMAGES"],
};
const boardNames: Record<string, string> = {
  "care-api": "CARE API",
  "design-system-react": "REACT UI",
  "design-system-vue": "VUE UI",
  "design-dashboard": "DESIGN LAB",
  "bayyinah-institute": "BAYYINAH INSTITUTE",
  "dukagjini-bookstore": "DUKAGJINI BOOKSTORE",
  "chatbot-runtime": "CHATBOT KIT",
  "chatbot-runtime-web": "CHATBOT WEB",
  "epub-reader-prototype": "EPUB READER",
  "donation-app": "SADAQAH",
  "coaching-app": "COACHING",
  "fuel-loyalty-app": "FUEL LOYALTY",
  "member-portal": "MEMBER WEB",
  "ai-dashboard": "AI DASHBOARD",
  offday: "OFFDAY",
  "geo-guesser": "GEO GUESSER",
  futurisma: "FUTURISMA",
  "secret-dictator": "SECRET DICTATOR",
  "open-source-forks": "OPEN SOURCE",
};
const morse: Record<string, string> = {
  ".--": "W",
  "-.-.": "C",
  "..--..": "?",
};
function initialSound() {
  try {
    return localStorage.getItem("gentrit-linja-sound") === "on";
  } catch {
    return false;
  }
}
function selectedMobileFact(slug: string, detail: string) {
  return slug === "care-platform"
    ? "16→2"
    : slug === "read-to-feed"
      ? "RELEASES"
      : detail
          .replace(/react native/i, "RN")
          .replace("ALBANIAN WORDS", "ALBANIAN")
          .replace("PUBLIC IMAGES", "IMAGES")
          .replace("LOYALTY / APPS", "LOYALTY");
}
function boardMessage(
  project: Project,
  narrow: boolean,
  image: HTMLImageElement | null,
  mode: string,
) {
  const cols = narrow ? 72 : 144,
    rows = narrow ? 96 : 48,
    bits = new Uint8Array(DISC_COUNT);
  const [name, fact, detail] = labels[project.slug] ?? [
    boardNames[project.slug] ?? project.name.toUpperCase(),
    project.years ?? "PERSONAL",
    project.stack[0] ?? project.kind,
  ];
  if (mode === "boot") {
    if (narrow) {
      putText(bits, cols, "GENTRIT", 4, 3);
      putText(bits, cols, "RASHITI", 4, 12);
      fillRect(bits, cols, 4, 23, 64, 1);
      putText(bits, cols, "WEB", 4, 30);
      putText(bits, cols, "MOBILE", 4, 41);
      putText(bits, cols, "FULL STACK", 4, 52);
      putText(bits, cols, "→", 23, 67, 4);
    } else {
      putText(bits, cols, "GENTRIT RASHITI", 4, 3);
      fillRect(bits, cols, 4, 13, 86, 1);
      putText(bits, cols, "WEB · MOBILE", 4, 19);
      putText(bits, cols, "FULL STACK", 4, 33);
      fillRect(bits, cols, 96, 0, 48, 48);
      putText(bits, cols, "→", 103, 7, 5, true);
    }
    return bits;
  }
  if (mode === "contact") {
    fillRect(bits, cols, 2, 2, cols - 4, 11);
    putText(bits, cols, "CONTACT", 6, 4, 1, true);
    (narrow
      ? ["GENTRIT", "RASHITI", "EMAIL / CV", "BELOW"]
      : ["GENTRIT RASHITI", "EMAIL / CV BELOW"]
    ).forEach((text, i) => putText(bits, cols, text, 5, 20 + i * 11));
    return bits;
  }
  if (mode === "help") {
    fillRect(bits, cols, 2, 2, cols - 4, 11);
    putText(bits, cols, "THE KEY", 6, 4, 1, true);
    ["W  .--", "C  -.-.", "?  ..--.."].forEach((text, i) =>
      putText(bits, cols, text, 5, 19 + i * 10),
    );
    return bits;
  }
  if (narrow) {
    putText(bits, cols, project.channel.toUpperCase(), 4, 3);
    putText(
      bits,
      cols,
      "LINE " + String(routes.indexOf(project) + 1).padStart(2, "0"),
      4,
      12,
    );
    fillRect(bits, cols, 4, 23, 64, 1);
    const words: string[] = [];
    for (const word of name.split(" ")) {
      const last = words.length - 1;
      if (last >= 0 && words[last].length + word.length + 1 <= 11)
        words[last] += " " + word;
      else words.push(word);
    }
    words
      .slice(0, 2)
      .forEach((word, i) =>
        putText(bits, cols, word.slice(0, 11), 4, 28 + i * 9),
      );
    putText(bits, cols, fact.slice(0, 11), 4, 49);
    putText(
      bits,
      cols,
      selectedMobileFact(project.slug, detail).slice(0, 11),
      4,
      59,
    );
    const privateCase = project.slug === "care-platform";
    if (privateCase) putText(bits, cols, "QUERIES", 4, 68);
    if (image) {
      const imageHeight = privateCase ? 16 : 25;
      const imageTop = privateCase ? 78 : 69;
      const picture = imageBits(image, 64, imageHeight);
      for (let y = 0; y < imageHeight; y++)
        for (let x = 0; x < 64; x++)
          bits[(y + imageTop) * cols + x + 4] = picture[y * 64 + x];
    } else {
      fillRect(bits, cols, 4, 73, 64, 18);
      putText(bits, cols, "WEB MOBILE", 6, 78, 1, true);
    }
  } else {
    putText(
      bits,
      cols,
      String(routes.indexOf(project) + 1).padStart(2, "0") +
        " / " +
        project.channel.toUpperCase(),
      4,
      3,
    );
    fillRect(bits, cols, 4, 13, 86, 1);
    putText(bits, cols, name.length > 15 ? name.split(" ")[0] : name, 4, 18);
    putText(bits, cols, fact.slice(0, 15), 4, 29);
    putText(bits, cols, detail.slice(0, 15), 4, 39);
    fillRect(bits, cols, 94, 0, 1, rows);
    if (image) {
      const picture = imageBits(image, 48, 48);
      for (let y = 0; y < 48; y++)
        for (let x = 0; x < 48; x++)
          bits[y * cols + x + 96] = picture[y * 48 + x];
    } else {
      fillRect(bits, cols, 98, 3, 42, 42);
      putText(bits, cols, "WEB", 105, 9, 1, true);
      putText(bits, cols, "MOBILE", 101, 21, 1, true);
      putText(bits, cols, "STACK", 102, 33, 1, true);
    }
  }
  return bits;
}

export default function Draft() {
  const [index, setIndex] = useState(0),
    [mode, setMode] = useState("work"),
    [opened, setOpened] = useState(false),
    [paused, setPaused] = useState(false),
    [cvSent, setCvSent] = useState(false),
    [careFacts, setCareFacts] = useState(false);
  const [narrow, setNarrow] = useState(
      () => matchMedia("(max-width:650px)").matches,
    ),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  const [boot, setBoot] = useState(
    () => !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [sound, setSound] = useState(initialSound),
    [pattern, setPattern] = useState(""),
    [announcement, setAnnouncement] = useState(""),
    [holding, setHolding] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const host = useRef<HTMLDivElement>(null),
    board = useRef<Board | null>(null),
    audio = useRef<BoardAudio | null>(null),
    downAt = useRef(0),
    sequence = useRef(""),
    letterTimer = useRef<ReturnType<typeof setTimeout> | null>(null),
    command = useRef<(value: string) => void>(() => {}),
    down = useRef(() => {}),
    up = useRef(() => {}),
    sendSymbol = useRef<(symbol: string) => void>(() => {});
  const selected = routes[index],
    art = wallAssets[selected.slug],
    cols = narrow ? 72 : 144;
  const currentMessage = useRef({
    selected,
    narrow,
    image,
    mode: boot ? "boot" : mode,
  });
  currentMessage.current = {
    selected,
    narrow,
    image,
    mode: boot ? "boot" : mode,
  };
  useEffect(() => {
    if (reduced) {
      setBoot(false);
      return;
    }
    const timer = setTimeout(() => setBoot(false), 1600);
    return () => clearTimeout(timer);
  }, [reduced]);
  useEffect(() => {
    const small = matchMedia("(max-width:650px)"),
      motion = matchMedia("(prefers-reduced-motion: reduce)");
    const size = () => setNarrow(small.matches),
      preference = () => setReduced(motion.matches);
    small.addEventListener("change", size);
    motion.addEventListener("change", preference);
    return () => {
      small.removeEventListener("change", size);
      motion.removeEventListener("change", preference);
    };
  }, []);
  useEffect(() => {
    let cancelled = false;
    setImage(null);
    if (art) {
      const next = new Image();
      next.onload = () => {
        if (!cancelled) setImage(next);
      };
      next.src = art.src;
    }
    return () => {
      cancelled = true;
    };
  }, [art]);
  useEffect(() => {
    let cancelled = false;
    void import("./board").then(({ createBoard }) => {
      if (cancelled || !host.current) return;
      board.current = createBoard(
        host.current,
        narrow ? 72 : 144,
        narrow ? 96 : 48,
        (count) => {
          if (!reduced) audio.current?.flips(count);
        },
        reduced,
      );
      const latest = currentMessage.current;
      board.current.set(
        boardMessage(latest.selected, latest.narrow, latest.image, latest.mode),
        reduced,
      );
    });
    return () => {
      cancelled = true;
      board.current?.dispose();
      board.current = null;
    };
    // The board's geometry changes only with its responsive layout or motion preference.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrow, reduced]);
  useEffect(() => {
    board.current?.set(
      boardMessage(selected, narrow, image, boot ? "boot" : mode),
      reduced || paused,
      [cols * 0.22, 12],
    );
  }, [selected, narrow, image, mode, reduced, cols, paused, boot]);
  useEffect(() => {
    board.current?.pause(paused);
  }, [paused]);
  useEffect(() => {
    if (paused || reduced || opened || mode !== "work") return;
    const timer = setInterval(() => {
      if (
        !document.hidden &&
        host.current &&
        host.current.getBoundingClientRect().bottom > 0 &&
        host.current.getBoundingClientRect().top < innerHeight
      )
        setIndex((value) => (value + 1) % routes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused, reduced, opened, mode]);
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
      audio.current?.dispose();
    },
    [],
  );
  command.current = (value) => {
    setOpened(false);
    setPaused(true);
    if (value === "W") {
      setMode("work");
      document
        .getElementById("linja-routes")
        ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
    }
    if (value === "C") setMode("contact");
    if (value === "?") setMode("help");
    setAnnouncement(
      `${value === "W" ? "Work timetable" : value === "C" ? "Contact" : "Morse key"} selected.`,
    );
  };
  down.current = () => {
    if (downAt.current) return;
    if (letterTimer.current) clearTimeout(letterTimer.current);
    downAt.current = performance.now();
    setHolding(true);
    audio.current?.key(true);
  };
  up.current = () => {
    if (!downAt.current) return;
    const duration = performance.now() - downAt.current;
    downAt.current = 0;
    setHolding(false);
    audio.current?.key(false);
    sendSymbol.current(duration < 120 ? "." : "-");
  };
  sendSymbol.current = (symbol) => {
    if (letterTimer.current) clearTimeout(letterTimer.current);
    sequence.current += symbol;
    sequence.current = sequence.current.slice(-6);
    setPattern(sequence.current);
    letterTimer.current = setTimeout(() => {
      const decoded = morse[sequence.current];
      if (decoded) command.current(decoded);
      else
        setAnnouncement(`Received ${sequence.current}. Try W: dot dash dash.`);
      sequence.current = "";
    }, 420);
  };
  useEffect(() => {
    const editable = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      !!target.closest("input,textarea,select,a,button");
    const keydown = (event: KeyboardEvent) => {
      if (
        editable(event.target) ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) down.current();
      } else if (event.key === "." || event.key === "-") {
        event.preventDefault();
        sendSymbol.current(event.key);
      } else if (["w", "c", "?"].includes(event.key.toLowerCase()))
        command.current(event.key.toUpperCase());
    };
    const keyup = (event: KeyboardEvent) => {
      if (event.code === "Space" && downAt.current) {
        event.preventDefault();
        up.current();
      }
    };
    const cancel = () => {
      if (downAt.current) {
        downAt.current = 0;
        setHolding(false);
        audio.current?.key(false);
      }
      if (letterTimer.current) clearTimeout(letterTimer.current);
      sequence.current = "";
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
    setCareFacts(false);
    setIndex(next);
    setMode("work");
    setOpened(true);
    setPaused(false);
    setAnnouncement(`${routes[next].name}. ${routes[next].line}`);
    document
      .getElementById("linja-board")
      ?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
  }
  function cancelKey() {
    downAt.current = 0;
    setHolding(false);
    audio.current?.key(false);
  }
  function returnToBoard() {
    setOpened(false);
    host.current?.focus({ preventScroll: true });
  }
  function pointerDown(event: PointerEvent<HTMLElement>) {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    down.current();
  }
  return (
    <LayoutGroup id="linja">
      <main className="linja" data-reduced={reduced}>
        <title>LINJA — Gentrit Rashiti</title>
        <h1 className="linja-sr">Gentrit Rashiti — project departures</h1>
        <header className="linja-header">
          <a href="/drafts" aria-label="Back to all drafts">
            All directions <span aria-hidden="true">↗</span>
          </a>
          <p>
            Gentrit Rashiti <span>Kosovo · Web, mobile & full stack</span>
          </p>
          <a href={links.cv} download onClick={downloadCV}>
            {cvSent ? "CV requested" : "CV"} <span aria-hidden="true">↓</span>
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
            onPointerCancel={cancelKey}
          />
          <span className="linja-sr" aria-live="off">
            Gentrit Rashiti. {selected.name}.{" "}
            {(labels[selected.slug] ?? []).slice(1).join(". ")}. {selected.line}
          </span>
          <AnimatePresence initial={false}>
            {opened && mode === "work" && (
              <motion.div
                className="linja-arrival"
                key={selected.slug}
                initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                transition={
                  reduced
                    ? { duration: 0.01 }
                    : {
                        ...spring.ui,
                        opacity: { duration: dur.ui },
                        filter: { duration: dur.ui },
                      }
                }
              >
                <div className="linja-arrival-picture">
                  {art ? (
                    <img
                      src={art.src}
                      alt={
                        art.recreation
                          ? "Recreation with invented data"
                          : `${selected.name} public screen`
                      }
                    />
                  ) : (
                    <div className="linja-arrival-type">{selected.name}</div>
                  )}
                  <span>
                    {art?.recreation
                      ? "Recreation · invented data"
                      : art
                        ? "Public project imagery"
                        : "Personal project"}
                  </span>
                </div>
                <article
                  onKeyDown={(event) => {
                    if (event.key === "Escape") returnToBoard();
                  }}
                >
                  <button
                    autoFocus
                    className="linja-close"
                    onClick={returnToBoard}
                  >
                    Back to the board
                  </button>
                  <p>
                    {selected.years ?? "Personal project"} / {selected.kind}
                  </p>
                  <motion.h2
                    layoutId={`destination-${selected.slug}`}
                    transition={reduced ? { duration: 0.01 } : spring.ui}
                  >
                    {selected.name}
                  </motion.h2>
                  {selected.slug === "care-platform" && (
                    <motion.button
                      className="linja-file"
                      aria-expanded={careFacts}
                      onClick={() => setCareFacts((value) => !value)}
                      transition={reduced ? { duration: 0.01 } : spring.ui}
                    >
                      <motion.span
                        className="linja-file-flip"
                        animate={{
                          rotateY: careFacts ? 180 : 0,
                          z: careFacts ? 36 : 0,
                          scale: careFacts ? 1.02 : 1,
                        }}
                        transition={reduced ? { duration: 0.01 } : spring.ui}
                      >
                        <span
                          className="linja-file-paper"
                          aria-hidden={careFacts}
                        >
                          Confidential case file
                        </span>
                        <span
                          className="linja-file-back"
                          aria-hidden={!careFacts}
                        >
                          31 ADRs · Parity tests · 16 → 2 queries
                        </span>
                      </motion.span>
                      <span>
                        {careFacts
                          ? "Facts open · close file"
                          : "Open project facts"}
                      </span>
                    </motion.button>
                  )}
                  <p>{selected.summary}</p>
                  <p>{selected.stack.join(" · ")}</p>
                  <div className="linja-links">
                    {selected.featured && (
                      <a href={`/work/${selected.slug}`}>Complete case ↗</a>
                    )}
                    {selected.links.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {link.label} ↗
                      </a>
                    ))}
                  </div>
                </article>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        <div className="linja-controls">
          <div className="linja-current">
            <strong>
              {String(index + 1).padStart(2, "0")} / {selected.name}
            </strong>
            <span>
              {mode === "work"
                ? art?.recreation
                  ? "Recreation · invented data"
                  : paused || reduced
                    ? "Board paused · select a departure"
                    : "Next line every 6 seconds"
                : mode === "help"
                  ? "W for work · C for contact"
                  : "Email, CV and profile below"}
            </span>
          </div>
          <button className="linja-open" onClick={() => openRoute(index)}>
            Open {selected.name} <span aria-hidden="true">↗</span>
          </button>
          <div className="linja-switches">
            <motion.button
              animate={{ rotateX: holding ? -8.8 : 0, y: holding ? 2 : 0 }}
              whileHover={reduced ? {} : { y: -1 }}
              whileFocus={reduced ? {} : { y: -1 }}
              transition={reduced ? { duration: 0.01 } : spring.ui}
              className="linja-quick-key"
              data-held={holding}
              aria-label="Hold the Morse key"
              onPointerDown={pointerDown}
              onPointerUp={() => up.current()}
              onPointerCancel={cancelKey}
              onKeyDown={(event) => {
                if (event.code === "Space" || event.code === "Enter") {
                  event.preventDefault();
                  if (!event.repeat) down.current();
                }
              }}
              onKeyUp={(event) => {
                if (event.code === "Space" || event.code === "Enter") {
                  event.preventDefault();
                  up.current();
                }
              }}
            >
              {holding ? "Key down" : pattern ? "Signal sent" : "Hold / tap"}
            </motion.button>
            <button
              onClick={() => setPaused((value) => !value)}
              aria-pressed={paused}
              disabled={reduced}
            >
              {paused || reduced ? "Paused" : "Pause"}
            </button>
            <button
              onClick={toggleSound}
              aria-pressed={sound && !reduced}
              disabled={reduced}
            >
              Sound {sound && !reduced ? "on" : "off"}
            </button>
            <button
              onClick={() => command.current("?")}
              aria-label="Show Morse key"
            >
              ?
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {mode === "contact" && (
            <motion.section
              className="linja-contact"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              transition={
                reduced ? { duration: 0.01 } : { duration: dur.panel }
              }
            >
              <h2>Send a signal.</h2>
              <a href={`mailto:${links.email}`}>{links.email}</a>
              <div>
                <a href={links.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href={links.github} target="_blank" rel="noreferrer">
                  GitHub
                </a>
                <a href={links.cv} download onClick={downloadCV}>
                  {cvSent ? "CV requested" : "Download CV"}
                </a>
                <button onClick={() => command.current("W")}>
                  Back to work
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
        <section className="linja-routing" id="linja-routes">
          <div className="linja-timetable">
            <div className="linja-table-heading">
              <h2>Departures</h2>
              <span>28 projects · 2021–2026</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th scope="col">Line / Project</th>
                  <th scope="col">Year</th>
                  <th scope="col">Platform</th>
                  <th scope="col">
                    <span className="linja-sr">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {routes.map((project, i) => (
                  <tr key={project.slug} data-current={index === i}>
                    <th scope="row">
                      <button onClick={() => openRoute(i)}>
                        <span>{String(i + 1).padStart(2, "0")}</span>
                        <motion.span
                          layoutId={`destination-${project.slug}`}
                          transition={reduced ? { duration: 0.01 } : spring.ui}
                        >
                          {project.name}
                        </motion.span>
                      </button>
                    </th>
                    <td>{project.years ?? "—"}</td>
                    <td>
                      {project.stack.includes("React Native")
                        ? "iOS / Android"
                        : project.kind}
                    </td>
                    <td aria-hidden="true">↗</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <aside className="linja-key">
            <h2>A different way in.</h2>
            <p>
              Morse Trainer became a way to move through the work. Hold the key
              for a short dit or a longer dah.
            </p>
            <motion.button
              animate={{ rotateX: holding ? -7.5 : 0, y: holding ? 2 : 0 }}
              whileHover={reduced ? {} : { y: -2 }}
              whileFocus={reduced ? {} : { y: -2 }}
              transition={reduced ? { duration: 0.01 } : spring.ui}
              className="linja-telegraph"
              data-held={holding}
              aria-label="Morse key: hold Space or pointer for a dash, tap for a dot"
              onPointerDown={pointerDown}
              onPointerUp={() => up.current()}
              onPointerCancel={cancelKey}
              onKeyDown={(e) => {
                if (e.code === "Space" || e.code === "Enter") {
                  e.preventDefault();
                  if (!e.repeat) down.current();
                }
              }}
              onKeyUp={(e) => {
                if (e.code === "Space" || e.code === "Enter") {
                  e.preventDefault();
                  up.current();
                }
              }}
            >
              <span>
                {holding ? "Signal" : pattern ? "Signal sent" : "Hold / tap"}
              </span>
              <i aria-hidden="true" />
            </motion.button>
            <output>{pattern || "· —"}</output>
            <div className="linja-code">
              <button onClick={() => command.current("W")}>
                <b>W</b>
                <span>· — —</span>
                <span>Work</span>
              </button>
              <button onClick={() => command.current("C")}>
                <b>C</b>
                <span>— · — ·</span>
                <span>Contact</span>
              </button>
              <button onClick={() => command.current("?")}>
                <b>?</b>
                <span>· · — — · ·</span>
                <span>Key</span>
              </button>
            </div>
            <p className="linja-timing">
              Dit 60 ms · dah 180 ms
              <br />
              Farnsworth letter space 420 ms
            </p>
            <a
              href={
                projects.find((p) => p.slug === "morse-trainer")?.links[0]
                  ?.href ?? links.github
              }
              target="_blank"
              rel="noreferrer"
            >
              Explore Morse Trainer ↗
            </a>
          </aside>
        </section>
        <p className="linja-sr" role="status">
          {announcement}
        </p>
        <footer>
          <span>Gentrit Rashiti · Kosovo</span>
          <a href={`mailto:${links.email}`}>Contact</a>
          <a href="/drafts">All directions</a>
        </footer>
      </main>
    </LayoutGroup>
  );
}
