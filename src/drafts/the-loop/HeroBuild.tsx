import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { BrowserFrame } from "../../components/BrowserFrame";
import { onPointer } from "./cursor";
import { APPROVED_AT, BUILD_DONE, CHECKS_AT, checkRows, H, pieces, PRESS, testFile, testLines, W, WEEK, WEEK_SMALL, type Piece } from "./data";
import { Replay } from "./icons";
import { useLights } from "./LampMark";
import { useReducedMotion } from "./hooks";
import { OUT, ROOM_QUERY, sheen, SHEEN_AFTER } from "./room";
import { Seal } from "./Seal";
import "./hero.css";

const pct = (n: number, of: number) => `${((n / of) * 100).toFixed(4)}%`;

export function pieceStyle(p: Piece): CSSProperties {
  const timing = { animationDelay: `${p.at}ms`, animationDuration: `${p.len}ms` };
  if (p.wipe === "drop") {
    return {
      ...timing,
      left: pct(p.x, W),
      top: pct(p.y, H),
      width: pct(p.w, W),
      height: pct(p.h, H),
      backgroundPosition: `${((-p.x / W) * 100).toFixed(4)}cqw ${((-p.y / H) * 100).toFixed(4)}cqh`,
    } as CSSProperties;
  }
  // A structural piece covers the whole screen and shows its part through a clip, so every piece snaps to the same box.
  return {
    ...timing,
    inset: 0,
    backgroundPosition: `${(((p.x - (p.sx ?? p.x)) / W) * 100).toFixed(4)}cqw 0`,
    "--t": pct(p.y, H),
    "--r": pct(W - p.x - p.w, W),
    "--b": pct(H - p.y - p.h, H),
    "--l": pct(p.x, W),
  } as CSSProperties;
}

type Stop = { press: number; piece: number; fx: number; fy: number };

/**
 * Three agents place the parts of the screen. A stop is a point in a piece's box (0 to 1 of its width and height) and
 * the press there, which starts the parts of that stop (`PRESS` in data.ts). No stop is right of Thursday, so a name
 * label stays inside a 343 px screen. `from` is where the agent comes in from, in capture pixels from its first stop.
 */
const agents: Array<{ name: string; tone: string; from: [number, number]; stops: Stop[] }> = [
  {
    name: "Agent · grid",
    tone: "grid",
    from: [300, 240],
    stops: [
      { press: PRESS.sidebar, piece: 0, fx: 0.5, fy: 0.12 },
      { press: PRESS.grid, piece: 5, fx: 0.4, fy: 0.37 },
    ],
  },
  {
    name: "Agent · filters",
    tone: "filters",
    from: [240, 300],
    stops: [
      { press: PRESS.toolbar, piece: 2, fx: 0.4, fy: 0.75 },
      { press: PRESS.dayRow, piece: 3, fx: 0.55, fy: 0.5 },
    ],
  },
  {
    name: "Agent · events",
    tone: "events",
    from: [420, -60],
    stops: [
      { press: PRESS.eventsA, piece: 12, fx: 0.35, fy: 0.5 },
      { press: PRESS.eventsB, piece: 21, fx: 0.3, fy: 0.5 },
    ],
  },
];

/** The agents leave together when the last piece has appeared, before the checks fill. */
const LEAVE_AT = Math.max(...pieces.map((p) => p.at + p.len));
const LEAVE_MS = 240;
const ENTER_MS = 600;
/** An agent stands still this long at a stop before it presses. */
const REST = 230;
const PRESS_IN = 70;
const PRESS_OUT = 120;

/** The y of a CSS cubic-bezier with these control points at time x, by bisection. */
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}
const travel = bezier(0.45, 0, 0.2, 1);

/** A move takes longer for a longer way: 500 to 800 ms, by the distance in capture pixels. */
const moveMs = (distance: number) => Math.max(500, Math.min(800, 380 + distance * 0.32));

/**
 * One agent's runs: the move along curved paths between its stops, and the press of its arrow tip. A move is a
 * quadratic curve that bends to one side by a fifth of its length, sampled each 20 ms on a cubic-bezier(0.45, 0, 0.2, 1) ease, so the
 * WAAPI run between two samples is linear.
 */
