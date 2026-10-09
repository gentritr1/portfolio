import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { builtFiles, OLD_COMPLIANCE, stations, twinBase, twinSteps } from "./data";
import { Approved, Replay } from "./icons";
import { useReducedMotion } from "./hooks";
import { OldScreen } from "./OldScreen";
import "../../components/frames.css";
import "./ring.css";

/** One hop of the run: where the head goes, how long the move takes, and how long it stays. */
interface Hop {
  station: number;
  move: number;
  hold: number;
  checks?: "fail" | "pass";
  back?: boolean;
}

const RUN: Hop[] = [
  { station: 0, move: 0, hold: 2300 },
  { station: 1, move: 900, hold: 2300 },
  { station: 2, move: 900, hold: 2700 },
  { station: 3, move: 900, hold: 2300, checks: "fail" },
  { station: 2, move: 1000, hold: 1700, back: true },
  { station: 3, move: 900, hold: 1700, checks: "pass" },
  { station: 4, move: 900, hold: 0 },
];
const TOTAL = RUN.reduce((sum, hop) => sum + hop.move + hop.hold, 0);
const MOVE = "cubic-bezier(0.77, 0, 0.175, 1)";
const LAST = stations.length - 1;
const pad = (n: number) => String(n + 1).padStart(2, "0");

/** The dial: a 270° sweep in a 300-unit box. 0° is the top; angles grow clockwise. */
const C = 150;
const START = -135;
const STEP = 270 / LAST;
const angleOf = (station: number) => START + station * STEP;
const TRACK = 100;
const RETURN = 85;
const polar = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [C + r * Math.sin(a), C - r * Math.cos(a)] as const;
};
const xy = (deg: number, r: number) => polar(deg, r).map((n) => n.toFixed(2)).join(" ");
const arc = (from: number, to: number, r: number) =>
  `M ${xy(from, r)} A ${r} ${r} 0 ${Math.abs(to - from) > 180 ? 1 : 0} ${to > from ? 1 : 0} ${xy(to, r)}`;
const MINOR = Array.from({ length: 61 }, (_, i) => START + i * 4.5)
  .map((d) => `M ${xy(d, 117)} L ${xy(d, 123)}`)
  .join(" ");
const RETURN_PATH = arc(angleOf(3) - 6, angleOf(2) + 9, RETURN);

type Status = "idle" | "running" | "ended";

/** Keyframes that hold a value while the head waits and ease it to the next value while the head moves. */
function track(value: (station: number, reached: number) => string): Keyframe[] {
  const frames: Keyframe[] = [{ transform: value(0, 0), offset: 0 }];
  let t = 0;
  let reached = 0;
  let before = value(0, 0);
  RUN.forEach((hop, i) => {
    if (i > 0) {
      frames.push({ transform: before, offset: t / TOTAL, easing: MOVE });
      t += hop.move;
      reached = Math.max(reached, hop.station);
      before = value(hop.station, reached);
      frames.push({ transform: before, offset: t / TOTAL });
    }
    t += hop.hold;
  });
  frames.push({ transform: before, offset: 1 });
  return frames;
}

/** Opacity that is on while the head moves on the hops that `on` picks, and fades soon after it stops. */
function glow(on: (hop: Hop) => boolean): Keyframe[] {
  const frames: Keyframe[] = [{ opacity: 0, offset: 0 }];
  let t = 0;
  RUN.forEach((hop, i) => {
    if (i > 0 && on(hop)) {
      frames.push(
        { opacity: 0, offset: t / TOTAL },
        { opacity: 1, offset: (t + hop.move * 0.25) / TOTAL },
        { opacity: 1, offset: (t + hop.move) / TOTAL },
        { opacity: 0, offset: Math.min(1, (t + hop.move + 480) / TOTAL) },
      );
    }
    t += hop.move + hop.hold;
  });
  frames.push({ opacity: 0, offset: 1 });
  return frames;
}

const ARM = (s: number) => `rotate(${angleOf(s)}deg)`;
const CAR = (s: number) => `translateX(${(s / LAST) * 100}%)`;
const FILL = (_: number, reached: number) => `scaleX(${reached / LAST})`;

/** A whole capture in the page's dark browser window. */
function Browser({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <span className={className ? `fr-browser dy-browser ${className}` : "fr-browser dy-browser"} data-tone="dark">
      <span className="fr-browser-clip">
        <span className="fr-bar" aria-hidden="true">
          <span className="fr-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="fr-url">
            <span>{label}</span>
          </span>
        </span>
        <span className="fr-screen" style={{ aspectRatio: "1440 / 900" }}>
          {children}
        </span>
      </span>
    </span>
  );
}

/** An editor or terminal window around real text from the repository. */
function Pane({ title, tag, kind, className, children }: { title: string; tag?: string; kind: "editor" | "terminal"; className?: string; children: ReactNode }) {
  return (
    <div className={className ? `dy-pane ${className}` : "dy-pane"} data-kind={kind}>
      <p className="dy-pane-bar">
        <span className="fr-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="dy-pane-title">{title}</span>
        {tag && <span className="dy-pane-tag">{tag}</span>}
      </p>
      <div className="dy-pane-body">{children}</div>
    </div>
  );
}

const rise = (i: number) => ({ "--i": i }) as CSSProperties;

const ShotOld = memo(function ShotOld() {
  const s = stations[0];
  return (
    <div className="dy-old">
      <Browser label="Care platform, old app" className="dy-old-frame">
        <OldScreen shot={OLD_COMPLIANCE} />
      </Browser>
      <Pane kind="editor" title="Notes on the old screen" tag="row D-2" className="dy-note">
        {s.artefact.map((row, r) => {
          const [, label, text] = /^(\S+)\s+(.*)$/.exec(row) ?? [row, "", row];
          return (
            <span key={r} className="dy-line dy-note-row" data-in="" style={rise(r + 3)} data-row={r === 1 ? "fail" : r === 2 ? "pass" : undefined}>
              <span>{label}</span>
              <span>{text}</span>
            </span>
          );
        })}
      </Pane>
    </div>
  );
});

const ShotTest = memo(function ShotTest() {
  const s = stations[1];
  return (
    <div className="dy-test">
      <span className="dy-behind" aria-hidden="true">
        <Browser label="Care platform, old app">
          <OldScreen shot={OLD_COMPLIANCE} />
        </Browser>
      </span>
      <Pane kind="editor" title="compliance-tracker.spec.ts" tag="written on the old app" className="dy-spec">
        {s.artefact.map((row, r) => (
          <span key={r} className="dy-line dy-typed" style={rise(r)}>
            <span className="dy-ln" aria-hidden="true">
              {r + 1}
            </span>
            {row}
          </span>
        ))}
      </Pane>
    </div>
  );
});

const ShotBuild = memo(function ShotBuild() {
  const s = stations[2];
  const most = Math.max(...builtFiles.map(([, n]) => n));
  return (
    <div className="dy-build">
      <Pane kind="terminal" title="commit" tag={s.time} className="dy-commit">
        <span className="dy-line dy-subject" data-in="" style={rise(0)}>
          {s.artefact[0]} {s.artefact[1]}
        </span>
        <ul className="dy-files">
          {builtFiles.map(([file, n], r) => (
            <li key={file} className="dy-file" data-in="" style={{ "--i": r * 0.6 + 1, "--w": n / most } as CSSProperties}>
              <span className="dy-file-name">{file}</span>
              <span className="dy-bar" aria-hidden="true">
                <i />
              </span>
              <span className="dy-file-n">+{n}</span>
            </li>
          ))}
        </ul>
        <span className="dy-line dy-sum" data-in="" style={rise(10)}>
          {s.artefact[3]}
        </span>
        <span className="dy-line dy-trailer" data-in="" style={rise(11)}>
          {s.artefact[4]}
        </span>
      </Pane>
      <p className="dy-again">
        A check failed. The work is back with the agents.
      </p>
    </div>
  );
});

const ShotChecks = memo(function ShotChecks() {
  const s = stations[3];
  return (
    <div className="dy-checks">
      <Pane kind="terminal" title="checks" tag={s.time.toLowerCase()} className="dy-term">
        {s.artefact.map((row, r) => (
          <span key={r} className="dy-line" data-in="" style={rise(r)} data-row={r === 3 ? "pass" : "fail"}>
            {row}
          </span>
        ))}
      </Pane>
      <p className="dy-verdict">
        <span data-kind="fail">Failed. The work goes back to the agents.</span>
        <span data-kind="pass">Passed after the fix.</span>
      </p>
    </div>
  );
});