function cursorRuns(node: HTMLElement, tip: HTMLElement, from: [number, number], stops: Stop[], scale: number) {
  const points = stops.map(({ piece, fx, fy, press }) => {
    const p = pieces[piece];
    return { x: p.x + p.w * fx, y: p.y + p.h * fy, press };
  });
  const end = LEAVE_AT + LEAVE_MS;
  const offset = (ms: number) => Math.min(1, Math.max(0, ms / end));
  const place = (x: number, y: number) => `translate3d(${(x * scale).toFixed(1)}px, ${(y * scale).toFixed(1)}px, 0)`;
  const moves: Keyframe[] = [];
  const curve = (x0: number, y0: number, x1: number, y1: number, start: number, ms: number, fade: boolean) => {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const cx = Math.max(0, Math.min(W, (x0 + x1) / 2 + dy * 0.2));
    const cy = Math.max(0, Math.min(H, (y0 + y1) / 2 - dx * 0.2));
    const n = Math.max(2, Math.round(ms / 20));
    for (let k = 0; k <= n; k++) {
      const s = travel(k / n);
      const x = (1 - s) ** 2 * x0 + 2 * s * (1 - s) * cx + s * s * x1;
      const y = (1 - s) ** 2 * y0 + 2 * s * (1 - s) * cy + s * s * y1;
      moves.push({ offset: offset(start + (ms * k) / n), transform: place(x, y), opacity: fade ? Math.min(1, (k / n) * 2.2) : 1 });
    }
  };

  const first = points[0];
  const arrive = first.press - PRESS_IN - REST;
  const enter = Math.max(0, arrive - ENTER_MS);
  moves.push({ offset: 0, transform: place(first.x + from[0], first.y + from[1]), opacity: 0 });
  curve(first.x + from[0], first.y + from[1], first.x, first.y, enter, arrive - enter, true);
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const ms = moveMs(Math.hypot(b.x - a.x, b.y - a.y));
    const reach = b.press - PRESS_IN - REST;
    const start = Math.max(a.press + PRESS_OUT + 40, reach - ms);
    curve(a.x, a.y, b.x, b.y, start, reach - start, false);
  }
  const last = points[points.length - 1];
  moves.push(
    { offset: offset(LEAVE_AT), transform: place(last.x, last.y), opacity: 1, easing: OUT },
    { offset: 1, transform: place(last.x, last.y), opacity: 0 },
  );

  const presses: Keyframe[] = [{ offset: 0, transform: "scale(1)" }];
  for (const p of points) {
    presses.push(
      { offset: offset(p.press - PRESS_IN), transform: "scale(1)", easing: OUT },
      { offset: offset(p.press), transform: "scale(0.92)", easing: OUT },
      { offset: offset(p.press + PRESS_OUT), transform: "scale(1)" },
    );
  }
  presses.push({ offset: 1, transform: "scale(1)" });

  for (const frames of [moves, presses]) {
    for (let i = 1; i < frames.length; i++) frames[i].offset = Math.max(frames[i].offset!, frames[i - 1].offset!);
  }
  return [node.animate(moves, { duration: end, fill: "both" }), tip.animate(presses, { duration: end, fill: "both" })];
}

/** The check rows: the leaves of the check profiles by their names in the repo, then the run of one test on both apps. */
const checks = [...checkRows.filter((row) => !row.once).map((row) => row.cmd), "same test, both apps"];
const LINE_AT = 300;
const LINE_STEP = 180;
const CHECK_STEP = 80;
const RECEIPT_AT = 450;

/** How far the pointer moves the two side cards from their resting pose (hero.css). */
const SWAY = 8;
const SWAY_TURN = 3;
const SNAP_AFTER = 140;

type Phase = "wait" | "build" | "done";

let built = false;
let image: Promise<void> | undefined;

function decodeWeek() {
  image ??= (() => {
    const node = new Image();
    node.src = window.matchMedia("(max-width: 640px)").matches ? WEEK_SMALL : WEEK;
    return node.decode().catch(() => undefined);
  })();
  return image;
}

/** The CSS runs of the cards and the seal around the screen (hero.css, under `data-run`). */
const loopRuns = (node: HTMLElement) =>
  [...node.querySelectorAll(".hb-side, .hb-seal")].flatMap((part) => part.getAnimations({ subtree: true }));

/**
 * The care calendar fills itself from its own capture while three agents place its parts. Around the screen stands
 * the loop: the test written on the old app (step 1), the automatic checks (step 3) and the approval seal (step 4).
 * The construction is real pixels of one file; the settled frame is the file itself.
 */