const FRAME_MS = 1200;
const framePath = (app: "old" | "new", n: number) => `${twinBase}${app}-0${n + 1}-1080.webp`;

/**
 * The same test, step by step, on both apps at once. The frames load once the head is near this station,
 * play once while the station is on screen, and stop on the last frame. Then the approval lands.
 */
const ShotTwin = memo(function ShotTwin({ active, load, still }: { active: boolean; load: boolean; still: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const last = twinSteps.length - 1;
  const [frame, setFrame] = useState(still ? last : 0);
  const [visible, setVisible] = useState(false);
  const s = stations[4];

  useEffect(() => {
    if (active && !still) setFrame(0);
  }, [active, still]);

  useEffect(() => {
    const node = root.current;
    if (!node || still) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [still]);

  useEffect(() => {
    if (still || !active || !visible || frame >= last) return;
    const id = window.setTimeout(() => setFrame((n) => n + 1), FRAME_MS);
    return () => window.clearTimeout(id);
  }, [still, active, visible, frame, last]);

  const shown = still ? last : frame;
  const armed = load || still;
  const done = still || (active && frame >= last);
  return (
    <div className="dy-twin" ref={root} data-done={done ? "" : undefined}>
      <div className="dy-twin-apps">
        {(["old", "new"] as const).map((app) => (
          <figure key={app} className="dy-twin-app" data-app={app}>
            <Browser label="Care platform">
              {armed &&
                twinSteps.map((step, n) =>
                  still && n !== last ? null : (
                    <img
                      key={n}
                      src={framePath(app, n)}
                      width={1440}
                      height={900}
                      alt={n === last ? `${app === "old" ? "Old" : "New"} app, step ${n + 1} of the same test: ${step} Invented data.` : ""}
                      loading="lazy"
                      decoding="async"
                      data-on={n <= shown ? "" : undefined}
                    />
                  ),
                )}
            </Browser>
            <figcaption className="dy-twin-tag">{app === "old" ? "Old app" : "New app"}</figcaption>
          </figure>
        ))}
      </div>
      <p className="dy-twin-step">
        <span className="dy-pips" aria-hidden="true">
          {twinSteps.map((_, n) => (
            <i key={n} data-on={n <= shown ? "" : undefined} />
          ))}
        </span>
        <span className="dy-twin-n">
          {shown + 1} / {twinSteps.length}
        </span>
        <span className="dy-twin-text">{twinSteps[shown]}</span>
      </p>
      <div className="dy-twin-end">
        <p className="dy-passes">
          {s.artefact.slice(0, 2).map((row) => (
            <span key={row} className="dy-line" data-row="pass">
              {row}
            </span>
          ))}
        </p>
        <p className="dy-seal">
          <Approved />
          <span>
            Approved and merged
            <small>{s.time}, by a person</small>
          </span>
        </p>
      </div>
    </div>
  );
});

/** The dial's still parts: bezel, ticks, track, numbers. */
const Face = memo(function Face() {
  return (
    <>
      <defs>
        <radialGradient id="dy-bezel" cx="50%" cy="42%" r="60%">
          <stop offset="0" stopColor="#1a1d24" />
          <stop offset="1" stopColor="#0f1115" />
        </radialGradient>
        <linearGradient id="dy-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.03" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
        </linearGradient>
      </defs>
      <circle cx={C} cy={C} r={147} className="dy-bezel" />
      <circle cx={C} cy={C} r={146.5} className="dy-rim" />
      <circle cx={C} cy={C} r={74} className="dy-hub" />
      <path d={MINOR} className="dy-minor" />
      <path d={arc(START, -START, TRACK)} className="dy-track" />
    </>
  );
});

/** True once the day has started in this page load. A home that mounts again then shows the day settled. */
let played = false;

/** One real day of one screen: a dial that keeps the time, and a stage that shows what the team saw. */
export function Ring() {
  const reduce = useReducedMotion();
  const [rest, setRest] = useState(() => played);
  const [instant, setInstant] = useState(() => played);
  const settled = reduce || rest;
  const scene = useRef<HTMLDivElement>(null);
  const arm = useRef<HTMLDivElement>(null);
  const tail = useRef<SVGGElement>(null);
  const tailBack = useRef<SVGGElement>(null);
  const car = useRef<HTMLSpanElement>(null);
  const carBack = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);
  const motion = useRef<Animation[]>([]);
  const touched = useRef(false);
  const [status, setStatus] = useState<Status>(settled ? "ended" : "idle");
  const [at, setAt] = useState(settled ? LAST : 0);
  const [reached, setReached] = useState(settled ? LAST : 0);
  const [checks, setChecks] = useState<"fail" | "pass">(settled ? "pass" : "fail");
  const [back, setBack] = useState(false);
  const [returned, setReturned] = useState(settled);

  const pose = (station: number, most: number) => {
    if (arm.current) arm.current.style.transform = ARM(station);
    if (car.current) car.current.style.transform = CAR(station);
    if (fill.current) fill.current.style.transform = FILL(station, most);
  };

  const clear = () => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    motion.current.forEach((a) => a.cancel());
    motion.current = [];
  };

  const settle = useCallback((station: number, glide = true) => {
    touched.current = true;
    const nodes = [arm.current, car.current, fill.current];
    const from = nodes.map((node) => (glide && node ? getComputedStyle(node).transform : "none"));
    clear();
    setAt(station);
    setReached(LAST);
    setChecks("pass");
    setBack(false);
    setReturned(true);
    setStatus("ended");
    pose(station, LAST);
    const to = [ARM(station), CAR(station), FILL(station, LAST)];
    nodes.forEach((node, k) => {
      if (!node || from[k] === "none") return;
      const m = new DOMMatrix(from[k]);
      const start = k === 0 ? `rotate(${(Math.atan2(m.b, m.a) * 180) / Math.PI}deg)` : from[k];
      motion.current.push(node.animate([{ transform: start }, { transform: to[k] }], { duration: 520, easing: MOVE }));
    });
  }, []);

  const play = useCallback(() => {
    played = true;
    setRest(false);
    clear();
    setStatus("running");
    setAt(0);
    setReached(0);
    setChecks("fail");
    setBack(false);
    setReturned(false);
    let t = 0;
    RUN.forEach((hop, i) => {
      timers.current.push(
        window.setTimeout(() => {
          setAt(hop.station);
          if (hop.checks) setChecks(hop.checks);
          setBack(Boolean(hop.back));
        }, t),
      );
      t += hop.move;
      timers.current.push(
        window.setTimeout(() => {
          setReached((n) => Math.max(n, hop.station));
          if (hop.back) setReturned(true);
          if (i === RUN.length - 1) setStatus("ended");
        }, t),
      );
      t += hop.hold;
    });
    pose(LAST, LAST);
    const run = { duration: TOTAL };
    const forward = glow((hop) => !hop.back);
    const backward = glow((hop) => Boolean(hop.back));
    const parts: Array<[Element | null, Keyframe[]]> = [
      [arm.current, track(ARM)],
      [car.current, track(CAR)],
      [fill.current, track(FILL)],
      [tail.current, forward],
      [tailBack.current, backward],
      [carBack.current, backward],
    ];
    motion.current = parts.flatMap(([node, frames]) => (node ? [node.animate(frames, run)] : []));
  }, []);

  useLayoutEffect(() => {
    const node = scene.current;
    if (reduce || played || node?.closest("[data-seen]")) {
      settle(LAST, false);
      touched.current = false;
      if (!reduce) {
        setRest(true);
        setInstant(true);
      }
      return;
    }
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          if (!touched.current) play();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clear();
    };
  }, [reduce, play, settle]);

  useEffect(() => {
    if (!instant) return;
    let id = requestAnimationFrame(() => {
      id = requestAnimationFrame(() => setInstant(false));
    });
    return () => cancelAnimationFrame(id);
  }, [instant]);

  const still = reduce;
  const shown = at;
  const current = stations[shown];
  const failing = checks === "fail" && status === "running";
  const stateOf = (i: number) => (i === at ? "now" : i <= reached || status === "ended" ? "done" : undefined);
  const chip = (i: number) =>
    i === 3 && (reached >= 3 || status === "ended") ? (
      <span className="dy-chip" data-kind={failing ? "fail" : "pass"}>
        {failing ? "failed" : "passed"}
      </span>
    ) : null;
  const readKey = back ? "back" : `${at}`;
  const read = back ? (
    <>
      <span className="dy-read-kicker" data-kind="fail">
        A check failed
      </span>
      <span className="dy-read-main">Back to the agents</span>
    </>
  ) : (
    <>
      <span className="dy-read-kicker">
        Step {shown + 1} of {stations.length}
      </span>
      <span className="dy-read-time" data-long={current.time.length > 5 ? "" : undefined}>
        {current.time}
      </span>
      <span className="dy-read-name">{current.name}</span>
    </>
  );

  const shots = [
    <ShotOld key="0" />,
    <ShotTest key="1" />,
    <ShotBuild key="2" />,
    <ShotChecks key="3" />,
    <ShotTwin key="4" active={!still && at === 4} load={reached >= 3} still={still || rest} />,
  ];

  return (
    <div
      className="dy"
      data-status={status}
      data-still={still ? "" : undefined}
      data-checks={checks}
      data-back={back ? "" : undefined}
      data-returned={returned ? "" : undefined}
      data-instant={instant ? "" : undefined}
    >
      <div className="dy-scene" ref={scene}>
        <div className="dy-dial" aria-hidden="true">
          <svg viewBox="0 0 300 300" className="dy-face">
            <Face />
            <defs>
              <linearGradient id="dy-fill" gradientUnits="userSpaceOnUse" x1="40" y1="250" x2="270" y2="120">
                <stop offset="0" stopColor="#a86b1b" />
                <stop offset="1" stopColor="#ffc46e" />
              </linearGradient>
              <marker id="dy-head-fail" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto">
                <path d="M0 0 10 5 0 10z" fill="#ff8f8f" />
              </marker>
              <marker id="dy-head-pass" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3.2" markerHeight="3.2" orient="auto">
                <path d="M0 0 10 5 0 10z" fill="#7ef0a6" />
              </marker>
            </defs>
            {stations.slice(1).map((_, k) => (
              <path key={k} d={arc(angleOf(k), angleOf(k + 1), TRACK)} className="dy-seg" data-on={reached > k || status === "ended" ? "" : undefined} />
            ))}
            {stations.map((_, i) => {
              const [x1, y1] = polar(angleOf(i), 110);
              const [x2, y2] = polar(angleOf(i), 128);
              const [px, py] = polar(angleOf(i), TRACK);
              const [nx, ny] = polar(angleOf(i), 138);
              const state = stateOf(i);
              return (
                <g key={i} data-state={state}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} className="dy-major" />
                  <circle cx={px} cy={py} r={6.5} className="dy-pad" />
                  <text x={nx} y={ny} className="dy-num" textAnchor="middle" dominantBaseline="central">
                    {pad(i)}
                  </text>
                </g>
              );
            })}
            <g className="dy-return" data-on={returned ? "" : undefined}>
              <path d={RETURN_PATH} className="dy-return-fail" markerEnd="url(#dy-head-fail)" />
              <path d={RETURN_PATH} className="dy-return-pass" markerEnd="url(#dy-head-pass)" />
            </g>
          </svg>
          <div className="dy-arm" ref={arm}>
            <svg viewBox="0 0 300 300">
              <defs>
                <linearGradient id="dy-tail" gradientUnits="userSpaceOnUse" x1={polar(-52, TRACK)[0]} y1={polar(-52, TRACK)[1]} x2={C} y2={C - TRACK}>
                  <stop offset="0" stopColor="#ffb547" stopOpacity="0" />
                  <stop offset="1" stopColor="#ffc46e" stopOpacity="0.95" />
                </linearGradient>
                <linearGradient id="dy-tail-back" gradientUnits="userSpaceOnUse" x1={polar(52, TRACK)[0]} y1={polar(52, TRACK)[1]} x2={C} y2={C - TRACK}>
                  <stop offset="0" stopColor="#ff8f8f" stopOpacity="0" />
                  <stop offset="1" stopColor="#ff8f8f" stopOpacity="0.95" />
                </linearGradient>
                <radialGradient id="dy-halo">
                  <stop offset="0" stopColor="#ffb547" stopOpacity="0.55" />
                  <stop offset="0.35" stopColor="#ffb547" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="dy-halo-back">
                  <stop offset="0" stopColor="#ff8f8f" stopOpacity="0.6" />
                  <stop offset="0.35" stopColor="#ff8f8f" stopOpacity="0.22" />
                  <stop offset="1" stopColor="#ff8f8f" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g ref={tail} className="dy-tail">
                <path d={arc(-52, 0, TRACK)} stroke="url(#dy-tail)" />
              </g>
              <g ref={tailBack} className="dy-tail">
                <path d={arc(0, 52, TRACK)} stroke="url(#dy-tail-back)" />
                <circle cx={C} cy={C - TRACK} r={30} fill="url(#dy-halo-back)" />
              </g>
              <circle cx={C} cy={C - TRACK} r={30} fill="url(#dy-halo)" className="dy-halo" />
              <circle cx={C} cy={C - TRACK} r={7.5} className="dy-head" />
            </svg>
          </div>
          <p className="dy-read" key={readKey} data-back={back ? "" : undefined}>
            {read}
          </p>
        </div>

        <ol className="dy-list" aria-label="The five steps of the day">
          {stations.map((s, i) => {
            const body = (
              <>
                <span className="dy-list-n">{pad(i)}</span>
                <span className="dy-list-name">
                  {s.name}
                  {chip(i)}
                </span>
                <span className="dy-list-time">{s.time}</span>
              </>
            );
            return (
              <li key={s.name} data-state={stateOf(i)}>
                {still ? (
                  <span className="dy-list-row">{body}</span>
                ) : (
                  <button type="button" className="dy-list-row" aria-pressed={i === at} aria-controls={`dy-shot-${i}`} onClick={() => settle(i)}>
                    {body}
                  </button>
                )}
              </li>
            );
          })}
        </ol>

        <p className="dy-top" aria-hidden="true" key={`top-${readKey}`} data-back={back ? "" : undefined}>
          {read}
        </p>

        <div className="dy-rail">
          <span className="dy-rail-line">
            <span className="dy-rail-fill" ref={fill} />
            <span className="dy-rail-return" data-on={returned ? "" : undefined} aria-hidden="true">
              <i data-kind="fail" />
              <i data-kind="pass" />
            </span>
            <span className="dy-rail-car" ref={car} aria-hidden="true">
              <span className="dy-rail-head">
                <span className="dy-rail-head-back" ref={carBack} />
              </span>
            </span>
          </span>
          <ol className="dy-rail-stops" aria-label="The five steps of the day">
            {stations.map((s, i) => {
              const label = `${pad(i)} ${s.name}, ${s.time}`;
              return (
                <li key={s.name} data-state={stateOf(i)} style={{ "--at": i / LAST } as CSSProperties}>
                  {still ? (
                    <span className="dy-stop" aria-label={label}>
                      <i />
                      {pad(i)}
                    </span>
                  ) : (
                    <button type="button" className="dy-stop" aria-label={label} aria-pressed={i === at} onClick={() => settle(i)}>
                      <i />
                      {pad(i)}
                    </button>
                  )}
                </li>
              );
            })}
          </ol>
        </div>

        <span className="dy-divider" aria-hidden="true" />

        {still ? (
          <ol className="dy-all">
            {stations.map((s, i) => (
              <li key={s.name} className="dy-all-item">
                <p className="dy-cap-kicker">
                  <span>{pad(i)}</span> {s.name} <span className="dy-cap-time">{s.time}</span>
                </p>
                <p className="dy-cap-line">{s.line}</p>
                <div className="dy-shot" data-pos="now">
                  {shots[i]}
                </div>
                <p className="dy-cap-source">{s.source}</p>
              </li>
            ))}
          </ol>
        ) : (
          <>
            <div className="dy-stage">
              {stations.map((s, i) => (
                <section
                  key={s.name}
                  id={`dy-shot-${i}`}
                  className="dy-shot"
                  aria-label={`${pad(i)} ${s.name}`}
                  data-pos={i === at ? "now" : i < at ? "past" : "next"}
                  aria-hidden={i !== at ? true : undefined}
                  inert={i !== at}
                >
                  {shots[i]}
                </section>
              ))}
            </div>
            <div className="dy-caps">
              {stations.map((s, i) => (
                <div key={s.name} className="dy-cap" data-on={i === at ? "" : undefined} aria-hidden={i !== at ? true : undefined}>
                  <p className="dy-cap-kicker">
                    <span>{pad(i)}</span> {s.name} <span className="dy-cap-time">{s.time}</span>
                  </p>
                  <p className="dy-cap-line">{s.line}</p>
                  <p className="dy-cap-source">{s.source}</p>
                </div>
              ))}
            </div>
            <button type="button" className="dy-play" onClick={() => (status === "running" ? settle(at) : play())}>
              <Replay />
              {status === "running" ? "Stop" : "Play the day again"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