export function HeroBuild() {
  const reduce = useReducedMotion();
  const lit = useLights() === "on";
  const [phase, setPhase] = useState<Phase>(reduce || built ? "done" : "wait");
  const [run, setRun] = useState(0);
  const timer = useRef<number | undefined>(undefined);
  const light = useRef<HTMLSpanElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const cursors = useRef<HTMLSpanElement>(null);
  const agentRuns = useRef<Animation[]>([]);
  const loop = useRef<Animation[]>([]);
  const replayButton = useRef<HTMLButtonElement>(null);
  const refocus = useRef(false);
  const sides = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    if (reduce || (built && run === 0)) {
      setPhase("done");
      return;
    }
    if (!lit) {
      decodeWeek();
      return;
    }
    let live = true;
    let frame = 0;
    // One frame after the lights come on, so the restyle of the lit room and the first frame of the build do not meet.
    decodeWeek().then(() => {
      frame = requestAnimationFrame(() => {
        if (!live) return;
        built = true;
        setPhase("build");
        timer.current = window.setTimeout(() => {
          setPhase("done");
          if (light.current) sheen(light.current, SHEEN_AFTER);
        }, BUILD_DONE);
      });
    });
    return () => {
      live = false;
      cancelAnimationFrame(frame);
      window.clearTimeout(timer.current);
    };
  }, [reduce, run, lit]);

  // Every run of the build exists, paused at its start, while the screen waits: the pieces' and the loop's CSS runs
  // (`data-run`) and the agents' runs. The build only starts them: the pieces in its first frame, the agents one frame
  // later and the loop one frame after that, all on the pieces' clock, so no frame restyles the screen and its loop.
  useLayoutEffect(() => {
    const node = root.current;
    const layer = cursors.current;
    if (phase === "done" || !node || !layer) return;
    if (phase === "wait") {
      node.dataset.run = "";
      // A finished run is no longer listed by getAnimations, so a replay restarts the runs kept from the first wait.
      if (!loop.current.length) loop.current = loopRuns(node);
      for (const r of loop.current) {
        r.pause();
        r.currentTime = 0;
      }
      for (const r of agentRuns.current) r.cancel();
      const scale = (light.current?.parentElement?.clientWidth ?? 0) / W;
      agentRuns.current = [...layer.querySelectorAll<HTMLElement>(".hb-cursor")].flatMap((cursor, i) =>
        cursorRuns(cursor, cursor.querySelector<HTMLElement>(".hb-cursor-tip")!, agents[i].from, agents[i].stops, scale),
      );
      for (const r of agentRuns.current) r.pause();
      return;
    }
    const start = document.timeline.currentTime;
    const begin = (runs: Animation[]) => {
      for (const r of runs) {
        if (start === null) r.play();
        else r.startTime = start;
      }
    };
    for (const piece of node.querySelectorAll(".lp-piece")) for (const r of piece.getAnimations()) r.play();
    let frame = requestAnimationFrame(() => {
      begin(agentRuns.current);
      frame = requestAnimationFrame(() => begin(loop.current));
    });
    return () => {
      cancelAnimationFrame(frame);
      for (const r of agentRuns.current) r.cancel();
      agentRuns.current = [];
    };
  }, [phase, run]);

  // With a mouse in the room, the side cards follow the eased pointer of the room's light (cursor.ts) a little.
  useEffect(() => {
    if (reduce) return;
    const room = window.matchMedia(ROOM_QUERY);
    let snap = 0;
    const write = (nx: number, ny: number, whole: boolean) => {
      sides.current.forEach((node) => {
        const x = nx * SWAY;
        const y = ny * SWAY * 0.75;
        node.style.translate = whole ? `${Math.round(x)}px ${Math.round(y)}px` : `${x.toFixed(2)}px ${y.toFixed(2)}px`;
        node.style.rotate = `y ${(nx * SWAY_TURN).toFixed(3)}deg`;
      });
    };
    const clear = () => {
      window.clearTimeout(snap);
      sides.current.forEach((node) => {
        node.style.translate = "";
        node.style.rotate = "";
        delete node.dataset.moving;
      });
    };
    const stop = onPointer((x, y) => {
      if (!room.matches) return;
      const nx = Math.max(-1, Math.min(1, (x - window.innerWidth / 2) / (window.innerWidth / 2)));
      const ny = Math.max(-1, Math.min(1, (y - window.innerHeight / 2) / (window.innerHeight / 2)));
      sides.current.forEach((node) => (node.dataset.moving = ""));
      write(nx, ny, false);
      window.clearTimeout(snap);
      // At rest the cards stand on whole pixels and are drawn again at their rest size, so their text is sharp.
      snap = window.setTimeout(() => {
        write(nx, ny, true);
        sides.current.forEach((node) => delete node.dataset.moving);
      }, SNAP_AFTER);
    });
    room.addEventListener("change", clear);
    return () => {
      stop();
      room.removeEventListener("change", clear);
      clear();
    };
  }, [reduce]);

  // The button is disabled while the screen builds; a keyboard reader gets the focus back on it at the end.
  useEffect(() => {
    if (phase !== "done" || !refocus.current) return;
    refocus.current = false;
    replayButton.current?.focus();
  }, [phase]);

  const replay = () => {
    refocus.current = document.activeElement === replayButton.current;
    window.clearTimeout(timer.current);
    setPhase("wait");
    setRun((n) => n + 1);
  };

  const side = (i: number) => (node: HTMLDivElement | null) => {
    if (node) sides.current[i] = node;
  };

  return (
    <div className="lp-build" data-phase={phase} ref={root}>
      <div className="hb-side hb-side-test" ref={side(0)}>
        <div className="hb-card">
          <p className="hb-file">{testFile}</p>
          <p className="hb-step">1&nbsp;·&nbsp;written on the old app</p>
          <ul className="hb-lines">
            {testLines.map((line, i) => (
              <li key={line} className="hb-line" style={{ animationDelay: `${LINE_AT + i * LINE_STEP}ms` }}>
                <span className="hb-ok" aria-hidden="true" style={{ animationDelay: `${LINE_AT + i * LINE_STEP + 60}ms` }} />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div
        className="hb-side hb-side-checks"
        ref={side(1)}
        style={{ animationDelay: `${RECEIPT_AT}ms` }}
      >
        <div className="hb-card" style={{ animationDelay: `${RECEIPT_AT}ms` }}>
          <p className="hb-step">3&nbsp;·&nbsp;automatic checks</p>
          <ul className="hb-checks">
            {checks.map((name, i) => (
              <li key={name}>
                <span>{name}</span>
                <span className="hb-status">
                  <span className="hb-state" aria-hidden="true">
                    <i style={{ animationDelay: `${CHECKS_AT + i * CHECK_STEP}ms` }} />
                  </span>
                  <span className="hb-pass" style={{ animationDelay: `${CHECKS_AT + i * CHECK_STEP + 60}ms` }}>
                    passed
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <BrowserFrame
        src={WEEK}
        alt="Care team calendar for one week in the new React app: calls, video calls and office visits for each patient, with filters and a line at the current time. Invented data."
        width={1440}
        height={900}
        label="Real care screen, invented data."
        tone="dark"
        eager
        className="lp-build-frame"
      >
        {phase !== "done" && (
          <span className="lp-pieces" key={run} aria-hidden="true">
            {pieces.map((p, i) => (
              <span key={i} className="lp-piece" data-wipe={p.wipe} style={pieceStyle(p)} />
            ))}
          </span>
        )}
        {phase !== "done" && (
          <span className="hb-cursors" ref={cursors} aria-hidden="true">
            {agents.map((a) => (
              <span key={a.name} className="hb-cursor" data-tone={a.tone}>
                <span className="hb-cursor-tip">
                  <svg width="16" height="18" viewBox="0 0 16 18">
                    <path d="M1 1 L14 9 L8 10.5 L5.5 16.5 Z" />
                  </svg>
                  <span className="hb-cursor-name">{a.name}</span>
                </span>
              </span>
            ))}
          </span>
        )}
        <span className="room-sheen" ref={light} aria-hidden="true" />
      </BrowserFrame>
      <div className="hb-seal">
        <Seal style={{ animationDelay: `${APPROVED_AT}ms` }} />
      </div>
      <div className="lp-build-foot">
        {reduce ? (
          <span />
        ) : (
          <button type="button" className="lp-replay" ref={replayButton} onClick={replay} disabled={phase !== "done"} aria-label="Replay the build of the screen">
            <Replay />
            Replay
          </button>
        )}
      </div>
    </div>
  );
}
